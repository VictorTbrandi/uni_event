class ApiResponse {
  static success(res, {
    statusCode = 200,
    message = 'Operação realizada com sucesso.',
    data = null,
    meta = null
  } = {}) {
    const payload = {
      success: true,
      message,
      data
    };

    if (meta) payload.meta = meta;

    return res.status(statusCode).json(payload);
  }

  static error(res, {
    statusCode = 500,
    message = 'Erro interno do servidor.',
    errors = null
  } = {}) {
    const payload = {
      success: false,
      message
    };

    if (errors) payload.errors = errors;

    return res.status(statusCode).json(payload);
  }
}

module.exports = ApiResponse;
