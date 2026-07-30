const logger = require(".././utils/logger");

const requestLogger = (req, res, next) => {
  // Skip static files
  if (/\.(css|js|jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot|map)$/i.test(req.path)) {
    return next();
  }

  const start = Date.now();

  res.on("finish", () => {
    logger.info({
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get("User-Agent"),
      referer: req.headers["referer"],
      origin: req.headers["origin"],
      accept: req.headers["accept"],
      acceptLanguage: req.headers["accept-language"],
      secFetchSite: req.headers["sec-fetch-site"],
      turnstilePresent: Boolean(req.body["cf-turnstile-response"]),
      status: res.statusCode,
      responseTime: Date.now() - start,
      contentLength: res.getHeader("Content-Length") || 0,
      timestamp: new Date().toISOString(),
    });
  });

  next();
};

module.exports = requestLogger;