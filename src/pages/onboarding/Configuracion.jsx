import { useState } from 'react'
import JourneyBuilder from './JourneyBuilder'
import { useTronco } from '../../context/TroncoContext'
import { useConfig } from '../../context/ConfigContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import {
  Trophy, Bot, Megaphone, Bell, ClipboardCheck,
  Calendar, BookOpen, AlertTriangle, Lock, Info,
  Shield, ChevronDown, ChevronRight, Route, Zap,
  Video, FileText, Upload, Pencil, MessageSquare,
  Clock, AlertCircle, X
} from 'lucide-react'

const toggleMessages = {
  gamificacion: {
    activar: 'Los colaboradores comenzarán a ganar puntos al completar tareas. Las rutas que usen gamificación mostrarán el progreso con puntaje.',
    desactivar: 'Se ocultará el sistema de puntos en todas las rutas. Los colaboradores ya no verán puntos al completar tareas. Las rutas activas no se verán afectadas.',
  },
  buddy: {
    activar: 'Se habilitará el asistente inteligente para todos los colaboradores. Podrán hacer preguntas y recibir respuestas basadas en la Biblioteca de recursos.',
    desactivar: 'Los colaboradores ya no tendrán acceso al asistente inteligente. Las conversaciones previas no se eliminarán.',
  },
  menciones: {
    activar: 'Se publicarán automáticamente menciones en el muro cuando ocurran momentos clave del onboarding (inicio, etapas, graduación).',
    desactivar: 'Se dejarán de publicar menciones automáticas. Las menciones existentes no se eliminarán.',
  },
  riesgo: {
    activar: 'Se marcarán como "en riesgo" los colaboradores que superen los días sin actividad configurados.',
    desactivar: 'Se dejará de monitorear la inactividad. Los colaboradores marcados actualmente como "en riesgo" perderán esa etiqueta.',
  },
  extension: {
    activar: 'Los líderes de área podrán extender el plazo de las rutas de onboarding de sus colaboradores sin necesitar aprobación de RR.HH.',
    desactivar: 'Solo RR.HH. podrá extender plazos de rutas. Los líderes de área deberán solicitar la extensión al administrador.',
  },
}

const initialConfig = [
  {
    key: 'gamificacion',
    label: 'Gamificación (Puntos)',
    desc: 'Activa el sistema de puntos para motivar a los colaboradores a completar sus tareas.',
    icon: Trophy,
    color: '#f59e0b',
    enabled: true,
    defaults: {},
  },
  {
    key: 'buddy',
    label: 'Asistente IA',
    desc: 'Un asistente inteligente que responde preguntas del colaborador basándose en la Biblioteca de recursos.',
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
    key: 'riesgo',
    label: 'Días "En riesgo"',
    desc: 'Define cuántos días sin actividad marcan a un colaborador como "en riesgo" en el panel.',
    icon: AlertTriangle,
    color: '#ef4444',
    enabled: true,
    defaults: {
      dias: 3,
    },
  },
  {
    key: 'extension',
    label: 'Extensión de plazo',
    desc: '¿Los jefes pueden extender el plazo de una ruta sin aprobación de RR.HH.?',
    icon: Clock,
    color: '#0d9488',
    enabled: false,
    defaults: {},
  },
]

const modoAsignacion = [
  { key: 'manual', label: 'Manual', desc: 'Un administrador asigna la ruta a cada colaborador desde el módulo de Asignaciones.', icon: Pencil },
  { key: 'auto', label: 'Automática', desc: 'El sistema asigna la ruta automáticamente en la fecha de ingreso, según el área y cargo.', icon: Zap },
]

const modoActivacion = [
  { key: 'fecha', label: 'En fecha de ingreso', desc: 'El onboarding se activa automáticamente el día que el colaborador ingresa.' },
  { key: 'inmediata', label: 'Inmediata', desc: 'Se activa en el momento en que se asigna la ruta, sin esperar fecha de ingreso.' },
  { key: 'manual', label: 'Manual', desc: 'Queda pendiente hasta que el admin la active manualmente.' },
]

export default function Configuracion() {
  const { configToggles, setConfigToggles } = useOnboardingData()
  const [config, setConfig] = useState(() =>
    initialConfig.map(c => ({ ...c, enabled: configToggles[c.key] ?? c.enabled }))
  )
  const [asignacion, setAsignacion] = useState(configToggles.asignacion || 'manual')
  const [activacion, setActivacion] = useState(configToggles.activacion || 'manual')
  const [horaAsignacion, setHoraAsignacion] = useState(configToggles.horaAsignacion || '08:00')
  const [expandedCard, setExpandedCard] = useState(null)
  const [troncoExpanded, setTroncoExpanded] = useState(true)
  const [asignacionExpanded, setAsignacionExpanded] = useState(true)
  const [editingTronco, setEditingTronco] = useState(false)
  const { tronco, saveTronco } = useTronco()
  const { setGamificacion, setAsistenteIA } = useConfig()
  const troncoConfigured = tronco.configured
  const [toggleConfirm, setToggleConfirm] = useState(null)

  function requestToggle(key) {
    const item = config.find(c => c.key === key)
    const willEnable = !item.enabled
    setToggleConfirm({ key, label: item.label, willEnable, message: toggleMessages[key]?.[willEnable ? 'activar' : 'desactivar'] || '' })
  }

  function confirmToggle() {
    if (!toggleConfirm) return
    const { key, willEnable } = toggleConfirm
    setConfig(prev => {
      const next = prev.map(c => c.key === key ? { ...c, enabled: willEnable } : c)
      if (key === 'gamificacion') setGamificacion(willEnable)
      if (key === 'buddy') setAsistenteIA(willEnable)
      setConfigToggles(ct => ({ ...ct, [key]: willEnable }))
      return next
    })
    if (willEnable && ['buddy', 'menciones', 'riesgo', 'extension'].includes(key)) {
      setExpandedCard(key)
    } else if (!willEnable) {
      setExpandedCard(prev => prev === key ? null : prev)
    }
    setToggleConfirm(null)
  }

  function updateAsignacion(val) {
    setAsignacion(val)
    setConfigToggles(ct => ({ ...ct, asignacion: val }))
  }

  function updateActivacion(val) {
    setActivacion(val)
    setConfigToggles(ct => ({ ...ct, activacion: val }))
  }

  function updateHora(val) {
    setHoraAsignacion(val)
    setConfigToggles(ct => ({ ...ct, horaAsignacion: val }))
  }

  function toggleSubItem(configKey, listKey, idx) {
    setConfig(prev => prev.map(c => {
      if (c.key !== configKey) return c
      const list = [...c.defaults[listKey]]
      list[idx] = { ...list[idx], activo: !list[idx].activo }
      return { ...c, defaults: { ...c.defaults, [listKey]: list } }
    }))
  }

  if (editingTronco) {
    return (
      <JourneyBuilder
        plantilla={{ id: 'tronco', name: 'Inducción general' }}
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
          Lo que configures aquí son los valores por defecto para toda la empresa. Cada ruta puede heredarlos, personalizarlos o desactivarlos — pero si apagas algo aquí, ninguna ruta podrá usarlo.
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
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0C2D40' }}>Inducción general</div>
            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>
              Se aplican automáticamente en todas las rutas de onboarding, sin excepción. Los jefes de área y colaboradores no pueden eliminarlas.
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
                    Editar inducción general
                  </button>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    Abre el editor para modificar actividades y tareas
                  </span>
                </div>
              </>
            ) : (
              <div style={{
                borderRadius: 12, border: '1.5px dashed #e2e8f0',
                background: '#fafbfc', padding: '24px',
                display: 'flex', alignItems: 'center', gap: 24,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Shield size={22} style={{ color: '#94a3b8' }} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40', marginBottom: 4 }}>
                    Aún no tienes una inducción general
                  </div>
                  <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.55, margin: '0 0 12px' }}>
                    Define las etapas y tareas que todos los nuevos colaboradores deben completar sin importar su área — bienvenida, documentación, cultura, etc.
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['👋 Bienvenida', '📄 Documentación', '🎯 Cultura'].map(tag => (
                      <span key={tag} style={{
                        fontSize: 10, fontWeight: 600, color: '#475569',
                        background: '#f1f5f9', border: '1px solid #e2e8f0',
                        padding: '3px 10px', borderRadius: 20,
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setEditingTronco(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '10px 18px', borderRadius: 10, border: 'none',
                    background: '#0C2D40', color: '#fff', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                    flexShrink: 0, whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(12,45,64,.2)',
                  }}
                >
                  <Shield size={13} />
                  Crear inducción
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ASIGNACIÓN DE RUTA */}
      <div style={{
        background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
        padding: '20px 24px', marginBottom: 16,
      }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
          onClick={() => setAsignacionExpanded(!asignacionExpanded)}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#0C2D40', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Route size={17} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0C2D40' }}>Asignación de ruta</div>
            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>
              ¿Cómo y cuándo se asigna la ruta al nuevo colaborador?
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: '#475569', background: '#f1f5f9',
              padding: '3px 10px', borderRadius: 6,
            }}>
              {asignacion === 'manual' ? 'Manual' : 'Automática'}
            </span>
            {asignacionExpanded
              ? <ChevronDown size={16} style={{ color: '#94a3b8' }} />
              : <ChevronRight size={16} style={{ color: '#94a3b8' }} />}
          </div>
        </div>

        {asignacionExpanded && (
        <div style={{ marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>

        {/* OPCIONES */}
        <div style={{
          borderRadius: 12, border: '1.5px dashed #e2e8f0',
          background: '#fafbfc', padding: '14px',
          marginBottom: asignacion === 'auto' ? 12 : 0,
        }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>
            Selecciona cómo se asigna la ruta al colaborador:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {modoAsignacion.map(m => {
              const selected = asignacion === m.key
              return (
                <button
                  key={m.key}
                  onClick={() => { updateAsignacion(m.key); if (m.key === 'auto') updateActivacion('fecha') }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 14px', borderRadius: 10,
                    background: selected ? '#fff' : 'transparent',
                    border: `1px solid ${selected ? '#e2e8f0' : 'transparent'}`,
                    boxShadow: selected ? '0 1px 4px rgba(0,0,0,.06)' : 'none',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#f1f5f9' }}
                  onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${selected ? '#0C2D40' : '#d1d5db'}`,
                    background: selected ? '#0C2D40' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .2s',
                  }}>
                    {selected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40', marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.4 }}>{m.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* HORA — solo si es automática */}
        {asignacion === 'auto' && (
          <div style={{
            borderRadius: 12, border: '1.5px dashed #e2e8f0',
            background: '#fafbfc', padding: '18px',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12, flexShrink: 0,
              background: '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Clock size={20} style={{ color: '#94a3b8' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40', marginBottom: 3 }}>
                Hora de asignación automática
              </div>
              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.55, marginBottom: 12 }}>
                El sistema asignará la ruta a las <strong style={{ color: '#0C2D40' }}>{horaAsignacion} hrs</strong> del día de ingreso, según el área y cargo configurados en cada ruta.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <input
                  type="time"
                  value={horaAsignacion}
                  onChange={e => updateHora(e.target.value)}
                  style={{
                    padding: '7px 12px', borderRadius: 8,
                    border: '1.5px solid #e2e8f0',
                    fontSize: 14, fontFamily: 'inherit', fontWeight: 700, color: '#0C2D40',
                    outline: 'none', background: '#fff', cursor: 'pointer',
                    letterSpacing: '.04em',
                  }}
                  onFocus={e => e.target.style.borderColor = '#0C2D40'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <span style={{ fontSize: 11, color: '#94a3b8' }}>hora del día de ingreso</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={11} style={{ color: '#d97706', flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: '#92400e' }}>
                  Si la fecha ya pasó, asigna manualmente desde <strong>Asignaciones</strong> o <strong>Colaboradores</strong>.
                </span>
              </div>
            </div>
          </div>
        )}

        </div>
        )}
      </div>

      {/* AJUSTES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {config.map(c => {
          const Icon = c.icon
          const hasDefaults = ['buddy', 'menciones', 'riesgo', 'extension'].includes(c.key)
          const isExpanded = expandedCard === c.key && hasDefaults && c.enabled
          return (
            <div
              key={c.key}
              style={{
                background: '#fff', borderRadius: 14,
                border: '1px solid #e2e8f0',
                overflow: 'hidden', transition: 'all .2s',
              }}
            >
              {/* HEADER */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '18px 20px', cursor: hasDefaults && c.enabled ? 'pointer' : 'default',
                }}
                onClick={() => hasDefaults && c.enabled && setExpandedCard(isExpanded ? null : c.key)}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: c.enabled ? '#0C2D40' : '#e2e8f0',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'background .2s',
                }}>
                  <Icon size={17} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: c.enabled ? '#0C2D40' : '#94a3b8' }}>{c.label}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, lineHeight: 1.4 }}>{c.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                    color: c.enabled ? '#16a34a' : '#94a3b8',
                    background: c.enabled ? '#dcfce7' : '#f1f5f9',
                  }}>
                    {c.enabled ? 'Activo' : 'Inactivo'}
                  </span>
                  <div
                    onClick={e => { e.stopPropagation(); requestToggle(c.key) }}
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

              {/* CONTENIDO EXPANDIDO */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 20px 18px' }}>

                  {c.key === 'buddy' && (
                    <div style={{
                      borderRadius: 12, border: '1.5px dashed #e2e8f0',
                      background: '#fafbfc', padding: '18px',
                      display: 'flex', alignItems: 'center', gap: 16,
                    }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                        background: '#f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Bot size={22} style={{ color: '#94a3b8' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40', marginBottom: 3 }}>
                          {c.defaults.modelo}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.55, marginBottom: 10 }}>
                          Responde preguntas de los colaboradores usando los documentos de tu Biblioteca de recursos.
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <AlertCircle size={11} style={{ color: '#d97706', flexShrink: 0 }} />
                          <span style={{ fontSize: 10, color: '#92400e' }}>
                            Necesita al menos un documento en la Biblioteca para funcionar.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {c.key === 'menciones' && (
                    <div style={{ borderRadius: 12, border: '1.5px dashed #e2e8f0', background: '#fafbfc', overflow: 'hidden' }}>
                      <div style={{ padding: '12px 16px 8px' }}>
                        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>
                          Publica automáticamente en el muro cuando ocurre:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {c.defaults.menciones.map((m, i) => (
                            <button key={m.key} onClick={() => toggleSubItem('menciones', 'menciones', i)} style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '10px 12px', borderRadius: 10,
                              background: m.activo ? '#fff' : 'transparent',
                              border: `1px solid ${m.activo ? '#e2e8f0' : 'transparent'}`,
                              boxShadow: m.activo ? '0 1px 4px rgba(0,0,0,.05)' : 'none',
                              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                              transition: 'all .15s',
                            }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                background: m.activo ? '#f1f5f9' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all .15s',
                              }}>
                                <Megaphone size={14} style={{ color: m.activo ? '#0C2D40' : '#cbd5e1' }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: m.activo ? '#0C2D40' : '#94a3b8' }}>{m.label}</div>
                                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{m.desc}</div>
                              </div>
                              <div style={{
                                width: 36, height: 20, borderRadius: 99, flexShrink: 0,
                                background: m.activo ? '#10DC97' : '#e2e8f0',
                                padding: 2, display: 'flex', alignItems: 'center',
                                transition: 'background .2s',
                              }}>
                                <div style={{
                                  width: 16, height: 16, borderRadius: '50%', background: '#fff',
                                  boxShadow: '0 1px 3px rgba(0,0,0,.15)',
                                  transform: m.activo ? 'translateX(16px)' : 'translateX(0)',
                                  transition: 'transform .2s',
                                }} />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {c.key === 'riesgo' && (
                    <div style={{
                      borderRadius: 12, border: '1.5px dashed #e2e8f0',
                      background: '#fafbfc', padding: '18px',
                      display: 'flex', alignItems: 'center', gap: 16,
                    }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                        background: '#f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <AlertTriangle size={20} style={{ color: '#94a3b8' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40', marginBottom: 3 }}>
                          Umbral de inactividad
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.55, marginBottom: 12 }}>
                          Un colaborador se marca como "en riesgo" cuando lleva este número de días sin actividad.
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input
                            type="number"
                            defaultValue={c.defaults.dias}
                            min={1} max={30}
                            style={{
                              width: 60, padding: '7px 0', borderRadius: 8,
                              border: '1.5px solid #e2e8f0', textAlign: 'center',
                              fontSize: 18, fontWeight: 800, fontFamily: 'inherit',
                              color: '#0C2D40', outline: 'none', background: '#fff',
                            }}
                            onFocus={e => e.target.style.borderColor = '#0C2D40'}
                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                          />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>días sin actividad</div>
                            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>Cada ruta puede ajustar este valor.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {c.key === 'extension' && (
                    <div style={{
                      borderRadius: 12, border: '1.5px dashed #e2e8f0',
                      background: '#fafbfc', padding: '18px',
                      display: 'flex', alignItems: 'center', gap: 16,
                    }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                        background: '#f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Clock size={20} style={{ color: '#94a3b8' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40', marginBottom: 3 }}>
                          Extensión libre por jefes de área
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.55, marginBottom: 12 }}>
                          Los jefes de área pueden ampliar el plazo de las rutas de sus colaboradores sin necesitar aprobación de RR.HH.
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {['✅ Jefe extiende directo', '🚫 Sin solicitar a RR.HH.', '📋 Queda en el historial'].map(tag => (
                            <span key={tag} style={{
                              fontSize: 10, fontWeight: 600, color: '#475569',
                              background: '#f1f5f9', border: '1px solid #e2e8f0',
                              padding: '3px 10px', borderRadius: 20,
                            }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* MODAL CONFIRMACIÓN TOGGLE */}
      {toggleConfirm && (
        <div className="pl-overlay" onClick={() => setToggleConfirm(null)}>
          <div className="pl-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="pl-modal-header">
              <h2>{toggleConfirm.willEnable ? 'Activar' : 'Desactivar'} {toggleConfirm.label}</h2>
              <button className="pl-modal-close" onClick={() => setToggleConfirm(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="pl-modal-body">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                padding: '12px 14px', borderRadius: 10,
                background: toggleConfirm.willEnable ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${toggleConfirm.willEnable ? '#bbf7d0' : '#fecaca'}`,
              }}>
                <Info size={16} style={{ color: toggleConfirm.willEnable ? '#16a34a' : '#ef4444', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: toggleConfirm.willEnable ? '#166534' : '#991b1b' }}>
                  {toggleConfirm.willEnable ? 'Esta función se activará para toda la empresa' : 'Esta función se desactivará para toda la empresa'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                {toggleConfirm.message}
              </p>
            </div>
            <div className="pl-modal-footer">
              <button className="pl-btn-cancel" onClick={() => setToggleConfirm(null)}>Cancelar</button>
              <button
                onClick={confirmToggle}
                style={{
                  padding: '9px 20px', borderRadius: 10, border: 'none',
                  background: toggleConfirm.willEnable ? '#10DC97' : '#ef4444',
                  color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 13, fontWeight: 700,
                }}
              >
                {toggleConfirm.willEnable ? 'Activar' : 'Desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
