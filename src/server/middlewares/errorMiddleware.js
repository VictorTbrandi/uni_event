const ApiResponse = require('../utils/ApiResponse');

const fieldLabels = {
  nome: 'Nome',
  email: 'E-mail',
  senha: 'Senha',
  tipoPerfil: 'Perfil',
  curso: 'Curso',
  ra: 'RA',
  titulo: 'Titulo',
  descricao: 'Descricao',
  data: 'Data',
  horarioInicio: 'Horario de inicio',
  horarioFim: 'Horario de fim',
  local: 'Local',
  cidade: 'Cidade',
  uf: 'UF',
  previsaoTempoAtiva: 'Previsao do tempo',
  cargaHoraria: 'Carga horaria',
  vagas: 'Vagas',
  categoriaId: 'Categoria',
  palestrantes: 'Palestrantes',
  status: 'Status',
  nota: 'Nota',
  comentario: 'Comentario'
};

const normalizeMongooseError = (err) => {
  if (err?.name === 'ValidationError') {
    return {
      statusCode: 422,
      message: 'Erro de validacao.',
      errors: Object.values(err.errors).map((error) => ({
        path: error.path,
        msg: error.message
      }))
    };
  }

  if (err?.code === 11000) {
    const fields = Object.keys(err.keyValue || err.keyPattern || {});
    return {
      statusCode: 409,
      message: 'Registro duplicado.',
      errors: fields.map((field) => ({
        path: field,
        msg: `${fieldLabels[field] || field} ja cadastrado.`
      }))
    };
  }

  if (err?.name === 'CastError') {
    return {
      statusCode: 400,
      message: 'Dado invalido.',
      errors: [{
        path: err.path,
        msg: `${fieldLabels[err.path] || err.path || 'Campo'} invalido.`
      }]
    };
  }

  return null;
};

const errorMiddleware = (err, req, res, next) => {
  const normalizedError = normalizeMongooseError(err);
  const statusCode = normalizedError?.statusCode || err.statusCode || 500;
  const message = normalizedError?.message || err.message || 'Erro interno do servidor.';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return ApiResponse.error(res, {
    statusCode,
    message,
    errors: normalizedError?.errors || err.details || null
  });
};

module.exports = errorMiddleware;
