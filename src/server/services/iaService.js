const Feedback = require('../models/Feedback');
const ApiError = require('../utils/ApiError');

class IAService {
  async chat(mensagem, context = {}) {
    const texto = String(mensagem || '').trim();
    if (!texto) throw new ApiError(400, 'Mensagem obrigatoria.');

    const textoNormalizado = texto.toLowerCase();
    const nome = context.user?.nome?.split(' ')[0] || 'usuario';
    const perfil = context.user?.tipoPerfil || 'participante';

    const respostas = [
      {
        termos: ['inscricao', 'inscrever', 'participar', 'vaga'],
        resposta: `Claro, ${nome}. Para participar de um evento, acesse a lista de eventos, abra os detalhes e clique em Inscrever-se quando o status estiver aberto. Depois disso, acompanhe tudo em Minhas inscricoes.`
      },
      {
        termos: ['certificado', 'certificados', 'validacao', 'validar'],
        resposta: 'Os certificados ficam na area Meus certificados. Eles sao emitidos para eventos que permitem certificado e podem ser consultados pelo codigo de validacao exibido na tela.'
      },
      {
        termos: ['feedback', 'avaliacao', 'avaliar', 'nota'],
        resposta: 'Depois que um evento for encerrado, participantes inscritos podem enviar nota e comentario em Minhas inscricoes. Organizadores e admins podem abrir os feedbacks no painel e pedir um resumo por IA.'
      },
      {
        termos: ['evento', 'eventos', 'programacao', 'agenda'],
        resposta: perfil === 'participante'
          ? 'Voce pode consultar eventos por categoria, data e status na tela inicial. Abra os detalhes para ver horario, local, palestrantes e disponibilidade de inscricao.'
          : 'No painel de eventos voce pode criar, editar, encerrar, cancelar e consultar participantes. Mantenha categoria, palestrantes, vagas e status sempre atualizados para orientar os participantes.'
      },
      {
        termos: ['categoria', 'categorias'],
        resposta: 'Categorias ajudam a organizar os eventos por area de interesse. No painel, usuarios organizadores e admins podem cadastrar, editar e remover categorias.'
      },
      {
        termos: ['palestrante', 'palestrantes'],
        resposta: 'Palestrantes representam convidados ou docentes vinculados aos eventos. Cadastre nome, e-mail, area de atuacao, instituicao, biografia e foto quando disponivel.'
      },
      {
        termos: ['senha', 'login', 'entrar', 'recuperar'],
        resposta: 'Para recuperar acesso, use a tela de Recuperar senha, gere o token academico e depois informe uma nova senha em Redefinir senha.'
      },
      {
        termos: ['crud', 'cadastrar', 'editar', 'excluir', 'deletar', 'atualizar'],
        resposta: 'O sistema possui CRUD RESTful para usuarios, eventos, categorias e palestrantes. As acoes de escrita exigem login e perfil autorizado, enquanto as consultas publicas continuam disponiveis.'
      }
    ];

    const encontrada = respostas.find((item) => item.termos.some((termo) => textoNormalizado.includes(termo)));
    const resposta = encontrada?.resposta || `Entendi, ${nome}. Sou o assistente academico do UniEvent. Posso ajudar com eventos, inscricoes, certificados, feedbacks, categorias, palestrantes, login e uso do painel.`;

    return {
      resposta,
      sugestoes: [
        'Como faco inscricao em um evento?',
        'Como vejo meus certificados?',
        'Como funciona o resumo de feedbacks?'
      ]
    };
  }

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
