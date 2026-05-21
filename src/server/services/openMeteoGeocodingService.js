const https = require('https');
const ApiError = require('../utils/ApiError');

const estados = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapa',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceara',
  DF: 'Distrito Federal',
  ES: 'Espirito Santo',
  GO: 'Goias',
  MA: 'Maranhao',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Para',
  PB: 'Paraiba',
  PR: 'Parana',
  PE: 'Pernambuco',
  PI: 'Piaui',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondonia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'Sao Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins'
};

const normalize = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

const getJson = (url) => new Promise((resolve, reject) => {
  const request = https.get(url, { timeout: 8000 }, (response) => {
    let body = '';

    response.on('data', (chunk) => {
      body += chunk;
    });

    response.on('end', () => {
      try {
        const json = body ? JSON.parse(body) : null;
        if (response.statusCode >= 400) {
          return reject(new Error(json?.reason || 'Erro ao consultar API externa.'));
        }
        return resolve(json);
      } catch (error) {
        return reject(error);
      }
    });
  });

  request.on('timeout', () => {
    request.destroy(new Error('Tempo limite excedido ao consultar API externa.'));
  });

  request.on('error', reject);
});

class OpenMeteoGeocodingService {
  async buscarCoordenadas(cidade, uf) {
    const cidadeNormalizada = String(cidade || '').trim();
    const ufNormalizada = String(uf || '').trim().toUpperCase();

    if (!cidadeNormalizada || !ufNormalizada) {
      throw new ApiError(400, 'Informe cidade e UF para consultar a previsao do tempo.');
    }

    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', cidadeNormalizada);
    url.searchParams.set('count', '10');
    url.searchParams.set('language', 'pt');
    url.searchParams.set('countryCode', 'BR');
    url.searchParams.set('format', 'json');

    let data;
    try {
      data = await getJson(url);
    } catch (error) {
      throw new ApiError(503, 'Nao foi possivel consultar a localizacao para previsao do tempo. Tente novamente mais tarde.');
    }

    const results = Array.isArray(data?.results) ? data.results : [];
    if (!results.length) {
      throw new ApiError(400, 'Cidade nao encontrada para consulta de previsao do tempo.');
    }

    const estado = estados[ufNormalizada] || ufNormalizada;
    const cidadeBusca = normalize(cidadeNormalizada);
    const estadoBusca = normalize(estado);

    const matchExato = results.find((result) => (
      result.country_code === 'BR' &&
      normalize(result.name) === cidadeBusca &&
      normalize(result.admin1) === estadoBusca
    ));

    const matchEstado = results.find((result) => (
      result.country_code === 'BR' &&
      normalize(result.admin1) === estadoBusca
    ));

    const selecionado = matchExato || matchEstado || results.find((result) => result.country_code === 'BR') || results[0];

    if (!Number.isFinite(Number(selecionado?.latitude)) || !Number.isFinite(Number(selecionado?.longitude))) {
      throw new ApiError(400, 'Cidade nao encontrada para consulta de previsao do tempo.');
    }

    return {
      cidade: selecionado.name || cidadeNormalizada,
      uf: ufNormalizada,
      latitude: Number(selecionado.latitude),
      longitude: Number(selecionado.longitude)
    };
  }
}

module.exports = new OpenMeteoGeocodingService();
