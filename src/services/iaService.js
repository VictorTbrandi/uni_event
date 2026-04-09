const Feedback = require('../models/Feedback');
const ApiError = require('../utils/ApiError');

class IAService {
  async resumirFeedbacks(eventoId) {
    const feedbacks = await Feedback.find({ eventoId }).sort({ createdAt: -1 });
    if (!feedbacks.length) throw new ApiError(404, 'Não há feedbacks para este evento.');

    const notas = feedbacks.map((item) => item.nota);
    const media = notas.reduce((acc, curr) => acc + curr, 0) / notas.length;
    const comentarios = feedbacks.map((item) => item.comentario).filter(Boolean);

    const resumo = `O evento possui ${feedbacks.length} feedback(s), com média ${media.toFixed(1)} de 5. ` +
      `Os comentários destacam pontos sobre organização, conteúdo e experiência geral. ` +
      `Principais observações: ${comentarios.slice(0, 3).join(' | ') || 'Sem comentários textuais.'}`;

    return { quantidade: feedbacks.length, media, resumo };
  }

  async classificarSatisfacao(eventoId) {
    const feedbacks = await Feedback.find({ eventoId });
    if (!feedbacks.length) throw new ApiError(404, 'Não há feedbacks para classificar.');

    const media = feedbacks.reduce((acc, item) => acc + item.nota, 0) / feedbacks.length;

    let classificacao = 'neutra';
    if (media >= 4) classificacao = 'positiva';
    else if (media <= 2.5) classificacao = 'negativa';

    return { media, classificacao };
  }

  async sugerirDescricaoEvento({ titulo, categoria, palestrante }) {
    const descricao = `${titulo} é um evento da categoria ${categoria}, pensado para o ambiente universitário. ` +
      `A atividade contará com participação de ${palestrante}, promovendo troca de conhecimento, aprofundamento prático e integração acadêmica. ` +
      `Ideal para estudantes interessados em ampliar repertório, desenvolver networking e vivenciar discussões relevantes para sua formação.`;

    return { descricaoSugerida: descricao };
  }
}

module.exports = new IAService();
