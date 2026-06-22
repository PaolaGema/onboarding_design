import { useState, useRef } from 'react'
import {
  Upload, FolderOpen, FileText, FileCheck, Loader2, AlertCircle,
  Plus, Trash2, RefreshCw, Search, X, ChevronRight, Check,
  BookOpen, ShieldCheck, Heart, Cpu, MessageCircle, HelpCircle,
  MoreVertical, Pencil, CirclePlus, Video, Headphones, Link2, ExternalLink,
  LayoutGrid, List, Filter, CheckCircle2
} from 'lucide-react'

const iconMap = {}

const initialCategorias = [
  {
    name: 'Políticas',
    docs: [
      { id: 1, name: 'Código de conducta 2025.pdf', size: '2.4 MB', estado: 'procesado', fecha: '12 Jun 2026' },
      { id: 2, name: 'Política de vacaciones.pdf', size: '1.1 MB', estado: 'procesado', fecha: '10 Jun 2026' },
      { id: 3, name: 'Reglamento interno.docx', size: '3.8 MB', estado: 'procesando', fecha: '18 Jun 2026' },
    ],
  },
  {
    name: 'Beneficios',
    docs: [
      { id: 4, name: 'Manual de beneficios.pdf', size: '4.2 MB', estado: 'procesado', fecha: '8 Jun 2026' },
      { id: 5, name: 'Guía de seguro médico.pdf', size: '1.8 MB', estado: 'procesado', fecha: '5 Jun 2026' },
    ],
  },
  {
    name: 'Procesos TI',
    docs: [
      { id: 6, name: 'Guía acceso a sistemas.pdf', size: '890 KB', estado: 'procesado', fecha: '15 Jun 2026' },
      { id: 7, name: 'VPN y herramientas.txt', size: '45 KB', estado: 'error', fecha: '16 Jun 2026' },
    ],
  },
  {
    name: 'Cultura',
    docs: [
      { id: 8, name: 'Valores y misión.pdf', size: '1.5 MB', estado: 'procesado', fecha: '1 Jun 2026' },
    ],
  },
  {
    name: 'FAQ',
    docs: [],
  },
]

const estadoConfig = {
  procesado: { label: 'Procesado', color: '#10b981', bg: '#f0fdf4', icon: FileCheck },
  procesando: { label: 'Procesando', color: '#f59e0b', bg: '#fef3c7', icon: Loader2 },
  error: { label: 'Error', color: '#ef4444', bg: '#fef2f2', icon: AlertCircle },
}

let docIdCounter = 100

export default function Conocimiento() {
  const [categorias, setCategorias] = useState(initialCategorias)
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
  const [showTipoFilter, setShowTipoFilter] = useState(false)
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

  const filteredDocs = cat.docs.filter(d => {
    if (d.tipo === 'quiz') return false
    if (!d.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterTipo === 'documentos') return !d.tipo || d.tipo === 'documento'
    if (filterTipo === 'videos') return d.tipo === 'video'
    if (filterTipo === 'audios') return d.tipo === 'audio'
    return true
  })

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
    }))
    setCategorias(prev => prev.map((c, i) => {
      if (i !== selCat) return c
      return { ...c, docs: [...c.docs, ...newDocs] }
    }))
  }

  function createQuiz(linkedDocId, linkedDocName) {
    const newQuiz = {
      id: ++docIdCounter,
      name: linkedDocName ? `Quiz — ${linkedDocName.replace(/\.[^.]+$/, '')}` : 'Nuevo quiz',
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
        accept=".pdf,.doc,.docx,.txt"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files.length) handleFiles(e.target.files); e.target.value = '' }}
      />

      {/* HEADER */}
      <div className="pl-header">
        <div>
          <h1 className="pl-title">Base de conocimiento</h1>
          <p className="pl-subtitle">Documentos y enlaces que se asignan como tareas en las rutas de onboarding</p>
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="kpi-strip">
        <div className="kpi-card">
          <div className="kpi-title" style={{ color: 'var(--blue)' }}>Total documentos</div>
          <div className="kpi-val">{totalDocs}</div>
          <div className="kpi-lbl">Subidos a la plataforma</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title" style={{ color: 'var(--green)' }}>Procesados</div>
          <div className="kpi-val">{procesados}</div>
          <div className="kpi-lbl">Listos para usar</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title" style={{ color: 'var(--purple, #8b5cf6)' }}>Categorías</div>
          <div className="kpi-val">{catsCubiertas}/{categorias.length}</div>
          <div className="kpi-lbl">Con documentos</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title" style={{ color: '#f59e0b' }}>Con quiz</div>
          <div className="kpi-val">{docsConQuiz}/{docsNonQuiz}</div>
          <div className="kpi-lbl">Documentos con quiz</div>
        </div>
        {sinCobertura.length > 0 && (
          <div className="kpi-card">
            <div className="kpi-title" style={{ color: 'var(--red)' }}>Sin cobertura</div>
            <div className="kpi-val">{sinCobertura.length}</div>
            <div className="kpi-lbl">Categorías vacías</div>
          </div>
        )}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
          {filterTipo !== 'todos' && (
            <div style={{
              height: 32, padding: '0 8px 0 10px', borderRadius: 8,
              background: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 600, color: '#475569',
            }}>
              {{ documentos: 'Documentos', videos: 'Videos', audios: 'Audios' }[filterTipo]}
              <button
                onClick={() => setFilterTipo('todos')}
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
            onClick={() => setShowTipoFilter(!showTipoFilter)}
            style={{
              height: 38, padding: '0 12px', borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              color: '#64748b',
            }}
          >
            <Filter size={14} />
          </button>
          {showTipoFilter && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 4,
              background: '#fff', borderRadius: 10, padding: 4,
              boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid #e2e8f0',
              zIndex: 30, minWidth: 170, animation: 'plSlideUp .12s',
            }}>
              {[
                { key: 'todos', label: 'Todos', color: '#0C2D40' },
                { key: 'documentos', label: 'Documentos', color: '#f97316' },
                { key: 'videos', label: 'Videos', color: '#3b82f6' },
                { key: 'audios', label: 'Audios', color: '#06b6d4' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => { setFilterTipo(f.key); setShowTipoFilter(false) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', border: 'none', borderRadius: 7,
                    background: filterTipo === f.key ? '#f8fafc' : 'transparent',
                    cursor: 'pointer', fontSize: 12, fontWeight: filterTipo === f.key ? 600 : 400,
                    color: filterTipo === f.key ? '#0C2D40' : '#475569',
                    fontFamily: 'inherit', textAlign: 'left',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => { if (filterTipo !== f.key) e.currentTarget.style.background = 'transparent' }}
                >
                  {f.key !== 'todos' && (
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                  )}
                  <span style={{ flex: 1 }}>{f.label}</span>
                  {filterTipo === f.key && <CheckCircle2 size={13} style={{ color: '#10b981' }} />}
                </button>
              ))}
            </div>
          )}
        </div>
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

      {/* SIDEBAR CATEGORÍAS */}
      <div style={{
        width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: '#fff', borderRight: '1px solid #e2e8f0',
        padding: 14, overflow: 'hidden',
      }}>
        <div className="jb-sb-title">Categorías <span className="jb-sb-count">{categorias.length}</span></div>
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
                  <button
                    className={`jb-sb-item ${isActive ? 'active' : ''}`}
                    onClick={() => setSelCat(i)}
                    onContextMenu={e => { e.preventDefault(); setCatMenu({ idx: i, x: e.clientX, y: e.clientY }) }}
                  >
                    <div className="jb-sb-dot">
                      <FolderOpen size={10} />
                    </div>
                    <div className="jb-sb-info">
                      <div className="jb-sb-name">{c.name}</div>
                      <div className="jb-sb-days">{c.docs.length} doc{c.docs.length !== 1 ? 's' : ''}</div>
                    </div>
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {showNewCat ? (
          <div style={{ display: 'flex', gap: 4, marginTop: 8, minWidth: 0 }}>
            <input
              type="text"
              placeholder="Nombre..."
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addCategoria(); if (e.key === 'Escape') { setShowNewCat(false); setNewCatName('') } }}
              autoFocus
              style={{
                flex: 1, minWidth: 0, padding: '7px 8px', border: '1.5px solid #0C2D40',
                borderRadius: 8, fontSize: 11, fontFamily: 'inherit', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={addCategoria}
              style={{
                padding: '7px 8px', border: 'none', borderRadius: 8,
                background: '#0C2D40', color: '#fff', cursor: 'pointer',
                fontSize: 10, fontWeight: 700, fontFamily: 'inherit',
                flexShrink: 0,
              }}
            >OK</button>
          </div>
        ) : (
          <button className="jb-sb-add" onClick={() => setShowNewCat(true)}>
            <Plus size={14} />
            Nueva categoría
          </button>
        )}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {/* BOTONES SUBIR / ENLACE */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <div
              onClick={openFilePicker}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files) }}
              style={{
                flex: 1, background: dragOver ? 'rgba(12,45,64,0.04)' : '#fafbfc',
                borderRadius: 10, border: `1.5px dashed ${dragOver ? '#0C2D40' : '#d1d5db'}`,
                padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0C2D40'; e.currentTarget.style.background = 'rgba(12,45,64,0.03)' }}
              onMouseLeave={e => { if (!dragOver) { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fafbfc' } }}
            >
              <Upload size={18} style={{ color: dragOver ? '#0C2D40' : '#94a3b8', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Subir documento</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>PDF, Word, TXT — arrastra o haz clic</div>
              </div>
            </div>
            <div
              onClick={() => { setLinkForm({ name: '', url: '', tipo: 'video' }); setShowLinkModal(true) }}
              style={{
                flex: 1, background: '#fafbfc',
                borderRadius: 10, border: '1.5px dashed #d1d5db',
                padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = 'rgba(59,130,246,0.03)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fafbfc' }}
            >
              <Link2 size={18} style={{ color: '#3b82f6', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Agregar enlace</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Video o audio externo</div>
              </div>
            </div>
          </div>

          {/* VISTA GRID */}
          {viewMode === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {filteredDocs.map(doc => {
                const est = estadoConfig[doc.estado]
                const EstIcon = est.icon
                const isQuiz = doc.tipo === 'quiz'
                const isMedia = doc.tipo === 'video' || doc.tipo === 'audio'
                const ext = isQuiz ? 'QUIZ' : isMedia ? (doc.tipo === 'video' ? 'VIDEO' : 'AUDIO') : doc.name.split('.').pop().toUpperCase()
                const extColor = isQuiz ? '#f59e0b' : isMedia ? '#3b82f6' : ext === 'PDF' ? '#ef4444' : ext === 'DOCX' || ext === 'DOC' ? '#3b82f6' : '#64748b'
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
                      overflow: 'hidden', cursor: 'default', position: 'relative',
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
                        {linkedQuiz && (
                          <span
                            onClick={() => setQuizEditor(linkedQuiz)}
                            style={{
                              fontSize: 9, fontWeight: 600, color: '#b45309',
                              background: '#fef3c7', padding: '1px 6px', borderRadius: 4,
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3,
                              marginTop: 4,
                            }}>
                            <HelpCircle size={8} /> Quiz vinculado
                          </span>
                        )}
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
                        zIndex: 20, minWidth: 160, animation: 'plSlideUp .12s',
                      }}>
                        <button onClick={() => setDocMenu(null)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 500, color: '#475569', fontFamily: 'inherit', textAlign: 'left', transition: 'background .1s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <RefreshCw size={12} /> Actualizar
                        </button>
                        {!isQuiz && (doc.estado === 'procesado' || isMedia) && !linkedQuiz && (
                          <button onClick={() => { createQuiz(doc.id, doc.name); setDocMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 500, color: '#f59e0b', fontFamily: 'inherit', textAlign: 'left', transition: 'background .1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fefce8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <HelpCircle size={12} /> Crear quiz
                          </button>
                        )}
                        {!isQuiz && linkedQuiz && (
                          <button onClick={() => { setQuizEditor(linkedQuiz); setDocMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 500, color: '#f59e0b', fontFamily: 'inherit', textAlign: 'left', transition: 'background .1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fefce8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <Pencil size={12} /> Editar quiz
                          </button>
                        )}
                        <button onClick={() => deleteDoc(doc.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 500, color: '#ef4444', fontFamily: 'inherit', textAlign: 'left', transition: 'background .1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <Trash2 size={12} /> Eliminar
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
                    const ext = isQuiz ? 'QUIZ' : isMedia ? (doc.tipo === 'video' ? 'VIDEO' : 'AUDIO') : doc.name.split('.').pop().toUpperCase()
                    const extColor = isQuiz ? '#f59e0b' : isMedia ? '#3b82f6' : ext === 'PDF' ? '#ef4444' : ext === 'DOCX' || ext === 'DOC' ? '#3b82f6' : '#64748b'
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
                              {linkedQuiz && (
                                <span onClick={() => setQuizEditor(linkedQuiz)} style={{ fontSize: 9, fontWeight: 600, color: '#b45309', background: '#fef3c7', padding: '1px 6px', borderRadius: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                  <HelpCircle size={8} /> Quiz
                                </span>
                              )}
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
                            <div style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', borderRadius: 10, padding: 4, boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid #e2e8f0', zIndex: 20, minWidth: 160, animation: 'plSlideUp .12s' }}>
                              <button onClick={() => setDocMenu(null)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 500, color: '#475569', fontFamily: 'inherit', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <RefreshCw size={12} /> Actualizar
                              </button>
                              {!isQuiz && (doc.estado === 'procesado' || isMedia) && !linkedQuiz && (
                                <button onClick={() => { createQuiz(doc.id, doc.name); setDocMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 500, color: '#f59e0b', fontFamily: 'inherit', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#fefce8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                  <HelpCircle size={12} /> Crear quiz
                                </button>
                              )}
                              {!isQuiz && linkedQuiz && (
                                <button onClick={() => { setQuizEditor(linkedQuiz); setDocMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 500, color: '#f59e0b', fontFamily: 'inherit', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#fefce8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                  <Pencil size={12} /> Editar quiz
                                </button>
                              )}
                              <button onClick={() => deleteDoc(doc.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 500, color: '#ef4444', fontFamily: 'inherit', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <Trash2 size={12} /> Eliminar
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
                <div style={{ padding: 30, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>No hay documentos en esta categoría</div>
              )}
            </div>
          )}

          {viewMode === 'grid' && filteredDocs.length === 0 && (
            <div style={{ padding: 30, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>No hay documentos en esta categoría</div>
          )}
        </div>
      </div>

      {/* MENÚ CONTEXTUAL CATEGORÍA */}
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

      {/* MODAL CONFIRMAR ELIMINAR CATEGORÍA */}
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
                <h2 className="pl-del-title">Eliminar categoría</h2>
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
                  Eliminar categoría
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
                  background: '#eff6ff', color: '#3b82f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Link2 size={16} />
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
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef3c7', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HelpCircle size={16} />
                  </div>
                  <h2 style={{ margin: 0 }}>Editor de Quiz</h2>
                </div>
                <button className="pl-modal-close" onClick={() => setQuizEditor(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="pl-modal-body" style={{ overflowY: 'auto', maxHeight: '60vh' }}>
                <label className="pl-label">
                  Nombre del quiz
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
                <button className="pl-btn-save" onClick={() => saveQuiz(quiz)}>Guardar quiz</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

