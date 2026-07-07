import { useState } from 'react'
import { Eye, X, Pencil, HelpCircle, Info, Video, Headphones, FileText, Upload, UserCheck, ChevronDown } from 'lucide-react'
import { useConfig } from '../../context/ConfigContext'
import { tiposTarea, tipoMap, toEmbedUrl } from '../../utils/tareaTipos'

const PERFIL_TABS = [
  { key: 'personales', label: 'Datos personales' },
  { key: 'laboral', label: 'Información laboral' },
  { key: 'preferencias', label: 'Preferencias personales' },
  { key: 'documentacion', label: 'Documentación' },
]

const PERFIL_SECCIONES = {
  personales: ['Datos de acceso', 'Datos de documento de identidad', 'Datos personales', 'Datos de residencia', 'Contactos de emergencia', 'Datos personales de salud'],
  laboral: ['Datos laborales básicos', 'Datos de contrato', 'Datos de pago'],
  preferencias: ['Uniforme', 'Lista de deseos para cumpleaños', 'Habilidades'],
}

function PerfilPreviewTabs() {
  const [tab, setTab] = useState('personales')
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
      <div style={{ display: 'flex', background: '#f1f5f9', overflowX: 'auto' }}>
        {PERFIL_TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              flex: '1 0 auto', padding: '10px 10px', fontSize: 10.5, fontWeight: 700,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              background: tab === t.key ? '#0C2D40' : 'transparent',
              color: tab === t.key ? '#fff' : '#64748b',
              textAlign: 'center',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ padding: 14 }}>
        {tab === 'documentacion' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>Documentos cargados en el sistema</div>
            {['Foto del empleado', 'Contrato', 'Documento de identidad'].map(d => (
              <div key={d} style={{ border: '1.5px dashed #cbd5e1', borderRadius: 10, padding: 14, textAlign: 'center', background: '#f8fafc' }}>
                <Upload size={16} style={{ color: '#94a3b8' }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: '#334155', marginTop: 6 }}>{d}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {PERFIL_SECCIONES[tab].map(s => (
              <div key={s} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 8, background: '#0C2D40', color: '#fff',
              }}>
                <span style={{ fontSize: 11.5, fontWeight: 700 }}>{s}</span>
                <ChevronDown size={13} style={{ opacity: .7 }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function TaskPreviewModal({ task, onClose, onEdit }) {
  const { gamificacion } = useConfig()
  const tipo = tipoMap[task.tipo] || tiposTarea[0]
  const TpIcon = tipo.icon
  const hasQuiz = task.verificarQuiz !== false

  function renderContenido() {
    switch (task.tipo) {
      case 'perfil':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: '#eff6ff', border: '1px solid #dbeafe' }}>
              <Info size={14} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: 11.5, color: '#1e40af', fontWeight: 600 }}>Formulario fijo del sistema: el colaborador completa sus datos personales, laborales, preferencias y documentación.</span>
            </div>
            <PerfilPreviewTabs />
          </div>
        )
      case 'video': {
        const videoUrl = task.enlace || task._kbItem?.url
        const videoId = videoUrl ? (toEmbedUrl(videoUrl).match(/embed\/([a-zA-Z0-9_-]+)/)?.[1]) : null
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ borderRadius: 12, overflow: 'hidden', background: '#0f172a' }}>
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                {videoId ? (
                  <iframe src={`https://www.youtube.com/embed/${videoId}`} title={task.name} frameBorder="0" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: 'rgba(255,255,255,.5)' }}>
                    <Video size={28} />
                    <span style={{ fontSize: 11 }}>Sin video vinculado aún</span>
                  </div>
                )}
              </div>
            </div>
            {hasQuiz && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a' }}>
                <HelpCircle size={15} style={{ color: '#d97706' }} />
                <span style={{ fontSize: 11.5, color: '#92400e', fontWeight: 600 }}>Incluye una prueba de verificación al finalizar</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: '#eff6ff', border: '1px solid #dbeafe' }}>
              <Info size={14} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: 11.5, color: '#1e40af', fontWeight: 600 }}>Se completa automáticamente al terminar el video{hasQuiz ? ' y la evaluación' : ''}</span>
            </div>
          </div>
        )
      }
      case 'audio':
        return (
          <div style={{ padding: 20, borderRadius: 12, background: 'linear-gradient(135deg, #0e7490 0%, #155e75 100%)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Headphones size={22} style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{task.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Audio / Podcast</div>
            </div>
          </div>
        )
      case 'documento':
        return (
          <div style={{ border: '1px solid #fed7aa', borderRadius: 12, overflow: 'hidden', background: '#fffbf5' }}>
            <div style={{ padding: '12px 16px', background: '#fff7ed', display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={16} style={{ color: '#ea580c' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#9a3412' }}>{task.name}.pdf</span>
            </div>
            {hasQuiz && (
              <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #fed7aa' }}>
                <HelpCircle size={14} style={{ color: '#d97706' }} />
                <span style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>Incluye una prueba de verificación</span>
              </div>
            )}
          </div>
        )
      case 'quiz': {
        const preguntas = task.quizPreguntas || []
        if (preguntas.length === 0) {
          return <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#94a3b8', background: '#f8fafc', borderRadius: 10 }}>Esta prueba aún no tiene preguntas configuradas</div>
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {preguntas.map((p, i) => (
              <div key={p.id} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40', marginBottom: 8 }}>{i + 1}. {p.texto}</div>
                {p.tipo === 'abierta' ? (
                  <div style={{ padding: '8px 10px', borderRadius: 7, background: '#fff', border: '1.5px dashed #cbd5e1', fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
                    Respuesta abierta
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {p.opciones.map(o => (
                      <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 7, background: '#fff', border: `1.5px solid ${o.correcta ? '#00E091' : '#e2e8f0'}` }}>
                        <div style={{ width: 13, height: 13, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${o.correcta ? '#00E091' : '#cbd5e1'}`, background: o.correcta ? '#00E091' : '#fff' }} />
                        <span style={{ fontSize: 11, color: '#334155' }}>{o.texto}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
      case 'completar-perfil': {
        const campos = task.formCampos || []
        if (campos.length === 0) {
          return <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#94a3b8', background: '#f8fafc', borderRadius: 10 }}>Este formulario aún no tiene preguntas configuradas</div>
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {campos.map(c => (
              <div key={c.id}>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: '#334155', marginBottom: 5, display: 'block' }}>
                  {c.etiqueta}{c.obligatorio && <span style={{ color: '#ef4444' }}> *</span>}
                </label>
                {c.tipo === 'parrafo' && <div style={{ height: 56, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc' }} />}
                {c.tipo === 'texto-corto' && <div style={{ height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc' }} />}
                {c.tipo === 'desplegable' && <div style={{ height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: 11, color: '#94a3b8' }}>Selecciona...</div>}
                {(c.tipo === 'opcion-multiple' || c.tipo === 'casillas') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {c.opciones.map(o => (
                      <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 7, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <div style={{ width: 13, height: 13, borderRadius: c.tipo === 'casillas' ? 4 : '50%', flexShrink: 0, border: '1.5px solid #cbd5e1' }} />
                        <span style={{ fontSize: 11, color: '#334155' }}>{o.texto}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
      case 'pulso': {
        const preguntas = task.pulsoPreguntas?.length ? task.pulsoPreguntas : ['¿Cómo te sientes con tu proceso de onboarding hasta ahora?']
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {preguntas.map((p, i) => (
              <div key={i} style={{ border: '1px solid #fbcfe8', borderRadius: 12, padding: '12px 16px', background: '#fdf2f8' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#831843', margin: '0 0 8px' }}>{p}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['😞', '😕', '😐', '🙂', '😄'].map((e, ei) => (
                    <div key={ei} style={{ width: 30, height: 30, borderRadius: '50%', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f5d0e0', background: '#fff' }}>{e}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      }
      case 'recorrido': {
        const paradas = (task.paradas || []).map(p => p.lugar).filter(Boolean)
        const stops = paradas.length ? paradas : ['Recepción y entrada principal', 'Tu área de trabajo', 'Sala de reuniones', 'Comedor y áreas comunes']
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: '#eff6ff', color: '#2563eb', alignSelf: 'flex-start' }}>Recorrido libre</div>
            {stops.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: '1.5px solid #d1d5db' }} />
                <span style={{ fontSize: 12, color: '#334155' }}>{s}</span>
              </div>
            ))}
            {task.guia && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: '#eff6ff', border: '1px solid #dbeafe', marginTop: 2 }}>
                <UserCheck size={13} style={{ color: '#2563eb' }} />
                <span style={{ fontSize: 11.5, color: '#1e40af', fontWeight: 600 }}>Guía: {task.guia}</span>
              </div>
            )}
          </div>
        )
      }
      case 'subida':
        return (
          <div style={{ border: '2px dashed #f9a8d4', borderRadius: 12, padding: 28, textAlign: 'center', background: '#fdf2f8' }}>
            <Upload size={28} style={{ color: '#ec4899', marginBottom: 8 }} />
            <p style={{ fontSize: 12, fontWeight: 700, color: '#9d174d', margin: '0 0 3px' }}>Arrastra tus archivos aquí</p>
            <p style={{ fontSize: 10.5, color: '#be185d', margin: 0 }}>o haz clic para seleccionar{task.formatos ? ` — ${task.formatos}` : ''}</p>
          </div>
        )
      case 'tarea-otro':
        return (
          <div style={{ border: '1px solid #fecaca', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: '#fef2f2', display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserCheck size={15} style={{ color: '#dc2626' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#991b1b' }}>Tarea supervisada</span>
            </div>
            <div style={{ padding: 16, fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
              {task.desc || 'Requiere validación del responsable asignado.'}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="pl-overlay" style={{ zIndex: 1200 }} onClick={onClose}>
      <div className="pl-modal" style={{ width: 560, maxWidth: '94vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div className="pl-modal-header" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Eye size={16} style={{ color: '#fff' }} />
            </div>
            <h2>Así la ve el colaborador</h2>
          </div>
          <button className="pl-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `${tipo.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TpIcon size={16} style={{ color: tipo.color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0C2D40' }}>{task.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: tipo.color }}>{tipo.label}</span>
                {gamificacion && task.puntos > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#00E091' }}>+{task.puntos} Pts</span>
                )}
              </div>
            </div>
          </div>
          {task.desc && (
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, margin: '10px 0 16px' }}>{task.desc}</p>
          )}
          {!task.desc && <div style={{ height: 12 }} />}

          {renderContenido()}
        </div>

        <div className="pl-modal-footer" style={{ justifyContent: 'center', flexShrink: 0 }}>
          <button className="pl-btn-cancel" onClick={onClose}>Cerrar</button>
          {onEdit && (
            <button className="pl-btn-save" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={onEdit}>
              <Pencil size={13} />
              Editar tarea
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function RutaPath({ etapas, gamificacion, onSelectTask }) {
  return (
    <>
      {etapas.map((et, ei) => {
        const etTareas = et.actividades.flatMap(a => a.tareas)
        return (
          <div key={ei}>
            {/* Etapa header pill */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 16px', borderRadius: 20,
                background: '#fff', border: '1px solid #e2e8f0',
                boxShadow: '0 1px 4px rgba(0,0,0,.06)',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: '#0C2D40', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800,
                }}>
                  {ei + 1}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40' }}>{et.name}</span>
                <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>{et.duracion || 7}d</span>
              </div>
            </div>

            {/* Nodos del camino */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              {etTareas.map((tarea, ti) => {
                const tp = tipoMap[tarea.tipo] || tiposTarea[0]
                const TpIcon = tp.icon
                const offsets = [0, 40, 60, 40, 0, -40, -60, -40]
                const xOff = offsets[ti % offsets.length]
                return (
                  <div key={tarea.id}>
                    {/* Línea conectora */}
                    {ti > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: 2, height: 16, background: '#cbd5e1', borderRadius: 1 }} />
                      </div>
                    )}
                    <div
                      onClick={() => onSelectTask(tarea)}
                      title="Ver contenido de la tarea"
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        transform: `translateX(${xOff}px)`,
                        transition: 'transform .2s',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <div
                          className="jb-preview-node-circle"
                          style={{
                            width: 48, height: 48, borderRadius: '50%',
                            background: '#0C2D40',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(12,45,64,.2)',
                            transition: 'transform .15s, box-shadow .15s',
                          }}
                        >
                          <TpIcon size={18} style={{ color: '#fff' }} />
                        </div>
                        {gamificacion && tarea.puntos > 0 && (
                          <div style={{
                            position: 'absolute', top: -4, right: -8,
                            background: '#00E091', color: '#fff',
                            fontSize: 8, fontWeight: 800, padding: '1px 5px',
                            borderRadius: 8, lineHeight: 1.4,
                          }}>
                            +{tarea.puntos}
                          </div>
                        )}
                      </div>
                      <div style={{
                        fontSize: 10, fontWeight: 600, color: '#0C2D40',
                        marginTop: 4, textAlign: 'center', maxWidth: 100,
                        lineHeight: 1.2, overflow: 'hidden',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {tarea.name}
                      </div>
                    </div>
                  </div>
                )
              })}
              {etTareas.length === 0 && (
                <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', padding: '8px 0' }}>Sin tareas</div>
              )}
            </div>

            {/* Separador entre etapas */}
            {ei < etapas.length - 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                <div style={{
                  width: 2, height: 24, background: '#cbd5e1',
                  borderRadius: 1, position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1',
                  }} />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

export default function RutaPreviewModal({ name, etapas, onClose, onEditTask }) {
  const { gamificacion } = useConfig()
  const [activeTask, setActiveTask] = useState(null)
  const allTareas = etapas.flatMap(e => e.actividades.flatMap(a => a.tareas))
  const totalPuntos = allTareas.reduce((s, t) => s + (t.puntos || 0), 0)

  return (
    <>
      <div className="pl-overlay" onClick={onClose}>
        <div className="pl-modal" style={{ maxWidth: 480, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
          <div className="pl-modal-header" style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Eye size={16} style={{ color: '#fff' }} />
              </div>
              <div>
                <h2>{name}</h2>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>Vista previa</div>
              </div>
            </div>
            <button className="pl-modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div style={{
            overflowY: 'auto', flex: 1,
            background: 'linear-gradient(180deg, #f0f4f8 0%, #e8eef4 100%)',
            padding: '24px 0',
          }}>
            <RutaPath etapas={etapas} gamificacion={gamificacion} onSelectTask={setActiveTask} />
          </div>

          <div style={{
            padding: '12px 24px', borderTop: '1px solid #e2e8f0', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#fff',
          }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#475569',
                background: '#f1f5f9', padding: '3px 8px', borderRadius: 6,
              }}>
                {etapas.length} etapas
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#475569',
                background: '#f1f5f9', padding: '3px 8px', borderRadius: 6,
              }}>
                {allTareas.length} tareas
              </span>
              {gamificacion && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#92400e',
                  background: '#fef3c7', padding: '3px 8px', borderRadius: 6,
                }}>
                  {totalPuntos} Pts
                </span>
              )}
            </div>
            <button className="pl-btn-save" style={{ padding: '8px 20px', fontSize: 12 }} onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {activeTask && (
        <TaskPreviewModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onEdit={onEditTask && !tipoMap[activeTask.tipo]?.soloVistaPrevia ? () => { onEditTask(activeTask); setActiveTask(null) } : undefined}
        />
      )}
    </>
  )
}
