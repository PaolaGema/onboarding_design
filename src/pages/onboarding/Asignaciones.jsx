import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import {
  Search, Plus, UserPlus, X, AlertTriangle, Eye, Users, Route,
  ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Pause, Play, Trash2, Info, Filter, CheckCircle2, Check
} from 'lucide-react'
import AsignarRutaModal from '../../components/onboarding/AsignarRutaModal'

const statusLabels = {
  'en-curso': 'En curso',
  'completado': 'Completado',
  'pendiente': 'Programado',
  'atrasado': 'Atrasado',
  'en-riesgo': 'En riesgo',
  'pausado': 'Pausado',
}

const statusCls = {
  'en-curso': 'as-st-curso',
  'completado': 'as-st-completado',
  'pendiente': 'as-st-pendiente',
  'atrasado': 'as-st-atrasado',
  'en-riesgo': 'as-st-riesgo',
  'pausado': 'as-st-pausado',
}


function barColor(status, pct) {
  if (status === 'completado') return 'var(--green)'
  if (status === 'atrasado' || status === 'en-riesgo') return 'var(--red)'
  if (pct < 30) return 'var(--yellow)'
  return 'var(--blue)'
}

export default function Asignaciones() {
  const navigate = useNavigate()
  const { currentUser } = useUser()
  const isAreaRole = currentUser.role === 'manager' || currentUser.role === 'auxiliar'
  const managerArea = 'Marketing'

  const { asignaciones: allAsignaciones, setAsignaciones: setAllAsignaciones, plantillas: allPlantillas, addFeedEntry } = useOnboardingData()
  const asignaciones = isAreaRole ? allAsignaciones.filter(a => a.area === managerArea) : allAsignaciones
  function setAsignaciones(next) {
    if (!isAreaRole) { setAllAsignaciones(next); return }
    const others = allAsignaciones.filter(a => a.area !== managerArea)
    setAllAsignaciones([...others, ...next])
  }
  const plantillasDisponibles = allPlantillas.filter(p => p.status === 'activa').map(p => p.name)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterArea, setFilterArea] = useState('todas')
  const [filterRuta, setFilterRuta] = useState('todas')
  const [showAsigFilters, setShowAsigFilters] = useState(false)
  const [afDropStatus, setAfDropStatus] = useState(false)
  const [afDropArea, setAfDropArea] = useState(false)
  const [afDropRuta, setAfDropRuta] = useState(false)
  const [page, setPage] = useState(1)
  const perPage = 8
  const [modal, setModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [showEstadoHelp, setShowEstadoHelp] = useState(false)

  const hasAsigFilters = filterStatus !== 'todos' || filterArea !== 'todas' || filterRuta !== 'todas'
  const rutasDeArea = [...new Set(asignaciones.filter(a => filterArea === 'todas' || a.area === filterArea).map(a => a.ruta))]
  function clearAsigFilters() { setFilterStatus('todos'); setFilterArea('todas'); setFilterRuta('todas') }

  const filtered = asignaciones.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = a.nombre.toLowerCase().includes(q) ||
      a.ruta.toLowerCase().includes(q) ||
      a.area.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'todos' || a.status === filterStatus
    const matchArea = filterArea === 'todas' || a.area === filterArea
    const matchRuta = filterRuta === 'todas' || a.ruta === filterRuta
    return matchSearch && matchStatus && matchArea && matchRuta
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const totalActivas = asignaciones.filter(a => a.status === 'en-curso').length
  const totalCompletadas = asignaciones.filter(a => a.status === 'completado').length
  const totalPendientes = asignaciones.filter(a => a.status === 'pendiente').length
  const totalAtrasados = asignaciones.filter(a => a.status === 'atrasado' || a.status === 'en-riesgo').length

  function handleAsignar(colabs, ruta, fecha) {
    if (!colabs.length || !ruta) return
    const baseId = Math.max(0, ...allAsignaciones.map(a => a.id))
    const newItems = colabs.map((c, i) => ({
      id: baseId + i + 1,
      nombre: c.name,
      area: c.depto || 'Sin asignar',
      ruta: ruta.name,
      dia: 0,
      totalDias: 30,
      pct: 0,
      status: 'pendiente',
      fechaInicio: fecha || 'Por definir',
      color: c.color || '#3b82f6',
    }))
    setAsignaciones([...asignaciones, ...newItems])
    colabs.forEach(c => addFeedEntry(`${c.name} fue asignado/a a ${ruta.name}`))
    setModal(false)
  }

  function handlePausar(id) {
    setAsignaciones(asignaciones.map(a =>
      a.id === id ? { ...a, status: a.status === 'pausado' ? 'en-curso' : 'pausado' } : a
    ))
    setMenuOpen(null)
  }

  function confirmDelete(a) {
    setDeleteTarget(a)
    setMenuOpen(null)
  }

  function handleDelete() {
    setAsignaciones(asignaciones.filter(a => a.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div className="content-scroll" onClick={() => setMenuOpen(null)}>

      {/* HEADER */}
      <div className="pl-header">
        <div>
          <h1 className="pl-title">{isAreaRole ? `Asignaciones — ${managerArea}` : 'Asignaciones'}</h1>
          <p className="pl-subtitle">{isAreaRole ? 'Onboardings de tu equipo' : 'Gestiona los onboardings asignados a colaboradores'}</p>
        </div>
        {!isAreaRole && (
          <button className="pl-btn-new" onClick={() => setModal(true)}>
            <UserPlus size={15} />
            Asignar ruta
          </button>
        )}
      </div>

      {/* KPI STRIP */}
      <div className="kpi-strip">
        <div className="kpi-card">
          <div className="kpi-title" style={{ color: 'var(--blue)' }}>En curso</div>
          <div className="kpi-val">{totalActivas}</div>
          <div className="kpi-lbl">Onboardings activos</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title" style={{ color: 'var(--green)' }}>Completados</div>
          <div className="kpi-val">{totalCompletadas}</div>
          <div className="kpi-lbl">Finalizados con éxito</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title" style={{ color: 'var(--yellow)' }}>Pendientes</div>
          <div className="kpi-val">{totalPendientes}</div>
          <div className="kpi-lbl">Sin iniciar aún</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title" style={{ color: 'var(--red)' }}>Atrasados</div>
          <div className="kpi-val">{totalAtrasados}</div>
          <div className="kpi-lbl">Requieren atención</div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="pl-toolbar">
        <div className="pl-search-wrap">
          <Search size={14} className="pl-search-ico" />
          <input
            type="text"
            className="pl-search"
            placeholder="Buscar por nombre, ruta o área…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <button onClick={() => setShowAsigFilters(true)} style={{
          height: 38, padding: '0 14px', borderRadius: 8,
          border: hasAsigFilters ? '1.5px solid #0C2D40' : '1px solid #e2e8f0',
          background: hasAsigFilters ? '#f0f9ff' : '#fff',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
          color: hasAsigFilters ? '#0C2D40' : '#64748b',
        }}>
          <Filter size={13} />
          Filtros
          {hasAsigFilters && (
            <span style={{
              width: 16, height: 16, borderRadius: '50%', background: '#0C2D40',
              color: '#fff', fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {[filterStatus !== 'todos', filterArea !== 'todas', filterRuta !== 'todas'].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* CHIPS FILTROS */}
        {hasAsigFilters && (
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {filterStatus !== 'todos' && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 6px 3px 8px', borderRadius: 20, background: '#f0fdf4', color: '#166534', display: 'flex', alignItems: 'center', gap: 3 }}>
                {statusLabels[filterStatus]}
                <button onClick={() => { setFilterStatus('todos'); setPage(1) }} style={{ width: 14, height: 14, borderRadius: '50%', border: 'none', background: '#bbf7d0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={8} style={{ color: '#166534' }} /></button>
              </span>
            )}
            {filterArea !== 'todas' && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 6px 3px 8px', borderRadius: 20, background: '#eff6ff', color: '#1e40af', display: 'flex', alignItems: 'center', gap: 3 }}>
                {filterArea}
                <button onClick={() => { setFilterArea('todas'); setFilterRuta('todas') }} style={{ width: 14, height: 14, borderRadius: '50%', border: 'none', background: '#dbeafe', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={8} style={{ color: '#1e40af' }} /></button>
              </span>
            )}
            {filterRuta !== 'todas' && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 6px 3px 8px', borderRadius: 20, background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', gap: 3 }}>
                {filterRuta.length > 20 ? filterRuta.slice(0, 20) + '…' : filterRuta}
                <button onClick={() => setFilterRuta('todas')} style={{ width: 14, height: 14, borderRadius: '50%', border: 'none', background: '#fde68a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={8} style={{ color: '#92400e' }} /></button>
              </span>
            )}
            <button onClick={() => { clearAsigFilters(); setPage(1) }} style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Limpiar</button>
          </div>
        )}

        {/* MODAL FILTROS ASIGNACIONES */}
        {showAsigFilters && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAsigFilters(false)}>
            <div style={{ background: '#fff', borderRadius: 16, width: 400, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,.15)', animation: 'plSlideUp .15s' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Filter size={16} style={{ color: '#0C2D40' }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0C2D40' }}>Filtrar asignaciones</span>
                </div>
                <button onClick={() => setShowAsigFilters(false)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} style={{ color: '#64748b' }} />
                </button>
              </div>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }} onClick={() => { setAfDropStatus(false); setAfDropArea(false); setAfDropRuta(false) }}>
                {/* ESTADO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Estado</span>
                  <div className="pl-dropdown-wrap">
                    <button type="button" className={`pl-dropdown-trigger${afDropStatus ? ' open' : ''}${filterStatus === 'todos' ? ' placeholder' : ''}`} onClick={e => { e.stopPropagation(); setAfDropStatus(!afDropStatus); setAfDropArea(false); setAfDropRuta(false) }}>
                      <span>{filterStatus === 'todos' ? 'Todos los estados' : statusLabels[filterStatus]}</span>
                      <ChevronDown size={14} className="pl-dropdown-chevron" />
                    </button>
                    {afDropStatus && (
                      <div className="pl-dropdown-menu">
                        {[{ key: 'todos', label: 'Todos los estados' }, { key: 'en-curso', label: 'En curso' }, { key: 'completado', label: 'Completado' }, { key: 'pendiente', label: 'Programado' }, { key: 'atrasado', label: 'Atrasado' }, { key: 'en-riesgo', label: 'En riesgo' }, { key: 'pausado', label: 'Pausado' }].map(f => (
                          <button key={f.key} type="button" className={`pl-dropdown-item${filterStatus === f.key ? ' selected' : ''}`} onClick={() => { setFilterStatus(f.key); setAfDropStatus(false); setPage(1) }}>
                            <span>{f.label}</span>
                            {filterStatus === f.key && <Check size={14} />}
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
                    <button type="button" className={`pl-dropdown-trigger${afDropArea ? ' open' : ''}${filterArea === 'todas' ? ' placeholder' : ''}`} onClick={e => { e.stopPropagation(); setAfDropArea(!afDropArea); setAfDropStatus(false); setAfDropRuta(false) }}>
                      <span>{filterArea === 'todas' ? 'Todas las áreas' : filterArea}</span>
                      <ChevronDown size={14} className="pl-dropdown-chevron" />
                    </button>
                    {afDropArea && (
                      <div className="pl-dropdown-menu">
                        {['todas', ...new Set(asignaciones.map(a => a.area))].map(a => (
                          <button key={a} type="button" className={`pl-dropdown-item${filterArea === a ? ' selected' : ''}`} onClick={() => { setFilterArea(a); setFilterRuta('todas'); setAfDropArea(false); setPage(1) }}>
                            <span>{a === 'todas' ? 'Todas las áreas' : a}</span>
                            {filterArea === a && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* RUTA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Ruta</span>
                  <div className="pl-dropdown-wrap">
                    <button type="button" className={`pl-dropdown-trigger${afDropRuta ? ' open' : ''}${filterRuta === 'todas' ? ' placeholder' : ''}`} onClick={e => { e.stopPropagation(); setAfDropRuta(!afDropRuta); setAfDropStatus(false); setAfDropArea(false) }}>
                      <span>{filterRuta === 'todas' ? 'Todas las rutas' : filterRuta}</span>
                      <ChevronDown size={14} className="pl-dropdown-chevron" />
                    </button>
                    {afDropRuta && (
                      <div className="pl-dropdown-menu" style={{ maxHeight: 180, overflowY: 'auto' }}>
                        {['todas', ...rutasDeArea].map(r => (
                          <button key={r} type="button" className={`pl-dropdown-item${filterRuta === r ? ' selected' : ''}`} onClick={() => { setFilterRuta(r); setAfDropRuta(false); setPage(1) }}>
                            <span>{r === 'todas' ? 'Todas las rutas' : r}</span>
                            {filterRuta === r && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 24px', borderTop: '1px solid #f1f5f9' }}>
                <button onClick={() => { clearAsigFilters(); setPage(1) }} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#ef4444' }}>Limpiar filtros</button>
                <button onClick={() => setShowAsigFilters(false)} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: '#0C2D40', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700 }}>Aplicar filtros</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TABLA */}
      <div className="as-table-wrap">
        <table className="as-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Ruta asignada</th>
              <th>Progreso</th>
              <th>Día</th>
              <th style={{ position: 'relative' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Estado
                  <Info
                    size={12}
                    style={{ color: '#cbd5e1', cursor: 'pointer' }}
                    onMouseEnter={() => setShowEstadoHelp(true)}
                    onMouseLeave={() => setShowEstadoHelp(false)}
                  />
                </span>
                {showEstadoHelp && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: 6,
                    background: '#fff', borderRadius: 12, padding: '14px 16px',
                    boxShadow: '0 12px 40px rgba(0,0,0,.12)', border: '1px solid #e2e8f0',
                    zIndex: 20, width: 260, animation: 'plSlideUp .12s',
                    textTransform: 'none', letterSpacing: 0,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0C2D40', marginBottom: 10, textTransform: 'none', letterSpacing: 0 }}>
                      Estados del onboarding
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { label: 'Programado', color: '#f59e0b', bg: 'rgba(245,158,11,.15)', desc: 'Espera fecha de inicio' },
                        { label: 'En curso', color: '#3b82f6', bg: 'rgba(59,130,246,.15)', desc: 'Realizando su onboarding' },
                        { label: 'Atrasado', color: '#ef4444', bg: 'rgba(239,68,68,.15)', desc: 'Tiene tareas vencidas' },
                        { label: 'En riesgo', color: '#dc2626', bg: 'rgba(220,38,38,.15)', desc: '+3 días sin actividad' },
                        { label: 'Pausado', color: '#94a3b8', bg: 'rgba(148,163,184,.15)', desc: 'Suspendido temporalmente' },
                        { label: 'Completado', color: '#10DC97', bg: 'rgba(16,220,151,.15)', desc: 'Finalizó todas las tareas' },
                      ].map(s => (
                        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                            background: s.bg, color: s.color, whiteSpace: 'nowrap', minWidth: 76, textAlign: 'center',
                          }}>{s.label}</span>
                          <span style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.3 }}>{s.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </th>
              <th>Inicio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(a => (
              <tr key={a.id} className={a.status === 'completado' ? 'as-row-done' : ''}>
                <td>
                  <div className="as-person">
                    <div className="as-avatar">
                      <img
                        src={`https://i.pravatar.cc/40?u=${encodeURIComponent(a.nombre)}`}
                        alt={a.nombre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={e => { e.currentTarget.style.display = 'none' }}
                      />
                    </div>
                    <div>
                      <div className="as-name">{a.nombre}</div>
                      <div className="as-area">{a.area}</div>
                    </div>
                  </div>
                </td>
                <td><span className="as-ruta">{a.ruta}</span></td>
                <td>
                  <div className="pr-progress">
                    <div className="pr-pct">{a.pct}%</div>
                    <div className="pr-bar">
                      <div className="pr-fill" style={{ width: `${a.pct}%`, background: barColor(a.status, a.pct) }} />
                    </div>
                  </div>
                </td>
                <td><span className="as-dia">{a.dia} / {a.totalDias}</span></td>
                <td>
                  <span className={`as-status ${statusCls[a.status]}`}>
                    {statusLabels[a.status]}
                  </span>
                </td>
                <td><span className="as-fecha">{a.fechaInicio}</span></td>
                <td>
                  <div className="as-actions-cell">
                    <button className="as-btn-eye" title="Ver detalle">
                      <Eye size={14} />
                    </button>
                    <div className="as-menu-wrap">
                      <button
                        className="as-btn-more"
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === a.id ? null : a.id) }}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      {menuOpen === a.id && (
                        <div className="as-menu" onClick={e => e.stopPropagation()}>
                          <button className="as-menu-item" onClick={() => handlePausar(a.id)}>
                            {a.status === 'pausado' ? <Play size={13} /> : <Pause size={13} />}
                            {a.status === 'pausado' ? 'Reanudar' : 'Pausar'}
                          </button>
                          <button className="as-menu-item as-menu-del" onClick={() => confirmDelete(a)}>
                            <Trash2 size={13} />
                            Desasignar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <div style={{ padding: '12px 16px 16px' }}>
            <div style={{
              borderRadius: 12, border: '1.5px dashed #e2e8f0',
              background: '#fafbfc', padding: '20px',
              display: 'flex', alignItems: 'center', gap: 20,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Users size={22} style={{ color: '#94a3b8' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40', marginBottom: 4 }}>
                  {asignaciones.length === 0 ? 'No hay asignaciones aún' : 'No se encontraron asignaciones'}
                </div>
                <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.55, margin: '0 0 12px' }}>
                  {asignaciones.length === 0
                    ? (plantillasDisponibles.length === 0
                        ? 'Primero crea una ruta activa en Rutas y luego asígnala a un colaborador.'
                        : 'Asigna una ruta de onboarding a cada nuevo colaborador para que comience su proceso.')
                    : 'Intenta con otro término de búsqueda o ajusta los filtros.'}
                </p>
                {asignaciones.length === 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['👤 Por colaborador', '🗺️ Ruta asignada', '📊 Seguimiento de avance'].map(tag => (
                      <span key={tag} style={{
                        fontSize: 10, fontWeight: 600, color: '#475569',
                        background: '#f1f5f9', border: '1px solid #e2e8f0',
                        padding: '3px 10px', borderRadius: 20,
                      }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              {asignaciones.length === 0 && !isAreaRole && (
                plantillasDisponibles.length > 0 ? (
                  <button onClick={() => setModal(true)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '10px 18px', borderRadius: 10, border: 'none',
                    background: '#0C2D40', color: '#fff', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                    flexShrink: 0, whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(12,45,64,.2)',
                  }}>
                    <UserPlus size={13} /> Asignar primera ruta
                  </button>
                ) : (
                  <button onClick={() => navigate('/onboarding/plantillas')} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '10px 18px', borderRadius: 10, border: 'none',
                    background: '#0C2D40', color: '#fff', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                    flexShrink: 0, whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(12,45,64,.2)',
                  }}>
                    <Route size={13} /> Crear primera ruta
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderTop: '1px solid #f1f5f9',
          }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} de {filtered.length} asignaciones
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

      <div style={{ height: '8px' }} />

      {/* MODAL ASIGNAR */}
      {modal && (
        <AsignarRutaModal
          onClose={() => setModal(false)}
          onConfirm={handleAsignar}
        />
      )}

      {/* MODAL DESASIGNAR */}
      {deleteTarget && (
        <div className="pl-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="pl-modal-body" style={{ textAlign: 'center', padding: '32px 28px 20px' }}>
              <div className="pl-del-icon">
                <AlertTriangle size={28} />
              </div>
              <h2 className="pl-del-title">Desasignar ruta</h2>
              <p className="pl-del-desc">
                ¿Desasignar a <strong>{deleteTarget.nombre}</strong> de <strong>{deleteTarget.ruta}</strong>? Se perderá el progreso actual.
              </p>
            </div>
            <div className="pl-modal-footer" style={{ justifyContent: 'center' }}>
              <button className="pl-btn-cancel" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className="pl-btn-delete" onClick={handleDelete}>Desasignar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
