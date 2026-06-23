import { useState } from 'react'
import { useUser } from '../../context/UserContext'
import {
  Search, Plus, LayoutTemplate, Copy, Pencil, Trash2, X, AlertTriangle, Filter, CheckCircle2,
  LayoutGrid, List, MoreHorizontal, ChevronDown, Check, UserPlus, Users
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
  { id: 1, name: 'Onboarding Ventas — Pasante', area: 'Ventas', etapas: 12, tareas: 34, asignados: 8, status: 'activa', updated: 'Hace 2 días', color: '#3b82f6' },
  { id: 2, name: 'Onboarding Comercial — Ejecutivo', area: 'Comercial', etapas: 10, tareas: 28, asignados: 5, status: 'activa', updated: 'Hace 5 días', color: '#10b981' },
  { id: 3, name: 'Onboarding Liderazgo', area: 'Dirección', etapas: 8, tareas: 22, asignados: 2, status: 'activa', updated: 'Hace 1 semana', color: '#8b5cf6' },
  { id: 4, name: 'Onboarding Operaciones', area: 'Operaciones', etapas: 9, tareas: 25, asignados: 3, status: 'activa', updated: 'Hace 1 semana', color: '#f59e0b' },
  { id: 5, name: 'Onboarding Tech — Backend', area: 'Tecnología', etapas: 14, tareas: 40, asignados: 4, status: 'activa', updated: 'Hace 3 días', color: '#06b6d4' },
  { id: 6, name: 'Onboarding Finanzas', area: 'Finanzas', etapas: 7, tareas: 18, asignados: 0, status: 'borrador', updated: 'Ayer', color: '#f97316' },
  { id: 7, name: 'Onboarding Diseño & UX', area: 'Diseño', etapas: 11, tareas: 30, asignados: 2, status: 'activa', updated: 'Hace 4 días', color: '#ec4899' },
  { id: 8, name: 'Onboarding RRHH — Generalista', area: 'Recursos Humanos', etapas: 6, tareas: 15, asignados: 0, status: 'borrador', updated: 'Hace 2 semanas', color: '#0d9488' },
  { id: 9, name: 'Onboarding Marketing Digital', area: 'Marketing', etapas: 10, tareas: 26, asignados: 1, status: 'activa', updated: 'Hace 6 días', color: '#d946ef' },
]

export default function Plantillas() {
  const { currentUser } = useUser()
  const isManager = currentUser.role === 'manager'
  const isAuxiliar = currentUser.role === 'auxiliar'
  const isAreaRole = isManager || isAuxiliar
  const managerArea = 'Marketing'

  const [plantillas, setPlantillas] = useState(
    isAreaRole ? plantillasInit.filter(p => p.area === managerArea) : plantillasInit
  )
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todas')
  const [showFilterDrop, setShowFilterDrop] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [cardMenu, setCardMenu] = useState(null)

  const [activeJourney, setActiveJourney] = useState(null)
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

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

  const filtered = plantillas.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.area.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'todas' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalTareas = plantillas.reduce((s, p) => s + p.tareas, 0)
  const totalActivas = plantillas.filter(p => p.status === 'activa').length
  const totalBorrador = plantillas.filter(p => p.status === 'borrador').length

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
          {filterStatus !== 'todas' && (
            <div style={{
              height: 32, padding: '0 8px 0 10px', borderRadius: 8,
              background: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 600, color: '#475569',
            }}>
              {filterStatus === 'activa' ? 'Activas' : 'Borrador'}
              <button
                onClick={() => setFilterStatus('todas')}
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
              zIndex: 30, minWidth: 170, animation: 'plSlideUp .12s',
            }}>
              {[
                { key: 'todas', label: 'Todas', color: '#0C2D40' },
                { key: 'activa', label: 'Activas', color: '#16a34a' },
                { key: 'borrador', label: 'Borrador', color: '#f59e0b' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => { setFilterStatus(f.key); setShowFilterDrop(false) }}
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
                  {f.key !== 'todas' && (
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                  )}
                  <span style={{ flex: 1 }}>{f.label}</span>
                  {filterStatus === f.key && <CheckCircle2 size={13} style={{ color: '#10b981' }} />}
                </button>
              ))}
            </div>
          )}
        </div>
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
          <div key={p.id} className="pl-card">
            <div className="pl-card-top">
              <span className={`pl-status ${p.status === 'activa' ? 'pl-st-activa' : 'pl-st-borrador'}`}>
                {p.status === 'activa' ? 'Activa' : 'Borrador'}
              </span>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setCardMenu(cardMenu === p.id ? null : p.id)}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: 'none',
                    background: cardMenu === p.id ? '#f1f5f9' : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#94a3b8', fontFamily: 'inherit',
                  }}
                >
                  <MoreHorizontal size={16} />
                </button>
                {cardMenu === p.id && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: 4,
                    background: '#fff', borderRadius: 10, padding: 4,
                    boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid #e2e8f0',
                    zIndex: 20, minWidth: 150, animation: 'plSlideUp .12s',
                  }}>
                    {[
                      { icon: Pencil, label: 'Editar', color: '#475569', fn: () => { openEdit(p); setCardMenu(null) } },
                      { icon: Copy, label: 'Duplicar', color: '#475569', fn: () => { handleDuplicate(p); setCardMenu(null) } },
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

            <div onClick={() => setActiveJourney(p)} style={{ cursor: 'pointer' }}>
              <div className="pl-card-title">{p.name}</div>
              <div className="pl-card-area">{p.area}</div>
            </div>

            <div className="pl-card-metrics">
              <div className="pl-metric">
                <div className="pl-metric-val">{p.etapas}</div>
                <div className="pl-metric-lbl">Etapas</div>
              </div>
              <div className="pl-metric-sep" />
              <div className="pl-metric">
                <div className="pl-metric-val">{p.tareas}</div>
                <div className="pl-metric-lbl">Tareas</div>
              </div>
              <div className="pl-metric-sep" />
              <div className="pl-metric">
                <div className="pl-metric-val">{p.asignados}</div>
                <div className="pl-metric-lbl">Asignados</div>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
              <span className="pl-card-time">{p.updated}</span>
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
                      background: p.status === 'activa' ? '#f0fdf4' : '#fef3c7',
                      color: p.status === 'activa' ? '#16a34a' : '#b45309',
                    }}>
                      {p.status === 'activa' ? 'Activa' : 'Borrador'}
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
    </div>
  )
}
