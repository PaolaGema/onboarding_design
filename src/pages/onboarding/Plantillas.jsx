import { useState, useEffect, useRef } from 'react'
import { useUser } from '../../context/UserContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import {
  Search, Plus, Copy, Pencil, Trash2, X, AlertTriangle,
  LayoutGrid, List, MoreHorizontal, ChevronDown, ChevronUp, Check, UserPlus, Users, Archive, Route,
  Lock, ChevronLeft, ChevronRight, Info, ShieldCheck, Eye, History
} from 'lucide-react'
import JourneyBuilder from './JourneyBuilder'
import RutaFullPreviewModal from '../../components/onboarding/RutaFullPreviewModal'
import PlantillaPreviewModal from '../../components/onboarding/PlantillaPreviewModal'
import AsignarRutaModal from '../../components/onboarding/AsignarRutaModal'
import EmptyState from '../../components/layout/EmptyState'
import { rutaPlantillas } from '../../data/rutaPlantillas'

const colores = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#f97316', '#ec4899', '#0d9488', '#d946ef', '#ef4444']

const cargosPorArea = {
  'Ventas': ['Pasante Comercial', 'SDR Junior', 'Ejecutiva Comercial', 'Ejecutivo Senior', 'Account Manager', 'Gerente de Ventas'],
  'Comercial': ['Ejecutivo Comercial', 'Key Account Manager', 'Coordinador Comercial', 'Director Comercial'],
  'Dirección': ['Director General', 'Director de Área', 'Gerente General', 'Asistente de Dirección'],
  'Operaciones': ['Asistente Operativo', 'Analista de Procesos', 'Coordinador Logístico', 'Gerente de Operaciones'],
  'Tecnología': ['Desarrollador Backend', 'Frontend Developer', 'QA Engineer', 'DevOps Engineer', 'Data Analyst', 'Tech Lead'],
  'Finanzas': ['Analista Financiera', 'Contador General', 'Tesorero', 'Auditor Interno'],
  'Diseño': ['Diseñadora UX/UI', 'Diseñadora Gráfica', 'Director Creativo', 'Motion Designer'],
  'Recursos Humanos': ['Reclutadora', 'Especialista RRHH', 'Analista de Nóminas', 'Generalista RRHH'],
  'Marketing': ['Community Manager', 'Analista de Marketing', 'Content Creator', 'Growth Manager'],
  'Legal': ['Abogado Corporativo', 'Paralegal', 'Director Legal'],
}
const areas = Object.keys(cargosPorArea)
const sucursales = ['La Paz', 'Cochabamba', 'Santa Cruz (Central)', 'Tarija']
const tiposRuta = ['Onboarding', 'Reboarding']


export default function Plantillas() {
  const { currentUser } = useUser()
  const isManager = currentUser.role === 'manager'
  const isAuxiliar = currentUser.role === 'auxiliar'
  const isAreaRole = isManager || isAuxiliar
  const managerArea = 'Marketing'

  const { plantillas: allPlantillas, setPlantillas: setAllPlantillas, asignaciones, setAsignaciones, addFeedEntry } = useOnboardingData()
  const isAdmin = !isAreaRole
  const rutaGeneral = allPlantillas.find(p => p.esGlobal) || null
  const plantillas = isAreaRole ? allPlantillas.filter(p => p.area === managerArea) : allPlantillas
  function setPlantillas(next) {
    if (!isAreaRole) { setAllPlantillas(next); return }
    const others = allPlantillas.filter(p => p.area !== managerArea)
    setAllPlantillas([...others, ...next])
  }
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todas')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [filterArea, setFilterArea] = useState('todas')
  const [filterCargo, setFilterCargo] = useState('todos')
  const [rfDropStatus, setRfDropStatus] = useState(false)
  const [rfDropTipo, setRfDropTipo] = useState(false)
  const [createChooser, setCreateChooser] = useState(false)
  const [tplGallery, setTplGallery] = useState(false)
  const [tplSearch, setTplSearch] = useState('')
  const [tplArea, setTplArea] = useState('todas')
  const [tplAreaOpen, setTplAreaOpen] = useState(false)
  const [statusHeaderPos, setStatusHeaderPos] = useState(null)
  const [tipoHeaderPos, setTipoHeaderPos] = useState(null)
  const [mfDropArea, setMfDropArea] = useState(false)
  const [mfDropCargo, setMfDropCargo] = useState(false)
  const filterBarRef = useRef(null)

  useEffect(() => {
    function closeDrops(e) {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setMfDropArea(false); setMfDropCargo(false)
      }
      if (!e.target.closest('[data-th-filter]')) {
        setRfDropStatus(false); setRfDropTipo(false)
      }
    }
    document.addEventListener('mousedown', closeDrops)
    return () => document.removeEventListener('mousedown', closeDrops)
  }, [])
  const [viewMode, setViewMode] = useState('list')
  const [cardMenu, setCardMenu] = useState(null)
  const [rowMenuPos, setRowMenuPos] = useState(null)
  const [asignarModal, setAsignarModal] = useState(null)

  const [activeJourney, setActiveJourney] = useState(null)
  const [previewRuta, setPreviewRuta] = useState(null)
  const [modal, setModal] = useState(null)
  const [selectedTpl, setSelectedTpl] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [asignadosModal, setAsignadosModal] = useState(null)
  const [asignadosSearch, setAsignadosSearch] = useState('')
  const [etapasModal, setEtapasModal] = useState(null)
  const [tareasModal, setTareasModal] = useState(null)

  const [form, setForm] = useState({ name: '', descripcion: '', tipo: 'Onboarding', sucursal: 'Todas las sucursales', area: isManager ? managerArea : 'Ventas', cargo: '', status: 'borrador' })
  const [rutaGeneralConfirm, setRutaGeneralConfirm] = useState(null)
  const [historialRuta, setHistorialRuta] = useState(null)
  const [dropTipo, setDropTipo] = useState(false)
  const [dropSucursal, setDropSucursal] = useState(false)
  const [dropArea, setDropArea] = useState(false)
  const [dropCargo, setDropCargo] = useState(false)
  const [areaSearch, setAreaSearch] = useState('')
  const [cargoSearch, setCargoSearch] = useState('')
  const [showResponsables, setShowResponsables] = useState(null)
  const [responsables, setResponsables] = useState({
    9: [{ name: 'Ana Martínez Ruiz', initials: 'AM', color: '#c026d3', role: 'Líder de área' }],
  })

  const equipoMarketing = [
    { name: 'Laura Díaz Romero', initials: 'LD', color: '#14b8a6', cargo: 'Auxiliar' },
    { name: 'Andrea Núñez', initials: 'AN', color: '#06b6d4', cargo: 'Community Manager' },
    { name: 'Carolina Vega', initials: 'CV', color: '#14b8a6', cargo: 'Analista de Marketing' },
  ]

  function addResponsable(rutaId, persona) {
    setResponsables(prev => {
      const list = prev[rutaId] || []
      if (list.find(r => r.name === persona.name)) return prev
      return { ...prev, [rutaId]: [...list, { ...persona, role: persona.cargo }] }
    })
  }

  function removeResponsable(rutaId, name) {
    setResponsables(prev => ({
      ...prev,
      [rutaId]: (prev[rutaId] || []).filter(r => r.name !== name),
    }))
  }

  function canEditRuta(p) {
    if (isAdmin || isManager) return true
    if (isAuxiliar) return (responsables[p.id] || []).some(r => r.name === currentUser.name)
    return false
  }

  function openRuta(p) {
    setPreviewRuta(p)
  }

  const soulyRows = rutaPlantillas.map(tpl => ({
    id: `sh-${tpl.id}`,
    name: tpl.name,
    descripcion: tpl.descripcion,
    tipo: 'Onboarding',
    area: tpl.area,
    cargo: '',
    etapas: tpl.etapasData.length,
    tareas: tpl.etapasData.reduce((s, e) => s + e.actividades.reduce((ss, a) => ss + a.tareas.length, 0), 0),
    asignados: 0,
    status: null,
    updated: '',
    color: tpl.color,
    esGlobal: false,
    etapasData: tpl.etapasData,
    _isSouly: true,
    _tpl: tpl,
  }))
  function applyTemplate(p) { chooseTpl(p._tpl) }

  const hasRutaFilters = filterStatus !== 'todas' || filterTipo !== 'todos' || filterArea !== 'todas' || filterCargo !== 'todos'
  const fuenteRutas = plantillas
  const cargosDeArea = [...new Set(fuenteRutas.filter(p => filterArea === 'todas' || p.area === filterArea).map(p => p.cargo).filter(Boolean))]
  const filtered = fuenteRutas.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.area.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'todas' || p.status === filterStatus
    const matchTipo = filterTipo === 'todos' || (p.tipo || 'Onboarding') === filterTipo
    const matchArea = filterArea === 'todas' || p.area === filterArea
    const matchCargo = filterCargo === 'todos' || p.cargo === filterCargo
    return matchSearch && matchStatus && matchTipo && matchArea && matchCargo
  }).sort((a, b) => (b.esGlobal ? 1 : 0) - (a.esGlobal ? 1 : 0))
  function clearRutaFilters() { setFilterStatus('todas'); setFilterTipo('todos'); setFilterArea('todas'); setFilterCargo('todos'); setPage(1) }

  const [page, setPage] = useState(1)
  const perPage = 8
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const totalActivas = plantillas.filter(p => p.status === 'activa').length
  const totalBorrador = plantillas.filter(p => p.status === 'borrador').length
  const totalArchivadas = plantillas.filter(p => p.status === 'archivada').length

  function openCreate() {
    setCreateChooser(true)
  }

  function chooseTpl(tpl) {
    setCreateChooser(false)
    setTplGallery(false)
    setSelectedTpl(tpl)
    setForm({
      name: tpl ? '' : '',
      descripcion: tpl?.descripcion || '',
      tipo: 'Onboarding',
      sucursal: tpl?.sucursal || 'Todas las sucursales',
      area: tpl?.area === 'Todas las áreas' ? 'Todas las áreas' : (tpl?.area || 'Ventas'),
      cargo: '',
    })
    setDropTipo(false)
    setDropSucursal(false)
    setDropArea(false)
    setDropCargo(false)
    setModal('crear')
  }

  function openEdit(p) {
    setForm({ name: p.name, descripcion: p.descripcion || '', tipo: p.tipo || 'Onboarding', sucursal: p.sucursal || 'Todas las sucursales', area: p.area, cargo: p.cargo || '', id: p.id })
    setModal('editar')
  }

  function handleSave() {
    if (!form.name.trim()) return

    if (modal === 'crear') {
      const newId = Math.max(...plantillas.map(p => p.id), 0) + 1
      const color = colores[newId % colores.length]
      const etapasData = selectedTpl ? JSON.parse(JSON.stringify(selectedTpl.etapasData)) : undefined
      const newPlantilla = {
        id: newId,
        name: form.name.trim(),
        descripcion: form.descripcion?.trim() || '',
        tipo: form.tipo,
        sucursal: form.sucursal || 'Todas las sucursales',
        area: form.area,
        cargo: form.cargo || '',
        etapas: etapasData?.length || 0,
        tareas: etapasData ? etapasData.reduce((s, e) => s + e.actividades.reduce((ss, a) => ss + a.tareas.length, 0), 0) : 0,
        asignados: 0,
        status: 'borrador',
        updated: 'Ahora',
        updatedFecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        color,
        esGlobal: false,
        ordenGlobal: null,
        creador: currentUser.name,
        creadorRole: currentUser.roleLabel,
        creadoEl: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        versionActual: 1,
        versiones: [{
          v: 1,
          etapasData: etapasData || [],
          etapas: etapasData?.length || 0,
          tareas: etapasData ? etapasData.reduce((s, e) => s + e.actividades.reduce((ss, a) => ss + a.tareas.length, 0), 0) : 0,
          fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          autor: currentUser.name,
        }],
        ...(etapasData ? { etapasData } : {}),
      }
      setPlantillas([...plantillas, newPlantilla])
      addFeedEntry(`Nueva ruta "${newPlantilla.name}" creada${selectedTpl ? ` desde la plantilla "${selectedTpl.name}"` : ''}`)
      setModal(null)
      setActiveJourney({ ...newPlantilla, isNew: !etapasData })
    } else {
      setPlantillas(plantillas.map(p => {
        if (p.id !== form.id) return p
        return {
          ...p, name: form.name.trim(), descripcion: form.descripcion?.trim() || '', tipo: form.tipo, sucursal: form.sucursal, area: form.area, updated: 'Ahora',
          updatedFecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        }
      }))
      setModal(null)
    }
  }

  function toggleGlobal(p) {
    const willBeGlobal = !p.esGlobal
    setPlantillas(prev => prev.map(x => x.id === p.id
      ? { ...x, esGlobal: willBeGlobal, ordenGlobal: willBeGlobal ? 0 : null }
      : x))
    setCardMenu(null)
    setRutaGeneralConfirm(null)
  }

  function handleDuplicate(p) {
    const newId = Math.max(...plantillas.map(x => x.id)) + 1
    const hoy = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    setPlantillas([...plantillas, {
      ...p,
      id: newId,
      name: `${p.name} (copia)`,
      asignados: 0,
      status: 'borrador',
      updated: 'Ahora',
      updatedFecha: hoy,
      creador: currentUser.name,
      creadoEl: hoy,
    }])
  }

  function confirmDelete(p) {
    setDeleteTarget(p)
  }

  function handleAsignarRuta(colabs, ruta, fecha) {
    if (!colabs.length || !ruta) return
    const baseId = Math.max(0, ...asignaciones.map(a => a.id))
    const newItems = colabs.map((c, i) => ({
      id: baseId + i + 1,
      nombre: c.name,
      area: c.depto || 'Sin asignar',
      ruta: ruta.name,
      rutaId: ruta.id,
      // Se fija la versión actual de la ruta; el contenido se resuelve desde
      // ruta.versiones[version]. El snapshot queda como respaldo.
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
    setAsignarModal(null)
  }

  function handleDelete() {
    setPlantillas(plantillas.filter(p => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  if (activeJourney) {
    return (
      <JourneyBuilder
        plantilla={activeJourney}
        onBack={() => setActiveJourney(null)}
        empty={activeJourney.isNew}
        backLabel="Rutas"
        editing={activeJourney.isEditingExisting}
      />
    )
  }

  return (
    <div className="content-scroll" onClick={() => setCardMenu(null)}>

      <div className="pl-header">
        <div>
          <h1 className="pl-title">{isAreaRole ? `Rutas — ${managerArea}` : 'Rutas de Onboarding'}</h1>
          <p className="pl-subtitle">{isAreaRole ? 'Rutas de onboarding de tu área' : 'Administra y organiza tus rutas de onboarding'}</p>
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="kpi-strip">
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--blue)' }}>
          <div className="kpi-title" style={{ color: 'var(--blue)' }}>Rutas totales</div>
          <div className="kpi-val">{plantillas.length}</div>
          <div className="kpi-lbl">Creadas en la plataforma</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--green)' }}>
          <div className="kpi-title" style={{ color: 'var(--green)' }}>Activas</div>
          <div className="kpi-val">{totalActivas}</div>
          <div className="kpi-lbl">En uso actualmente</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--yellow)' }}>
          <div className="kpi-title" style={{ color: 'var(--yellow)' }}>En borrador</div>
          <div className="kpi-val">{totalBorrador}</div>
          <div className="kpi-lbl">Pendientes de activar</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--text-muted)' }}>
          <div className="kpi-title" style={{ color: 'var(--text-muted)' }}>Archivadas</div>
          <div className="kpi-val">{totalArchivadas}</div>
          <div className="kpi-lbl">Fuera de uso</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-accent': rutaGeneral ? '#0C2D40' : 'var(--yellow)' }}>
          <div className="kpi-title" style={{ color: rutaGeneral ? '#0C2D40' : 'var(--yellow)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <ShieldCheck size={12} style={{ flexShrink: 0 }} /> Ruta general
          </div>
          <div className="kpi-val" style={{ fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={rutaGeneral ? rutaGeneral.name : undefined}>
            {rutaGeneral ? rutaGeneral.name : 'Sin definir'}
          </div>
          <div className="kpi-lbl">
            {!rutaGeneral ? 'Ninguna ruta se aplica a todas' : rutaGeneral.status === 'activa' ? 'Se antepone a todas las rutas' : 'No propaga (está inactiva)'}
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="pl-toolbar">
        <div className="pl-search-wrap">
          <Search size={13} className="pl-search-ico" />
          <input
            type="text"
            className="pl-search"
            placeholder="Buscar ruta por nombre o área…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div ref={filterBarRef} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* ÁREA */}
          <div className="pl-dropdown-wrap" style={{ width: 'auto' }}>
            <button type="button" className={`pl-dropdown-trigger${mfDropArea ? ' open' : ''}${filterArea === 'todas' ? ' placeholder' : ''}`} style={{ width: 'auto', height: 34, fontSize: 11, padding: '0 10px', justifyContent: 'flex-start', gap: 6 }} onClick={e => { e.stopPropagation(); setMfDropArea(!mfDropArea); setMfDropCargo(false) }}>
              <span style={{ whiteSpace: 'nowrap' }}>{filterArea === 'todas' ? 'Todas las áreas' : filterArea}</span>
              <ChevronDown size={12} className="pl-dropdown-chevron" style={{ flexShrink: 0 }} />
            </button>
            {mfDropArea && (
              <div className="pl-dropdown-menu" style={{ minWidth: 160, maxHeight: 220, overflowY: 'auto' }}>
                {['todas', ...new Set(fuenteRutas.map(p => p.area).filter(a => a !== 'Todas las áreas'))].map(a => (
                  <button key={a} type="button" className={`pl-dropdown-item${filterArea === a ? ' selected' : ''}`} style={{ fontSize: 11.5, padding: '6px 9px' }} onClick={() => { setFilterArea(a); setFilterCargo('todos'); setMfDropArea(false); setPage(1) }}>
                    <span>{a === 'todas' ? 'Todas las áreas' : a}</span>
                    {filterArea === a && <Check size={13} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CARGO */}
          <div className="pl-dropdown-wrap" style={{ width: 'auto' }}>
            <button type="button" className={`pl-dropdown-trigger${mfDropCargo ? ' open' : ''}${filterCargo === 'todos' ? ' placeholder' : ''}`} style={{ width: 'auto', height: 34, fontSize: 11, padding: '0 10px', justifyContent: 'flex-start', gap: 6 }} onClick={e => { e.stopPropagation(); setMfDropCargo(!mfDropCargo); setMfDropArea(false) }}>
              <span style={{ whiteSpace: 'nowrap' }}>{filterCargo === 'todos' ? 'Todos los cargos' : filterCargo}</span>
              <ChevronDown size={12} className="pl-dropdown-chevron" style={{ flexShrink: 0 }} />
            </button>
            {mfDropCargo && (
              <div className="pl-dropdown-menu" style={{ minWidth: 160, maxHeight: 220, overflowY: 'auto' }}>
                {['todos', ...cargosDeArea].map(c => (
                  <button key={c} type="button" className={`pl-dropdown-item${filterCargo === c ? ' selected' : ''}`} style={{ fontSize: 11.5, padding: '6px 9px' }} onClick={() => { setFilterCargo(c); setMfDropCargo(false); setPage(1) }}>
                    <span>{c === 'todos' ? 'Todos los cargos' : c}</span>
                    {filterCargo === c && <Check size={13} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasRutaFilters && (
            <button onClick={clearRutaFilters} style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Limpiar</button>
          )}
        </div>
        {!isAreaRole && (
          <button className="pl-btn-new" onClick={openCreate} style={{ padding: '0 14px', height: 34, fontSize: 11.5, marginLeft: 'auto' }}>
            <Plus size={14} /> Nueva ruta
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

      {/* VISTA GRID */}
      {viewMode === 'grid' && (
      <div className="pl-grid">
        {paginated.map((p) => (
          <div key={p.id} className="pl-card" style={{ overflow: 'visible', position: 'relative', padding: 0, ...(p.esGlobal ? { border: '1.5px solid #0C2D40', boxShadow: '0 0 0 3px rgba(12,45,64,0.06)' } : {}) }}>
            {/* HEADER */}
            <div style={{ padding: '14px 16px 12px', background: p.esGlobal ? '#EAF3FB' : '#f8fafc', borderRadius: '14px 14px 0 0', borderBottom: '1px solid var(--surface-hover)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: p.esGlobal ? 'rgba(12,45,64,0.1)' : 'var(--green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Route size={16} style={{ color: p.esGlobal ? '#0C2D40' : 'var(--green)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    {p.esGlobal && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#0C2D40', color: '#fff', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0 }} title="Ruta general — se antepone a todas las rutas">
                        <ShieldCheck size={9} /> General
                      </span>
                    )}
                    {p.versiones?.length > 1 && (
                      <span title={`Versión actual ${p.versionActual} · ${p.versiones.length} versiones`} style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: 'var(--surface-hover)', color: 'var(--text-muted)', flexShrink: 0 }}>v{p.versionActual}</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <span className={`pl-status ${p.status === 'activa' ? 'pl-st-activa' : p.status === 'archivada' ? 'pl-st-archivada' : 'pl-st-borrador'}`}>
                    {{ activa: 'Activa', borrador: 'Borrador', archivada: 'Archivada' }[p.status]}
                  </span>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={e => { e.stopPropagation(); setCardMenu(cardMenu === p.id ? null : p.id) }}
                      style={{
                        width: 24, height: 24, borderRadius: 6, border: 'none',
                        background: cardMenu === p.id ? 'var(--surface-hover)' : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-muted)', fontFamily: 'inherit',
                      }}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                    {cardMenu === p.id && (
                      <div style={{
                        position: 'absolute', right: 0, top: '100%', marginTop: 4,
                        background: '#fff', borderRadius: 10, padding: 4,
                        boxShadow: '0 8px 30px rgba(0,0,0,.2)', border: '1px solid #e2e8f0',
                        zIndex: 20, minWidth: 150, animation: 'plSlideUp .12s',
                      }}>
                        {([
                          ...(p.status === 'activa' ? [{ icon: UserPlus, label: 'Asignar ruta a colaboradores', color: 'var(--green)', fn: () => { setAsignarModal(p); setCardMenu(null) } }] : []),
                          { icon: Eye, label: 'Ver detalles', color: 'var(--text-muted)', fn: () => { setPreviewRuta(p); setCardMenu(null) } },
                          ...(canEditRuta(p) ? [{ icon: Pencil, label: 'Editar', color: 'var(--text-muted)', fn: () => { openEdit(p); setCardMenu(null) } }] : []),
                          { icon: Copy, label: 'Duplicar', color: 'var(--text-muted)', fn: () => { handleDuplicate(p); setCardMenu(null) } },
                          { icon: History, label: 'Historial de versiones', color: 'var(--text-muted)', fn: () => { setHistorialRuta(p); setCardMenu(null) } },
                          ...(isAdmin ? [{ icon: p.esGlobal ? Lock : ShieldCheck, label: p.esGlobal ? 'Quitar como ruta general' : 'Establecer como ruta general', color: 'var(--text-muted)', fn: () => { setRutaGeneralConfirm(p); setCardMenu(null) } }] : []),
                          { icon: Archive, label: p.status === 'archivada' ? 'Desarchivar' : 'Archivar', color: 'var(--text-muted)', fn: () => { setPlantillas(prev => prev.map(x => x.id === p.id ? { ...x, status: x.status === 'archivada' ? 'borrador' : 'archivada' } : x)); setCardMenu(null) } },
                          { icon: Trash2, label: 'Eliminar', color: '#ef4444', fn: () => { confirmDelete(p); setCardMenu(null) } },
                        ]).map(a => {
                          const AIcon = a.icon
                          return (
                            <button
                              key={a.label}
                              onClick={a.fn}
                              style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                                padding: '7px 10px', border: 'none', borderRadius: 7,
                                background: 'transparent', cursor: 'pointer', fontSize: 12,
                                fontWeight: 500, color: a.color, fontFamily: 'inherit', textAlign: 'left',
                                transition: 'background .1s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = a.color === '#ef4444' ? '#fef2f2' : '#f8fafc'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <AIcon size={13} /> {a.label}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="6" y="10" width="12" height="12" rx="2" ry="2"/></svg>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.area}</span>
                </div>
                {p.cargo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.cargo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* MÉTRICAS */}
            <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div style={{ cursor: 'pointer' }} onClick={() => setEtapasModal(p)}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0C2D40' }}>{p.etapas}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>Etapas</div>
              </div>
              <div style={{ width: 1, background: 'var(--surface-hover)' }} />
              <div style={{ cursor: 'pointer' }} onClick={() => setTareasModal(p)}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0C2D40' }}>{p.tareas}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>Tareas</div>
              </div>
              <div style={{ width: 1, background: 'var(--surface-hover)' }} />
              <div style={{ cursor: p.asignados > 0 ? 'pointer' : 'default' }} onClick={() => p.asignados > 0 && setAsignadosModal(p)}>
                <div style={{ fontSize: 18, fontWeight: 800, color: p.asignados > 0 ? '#0C2D40' : '#cbd5e1' }}>{p.asignados}</div>
                <div style={{ fontSize: 9, color: p.asignados > 0 ? '#3b82f6' : '#94a3b8', fontWeight: 600 }}>Asignados</div>
              </div>
            </div>

            {/* RESPONSABLES — solo visible para manager */}
            {isManager && (
              <div style={{ borderTop: '1px solid var(--surface-hover)', paddingTop: 8, marginTop: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Responsables</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowResponsables(showResponsables === p.id ? null : p.id) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 3,
                      fontSize: 9, fontWeight: 600, color: '#3b82f6',
                      background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    <UserPlus size={10} /> Agregar
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {(responsables[p.id] || []).map(r => (
                    <div key={r.name} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '3px 8px 3px 3px', borderRadius: 20,
                      background: '#f8fafc', border: '1px solid var(--surface-hover)',
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: r.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <span style={{ color: '#fff', fontSize: 7, fontWeight: 700 }}>{r.initials}</span>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)' }}>{r.name.split(' ')[0]}</span>
                      {r.role !== 'Líder de área' && (
                        <button onClick={(e) => { e.stopPropagation(); removeResponsable(p.id, r.name) }} style={{
                          width: 12, height: 12, borderRadius: '50%', border: 'none',
                          background: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: 0, marginLeft: -2,
                        }}>
                          <X size={7} style={{ color: 'var(--text-muted)' }} />
                        </button>
                      )}
                    </div>
                  ))}
                  {(!responsables[p.id] || responsables[p.id].length === 0) && (
                    <span style={{ fontSize: 9, color: '#cbd5e1', fontStyle: 'italic' }}>Sin responsables asignados</span>
                  )}
                </div>

                {showResponsables === p.id && (
                  <div style={{
                    marginTop: 6, padding: 6, borderRadius: 8,
                    background: '#fff', border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,.08)',
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, padding: '0 4px' }}>Equipo de {managerArea}</div>
                    {equipoMarketing.filter(e => !(responsables[p.id] || []).find(r => r.name === e.name)).map(e => (
                      <button
                        key={e.name}
                        onClick={(ev) => { ev.stopPropagation(); addResponsable(p.id, e) }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                          padding: '6px 6px', border: 'none', borderRadius: 6,
                          background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                          textAlign: 'left', transition: 'background .1s',
                        }}
                        onMouseEnter={ev => ev.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', background: e.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <span style={{ color: '#fff', fontSize: 8, fontWeight: 700 }}>{e.initials}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#334155' }}>{e.name}</div>
                          <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>{e.cargo}</div>
                        </div>
                      </button>
                    ))}
                    {equipoMarketing.filter(e => !(responsables[p.id] || []).find(r => r.name === e.name)).length === 0 && (
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', padding: '6px 4px', textAlign: 'center' }}>Todos asignados</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* BADGE AUXILIAR — delegado por */}
            {isAuxiliar && (
              <div style={{
                borderTop: '1px solid var(--surface-hover)', paddingTop: 8, marginTop: 2,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Users size={11} style={{ color: '#14b8a6' }} />
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Acceso delegado por <strong style={{ color: '#0C2D40' }}>{currentUser.delegadoPor}</strong></span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderTop: '1px solid var(--surface-hover)' }}>
              <span style={{ fontSize: 10, color: '#b0b8c4' }}>{p.updated}</span>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* VISTA LISTA */}
      {viewMode === 'list' && (
        <div className="as-table-wrap">
          <table className="as-table" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Nombre de la ruta</th>
                <th style={{ width: '17%' }}>Área / Cargo</th>
                <th style={{ width: '11%' }} data-th-filter>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      if (rfDropTipo) { setRfDropTipo(false); return }
                      const rect = e.currentTarget.getBoundingClientRect()
                      setTipoHeaderPos({ top: rect.bottom + 6, left: rect.left })
                      setRfDropStatus(false)
                      setRfDropTipo(true)
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 3, border: 'none', background: 'none',
                      padding: 0, cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
                      color: filterTipo !== 'todos' ? 'var(--navy)' : 'var(--text-muted)',
                    }}
                  >
                    Tipo
                    <ChevronDown size={11} style={{ transform: rfDropTipo ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }} />
                  </button>
                  {rfDropTipo && tipoHeaderPos && (
                    <div className="pl-dropdown-menu" style={{ position: 'fixed', top: tipoHeaderPos.top, left: tipoHeaderPos.left, right: 'auto', minWidth: 160, textTransform: 'none', letterSpacing: 'normal' }} onClick={e => e.stopPropagation()}>
                      {['todos', ...tiposRuta].map(t => (
                        <button key={t} type="button" className={`pl-dropdown-item${filterTipo === t ? ' selected' : ''}`} style={{ fontSize: 11.5, padding: '6px 9px' }} onClick={() => { setFilterTipo(t); setRfDropTipo(false); setPage(1) }}>
                          <span>{t === 'todos' ? 'Todos los tipos' : t}</span>
                          {filterTipo === t && <Check size={13} />}
                        </button>
                      ))}
                    </div>
                  )}
                </th>
                <th style={{ width: '7%' }}>Etapas</th>
                <th style={{ width: '12%' }}>Colaboradores</th>
                <th style={{ width: '15%' }} data-th-filter>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      if (rfDropStatus) { setRfDropStatus(false); return }
                      const rect = e.currentTarget.getBoundingClientRect()
                      setStatusHeaderPos({ top: rect.bottom + 6, left: rect.left })
                      setRfDropTipo(false)
                      setRfDropStatus(true)
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 3, border: 'none', background: 'none',
                      padding: 0, cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
                      color: filterStatus !== 'todas' ? 'var(--navy)' : 'var(--text-muted)',
                    }}
                  >
                    Estado
                    <ChevronDown size={11} style={{ transform: rfDropStatus ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }} />
                  </button>
                  {rfDropStatus && statusHeaderPos && (
                    <div className="pl-dropdown-menu" style={{ position: 'fixed', top: statusHeaderPos.top, left: statusHeaderPos.left, right: 'auto', minWidth: 160, textTransform: 'none', letterSpacing: 'normal' }} onClick={e => e.stopPropagation()}>
                      {[{ key: 'todas', label: 'Todos los estados' }, { key: 'activa', label: 'Activas' }, { key: 'borrador', label: 'Borrador' }, { key: 'archivada', label: 'Archivadas' }].map(f => (
                        <button key={f.key} type="button" className={`pl-dropdown-item${filterStatus === f.key ? ' selected' : ''}`} style={{ fontSize: 11.5, padding: '6px 9px' }} onClick={() => { setFilterStatus(f.key); setRfDropStatus(false); setPage(1) }}>
                          <span>{f.label}</span>
                          {filterStatus === f.key && <Check size={13} />}
                        </button>
                      ))}
                    </div>
                  )}
                </th>
                <th style={{ width: '8%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => (
                <tr key={p.id} style={{ cursor: 'pointer', ...(p.esGlobal ? { background: '#EAF3FB' } : {}) }} onClick={() => openRuta(p)}>
                  <td>
                    <div className="as-name" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
                      {p.name}
                      {p.esGlobal && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#0C2D40', color: '#fff', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0 }} title="Ruta general — se antepone a todas las rutas">
                          <ShieldCheck size={9} /> General
                        </span>
                      )}
                      {p.versiones?.length > 1 && (
                        <span title={`Versión actual ${p.versionActual} · ${p.versiones.length} versiones`} style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-muted)', flexShrink: 0 }}>v{p.versionActual}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40' }}>{p.area}</span>
                      {p.cargo && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.cargo}</span>}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {p.tipo || 'Onboarding'}
                    </span>
                  </td>
                  <td><span className="as-dia">{p.etapas}</span></td>
                  <td><span className="as-dia">{p.asignados}</span></td>
                  <td>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                      background: p.status === 'activa' ? '#f0fdf4' : p.status === 'archivada' ? 'var(--surface-hover)' : '#fef3c7',
                      color: p.status === 'activa' ? '#16a34a' : p.status === 'archivada' ? '#64748b' : '#b45309',
                    }}>
                      {{ activa: 'Activa', borrador: 'Borrador', archivada: 'Archivada' }[p.status]}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={(e) => {
                          if (cardMenu === p.id) { setCardMenu(null); return }
                          const rect = e.currentTarget.getBoundingClientRect()
                          const itemCount = 5 + (canEditRuta(p) ? 1 : 0) + (p.status === 'activa' ? 1 : 0) + (isAdmin ? 1 : 0)
                          const menuH = itemCount * 34 + 8
                          const margin = 10
                          const top = (rect.bottom + 4 + menuH > window.innerHeight - margin)
                            ? Math.max(margin, rect.top - menuH - 4)
                            : rect.bottom + 4
                          setRowMenuPos({ top, right: window.innerWidth - rect.right })
                          setCardMenu(p.id)
                        }}
                        style={{
                          width: 26, height: 26, borderRadius: 6, border: 'none',
                          background: cardMenu === p.id ? 'var(--surface-hover)' : 'transparent',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-muted)', fontFamily: 'inherit',
                        }}
                      >
                        <MoreHorizontal size={15} />
                      </button>
                      {cardMenu === p.id && rowMenuPos && (
                        <div style={{
                          position: 'fixed', top: rowMenuPos.top, right: rowMenuPos.right,
                          background: '#fff', borderRadius: 10, padding: 4,
                          boxShadow: '0 8px 30px rgba(0,0,0,.2)', border: '1px solid #e2e8f0',
                          zIndex: 20, minWidth: 180, maxHeight: 'calc(100vh - 20px)', overflowY: 'auto',
                          animation: 'plSlideUp .12s',
                        }}>
                          {([
                            ...(p.status === 'activa' ? [{ icon: UserPlus, label: 'Asignar ruta a colaboradores', color: 'var(--green)', fn: () => { setAsignarModal(p); setCardMenu(null) } }] : []),
                            { icon: Eye, label: 'Ver detalles', color: 'var(--text-muted)', fn: () => { setPreviewRuta(p); setCardMenu(null) } },
                            ...(canEditRuta(p) ? [{ icon: Pencil, label: 'Editar', color: 'var(--text-muted)', fn: () => { openEdit(p); setCardMenu(null) } }] : []),
                            { icon: Copy, label: 'Duplicar', color: 'var(--text-muted)', fn: () => { handleDuplicate(p); setCardMenu(null) } },
                          { icon: History, label: 'Historial de versiones', color: 'var(--text-muted)', fn: () => { setHistorialRuta(p); setCardMenu(null) } },
                            ...(isAdmin ? [{ icon: p.esGlobal ? Lock : ShieldCheck, label: p.esGlobal ? 'Quitar como ruta general' : 'Establecer como ruta general', color: 'var(--text-muted)', fn: () => { setRutaGeneralConfirm(p); setCardMenu(null) } }] : []),
                            { icon: Archive, label: p.status === 'archivada' ? 'Desarchivar' : 'Archivar', color: 'var(--text-muted)', fn: () => { setPlantillas(prev => prev.map(x => x.id === p.id ? { ...x, status: x.status === 'archivada' ? 'borrador' : 'archivada' } : x)); setCardMenu(null) } },
                            { icon: Trash2, label: 'Eliminar', color: '#ef4444', fn: () => { confirmDelete(p); setCardMenu(null) } },
                          ]).map(a => {
                            const AIcon = a.icon
                            return (
                              <button
                                key={a.label}
                                onClick={a.fn}
                                style={{
                                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                                  padding: '7px 10px', border: 'none', borderRadius: 7,
                                  background: 'transparent', cursor: 'pointer', fontSize: 12,
                                  fontWeight: 500, color: a.color, fontFamily: 'inherit', textAlign: 'left',
                                  transition: 'background .1s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = a.color === '#ef4444' ? '#fef2f2' : '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <AIcon size={13} /> {a.label}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderTop: '1px solid var(--border-soft)',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} de {filtered.length} rutas
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border-soft)',
                    background: 'var(--surface-card)', cursor: page === 1 ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: page === 1 ? 'var(--border-dark)' : 'var(--text-muted)',
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
                      border: p === page ? 'none' : '1px solid var(--border-soft)',
                      background: p === page ? '#0C2D40' : 'var(--surface-card)',
                      color: p === page ? '#fff' : 'var(--text-muted)',
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
                    width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border-soft)',
                    background: 'var(--surface-card)', cursor: page === totalPages ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: page === totalPages ? 'var(--border-dark)' : 'var(--text-muted)',
                    opacity: page === totalPages ? 0.5 : 1,
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
          {filtered.length === 0 && (
            <div style={{ padding: '12px 16px 16px' }}>
              <EmptyState
                icon={Route}
                title={plantillas.length === 0 ? 'Aún no hay rutas de onboarding creadas' : 'No se encontraron rutas'}
                description={plantillas.length === 0 ? 'Para crear una ruta, haz clic en "Nueva ruta".' : 'Intenta con otro término de búsqueda o ajusta los filtros.'}
                actionLabel={plantillas.length === 0 && !isAreaRole ? 'Nueva ruta' : undefined}
                actionIcon={Plus}
                onAction={openCreate}
              />
            </div>
          )}
        </div>
      )}

      {viewMode === 'grid' && totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} de {filtered.length} rutas
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border-soft)',
                background: 'var(--surface-card)', cursor: page === 1 ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: page === 1 ? 'var(--border-dark)' : 'var(--text-muted)',
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
                  border: p === page ? 'none' : '1px solid var(--border-soft)',
                  background: p === page ? '#0C2D40' : 'var(--surface-card)',
                  color: p === page ? '#fff' : 'var(--text-muted)',
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
                width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border-soft)',
                background: 'var(--surface-card)', cursor: page === totalPages ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: page === totalPages ? 'var(--border-dark)' : 'var(--text-muted)',
                opacity: page === totalPages ? 0.5 : 1,
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {viewMode === 'grid' && filtered.length === 0 && (
        <div style={{ padding: '0 16px 16px' }}>
          <EmptyState
            icon={Route}
            title={plantillas.length === 0 ? 'Aún no hay rutas de onboarding creadas' : 'No se encontraron rutas'}
            description={plantillas.length === 0 ? 'Para crear una ruta, haz clic en "Nueva ruta".' : 'Intenta con otro término de búsqueda o ajusta los filtros.'}
            actionLabel={plantillas.length === 0 && !isAreaRole ? 'Nueva ruta' : undefined}
            actionIcon={Plus}
            onAction={openCreate}
          />
        </div>
      )}

      <div style={{ height: '8px' }} />

      {/* MODAL SELECTOR: DESDE CERO / PLANTILLA */}
      {createChooser && (
        <div className="pl-overlay" onClick={() => setCreateChooser(false)}>
          <div className="pl-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="pl-modal-header">
              <h2>Nueva ruta</h2>
              <button className="pl-modal-close" onClick={() => setCreateChooser(false)}><X size={18} /></button>
            </div>
            <div className="pl-modal-body">
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>¿Cómo quieres empezar?</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { key: 'cero', icon: Route, title: 'Desde cero', desc: 'Arma la ruta etapa por etapa, en blanco.', onClick: () => chooseTpl(null) },
                  { key: 'tpl', icon: Copy, title: 'Usar una plantilla', desc: 'Parte de una base lista y edítala a tu gusto.', onClick: () => { setCreateChooser(false); setTplSearch(''); setTplArea('todas'); setTplGallery(true) } },
                ].map(opt => {
                  const OIcon = opt.icon
                  return (
                    <button key={opt.key} onClick={opt.onClick} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
                      padding: '18px 16px', borderRadius: 12, border: '1px solid var(--border-soft)',
                      background: 'var(--surface-card)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                      transition: 'all .12s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#0C2D40'; e.currentTarget.style.background = '#f8fafc' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-soft)'; e.currentTarget.style.background = 'var(--surface-card)' }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(12,45,64,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <OIcon size={20} style={{ color: '#0C2D40' }} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0C2D40' }}>{opt.title}</span>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{opt.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GALERÍA DE PLANTILLAS */}
      {tplGallery && (() => {
        const tplAreas = ['todas', ...new Set(soulyRows.map(t => t.area).filter(a => a !== 'Todas las áreas'))]
        const tplList = soulyRows
          .filter(t =>
            (t.name.toLowerCase().includes(tplSearch.toLowerCase()) || t.area.toLowerCase().includes(tplSearch.toLowerCase())) &&
            (tplArea === 'todas' || t.area === tplArea))
          .sort((a, b) => isManager ? ((b.area === managerArea ? 1 : 0) - (a.area === managerArea ? 1 : 0)) : 0)
        return (
          <div className="pl-overlay" onClick={() => setTplGallery(false)}>
            <div className="pl-modal" style={{ maxWidth: 760, width: '92vw', display: 'flex', flexDirection: 'column', height: '86vh', padding: 0 }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => { setTplGallery(false); setCreateChooser(true) }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)', padding: 0 }} title="Volver">
                    <ChevronLeft size={18} />
                  </button>
                  <h2 style={{ margin: 0 }}>Elegir una plantilla</h2>
                </div>
                <button className="pl-modal-close" onClick={() => setTplGallery(false)}><X size={18} /></button>
              </div>
              <div style={{ display: 'flex', gap: 8, padding: '12px 20px', borderBottom: '1px solid var(--border-soft)', flexShrink: 0 }}>
                <div className="pl-search-wrap" style={{ flex: 1 }}>
                  <Search size={13} className="pl-search-ico" />
                  <input type="text" className="pl-search" placeholder="Buscar por nombre o área…" value={tplSearch} onChange={e => setTplSearch(e.target.value)} autoFocus />
                </div>
                <div className="pl-dropdown-wrap" style={{ width: 'auto', position: 'relative' }}>
                  <button type="button" className={`pl-dropdown-trigger${tplAreaOpen ? ' open' : ''}${tplArea === 'todas' ? ' placeholder' : ''}`} style={{ width: 'auto', height: 34, fontSize: 11, padding: '0 10px', gap: 6 }} onClick={e => { e.stopPropagation(); setTplAreaOpen(!tplAreaOpen) }}>
                    <span style={{ whiteSpace: 'nowrap' }}>{tplArea === 'todas' ? 'Todas las áreas' : tplArea}</span>
                    <ChevronDown size={12} className="pl-dropdown-chevron" style={{ flexShrink: 0 }} />
                  </button>
                  {tplAreaOpen && (
                    <div className="pl-dropdown-menu" style={{ minWidth: 160, maxHeight: 220, overflowY: 'auto' }} onMouseLeave={() => setTplAreaOpen(false)}>
                      {tplAreas.map(a => (
                        <button key={a} type="button" className={`pl-dropdown-item${tplArea === a ? ' selected' : ''}`} style={{ fontSize: 11.5, padding: '6px 9px' }} onClick={() => { setTplArea(a); setTplAreaOpen(false) }}>
                          <span>{a === 'todas' ? 'Todas las áreas' : a}</span>
                          {tplArea === a && <Check size={13} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
                {tplList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 13 }}>No se encontraron plantillas con ese criterio.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
                    {tplList.map(t => (
                        <div key={t.id} style={{ border: '1px solid var(--border-soft)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--surface-card)' }}>
                          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Route size={15} style={{ color: 'var(--green)' }} />
                              </div>
                              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0C2D40', lineHeight: 1.25 }}>{t.name}</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                              <span style={{ fontSize: 9.5, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>{t.area}</span>
                              <span style={{ fontSize: 9.5, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>{t.etapas} etapas · {t.tareas} tareas</span>
                            </div>
                            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.descripcion}</p>
                          </div>
                          <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderTop: '1px solid var(--border-soft)' }}>
                            <button
                              onClick={() => setPreviewRuta(t)}
                              style={{ flex: 1, height: 34, borderRadius: 8, border: '1px solid var(--border-soft)', background: '#fff', cursor: 'pointer', fontSize: 11.5, fontWeight: 600, color: '#0C2D40', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, whiteSpace: 'nowrap', transition: 'all .12s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#0C2D40' }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'var(--border-soft)' }}
                            >
                              <Eye size={13} /> Vista previa
                            </button>
                            <button onClick={() => chooseTpl(t._tpl)} className="pl-btn-save" style={{ flex: '0 0 auto', minWidth: 68, height: 34, fontSize: 11.5, padding: '0 16px' }}>Usar</button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL CREAR / EDITAR */}
      {(modal === 'crear' || modal === 'editar') && (
        <div className="pl-overlay" onClick={() => setModal(null)}>
          <div className="pl-modal" style={{ width: 560 }} onClick={e => e.stopPropagation()}>
            <div className="pl-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2>{modal === 'crear' ? 'Nueva ruta' : 'Editar ruta'}</h2>
              </div>
              <button className="pl-modal-close" onClick={() => setModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="pl-modal-body">
              {selectedTpl && modal === 'crear' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  borderRadius: 10, background: `${selectedTpl.color}12`, border: `1px solid ${selectedTpl.color}30`,
                  marginBottom: 4,
                }}>
                  <selectedTpl.icon size={14} style={{ color: selectedTpl.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#0C2D40' }}>Desde la plantilla "{selectedTpl.name}"</span>
                </div>
              )}
              <label className="pl-label">
                <span>Nombre de la ruta <span style={{ color: '#ef4444' }}>*</span></span>
                <input
                  type="text"
                  className="pl-input"
                  placeholder="Ej: Onboarding Ventas — Pasante"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  autoFocus
                />
              </label>

              <label className="pl-label">
                Descripción
                <textarea
                  className="pl-input"
                  style={{ resize: 'vertical', minHeight: '52px' }}
                  rows={2}
                  placeholder="Breve descripción de esta ruta de onboarding"
                  value={form.descripcion || ''}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="pl-label">
                  <span>Tipo <span style={{ color: '#ef4444' }}>*</span></span>
                  <div className="pl-dropdown-wrap">
                    <button
                      type="button"
                      className={`pl-dropdown-trigger${dropTipo ? ' open' : ''}`}
                      onClick={() => { setDropTipo(!dropTipo); setDropArea(false); setDropCargo(false) }}
                    >
                      <span>{form.tipo}</span>
                      <ChevronDown size={14} className="pl-dropdown-chevron" />
                    </button>
                    {dropTipo && (
                      <div className="pl-dropdown-menu">
                        {tiposRuta.map(t => (
                          <button
                            key={t}
                            type="button"
                            className={`pl-dropdown-item${form.tipo === t ? ' selected' : ''}`}
                            onClick={() => { setForm({ ...form, tipo: t }); setDropTipo(false) }}
                          >
                            <span>{t}</span>
                            {form.tipo === t && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pl-label">
                  <span>Sucursal <span style={{ color: '#ef4444' }}>*</span></span>
                  <div className="pl-dropdown-wrap">
                    <button
                      type="button"
                      className={`pl-dropdown-trigger${dropSucursal ? ' open' : ''}`}
                      onClick={() => { setDropSucursal(!dropSucursal); setDropTipo(false); setDropArea(false); setDropCargo(false) }}
                    >
                      <span>{form.sucursal}</span>
                      <ChevronDown size={14} className="pl-dropdown-chevron" />
                    </button>
                    {dropSucursal && (
                      <div className="pl-dropdown-menu" style={{ maxHeight: 220, overflowY: 'auto' }}>
                        {['Todas las sucursales', ...sucursales].map(s => (
                          <button
                            key={s}
                            type="button"
                            className={`pl-dropdown-item${form.sucursal === s ? ' selected' : ''}`}
                            onClick={() => { setForm({ ...form, sucursal: s }); setDropSucursal(false) }}
                          >
                            <span>{s}</span>
                            {form.sucursal === s && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="pl-label">
                  <span>Área <span style={{ color: '#ef4444' }}>*</span></span>
                  <div className="pl-dropdown-wrap">
                    <input
                      type="text"
                      className="pl-input"
                      placeholder="Buscar área…"
                      value={dropArea ? areaSearch : form.area}
                      onFocus={() => { setAreaSearch(''); setDropArea(true); setDropTipo(false); setDropSucursal(false); setDropCargo(false) }}
                      onChange={e => { setAreaSearch(e.target.value); if (!dropArea) setDropArea(true) }}
                      onBlur={() => setDropArea(false)}
                    />
                    {dropArea && (
                      <div className="pl-dropdown-menu" onMouseDown={e => e.preventDefault()}>
                        {['Todas las áreas', ...areas].filter(a => a.toLowerCase().includes(areaSearch.toLowerCase())).map(a => (
                          <button
                            key={a}
                            type="button"
                            className={`pl-dropdown-item${form.area === a ? ' selected' : ''}`}
                            onClick={() => { setForm({ ...form, area: a, cargo: '' }); setAreaSearch(''); setDropArea(false) }}
                          >
                            <span>{a}</span>
                            {form.area === a && <Check size={14} />}
                          </button>
                        ))}
                        {['Todas las áreas', ...areas].filter(a => a.toLowerCase().includes(areaSearch.toLowerCase())).length === 0 && (
                          <div style={{ padding: '8px 9px', fontSize: 11.5, color: 'var(--text-muted)' }}>Sin resultados</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pl-label">
                  <span>Cargo <span style={{ color: '#ef4444' }}>*</span></span>
                  <div className="pl-dropdown-wrap">
                    <input
                      type="text"
                      className="pl-input"
                      placeholder={form.area === 'Todas las áreas' ? 'Todos los cargos' : 'Buscar cargo…'}
                      disabled={form.area === 'Todas las áreas'}
                      value={dropCargo ? cargoSearch : form.cargo}
                      onFocus={() => { setCargoSearch(''); setDropCargo(true); setDropArea(false); setDropTipo(false); setDropSucursal(false) }}
                      onChange={e => { setCargoSearch(e.target.value); if (!dropCargo) setDropCargo(true) }}
                      onBlur={() => setDropCargo(false)}
                      style={form.area === 'Todas las áreas' ? { opacity: 0.5, cursor: 'default' } : undefined}
                    />
                    {dropCargo && form.area !== 'Todas las áreas' && (
                      <div className="pl-dropdown-menu" onMouseDown={e => e.preventDefault()}>
                        {(cargosPorArea[form.area] || []).filter(c => c.toLowerCase().includes(cargoSearch.toLowerCase())).map(c => (
                          <button
                            key={c}
                            type="button"
                            className={`pl-dropdown-item${form.cargo === c ? ' selected' : ''}`}
                            onClick={() => { setForm({ ...form, cargo: c }); setCargoSearch(''); setDropCargo(false) }}
                          >
                            <span>{c}</span>
                            {form.cargo === c && <Check size={14} />}
                          </button>
                        ))}
                        {(cargosPorArea[form.area] || []).filter(c => c.toLowerCase().includes(cargoSearch.toLowerCase())).length === 0 && (
                          <div style={{ padding: '8px 9px', fontSize: 11.5, color: 'var(--text-muted)' }}>Sin resultados</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isAdmin && modal === 'crear' && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 4,
                  padding: '10px 12px', borderRadius: 10, background: 'var(--bg-secondary)',
                }}>
                  <Info size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Una vez creada, podrás establecerla como <strong style={{ color: '#0C2D40' }}>ruta general</strong> desde el menú de acciones si quieres que sus etapas se antepongan a todas las demás rutas.
                  </span>
                </div>
              )}
            </div>

            <div className="pl-modal-footer">
              <button className="pl-btn-cancel" onClick={() => setModal(null)}>Cancelar</button>
              <button
                className="pl-btn-save"
                onClick={handleSave}
                disabled={!form.name.trim() || !form.tipo || !form.area || (form.area !== 'Todas las áreas' && !form.cargo)}
              >
                {modal === 'crear' ? 'Crear y diseñar ruta' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VISTA PREVIA DE RUTA */}
      {previewRuta && (previewRuta._isSouly ? (
        <PlantillaPreviewModal
          plantilla={previewRuta}
          onClose={() => setPreviewRuta(null)}
          onUseTemplate={() => { setPreviewRuta(null); applyTemplate(previewRuta) }}
        />
      ) : (
        <RutaFullPreviewModal
          plantilla={previewRuta}
          responsables={responsables[previewRuta.id] || []}
          canManage={isAdmin || isManager}
          onAddPersona={(persona) => addResponsable(previewRuta.id, persona)}
          onRemovePersona={(name) => removeResponsable(previewRuta.id, name)}
          onClose={() => setPreviewRuta(null)}
          canEdit={previewRuta._versionPreview ? false : canEditRuta(previewRuta)}
          onEdit={previewRuta._versionPreview ? undefined : () => { setActiveJourney({ ...previewRuta, isEditingExisting: true }); setPreviewRuta(null) }}
        />
      ))}

      {/* MODAL HISTORIAL DE VERSIONES */}
      {historialRuta && (() => {
        const versiones = [...(historialRuta.versiones || [])].sort((a, b) => b.v - a.v)
        const countFor = (v) => asignaciones.filter(a => (a.rutaId === historialRuta.id || a.ruta === historialRuta.name) && a.version === v).length
        return (
          <div className="pl-overlay" onClick={() => setHistorialRuta(null)}>
            <div className="pl-modal" style={{ maxWidth: 520, maxHeight: '82vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <History size={15} color="#fff" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 15 }}>Historial de versiones</h2>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>{historialRuta.name}</div>
                  </div>
                </div>
                <button className="pl-modal-close" onClick={() => setHistorialRuta(null)}><X size={18} /></button>
              </div>
              <div className="pl-modal-body" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {versiones.map(ver => {
                  const actual = ver.v === historialRuta.versionActual
                  const n = countFor(ver.v)
                  return (
                    <div key={ver.v} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: actual ? '1.5px solid #0C2D40' : '1px solid var(--border-soft)', background: actual ? '#f8fafc' : '#fff' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#0C2D40' }}>v{ver.v}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0C2D40' }}>Versión {ver.v}</span>
                          {actual && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: '#0C2D40', color: '#fff' }}>Actual</span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{ver.fecha} · {ver.autor} · {ver.etapas} etapas · {ver.tareas} tareas</div>
                        <div style={{ fontSize: 10.5, color: n > 0 ? '#0C2D40' : 'var(--text-muted)', fontWeight: n > 0 ? 600 : 400, marginTop: 2 }}>{n} {n === 1 ? 'colaborador' : 'colaboradores'} en esta versión</div>
                      </div>
                      <button onClick={() => setPreviewRuta({ ...historialRuta, name: `${historialRuta.name} — v${ver.v}`, etapasData: ver.etapasData, _versionPreview: true })} style={{ height: 30, padding: '0 14px', borderRadius: 8, border: '1px solid var(--border-soft)', background: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#0C2D40', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}><Eye size={12} /> Ver</button>
                    </div>
                  )
                })}
                {versiones.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: 20 }}>Sin versiones registradas.</div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL ASIGNAR RUTA */}
      {asignarModal && (
        <AsignarRutaModal
          onClose={() => setAsignarModal(null)}
          onConfirm={handleAsignarRuta}
          preselectedRutaId={asignarModal.id}
        />
      )}

      {/* MODAL CONFIRMAR RUTA GENERAL */}
      {rutaGeneralConfirm && (() => {
        const willBeGlobal = !rutaGeneralConfirm.esGlobal
        const anteriorGeneral = willBeGlobal && rutaGeneral && rutaGeneral.id !== rutaGeneralConfirm.id ? rutaGeneral : null
        return (
          <div className="pl-overlay" onClick={() => setRutaGeneralConfirm(null)}>
            <div className="pl-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={15} color="#fff" />
                  </div>
                  <h2 style={{ margin: 0, fontSize: 15 }}>{anteriorGeneral ? 'Ya hay una ruta general' : willBeGlobal ? 'Establecer como ruta general' : 'Quitar como ruta general'}</h2>
                </div>
                <button className="pl-modal-close" onClick={() => setRutaGeneralConfirm(null)}><X size={18} /></button>
              </div>
              {anteriorGeneral ? (
                <>
                  <div className="pl-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                      Solo puede haber <strong>una</strong> ruta general a la vez, y actualmente lo es <strong>"{anteriorGeneral.name}"</strong>.
                    </p>
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '12px 14px', borderRadius: 10,
                      background: '#fffbeb', border: '1px solid #fde68a',
                    }}>
                      <Info size={15} style={{ color: '#b45309', flexShrink: 0, marginTop: 1 }} />
                      <p style={{ margin: 0, fontSize: 11.5, color: '#b45309', lineHeight: 1.6 }}>
                        Para establecer <strong>"{rutaGeneralConfirm.name}"</strong> como ruta general, primero ve a la fila de <strong>"{anteriorGeneral.name}"</strong> y quítala como ruta general desde su menú de acciones.
                      </p>
                    </div>
                  </div>
                  <div className="pl-modal-footer">
                    <button className="pl-btn-save" onClick={() => setRutaGeneralConfirm(null)}>Entendido</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="pl-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                      {willBeGlobal
                        ? <>Estás por convertir <strong>"{rutaGeneralConfirm.name}"</strong> en la ruta general.</>
                        : <><strong>"{rutaGeneralConfirm.name}"</strong> dejará de ser la ruta general.</>}
                    </p>
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '12px 14px', borderRadius: 10,
                      background: willBeGlobal ? '#f0f9ff' : 'var(--bg-secondary)',
                      border: willBeGlobal ? '1px solid #dbeafe' : '1px solid var(--border-soft)',
                    }}>
                      <Info size={15} style={{ color: willBeGlobal ? '#1e40af' : 'var(--text-muted)', flexShrink: 0, marginTop: 1 }} />
                      <p style={{ margin: 0, fontSize: 11.5, color: willBeGlobal ? '#1e40af' : 'var(--text-muted)', lineHeight: 1.6 }}>
                        {willBeGlobal
                          ? <><strong>¿Qué es la ruta general?</strong> Sus etapas se insertan, protegidas, al inicio de <strong>todas</strong> las demás rutas activas. Todo colaborador que reciba cualquier ruta también recibirá primero estas etapas — ideal para contenido obligatorio para toda la empresa, como cultura, bienvenida o políticas generales.</>
                          : <>Sus etapas dejarán de insertarse automáticamente en las demás rutas. Las rutas que ya las incluían mantendrán su contenido actual hasta que las edites.</>}
                      </p>
                    </div>
                  </div>
                  <div className="pl-modal-footer">
                    <button className="pl-btn-cancel" onClick={() => setRutaGeneralConfirm(null)}>Cancelar</button>
                    <button className="pl-btn-save" onClick={() => toggleGlobal(rutaGeneralConfirm)}>
                      {willBeGlobal ? 'Establecer como ruta general' : 'Quitar como ruta general'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      })()}

      {/* MODAL ELIMINAR */}
      {deleteTarget && (
        <div className="pl-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="pl-modal-body" style={{ textAlign: 'center', padding: '32px 28px 20px' }}>
              <div className="pl-del-icon">
                <AlertTriangle size={28} />
              </div>
              <h2 className="pl-del-title">Eliminar ruta</h2>
              <p className="pl-del-desc">
                ¿Estás seguro de eliminar <strong>{deleteTarget.name}</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="pl-modal-footer" style={{ justifyContent: 'center' }}>
              <button className="pl-btn-cancel" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className="pl-btn-delete" onClick={handleDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ETAPAS */}
      {etapasModal && (() => {
        const etapasData = {
          1: ['Mi primera semana', 'Conoce Ventas', 'Primer mes'],
          2: ['Inducción comercial', 'Producto y clientes', 'Autonomía'],
          3: ['Liderazgo corporativo', 'Gestión de equipos', 'Plan estratégico'],
          5: ['Setup técnico', 'Arquitectura', 'Código y deploy', 'Certificación'],
        }
        const list = etapasData[etapasModal.id] || Array.from({ length: etapasModal.etapas }, (_, i) => `Etapa ${i + 1}`)
        return (
          <div className="pl-overlay" onClick={() => setEtapasModal(null)}>
            <div className="pl-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div>
                  <h2 style={{ margin: 0, fontSize: 15 }}>Etapas</h2>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{etapasModal.name}</span>
                </div>
                <button className="pl-modal-close" onClick={() => setEtapasModal(null)}><X size={18} /></button>
              </div>
              <div className="pl-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {list.map((etapa, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                    borderBottom: i < list.length - 1 ? '1px solid var(--surface-hover)' : 'none',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-hover)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                    }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40' }}>{etapa}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Día {i * 7 + 1} — Día {(i + 1) * 7}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL TAREAS */}
      {tareasModal && (() => {
        const tareasData = {
          1: [
            { name: 'Recorrido presencial', tipo: 'Recorrido', obligatoria: true },
            { name: 'Video "Así trabajamos"', tipo: 'Video', obligatoria: false },
            { name: 'Evaluación — Conoce tu área', tipo: 'Prueba', obligatoria: true },
            { name: 'Manual de funciones', tipo: 'Documento', obligatoria: false },
            { name: 'Demo del producto', tipo: 'Video', obligatoria: true },
            { name: 'Tutorial CRM', tipo: 'Video', obligatoria: true },
            { name: 'Práctica en CRM', tipo: 'Formulario', obligatoria: true },
            { name: 'Prueba de producto', tipo: 'Prueba', obligatoria: true },
          ],
          5: [
            { name: 'Setup de entorno', tipo: 'Documento', obligatoria: true },
            { name: 'Arquitectura del sistema', tipo: 'Video', obligatoria: true },
            { name: 'Primer PR', tipo: 'Tarea', obligatoria: true },
            { name: 'Code review', tipo: 'Tarea', obligatoria: true },
            { name: 'Deploy a staging', tipo: 'Tarea', obligatoria: true },
            { name: 'Evaluación técnica', tipo: 'Prueba', obligatoria: true },
          ],
        }
        const list = tareasData[tareasModal.id] || Array.from({ length: Math.min(tareasModal.tareas, 8) }, (_, i) => ({ name: `Tarea ${i + 1}`, tipo: 'Tarea', obligatoria: i % 2 === 0 }))
        const tipoColor = { Video: '#3b82f6', Prueba: '#f59e0b', Documento: '#f97316', Recorrido: '#d946ef', Formulario: '#10b981', Tarea: '#64748b' }
        return (
          <div className="pl-overlay" onClick={() => setTareasModal(null)}>
            <div className="pl-modal" style={{ maxWidth: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div>
                  <h2 style={{ margin: 0, fontSize: 15 }}>Tareas</h2>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{tareasModal.name} · {tareasModal.tareas} tareas</span>
                </div>
                <button className="pl-modal-close" onClick={() => setTareasModal(null)}><X size={18} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 16px' }}>
                {list.map((t, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
                    borderBottom: i < list.length - 1 ? '1px solid #f8fafc' : 'none',
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: tipoColor[t.tipo] || '#94a3b8', flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#0C2D40' }}>{t.name}</div>
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 5,
                      background: `${tipoColor[t.tipo] || '#94a3b8'}12`, color: tipoColor[t.tipo] || '#94a3b8',
                    }}>{t.tipo}</span>
                    {t.obligatoria && (
                      <span style={{ fontSize: 8, fontWeight: 700, color: '#ef4444', background: '#fef2f2', padding: '2px 5px', borderRadius: 4 }}>Req.</span>
                    )}
                  </div>
                ))}
                {tareasModal.tareas > list.length && (
                  <div style={{ padding: '10px 0', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
                    +{tareasModal.tareas - list.length} tareas más
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL ASIGNADOS */}
      {asignadosModal && (() => {
        const asignadosData = {
          1: [
            { name: 'Camila Herrera', cargo: 'Pasante Comercial', area: 'Ventas', pct: 42, initials: 'CH', color: '#f97316' },
            { name: 'Sofía Ramírez', cargo: 'Pasante Comercial', area: 'Ventas', pct: 0, initials: 'SR', color: '#f59e0b' },
            { name: 'Nicolás Paredes', cargo: 'Pasante Comercial', area: 'Ventas', pct: 73, initials: 'NP', color: '#0d9488' },
            { name: 'Andrea Ríos', cargo: 'Pasante Comercial', area: 'Ventas', pct: 35, initials: 'AR', color: '#06b6d4' },
            { name: 'Pablo Guzmán', cargo: 'Pasante Comercial', area: 'Ventas', pct: 88, initials: 'PG', color: '#8b5cf6' },
            { name: 'Laura Mendoza', cargo: 'Pasante Comercial', area: 'Ventas', pct: 15, initials: 'LM', color: '#ec4899' },
            { name: 'Martín Castro', cargo: 'Pasante Comercial', area: 'Ventas', pct: 60, initials: 'MC', color: '#10b981' },
            { name: 'Valentina Rojas', cargo: 'Pasante Comercial', area: 'Ventas', pct: 100, initials: 'VR', color: '#d946ef' },
          ],
          2: [
            { name: 'Isabella Vargas', cargo: 'Ejecutivo Comercial', area: 'Comercial', pct: 55, initials: 'IV', color: '#8b5cf6' },
            { name: 'Emilio Castañeda', cargo: 'Ejecutivo Comercial', area: 'Comercial', pct: 20, initials: 'EC', color: '#3b82f6' },
          ],
          5: [
            { name: 'Diego Morales', cargo: 'Desarrollador Backend', area: 'Tecnología', pct: 68, initials: 'DM', color: '#3b82f6' },
            { name: 'Facundo Medina', cargo: 'Desarrollador Backend', area: 'Tecnología', pct: 15, initials: 'FM', color: '#ef4444' },
            { name: 'Renata Soria', cargo: 'Frontend Developer', area: 'Tecnología', pct: 30, initials: 'RS', color: '#8b5cf6' },
            { name: 'Andrés Villanueva', cargo: 'Backend Developer', area: 'Tecnología', pct: 10, initials: 'AV', color: '#06b6d4' },
          ],
        }
        const list = asignadosData[asignadosModal.id] || [{ name: 'Colaborador asignado', cargo: asignadosModal.cargo || '', area: asignadosModal.area, pct: 50, initials: 'CA', color: 'var(--text-muted)' }]
        const filtered = list.filter(u => u.name.toLowerCase().includes(asignadosSearch.toLowerCase()) || u.cargo.toLowerCase().includes(asignadosSearch.toLowerCase()))

        return (
          <div className="pl-overlay" onClick={() => { setAsignadosModal(null); setAsignadosSearch('') }}>
            <div className="pl-modal" style={{ maxWidth: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div>
                  <h2 style={{ margin: 0, fontSize: 15 }}>Colaboradores asignados</h2>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{asignadosModal.name} · {list.length} persona{list.length !== 1 ? 's' : ''}</span>
                </div>
                <button className="pl-modal-close" onClick={() => { setAsignadosModal(null); setAsignadosSearch('') }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '12px 24px 0' }}>
                <div className="pl-search-wrap" style={{ flex: 'none' }}>
                  <Search size={13} className="pl-search-ico" />
                  <input type="text" className="pl-search" placeholder="Buscar colaborador..." value={asignadosSearch} onChange={e => setAsignadosSearch(e.target.value)} />
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {filtered.map((u, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8, background: '#fff',
                    borderBottom: '1px solid #f8fafc',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: u.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{u.initials}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40' }}>{u.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u.cargo}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: u.pct === 100 ? '#00E091' : '#0C2D40' }}>{u.pct}%</div>
                      <div style={{
                        width: 50, height: 4, borderRadius: 99, background: 'var(--surface-hover)', marginTop: 3,
                      }}>
                        <div style={{
                          height: '100%', width: `${u.pct}%`, borderRadius: 99,
                          background: u.pct === 100 ? '#00E091' : u.pct > 50 ? '#3b82f6' : '#f59e0b',
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>No se encontraron colaboradores</div>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
