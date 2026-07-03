import { useState } from 'react'
import { useUser } from '../../context/UserContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import {
  Search, UserPlus, X, AlertTriangle, Eye, Users,
  ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Pause, Play, Trash2, Info, Filter, CheckCircle2, Check,
  Send, MessageCircle, Bell, Circle,
  Video, Headphones, FileText, HelpCircle, ClipboardList, Upload, UserCheck, MapPin, Smile, PlayCircle, UserRound
} from 'lucide-react'
import AsignarRutaModal from '../../components/onboarding/AsignarRutaModal'
import { rutasData } from './JourneyBuilder'
import PageHero from '../../components/layout/PageHero'
import EmptyState from '../../components/layout/EmptyState'
import imagenSeguimiento from '../../assets/imagenes/imagen_seguimiento.png'

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

const tiposRuta = ['Onboarding', 'Reboarding']

const tareaIconMap = {
  video: Video, audio: Headphones, documento: FileText, quiz: HelpCircle,
  'completar-perfil': ClipboardList, subida: Upload, 'tarea-otro': UserCheck,
  recorrido: MapPin, pulso: Smile,
}

// Estadísticas de reproducción del video — derivadas de forma estable a partir del id de la tarea
function videoStats(taskId, done) {
  const seed = String(taskId).split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  if (done) return { veces: 1 + (seed % 3), completo: true }
  return { veces: seed % 3, completo: false }
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

  const { asignaciones: allAsignaciones, setAsignaciones: setAllAsignaciones, plantillas: allPlantillas, addFeedEntry } = useOnboardingData()
  const asignaciones = isAreaRole ? allAsignaciones.filter(a => a.area === managerArea) : allAsignaciones
  function setAsignaciones(next) {
    if (!isAreaRole) { setAllAsignaciones(next); return }
    const others = allAsignaciones.filter(a => a.area !== managerArea)
    setAllAsignaciones([...others, ...next])
  }
  const plantillasDisponibles = allPlantillas.filter(p => p.status === 'activa').map(p => p.name)
  function tipoDeRuta(rutaName) { return allPlantillas.find(p => p.name === rutaName)?.tipo || 'Onboarding' }
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [afDropStatus, setAfDropStatus] = useState(false)
  const [afDropTipo, setAfDropTipo] = useState(false)
  const [page, setPage] = useState(1)
  const perPage = 8
  const [modal, setModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [pausarTarget, setPausarTarget] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [showEstadoHelp, setShowEstadoHelp] = useState(false)
  const [recordatorio, setRecordatorio] = useState(null)
  const [recCanal, setRecCanal] = useState('whatsapp')
  const [recMensaje, setRecMensaje] = useState('')
  const [recEnviado, setRecEnviado] = useState(false)
  const [menuPos, setMenuPos] = useState(null)
  const [detalle, setDetalle] = useState(null)

  const hasAsigFilters = filterStatus !== 'todos' || filterTipo !== 'todos'
  function clearAsigFilters() { setFilterStatus('todos'); setFilterTipo('todos') }

  const filtered = asignaciones.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = a.nombre.toLowerCase().includes(q) ||
      a.ruta.toLowerCase().includes(q) ||
      a.area.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'todos' || a.status === filterStatus
    const matchTipo = filterTipo === 'todos' || tipoDeRuta(a.ruta) === filterTipo
    return matchSearch && matchStatus && matchTipo
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const totalActivas = asignaciones.filter(a => a.status === 'en-curso').length
  const totalCompletadas = asignaciones.filter(a => a.status === 'completado').length
  const totalPendientes = asignaciones.filter(a => a.status === 'pendiente').length
  const totalAtrasados = asignaciones.filter(a => a.status === 'atrasado' || a.status === 'en-riesgo').length

  function handleAsignar(colabs, ruta, fecha, buddy) {
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
      buddy: buddy?.name || null,
    }))
    setAsignaciones([...asignaciones, ...newItems])
    colabs.forEach(c => addFeedEntry(`${c.name} fue asignado/a a ${ruta.name}${buddy ? ` con ${buddy.name} como buddy` : ''}`))
    setModal(false)
  }

  function defaultMensaje(a) {
    return `Hola ${a.nombre.split(' ')[0]}, notamos que tu onboarding "${a.ruta}" está ${statusLabels[a.status].toLowerCase()} (día ${a.dia}/${a.totalDias}). ¿Necesitas ayuda para ponerte al día? Cualquier duda, escríbenos.`
  }

  function openRecordatorio(a) {
    setRecordatorio(a)
    setRecCanal('whatsapp')
    setRecMensaje(defaultMensaje(a))
    setRecEnviado(false)
    setMenuOpen(null)
  }

  function enviarRecordatorio() {
    addFeedEntry(`Recordatorio enviado a ${recordatorio.nombre} por ${recCanal === 'whatsapp' ? 'WhatsApp' : 'la plataforma'}`)
    setRecEnviado(true)
    setTimeout(() => setRecordatorio(null), 1200)
  }

  function buildDetalleEtapas(a) {
    const fuente = rutasData[1].etapas
    const flat = fuente.flatMap(e => e.actividades.flatMap(act => act.tareas))
    const doneCount = Math.round(flat.length * a.pct / 100)
    let seen = 0
    return fuente.map(etapa => {
      const tareas = etapa.actividades.flatMap(act => act.tareas).map(t => {
        const done = seen < doneCount
        seen += 1
        return { ...t, done }
      })
      return {
        name: etapa.name,
        days: etapa.days,
        tareas,
        doneLocal: tareas.filter(t => t.done).length,
      }
    })
  }

  function confirmPausar(a) {
    setPausarTarget(a)
    setMenuOpen(null)
  }

  function handlePausar() {
    setAsignaciones(asignaciones.map(a =>
      a.id === pausarTarget.id ? { ...a, status: a.status === 'pausado' ? 'en-curso' : 'pausado' } : a
    ))
    setPausarTarget(null)
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

      {/* HERO */}
      <PageHero
        image={imagenSeguimiento}
        title={isAreaRole ? `Seguimiento — ${managerArea}` : 'Seguimiento'}
        description={isAreaRole ? 'Onboardings de tu equipo' : 'Gestiona los onboardings asignados a colaboradores'}
      />

      {/* KPI STRIP */}
      <div className="kpi-strip">
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--blue)' }}>
          <div className="kpi-title" style={{ color: 'var(--blue)' }}>En curso</div>
          <div className="kpi-val">{totalActivas}</div>
          <div className="kpi-lbl">Onboardings activos</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--green)' }}>
          <div className="kpi-title" style={{ color: 'var(--green)' }}>Completados</div>
          <div className="kpi-val">{totalCompletadas}</div>
          <div className="kpi-lbl">Finalizados con éxito</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--yellow)' }}>
          <div className="kpi-title" style={{ color: 'var(--yellow)' }}>Pendientes</div>
          <div className="kpi-val">{totalPendientes}</div>
          <div className="kpi-lbl">Sin iniciar aún</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--red)' }}>
          <div className="kpi-title" style={{ color: 'var(--red)' }}>Atrasados</div>
          <div className="kpi-val">{totalAtrasados}</div>
          <div className="kpi-lbl">Requieren atención</div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="pl-toolbar">
        <div className="pl-search-wrap">
          <Search size={13} className="pl-search-ico" />
          <input
            type="text"
            className="pl-search"
            placeholder="Buscar por nombre, ruta o área…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        {/* TIPO */}
        <div className="pl-dropdown-wrap" style={{ width: 'auto' }}>
          <button type="button" className={`pl-dropdown-trigger${afDropTipo ? ' open' : ''}${filterTipo === 'todos' ? ' placeholder' : ''}`} style={{ width: 'auto', height: 34, fontSize: 11, padding: '0 10px', justifyContent: 'flex-start', gap: 6 }} onClick={() => { setAfDropTipo(!afDropTipo); setAfDropStatus(false) }}>
            <span style={{ whiteSpace: 'nowrap' }}>{filterTipo === 'todos' ? 'Todos los tipos' : filterTipo}</span>
            <ChevronDown size={12} className="pl-dropdown-chevron" style={{ flexShrink: 0 }} />
          </button>
          {afDropTipo && (
            <div className="pl-dropdown-menu" style={{ minWidth: 160 }}>
              {['todos', ...tiposRuta].map(t => (
                <button key={t} type="button" className={`pl-dropdown-item${filterTipo === t ? ' selected' : ''}`} style={{ fontSize: 11.5, padding: '6px 9px' }} onClick={() => { setFilterTipo(t); setAfDropTipo(false); setPage(1) }}>
                  <span>{t === 'todos' ? 'Todos los tipos' : t}</span>
                  {filterTipo === t && <Check size={13} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ESTADO */}
        <div className="pl-dropdown-wrap" style={{ width: 'auto' }}>
          <button type="button" className={`pl-dropdown-trigger${afDropStatus ? ' open' : ''}${filterStatus === 'todos' ? ' placeholder' : ''}`} style={{ width: 'auto', height: 34, fontSize: 11, padding: '0 10px', justifyContent: 'flex-start', gap: 6 }} onClick={() => { setAfDropStatus(!afDropStatus); setAfDropTipo(false) }}>
            <span style={{ whiteSpace: 'nowrap' }}>{filterStatus === 'todos' ? 'Todos los estados' : statusLabels[filterStatus]}</span>
            <ChevronDown size={12} className="pl-dropdown-chevron" style={{ flexShrink: 0 }} />
          </button>
          {afDropStatus && (
            <div className="pl-dropdown-menu" style={{ minWidth: 160 }}>
              {[{ key: 'todos', label: 'Todos los estados' }, { key: 'en-curso', label: 'En curso' }, { key: 'completado', label: 'Completado' }, { key: 'pendiente', label: 'Programado' }, { key: 'atrasado', label: 'Atrasado' }, { key: 'en-riesgo', label: 'En riesgo' }, { key: 'pausado', label: 'Pausado' }].map(f => (
                <button key={f.key} type="button" className={`pl-dropdown-item${filterStatus === f.key ? ' selected' : ''}`} style={{ fontSize: 11.5, padding: '6px 9px' }} onClick={() => { setFilterStatus(f.key); setAfDropStatus(false); setPage(1) }}>
                  <span>{f.label}</span>
                  {filterStatus === f.key && <Check size={13} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {hasAsigFilters && (
          <button onClick={() => { clearAsigFilters(); setPage(1) }} style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Limpiar</button>
        )}

        {!isAreaRole && (
          <button className="pl-btn-new" onClick={() => setModal(true)} style={{ padding: '0 14px', height: 34, fontSize: 11.5, marginLeft: 'auto' }}>
            <UserPlus size={14} /> Asignar ruta
          </button>
        )}
      </div>

      {/* TABLA */}
      <div className="as-table-wrap">
        <table className="as-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Ruta asignada</th>
              <th>Tipo</th>
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
                        { label: 'Completado', color: '#00E091', bg: 'rgba(0,224,145,.15)', desc: 'Finalizó todas las tareas' },
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
                <td><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tipoDeRuta(a.ruta)}</span></td>
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
                    <div className="as-menu-wrap">
                      <button
                        className="as-btn-more"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (menuOpen === a.id) { setMenuOpen(null); return }
                          const rect = e.currentTarget.getBoundingClientRect()
                          setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
                          setMenuOpen(a.id)
                        }}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      {menuOpen === a.id && menuPos && (
                        <div className="as-menu" style={{ position: 'fixed', top: menuPos.top, right: menuPos.right }} onClick={e => e.stopPropagation()}>
                          <button className="as-menu-item" onClick={() => { setDetalle(a); setMenuOpen(null) }}>
                            <Eye size={13} />
                            Ver detalles
                          </button>
                          {(a.status === 'atrasado' || a.status === 'en-riesgo') && (
                            <button className="as-menu-item" onClick={() => openRecordatorio(a)}>
                              <Send size={13} />
                              Enviar recordatorio
                            </button>
                          )}
                          <button className="as-menu-item" onClick={() => confirmPausar(a)}>
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
            <EmptyState
              icon={Users}
              title={asignaciones.length === 0 ? 'No hay asignaciones aún' : 'No se encontraron asignaciones'}
              description={
                asignaciones.length === 0
                  ? (plantillasDisponibles.length === 0
                      ? 'Primero crea una ruta activa en Rutas y luego asígnala a un colaborador.'
                      : 'Asigna una ruta de onboarding a cada nuevo colaborador para que comience su proceso.')
                  : 'Intenta con otro término de búsqueda o ajusta los filtros.'
              }
              actionLabel={asignaciones.length === 0 && plantillasDisponibles.length > 0 ? 'Asignar ruta' : undefined}
              actionIcon={UserPlus}
              onAction={() => setModal(true)}
            />
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
      {pausarTarget && (
        <div className="pl-overlay" onClick={() => setPausarTarget(null)}>
          <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="pl-modal-body" style={{ textAlign: 'center', padding: '32px 28px 20px' }}>
              <div className="pl-del-icon" style={{ background: 'rgba(59,130,246,.1)', color: 'var(--blue)' }}>
                {pausarTarget.status === 'pausado' ? <Play size={26} /> : <Pause size={26} />}
              </div>
              <h2 className="pl-del-title">{pausarTarget.status === 'pausado' ? 'Reanudar onboarding' : 'Pausar onboarding'}</h2>
              <p className="pl-del-desc">
                {pausarTarget.status === 'pausado'
                  ? <>¿Reanudar el onboarding de <strong>{pausarTarget.nombre}</strong>? Continuará desde donde lo dejó.</>
                  : <>¿Pausar el onboarding de <strong>{pausarTarget.nombre}</strong>? Podrás reanudarlo cuando quieras.</>}
              </p>
            </div>
            <div className="pl-modal-footer" style={{ justifyContent: 'center' }}>
              <button className="pl-btn-cancel" onClick={() => setPausarTarget(null)}>Cancelar</button>
              <button className="pl-btn-save" onClick={handlePausar}>
                {pausarTarget.status === 'pausado' ? 'Reanudar' : 'Pausar'}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* MODAL ENVIAR RECORDATORIO */}
      {recordatorio && (
        <div className="pl-overlay" onClick={() => setRecordatorio(null)}>
          <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="pl-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={16} style={{ color: '#fff' }} />
                </div>
                <h2>Enviar recordatorio</h2>
              </div>
              <button className="pl-modal-close" onClick={() => setRecordatorio(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="pl-modal-body">
              {recEnviado ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 0' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={24} style={{ color: 'var(--green)' }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40' }}>Recordatorio enviado</div>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 14px' }}>
                    Para <strong style={{ color: '#0C2D40' }}>{recordatorio.nombre}</strong> — {recordatorio.ruta}
                  </p>
                  <div className="pl-label">
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Canal</span>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      {[
                        { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
                        { key: 'plataforma', label: 'Notificación en plataforma', icon: Bell, color: '#3b82f6' },
                      ].map(c => (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => setRecCanal(c.key)}
                          style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            padding: '10px 12px', borderRadius: 10,
                            border: `1.5px solid ${recCanal === c.key ? c.color : '#e2e8f0'}`,
                            background: recCanal === c.key ? `${c.color}0f` : '#fff',
                            cursor: 'pointer', fontFamily: 'inherit', transition: 'all .12s',
                          }}
                        >
                          <c.icon size={16} style={{ color: recCanal === c.key ? c.color : '#94a3b8' }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: recCanal === c.key ? c.color : '#64748b' }}>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="pl-label" style={{ marginTop: 14 }}>
                    Mensaje
                    <textarea
                      className="pl-input"
                      rows={4}
                      value={recMensaje}
                      onChange={e => setRecMensaje(e.target.value)}
                      style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                    />
                  </label>
                </>
              )}
            </div>
            {!recEnviado && (
              <div className="pl-modal-footer">
                <button className="pl-btn-cancel" onClick={() => setRecordatorio(null)}>Cancelar</button>
                <button
                  className="pl-btn-save"
                  disabled={!recMensaje.trim()}
                  onClick={enviarRecordatorio}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Send size={13} />
                  Enviar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL VER DETALLE */}
      {detalle && (() => {
        const etapasDetalle = buildDetalleEtapas(detalle)
        return (
          <div className="pl-overlay" onClick={() => setDetalle(null)}>
            <div className="pl-modal" style={{ maxWidth: 520, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: detalle.color || '#0C2D40', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff',
                  }}>
                    {detalle.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ margin: 0 }}>{detalle.nombre}</h2>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{detalle.ruta} — {detalle.area}</div>
                  </div>
                </div>
                <button className="pl-modal-close" onClick={() => setDetalle(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="pl-modal-body" style={{ overflowY: 'auto', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                  <span className={`as-status ${statusCls[detalle.status]}`}>{statusLabels[detalle.status]}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Día {detalle.dia} / {detalle.totalDias}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>· Inicio {detalle.fechaInicio}</span>
                  {detalle.buddy && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#0C2D40', background: '#f1f5f9', padding: '3px 9px', borderRadius: 20 }}>
                      <UserRound size={11} /> Buddy: {detalle.buddy}
                    </span>
                  )}
                </div>
                <div className="pr-progress" style={{ marginBottom: 20 }}>
                  <div className="pr-pct">{detalle.pct}%</div>
                  <div className="pr-bar">
                    <div className="pr-fill" style={{ width: `${detalle.pct}%`, background: barColor(detalle.status, detalle.pct) }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {etapasDetalle.map((etapa, i) => (
                    <div key={i} style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40' }}>{etapa.name}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>{etapa.days}</div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b' }}>{etapa.doneLocal}/{etapa.tareas.length} completadas</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {etapa.tareas.map(t => {
                          const TIcon = tareaIconMap[t.tipo]
                          const vs = t.tipo === 'video' ? videoStats(t.id, t.done) : null
                          return (
                            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {t.done
                                ? <CheckCircle2 size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
                                : <Circle size={14} style={{ color: '#cbd5e1', flexShrink: 0 }} />}
                              {TIcon && <TIcon size={12} style={{ color: '#94a3b8', flexShrink: 0 }} />}
                              <span style={{ fontSize: 12, color: t.done ? '#0C2D40' : '#94a3b8', flex: 1 }}>{t.name}</span>
                              {vs && (
                                <span style={{
                                  display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600,
                                  padding: '2px 7px', borderRadius: 20, flexShrink: 0,
                                  background: vs.completo ? '#f0fdf4' : vs.veces > 0 ? '#fef3c7' : '#f1f5f9',
                                  color: vs.completo ? '#16a34a' : vs.veces > 0 ? '#b45309' : '#94a3b8',
                                }}>
                                  <PlayCircle size={10} />
                                  {vs.veces === 0 ? 'No visto' : `Visto ${vs.veces} ${vs.veces === 1 ? 'vez' : 'veces'}${vs.completo ? ' · completo' : ' · incompleto'}`}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pl-modal-footer">
                <button className="pl-btn-cancel" onClick={() => setDetalle(null)}>Cerrar</button>
                {(detalle.status === 'atrasado' || detalle.status === 'en-riesgo') && (
                  <button
                    className="pl-btn-save"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={() => { const a = detalle; setDetalle(null); openRecordatorio(a) }}
                  >
                    <Send size={13} />
                    Enviar recordatorio
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
