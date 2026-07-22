import { useState } from 'react'
import { HeartHandshake, AlertTriangle, ShieldOff, ArrowLeft, Search, ChevronDown, Check } from 'lucide-react'
import { useUser } from '../../context/UserContext'
import { avatarUrl } from '../../utils/calendarEvents'
import { colaboradoresData, ESTADOS_ONBOARDING } from '../personas/colaboradoresData'
import { rutasData } from './JourneyBuilder'
import { RutaPath, TaskPreviewModal } from '../../components/onboarding/RutaPreviewModal'
import ColaboradorCard from '../../components/onboarding/ColaboradorCard'
import { tareasBuddyDe } from '../../data/tareasBuddy'

// Estados relevantes para filtrar acompañados (excluye N/A y sin-ruta).
const ESTADOS_FILTRO = ['sin-iniciar', 'en-curso', 'en-riesgo', 'graduado']

export default function MisAcompanados() {
  const { currentUser } = useUser()
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [estadoOpen, setEstadoOpen] = useState(false)
  const [rutaTarea, setRutaTarea] = useState(null)

  const acompanados = colaboradoresData.filter(c => c.buddy?.name === currentUser.name)

  /* La ruta que ve el buddy es la del colaborador. En producción sale del snapshot
     que se le asignó; aquí solo existe la ruta 1, igual que en el resto del módulo. */
  const rutaDe = c => rutasData[c.rutaId] || rutasData[1]

  const pendientes = acompanados.reduce((s, c) => s + tareasBuddyDe(c.id).filter(t => !t.done).length, 0)
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
    return (
      <div className="content-scroll">
        {/* Breadcrumb / volver */}
        <button
          onClick={() => { setRutaTarea(null); setSelectedId(null) }}
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

        {/* La ruta completa del colaborador: el buddy la ve para saber dónde está
            atascado y en qué puede ayudar. Solo lectura, sin sus respuestas. */}
        <div className="sec-card" style={{ marginBottom: 16 }}>
          <div className="sc-hd">
            <h3 style={{ flex: 1 }}>La ruta de {sel.name.split(' ')[0]}</h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Toca una tarea para ver de qué se trata</span>
          </div>
          <div className="sc-body" style={{ paddingTop: 4 }}>
            <div style={{ borderRadius: 12, padding: '22px 0', background: 'linear-gradient(180deg, #f0f4f8 0%, #e8eef4 100%)' }}>
              <RutaPath etapas={rutaDe(sel).etapas} gamificacion onSelectTask={setRutaTarea} />
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

        {rutaTarea && <TaskPreviewModal task={rutaTarea} onClose={() => setRutaTarea(null)} />}
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
          const misTareas = tareasBuddyDe(c.id)
          const hechas = misTareas.filter(t => t.done).length
          const pend = misTareas.length - hechas
          return (
            <ColaboradorCard
              key={c.id}
              nombre={c.name}
              cargo={c.cargo}
              area={c.depto}
              pct={c.onbPct}
              barColor={estado.color}
              badge={<span className="badge" style={{ background: estado.bg, color: estado.color, flexShrink: 0 }}>{estado.label}</span>}
              meta={
                <span style={{ fontSize: 11.5, color: pend > 0 ? 'var(--text-heading)' : 'var(--text-muted)', fontWeight: pend > 0 ? 600 : 500 }}>
                  Mis tareas: {hechas}/{misTareas.length}
                  {pend > 0 && <span style={{ color: 'var(--yellow)', fontWeight: 700 }}> · {pend} pendiente{pend > 1 ? 's' : ''}</span>}
                </span>
              }
              onVerDetalles={() => setSelectedId(c.id)}
            />
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
