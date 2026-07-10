import { useState } from 'react'
import { Crown, Building2, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { colaboradoresData } from './colaboradoresData'

const seniorRoles = ['Líder de área', 'Supervisor', 'Sub-admin RRHH', 'Gerente']

const deptColors = {
  'Ventas': '#3b82f6',
  'Tecnología': '#06b6d4',
  'Marketing': '#ec4899',
  'Operaciones': '#8b5cf6',
  'Recursos Humanos': '#d946ef',
  'Finanzas': '#0C2D40',
  'Diseño': '#f97316',
}

function Avatar({ name, color, size = 32 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      fontSize: size * 0.36, fontWeight: 700,
    }}>
      {initials}
    </div>
  )
}

export default function Organigrama() {
  const [expanded, setExpanded] = useState({})

  const departamentosUsados = [...new Set(colaboradoresData.map(c => c.depto))]
  const porDepto = departamentosUsados.map(depto => {
    const miembros = colaboradoresData.filter(c => c.depto === depto)
    const head = miembros.find(c => seniorRoles.includes(c.rol))
    const equipo = miembros.filter(c => c !== head)
    return { depto, head, equipo, total: miembros.length, color: deptColors[depto] || '#64748b' }
  }).sort((a, b) => b.total - a.total)

  return (
    <div className="content-scroll">
      <div className="pl-header">
        <div>
          <h1 className="pl-title">Organigrama</h1>
          <p className="pl-subtitle">Conoce la estructura, los equipos y los cargos de la empresa</p>
        </div>
      </div>

      {/* NODO SUPERIOR */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px',
          background: 'linear-gradient(135deg, #0C2D40 0%, #1a4a63 100%)', borderRadius: 14,
          boxShadow: '0 8px 24px rgba(12,45,64,.2)',
        }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={18} style={{ color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>SoulyHR</div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.65)' }}>Dirección General</div>
          </div>
        </div>
        <div style={{ width: 2, height: 28, background: 'var(--border-dark)' }} />
      </div>

      {/* DEPARTAMENTOS */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20,
      }}>
        {porDepto.map(({ depto, head, equipo, total, color }) => {
          const isOpen = expanded[depto] !== false
          const visibleEquipo = isOpen ? equipo : equipo.slice(0, 3)
          return (
            <div key={depto} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 2, height: 20, background: 'var(--border-dark)' }} />
              <div className="sec-card" style={{ width: '100%', overflow: 'visible' }}>
                <div className="sc-hd" style={{ gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={15} style={{ color }} />
                  </div>
                  <h3 style={{ flex: 1 }}>{depto}</h3>
                  <span className="sc-hd-count" style={{ background: `${color}18`, color }}>{total}</span>
                </div>
                <div className="sc-body" style={{ padding: '10px 16px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {head && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: `${color}0e`, border: `1px solid ${color}30` }}>
                      <Avatar name={head.name} color={color} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40' }}>{head.name}</span>
                          <Crown size={11} style={{ color: '#f59e0b', flexShrink: 0 }} />
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{head.cargo}</div>
                      </div>
                    </div>
                  )}
                  {visibleEquipo.map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 2px' }}>
                      <Avatar name={p.name} color={p.color} size={26} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: '#0C2D40', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.cargo}</div>
                      </div>
                    </div>
                  ))}
                  {equipo.length > 3 && (
                    <button
                      onClick={() => setExpanded(prev => ({ ...prev, [depto]: !isOpen }))}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        border: 'none', background: 'transparent', cursor: 'pointer',
                        fontSize: 10.5, fontWeight: 600, color, fontFamily: 'inherit', padding: '4px 0',
                      }}
                    >
                      {isOpen ? <>Ver menos <ChevronUp size={12} /></> : <>Ver {equipo.length - 3} más <ChevronDown size={12} /></>}
                    </button>
                  )}
                  {equipo.length === 0 && !head && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
                      <Users size={16} style={{ marginBottom: 4 }} />
                      <div>Sin integrantes</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
