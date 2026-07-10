import { useState } from 'react'
import { HeartHandshake, AlertTriangle, CheckCircle2, Circle, Clock, ShieldOff } from 'lucide-react'
import { useUser } from '../../context/UserContext'
import { avatarUrl } from '../../utils/calendarEvents'
import { colaboradoresData, ESTADOS_ONBOARDING } from '../personas/colaboradoresData'

/* Tareas de acompañamiento, indexadas por el id del colaborador acompañado.
   En producción NO son un dato aparte: salen de las tareas de la ruta con
   `tipo: 'tarea-otro'` y `responsable: 'Buddy'` (ver rutasData en JourneyBuilder).
   Aquí van sueltas para no tener que instanciar una ruta completa por persona. */
const TAREAS_BUDDY = {
  3: [
    { id: 'b1', name: 'Reunión 1:1 de bienvenida', fechaRel: 'Día 3', done: true },
    { id: 'b2', name: 'Presentarle al equipo de Diseño', fechaRel: 'Día 5', done: true },
    { id: 'b3', name: 'Revisar su primer entregable', fechaRel: 'Día 12', done: false },
    { id: 'b4', name: 'Check-in de fin de mes', fechaRel: 'Día 30', done: false },
  ],
  11: [
    { id: 'b5', name: 'Reunión 1:1 de bienvenida', fechaRel: 'Día 3', done: true },
    { id: 'b6', name: 'Acompañar su primera campaña', fechaRel: 'Día 14', done: false },
  ],
  20: [
    { id: 'b7', name: 'Reunión 1:1 de bienvenida', fechaRel: 'Día 3', done: true },
    { id: 'b8', name: 'Revisar su primer dashboard', fechaRel: 'Día 20', done: true },
    { id: 'b9', name: 'Check-in de fin de mes', fechaRel: 'Día 30', done: false },
  ],
}

const COLOR_BARRA = pct => (pct >= 60 ? 'var(--green)' : pct >= 30 ? 'var(--blue)' : 'var(--red)')

export default function MisAcompanados() {
  const { currentUser } = useUser()
  const [tareas, setTareas] = useState(TAREAS_BUDDY)

  const acompanados = colaboradoresData.filter(c => c.buddy?.name === currentUser.name)

  const toggleTarea = (colaboradorId, tareaId) => setTareas(prev => ({
    ...prev,
    [colaboradorId]: prev[colaboradorId].map(t => (t.id === tareaId ? { ...t, done: !t.done } : t)),
  }))

  const tareasDe = id => tareas[id] || []
  const pendientes = acompanados.reduce((s, c) => s + tareasDe(c.id).filter(t => !t.done).length, 0)
  const enRiesgo = acompanados.filter(c => c.onb === 'en-riesgo').length

  if (acompanados.length === 0) {
    return (
      <div className="content-scroll">
        <div className="pl-header">
          <div>
            <h1 className="pl-title">Mis acompañados</h1>
            <p className="pl-subtitle">Personas cuyo onboarding acompañas como buddy</p>
          </div>
        </div>
        <div className="sec-card">
          <div style={{ padding: 48, textAlign: 'center' }}>
            <HeartHandshake size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>Todavía no acompañas a nadie</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, maxWidth: 380, margin: '6px auto 0' }}>
              Cuando Recursos Humanos te asigne como buddy de alguien, esa persona aparecerá aquí junto a las tareas en las que participas.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-scroll">
      <div className="pl-header">
        <div>
          <h1 className="pl-title">Mis acompañados</h1>
          <p className="pl-subtitle">Personas cuyo onboarding acompañas como buddy</p>
        </div>
      </div>

      <div className="kpi-strip">
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--blue)' }}>
          <div className="kpi-title">Acompañados</div>
          <div className="kpi-val">{acompanados.length}</div>
          <div className="kpi-lbl">Onboardings que estás acompañando</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--yellow)' }}>
          <div className="kpi-title">Mis tareas pendientes</div>
          <div className="kpi-val">{pendientes}</div>
          <div className="kpi-lbl">Tareas de acompañamiento sin completar</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--red)' }}>
          <div className="kpi-title">En riesgo</div>
          <div className="kpi-val">{enRiesgo}</div>
          <div className="kpi-lbl">Llevan +3 días sin actividad</div>
        </div>
      </div>

      {acompanados.map(c => {
        const estado = ESTADOS_ONBOARDING[c.onb]
        const misTareas = tareasDe(c.id)
        const hechas = misTareas.filter(t => t.done).length
        return (
          <div key={c.id} className="sec-card">
            <div className="sc-hd">
              <div className="ai-av" style={{ width: 34, height: 34 }}>
                <img src={avatarUrl(c.name)} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none' }} />
              </div>
              <h3 style={{ flex: 1 }}>
                {c.name}
                <span style={{ display: 'block', fontSize: 10.5, fontWeight: 500, color: 'var(--text-muted)', marginTop: 2 }}>
                  {c.cargo} · {c.depto}
                </span>
              </h3>
              <span className="badge" style={{ background: estado.bg, color: estado.color }}>{estado.label}</span>
            </div>

            <div className="sc-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Avance de su onboarding</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-heading)' }}>{c.onbPct}%</span>
                </div>
                <div className="pr-bar">
                  <div className="pr-fill" style={{ width: `${c.onbPct}%`, background: COLOR_BARRA(c.onbPct) }} />
                </div>
                {c.onb === 'en-riesgo' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, padding: '9px 12px', borderRadius: 9, background: 'var(--red-bg)' }}>
                    <AlertTriangle size={14} style={{ color: 'var(--red)', flexShrink: 0 }} />
                    <span style={{ fontSize: 11.5, color: 'var(--red)', fontWeight: 600 }}>
                      Lleva más de 3 días sin actividad. Un mensaje tuyo puede desatascar el proceso.
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                  Mis tareas de acompañamiento <span style={{ opacity: .7 }}>{hechas}/{misTareas.length}</span>
                </div>
                {misTareas.map(t => (
                  <button
                    key={t.id}
                    onClick={() => toggleTarea(c.id, t.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 0', border: 'none', borderBottom: '1px solid var(--border-soft)',
                      background: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    }}
                  >
                    {t.done
                      ? <CheckCircle2 size={16} style={{ color: 'var(--green)', flexShrink: 0 }} />
                      : <Circle size={16} style={{ color: 'var(--border-dark)', flexShrink: 0 }} />}
                    <span style={{
                      flex: 1, fontSize: 12.5,
                      color: t.done ? 'var(--text-muted)' : 'var(--text-heading)',
                      textDecoration: t.done ? 'line-through' : 'none',
                    }}>{t.name}</span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <Clock size={11} /> {t.fechaRel}
                    </span>
                  </button>
                ))}
              </div>

            </div>
          </div>
        )
      })}

      {/* Deliberado: el buddy no ve la ficha completa de nadie. Acompaña, no supervisa. */}
      <div className="sec-card">
        <div className="sc-body" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldOff size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Como buddy ves el avance general y las tareas en las que participas. El detalle de las respuestas,
            las evaluaciones y los datos personales de cada colaborador siguen siendo visibles solo para Recursos Humanos.
          </span>
        </div>
      </div>

      <div style={{ height: 8 }} />
    </div>
  )
}
