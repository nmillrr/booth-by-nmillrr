/**
 * Simple logging utility
 */

/**
 * Log levels
 */
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Current log level
 */
const currentLevel = process.env.LOG_LEVEL || LOG_LEVELS.INFO;

/**
 * Level priorities
 */
const LEVEL_PRIORITIES = {
  [LOG_LEVELS.ERROR]: 0,
  [LOG_LEVELS.WARN]: 1,
  [LOG_LEVELS.INFO]: 2,
  [LOG_LEVELS.DEBUG]: 3
};

/**
 * Check if a level should be logged
 * @param {string} level - Log level to check
 * @returns {boolean} - Whether to log this level
 */
const shouldLog = (level) => {
  return LEVEL_PRIORITIES[level] <= LEVEL_PRIORITIES[currentLevel];
};

/**
 * Format a log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 * @returns {string} - Formatted log message
 */
const formatLog = (level, message, data) => {
  const timestamp = new Date().toISOString();
  const dataString = data ? `\n${JSON.stringify(data, null, 2)}` : '';
  return `[${timestamp}] [${level}] ${message}${dataString}`;
};

/**
 * Log an error message
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
const error = (message, data) => {
  if (shouldLog(LOG_LEVELS.ERROR)) {
    console.error(formatLog(LOG_LEVELS.ERROR, message, data));
  }
};

/**
 * Log a warning message
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
const warn = (message, data) => {
  if (shouldLog(LOG_LEVELS.WARN)) {
    console.warn(formatLog(LOG_LEVELS.WARN, message, data));
  }
};

/**
 * Log an info message
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
const info = (message, data) => {
  if (shouldLog(LOG_LEVELS.INFO)) {
    console.info(formatLog(LOG_LEVELS.INFO, message, data));
  }
};

/**
 * Log a debug message
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
const debug = (message, data) => {
  if (shouldLog(LOG_LEVELS.DEBUG)) {
    console.debug(formatLog(LOG_LEVELS.DEBUG, message, data));
  }
};

module.exports = {
  error,
  warn,
  info,
  debug,
  LOG_LEVELS
};