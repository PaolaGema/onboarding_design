import { useState } from 'react'
import JourneyBuilder from './JourneyBuilder'
import { useTronco } from '../../context/TroncoContext'
import { useConfig } from '../../context/ConfigContext'
import {
  Trophy, Bot, Megaphone, Bell, ClipboardCheck,
  Calendar, BookOpen, AlertTriangle, Lock, Info,
  Shield, ChevronDown, ChevronRight, Route, Zap,
  Video, FileText, HelpCircle, Upload, Pencil, MessageSquare
} from 'lucide-react'

const initialConfig = [
  {
    key: 'gamificacion',
    label: 'Gamificación (XP y niveles)',
    desc: 'Activa el sistema de puntos XP para motivar a los colaboradores a completar sus tareas.',
    icon: Trophy,
    color: '#f59e0b',
    enabled: true,
    defaults: {},
  },
  {
    key: 'buddy',
    label: 'Buddy IA',
    desc: 'Un asistente inteligente que responde preguntas del colaborador basándose en la Base de conocimiento.',
    icon: Bot,
    color: '#8b5cf6',
    enabled: true,
    defaults: {
      modelo: 'Asistente general',
    },
  },
  {
    key: 'menciones',
    label: 'Menciones automáticas',
    desc: 'Publica automáticamente en el muro de Menciones cuando ocurren momentos clave del onboarding.',
    icon: Megaphone,
    color: '#3b82f6',
    enabled: true,
    defaults: {
      menciones: [
        { key: 'inicio', label: 'Inicio de onboarding', desc: 'Cuando el colaborador comienza su primer día', activo: true },
        { key: 'etapa', label: 'Etapa completada', desc: 'Cuando completa una etapa de su ruta', activo: false },
        { key: 'graduacion', label: 'Graduación', desc: 'Cuando completa todas las tareas y se gradúa', activo: true },
      ],
    },
  },
  {
    key: 'mensajes',
    label: 'Mensajes personalizados',
    desc: 'Textos personalizados que se envían como push adicional en momentos clave. Las notificaciones automáticas del sistema ya están incluidas.',
    icon: Bell,
    color: '#10b981',
    enabled: true,
    defaults: {
      mensajes: [
        { key: 'bienvenida', evento: 'Inicio del onboarding', mensaje: 'Hola {nombre}, te damos la bienvenida al equipo de {area}. Estamos felices de tenerte con nosotros.', activo: true },
        { key: 'graduacion', evento: 'Graduación', mensaje: 'Felicidades {nombre}, completaste tu onboarding exitosamente. Ya eres parte oficial del equipo.', activo: true },
      ],
    },
  },
  {
    key: 'encuestas',
    label: 'Encuestas pulso',
    desc: 'Envía encuestas breves al colaborador durante su onboarding para medir cómo se siente y detectar problemas a tiempo.',
    icon: ClipboardCheck,
    color: '#06b6d4',
    enabled: true,
    defaults: {},
  },
  {
    key: 'riesgo',
    label: 'Días "En riesgo"',
    desc: 'Define cuántos días sin actividad marcan a un colaborador como "en riesgo" en el dashboard.',
    icon: AlertTriangle,
    color: '#ef4444',
    enabled: true,
    defaults: {
      dias: 3,
    },
  },
]

const modoAsignacion = [
  { key: 'auto', label: 'Automática', desc: 'En la fecha de ingreso del colaborador, el sistema le asigna la ruta según su área y cargo.' },
  { key: 'manual', label: 'Manual', desc: 'Un admin debe ir a Colaboradores y asignar la ruta manualmente a cada persona.' },
]

const modoActivacion = [
  { key: 'fecha', label: 'En fecha de ingreso', desc: 'El onboarding se activa automáticamente el día que el colaborador ingresa.' },
  { key: 'inmediata', label: 'Inmediata', desc: 'Se activa en el momento en que se asigna la ruta, sin esperar fecha de ingreso.' },
  { key: 'manual', label: 'Manual', desc: 'Queda pendiente hasta que el admin la active manualmente.' },
]

export default function Configuracion() {
  const [config, setConfig] = useState(initialConfig)
  const [asignacion, setAsignacion] = useState('auto')
  const [activacion, setActivacion] = useState('fecha')
  const [expandedCard, setExpandedCard] = useState(null)
  const [troncoExpanded, setTroncoExpanded] = useState(false)
  const [editingTronco, setEditingTronco] = useState(false)
  const { tronco, saveTronco } = useTronco()
  const { setGamificacion } = useConfig()
  const troncoConfigured = tronco.configured

  function toggleEnabled(key) {
    setConfig(prev => {
      const next = prev.map(c => c.key === key ? { ...c, enabled: !c.enabled } : c)
      if (key === 'gamificacion') {
        setGamificacion(next.find(c => c.key === 'gamificacion').enabled)
      }
      return next
    })
  }

  function toggleSubItem(configKey, listKey, idx) {
    setConfig(prev => prev.map(c => {
      if (c.key !== configKey) return c
      const list = [...c.defaults[listKey]]
      list[idx] = { ...list[idx], activo: !list[idx].activo }
      return { ...c, defaults: { ...c.defaults, [listKey]: list } }
    }))
  }

  function updateMensaje(idx, texto) {
    setConfig(prev => prev.map(c => {
      if (c.key !== 'mensajes') return c
      const list = [...c.defaults.mensajes]
      list[idx] = { ...list[idx], mensaje: texto }
      return { ...c, defaults: { ...c.defaults, mensajes: list } }
    }))
  }

  if (editingTronco) {
    return (
      <JourneyBuilder
        plantilla={{ id: 'tronco', name: 'Tronco común' }}
        onBack={() => setEditingTronco(false)}
        onSave={(etapas) => saveTronco(etapas)}
        empty={!troncoConfigured}
      />
    )
  }

  return (
    <div className="content-scroll">

      {/* HEADER */}
      <div className="pl-header">
        <div>
          <h1 className="pl-title">Configuración Global</h1>
          <p className="pl-subtitle">Define los valores por defecto para toda la empresa. Las rutas pueden personalizar o heredar cada ajuste.</p>
        </div>
      </div>

      {/* INFO BANNER */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: '#eff6ff', border: 'none',
        borderRadius: 12, padding: '14px 18px', marginBottom: 20,
      }}>
        <Info size={18} style={{ color: '#3b82f6', flexShrink: 0 }} />
        <div style={{ fontSize: 12, color: '#1e40af', lineHeight: 1.5 }}>
          <strong>Global vs. Ruta:</strong> Lo que configures aquí son los valores por defecto. Cada ruta puede heredarlos, personalizarlos o desactivarlos. Si desactivas algo aquí, ninguna ruta podrá usarlo.
        </div>
      </div>

      {/* TRONCO COMÚN */}
      <div style={{
        background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
        padding: '20px 24px', marginBottom: 16,
      }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
          onClick={() => setTroncoExpanded(!troncoExpanded)}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#0C2D40', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Shield size={17} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0C2D40' }}>Tronco común</div>
            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>
              Etapas obligatorias que todas las rutas comparten. Se insertan automáticamente al inicio de cada ruta y solo tú puedes editarlas.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {troncoConfigured ? (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#10DC97', background: 'rgba(16,220,151,0.1)', padding: '3px 10px', borderRadius: 6 }}>
                Configurado
              </span>
            ) : (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', background: '#fef3c7', padding: '3px 10px', borderRadius: 6 }}>
                Sin configurar
              </span>
            )}
            {troncoExpanded ? <ChevronDown size={16} style={{ color: '#94a3b8' }} /> : <ChevronRight size={16} style={{ color: '#94a3b8' }} />}
          </div>
        </div>

        {troncoExpanded && (
          <div style={{ marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>

            {troncoConfigured ? (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
                  {tronco.etapas.length} etapa{tronco.etapas.length !== 1 ? 's' : ''} · {tronco.etapas.reduce((s, e) => s + e.actividades.reduce((s2, a) => s2 + a.tareas.length, 0), 0)} tareas
                </div>

                {tronco.etapas.map((etapa, ei) => (
                  <div key={ei} style={{ marginBottom: 14 }}>
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: '#0C2D40',
                      padding: '6px 0', marginBottom: 6,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <Lock size={11} style={{ color: '#94a3b8' }} />
                      {etapa.name}
                    </div>
                    {etapa.actividades.map((act, ai) => (
                      <div key={ai} style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', padding: '0 0 4px 8px' }}>
                          {act.name}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 8 }}>
                          {act.tareas.map((t, ti) => (
                            <div key={ti} style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '7px 12px', background: '#f8fafc', borderRadius: 8,
                            }}>
                              <div style={{
                                width: 24, height: 24, borderRadius: 6,
                                background: '#0C2D40', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, fontSize: 10,
                              }}>
                                <FileText size={11} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#0C2D40' }}>{t.name}</div>
                              </div>
                              <Lock size={10} style={{ color: '#cbd5e1' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                  <button
                    onClick={() => setEditingTronco(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '10px 20px', borderRadius: 10, border: 'none',
                      background: '#0C2D40', color: '#fff', cursor: 'pointer',
                      fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                    }}
                  >
                    <Pencil size={13} />
                    Editar tronco común
                  </button>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    Abre el editor para modificar actividades y tareas
                  </span>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                <Shield size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0C2D40', marginBottom: 6 }}>
                  Aún no tienes un tronco común
                </div>
                <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: '0 auto 20px', maxWidth: 380 }}>
                  Define las etapas y tareas que todos los nuevos colaboradores deben completar sin importar su área — como bienvenida corporativa, documentación, cultura, etc.
                </p>
                <button
                  onClick={() => setEditingTronco(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '12px 24px', borderRadius: 10, border: 'none',
                    background: '#0C2D40', color: '#fff', cursor: 'pointer',
                    fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                    boxShadow: '0 2px 8px rgba(12,45,64,0.2)',
                  }}
                >
                  <Shield size={15} />
                  Crear tronco común
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ASIGNACIÓN Y ACTIVACIÓN */}
      <div style={{ display: 'grid', gridTemplateColumns: asignacion === 'manual' ? '1fr 1fr' : '1fr', gap: 14, marginBottom: 16, transition: 'all .2s' }}>

        {/* ASIGNACIÓN DE RUTA */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
          padding: '20px 22px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#3b82f6', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Route size={15} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40' }}>Asignación de ruta</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>¿Cómo se asigna la ruta al colaborador?</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {modoAsignacion.map(m => {
              const selected = asignacion === m.key
              return (
                <button
                  key={m.key}
                  onClick={() => { setAsignacion(m.key); if (m.key === 'auto') setActivacion('fecha') }}
                  style={{
                    padding: '14px 16px', borderRadius: 10,
                    border: `1.5px solid ${selected ? '#3b82f6' : '#e2e8f0'}`,
                    background: selected ? '#eff6ff' : '#fff',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all .15s', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: `2px solid ${selected ? '#3b82f6' : '#d1d5db'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all .15s',
                  }}>
                    {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: selected ? '#1e40af' : '#475569' }}>{m.label}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, lineHeight: 1.4 }}>{m.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>
          {asignacion === 'auto' && (
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 8,
              background: '#eff6ff', border: '1px solid #dbeafe',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Zap size={13} style={{ color: '#3b82f6', flexShrink: 0 }} />
              <div style={{ fontSize: 10.5, color: '#1e40af', lineHeight: 1.4 }}>
                El onboarding se activa automáticamente en la fecha de ingreso del colaborador.
              </div>
            </div>
          )}
        </div>

        {/* ACTIVACIÓN DEL ONBOARDING — solo cuando asignación es manual */}
        {asignacion === 'manual' && (
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
            padding: '20px 22px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#0C2D40', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={15} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40' }}>Activación del onboarding</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>¿Cuándo comienza el onboarding?</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {modoActivacion.map(m => {
                const selected = activacion === m.key
                return (
                  <button
                    key={m.key}
                    onClick={() => setActivacion(m.key)}
                    style={{
                      padding: '14px 16px', borderRadius: 10,
                      border: `1.5px solid ${selected ? '#0C2D40' : '#e2e8f0'}`,
                      background: selected ? '#f0f4f8' : '#fff',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all .15s', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      border: `2px solid ${selected ? '#0C2D40' : '#d1d5db'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'all .15s',
                    }}>
                      {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0C2D40' }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: selected ? '#0C2D40' : '#475569' }}>{m.label}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, lineHeight: 1.4 }}>{m.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* AJUSTES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {config.map(c => {
          const Icon = c.icon
          const hasDefaults = c.key !== 'gamificacion' && c.key !== 'encuestas'
          const isExpanded = expandedCard === c.key && hasDefaults
          return (
            <div
              key={c.key}
              style={{
                background: '#fff', borderRadius: 14,
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                opacity: c.enabled ? 1 : 0.6,
                transition: 'all .2s',
              }}
            >
              {/* ROW PRINCIPAL */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 20px', cursor: 'pointer',
                }}
                onClick={() => hasDefaults && setExpandedCard(isExpanded ? null : c.key)}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: c.enabled ? c.color : '#e2e8f0',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'background .2s',
                }}>
                  <Icon size={17} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40' }}>{c.label}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, lineHeight: 1.4 }}>{c.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  {!c.enabled && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', background: '#fef2f2', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                      Bloqueado para rutas
                    </span>
                  )}
                  <div
                    onClick={e => { e.stopPropagation(); toggleEnabled(c.key) }}
                    style={{
                      width: 40, height: 22, borderRadius: 99,
                      background: c.enabled ? '#10DC97' : '#d1d5db',
                      padding: 2, cursor: 'pointer',
                      transition: 'background .2s',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,.15)',
                      transition: 'transform .2s',
                      transform: c.enabled ? 'translateX(18px)' : 'translateX(0)',
                    }} />
                  </div>
                  {hasDefaults && c.enabled && (
                    <div style={{ transition: 'transform .2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <ChevronDown size={16} style={{ color: '#94a3b8' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* DEFAULTS EXPANDIDOS */}
              {isExpanded && c.enabled && (
                <div style={{
                  borderTop: '1px solid #f1f5f9',
                  padding: '14px 20px 16px',
                  background: '#fafbfc',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                    Valores por defecto
                  </div>

                  {c.key === 'buddy' && (
                    <div style={{ fontSize: 12, color: '#475569' }}>
                      Modelo: <strong>{c.defaults.modelo}</strong>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Requiere documentos en la Base de conocimiento para funcionar.</div>
                    </div>
                  )}

                  {c.key === 'menciones' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>
                        Se publicará automáticamente en el muro de Menciones:
                      </div>
                      {c.defaults.menciones.map((m, i) => (
                        <div key={m.key} onClick={() => toggleSubItem('menciones', 'menciones', i)} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px', borderRadius: 10,
                          background: m.activo ? '#fff' : '#f8fafc',
                          border: m.activo ? '1.5px solid #dbeafe' : '1.5px solid #f1f5f9',
                          opacity: m.activo ? 1 : 0.5,
                          cursor: 'pointer',
                          transition: 'all .15s',
                        }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 9,
                            background: m.activo ? '#eff6ff' : '#f1f5f9',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, transition: 'all .15s',
                          }}>
                            <Megaphone size={14} style={{ color: m.activo ? '#3b82f6' : '#94a3b8' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: m.activo ? '#0C2D40' : '#94a3b8' }}>{m.label}</div>
                            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{m.desc}</div>
                          </div>
                          <div style={{
                            width: 36, height: 20, borderRadius: 99,
                            background: m.activo ? '#10DC97' : '#d1d5db',
                            padding: 2,
                            display: 'flex', alignItems: 'center', flexShrink: 0,
                            transition: 'background .2s',
                          }}>
                            <div style={{
                              width: 16, height: 16, borderRadius: '50%', background: '#fff',
                              boxShadow: '0 1px 3px rgba(0,0,0,.15)',
                              transform: m.activo ? 'translateX(16px)' : 'translateX(0)',
                              transition: 'transform .2s',
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {c.key === 'mensajes' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 0 }}>
                        Personaliza los mensajes push que la empresa envía al colaborador en momentos clave:
                      </div>
                      {c.defaults.mensajes.map((m, i) => (
                        <div key={m.key} style={{
                          borderRadius: 12,
                          background: m.activo ? '#fff' : '#f8fafc',
                          border: m.activo ? '1.5px solid #d1fae5' : '1.5px solid #f1f5f9',
                          opacity: m.activo ? 1 : 0.5,
                          transition: 'all .15s',
                          overflow: 'hidden',
                        }}>
                          <div
                            onClick={() => toggleSubItem('mensajes', 'mensajes', i)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '12px 14px', cursor: 'pointer',
                            }}
                          >
                            <div style={{
                              width: 32, height: 32, borderRadius: 9,
                              background: m.activo ? '#f0fdf4' : '#f1f5f9',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0, transition: 'all .15s',
                            }}>
                              <MessageSquare size={14} style={{ color: m.activo ? '#10b981' : '#94a3b8' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 600, color: m.activo ? '#0C2D40' : '#94a3b8' }}>{m.evento}</div>
                              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>Se envía como notificación push al colaborador</div>
                            </div>
                            <div style={{
                              width: 36, height: 20, borderRadius: 99,
                              background: m.activo ? '#10DC97' : '#d1d5db',
                              padding: 2,
                              display: 'flex', alignItems: 'center', flexShrink: 0,
                              transition: 'background .2s',
                            }}>
                              <div style={{
                                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                                boxShadow: '0 1px 3px rgba(0,0,0,.15)',
                                transform: m.activo ? 'translateX(16px)' : 'translateX(0)',
                                transition: 'transform .2s',
                              }} />
                            </div>
                          </div>
                          {m.activo && (
                            <div style={{ padding: '0 14px 14px' }}>
                              <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Mensaje</div>
                              <textarea
                                value={m.mensaje}
                                onChange={e => updateMensaje(i, e.target.value)}
                                rows={2}
                                style={{
                                  width: '100%', resize: 'vertical',
                                  fontFamily: 'inherit', fontSize: 12, color: '#334155',
                                  lineHeight: 1.6, padding: '10px 12px',
                                  border: '1.5px solid #e2e8f0', borderRadius: 8,
                                  background: '#fff', outline: 'none',
                                  transition: 'border-color .15s',
                                  boxSizing: 'border-box',
                                }}
                                onFocus={e => e.target.style.borderColor = '#10b981'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                              />
                              <div style={{ marginTop: 8 }}>
                                <div style={{ fontSize: 9.5, color: '#94a3b8', marginBottom: 5 }}>Insertar variable:</div>
                                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                  {['{nombre}', '{area}', '{cargo}', '{empresa}'].map(v => (
                                    <button
                                      key={v}
                                      type="button"
                                      onClick={() => updateMensaje(i, m.mensaje + ' ' + v)}
                                      style={{
                                        fontSize: 10, fontWeight: 600, color: '#10b981',
                                        background: '#f0fdf4', border: '1px solid #d1fae5',
                                        borderRadius: 6, padding: '3px 8px',
                                        cursor: 'pointer', fontFamily: 'inherit',
                                        transition: 'all .1s',
                                      }}
                                      onMouseEnter={e => { e.currentTarget.style.background = '#d1fae5' }}
                                      onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4' }}
                                    >
                                      {v}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}


                  {c.key === 'riesgo' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: '#475569' }}>Días sin actividad</span>
                      <input type="number" defaultValue={c.defaults.dias} style={{
                        width: 60, padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0',
                        fontSize: 12, fontFamily: 'inherit', outline: 'none',
                      }} />
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>Las rutas pueden personalizar este umbral</span>
                    </div>
                  )}

                  <div style={{ marginTop: 12, fontSize: 10, color: '#94a3b8', fontStyle: 'italic' }}>
                    Las rutas pueden: heredar estos valores, personalizarlos o desactivar esta función.
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}
