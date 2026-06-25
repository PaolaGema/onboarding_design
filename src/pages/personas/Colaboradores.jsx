import { useState, useEffect, useMemo } from 'react'
import { Search, Plus, MoreHorizontal, Building2, Calendar, ChevronLeft, ChevronRight, Eye, Pencil, Rocket, Shield, X, CheckCircle2, RefreshCw, Palmtree, Stethoscope, Ban, UserMinus, Send, Route, Filter, Info } from 'lucide-react'
import { useRutaActiva } from '../../context/RutaActivaContext'
import { useTronco } from '../../context/TroncoContext'
import { rutasData } from '../onboarding/JourneyBuilder'

const departamentos = ['Todos', 'Ventas', 'Tecnología', 'Marketing', 'Operaciones', 'Recursos Humanos', 'Finanzas', 'Diseño']

const colaboradoresData = [
  { id: 1, name: 'Diego Morales', email: 'diego.morales@trabajito.com', depto: 'Tecnología', cargo: 'Desarrollador Backend', rol: 'Colaborador', ingreso: '15 Mar 2025', status: 'activo', registro: 100, onb: 'en-curso', initials: 'DM', color: '#3b82f6' },
  { id: 2, name: 'Camila Herrera', email: 'camila.herrera@trabajito.com', depto: 'Ventas', cargo: 'Ejecutiva Comercial', rol: 'Colaborador', ingreso: '02 Ene 2026', status: 'activo', registro: 100, onb: 'en-curso', initials: 'CH', color: '#f97316' },
  { id: 3, name: 'Valentina Cruz', email: 'valentina.cruz@trabajito.com', depto: 'Diseño', cargo: 'Diseñadora UX/UI', rol: 'Colaborador', ingreso: '20 May 2026', status: 'activo', registro: 100, onb: 'en-riesgo', initials: 'VC', color: '#ec4899' },
  { id: 4, name: 'Facundo Medina', email: 'facundo.medina@trabajito.com', depto: 'Tecnología', cargo: 'QA Engineer', rol: 'Colaborador', ingreso: '10 Abr 2026', status: 'activo', registro: 100, onb: 'en-riesgo', initials: 'FM', color: '#ef4444' },
  { id: 5, name: 'Sofía Ramírez', email: 'sofia.ramirez@trabajito.com', depto: 'Ventas', cargo: 'Pasante Comercial', rol: 'Colaborador', ingreso: '10 Jun 2026', status: 'activo', registro: 60, onb: 'sin-ruta', initials: 'SR', color: '#f59e0b' },
  { id: 6, name: 'Martín Solano', email: 'martin.solano@trabajito.com', depto: 'Tecnología', cargo: 'Frontend Developer', rol: 'Colaborador', ingreso: '03 Feb 2025', status: 'activo', registro: 100, onb: 'graduado', initials: 'MS', color: '#10b981' },
  { id: 7, name: 'Luciana Paredes', email: 'luciana.paredes@trabajito.com', depto: 'Ventas', cargo: 'Account Manager', rol: 'Colaborador', ingreso: '17 Jun 2026', status: 'activo', registro: 40, onb: 'sin-ruta', initials: 'LP', color: '#0d9488' },
  { id: 8, name: 'Tomás Ibáñez', email: 'tomas.ibanez@trabajito.com', depto: 'Operaciones', cargo: 'Analista de Procesos', rol: 'Colaborador', ingreso: '17 Jun 2026', status: 'activo', registro: 25, onb: 'sin-ruta', initials: 'TI', color: '#8b5cf6' },
  { id: 9, name: 'Paola Arce', email: 'paola.arce@trabajito.com', depto: 'Recursos Humanos', cargo: 'Especialista RRHH', rol: 'Sub-admin RRHH', ingreso: '10 Ago 2024', status: 'activo', registro: 100, onb: 'n-a', initials: 'PA', color: '#d946ef' },
  { id: 10, name: 'Roberto Peña', email: 'roberto.pena@trabajito.com', depto: 'Finanzas', cargo: 'Contador General', rol: 'Supervisor', ingreso: '05 Nov 2024', status: 'activo', registro: 100, onb: 'n-a', initials: 'RP', color: '#0C2D40' },
  { id: 11, name: 'Andrea Núñez', email: 'andrea.nunez@trabajito.com', depto: 'Marketing', cargo: 'Community Manager', rol: 'Colaborador', ingreso: '22 Sep 2025', status: 'activo', registro: 100, onb: 'en-curso', initials: 'AN', color: '#06b6d4' },
  { id: 12, name: 'Nicolás Zapata', email: 'nicolas.zapata@trabajito.com', depto: 'Ventas', cargo: 'Ejecutivo Senior', rol: 'Líder de área', ingreso: '14 Jul 2024', status: 'activo', registro: 100, onb: 'n-a', initials: 'NZ', color: '#84cc16' },
  { id: 13, name: 'Carolina Vega', email: 'carolina.vega@trabajito.com', depto: 'Marketing', cargo: 'Analista de Marketing', rol: 'Colaborador', ingreso: '08 Mar 2025', status: 'activo', registro: 100, onb: 'graduado', initials: 'CV', color: '#14b8a6' },
  { id: 14, name: 'Alejandro Ríos', email: 'alejandro.rios@trabajito.com', depto: 'Tecnología', cargo: 'DevOps Engineer', rol: 'Colaborador', ingreso: '22 Nov 2024', status: 'activo', registro: 100, onb: 'n-a', initials: 'AR', color: '#6366f1' },
  { id: 15, name: 'Daniela Flores', email: 'daniela.flores@trabajito.com', depto: 'Recursos Humanos', cargo: 'Analista de Nóminas', rol: 'Colaborador', ingreso: '15 Ene 2025', status: 'activo', registro: 100, onb: 'graduado', initials: 'DF', color: '#e11d48' },
  { id: 16, name: 'Sebastián Torres', email: 'sebastian.torres@trabajito.com', depto: 'Operaciones', cargo: 'Coordinador Logístico', rol: 'Supervisor', ingreso: '03 Sep 2025', status: 'vacaciones', registro: 100, onb: 'graduado', initials: 'ST', color: '#0891b2' },
  { id: 17, name: 'Isabella Mendoza', email: 'isabella.mendoza@trabajito.com', depto: 'Finanzas', cargo: 'Analista Financiera', rol: 'Colaborador', ingreso: '18 Abr 2025', status: 'activo', registro: 100, onb: 'en-curso', initials: 'IM', color: '#7c3aed' },
  { id: 18, name: 'Mateo Guzmán', email: 'mateo.guzman@trabajito.com', depto: 'Ventas', cargo: 'SDR Junior', rol: 'Colaborador', ingreso: '25 Jun 2026', status: 'activo', registro: 75, onb: 'sin-ruta', initials: 'MG', color: '#ca8a04' },
  { id: 19, name: 'Renata Castillo', email: 'renata.castillo@trabajito.com', depto: 'Diseño', cargo: 'Diseñadora Gráfica', rol: 'Colaborador', ingreso: '12 Feb 2026', status: 'activo', registro: 100, onb: 'en-curso', initials: 'RC', color: '#db2777' },
  { id: 20, name: 'Gabriel Pacheco', email: 'gabriel.pacheco@trabajito.com', depto: 'Tecnología', cargo: 'Data Analyst', rol: 'Colaborador', ingreso: '30 May 2025', status: 'activo', registro: 100, onb: 'en-curso', initials: 'GP', color: '#059669' },
  { id: 21, name: 'Valeria Rojas', email: 'valeria.rojas@trabajito.com', depto: 'Marketing', cargo: 'Content Creator', rol: 'Colaborador', ingreso: '07 Ago 2025', status: 'activo', registro: 100, onb: 'graduado', initials: 'VR', color: '#c026d3' },
  { id: 22, name: 'Emilio Vargas', email: 'emilio.vargas@trabajito.com', depto: 'Operaciones', cargo: 'Asistente Operativo', rol: 'Colaborador', ingreso: '20 Jun 2026', status: 'licencia', registro: 50, onb: 'sin-ruta', initials: 'EV', color: '#ea580c' },
  { id: 23, name: 'Camilo Espinoza', email: 'camilo.espinoza@trabajito.com', depto: 'Finanzas', cargo: 'Tesorero', rol: 'Gerente', ingreso: '11 Oct 2024', status: 'activo', registro: 100, onb: 'n-a', initials: 'CE', color: '#2563eb' },
  { id: 24, name: 'Julieta Sánchez', email: 'julieta.sanchez@trabajito.com', depto: 'Recursos Humanos', cargo: 'Reclutadora', rol: 'Colaborador', ingreso: '28 Jun 2026', status: 'activo', registro: 15, onb: 'sin-ruta', initials: 'JS', color: '#9333ea' },
]

const permisosPorRol = {
  'Colaborador': [
    { modulo: 'Mi espacio', permisos: ['Ver bienvenida', 'Ver mi onboarding', 'Completar tareas'] },
    { modulo: 'Perfil', permisos: ['Ver perfil propio', 'Editar datos personales'] },
  ],
  'Líder de área': [
    { modulo: 'Mi espacio', permisos: ['Ver bienvenida', 'Ver mi onboarding', 'Completar tareas'] },
    { modulo: 'Perfil', permisos: ['Ver perfil propio', 'Editar datos personales'] },
    { modulo: 'Onboarding', permisos: ['Ver panel', 'Ver asignaciones de su área', 'Validar tareas de su equipo'] },
    { modulo: 'Gestión de personas', permisos: ['Ver colaboradores de su área'] },
  ],
  'Supervisor': [
    { modulo: 'Mi espacio', permisos: ['Ver bienvenida', 'Ver mi onboarding', 'Completar tareas'] },
    { modulo: 'Perfil', permisos: ['Ver perfil propio', 'Editar datos personales'] },
    { modulo: 'Onboarding', permisos: ['Ver panel', 'Ver asignaciones', 'Validar tareas'] },
    { modulo: 'Gestión de personas', permisos: ['Ver colaboradores de su área', 'Editar colaboradores de su área'] },
  ],
  'Sub-admin RRHH': [
    { modulo: 'Mi espacio', permisos: ['Ver bienvenida', 'Ver mi onboarding', 'Completar tareas'] },
    { modulo: 'Perfil', permisos: ['Ver perfil propio', 'Editar datos personales'] },
    { modulo: 'Onboarding', permisos: ['Ver panel', 'Ver asignaciones', 'Asignar rutas', 'Crear rutas', 'Gestionar biblioteca de recursos'] },
    { modulo: 'Gestión de personas', permisos: ['Ver todos los colaboradores', 'Crear colaboradores', 'Editar colaboradores'] },
  ],
  'Gerente': [
    { modulo: 'Mi espacio', permisos: ['Ver bienvenida', 'Ver mi onboarding', 'Completar tareas'] },
    { modulo: 'Perfil', permisos: ['Ver perfil propio', 'Editar datos personales'] },
    { modulo: 'Onboarding', permisos: ['Ver panel', 'Ver asignaciones', 'Asignar rutas'] },
    { modulo: 'Gestión de personas', permisos: ['Ver todos los colaboradores'] },
    { modulo: 'Reportes', permisos: ['Ver reportes de su área', 'Exportar reportes'] },
  ],
}

const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function MiniCalendar({ value, onChange }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1)
  const startDay = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  function isDisabled(day) {
    const date = new Date(viewYear, viewMonth, day)
    return date < today
  }

  function isSelected(day) {
    if (!value || !day) return false
    const sel = new Date(value + 'T00:00:00')
    return sel.getFullYear() === viewYear && sel.getMonth() === viewMonth && sel.getDate() === day
  }

  function isToday(day) {
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day
  }

  function select(day) {
    if (isDisabled(day)) return
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    onChange(`${viewYear}-${m}-${d}`)
  }

  const canPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth())

  const selectedLabel = value
    ? (() => { const d = new Date(value + 'T00:00:00'); return `${d.getDate()} de ${MONTHS[d.getMonth()]} ${d.getFullYear()}` })()
    : null

  return (
    <div style={{
      border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden',
      background: '#fff',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 10px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9',
      }}>
        <button
          onClick={prevMonth}
          disabled={!canPrev}
          style={{
            width: 24, height: 24, borderRadius: 6, border: 'none',
            background: 'transparent', cursor: canPrev ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: canPrev ? '#475569' : '#e2e8f0',
          }}
        >
          <ChevronLeft size={13} />
        </button>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#0C2D40' }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          style={{
            width: 24, height: 24, borderRadius: 6, border: 'none',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#475569',
          }}
        >
          <ChevronRight size={13} />
        </button>
      </div>

      <div style={{ padding: '6px 8px 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 2 }}>
          {DAYS.map(d => (
            <div key={d} style={{
              textAlign: 'center', fontSize: 9, fontWeight: 700,
              color: '#94a3b8', padding: '3px 0',
            }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {cells.map((day, i) => (
            <button
              key={i}
              disabled={!day || isDisabled(day)}
              onClick={() => day && select(day)}
              style={{
                width: '100%', aspectRatio: '1', borderRadius: 6, border: 'none',
                fontSize: 11, fontWeight: isSelected(day) ? 700 : isToday(day) ? 600 : 400,
                fontFamily: 'inherit',
                background: isSelected(day) ? '#0C2D40' : isToday(day) ? '#f1f5f9' : 'transparent',
                color: !day ? 'transparent'
                  : isSelected(day) ? '#fff'
                  : isDisabled(day) ? '#d1d5db'
                  : isToday(day) ? '#0C2D40'
                  : '#334155',
                cursor: !day || isDisabled(day) ? 'default' : 'pointer',
                transition: 'all .1s',
                position: 'relative',
              }}
            >
              {day || ''}
              {isToday(day) && !isSelected(day) && (
                <div style={{
                  position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
                  width: 4, height: 4, borderRadius: '50%', background: '#10DC97',
                }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedLabel && (
        <div style={{
          padding: '6px 10px', borderTop: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#f0fdf4',
        }}>
          <Calendar size={11} style={{ color: '#16a34a' }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: '#166534' }}>{selectedLabel}</span>
        </div>
      )}
    </div>
  )
}

export default function Colaboradores() {
  const { activarRuta } = useRutaActiva()
  const { tronco } = useTronco()
  const [search, setSearch] = useState('')
  const [filterDepto, setFilterDepto] = useState('Todos')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [page, setPage] = useState(1)
  const [menuOpen, setMenuOpen] = useState(null)
  const [rolModal, setRolModal] = useState(null)
  const [estadoModal, setEstadoModal] = useState(null)
  const [showOnbHelp, setShowOnbHelp] = useState(false)
  const [showStatusFilter, setShowStatusFilter] = useState(false)
  const [onbModal, setOnbModal] = useState(null)
  const [onbSelected, setOnbSelected] = useState(null)
  const [onbFecha, setOnbFecha] = useState('')
  const [onbSearch, setOnbSearch] = useState('')
  const [onbArea, setOnbArea] = useState('Todas')
  const [onbFilterOpen, setOnbFilterOpen] = useState(false)
  const [onbStep, setOnbStep] = useState(1)
  const perPage = 8

  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  const filtered = colaboradoresData.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.cargo.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    const matchDepto = filterDepto === 'Todos' || c.depto === filterDepto
    const matchStatus = filterStatus === 'todos' || c.status === filterStatus
    return matchSearch && matchDepto && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const totalActivos = colaboradoresData.filter(c => c.status === 'activo').length
  const totalInactivos = colaboradoresData.filter(c => c.status !== 'activo').length

  return (
    <div className="content-scroll">
      <div className="pl-header">
        <div>
          <h1 className="pl-title">Colaboradores</h1>
          <p className="pl-subtitle">Directorio de colaboradores de la organización</p>
        </div>
        <button className="pl-btn-new">
          <Plus size={15} />
          Nuevo colaborador
        </button>
      </div>

      <div className="kpi-strip">
        <div className="kpi-card">
          <div className="kpi-title" style={{ color: 'var(--blue)' }}>Total</div>
          <div className="kpi-val">{colaboradoresData.length}</div>
          <div className="kpi-lbl">Colaboradores registrados</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title" style={{ color: 'var(--green)' }}>Activos</div>
          <div className="kpi-val">{totalActivos}</div>
          <div className="kpi-lbl">En la organización</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title" style={{ color: 'var(--yellow)' }}>Ausentes</div>
          <div className="kpi-val">{totalInactivos}</div>
          <div className="kpi-lbl">Vacaciones, licencia u otro</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title" style={{ color: 'var(--purple)' }}>Departamentos</div>
          <div className="kpi-val">{departamentos.length - 1}</div>
          <div className="kpi-lbl">Áreas activas</div>
        </div>
      </div>

      <div className="pl-toolbar">
        <div className="pl-search-wrap">
          <Search size={14} className="pl-search-ico" />
          <input
            type="text"
            className="pl-search"
            placeholder="Buscar por nombre, cargo o email…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
          {filterStatus !== 'todos' && (
            <div style={{
              height: 32, padding: '0 8px 0 10px', borderRadius: 8,
              background: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 600, color: '#475569',
            }}>
              {{ activo: 'Activos', vacaciones: 'Vacaciones', licencia: 'Licencia', suspendido: 'Suspendido', desvinculado: 'Desvinculado' }[filterStatus]}
              <button
                onClick={() => { setFilterStatus('todos'); setPage(1) }}
                style={{
                  width: 18, height: 18, borderRadius: 4, border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#94a3b8',
                }}
              >
                <X size={12} />
              </button>
            </div>
          )}
          <button
            onClick={() => setShowStatusFilter(!showStatusFilter)}
            style={{
              height: 38, padding: '0 12px', borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              color: '#64748b',
            }}
          >
            <Filter size={14} />
          </button>
          {showStatusFilter && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 4,
              background: '#fff', borderRadius: 10, padding: 4,
              boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid #e2e8f0',
              zIndex: 30, minWidth: 180, animation: 'plSlideUp .12s',
            }}>
              {[
                { key: 'todos', label: 'Todos', color: '#0C2D40' },
                { key: 'activo', label: 'Activos', color: '#16a34a' },
                { key: 'vacaciones', label: 'Vacaciones', color: '#f59e0b' },
                { key: 'licencia', label: 'Licencia médica', color: '#3b82f6' },
                { key: 'suspendido', label: 'Suspendido', color: '#ef4444' },
                { key: 'desvinculado', label: 'Desvinculado', color: '#94a3b8' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => { setFilterStatus(f.key); setPage(1); setShowStatusFilter(false) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', border: 'none', borderRadius: 7,
                    background: filterStatus === f.key ? '#f8fafc' : 'transparent',
                    cursor: 'pointer', fontSize: 12, fontWeight: filterStatus === f.key ? 600 : 400,
                    color: filterStatus === f.key ? '#0C2D40' : '#475569',
                    fontFamily: 'inherit', textAlign: 'left',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => { if (filterStatus !== f.key) e.currentTarget.style.background = 'transparent' }}
                >
                  {f.key !== 'todos' && (
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                  )}
                  <span style={{ flex: 1 }}>{f.label}</span>
                  {filterStatus === f.key && <CheckCircle2 size={13} style={{ color: '#10b981' }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 12, display: 'flex', gap: 6, flexWrap: 'wrap', padding: '0 2px' }}>
        {departamentos.map(d => (
          <button
            key={d}
            onClick={() => { setFilterDepto(d); setPage(1) }}
            style={{
              padding: '5px 12px', borderRadius: 8, border: 'none',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
              background: filterDepto === d ? '#0C2D40' : '#f1f5f9',
              color: filterDepto === d ? '#fff' : '#64748b',
              transition: 'all .15s',
            }}
          >{d}</button>
        ))}
      </div>

      <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
        <table className="as-table" style={{ minWidth: 1200 }}>
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Departamento</th>
              <th>Cargo</th>
              <th>Rol</th>
              <th>Registro</th>
              <th style={{ position: 'relative' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Onboarding
                  <Info
                    size={12}
                    style={{ color: '#cbd5e1', cursor: 'pointer' }}
                    onMouseEnter={() => setShowOnbHelp(true)}
                    onMouseLeave={() => setShowOnbHelp(false)}
                  />
                </span>
                {showOnbHelp && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: 6,
                    background: '#fff', borderRadius: 12, padding: '14px 16px',
                    boxShadow: '0 12px 40px rgba(0,0,0,.12)', border: '1px solid #e2e8f0',
                    zIndex: 20, width: 260, animation: 'plSlideUp .12s',
                    textTransform: 'none', letterSpacing: 0,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0C2D40', marginBottom: 10, textTransform: 'none', letterSpacing: 0 }}>
                      Estados de onboarding
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { label: 'N/A', color: '#cbd5e1', bg: 'rgba(203,213,225,.15)', desc: 'Incorporado antes del sistema' },
                        { label: 'Sin ruta', color: '#94a3b8', bg: 'rgba(148,163,184,.15)', desc: 'Nuevo ingreso sin ruta asignada' },
                        { label: 'En curso', color: '#3b82f6', bg: 'rgba(59,130,246,.15)', desc: 'Realizando su onboarding' },
                        { label: 'En riesgo', color: '#dc2626', bg: 'rgba(220,38,38,.15)', desc: '+3 días sin actividad' },
                        { label: 'Graduado', color: '#10DC97', bg: 'rgba(16,220,151,.15)', desc: 'Completó todas las etapas' },
                      ].map(s => (
                        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                            background: s.bg, color: s.color, whiteSpace: 'nowrap', minWidth: 70, textAlign: 'center',
                          }}>{s.label}</span>
                          <span style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.3 }}>{s.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </th>
              <th>Ingreso</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="as-person">
                    <div className="as-avatar" style={{ background: c.color }}>{c.initials}</div>
                    <div>
                      <div className="as-name">{c.name}</div>
                      <div className="as-area">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="as-ruta">{c.depto}</span></td>
                <td><span className="as-ruta">{c.cargo}</span></td>
                <td><span className="as-ruta">{c.rol}</span></td>
                <td>
                  <div className="pr-progress">
                    <div className="pr-pct">{c.registro}%</div>
                    <div className="pr-bar">
                      <div className="pr-fill" style={{
                        width: `${c.registro}%`,
                        background: c.registro === 100 ? 'var(--green)' : c.registro >= 50 ? 'var(--blue)' : 'var(--yellow)',
                      }} />
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: { 'graduado': '#f0fdf4', 'en-curso': '#eff6ff', 'en-riesgo': '#fef2f2', 'sin-ruta': '#f8fafc', 'n-a': '#f8fafc' }[c.onb],
                    color: { 'graduado': '#16a34a', 'en-curso': '#2563eb', 'en-riesgo': '#dc2626', 'sin-ruta': '#64748b', 'n-a': '#b0b8c4' }[c.onb],
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                      background: { 'graduado': '#16a34a', 'en-curso': '#2563eb', 'en-riesgo': '#dc2626', 'sin-ruta': '#94a3b8', 'n-a': '#cbd5e1' }[c.onb],
                    }} />
                    {{ 'sin-ruta': 'Sin ruta', 'en-curso': 'En curso', 'en-riesgo': 'En riesgo', 'graduado': 'Graduado', 'n-a': 'N/A' }[c.onb]}
                  </span>
                </td>
                <td><span className="as-fecha">{c.ingreso}</span></td>
                <td>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                    background: { activo: '#f0fdf4', vacaciones: '#fefce8', licencia: '#eff6ff', suspendido: '#fef2f2', desvinculado: '#f8fafc' }[c.status],
                    color: { activo: '#16a34a', vacaciones: '#b45309', licencia: '#2563eb', suspendido: '#dc2626', desvinculado: '#64748b' }[c.status],
                  }}>
                    {{ activo: 'Activo', vacaciones: 'Vacaciones', licencia: 'Licencia', suspendido: 'Suspendido', desvinculado: 'Desvinculado' }[c.status]}
                  </span>
                </td>
                <td style={{ position: 'relative' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === c.id ? null : c.id) }}
                    style={{
                      width: 28, height: 28, borderRadius: 6, border: 'none',
                      background: menuOpen === c.id ? '#f1f5f9' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#94a3b8', fontFamily: 'inherit',
                    }}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {menuOpen === c.id && (() => {
                    const idx = paginated.indexOf(c)
                    const openUp = idx >= paginated.length - 2
                    return (
                    <div style={{
                      position: 'absolute', right: 0,
                      ...(openUp ? { bottom: '100%' } : { top: '100%' }),
                      zIndex: 20,
                      background: '#fff', borderRadius: 10, padding: 4,
                      boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid #e2e8f0',
                      minWidth: 180, animation: 'plSlideUp .12s',
                    }}>
                      {[
                        { icon: Eye, label: 'Ver perfil', color: '#475569' },
                        { icon: Pencil, label: 'Editar', color: '#475569' },
                        { icon: Shield, label: 'Roles y permisos', color: '#475569', action: () => setRolModal(c) },
                        { icon: Rocket, label: 'Asignar onboarding', color: '#0C2D40', action: () => { setOnbModal(c); setOnbSelected(null); setOnbFecha(''); setOnbSearch(''); setOnbArea('Todas'); setOnbStep(1) } },
                        { icon: Send, label: 'Enviar credenciales', color: '#475569' },
                        { icon: RefreshCw, label: 'Cambiar estado', color: '#475569', action: () => setEstadoModal(c) },
                      ].map(action => (
                        <button
                          key={action.label}
                          onClick={() => { setMenuOpen(null); action.action?.() }}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 10px', border: 'none', borderRadius: 7,
                            background: 'transparent', cursor: 'pointer',
                            fontSize: 12, fontWeight: 500, color: action.color,
                            fontFamily: 'inherit', textAlign: 'left',
                            transition: 'background .1s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <action.icon size={14} />
                          {action.label}
                        </button>
                      ))}
                    </div>
                    )
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>No se encontraron colaboradores</div>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderTop: '1px solid #f1f5f9',
          }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} de {filtered.length} colaboradores
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: '1px solid #e2e8f0',
                  background: '#fff', cursor: page === 1 ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: page === 1 ? '#cbd5e1' : '#475569',
                  opacity: page === 1 ? 0.5 : 1,
                }}
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    border: p === page ? 'none' : '1px solid #e2e8f0',
                    background: p === page ? '#0C2D40' : '#fff',
                    color: p === page ? '#fff' : '#475569',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'inherit',
                  }}
                >{p}</button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: '1px solid #e2e8f0',
                  background: '#fff', cursor: page === totalPages ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: page === totalPages ? '#cbd5e1' : '#475569',
                  opacity: page === totalPages ? 0.5 : 1,
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ height: 8 }} />

      {/* MODAL ASIGNAR ONBOARDING */}
      {onbModal && (() => {
        const rutas = [
          { id: 1, name: 'Onboarding Ventas — Pasante', area: 'Ventas', etapas: 12, tareas: 34, color: '#3b82f6' },
          { id: 2, name: 'Onboarding Comercial — Ejecutivo', area: 'Comercial', etapas: 10, tareas: 28, color: '#10b981' },
          { id: 3, name: 'Onboarding Liderazgo', area: 'Dirección', etapas: 8, tareas: 22, color: '#8b5cf6' },
          { id: 4, name: 'Onboarding Operaciones', area: 'Operaciones', etapas: 9, tareas: 25, color: '#f59e0b' },
          { id: 5, name: 'Onboarding Tech — Backend', area: 'Tecnología', etapas: 14, tareas: 40, color: '#06b6d4' },
          { id: 7, name: 'Onboarding Diseño & UX', area: 'Diseño', etapas: 11, tareas: 30, color: '#ec4899' },
          { id: 9, name: 'Onboarding Marketing Digital', area: 'Marketing', etapas: 10, tareas: 26, color: '#d946ef' },
        ]
        const selectedRuta = rutas.find(r => r.id === onbSelected)
        return (
          <div className="pl-overlay" onClick={() => setOnbModal(null)}>
            <div className="pl-modal jb-modal" style={{ width: 860, maxWidth: '92vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: onbModal.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{onbModal.initials}</span>
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 15 }}>Asignar onboarding</h2>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{onbModal.name} · {onbModal.depto}</span>
                  </div>
                </div>
                <button className="pl-modal-close" onClick={() => setOnbModal(null)}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'row', gap: 24, padding: '20px 28px', flex: 1, minHeight: 0 }}>

                {/* IZQUIERDA: SELECCIONAR RUTA */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Seleccionar ruta
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <div className="pl-search-wrap" style={{ flex: 1 }}>
                      <Search size={14} className="pl-search-ico" />
                      <input
                        type="text"
                        className="pl-search"
                        placeholder="Buscar ruta..."
                        value={onbSearch}
                        onChange={e => setOnbSearch(e.target.value)}
                      />
                    </div>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setOnbFilterOpen(!onbFilterOpen)}
                        style={{
                          height: '100%', padding: '0 12px', borderRadius: 8,
                          border: onbArea !== 'Todas' ? '1.5px solid #0C2D40' : '1px solid #e2e8f0',
                          background: onbArea !== 'Todas' ? '#f0f9ff' : '#fff',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                          fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
                          color: onbArea !== 'Todas' ? '#0C2D40' : '#64748b',
                        }}
                      >
                        <Filter size={13} />
                        {onbArea !== 'Todas' && <span>{onbArea}</span>}
                      </button>
                      {onbFilterOpen && (
                        <div style={{
                          position: 'absolute', right: 0, top: '100%', marginTop: 4,
                          background: '#fff', borderRadius: 10, padding: 4,
                          boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid #e2e8f0',
                          zIndex: 30, minWidth: 180, maxHeight: 220, overflowY: 'auto',
                          animation: 'plSlideUp .12s',
                        }}>
                          {['Todas', ...new Set(rutas.map(r => r.area))].map(a => (
                            <button
                              key={a}
                              onClick={() => { setOnbArea(a); setOnbFilterOpen(false) }}
                              style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '8px 10px', border: 'none', borderRadius: 7,
                                background: onbArea === a ? '#f8fafc' : 'transparent',
                                cursor: 'pointer', fontSize: 12, fontWeight: onbArea === a ? 700 : 500,
                                color: onbArea === a ? '#0C2D40' : '#475569',
                                fontFamily: 'inherit', textAlign: 'left',
                                transition: 'background .1s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                              onMouseLeave={e => { if (onbArea !== a) e.currentTarget.style.background = 'transparent' }}
                            >
                              {a}
                              {onbArea === a && <CheckCircle2 size={13} style={{ color: '#10b981' }} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ maxHeight: 250, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {rutas
                      .filter(r => (onbArea === 'Todas' || r.area === onbArea) && r.name.toLowerCase().includes(onbSearch.toLowerCase()))
                      .map(r => (
                      <button
                        key={r.id}
                        onClick={() => setOnbSelected(r.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', borderRadius: 10, width: '100%',
                          border: onbSelected === r.id ? `2px solid ${r.color}` : '2px solid transparent',
                          background: onbSelected === r.id ? `${r.color}08` : '#fff',
                          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                          transition: 'all .15s',
                        }}
                        onMouseEnter={e => { if (onbSelected !== r.id) e.currentTarget.style.background = '#f8fafc' }}
                        onMouseLeave={e => { if (onbSelected !== r.id) e.currentTarget.style.background = '#fff' }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: `${r.color}12`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Route size={14} style={{ color: r.color }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40' }}>{r.name}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>{r.area} · {r.etapas} etapas · {r.tareas} tareas</div>
                        </div>
                        {onbSelected === r.id && (
                          <CheckCircle2 size={16} style={{ color: r.color, flexShrink: 0 }} />
                        )}
                      </button>
                    ))}
                    {rutas.filter(r => (onbArea === 'Todas' || r.area === onbArea) && r.name.toLowerCase().includes(onbSearch.toLowerCase())).length === 0 && (
                      <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
                        No se encontraron rutas
                      </div>
                    )}
                  </div>
                </div>

                {/* SEPARADOR */}
                <div style={{ width: 1, background: '#e2e8f0', flexShrink: 0, alignSelf: 'stretch' }} />

                {/* DERECHA: FECHA DE INICIO */}
                <div style={{ width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Fecha de inicio
                  </div>
                  <MiniCalendar value={onbFecha} onChange={setOnbFecha} />
                </div>
              </div>

              <div className="pl-modal-footer">
                <button className="pl-btn-cancel" onClick={() => setOnbModal(null)}>Cancelar</button>
                <button
                  className="pl-btn-save"
                  disabled={!onbSelected || !onbFecha}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...(!onbSelected || !onbFecha ? { opacity: 0.5, cursor: 'default' } : {}) }}
                  onClick={() => {
                    const ruta = rutas.find(r => r.id === onbSelected)
                    if (ruta) {
                      const src = rutasData[1]
                      const etapas = JSON.parse(JSON.stringify(src.etapas))
                      if (tronco.configured) {
                        const troncoEtapas = tronco.etapas.map(e => ({ ...JSON.parse(JSON.stringify(e)), locked: true }))
                        etapas.unshift(...troncoEtapas)
                      }
                      activarRuta(etapas, { nombre: ruta.name, area: ruta.area })
                    }
                    setOnbModal(null)
                  }}
                >
                  <Rocket size={13} />
                  Asignar ruta
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL CAMBIAR ESTADO */}
      {estadoModal && (() => {
        const estados = [
          { key: 'activo', label: 'Activo', desc: 'Colaborador en funciones normales', icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4' },
          { key: 'vacaciones', label: 'Vacaciones', desc: 'Ausencia programada por descanso', icon: Palmtree, color: '#f59e0b', bg: '#fefce8' },
          { key: 'licencia', label: 'Licencia médica', desc: 'Baja temporal por motivos de salud', icon: Stethoscope, color: '#3b82f6', bg: '#eff6ff' },
          { key: 'suspendido', label: 'Suspendido', desc: 'Suspensión temporal de actividades', icon: Ban, color: '#ef4444', bg: '#fef2f2' },
          { key: 'desvinculado', label: 'Desvinculado', desc: 'Ya no forma parte de la organización', icon: UserMinus, color: '#64748b', bg: '#f8fafc' },
        ]
        return (
          <div className="pl-overlay" onClick={() => setEstadoModal(null)}>
            <div className="pl-modal jb-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: estadoModal.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{estadoModal.initials}</span>
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 15 }}>Cambiar estado</h2>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{estadoModal.name}</span>
                  </div>
                </div>
                <button className="pl-modal-close" onClick={() => setEstadoModal(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="pl-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {estados.map(st => {
                  const isActive = estadoModal.status === st.key
                  return (
                    <button
                      key={st.key}
                      onClick={() => setEstadoModal(null)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 10,
                        border: isActive ? `2px solid ${st.color}` : '2px solid transparent',
                        background: isActive ? st.bg : '#fff',
                        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                        transition: 'all .15s', width: '100%',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc' }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? st.bg : '#fff' }}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: st.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <st.icon size={16} style={{ color: st.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0C2D40' }}>{st.label}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{st.desc}</div>
                      </div>
                      {isActive && (
                        <div style={{
                          fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                          background: st.color, color: '#fff', textTransform: 'uppercase',
                        }}>Actual</div>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="pl-modal-footer">
                <button className="pl-btn-cancel" onClick={() => setEstadoModal(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL ROLES Y PERMISOS */}
      {rolModal && (() => {
        const modulos = permisosPorRol[rolModal.rol] || permisosPorRol['Colaborador']
        return (
          <div className="pl-overlay" onClick={() => setRolModal(null)}>
            <div className="pl-modal jb-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: rolModal.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{rolModal.initials}</span>
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 15 }}>{rolModal.name}</h2>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{rolModal.cargo} · {rolModal.depto}</span>
                  </div>
                </div>
                <button className="pl-modal-close" onClick={() => setRolModal(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="pl-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', borderRadius: 10,
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                }}>
                  <Shield size={16} style={{ color: '#0C2D40' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40' }}>{rolModal.rol}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Rol asignado en la plataforma</div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                    Permisos por módulo
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {modulos.map(m => (
                      <div key={m.modulo} style={{
                        border: '1px solid #f1f5f9', borderRadius: 10, overflow: 'hidden',
                      }}>
                        <div style={{
                          padding: '8px 14px', background: '#f8fafc',
                          fontSize: 12, fontWeight: 700, color: '#0C2D40',
                          borderBottom: '1px solid #f1f5f9',
                        }}>
                          {m.modulo}
                        </div>
                        <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {m.permisos.map(p => (
                            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <CheckCircle2 size={12} style={{ color: '#10b981', flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: '#475569' }}>{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pl-modal-footer">
                <button className="pl-btn-cancel" onClick={() => setRolModal(null)}>Cerrar</button>
                <button className="pl-btn-save">Editar permisos</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
