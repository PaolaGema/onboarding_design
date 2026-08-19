import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import {
  Search, UserPlus, X, AlertTriangle, Eye, Users,
  ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, MoreVertical, Pause, Play, UserMinus, Info, Check,
  Send, UserCheck, LayoutGrid, List
} from 'lucide-react'
import AsignarRutaModal from '../../components/onboarding/AsignarRutaModal'
import AsignarBuddyModal from '../../components/onboarding/AsignarBuddyModal'
import EnviarRecordatorioModal from '../../components/onboarding/EnviarRecordatorioModal'
import PausarOnboardingModal from '../../components/onboarding/PausarOnboardingModal'
import { statusLabels, statusCls, barColor } from '../../utils/estadoAsignacion'
import { duracionEnDias } from '../../utils/duracionRuta'
import OnboardingCard from '../../components/onboarding/OnboardingCard'
import EmptyState from '../../components/layout/EmptyState'
import ConfirmarAccionModal from '../../components/layout/ConfirmarAccionModal'

const tiposRuta = ['Onboarding', 'Reboarding']

// Alto aproximado del menú de acciones (6 opciones): sirve para decidir si abre hacia
// abajo o hacia arriba antes de que exista en el DOM y se pueda medir.
const ALTO_MENU_ACCIONES = 250
const MARGEN_MENU_ACCIONES = 24

export default function Asignaciones() {
  const navigate = useNavigate()
  const { currentUser } = useUser()
  const isAreaRole = currentUser.role === 'manager' || currentUser.role === 'auxiliar'
  // El área sale del usuario: los roles de alcance acotado (líder, auxiliar) la traen consigo.
  const managerArea = currentUser.area

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
  const [filterArea, setFilterArea] = useState('todas')
  const [filterCargo, setFilterCargo] = useState('todos')
  /* Mismo interruptor que Rutas y Recursos: 'list' primero, 'grid' después.
     El default va por rol y no por gusto: RH compara cientos de filas por los mismos campos
     y necesita la tabla; un líder tiene 5-15 personas y ahí la tabla estorba más de lo que ayuda. */
  const [viewMode, setViewMode] = useState(isAreaRole ? 'grid' : 'list')
  const [afDropStatus, setAfDropStatus] = useState(false)
  const [afDropTipo, setAfDropTipo] = useState(false)
  // Tipo y Estado se filtran desde las cabeceras de la tabla; en tarjetas no hay cabeceras,
  // así que los mismos filtros se ofrecen en la barra de arriba.
  const [afDropTipoCard, setAfDropTipoCard] = useState(false)
  const [afDropStatusCard, setAfDropStatusCard] = useState(false)
  const [afDropArea, setAfDropArea] = useState(false)
  const [afDropCargo, setAfDropCargo] = useState(false)
  const [statusHeaderPos, setStatusHeaderPos] = useState(null)
  const [tipoHeaderPos, setTipoHeaderPos] = useState(null)
  const [page, setPage] = useState(1)
  const perPage = 8
  const [modal, setModal] = useState(false)
  const [desasignarTarget, setDesasignarTarget] = useState(null)
  const [pausarTarget, setPausarTarget] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [showEstadoHelp, setShowEstadoHelp] = useState(false)
  const [recordatorio, setRecordatorio] = useState(null)
  const [menuPos, setMenuPos] = useState(null)
  const [buddyModal, setBuddyModal] = useState(null)
  const [desasignarBuddyTarget, setDesasignarBuddyTarget] = useState(null)

  const hasAsigFilters = filterStatus !== 'todos' || filterTipo !== 'todos' || filterArea !== 'todas' || filterCargo !== 'todos'
  function clearAsigFilters() { setFilterStatus('todos'); setFilterTipo('todos'); setFilterArea('todas'); setFilterCargo('todos') }

  const cargosDeArea = [...new Set(asignaciones.filter(a => filterArea === 'todas' || a.area === filterArea).map(a => a.cargo).filter(Boolean))]

  useEffect(() => {
    function closeDrops(e) {
      if (!e.target.closest('[data-th-filter]')) {
        setAfDropStatus(false); setAfDropTipo(false); setAfDropArea(false); setAfDropCargo(false)
        setAfDropTipoCard(false); setAfDropStatusCard(false)
      }
    }
    document.addEventListener('mousedown', closeDrops)
    return () => document.removeEventListener('mousedown', closeDrops)
  }, [])

  const filtered = asignaciones.filter(a => {
    const q = search.toLowerCase()
    const matchArea = filterArea === 'todas' || a.area === filterArea
    const matchCargo = filterCargo === 'todos' || a.cargo === filterCargo
    const matchSearch = a.nombre.toLowerCase().includes(q) ||
      a.ruta.toLowerCase().includes(q) ||
      a.area.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'todos' || a.status === filterStatus
    const matchTipo = filterTipo === 'todos' || tipoDeRuta(a.ruta) === filterTipo
    return matchSearch && matchStatus && matchTipo && matchArea && matchCargo
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
      cargo: c.cargo || '',
      ruta: ruta.name,
      rutaId: ruta.id,
      version: ruta.versionActual || 1,
      etapasData: JSON.parse(JSON.stringify(ruta.etapasData || [])),
      dia: 0,
      // Lo que dura la ruta de verdad; 30 solo si la ruta todavía no tiene etapas.
      totalDias: duracionEnDias(ruta.etapasData) || 30,
      pct: 0,
      status: 'pendiente',
      fechaInicio: fecha || 'Por definir',
      color: c.color || '#3b82f6',
    }))
    setAsignaciones([...asignaciones, ...newItems])
    colabs.forEach(c => addFeedEntry(`${c.name} fue asignado/a a ${ruta.name}`))
    setModal(false)
  }

  function openRecordatorio(a) {
    setRecordatorio(a)
    setMenuOpen(null)
  }

  // La ficha completa de la persona es una pantalla aparte: el recorrido, sus respuestas y
  // las acciones de acompañamiento no entran en un modal sobre la tabla.
  function verDetalles(a) {
    navigate(`/onboarding/asignaciones/${a.id}`)
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

  function handleAsignarBuddy(candidato) {
    setAsignaciones(asignaciones.map(a =>
      a.id === buddyModal.id ? { ...a, buddy: { name: candidato.name, initials: candidato.initials, color: candidato.color } } : a
    ))
    addFeedEntry(`${candidato.name} fue asignado/a como buddy de ${buddyModal.nombre}`)
    setBuddyModal(null)
  }

  function confirmDesasignarBuddy(a) {
    setDesasignarBuddyTarget(a)
    setMenuOpen(null)
  }

  function handleDesasignarBuddy() {
    setAsignaciones(asignaciones.map(a =>
      a.id === desasignarBuddyTarget.id ? { ...a, buddy: null } : a
    ))
    setDesasignarBuddyTarget(null)
  }

  function confirmDesasignar(a) {
    setDesasignarTarget(a)
    setMenuOpen(null)
  }

  function handleDesasignar() {
    setAsignaciones(asignaciones.filter(a => a.id !== desasignarTarget.id))
    setDesasignarTarget(null)
  }

  /* Las acciones son las mismas se vea tabla o tarjetas: si se agrega una, tiene que
     aparecer en ambas vistas o una queda coja. Por eso el menú se escribe una sola vez.
     En tabla los puntos van horizontales, que es lo que se espera al final de una fila;
     en tarjeta van verticales porque el botón se apoya en el borde derecho de la ficha. */
  const accionesMenu = (a, vertical = false) => (
    <div className="as-menu-wrap">
      <button
        className="as-btn-more"
        onClick={(e) => {
          e.stopPropagation()
          if (menuOpen === a.id) { setMenuOpen(null); return }
          const rect = e.currentTarget.getBoundingClientRect()
          /* Abrir siempre hacia abajo corta el menú cuando el botón cae cerca del borde
             inferior (últimas filas de la tabla, tarjetas del final de la grilla). Si no
             cabe debajo y arriba hay más sitio, se ancla por abajo y crece hacia arriba. */
          const espacioAbajo = window.innerHeight - rect.bottom
          const haciaArriba = espacioAbajo < ALTO_MENU_ACCIONES && rect.top > espacioAbajo
          setMenuPos({
            top: haciaArriba ? undefined : rect.bottom + 4,
            bottom: haciaArriba ? window.innerHeight - rect.top + 4 : undefined,
            right: window.innerWidth - rect.right,
          })
          setMenuOpen(a.id)
        }}
      >
        {vertical ? <MoreVertical size={14} /> : <MoreHorizontal size={14} />}
      </button>
      {menuOpen === a.id && menuPos && (
        <div
          className="as-menu"
          style={{
            position: 'fixed', top: menuPos.top, bottom: menuPos.bottom, right: menuPos.right,
            // Red de seguridad: si aun así no cabe, que haga scroll en vez de cortarse.
            maxHeight: `calc(100vh - ${MARGEN_MENU_ACCIONES}px)`, overflowY: 'auto',
          }}
          onClick={e => e.stopPropagation()}
        >
          <button className="as-menu-item" onClick={() => { verDetalles(a); setMenuOpen(null) }}>
            <Eye size={13} />
            Ver detalles
          </button>
          <button className="as-menu-item" onClick={() => { setBuddyModal(a); setMenuOpen(null) }}>
            <UserCheck size={13} />
            {a.buddy ? 'Cambiar buddy' : 'Asignar buddy'}
          </button>
          {a.buddy && (
            <button className="as-menu-item as-menu-del" onClick={() => confirmDesasignarBuddy(a)}>
              <X size={13} />
              Desasignar buddy
            </button>
          )}
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
          {/* Dice de qué se desasigna. Compartía menú con "Desasignar buddy" y las dos
              empezaban igual, así que se elegía por la posición y no por lo que dicen.
              Tampoco lleva el bote de basura: no borra a la persona, le quita la ruta. */}
          <button className="as-menu-item as-menu-del" onClick={() => confirmDesasignar(a)}>
            <UserMinus size={13} />
            Desasignar ruta de onboarding
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="content-scroll" onClick={() => setMenuOpen(null)}>

      {/* HERO */}
      <div className="pl-header">
        <div>
          <h1 className="pl-title">{isAreaRole ? `Seguimiento — ${managerArea}` : 'Seguimiento'}</h1>
          <p className="pl-subtitle">{isAreaRole ? 'Onboardings de tu equipo' : 'Gestiona los onboardings asignados a colaboradores'}</p>
        </div>
      </div>

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

        {/* ÁREA */}
        <div className="pl-dropdown-wrap" style={{ width: 'auto' }} data-th-filter>
          <button type="button" className={`pl-dropdown-trigger${afDropArea ? ' open' : ''}${filterArea === 'todas' ? ' placeholder' : ''}`} style={{ width: 'auto', height: 34, fontSize: 11, padding: '0 10px', justifyContent: 'flex-start', gap: 6 }} onClick={e => { e.stopPropagation(); setAfDropArea(!afDropArea); setAfDropCargo(false) }}>
            <span style={{ whiteSpace: 'nowrap' }}>{filterArea === 'todas' ? 'Todas las áreas' : filterArea}</span>
            <ChevronDown size={12} className="pl-dropdown-chevron" style={{ flexShrink: 0 }} />
          </button>
          {afDropArea && (
            <div className="pl-dropdown-menu" style={{ minWidth: 160, maxHeight: 220, overflowY: 'auto' }}>
              {['todas', ...new Set(asignaciones.map(a => a.area).filter(Boolean))].map(a => (
                <button key={a} type="button" className={`pl-dropdown-item${filterArea === a ? ' selected' : ''}`} style={{ fontSize: 11.5, padding: '6px 9px' }} onClick={() => { setFilterArea(a); setFilterCargo('todos'); setAfDropArea(false); setPage(1) }}>
                  <span>{a === 'todas' ? 'Todas las áreas' : a}</span>
                  {filterArea === a && <Check size={13} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CARGO */}
        <div className="pl-dropdown-wrap" style={{ width: 'auto' }} data-th-filter>
          <button type="button" className={`pl-dropdown-trigger${afDropCargo ? ' open' : ''}${filterCargo === 'todos' ? ' placeholder' : ''}`} style={{ width: 'auto', height: 34, fontSize: 11, padding: '0 10px', justifyContent: 'flex-start', gap: 6 }} onClick={e => { e.stopPropagation(); setAfDropCargo(!afDropCargo); setAfDropArea(false) }}>
            <span style={{ whiteSpace: 'nowrap' }}>{filterCargo === 'todos' ? 'Todos los cargos' : filterCargo}</span>
            <ChevronDown size={12} className="pl-dropdown-chevron" style={{ flexShrink: 0 }} />
          </button>
          {afDropCargo && (
            <div className="pl-dropdown-menu" style={{ minWidth: 160, maxHeight: 220, overflowY: 'auto' }}>
              {['todos', ...cargosDeArea].map(c => (
                <button key={c} type="button" className={`pl-dropdown-item${filterCargo === c ? ' selected' : ''}`} style={{ fontSize: 11.5, padding: '6px 9px' }} onClick={() => { setFilterCargo(c); setAfDropCargo(false); setPage(1) }}>
                  <span>{c === 'todos' ? 'Todos los cargos' : c}</span>
                  {filterCargo === c && <Check size={13} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TIPO y ESTADO — solo en tarjetas: en tabla viven en las cabeceras de columna */}
        {viewMode === 'grid' && (
          <div className="pl-dropdown-wrap" style={{ width: 'auto' }} data-th-filter>
            <button type="button" className={`pl-dropdown-trigger${afDropTipoCard ? ' open' : ''}${filterTipo === 'todos' ? ' placeholder' : ''}`} style={{ width: 'auto', height: 34, fontSize: 11, padding: '0 10px', justifyContent: 'flex-start', gap: 6 }} onClick={e => { e.stopPropagation(); setAfDropTipoCard(!afDropTipoCard); setAfDropStatusCard(false) }}>
              <span style={{ whiteSpace: 'nowrap' }}>{filterTipo === 'todos' ? 'Todos los tipos' : filterTipo}</span>
              <ChevronDown size={12} className="pl-dropdown-chevron" style={{ flexShrink: 0 }} />
            </button>
            {afDropTipoCard && (
              <div className="pl-dropdown-menu" style={{ minWidth: 160 }}>
                {['todos', ...tiposRuta].map(t => (
                  <button key={t} type="button" className={`pl-dropdown-item${filterTipo === t ? ' selected' : ''}`} style={{ fontSize: 11.5, padding: '6px 9px' }} onClick={() => { setFilterTipo(t); setAfDropTipoCard(false); setPage(1) }}>
                    <span>{t === 'todos' ? 'Todos los tipos' : t}</span>
                    {filterTipo === t && <Check size={13} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="pl-dropdown-wrap" style={{ width: 'auto' }} data-th-filter>
            <button type="button" className={`pl-dropdown-trigger${afDropStatusCard ? ' open' : ''}${filterStatus === 'todos' ? ' placeholder' : ''}`} style={{ width: 'auto', height: 34, fontSize: 11, padding: '0 10px', justifyContent: 'flex-start', gap: 6 }} onClick={e => { e.stopPropagation(); setAfDropStatusCard(!afDropStatusCard); setAfDropTipoCard(false) }}>
              <span style={{ whiteSpace: 'nowrap' }}>{filterStatus === 'todos' ? 'Todos los estados' : statusLabels[filterStatus]}</span>
              <ChevronDown size={12} className="pl-dropdown-chevron" style={{ flexShrink: 0 }} />
            </button>
            {afDropStatusCard && (
              <div className="pl-dropdown-menu" style={{ minWidth: 160 }}>
                {['todos', ...Object.keys(statusLabels)].map(s => (
                  <button key={s} type="button" className={`pl-dropdown-item${filterStatus === s ? ' selected' : ''}`} style={{ fontSize: 11.5, padding: '6px 9px' }} onClick={() => { setFilterStatus(s); setAfDropStatusCard(false); setPage(1) }}>
                    <span>{s === 'todos' ? 'Todos los estados' : statusLabels[s]}</span>
                    {filterStatus === s && <Check size={13} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {hasAsigFilters && (
          <button onClick={() => { clearAsigFilters(); setPage(1) }} style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Limpiar</button>
        )}

        {!isAreaRole && (
          <button className="pl-btn-new" onClick={() => setModal(true)} style={{ padding: '0 14px', height: 34, fontSize: 11.5, marginLeft: 'auto' }}>
            <UserPlus size={14} /> Asignar ruta a colaboradores
          </button>
        )}
        <div style={{ display: 'flex', background: 'var(--surface-hover)', borderRadius: 8, padding: 3, marginLeft: isAreaRole ? 'auto' : 0 }}>
          {[{ key: 'list', icon: List }, { key: 'grid', icon: LayoutGrid }].map(v => {
            const VIcon = v.icon
            return (
              <button
                key={v.key}
                onClick={() => setViewMode(v.key)}
                style={{
                  width: 32, height: 28, borderRadius: 6, border: 'none',
                  background: viewMode === v.key ? '#fff' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: viewMode === v.key ? '#0C2D40' : '#94a3b8',
                  transition: 'all .15s',
                }}
              >
                <VIcon size={14} />
              </button>
            )
          })}
        </div>
      </div>

      {/* TABLA */}
      <div className="as-table-wrap">
        {viewMode === 'list' ? (
        <table className="as-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Ruta asignada</th>
              <th style={{ position: 'relative' }} data-th-filter>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    if (afDropTipo) { setAfDropTipo(false); return }
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTipoHeaderPos({ top: rect.bottom + 6, left: rect.left })
                    setAfDropStatus(false)
                    setAfDropTipo(true)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 3, border: 'none', background: 'none',
                    padding: 0, cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
                    color: filterTipo !== 'todos' ? 'var(--navy)' : 'var(--text-muted)',
                  }}
                >
                  Tipo
                  <ChevronDown size={11} style={{ transform: afDropTipo ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }} />
                </button>
                {afDropTipo && tipoHeaderPos && (
                  <div className="pl-dropdown-menu" style={{ position: 'fixed', top: tipoHeaderPos.top, left: tipoHeaderPos.left, right: 'auto', minWidth: 160, textTransform: 'none', letterSpacing: 'normal' }} onClick={e => e.stopPropagation()}>
                    {['todos', ...tiposRuta].map(t => (
                      <button key={t} type="button" className={`pl-dropdown-item${filterTipo === t ? ' selected' : ''}`} style={{ fontSize: 11.5, padding: '6px 9px' }} onClick={() => { setFilterTipo(t); setAfDropTipo(false); setPage(1) }}>
                        <span>{t === 'todos' ? 'Todos los tipos' : t}</span>
                        {filterTipo === t && <Check size={13} />}
                      </button>
                    ))}
                  </div>
                )}
              </th>
              <th>Progreso</th>
              <th>Día</th>
              <th style={{ position: 'relative' }} data-th-filter>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      if (afDropStatus) { setAfDropStatus(false); return }
                      const rect = e.currentTarget.getBoundingClientRect()
                      setStatusHeaderPos({ top: rect.bottom + 6, left: rect.left })
                      setAfDropTipo(false)
                      setAfDropStatus(true)
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 3, border: 'none', background: 'none',
                      padding: 0, cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
                      color: filterStatus !== 'todos' ? 'var(--navy)' : 'var(--text-muted)',
                    }}
                  >
                    Estado
                    <ChevronDown size={11} style={{ transform: afDropStatus ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }} />
                  </button>
                  <Info
                    size={12}
                    style={{ color: '#cbd5e1', cursor: 'pointer' }}
                    onMouseEnter={() => setShowEstadoHelp(true)}
                    onMouseLeave={() => setShowEstadoHelp(false)}
                  />
                </span>
                {afDropStatus && statusHeaderPos && (
                  <div className="pl-dropdown-menu" style={{ position: 'fixed', top: statusHeaderPos.top, left: statusHeaderPos.left, right: 'auto', minWidth: 160, textTransform: 'none', letterSpacing: 'normal' }} onClick={e => e.stopPropagation()}>
                    {[{ key: 'todos', label: 'Todos los estados' }, { key: 'en-curso', label: 'En curso' }, { key: 'completado', label: 'Completado' }, { key: 'pendiente', label: 'Programado' }, { key: 'atrasado', label: 'Atrasado' }, { key: 'en-riesgo', label: 'En riesgo' }, { key: 'pausado', label: 'Pausado' }].map(f => (
                      <button key={f.key} type="button" className={`pl-dropdown-item${filterStatus === f.key ? ' selected' : ''}`} style={{ fontSize: 11.5, padding: '6px 9px' }} onClick={() => { setFilterStatus(f.key); setAfDropStatus(false); setPage(1) }}>
                        <span>{f.label}</span>
                        {filterStatus === f.key && <Check size={13} />}
                      </button>
                    ))}
                  </div>
                )}
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
              <th>Buddy</th>
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
                      <button className="as-name as-name-btn" onClick={() => verDetalles(a)}>{a.nombre}</button>
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
                  {a.buddy ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: a.buddy.color || '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: '#fff', fontSize: 8.5, fontWeight: 700 }}>{a.buddy.initials}</span>
                      </div>
                      <span style={{ fontSize: 11.5, color: '#334155', whiteSpace: 'nowrap' }}>{a.buddy.name}</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: '#cbd5e1' }}>Sin asignar</span>
                  )}
                </td>
                <td>
                  <div className="as-actions-cell">{accionesMenu(a)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        ) : paginated.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14, padding: 16 }}>
            {paginated.map(a => (
              <OnboardingCard
                key={a.id}
                nombre={a.nombre}
                cargo={a.cargo}
                area={a.area}
                pct={a.pct}
                barColor={barColor(a.status, a.pct)}
                badge={<span className={`as-status ${statusCls[a.status]}`} style={{ flexShrink: 0 }}>{statusLabels[a.status]}</span>}
                meta={
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {a.ruta} · Día {a.dia}/{a.totalDias}
                  </span>
                }
                onVerDetalles={() => verDetalles(a)}
                acciones={accionesMenu(a, true)}
              />
            ))}
          </div>
        )}

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
              actionLabel={asignaciones.length === 0 && plantillasDisponibles.length > 0 ? 'Asignar ruta a colaboradores' : undefined}
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

      {/* MODAL ASIGNAR BUDDY */}
      {buddyModal && (
        <AsignarBuddyModal
          colaborador={buddyModal}
          onClose={() => setBuddyModal(null)}
          onConfirm={handleAsignarBuddy}
        />
      )}

      {/* MODAL PAUSAR / REANUDAR */}
      {pausarTarget && (
        <PausarOnboardingModal
          asignacion={pausarTarget}
          onClose={() => setPausarTarget(null)}
          onConfirm={handlePausar}
        />
      )}

      {desasignarBuddyTarget && (
        <ConfirmarAccionModal
          titulo="Desasignar buddy"
          descripcion={<>¿Quitar a <strong>{desasignarBuddyTarget.buddy?.name}</strong> como buddy de <strong>{desasignarBuddyTarget.nombre}</strong>?</>}
          palabra="desasignar"
          textoConfirmar="Desasignar"
          onConfirmar={handleDesasignarBuddy}
          onCancelar={() => setDesasignarBuddyTarget(null)}
          icono={AlertTriangle}
        />
      )}

      {desasignarTarget && (
        <ConfirmarAccionModal
          titulo="Desasignar ruta"
          descripcion={<>¿Desasignar a <strong>{desasignarTarget.nombre}</strong> de <strong>{desasignarTarget.ruta}</strong>? Se perderá el progreso actual.</>}
          palabra="desasignar"
          textoConfirmar="Desasignar"
          onConfirmar={handleDesasignar}
          onCancelar={() => setDesasignarTarget(null)}
          icono={AlertTriangle}
        />
      )}

      {recordatorio && (
        <EnviarRecordatorioModal
          asignacion={recordatorio}
          onClose={() => setRecordatorio(null)}
          onEnviar={canal => addFeedEntry(`Recordatorio enviado a ${recordatorio.nombre} por ${canal === 'whatsapp' ? 'WhatsApp' : 'la plataforma'}`)}
        />
      )}
    </div>
  )
}
