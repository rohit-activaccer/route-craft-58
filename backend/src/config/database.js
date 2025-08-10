const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../utils/logger');

// Supabase client configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('Missing Supabase configuration. Please check your environment variables.');
  process.exit(1);
}

// Create Supabase client for public operations
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

// Create Supabase client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database connection test
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      logger.warn('Database connection test failed:', error.message);
      return false;
    }
    
    logger.info('✅ Database connection successful');
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize database tables if they don't exist
const initializeDatabase = async () => {
  try {
    // Create users table
    const { error: usersError } = await supabaseAdmin.rpc('create_users_table_if_not_exists');
    if (usersError) logger.warn('Users table creation warning:', usersError.message);

    // Create bids table
    const { error: bidsError } = await supabaseAdmin.rpc('create_bids_table_if_not_exists');
    if (bidsError) logger.warn('Bids table creation warning:', bidsError.message);

    // Create carriers table
    const { error: carriersError } = await supabaseAdmin.rpc('create_carriers_table_if_not_exists');
    if (carriersError) logger.warn('Carriers table creation warning:', carriersError.message);

    // Create lanes table
    const { error: lanesError } = await supabaseAdmin.rpc('create_lanes_table_if_not_exists');
    if (lanesError) logger.warn('Lanes table creation warning:', lanesError.message);

    // Create insurance_claims table
    const { error: insuranceError } = await supabaseAdmin.rpc('create_insurance_claims_table_if_not_exists');
    if (insuranceError) logger.warn('Insurance claims table creation warning:', insuranceError.message);

    logger.info('✅ Database initialization completed');
  } catch (error) {
    logger.error('❌ Database initialization failed:', error.message);
  }
};

// Database utility functions
const db = {
  // User operations
  async createUser(userData) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async getUserById(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Bid operations
  async createBid(bidData) {
    const { data, error } = await supabase
      .from('bids')
      .insert([bidData])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async getBids(filters = {}) {
    let query = supabase.from('bids').select('*');
    
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.laneId) query = query.eq('lane_id', filters.laneId);
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },

  async updateBid(bidId, updates) {
    const { data, error } = await supabase
      .from('bids')
      .update(updates)
      .eq('id', bidId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Carrier operations
  async createCarrier(carrierData) {
    const { data, error } = await supabase
      .from('carriers')
      .insert([carrierData])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async getCarriers(filters = {}) {
    let query = supabase.from('carriers').select('*');
    
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.serviceArea) query = query.contains('service_areas', [filters.serviceArea]);
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },

  // Lane operations
  async createLane(laneData) {
    const { data, error } = await supabase
      .from('lanes')
      .insert([laneData])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async getLanes(filters = {}) {
    let query = supabase.from('lanes').select('*');
    
    if (filters.origin) query = query.ilike('origin', `%${filters.origin}%`);
    if (filters.destination) query = query.ilike('destination', `%${filters.destination}%`);
    if (filters.region) query = query.eq('region', filters.region);
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },

  // Insurance claims operations
  async createInsuranceClaim(claimData) {
    const { data, error } = await supabase
      .from('insurance_claims')
      .insert([claimData])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async getInsuranceClaims(filters = {}) {
    let query = supabase.from('insurance_claims').select('*');
    
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.userId) query = query.eq('user_id', filters.userId);
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },

  // Analytics operations
  async getBidAnalytics(userId, timeRange = '30d') {
    const { data, error } = await supabase
      .rpc('get_bid_analytics', { user_id: userId, time_range: timeRange });
    
    if (error) throw new Error(error.message);
    return data;
  },

  async getNetworkAnalytics(userId) {
    const { data, error } = await supabase
      .rpc('get_network_analytics', { user_id: userId });
    
    if (error) throw new Error(error.message);
    return data;
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  db,
  testConnection,
  initializeDatabase
}; 