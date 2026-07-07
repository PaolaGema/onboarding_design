import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { House, Calendar, UserRound, MessageCircleMore, ClipboardCheck, Settings, LogOut, Rocket, Folder, Menu, ChevronsRight, Database, RotateCcw, AlertTriangle, X } from 'lucide-react'
import { useUser } from '../../context/UserContext'
import { useTheme } from '../../context/ThemeContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import logoOscuro from '../../assets/imagenes/logo_souly_oscuro.png'
import logoClaro from '../../assets/imagenes/logo_souly_claro.png'

const allNavItems = [
  { icon: House, label: 'Inicio', path: null, roles: ['admin', 'manager', 'auxiliar', 'colaborador'] },
  { icon: Calendar, label: 'Mi calendario', path: null, roles: ['admin', 'manager', 'auxiliar', 'colaborador'] },
  { icon: UserRound, label: 'Gestión de personas', path: '/personas/colaboradores', roles: ['admin', 'manager'] },
  { icon: Rocket, label: 'Onboarding', path: '/onboarding', roles: ['admin', 'manager', 'auxiliar', 'colaborador'] },
  { icon: MessageCircleMore, label: 'Comunicación', path: null, roles: ['admin', 'manager', 'auxiliar', 'colaborador'] },
  { icon: ClipboardCheck, label: 'Evaluación', path: null, roles: ['admin', 'manager', 'auxiliar', 'colaborador'] },
  { icon: Folder, label: 'Mis archivos', path: '/archivos', roles: ['admin'] },
]

const bottomItems = [
  { icon: Settings, label: 'Configuración', path: null },
  { icon: LogOut, label: 'Cerrar sesión', variant: 'logout', path: null },
]

function NavItem({ icon: Icon, label, active, expanded, variant, onClick }) {
  const isLogout = variant === 'logout'

  const base = isLogout
    ? 'text-gray-400 hover:bg-red-50 hover:text-red-500 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 border-l-2 border-transparent'
    : active
      ? 'bg-[#0C2D40] text-white border-l-2 border-transparent dark:border-[#00E091]'
      : 'text-[#7C93A6] hover:bg-gray-100 hover:text-[#0C2D40] dark:text-[#7C8EA3] dark:hover:bg-[#163041] dark:hover:text-white border-l-2 border-transparent'

  const iconColor = isLogout ? undefined : (active ? '#00E091' : undefined)

  if (!expanded) {
    return (
      <button
        title={label}
        onClick={onClick}
        className={`w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer font-inherit
          transition-colors duration-150 ${base}`}
      >
        <Icon size={19} strokeWidth={active ? 2.2 : 1.8} color={iconColor} />
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      style={{ paddingLeft: 26, paddingRight: 12 }}
      className={`h-10 flex items-center gap-3 rounded-lg w-full cursor-pointer font-inherit
        transition-colors duration-150 ${base}`}
    >
      <Icon size={19} strokeWidth={active ? 2.2 : 1.8} color={iconColor} className="shrink-0" />
      <span className={`text-[13px] whitespace-nowrap ${active ? 'font-semibold' : 'font-medium'}`}>
        {label}
      </span>
    </button>
  )
}

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useUser()
  const { theme } = useTheme()
  const { resetDemo, loadSampleData } = useOnboardingData()
  const navItems = allNavItems.filter(item => item.roles.includes(currentUser.role))
  const isAdmin = currentUser.role === 'admin'

  const [showDemoMenu, setShowDemoMenu] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const demoRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (demoRef.current && !demoRef.current.contains(e.target)) setShowDemoMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function isActive(path) {
    if (!path) return false
    return location.pathname.startsWith(path)
  }

  return (
    <>
    <aside className={`bg-white dark:bg-[#081722] flex flex-col border-r border-gray-200 dark:border-white/[0.06] shrink-0 h-full
      transition-all duration-300 ease-in-out
      ${expanded ? 'w-60' : 'w-16 items-center'}`}
    >
      <div className={`flex items-center shrink-0 h-14 border-b border-gray-100 dark:border-white/[0.06]
        ${expanded ? 'justify-between w-full' : 'justify-center'}`}
      style={expanded ? { paddingLeft: 20, paddingRight: 16 } : undefined}
      >
        {expanded ? (
          <>
            <div className="flex items-center gap-3">
              <img src={theme === 'dark' ? logoClaro : logoOscuro} alt="SoulyHR" className="h-7 w-auto shrink-0 select-none" />
            </div>
            <button
              onClick={() => setExpanded(false)}
              aria-label="Minimizar menú"
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100
                dark:text-slate-500 dark:hover:text-white dark:hover:bg-[#163041]
                rounded-lg transition-all duration-150 cursor-pointer
                hover:rotate-90 active:scale-90"
            >
              <Menu size={18} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setExpanded(true)}
            aria-label="Expandir menú"
            className="group relative w-10 h-10 shrink-0 bg-gradient-to-br from-[#0C2D40] to-[#1a4d6b] rounded-xl
              flex items-center justify-center cursor-pointer shadow-md
              hover:shadow-lg hover:scale-105 active:scale-95
              transition-all duration-200 ease-out"
          >
            <div className="overflow-hidden select-none group-hover:opacity-0 transition-opacity duration-150" style={{ width: 12, height: 24 }}>
              <img src={logoClaro} alt="" className="h-full w-auto" style={{ maxWidth: 'none' }} />
            </div>
            <ChevronsRight
              size={16}
              className="absolute text-white opacity-0 group-hover:opacity-100
                transition-opacity duration-150"
            />
          </button>
        )}
      </div>

      <nav className={`flex flex-col flex-1 gap-1 py-3
        ${expanded ? 'w-full' : 'items-center'}`}
      style={expanded ? { paddingLeft: 8, paddingRight: 8 } : undefined}
      >
        {navItems.map(({ icon, label, path }) => (
          <NavItem
            key={label}
            icon={icon}
            label={label}
            active={isActive(path)}
            expanded={expanded}
            onClick={() => path && navigate(path)}
          />
        ))}
      </nav>

      <div className={`flex flex-col gap-1 py-3 border-t border-gray-100 dark:border-white/[0.06]
        ${expanded ? 'w-full' : 'items-center'}`}
      style={expanded ? { paddingLeft: 8, paddingRight: 8 } : undefined}
      >
        {bottomItems.map(({ icon, label, variant, path }) => {
          if (label === 'Configuración' && isAdmin) {
            return (
              <div key={label} className="relative" ref={demoRef} style={expanded ? { width: '100%' } : undefined}>
                <NavItem
                  icon={icon}
                  label={label}
                  expanded={expanded}
                  onClick={() => setShowDemoMenu(!showDemoMenu)}
                />
                {showDemoMenu && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: expanded ? '100%' : 'calc(100% + 8px)', marginLeft: 8,
                    background: 'var(--surface-card)', borderRadius: 12, padding: 6,
                    boxShadow: 'var(--shadow-card)', zIndex: 50,
                    minWidth: 220, animation: 'plSlideUp .12s',
                  }}>
                    <div style={{ padding: '8px 12px 6px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.03em' }}>
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
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Database size={14} style={{ color: 'var(--blue)' }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-heading)' }}>Cargar datos de ejemplo</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Llena el sistema con datos ficticios</div>
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
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--red-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <RotateCcw size={14} style={{ color: 'var(--red)' }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)' }}>Resetear demo</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Borra todo y vuelve al inicio</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )
          }
          return (
            <NavItem
              key={label}
              icon={icon}
              label={label}
              expanded={expanded}
              variant={variant}
              onClick={() => path && navigate(path)}
            />
          )
        })}
      </div>
    </aside>

    {/* MODAL RESETEAR */}
    {showResetConfirm && (
      <div className="pl-overlay" style={{ zIndex: 60 }} onClick={() => setShowResetConfirm(false)}>
        <div className="pl-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
          <div className="pl-modal-header">
            <h2>Resetear demo</h2>
            <button className="pl-modal-close" onClick={() => setShowResetConfirm(false)}><X size={18} /></button>
          </div>
          <div className="pl-modal-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '12px 14px', borderRadius: 10, background: 'var(--red-bg)', border: '1px solid var(--border-soft)' }}>
              <AlertTriangle size={16} style={{ color: 'var(--red)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)' }}>Esta acción no se puede deshacer</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Se borrarán todas las configuraciones, rutas, recursos, asignaciones y el historial de actividad. El sistema volverá al estado inicial vacío.
            </p>
          </div>
          <div className="pl-modal-footer">
            <button className="pl-btn-cancel" onClick={() => setShowResetConfirm(false)}>Cancelar</button>
            <button onClick={() => { resetDemo(); setShowResetConfirm(false) }} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '12px 14px', borderRadius: 10, background: 'var(--blue-bg)', border: '1px solid var(--border-soft)' }}>
              <Database size={16} style={{ color: 'var(--blue)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue)' }}>Se reemplazará cualquier dato existente</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
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
    </>
  )
}
