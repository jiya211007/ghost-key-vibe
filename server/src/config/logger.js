import morgan from 'morgan';

// Custom token for request body (for debugging)
morgan.token('body', (req) => {
  if (req.body && Object.keys(req.body).length > 0) {
    return JSON.stringify(req.body);
  }
  return '';
});

// Custom token for response time in a readable format
morgan.token('response-time-ms', (req, res) => {
  if (!res._header || !req._startAt) return '';
  const diff = process.hrtime(req._startAt);
  const ms = Math.round((diff[0] * 1000) + (diff[1] / 1000000));
  return `${ms}ms`;
});

// Development format
export const devFormat = ':method :url :status :response-time-ms - :body';

// Production format (minimal)
export const prodFormat = ':method :url :status :response-time-ms';

// Custom format for development
export const customDevFormat = morgan(devFormat, {
  skip: (req, res) => res.statusCode < 400, // Only log errors in dev
});

// Custom format for production
export const customProdFormat = morgan(prodFormat, {
  skip: (req, res) => res.statusCode >= 400, // Only log successful requests in prod
});

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  console.error('🚨 Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next(err);
};
