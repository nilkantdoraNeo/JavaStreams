function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }
  const status = error.status || 500;
  return res.status(status).json({
    message: error.message || "Unexpected server error"
  });
}

module.exports = errorMiddleware;
