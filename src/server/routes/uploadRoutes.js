const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');
const { buildUploader } = require('../middlewares/uploadMiddleware');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const router = express.Router();

const eventoUploader = buildUploader('eventos', { maxSizeMb: 5 });

router.post(
  '/eventos/imagem',
  authMiddleware,
  authorize('admin', 'organizador'),
  (req, res, next) => {
    eventoUploader.single('imagem')(req, res, (err) => {
      if (err) {
        if (err instanceof ApiError) return next(err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError(400, 'A imagem excede o tamanho maximo permitido (5 MB).'));
        }
        return next(new ApiError(400, err.message || 'Falha ao processar imagem.'));
      }

      if (!req.file) {
        return next(new ApiError(400, 'Envie um arquivo de imagem no campo "imagem".'));
      }

      const url = `/uploads/eventos/${req.file.filename}`;
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Imagem enviada com sucesso.',
        data: { url }
      });
    });
  }
);

module.exports = router;
