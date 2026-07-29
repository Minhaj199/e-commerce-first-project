const logger = require(".././utils/logger");

const requestLogger = (req, res, next) => {
  // Skip static files
  if (/\.(css|js|jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot|map)$/i.test(req.path)) {
    return next();
  }

  const start = Date.now();

  res.on("finish", () => {
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: Date.now() - start,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      contentLength: res.getHeader("Content-Length") || 0,
      timestamp: new Date().toISOString(),
    });
  });

  next();
};

module.exports = requestLogger;