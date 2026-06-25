import { useState, useRef } from 'react'
import {
  Upload, FolderOpen, FileText, FileCheck, Loader2, AlertCircle,
  Plus, Trash2, RefreshCw, Search, X, ChevronRight, ChevronDown, Check,
  BookOpen, ShieldCheck, Heart, Cpu, MessageCircle, HelpCircle,
  MoreVertical, Pencil, CirclePlus, Video, Headphones, Link2, ExternalLink,
  LayoutGrid, List, Filter, CheckCircle2, Globe
} from 'lucide-react'
import { useOnboardingData } from '../../context/OnboardingDataContext'

const iconMap = {}

const estadoConfig = {
  procesado: { label: 'Procesado', color: '#10b981', bg: '#f0fdf4', icon: FileCheck },
  procesando: { label: 'Procesando', color: '#f59e0b', bg: '#fef3c7', icon: Loader2 },
  error: { label: 'Error', color: '#ef4444', bg: '#fef2f2', icon: AlertCircle },
}

let docIdCounter = 100

export default function Conocimiento() {
  const { recursos: categorias, setRecursos: setCategorias, addFeedEntry } = useOnboardingData()
  const [selCat, setSelCat] = useState(0)
  const [search, setSearch] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [docMenu, setDocMenu] = useState(null)
  const [catMenu, setCatMenu] = useState(null)
  const [editingCat, setEditingCat] = useState(null)
  const [deleteCatConfirm, setDeleteCatConfirm] = useState(null)
  const [deleteCatInput, setDeleteCatInput] = useState('')
  const [quizEditor, setQuizEditor] = useState(null)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterGeneral, setFilterGeneral] = useState('todos')
  const [showBibFilters, setShowBibFilters] = useState(false)
  const [showNewResource, setShowNewResource] = useState(false)
  const [sortBy, setSortBy] = useState('fecha-desc')
  const [contextMenu, setContextMenu] = useState(null)
  const [bfDropTipo, setBfDropTipo] = useState(false)
  const [bfDropEstado, setBfDropEstado] = useState(false)
  const [bfDropGeneral, setBfDropGeneral] = useState(false)
  const [linkForm, setLinkForm] = useState({ name: '', url: '', tipo: 'video' })
  const fileInputRef = useRef(null)

  const cat = categorias[selCat]
  const totalDocs = categorias.reduce((s, c) => s + c.docs.length, 0)
  const procesados = categorias.reduce((s, c) => s + c.docs.filter(d => d.estado === 'procesado').length, 0)
  const catsCubiertas = categorias.filter(c => c.docs.length > 0).length
  const sinCobertura = categorias.filter(c => c.docs.length === 0)
  const allDocs = categorias.flatMap(c => c.docs)
  const docsNonQuiz = allDocs.length
  const docsConQuiz = allDocs.filter(d => d.quiz).length

  const hasBibFilters = filterTipo !== 'todos' || filterEstado !== 'todos' || filterGeneral !== 'todos'
  const filteredDocs = cat.docs.filter(d => {
    if (d.tipo === 'quiz') return false
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
  function clearBibFilters() { setFilterTipo('todos'); setFilterEstado('todos'); setFilterGeneral('todos') }

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  function handleFiles(files) {
    const newDocs = Array.from(files).map(file => ({
      id: ++docIdCounter,
      name: file.name,
      size: file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(0)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      estado: 'procesando',
      fecha: 'Ahora',
      general: false,
    }))
    setCategorias(prev => prev.map((c, i) => {
      if (i !== selCat) return c
      return { ...c, docs: [...newDocs, ...c.docs] }
    }))
    const ids = newDocs.map(d => d.id)
    newDocs.forEach(d => addFeedEntry(`Nuevo recurso "${d.name}" subido a ${cat.name}`))
    setTimeout(() => {
      setCategorias(prev => prev.map(c => ({
        ...c,
        docs: c.docs.map(d => ids.includes(d.id) ? { ...d, estado: 'procesado' } : d),
      })))
    }, 3000)
  }

  function createQuiz(linkedDocId, linkedDocName) {
    const newQuiz = {
      id: ++docIdCounter,
      name: linkedDocName ? `Cuestionario — ${linkedDocName.replace(/\.[^.]+$/, '')}` : 'Nuevo cuestionario',
      size: '-',
      estado: 'procesado',
      fecha: 'Ahora',
      tipo: 'quiz',
      linkedDocId: linkedDocId || null,
      preguntas: [
        { id: 1, texto: '', opciones: [{ id: 1, texto: '', correcta: true }, { id: 2, texto: '', correcta: false }] },
      ],
    }
    setQuizEditor(newQuiz)
  }

  function getDocQuiz(docId) {
    for (const c of categorias) {
      const doc = c.docs.find(d => d.id === docId && d.quiz)
      if (doc) return doc.quiz
    }
    return null
  }

  function saveQuiz(quiz) {
    setCategorias(prev => prev.map(c => ({
      ...c,
      docs: c.docs.map(d => d.id === quiz.linkedDocId ? { ...d, quiz } : d),
    })))
    setQuizEditor(null)
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
    }
    setCategorias(prev => prev.map((c, i) => {
      if (i !== selCat) return c
      return { ...c, docs: [...c.docs, newDoc] }
    }))
    setShowLinkModal(false)
    setLinkForm({ name: '', url: '', tipo: 'video' })
  }

  function deleteDoc(docId) {
    setCategorias(prev => prev.map(c => ({
      ...c,
      docs: c.docs.filter(d => d.id !== docId),
    })))
    setDocMenu(null)
  }

  function toggleGeneral(docId) {
    setCategorias(prev => prev.map(c => ({
      ...c,
      docs: c.docs.map(d => d.id === docId ? { ...d, general: !d.general } : d),
    })))
    setDocMenu(null)
  }

  const totalGenerales = categorias.reduce((s, c) => s + c.docs.filter(d => d.general).length, 0)

  function addCategoria() {
    if (!newCatName.trim()) return
    setCategorias(prev => [...prev, { name: newCatName.trim(), docs: [] }])
    setNewCatName('')
    setShowNewCat(false)
    setSelCat(categorias.length)
  }

  function renameCategoria(idx, newName) {
    if (!newName.trim()) return
    setCategorias(prev => prev.map((c, i) => i === idx ? { ...c, name: newName.trim() } : c))
    setEditingCat(null)
  }

  function deleteCategoria(idx) {
    if (categorias.length <= 1) return
    setCategorias(prev => prev.filter((_, i) => i !== idx))
    setSelCat(Math.max(0, idx - 1))
    setCatMenu(null)
  }

  return (
    <div className="content-scroll">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain,.txt,application/vnd.ms-powerpoint,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files.length) handleFiles(e.target.files); e.target.value = '' }}
      />

      {/* HEADER */}
      <div className="pl-header">
        <div>
          <h1 className="pl-title">Biblioteca de recursos</h1>
          <p className="pl-subtitle">Centraliza todos los materiales que tus colaboradores necesitan durante su onboarding</p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="pl-toolbar">
        <div className="pl-search-wrap">
          <Search size={14} className="pl-search-ico" />
          <input
            type="text"
            className="pl-search"
            placeholder="Buscar documento por nombre…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={() => setShowNewResource(true)} style={{
          height: 38, padding: '0 16px', borderRadius: 8, border: 'none',
          background: '#0C2D40', color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'inherit', fontSize: 11, fontWeight: 700,
        }}>
          <Plus size={13} />
          Nuevo recurso
        </button>
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
                {filterGeneral === 'si' ? 'Generales' : 'Solo onboarding'}
                <button onClick={() => setFilterGeneral('todos')} style={{ width: 14, height: 14, borderRadius: '50%', border: 'none', background: '#ccfbf1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={8} style={{ color: '#0d9488' }} /></button>
              </span>
            )}
            <button onClick={clearBibFilters} style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Limpiar</button>
          </div>
        )}

        {/* MODAL FILTROS BIBLIOTECA */}
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
                      <span>{{ todos: 'Todos', si: 'Recursos generales', no: 'Solo onboarding' }[filterGeneral]}</span>
                      <ChevronDown size={14} className="pl-dropdown-chevron" />
                    </button>
                    {bfDropGeneral && (
                      <div className="pl-dropdown-menu" style={{ top: 'auto', bottom: 'calc(100% + 6px)' }}>
                        {[{ key: 'todos', label: 'Todos' }, { key: 'si', label: 'Recursos generales' }, { key: 'no', label: 'Solo onboarding' }].map(f => (
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
        <div style={{ flex: 1 }} />
        <div style={{
          display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3,
        }}>
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

      {/* CONTENIDO: SIDEBAR + GRID */}
      <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>

      {/* SIDEBAR CARPETAS */}
      <div style={{
        width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: '#fff', borderRight: '1px solid #e2e8f0',
        padding: 14, overflow: 'hidden',
      }}>
        <div className="jb-sb-title">Carpetas <span className="jb-sb-count">{categorias.length}</span></div>
        <p className="jb-sb-hint">Carpetas de documentos</p>

        <div className="jb-sb-list">
          {categorias.map((c, i) => {
            const isActive = selCat === i
            return (
              <div key={i}>
                {editingCat === i ? (
                  <div style={{ padding: '4px 0' }}>
                    <input
                      defaultValue={c.name}
                      autoFocus
                      onBlur={e => renameCategoria(i, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') renameCategoria(i, e.target.value); if (e.key === 'Escape') setEditingCat(null) }}
                      style={{
                        width: '100%', padding: '7px 10px', border: '1.5px solid #0C2D40',
                        borderRadius: 8, fontSize: 12, fontFamily: 'inherit', outline: 'none',
                        fontWeight: 600,
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className={`jb-sb-item ${isActive ? 'active' : ''}`}
                    onClick={() => setSelCat(i)}
                    style={{ position: 'relative' }}
                    onMouseEnter={e => { const btn = e.currentTarget.querySelector('.cat-menu-btn'); if (btn) btn.style.opacity = '1' }}
                    onMouseLeave={e => { const btn = e.currentTarget.querySelector('.cat-menu-btn'); if (btn) btn.style.opacity = '0' }}
                  >
                    <div className="jb-sb-dot">
                      <FolderOpen size={10} />
                    </div>
                    <div className="jb-sb-info">
                      <div className="jb-sb-name">{c.name}</div>
                      <div className="jb-sb-days">{c.docs.length} doc{c.docs.length !== 1 ? 's' : ''}</div>
                    </div>
                    <button
                      className="cat-menu-btn"
                      onClick={e => {
                        e.stopPropagation()
                        const rect = e.currentTarget.getBoundingClientRect()
                        setCatMenu({ idx: i, x: rect.right + 4, y: rect.bottom })
                      }}
                      style={{
                        width: 22, height: 22, borderRadius: 6, border: 'none',
                        background: isActive ? 'rgba(255,255,255,0.15)' : '#e2e8f0',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, opacity: 0, transition: 'opacity .15s',
                        color: isActive ? '#fff' : '#64748b',
                      }}
                    >
                      <MoreVertical size={12} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <button className="jb-sb-add" onClick={() => { setShowNewCat(true); setNewCatName('') }}>
          <Plus size={14} />
          Nueva carpeta
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative' }}
        onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY }) }}
        onClick={() => contextMenu && setContextMenu(null)}
      >
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
                {sortBy === s.key && <CheckCircle2 size={12} style={{ color: '#10b981' }} />}
              </button>
            ))}
          </div>
        )}

          {/* VISTA GRID */}
          {viewMode === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {filteredDocs.map(doc => {
                const est = estadoConfig[doc.estado]
                const EstIcon = est.icon
                const isQuiz = doc.tipo === 'quiz'
                const isMedia = doc.tipo === 'video' || doc.tipo === 'audio'
                const ext = isQuiz ? 'CUEST' : isMedia ? (doc.tipo === 'video' ? 'VIDEO' : 'AUDIO') : doc.name.split('.').pop().toUpperCase()
                const extColor = isQuiz ? '#f59e0b' : isMedia ? '#3b82f6' : ext === 'PDF' ? '#ef4444' : ext === 'DOCX' || ext === 'DOC' ? '#3b82f6' : ext === 'PPTX' || ext === 'PPT' ? '#f97316' : '#64748b'
                const MediaIcon = doc.tipo === 'video' ? Video : doc.tipo === 'audio' ? Headphones : null
                const DocIcon = isQuiz ? HelpCircle : MediaIcon || FileText
                const iconColor = isQuiz ? '#f59e0b' : isMedia ? '#3b82f6' : '#94a3b8'
                const iconBg = isQuiz ? '#fef3c7' : isMedia ? '#eff6ff' : '#f8fafc'
                const linkedQuiz = !isQuiz ? getDocQuiz(doc.id) : null
                return (
                  <div
                    key={doc.id}
                    style={{
                      background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
                      overflow: 'visible', cursor: 'default', position: 'relative',
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
                          {linkedQuiz && (
                            <span
                              onClick={() => setQuizEditor(linkedQuiz)}
                              style={{
                                fontSize: 9, fontWeight: 600, color: '#b45309',
                                background: '#fef3c7', padding: '1px 6px', borderRadius: 4,
                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3,
                              }}>
                              <HelpCircle size={8} /> Cuestionario vinculado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer: size + estado */}
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
                        {!isQuiz && (doc.estado === 'procesado' || isMedia) && !linkedQuiz && (
                          <button onClick={() => { createQuiz(doc.id, doc.name); setDocMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background .1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fefce8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <HelpCircle size={12} style={{ color: '#f59e0b', marginTop: 1, flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b' }}>Crear cuestionario</div>
                              <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Genera preguntas para evaluar si el colaborador leyó el contenido</div>
                            </div>
                          </button>
                        )}
                        {!isQuiz && linkedQuiz && (
                          <button onClick={() => { setQuizEditor(linkedQuiz); setDocMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background .1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fefce8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <Pencil size={12} style={{ color: '#f59e0b', marginTop: 1, flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b' }}>Editar cuestionario</div>
                              <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Modificar las preguntas del cuestionario vinculado</div>
                            </div>
                          </button>
                        )}
                        <button onClick={() => toggleGeneral(doc.id)} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background .1s' }} onMouseEnter={e => e.currentTarget.style.background = '#f0fdfa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <Globe size={12} style={{ color: doc.general ? '#94a3b8' : '#0d9488', marginTop: 1, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: doc.general ? '#94a3b8' : '#0d9488' }}>{doc.general ? 'Quitar de recursos generales' : 'Recurso general'}</div>
                            <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>{doc.general ? 'Ya no será visible para colaboradores antiguos' : 'Visible para todos los colaboradores, incluso sin onboarding'}</div>
                          </div>
                        </button>
                        <div style={{ height: 1, background: '#f1f5f9', margin: '2px 6px' }} />
                        <button onClick={() => deleteDoc(doc.id)} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background .1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
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
          )}

          {/* VISTA LISTA */}
          {viewMode === 'list' && (
            <div className="as-table-wrap">
              <table className="as-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Tamaño</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map(doc => {
                    const est = estadoConfig[doc.estado]
                    const EstIcon = est.icon
                    const isQuiz = doc.tipo === 'quiz'
                    const isMedia = doc.tipo === 'video' || doc.tipo === 'audio'
                    const ext = isQuiz ? 'CUEST' : isMedia ? (doc.tipo === 'video' ? 'VIDEO' : 'AUDIO') : doc.name.split('.').pop().toUpperCase()
                    const extColor = isQuiz ? '#f59e0b' : isMedia ? '#3b82f6' : ext === 'PDF' ? '#ef4444' : ext === 'DOCX' || ext === 'DOC' ? '#3b82f6' : ext === 'PPTX' || ext === 'PPT' ? '#f97316' : '#64748b'
                    const MediaIcon = doc.tipo === 'video' ? Video : doc.tipo === 'audio' ? Headphones : null
                    const DocIcon = isQuiz ? HelpCircle : MediaIcon || FileText
                    const iconColor = isQuiz ? '#f59e0b' : isMedia ? '#3b82f6' : '#94a3b8'
                    const linkedQuiz = !isQuiz ? getDocQuiz(doc.id) : null
                    return (
                      <tr key={doc.id}>
                        <td>
                          <div className="as-person">
                            <div style={{
                              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                              background: isQuiz ? '#fef3c7' : isMedia ? '#eff6ff' : '#f8fafc',
                              border: `1px solid ${isQuiz ? '#fde68a' : isMedia ? '#bfdbfe' : '#e2e8f0'}`,
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
                                {linkedQuiz && (
                                  <span onClick={() => setQuizEditor(linkedQuiz)} style={{ fontSize: 9, fontWeight: 600, color: '#b45309', background: '#fef3c7', padding: '1px 6px', borderRadius: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                    <HelpCircle size={8} /> Cuest.
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td><span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: `${extColor}12`, color: extColor }}>{ext}</span></td>
                        <td><span className="as-fecha">{doc.size}</span></td>
                        <td><span className="as-fecha">{doc.fecha}</span></td>
                        <td>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, background: est.bg, color: est.color, fontSize: 10, fontWeight: 600 }}>
                            <EstIcon size={10} className={doc.estado === 'procesando' ? 'animate-spin' : ''} />
                            {est.label}
                          </div>
                        </td>
                        <td style={{ position: 'relative' }}>
                          <button onClick={() => setDocMenu(docMenu === doc.id ? null : doc.id)} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: docMenu === doc.id ? '#f1f5f9' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: 'inherit' }}>
                            <MoreVertical size={14} />
                          </button>
                          {docMenu === doc.id && (
                            <div style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', borderRadius: 10, padding: 4, boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid #e2e8f0', zIndex: 20, minWidth: 220, animation: 'plSlideUp .12s' }}>
                              {(doc.estado === 'error' || doc.estado === 'procesando') && (
                                <button onClick={() => setDocMenu(null)} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                  <RefreshCw size={12} style={{ color: '#475569', marginTop: 1, flexShrink: 0 }} />
                                  <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Reprocesar</div>
                                    <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Volver a procesar el documento</div>
                                  </div>
                                </button>
                              )}
                              {!isQuiz && (doc.estado === 'procesado' || isMedia) && !linkedQuiz && (
                                <button onClick={() => { createQuiz(doc.id, doc.name); setDocMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#fefce8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                  <HelpCircle size={12} style={{ color: '#f59e0b', marginTop: 1, flexShrink: 0 }} />
                                  <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b' }}>Crear cuestionario</div>
                                    <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Evalúa si el colaborador leyó el contenido</div>
                                  </div>
                                </button>
                              )}
                              {!isQuiz && linkedQuiz && (
                                <button onClick={() => { setQuizEditor(linkedQuiz); setDocMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#fefce8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                  <Pencil size={12} style={{ color: '#f59e0b', marginTop: 1, flexShrink: 0 }} />
                                  <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b' }}>Editar cuestionario</div>
                                    <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Modificar las preguntas del cuestionario</div>
                                  </div>
                                </button>
                              )}
                              <button onClick={() => toggleGeneral(doc.id)} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#f0fdfa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <Globe size={12} style={{ color: doc.general ? '#94a3b8' : '#0d9488', marginTop: 1, flexShrink: 0 }} />
                                <div>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: doc.general ? '#94a3b8' : '#0d9488' }}>{doc.general ? 'Quitar de recursos generales' : 'Recurso general'}</div>
                                  <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>{doc.general ? 'Ya no será visible para colaboradores antiguos' : 'Visible para todos, incluso sin onboarding'}</div>
                                </div>
                              </button>
                              <div style={{ height: 1, background: '#f1f5f9', margin: '2px 6px' }} />
                              <button onClick={() => deleteDoc(doc.id)} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
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
              {filteredDocs.length === 0 && (
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
                      {totalDocs === 0
                        ? <BookOpen size={22} style={{ color: '#94a3b8' }} />
                        : <FolderOpen size={22} style={{ color: '#94a3b8' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40', marginBottom: 4 }}>
                        {totalDocs === 0 ? 'Tu biblioteca está vacía' : 'Esta carpeta está vacía'}
                      </div>
                      <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.55, margin: '0 0 12px' }}>
                        {totalDocs === 0
                          ? 'Sube documentos y recursos para que los colaboradores los consulten durante su onboarding.'
                          : 'Sube un documento o vincula un recurso externo a esta carpeta.'}
                      </p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {['📄 Documentos', '🎥 Videos', '🔗 Enlaces'].map(tag => (
                          <span key={tag} style={{
                            fontSize: 10, fontWeight: 600, color: '#475569',
                            background: '#f1f5f9', border: '1px solid #e2e8f0',
                            padding: '3px 10px', borderRadius: 20,
                          }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={openFilePicker}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        padding: '10px 18px', borderRadius: 10, border: 'none',
                        background: '#0C2D40', color: '#fff', cursor: 'pointer',
                        fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                        flexShrink: 0, whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(12,45,64,.2)',
                      }}
                    >
                      <Upload size={13} />
                      Subir recurso
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {viewMode === 'grid' && filteredDocs.length === 0 && (
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
                  {totalDocs === 0
                    ? <BookOpen size={22} style={{ color: '#94a3b8' }} />
                    : <FolderOpen size={22} style={{ color: '#94a3b8' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40', marginBottom: 4 }}>
                    {totalDocs === 0 ? 'Tu biblioteca está vacía' : 'Esta carpeta está vacía'}
                  </div>
                  <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.55, margin: '0 0 12px' }}>
                    {totalDocs === 0
                      ? 'Sube documentos, videos y recursos que luego puedes asignar como tareas en las rutas de onboarding — por ejemplo, "Lee el manual de funciones" o "Ve el video de bienvenida".'
                      : 'Sube un documento o vincula un recurso externo para asignarlo como tarea en tus rutas.'}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['📄 Documentos', '🎥 Videos', '🔗 Enlaces'].map(tag => (
                      <span key={tag} style={{
                        fontSize: 10, fontWeight: 600, color: '#475569',
                        background: '#f1f5f9', border: '1px solid #e2e8f0',
                        padding: '3px 10px', borderRadius: 20,
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={openFilePicker}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '10px 18px', borderRadius: 10, border: 'none',
                    background: '#0C2D40', color: '#fff', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                    flexShrink: 0, whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(12,45,64,.2)',
                  }}
                >
                  <Upload size={13} />
                  Subir recurso
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
            {categorias.length > 1 && (
              <button
                onClick={() => {
                  const cat = categorias[catMenu.idx]
                  if (cat.docs.length > 0) {
                    setDeleteCatConfirm(catMenu.idx)
                    setDeleteCatInput('')
                  } else {
                    deleteCategoria(catMenu.idx)
                  }
                  setCatMenu(null)
                }}
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
            )}
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
          <div className="pl-overlay" onClick={() => setDeleteCatConfirm(null)}>
            <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
              <div className="pl-modal-body" style={{ textAlign: 'center', padding: '28px 24px 16px' }}>
                <div className="jb-del-ico">
                  <Trash2 size={24} />
                </div>
                <h2 className="pl-del-title">Eliminar carpeta</h2>
                <p className="pl-del-desc">
                  ¿Estás seguro de eliminar <strong>{catDel.name}</strong>?
                  Esta carpeta tiene <strong>{catDel.docs.length} documento{catDel.docs.length > 1 ? 's' : ''}</strong> que se perderán.
                </p>
                <div style={{ marginTop: '14px' }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Escribe <strong>eliminar</strong> para confirmar</span>
                  <input
                    type="text"
                    className="pl-input"
                    placeholder="eliminar"
                    value={deleteCatInput}
                    onChange={e => setDeleteCatInput(e.target.value)}
                    autoFocus
                    style={{ marginTop: 8 }}
                  />
                </div>
              </div>
              <div className="pl-modal-footer" style={{ justifyContent: 'center' }}>
                <button className="pl-btn-cancel" onClick={() => setDeleteCatConfirm(null)}>Cancelar</button>
                <button
                  className="pl-btn-delete"
                  disabled={deleteCatInput.toLowerCase() !== 'eliminar'}
                  onClick={() => { deleteCategoria(deleteCatConfirm); setDeleteCatConfirm(null) }}
                >
                  Eliminar carpeta
                </button>
              </div>
            </div>
          </div>
        )
      })()}

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

      {/* MODAL NUEVO RECURSO */}
      {showNewResource && (
        <div className="pl-overlay" onClick={() => setShowNewResource(false)}>
          <div className="pl-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="pl-modal-header">
              <h2>Nuevo recurso</h2>
              <button className="pl-modal-close" onClick={() => setShowNewResource(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="pl-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                onClick={() => { setShowNewResource(false); openFilePicker() }}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); setShowNewResource(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files) }}
                style={{
                  background: dragOver ? 'rgba(12,45,64,0.04)' : '#fafbfc',
                  borderRadius: 10, border: `1.5px dashed ${dragOver ? '#0C2D40' : '#d1d5db'}`,
                  padding: '20px', display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer', transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0C2D40'; e.currentTarget.style.background = 'rgba(12,45,64,0.03)' }}
                onMouseLeave={e => { if (!dragOver) { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fafbfc' } }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Upload size={18} style={{ color: '#0C2D40' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40' }}>Subir documento</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>PDF, Word, PowerPoint, TXT — arrastra o haz clic</div>
                </div>
              </div>
              <div
                onClick={() => { setShowNewResource(false); setLinkForm({ name: '', url: '', tipo: 'video' }); setShowLinkModal(true) }}
                style={{
                  background: '#fafbfc', borderRadius: 10, border: '1.5px dashed #d1d5db',
                  padding: '20px', display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer', transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = 'rgba(59,130,246,0.03)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fafbfc' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Link2 size={18} style={{ color: '#3b82f6' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40' }}>Agregar enlace</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>Video de YouTube, Vimeo, podcast u otro recurso externo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ EDITOR */}
      {quizEditor && (() => {
        const quiz = quizEditor

        function updateQuizName(name) {
          setQuizEditor(prev => ({ ...prev, name }))
        }

        function addPregunta() {
          setQuizEditor(prev => ({
            ...prev,
            preguntas: [...prev.preguntas, {
              id: Date.now(),
              texto: '',
              opciones: [{ id: Date.now() + 1, texto: '', correcta: true }, { id: Date.now() + 2, texto: '', correcta: false }],
            }],
          }))
        }

        function updatePregunta(pIdx, texto) {
          setQuizEditor(prev => ({
            ...prev,
            preguntas: prev.preguntas.map((p, i) => i === pIdx ? { ...p, texto } : p),
          }))
        }

        function deletePregunta(pIdx) {
          setQuizEditor(prev => ({
            ...prev,
            preguntas: prev.preguntas.filter((_, i) => i !== pIdx),
          }))
        }

        function addOpcion(pIdx) {
          setQuizEditor(prev => ({
            ...prev,
            preguntas: prev.preguntas.map((p, i) => i === pIdx ? {
              ...p,
              opciones: [...p.opciones, { id: Date.now(), texto: '', correcta: false }],
            } : p),
          }))
        }

        function updateOpcion(pIdx, oIdx, texto) {
          setQuizEditor(prev => ({
            ...prev,
            preguntas: prev.preguntas.map((p, i) => i === pIdx ? {
              ...p,
              opciones: p.opciones.map((o, j) => j === oIdx ? { ...o, texto } : o),
            } : p),
          }))
        }

        function setCorrecta(pIdx, oIdx) {
          setQuizEditor(prev => ({
            ...prev,
            preguntas: prev.preguntas.map((p, i) => i === pIdx ? {
              ...p,
              opciones: p.opciones.map((o, j) => ({ ...o, correcta: j === oIdx })),
            } : p),
          }))
        }

        function deleteOpcion(pIdx, oIdx) {
          setQuizEditor(prev => ({
            ...prev,
            preguntas: prev.preguntas.map((p, i) => i === pIdx ? {
              ...p,
              opciones: p.opciones.filter((_, j) => j !== oIdx),
            } : p),
          }))
        }

        return (
          <div className="pl-overlay" onClick={() => setQuizEditor(null)}>
            <div className="pl-modal jb-modal" style={{ maxWidth: 580, maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HelpCircle size={16} style={{ color: '#fff' }} />
                  </div>
                  <h2 style={{ margin: 0 }}>Editor de cuestionario</h2>
                </div>
                <button className="pl-modal-close" onClick={() => setQuizEditor(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="pl-modal-body" style={{ overflowY: 'auto', maxHeight: '60vh' }}>
                <label className="pl-label">
                  Nombre del cuestionario
                  <input type="text" className="pl-input" value={quiz.name} onChange={e => updateQuizName(e.target.value)} />
                </label>

                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40', marginBottom: 12 }}>
                    Preguntas ({quiz.preguntas.length})
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {quiz.preguntas.map((pregunta, pIdx) => (
                      <div key={pregunta.id} style={{
                        background: '#f8fafc', borderRadius: 10, padding: '14px 16px',
                        border: '1px solid #e2e8f0',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <span style={{
                            width: 22, height: 22, borderRadius: 6, background: '#0C2D40', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 800, flexShrink: 0,
                          }}>{pIdx + 1}</span>
                          <input
                            type="text"
                            placeholder="Escribe la pregunta..."
                            value={pregunta.texto}
                            onChange={e => updatePregunta(pIdx, e.target.value)}
                            style={{
                              flex: 1, padding: '7px 10px', border: '1px solid #e2e8f0',
                              borderRadius: 8, fontSize: 12, fontFamily: 'inherit', outline: 'none',
                              background: '#fff',
                            }}
                          />
                          {quiz.preguntas.length > 1 && (
                            <button
                              onClick={() => deletePregunta(pIdx)}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, color: '#cbd5e1' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                              onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 30 }}>
                          {pregunta.opciones.map((opcion, oIdx) => (
                            <div key={opcion.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <button
                                onClick={() => setCorrecta(pIdx, oIdx)}
                                style={{
                                  width: 20, height: 20, borderRadius: '50%',
                                  border: `2px solid ${opcion.correcta ? '#10b981' : '#d1d5db'}`,
                                  background: opcion.correcta ? '#10b981' : '#fff',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  flexShrink: 0, padding: 0,
                                }}
                              >
                                {opcion.correcta && <Check size={11} style={{ color: '#fff' }} />}
                              </button>
                              <input
                                type="text"
                                placeholder={`Opción ${oIdx + 1}`}
                                value={opcion.texto}
                                onChange={e => updateOpcion(pIdx, oIdx, e.target.value)}
                                style={{
                                  flex: 1, padding: '6px 10px', border: '1px solid #e2e8f0',
                                  borderRadius: 7, fontSize: 11, fontFamily: 'inherit', outline: 'none',
                                  background: '#fff',
                                }}
                              />
                              {pregunta.opciones.length > 2 && (
                                <button
                                  onClick={() => deleteOpcion(pIdx, oIdx)}
                                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, color: '#cbd5e1' }}
                                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                  onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
                                >
                                  <X size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addOpcion(pIdx)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              border: 'none', background: 'none', cursor: 'pointer',
                              fontSize: 10, fontWeight: 600, color: '#94a3b8', fontFamily: 'inherit',
                              padding: '4px 0',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#0C2D40'}
                            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                          >
                            <Plus size={11} />
                            Agregar opción
                          </button>
                        </div>

                        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 8, paddingLeft: 30 }}>
                          Haz clic en el círculo para marcar la respuesta correcta
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addPregunta}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      width: '100%', marginTop: 12, padding: '10px',
                      border: '1.5px dashed #cbd5e1', borderRadius: 10,
                      background: 'transparent', cursor: 'pointer',
                      fontSize: 11, fontWeight: 600, color: '#64748b', fontFamily: 'inherit',
                    }}
                  >
                    <Plus size={13} />
                    Agregar pregunta
                  </button>
                </div>
              </div>

              <div className="pl-modal-footer">
                <button className="pl-btn-cancel" onClick={() => setQuizEditor(null)}>Cancelar</button>
                <button className="pl-btn-save" onClick={() => saveQuiz(quiz)}>Guardar cuestionario</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

