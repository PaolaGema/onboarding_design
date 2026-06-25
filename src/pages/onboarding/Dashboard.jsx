import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import JourneyBuilder from './JourneyBuilder'
import {
  Loader, AlertTriangle, CheckCircle2, LayoutTemplate,
  TrendingUp, Zap, UserPlus, PencilRuler, Settings2,
  CalendarPlus, Activity, Rocket, Sparkles, Download,
  Smartphone, Plus, ClipboardList, Clock, CircleAlert,
  Search, Route, Users, Star, CalendarHeart,
  X, ChevronDown, ChevronLeft, ChevronRight, Check, Filter, Calendar,
  Shield, BookOpen, FileText as FileTextIcon, ArrowRight
} from 'lucide-react'

const cargosPorArea = {
  'Ventas': ['Pasante Comercial', 'SDR Junior', 'Ejecutiva Comercial', 'Ejecutivo Senior', 'Account Manager', 'Gerente de Ventas'],
  'Comercial': ['Ejecutivo Comercial', 'Key Account Manager', 'Coordinador Comercial', 'Director Comercial'],
  'Dirección': ['Director General', 'Director de Área', 'Gerente General', 'Asistente de Dirección'],
  'Operaciones': ['Asistente Operativo', 'Analista de Procesos', 'Coordinador Logístico', 'Gerente de Operaciones'],
  'Tecnología': ['Desarrollador Backend', 'Frontend Developer', 'QA Engineer', 'DevOps Engineer', 'Data Analyst', 'Tech Lead'],
  'Finanzas': ['Analista Financiera', 'Contador General', 'Tesorero', 'Auditor Interno'],
  'Diseño': ['Diseñadora UX/UI', 'Diseñadora Gráfica', 'Director Creativo', 'Motion Designer'],
  'Recursos Humanos': ['Reclutadora', 'Especialista RRHH', 'Analista de Nóminas', 'Generalista RRHH'],
  'Marketing': ['Community Manager', 'Analista de Marketing', 'Content Creator', 'Growth Manager'],
  'Legal': ['Abogado Corporativo', 'Paralegal', 'Director Legal'],
}
const areas = Object.keys(cargosPorArea)

const rutasAsignar = [
  { id: 1, name: 'Onboarding Ventas — Pasante', area: 'Ventas', etapas: 12, tareas: 34, color: '#3b82f6' },
  { id: 2, name: 'Onboarding Comercial — Ejecutivo', area: 'Comercial', etapas: 10, tareas: 28, color: '#10b981' },
  { id: 3, name: 'Onboarding Liderazgo', area: 'Dirección', etapas: 8, tareas: 22, color: '#8b5cf6' },
  { id: 4, name: 'Onboarding Operaciones', area: 'Operaciones', etapas: 9, tareas: 25, color: '#f59e0b' },
  { id: 5, name: 'Onboarding Tech — Backend', area: 'Tecnología', etapas: 14, tareas: 40, color: '#06b6d4' },
  { id: 7, name: 'Onboarding Diseño & UX', area: 'Diseño', etapas: 11, tareas: 30, color: '#ec4899' },
  { id: 9, name: 'Onboarding Marketing Digital', area: 'Marketing', etapas: 10, tareas: 26, color: '#d946ef' },
]

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
              {isToday(day) && !isSelected(day) && (<div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#10DC97' }} />)}
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

/* ── DATA ────────────────────────────────────── */

const kpis = [
  { title: 'Activos', value: '23', label: 'Onboardings en curso', accent: 'var(--blue)', alert: false },
  { title: 'Completados', value: '142', label: 'Graduaciones totales', accent: 'var(--green)', alert: false },
  { title: 'Atrasados', value: '5', label: 'Con tareas vencidas', accent: 'var(--yellow)', alert: false },
  { title: 'En riesgo', value: '3', label: '+3 días sin actividad', accent: 'var(--red)', alert: true },
  { title: 'Tiempo promedio', value: '30d', label: 'Para completar onboarding', accent: 'var(--purple)', alert: false },
]

const quickAccess = [
  { icon: LayoutTemplate, color: 'var(--purple)', bg: 'var(--purple-bg)', label: 'Rutas', desc: 'Crear y editar rutas', sub: '7 activas', path: '/onboarding/plantillas' },
  { icon: UserPlus, color: 'var(--blue)', bg: 'var(--blue-bg)', label: 'Asignación', desc: 'Asignar rutas a colaboradores', sub: '2 pendientes', path: '/onboarding/asignaciones' },
  { icon: PencilRuler, color: 'var(--navy)', bg: '#e0e7ef', label: 'Biblioteca de recursos', desc: 'Documentos y materiales', sub: 'Contenido', path: '/onboarding/conocimiento' },
  { icon: Settings2, color: 'var(--green)', bg: 'var(--green-bg)', label: 'Configuración', desc: 'Puntos, notificaciones y permisos', sub: 'Ajustes globales', path: '/onboarding/configuracion' },
]

const progressData = [
  { name: 'Diego Morales', route: 'Onboarding Tech', pct: 68, day: '14 / 30', color: '#3b82f6', progColor: 'var(--blue)' },
  { name: 'Camila Herrera', route: 'Onboarding Ventas', pct: 42, day: '18 / 30', color: '#f97316', progColor: 'var(--blue)' },
  { name: 'Valentina Cruz', route: 'Onboarding Diseño', pct: 25, day: '20 / 30', color: '#ec4899', progColor: 'var(--yellow)' },
  { name: 'Facundo Medina', route: 'Onboarding Tech', pct: 15, day: '21 / 30', color: '#ef4444', progColor: 'var(--yellow)' },
  { name: 'Sofía Ramírez', route: 'Onboarding Ventas', pct: 0, day: '1 / 30', color: '#f59e0b', progColor: 'var(--border-dark)' },
]

const alertsData = [
  { name: 'Valentina Cruz', sub: 'Sin actividad hace 4 días · Diseño & UX', color: '#ec4899', badge: 'En riesgo', badgeCls: 'b-riesgo' },
  { name: 'Facundo Medina', sub: 'Sin actividad hace 3 días · Tech Backend', color: '#ef4444', badge: 'En riesgo', badgeCls: 'b-riesgo' },
  { name: 'Luciana Paredes', sub: 'Ingresa en 7 días · Sin ruta asignada', color: '#0d9488', badge: 'Sin ruta', badgeCls: 'b-hoy' },
  { name: 'Tomás Ibáñez', sub: 'Ingresa en 7 días · Sin ruta asignada', color: '#f59e0b', badge: 'Sin ruta', badgeCls: 'b-hoy' },
]

const upcomingData = [
  { day: '10', month: 'JUN', name: 'Sofía Ramírez', sub: 'Ventas · Ruta asignada', color: '#f59e0b' },
  { day: '12', month: 'JUN', name: 'Facundo Medina', sub: 'Tecnología · En progreso', color: '#ef4444' },
  { day: '17', month: 'JUN', name: 'Luciana Paredes', sub: 'Ventas · ⚠ Sin ruta aún', color: '#0d9488' },
  { day: '23', month: 'JUN', name: 'Tomás Ibáñez', sub: 'Operaciones · ⚠ Sin ruta aún', color: '#f59e0b' },
]

const feedData = [
  { text: <><strong>Martín Solano</strong> completó su ruta de Onboarding Tech</>, time: 'Hace 2 h' },
  { text: <><strong>Diego Morales</strong> completó la tarea "Mensaje del CEO"</>, time: 'Hace 3 h' },
  { text: <><strong>Valentina Cruz</strong> fue marcada "en riesgo" por inactividad</>, time: 'Hace 5 h' },
  { text: <>Nueva ruta <strong>"Onboarding Finanzas"</strong> creada por Paola A.</>, time: 'Ayer' },
  { text: <><strong>Sofía Ramírez</strong> fue asignada a Onboarding Ventas 2026</>, time: 'Ayer' },
]

const rutasActivas = [
  { name: 'Ventas — Pasante', count: 8, color: 'var(--blue)' },
  { name: 'Comercial — Ejecutivo', count: 5, color: 'var(--green)' },
  { name: 'Liderazgo', count: 2, color: 'var(--purple)' },
  { name: 'Operaciones', count: 3, color: 'var(--yellow)' },
]

const colaboradores = [
  { initials: 'PP', name: 'Ventas · Pasante', route: 'Ventas — Pasante', pct: 45, day: '14 / 30', status: 'En tiempo', statusCls: 'st-ok', color: '#3b82f6' },
  { initials: 'IV', name: 'Ventas · Pasante de Atención', route: 'Ventas — Pasante', pct: 64, day: '18 / 30', status: 'En tiempo', statusCls: 'st-ok', color: '#10b981' },
  { initials: 'AN', name: 'Ventas · Pasante de Atención', route: 'Ventas — Pasante', pct: 67, day: '20 / 30', status: 'En tiempo', statusCls: 'st-ok', color: '#f97316' },
  { initials: 'NR', name: 'Ventas · Pasante de Atención', route: 'Ventas — Pasante', pct: 27, day: '21 / 30', status: 'En riesgo', statusCls: 'st-risk', color: '#ef4444' },
  { initials: 'NZ', name: 'Ventas · Ejecutivo Comercial', route: 'Comercial — Ejecutivo', pct: 73, day: '24 / 30', status: 'En tiempo', statusCls: 'st-ok', color: '#8b5cf6' },
  { initials: 'RP', name: 'Ventas · Gerente de Ventas', route: 'Liderazgo', pct: 90, day: '28 / 30', status: 'En tiempo', statusCls: 'st-ok', color: '#0d9488' },
  { initials: 'AR', name: 'Psicometría · Psicómetra', route: 'Operaciones', pct: 100, day: '30 / 30', status: 'Completado', statusCls: 'st-done', color: '#f59e0b' },
]

/* ── DATA MANAGER (Marketing) ───────────────── */

const managerKpis = [
  { title: 'Mi equipo', value: '4', label: 'Colaboradores en Marketing', accent: 'var(--blue)', alert: false },
  { title: 'En onboarding', value: '2', label: 'Realizando su ruta', accent: 'var(--green)', alert: false },
  { title: 'En riesgo', value: '0', label: 'Sin alertas activas', accent: 'var(--yellow)', alert: false },
  { title: 'Graduados', value: '2', label: 'Onboarding completado', accent: 'var(--purple)', alert: false },
]

const managerProgress = [
  { name: 'Andrea Núñez', route: 'Onboarding Marketing Digital', pct: 55, day: '16 / 30', color: '#06b6d4', progColor: 'var(--blue)' },
  { name: 'Isabella Mendoza', route: 'Onboarding Marketing Digital', pct: 32, day: '10 / 30', color: '#7c3aed', progColor: 'var(--blue)' },
]

const managerGraduados = [
  { name: 'Valeria Rojas', cargo: 'Content Creator', fecha: '12 Feb 2026', color: '#c026d3' },
  { name: 'Carolina Vega', cargo: 'Analista de Marketing', fecha: '28 Jun 2025', color: '#14b8a6' },
]

const managerAlerts = [
  { name: 'Andrea Núñez', sub: 'Tiene 3 tareas pendientes esta semana', color: '#06b6d4', badge: 'Pendiente', badgeCls: 'b-hoy' },
]

const managerFeed = [
  { text: <><strong>Andrea Núñez</strong> completó la tarea "Manual de marca"</>, time: 'Hace 1 h' },
  { text: <><strong>Isabella Mendoza</strong> inició su ruta de onboarding</>, time: 'Hace 2 días' },
  { text: <><strong>Valeria Rojas</strong> se graduó de su onboarding</>, time: 'Hace 1 semana' },
]

const managerTareasPendientes = [
  { name: 'Validar recorrido de Andrea Núñez', tipo: 'Supervisar tarea', color: '#f59e0b' },
  { name: 'Reunión de bienvenida con Isabella', tipo: 'Reunión pendiente', color: '#3b82f6' },
]

function initials(name) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('')
}

/* ── COMPONENT ───────────────────────────────── */

export default function Dashboard() {
  const { currentUser } = useUser()
  const navigate = useNavigate()
  const [searchColab, setSearchColab] = useState('')
  const [modalCrear, setModalCrear] = useState(false)
  const [modalAsignar, setModalAsignar] = useState(false)
  const [formRuta, setFormRuta] = useState({ name: '', area: 'Ventas', cargo: '' })
  const [dropArea, setDropArea] = useState(false)
  const [dropCargo, setDropCargo] = useState(false)
  const [asignarStep, setAsignarStep] = useState(1)
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
  const [onbSelected, setOnbSelected] = useState(null)
  const [onbFecha, setOnbFecha] = useState('')
  const [onbSearch, setOnbSearch] = useState('')
  const [onbArea, setOnbArea] = useState('Todas')
  const [onbCargo, setOnbCargo] = useState('Todos')
  const [onbSede, setOnbSede] = useState('Todas')
  const [showRutaFilters, setShowRutaFilters] = useState(false)
  const [rfDropSede, setRfDropSede] = useState(false)
  const [rfDropArea, setRfDropArea] = useState(false)
  const [rfDropCargo, setRfDropCargo] = useState(false)
  const [activeJourney, setActiveJourney] = useState(null)
  const isManager = currentUser.role === 'manager'
  const managerArea = 'Marketing'

  const filteredColab = colaboradores.filter(c =>
    c.name.toLowerCase().includes(searchColab.toLowerCase()) ||
    c.route.toLowerCase().includes(searchColab.toLowerCase())
  )

  const firstName = currentUser.name.split(' ')[0]

  const colores = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#f97316', '#ec4899', '#0d9488', '#d946ef', '#ef4444']

  function handleCrearRuta() {
    if (!formRuta.name.trim()) return
    const newId = Date.now()
    const color = colores[newId % colores.length]
    setModalCrear(false)
    setActiveJourney({
      id: newId,
      name: formRuta.name.trim(),
      area: formRuta.area,
      cargo: formRuta.cargo || '',
      color,
      isNew: true,
    })
  }

  if (activeJourney) {
    return (
      <JourneyBuilder
        plantilla={activeJourney}
        onBack={() => setActiveJourney(null)}
        empty={activeJourney.isNew}
        backLabel="Panel de onboarding"
      />
    )
  }

  if (isManager) {
    return (
      <div className="content-scroll">

        {/* WELCOME */}
        <div className="welcome-banner">
          <div className="welcome-content">
            <div className="welcome-title">Hola, {firstName}</div>
            <div className="welcome-sub">
              Aquí tienes el estado del onboarding de tu equipo de <strong>{managerArea}</strong>.
              <br />Martes 17 de junio, 2026
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="kpi-strip">
          {managerKpis.map((k) => (
            <div key={k.title} className={`kpi-card${k.alert ? ' alert' : ''}`}>
              <div className="kpi-title" style={{ color: k.accent }}>{k.title}</div>
              <div className="kpi-val">{k.value}</div>
              <div className="kpi-lbl">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="two-col">
          {/* IZQUIERDA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* EQUIPO EN PROGRESO */}
            <div className="sec-card">
              <div className="sc-hd">
                <h3>Mi equipo en onboarding <span className="sc-hd-count">{managerProgress.length}</span></h3>
              </div>
              <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
                {managerProgress.length > 0 ? managerProgress.map((p) => (
                  <div key={p.name} className="prog-row">
                    <div className="pr-av" style={{ background: p.color }}>{initials(p.name)}</div>
                    <div className="pr-info">
                      <div className="pr-name">{p.name}</div>
                      <div className="pr-route">{p.route}</div>
                    </div>
                    <div className="pr-day">Día {p.day}</div>
                    <div className="pr-progress">
                      <div className="pr-pct">{p.pct}%</div>
                      <div className="pr-bar">
                        <div className="pr-fill" style={{ width: `${p.pct}%`, background: p.progColor }} />
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
                    No hay colaboradores en onboarding actualmente
                  </div>
                )}
              </div>
            </div>

            {/* TAREAS QUE REQUIEREN TU ACCIÓN */}
            <div className="sec-card">
              <div className="sc-hd">
                <h3>Requieren tu acción <span className="sc-hd-count">{managerTareasPendientes.length}</span></h3>
              </div>
              <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
                {managerTareasPendientes.map((t, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0',
                    borderBottom: i < managerTareasPendientes.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `${t.color}12`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <ClipboardList size={14} style={{ color: t.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40' }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{t.tipo}</div>
                    </div>
                    <button style={{
                      fontSize: 10, fontWeight: 600, color: '#3b82f6',
                      background: '#eff6ff', border: '1px solid #dbeafe',
                      borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit',
                    }}>Ver</button>
                  </div>
                ))}
              </div>
            </div>

            {/* GRADUADOS */}
            <div className="sec-card">
              <div className="sc-hd">
                <h3>Graduados de {managerArea} <span className="sc-hd-count">{managerGraduados.length}</span></h3>
              </div>
              <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
                {managerGraduados.map((g, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0',
                    borderBottom: i < managerGraduados.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: g.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{initials(g.name)}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40' }}>{g.name}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{g.cargo}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={12} style={{ color: '#16a34a' }} />
                      <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>{g.fecha}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DERECHA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ALERTAS */}
            <div className="sec-card">
              <div className="sc-hd">
                <h3>Atención requerida <span className="sc-hd-count">{managerAlerts.length}</span></h3>
              </div>
              <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
                {managerAlerts.length > 0 ? managerAlerts.map((a) => (
                  <div key={a.name} className="alert-item">
                    <div className="ai-av" style={{ background: a.color }}>{initials(a.name)}</div>
                    <div className="ai-info">
                      <div className="ai-name">{a.name}</div>
                      <div className="ai-sub">{a.sub}</div>
                    </div>
                    <div className="ai-badge">
                      <span className={`badge ${a.badgeCls}`}>
                        <span className="badge-dot" />
                        {a.badge}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: 20, textAlign: 'center' }}>
                    <CheckCircle2 size={24} style={{ color: '#10DC97', margin: '0 auto 8px' }} />
                    <div style={{ fontSize: 12, color: '#64748b' }}>Sin alertas en tu equipo</div>
                  </div>
                )}
              </div>
            </div>

            {/* ACTIVIDAD RECIENTE */}
            <div className="sec-card">
              <div className="sc-hd">
                <h3>Actividad reciente</h3>
              </div>
              <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
                {managerFeed.map((f, i) => (
                  <div key={i} className="feed-item">
                    <div className="feed-dot" />
                    <div>
                      <div className="feed-text">{f.text}</div>
                      <div className="feed-time">{f.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div style={{ height: '8px' }} />
      </div>
    )
  }

  return (
    <div className="content-scroll">

      {/* ── WELCOME BANNER ──────────────────── */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-title">Bienvenido al panel de Onboarding</div>
          <div className="welcome-sub">
            Tienes <strong>7 onboardings activos</strong> y <strong>2 alertas</strong> que requieren tu atención.
            <br />Martes 17 de junio, 2026
          </div>
        </div>
        <div className="welcome-actions">
          <button className="btn-accent-light" onClick={() => { setFormRuta({ name: '', area: 'Ventas', cargo: '' }); setDropArea(false); setDropCargo(false); setModalCrear(true) }}>
            <Plus size={13} />
            Nueva ruta
          </button>
          <button className="btn-outline-light" onClick={() => { setAsignarStep(1); setSelectedColabs([]); setColabSearch(''); setColabFilterDepto('Todas'); setColabFilterSucursal('Todas'); setColabFilterCargo('Todos'); setColabFechaDesde(''); setColabFechaHasta(''); setShowFilters(false); setOnbSelected(null); setOnbFecha(''); setOnbSearch(''); setOnbArea('Todas'); setOnbCargo('Todos'); setOnbSede('Todas'); setModalAsignar(true) }}>
            <UserPlus size={13} />
            Asignar ruta
          </button>
        </div>
      </div>

      {/* ── KPI STRIP ──────────────────────── */}
      <div className="kpi-strip">
        {kpis.map((k) => (
          <div key={k.title} className={`kpi-card${k.alert ? ' alert' : ''}`}>
            <div className="kpi-title" style={{ color: k.accent }}>{k.title}</div>
            <div className="kpi-val">{k.value}</div>
            <div className="kpi-lbl">{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── TWO COLUMN ─────────────────────── */}
      <div className="two-col">

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* ACCESOS RÁPIDOS */}
          <div className="sec-card">
            <div className="sc-hd">
              <h3>Accesos rápidos</h3>
            </div>
            <div className="sc-body">
              <div className="qa-grid">
                {quickAccess.map((qa) => (
                  <a key={qa.label} href="#" className="qa-card" onClick={e => { e.preventDefault(); navigate(qa.path) }}>
                    <div className="qa-ico" style={{ background: qa.bg }}>
                      <qa.icon size={20} style={{ color: qa.color }} />
                    </div>
                    <div className="qa-text">
                      <div className="qa-label">{qa.label}</div>
                      <div className="qa-desc">{qa.desc}</div>
                      <div className="qa-sub">{qa.sub}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* EN PROGRESO */}
          <div className="sec-card">
            <div className="sc-hd">
              <h3>Onboardings en progreso <span className="sc-hd-count">23</span></h3>
              <a href="#">Ver todos →</a>
            </div>
            <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
              {progressData.map((p) => (
                <div key={p.name} className="prog-row">
                  <div className="pr-av" style={{ background: p.color }}>{initials(p.name)}</div>
                  <div className="pr-info">
                    <div className="pr-name">{p.name}</div>
                    <div className="pr-route">{p.route}</div>
                  </div>
                  <div className="pr-day">Día {p.day}</div>
                  <div className="pr-progress">
                    <div className="pr-pct">{p.pct}%</div>
                    <div className="pr-bar">
                      <div className="pr-fill" style={{ width: `${p.pct}%`, background: p.progColor }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RUTAS ACTIVAS */}
          <div className="sec-card">
            <div className="sc-hd">
              <h3>Rutas activas <span className="sc-hd-count">12</span></h3>
              <a href="#">Ver todas →</a>
            </div>
            <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
              {rutasActivas.slice(0, 5).map((r) => (
                <div key={r.name} className="ruta-row">
                  <div className="ruta-dot" style={{ background: r.color }} />
                  <div className="ruta-name">{r.name}</div>
                  <div className="ruta-count">{r.count} personas</div>
                </div>
              ))}
              {rutasActivas.length > 5 && (
                <div className="ruta-more">+{rutasActivas.length - 5} rutas más</div>
              )}
            </div>
          </div>

          {/* PRÓXIMO HITO */}
          <div className="hito-card">
            <div className="hito-ico">
              <Star size={20} color="#fff" />
            </div>
            <div className="hito-text">
              <strong>3 colaboradores</strong> celebran su primer mes esta semana. Programa un mensaje de reconocimiento.
            </div>
            <button className="hito-btn">
              <CalendarHeart size={14} />
              Programar reconocimiento
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* ALERTAS */}
          <div className="sec-card">
            <div className="sc-hd">
              <h3>Necesitan atención <span className="sc-hd-count">17</span></h3>
              <a href="#">Ver todos →</a>
            </div>
            <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
              {alertsData.map((a) => (
                <div key={a.name} className="alert-item">
                  <div className="ai-av" style={{ background: a.color }}>{initials(a.name)}</div>
                  <div className="ai-info">
                    <div className="ai-name">{a.name}</div>
                    <div className="ai-sub">{a.sub}</div>
                  </div>
                  <div className="ai-badge">
                    <span className={`badge ${a.badgeCls}`}>
                      <span className="badge-dot" />
                      {a.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRÓXIMOS INGRESOS */}
          <div className="sec-card">
            <div className="sc-hd">
              <h3>Próximos ingresos <span className="sc-hd-count">14</span></h3>
              <a href="#">Ver todos →</a>
            </div>
            <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
              {upcomingData.map((u) => (
                <div key={u.name} className="upcoming-item">
                  <div className="ui-date">
                    <div className="ui-day">{u.day}</div>
                    <div className="ui-month">{u.month}</div>
                  </div>
                  <div className="ui-info">
                    <div className="ui-name">{u.name}</div>
                    <div className="ui-sub">{u.sub}</div>
                  </div>
                  <div className="ui-av" style={{ background: u.color }}>{initials(u.name)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVIDAD RECIENTE */}
          <div className="sec-card">
            <div className="sc-hd">
              <h3>Actividad reciente <span className="sc-hd-count">38</span></h3>
            </div>
            <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
              {feedData.map((f, i) => (
                <div key={i} className="feed-item">
                  <div className="feed-dot" />
                  <div>
                    <div className="feed-text">{f.text}</div>
                    <div className="feed-time">{f.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div style={{ height: '8px' }} />

      {/* MODAL CREAR RUTA */}
      {modalCrear && (
        <div className="pl-overlay" onClick={() => setModalCrear(false)}>
          <div className="pl-modal" onClick={e => e.stopPropagation()}>
            <div className="pl-modal-header">
              <h2>Nueva ruta</h2>
              <button className="pl-modal-close" onClick={() => setModalCrear(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="pl-modal-body">
              <label className="pl-label">
                Nombre de la ruta
                <input
                  type="text"
                  className="pl-input"
                  placeholder="Ej: Onboarding Ventas — Pasante"
                  value={formRuta.name}
                  onChange={e => setFormRuta({ ...formRuta, name: e.target.value })}
                  autoFocus
                />
              </label>
              <div className="pl-label">
                Área
                <div className="pl-dropdown-wrap">
                  <button type="button" className={`pl-dropdown-trigger${dropArea ? ' open' : ''}`} onClick={() => { setDropArea(!dropArea); setDropCargo(false) }}>
                    <span>{formRuta.area}</span>
                    <ChevronDown size={14} className="pl-dropdown-chevron" />
                  </button>
                  {dropArea && (
                    <div className="pl-dropdown-menu">
                      {areas.map(a => (
                        <button key={a} type="button" className={`pl-dropdown-item${formRuta.area === a ? ' selected' : ''}`} onClick={() => { setFormRuta({ ...formRuta, area: a, cargo: '' }); setDropArea(false) }}>
                          <span>{a}</span>
                          {formRuta.area === a && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="pl-label">
                Cargo
                <div className="pl-dropdown-wrap">
                  <button type="button" className={`pl-dropdown-trigger${dropCargo ? ' open' : ''}${!formRuta.cargo ? ' placeholder' : ''}`} onClick={() => { setDropCargo(!dropCargo); setDropArea(false) }}>
                    <span>{formRuta.cargo || 'Seleccionar cargo'}</span>
                    <ChevronDown size={14} className="pl-dropdown-chevron" />
                  </button>
                  {dropCargo && (
                    <div className="pl-dropdown-menu">
                      {(cargosPorArea[formRuta.area] || []).map(c => (
                        <button key={c} type="button" className={`pl-dropdown-item${formRuta.cargo === c ? ' selected' : ''}`} onClick={() => { setFormRuta({ ...formRuta, cargo: c }); setDropCargo(false) }}>
                          <span>{c}</span>
                          {formRuta.cargo === c && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="pl-modal-footer">
              <button className="pl-btn-cancel" onClick={() => setModalCrear(false)}>Cancelar</button>
              <button className="pl-btn-save" disabled={!formRuta.name.trim()} onClick={handleCrearRuta}>
                Crear y diseñar ruta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ASIGNAR RUTA */}
      {modalAsignar && (() => {
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

        return (
        <div className="pl-overlay" onClick={() => setModalAsignar(false)}>
          <div className="pl-modal jb-modal" style={{ width: 980, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>

            {/* HEADER */}
            <div className="pl-modal-header" style={{ borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 15 }}>Asignar ruta de onboarding</h2>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Selecciona colaboradores, elige la ruta y fecha de inicio</span>
                </div>
              </div>
              <button className="pl-modal-close" onClick={() => setModalAsignar(false)}>
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
                          width: 15, height: 15, borderRadius: 4, border: sel ? '2px solid #10DC97' : '1.5px solid #d1d5db',
                          background: sel ? '#10DC97' : '#fff',
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
                        {/* SEDE */}
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
                        {/* ÁREA */}
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
                        {/* CARGO */}
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
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: onbSelected === r.id ? 600 : 500, color: onbSelected === r.id ? '#0C2D40' : '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                        <div style={{ fontSize: 9, color: '#b0b8c4' }}>{r.area} · {r.etapas} etapas</div>
                      </div>
                      {onbSelected === r.id && <Check size={12} style={{ color: r.color, flexShrink: 0 }} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* COL 3: FECHA */}
              <div style={{ width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 18px' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0C2D40' }}><span style={{ color: '#94a3b8', fontWeight: 600 }}>3.</span> Fecha de inicio</span>
                <MiniCalendar value={onbFecha} onChange={setOnbFecha} />
              </div>
            </div>

            {/* MODAL DE FILTROS */}
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
              <button className="pl-btn-cancel" onClick={() => setModalAsignar(false)}>Cancelar</button>
              <button className="pl-btn-save" disabled={selectedColabs.length === 0 || !onbSelected || !onbFecha}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...(selectedColabs.length === 0 || !onbSelected || !onbFecha ? { opacity: 0.5, cursor: 'default' } : {}) }}
                onClick={() => { setModalAsignar(false); navigate('/onboarding/asignaciones') }}>
                <Rocket size={13} />
                Asignar a {selectedColabs.length || '...'} colaborador{selectedColabs.length !== 1 ? 'es' : ''}
              </button>
            </div>
          </div>
        </div>
        )
      })()}
    </div>
  )
}
