import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { House, Calendar, UserRound, MessageCircleMore, ClipboardCheck, Settings, LogOut, Rocket, Menu, ChevronsRight } from 'lucide-react'
import { useUser } from '../../context/UserContext'

const allNavItems = [
  { icon: House, label: 'Inicio', path: null, roles: ['admin', 'manager', 'auxiliar', 'colaborador'] },
  { icon: Calendar, label: 'Mi calendario', path: null, roles: ['admin', 'manager', 'auxiliar', 'colaborador'] },
  { icon: UserRound, label: 'Gestión de personas', path: '/personas/colaboradores', roles: ['admin', 'manager'] },
  { icon: Rocket, label: 'Onboarding', path: '/onboarding', roles: ['admin', 'manager', 'auxiliar', 'colaborador'] },
  { icon: MessageCircleMore, label: 'Comunicación', path: null, roles: ['admin', 'manager', 'auxiliar', 'colaborador'] },
  { icon: ClipboardCheck, label: 'Evaluación', path: null, roles: ['admin', 'manager', 'auxiliar', 'colaborador'] },
]

const bottomItems = [
  { icon: Settings, label: 'Configuración', path: null },
  { icon: LogOut, label: 'Cerrar sesión', variant: 'logout', path: null },
]

function NavItem({ icon: Icon, label, active, expanded, variant, onClick }) {
  const isLogout = variant === 'logout'

  const base = isLogout
    ? 'text-gray-400 hover:bg-red-50 hover:text-red-500'
    : active
      ? 'bg-[#0C2D40] text-white'
      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'

  if (!expanded) {
    return (
      <button
        title={label}
        onClick={onClick}
        className={`w-10 h-10 flex items-center justify-center rounded-lg border-none cursor-pointer font-inherit
          transition-colors duration-150 ${base}`}
      >
        <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      style={{ paddingLeft: 28, paddingRight: 12 }}
      className={`h-10 flex items-center gap-3 rounded-lg w-full border-none cursor-pointer font-inherit
        transition-colors duration-150 ${base}`}
    >
      <Icon size={19} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
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
  const navItems = allNavItems.filter(item => item.roles.includes(currentUser.role))

  function isActive(path) {
    if (!path) return false
    return location.pathname.startsWith(path)
  }

  return (
    <aside className={`bg-white flex flex-col border-r border-gray-200 shrink-0 h-full
      transition-all duration-300 ease-in-out
      ${expanded ? 'w-60' : 'w-16 items-center'}`}
    >
      <div className={`flex items-center shrink-0 h-14 border-b border-gray-100
        ${expanded ? 'justify-between w-full' : 'justify-center'}`}
      style={expanded ? { paddingLeft: 20, paddingRight: 16 } : undefined}
      >
        {expanded ? (
          <>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 shrink-0 bg-gradient-to-br from-[#0C2D40] to-[#1a4d6b] rounded-xl
                  flex items-center justify-center shadow-md"
              >
                <span className="text-white font-bold text-xs select-none">HR</span>
              </div>
              <span className="font-bold text-sm text-[#0C2D40] whitespace-nowrap">TrabajitHR</span>
            </div>
            <button
              onClick={() => setExpanded(false)}
              aria-label="Minimizar menú"
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100
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
            <span className="text-white font-bold text-xs select-none
              group-hover:opacity-0 transition-opacity duration-150">HR</span>
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

      <div className={`flex flex-col gap-1 py-3 border-t border-gray-100
        ${expanded ? 'w-full' : 'items-center'}`}
      style={expanded ? { paddingLeft: 8, paddingRight: 8 } : undefined}
      >
        {bottomItems.map(({ icon, label, variant, path }) => (
          <NavItem
            key={label}
            icon={icon}
            label={label}
            expanded={expanded}
            variant={variant}
            onClick={() => path && navigate(path)}
          />
        ))}
      </div>
    </aside>
  )
}
