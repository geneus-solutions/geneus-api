const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.log('this is status code', statusCode)
  console.log('this is error', err)
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || null,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorHandler;
