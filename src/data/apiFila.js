// Cliente para a API de Fila de Atendimento UBS/UPA (Mock)
// Base URL: https://zerofilas-fpfwckceggbxfpcs.brazilsouth-01.azurewebsites.net/api/

export const API_BASE_URL =
  'https://zerofilas-fpfwckceggbxfpcs.brazilsouth-01.azurewebsites.net/api/'

export const UNIDADE_ID = 'ubs-01'

/**
 * GET /fila/{unidadeId}/pacientes
 * Retorna a lista de pacientes aguardando na unidade.
 */
export async function fetchPacientes(unidadeId = UNIDADE_ID) {
  const res = await fetch(`${API_BASE_URL}fila/${unidadeId}/pacientes`)
  if (!res.ok) {
    const erro = await res.json().catch(() => ({}))
    throw new Error(erro.mensagem || 'Erro ao carregar a fila de pacientes.')
  }
  return res.json()
}

/**
 * POST /fila/{unidadeId}/chamar-proximo
 * Chama o próximo paciente da fila, respeitando a prioridade.
 * Em ambiente mock, retorna o paciente selecionado sem persistir.
 */
export async function chamarProximo(unidadeId = UNIDADE_ID) {
  const res = await fetch(`${API_BASE_URL}fila/${unidadeId}/chamar-proximo`, {
    method: 'POST',
  })
  if (!res.ok) {
    const erro = await res.json().catch(() => ({}))
    throw new Error(erro.mensagem || 'Erro ao chamar próximo paciente.')
  }
  return res.json()
}
