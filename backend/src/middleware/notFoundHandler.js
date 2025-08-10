const { logger } = require('../utils/logger');

const notFoundHandler = (req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    error: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    message: `The requested route ${req.method} ${req.originalUrl} was not found on this server.`
  });
};

module.exports = { notFoundHandler }; 