import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import {
  Search, Plus, LayoutTemplate, Copy, Pencil, Trash2, X, AlertTriangle, Filter, CheckCircle2,
  LayoutGrid, List, MoreHorizontal, ChevronDown, Check, UserPlus, Users, Archive, Route
} from 'lucide-react'
import JourneyBuilder from './JourneyBuilder'
import rutaImg from '../../assets/imagenes/ruta.webp'

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

const plantillasInit = [
  { id: 1, name: 'Onboarding Ventas — Pasante', area: 'Ventas', cargo: 'Pasante Comercial', etapas: 12, tareas: 34, asignados: 8, status: 'activa', updated: 'Hace 2 días', color: '#3b82f6' },
  { id: 2, name: 'Onboarding Comercial — Ejecutivo', area: 'Comercial', cargo: 'Ejecutivo Comercial', etapas: 10, tareas: 28, asignados: 5, status: 'activa', updated: 'Hace 5 días', color: '#10b981' },
  { id: 3, name: 'Onboarding Liderazgo', area: 'Dirección', cargo: 'Director de Área', etapas: 8, tareas: 22, asignados: 2, status: 'activa', updated: 'Hace 1 semana', color: '#8b5cf6' },
  { id: 4, name: 'Onboarding Operaciones', area: 'Operaciones', cargo: 'Analista de Procesos', etapas: 9, tareas: 25, asignados: 3, status: 'activa', updated: 'Hace 1 semana', color: '#f59e0b' },
  { id: 5, name: 'Onboarding Tech — Backend', area: 'Tecnología', cargo: 'Desarrollador Backend', etapas: 14, tareas: 40, asignados: 4, status: 'activa', updated: 'Hace 3 días', color: '#06b6d4' },
  { id: 6, name: 'Onboarding Finanzas', area: 'Finanzas', cargo: 'Analista Financiera', etapas: 7, tareas: 18, asignados: 0, status: 'borrador', updated: 'Ayer', color: '#f97316' },
  { id: 7, name: 'Onboarding Diseño & UX', area: 'Diseño', cargo: 'Diseñadora UX/UI', etapas: 11, tareas: 30, asignados: 2, status: 'activa', updated: 'Hace 4 días', color: '#ec4899' },
  { id: 8, name: 'Onboarding RRHH — Generalista', area: 'Recursos Humanos', cargo: 'Generalista RRHH', etapas: 6, tareas: 15, asignados: 0, status: 'borrador', updated: 'Hace 2 semanas', color: '#0d9488' },
  { id: 9, name: 'Onboarding Marketing Digital', area: 'Marketing', cargo: 'Content Creator', etapas: 10, tareas: 26, asignados: 1, status: 'activa', updated: 'Hace 6 días', color: '#d946ef' },
  { id: 10, name: 'Onboarding Legal 2025', area: 'Legal', cargo: 'Abogado Corporativo', etapas: 5, tareas: 12, asignados: 0, status: 'archivada', updated: 'Hace 3 meses', color: '#64748b' },
]

export default function Plantillas() {
  const { currentUser } = useUser()
  const navigate = useNavigate()
  const isManager = currentUser.role === 'manager'
  const isAuxiliar = currentUser.role === 'auxiliar'
  const isAreaRole = isManager || isAuxiliar
  const managerArea = 'Marketing'

  const [plantillas, setPlantillas] = useState(
    isAreaRole ? plantillasInit.filter(p => p.area === managerArea) : plantillasInit
  )
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todas')
  const [filterArea, setFilterArea] = useState('todas')
  const [filterCargo, setFilterCargo] = useState('todos')
  const [showRutaFilters, setShowRutaFilters] = useState(false)
  const [rfDropStatus, setRfDropStatus] = useState(false)
  const [rfDropArea, setRfDropArea] = useState(false)
  const [rfDropCargo, setRfDropCargo] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [cardMenu, setCardMenu] = useState(null)

  const [activeJourney, setActiveJourney] = useState(null)
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [asignadosModal, setAsignadosModal] = useState(null)
  const [asignadosSearch, setAsignadosSearch] = useState('')
  const [etapasModal, setEtapasModal] = useState(null)
  const [tareasModal, setTareasModal] = useState(null)

  const [form, setForm] = useState({ name: '', area: isManager ? managerArea : 'Ventas', cargo: '', status: 'borrador' })
  const [dropArea, setDropArea] = useState(false)
  const [dropCargo, setDropCargo] = useState(false)
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

  const hasRutaFilters = filterStatus !== 'todas' || filterArea !== 'todas' || filterCargo !== 'todos'
  const cargosDeArea = [...new Set(plantillas.filter(p => filterArea === 'todas' || p.area === filterArea).map(p => p.cargo).filter(Boolean))]
  const filtered = plantillas.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.area.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'todas' || p.status === filterStatus
    const matchArea = filterArea === 'todas' || p.area === filterArea
    const matchCargo = filterCargo === 'todos' || p.cargo === filterCargo
    return matchSearch && matchStatus && matchArea && matchCargo
  })
  function clearRutaFilters() { setFilterStatus('todas'); setFilterArea('todas'); setFilterCargo('todos') }

  const totalTareas = plantillas.reduce((s, p) => s + p.tareas, 0)
  const totalActivas = plantillas.filter(p => p.status === 'activa').length
  const totalBorrador = plantillas.filter(p => p.status === 'borrador').length
  const totalArchivadas = plantillas.filter(p => p.status === 'archivada').length

  function openCreate() {
    setForm({ name: '', area: 'Ventas', cargo: '' })
    setDropArea(false)
    setDropCargo(false)
    setModal('crear')
  }

  function openEdit(p) {
    setForm({ name: p.name, area: p.area, cargo: p.cargo || '', id: p.id })
    setModal('editar')
  }

  function handleSave() {
    if (!form.name.trim()) return

    if (modal === 'crear') {
      const newId = Math.max(...plantillas.map(p => p.id), 0) + 1
      const color = colores[newId % colores.length]
      const newPlantilla = {
        id: newId,
        name: form.name.trim(),
        area: form.area,
        cargo: form.cargo || '',
        etapas: 0,
        tareas: 0,
        asignados: 0,
        status: 'borrador',
        updated: 'Ahora',
        color,
      }
      setPlantillas([...plantillas, newPlantilla])
      setModal(null)
      setActiveJourney({ ...newPlantilla, isNew: true })
    } else {
      setPlantillas(plantillas.map(p =>
        p.id === form.id ? { ...p, name: form.name.trim(), area: form.area, updated: 'Ahora' } : p
      ))
      setModal(null)
    }
  }

  function handleDuplicate(p) {
    const newId = Math.max(...plantillas.map(x => x.id)) + 1
    setPlantillas([...plantillas, {
      ...p,
      id: newId,
      name: `${p.name} (copia)`,
      asignados: 0,
      status: 'borrador',
      updated: 'Ahora',
    }])
  }

  function confirmDelete(p) {
    setDeleteTarget(p)
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
      />
    )
  }

  return (
    <div className="content-scroll">

      {/* HEADER */}
      <div className="pl-header">
        <div>
          <h1 className="pl-title">{isAreaRole ? `Rutas — ${managerArea}` : 'Rutas de Onboarding'}</h1>
          <p className="pl-subtitle">{isAreaRole ? 'Rutas de onboarding de tu área' : 'Administra y organiza tus rutas de onboarding'}</p>
        </div>
        {!isAreaRole && (
          <button className="pl-btn-new" onClick={openCreate}>
            <Plus size={15} />
            Nueva ruta
          </button>
        )}
      </div>

      {/* KPI STRIP */}
      <div className="kpi-strip">
        <div className="kpi-card">
          <div className="kpi-title" style={{ color: 'var(--blue)' }}>Rutas totales</div>
          <div className="kpi-val">{plantillas.length}</div>
          <div className="kpi-lbl">Creadas en la plataforma</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title" style={{ color: 'var(--green)' }}>Activas</div>
          <div className="kpi-val">{totalActivas}</div>
          <div className="kpi-lbl">En uso actualmente</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title" style={{ color: 'var(--yellow)' }}>En borrador</div>
          <div className="kpi-val">{totalBorrador}</div>
          <div className="kpi-lbl">Pendientes de activar</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title" style={{ color: '#64748b' }}>Archivadas</div>
          <div className="kpi-val">{totalArchivadas}</div>
          <div className="kpi-lbl">Fuera de uso</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title" style={{ color: 'var(--purple)' }}>Tareas en total</div>
          <div className="kpi-val">{totalTareas}</div>
          <div className="kpi-lbl">Distribuidas en todas las rutas</div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="pl-toolbar">
        <div className="pl-search-wrap">
          <Search size={14} className="pl-search-ico" />
          <input
            type="text"
            className="pl-search"
            placeholder="Buscar ruta por nombre o área…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={() => setShowRutaFilters(true)} style={{
          height: 38, padding: '0 14px', borderRadius: 8,
          border: hasRutaFilters ? '1.5px solid #0C2D40' : '1px solid #e2e8f0',
          background: hasRutaFilters ? '#f0f9ff' : '#fff',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
          color: hasRutaFilters ? '#0C2D40' : '#64748b',
        }}>
          <Filter size={13} />
          Filtros
          {hasRutaFilters && (
            <span style={{
              width: 16, height: 16, borderRadius: '50%', background: '#0C2D40',
              color: '#fff', fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {[filterStatus !== 'todas', filterArea !== 'todas', filterCargo !== 'todos'].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* CHIPS FILTROS */}
        {hasRutaFilters && (
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {filterStatus !== 'todas' && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 6px 3px 8px', borderRadius: 20, background: filterStatus === 'activa' ? '#f0fdf4' : filterStatus === 'borrador' ? '#fef3c7' : '#f1f5f9', color: filterStatus === 'activa' ? '#166534' : filterStatus === 'borrador' ? '#92400e' : '#475569', display: 'flex', alignItems: 'center', gap: 3 }}>
                {{ activa: 'Activas', borrador: 'Borrador', archivada: 'Archivadas' }[filterStatus]}
                <button onClick={() => setFilterStatus('todas')} style={{ width: 14, height: 14, borderRadius: '50%', border: 'none', background: filterStatus === 'activa' ? '#bbf7d0' : filterStatus === 'borrador' ? '#fde68a' : '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={8} style={{ color: filterStatus === 'activa' ? '#166534' : filterStatus === 'borrador' ? '#92400e' : '#475569' }} /></button>
              </span>
            )}
            {filterArea !== 'todas' && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 6px 3px 8px', borderRadius: 20, background: '#eff6ff', color: '#1e40af', display: 'flex', alignItems: 'center', gap: 3 }}>
                {filterArea}
                <button onClick={() => { setFilterArea('todas'); setFilterCargo('todos') }} style={{ width: 14, height: 14, borderRadius: '50%', border: 'none', background: '#dbeafe', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={8} style={{ color: '#1e40af' }} /></button>
              </span>
            )}
            {filterCargo !== 'todos' && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 6px 3px 8px', borderRadius: 20, background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', gap: 3 }}>
                {filterCargo}
                <button onClick={() => setFilterCargo('todos')} style={{ width: 14, height: 14, borderRadius: '50%', border: 'none', background: '#fde68a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={8} style={{ color: '#92400e' }} /></button>
              </span>
            )}
            <button onClick={clearRutaFilters} style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Limpiar</button>
          </div>
        )}

        {/* MODAL FILTROS RUTAS */}
        {showRutaFilters && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowRutaFilters(false)}>
            <div style={{ background: '#fff', borderRadius: 16, width: 400, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,.15)', animation: 'plSlideUp .15s' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Filter size={16} style={{ color: '#0C2D40' }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0C2D40' }}>Filtrar rutas</span>
                </div>
                <button onClick={() => setShowRutaFilters(false)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} style={{ color: '#64748b' }} />
                </button>
              </div>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }} onClick={() => { setRfDropStatus(false); setRfDropArea(false); setRfDropCargo(false) }}>
                {/* ESTADO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Estado</span>
                  <div className="pl-dropdown-wrap">
                    <button type="button" className={`pl-dropdown-trigger${rfDropStatus ? ' open' : ''}${filterStatus === 'todas' ? ' placeholder' : ''}`} onClick={e => { e.stopPropagation(); setRfDropStatus(!rfDropStatus); setRfDropArea(false); setRfDropCargo(false) }}>
                      <span>{{ todas: 'Todos los estados', activa: 'Activas', borrador: 'Borrador', archivada: 'Archivadas' }[filterStatus]}</span>
                      <ChevronDown size={14} className="pl-dropdown-chevron" />
                    </button>
                    {rfDropStatus && (
                      <div className="pl-dropdown-menu">
                        {[{ key: 'todas', label: 'Todos los estados' }, { key: 'activa', label: 'Activas' }, { key: 'borrador', label: 'Borrador' }, { key: 'archivada', label: 'Archivadas' }].map(f => (
                          <button key={f.key} type="button" className={`pl-dropdown-item${filterStatus === f.key ? ' selected' : ''}`} onClick={() => { setFilterStatus(f.key); setRfDropStatus(false) }}>
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
                    <button type="button" className={`pl-dropdown-trigger${rfDropArea ? ' open' : ''}${filterArea === 'todas' ? ' placeholder' : ''}`} onClick={e => { e.stopPropagation(); setRfDropArea(!rfDropArea); setRfDropStatus(false); setRfDropCargo(false) }}>
                      <span>{filterArea === 'todas' ? 'Todas las áreas' : filterArea}</span>
                      <ChevronDown size={14} className="pl-dropdown-chevron" />
                    </button>
                    {rfDropArea && (
                      <div className="pl-dropdown-menu">
                        {['todas', ...new Set(plantillas.map(p => p.area))].map(a => (
                          <button key={a} type="button" className={`pl-dropdown-item${filterArea === a ? ' selected' : ''}`} onClick={() => { setFilterArea(a); setFilterCargo('todos'); setRfDropArea(false) }}>
                            <span>{a === 'todas' ? 'Todas las áreas' : a}</span>
                            {filterArea === a && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* CARGO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Cargo</span>
                  <div className="pl-dropdown-wrap">
                    <button type="button" className={`pl-dropdown-trigger${rfDropCargo ? ' open' : ''}${filterCargo === 'todos' ? ' placeholder' : ''}`} onClick={e => { e.stopPropagation(); setRfDropCargo(!rfDropCargo); setRfDropStatus(false); setRfDropArea(false) }}>
                      <span>{filterCargo === 'todos' ? 'Todos los cargos' : filterCargo}</span>
                      <ChevronDown size={14} className="pl-dropdown-chevron" />
                    </button>
                    {rfDropCargo && (
                      <div className="pl-dropdown-menu" style={{ maxHeight: 180, overflowY: 'auto' }}>
                        {['todos', ...cargosDeArea].map(c => (
                          <button key={c} type="button" className={`pl-dropdown-item${filterCargo === c ? ' selected' : ''}`} onClick={() => { setFilterCargo(c); setRfDropCargo(false) }}>
                            <span>{c === 'todos' ? 'Todos los cargos' : c}</span>
                            {filterCargo === c && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 24px', borderTop: '1px solid #f1f5f9' }}>
                <button onClick={clearRutaFilters} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#ef4444' }}>Limpiar filtros</button>
                <button onClick={() => setShowRutaFilters(false)} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: '#0C2D40', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700 }}>Aplicar filtros</button>
              </div>
            </div>
          </div>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3 }}>
          {[{ key: 'grid', icon: LayoutGrid }, { key: 'list', icon: List }].map(v => {
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
        {filtered.map((p) => (
          <div key={p.id} className="pl-card" style={{ overflow: 'visible', position: 'relative', padding: 0 }}>
            {/* HEADER */}
            <div style={{ padding: '14px 16px 12px', background: '#f8fafc', borderRadius: '14px 14px 0 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                  border: '2px solid #e2e8f0',
                }}>
                  <img src={rutaImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <span className={`pl-status ${p.status === 'activa' ? 'pl-st-activa' : p.status === 'archivada' ? 'pl-st-archivada' : 'pl-st-borrador'}`}>
                    {{ activa: 'Activa', borrador: 'Borrador', archivada: 'Archivada' }[p.status]}
                  </span>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setCardMenu(cardMenu === p.id ? null : p.id)}
                      style={{
                        width: 24, height: 24, borderRadius: 6, border: 'none',
                        background: cardMenu === p.id ? '#f1f5f9' : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#94a3b8', fontFamily: 'inherit',
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
                        {[
                          { icon: Pencil, label: 'Editar', color: '#475569', fn: () => { openEdit(p); setCardMenu(null) } },
                          { icon: Copy, label: 'Duplicar', color: '#475569', fn: () => { handleDuplicate(p); setCardMenu(null) } },
                          { icon: Archive, label: p.status === 'archivada' ? 'Desarchivar' : 'Archivar', color: '#64748b', fn: () => { setPlantillas(prev => prev.map(x => x.id === p.id ? { ...x, status: x.status === 'archivada' ? 'borrador' : 'archivada' } : x)); setCardMenu(null) } },
                          { icon: Trash2, label: 'Eliminar', color: '#ef4444', fn: () => { confirmDelete(p); setCardMenu(null) } },
                        ].map(a => {
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
                  <span style={{ fontSize: 10, color: '#475569' }}>{p.area}</span>
                </div>
                {p.cargo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    <span style={{ fontSize: 10, color: '#475569' }}>{p.cargo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* MÉTRICAS */}
            <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div style={{ cursor: 'pointer' }} onClick={() => setEtapasModal(p)}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0C2D40' }}>{p.etapas}</div>
                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>Etapas</div>
              </div>
              <div style={{ width: 1, background: '#f1f5f9' }} />
              <div style={{ cursor: 'pointer' }} onClick={() => setTareasModal(p)}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0C2D40' }}>{p.tareas}</div>
                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>Tareas</div>
              </div>
              <div style={{ width: 1, background: '#f1f5f9' }} />
              <div style={{ cursor: p.asignados > 0 ? 'pointer' : 'default' }} onClick={() => p.asignados > 0 && setAsignadosModal(p)}>
                <div style={{ fontSize: 18, fontWeight: 800, color: p.asignados > 0 ? '#0C2D40' : '#cbd5e1' }}>{p.asignados}</div>
                <div style={{ fontSize: 9, color: p.asignados > 0 ? '#3b82f6' : '#94a3b8', fontWeight: 600 }}>Asignados</div>
              </div>
            </div>

            {/* RESPONSABLES — solo visible para manager */}
            {isManager && (
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8, marginTop: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Responsables</span>
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
                      background: '#f8fafc', border: '1px solid #f1f5f9',
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: r.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <span style={{ color: '#fff', fontSize: 7, fontWeight: 700 }}>{r.initials}</span>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 600, color: '#475569' }}>{r.name.split(' ')[0]}</span>
                      {r.role !== 'Líder de área' && (
                        <button onClick={(e) => { e.stopPropagation(); removeResponsable(p.id, r.name) }} style={{
                          width: 12, height: 12, borderRadius: '50%', border: 'none',
                          background: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: 0, marginLeft: -2,
                        }}>
                          <X size={7} style={{ color: '#94a3b8' }} />
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
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', marginBottom: 4, padding: '0 4px' }}>Equipo de {managerArea}</div>
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
                          <div style={{ fontSize: 8, color: '#94a3b8' }}>{e.cargo}</div>
                        </div>
                      </button>
                    ))}
                    {equipoMarketing.filter(e => !(responsables[p.id] || []).find(r => r.name === e.name)).length === 0 && (
                      <div style={{ fontSize: 9, color: '#94a3b8', padding: '6px 4px', textAlign: 'center' }}>Todos asignados</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* BADGE AUXILIAR — delegado por */}
            {isAuxiliar && (
              <div style={{
                borderTop: '1px solid #f1f5f9', paddingTop: 8, marginTop: 2,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Users size={11} style={{ color: '#14b8a6' }} />
                <span style={{ fontSize: 9, color: '#64748b' }}>Acceso delegado por <strong style={{ color: '#0C2D40' }}>{currentUser.delegadoPor}</strong></span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 10, color: '#b0b8c4' }}>{p.updated}</span>
              <button onClick={() => setActiveJourney(p)} style={{
                padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0',
                background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 10, fontWeight: 600, color: '#0C2D40',
                display: 'flex', alignItems: 'center', gap: 4,
                transition: 'all .12s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#0C2D40'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#0C2D40' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#0C2D40'; e.currentTarget.style.borderColor = '#e2e8f0' }}
              >
                Ver ruta
                <ChevronDown size={10} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* VISTA LISTA */}
      {viewMode === 'list' && (
        <div className="as-table-wrap">
          <table className="as-table">
            <thead>
              <tr>
                <th>Ruta</th>
                <th>Área</th>
                <th>Etapas</th>
                <th>Tareas</th>
                <th>Asignados</th>
                <th>Estado</th>
                <th>Actualización</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setActiveJourney(p)}>
                  <td>
                    <div className="as-name">{p.name}</div>
                  </td>
                  <td><span className="as-ruta">{p.area}</span></td>
                  <td><span className="as-dia">{p.etapas}</span></td>
                  <td><span className="as-dia">{p.tareas}</span></td>
                  <td><span className="as-dia">{p.asignados}</span></td>
                  <td>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                      background: p.status === 'activa' ? '#f0fdf4' : p.status === 'archivada' ? '#f1f5f9' : '#fef3c7',
                      color: p.status === 'activa' ? '#16a34a' : p.status === 'archivada' ? '#64748b' : '#b45309',
                    }}>
                      {{ activa: 'Activa', borrador: 'Borrador', archivada: 'Archivada' }[p.status]}
                    </span>
                  </td>
                  <td><span className="as-fecha">{p.updated}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="pl-action" onClick={() => openEdit(p)}><Pencil size={12} /></button>
                      <button className="pl-action" onClick={() => handleDuplicate(p)}><Copy size={12} /></button>
                      <button className="pl-action pl-action-del" onClick={() => confirmDelete(p)}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 30, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>No se encontraron rutas</div>
          )}
        </div>
      )}

      {viewMode === 'grid' && filtered.length === 0 && (
        <div className="pl-empty">
          <LayoutTemplate size={40} strokeWidth={1.2} />
          <div className="pl-empty-title">No se encontraron rutas</div>
          <div className="pl-empty-desc">Intenta con otro término de búsqueda o filtro</div>
        </div>
      )}

      <div style={{ height: '8px' }} />

      {/* MODAL CREAR / EDITAR */}
      {modal && (
        <div className="pl-overlay" onClick={() => setModal(null)}>
          <div className="pl-modal" onClick={e => e.stopPropagation()}>
            <div className="pl-modal-header">
              <h2>{modal === 'crear' ? 'Nueva ruta' : 'Editar ruta'}</h2>
              <button className="pl-modal-close" onClick={() => setModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="pl-modal-body">
              <label className="pl-label">
                Nombre de la ruta
                <input
                  type="text"
                  className="pl-input"
                  placeholder="Ej: Onboarding Ventas — Pasante"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  autoFocus
                />
              </label>

              <div className="pl-label">
                Área
                <div className="pl-dropdown-wrap">
                  <button
                    type="button"
                    className={`pl-dropdown-trigger${dropArea ? ' open' : ''}`}
                    onClick={() => { setDropArea(!dropArea); setDropCargo(false) }}
                  >
                    <span>{form.area}</span>
                    <ChevronDown size={14} className="pl-dropdown-chevron" />
                  </button>
                  {dropArea && (
                    <div className="pl-dropdown-menu">
                      {areas.map(a => (
                        <button
                          key={a}
                          type="button"
                          className={`pl-dropdown-item${form.area === a ? ' selected' : ''}`}
                          onClick={() => { setForm({ ...form, area: a, cargo: '' }); setDropArea(false) }}
                        >
                          <span>{a}</span>
                          {form.area === a && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pl-label">
                Cargo
                <div className="pl-dropdown-wrap">
                  <button
                    type="button"
                    className={`pl-dropdown-trigger${dropCargo ? ' open' : ''}${!form.cargo ? ' placeholder' : ''}`}
                    onClick={() => { setDropCargo(!dropCargo); setDropArea(false) }}
                  >
                    <span>{form.cargo || 'Seleccionar cargo'}</span>
                    <ChevronDown size={14} className="pl-dropdown-chevron" />
                  </button>
                  {dropCargo && (
                    <div className="pl-dropdown-menu">
                      {(cargosPorArea[form.area] || []).map(c => (
                        <button
                          key={c}
                          type="button"
                          className={`pl-dropdown-item${form.cargo === c ? ' selected' : ''}`}
                          onClick={() => { setForm({ ...form, cargo: c }); setDropCargo(false) }}
                        >
                          <span>{c}</span>
                          {form.cargo === c && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pl-modal-footer">
              <button className="pl-btn-cancel" onClick={() => setModal(null)}>Cancelar</button>
              <button
                className="pl-btn-save"
                onClick={handleSave}
                disabled={!form.name.trim()}
              >
                {modal === 'crear' ? 'Crear y diseñar ruta' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{etapasModal.name}</span>
                </div>
                <button className="pl-modal-close" onClick={() => setEtapasModal(null)}><X size={18} /></button>
              </div>
              <div className="pl-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {list.map((etapa, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                    borderBottom: i < list.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      fontSize: 10, fontWeight: 700, color: '#94a3b8',
                    }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40' }}>{etapa}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>Día {i * 7 + 1} — Día {(i + 1) * 7}</div>
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
            { name: 'Evaluación — Conoce tu área', tipo: 'Cuestionario', obligatoria: true },
            { name: 'Manual de funciones', tipo: 'Documento', obligatoria: false },
            { name: 'Demo del producto', tipo: 'Video', obligatoria: true },
            { name: 'Tutorial CRM', tipo: 'Video', obligatoria: true },
            { name: 'Práctica en CRM', tipo: 'Formulario', obligatoria: true },
            { name: 'Cuestionario de producto', tipo: 'Cuestionario', obligatoria: true },
          ],
          5: [
            { name: 'Setup de entorno', tipo: 'Documento', obligatoria: true },
            { name: 'Arquitectura del sistema', tipo: 'Video', obligatoria: true },
            { name: 'Primer PR', tipo: 'Tarea', obligatoria: true },
            { name: 'Code review', tipo: 'Tarea', obligatoria: true },
            { name: 'Deploy a staging', tipo: 'Tarea', obligatoria: true },
            { name: 'Evaluación técnica', tipo: 'Cuestionario', obligatoria: true },
          ],
        }
        const list = tareasData[tareasModal.id] || Array.from({ length: Math.min(tareasModal.tareas, 8) }, (_, i) => ({ name: `Tarea ${i + 1}`, tipo: 'Tarea', obligatoria: i % 2 === 0 }))
        const tipoColor = { Video: '#3b82f6', Cuestionario: '#f59e0b', Documento: '#f97316', Recorrido: '#d946ef', Formulario: '#10b981', Tarea: '#64748b' }
        return (
          <div className="pl-overlay" onClick={() => setTareasModal(null)}>
            <div className="pl-modal" style={{ maxWidth: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div>
                  <h2 style={{ margin: 0, fontSize: 15 }}>Tareas</h2>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{tareasModal.name} · {tareasModal.tareas} tareas</span>
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
                  <div style={{ padding: '10px 0', fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>
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
        const list = asignadosData[asignadosModal.id] || [{ name: 'Colaborador asignado', cargo: asignadosModal.cargo || '', area: asignadosModal.area, pct: 50, initials: 'CA', color: '#94a3b8' }]
        const filtered = list.filter(u => u.name.toLowerCase().includes(asignadosSearch.toLowerCase()) || u.cargo.toLowerCase().includes(asignadosSearch.toLowerCase()))

        return (
          <div className="pl-overlay" onClick={() => { setAsignadosModal(null); setAsignadosSearch('') }}>
            <div className="pl-modal" style={{ maxWidth: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div>
                  <h2 style={{ margin: 0, fontSize: 15 }}>Colaboradores asignados</h2>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{asignadosModal.name} · {list.length} persona{list.length !== 1 ? 's' : ''}</span>
                </div>
                <button className="pl-modal-close" onClick={() => { setAsignadosModal(null); setAsignadosSearch('') }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '12px 24px 0' }}>
                <div className="pl-search-wrap" style={{ flex: 'none' }}>
                  <Search size={14} className="pl-search-ico" />
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
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{u.cargo}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: u.pct === 100 ? '#10b981' : '#0C2D40' }}>{u.pct}%</div>
                      <div style={{
                        width: 50, height: 4, borderRadius: 99, background: '#f1f5f9', marginTop: 3,
                      }}>
                        <div style={{
                          height: '100%', width: `${u.pct}%`, borderRadius: 99,
                          background: u.pct === 100 ? '#10DC97' : u.pct > 50 ? '#3b82f6' : '#f59e0b',
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>No se encontraron colaboradores</div>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
