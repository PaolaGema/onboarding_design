import { useState } from 'react'
import { Eye, X, User, Tag, Clock, CalendarPlus, ChevronDown, Plus, UserRound, Pencil, Search, Check } from 'lucide-react'
import { useConfig } from '../../context/ConfigContext'
import { useUser } from '../../context/UserContext'
import { colaboradoresData } from '../../pages/personas/Colaboradores'
import { RutaPath, TaskPreviewModal } from './RutaPreviewModal'

const hoyFecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
}

export default function RutaFullPreviewModal({ plantilla, responsables, canManage = false, onAddPersona, onRemovePersona, onClose, canEdit = false, onEdit }) {
  const { gamificacion } = useConfig()
  const { currentUser } = useUser()
  const [activeTask, setActiveTask] = useState(null)
  const [infoAbierta, setInfoAbierta] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addSearch, setAddSearch] = useState('')
  const [selectedToAdd, setSelectedToAdd] = useState([])
  const etapas = plantilla.etapasData || []
  const titular = plantilla.creador || currentUser.name
  const titularRole = plantilla.creador ? plantilla.creadorRole : currentUser.roleLabel

  function openAddModal() {
    setAddSearch('')
    setSelectedToAdd([])
    setShowAddModal(true)
  }

  function toggleSelected(name) {
    setSelectedToAdd(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  function confirmAdd() {
    colaboradoresData
      .filter(c => selectedToAdd.includes(c.name))
      .forEach(c => onAddPersona({ name: c.name, initials: c.initials, color: c.color, cargo: c.cargo }))
    setShowAddModal(false)
  }

  const disponibles = colaboradoresData.filter(c =>
    c.name !== titular &&
    !responsables.find(r => r.name === c.name) &&
    c.name.toLowerCase().includes(addSearch.toLowerCase())
  )

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

            {/* DERECHA: info */}
            <div style={{ flex: '1 1 42%', minWidth: 300, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0C2D40', margin: '0 0 8px' }}>{plantilla.name}</h2>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: '0 0 20px' }}>{plantilla.descripcion || 'Sin descripción'}</p>

                {/* PERSONAS CON ACCESO */}
                <div style={{ marginBottom: 20, position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40' }}>Personas con acceso</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 10 }}>Pueden editar etapas y tareas de esta ruta</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div
                      title={`${titular} · Titular`}
                      style={{
                        width: 34, height: 34, borderRadius: '50%', background: '#0C2D40',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        boxShadow: '0 0 0 2px #fff, 0 0 0 3px #e2e8f0',
                      }}
                    >
                      <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{getInitials(titular)}</span>
                    </div>

                    {responsables.map(r => (
                      <div key={r.name} style={{ position: 'relative' }}>
                        <div
                          title={`${r.name} · ${r.role || r.cargo}`}
                          style={{
                            width: 34, height: 34, borderRadius: '50%', background: r.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            boxShadow: '0 0 0 2px #fff, 0 0 0 3px #e2e8f0',
                          }}
                        >
                          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{r.initials}</span>
                        </div>
                        {canManage && r.role !== 'Líder de área' && (
                          <button
                            onClick={() => onRemovePersona(r.name)}
                            title={`Quitar a ${r.name}`}
                            style={{
                              position: 'absolute', top: -3, right: -3, width: 16, height: 16, borderRadius: '50%',
                              border: '1.5px solid #fff', background: '#94a3b8', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                            }}
                          >
                            <X size={9} style={{ color: '#fff' }} />
                          </button>
                        )}
                      </div>
                    ))}

                    {canManage && (
                      <button
                        onClick={openAddModal}
                        title="Agregar personas"
                        style={{
                          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                          border: '1.5px dashed #cbd5e1', background: '#f8fafc', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Plus size={15} style={{ color: '#94a3b8' }} />
                      </button>
                    )}
                    {!canManage && responsables.length === 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
                        <UserRound size={13} /> Sin responsables asignados aún
                      </span>
                    )}
                  </div>
                </div>

                {/* INFORMACIÓN (colapsable) */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                  <button
                    onClick={() => setInfoAbierta(!infoAbierta)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginBottom: infoAbierta ? 12 : 0,
                      fontFamily: 'inherit',
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40' }}>Información</span>
                    <ChevronDown size={14} style={{ color: '#94a3b8', transform: infoAbierta ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
                  </button>

                  {infoAbierta && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Tag size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                        <div style={{ fontSize: 11.5 }}>
                          <span style={{ color: '#94a3b8' }}>Tipo: </span>
                          <span style={{ color: '#334155', fontWeight: 600 }}>{plantilla.tipo || 'Onboarding'}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <User size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                        <div style={{ fontSize: 11.5 }}>
                          <span style={{ color: '#94a3b8' }}>Titular: </span>
                          <span style={{ color: '#334155', fontWeight: 600 }}>
                            {titular}{titularRole ? `: ${titularRole}` : ''}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Clock size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                        <div style={{ fontSize: 11.5 }}>
                          <span style={{ color: '#94a3b8' }}>Fecha de modificación: </span>
                          <span style={{ color: '#334155', fontWeight: 600 }}>{plantilla.updatedFecha || hoyFecha}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CalendarPlus size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                        <div style={{ fontSize: 11.5 }}>
                          <span style={{ color: '#94a3b8' }}>Fecha de creación: </span>
                          <span style={{ color: '#334155', fontWeight: 600 }}>{plantilla.creadoEl || plantilla.updatedFecha || hoyFecha}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pl-modal-footer">
                <button className="pl-btn-cancel" onClick={onClose}>Cerrar</button>
                {canEdit && (
                  <button className="pl-btn-save" onClick={onEdit} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Pencil size={13} /> Editar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeTask && (
        <TaskPreviewModal task={activeTask} onClose={() => setActiveTask(null)} />
      )}

      {showAddModal && (
        <div className="pl-overlay" style={{ zIndex: 1300 }} onClick={() => setShowAddModal(false)}>
          <div className="pl-modal" style={{ width: 440, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="pl-modal-header">
              <h2>Agregar personas con acceso</h2>
              <button className="pl-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '16px 24px 0' }}>
              <div className="pl-search-wrap" style={{ maxWidth: 'none' }}>
                <Search size={13} className="pl-search-ico" />
                <input
                  type="text"
                  className="pl-search"
                  placeholder="Buscar colaborador por nombre…"
                  value={addSearch}
                  onChange={e => setAddSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div style={{ padding: '12px 16px 16px', overflowY: 'auto', flex: 1 }}>
              {disponibles.map(c => {
                const checked = selectedToAdd.includes(c.name)
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleSelected(c.name)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', border: 'none', borderRadius: 9,
                      background: checked ? 'var(--green-tint)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                      textAlign: 'left', transition: 'background .1s',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      border: checked ? 'none' : '1.5px solid #cbd5e1',
                      background: checked ? 'var(--navy)' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {checked && <Check size={12} style={{ color: '#fff' }} />}
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{c.initials}</span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.cargo} · {c.depto}</div>
                    </div>
                  </button>
                )
              })}
              {disponibles.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '20px 4px', textAlign: 'center' }}>
                  {addSearch ? 'Sin resultados' : 'Todos los colaboradores ya tienen acceso'}
                </div>
              )}
            </div>
            <div className="pl-modal-footer">
              <button className="pl-btn-cancel" onClick={() => setShowAddModal(false)}>Cancelar</button>
              <button className="pl-btn-save" disabled={selectedToAdd.length === 0} onClick={confirmAdd}>
                Agregar{selectedToAdd.length > 0 ? ` (${selectedToAdd.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
