import { useEffect, useState } from 'react'
import { X, Send, MessageCircle, Bell, CheckCircle2 } from 'lucide-react'
import { statusLabels } from '../../utils/estadoAsignacion'

/* Recordatorio a quien se está quedando atrás. Es un componente y no un bloque dentro de
   Seguimiento porque se dispara desde dos lugares —la lista y la ficha de la persona— y el
   mensaje que se propone por defecto tiene que ser el mismo en los dos. */

function mensajePorDefecto(a) {
  return `Hola ${a.nombre.split(' ')[0]}, notamos que tu onboarding "${a.ruta}" está ${statusLabels[a.status].toLowerCase()} (día ${a.dia}/${a.totalDias}). ¿Necesitas ayuda para ponerte al día? Cualquier duda, escríbenos.`
}

const CANALES = [
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
  { key: 'plataforma', label: 'Notificación en plataforma', icon: Bell, color: '#3b82f6' },
]

export default function EnviarRecordatorioModal({ asignacion, onClose, onEnviar }) {
  const [canal, setCanal] = useState('whatsapp')
  const [mensaje, setMensaje] = useState(() => mensajePorDefecto(asignacion))
  const [enviado, setEnviado] = useState(false)

  // El acuse se queda un momento a la vista y recién ahí se cierra solo: cerrar de golpe
  // deja la duda de si se envió.
  useEffect(() => {
    if (!enviado) return
    const t = setTimeout(onClose, 1200)
    return () => clearTimeout(t)
  }, [enviado, onClose])

  function enviar() {
    onEnviar(canal, mensaje)
    setEnviado(true)
  }

  return (
    <div className="pl-overlay" onClick={onClose}>
      <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="pl-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={16} style={{ color: '#fff' }} />
            </div>
            <h2>Enviar recordatorio</h2>
          </div>
          <button className="pl-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="pl-modal-body">
          {enviado ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 0' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={24} style={{ color: 'var(--green)' }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)' }}>Recordatorio enviado</div>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px' }}>
                Para <strong style={{ color: 'var(--text-heading)' }}>{asignacion.nombre}</strong> — {asignacion.ruta}
              </p>
              <div className="pl-label">
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-heading)' }}>Canal</span>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {CANALES.map(c => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setCanal(c.key)}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '10px 12px', borderRadius: 10,
                        border: `1.5px solid ${canal === c.key ? c.color : 'var(--border-soft)'}`,
                        background: canal === c.key ? `${c.color}0f` : 'var(--surface-card)',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all .12s',
                      }}
                    >
                      <c.icon size={16} style={{ color: canal === c.key ? c.color : 'var(--icon-muted)' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: canal === c.key ? c.color : 'var(--text-muted)' }}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <label className="pl-label" style={{ marginTop: 14 }}>
                Mensaje
                <textarea
                  className="pl-input"
                  rows={4}
                  value={mensaje}
                  onChange={e => setMensaje(e.target.value)}
                  style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                />
              </label>
            </>
          )}
        </div>

        {!enviado && (
          <div className="pl-modal-footer">
            <button className="pl-btn-cancel" onClick={onClose}>Cancelar</button>
            <button
              className="pl-btn-save"
              disabled={!mensaje.trim()}
              onClick={enviar}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Send size={13} />
              Enviar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
