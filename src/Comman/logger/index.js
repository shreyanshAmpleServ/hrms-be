const winston = require("winston");

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

/**
 * Creates a logger instance using winston.
 * @module logger
 * @param {Object} [options] - Options for the logger.
 * @param {string} [options.level=debug] - The minimum log level to output.
 * @param {Array<winston.transport>} [options.transports] - The transports to use.
 * @returns {winston.Logger} - The logger instance.
 */
const createLogger = (options = {}) => {
  const { level = "debug", transports = [] } = options;
  return winston.createLogger({
    level,
    format: winston.format.combine(
      enumerateErrorFormat(),
      winston.format.splat(),
      winston.format((info) => {
        info.level = `[${info.level?.toUpperCase()}]`;
        return info;
      })(),
      winston.format.colorize(),
      winston.format.printf((info) => `${info.level} ${info.message}`)
    ),
    transports: [
      ...transports,
      new winston.transports.Console({ stderrLevels: ["error"] }),
    ],
  });
};

const logger = createLogger();
module.exports = logger;
