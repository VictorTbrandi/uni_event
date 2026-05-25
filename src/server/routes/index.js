const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const categoriaRoutes = require('./categoriaRoutes');
const palestranteRoutes = require('./palestranteRoutes');
const eventoRoutes = require('./eventoRoutes');
const inscricaoRoutes = require('./inscricaoRoutes');
const certificadoRoutes = require('./certificadoRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const iaRoutes = require('./iaRoutes');
const universidadeRoutes = require('./universidadeRoutes');
const campusRoutes = require('./campusRoutes');
const departamentoRoutes = require('./departamentoRoutes');
const cursoRoutes = require('./cursoRoutes');
const salaRoutes = require('./salaRoutes');
const atividadeRoutes = require('./atividadeRoutes');
const uploadRoutes = require('./uploadRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/palestrantes', palestranteRoutes);
router.use('/eventos', eventoRoutes);
router.use('/inscricoes', inscricaoRoutes);
router.use('/certificados', certificadoRoutes);
router.use('/feedbacks', feedbackRoutes);
router.use('/ia', iaRoutes);
router.use('/universidades', universidadeRoutes);
router.use('/campi', campusRoutes);
router.use('/departamentos', departamentoRoutes);
router.use('/cursos', cursoRoutes);
router.use('/salas', salaRoutes);
router.use('/atividades', atividadeRoutes);
router.use('/uploads', uploadRoutes);

module.exports = router;
