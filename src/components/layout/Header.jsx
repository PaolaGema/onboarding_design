import { Menu, Sun, Moon, Bell, ChevronDown, ArrowRightLeft, Rocket, Check, Shield, Settings2, BookOpen, FileText, UserPlus, ArrowRight, X, Settings, Database, RotateCcw, AlertTriangle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { useTronco } from '../../context/TroncoContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'

export default function Header({ floating }) {
  const [darkMode, setDarkMode] = useState(false)
  const [showSwitcher, setShowSwitcher] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const { currentUser, setCurrentUser, users } = useUser()
  const { tronco } = useTronco()
  const { configToggles, recursos, plantillas, asignaciones, resetDemo, loadSampleData } = useOnboardingData()
  const [showDemoMenu, setShowDemoMenu] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const demoRef = useRef(null)
  const setupRef = useRef(null)
  const navigate = useNavigate()
  const ref = useRef(null)

  const totalDocs = recursos.reduce((s, c) => s + c.docs.length, 0)
  const setupSteps = [
    { key: 'config', label: 'Configuración', desc: 'Activa las funciones del módulo', icon: Settings2, done: Object.values(configToggles).some(v => v === true), path: '/onboarding/configuracion', action: 'Configurar' },
    { key: 'biblioteca', label: 'Biblioteca de recursos', desc: 'Sube al menos un documento o enlace', icon: BookOpen, done: totalDocs > 0, path: '/onboarding/conocimiento', action: 'Subir' },
    { key: 'rutas', label: 'Rutas de onboarding', desc: 'Crea al menos una ruta con etapas y tareas', icon: FileText, done: plantillas.length > 0, path: '/onboarding/plantillas', action: 'Crear' },
    { key: 'asignacion', label: 'Primera asignación', desc: 'Asigna una ruta a un colaborador', icon: UserPlus, done: asignaciones.length > 0, path: '/onboarding/asignaciones', action: 'Asignar' },
  ]
  const setupCompleted = setupSteps.filter(s => s.done).length
  const setupPct = Math.round((setupCompleted / setupSteps.length) * 100)
  const setupAllDone = setupCompleted === setupSteps.length
  const isAdmin = currentUser.role === 'admin'

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setShowSwitcher(false)
      if (demoRef.current && !demoRef.current.contains(e.target)) setShowDemoMenu(false)
      if (setupRef.current && !setupRef.current.contains(e.target)) setShowSetup(false)
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


        <button
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          title="Notificaciones"
        >
          <Bell className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* SETUP PROGRESS */}
        {isAdmin && !setupAllDone && (
          <div className="relative" ref={setupRef}>
            <button
              onClick={() => setShowSetup(!showSetup)}
              title="Ver progreso de configuración"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 11px 5px 7px', borderRadius: 20,
                background: showSetup ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.1)',
                border: '1px solid rgba(255,255,255,.2)',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.18)'}
              onMouseLeave={e => { if (!showSetup) e.currentTarget.style.background = 'rgba(255,255,255,.1)' }}
            >
              <div style={{ position: 'relative', width: 22, height: 22, flexShrink: 0 }}>
                <svg width="22" height="22" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="11" cy="11" r="9" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="2.5" />
                  <circle cx="11" cy="11" r="9" fill="none" stroke="#10DC97" strokeWidth="2.5"
                    strokeDasharray={`${2 * Math.PI * 9}`}
                    strokeDashoffset={`${2 * Math.PI * 9 * (1 - setupPct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset .4s' }}
                  />
                </svg>
                <span style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 7, fontWeight: 800, color: '#fff', lineHeight: 1,
                }}>
                  {setupCompleted}/{setupSteps.length}
                </span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.85)' }}>Primeros pasos</span>
            </button>

            {showSetup && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                width: 306, background: '#fff', borderRadius: 18,
                boxShadow: '0 24px 64px rgba(0,0,0,.18), 0 0 0 1px rgba(0,0,0,.06)',
                overflow: 'hidden', zIndex: 50, animation: 'fadeInDown .15s ease-out',
              }}>

                {/* ── HEADER GRADIENT ── */}
                <div style={{
                  background: 'linear-gradient(135deg, #0C2D40 0%, #1a4a63 100%)',
                  padding: '18px 20px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-.01em' }}>Primeros pasos</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                        {setupCompleted === 0 ? 'Configura el módulo para empezar' : `${setupCompleted} de ${setupSteps.length} completados`}
                      </div>
                    </div>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'rgba(255,255,255,.08)',
                      border: '2px solid rgba(255,255,255,.12)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#10DC97', lineHeight: 1 }}>{setupCompleted}</span>
                      <span style={{ fontSize: 8, color: 'rgba(255,255,255,.4)', lineHeight: 1, marginTop: 1 }}>/{setupSteps.length}</span>
                    </div>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,.12)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${setupPct}%`,
                      background: 'linear-gradient(90deg, #10DC97 0%, #06b6d4 100%)',
                      borderRadius: 2, transition: 'width .5s cubic-bezier(.4,0,.2,1)',
                    }} />
                  </div>
                </div>

                {/* ── PASOS ── */}
                <div style={{ padding: '8px 10px 4px' }}>
                  {setupSteps.map((step, i) => {
                    const Icon = step.icon
                    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']
                    const bgs = ['#eff6ff', '#d1fae5', '#ede9fe', '#fef3c7']
                    const color = colors[i]
                    const bg = bgs[i]
                    return (
                      <button
                        key={step.key}
                        onClick={() => { if (!step.done) { navigate(step.path); setShowSetup(false) } }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 11,
                          padding: '10px 10px', borderRadius: 12, border: 'none',
                          background: 'transparent', cursor: step.done ? 'default' : 'pointer',
                          fontFamily: 'inherit', textAlign: 'left', transition: 'background .12s',
                          marginBottom: 2,
                        }}
                        onMouseEnter={e => { if (!step.done) e.currentTarget.style.background = bg }}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* icono */}
                        <div style={{
                          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: step.done ? '#d1fae5' : bg,
                          transition: 'all .2s',
                        }}>
                          {step.done
                            ? <Check size={15} style={{ color: '#10b981' }} />
                            : <Icon size={15} style={{ color }} />
                          }
                        </div>

                        {/* texto */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 12, fontWeight: step.done ? 500 : 700,
                            color: step.done ? '#b0b8c4' : '#0C2D40',
                            textDecoration: step.done ? 'line-through' : 'none',
                            marginBottom: step.done ? 0 : 2,
                          }}>
                            {step.label}
                          </div>
                          {!step.done && (
                            <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.4 }}>{step.desc}</div>
                          )}
                        </div>

                        {/* CTA pill */}
                        {!step.done && (
                          <div style={{
                            flexShrink: 0, padding: '5px 11px', borderRadius: 20,
                            background: color + '18',
                            fontSize: 10, fontWeight: 700, color,
                            whiteSpace: 'nowrap', letterSpacing: '.01em',
                          }}>
                            {step.action}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* ── FOOTER ── */}
                <div style={{ padding: '6px 10px 10px' }}>
                  <div style={{
                    padding: '10px 14px', borderRadius: 12,
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)',
                    border: '1px solid #bbf7d0',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <Rocket size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: '#059669', fontWeight: 500, lineHeight: 1.4 }}>
                      Completa los pasos para activar tu módulo de onboarding
                    </span>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* DEMO CONFIG */}
        {isAdmin && (
          <div className="relative" ref={demoRef}>
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              title="Gestión de demo"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
            </button>
            {showDemoMenu && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: '#fff', borderRadius: 12, padding: 6,
                boxShadow: '0 8px 30px rgba(0,0,0,.15)', zIndex: 50,
                minWidth: 220, animation: 'plSlideUp .12s',
              }}>
                <div style={{ padding: '8px 12px 6px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                  Gestión de demo
                </div>
                <button
                  onClick={() => { setShowDemoMenu(false); setShowLoadConfirm(true) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8, border: 'none',
                    background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: 'left', transition: 'background .1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Database size={14} style={{ color: '#3b82f6' }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40' }}>Cargar datos de ejemplo</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Llena el sistema con datos ficticios</div>
                  </div>
                </button>
                <button
                  onClick={() => { setShowDemoMenu(false); setShowResetConfirm(true) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8, border: 'none',
                    background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: 'left', transition: 'background .1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <RotateCcw size={14} style={{ color: '#ef4444' }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#991b1b' }}>Resetear demo</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Borra todo y vuelve al inicio</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

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

      {/* MODAL RESETEAR */}
      {showResetConfirm && (
        <div className="pl-overlay" style={{ zIndex: 60 }} onClick={() => setShowResetConfirm(false)}>
          <div className="pl-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="pl-modal-header">
              <h2>Resetear demo</h2>
              <button className="pl-modal-close" onClick={() => setShowResetConfirm(false)}><X size={18} /></button>
            </div>
            <div className="pl-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '12px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca' }}>
                <AlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#991b1b' }}>Esta acción no se puede deshacer</span>
              </div>
              <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                Se borrarán todas las configuraciones, rutas, recursos, asignaciones y el historial de actividad. El sistema volverá al estado inicial vacío.
              </p>
            </div>
            <div className="pl-modal-footer">
              <button className="pl-btn-cancel" onClick={() => setShowResetConfirm(false)}>Cancelar</button>
              <button onClick={() => { resetDemo() }} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}>
                Resetear todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CARGAR DATOS */}
      {showLoadConfirm && (
        <div className="pl-overlay" style={{ zIndex: 60 }} onClick={() => setShowLoadConfirm(false)}>
          <div className="pl-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="pl-modal-header">
              <h2>Cargar datos de ejemplo</h2>
              <button className="pl-modal-close" onClick={() => setShowLoadConfirm(false)}><X size={18} /></button>
            </div>
            <div className="pl-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '12px 14px', borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <Database size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1e40af' }}>Se reemplazará cualquier dato existente</span>
              </div>
              <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                Se cargarán 10 rutas, 14 asignaciones, 8 recursos y la configuración activa de ejemplo.
              </p>
            </div>
            <div className="pl-modal-footer">
              <button className="pl-btn-cancel" onClick={() => setShowLoadConfirm(false)}>Cancelar</button>
              <button onClick={() => { loadSampleData(); window.location.href = '/onboarding' }} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}>
                Cargar datos
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
