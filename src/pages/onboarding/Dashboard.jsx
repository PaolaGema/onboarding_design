import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import JourneyBuilder from './JourneyBuilder'
import AsignarRutaModal from '../../components/onboarding/AsignarRutaModal'
import {
  Loader, AlertTriangle, CheckCircle2, LayoutTemplate,
  TrendingUp, Zap, UserPlus, PencilRuler, Settings2,
  CalendarPlus, Activity, Rocket, Sparkles, Download,
  Smartphone, Plus, ClipboardList, Clock, CircleAlert,
  Search, Route, Users, Star, CalendarHeart,
  X, ChevronDown, Check,
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

/* ── DATA ────────────────────────────────────── */

const quickAccess = [
  { icon: LayoutTemplate, color: 'var(--purple)', bg: 'var(--purple-bg)', label: 'Rutas', desc: 'Crear y editar rutas', sub: '7 activas', path: '/onboarding/plantillas' },
  { icon: UserPlus, color: 'var(--blue)', bg: 'var(--blue-bg)', label: 'Asignación', desc: 'Asignar rutas a colaboradores', sub: '2 pendientes', path: '/onboarding/asignaciones' },
  { icon: PencilRuler, color: 'var(--navy)', bg: '#e0e7ef', label: 'Biblioteca de recursos', desc: 'Documentos y materiales', sub: 'Contenido', path: '/onboarding/conocimiento' },
  { icon: Settings2, color: 'var(--green)', bg: 'var(--green-bg)', label: 'Configuración', desc: 'Puntos, notificaciones y permisos', sub: 'Ajustes globales', path: '/onboarding/configuracion' },
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
  const [activeJourney, setActiveJourney] = useState(null)
  const { isDemoFresh, loadSampleData, asignaciones: ctxAsignaciones, plantillas, recursos, configToggles, tronco } = useOnboardingData()
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('onb_demo_welcome_seen'))
  const [showCelebration, setShowCelebration] = useState(false)

  const step1Done = Object.values(configToggles).some(v => v === true) || tronco?.configured === true
  const step2Done = recursos.some(c => c.docs.length > 0)
  const step3Done = plantillas.length > 0
  const step4Done = ctxAsignaciones.length > 0
  const allStepsDone = step1Done && step2Done && step3Done && step4Done

  useEffect(() => {
    if (allStepsDone && !localStorage.getItem('onb_celebration_seen')) {
      localStorage.setItem('onb_celebration_seen', '1')
      setShowCelebration(true)
    }
  }, [allStepsDone])

  const confettiPieces = useMemo(() => {
    const colors = ['#0C2D40', '#f8b400', '#93c5fd', '#e2e8f0', '#fcd34d']
    return Array.from({ length: 65 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[i % colors.length],
      size: 5 + Math.random() * 7,
      duration: 2.8 + Math.random() * 2,
      delay: Math.random() * 1.8,
      rotate: Math.random() * 360,
      isCircle: Math.random() > 0.5,
    }))
  }, [])
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
                    <div className="pr-av"><img src={`https://i.pravatar.cc/40?u=${encodeURIComponent(p.name)}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none' }} /></div>
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
                    <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#0C2D40', border: '1.5px solid #e2e8f0' }}>
                      <img src={`https://i.pravatar.cc/40?u=${encodeURIComponent(g.name)}`} alt={g.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none' }} />
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
                    <div className="ai-av"><img src={`https://i.pravatar.cc/40?u=${encodeURIComponent(a.name)}`} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none' }} /></div>
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
            {isDemoFresh
              ? 'Configura el módulo y empieza a gestionar onboardings.'
              : (() => {
                  const activos = ctxAsignaciones.filter(a => a.status === 'en-curso').length
                  const alertas = ctxAsignaciones.filter(a => a.status === 'en-riesgo' || a.status === 'atrasado').length
                  return activos > 0
                    ? <>Tienes <strong>{activos} onboarding{activos !== 1 ? 's' : ''} activo{activos !== 1 ? 's' : ''}</strong>{alertas > 0 && <> y <strong>{alertas} alerta{alertas !== 1 ? 's' : ''}</strong> que requieren tu atención</>}.</>
                    : 'No hay onboardings activos en este momento.'
                })()
            }
          </div>
        </div>
        <div className="welcome-actions">
          <button className="btn-accent-light" onClick={() => { setFormRuta({ name: '', area: 'Ventas', cargo: '' }); setDropArea(false); setDropCargo(false); setModalCrear(true) }}>
            <Plus size={13} />
            Nueva ruta
          </button>
          <button className="btn-outline-light" onClick={() => setModalAsignar(true)}>
            <UserPlus size={13} />
            Asignar ruta
          </button>
        </div>
      </div>

      {/* ── BANNER PRIMEROS PASOS ──────────────────────── */}
      {(() => {
        const steps = [
          { label: 'Configurar módulo', sub: 'Funcionalidades y permisos', done: step1Done, path: '/onboarding/configuracion' },
          { label: 'Subir recursos', sub: 'Documentos y materiales', done: step2Done, path: '/onboarding/conocimiento' },
          { label: 'Crear una ruta', sub: 'Diseña el recorrido', done: step3Done, path: '/onboarding/plantillas' },
          { label: 'Asignar la ruta', sub: 'Activa un onboarding', done: step4Done, path: '/onboarding/asignaciones' },
        ]
        if (allStepsDone) return null
        const doneCount = [step1Done, step2Done, step3Done, step4Done].filter(Boolean).length
        const nextStep = steps.find(s => !s.done)
        const firstName = currentUser?.name?.split(' ')[0] || 'Admin'
        return (
          <div style={{ background: '#fff', border: '1px solid #dde6ee', borderTop: '3px solid #0C2D40', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(12,45,64,.07)' }}>
            {/* cabecera */}
            <div style={{ padding: '14px 22px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40' }}>
                  {doneCount === 0
                    ? `¡Hola, ${firstName}! Configura tu módulo para empezar`
                    : doneCount < 3
                    ? `¡Vas bien, ${firstName}! Te faltan ${4 - doneCount} pasos más`
                    : `¡Casi lista, ${firstName}! Un paso más y todo está listo`}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Completa los pasos para activar tu módulo de onboarding</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{ width: 100, height: 4, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(doneCount / 4) * 100}%`, background: '#10b981', borderRadius: 4, transition: 'width .5s ease' }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0C2D40' }}>{doneCount}/4</span>
              </div>
            </div>
            {/* pasos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {steps.map((s, i) => {
                const isNext = s === nextStep
                return (
                  <button key={s.label} onClick={() => navigate(s.path)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 5,
                    padding: '15px 18px', border: 'none',
                    borderRight: i < 3 ? '1px solid #f1f5f9' : 'none',
                    background: s.done ? '#f6fdf8' : isNext ? '#eef4f9' : '#fff',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    transition: 'background .15s', position: 'relative',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = s.done ? '#edfaf3' : '#e8f0f7' }}
                    onMouseLeave={e => { e.currentTarget.style.background = s.done ? '#f6fdf8' : isNext ? '#eef4f9' : '#fff' }}
                  >
                    {isNext && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#0C2D40' }} />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800,
                        background: s.done ? '#16a34a' : isNext ? '#0C2D40' : '#e2e8f0',
                        color: s.done ? '#fff' : isNext ? '#fff' : '#94a3b8',
                      }}>
                        {s.done ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: s.done ? '#16a34a' : isNext ? '#0C2D40' : '#94a3b8' }}>
                        {s.label}
                      </span>
                    </div>
                    <div style={{ paddingLeft: 30, fontSize: 10, color: s.done ? '#86efac' : '#94a3b8', lineHeight: 1.4 }}>{s.sub}</div>
                    {isNext && (
                      <div style={{ paddingLeft: 30, marginTop: 2 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: '#0C2D40', padding: '2px 8px', borderRadius: 20 }}>Ir ahora →</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })()}

      {ctxAsignaciones.length > 0 && (<>

      {/* ── KPI STRIP ──────────────────────── */}
      {(() => {
        const enCurso = ctxAsignaciones.filter(a => a.status === 'en-curso').length
        const completados = ctxAsignaciones.filter(a => a.status === 'completado').length
        const atrasados = ctxAsignaciones.filter(a => a.status === 'atrasado').length
        const enRiesgo = ctxAsignaciones.filter(a => a.status === 'en-riesgo').length
        const dynKpis = [
          { title: 'Activos', value: String(enCurso), label: 'Onboardings en curso', accent: 'var(--blue)', alert: false },
          { title: 'Completados', value: String(completados), label: 'Graduaciones totales', accent: 'var(--green)', alert: false },
          { title: 'Atrasados', value: String(atrasados), label: 'Con tareas vencidas', accent: 'var(--yellow)', alert: false },
          { title: 'En riesgo', value: String(enRiesgo), label: '+3 días sin actividad', accent: 'var(--red)', alert: enRiesgo > 0 },
          { title: 'Tiempo promedio', value: ctxAsignaciones.length > 0 ? '30d' : '—', label: 'Para completar onboarding', accent: 'var(--purple)', alert: false },
        ]
        return (
          <div className="kpi-strip">
            {dynKpis.map((k) => (
              <div key={k.title} className={`kpi-card${k.alert ? ' alert' : ''}`}>
                <div className="kpi-title" style={{ color: k.accent }}>{k.title}</div>
                <div className="kpi-val">{k.value}</div>
                <div className="kpi-lbl">{k.label}</div>
              </div>
            ))}
          </div>
        )
      })()}

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
          {(() => {
            const enProgreso = ctxAsignaciones.filter(a => a.status === 'en-curso').sort((a, b) => b.pct - a.pct).slice(0, 5)
            return (
              <div className="sec-card">
                <div className="sc-hd">
                  <h3>Onboardings en progreso <span className="sc-hd-count">{enProgreso.length}</span></h3>
                  <a href="#" onClick={e => { e.preventDefault(); navigate('/onboarding/asignaciones') }}>Ver todos →</a>
                </div>
                <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
                  {enProgreso.length > 0 ? enProgreso.map((a) => (
                    <div key={a.id} className="prog-row">
                      <div className="pr-av"><img src={`https://i.pravatar.cc/40?u=${encodeURIComponent(a.nombre)}`} alt={a.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none' }} /></div>
                      <div className="pr-info">
                        <div className="pr-name">{a.nombre}</div>
                        <div className="pr-route">{a.ruta}</div>
                      </div>
                      <div className="pr-day">Día {a.dia} / {a.totalDias}</div>
                      <div className="pr-progress">
                        <div className="pr-pct">{a.pct}%</div>
                        <div className="pr-bar">
                          <div className="pr-fill" style={{ width: `${a.pct}%`, background: a.pct < 30 ? 'var(--yellow)' : 'var(--blue)' }} />
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
                      No hay onboardings activos aún
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

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
          {(() => {
            const conAlertas = ctxAsignaciones.filter(a => a.status === 'en-riesgo' || a.status === 'atrasado')
            return (
              <div className="sec-card">
                <div className="sc-hd">
                  <h3>Necesitan atención <span className="sc-hd-count">{conAlertas.length}</span></h3>
                  <a href="#" onClick={e => { e.preventDefault(); navigate('/onboarding/asignaciones') }}>Ver todos →</a>
                </div>
                <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
                  {conAlertas.length > 0 ? conAlertas.map((a) => (
                    <div key={a.id} className="alert-item">
                      <div className="ai-av"><img src={`https://i.pravatar.cc/40?u=${encodeURIComponent(a.nombre)}`} alt={a.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none' }} /></div>
                      <div className="ai-info">
                        <div className="ai-name">{a.nombre}</div>
                        <div className="ai-sub">{a.status === 'en-riesgo' ? 'Sin actividad reciente' : 'Tiene tareas vencidas'} · {a.area}</div>
                      </div>
                      <div className="ai-badge">
                        <span className={`badge ${a.status === 'en-riesgo' ? 'b-riesgo' : 'b-atrasado'}`}>
                          <span className="badge-dot" />
                          {a.status === 'en-riesgo' ? 'En riesgo' : 'Atrasado'}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
                      Sin alertas activas
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

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
                  <div className="ui-av"><img src={`https://i.pravatar.cc/40?u=${encodeURIComponent(u.name)}`} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none' }} /></div>
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

      </>)} {/* fin ctxAsignaciones.length > 0 */}

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
                    <div className="pl-dropdown-menu up">
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
                    <div className="pl-dropdown-menu up">
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
      {modalAsignar && (
        <AsignarRutaModal
          onClose={() => setModalAsignar(false)}
          onConfirm={() => { setModalAsignar(false); navigate('/onboarding/asignaciones') }}
        />
      )}

      {/* MODAL BIENVENIDA — se muestra solo si isDemoFresh y no fue cerrado antes */}
      {showWelcome && isDemoFresh && !isManager && (
        <div className="pl-overlay" style={{ zIndex: 60 }} onClick={() => { localStorage.setItem('onb_demo_welcome_seen', '1'); setShowWelcome(false) }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,.18)', overflow: 'hidden', animation: 'plSlideUp .25s ease-out' }}>

            {/* HEADER */}
            <div style={{ background: 'linear-gradient(135deg, #0C2D40 0%, #164e63 100%)', padding: '36px 32px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                Bienvenida al módulo de Onboarding
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', lineHeight: 1.5 }}>
                Desde aquí podrás gestionar la experiencia de ingreso de todos tus colaboradores.
              </div>
            </div>

            {/* PASOS */}
            <div style={{ padding: '24px 32px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 12 }}>Para comenzar necesitas</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { n: '1', text: 'Configurar el módulo', sub: 'Activa gamificación, asistente IA y define cómo se asignarán las rutas.', path: '/onboarding/configuracion' },
                  { n: '2', text: 'Subir recursos', sub: 'Documentos, videos y materiales que tus colaboradores consultarán.', path: '/onboarding/conocimiento' },
                  { n: '3', text: 'Crear una ruta', sub: 'El camino paso a paso que seguirá cada nuevo ingreso.', path: '/onboarding/plantillas' },
                  { n: '4', text: 'Asignar la ruta', sub: 'Elige un colaborador y activa su onboarding.', path: '/onboarding/asignaciones' },
                ].map(s => (
                  <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#0C2D40', flexShrink: 0 }}>{s.n}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40' }}>{s.text}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.4 }}>{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER */}
            <div style={{ padding: '0 32px 28px', display: 'flex', gap: 10 }}>
              <button
                onClick={() => { localStorage.setItem('onb_demo_welcome_seen', '1'); setShowWelcome(false); navigate('/onboarding/configuracion') }}
                style={{ flex: 1, height: 44, borderRadius: 10, border: 'none', background: '#0C2D40', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Rocket size={15} />
                Empezar configuración
              </button>
              <button
                onClick={() => { localStorage.setItem('onb_demo_welcome_seen', '1'); setShowWelcome(false) }}
                style={{ height: 44, padding: '0 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}
              >
                Explorar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CELEBRACIÓN — confetti + modal al completar los 4 pasos */}
      {showCelebration && (
        <>
          <style>{`
            @keyframes confettiFall {
              0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
              80%  { opacity: 1; }
              100% { transform: translateY(105vh) rotate(600deg); opacity: 0; }
            }
          `}</style>

          {/* confetti */}
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 80, overflow: 'hidden' }}>
            {confettiPieces.map(p => (
              <div key={p.id} style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: -12,
                width: p.isCircle ? p.size : p.size * 0.6,
                height: p.isCircle ? p.size : p.size * 1.4,
                borderRadius: p.isCircle ? '50%' : 2,
                background: p.color,
                animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
                transform: `rotate(${p.rotate}deg)`,
              }} />
            ))}
          </div>

          {/* modal */}
          <div className="pl-overlay" style={{ zIndex: 85 }} onClick={() => setShowCelebration(false)}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: 420, boxShadow: '0 24px 64px rgba(0,0,0,.18)', overflow: 'hidden', animation: 'plSlideUp .3s ease-out' }}>

              {/* header */}
              <div style={{ background: 'linear-gradient(135deg, #0C2D40 0%, #1a4a63 100%)', padding: '36px 32px 28px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                  ¡Lo lograste, {currentUser?.name?.split(' ')[0]}!
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', lineHeight: 1.6 }}>
                  Tu módulo de onboarding está configurado y listo para funcionar.
                </div>
              </div>

              {/* logros */}
              <div style={{ padding: '22px 28px 8px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 12 }}>Lo que configuraste</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Módulo configurado con tus preferencias',
                    'Recursos subidos a la biblioteca',
                    'Ruta de onboarding creada',
                    'Primera asignación realizada',
                  ].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#0C2D40', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>✓</span>
                      </div>
                      <span style={{ fontSize: 12, color: '#334155', fontWeight: 500 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* footer */}
              <div style={{ padding: '20px 28px 28px', display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowCelebration(false)}
                  style={{ flex: 1, height: 44, borderRadius: 10, border: 'none', background: '#0C2D40', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}
                >
                  ¡Vamos al dashboard! 🚀
                </button>
                <button
                  onClick={() => { setShowCelebration(false); navigate('/onboarding/asignaciones') }}
                  style={{ height: 44, padding: '0 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  Ver asignaciones
                </button>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  )
}
