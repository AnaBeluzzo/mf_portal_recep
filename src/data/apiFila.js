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

function lerErroApi(res) {
  return res.json().catch(() => ({}))
}

/**
 * PUT /fila/{unidadeId}/pacientes/{pacienteId}
 * Altera nome e/ou prioridade de um paciente da fila.
 */
export async function alterarPaciente(
  unidadeId = UNIDADE_ID,
  pacienteId,
  dados = {},
) {
  if (!pacienteId) {
    throw new Error('Identificador do paciente é obrigatório.')
  }

  const res = await fetch(
    `${API_BASE_URL}fila/${unidadeId}/pacientes/${pacienteId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    },
  )

  if (!res.ok) {
    const erro = await lerErroApi(res)
    throw new Error(erro.mensagem || 'Erro ao alterar paciente.')
  }

  return res.json()
}

/**
 * DELETE /fila/{unidadeId}/pacientes/{pacienteId}
 * Remove um paciente da fila da unidade informada.
 */
export async function removerPaciente(unidadeId = UNIDADE_ID, pacienteId) {
  if (!pacienteId) {
    throw new Error('Identificador do paciente é obrigatório.')
  }

  const res = await fetch(
    `${API_BASE_URL}fila/${unidadeId}/pacientes/${pacienteId}`,
    {
      method: 'DELETE',
    },
  )

  if (!res.ok) {
    const erro = await lerErroApi(res)
    throw new Error(erro.mensagem || 'Erro ao remover paciente.')
  }

  return res.json()
}
