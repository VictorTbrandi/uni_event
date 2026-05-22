const https = require('https');
const { resolveEventoStatus } = require('../utils/eventLifecycle');

const unavailable = (evento, mensagem) => ({
  eventoId: evento?._id,
  tituloEvento: evento?.titulo || '',
  dataEvento: toDateString(evento?.data),
  horarioInicio: evento?.horarioInicio || '',
  cidade: evento?.cidade || null,
  uf: evento?.uf || null,
  latitude: evento?.latitude ?? null,
  longitude: evento?.longitude ?? null,
  previsaoDisponivel: false,
  probabilidadeChuvaHorario: null,
  probabilidadeChuvaDia: null,
  chuvaHorarioMm: null,
  chuvaDiaMm: null,
  horasComChuvaDia: null,
  temperaturaHorario: null,
  sensacaoTermicaHorario: null,
  ventoHorarioKmH: null,
  temperaturaMinDia: null,
  temperaturaMaxDia: null,
  ventoMaxDiaKmH: null,
  codigoTempoHorario: null,
  codigoTempoDia: null,
  condicaoTempo: null,
  nivelRisco: 'INDISPONIVEL',
  mensagem
});

const pad = (value) => String(value).padStart(2, '0');

const toDateString = (date) => {
  if (!date) return '';
  const match = String(date).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return `${parsed.getUTCFullYear()}-${pad(parsed.getUTCMonth() + 1)}-${pad(parsed.getUTCDate())}`;
};

const getRoundedEventHour = (dataEvento, horarioInicio) => {
  const [year, month, day] = dataEvento.split('-').map(Number);
  const [hour, minute] = String(horarioInicio || '').split(':').map(Number);
  if (![year, month, day, hour, minute].every(Number.isInteger)) return null;

  const roundedHour = minute >= 30 ? hour + 1 : hour;
  const target = new Date(year, month - 1, day, roundedHour, 0, 0, 0);
  return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:00`;
};

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

const numberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const maxNumber = (...values) => {
  const numbers = values.map(numberOrNull).filter((value) => value !== null);
  return numbers.length ? Math.max(...numbers) : null;
};

const weatherCodeDescriptions = {
  0: 'Ceu limpo',
  1: 'Predominantemente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Neblina',
  48: 'Neblina com geada',
  51: 'Garoa leve',
  53: 'Garoa moderada',
  55: 'Garoa intensa',
  56: 'Garoa congelante leve',
  57: 'Garoa congelante intensa',
  61: 'Chuva leve',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  66: 'Chuva congelante leve',
  67: 'Chuva congelante forte',
  71: 'Neve leve',
  73: 'Neve moderada',
  75: 'Neve forte',
  77: 'Graos de neve',
  80: 'Pancadas de chuva leves',
  81: 'Pancadas de chuva moderadas',
  82: 'Pancadas de chuva fortes',
  85: 'Pancadas de neve leves',
  86: 'Pancadas de neve fortes',
  95: 'Temporal',
  96: 'Temporal com granizo leve',
  99: 'Temporal com granizo forte'
};

const describeWeatherCode = (code) => {
  const parsed = Number(code);
  if (!Number.isInteger(parsed)) return null;
  return weatherCodeDescriptions[parsed] || 'Condicao nao identificada';
};

const classifyRisk = ({ hourProbability, hourRain, dayProbability, dayRain }) => {
  if (hourProbability >= 60 || hourRain >= 2 || dayProbability >= 70 || dayRain >= 10) {
    return {
      nivelRisco: 'ALTO_RISCO',
      mensagem: 'Alta chance de chuva no horario do evento. Recomenda-se planejar estrutura coberta.'
    };
  }

  if (hourProbability >= 30 || hourRain > 0 || dayRain > 0) {
    return {
      nivelRisco: 'RISCO_MODERADO',
      mensagem: 'Existe possibilidade de chuva. Recomenda-se atencao.'
    };
  }

  return {
    nivelRisco: 'BAIXO_RISCO',
    mensagem: 'Baixa chance de chuva no horario do evento.'
  };
};

class PrevisaoTempoService {
  async getPrevisaoChuva(evento, inscritosCount = 0) {
    if (!evento?.previsaoTempoAtiva) {
      return unavailable(evento, 'Previsao do tempo indisponivel para este evento.');
    }

    if (!Number.isFinite(Number(evento.latitude)) || !Number.isFinite(Number(evento.longitude))) {
      return unavailable(evento, 'Localizacao nao configurada para previsao do tempo.');
    }

    const lifecycle = resolveEventoStatus(evento, inscritosCount);
    if (lifecycle.status === 'encerrado') {
      return unavailable(evento, 'Previsao indisponivel para evento encerrado.');
    }

    const dataEvento = toDateString(evento.data);
    const targetHour = getRoundedEventHour(dataEvento, evento.horarioInicio);
    if (!targetHour) {
      return unavailable(evento, 'Previsao do tempo indisponivel para este evento.');
    }

    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(evento.latitude));
    url.searchParams.set('longitude', String(evento.longitude));
    url.searchParams.set(
      'hourly',
      'precipitation_probability,precipitation,rain,showers,weather_code,temperature_2m,apparent_temperature,wind_speed_10m'
    );
    url.searchParams.set(
      'daily',
      'precipitation_probability_max,precipitation_sum,rain_sum,showers_sum,precipitation_hours,weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max'
    );
    url.searchParams.set('timezone', 'America/Sao_Paulo');
    url.searchParams.set('forecast_days', '16');

    let data;
    try {
      data = await getJson(url);
    } catch (error) {
      return unavailable(evento, 'Nao foi possivel consultar a previsao do tempo no momento.');
    }

    const hourlyIndex = data?.hourly?.time?.indexOf(targetHour) ?? -1;
    const dailyIndex = data?.daily?.time?.indexOf(dataEvento) ?? -1;

    if (hourlyIndex < 0 || dailyIndex < 0) {
      return unavailable(evento, 'Previsao disponivel apenas proximo a data do evento.');
    }

    const hourProbability = numberOrNull(data.hourly.precipitation_probability?.[hourlyIndex]) ?? 0;
    const hourRain = maxNumber(
      data.hourly.precipitation?.[hourlyIndex],
      data.hourly.rain?.[hourlyIndex],
      data.hourly.showers?.[hourlyIndex]
    ) ?? 0;
    const dayProbability = numberOrNull(data.daily.precipitation_probability_max?.[dailyIndex]) ?? 0;
    const dayRain = maxNumber(
      data.daily.precipitation_sum?.[dailyIndex],
      Number(data.daily.rain_sum?.[dailyIndex] || 0) + Number(data.daily.showers_sum?.[dailyIndex] || 0)
    ) ?? 0;
    const hoursWithRain = numberOrNull(data.daily.precipitation_hours?.[dailyIndex]) ?? 0;
    const codigoTempoHorario = numberOrNull(data.hourly.weather_code?.[hourlyIndex]);
    const codigoTempoDia = numberOrNull(data.daily.weather_code?.[dailyIndex]);
    const risk = classifyRisk({ hourProbability, hourRain, dayProbability, dayRain });

    return {
      eventoId: evento._id,
      tituloEvento: evento.titulo,
      dataEvento,
      horarioInicio: evento.horarioInicio,
      cidade: evento.cidade,
      uf: evento.uf,
      latitude: Number(evento.latitude),
      longitude: Number(evento.longitude),
      previsaoDisponivel: true,
      probabilidadeChuvaHorario: hourProbability,
      probabilidadeChuvaDia: dayProbability,
      chuvaHorarioMm: hourRain,
      chuvaDiaMm: dayRain,
      horasComChuvaDia: hoursWithRain,
      temperaturaHorario: numberOrNull(data.hourly.temperature_2m?.[hourlyIndex]),
      sensacaoTermicaHorario: numberOrNull(data.hourly.apparent_temperature?.[hourlyIndex]),
      ventoHorarioKmH: numberOrNull(data.hourly.wind_speed_10m?.[hourlyIndex]),
      temperaturaMinDia: numberOrNull(data.daily.temperature_2m_min?.[dailyIndex]),
      temperaturaMaxDia: numberOrNull(data.daily.temperature_2m_max?.[dailyIndex]),
      ventoMaxDiaKmH: numberOrNull(data.daily.wind_speed_10m_max?.[dailyIndex]),
      codigoTempoHorario,
      codigoTempoDia,
      condicaoTempo: describeWeatherCode(codigoTempoHorario ?? codigoTempoDia),
      ...risk
    };
  }
}

module.exports = new PrevisaoTempoService();
