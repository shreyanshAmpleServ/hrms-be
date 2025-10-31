/**
 * Console log wrapper function.
 * Replaces the global console.log with a clone that can be easily disabled.
 * To disable all console logs, comment out the return statement inside the function.
 *
 * @function console.log
 * @param {...*} args - Arguments to be logged (same signature as native console.log)
 * @returns {void}
 */
const originalConsoleLog = console.log;
console.log = (...args) => {
  return originalConsoleLog(...args);
  return;
};

/**
 * Console error wrapper function.
 * Replaces the global console.error with a clone that can be easily disabled.
 * To disable all console errors, comment out the return statement inside the function.
 *
 * @function console.error
 * @param {...*} args - Arguments to be logged (same signature as native console.error)
 * @returns {void}
 */
const originalConsoleError = console.error;
console.error = (...args) => {
  return originalConsoleError(...args);
  return;
};
