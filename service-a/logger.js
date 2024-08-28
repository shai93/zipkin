// logger.js
const winston = require('winston');

// Define your log format
const logFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, traceId }) => {
    return traceId
      ? `${timestamp} [${level}] ${message} (traceId: ${traceId})`
      : `${timestamp} [${level}] ${message}`;
  })
);

// Create the logger instance
const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(), // Log to console
    // You can add more transports here (e.g., file, HTTP, etc.)
  ],
});

module.exports = logger;
