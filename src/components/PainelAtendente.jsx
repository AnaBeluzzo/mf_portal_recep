import { useState, useEffect, useCallback } from 'react'
import {
  fetchPacientes,
  chamarProximo,
  alterarPaciente,
  removerPaciente,
  UNIDADE_ID,
} from '../data/apiFila.js'
import './PainelAtendente.css'

const PRIORIDADE_LABEL = {
  normal: 'Normal',
  urgente: 'Urgente',
}

function formatarHorario(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PainelAtendente() {
  const [fila, setFila] = useState([])
  const [chamado, setChamado] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [chamando, setChamando] = useState(false)
  const [atualizandoId, setAtualizandoId] = useState(null)
  const [removendoId, setRemovendoId] = useState(null)

  const carregarFila = useCallback(async () => {
    setLoading(true)
    setErro(null)
    try {
      const pacientes = await fetchPacientes(UNIDADE_ID)
      setFila(pacientes)
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarFila()
  }, [carregarFila])

  const ordenados = [...fila].sort((a, b) => {
    if (a.prioridade !== b.prioridade) {
      return a.prioridade === 'urgente' ? -1 : 1
    }
    return new Date(a.horarioChegada) - new Date(b.horarioChegada)
  })

  const handleChamarProximo = useCallback(async () => {
    setChamando(true)
    setErro(null)
    try {
      const paciente = await chamarProximo(UNIDADE_ID)
      setChamado(paciente)
      setFila((prev) => prev.filter((p) => p.id !== paciente.id))
    } catch (e) {
      setErro(e.message)
    } finally {
      setChamando(false)
    }
  }, [])

  const handleAlterarPrioridade = useCallback(async (pacienteId, prioridade) => {
    setAtualizandoId(pacienteId)
    setErro(null)
    try {
      const pacienteAtualizado = await alterarPaciente(UNIDADE_ID, pacienteId, {
        prioridade,
      })

      setFila((prev) =>
        prev.map((paciente) =>
          paciente.id === pacienteId
            ? { ...paciente, ...pacienteAtualizado }
            : paciente,
        ),
      )
    } catch (e) {
      setErro(e.message)
    } finally {
      setAtualizandoId(null)
    }
  }, [])

  const handleRemoverPaciente = useCallback(async (pacienteId) => {
    setRemovendoId(pacienteId)
    setErro(null)
    try {
      await removerPaciente(UNIDADE_ID, pacienteId)
      setFila((prev) => prev.filter((paciente) => paciente.id !== pacienteId))
      if (chamado && chamado.id === pacienteId) {
        setChamado(null)
      }
    } catch (e) {
      setErro(e.message)
    } finally {
      setRemovendoId(null)
    }
  }, [chamado])

  const aguardando = fila.length

  return (
    <div className="painel-container">
      <header className="painel-header">
        <div className="painel-header-left">
          <span className="painel-icon" aria-hidden="true">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />
            </svg>
          </span>
          <div>
            <h1 className="painel-title">Painel do Atendente</h1>
            <p className="painel-subtitle">UBS Jardim das Flores</p>
          </div>
        </div>
        <div className={`painel-counter ${aguardando === 0 ? 'is-zero' : ''}`}>
          <span className="counter-number">
            {loading ? '–' : aguardando}
          </span>
          <span className="counter-label">
            {aguardando === 1 ? 'paciente aguardando' : 'pacientes aguardando'}
          </span>
        </div>
      </header>

      {erro && (
        <div className="erro-banner" role="alert">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{erro}</span>
          <button className="erro-retry" onClick={carregarFila}>
            Tentar novamente
          </button>
        </div>
      )}

      {chamado && (
        <div className="chamada-banner" role="status" aria-live="polite">
          <div className="chamada-banner-content">
            <span className="chamada-label">Chamando agora</span>
            <span className="chamada-nome">{chamado.nome}</span>
            <span
              className={`chamada-prioridade prioridade-badge ${chamado.prioridade}`}
            >
              {PRIORIDADE_LABEL[chamado.prioridade]}
            </span>
          </div>
        </div>
      )}

      <div className="painel-actions">
        <button
          className="btn-chamar"
          onClick={handleChamarProximo}
          disabled={aguardando === 0 || chamando || loading}
        >
          {chamando ? (
            <span className="spinner" aria-hidden="true" />
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          )}
          {chamando
            ? 'Chamando...'
            : aguardando === 0
              ? 'Fila vazia'
              : 'Chamar próximo'}
        </button>
      </div>

      <div className="painel-table-wrapper">
        {loading ? (
          <div className="loading-state">
            <span className="spinner spinner-lg" />
            <span>Carregando fila...</span>
          </div>
        ) : (
          <table className="painel-table">
            <thead>
              <tr>
                <th>Pos.</th>
                <th>Paciente</th>
                <th>Horário de chegada</th>
                <th>Prioridade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ordenados.length === 0 ? (
                <tr className="fila-vazia-row">
                  <td colSpan={5}>
                    <div className="fila-vazia">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <span>Nenhum paciente na fila</span>
                    </div>
                  </td>
                </tr>
              ) : (
                ordenados.map((pac, idx) => (
                  <tr
                    key={pac.id}
                    className={idx === 0 ? 'proximo-da-fila' : ''}
                  >
                    <td className="td-pos">{idx + 1}</td>
                    <td className="td-nome">{pac.nome}</td>
                    <td className="td-horario">
                      {formatarHorario(pac.horarioChegada)}
                    </td>
                    <td className="td-prioridade">
                      <div className="prioridade-editor">
                        <span className={`prioridade-badge ${pac.prioridade}`}>
                          {PRIORIDADE_LABEL[pac.prioridade]}
                        </span>
                        <button
                          type="button"
                          className={`btn-status-toggle ${pac.prioridade}`}
                          onClick={() =>
                            handleAlterarPrioridade(
                              pac.id,
                              pac.prioridade === 'urgente' ? 'normal' : 'urgente',
                            )
                          }
                          disabled={atualizandoId === pac.id || chamando || loading}
                          aria-label={`Trocar prioridade de ${pac.nome}`}
                        >
                          {atualizandoId === pac.id
                            ? 'Atualizando...'
                            : pac.prioridade === 'urgente'
                              ? 'Marcar como normal'
                              : 'Marcar como urgente'}
                        </button>
                      </div>
                    </td>
                    <td className="td-acoes">
                      <button
                        type="button"
                        className="btn-remover"
                        onClick={() => handleRemoverPaciente(pac.id)}
                        disabled={
                          removendoId === pac.id ||
                          atualizandoId === pac.id ||
                          chamando ||
                          loading
                        }
                      >
                        {removendoId === pac.id ? 'Removendo...' : 'Remover'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
