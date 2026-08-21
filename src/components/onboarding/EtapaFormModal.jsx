import { useState } from 'react'
import { Pencil, Plus, X } from 'lucide-react'

/* Alta y edición de una etapa: nombre y duración, nada más.

   Era el mismo formulario escrito dos veces, un modal para crear y otro para editar, y la
   versión de alta repetía además su lógica de creación completa en el botón y en la tecla
   Enter —el mismo bloque de quince líneas, dos veces—. Tocar cualquier cosa ahí pedía
   acordarse de tres lugares, y bastaba con olvidar uno para que crear con Enter y crear con
   el botón dejaran de hacer lo mismo.

   El borrador vive aquí adentro. El constructor no necesita seguir cada tecla: lo que quiere
   saber es el resultado, y lo recibe una vez, ya limpio. */
export default function EtapaFormModal({ modo = 'crear', valorInicial, onGuardar, onCerrar }) {
  const crear = modo === 'crear'
  const [name, setName] = useState(valorInicial?.name || '')
  const [days, setDays] = useState(valorInicial?.days || 7)

  const puedeGuardar = !!name.trim()
  function guardar() {
    if (!puedeGuardar) return
    onGuardar({ name: name.trim(), days: Math.max(1, Number(days) || 1) })
  }

  return (
    <div className="pl-overlay" onClick={onCerrar}>
      <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="pl-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {crear ? <Plus size={16} style={{ color: '#fff' }} /> : <Pencil size={15} style={{ color: '#fff' }} />}
            </div>
            <h2>{crear ? 'Nueva etapa' : 'Editar etapa'}</h2>
          </div>
          <button className="pl-modal-close" onClick={onCerrar}>
            <X size={18} />
          </button>
        </div>

        <div className="pl-modal-body">
          <label className="pl-label">
            Nombre de la etapa
            <input
              type="text"
              className="pl-input"
              placeholder={crear ? 'Ej: Mi primera semana, Conoce el área...' : undefined}
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              /* Enter confirma, como el botón: son dos campos y obligar a bajar el mouse para
                 cerrar un formulario de dos campos es fricción sin motivo. */
              onKeyDown={e => { if (e.key === 'Enter') guardar() }}
            />
          </label>
          <label className="pl-label">
            Duración (días)
            <input
              type="number"
              className="pl-input"
              min="1"
              value={days}
              onChange={e => setDays(Math.max(1, Number(e.target.value)))}
            />
          </label>
          {crear && (
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: -4 }}>
              Define cuántos días dura esta etapa dentro de la ruta de onboarding.
            </div>
          )}
        </div>

        <div className="pl-modal-footer">
          <button className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
          <button className="pl-btn-save" disabled={!puedeGuardar} onClick={guardar}>
            {crear ? 'Crear etapa' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
