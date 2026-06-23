import { useState } from 'react'
import { useUser } from '../../context/UserContext'
import {
  Search, Plus, UserPlus, X, AlertTriangle, Eye,
  ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Pause, Play, Trash2, HelpCircle, Filter, CheckCircle2
} from 'lucide-react'

const plantillasDisponibles = [
  'Onboarding Ventas — Pasante',
  'Onboarding Comercial — Ejecutivo',
  'Onboarding Liderazgo',
  'Onboarding Operaciones',
  'Onboarding Tech — Backend',
  'Onboarding Finanzas',
  'Onboarding Diseño & UX',
  'Onboarding RRHH — Generalista',
  'Onboarding Marketing Digital',
]

const colaboradoresDisponibles = [
  'Luciana Paredes', 'Tomás Ibáñez', 'Renata Soria', 'Emilio Castañeda',
  'Gabriela Mora', 'Andrés Villanueva', 'Natalia Guzmán', 'Sebastián Rojas',
]

const asignacionesInit = [
  { id: 1, nombre: 'Diego Morales', area: 'Tecnología', ruta: 'Onboarding Tech — Backend', dia: 14, totalDias: 30, pct: 68, status: 'en-curso', fechaInicio: '03 Jun 2026', color: '#3b82f6' },
  { id: 2, nombre: 'Camila Herrera', area: 'Ventas', ruta: 'Onboarding Ventas — Pasante', dia: 18, totalDias: 30, pct: 42, status: 'en-curso', fechaInicio: '30 May 2026', color: '#f97316' },
  { id: 3, nombre: 'Valentina Cruz', area: 'Diseño', ruta: 'Onboarding Diseño & UX', dia: 20, totalDias: 30, pct: 25, status: 'atrasado', fechaInicio: '28 May 2026', color: '#ec4899' },
  { id: 4, nombre: 'Facundo Medina', area: 'Tecnología', ruta: 'Onboarding Tech — Backend', dia: 21, totalDias: 30, pct: 15, status: 'en-riesgo', fechaInicio: '27 May 2026', color: '#ef4444' },
  { id: 5, nombre: 'Sofía Ramírez', area: 'Ventas', ruta: 'Onboarding Ventas — Pasante', dia: 1, totalDias: 30, pct: 0, status: 'pendiente', fechaInicio: '17 Jun 2026', color: '#f59e0b' },
  { id: 6, nombre: 'Martín Solano', area: 'Tecnología', ruta: 'Onboarding Tech — Backend', dia: 30, totalDias: 30, pct: 100, status: 'completado', fechaInicio: '18 May 2026', color: '#10b981' },
  { id: 7, nombre: 'Isabella Vargas', area: 'Comercial', ruta: 'Onboarding Comercial — Ejecutivo', dia: 10, totalDias: 30, pct: 55, status: 'en-curso', fechaInicio: '07 Jun 2026', color: '#8b5cf6' },
  { id: 8, nombre: 'Nicolás Paredes', area: 'Ventas', ruta: 'Onboarding Ventas — Pasante', dia: 24, totalDias: 30, pct: 73, status: 'en-curso', fechaInicio: '24 May 2026', color: '#0d9488' },
  { id: 9, nombre: 'Andrea Ríos', area: 'Operaciones', ruta: 'Onboarding Operaciones', dia: 8, totalDias: 30, pct: 35, status: 'en-curso', fechaInicio: '09 Jun 2026', color: '#06b6d4' },
  { id: 10, nombre: 'Rodrigo Peña', area: 'Dirección', ruta: 'Onboarding Liderazgo', dia: 28, totalDias: 30, pct: 90, status: 'en-curso', fechaInicio: '20 May 2026', color: '#d946ef' },
  { id: 11, nombre: 'Paula Mendoza', area: 'Marketing', ruta: 'Onboarding Marketing Digital', dia: 30, totalDias: 30, pct: 100, status: 'completado', fechaInicio: '18 May 2026', color: '#3b82f6' },
  { id: 12, nombre: 'Emilio Castañeda', area: 'Recursos Humanos', ruta: 'Onboarding RRHH — Generalista', dia: 5, totalDias: 30, pct: 20, status: 'en-curso', fechaInicio: '12 Jun 2026', color: '#f97316' },
  { id: 13, nombre: 'Andrea Núñez', area: 'Marketing', ruta: 'Onboarding Marketing Digital', dia: 16, totalDias: 30, pct: 55, status: 'en-curso', fechaInicio: '01 Jun 2026', color: '#06b6d4' },
  { id: 14, nombre: 'Isabella Mendoza', area: 'Marketing', ruta: 'Onboarding Marketing Digital', dia: 10, totalDias: 30, pct: 32, status: 'en-curso', fechaInicio: '07 Jun 2026', color: '#7c3aed' },
]

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

function initials(name) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('')
}

function barColor(status, pct) {
  if (status === 'completado') return 'var(--green)'
  if (status === 'atrasado' || status === 'en-riesgo') return 'var(--red)'
  if (pct < 30) return 'var(--yellow)'
  return 'var(--blue)'
}

export default function Asignaciones() {
  const { currentUser } = useUser()
  const isAreaRole = currentUser.role === 'manager' || currentUser.role === 'auxiliar'
  const managerArea = 'Marketing'

  const [asignaciones, setAsignaciones] = useState(
    isAreaRole ? asignacionesInit.filter(a => a.area === managerArea) : asignacionesInit
  )
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [page, setPage] = useState(1)
  const perPage = 8
  const [modal, setModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [showEstadoHelp, setShowEstadoHelp] = useState(false)
  const [showFilterDrop, setShowFilterDrop] = useState(false)

  const [form, setForm] = useState({ colaborador: '', ruta: '', fechaInicio: '' })

  const filtered = asignaciones.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = a.nombre.toLowerCase().includes(q) ||
      a.ruta.toLowerCase().includes(q) ||
      a.area.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'todos' || a.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const totalActivas = asignaciones.filter(a => a.status === 'en-curso').length
  const totalCompletadas = asignaciones.filter(a => a.status === 'completado').length
  const totalPendientes = asignaciones.filter(a => a.status === 'pendiente').length
  const totalAtrasados = asignaciones.filter(a => a.status === 'atrasado' || a.status === 'en-riesgo').length

  function handleAsignar() {
    if (!form.colaborador || !form.ruta) return
    const newId = Math.max(...asignaciones.map(a => a.id)) + 1
    const colores = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#f97316', '#ec4899', '#0d9488', '#d946ef', '#ef4444']
    setAsignaciones([...asignaciones, {
      id: newId,
      nombre: form.colaborador,
      area: 'Sin asignar',
      ruta: form.ruta,
      dia: 0,
      totalDias: 30,
      pct: 0,
      status: 'pendiente',
      fechaInicio: form.fechaInicio || 'Por definir',
      color: colores[newId % colores.length],
    }])
    setModal(false)
    setForm({ colaborador: '', ruta: '', fechaInicio: '' })
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
          {filterStatus !== 'todos' && (
            <div style={{
              height: 32, padding: '0 8px 0 10px', borderRadius: 8,
              background: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 600, color: '#475569',
            }}>
              {statusLabels[filterStatus]}
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
            onClick={() => setShowFilterDrop(!showFilterDrop)}
            style={{
              height: 38, padding: '0 12px', borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              color: '#64748b',
            }}
          >
            <Filter size={14} />
          </button>
          {showFilterDrop && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 4,
              background: '#fff', borderRadius: 10, padding: 4,
              boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid #e2e8f0',
              zIndex: 30, minWidth: 180, animation: 'plSlideUp .12s',
            }}>
              {[
                { key: 'todos', label: 'Todos', color: '#0C2D40' },
                { key: 'en-curso', label: 'En curso', color: '#3b82f6' },
                { key: 'completado', label: 'Completado', color: '#16a34a' },
                { key: 'pendiente', label: 'Programado', color: '#f59e0b' },
                { key: 'atrasado', label: 'Atrasado', color: '#ef4444' },
                { key: 'en-riesgo', label: 'En riesgo', color: '#dc2626' },
                { key: 'pausado', label: 'Pausado', color: '#94a3b8' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => { setFilterStatus(f.key); setPage(1); setShowFilterDrop(false) }}
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
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%', background: f.color, flexShrink: 0,
                    }} />
                  )}
                  <span style={{ flex: 1 }}>{f.label}</span>
                  {filterStatus === f.key && <CheckCircle2 size={13} style={{ color: '#10b981' }} />}
                </button>
              ))}
            </div>
          )}
        </div>
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
                  <HelpCircle
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
                    <div className="as-avatar" style={{ background: a.color }}>{initials(a.nombre)}</div>
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
          <div className="pl-empty">
            <UserPlus size={40} strokeWidth={1.2} />
            <div className="pl-empty-title">No se encontraron asignaciones</div>
            <div className="pl-empty-desc">Intenta con otro término de búsqueda o filtro</div>
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
        <div className="pl-overlay" onClick={() => setModal(false)}>
          <div className="pl-modal" onClick={e => e.stopPropagation()}>
            <div className="pl-modal-header">
              <h2>Asignar ruta de onboarding</h2>
              <button className="pl-modal-close" onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="pl-modal-body">
              <label className="pl-label">
                Colaborador
                <select
                  className="pl-input"
                  value={form.colaborador}
                  onChange={e => setForm({ ...form, colaborador: e.target.value })}
                >
                  <option value="">Seleccionar colaborador…</option>
                  {colaboradoresDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>

              <label className="pl-label">
                Ruta de onboarding
                <select
                  className="pl-input"
                  value={form.ruta}
                  onChange={e => setForm({ ...form, ruta: e.target.value })}
                >
                  <option value="">Seleccionar ruta…</option>
                  {plantillasDisponibles.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>

              <label className="pl-label">
                Fecha de inicio
                <input
                  type="date"
                  className="pl-input"
                  value={form.fechaInicio}
                  onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
                />
              </label>
            </div>

            <div className="pl-modal-footer">
              <button className="pl-btn-cancel" onClick={() => setModal(false)}>Cancelar</button>
              <button
                className="pl-btn-save"
                onClick={handleAsignar}
                disabled={!form.colaborador || !form.ruta}
              >
                Asignar ruta
              </button>
            </div>
          </div>
        </div>
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
