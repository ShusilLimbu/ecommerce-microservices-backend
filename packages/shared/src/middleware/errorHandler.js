const { AppError } = require("../errors/AppError");

function errorHandler(err, req, res, _next) {
  const requestId = req.headers["x-request-id"] || req.id;
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      details: err.details,
      requestId,
    });
  }
  console.error(err);
  res.status(500).json({
    code: "INTERNAL_ERROR",
    message: "Internal server error",
    requestId,
  });
}

module.exports = { errorHandler };
