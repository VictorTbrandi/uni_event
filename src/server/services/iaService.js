const Feedback = require('../models/Feedback');
const Evento = require('../models/Evento');
const Inscricao = require('../models/Inscricao');
require('../models/Categoria');
const ApiError = require('../utils/ApiError');
const { toPublicEvento } = require('../utils/eventLifecycle');
const previsaoTempoService = require('./previsaoTempoService');

const activeSubscriptionFilter = { status: { $ne: 'cancelada' } };

const sugestoesPadrao = [];

const maxOutputTokens = () => Number(process.env.IA_MAX_OUTPUT_TOKENS || 1600);

const normalizeText = (value = '') => String(value)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const externalAIProvider = () => {
  const provider = String(process.env.IA_PROVIDER || '').trim().toLowerCase();
  if (provider) return provider;
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.OPENAI_API_KEY) return 'openai';
  throw new ApiError(500, 'API externa de IA nao configurada. Configure IA_PROVIDER e GEMINI_API_KEY ou OPENAI_API_KEY no .env.');
};

const systemPrompt = (context = {}) => {
  const perfil = context.user?.tipoPerfil || 'participante';
  const nome = context.user?.nome || 'usuario';

  return [
    'Voce e o Assistente IA do UniEvent, um sistema de gestao de eventos universitarios.',
    'Responda sempre em portugues do Brasil, com clareza e objetividade.',
    `Usuario atual: ${nome}. Perfil: ${perfil}.`,
    'Explique apenas funcionalidades relacionadas ao UniEvent: eventos, inscricoes, certificados, feedbacks, categorias, palestrantes, institucional, login e uso do painel.',
    'Nao invente dados especificos de eventos, usuarios ou certificados que nao foram fornecidos na conversa.',
    'Quando houver regra de permissao, use: admin gerencia tudo; organizador gerencia seus eventos; participante visualiza eventos e se inscreve quando permitido.',
    'Use os dados reais do contexto do sistema quando eles forem fornecidos. Se um dado nao estiver no contexto, diga que nao ha informacao suficiente.',
    'Responda de forma completa, sem terminar frases pela metade. Prefira no maximo 6 itens quando listar dados.',
    'Nao use Markdown. Nao use asteriscos, negrito, cercas de codigo ou tabelas. Use texto simples com frases curtas e listas numeradas quando fizer sentido.'
  ].join('\n');
};

const normalizeHistory = (historico = []) => (
  Array.isArray(historico)
    ? historico
      .slice(-10)
      .filter((item) => item?.texto)
      .map((item) => ({
        role: item.autor === 'ia' ? 'model' : 'user',
        text: String(item.texto).slice(0, 1000)
      }))
    : []
);

const conversationHistory = (historico, mensagemAtual) => {
  const history = normalizeHistory(historico);
  const withoutCurrentMessage = history.filter((item, index) => (
    !(index === history.length - 1 && item.role === 'user' && item.text.trim() === mensagemAtual.trim())
  ));
  const firstUserIndex = withoutCurrentMessage.findIndex((item) => item.role === 'user');
  return firstUserIndex >= 0 ? withoutCurrentMessage.slice(firstUserIndex) : [];
};

const extractOpenAIText = (data) => {
  if (data.output_text) return data.output_text;

  const texts = (data.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || content.value)
    .filter(Boolean);

  return texts.join('\n').trim();
};

const extractGeminiText = (data) => {
  const parts = data.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part.text).filter(Boolean).join('\n').trim();
};

const sanitizePlainText = (text = '') => String(text)
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/__(.*?)__/g, '$1')
  .replace(/```[\s\S]*?```/g, '')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/^\s*[-*]\s+/gm, '')
  .replace(/^\s*#{1,6}\s+/gm, '')
  .replace(/^(\s*\d+\.)\s{2,}/gm, '$1 ')
  .replace(/[ \t]+$/gm, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const assertAIResponse = async (response, provider) => {
  if (response.ok) return;

  let details = '';
  try {
    const data = await response.json();
    details = data.error?.message || data.message || JSON.stringify(data);
  } catch (error) {
    details = await response.text().catch(() => '');
  }

  throw new ApiError(response.status, `Erro ao chamar a API externa de IA (${provider}). ${details}`.trim());
};

const toDateText = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
};

const sistemaContext = () => [
  'Conhecimento geral do sistema UniEvent:',
  '- Todos os usuarios podem visualizar todos os eventos cadastrados na agenda e na tela de detalhes.',
  '- Participantes podem se inscrever em eventos quando o status calculado esta aberto, ha vagas disponiveis e o prazo de inscricao ainda nao encerrou.',
  '- Se uma inscricao e cancelada, a vaga volta a ficar disponivel. Se o mesmo usuario se inscrever de novo no mesmo evento, a inscricao cancelada e reativada em vez de criar duplicidade.',
  '- Admin pode gerenciar tudo: usuarios, institucional, eventos, palestrantes, categorias, participantes, feedbacks e certificados.',
  '- Organizador pode cadastrar e editar eventos, categorias e palestrantes, mas no backend so altera eventos criados por ele, salvo quando for admin.',
  '- Participante visualiza eventos, faz inscricoes, acompanha Minhas inscricoes, envia feedback apos evento encerrado e acessa certificados emitidos.',
  '- Eventos possuem categoria, palestrantes, local, data, horario, vagas, carga horaria, status, prazo de inscricao, vinculo institucional opcional e previsao do tempo opcional.',
  '- Status do evento exibido pode ser calculado: aberto, fechado, encerrado ou cancelado. Um evento configurado como aberto pode aparecer fechado por lotacao, prazo encerrado ou fim do evento.',
  '- Certificados sao emitidos para eventos encerrados que permitem certificado, normalmente por admin ou organizador autorizado.',
  '- Feedbacks podem ser enviados por participantes inscritos apos o encerramento do evento; admin e organizador podem consultar resumo e satisfacao.',
  '- O painel institucional administra universidades, campi, departamentos, cursos e salas.'
].join('\n');

const shouldIncludeWeather = (texto) => {
  const normalized = normalizeText(texto);
  return /\b(previsao|clima|tempo|chuva|temperatura)\b/.test(normalized);
};

const shouldIncludeEvents = (texto) => {
  const normalized = normalizeText(texto);
  return /\b(quais|listar|lista|agenda|eventos?|vagas?|disponiveis|previsao|clima|tempo|chuva|programacao)\b/.test(normalized);
};

const countActiveSubscriptions = (eventoId) => Inscricao.countDocuments({ eventoId, ...activeSubscriptionFilter });

const weatherSummary = async (evento, inscritosCount) => {
  if (!evento.previsaoTempoAtiva) return 'previsao nao ativada';

  try {
    const previsao = await previsaoTempoService.getPrevisaoChuva(evento, inscritosCount);
    if (!previsao.previsaoDisponivel) return previsao.mensagem;

    return [
      previsao.condicaoTempo,
      Number.isFinite(Number(previsao.temperaturaHorario)) ? `${Number(previsao.temperaturaHorario).toFixed(1)} C` : null,
      Number.isFinite(Number(previsao.probabilidadeChuvaHorario)) ? `chuva ${Number(previsao.probabilidadeChuvaHorario)}% no horario` : null,
      previsao.mensagem
    ].filter(Boolean).join(', ');
  } catch (error) {
    return 'previsao indisponivel no momento';
  }
};

const buildEventosContext = async (mensagem) => {
  if (!shouldIncludeEvents(mensagem)) return '';

  const eventos = await Evento.find()
    .populate('categoriaId', 'nome')
    .sort({ data: 1, horarioInicio: 1 })
    .limit(20);

  if (!eventos.length) return 'Eventos cadastrados: nenhum evento cadastrado.';

  const includeWeather = shouldIncludeWeather(mensagem);
  const eventosPublicos = [];

  for (const evento of eventos) {
    const inscritosCount = await countActiveSubscriptions(evento._id);
    const publico = toPublicEvento(evento, inscritosCount);
    eventosPublicos.push({ evento, publico, inscritosCount });
  }

  const normalized = normalizeText(mensagem);
  const onlyAvailable = /\b(vaga|vagas|disponivel|disponiveis|inscrever|inscricao)\b/.test(normalized);
  const selecionados = eventosPublicos
    .filter(({ publico }) => !onlyAvailable || Number(publico.vagasDisponiveis) > 0)
    .slice(0, includeWeather ? 8 : 12);

  if (!selecionados.length) {
    return 'Eventos cadastrados: nenhum evento com vagas disponiveis foi encontrado no contexto consultado.';
  }

  const linhas = [];

  for (const { evento, publico, inscritosCount } of selecionados) {
    const categoria = typeof publico.categoriaId === 'object' ? publico.categoriaId.nome : 'Sem categoria';
    const local = [publico.local, [publico.cidade, publico.uf].filter(Boolean).join('/')].filter(Boolean).join(' - ');
    const previsao = includeWeather ? await weatherSummary(evento, inscritosCount) : null;

    linhas.push([
      `- ${publico.titulo}`,
      `data ${toDateText(publico.data)} ${publico.horarioInicio || ''}-${publico.horarioFim || ''}`,
      `status ${publico.status}${publico.motivoFechamentoInscricao ? ` (${publico.motivoFechamentoInscricao})` : ''}`,
      `vagas ${publico.vagasDisponiveis}/${publico.vagas}`,
      `inscritos ${publico.inscritosCount}`,
      `categoria ${categoria}`,
      local ? `local ${local}` : null,
      publico.inscricoesEncerramEm ? `inscricoes ate ${toDateText(publico.inscricoesEncerramEm)}` : 'sem prazo de inscricao',
      previsao ? `previsao ${previsao}` : null
    ].filter(Boolean).join(' | '));
  }

  const totalInfo = selecionados.length < eventosPublicos.length
    ? `\nObservacao: contexto limitado aos ${selecionados.length} eventos mais relevantes para a pergunta.`
    : '';

  return `Eventos cadastrados:\n${linhas.join('\n')}${totalInfo}`;
};

const buildSystemData = async (mensagem) => {
  const eventosContext = await buildEventosContext(mensagem);
  return [sistemaContext(), eventosContext].filter(Boolean).join('\n\n');
};

class IAService {
  async askOpenAI(mensagem, context) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new ApiError(500, 'OPENAI_API_KEY nao configurada.');

    const history = conversationHistory(context.historico, mensagem);
    const input = [
      context.systemData,
      ...history.map((item) => `${item.role === 'model' ? 'Assistente' : 'Usuario'}: ${item.text}`),
      `Usuario: ${mensagem}`
    ].filter(Boolean).join('\n\n');

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
        instructions: systemPrompt(context),
        input,
        max_output_tokens: maxOutputTokens()
      })
    });

    await assertAIResponse(response, 'openai');
    const data = await response.json();
    return extractOpenAIText(data);
  }

  async askGemini(mensagem, context) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new ApiError(500, 'GEMINI_API_KEY nao configurada.');

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const history = conversationHistory(context.historico, mensagem);
    const contents = [
      ...(context.systemData ? [{
        role: 'user',
        parts: [{ text: `Contexto do sistema:\n${context.systemData}` }]
      }] : []),
      ...history.map((item) => ({
        role: item.role,
        parts: [{ text: item.text }]
      })),
      {
        role: 'user',
        parts: [{ text: mensagem }]
      }
    ];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt(context) }]
        },
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: maxOutputTokens(),
          topP: 0.9
        }
      })
    });

    await assertAIResponse(response, 'gemini');
    const data = await response.json();
    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason === 'MAX_TOKENS') {
      throw new ApiError(502, 'A resposta da IA foi truncada por limite de tokens. Aumente IA_MAX_OUTPUT_TOKENS ou refine a pergunta.');
    }
    return extractGeminiText(data);
  }

  async askExternalAI(mensagem, context = {}) {
    const provider = externalAIProvider();

    if (provider === 'openai') return this.askOpenAI(mensagem, context);
    if (provider === 'gemini') return this.askGemini(mensagem, context);

    throw new ApiError(500, 'IA_PROVIDER invalido. Use "gemini" ou "openai".');
  }

  async chat(mensagem, context = {}) {
    const texto = String(mensagem || '').trim();
    if (!texto) throw new ApiError(400, 'Mensagem obrigatoria.');

    const systemData = await buildSystemData(texto);
    const resposta = sanitizePlainText(await this.askExternalAI(texto, { ...context, systemData }));

    return {
      resposta,
      sugestoes: sugestoesPadrao
    };
  }

  async resumirFeedbacks(eventoId) {
    const feedbacks = await Feedback.find({ eventoId }).sort({ createdAt: -1 });
    if (!feedbacks.length) throw new ApiError(404, 'Nao ha feedbacks para este evento.');

    const notas = feedbacks.map((item) => item.nota);
    const media = notas.reduce((acc, curr) => acc + curr, 0) / notas.length;
    const comentarios = feedbacks.map((item) => item.comentario).filter(Boolean);

    const prompt = [
      'Gere um resumo executivo dos feedbacks do evento.',
      `Quantidade de feedbacks: ${feedbacks.length}.`,
      `Media das notas: ${media.toFixed(1)} de 5.`,
      `Comentarios: ${comentarios.join(' | ') || 'Sem comentarios textuais.'}`,
      'Inclua principais pontos positivos, pontos de atencao e uma recomendacao curta.'
    ].join('\n');

    const resumo = sanitizePlainText(await this.askExternalAI(prompt, {}));

    return { quantidade: feedbacks.length, media, resumo };
  }

  async classificarSatisfacao(eventoId) {
    const feedbacks = await Feedback.find({ eventoId });
    if (!feedbacks.length) throw new ApiError(404, 'Nao ha feedbacks para classificar.');

    const media = feedbacks.reduce((acc, item) => acc + item.nota, 0) / feedbacks.length;

    let classificacao = 'neutra';
    if (media >= 4) classificacao = 'positiva';
    else if (media <= 2.5) classificacao = 'negativa';

    return { media, classificacao };
  }

  async sugerirDescricaoEvento({ titulo, categoria, palestrante }) {
    const prompt = [
      'Crie uma descricao convidativa para um evento universitario no sistema UniEvent.',
      `Titulo: ${titulo}.`,
      `Categoria: ${categoria}.`,
      `Palestrante: ${palestrante}.`,
      'Escreva um paragrafo com ate 900 caracteres, em portugues do Brasil.'
    ].join('\n');

    const descricao = sanitizePlainText(await this.askExternalAI(prompt, {}));

    return { descricaoSugerida: descricao };
  }
}

module.exports = new IAService();
