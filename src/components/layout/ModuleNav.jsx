import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, Hand, Route, BookOpen, Settings, UserRound, Building2, Info } from 'lucide-react'
import { useUser } from '../../context/UserContext'

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
    { label: 'Panel de onboarding', path: '/onboarding', icon: LayoutDashboard, end: true },
    { label: 'Asignaciones', path: '/onboarding/asignaciones', icon: Users },
    { label: 'Rutas', path: '/onboarding/plantillas', icon: FileText },
    { label: 'Biblioteca de recursos', path: '/onboarding/conocimiento', icon: BookOpen },
    { label: 'Configuración', path: '/onboarding/configuracion', icon: Settings },
  ]},
  { section: 'Mi espacio', items: [
    { label: 'Bienvenida', path: '/onboarding/bienvenida', icon: Hand, end: true },
    { label: 'Mi Onboarding', path: '/onboarding/mi-onboarding', icon: Route },
  ]},
]

const onboardingColabNav = [
  { section: 'Mi espacio', items: [
    { label: 'Bienvenida', path: '/onboarding/bienvenida', icon: Hand, end: true },
    { label: 'Mi Onboarding', path: '/onboarding/mi-onboarding', icon: Route },
  ]},
]

const onboardingManagerNav = [
  { section: 'Administración', items: [
    { label: 'Panel de onboarding', path: '/onboarding', icon: LayoutDashboard, end: true },
    { label: 'Asignaciones', path: '/onboarding/asignaciones', icon: Users },
    { label: 'Rutas', path: '/onboarding/plantillas', icon: FileText },
  ]},
  { section: 'Mi espacio', items: [
    { label: 'Bienvenida', path: '/onboarding/bienvenida', icon: Hand, end: true },
    { label: 'Mi Onboarding', path: '/onboarding/mi-onboarding', icon: Route },
  ]},
]

const personasNav = [
  { section: 'Administración', items: [
    { label: 'Colaboradores', path: '/personas/colaboradores', icon: UserRound, end: true },
  ]},
]

const onboardingAuxiliarNav = [
  { section: 'Administración', items: [
    { label: 'Rutas', path: '/onboarding/plantillas', icon: FileText },
    { label: 'Asignaciones', path: '/onboarding/asignaciones', icon: Users },
  ]},
]

const onboardingNavByRole = {
  admin: onboardingAdminNav,
  colaborador: onboardingColabNav,
  manager: onboardingManagerNav,
  auxiliar: onboardingAuxiliarNav,
}

const moduleConfig = {
  onboarding: { title: 'Módulo de Onboarding' },
  personas: { title: 'Gestión de Personas' },
}

export default function ModuleNav() {
  const { currentUser } = useUser()
  const location = useLocation()

  const isPersonas = location.pathname.startsWith('/personas')
  const moduleKey = isPersonas ? 'personas' : 'onboarding'
  const config = moduleConfig[moduleKey]

  const sections = isPersonas
    ? personasNav
    : (onboardingNavByRole[currentUser.role] || onboardingAdminNav)

  return (
    <div
      className="w-60 overflow-y-auto bg-white border-r border-gray-200 flex flex-col shrink-0"
      style={{ height: '100%' }}
    >
      <header style={{ padding: '1.5rem 1.5rem 0.75rem 1.75rem' }}>
        <h2 className="text-sm font-bold text-[#0C2D40]">{config.title}</h2>
      </header>

      <div className="border-b border-gray-200" style={{ marginLeft: '1.75rem', marginRight: '1.5rem', marginBottom: '0.75rem' }} />

      <nav className="flex flex-col" style={{ paddingLeft: '1.25rem', paddingRight: '1rem' }}>
        {sections.map((group, gi) => (
          <div key={group.section} style={{ marginBottom: gi < sections.length - 1 ? '1rem' : 0, paddingTop: gi > 0 ? '0.75rem' : 0, borderTop: gi > 0 ? '1px solid #e5e7eb' : 'none' }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: '#94a3b8',
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
                  <Info size={10} style={{ color: '#cbd5e1', cursor: 'help' }} />
                  <div data-tip style={{
                    position: 'fixed',
                    background: '#0C2D40', color: '#fff', borderRadius: 8, padding: '8px 12px',
                    fontSize: 10, lineHeight: 1.5, width: 200, zIndex: 9999, textTransform: 'none', letterSpacing: 'normal',
                    boxShadow: '0 4px 16px rgba(0,0,0,.15)', opacity: 0,
                    transition: 'opacity .15s', pointerEvents: 'none',
                  }}>
                    <strong style={{ color: '#10DC97', display: 'block', marginBottom: 3 }}>{sectionInfoTitle[group.section]}</strong>
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
                      : 'text-gray-700 hover:bg-[#0C2D40]/10 hover:text-[#0C2D40]'
                    }`
                  }
                  style={{ padding: '0.6rem 0.85rem' }}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} style={{ marginRight: '0.65rem' }} />
                  <span className="truncate">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}
