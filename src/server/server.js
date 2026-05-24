require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const seedDefaultUsers = require('./config/seedDefaultUsers');
const seedDefaultInstitutions = require('./config/seedDefaultInstitutions');
const seedAllControllers = require('./config/seedAllControllers');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  await seedDefaultUsers();
  await seedDefaultInstitutions();
  await seedAllControllers();

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
};

startServer();
