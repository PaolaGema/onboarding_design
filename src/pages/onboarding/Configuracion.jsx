import { useState, useRef } from 'react'
import { useConfig } from '../../context/ConfigContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import {
  Trophy, Bot, Megaphone, AlertTriangle, Info,
  Route, Zap,
  Pencil,
  Clock, AlertCircle, X, Award, Upload, Eye, Trash2
} from 'lucide-react'

const toggleMessages = {
  gamificacion: {
    activar: 'Los colaboradores comenzarán a ganar puntos al completar tareas. Las rutas que usen gamificación mostrarán el progreso con puntaje.',
    desactivar: 'Se ocultará el sistema de puntos en todas las rutas. Los colaboradores ya no verán puntos al completar tareas. Las rutas activas no se verán afectadas.',
  },
  buddy: {
    activar: 'Se habilitará el asistente inteligente para todos los colaboradores. Podrán hacer preguntas y recibir respuestas basadas en Recursos corporativos.',
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
  certificado: {
    activar: 'Al graduarse, los colaboradores podrán ver y descargar su certificado de finalización de onboarding.',
    desactivar: 'Los colaboradores que se gradúen ya no recibirán un certificado. Los certificados ya emitidos no se eliminarán.',
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
    desc: 'Un asistente inteligente que responde preguntas del colaborador basándose en Recursos corporativos.',
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
    enabled: true,
    defaults: {},
  },
  {
    key: 'certificado',
    label: 'Certificado de graduación',
    desc: 'Otorga un certificado digital al colaborador cuando termina su ruta de onboarding.',
    icon: Award,
    color: '#f97316',
    enabled: true,
    defaults: {
      color: '#0C2D40',
      logo: null,
      firmas: [
        { nombre: '', cargo: '' },
        { nombre: '', cargo: '' },
      ],
    },
  },
]

function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean
  const r = parseInt(full.substring(0, 2), 16)
  const g = parseInt(full.substring(2, 4), 16)
  const b = parseInt(full.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const cornerStyle = (top, right, bottom, left, color) => ({
  position: 'absolute',
  top: top ?? 'auto', right: right ?? 'auto', bottom: bottom ?? 'auto', left: left ?? 'auto',
  width: 22, height: 22,
  borderTop: top !== undefined ? `2px solid ${color}` : 'none',
  borderBottom: bottom !== undefined ? `2px solid ${color}` : 'none',
  borderLeft: left !== undefined ? `2px solid ${color}` : 'none',
  borderRight: right !== undefined ? `2px solid ${color}` : 'none',
})

const modoAsignacion = [
  { key: 'manual', label: 'Manual', desc: 'Un administrador asigna la ruta a cada colaborador desde el módulo de Seguimiento.', icon: Pencil },
  { key: 'auto', label: 'Automática', desc: 'El sistema asigna la ruta automáticamente en la fecha de ingreso, según el área y cargo.', icon: Zap },
]

export default function Configuracion() {
  const { configToggles, setConfigToggles, plantillas: allPlantillas } = useOnboardingData()
  const [config, setConfig] = useState(() =>
    initialConfig.map(c => ({ ...c, enabled: configToggles[c.key] ?? c.enabled }))
  )
  const [asignacion, setAsignacion] = useState(configToggles.asignacion || 'manual')
  const [horaAsignacion, setHoraAsignacion] = useState(configToggles.horaAsignacion || '08:00')
  const { setGamificacion, setAsistenteIA } = useConfig()
  const [toggleConfirm, setToggleConfirm] = useState(null)
  const [certPreview, setCertPreview] = useState(false)
  const logoInputRef = useRef(null)

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
    setToggleConfirm(null)
  }

  function updateAsignacion(val) {
    setAsignacion(val)
    setConfigToggles(ct => ({ ...ct, asignacion: val }))
  }

  function updateHora(val) {
    setHoraAsignacion(val)
    setConfigToggles(ct => ({ ...ct, horaAsignacion: val }))
  }

  function updateCertColor(color) {
    setConfig(prev => prev.map(c => c.key === 'certificado' ? { ...c, defaults: { ...c.defaults, color } } : c))
  }

  function updateCertLogo(file) {
    if (!file) return
    const url = URL.createObjectURL(file)
    setConfig(prev => prev.map(c => c.key === 'certificado' ? { ...c, defaults: { ...c.defaults, logo: url } } : c))
  }

  function removeCertLogo() {
    setConfig(prev => prev.map(c => c.key === 'certificado' ? { ...c, defaults: { ...c.defaults, logo: null } } : c))
  }

  function updateFirma(idx, field, value) {
    setConfig(prev => prev.map(c => {
      if (c.key !== 'certificado') return c
      const firmas = c.defaults.firmas.map((f, i) => i === idx ? { ...f, [field]: value } : f)
      return { ...c, defaults: { ...c.defaults, firmas } }
    }))
  }

  function toggleSubItem(configKey, listKey, idx) {
    setConfig(prev => prev.map(c => {
      if (c.key !== configKey) return c
      const list = [...c.defaults[listKey]]
      list[idx] = { ...list[idx], activo: !list[idx].activo }
      return { ...c, defaults: { ...c.defaults, [listKey]: list } }
    }))
  }

  return (
    <div className="content-scroll">

      <div className="pl-header">
        <div>
          <h1 className="pl-title">Configuración avanzada</h1>
          <p className="pl-subtitle">Define los valores por defecto para toda la empresa. Las rutas pueden personalizar o heredar cada ajuste.</p>
        </div>
      </div>

      {/* INFO BANNER */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--blue-bg)', border: 'none',
        borderRadius: 12, padding: '14px 18px', marginBottom: 20,
      }}>
        <Info size={18} style={{ color: 'var(--blue)', flexShrink: 0 }} />
        <div style={{ fontSize: 12, color: 'var(--blue)', lineHeight: 1.5 }}>
          Lo que configures aquí son los valores por defecto para toda la empresa. Cada ruta puede heredarlos, personalizarlos o desactivarlos — pero si apagas algo aquí, ninguna ruta podrá usarlo.
        </div>
      </div>

      {/* ASIGNACIÓN DE RUTA */}
      <div style={{
        background: 'var(--surface-card)', borderRadius: 16, boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--border-soft)', padding: '18px 22px', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: '#0C2D40', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Route size={15} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-heading)' }}>Asignación de ruta</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>
              ¿Cómo y cuándo se asigna la ruta al nuevo colaborador?
            </div>
          </div>
        </div>

        {/* SEGMENTED CONTROL */}
        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 10, background: 'var(--input-bg)', border: '1px solid var(--border-soft)' }}>
          {modoAsignacion.map(m => {
            const selected = asignacion === m.key
            const Icon = m.icon
            return (
              <button
                key={m.key}
                onClick={() => updateAsignacion(m.key)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '9px 12px', borderRadius: 7, border: 'none',
                  background: selected ? 'var(--surface-card)' : 'transparent',
                  boxShadow: selected ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700,
                  color: selected ? 'var(--text-heading)' : 'var(--text-muted)',
                  transition: 'all .15s',
                }}
              >
                <Icon size={13} />
                {m.label}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 9, padding: '0 2px' }}>
          <Info size={11} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {modoAsignacion.find(m => m.key === asignacion)?.desc}
          </span>
        </div>

        {/* HORA — solo si es automática */}
        {asignacion === 'auto' && (
          <div style={{
            marginTop: 12, borderRadius: 10, border: '1px solid var(--border-soft)',
            background: 'var(--input-bg)', padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          }}>
            <Clock size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1, minWidth: 160 }}>
              Se asigna a las <strong style={{ color: 'var(--text-heading)' }}>{horaAsignacion}</strong> del día de ingreso, según área y cargo.
            </span>
            <input
              type="time"
              value={horaAsignacion}
              onChange={e => updateHora(e.target.value)}
              style={{
                padding: '5px 10px', borderRadius: 7,
                border: '1.5px solid var(--border-soft)',
                fontSize: 12.5, fontFamily: 'inherit', fontWeight: 700, color: 'var(--text-heading)',
                outline: 'none', background: 'var(--surface-card)', cursor: 'pointer',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--focus)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
            />
          </div>
        )}
      </div>

      {/* AJUSTES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {config.map(c => {
          const Icon = c.icon
          const hasDefaults = ['buddy', 'menciones', 'riesgo', 'extension', 'certificado'].includes(c.key)
          const isExpanded = hasDefaults && c.enabled
          return (
            <div
              key={c.key}
              style={{
                background: 'var(--surface-card)', borderRadius: 16,
                boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-soft)',
                overflow: 'hidden', transition: 'all .2s',
              }}
            >
              {/* HEADER */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: c.enabled ? '#0C2D40' : 'var(--surface-hover)',
                  color: c.enabled ? '#fff' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'background .2s',
                }}>
                  <Icon size={17} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: c.enabled ? 'var(--text-heading)' : 'var(--text-muted)' }}>{c.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{c.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                    color: c.enabled ? 'var(--green)' : 'var(--text-muted)',
                    background: c.enabled ? 'var(--green-tint)' : 'var(--surface-hover)',
                  }}>
                    {c.enabled ? 'Activo' : 'Inactivo'}
                  </span>
                  <div
                    onClick={() => requestToggle(c.key)}
                    style={{
                      width: 40, height: 22, borderRadius: 99,
                      background: c.enabled ? '#00E091' : 'var(--surface-hover)',
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
                </div>
              </div>

              {/* CONTENIDO EXPANDIDO */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--surface-hover)', padding: '16px 20px 18px' }}>

                  {c.key === 'buddy' && (
                    <div style={{
                      borderRadius: 12, border: '1.5px dashed var(--border-dark)',
                      background: 'var(--input-bg)', padding: '18px',
                      display: 'flex', alignItems: 'center', gap: 16,
                    }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                        background: 'var(--surface-hover)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Bot size={22} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 3 }}>
                          {c.defaults.modelo}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 10 }}>
                          Responde preguntas de los colaboradores usando los documentos de tus Recursos corporativos.
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <AlertCircle size={11} style={{ color: 'var(--yellow)', flexShrink: 0 }} />
                          <span style={{ fontSize: 10, color: 'var(--yellow)' }}>
                            Necesita al menos un documento en la Biblioteca para funcionar.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {c.key === 'menciones' && (
                    <div style={{ borderRadius: 12, border: '1.5px dashed var(--border-dark)', background: 'var(--input-bg)', overflow: 'hidden' }}>
                      <div style={{ padding: '12px 16px 8px' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                          Publica automáticamente en el muro cuando ocurre:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {c.defaults.menciones.map((m, i) => (
                            <button key={m.key} onClick={() => toggleSubItem('menciones', 'menciones', i)} style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '10px 12px', borderRadius: 10,
                              background: m.activo ? 'var(--surface-card)' : 'transparent',
                              border: `1px solid ${m.activo ? 'var(--border-soft)' : 'transparent'}`,
                              boxShadow: m.activo ? '0 1px 4px rgba(0,0,0,.05)' : 'none',
                              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                              transition: 'all .15s',
                            }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                background: m.activo ? 'var(--surface-hover)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all .15s',
                              }}>
                                <Megaphone size={14} style={{ color: m.activo ? 'var(--text-heading)' : 'var(--border-dark)' }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: m.activo ? 'var(--text-heading)' : 'var(--text-muted)' }}>{m.label}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{m.desc}</div>
                              </div>
                              <div style={{
                                width: 36, height: 20, borderRadius: 99, flexShrink: 0,
                                background: m.activo ? '#00E091' : 'var(--surface-hover)',
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
                      borderRadius: 12, border: '1.5px dashed var(--border-dark)',
                      background: 'var(--input-bg)', padding: '18px',
                      display: 'flex', alignItems: 'center', gap: 16,
                    }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                        background: 'var(--surface-hover)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <AlertTriangle size={20} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 3 }}>
                          Umbral de inactividad
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 12 }}>
                          Un colaborador se marca como "en riesgo" cuando lleva este número de días sin actividad.
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input
                            type="number"
                            defaultValue={c.defaults.dias}
                            min={1} max={30}
                            style={{
                              width: 60, padding: '7px 0', borderRadius: 8,
                              border: '1.5px solid var(--border-soft)', textAlign: 'center',
                              fontSize: 18, fontWeight: 800, fontFamily: 'inherit',
                              color: 'var(--text-heading)', outline: 'none', background: 'var(--input-bg)',
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--focus)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
                          />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>días sin actividad</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Cada ruta puede ajustar este valor.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {c.key === 'extension' && (
                    <div style={{
                      borderRadius: 12, border: '1.5px dashed var(--border-dark)',
                      background: 'var(--input-bg)', padding: '18px',
                      display: 'flex', alignItems: 'center', gap: 16,
                    }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                        background: 'var(--surface-hover)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Clock size={20} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 3 }}>
                          Extensión libre por jefes de área
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 12 }}>
                          Los jefes de área pueden ampliar el plazo de las rutas de sus colaboradores sin necesitar aprobación de RR.HH.
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {['✅ Jefe extiende directo', '🚫 Sin solicitar a RR.HH.', '📋 Queda en el historial'].map(tag => (
                            <span key={tag} style={{
                              fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
                              background: 'var(--surface-hover)', border: '1px solid var(--border-soft)',
                              padding: '3px 10px', borderRadius: 20,
                            }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {c.key === 'certificado' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                      {/* COLOR + LOGO */}
                      <div style={{ display: 'flex', gap: 14 }}>
                        <div style={{
                          flex: 1, borderRadius: 12, border: '1.5px dashed var(--border-dark)',
                          background: 'var(--input-bg)', padding: '14px',
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 10 }}>Color del certificado</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input
                              type="color"
                              value={c.defaults.color}
                              onChange={e => updateCertColor(e.target.value)}
                              style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0, background: 'none' }}
                            />
                            <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{c.defaults.color}</span>
                          </div>
                        </div>

                        <div style={{
                          flex: 1, borderRadius: 12, border: '1.5px dashed var(--border-dark)',
                          background: 'var(--input-bg)', padding: '14px',
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 10 }}>Logo de la empresa</div>
                          <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={e => { if (e.target.files[0]) updateCertLogo(e.target.files[0]); e.target.value = '' }}
                          />
                          {c.defaults.logo ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fff', border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                <img src={c.defaults.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                              </div>
                              <button onClick={() => logoInputRef.current?.click()} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-heading)', background: 'var(--surface-hover)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>Cambiar</button>
                              <button onClick={removeCertLogo} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border-soft)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)' }}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => logoInputRef.current?.click()} style={{
                              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                              padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-soft)',
                              background: 'var(--surface-card)', cursor: 'pointer', fontFamily: 'inherit',
                              fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)',
                            }}>
                              <Upload size={13} />
                              Subir logo
                            </button>
                          )}
                        </div>
                      </div>

                      {/* FIRMAS */}
                      <div style={{
                        borderRadius: 12, border: '1.5px dashed var(--border-dark)',
                        background: 'var(--input-bg)', padding: '14px',
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 10 }}>Firmas (hasta 2)</div>
                        <div style={{ display: 'flex', gap: 14 }}>
                          {c.defaults.firmas.map((f, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)' }}>Firma {i + 1}{i === 1 ? ' (opcional)' : ''}</span>
                              <input
                                type="text"
                                placeholder="Nombre"
                                value={f.nombre}
                                onChange={e => updateFirma(i, 'nombre', e.target.value)}
                                style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border-soft)', fontSize: 12, fontFamily: 'inherit', outline: 'none', background: 'var(--surface-card)', color: 'var(--text-heading)' }}
                                onFocus={e => e.target.style.borderColor = 'var(--focus)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
                              />
                              <input
                                type="text"
                                placeholder="Cargo"
                                value={f.cargo}
                                onChange={e => updateFirma(i, 'cargo', e.target.value)}
                                style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border-soft)', fontSize: 12, fontFamily: 'inherit', outline: 'none', background: 'var(--surface-card)', color: 'var(--text-heading)' }}
                                onFocus={e => e.target.style.borderColor = 'var(--focus)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => setCertPreview(true)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border-soft)',
                          background: 'var(--surface-card)', cursor: 'pointer', fontFamily: 'inherit',
                          fontSize: 12.5, fontWeight: 700, color: 'var(--text-heading)', alignSelf: 'flex-start',
                        }}
                      >
                        <Eye size={14} />
                        Ver certificado
                      </button>
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
                background: toggleConfirm.willEnable ? 'var(--green-tint)' : 'var(--red-bg)',
                border: '1px solid var(--border-soft)',
              }}>
                <Info size={16} style={{ color: toggleConfirm.willEnable ? 'var(--green)' : 'var(--red)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: toggleConfirm.willEnable ? 'var(--green)' : 'var(--red)' }}>
                  {toggleConfirm.willEnable ? 'Esta función se activará para toda la empresa' : 'Esta función se desactivará para toda la empresa'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                {toggleConfirm.message}
              </p>
            </div>
            <div className="pl-modal-footer">
              <button className="pl-btn-cancel" onClick={() => setToggleConfirm(null)}>Cancelar</button>
              <button
                onClick={confirmToggle}
                style={{
                  padding: '9px 20px', borderRadius: 10, border: 'none',
                  background: toggleConfirm.willEnable ? '#00E091' : 'var(--red)',
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

      {/* MODAL PREVIEW CERTIFICADO */}
      {certPreview && (() => {
        const cert = config.find(c => c.key === 'certificado').defaults
        const firmasActivas = cert.firmas.filter(f => f.nombre.trim())
        const fechaEmision = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
        const rutaEjemplo = allPlantillas.find(p => p.status === 'activa')?.name || 'Ejecutiva Comercial · Ventas'
        const ink = '#26241f'

        return (
          <div className="pl-overlay" onClick={() => setCertPreview(false)}>
            <div className="pl-modal" style={{ width: 720, maxWidth: '94vw' }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <h2>Vista previa del certificado</h2>
                <button className="pl-modal-close" onClick={() => setCertPreview(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className="pl-modal-body">

                {/* MARCO EXTERIOR */}
                <div style={{
                  padding: 7,
                  border: `1px solid ${hexToRgba(cert.color, .45)}`,
                  borderRadius: 4,
                  background: '#FBF8F2',
                }}>
                  {/* MARCO INTERIOR + CONTENIDO */}
                  <div style={{
                    position: 'relative',
                    border: `1.5px solid ${cert.color}`,
                    padding: '46px 54px 38px',
                    textAlign: 'center',
                    overflow: 'hidden',
                    backgroundImage: `radial-gradient(${hexToRgba(cert.color, .07)} 1px, transparent 1px)`,
                    backgroundSize: '14px 14px',
                    backgroundPosition: 'center',
                  }}>
                    {/* esquinas ornamentales */}
                    <div style={cornerStyle(8, undefined, undefined, 8, cert.color)} />
                    <div style={cornerStyle(8, 8, undefined, undefined, cert.color)} />
                    <div style={cornerStyle(undefined, undefined, 8, 8, cert.color)} />
                    <div style={cornerStyle(undefined, 8, 8, undefined, cert.color)} />

                    {cert.logo ? (
                      <img src={cert.logo} alt="Logo" style={{ display: 'block', maxHeight: 38, maxWidth: 150, objectFit: 'contain', margin: '0 auto 16px' }} />
                    ) : (
                      <div style={{ height: 6 }} />
                    )}

                    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.32em', textTransform: 'uppercase', color: cert.color }}>
                      Certificado de finalización
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '14px 0' }}>
                      <div style={{ width: 34, height: 1, background: hexToRgba(cert.color, .5) }} />
                      <div style={{ width: 5, height: 5, borderRadius: 1, background: cert.color, transform: 'rotate(45deg)' }} />
                      <div style={{ width: 34, height: 1, background: hexToRgba(cert.color, .5) }} />
                    </div>

                    <div style={{ fontSize: 12.5, fontStyle: 'italic', fontFamily: "'Playfair Display', serif", color: '#8a8474' }}>
                      Se otorga el presente reconocimiento a
                    </div>

                    <div style={{
                      fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 34,
                      color: ink, margin: '14px 0 18px', lineHeight: 1.15, whiteSpace: 'nowrap',
                    }}>
                      Camila Herrera
                    </div>

                    <div style={{ fontSize: 12.5, color: '#5c5748', lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
                      por haber completado exitosamente la ruta de onboarding<br />
                      <strong style={{ color: ink }}>{rutaEjemplo}</strong>
                    </div>

                    {/* FIRMAS + SELLO */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 56, marginTop: 50 }}>
                      {firmasActivas[0] ? (
                        <div style={{ textAlign: 'center', width: 150, flexShrink: 0 }}>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 600, fontSize: 17, color: ink, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {firmasActivas[0].nombre}
                          </div>
                          <div style={{ borderTop: `1px solid ${hexToRgba(cert.color, .5)}`, paddingTop: 5 }}>
                            {firmasActivas[0].cargo && (
                              <div style={{ fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: '#8a8474', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{firmasActivas[0].cargo}</div>
                            )}
                          </div>
                        </div>
                      ) : <div style={{ width: 150, flexShrink: 0 }} />}

                      {/* SELLO */}
                      <div style={{
                        width: 54, height: 54, borderRadius: '50%', flexShrink: 0,
                        background: `radial-gradient(circle at 35% 30%, ${hexToRgba(cert.color, .9)}, ${cert.color})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 3px 10px ${hexToRgba(cert.color, .35)}`,
                        border: `1px solid ${hexToRgba('#ffffff', .5)}`,
                      }}>
                        <Award size={24} style={{ color: '#fff' }} />
                      </div>

                      {firmasActivas[1] ? (
                        <div style={{ textAlign: 'center', width: 150, flexShrink: 0 }}>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 600, fontSize: 17, color: ink, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {firmasActivas[1].nombre}
                          </div>
                          <div style={{ borderTop: `1px solid ${hexToRgba(cert.color, .5)}`, paddingTop: 5 }}>
                            {firmasActivas[1].cargo && (
                              <div style={{ fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: '#8a8474', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{firmasActivas[1].cargo}</div>
                            )}
                          </div>
                        </div>
                      ) : <div style={{ width: 150, flexShrink: 0 }} />}
                    </div>

                    {firmasActivas.length === 0 && (
                      <div style={{ fontSize: 10.5, color: '#b0aa96', fontStyle: 'italic', marginTop: 8 }}>Sin firmas configuradas</div>
                    )}

                    <div style={{ fontSize: 9, color: '#b0aa96', letterSpacing: '.05em', marginTop: 30 }}>
                      Emitido el {fechaEmision} · Folio OB-{new Date().getFullYear()}-0001
                    </div>
                  </div>
                </div>

              </div>
              <div className="pl-modal-footer">
                <button className="pl-btn-cancel" onClick={() => setCertPreview(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        )
      })()}

    </div>
  )
}
