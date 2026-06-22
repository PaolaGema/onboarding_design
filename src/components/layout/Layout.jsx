import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import ModuleNav from './ModuleNav'
import { useUser } from '../../context/UserContext'

const landingByRole = {
  admin: '/onboarding',
  manager: '/onboarding',
  colaborador: '/onboarding/bienvenida',
}

export default function Layout() {
  const { currentUser } = useUser()
  const navigate = useNavigate()
  const location = useLocation()

  const isMobile = currentUser.id === 4

  useEffect(() => {
    const isPersonas = location.pathname.startsWith('/personas')
    const isAdminRoute = ['/onboarding', '/onboarding/asignaciones', '/onboarding/plantillas', '/onboarding/conocimiento', '/onboarding/configuracion'].includes(location.pathname)

    if (currentUser.role === 'colaborador' && (isAdminRoute || isPersonas)) {
      navigate('/onboarding/bienvenida', { replace: true })
    }
  }, [currentUser.role])

  if (isMobile) {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        background: '#1e293b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Selector de usuario flotante */}
        <div style={{ position: 'absolute', top: 20, right: 24 }}>
          <Header floating />
        </div>

        {/* Etiqueta */}
        <div style={{
          position: 'absolute', top: 24, left: 28,
          color: '#94a3b8', fontSize: 11, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#10DC97',
          }} />
          Vista Mobile — Prototipo UX
        </div>

        {/* Phone frame */}
        <div style={{
          width: 280, height: 560,
          borderRadius: 36,
          border: '5px solid #334155',
          background: '#fff',
          overflow: 'hidden',
          boxShadow: '0 0 0 2px #1e293b, 0 25px 60px rgba(0,0,0,.4)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          {/* Status bar */}
          <div style={{
            height: 40, background: '#0C2D40',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            paddingBottom: 6, flexShrink: 0,
            position: 'relative',
          }}>
            <div style={{
              width: 90, height: 22, borderRadius: 11,
              background: '#1e293b', position: 'absolute', top: 6,
              left: '50%', transform: 'translateX(-50%)',
            }} />
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,.6)', fontWeight: 600 }}>
              TrabajitHR
            </span>
          </div>

          {/* Content */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '10px 10px 60px',
            background: '#f8fafc',
            scrollbarWidth: 'none', msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
          className="phone-scroll"
          >
            <Outlet />
          </div>

          {/* Bottom nav */}
          <div style={{
            height: 50, background: '#fff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-around',
            paddingBottom: 6, flexShrink: 0,
          }}>
            {[
              { label: 'Inicio', active: true },
              { label: 'Tareas', active: false },
              { label: 'Perfil', active: false },
            ].map(tab => (
              <div key={tab.label} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 4,
                  background: tab.active ? '#0C2D40' : '#e2e8f0',
                }} />
                <span style={{
                  fontSize: 7, fontWeight: 600,
                  color: tab.active ? '#0C2D40' : '#94a3b8',
                }}>{tab.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <ModuleNav />
          <main className="flex-1 overflow-y-auto bg-gray-50" style={{ padding: '1.25rem 1rem' }}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
