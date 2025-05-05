// middleware/errorResponseMiddleware.js
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log the error (optional, but useful for debugging)
  //console.error(`Error [${status}]: ${message}`);

  // Send the error response with the consistent structure
  res.status(status).json({
      success: false,
      data: null,
      message: message,
      status: status,
  });
};

module.exports = errorHandler;
