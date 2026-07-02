import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import JourneyBuilder from './JourneyBuilder'
import AsignarRutaModal from '../../components/onboarding/AsignarRutaModal'
import viaSaludando from '../../assets/imagenes/via_saludando.png'
import {
  AlertTriangle, CheckCircle2,
  UserPlus, Settings2,
  Plus, ClipboardList,
  Star, CalendarHeart, Trophy, Medal,
  X, ChevronDown, Check,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

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

const STATUS_COLORS = {
  'en-curso': '#3b82f6',
  'completado': '#00E091',
  'atrasado': '#f59e0b',
  'en-riesgo': '#ef4444',
}
const STATUS_LABELS = {
  'en-curso': 'En curso',
  'completado': 'Completados',
  'atrasado': 'Atrasados',
  'en-riesgo': 'En riesgo',
}
const AREA_COLORS = ['#3b82f6', '#00E091', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#0d9488']
const MEDAL_COLORS = ['#f59e0b', '#94a3b8', '#c2703d']

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
  const [modalCrear, setModalCrear] = useState(false)
  const [modalAsignar, setModalAsignar] = useState(false)
  const [formRuta, setFormRuta] = useState({ name: '', area: 'Ventas', cargo: '', esGlobal: false })
  const [dropArea, setDropArea] = useState(false)
  const [dropCargo, setDropCargo] = useState(false)
  const [activeJourney, setActiveJourney] = useState(null)
  const { isDemoFresh, loadSampleData, asignaciones: ctxAsignaciones, plantillas, setPlantillas, addFeedEntry, recursos } = useOnboardingData()
  const [showCelebration, setShowCelebration] = useState(false)

  const step2Done = recursos.some(c => c.docs.length > 0)
  const step3Done = plantillas.length > 0
  const step4Done = ctxAsignaciones.length > 0
  const allStepsDone = step2Done && step3Done && step4Done

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

  const firstName = currentUser.name.split(' ')[0]

  const colores = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#f97316', '#ec4899', '#0d9488', '#d946ef', '#ef4444']

  function handleCrearRuta() {
    if (!formRuta.name.trim()) return
    const newId = Date.now()
    const color = colores[newId % colores.length]
    const nextOrdenGlobal = () => {
      const globales = plantillas.filter(p => p.esGlobal)
      return globales.length ? Math.max(...globales.map(p => p.ordenGlobal ?? 0)) + 1 : 0
    }
    const newPlantilla = {
      id: newId,
      name: formRuta.name.trim(),
      area: formRuta.area,
      cargo: formRuta.cargo || '',
      etapas: 0,
      tareas: 0,
      asignados: 0,
      status: 'borrador',
      updated: 'Ahora',
      color,
      esGlobal: formRuta.esGlobal,
      ordenGlobal: formRuta.esGlobal ? nextOrdenGlobal() : null,
    }
    setPlantillas([...plantillas, newPlantilla])
    addFeedEntry(`Nueva ruta "${newPlantilla.name}" creada`)
    setModalCrear(false)
    setActiveJourney({ ...newPlantilla, isNew: true })
  }

  if (activeJourney) {
    return (
      <JourneyBuilder
        plantilla={activeJourney}
        onBack={() => setActiveJourney(null)}
        empty={activeJourney.isNew}
        backLabel="Dashboard"
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
            <div key={k.title} className={`kpi-card${k.alert ? ' alert' : ''}`} style={{ '--kpi-accent': k.accent }}>
              <div className="kpi-title" style={{ color: k.accent }}>{k.title}</div>
              <div className="kpi-val">{k.value}</div>
              <div className="kpi-lbl">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="two-col">
          {/* IZQUIERDA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

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
                    <CheckCircle2 size={24} style={{ color: '#00E091', margin: '0 auto 8px' }} />
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
        <div className="welcome-left">
        <img src={viaSaludando} alt="" className="welcome-mascot" />
        <div className="welcome-content">
          <div className="welcome-title">Bienvenido a tu Dashboard</div>
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
        </div>
        <div className="welcome-actions">
          <button className="btn-accent-light" onClick={() => { setFormRuta({ name: '', area: 'Ventas', cargo: '', esGlobal: false }); setDropArea(false); setDropCargo(false); setModalCrear(true) }}>
            <Plus size={13} color="#00E091" />
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
          { label: 'Subir recursos', sub: 'Documentos y materiales', done: step2Done, path: '/onboarding/conocimiento' },
          { label: 'Crear una ruta', sub: 'Diseña el recorrido', done: step3Done, path: '/onboarding/plantillas' },
          { label: 'Asignar la ruta', sub: 'Activa un onboarding', done: step4Done, path: '/onboarding/asignaciones' },
        ]
        if (allStepsDone) return null
        const doneCount = [step2Done, step3Done, step4Done].filter(Boolean).length
        const nextStep = steps.find(s => !s.done)
        const firstName = currentUser?.name?.split(' ')[0] || 'Admin'
        return (
          <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 16px rgba(12,45,64,.12)' }}>
            {/* header navy */}
            <div style={{ background: 'linear-gradient(135deg, #0C2D40 0%, #1a4a63 100%)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
                  {doneCount === 0
                    ? `¡Hola, ${firstName}! Preparemos el onboarding de tu equipo`
                    : doneCount < 2
                    ? `¡Vas bien, ${firstName}! Te faltan ${3 - doneCount} pasos más`
                    : `¡Casi listo, ${firstName}! Un paso más y todo está listo`}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>Completa estos pasos para empezar a recibir nuevos colaboradores</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <div style={{ width: 110, height: 5, borderRadius: 10, background: 'rgba(255,255,255,.15)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(doneCount / 3) * 100}%`, background: '#00E091', borderRadius: 10, transition: 'width .5s ease' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.8)' }}>{doneCount}/3</span>
              </div>
            </div>
            {/* pasos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: '#fff' }}>
              {steps.map((s, i) => {
                const isNext = s === nextStep
                return (
                  <button key={s.label} onClick={() => navigate(s.path)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 5,
                    padding: '14px 18px', border: 'none',
                    borderRight: i < 2 ? '1px solid #f1f5f9' : 'none',
                    background: s.done ? '#f6fdf8' : isNext ? '#f8faff' : '#fff',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    transition: 'background .15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = s.done ? '#ecfdf5' : '#f0f5ff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = s.done ? '#f6fdf8' : isNext ? '#f8faff' : '#fff' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800,
                        background: s.done ? '#00E091' : isNext ? '#0C2D40' : '#e2e8f0',
                        color: '#fff',
                      }}>
                        {s.done ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: s.done ? '#00E091' : isNext ? '#0C2D40' : '#94a3b8' }}>
                        {s.label}
                      </span>
                    </div>
                    <div style={{ paddingLeft: 30, fontSize: 10, color: '#94a3b8', lineHeight: 1.4 }}>{s.sub}</div>
                    {isNext && (
                      <div style={{ paddingLeft: 30, marginTop: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: '#0C2D40', padding: '2px 9px', borderRadius: 20 }}>Ir ahora →</span>
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
              <div key={k.title} className={`kpi-card${k.alert ? ' alert' : ''}`} style={{ '--kpi-accent': k.accent }}>
                <div className="kpi-title" style={{ color: k.accent }}>{k.title}</div>
                <div className="kpi-val">{k.value}</div>
                <div className="kpi-lbl">{k.label}</div>
              </div>
            ))}
          </div>
        )
      })()}

      {/* ── ANALYTICS: DONUT + BARRAS ────────── */}
      {(() => {
        const statusData = ['en-curso', 'completado', 'atrasado', 'en-riesgo']
          .map(status => ({
            status,
            label: STATUS_LABELS[status],
            value: ctxAsignaciones.filter(a => a.status === status).length,
            color: STATUS_COLORS[status],
          }))
          .filter(d => d.value > 0)
        const totalAsig = ctxAsignaciones.length

        const areaCounts = {}
        ctxAsignaciones.forEach(a => { areaCounts[a.area] = (areaCounts[a.area] || 0) + 1 })
        const areaData = Object.entries(areaCounts)
          .map(([area, count]) => ({ area, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)

        if (totalAsig === 0) return null

        return (
          <div className="analytics-row">
            <div className="sec-card">
              <div className="sc-hd"><h3>Distribución por estado</h3></div>
              <div className="sc-body" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div className="donut-wrap" style={{ width: 150, height: 150, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="label" innerRadius={48} outerRadius={72} paddingAngle={3} strokeWidth={0}>
                        {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="donut-center">
                    <div className="donut-center-val">{totalAsig}</div>
                    <div className="donut-center-lbl">total</div>
                  </div>
                </div>
                <div className="donut-legend" style={{ flex: 1 }}>
                  {statusData.map(d => (
                    <div key={d.status} className="donut-legend-item">
                      <span className="donut-legend-dot" style={{ background: d.color }} />
                      <span className="donut-legend-label">{d.label}</span>
                      <span className="donut-legend-val">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sec-card">
              <div className="sc-hd"><h3>Onboardings por área</h3></div>
              <div className="sc-body">
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={areaData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="area" width={90} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'var(--input-bg)' }} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
                      {areaData.map((d, i) => <Cell key={i} fill={AREA_COLORS[i % AREA_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── TOP RUTAS / COLABORADORES / ÁREAS ── */}
      {(() => {
        if (ctxAsignaciones.length === 0) return null

        const rutaCounts = {}
        ctxAsignaciones.forEach(a => { rutaCounts[a.ruta] = (rutaCounts[a.ruta] || 0) + 1 })
        const topRutas = Object.entries(rutaCounts)
          .map(([ruta, count]) => ({ ruta, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        const topColaboradores = ctxAsignaciones
          .filter(a => a.status === 'en-curso')
          .sort((a, b) => b.pct - a.pct)
          .slice(0, 5)

        const areaStats = {}
        ctxAsignaciones.forEach(a => {
          if (!areaStats[a.area]) areaStats[a.area] = { total: 0, completados: 0 }
          areaStats[a.area].total++
          if (a.status === 'completado') areaStats[a.area].completados++
        })
        const topAreas = Object.entries(areaStats)
          .map(([area, s]) => ({ area, pct: Math.round((s.completados / s.total) * 100), total: s.total }))
          .sort((a, b) => b.pct - a.pct)
          .slice(0, 5)

        return (
          <div className="top-row">
            <div className="sec-card">
              <div className="sc-hd"><h3><Trophy size={14} style={{ color: '#f59e0b', marginRight: 4, verticalAlign: -2 }} />Top rutas más usadas</h3></div>
              <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
                {topRutas.length > 0 ? topRutas.map((r, i) => (
                  <div key={r.ruta} className="ruta-row">
                    <div className="rank-badge" style={{ background: MEDAL_COLORS[i] || 'var(--border-dark)' }}>{i + 1}</div>
                    <div className="ruta-name">{r.ruta}</div>
                    <div className="ruta-count">{r.count} {r.count === 1 ? 'persona' : 'personas'}</div>
                  </div>
                )) : (
                  <div style={{ padding: '12px 0', textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>Sin datos aún</div>
                )}
              </div>
            </div>

            <div className="sec-card">
              <div className="sc-hd"><h3><Medal size={14} style={{ color: '#f59e0b', marginRight: 4, verticalAlign: -2 }} />Top colaboradores por avance</h3></div>
              <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
                {topColaboradores.length > 0 ? topColaboradores.map((a, i) => (
                  <div key={a.id} className="ruta-row">
                    <div className="rank-badge" style={{ background: MEDAL_COLORS[i] || 'var(--border-dark)' }}>{i + 1}</div>
                    <div className="ruta-name">{a.nombre}</div>
                    <div className="ruta-count">{a.pct}%</div>
                  </div>
                )) : (
                  <div style={{ padding: '12px 0', textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>Sin datos aún</div>
                )}
              </div>
            </div>

            <div className="sec-card">
              <div className="sc-hd"><h3><Trophy size={14} style={{ color: '#f59e0b', marginRight: 4, verticalAlign: -2 }} />Top áreas con mejor completitud</h3></div>
              <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
                {topAreas.length > 0 ? topAreas.map((a, i) => (
                  <div key={a.area} className="ruta-row">
                    <div className="rank-badge" style={{ background: MEDAL_COLORS[i] || 'var(--border-dark)' }}>{i + 1}</div>
                    <div className="ruta-name">{a.area}</div>
                    <div className="ruta-count">{a.pct}%</div>
                  </div>
                )) : (
                  <div style={{ padding: '12px 0', textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>Sin datos aún</div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── TWO COLUMN ─────────────────────── */}
      <div className="two-col">

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

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

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 4, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formRuta.esGlobal}
                  onChange={e => setFormRuta({ ...formRuta, esGlobal: e.target.checked })}
                  style={{ marginTop: 2, width: 15, height: 15, accentColor: '#0C2D40', cursor: 'pointer' }}
                />
                <span>
                  <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0C2D40' }}>Aplicar a todas las rutas</span>
                  <span style={{ display: 'block', fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1 }}>Sus etapas se insertarán, protegidas, al inicio de todas las demás rutas.</span>
                </span>
              </label>
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
