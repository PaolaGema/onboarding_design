import { useState } from 'react'
import {
  Loader, AlertTriangle, CheckCircle2, LayoutTemplate,
  TrendingUp, Zap, UserPlus, PencilRuler, Settings2,
  CalendarPlus, Activity, Rocket, Sparkles, Download,
  Smartphone, Plus, ClipboardList, Clock, CircleAlert,
  Search, Route, Users, Star, CalendarHeart
} from 'lucide-react'

/* ── DATA ────────────────────────────────────── */

const kpis = [
  { title: 'Activos', value: '23', label: 'Onboardings en curso', accent: 'var(--blue)', alert: false },
  { title: 'Completados', value: '142', label: 'Graduaciones totales', accent: 'var(--green)', alert: false },
  { title: 'Atrasados', value: '5', label: 'Con tareas vencidas', accent: 'var(--yellow)', alert: false },
  { title: 'En riesgo', value: '3', label: '+3 días sin actividad', accent: 'var(--red)', alert: true },
  { title: 'Tiempo promedio', value: '30d', label: 'Para completar onboarding', accent: 'var(--purple)', alert: false },
]

const quickAccess = [
  { icon: LayoutTemplate, color: 'var(--purple)', bg: 'var(--purple-bg)', label: 'Rutas', desc: 'Crear y editar rutas', sub: '7 activas' },
  { icon: UserPlus, color: 'var(--blue)', bg: 'var(--blue-bg)', label: 'Asignación', desc: 'Asignar rutas a colaboradores', sub: '2 pendientes' },
  { icon: PencilRuler, color: 'var(--navy)', bg: '#e0e7ef', label: 'Journey Builder', desc: 'Diseñar rutas paso a paso', sub: 'Editor visual' },
  { icon: Settings2, color: 'var(--green)', bg: 'var(--green-bg)', label: 'Configuración', desc: 'XP, notificaciones y permisos', sub: 'Ajustes globales' },
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

function initials(name) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('')
}

/* ── COMPONENT ───────────────────────────────── */

export default function Dashboard() {
  const [searchColab, setSearchColab] = useState('')

  const filteredColab = colaboradores.filter(c =>
    c.name.toLowerCase().includes(searchColab.toLowerCase()) ||
    c.route.toLowerCase().includes(searchColab.toLowerCase())
  )

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
          <button className="btn-accent-light">
            <Plus size={13} />
            Nueva ruta
          </button>
          <button className="btn-outline-light">
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
                  <a key={qa.label} href="#" className="qa-card">
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
    </div>
  )
}
