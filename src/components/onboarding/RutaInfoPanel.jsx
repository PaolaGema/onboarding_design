import { useState } from 'react'
import { X, User, Tag, Clock, CalendarPlus, UserRound, ChevronDown, UserPlus } from 'lucide-react'
import { tiposTarea, tipoMap } from '../../utils/tareaTipos'

const hoyFecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function RutaInfoPanel({ plantilla, responsables, equipo = [], canManage = false, onAddPersona, onRemovePersona, onClose }) {
  const [infoAbierta, setInfoAbierta] = useState(true)
  const [showPicker, setShowPicker] = useState(false)
  const etapas = plantilla.etapasData || []
  const allTareas = etapas.flatMap(e => e.actividades.flatMap(a => a.tareas))
  const tipo = plantilla.esGlobal ? 'Ruta base' : `Ruta de ${plantilla.area}`

  return (
    <div style={{
      width: 340, flexShrink: 0, alignSelf: 'flex-start',
      position: 'sticky', top: 0, maxHeight: 'calc(100vh - 20px)',
      background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
      boxShadow: '0 4px 20px rgba(12,45,64,.08)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{plantilla.name}</span>
        <button
          onClick={onClose}
          style={{ width: 26, height: 26, borderRadius: 7, border: 'none', background: 'var(--surface-hover)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 8 }}
        >
          <X size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: 16 }}>
        {/* MINIATURA */}
        <div style={{
          borderRadius: 12, aspectRatio: '16 / 10', marginBottom: 18,
          background: `linear-gradient(135deg, ${plantilla.color}dd 0%, #0C2D40 100%)`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', padding: '0 16px',
        }}>
          {allTareas.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'hidden', flexWrap: 'wrap', rowGap: 8 }}>
              {allTareas.slice(0, 10).map(t => {
                const tp = tipoMap[t.tipo] || tiposTarea[0]
                const TpIcon = tp.icon
                return (
                  <div key={t.id} title={t.name} style={{
                    width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,.16)',
                    border: '1.5px solid rgba(255,255,255,.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <TpIcon size={13} style={{ color: '#fff' }} />
                  </div>
                )
              })}
              {allTareas.length > 10 && (
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.8)' }}>+{allTareas.length - 10}</span>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', fontStyle: 'italic', textAlign: 'center' }}>Sin tareas aún</div>
          )}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '20px 12px 10px', background: 'linear-gradient(0deg, rgba(0,0,0,.5) 0%, transparent 100%)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{etapas.length} etapas · {allTareas.length} tareas</div>
          </div>
        </div>

        {/* PERSONAS CON ACCESO */}
        <div style={{ marginBottom: 18, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40' }}>Personas con acceso</span>
            {canManage && (
              <button
                onClick={() => setShowPicker(!showPicker)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  fontSize: 10.5, fontWeight: 600, color: '#3b82f6',
                  background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <UserPlus size={12} /> Agregar
              </button>
            )}
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 10, marginTop: -6 }}>Pueden editar etapas y tareas de esta ruta</div>

          {responsables.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {responsables.map(r => (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontSize: 9.5, fontWeight: 700 }}>{r.initials}</span>
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                    <div style={{ fontSize: 9.5, color: '#94a3b8' }}>{r.role || r.cargo}</div>
                  </div>
                  {canManage && r.role !== 'Líder de área' && (
                    <button
                      onClick={() => onRemovePersona(r.name)}
                      style={{
                        width: 18, height: 18, borderRadius: '50%', border: 'none',
                        background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <X size={10} style={{ color: '#94a3b8' }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
              <UserRound size={13} /> Sin responsables asignados aún
            </div>
          )}

          {showPicker && (
            <div style={{
              marginTop: 8, padding: 6, borderRadius: 10,
              background: '#fff', border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,.08)',
            }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: '#94a3b8', marginBottom: 4, padding: '0 4px' }}>Agregar acceso</div>
              {equipo.filter(e => !responsables.find(r => r.name === e.name)).map(e => (
                <button
                  key={e.name}
                  onClick={() => { onAddPersona(e); setShowPicker(false) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 6px', border: 'none', borderRadius: 8,
                    background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: 'left', transition: 'background .1s',
                  }}
                  onMouseEnter={ev => ev.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: e.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontSize: 8, fontWeight: 700 }}>{e.initials}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: '#334155' }}>{e.name}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{e.cargo}</div>
                  </div>
                </button>
              ))}
              {equipo.filter(e => !responsables.find(r => r.name === e.name)).length === 0 && (
                <div style={{ fontSize: 9.5, color: 'var(--text-muted)', padding: '6px 4px', textAlign: 'center' }}>Todos con acceso</div>
              )}
            </div>
          )}
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
                  <span style={{ color: '#334155', fontWeight: 600 }}>{tipo}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <User size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <div style={{ fontSize: 11.5 }}>
                  <span style={{ color: '#94a3b8' }}>Titular: </span>
                  <span style={{ color: '#334155', fontWeight: 600 }}>{plantilla.creador || 'Administrador'}</span>
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
    </div>
  )
}
