import { Menu, Sun, Moon, Bell, ChevronDown, ArrowRightLeft } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useUser } from '../../context/UserContext'

export default function Header({ floating }) {
  const [darkMode, setDarkMode] = useState(false)
  const [showSwitcher, setShowSwitcher] = useState(false)
  const { currentUser, setCurrentUser, users } = useUser()
  const ref = useRef(null)

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
              {users.map(user => {
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
            {currentUser.role === 'admin' ? 'Dashboard' : currentUser.role === 'manager' ? 'Mi equipo' : 'Mi Onboarding'}
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
                {users.map(user => {
                  const isActive = user.id === currentUser.id
                  return (
                    <button
                      key={user.id}
                      onClick={() => { setCurrentUser(user); setShowSwitcher(false) }}
                      style={{
                        width: '100%',
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 10px',
                        border: 'none',
                        background: isActive ? '#e2e8f0' : 'transparent',
                        borderRadius: 10,
                        cursor: 'pointer',
                        transition: 'background .12s',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                        marginBottom: 2,
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc' }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: user.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
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
    </header>
  )
}
