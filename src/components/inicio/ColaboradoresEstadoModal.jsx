import { useNavigate } from 'react-router-dom'
import { X, ArrowRight } from 'lucide-react'
import { avatarUrl } from '../../utils/calendarEvents'

export default function ColaboradoresEstadoModal({ estado, label, color, area, colaboradores, onClose }) {
  const navigate = useNavigate()

  return (
    <div className="pl-overlay" onClick={onClose}>
      <div className="pl-modal" style={{ width: 460, maxWidth: '92vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="pl-modal-header">
          <div>
            <h2 style={{ margin: 0, fontSize: 15 }}>{label} <span style={{ opacity: .6 }}>· {colaboradores.length}</span></h2>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
              {area === 'todas' ? 'Todas las áreas' : area}
            </span>
          </div>
          <button className="pl-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 18px' }}>
          {colaboradores.map(c => (
            <div key={c.id} className="alert-item">
              <div className="ai-av">
                <img src={avatarUrl(c.nombre)} alt={c.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none' }} />
              </div>
              <div className="ai-info">
                <div className="ai-name">{c.nombre}</div>
                <div className="ai-sub">{c.cargo} · {c.area}</div>
              </div>
              <span className="badge" style={{ background: `${color}18`, color }}>
                {estado === 'inactivo' && c.fechaBaja ? `Baja ${c.fechaBaja}` : `Desde ${c.fechaIngreso}`}
              </span>
            </div>
          ))}
        </div>

        <div className="pl-modal-footer">
          <button className="pl-btn-cancel" onClick={onClose}>Cerrar</button>
          <button
            className="pl-btn-save"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => navigate('/personas/colaboradores')}
          >
            Ver en Colaboradores
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
