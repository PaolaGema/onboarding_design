import { useState, useRef } from 'react'
import {
  Upload, FolderOpen, FileText, FileCheck, Loader2, AlertCircle,
  Plus, Trash2, RefreshCw, Search, X, ChevronLeft, ChevronRight, ChevronDown, Check,
  MoreVertical, Pencil, Video, Headphones, Link2, ExternalLink,
  LayoutGrid, List, Filter, CheckCircle2, Globe, Eye
} from 'lucide-react'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { useUser } from '../../context/UserContext'
import EmptyState from '../layout/EmptyState'
import ConfirmarAccionModal from '../layout/ConfirmarAccionModal'
import { ACCEPT_TODOS, tipoDeArchivo, pesoLegible } from '../../utils/tareaTipos'
import { nuevaClaveArchivo, guardarArchivo } from '../../utils/archivosLocales'
import { useArchivoLocal } from '../../hooks/useArchivoLocal'

const estadoConfig = {
  procesado: { label: 'Procesado', color: '#00E091', bg: '#f0fdf4', icon: FileCheck },
  procesando: { label: 'Procesando', color: '#f59e0b', bg: '#fef3c7', icon: Loader2 },
  error: { label: 'Error', color: '#ef4444', bg: '#fef2f2', icon: AlertCircle },
}

let docIdCounter = 100

function DropEmptyState({ cat, totalDocs }) {
  return (
    <div style={{ padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 84, height: 84, marginBottom: 14 }}>
        <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FolderOpen size={36} strokeWidth={1.5} style={{ color: 'var(--green)' }} />
        </div>
        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 32, height: 32, borderRadius: '50%', background: '#0C2D40', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Upload size={14} style={{ color: '#fff' }} />
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40' }}>
        {totalDocs === 0 ? 'Aún no tienes archivos' : `La carpeta "${cat.name}" está vacía`}
      </div>
      <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '4px 0 0', maxWidth: 300 }}>
        Suelta archivos aquí o usa el botón <strong style={{ color: '#475569' }}>"Nuevo"</strong>
      </p>
    </div>
  )
}

function parseSizeToBytes(sizeStr) {
  const m = String(sizeStr || '').trim().match(/^([\d.]+)\s*(KB|MB|GB)$/i)
  if (!m) return null
  const mult = { KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 }[m[2].toUpperCase()]
  return parseFloat(m[1]) * mult
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function folderSize(cat) {
  const bytes = cat.docs.map(d => parseSizeToBytes(d.size)).filter(b => b !== null)
  if (bytes.length === 0) return '—'
  return formatBytes(bytes.reduce((s, b) => s + b, 0))
}

function formatRelativeDate(ts) {
  if (!ts) return '—'
  const min = Math.floor((Date.now() - ts) / 60000)
  if (min < 1) return 'Ahora'
  if (min < 60) return `Hace ${min} min`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `Hace ${hr} h`
  const days = Math.floor(hr / 24)
  if (days < 30) return `Hace ${days} d`
  return new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function RecursosLibrary({ categorias, setCategorias, title, subtitle, scopeLabel = 'onboarding' }) {
  const { addFeedEntry } = useOnboardingData()
  const { currentUser } = useUser()
  const [selCat, setSelCat] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [docMenu, setDocMenu] = useState(null)
  const [docMenuPos, setDocMenuPos] = useState(null)
  const [catMenu, setCatMenu] = useState(null)
  const [editingCat, setEditingCat] = useState(null)
  const [deleteCatConfirm, setDeleteCatConfirm] = useState(null)
  const [deleteDocConfirm, setDeleteDocConfirm] = useState(null)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterGeneral, setFilterGeneral] = useState('todos')
  const [showBibFilters, setShowBibFilters] = useState(false)
  const [showNewMenu, setShowNewMenu] = useState(false)
  const [sortBy, setSortBy] = useState('fecha-desc')
  const [contextMenu, setContextMenu] = useState(null)
  const [bfDropTipo, setBfDropTipo] = useState(false)
  const [bfDropEstado, setBfDropEstado] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)
  /* Se pide acá arriba y no dentro del modal porque el modal se dibuja desde una función
     condicional, y un hook adentro cambiaría de orden entre renders. Con la clave en null
     el hook no hace nada. */
  const archivoUrl = useArchivoLocal(previewDoc?.archivo)
  const [bfDropGeneral, setBfDropGeneral] = useState(false)
  const [linkForm, setLinkForm] = useState({ name: '', url: '', tipo: 'video' })
  const [dragOverMain, setDragOverMain] = useState(false)
  const [dropFolderIdx, setDropFolderIdx] = useState(null)
  const fileInputRef = useRef(null)
  const dragCounterRef = useRef(0)

  const cat = selCat !== null ? categorias[selCat] : null
  const totalDocs = categorias.reduce((s, c) => s + c.docs.length, 0)

  const hasBibFilters = filterTipo !== 'todos' || filterEstado !== 'todos' || filterGeneral !== 'todos'
  const filteredDocs = !cat ? [] : cat.docs.filter(d => {
    if (!d.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterTipo === 'documentos' && d.tipo && d.tipo !== 'documento') return false
    if (filterTipo === 'videos' && d.tipo !== 'video') return false
    if (filterTipo === 'audios' && d.tipo !== 'audio') return false
    if (filterTipo === 'presentaciones' && !d.name.match(/\.pptx?$/i)) return false
    if (filterEstado !== 'todos' && d.estado !== filterEstado) return false
    if (filterGeneral === 'si' && !d.general) return false
    if (filterGeneral === 'no' && d.general) return false
    return true
  }).sort((a, b) => {
    if (sortBy === 'fecha-desc') return b.id - a.id
    if (sortBy === 'fecha-asc') return a.id - b.id
    if (sortBy === 'nombre-asc') return a.name.localeCompare(b.name)
    if (sortBy === 'nombre-desc') return b.name.localeCompare(a.name)
    if (sortBy === 'tamaño') return parseFloat(b.size) - parseFloat(a.size)
    if (sortBy === 'tipo') return (a.name.split('.').pop() || '').localeCompare(b.name.split('.').pop() || '')
    return 0
  })
  const filteredCats = categorias
    .map((c, i) => ({ ...c, idx: i }))
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  function clearBibFilters() { setFilterTipo('todos'); setFilterEstado('todos'); setFilterGeneral('todos'); setPage(1) }

  const perPage = 8
  const totalPages = Math.ceil(filteredDocs.length / perPage)
  const paginatedDocs = filteredDocs.slice((page - 1) * perPage, page * perPage)

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  function handleFiles(files, targetCatIdx = selCat) {
    /* El `tipo` se deduce del archivo y no se asume "documento": desde que se pueden subir
       videos y audios, es lo que decide el ícono, la etiqueta de la tarjeta y si la tarea de
       video puede elegirlo. Sin esto un MP4 entraría a la biblioteca disfrazado de PDF. */
    const newDocs = Array.from(files).map(file => {
      // El binario se guarda aparte, en IndexedDB; el recurso solo lleva su clave.
      const archivo = nuevaClaveArchivo()
      guardarArchivo(archivo, file)
      return {
        id: ++docIdCounter,
        name: file.name,
        size: pesoLegible(file.size),
        tipo: tipoDeArchivo(file),
        archivo,
        estado: 'procesando',
        fecha: 'Ahora',
        general: false,
        subidoPor: currentUser?.name || null,
      }
    })
    setCategorias(prev => prev.map((c, i) => {
      if (i !== targetCatIdx) return c
      return { ...c, docs: [...newDocs, ...c.docs], updatedAt: Date.now() }
    }))
    const ids = newDocs.map(d => d.id)
    const targetName = categorias[targetCatIdx]?.name
    newDocs.forEach(d => addFeedEntry(`Nuevo recurso "${d.name}" subido a ${targetName}`))
    setTimeout(() => {
      setCategorias(prev => prev.map(c => ({
        ...c,
        docs: c.docs.map(d => ids.includes(d.id) ? { ...d, estado: 'procesado' } : d),
      })))
    }, 3000)
  }

  function moveDoc(docId, targetCatIdx) {
    let movedDoc = null
    let sourceCatIdx = -1
    categorias.forEach((c, i) => {
      const found = c.docs.find(d => d.id === docId)
      if (found) { movedDoc = found; sourceCatIdx = i }
    })
    if (!movedDoc || sourceCatIdx === targetCatIdx) return
    setCategorias(prev => prev.map((c, i) => {
      if (i === sourceCatIdx) return { ...c, docs: c.docs.filter(d => d.id !== docId), updatedAt: Date.now() }
      if (i === targetCatIdx) return { ...c, docs: [movedDoc, ...c.docs], updatedAt: Date.now() }
      return c
    }))
    addFeedEntry(`"${movedDoc.name}" movido a ${categorias[targetCatIdx].name}`)
  }

  function saveLink() {
    if (!linkForm.name.trim() || !linkForm.url.trim()) return
    const newDoc = {
      id: ++docIdCounter,
      name: linkForm.name.trim(),
      size: linkForm.tipo === 'video' ? 'Video' : 'Audio',
      estado: 'procesado',
      fecha: 'Ahora',
      tipo: linkForm.tipo,
      url: linkForm.url.trim(),
      subidoPor: currentUser?.name || null,
    }
    setCategorias(prev => prev.map((c, i) => {
      if (i !== selCat) return c
      return { ...c, docs: [...c.docs, newDoc], updatedAt: Date.now() }
    }))
    setShowLinkModal(false)
    setLinkForm({ name: '', url: '', tipo: 'video' })
  }

  function deleteDoc(docId) {
    setCategorias(prev => prev.map(c => {
      if (!c.docs.some(d => d.id === docId)) return c
      return { ...c, docs: c.docs.filter(d => d.id !== docId), updatedAt: Date.now() }
    }))
    setDocMenu(null)
  }

  function toggleGeneral(docId) {
    setCategorias(prev => prev.map(c => ({
      ...c,
      docs: c.docs.map(d => d.id === docId ? { ...d, general: !d.general } : d),
    })))
    setDocMenu(null)
  }

  function addCategoria() {
    if (!newCatName.trim()) return
    setCategorias(prev => [...prev, {
      name: newCatName.trim(), docs: [],
      creadoPor: currentUser?.name || null, updatedAt: Date.now(),
    }])
    setNewCatName('')
    setShowNewCat(false)
  }

  function renameCategoria(idx, newName) {
    if (!newName.trim()) return
    setCategorias(prev => prev.map((c, i) => i === idx ? { ...c, name: newName.trim(), updatedAt: Date.now() } : c))
    setEditingCat(null)
  }

  function deleteCategoria(idx) {
    setCategorias(prev => prev.filter((_, i) => i !== idx))
    setSelCat(prev => (prev === idx ? null : prev > idx ? prev - 1 : prev))
    setCatMenu(null)
  }

  return (
    <div className="content-scroll">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT_TODOS}
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files.length) handleFiles(e.target.files); e.target.value = '' }}
      />

      <div className="pl-header">
        <div>
          <h1 className="pl-title">{title}</h1>
          <p className="pl-subtitle">{subtitle}</p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="pl-toolbar">
        <div className="pl-search-wrap">
          <Search size={13} className="pl-search-ico" />
          <input
            type="text"
            className="pl-search"
            placeholder={cat ? 'Buscar documento por nombre…' : 'Buscar carpeta por nombre…'}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        {cat && (
        <button onClick={() => setShowBibFilters(true)} style={{
          height: 38, padding: '0 14px', borderRadius: 8,
          border: hasBibFilters ? '1.5px solid #0C2D40' : '1px solid #e2e8f0',
          background: hasBibFilters ? '#f0f9ff' : '#fff',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
          color: hasBibFilters ? '#0C2D40' : '#64748b',
        }}>
          <Filter size={13} />
          Filtros
          {hasBibFilters && (
            <span style={{
              width: 16, height: 16, borderRadius: '50%', background: '#0C2D40',
              color: '#fff', fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {[filterTipo !== 'todos', filterEstado !== 'todos', filterGeneral !== 'todos'].filter(Boolean).length}
            </span>
          )}
        </button>
        )}

        {/* CHIPS FILTROS ACTIVOS */}
        {hasBibFilters && (
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {filterTipo !== 'todos' && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 6px 3px 8px', borderRadius: 20, background: '#eff6ff', color: '#1e40af', display: 'flex', alignItems: 'center', gap: 3 }}>
                {{ documentos: 'Documentos', videos: 'Videos', audios: 'Audios', presentaciones: 'PPT' }[filterTipo]}
                <button onClick={() => setFilterTipo('todos')} style={{ width: 14, height: 14, borderRadius: '50%', border: 'none', background: '#dbeafe', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={8} style={{ color: '#1e40af' }} /></button>
              </span>
            )}
            {filterEstado !== 'todos' && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 6px 3px 8px', borderRadius: 20, background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', gap: 3 }}>
                {filterEstado === 'procesado' ? 'Procesados' : 'Procesando'}
                <button onClick={() => setFilterEstado('todos')} style={{ width: 14, height: 14, borderRadius: '50%', border: 'none', background: '#fde68a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={8} style={{ color: '#92400e' }} /></button>
              </span>
            )}
            {filterGeneral !== 'todos' && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 6px 3px 8px', borderRadius: 20, background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', gap: 3 }}>
                {filterGeneral === 'si' ? 'Generales' : `Solo ${scopeLabel}`}
                <button onClick={() => setFilterGeneral('todos')} style={{ width: 14, height: 14, borderRadius: '50%', border: 'none', background: '#ccfbf1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={8} style={{ color: '#0d9488' }} /></button>
              </span>
            )}
            <button onClick={clearBibFilters} style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Limpiar</button>
          </div>
        )}

        {/* MODAL FILTROS RECURSOS */}
        {showBibFilters && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowBibFilters(false)}>
            <div style={{ background: '#fff', borderRadius: 16, width: 400, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,.15)', animation: 'plSlideUp .15s' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Filter size={16} style={{ color: '#0C2D40' }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0C2D40' }}>Filtrar recursos</span>
                </div>
                <button onClick={() => setShowBibFilters(false)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} style={{ color: '#64748b' }} />
                </button>
              </div>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }} onClick={() => { setBfDropTipo(false); setBfDropEstado(false); setBfDropGeneral(false) }}>
                {/* TIPO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Tipo de archivo</span>
                  <div className="pl-dropdown-wrap">
                    <button type="button" className={`pl-dropdown-trigger${bfDropTipo ? ' open' : ''}${filterTipo === 'todos' ? ' placeholder' : ''}`} onClick={e => { e.stopPropagation(); setBfDropTipo(!bfDropTipo); setBfDropEstado(false); setBfDropGeneral(false) }}>
                      <span>{{ todos: 'Todos los tipos', documentos: 'Documentos', presentaciones: 'Presentaciones', videos: 'Videos', audios: 'Audios' }[filterTipo]}</span>
                      <ChevronDown size={14} className="pl-dropdown-chevron" />
                    </button>
                    {bfDropTipo && (
                      <div className="pl-dropdown-menu">
                        {[{ key: 'todos', label: 'Todos los tipos' }, { key: 'documentos', label: 'Documentos (PDF, Word)' }, { key: 'presentaciones', label: 'Presentaciones (PowerPoint)' }, { key: 'videos', label: 'Videos' }, { key: 'audios', label: 'Audios' }].map(f => (
                          <button key={f.key} type="button" className={`pl-dropdown-item${filterTipo === f.key ? ' selected' : ''}`} onClick={() => { setFilterTipo(f.key); setBfDropTipo(false) }}>
                            <span>{f.label}</span>
                            {filterTipo === f.key && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* ESTADO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Estado</span>
                  <div className="pl-dropdown-wrap">
                    <button type="button" className={`pl-dropdown-trigger${bfDropEstado ? ' open' : ''}${filterEstado === 'todos' ? ' placeholder' : ''}`} onClick={e => { e.stopPropagation(); setBfDropEstado(!bfDropEstado); setBfDropTipo(false); setBfDropGeneral(false) }}>
                      <span>{{ todos: 'Todos los estados', procesado: 'Procesados', procesando: 'Procesando' }[filterEstado]}</span>
                      <ChevronDown size={14} className="pl-dropdown-chevron" />
                    </button>
                    {bfDropEstado && (
                      <div className="pl-dropdown-menu">
                        {[{ key: 'todos', label: 'Todos los estados' }, { key: 'procesado', label: 'Procesados' }, { key: 'procesando', label: 'Procesando' }].map(f => (
                          <button key={f.key} type="button" className={`pl-dropdown-item${filterEstado === f.key ? ' selected' : ''}`} onClick={() => { setFilterEstado(f.key); setBfDropEstado(false) }}>
                            <span>{f.label}</span>
                            {filterEstado === f.key && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* VISIBILIDAD */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Visibilidad</span>
                  <div className="pl-dropdown-wrap">
                    <button type="button" className={`pl-dropdown-trigger${bfDropGeneral ? ' open' : ''}${filterGeneral === 'todos' ? ' placeholder' : ''}`} onClick={e => { e.stopPropagation(); setBfDropGeneral(!bfDropGeneral); setBfDropTipo(false); setBfDropEstado(false) }}>
                      <span>{{ todos: 'Todos', si: 'Recursos generales', no: `Solo ${scopeLabel}` }[filterGeneral]}</span>
                      <ChevronDown size={14} className="pl-dropdown-chevron" />
                    </button>
                    {bfDropGeneral && (
                      <div className="pl-dropdown-menu" style={{ top: 'auto', bottom: 'calc(100% + 6px)' }}>
                        {[{ key: 'todos', label: 'Todos' }, { key: 'si', label: 'Recursos generales' }, { key: 'no', label: `Solo ${scopeLabel}` }].map(f => (
                          <button key={f.key} type="button" className={`pl-dropdown-item${filterGeneral === f.key ? ' selected' : ''}`} onClick={() => { setFilterGeneral(f.key); setBfDropGeneral(false) }}>
                            <span>{f.label}</span>
                            {filterGeneral === f.key && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 24px', borderTop: '1px solid #f1f5f9' }}>
                <button onClick={clearBibFilters} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#ef4444' }}>Limpiar filtros</button>
                <button onClick={() => setShowBibFilters(false)} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: '#0C2D40', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700 }}>Aplicar filtros</button>
              </div>
            </div>
          </div>
        )}
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <button onClick={() => cat ? setShowNewMenu(!showNewMenu) : (setNewCatName(''), setShowNewCat(true))} style={{
            height: 38, padding: '0 16px', borderRadius: 8, border: 'none',
            background: '#0C2D40', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'inherit', fontSize: 11, fontWeight: 700,
          }}>
            <Plus size={13} color="#00E091" />
            {cat ? 'Nuevo' : 'Nueva carpeta'}
            {cat && <ChevronDown size={12} style={{ transform: showNewMenu ? 'rotate(180deg)' : 'none', transition: 'transform .12s' }} />}
          </button>
          {cat && showNewMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 29 }} onClick={() => setShowNewMenu(false)} />
              <div style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 6,
                background: '#fff', borderRadius: 10, padding: 4,
                boxShadow: '0 8px 30px rgba(0,0,0,.15)', border: '1px solid #e2e8f0',
                zIndex: 30, minWidth: 190, animation: 'plSlideUp .12s',
              }}>
                <button
                  onClick={() => { setShowNewMenu(false); openFilePicker() }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#0C2D40', fontFamily: 'inherit', textAlign: 'left', transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Upload size={14} /> Subir archivo
                </button>
                <button
                  onClick={() => { setShowNewMenu(false); setLinkForm({ name: '', url: '', tipo: 'video' }); setShowLinkModal(true) }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#3b82f6', fontFamily: 'inherit', textAlign: 'left', transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Link2 size={14} /> Agregar enlace
                </button>
              </div>
            </>
          )}
        </div>
        <div style={{
          display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3,
        }}>
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

      {/* BREADCRUMB */}
      {cat && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <button
            onClick={() => { setSelCat(null); setPage(1); setSearch('') }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#64748b', padding: '4px 6px 4px 0' }}
            onMouseEnter={e => e.currentTarget.style.color = '#0C2D40'}
            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
          >
            <ChevronLeft size={14} /> Carpetas
          </button>
          <span style={{ color: '#cbd5e1', fontSize: 12 }}>/</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40' }}>{cat.name}</span>
        </div>
      )}

      {/* VISTA DE CARPETAS (RAÍZ) */}
      {!cat && (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {viewMode === 'list' ? (
            <div className="as-table-wrap">
              <table className="as-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Documentos</th>
                    <th>Peso</th>
                    <th>Creado por</th>
                    <th>Modificado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCats.map(c => (
                    editingCat === c.idx ? (
                      <tr key={c.idx}>
                        <td colSpan={6} style={{ padding: '8px 14px' }}>
                          <input
                            defaultValue={c.name}
                            autoFocus
                            onBlur={e => renameCategoria(c.idx, e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') renameCategoria(c.idx, e.target.value); if (e.key === 'Escape') setEditingCat(null) }}
                            style={{ width: '100%', maxWidth: 320, padding: '7px 10px', border: '1.5px solid #0C2D40', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', outline: 'none', fontWeight: 600 }}
                          />
                        </td>
                      </tr>
                    ) : (
                      <tr
                        key={c.idx}
                        onClick={() => { setSelCat(c.idx); setPage(1); setSearch('') }}
                        style={{ cursor: 'pointer', ...(dropFolderIdx === c.idx ? { background: '#e6f0f7', outline: '1.5px dashed #0C2D40', outlineOffset: -2 } : {}) }}
                        onDragOver={e => {
                          if (!e.dataTransfer.types.includes('Files') && !e.dataTransfer.types.includes('application/x-doc-id')) return
                          e.preventDefault()
                          if (dropFolderIdx !== c.idx) setDropFolderIdx(c.idx)
                        }}
                        onDragLeave={() => setDropFolderIdx(prev => (prev === c.idx ? null : prev))}
                        onDrop={e => {
                          e.preventDefault()
                          setDropFolderIdx(null)
                          if (e.dataTransfer.files.length) { handleFiles(e.dataTransfer.files, c.idx); return }
                          const docId = e.dataTransfer.getData('application/x-doc-id')
                          if (docId) moveDoc(Number(docId), c.idx)
                        }}
                      >
                        <td>
                          <div className="as-person">
                            <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FolderOpen size={15} style={{ color: '#94a3b8' }} />
                            </div>
                            <div className="as-name">{c.name}</div>
                          </div>
                        </td>
                        <td><span className="as-fecha">{c.docs.length} doc{c.docs.length !== 1 ? 's' : ''}</span></td>
                        <td><span className="as-fecha">{folderSize(c)}</span></td>
                        <td>
                          {c.creadoPor ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#0C2D40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                {c.creadoPor.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <span className="as-fecha">{c.creadoPor}</span>
                            </div>
                          ) : <span className="as-fecha">—</span>}
                        </td>
                        <td><span className="as-fecha">{formatRelativeDate(c.updatedAt)}</span></td>
                        <td style={{ position: 'relative' }}>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              const rect = e.currentTarget.getBoundingClientRect()
                              setCatMenu({ idx: c.idx, x: rect.right - 150, y: rect.bottom + 4 })
                            }}
                            style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: 'inherit' }}
                          >
                            <MoreVertical size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
              {filteredCats.length === 0 && (
                <div style={{ padding: '12px 16px 16px' }}>
                  <EmptyState
                    icon={FolderOpen}
                    title={categorias.length === 0 ? 'Aún no tienes carpetas' : 'No se encontraron carpetas'}
                    description={categorias.length === 0 ? 'Crea tu primera carpeta para empezar a subir recursos.' : 'Prueba con otro nombre o crea una carpeta nueva.'}
                    actionLabel={categorias.length === 0 ? 'Nueva carpeta' : undefined}
                    actionIcon={Plus}
                    onAction={() => { setNewCatName(''); setShowNewCat(true) }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="as-table-wrap" style={{ padding: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {filteredCats.map(c => (
                <div
                  key={c.idx}
                  onClick={() => { setSelCat(c.idx); setPage(1); setSearch('') }}
                  style={{
                    background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
                    cursor: 'pointer', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10,
                    ...(dropFolderIdx === c.idx ? { background: '#e6f0f7', outline: '1.5px dashed #0C2D40', outlineOffset: -2 } : {}),
                  }}
                  onDragOver={e => {
                    if (!e.dataTransfer.types.includes('Files') && !e.dataTransfer.types.includes('application/x-doc-id')) return
                    e.preventDefault()
                    if (dropFolderIdx !== c.idx) setDropFolderIdx(c.idx)
                  }}
                  onDragLeave={() => setDropFolderIdx(prev => (prev === c.idx ? null : prev))}
                  onDrop={e => {
                    e.preventDefault()
                    setDropFolderIdx(null)
                    if (e.dataTransfer.files.length) { handleFiles(e.dataTransfer.files, c.idx); return }
                    const docId = e.dataTransfer.getData('application/x-doc-id')
                    if (docId) moveDoc(Number(docId), c.idx)
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FolderOpen size={17} style={{ color: '#94a3b8' }} />
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        const rect = e.currentTarget.getBoundingClientRect()
                        setCatMenu({ idx: c.idx, x: rect.right - 150, y: rect.bottom + 4 })
                      }}
                      style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}
                    >
                      <MoreVertical size={13} />
                    </button>
                  </div>
                  {editingCat === c.idx ? (
                    <input
                      defaultValue={c.name}
                      autoFocus
                      onClick={e => e.stopPropagation()}
                      onBlur={e => renameCategoria(c.idx, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') renameCategoria(c.idx, e.target.value); if (e.key === 'Escape') setEditingCat(null) }}
                      style={{ width: '100%', padding: '6px 8px', border: '1.5px solid #0C2D40', borderRadius: 7, fontSize: 12, fontFamily: 'inherit', outline: 'none', fontWeight: 600 }}
                    />
                  ) : (
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40' }}>{c.name}</div>
                  )}
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>{c.docs.length} doc{c.docs.length !== 1 ? 's' : ''} · {folderSize(c)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 4 }}>
                    {c.creadoPor ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#0C2D40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {c.creadoPor.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 9, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.creadoPor}</span>
                      </div>
                    ) : <span style={{ fontSize: 9, color: '#cbd5e1' }}>—</span>}
                    <span style={{ fontSize: 9, color: '#94a3b8', flexShrink: 0 }}>{formatRelativeDate(c.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
            {filteredCats.length === 0 && (
              <EmptyState
                icon={FolderOpen}
                title={categorias.length === 0 ? 'Aún no tienes carpetas' : 'No se encontraron carpetas'}
                description={categorias.length === 0 ? 'Crea tu primera carpeta para empezar a subir recursos.' : 'Prueba con otro nombre o crea una carpeta nueva.'}
                actionLabel={categorias.length === 0 ? 'Nueva carpeta' : undefined}
                actionIcon={Plus}
                onAction={() => { setNewCatName(''); setShowNewCat(true) }}
              />
            )}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO PRINCIPAL (documentos dentro de la carpeta) */}
      {cat && (
      <div
        style={{
          flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative',
          outline: dragOverMain ? '2px dashed #0C2D40' : 'none', outlineOffset: -8,
          background: dragOverMain ? 'rgba(12,45,64,0.03)' : 'transparent',
          borderRadius: dragOverMain ? 12 : 0, transition: 'background .1s',
        }}
        onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY }) }}
        onClick={() => contextMenu && setContextMenu(null)}
        onDragEnter={e => {
          if (!e.dataTransfer.types.includes('Files')) return
          e.preventDefault()
          dragCounterRef.current += 1
          setDragOverMain(true)
        }}
        onDragOver={e => { if (e.dataTransfer.types.includes('Files')) e.preventDefault() }}
        onDragLeave={e => {
          if (!e.dataTransfer.types.includes('Files')) return
          dragCounterRef.current -= 1
          if (dragCounterRef.current <= 0) { dragCounterRef.current = 0; setDragOverMain(false) }
        }}
        onDrop={e => {
          if (!e.dataTransfer.types.includes('Files')) return
          e.preventDefault()
          dragCounterRef.current = 0
          setDragOverMain(false)
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
        }}
      >
        {dragOverMain && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 40, pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              background: '#0C2D40', color: '#fff', padding: '10px 20px', borderRadius: 10,
              fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,.2)',
            }}>
              <Upload size={14} />
              Suelta para subir a "{cat.name}"
            </div>
          </div>
        )}

        {/* MENÚ CONTEXTUAL */}
        {contextMenu && (
          <div style={{
            position: 'fixed', left: contextMenu.x, top: contextMenu.y,
            background: '#fff', borderRadius: 10, padding: 4,
            boxShadow: '0 8px 30px rgba(0,0,0,.15)', border: '1px solid #e2e8f0',
            zIndex: 50, minWidth: 190, animation: 'plSlideUp .1s',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '6px 10px 4px' }}>Ordenar por</div>
            {[
              { key: 'fecha-desc', label: 'Más recientes primero' },
              { key: 'fecha-asc', label: 'Más antiguos primero' },
              { key: 'nombre-asc', label: 'Nombre (A → Z)' },
              { key: 'nombre-desc', label: 'Nombre (Z → A)' },
              { key: 'tamaño', label: 'Tamaño (mayor)' },
              { key: 'tipo', label: 'Tipo de archivo' },
            ].map(s => (
              <button key={s.key} onClick={() => { setSortBy(s.key); setContextMenu(null) }} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 10px', border: 'none', borderRadius: 7,
                background: sortBy === s.key ? '#f8fafc' : 'transparent',
                cursor: 'pointer', fontSize: 11, fontWeight: sortBy === s.key ? 600 : 400,
                color: sortBy === s.key ? '#0C2D40' : '#475569',
                fontFamily: 'inherit', textAlign: 'left', transition: 'background .1s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => { if (sortBy !== s.key) e.currentTarget.style.background = 'transparent' }}
              >
                {s.label}
                {sortBy === s.key && <CheckCircle2 size={12} style={{ color: '#00E091' }} />}
              </button>
            ))}
          </div>
        )}

          {/* VISTA GRID */}
          {viewMode === 'grid' && (
            <div className="as-table-wrap" style={{ padding: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {paginatedDocs.map(doc => {
                const est = estadoConfig[doc.estado]
                const EstIcon = est.icon
                const isMedia = doc.tipo === 'video' || doc.tipo === 'audio'
                const ext = isMedia ? (doc.tipo === 'video' ? 'VIDEO' : 'AUDIO') : doc.name.split('.').pop().toUpperCase()
                const extColor = isMedia ? '#3b82f6' : ext === 'PDF' ? '#ef4444' : ext === 'DOCX' || ext === 'DOC' ? '#3b82f6' : ext === 'PPTX' || ext === 'PPT' ? '#f97316' : '#64748b'
                const MediaIcon = doc.tipo === 'video' ? Video : doc.tipo === 'audio' ? Headphones : null
                const DocIcon = MediaIcon || FileText
                const iconColor = isMedia ? '#3b82f6' : '#94a3b8'
                const iconBg = isMedia ? '#eff6ff' : '#f8fafc'
                return (
                  <div
                    key={doc.id}
                    draggable
                    onDragStart={e => { e.dataTransfer.setData('application/x-doc-id', String(doc.id)); e.dataTransfer.effectAllowed = 'move' }}
                    style={{
                      background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
                      overflow: 'visible', cursor: 'grab', position: 'relative',
                      transition: 'border-color .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <div style={{ padding: '14px 14px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {/* Icono + tipo */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: iconBg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <DocIcon size={17} style={{ color: iconColor }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                            background: `${extColor}15`, color: extColor,
                          }}>{ext}</span>
                          <button
                            onClick={() => setDocMenu(docMenu === doc.id ? null : doc.id)}
                            style={{
                              width: 24, height: 24, borderRadius: 6, border: 'none',
                              background: docMenu === doc.id ? '#f1f5f9' : 'transparent',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#94a3b8', fontFamily: 'inherit',
                            }}
                          >
                            <MoreVertical size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Nombre */}
                      <div>
                        <div style={{
                          fontSize: 12, fontWeight: 600, color: '#0C2D40',
                          lineHeight: 1.3, overflow: 'hidden',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        }}>
                          {doc.name}
                        </div>
                        <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                          {doc.general && (
                            <span style={{
                              fontSize: 9, fontWeight: 600, color: '#0d9488',
                              background: '#f0fdfa', padding: '1px 6px', borderRadius: 4,
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                            }}>
                              <Globe size={8} /> General
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer: size + estado */}
                      {doc.subidoPor && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#0C2D40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {doc.subidoPor.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 9, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.subidoPor}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                        <span style={{ fontSize: 10, color: '#94a3b8' }}>{doc.size} · {doc.fecha}</span>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          padding: '2px 7px', borderRadius: 99,
                          background: est.bg, color: est.color,
                          fontSize: 9, fontWeight: 600,
                        }}>
                          <EstIcon size={9} className={doc.estado === 'procesando' ? 'animate-spin' : ''} />
                          {est.label}
                        </div>
                      </div>
                    </div>

                    {/* Menú dropdown */}
                    {docMenu === doc.id && (
                      <div style={{
                        position: 'absolute', right: 8, top: 50,
                        background: '#fff', borderRadius: 10, padding: 4,
                        boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid #e2e8f0',
                        zIndex: 20, minWidth: 220, animation: 'plSlideUp .12s',
                      }}>
                        {(doc.estado === 'error' || doc.estado === 'procesando') && (
                          <button onClick={() => setDocMenu(null)} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background .1s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <RefreshCw size={12} style={{ color: '#475569', marginTop: 1, flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Reprocesar</div>
                              <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Volver a procesar el documento</div>
                            </div>
                          </button>
                        )}
                        <button onClick={() => { setPreviewDoc(doc); setDocMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background .1s' }} onMouseEnter={e => e.currentTarget.style.background = '#f0f6ff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <Eye size={12} style={{ color: '#3b82f6', marginTop: 1, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#3b82f6' }}>Vista previa</div>
                            <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Ver el contenido de este recurso</div>
                          </div>
                        </button>
                        <button onClick={() => toggleGeneral(doc.id)} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background .1s' }} onMouseEnter={e => e.currentTarget.style.background = '#f0fdfa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <Globe size={12} style={{ color: doc.general ? '#94a3b8' : '#0d9488', marginTop: 1, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: doc.general ? '#94a3b8' : '#0d9488' }}>{doc.general ? 'Quitar de recursos generales' : 'Recurso general'}</div>
                            <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>{doc.general ? 'Ya no será visible para colaboradores antiguos' : `Visible para todos los colaboradores, más allá de ${scopeLabel}`}</div>
                          </div>
                        </button>
                        <div style={{ height: 1, background: '#f1f5f9', margin: '2px 6px' }} />
                        <button onClick={() => setDeleteDocConfirm(doc)} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background .1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <Trash2 size={12} style={{ color: '#ef4444', marginTop: 1, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#ef4444' }}>Eliminar</div>
                            <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Eliminar permanentemente este recurso</div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {filteredDocs.length === 0 && <DropEmptyState cat={cat} totalDocs={totalDocs} />}

            {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 4px',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {(page - 1) * perPage + 1}–{Math.min(page * perPage, filteredDocs.length)} de {filteredDocs.length} recursos
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
            </div>
          )}

          {/* VISTA LISTA */}
          {viewMode === 'list' && (
            <div className="as-table-wrap">
              <table className="as-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Subido por</th>
                    <th>Tamaño</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDocs.map(doc => {
                    const est = estadoConfig[doc.estado]
                    const EstIcon = est.icon
                    const isMedia = doc.tipo === 'video' || doc.tipo === 'audio'
                    const ext = isMedia ? (doc.tipo === 'video' ? 'VIDEO' : 'AUDIO') : doc.name.split('.').pop().toUpperCase()
                    const extColor = isMedia ? '#3b82f6' : ext === 'PDF' ? '#ef4444' : ext === 'DOCX' || ext === 'DOC' ? '#3b82f6' : ext === 'PPTX' || ext === 'PPT' ? '#f97316' : '#64748b'
                    const MediaIcon = doc.tipo === 'video' ? Video : doc.tipo === 'audio' ? Headphones : null
                    const DocIcon = MediaIcon || FileText
                    const iconColor = isMedia ? '#3b82f6' : '#94a3b8'
                    return (
                      <tr
                        key={doc.id}
                        draggable
                        onDragStart={e => { e.dataTransfer.setData('application/x-doc-id', String(doc.id)); e.dataTransfer.effectAllowed = 'move' }}
                      >
                        <td>
                          <div className="as-person">
                            <div style={{
                              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                              background: isMedia ? '#eff6ff' : '#f8fafc',
                              border: `1px solid ${isMedia ? '#bfdbfe' : '#e2e8f0'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <DocIcon size={15} style={{ color: iconColor }} />
                            </div>
                            <div>
                              <div className="as-name">{doc.name}</div>
                              <div style={{ display: 'flex', gap: 4 }}>
                                {doc.general && (
                                  <span style={{ fontSize: 9, fontWeight: 600, color: '#0d9488', background: '#f0fdfa', padding: '1px 6px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                    <Globe size={8} /> General
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td><span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: `${extColor}12`, color: extColor }}>{ext}</span></td>
                        <td>
                          {doc.subidoPor ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#0C2D40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                {doc.subidoPor.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <span className="as-fecha">{doc.subidoPor}</span>
                            </div>
                          ) : <span className="as-fecha">—</span>}
                        </td>
                        <td><span className="as-fecha">{doc.size}</span></td>
                        <td><span className="as-fecha">{doc.fecha}</span></td>
                        <td>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, background: est.bg, color: est.color, fontSize: 10, fontWeight: 600 }}>
                            <EstIcon size={10} className={doc.estado === 'procesando' ? 'animate-spin' : ''} />
                            {est.label}
                          </div>
                        </td>
                        <td style={{ position: 'relative' }}>
                          <button onClick={(e) => {
                            if (docMenu === doc.id) { setDocMenu(null); return }
                            const rect = e.currentTarget.getBoundingClientRect()
                            setDocMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
                            setDocMenu(doc.id)
                          }} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: docMenu === doc.id ? '#f1f5f9' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: 'inherit' }}>
                            <MoreVertical size={14} />
                          </button>
                          {docMenu === doc.id && docMenuPos && (
                            <div style={{ position: 'fixed', top: docMenuPos.top, right: docMenuPos.right, background: '#fff', borderRadius: 10, padding: 4, boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid #e2e8f0', zIndex: 60, minWidth: 220, animation: 'plSlideUp .12s' }}>
                              {(doc.estado === 'error' || doc.estado === 'procesando') && (
                                <button onClick={() => setDocMenu(null)} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                  <RefreshCw size={12} style={{ color: '#475569', marginTop: 1, flexShrink: 0 }} />
                                  <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Reprocesar</div>
                                    <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Volver a procesar el documento</div>
                                  </div>
                                </button>
                              )}
                              <button onClick={() => { setPreviewDoc(doc); setDocMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#f0f6ff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <Eye size={12} style={{ color: '#3b82f6', marginTop: 1, flexShrink: 0 }} />
                                <div>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: '#3b82f6' }}>Vista previa</div>
                                  <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Ver el contenido de este recurso</div>
                                </div>
                              </button>
                              <button onClick={() => toggleGeneral(doc.id)} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#f0fdfa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <Globe size={12} style={{ color: doc.general ? '#94a3b8' : '#0d9488', marginTop: 1, flexShrink: 0 }} />
                                <div>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: doc.general ? '#94a3b8' : '#0d9488' }}>{doc.general ? 'Quitar de recursos generales' : 'Recurso general'}</div>
                                  <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>{doc.general ? 'Ya no será visible para colaboradores antiguos' : `Visible para todos, más allá de ${scopeLabel}`}</div>
                                </div>
                              </button>
                              <div style={{ height: 1, background: '#f1f5f9', margin: '2px 6px' }} />
                              <button onClick={() => setDeleteDocConfirm(doc)} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <Trash2 size={12} style={{ color: '#ef4444', marginTop: 1, flexShrink: 0 }} />
                                <div>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: '#ef4444' }}>Eliminar</div>
                                  <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Eliminar permanentemente este recurso</div>
                                </div>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderTop: '1px solid var(--border-soft)',
                }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {(page - 1) * perPage + 1}–{Math.min(page * perPage, filteredDocs.length)} de {filteredDocs.length} recursos
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

              {filteredDocs.length === 0 && (
                <div style={{ padding: '12px 16px 16px' }}>
                  <DropEmptyState cat={cat} totalDocs={totalDocs} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MENÚ CONTEXTUAL CARPETA */}
      {catMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50 }}
          onClick={() => setCatMenu(null)}
        >
          <div
            style={{
              position: 'fixed', left: catMenu.x, top: catMenu.y,
              background: '#fff', borderRadius: 10, padding: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,.12)', zIndex: 51,
              minWidth: 150, animation: 'plSlideUp .12s',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => { setEditingCat(catMenu.idx); setCatMenu(null) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', border: 'none', borderRadius: 7,
                background: 'none', cursor: 'pointer', fontSize: 12,
                fontWeight: 500, color: '#475569', fontFamily: 'inherit', textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f4f7fa'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <Pencil size={13} />
              Renombrar
            </button>
            <button
              /* Antes la carpeta vacía se borraba sin preguntar. Vacía o no, borrarla es
                 igual de irreversible: lo que cambia es cuánto se pierde, no si se pierde. */
              onClick={() => { setDeleteCatConfirm(catMenu.idx); setCatMenu(null) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', border: 'none', borderRadius: 7,
                background: 'none', cursor: 'pointer', fontSize: 12,
                fontWeight: 500, color: '#ef4444', fontFamily: 'inherit', textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <Trash2 size={13} />
              Eliminar
            </button>
          </div>
        </div>
      )}

      {/* MODAL NUEVA CARPETA */}
      {showNewCat && (
        <div className="pl-overlay" onClick={() => { setShowNewCat(false); setNewCatName('') }}>
          <div className="pl-modal pl-modal-sm" style={{ padding: 0 }} onClick={e => e.stopPropagation()}>
            {/* Header navy */}
            <div style={{
              background: 'linear-gradient(135deg, #0C2D40 0%, #1a4a63 100%)',
              padding: '22px 24px 18px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FolderOpen size={22} style={{ color: '#fff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Nueva carpeta</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
                  Organiza tus recursos por tema o área
                </div>
              </div>
              <button
                onClick={() => { setShowNewCat(false); setNewCatName('') }}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: 'none', flexShrink: 0,
                  background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <X size={15} />
              </button>
            </div>
            {/* Body */}
            <div style={{ padding: '22px 24px 8px' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 8 }}>
                Nombre de la carpeta
              </label>
              <input
                type="text"
                className="pl-input"
                placeholder="Ej: Cultura organizacional"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newCatName.trim()) addCategoria()
                  if (e.key === 'Escape') { setShowNewCat(false); setNewCatName('') }
                }}
                autoFocus
              />
            </div>
            {/* Footer */}
            <div className="pl-modal-footer">
              <button className="pl-btn-cancel" onClick={() => { setShowNewCat(false); setNewCatName('') }}>Cancelar</button>
              <button
                onClick={addCategoria}
                disabled={!newCatName.trim()}
                style={{
                  padding: '9px 22px', border: 'none', borderRadius: 10, cursor: 'pointer',
                  background: newCatName.trim() ? '#0C2D40' : '#e2e8f0',
                  color: newCatName.trim() ? '#fff' : '#94a3b8',
                  fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                  transition: 'all .15s',
                }}
              >
                Crear carpeta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINAR CARPETA */}
      {deleteCatConfirm !== null && (() => {
        const catDel = categorias[deleteCatConfirm]
        if (!catDel) return null
        return (
          <ConfirmarAccionModal
            titulo="Eliminar carpeta"
            descripcion={<>
              ¿Estás seguro de eliminar <strong>{catDel.name}</strong>?
              {catDel.docs.length > 0
                ? <> Esta carpeta tiene <strong>{catDel.docs.length} documento{catDel.docs.length > 1 ? 's' : ''}</strong> que se perderán.</>
                : <> Esta acción no se puede deshacer.</>}
            </>}
            palabra="eliminar"
            textoConfirmar="Eliminar carpeta"
            onConfirmar={() => { deleteCategoria(deleteCatConfirm); setDeleteCatConfirm(null) }}
            onCancelar={() => setDeleteCatConfirm(null)}
          />
        )
      })()}

      {/* MODAL CONFIRMAR ELIMINAR DOCUMENTO */}
      {deleteDocConfirm && (
        <ConfirmarAccionModal
          titulo="Eliminar recurso"
          descripcion={<>¿Estás seguro de eliminar <strong>{deleteDocConfirm.name}</strong>? Esta acción no se puede deshacer.</>}
          palabra="eliminar"
          textoConfirmar="Eliminar"
          onConfirmar={() => { deleteDoc(deleteDocConfirm.id); setDeleteDocConfirm(null) }}
          onCancelar={() => setDeleteDocConfirm(null)}
        />
      )}

      {/* MODAL AGREGAR ENLACE */}
      {showLinkModal && (
        <div className="pl-overlay" onClick={() => setShowLinkModal(false)}>
          <div className="pl-modal pl-modal-sm" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="pl-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Link2 size={16} style={{ color: '#fff' }} />
                </div>
                <h2>Agregar enlace</h2>
              </div>
              <button className="pl-modal-close" onClick={() => setShowLinkModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="pl-modal-body" style={{ overflowY: 'auto', flex: 1 }}>
              <div className="pl-label">
                <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Tipo de contenido</span>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {[
                    { key: 'video', label: 'Video', icon: Video, color: '#3b82f6' },
                    { key: 'audio', label: 'Audio / Podcast', icon: Headphones, color: '#06b6d4' },
                  ].map(t => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setLinkForm(prev => ({ ...prev, tipo: t.key, url: '' }))}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '10px 12px', borderRadius: 10,
                        border: `1.5px solid ${linkForm.tipo === t.key ? t.color : '#e2e8f0'}`,
                        background: linkForm.tipo === t.key ? `${t.color}08` : '#fff',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all .12s',
                      }}
                    >
                      <t.icon size={16} style={{ color: linkForm.tipo === t.key ? t.color : '#94a3b8' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: linkForm.tipo === t.key ? t.color : '#64748b' }}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <label className="pl-label">
                Título
                <input
                  type="text"
                  className="pl-input"
                  placeholder={linkForm.tipo === 'video' ? 'Ej: Video de bienvenida del CEO' : 'Ej: Podcast de cultura organizacional'}
                  value={linkForm.name}
                  onChange={e => setLinkForm(prev => ({ ...prev, name: e.target.value }))}
                  autoFocus
                />
              </label>
              <label className="pl-label">
                URL del contenido
                <input
                  type="url"
                  className="pl-input"
                  placeholder="https://youtube.com/watch?v=... o https://drive.google.com/..."
                  value={linkForm.url}
                  onChange={e => setLinkForm(prev => ({ ...prev, url: e.target.value }))}
                />
              </label>

              {/* PREVIEW */}
              {linkForm.url.trim() && (() => {
                const url = linkForm.url.trim()
                const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
                if (ytMatch) {
                  return (
                    <div style={{
                      borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0',
                      background: '#000', position: 'relative', paddingTop: '40%',
                    }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                        allowFullScreen
                        title="Preview"
                      />
                    </div>
                  )
                }
                const isDrive = url.includes('drive.google.com')
                const isSpotify = url.includes('spotify.com')
                const isVimeo = url.includes('vimeo.com')
                let domain
                try { domain = new URL(url).hostname.replace('www.', '') } catch { domain = url }
                return (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 10,
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                      background: isDrive ? '#f0fdf4' : isSpotify ? '#f0fdf4' : isVimeo ? '#eff6ff' : '#f1f5f9',
                      border: `1px solid ${isDrive ? '#bbf7d0' : isSpotify ? '#bbf7d0' : isVimeo ? '#bfdbfe' : '#e2e8f0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ExternalLink size={16} style={{ color: isDrive ? '#16a34a' : isSpotify ? '#16a34a' : isVimeo ? '#3b82f6' : '#64748b' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40' }}>
                        {isDrive ? 'Google Drive' : isSpotify ? 'Spotify' : isVimeo ? 'Vimeo' : domain}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {url}
                      </div>
                    </div>
                    <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', flexShrink: 0 }}>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )
              })()}
            </div>
            <div className="pl-modal-footer">
              <button className="pl-btn-cancel" onClick={() => setShowLinkModal(false)}>Cancelar</button>
              <button
                className="pl-btn-save"
                disabled={!linkForm.name.trim() || !linkForm.url.trim()}
                onClick={saveLink}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VISTA PREVIA */}
      {previewDoc && (() => {
        const d = previewDoc
        const isVideo = d.tipo === 'video'
        const isAudio = d.tipo === 'audio'
        const isLink = !!d.url
        const ytMatch = d.url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
        const ytId = ytMatch?.[1]
        const ext = d.name?.split('.').pop()?.toUpperCase()
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setPreviewDoc(null)}>
            <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 780, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.25)' }}
              onClick={e => e.stopPropagation()}>
              {/* header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: isVideo ? '#fef3c7' : isAudio ? '#f0fdf4' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isVideo ? <Video size={16} style={{ color: '#f59e0b' }} /> : isAudio ? <Headphones size={16} style={{ color: '#10b981' }} /> : <FileText size={16} style={{ color: '#3b82f6' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{d.size || (isLink ? 'Enlace externo' : '')} {d.fecha ? `· ${d.fecha}` : ''}</span>
                    {d.subidoPor && (
                      <>
                        <span style={{ fontSize: 10, color: '#e2e8f0' }}>·</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#0C2D40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: '#fff' }}>
                            {d.subidoPor.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 10, color: '#64748b' }}>{d.subidoPor}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {isLink && d.url && (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>
                    <ExternalLink size={11} /> Abrir
                  </a>
                )}
                <button onClick={() => setPreviewDoc(null)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <X size={14} />
                </button>
              </div>

              {/* contenido */}
              <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                {isVideo && isLink && ytId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}`}
                    style={{ width: '100%', height: 420, border: 'none', display: 'block' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : isVideo && isLink ? (
                  <video controls style={{ width: '100%', maxHeight: 420, background: '#000', display: 'block' }}>
                    <source src={d.url} />
                  </video>
                ) : isAudio && isLink ? (
                  <div style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 20, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Headphones size={32} style={{ color: '#10b981' }} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0C2D40' }}>{d.name}</div>
                    <audio controls style={{ width: '100%', maxWidth: 480 }}>
                      <source src={d.url} />
                    </audio>
                  </div>
                ) : isLink ? (
                  <iframe src={d.url} style={{ width: '100%', height: 480, border: 'none', display: 'block' }} title={d.name} />
                ) : archivoUrl ? (
                  /* Archivo subido que sí está guardado en el navegador: se reproduce de verdad.
                     Es el comportamiento que va a tener el producto cuando el archivo viva en un
                     servidor, solo que la fuente es local en vez de una URL remota. */
                  isVideo ? (
                    <video controls src={archivoUrl} style={{ width: '100%', maxHeight: 420, background: '#000', display: 'block' }} />
                  ) : isAudio ? (
                    <div style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                      <div style={{ width: 72, height: 72, borderRadius: 20, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Headphones size={32} style={{ color: '#10b981' }} />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0C2D40' }}>{d.name}</div>
                      <audio controls src={archivoUrl} style={{ width: '100%', maxWidth: 480 }} />
                    </div>
                  ) : (
                    <iframe src={archivoUrl} style={{ width: '100%', height: 480, border: 'none', display: 'block' }} title={d.name} />
                  )
                ) : (
                  /* Archivo del que no tenemos el binario: los recursos de ejemplo, o algo subido
                     en otro navegador. La ficha se pinta según el tipo: un MP4 con la tarjeta azul
                     de documento hacía dudar de si la subida había funcionado. */
                  <div style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                    <div style={{
                      width: 80, height: 96, borderRadius: 8,
                      background: isVideo ? '#fffbeb' : isAudio ? '#f0fdf4' : '#eff6ff',
                      border: `2px solid ${isVideo ? '#fde68a' : isAudio ? '#bbf7d0' : '#bfdbfe'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      {isVideo
                        ? <Video size={28} style={{ color: '#f59e0b' }} />
                        : isAudio
                          ? <Headphones size={28} style={{ color: '#10b981' }} />
                          : <FileText size={28} style={{ color: '#3b82f6' }} />}
                      <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: 1, color: isVideo ? '#f59e0b' : isAudio ? '#10b981' : '#3b82f6' }}>{ext}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0C2D40', marginBottom: 4 }}>{d.name}</div>
                      {d.size && <div style={{ fontSize: 11, color: '#94a3b8' }}>{d.size}</div>}
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 20px', border: '1px solid #e2e8f0', textAlign: 'center', maxWidth: 360 }}>
                      <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                        Este recurso no tiene una copia disponible en este equipo.<br />
                        Vuelve a subirlo para {isVideo ? 'verlo' : isAudio ? 'escucharlo' : 'previsualizarlo'} desde aquí.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

