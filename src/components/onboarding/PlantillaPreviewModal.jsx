import { useState } from 'react'
import { Eye, X, Layers, ListChecks } from 'lucide-react'
import { useConfig } from '../../context/ConfigContext'
import { RutaPath, TaskPreviewModal } from './RutaPreviewModal'

export default function PlantillaPreviewModal({ plantilla, onClose, onUseTemplate }) {
  const { gamificacion } = useConfig()
  const [activeTask, setActiveTask] = useState(null)
  const etapas = plantilla.etapasData || []
  const allTareas = etapas.flatMap(e => e.actividades.flatMap(a => a.tareas))
  const totalPuntos = allTareas.reduce((s, t) => s + (t.puntos || 0), 0)

  return (
    <>
      <div className="pl-overlay" onClick={onClose}>
        <div
          className="pl-modal"
          style={{ width: 960, maxWidth: '96vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* HEADER ÚNICO */}
          <div className="pl-modal-header" style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Eye size={16} style={{ color: '#fff' }} />
              </div>
              <h2>Vista previa</h2>
            </div>
            <button className="pl-modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            {/* IZQUIERDA: vista previa de la ruta */}
            <div style={{
              flex: '1 1 58%', minWidth: 0, display: 'flex', flexDirection: 'column',
              background: 'linear-gradient(180deg, #f0f4f8 0%, #e8eef4 100%)',
              borderRight: '1px solid #e2e8f0',
            }}>
              <div style={{ overflowY: 'auto', flex: 1, padding: '24px 0' }}>
                <RutaPath etapas={etapas} gamificacion={gamificacion} onSelectTask={setActiveTask} />
              </div>
            </div>

            {/* DERECHA: info + acción */}
            <div style={{ flex: '1 1 42%', minWidth: 300, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0C2D40', margin: '0 0 8px' }}>{plantilla.name}</h2>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: '0 0 20px' }}>{plantilla.descripcion}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10.5, fontWeight: 600, color: '#94a3b8', marginBottom: 20 }}>
                  Creado por:
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 10, fontWeight: 700, color: '#6d28d9',
                    background: '#f5f3ff', padding: '3px 9px', borderRadius: 20,
                  }}>
                    SoulyHR
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '10px 12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                      <Layers size={12} style={{ color: '#94a3b8' }} />
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Etapas</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0C2D40' }}>{etapas.length}</div>
                  </div>
                  <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '10px 12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                      <ListChecks size={12} style={{ color: '#94a3b8' }} />
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Tareas</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0C2D40' }}>{allTareas.length}</div>
                  </div>
                  {gamificacion && (
                    <div style={{ flex: 1, background: '#fffbeb', borderRadius: 10, padding: '10px 12px', border: '1px solid #fde68a' }}>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: '#b45309', textTransform: 'uppercase', marginBottom: 3 }}>Puntos</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#92400e' }}>{totalPuntos}</div>
                    </div>
                  )}
                </div>

                <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6, background: '#f8fafc', borderRadius: 10, padding: '10px 12px' }}>
                  Al personalizar esta plantilla se crea tu propia copia editable — la original de SoulyHR no se modifica.
                </div>
              </div>

              <div className="pl-modal-footer">
                <button className="pl-btn-cancel" onClick={onClose}>Cancelar</button>
                <button className="pl-btn-save" onClick={onUseTemplate}>Personalizar esta plantilla</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeTask && (
        <TaskPreviewModal task={activeTask} onClose={() => setActiveTask(null)} />
      )}
    </>
  )
}
