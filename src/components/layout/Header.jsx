import { Menu, Sun, Moon, Bell, ChevronDown, ArrowRightLeft, Rocket, Check, Shield, Settings2, BookOpen, FileText, UserPlus, ArrowRight, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { useTronco } from '../../context/TroncoContext'

export default function Header({ floating }) {
  const [darkMode, setDarkMode] = useState(false)
  const [showSwitcher, setShowSwitcher] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const { currentUser, setCurrentUser, users } = useUser()
  const { tronco } = useTronco()
  const navigate = useNavigate()
  const ref = useRef(null)

  const setupSteps = [
    { key: 'induccion', label: 'Inducción general', desc: 'Configura las tareas obligatorias para todos los colaboradores', icon: Shield, done: tronco.configured, path: '/onboarding/configuracion', action: 'Configurar' },
    { key: 'config', label: 'Configuración global', desc: 'Define los parámetros generales del módulo', icon: Settings2, done: true, path: '/onboarding/configuracion', action: 'Revisar' },
    { key: 'biblioteca', label: 'Biblioteca de recursos', desc: 'Sube al menos un documento o enlace', icon: BookOpen, done: true, path: '/onboarding/conocimiento', action: 'Subir' },
    { key: 'rutas', label: 'Rutas de onboarding', desc: 'Crea al menos una ruta con etapas y tareas', icon: FileText, done: true, path: '/onboarding/plantillas', action: 'Crear' },
    { key: 'asignacion', label: 'Primera asignación', desc: 'Asigna una ruta a un colaborador', icon: UserPlus, done: true, path: '/onboarding/asignaciones', action: 'Asignar' },
  ]
  const setupCompleted = setupSteps.filter(s => s.done).length
  const setupPct = Math.round((setupCompleted / setupSteps.length) * 100)
  const setupAllDone = setupCompleted === setupSteps.length
  const isAdmin = currentUser.role === 'admin'

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setShowSwitcher(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (floating) {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setShowSwitcher(!showSwitcher)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 10,
            background: '#334155', border: '1px solid #475569',
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all .15s',
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: currentUser.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid rgba(255,255,255,.2)',
          }}>
            <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>{currentUser.initials}</span>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{currentUser.name}</div>
            <div style={{ fontSize: 9, color: '#94a3b8' }}>{currentUser.roleLabel}</div>
          </div>
          <ChevronDown size={12} style={{ color: '#94a3b8', transition: 'transform .2s', transform: showSwitcher ? 'rotate(180deg)' : '' }} />
        </button>

        {showSwitcher && (
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            width: 260, background: '#fff', borderRadius: 14,
            boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
            overflow: 'hidden', zIndex: 50, animation: 'fadeInDown .15s ease-out',
          }}>
            <div style={{ padding: '8px 6px' }}>
              {[
                { label: 'Administrador', filter: u => u.role === 'admin' },
                { label: 'Jefe de área', filter: u => u.role === 'manager' },
                { label: 'Auxiliar', filter: u => u.role === 'auxiliar' },
                { label: 'Colaboradores', filter: u => u.role === 'colaborador' },
              ].map((group, gi) => {
                const groupUsers = users.filter(group.filter)
                if (groupUsers.length === 0) return null
                return (
                  <div key={group.label}>
                    {gi > 0 && <div style={{ height: 1, background: '#f1f5f9', margin: '4px 10px' }} />}
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#b0b8c4', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 10px 2px' }}>
                      {group.label}
                    </div>
                    {groupUsers.map(user => {
                      const isActive = user.id === currentUser.id
                      return (
                        <button
                          key={user.id}
                          onClick={() => { setCurrentUser(user); setShowSwitcher(false) }}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 10px', border: 'none',
                            background: isActive ? '#e2e8f0' : 'transparent',
                            borderRadius: 10, cursor: 'pointer', transition: 'background .12s',
                            textAlign: 'left', fontFamily: 'inherit', marginBottom: 2,
                          }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc' }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                        >
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: user.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            border: isActive ? '2px solid #0C2D40' : '2px solid transparent',
                          }}>
                            <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{user.initials}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 600, color: isActive ? '#0C2D40' : '#475569' }}>{user.name}</div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>{user.roleLabel}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
            <div style={{ padding: '8px 18px', borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
              <p style={{ fontSize: 9, color: '#b0b8c4', textAlign: 'center', margin: 0 }}>Simulación de roles · Prototipo UX</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <header className="h-14 bg-[#0C2D40] flex items-center justify-between shrink-0" style={{ paddingLeft: '3rem', paddingRight: '2.5rem' }}>

      <div className="flex items-center gap-3">
        <button
          className="md:hidden text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>
        <div className="hidden md:block">
          <h1 className="text-sm font-semibold text-white">
            {currentUser.role === 'admin' ? 'Panel de onboarding' : currentUser.role === 'manager' ? 'Mi equipo' : 'Mi Onboarding'}
          </h1>
          <p className="text-xs text-white/60">Bienvenido a Trabajito HR</p>
        </div>
      </div>

      <div className="flex items-center gap-3">

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="cursor-pointer inline-flex items-center justify-center size-9 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Cambiar tema"
        >
          <span className="relative w-4 h-4">
            <Sun className={`absolute inset-0 h-4 w-4 transition-all ${darkMode ? '-rotate-90 scale-0' : 'rotate-0 scale-100'}`} aria-hidden="true" />
            <Moon className={`absolute inset-0 h-4 w-4 transition-all ${darkMode ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} aria-hidden="true" />
          </span>
        </button>

        {/* GUÍA DE INICIO */}
        {isAdmin && (
          <button
            onClick={() => setShowSetup(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px 5px 8px', borderRadius: 8,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            <Rocket size={13} style={{ color: '#10DC97' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>Primeros pasos</span>
            {!setupAllDone && (
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                background: '#10DC97', color: '#0C2D40',
                fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{setupCompleted}/{setupSteps.length}</span>
            )}
          </button>
        )}

        <button
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          title="Notificaciones"
        >
          <Bell className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="relative" ref={ref}>
          <button
            className="flex items-center gap-2 p-1.5 text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setShowSwitcher(!showSwitcher)}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-white/30 overflow-hidden"
              style={{ background: currentUser.color }}
            >
              <span className="text-white text-xs font-semibold">{currentUser.initials}</span>
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-xs font-semibold text-white leading-tight">{currentUser.name}</span>
              <span className="text-xs text-white/60 leading-tight">{currentUser.roleLabel}</span>
            </div>
            <ChevronDown className={`w-3 h-3 text-white/60 hidden md:block transition-transform duration-200 ${showSwitcher ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>

          {showSwitcher && (
            <div
              className="user-switcher-dropdown"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: 260,
                background: '#fff',
                borderRadius: 14,
                boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                zIndex: 50,
                animation: 'fadeInDown .15s ease-out',
              }}
            >
              <div style={{ padding: '8px 6px' }}>
                {[
                  { label: 'Administrador', filter: u => u.role === 'admin' },
                  { label: 'Jefe de área', filter: u => u.role === 'manager' },
                  { label: 'Colaboradores', filter: u => u.role === 'colaborador' },
                ].map((group, gi) => {
                  const groupUsers = users.filter(group.filter)
                  if (groupUsers.length === 0) return null
                  return (
                    <div key={group.label}>
                      {gi > 0 && <div style={{ height: 1, background: '#f1f5f9', margin: '4px 10px' }} />}
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#b0b8c4', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 10px 2px' }}>
                        {group.label}
                      </div>
                      {groupUsers.map(user => {
                        const isActive = user.id === currentUser.id
                        return (
                          <button
                            key={user.id}
                            onClick={() => { setCurrentUser(user); setShowSwitcher(false) }}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                              padding: '9px 10px', border: 'none',
                              background: isActive ? '#e2e8f0' : 'transparent',
                              borderRadius: 10, cursor: 'pointer', transition: 'background .12s',
                              textAlign: 'left', fontFamily: 'inherit', marginBottom: 2,
                            }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc' }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                          >
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%', background: user.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              border: isActive ? '2px solid #0C2D40' : '2px solid transparent',
                              transition: 'border-color .15s',
                            }}>
                              <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{user.initials}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 600, color: isActive ? '#0C2D40' : '#475569' }}>{user.name}</div>
                              <div style={{ fontSize: 10, color: '#94a3b8' }}>{user.roleLabel}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div style={{
                padding: '8px 18px',
                borderTop: '1px solid #f1f5f9',
                background: '#fafbfc',
              }}>
                <p style={{ fontSize: 9, color: '#b0b8c4', textAlign: 'center', margin: 0, letterSpacing: '0.02em' }}>
                  Simulación de roles · Prototipo UX
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* DRAWER GUÍA DE INICIO */}
      {showSetup && (
        <>
          <div onClick={() => setShowSetup(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.25)', zIndex: 50,
          }} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
            background: '#fff', zIndex: 51, boxShadow: '-8px 0 30px rgba(0,0,0,.1)',
            display: 'flex', flexDirection: 'column',
            animation: 'slideInRight .2s ease-out',
          }}>
            {/* HEADER DRAWER */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Rocket size={18} style={{ color: '#0C2D40' }} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0C2D40' }}>
                    {setupAllDone ? '¡Todo listo!' : 'Guía de inicio de Onboarding'}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {setupAllDone ? 'Tu módulo está configurado' : `${setupCompleted} de ${setupSteps.length} pasos completados`}
                  </div>
                </div>
              </div>
              <button onClick={() => setShowSetup(false)} style={{
                width: 28, height: 28, borderRadius: 8, border: 'none',
                background: '#f1f5f9', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={14} style={{ color: '#64748b' }} />
              </button>
            </div>

            {/* PROGRESO */}
            <div style={{ padding: '16px 24px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Progreso</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: setupAllDone ? '#10DC97' : '#0C2D40' }}>{setupPct}%</span>
              </div>
              <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${setupPct}%`, background: setupAllDone ? '#10DC97' : '#0C2D40', borderRadius: 99, transition: 'width .5s ease' }} />
              </div>
            </div>

            {/* PASOS */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {setupSteps.map((step, i) => {
                const StepIcon = step.icon
                return (
                  <div key={step.key} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 10,
                    background: step.done ? 'transparent' : '#fff',
                    border: step.done ? '1px solid #f1f5f9' : '1px solid #e2e8f0',
                    opacity: step.done ? 0.6 : 1,
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: step.done ? '#10DC97' : '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {step.done
                        ? <Check size={12} style={{ color: '#fff' }} />
                        : <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>{i + 1}</span>
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: step.done ? '#94a3b8' : '#0C2D40', textDecoration: step.done ? 'line-through' : 'none' }}>{step.label}</div>
                      <div style={{ fontSize: 10, color: '#b0b8c4', lineHeight: 1.4 }}>{step.desc}</div>
                    </div>
                    {!step.done ? (
                      <button onClick={() => { navigate(step.path); setShowSetup(false) }} style={{
                        padding: '5px 10px', borderRadius: 7, border: 'none',
                        background: '#0C2D40', color: '#fff', cursor: 'pointer',
                        fontFamily: 'inherit', fontSize: 10, fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                      }}>
                        {step.action}
                        <ArrowRight size={9} />
                      </button>
                    ) : (
                      <Check size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* FOOTER */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
              <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
                Completa todos los pasos para que tu módulo de onboarding esté listo para recibir colaboradores.
              </p>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
