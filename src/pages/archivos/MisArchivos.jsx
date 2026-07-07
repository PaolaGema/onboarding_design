import { useNavigate } from 'react-router-dom'
import { Rocket, UserRound, MessageCircleMore, ClipboardCheck } from 'lucide-react'
import { useOnboardingData } from '../../context/OnboardingDataContext'

const folders = [
  { key: 'onboarding', label: 'Onboarding', icon: Rocket, path: '/archivos/onboarding' },
  { key: 'personas', label: 'Gestión de personas', icon: UserRound, path: '/archivos/personas' },
  { key: 'comunicacion', label: 'Comunicación', icon: MessageCircleMore, path: '/archivos/comunicacion' },
  { key: 'evaluacion', label: 'Evaluación', icon: ClipboardCheck, path: '/archivos/evaluacion' },
]

export default function MisArchivos() {
  const navigate = useNavigate()
  const { recursos, recursosPersonas, recursosComunicacion, recursosEvaluacion } = useOnboardingData()

  const countByKey = {
    onboarding: recursos,
    personas: recursosPersonas,
    comunicacion: recursosComunicacion,
    evaluacion: recursosEvaluacion,
  }

  return (
    <div className="content-scroll">
      <div className="pl-header">
        <div>
          <h1 className="pl-title">Mis archivos</h1>
          <p className="pl-subtitle">Todos los archivos de la empresa, organizados por módulo.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {folders.map(f => {
          const Icon = f.icon
          const count = countByKey[f.key].reduce((sum, cat) => sum + cat.docs.length, 0)
          return (
            <button
              key={f.key}
              onClick={() => navigate(f.path)}
              style={{
                textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer',
                background: 'var(--surface-card)', borderRadius: 16,
                border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-card)',
                padding: 20, transition: 'all .15s',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, marginBottom: 14,
                background: '#0C2D40', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {count} archivo{count === 1 ? '' : 's'}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
