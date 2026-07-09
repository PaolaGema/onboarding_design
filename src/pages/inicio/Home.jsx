import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import viaSaludando from '../../assets/imagenes/via_saludando.png'
import {
  Target, Award, ClipboardList, Megaphone, CalendarDays, ChevronLeft, ChevronRight, Mail,
  Heart, Eye, Trophy, UserRound, CheckCircle2,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { chartTooltipStyle } from '../../utils/chartTooltip'
import {
  HOY, MESES, DIAS_SEMANA, parseFechaDMY, buildCalendarCells, buildEventosDelMes, CALENDAR_LEGEND, avatarUrl,
} from '../../utils/calendarEvents'
import {
  AREAS, colaboradores, invitaciones, publicaciones, totalPublicaciones,
  reconocimientos, evalTotales, procesosPorTipo, procesosEvaluacion, pdi, climaLaboralEnps,
  rotacionMensual,
} from './homeData'

const DIA_DETALLE_MAX = 5

/* ── CONSTANTES DE PRESENTACIÓN ──────────────── */

const ESTADO_COLABORADOR_COLORS = {
  activo: '#00E091',
  licencia: '#8b5cf6',
  suspendido: '#ef4444',
  inactivo: '#94a3b8',
}
const ESTADO_COLABORADOR_LABELS = {
  activo: 'Activos',
  licencia: 'En licencia',
  suspendido: 'Suspendidos',
  inactivo: 'Inactivos',
}
const TIPO_PROCESO_COLORS = ['#0C2D40', '#0D6B4E', '#0D9463', '#00C27E']

const ESTADO_PROCESO_TABS = [
  { key: 'todos', label: 'Todos' },
  { key: 'en-curso', label: 'En curso' },
  { key: 'finalizado', label: 'Finalizados' },
  { key: 'programado', label: 'Programados' },
  { key: 'borrador', label: 'Borrador' },
]
const SALUD_INFO = {
  'en-alerta': { color: 'var(--red)', label: 'En alerta' },
  'buen-avance': { color: 'var(--green)', label: 'Buen avance' },
  'completado': { color: 'var(--blue)', label: 'Completado' },
  'programado': { color: 'var(--purple)', label: 'Programado' },
}

/* ── COMPONENT ───────────────────────────────── */

export default function Home() {
  const { currentUser } = useUser()
  const navigate = useNavigate()
  const { asignaciones: ctxAsignaciones } = useOnboardingData()
  const [areaFiltro, setAreaFiltro] = useState('todas')
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const [selectedDay, setSelectedDay] = useState(null)

  const firstName = currentUser.name.split(' ')[0]
  const onboardingsEnCurso = ctxAsignaciones.filter(a => a.status === 'en-curso').length

  const colaboradoresFiltrados = areaFiltro === 'todas' ? colaboradores : colaboradores.filter(c => c.area === areaFiltro)
  const activosCount = colaboradores.filter(c => c.estado === 'activo').length

  const estadoData = ['activo', 'licencia', 'suspendido', 'inactivo']
    .map(estado => ({
      estado,
      label: ESTADO_COLABORADOR_LABELS[estado],
      value: colaboradoresFiltrados.filter(c => c.estado === estado).length,
      color: ESTADO_COLABORADOR_COLORS[estado],
    }))
    .filter(d => d.value > 0)
  const totalColabFiltrados = colaboradoresFiltrados.length
  const atencionColaboradores = colaboradoresFiltrados.filter(c => c.estado !== 'activo')

  const totalProcesos = Object.values(evalTotales).reduce((s, v) => s + v, 0)
  const procesosFiltrados = estadoFiltro === 'todos' ? procesosEvaluacion : procesosEvaluacion.filter(p => p.estado === estadoFiltro)

  const hoy = HOY
  const activeDay = selectedDay ?? hoy.getDate()

  const cumpleañosEsteMes = colaboradores.filter(c => parseFechaDMY(c.fechaNacimiento).m === hoy.getMonth() + 1).length

  const calendarCells = buildCalendarCells(hoy.getFullYear(), hoy.getMonth())
  const eventosPorDia = buildEventosDelMes(hoy.getFullYear(), hoy.getMonth())
  const eventosDelDia = eventosPorDia[activeDay] || []

  const kpis = [
    { title: 'Colaboradores activos', value: String(activosCount), label: `De ${colaboradores.length} en la organización`, accent: 'var(--blue)' },
    { title: 'Onboardings en curso', value: String(onboardingsEnCurso), label: 'Nuevos ingresos activos', accent: 'var(--green)' },
    { title: 'Procesos en curso', value: String(evalTotales['en-curso']), label: 'Evaluaciones y encuestas activas', accent: 'var(--yellow)' },
    { title: 'Invitaciones pendientes', value: String(invitaciones.pendientes), label: 'Esperando respuesta', accent: 'var(--purple)' },
    { title: 'Reconocimientos', value: String(reconocimientos.length), label: 'Publicados recientemente', accent: '#ec4899' },
    { title: 'Clima laboral (eNPS)', value: String(climaLaboralEnps), label: 'Última medición', accent: 'var(--green)' },
  ]

  const kpisSecundarios = [
    { title: 'Rotación de personal', value: `${rotacionMensual.pct}%`, label: `${rotacionMensual.salidas} baja${rotacionMensual.salidas !== 1 ? 's' : ''} este mes`, accent: 'var(--red)' },
    { title: 'Cumpleaños este mes', value: String(cumpleañosEsteMes), label: 'Colaboradores celebrando', accent: '#ec4899' },
  ]

  return (
    <div className="content-scroll">

      {/* ── WELCOME + KPIS  |  CALENDARIO ───── */}
      <div className="two-col" style={{ alignItems: 'start' }}>

        {/* LEFT: WELCOME BANNER + KPIS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="welcome-banner">
            <div className="welcome-left">
              <img src={viaSaludando} alt="" className="welcome-mascot" />
              <div className="welcome-content">
                <div className="welcome-title">Hola, {firstName}</div>
                <div className="welcome-sub">
                  Este es el resumen de tu organización hoy: onboarding, desempeño, encuestas, reconocimientos y más.
                </div>
              </div>
            </div>
          </div>

          <div className="kpi-strip">
            {kpis.slice(0, 3).map(k => (
              <div key={k.title} className="kpi-card" style={{ '--kpi-accent': k.accent }}>
                <div className="kpi-title">{k.title}</div>
                <div className="kpi-val">{k.value}</div>
                <div className="kpi-lbl">{k.label}</div>
              </div>
            ))}
          </div>

          <div className="kpi-strip">
            {kpis.slice(3, 6).map(k => (
              <div key={k.title} className="kpi-card" style={{ '--kpi-accent': k.accent }}>
                <div className="kpi-title">{k.title}</div>
                <div className="kpi-val">{k.value}</div>
                <div className="kpi-lbl">{k.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px' }}>
              Otras métricas
            </div>
            <div className="kpi-strip">
              {kpisSecundarios.map(k => (
                <div key={k.title} className="kpi-card" style={{ '--kpi-accent': k.accent }}>
                  <div className="kpi-title">{k.title}</div>
                  <div className="kpi-val">{k.value}</div>
                  <div className="kpi-lbl">{k.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: CALENDARIO + PRÓXIMOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="sec-card">
            <div className="sc-hd">
              <CalendarDays size={15} style={{ color: 'var(--blue)' }} />
              <h3>{MESES[hoy.getMonth()]} {hoy.getFullYear()}</h3>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => navigate('/calendario?mes=-1')} style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid var(--border-soft)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <ChevronLeft size={13} />
                </button>
                <button onClick={() => navigate('/calendario?mes=1')} style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid var(--border-soft)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
            <div className="sc-body" style={{ padding: '14px 18px 18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {DIAS_SEMANA.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', padding: '0 0 8px' }}>{d}</div>
                ))}
                {calendarCells.map((cell, i) => {
                  const isToday = cell.inMonth && cell.day === hoy.getDate()
                  const isSelected = cell.inMonth && cell.day === activeDay
                  const eventos = cell.inMonth ? eventosPorDia[cell.day] : null
                  return (
                    <button
                      key={i}
                      onClick={() => cell.inMonth && setSelectedDay(cell.day)}
                      disabled={!cell.inMonth}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '3px 0',
                        background: 'none', border: 'none', fontFamily: 'inherit', cursor: cell.inMonth ? 'pointer' : 'default',
                      }}
                    >
                      <span style={{
                        width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: isSelected || isToday ? 700 : 500,
                        background: isSelected ? 'var(--navy)' : 'transparent',
                        border: !isSelected && isToday ? '1.5px solid var(--navy)' : 'none',
                        color: !cell.inMonth ? 'var(--border-dark)' : isSelected ? '#fff' : isToday ? 'var(--navy)' : 'var(--text-heading)',
                      }}>{cell.day}</span>
                      <span style={{ display: 'flex', gap: 2, height: 4 }}>
                        {eventos && eventos.slice(0, 3).map((e, j) => (
                          <span key={j} style={{ width: 4, height: 4, borderRadius: '50%', background: e.color }} />
                        ))}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 10, paddingTop: 12, borderTop: '1px solid var(--border-soft)', flexWrap: 'wrap' }}>
                {CALENDAR_LEGEND.map(l => (
                  <span key={l.label} style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: l.color, display: 'inline-block' }} /> {l.label}
                  </span>
                ))}
              </div>

              {/* DETALLE DEL DÍA SELECCIONADO */}
              <div style={{ marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--border-soft)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>
                  {activeDay} de {MESES[hoy.getMonth()]}{activeDay === hoy.getDate() ? ' · Hoy' : ''}
                </div>
                {eventosDelDia.length > 0 ? (
                  <>
                    {eventosDelDia.slice(0, DIA_DETALLE_MAX).map((e, i) => (
                      <div key={i} className="upcoming-item">
                        <div className="ui-date">
                          <div className="ui-day">{String(activeDay).padStart(2, '0')}</div>
                          <div className="ui-month">{MESES[hoy.getMonth()].slice(0, 3).toUpperCase()}</div>
                        </div>
                        <div className="ui-info">
                          <div className="ui-name">{e.titulo}</div>
                          <div className="ui-sub">{e.subtitulo}</div>
                          <div className="ui-sub">{e.tipo}</div>
                        </div>
                        {e.kind === 'persona' ? (
                          <div className="ui-av"><img src={avatarUrl(e.titulo)} alt={e.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={ev => { ev.currentTarget.style.display = 'none' }} /></div>
                        ) : (
                          <div className="ui-av" style={{ background: `${e.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <e.Icon size={14} style={{ color: e.color }} />
                          </div>
                        )}
                      </div>
                    ))}
                    {eventosDelDia.length > DIA_DETALLE_MAX && (
                      <button
                        onClick={() => navigate(`/calendario?dia=${activeDay}`)}
                        style={{
                          width: '100%', marginTop: 4, padding: '9px 0', borderRadius: 8,
                          border: '1px solid var(--border-soft)', background: 'var(--surface-hover)',
                          color: 'var(--blue)', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        Ver todo ({eventosDelDia.length}) →
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{ padding: '10px 0', fontSize: 11.5, color: 'var(--text-muted)' }}>Sin actividades este día</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ANALYTICS: COLABORADORES + PROCESOS ── */}
      <div className="analytics-row">
        <div className="sec-card">
          <div className="sc-hd">
            <h3>Colaboradores por estado</h3>
            <select
              className="pl-input"
              value={areaFiltro}
              onChange={e => setAreaFiltro(e.target.value)}
              style={{ width: 'auto', padding: '6px 30px 6px 10px', fontSize: 11, borderRadius: 8 }}
            >
              <option value="todas">Todas las áreas</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="sc-body" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div className="donut-wrap" style={{ width: 150, height: 150, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={estadoData} dataKey="value" nameKey="label" innerRadius={48} outerRadius={72} paddingAngle={3} strokeWidth={0}>
                    {estadoData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip {...chartTooltipStyle} formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <div className="donut-center-val">{totalColabFiltrados}</div>
                <div className="donut-center-lbl">total</div>
              </div>
            </div>
            <div className="donut-legend" style={{ flex: 1 }}>
              {estadoData.length > 0 ? estadoData.map(d => (
                <div key={d.estado} className="donut-legend-item">
                  <span className="donut-legend-dot" style={{ background: d.color }} />
                  <span className="donut-legend-label">{d.label}</span>
                  <span className="donut-legend-val">{d.value}</span>
                </div>
              )) : (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sin colaboradores en esta área</div>
              )}
            </div>
          </div>
        </div>

        <div className="sec-card">
          <div className="sc-hd"><h3>Procesos de evaluación por tipo</h3></div>
          <div className="sc-body">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={procesosPorTipo} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="tipo" width={100} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} cursor={{ fill: 'var(--input-bg)' }} />
                <Bar dataKey="count" name="Procesos" radius={[0, 6, 6, 0]} barSize={16}>
                  {procesosPorTipo.map((d, i) => <Cell key={i} fill={TIPO_PROCESO_COLORS[i % TIPO_PROCESO_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── TWO COLUMN ─────────────────────── */}
      <div className="two-col">

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* PROCESOS DE EVALUACIÓN */}
          <div className="sec-card">
            <div className="sc-hd">
              <Target size={15} style={{ color: 'var(--blue)' }} />
              <h3>Procesos de evaluación <span className="sc-hd-count">{totalProcesos}</span></h3>
            </div>
            <div style={{ display: 'flex', gap: 6, padding: '10px 22px 0', flexWrap: 'wrap' }}>
              {ESTADO_PROCESO_TABS.map(tab => {
                const count = tab.key === 'todos' ? totalProcesos : evalTotales[tab.key]
                const active = estadoFiltro === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setEstadoFiltro(tab.key)}
                    style={{
                      fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20,
                      border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      background: active ? 'var(--navy)' : 'var(--input-bg)',
                      color: active ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {tab.label} <span style={{ opacity: .7 }}>{count}</span>
                  </button>
                )
              })}
            </div>
            <div className="sc-body" style={{ padding: '10px 22px 18px' }}>
              {procesosFiltrados.length > 0 ? procesosFiltrados.map(p => {
                const pct = p.total > 0 ? Math.round((p.completadas / p.total) * 100) : 0
                const salud = SALUD_INFO[p.salud]
                return (
                  <div key={p.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-heading)' }}>{p.nombre}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{p.tipo}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: salud.color, whiteSpace: 'nowrap' }}>{salud.label}</span>
                    </div>
                    <div className="pr-bar"><div className="pr-fill" style={{ width: `${pct}%`, background: salud.color }} /></div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{p.completadas}/{p.total} completadas ({pct}%)</div>
                  </div>
                )
              }) : (
                <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                  Sin procesos en este estado
                </div>
              )}
            </div>
          </div>

          {/* PUBLICACIONES RECIENTES */}
          <div className="sec-card">
            <div className="sc-hd">
              <Megaphone size={15} style={{ color: 'var(--purple)' }} />
              <h3>Publicaciones recientes <span className="sc-hd-count">{totalPublicaciones}</span></h3>
            </div>
            <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
              {publicaciones.map((p, i) => (
                <div key={p.id} style={{ padding: '10px 0', borderBottom: i < publicaciones.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-heading)' }}>{p.titulo}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{p.fecha.split(' ')[0]}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 3 }}>{p.audiencia}</div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={11} /> {p.vistas}
                    </span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Heart size={11} /> {p.likes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* REQUIEREN ATENCIÓN */}
          <div className="sec-card">
            <div className="sc-hd">
              <UserRound size={15} style={{ color: 'var(--red)' }} />
              <h3>Requieren atención <span className="sc-hd-count">{atencionColaboradores.length}</span></h3>
            </div>
            <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
              {atencionColaboradores.length > 0 ? atencionColaboradores.map(c => (
                <div key={c.id} className="alert-item">
                  <div className="ai-av"><img src={avatarUrl(c.nombre)} alt={c.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none' }} /></div>
                  <div className="ai-info">
                    <div className="ai-name">{c.nombre}</div>
                    <div className="ai-sub">{c.cargo} · {c.area}</div>
                  </div>
                  <span className="badge" style={{ background: `${ESTADO_COLABORADOR_COLORS[c.estado]}18`, color: ESTADO_COLABORADOR_COLORS[c.estado] }}>
                    {ESTADO_COLABORADOR_LABELS[c.estado]}
                  </span>
                </div>
              )) : (
                <div style={{ padding: 20, textAlign: 'center' }}>
                  <CheckCircle2 size={24} style={{ color: 'var(--green)', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Todos activos en esta área</div>
                </div>
              )}
            </div>
          </div>

          {/* INVITACIONES */}
          <div className="sec-card">
            <div className="sc-hd">
              <Mail size={15} style={{ color: 'var(--blue)' }} />
              <h3>Invitaciones de colaboradores</h3>
            </div>
            <div className="sc-body" style={{ display: 'flex', gap: 8, padding: '14px 22px' }}>
              {[
                { label: 'Pendientes', value: invitaciones.pendientes, color: 'var(--yellow)' },
                { label: 'Aceptadas', value: invitaciones.aceptadas, color: 'var(--green)' },
                { label: 'Expiradas', value: invitaciones.expiradas, color: 'var(--text-muted)' },
                { label: 'Canceladas', value: invitaciones.canceladas, color: 'var(--red)' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RECONOCIMIENTOS RECIENTES */}
          <div className="sec-card">
            <div className="sc-hd">
              <Trophy size={15} style={{ color: '#f59e0b' }} />
              <h3>Reconocimientos recientes</h3>
            </div>
            <div className="sc-body" style={{ padding: '8px 22px 18px' }}>
              {reconocimientos.map(r => (
                <div key={r.id} className="alert-item">
                  <div className="ai-av"><img src={avatarUrl(r.persona)} alt={r.persona} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none' }} /></div>
                  <div className="ai-info">
                    <div className="ai-name">{r.persona}</div>
                    <div className="ai-sub">{r.tipo}: {r.motivo} · {r.audiencia}</div>
                  </div>
                  <Award size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>

          {/* PDI */}
          <div className="hito-card">
            <div className="hito-ico">
              <ClipboardList size={20} color="#fff" />
            </div>
            <div className="hito-text">
              <strong>{pdi.activos} de {pdi.total}</strong> colaboradores tienen un Plan de Desarrollo Individual activo, con un avance promedio del <strong>{pdi.avancePromedioPct}%</strong>.
            </div>
            <button className="hito-btn">
              <Target size={14} />
              Ver PDIs activos
            </button>
          </div>

        </div>
      </div>

      <div style={{ height: '8px' }} />

    </div>
  )
}
