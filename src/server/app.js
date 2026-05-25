const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const notFoundMiddleware = require('./middlewares/notFoundMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:8080',
  'http://localhost:8081'
].filter(Boolean);

const isLocalDevelopmentOrigin = (origin) => {
  if (process.env.NODE_ENV === 'production') return false;
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
};

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origem nao permitida pelo CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API UniEvent em funcionamento.'
  });
});

app.use('/api', routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
