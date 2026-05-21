require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const seedDefaultUsers = require('./config/seedDefaultUsers');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  await seedDefaultUsers();

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
};

startServer();
