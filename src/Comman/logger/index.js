const winston = require("winston");

// Custom log levels and colors
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    success: 3,
    debug: 4,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "cyan",
    success: "green",
    debug: "gray",
  },
};

winston.addColors(customLevels.colors);

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

// Custom formatter that sets `info.level` as `[level]` BEFORE colorizing
const customFormat = winston.format.combine(
  enumerateErrorFormat(),
  winston.format.splat(),
  winston.format((info) => {
    // Wrap the level with brackets first
    info.level = `[${info.level}]`;
    return info;
  })(),
  winston.format.colorize({ all: true }), // will colorize full `[level]`
  winston.format.printf((info) => `${info.level} ${info.message}`)
);

const createLogger = (options = {}) => {
  const { level = "debug", transports = [] } = options;

  return winston.createLogger({
    levels: customLevels.levels,
    level,
    format: customFormat,
    transports: [
      ...transports,
      new winston.transports.Console({ stderrLevels: ["error"] }),
    ],
  });
};

const logger = createLogger();

const success = (message) => logger.log("success", message);
const info = (message) => logger.log("info", message);
const warn = (message) => logger.log("warn", message);
const error = (message) => logger.log("error", message);
const debug = (message) => logger.log("debug", message);

module.exports = { ...logger, success, info, warn, error, debug };
