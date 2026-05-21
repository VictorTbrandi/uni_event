import { EmissaoEventoResultado } from '@/services/certificadoService'

const plural = (valor: number, singular: string, pluralText: string) => {
  return valor === 1 ? singular : pluralText
}

export const mensagemEmissaoCertificados = (resultado: EmissaoEventoResultado) => {
  const total = Number(resultado.totalInscritos || 0)
  const emitidos = Number(resultado.emitidos || 0)
  const existentes = Number(resultado.existentes || 0)

  if (total === 0) {
    return 'Nenhum certificado foi emitido porque o evento nao possui participantes ativos.'
  }

  if (emitidos > 0 && existentes > 0) {
    return `${emitidos} ${plural(emitidos, 'novo certificado foi emitido', 'novos certificados foram emitidos')}. ${existentes} ${plural(existentes, 'participante ja tinha certificado', 'participantes ja tinham certificado')}.`
  }

  if (emitidos > 0) {
    return `${emitidos} ${plural(emitidos, 'certificado foi emitido', 'certificados foram emitidos')} com sucesso.`
  }

  if (existentes === total) {
    return `Nenhum novo certificado foi emitido. Todos os ${total} ${plural(total, 'participante ativo ja possui', 'participantes ativos ja possuem')} certificado.`
  }

  return 'Nenhum novo certificado foi emitido. Verifique se os participantes ativos ja possuem certificado.'
}
