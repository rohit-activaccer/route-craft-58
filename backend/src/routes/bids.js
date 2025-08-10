const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { supabase, db } = require('../config/database');
const { logger } = require('../utils/logger');
const { requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const validateBidCreation = [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Bid name must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('bidType').isIn(['contract', 'spot', 'seasonal']).withMessage('Invalid bid type'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('timezone').isIn(['est', 'cst', 'mst', 'pst']).withMessage('Invalid timezone'),
  body('lanes').isArray({ min: 1 }).withMessage('At least one lane must be selected'),
  body('equipmentType').isIn(['dry-van', 'reefer', 'flatbed', 'container']).withMessage('Invalid equipment type'),
  body('serviceLevel').isIn(['standard', 'expedited', 'white-glove']).withMessage('Invalid service level')
];

const validateBidUpdate = [
  body('name').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('status').optional().isIn(['draft', 'active', 'closed', 'awarded', 'cancelled']),
  body('lanes').optional().isArray({ min: 1 })
];

// Create new bid
router.post('/', validateBidCreation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const {
      name,
      description,
      bidType,
      startDate,
      endDate,
      timezone,
      lanes,
      equipmentType,
      serviceLevel,
      specialInstructions,
      rateTargets
    } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        error: 'End date must be after start date',
        code: 'INVALID_DATES'
      });
    }

    // Create bid
    const bidData = {
      name,
      description,
      bid_type: bidType,
      start_date: startDate,
      end_date: endDate,
      timezone,
      equipment_type: equipmentType,
      service_level: serviceLevel,
      special_instructions: specialInstructions,
      rate_targets: rateTargets || {},
      status: 'draft',
      user_id: req.user.id,
      company_id: req.user.companyId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .insert([bidData])
      .select()
      .single();

    if (bidError) {
      logger.error('Bid creation failed', { error: bidError.message, userId: req.user.id });
      return res.status(500).json({
        error: 'Failed to create bid',
        code: 'BID_CREATION_ERROR'
      });
    }

    // Create bid lanes
    const bidLanes = lanes.map(laneId => ({
      bid_id: bid.id,
      lane_id: laneId,
      created_at: new Date().toISOString()
    }));

    const { error: lanesError } = await supabase
      .from('bid_lanes')
      .insert(bidLanes);

    if (lanesError) {
      logger.error('Bid lanes creation failed', { error: lanesError.message, bidId: bid.id });
      // Rollback bid creation
      await supabase.from('bids').delete().eq('id', bid.id);
      return res.status(500).json({
        error: 'Failed to create bid lanes',
        code: 'BID_LANES_ERROR'
      });
    }

    logger.info('Bid created successfully', { bidId: bid.id, userId: req.user.id });

    res.status(201).json({
      message: 'Bid created successfully',
      bid: {
        id: bid.id,
        name: bid.name,
        status: bid.status,
        bidType: bid.bid_type,
        startDate: bid.start_date,
        endDate: bid.end_date,
        createdAt: bid.created_at
      }
    });
  } catch (error) {
    logger.error('Bid creation error', { error: error.message, userId: req.user.id });
    res.status(500).json({
      error: 'Failed to create bid',
      code: 'BID_CREATION_ERROR'
    });
  }
});

// Get all bids for user/company
router.get('/', [
  query('status').optional().isIn(['draft', 'active', 'closed', 'awarded', 'cancelled']),
  query('bidType').optional().isIn(['contract', 'spot', 'seasonal']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { status, bidType, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('bids')
      .select(`
        *,
        bid_lanes(
          lanes(*)
        ),
        users!inner(first_name, last_name, email)
      `)
      .eq('company_id', req.user.companyId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (bidType) query = query.eq('bid_type', bidType);

    // Get total count
    const { count } = await supabase
      .from('bids')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', req.user.companyId);

    // Get paginated results
    const { data: bids, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Bids fetch error', { error: error.message, userId: req.user.id });
      return res.status(500).json({
        error: 'Failed to fetch bids',
        code: 'BIDS_FETCH_ERROR'
      });
    }

    res.json({
      bids: bids.map(bid => ({
        id: bid.id,
        name: bid.name,
        description: bid.description,
        bidType: bid.bid_type,
        status: bid.status,
        startDate: bid.start_date,
        endDate: bid.end_date,
        equipmentType: bid.equipment_type,
        serviceLevel: bid.service_level,
        lanes: bid.bid_lanes?.map(bl => bl.lanes) || [],
        createdBy: {
          firstName: bid.users.first_name,
          lastName: bid.users.last_name,
          email: bid.users.email
        },
        createdAt: bid.created_at,
        updatedAt: bid.updated_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Bids fetch error', { error: error.message, userId: req.user.id });
    res.status(500).json({
      error: 'Failed to fetch bids',
      code: 'BIDS_FETCH_ERROR'
    });
  }
});

// Get specific bid
router.get('/:bidId', async (req, res) => {
  try {
    const { bidId } = req.params;

    const { data: bid, error } = await supabase
      .from('bids')
      .select(`
        *,
        bid_lanes(
          lanes(*)
        ),
        users!inner(first_name, last_name, email),
        companies!inner(name as company_name)
      `)
      .eq('id', bidId)
      .eq('company_id', req.user.companyId)
      .single();

    if (error || !bid) {
      return res.status(404).json({
        error: 'Bid not found',
        code: 'BID_NOT_FOUND'
      });
    }

    res.json({
      bid: {
        id: bid.id,
        name: bid.name,
        description: bid.description,
        bidType: bid.bid_type,
        status: bid.status,
        startDate: bid.start_date,
        endDate: bid.end_date,
        timezone: bid.timezone,
        equipmentType: bid.equipment_type,
        serviceLevel: bid.service_level,
        specialInstructions: bid.special_instructions,
        rateTargets: bid.rate_targets,
        lanes: bid.bid_lanes?.map(bl => bl.lanes) || [],
        createdBy: {
          firstName: bid.users.first_name,
          lastName: bid.users.last_name,
          email: bid.users.email
        },
        company: {
          name: bid.company_name
        },
        createdAt: bid.created_at,
        updatedAt: bid.updated_at
      }
    });
  } catch (error) {
    logger.error('Bid fetch error', { error: error.message, bidId: req.params.bidId, userId: req.user.id });
    res.status(500).json({
      error: 'Failed to fetch bid',
      code: 'BID_FETCH_ERROR'
    });
  }
});

// Update bid
router.put('/:bidId', validateBidUpdate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { bidId } = req.params;
    const updates = req.body;

    // Check if bid exists and user has access
    const { data: existingBid } = await supabase
      .from('bids')
      .select('id, status')
      .eq('id', bidId)
      .eq('company_id', req.user.companyId)
      .single();

    if (!existingBid) {
      return res.status(404).json({
        error: 'Bid not found',
        code: 'BID_NOT_FOUND'
      });
    }

    // Prevent updates to awarded or cancelled bids
    if (['awarded', 'cancelled'].includes(existingBid.status)) {
      return res.status(400).json({
        error: 'Cannot update awarded or cancelled bid',
        code: 'BID_UPDATE_NOT_ALLOWED'
      });
    }

    // Update bid
    const { data: bid, error } = await supabase
      .from('bids')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', bidId)
      .select()
      .single();

    if (error) {
      logger.error('Bid update failed', { error: error.message, bidId, userId: req.user.id });
      return res.status(500).json({
        error: 'Failed to update bid',
        code: 'BID_UPDATE_ERROR'
      });
    }

    // Update bid lanes if provided
    if (updates.lanes) {
      // Remove existing lanes
      await supabase
        .from('bid_lanes')
        .delete()
        .eq('bid_id', bidId);

      // Add new lanes
      const bidLanes = updates.lanes.map(laneId => ({
        bid_id: bidId,
        lane_id: laneId,
        created_at: new Date().toISOString()
      }));

      const { error: lanesError } = await supabase
        .from('bid_lanes')
        .insert(bidLanes);

      if (lanesError) {
        logger.error('Bid lanes update failed', { error: lanesError.message, bidId });
      }
    }

    logger.info('Bid updated successfully', { bidId, userId: req.user.id });

    res.json({
      message: 'Bid updated successfully',
      bid: {
        id: bid.id,
        name: bid.name,
        status: bid.status,
        updatedAt: bid.updated_at
      }
    });
  } catch (error) {
    logger.error('Bid update error', { error: error.message, bidId: req.params.bidId, userId: req.user.id });
    res.status(500).json({
      error: 'Failed to update bid',
      code: 'BID_UPDATE_ERROR'
    });
  }
});

// Publish bid (change status from draft to active)
router.post('/:bidId/publish', async (req, res) => {
  try {
    const { bidId } = req.params;

    // Check if bid exists and is in draft status
    const { data: bid } = await supabase
      .from('bids')
      .select('id, status')
      .eq('id', bidId)
      .eq('company_id', req.user.companyId)
      .eq('status', 'draft')
      .single();

    if (!bid) {
      return res.status(400).json({
        error: 'Bid not found or not in draft status',
        code: 'BID_PUBLISH_ERROR'
      });
    }

    // Update status to active
    const { data: updatedBid, error } = await supabase
      .from('bids')
      .update({
        status: 'active',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', bidId)
      .select()
      .single();

    if (error) {
      logger.error('Bid publish failed', { error: error.message, bidId, userId: req.user.id });
      return res.status(500).json({
        error: 'Failed to publish bid',
        code: 'BID_PUBLISH_ERROR'
      });
    }

    logger.info('Bid published successfully', { bidId, userId: req.user.id });

    res.json({
      message: 'Bid published successfully',
      bid: {
        id: updatedBid.id,
        status: updatedBid.status,
        publishedAt: updatedBid.published_at
      }
    });
  } catch (error) {
    logger.error('Bid publish error', { error: error.message, bidId: req.params.bidId, userId: req.user.id });
    res.status(500).json({
      error: 'Failed to publish bid',
      code: 'BID_PUBLISH_ERROR'
    });
  }
});

// Close bid
router.post('/:bidId/close', async (req, res) => {
  try {
    const { bidId } = req.params;

    // Check if bid exists and is active
    const { data: bid } = await supabase
      .from('bids')
      .select('id, status')
      .eq('id', bidId)
      .eq('company_id', req.user.companyId)
      .eq('status', 'active')
      .single();

    if (!bid) {
      return res.status(400).json({
        error: 'Bid not found or not active',
        code: 'BID_CLOSE_ERROR'
      });
    }

    // Update status to closed
    const { data: updatedBid, error } = await supabase
      .from('bids')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', bidId)
      .select()
      .single();

    if (error) {
      logger.error('Bid close failed', { error: error.message, bidId, userId: req.user.id });
      return res.status(500).json({
        error: 'Failed to close bid',
        code: 'BID_CLOSE_ERROR'
      });
    }

    logger.info('Bid closed successfully', { bidId, userId: req.user.id });

    res.json({
      message: 'Bid closed successfully',
      bid: {
        id: updatedBid.id,
        status: updatedBid.status,
        closedAt: updatedBid.closed_at
      }
    });
  } catch (error) {
    logger.error('Bid close error', { error: error.message, bidId: req.params.bidId, userId: req.user.id });
    res.status(500).json({
      error: 'Failed to close bid',
      code: 'BID_CLOSE_ERROR'
    });
  }
});

// Delete bid (only draft bids can be deleted)
router.delete('/:bidId', async (req, res) => {
  try {
    const { bidId } = req.params;

    // Check if bid exists and is in draft status
    const { data: bid } = await supabase
      .from('bids')
      .select('id, status')
      .eq('id', bidId)
      .eq('company_id', req.user.companyId)
      .eq('status', 'draft')
      .single();

    if (!bid) {
      return res.status(400).json({
        error: 'Bid not found or cannot be deleted',
        code: 'BID_DELETE_ERROR'
      });
    }

    // Delete bid lanes first
    await supabase
      .from('bid_lanes')
      .delete()
      .eq('bid_id', bidId);

    // Delete bid
    const { error } = await supabase
      .from('bids')
      .delete()
      .eq('id', bidId);

    if (error) {
      logger.error('Bid deletion failed', { error: error.message, bidId, userId: req.user.id });
      return res.status(500).json({
        error: 'Failed to delete bid',
        code: 'BID_DELETE_ERROR'
      });
    }

    logger.info('Bid deleted successfully', { bidId, userId: req.user.id });

    res.json({
      message: 'Bid deleted successfully'
    });
  } catch (error) {
    logger.error('Bid deletion error', { error: error.message, bidId: req.params.bidId, userId: req.user.id });
    res.status(500).json({
      error: 'Failed to delete bid',
      code: 'BID_DELETE_ERROR'
    });
  }
});

// Get bid statistics
router.get('/:bidId/stats', async (req, res) => {
  try {
    const { bidId } = req.params;

    // Get bid with carrier responses
    const { data: bid, error } = await supabase
      .from('bids')
      .select(`
        id,
        name,
        status,
        carrier_responses(
          id,
          carrier_id,
          rate,
          status,
          submitted_at
        )
      `)
      .eq('id', bidId)
      .eq('company_id', req.user.companyId)
      .single();

    if (error || !bid) {
      return res.status(404).json({
        error: 'Bid not found',
        code: 'BID_NOT_FOUND'
      });
    }

    const responses = bid.carrier_responses || [];
    const totalResponses = responses.length;
    const averageRate = responses.length > 0 
      ? responses.reduce((sum, r) => sum + r.rate, 0) / responses.length 
      : 0;
    const lowestRate = responses.length > 0 
      ? Math.min(...responses.map(r => r.rate))
      : 0;
    const highestRate = responses.length > 0 
      ? Math.max(...responses.map(r => r.rate))
      : 0;

    res.json({
      bidId: bid.id,
      bidName: bid.name,
      status: bid.status,
      statistics: {
        totalResponses,
        averageRate: Math.round(averageRate * 100) / 100,
        lowestRate,
        highestRate,
        rateRange: highestRate - lowestRate
      },
      responses: responses.map(r => ({
        id: r.id,
        carrierId: r.carrier_id,
        rate: r.rate,
        status: r.status,
        submittedAt: r.submitted_at
      }))
    });
  } catch (error) {
    logger.error('Bid stats error', { error: error.message, bidId: req.params.bidId, userId: req.user.id });
    res.status(500).json({
      error: 'Failed to fetch bid statistics',
      code: 'BID_STATS_ERROR'
    });
  }
});

module.exports = router; 