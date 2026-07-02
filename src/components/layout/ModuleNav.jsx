import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Route, Rocket, BookOpen, Settings, UserRound, Building2, Info } from 'lucide-react'
import { useUser } from '../../context/UserContext'
import { useTheme } from '../../context/ThemeContext'

const sectionInfo = {
  'Administración': 'Opciones para administrar el módulo de onboarding.',
  'Mi espacio': 'Tu onboarding personal como colaborador.',
}
const sectionInfoTitle = {
  'Administración': 'Administración',
  'Mi espacio': 'Mi espacio',
}

const onboardingAdminNav = [
  { section: 'Administración', items: [
    { label: 'Dashboard', path: '/onboarding', icon: LayoutDashboard, end: true },
    { label: 'Seguimiento', path: '/onboarding/asignaciones', icon: Users },
    { label: 'Rutas', path: '/onboarding/plantillas', icon: Route },
    { label: 'Recursos corporativos', path: '/onboarding/conocimiento', icon: BookOpen },
    { label: 'Configuración avanzada', path: '/onboarding/configuracion', icon: Settings },
  ]},
  { section: 'Mi espacio', items: [
    { label: 'Mi Onboarding', path: '/onboarding/mi-onboarding', icon: Rocket },
  ]},
]

const onboardingColabNav = [
  { section: 'Mi espacio', items: [
    { label: 'Mi Onboarding', path: '/onboarding/mi-onboarding', icon: Rocket },
  ]},
]

const onboardingManagerNav = [
  { section: 'Administración', items: [
    { label: 'Dashboard', path: '/onboarding', icon: LayoutDashboard, end: true },
    { label: 'Seguimiento', path: '/onboarding/asignaciones', icon: Users },
    { label: 'Rutas', path: '/onboarding/plantillas', icon: Route },
  ]},
  { section: 'Mi espacio', items: [
    { label: 'Mi Onboarding', path: '/onboarding/mi-onboarding', icon: Rocket },
  ]},
]

const personasNav = [
  { section: 'Administración', items: [
    { label: 'Colaboradores', path: '/personas/colaboradores', icon: UserRound, end: true },
    { label: 'Organigrama', path: '/personas/organigrama', icon: Building2 },
  ]},
]

const onboardingAuxiliarNav = [
  { section: 'Administración', items: [
    { label: 'Rutas', path: '/onboarding/plantillas', icon: Route },
    { label: 'Seguimiento', path: '/onboarding/asignaciones', icon: Users },
  ]},
]

const onboardingNavByRole = {
  admin: onboardingAdminNav,
  colaborador: onboardingColabNav,
  manager: onboardingManagerNav,
  auxiliar: onboardingAuxiliarNav,
}

const moduleConfig = {
  onboarding: { title: 'Módulo de Onboarding', icon: Rocket, desc: 'Administra la incorporación de nuevos colaboradores' },
  personas: { title: 'Gestión de Personas', icon: UserRound, desc: 'Directorio y datos de tu organización' },
}

export default function ModuleNav() {
  const { currentUser } = useUser()
  const { theme } = useTheme()
  const location = useLocation()

  const isPersonas = location.pathname.startsWith('/personas')
  const moduleKey = isPersonas ? 'personas' : 'onboarding'
  const config = moduleConfig[moduleKey]

  const sections = isPersonas
    ? personasNav
    : (onboardingNavByRole[currentUser.role] || onboardingAdminNav)

  const ModuleIcon = config.icon

  return (
    <div
      className="w-60 overflow-y-auto bg-[#FCFCFD] dark:bg-[#0C1B29] border-r border-gray-200 dark:border-white/[0.06] flex flex-col shrink-0"
      style={{ height: '100%' }}
    >
      <header style={{ padding: '1.5rem 1.5rem 0.75rem 1.75rem' }}>
        <h2 className="text-sm font-bold text-[#0C2D40] dark:text-white">{config.title}</h2>
      </header>

      {theme === 'dark' && (
        <div style={{ margin: '0 1.5rem 1rem 1.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0C2D40 0%, #051B26 100%)',
            borderRadius: 14, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            border: '1px solid rgba(0,224,145,.15)',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: 'rgba(0,224,145,.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ModuleIcon size={16} style={{ color: '#00E091' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#F5F7FA' }}>{config.title.replace('Módulo de ', '')}</div>
              <div style={{ fontSize: 10, color: '#A9B7C6', lineHeight: 1.4, marginTop: 1 }}>{config.desc}</div>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-gray-200 dark:border-white/[0.06]" style={{ marginLeft: '1.75rem', marginRight: '1.5rem', marginBottom: '0.75rem' }} />

      <nav className="flex flex-col" style={{ paddingLeft: '1.25rem', paddingRight: '1rem' }}>
        {sections.map((group, gi) => (
          <div key={group.section} style={{ marginBottom: gi < sections.length - 1 ? '1rem' : 0, paddingTop: gi > 0 ? '0.75rem' : 0, borderTop: gi > 0 ? '1px solid var(--border-soft)' : 'none' }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              padding: '0 0.85rem', marginBottom: '0.4rem',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {group.section}
              {sectionInfo[group.section] && (
                <div style={{ display: 'inline-flex' }}
                  onMouseEnter={e => {
                    const tip = e.currentTarget.querySelector('[data-tip]')
                    const rect = e.currentTarget.getBoundingClientRect()
                    tip.style.left = (rect.right + 8) + 'px'
                    tip.style.top = rect.top + 'px'
                    tip.style.opacity = '1'
                  }}
                  onMouseLeave={e => e.currentTarget.querySelector('[data-tip]').style.opacity = '0'}
                >
                  <Info size={10} style={{ color: 'var(--border-dark)', cursor: 'help' }} />
                  <div data-tip style={{
                    position: 'fixed',
                    background: '#0C2D40', color: '#fff', borderRadius: 8, padding: '8px 12px',
                    fontSize: 10, lineHeight: 1.5, width: 200, zIndex: 9999, textTransform: 'none', letterSpacing: 'normal',
                    boxShadow: '0 4px 16px rgba(0,0,0,.15)', opacity: 0,
                    transition: 'opacity .15s', pointerEvents: 'none',
                  }}>
                    <strong style={{ color: '#00E091', display: 'block', marginBottom: 3 }}>{sectionInfoTitle[group.section]}</strong>
                    {sectionInfo[group.section]}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col" style={{ gap: '0.3rem' }}>
              {group.items.map(({ label, path, icon: Icon, end }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={end}
                  className={({ isActive }) =>
                    `font-medium rounded-md flex items-center cursor-pointer transition-all duration-150 text-xs
                    ${isActive
                      ? 'bg-[#0C2D40] text-white'
                      : 'text-[#7C93A6] hover:bg-[#0C2D40]/10 hover:text-[#0C2D40] dark:text-[#7C8EA3] dark:hover:bg-[#163041] dark:hover:text-white'
                    }`
                  }
                  style={{ padding: '0.6rem 0.85rem' }}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} color={isActive ? '#00E091' : undefined} style={{ marginRight: '0.65rem' }} />
                      <span className="truncate">{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}
