const path = require('path');
const fs = require('fs');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

const ensureFolder = (folder) => {
  const target = path.join(UPLOAD_ROOT, folder);
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  return target;
};

const allowedMimes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const buildUploader = (folder, { maxSizeMb = 5 } = {}) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, ensureFolder(folder));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.bin';
      const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, safeName);
    }
  });

  return multer({
    storage,
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!allowedMimes.has(file.mimetype)) {
        return cb(new ApiError(400, 'Formato de imagem nao suportado. Use JPG, PNG, WEBP ou GIF.'));
      }
      cb(null, true);
    }
  });
};

module.exports = {
  buildUploader,
  UPLOAD_ROOT
};
