import { Pause, Play } from 'lucide-react'

/* Confirmación de pausar/reanudar un onboarding. Es un componente porque la acción se dispara
   desde dos lugares —el menú del listado y la ficha de la persona— y el aviso tiene que ser el
   mismo en ambos. `asignacion.status === 'pausado'` decide si el modal reanuda o pausa. */
export default function PausarOnboardingModal({ asignacion, onClose, onConfirm }) {
  const pausado = asignacion.status === 'pausado'
  return (
    <div className="pl-overlay" onClick={onClose}>
      <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="pl-modal-body" style={{ textAlign: 'center', padding: '32px 28px 20px' }}>
          <div className="pl-del-icon" style={{ background: 'rgba(59,130,246,.1)', color: 'var(--blue)' }}>
            {pausado ? <Play size={26} /> : <Pause size={26} />}
          </div>
          <h2 className="pl-del-title">{pausado ? 'Reanudar onboarding' : 'Pausar onboarding'}</h2>
          <p className="pl-del-desc">
            {pausado
              ? <>¿Reanudar el onboarding de <strong>{asignacion.nombre}</strong>? Continuará desde donde lo dejó.</>
              : <>¿Pausar el onboarding de <strong>{asignacion.nombre}</strong>? Podrás reanudarlo cuando quieras.</>}
          </p>
        </div>
        <div className="pl-modal-footer" style={{ justifyContent: 'center' }}>
          <button className="pl-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="pl-btn-save" onClick={onConfirm}>
            {pausado ? 'Reanudar' : 'Pausar'}
          </button>
        </div>
      </div>
    </div>
  )
}
