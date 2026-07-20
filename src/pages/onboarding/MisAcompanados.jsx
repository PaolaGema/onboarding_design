import { useState } from 'react'
import { HeartHandshake, AlertTriangle, Clock, ShieldOff, ArrowLeft, Search, ChevronDown, Check } from 'lucide-react'
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
  13: [
    { id: 'b10', name: 'Reunión 1:1 de bienvenida', fechaRel: 'Día 3', done: true },
    { id: 'b11', name: 'Acompañar su primera campaña', fechaRel: 'Día 14', done: true },
    { id: 'b12', name: 'Check-in de fin de mes', fechaRel: 'Día 30', done: true },
  ],
}

// Estados relevantes para filtrar acompañados (excluye N/A y sin-ruta).
const ESTADOS_FILTRO = ['sin-iniciar', 'en-curso', 'en-riesgo', 'graduado']

export default function MisAcompanados() {
  const { currentUser } = useUser()
  const [tareas, setTareas] = useState(TAREAS_BUDDY)
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [estadoOpen, setEstadoOpen] = useState(false)

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

  // ─── VISTA DETALLE ───────────────────────────────────────────
  const sel = selectedId ? acompanados.find(c => c.id === selectedId) : null
  if (sel) {
    const estado = ESTADOS_ONBOARDING[sel.onb]
    const misTareas = tareasDe(sel.id)
    const hechas = misTareas.filter(t => t.done).length
    return (
      <div className="content-scroll">
        {/* Breadcrumb / volver */}
        <button
          onClick={() => setSelectedId(null)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', padding: 0, marginBottom: 14 }}
        >
          <ArrowLeft size={15} /> Mis acompañados
        </button>

        {/* Encabezado del colaborador */}
        <div className="sec-card" style={{ marginBottom: 16 }}>
          <div className="sc-hd">
            <div className="ai-av" style={{ width: 44, height: 44 }}>
              <img src={avatarUrl(sel.name)} alt={sel.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none' }} />
            </div>
            <h3 style={{ flex: 1 }}>
              {sel.name}
              <span style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginTop: 2 }}>
                {sel.cargo} · {sel.depto}
              </span>
            </h3>
            <span className="badge" style={{ background: estado.bg, color: estado.color }}>{estado.label}</span>
          </div>
          <div className="sc-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Avance de su onboarding</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)' }}>{sel.onbPct}%</span>
            </div>
            <div className="pr-bar">
              <div className="pr-fill" style={{ width: `${sel.onbPct}%`, background: estado.color }} />
            </div>
            {sel.onb === 'en-riesgo' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12, padding: '9px 12px', borderRadius: 9, background: 'var(--red-bg)' }}>
                <AlertTriangle size={14} style={{ color: 'var(--red)', flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, color: 'var(--red)', fontWeight: 600 }}>
                  Lleva más de 3 días sin actividad. Un mensaje tuyo puede desatascar el proceso.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tareas de acompañamiento */}
        <div className="sec-card" style={{ marginBottom: 16 }}>
          <div className="sc-hd">
            <h3 style={{ flex: 1 }}>Mis tareas de acompañamiento</h3>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{hechas}/{misTareas.length}</span>
          </div>
          <div className="sc-body" style={{ paddingTop: 4 }}>
            <div style={{ borderRadius: 12, padding: '22px 0', background: 'linear-gradient(180deg, #f0f4f8 0%, #e8eef4 100%)' }}>
              {misTareas.map((t, i) => {
                const off = [0, 40, 0, -40][i % 4]
                return (
                  <div key={t.id}>
                    {i > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: 2, height: 18, background: '#cbd5e1', borderRadius: 1 }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateX(${off}px)`, transition: 'transform .2s' }}>
                      <button
                        onClick={() => toggleTarea(sel.id, t.id)}
                        title={t.done ? 'Marcar como pendiente' : 'Marcar como completada'}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, position: 'relative' }}
                      >
                        <div style={{
                          width: 46, height: 46, borderRadius: '50%',
                          background: t.done ? '#00E091' : '#fff',
                          border: t.done ? 'none' : '2px solid #cbd5e1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: t.done ? '0 2px 8px rgba(0,224,145,.3)' : '0 1px 4px rgba(0,0,0,.06)',
                          transition: 'all .15s',
                        }}>
                          {t.done
                            ? <Check size={20} style={{ color: '#fff' }} />
                            : <span style={{ fontSize: 14, fontWeight: 800, color: '#94a3b8' }}>{i + 1}</span>}
                        </div>
                      </button>
                      <span style={{
                        fontSize: 12.5, fontWeight: 600, marginTop: 8, textAlign: 'center', maxWidth: 180, lineHeight: 1.3,
                        color: t.done ? '#64748b' : '#0C2D40',
                        textDecoration: t.done ? 'line-through' : 'none',
                      }}>{t.name}</span>
                      <span style={{ fontSize: 10.5, color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                        <Clock size={10} /> {t.fechaRel}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Nota de privacidad */}
        <div className="sec-card">
          <div className="sc-body" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShieldOff size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Como buddy ves el avance general y las tareas en las que participas. El detalle de las respuestas,
              las evaluaciones y los datos personales de {sel.name.split(' ')[0]} siguen siendo visibles solo para Recursos Humanos.
            </span>
          </div>
        </div>

        <div style={{ height: 8 }} />
      </div>
    )
  }

  // ─── VISTA LISTA ─────────────────────────────────────────────
  const estadoOpts = [{ key: 'todos', label: 'Todos los estados' }, ...ESTADOS_FILTRO.map(k => ({ key: k, label: ESTADOS_ONBOARDING[k].label }))]
  const q = search.trim().toLowerCase()
  const visibles = acompanados.filter(c =>
    (filterEstado === 'todos' || c.onb === filterEstado) &&
    (q === '' || c.name.toLowerCase().includes(q) || (c.cargo || '').toLowerCase().includes(q) || (c.depto || '').toLowerCase().includes(q))
  )

  return (
    <div className="content-scroll" onClick={() => setEstadoOpen(false)}>
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

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="pl-search-wrap" style={{ flex: 1, minWidth: 220 }}>
          <Search size={13} className="pl-search-ico" />
          <input
            type="text"
            className="pl-search"
            placeholder="Buscar acompañado por nombre o área…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="pl-dropdown-wrap" style={{ width: 'auto', position: 'relative' }}>
          <button
            type="button"
            className={`pl-dropdown-trigger${estadoOpen ? ' open' : ''}${filterEstado === 'todos' ? ' placeholder' : ''}`}
            style={{ width: 'auto', height: 36, fontSize: 11.5, padding: '0 12px', gap: 6 }}
            onClick={e => { e.stopPropagation(); setEstadoOpen(o => !o) }}
          >
            <span style={{ whiteSpace: 'nowrap' }}>{estadoOpts.find(o => o.key === filterEstado)?.label}</span>
            <ChevronDown size={13} className="pl-dropdown-chevron" style={{ flexShrink: 0 }} />
          </button>
          {estadoOpen && (
            <div className="pl-dropdown-menu" style={{ minWidth: 180 }} onClick={e => e.stopPropagation()}>
              {estadoOpts.map(o => (
                <button
                  key={o.key}
                  type="button"
                  className={`pl-dropdown-item${filterEstado === o.key ? ' selected' : ''}`}
                  style={{ fontSize: 11.5, padding: '6px 9px' }}
                  onClick={() => { setFilterEstado(o.key); setEstadoOpen(false) }}
                >
                  <span>{o.label}</span>
                  {filterEstado === o.key && <Check size={13} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="sec-card">
          <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12.5 }}>
            No hay acompañados que coincidan con tu búsqueda o filtro.
          </div>
        </div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {visibles.map(c => {
          const estado = ESTADOS_ONBOARDING[c.onb]
          const misTareas = tareasDe(c.id)
          const hechas = misTareas.filter(t => t.done).length
          const pend = misTareas.length - hechas
          return (
            <div
              key={c.id}
              style={{
                background: 'var(--surface-card)', border: '1px solid var(--border-soft)', borderRadius: 14,
                boxShadow: 'var(--shadow-card)', padding: 14, display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="ai-av" style={{ width: 36, height: 36, flexShrink: 0 }}>
                  <img src={avatarUrl(c.name)} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.cargo} · {c.depto}</div>
                </div>
                <span className="badge" style={{ background: estado.bg, color: estado.color, flexShrink: 0 }}>{estado.label}</span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avance de su onboarding</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)' }}>{c.onbPct}%</span>
                </div>
                <div className="pr-bar">
                  <div className="pr-fill" style={{ width: `${c.onbPct}%`, background: estado.color }} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 11.5, color: pend > 0 ? 'var(--text-heading)' : 'var(--text-muted)', fontWeight: pend > 0 ? 600 : 500 }}>
                  Mis tareas: {hechas}/{misTareas.length}
                  {pend > 0 && <span style={{ color: 'var(--yellow)', fontWeight: 700 }}> · {pend} pendiente{pend > 1 ? 's' : ''}</span>}
                </span>
                <button
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '9px 0', borderRadius: 8, border: 'none', background: 'var(--navy)', color: '#fff',
                    cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', transition: 'background .12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#16405a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--navy)'}
                >
                  Ver detalles
                </button>
              </div>
            </div>
          )
        })}
      </div>
      )}

      {/* Deliberado: el buddy no ve la ficha completa de nadie. Acompaña, no supervisa. */}
      <div className="sec-card" style={{ marginTop: 16 }}>
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
