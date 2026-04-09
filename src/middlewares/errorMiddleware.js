const ApiResponse = require('../utils/ApiResponse');

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor.';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return ApiResponse.error(res, {
    statusCode,
    message,
    errors: err.details || null
  });
};

module.exports = errorMiddleware;
