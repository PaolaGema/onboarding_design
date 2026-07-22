import { useState, useEffect } from 'react'
import { useUser } from '../../context/UserContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import {
  Search, UserPlus, X, AlertTriangle, Eye, Users,
  ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, MoreVertical, Pause, Play, Trash2, Info, CheckCircle2, Check,
  Send, MessageCircle, Bell,
  Video, Headphones, FileText, HelpCircle, ClipboardList, Upload, UserCheck, MapPin, Smile, PlayCircle,
  BookOpen, Link2, Award, LayoutGrid, List
} from 'lucide-react'
import AsignarRutaModal from '../../components/onboarding/AsignarRutaModal'
import AsignarBuddyModal from '../../components/onboarding/AsignarBuddyModal'
import { buildDetalleEtapas as construirEtapas } from '../../utils/detalleEtapas'
import ColaboradorCard from '../../components/onboarding/ColaboradorCard'
import EmptyState from '../../components/layout/EmptyState'
import ConfirmarAccionModal from '../../components/layout/ConfirmarAccionModal'

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

// Alto aproximado del menú de acciones (6 opciones): sirve para decidir si abre hacia
// abajo o hacia arriba antes de que exista en el DOM y se pueda medir.
const ALTO_MENU_ACCIONES = 250
const MARGEN_MENU_ACCIONES = 24

const tareaIconMap = {
  video: Video, audio: Headphones, documento: FileText, quiz: HelpCircle,
  'completar-perfil': ClipboardList, 'form-custom': ClipboardList, subida: Upload,
  'tarea-otro': UserCheck, recorrido: MapPin, pulso: Smile,
  lectura: BookOpen, enlace: Link2, confirmacion: Award,
}
// Respaldo para cualquier tipo no mapeado: mejor un icono genérico que un nodo en blanco.
const TAREA_ICON_FALLBACK = FileText

// Estadísticas de reproducción del video — derivadas de forma estable a partir del id de la tarea
function videoStats(taskId, done) {
  const seed = String(taskId).split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  if (done) return { veces: 1 + (seed % 3), completo: true }
  return { veces: seed % 3, completo: false }
}

/* PROTOTIPO — respuestas del colaborador.
   Hoy las respuestas reales no se guardan: viven en el estado local de la vista del
   colaborador (MiOnboarding) y se pierden al salir. Hasta que se persistan en la
   asignación, esta vista las simula de forma DETERMINISTA (misma persona + tarea →
   mismas respuestas), con la misma semilla por suma de char-codes que videoStats, para
   que RH pueda validar cómo se verá el panel. Si la tarea trae preguntas propias
   (quizPreguntas/formCampos, creadas en el builder) se usan esas; si no, un banco genérico. */
const QUIZ_BANCO = [
  { q: '¿Cuál es uno de los valores centrales de la empresa?', opts: ['Transparencia', 'Individualismo', 'Jerarquía estricta'], correcta: 0 },
  { q: '¿A quién acudes ante una duda sobre tu rol?', opts: ['A un cliente', 'A tu buddy o líder', 'A nadie'], correcta: 1 },
  { q: '¿Dónde encuentras el manual de tu cargo?', opts: ['En Recursos corporativos', 'En redes sociales', 'No existe'], correcta: 0 },
  { q: '¿Qué debes completar en tu primera semana?', opts: ['La evaluación final', 'Tu perfil y la bienvenida', 'Un reporte anual'], correcta: 1 },
  { q: '¿Cada cuánto es el check-in con tu líder?', opts: ['Nunca', 'Solo el primer día', 'De forma quincenal'], correcta: 2 },
]
const FORM_BANCO = [
  { q: '¿Cómo te has sentido en tu primera semana?', a: ['Muy acompañado/a, el equipo fue muy abierto.', 'Bien en general, con algunas dudas al inicio.', 'Algo perdido/a los primeros días, luego mejor.'] },
  { q: '¿Qué tema te gustaría reforzar?', a: ['Las herramientas internas del área.', 'El proceso de aprobación de contenido.', 'Conocer mejor a las otras áreas.'] },
  { q: '¿Tuviste todo lo necesario para empezar (accesos, equipo)?', a: ['Sí, todo listo desde el día uno.', 'Casi todo; faltó un acceso que ya se resolvió.', 'Tardaron algunos accesos la primera semana.'] },
  { q: 'Un comentario para tu líder', a: ['Gracias por el acompañamiento.', 'Me gustaría un poco más de feedback semanal.', 'Todo claro por ahora, ¡con muchas ganas!'] },
]

function respuestasSimuladas(asignacion, tarea) {
  const seed = String(asignacion.id).split('').reduce((s, c) => s + c.charCodeAt(0), 0)
             + String(tarea.id).split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  // Falla ~1 de cada 4 preguntas calificables, para que el acierto no sea siempre perfecto.
  const fallaEn = i => (seed + i) % 4 === 0

  if (tarea.tipo === 'quiz') {
    const reales = tarea.quizPreguntas?.length ? tarea.quizPreguntas : null
    if (reales) {
      return reales.map((p, i) => {
        if (p.tipo === 'abierta') {
          const banco = FORM_BANCO[(seed + i) % FORM_BANCO.length].a
          return { q: p.texto, resp: banco[(seed + i) % banco.length] }
        }
        const correctaIdx = Math.max(0, p.opciones.findIndex(o => o.correcta))
        const pickIdx = fallaEn(i) ? (correctaIdx + 1) % p.opciones.length : correctaIdx
        return { q: p.texto, resp: p.opciones[pickIdx]?.texto || '—', ok: pickIdx === correctaIdx }
      })
    }
    const n = 3 + (seed % 2) // 3 o 4 preguntas
    return Array.from({ length: n }, (_, i) => {
      const item = QUIZ_BANCO[(seed + i) % QUIZ_BANCO.length]
      const pickIdx = fallaEn(i) ? (item.correcta + 1) % item.opts.length : item.correcta
      return { q: item.q, resp: item.opts[pickIdx], ok: pickIdx === item.correcta }
    })
  }

  // Formulario (completar-perfil): sin respuesta correcta, solo texto/opción elegida.
  const reales = tarea.formCampos?.length ? tarea.formCampos : null
  if (reales) {
    return reales.map((c, i) => {
      if (c.opciones?.length) return { q: c.etiqueta, resp: c.opciones[(seed + i) % c.opciones.length]?.texto || '—' }
      const banco = FORM_BANCO[(seed + i) % FORM_BANCO.length].a
      return { q: c.etiqueta, resp: banco[(seed + i) % banco.length] }
    })
  }
  const n = 3 + (seed % 2)
  return Array.from({ length: n }, (_, i) => {
    const item = FORM_BANCO[(seed + i) % FORM_BANCO.length]
    return { q: item.q, resp: item.a[(seed + i) % item.a.length] }
  })
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
  // Tarea (quiz/formulario) cuyo detalle de respuestas se está viendo dentro de "Ver detalles".
  const [verRespuestas, setVerRespuestas] = useState(null)
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

  // La regla de qué versión de la ruta aplica vive en utils: la comparte el celular del líder.
  const buildDetalleEtapas = a => construirEtapas(a, allPlantillas)

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

  function confirmDelete(a) {
    setDeleteTarget(a)
    setMenuOpen(null)
  }

  function handleDelete() {
    setAsignaciones(asignaciones.filter(a => a.id !== deleteTarget.id))
    setDeleteTarget(null)
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
          <button className="as-menu-item" onClick={() => { setDetalle(a); setMenuOpen(null) }}>
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
          <button className="as-menu-item as-menu-del" onClick={() => confirmDelete(a)}>
            <Trash2 size={13} />
            Desasignar
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
              <ColaboradorCard
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
                onVerDetalles={() => setDetalle(a)}
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

      {deleteTarget && (
        <ConfirmarAccionModal
          titulo="Desasignar ruta"
          descripcion={<>¿Desasignar a <strong>{deleteTarget.nombre}</strong> de <strong>{deleteTarget.ruta}</strong>? Se perderá el progreso actual.</>}
          palabra="desasignar"
          textoConfirmar="Desasignar"
          onConfirmar={handleDelete}
          onCancelar={() => setDeleteTarget(null)}
          icono={AlertTriangle}
        />
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
                    <span style={{ fontSize: 11, color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      · Buddy: <strong style={{ color: '#334155', fontWeight: 600 }}>{detalle.buddy.name}</strong>
                    </span>
                  )}
                </div>
                <div className="pr-progress" style={{ marginBottom: 20 }}>
                  <div className="pr-pct">{detalle.pct}%</div>
                  <div className="pr-bar">
                    <div className="pr-fill" style={{ width: `${detalle.pct}%`, background: barColor(detalle.status, detalle.pct) }} />
                  </div>
                </div>
                {/* Recorrido como nodos, igual que la vista previa de la ruta, pero cada
                    nodo se pinta según si el colaborador ya completó esa tarea. */}
                <div style={{ borderRadius: 12, padding: '20px 0', background: 'linear-gradient(180deg, #f0f4f8 0%, #e8eef4 100%)' }}>
                  {etapasDetalle.map((etapa, i) => {
                    const completa = etapa.doneLocal === etapa.tareas.length && etapa.tareas.length > 0
                    return (
                      <div key={i}>
                        {/* Cabecera de etapa */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#0C2D40', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{i + 1}</div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40' }}>{etapa.name}</span>
                            <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>{etapa.days}</span>
                            <span style={{ fontSize: 9.5, fontWeight: 700, color: completa ? '#16a34a' : '#64748b', background: completa ? '#f0fdf4' : '#f1f5f9', padding: '1px 8px', borderRadius: 20 }}>{etapa.doneLocal}/{etapa.tareas.length}</span>
                          </div>
                        </div>

                        {/* Nodos del camino */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {etapa.tareas.map((t, ti) => {
                            const TIcon = tareaIconMap[t.tipo] || TAREA_ICON_FALLBACK
                            const offsets = [0, 34, 48, 34, 0, -34, -48, -34]
                            const xOff = offsets[ti % offsets.length]
                            const vs = t.tipo === 'video' ? videoStats(t.id, t.done) : null
                            return (
                              <div key={t.id}>
                                {ti > 0 && (
                                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <div style={{ width: 2, height: 14, background: '#cbd5e1', borderRadius: 1 }} />
                                  </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateX(${xOff}px)`, transition: 'transform .2s' }}>
                                  <div style={{ position: 'relative' }}>
                                    <div style={{
                                      width: 44, height: 44, borderRadius: '50%',
                                      background: t.done ? '#00E091' : '#fff',
                                      border: t.done ? 'none' : '2px solid #e2e8f0',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      boxShadow: t.done ? '0 2px 8px rgba(0,224,145,.3)' : '0 1px 4px rgba(0,0,0,.06)',
                                    }}>
                                      {TIcon && <TIcon size={17} style={{ color: t.done ? '#fff' : '#94a3b8' }} />}
                                    </div>
                                    {t.done && (
                                      <div style={{ position: 'absolute', bottom: -2, right: -3, width: 16, height: 16, borderRadius: '50%', background: '#16a34a', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Check size={9} style={{ color: '#fff' }} />
                                      </div>
                                    )}
                                  </div>
                                  <div style={{
                                    fontSize: 10, fontWeight: 600, color: t.done ? '#0C2D40' : '#94a3b8',
                                    marginTop: 5, textAlign: 'center', maxWidth: 120, lineHeight: 1.2,
                                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                  }}>
                                    {t.name}
                                  </div>
                                  {vs && (
                                    <span style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 8.5, fontWeight: 700,
                                      padding: '1px 6px', borderRadius: 20, marginTop: 3,
                                      background: vs.completo ? '#f0fdf4' : vs.veces > 0 ? '#fef3c7' : '#f1f5f9',
                                      color: vs.completo ? '#16a34a' : vs.veces > 0 ? '#b45309' : '#94a3b8',
                                    }}>
                                      <PlayCircle size={9} />
                                      {vs.veces === 0 ? 'No visto' : `${vs.veces}×${vs.completo ? ' · completo' : ' · incompleto'}`}
                                    </span>
                                  )}
                                  {/* Prueba y Formulario completados: RH abre aquí lo que respondió la persona. */}
                                  {t.done && (t.tipo === 'quiz' || t.tipo === 'completar-perfil') && (
                                    <button
                                      onClick={() => setVerRespuestas(t)}
                                      style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 8.5, fontWeight: 700,
                                        padding: '2px 8px', borderRadius: 20, marginTop: 3, cursor: 'pointer',
                                        border: '1px solid #dbeafe', background: '#eff6ff', color: '#1d4ed8', fontFamily: 'inherit',
                                      }}
                                      onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                                      onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                                    >
                                      <Eye size={9} /> Ver respuestas
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                          {etapa.tareas.length === 0 && (
                            <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>Sin tareas</div>
                          )}
                        </div>

                        {/* Separador entre etapas */}
                        {i < etapasDetalle.length - 1 && (
                          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                            <div style={{ width: 2, height: 24, background: '#cbd5e1', borderRadius: 1 }} />
                          </div>
                        )}
                      </div>
                    )
                  })}
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

      {/* RESPUESTAS DE LA TAREA (Prueba / Formulario) — se abre sobre "Ver detalles" */}
      {verRespuestas && detalle && (() => {
        const t = verRespuestas
        const esQuiz = t.tipo === 'quiz'
        const items = respuestasSimuladas(detalle, t)
        const calificables = items.filter(it => it.ok !== undefined)
        const aciertos = calificables.filter(it => it.ok).length
        const HeaderIcon = esQuiz ? HelpCircle : ClipboardList
        return (
          <div className="pl-overlay" style={{ zIndex: 1200 }} onClick={() => setVerRespuestas(null)}>
            <div className="pl-modal" style={{ maxWidth: 480, maxHeight: '82vh' }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <HeaderIcon size={16} style={{ color: '#fff' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</h2>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Respuestas de {detalle.nombre}
                    </div>
                  </div>
                </div>
                <button className="pl-modal-close" onClick={() => setVerRespuestas(null)}><X size={18} /></button>
              </div>

              <div className="pl-modal-body" style={{ overflowY: 'auto', maxHeight: '62vh' }}>
                {/* Nota de prototipo: dejar claro que aún no son respuestas reales. */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a', marginBottom: 14 }}>
                  <Info size={14} style={{ color: '#b45309', flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 11, color: '#92400e', lineHeight: 1.45 }}>
                    Vista previa: respuestas de ejemplo. Aún no se guarda lo que responde el colaborador.
                  </span>
                </div>

                {esQuiz && calificables.length > 0 && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 14,
                    padding: '6px 12px', borderRadius: 20,
                    background: aciertos === calificables.length ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${aciertos === calificables.length ? '#bbf7d0' : '#fecaca'}`,
                  }}>
                    <Award size={13} style={{ color: aciertos === calificables.length ? '#16a34a' : '#dc2626' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: aciertos === calificables.length ? '#16a34a' : '#dc2626' }}>
                      {aciertos}/{calificables.length} correctas
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map((it, i) => (
                    <div key={i} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 7 }}>
                        <span style={{ width: 20, height: 20, borderRadius: 6, background: '#0C2D40', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40', lineHeight: 1.35 }}>{it.q}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 28 }}>
                        {it.ok !== undefined && (
                          <span style={{
                            width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: it.ok ? '#16a34a' : '#dc2626',
                          }}>
                            {it.ok ? <Check size={11} style={{ color: '#fff' }} /> : <X size={11} style={{ color: '#fff' }} />}
                          </span>
                        )}
                        <span style={{ fontSize: 12, color: it.ok === false ? '#b91c1c' : '#334155', lineHeight: 1.4 }}>
                          {it.resp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pl-modal-footer">
                <button className="pl-btn-cancel" onClick={() => setVerRespuestas(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
