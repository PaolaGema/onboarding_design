import { useState, useMemo } from 'react'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import {
  Search, X, Filter, Check, ChevronLeft, ChevronRight,
  ChevronDown, Calendar, Rocket
} from 'lucide-react'

const colaboradoresDisponibles = [
  { name: 'Luciana Paredes', depto: 'Ventas', cargo: 'Pasante Comercial', sucursal: 'La Paz', ingreso: '2026-06-24', initials: 'LP', color: '#0d9488' },
  { name: 'Tomás Ibáñez', depto: 'Operaciones', cargo: 'Analista de Procesos', sucursal: 'La Paz', ingreso: '2026-06-24', initials: 'TI', color: '#f59e0b' },
  { name: 'Renata Soria', depto: 'Tecnología', cargo: 'Frontend Developer', sucursal: 'Cochabamba', ingreso: '2026-06-30', initials: 'RS', color: '#8b5cf6' },
  { name: 'Emilio Castañeda', depto: 'Comercial', cargo: 'Ejecutivo Comercial', sucursal: 'Santa Cruz (Central)', ingreso: '2026-07-01', initials: 'EC', color: '#3b82f6' },
  { name: 'Gabriela Mora', depto: 'Diseño', cargo: 'Diseñadora UX/UI', sucursal: 'Cochabamba', ingreso: '2026-06-17', initials: 'GM', color: '#ec4899' },
  { name: 'Andrés Villanueva', depto: 'Tecnología', cargo: 'Backend Developer', sucursal: 'Santa Cruz (Central)', ingreso: '2026-07-07', initials: 'AV', color: '#06b6d4' },
  { name: 'Natalia Guzmán', depto: 'Ventas', cargo: 'SDR Junior', sucursal: 'La Paz', ingreso: '2026-06-10', initials: 'NG', color: '#f97316' },
  { name: 'Sebastián Rojas', depto: 'Finanzas', cargo: 'Analista Financiero', sucursal: 'Tarija', ingreso: '2026-07-14', initials: 'SR', color: '#ef4444' },
  { name: 'Carolina Vega', depto: 'Marketing', cargo: 'Content Creator', sucursal: 'Santa Cruz (Central)', ingreso: '2026-06-20', initials: 'CV', color: '#14b8a6' },
  { name: 'Diego Paredes', depto: 'Ventas', cargo: 'Account Manager', sucursal: 'Cochabamba', ingreso: '2026-07-01', initials: 'DP', color: '#d946ef' },
]

const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function MiniCalendar({ value, onChange }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1)
  const startDay = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = Array(startDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1))

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  function isDisabled(day) { return new Date(viewYear, viewMonth, day) < today }
  function isSelected(day) {
    if (!value || !day) return false
    const sel = new Date(value + 'T00:00:00')
    return sel.getFullYear() === viewYear && sel.getMonth() === viewMonth && sel.getDate() === day
  }
  function isToday(day) { return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day }
  function select(day) {
    if (isDisabled(day)) return
    onChange(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
  }

  const canPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth())
  const selectedLabel = value
    ? (() => { const d = new Date(value + 'T00:00:00'); return `${d.getDate()} de ${MONTHS[d.getMonth()]} ${d.getFullYear()}` })()
    : null

  return (
    <>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
          <button onClick={prevMonth} disabled={!canPrev} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: canPrev ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: canPrev ? '#475569' : '#e2e8f0' }}>
            <ChevronLeft size={13} />
          </button>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#0C2D40' }}>{MONTHS[viewMonth]} {viewYear}</span>
          <button onClick={nextMonth} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <ChevronRight size={13} />
          </button>
        </div>
        <div style={{ padding: '6px 8px 8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 2 }}>
            {DAYS.map(d => (<div key={d} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#94a3b8', padding: '3px 0' }}>{d}</div>))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {cells.map((day, i) => (
              <button key={i} disabled={!day || isDisabled(day)} onClick={() => day && select(day)} style={{
                width: '100%', aspectRatio: '1', borderRadius: 6, border: 'none', fontSize: 11,
                fontWeight: isSelected(day) ? 700 : isToday(day) ? 600 : 400, fontFamily: 'inherit',
                background: isSelected(day) ? '#0C2D40' : isToday(day) ? '#f1f5f9' : 'transparent',
                color: !day ? 'transparent' : isSelected(day) ? '#fff' : isDisabled(day) ? '#d1d5db' : isToday(day) ? '#0C2D40' : '#334155',
                cursor: !day || isDisabled(day) ? 'default' : 'pointer', transition: 'all .1s', position: 'relative',
              }}>
                {day || ''}
                {isToday(day) && !isSelected(day) && (<div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#00E091' }} />)}
              </button>
            ))}
          </div>
        </div>
      </div>
      {selectedLabel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
          <Calendar size={12} style={{ color: '#16a34a' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#166534' }}>{selectedLabel}</span>
        </div>
      )}
    </>
  )
}

export default function AsignarRutaModal({ onClose, onConfirm, preselectedRutaId }) {
  const { plantillas } = useOnboardingData()
  const rutasAsignar = plantillas.filter(p => p.status === 'activa')

  const [selectedColabs, setSelectedColabs] = useState([])
  const [colabSearch, setColabSearch] = useState('')
  const [colabFilterDepto, setColabFilterDepto] = useState('Todas')
  const [colabFilterSucursal, setColabFilterSucursal] = useState('Todas')
  const [colabFilterCargo, setColabFilterCargo] = useState('Todos')
  const [colabFechaDesde, setColabFechaDesde] = useState('')
  const [colabFechaHasta, setColabFechaHasta] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [fDropSucursal, setFDropSucursal] = useState(false)
  const [fDropArea, setFDropArea] = useState(false)
  const [fDropCargo, setFDropCargo] = useState(false)
  const [onbSelected, setOnbSelected] = useState(preselectedRutaId ?? null)
  const [onbFecha, setOnbFecha] = useState('')
  const [onbSearch, setOnbSearch] = useState('')
  const [onbArea, setOnbArea] = useState('Todas')
  const [onbCargo, setOnbCargo] = useState('Todos')
  const [onbSede, setOnbSede] = useState('Todas')
  const [showRutaFilters, setShowRutaFilters] = useState(false)
  const [rfDropSede, setRfDropSede] = useState(false)
  const [rfDropArea, setRfDropArea] = useState(false)
  const [rfDropCargo, setRfDropCargo] = useState(false)

  const hasActiveFilters = colabFilterDepto !== 'Todas' || colabFilterSucursal !== 'Todas' || colabFilterCargo !== 'Todos' || colabFechaDesde || colabFechaHasta
  const filteredColabs = colaboradoresDisponibles.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(colabSearch.toLowerCase()) ||
      c.cargo.toLowerCase().includes(colabSearch.toLowerCase())
    const matchDepto = colabFilterDepto === 'Todas' || c.depto === colabFilterDepto
    const matchSucursal = colabFilterSucursal === 'Todas' || c.sucursal === colabFilterSucursal
    const matchCargo = colabFilterCargo === 'Todos' || c.cargo === colabFilterCargo
    const matchDesde = !colabFechaDesde || c.ingreso >= colabFechaDesde
    const matchHasta = !colabFechaHasta || c.ingreso <= colabFechaHasta
    return matchSearch && matchDepto && matchSucursal && matchCargo && matchDesde && matchHasta
  })
  const cargosDisponibles = [...new Set(colaboradoresDisponibles
    .filter(c => colabFilterDepto === 'Todas' || c.depto === colabFilterDepto)
    .map(c => c.cargo))]

  function clearFilters() {
    setColabFilterDepto('Todas'); setColabFilterSucursal('Todas'); setColabFilterCargo('Todos'); setColabFechaDesde(''); setColabFechaHasta('')
  }
  function toggleColab(c) {
    setSelectedColabs(prev =>
      prev.find(s => s.name === c.name)
        ? prev.filter(s => s.name !== c.name)
        : [...prev, c]
    )
  }
  const isColabSelected = (c) => selectedColabs.some(s => s.name === c.name)
  const selectedRuta = rutasAsignar.find(r => r.id === onbSelected) || null
  const canConfirm = selectedColabs.length > 0 && onbSelected && onbFecha

  return (
    <div className="pl-overlay" onClick={onClose}>
      <div className="pl-modal jb-modal" style={{ width: 980, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div className="pl-modal-header" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 15 }}>Asignar ruta de onboarding</h2>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Selecciona colaboradores, elige la ruta y fecha de inicio</span>
            </div>
          </div>
          <button className="pl-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* CONTENIDO: 3 COLUMNAS */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflowY: 'auto' }}>

          {/* COL 1: COLABORADORES */}
          <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 18px', borderRight: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0C2D40' }}><span style={{ color: '#94a3b8', fontWeight: 600 }}>1.</span> Colaboradores</span>
              <button onClick={() => setShowFilters(true)} style={{
                padding: '3px 8px', borderRadius: 6,
                border: hasActiveFilters ? '1px solid #0C2D40' : '1px solid #e2e8f0',
                background: hasActiveFilters ? '#f0f9ff' : '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: 'inherit', fontSize: 10, fontWeight: 600,
                color: hasActiveFilters ? '#0C2D40' : '#94a3b8',
              }}>
                <Filter size={10} />
                {hasActiveFilters
                  ? `${[colabFilterDepto !== 'Todas', colabFilterSucursal !== 'Todas', colabFilterCargo !== 'Todos', !!colabFechaDesde, !!colabFechaHasta].filter(Boolean).length} filtros`
                  : 'Filtros'}
              </button>
            </div>

            <div className="pl-search-wrap" style={{ flex: 'none' }}>
              <Search size={12} className="pl-search-ico" />
              <input type="text" className="pl-search" style={{ fontSize: 11 }} placeholder="Buscar..." value={colabSearch} onChange={e => setColabSearch(e.target.value)} />
            </div>

            {/* CHIPS FILTROS */}
            {hasActiveFilters && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {colabFilterSucursal !== 'Todas' && (
                  <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px 2px 8px', borderRadius: 20, background: '#eff6ff', color: '#1e40af', display: 'flex', alignItems: 'center', gap: 3 }}>
                    {colabFilterSucursal}
                    <button onClick={() => setColabFilterSucursal('Todas')} style={{ width: 12, height: 12, borderRadius: '50%', border: 'none', background: '#dbeafe', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={7} style={{ color: '#1e40af' }} /></button>
                  </span>
                )}
                {colabFilterDepto !== 'Todas' && (
                  <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px 2px 8px', borderRadius: 20, background: '#f0fdf4', color: '#166534', display: 'flex', alignItems: 'center', gap: 3 }}>
                    {colabFilterDepto}
                    <button onClick={() => { setColabFilterDepto('Todas'); setColabFilterCargo('Todos') }} style={{ width: 12, height: 12, borderRadius: '50%', border: 'none', background: '#bbf7d0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={7} style={{ color: '#166534' }} /></button>
                  </span>
                )}
                {colabFilterCargo !== 'Todos' && (
                  <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px 2px 8px', borderRadius: 20, background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', gap: 3 }}>
                    {colabFilterCargo}
                    <button onClick={() => setColabFilterCargo('Todos')} style={{ width: 12, height: 12, borderRadius: '50%', border: 'none', background: '#fde68a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={7} style={{ color: '#92400e' }} /></button>
                  </span>
                )}
                <button onClick={clearFilters} style={{ fontSize: 8, fontWeight: 600, color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Limpiar</button>
              </div>
            )}

            {/* LISTA */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {filteredColabs.map(c => {
                const sel = isColabSelected(c)
                return (
                  <button key={c.name} onClick={() => toggleColab(c)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 6, width: '100%',
                    border: 'none',
                    background: sel ? '#d1fae5' : 'transparent',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    transition: 'all .12s',
                    borderBottom: '1px solid #f8fafc',
                  }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.background = '#f8fafc' }}
                    onMouseLeave={e => { e.currentTarget.style.background = sel ? '#d1fae5' : 'transparent' }}
                  >
                    <div style={{
                      width: 15, height: 15, borderRadius: 4, border: sel ? '2px solid #00E091' : '1.5px solid #d1d5db',
                      background: sel ? '#00E091' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {sel && <Check size={8} style={{ color: '#fff' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: sel ? 600 : 500, color: sel ? '#0C2D40' : '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                      <div style={{ fontSize: 9, color: '#b0b8c4' }}>{c.depto} · {c.sucursal}</div>
                    </div>
                  </button>
                )
              })}
              {filteredColabs.length === 0 && (
                <div style={{ padding: 16, textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>Sin resultados</div>
              )}
            </div>
          </div>

          {/* COL 2: RUTA */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 18px', borderRight: '1px solid #f1f5f9', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0C2D40' }}><span style={{ color: '#94a3b8', fontWeight: 600 }}>2.</span> Ruta</span>
              <button onClick={() => setShowRutaFilters(true)} style={{
                padding: '3px 8px', borderRadius: 6,
                border: (onbSede !== 'Todas' || onbArea !== 'Todas' || onbCargo !== 'Todos') ? '1px solid #0C2D40' : '1px solid #e2e8f0',
                background: (onbSede !== 'Todas' || onbArea !== 'Todas' || onbCargo !== 'Todos') ? '#f0f9ff' : '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: 'inherit', fontSize: 10, fontWeight: 600,
                color: (onbSede !== 'Todas' || onbArea !== 'Todas' || onbCargo !== 'Todos') ? '#0C2D40' : '#94a3b8',
              }}>
                <Filter size={10} />
                {(onbSede !== 'Todas' || onbArea !== 'Todas' || onbCargo !== 'Todos')
                  ? `${[onbSede !== 'Todas', onbArea !== 'Todas', onbCargo !== 'Todos'].filter(Boolean).length} filtros`
                  : 'Filtros'}
              </button>
            </div>
            <div className="pl-search-wrap" style={{ flex: 'none' }}>
              <Search size={12} className="pl-search-ico" />
              <input type="text" className="pl-search" style={{ fontSize: 11 }} placeholder="Buscar ruta..." value={onbSearch} onChange={e => setOnbSearch(e.target.value)} />
            </div>

            {/* CHIPS FILTROS RUTA */}
            {(onbSede !== 'Todas' || onbArea !== 'Todas' || onbCargo !== 'Todos') && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {onbSede !== 'Todas' && (
                  <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px 2px 8px', borderRadius: 20, background: '#fce7f3', color: '#9d174d', display: 'flex', alignItems: 'center', gap: 3 }}>
                    {onbSede}
                    <button onClick={() => setOnbSede('Todas')} style={{ width: 12, height: 12, borderRadius: '50%', border: 'none', background: '#fbcfe8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={7} style={{ color: '#9d174d' }} /></button>
                  </span>
                )}
                {onbArea !== 'Todas' && (
                  <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px 2px 8px', borderRadius: 20, background: '#eff6ff', color: '#1e40af', display: 'flex', alignItems: 'center', gap: 3 }}>
                    {onbArea}
                    <button onClick={() => setOnbArea('Todas')} style={{ width: 12, height: 12, borderRadius: '50%', border: 'none', background: '#dbeafe', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={7} style={{ color: '#1e40af' }} /></button>
                  </span>
                )}
                {onbCargo !== 'Todos' && (
                  <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px 2px 8px', borderRadius: 20, background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', gap: 3 }}>
                    {onbCargo}
                    <button onClick={() => setOnbCargo('Todos')} style={{ width: 12, height: 12, borderRadius: '50%', border: 'none', background: '#fde68a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={7} style={{ color: '#92400e' }} /></button>
                  </span>
                )}
              </div>
            )}

            {/* MODAL FILTROS RUTA */}
            {showRutaFilters && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowRutaFilters(false)}>
                <div style={{ background: '#fff', borderRadius: 16, width: 400, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,.15)', animation: 'plSlideUp .15s' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Filter size={16} style={{ color: '#0C2D40' }} />
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#0C2D40' }}>Filtrar rutas</span>
                    </div>
                    <button onClick={() => setShowRutaFilters(false)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={14} style={{ color: '#64748b' }} />
                    </button>
                  </div>
                  <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }} onClick={() => { setRfDropSede(false); setRfDropArea(false); setRfDropCargo(false) }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Sucursal</span>
                      <div className="pl-dropdown-wrap">
                        <button type="button" className={`pl-dropdown-trigger${rfDropSede ? ' open' : ''}${onbSede === 'Todas' ? ' placeholder' : ''}`} onClick={e => { e.stopPropagation(); setRfDropSede(!rfDropSede); setRfDropArea(false); setRfDropCargo(false) }}>
                          <span>{onbSede === 'Todas' ? 'Seleccione una sucursal' : onbSede}</span>
                          <ChevronDown size={14} className="pl-dropdown-chevron" />
                        </button>
                        {rfDropSede && (
                          <div className="pl-dropdown-menu">
                            {['Todas', ...new Set(colaboradoresDisponibles.map(c => c.sucursal))].map(s => (
                              <button key={s} type="button" className={`pl-dropdown-item${onbSede === s ? ' selected' : ''}`} onClick={() => { setOnbSede(s); setRfDropSede(false) }}>
                                <span>{s === 'Todas' ? 'Todas las sucursales' : s}</span>
                                {onbSede === s && <Check size={14} />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Área</span>
                      <div className="pl-dropdown-wrap">
                        <button type="button" className={`pl-dropdown-trigger${rfDropArea ? ' open' : ''}${onbArea === 'Todas' ? ' placeholder' : ''}`} onClick={e => { e.stopPropagation(); setRfDropArea(!rfDropArea); setRfDropSede(false); setRfDropCargo(false) }}>
                          <span>{onbArea === 'Todas' ? 'Seleccione un área' : onbArea}</span>
                          <ChevronDown size={14} className="pl-dropdown-chevron" />
                        </button>
                        {rfDropArea && (
                          <div className="pl-dropdown-menu" style={{ top: 'auto', bottom: 'calc(100% + 6px)' }}>
                            {['Todas', ...new Set(rutasAsignar.map(r => r.area))].map(a => (
                              <button key={a} type="button" className={`pl-dropdown-item${onbArea === a ? ' selected' : ''}`} onClick={() => { setOnbArea(a); setRfDropArea(false) }}>
                                <span>{a === 'Todas' ? 'Todas las áreas' : a}</span>
                                {onbArea === a && <Check size={14} />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Cargo destino</span>
                      <div className="pl-dropdown-wrap">
                        <button type="button" className={`pl-dropdown-trigger${rfDropCargo ? ' open' : ''}${onbCargo === 'Todos' ? ' placeholder' : ''}`} onClick={e => { e.stopPropagation(); setRfDropCargo(!rfDropCargo); setRfDropSede(false); setRfDropArea(false) }}>
                          <span>{onbCargo === 'Todos' ? 'Seleccione un cargo' : onbCargo}</span>
                          <ChevronDown size={14} className="pl-dropdown-chevron" />
                        </button>
                        {rfDropCargo && (
                          <div className="pl-dropdown-menu" style={{ top: 'auto', bottom: 'calc(100% + 6px)' }}>
                            {['Todos', 'Pasante', 'Ejecutivo', 'Gerente', 'Analista', 'Developer'].map(c => (
                              <button key={c} type="button" className={`pl-dropdown-item${onbCargo === c ? ' selected' : ''}`} onClick={() => { setOnbCargo(c); setRfDropCargo(false) }}>
                                <span>{c === 'Todos' ? 'Todos los cargos' : c}</span>
                                {onbCargo === c && <Check size={14} />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 24px', borderTop: '1px solid #f1f5f9' }}>
                    <button onClick={() => { setOnbSede('Todas'); setOnbArea('Todas'); setOnbCargo('Todos') }} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#ef4444' }}>Limpiar filtros</button>
                    <button onClick={() => setShowRutaFilters(false)} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: '#0C2D40', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700 }}>Aplicar filtros</button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {rutasAsignar
                .filter(r => (onbArea === 'Todas' || r.area === onbArea) && (onbCargo === 'Todos' || r.name.toLowerCase().includes(onbCargo.toLowerCase())) && r.name.toLowerCase().includes(onbSearch.toLowerCase()))
                .map(r => (
                  <button key={r.id} onClick={() => setOnbSelected(r.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 6, width: '100%',
                    border: 'none',
                    background: onbSelected === r.id ? '#d1fae5' : 'transparent',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .12s',
                    borderBottom: '1px solid #f8fafc',
                  }}
                    onMouseEnter={e => { if (onbSelected !== r.id) e.currentTarget.style.background = '#f8fafc' }}
                    onMouseLeave={e => { e.currentTarget.style.background = onbSelected === r.id ? '#d1fae5' : 'transparent' }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: r.color || '#0C2D40', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: onbSelected === r.id ? 600 : 500, color: onbSelected === r.id ? '#0C2D40' : '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                      <div style={{ fontSize: 9, color: '#b0b8c4' }}>{r.area} · {r.etapas || 0} etapas</div>
                    </div>
                    {onbSelected === r.id && <Check size={12} style={{ color: r.color || '#0C2D40', flexShrink: 0 }} />}
                  </button>
                ))}
              {rutasAsignar.length === 0 && (
                <div style={{ padding: 16, textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>No hay rutas activas disponibles</div>
              )}
            </div>
          </div>

          {/* COL 3: FECHA */}
          <div style={{ width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 18px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0C2D40' }}><span style={{ color: '#94a3b8', fontWeight: 600 }}>3.</span> Fecha de inicio</span>
            <MiniCalendar value={onbFecha} onChange={setOnbFecha} />
          </div>
        </div>

        {/* MODAL DE FILTROS COLABORADORES */}
        {showFilters && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowFilters(false)}>
            <div style={{ background: '#fff', borderRadius: 16, width: 440, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,.15)', animation: 'plSlideUp .15s' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Filter size={16} style={{ color: '#0C2D40' }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0C2D40' }}>Filtrar colaboradores</span>
                </div>
                <button onClick={() => setShowFilters(false)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} style={{ color: '#64748b' }} />
                </button>
              </div>
              <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} onClick={() => { setFDropSucursal(false); setFDropArea(false); setFDropCargo(false) }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Sucursal</span>
                  <div className="pl-dropdown-wrap">
                    <button type="button" className={`pl-dropdown-trigger${fDropSucursal ? ' open' : ''}${colabFilterSucursal === 'Todas' ? ' placeholder' : ''}`} onClick={e => { e.stopPropagation(); setFDropSucursal(!fDropSucursal); setFDropArea(false); setFDropCargo(false) }}>
                      <span>{colabFilterSucursal === 'Todas' ? 'Seleccione una sucursal' : colabFilterSucursal}</span>
                      <ChevronDown size={14} className="pl-dropdown-chevron" />
                    </button>
                    {fDropSucursal && (
                      <div className="pl-dropdown-menu">
                        {['Todas', ...new Set(colaboradoresDisponibles.map(c => c.sucursal))].map(s => (
                          <button key={s} type="button" className={`pl-dropdown-item${colabFilterSucursal === s ? ' selected' : ''}`} onClick={() => { setColabFilterSucursal(s); setFDropSucursal(false) }}>
                            <span>{s === 'Todas' ? 'Todas las sucursales' : s}</span>
                            {colabFilterSucursal === s && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Área</span>
                  <div className="pl-dropdown-wrap">
                    <button type="button" className={`pl-dropdown-trigger${fDropArea ? ' open' : ''}${colabFilterDepto === 'Todas' ? ' placeholder' : ''}`} onClick={e => { e.stopPropagation(); setFDropArea(!fDropArea); setFDropSucursal(false); setFDropCargo(false) }}>
                      <span>{colabFilterDepto === 'Todas' ? 'Seleccione un área' : colabFilterDepto}</span>
                      <ChevronDown size={14} className="pl-dropdown-chevron" />
                    </button>
                    {fDropArea && (
                      <div className="pl-dropdown-menu">
                        {['Todas', ...new Set(colaboradoresDisponibles.map(c => c.depto))].map(a => (
                          <button key={a} type="button" className={`pl-dropdown-item${colabFilterDepto === a ? ' selected' : ''}`} onClick={() => { setColabFilterDepto(a); setColabFilterCargo('Todos'); setFDropArea(false) }}>
                            <span>{a === 'Todas' ? 'Todas las áreas' : a}</span>
                            {colabFilterDepto === a && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Cargo</span>
                  <div className="pl-dropdown-wrap">
                    <button type="button" className={`pl-dropdown-trigger${fDropCargo ? ' open' : ''}${colabFilterCargo === 'Todos' ? ' placeholder' : ''}`} onClick={e => { e.stopPropagation(); setFDropCargo(!fDropCargo); setFDropSucursal(false); setFDropArea(false) }}>
                      <span>{colabFilterCargo === 'Todos' ? 'Seleccione un cargo' : colabFilterCargo}</span>
                      <ChevronDown size={14} className="pl-dropdown-chevron" />
                    </button>
                    {fDropCargo && (
                      <div className="pl-dropdown-menu">
                        {['Todos', ...cargosDisponibles].map(c => (
                          <button key={c} type="button" className={`pl-dropdown-item${colabFilterCargo === c ? ' selected' : ''}`} onClick={() => { setColabFilterCargo(c); setFDropCargo(false) }}>
                            <span>{c === 'Todos' ? 'Todos los cargos' : c}</span>
                            {colabFilterCargo === c && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: 'span 2' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Fecha de ingreso</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="date" value={colabFechaDesde} onChange={e => setColabFechaDesde(e.target.value)} className="pl-input" style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>hasta</span>
                    <input type="date" value={colabFechaHasta} onChange={e => setColabFechaHasta(e.target.value)} className="pl-input" style={{ flex: 1 }} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 24px', borderTop: '1px solid #f1f5f9' }}>
                <button onClick={clearFilters} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#ef4444' }}>Limpiar filtros</button>
                <button onClick={() => setShowFilters(false)} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: '#0C2D40', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700 }}>Aplicar filtros</button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="pl-modal-footer" style={{ padding: '8px 26px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <button className="pl-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="pl-btn-save" disabled={!canConfirm}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...(!canConfirm ? { opacity: 0.5, cursor: 'default' } : {}) }}
            onClick={() => canConfirm && onConfirm(selectedColabs, selectedRuta, onbFecha)}>
            <Rocket size={13} />
            Asignar a {selectedColabs.length || '...'} colaborador{selectedColabs.length !== 1 ? 'es' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
