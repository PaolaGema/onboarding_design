import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useTronco } from '../../context/TroncoContext'
import { useRutaActiva } from '../../context/RutaActivaContext'
import { useConfig } from '../../context/ConfigContext'
import {
  ArrowLeft, Eye, Save, Zap, ChevronRight,
  Lock, CheckCircle2, GripVertical, Plus,
  BookOpen, Video, Headphones, FileText, HelpCircle,
  ClipboardList, FormInput, Upload, MousePointerClick,
  UserCheck, Calendar, MapPin, ShoppingBag, ExternalLink,
  ShieldCheck, X, Star, Pencil, Trash2, Settings2, Layers, Search
} from 'lucide-react'

const tiposTarea = [
  { key: 'video', label: 'Video', icon: Video, color: '#3b82f6', resp: 'Colaborador' },
  { key: 'audio', label: 'Audio / Podcast', icon: Headphones, color: '#06b6d4', resp: 'Colaborador' },
  { key: 'documento', label: 'Documento / PDF', icon: FileText, color: '#f97316', resp: 'Colaborador' },
  { key: 'quiz', label: 'Cuestionario', icon: HelpCircle, color: '#f59e0b', resp: 'Colaborador' },
  { key: 'completar-perfil', label: 'Formulario', icon: ClipboardList, color: '#10b981', resp: 'Colaborador' },
  { key: 'subida', label: 'Subida de archivo', icon: Upload, color: '#ec4899', resp: 'Colaborador' },
  { key: 'tarea-otro', label: 'Tarea asignada a otro', icon: UserCheck, color: '#ef4444', resp: 'Otro usuario' },
  { key: 'recorrido', label: 'Recorrido por área', icon: MapPin, color: '#d946ef', resp: 'Colab + responsable' },
  { key: 'tarea-rrhh', label: 'Tarea de RR.HH.', icon: ShieldCheck, color: '#0C2D40', resp: 'RR.HH. / Admin' },
]

const tipoMap = Object.fromEntries(tiposTarea.map(t => [t.key, t]))

export const rutasData = {
  1: {
    etapas: [
      { name: 'Mi primera semana', locked: false, days: 'Día 1 — Día 7', actividades: [
        { name: 'Conoce tu área', tareas: [
          { id: 't6', name: 'Recorrido presencial', tipo: 'recorrido', obligatoria: true, puntos: 15, desc: 'Recorrido guiado por las instalaciones del área de ventas. Durante este recorrido conocerás los espacios clave donde desarrollarás tu trabajo diario, las áreas comunes disponibles para tu uso, los puntos de acceso y seguridad, y las personas responsables de cada zona. Te recomendamos usar calzado cómodo ya que el recorrido dura aproximadamente 45 minutos. Al finalizar cada parada, marca el lugar como visitado para registrar tu avance. Si tienes alguna duda durante el recorrido, no dudes en consultar a tu acompañante asignado.', responsable: 'Líder de área', fechaRel: 'Día 2', confirmacion: false, done: false },
          { id: 't7', name: 'Video "Así trabajamos"', tipo: 'video', obligatoria: false, puntos: 10, desc: 'Video explicando la metodología y flujo de trabajo del equipo.', responsable: 'Colaborador', fechaRel: 'Día 2', confirmacion: false, done: false },
          { id: 't8', name: 'Evaluación — Conoce tu área', tipo: 'quiz', obligatoria: true, puntos: 15, desc: 'Evaluación integral sobre lo aprendido en esta actividad: instalaciones, metodología de trabajo y estructura del equipo.', responsable: 'Colaborador', fechaRel: 'Día 3', confirmacion: false, done: false },
        ]},
        { name: 'Tu equipo clave', tareas: [
          { id: 't9', name: 'Manual de funciones', tipo: 'documento', obligatoria: false, puntos: 10, desc: 'Lee el manual de funciones de la empresa para conocer las responsabilidades, procesos y lineamientos de tu cargo.', responsable: 'Colaborador', fechaRel: 'Día 3', confirmacion: false, done: false },
        ]},
      ]},
      { name: 'Conoce Ventas', locked: false, days: 'Día 8 — Día 15', actividades: [
        { name: 'Producto & CRM', tareas: [
          { id: 't11', name: 'Demo del producto', tipo: 'video', obligatoria: true, puntos: 15, desc: 'Video demostrativo del producto principal.', responsable: 'Colaborador', fechaRel: 'Día 8', confirmacion: false, done: false },
          { id: 't12', name: 'Tutorial CRM', tipo: 'video', obligatoria: true, puntos: 15, desc: 'Capacitación en el uso del sistema CRM.', responsable: 'Colaborador', fechaRel: 'Día 9', confirmacion: false, done: false },
          { id: 't13', name: 'Práctica en CRM', tipo: 'form-custom', obligatoria: true, puntos: 20, desc: 'Ejercicio práctico: registrar un lead y una oportunidad.', responsable: 'Colaborador', fechaRel: 'Día 10', confirmacion: false, done: false },
          { id: 't14', name: 'Cuestionario de producto', tipo: 'quiz', obligatoria: true, puntos: 25, desc: 'Evaluación de conocimiento sobre el producto y CRM.', responsable: 'Colaborador', fechaRel: 'Día 11', confirmacion: false, done: false },
        ]},
        { name: 'Pitch comercial', tareas: [
          { id: 't15', name: 'Guía de pitch', tipo: 'lectura', obligatoria: true, puntos: 10, desc: 'Documento con la estructura y argumentos del pitch comercial.', responsable: 'Colaborador', fechaRel: 'Día 12', confirmacion: true, done: false },
        ]},
      ]},
      { name: 'Primer mes', locked: false, days: 'Día 16 — Día 30', actividades: [
        { name: 'Autonomía', tareas: [
          { id: 't17', name: 'Primera llamada real', tipo: 'tarea-otro', obligatoria: true, puntos: 30, desc: 'Realizar la primera llamada supervisada a un prospecto.', responsable: 'Líder de área', fechaRel: 'Día 16', confirmacion: false, done: false },
          { id: 't19', name: 'Enlace a recursos ventas', tipo: 'enlace', obligatoria: false, puntos: 5, desc: 'Biblioteca de recursos y materiales de apoyo.', responsable: 'Colaborador', fechaRel: 'Día 22', confirmacion: false, done: false },
        ]},
        { name: 'Certificación', tareas: [
          { id: 't20', name: 'Evaluación final', tipo: 'quiz', obligatoria: true, puntos: 50, desc: 'Examen integral de conocimientos y habilidades.', responsable: 'Colaborador', fechaRel: 'Día 28', confirmacion: false, done: false },
          { id: 't21', name: 'Tarea RRHH: Cerrar expediente', tipo: 'tarea-rrhh', obligatoria: true, puntos: 0, desc: 'Verificar que toda la documentación está completa.', responsable: 'RR.HH.', fechaRel: 'Día 29', confirmacion: false, done: false },
          { id: 't22', name: 'Certificado de onboarding', tipo: 'confirmacion', obligatoria: true, puntos: 100, desc: 'Entrega del certificado de graduación del onboarding.', responsable: 'Colaborador', fechaRel: 'Día 30', confirmacion: true, done: false },
        ]},
      ]},
    ],
  },
}

const defaultRuta = rutasData[1]

let idCounter = 100

const emptyRuta = {
  etapas: [
    { name: 'Nueva etapa', locked: false, days: 'Día 1', actividades: [{ name: 'General', tareas: [] }] },
  ],
}

export default function JourneyBuilder({ plantilla, onBack, empty, onSave, backLabel }) {
  const { tronco } = useTronco()
  const { activarRuta } = useRutaActiva()
  const { gamificacion } = useConfig()
  const isTroncoEditor = plantilla.id === 'tronco'

  const [rutaState, setRutaState] = useState(() => {
    if (empty) return JSON.parse(JSON.stringify(emptyRuta))
    if (isTroncoEditor && tronco.configured) {
      return { etapas: JSON.parse(JSON.stringify(tronco.etapas)) }
    }
    const src = rutasData[plantilla.id] || defaultRuta
    const data = JSON.parse(JSON.stringify(src))
    if (!isTroncoEditor && tronco.configured) {
      const troncoEtapas = tronco.etapas.map(e => ({ ...JSON.parse(JSON.stringify(e)), locked: true }))
      data.etapas = [...troncoEtapas, ...data.etapas.filter(e => !e.locked)]
    }
    return data
  })
  const [selEtapa, setSelEtapa] = useState(0)
  const [selTarea, setSelTarea] = useState(null)
  const [tareaForm, setTareaForm] = useState(null)
  const [tab, setTab] = useState('contenido')
  const [dropTarget, setDropTarget] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [editingEtapa, setEditingEtapa] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteInput, setDeleteInput] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [showAddPicker, setShowAddPicker] = useState(false)
  const [quizDropOpen, setQuizDropOpen] = useState(false)
  const [quizSearch, setQuizSearch] = useState('')
  const [contextMenu, setContextMenu] = useState(null)
  const [deleteTaskConfirm, setDeleteTaskConfirm] = useState(null)
  const [dragNode, setDragNode] = useState(null)
  const [editingActividad, setEditingActividad] = useState(null)
  const [actividadMenu, setActividadMenu] = useState(null)
  const [showNewEtapa, setShowNewEtapa] = useState(false)
  const [newEtapaName, setNewEtapaName] = useState('')
  const [newEtapaDays, setNewEtapaDays] = useState(7)
  const [etapaMenu, setEtapaMenu] = useState(null)
  const [editingEtapaSb, setEditingEtapaSb] = useState(null)
  const [dragEtapa, setDragEtapa] = useState(null)
  const [dropEtapaTarget, setDropEtapaTarget] = useState(null)
  const [editEtapaModal, setEditEtapaModal] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const canvasRef = useRef(null)
  const scrollInterval = useRef(null)

  const handleCanvasDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    const el = canvasRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const y = e.clientY - rect.top
    const edge = 80

    if (y < edge) {
      if (!scrollInterval.current) {
        scrollInterval.current = setInterval(() => {
          el.scrollTop -= 12
        }, 16)
      }
    } else if (y > rect.height - edge) {
      if (!scrollInterval.current) {
        scrollInterval.current = setInterval(() => {
          el.scrollTop += 12
        }, 16)
      }
    } else {
      if (scrollInterval.current) { clearInterval(scrollInterval.current); scrollInterval.current = null }
    }
  }, [])

  const stopAutoScroll = useCallback(() => {
    if (scrollInterval.current) { clearInterval(scrollInterval.current); scrollInterval.current = null }
  }, [])

  useEffect(() => () => stopAutoScroll(), [])

  const etapa = rutaState.etapas[selEtapa]

  function deleteTarea(tareaId) {
    setRutaState(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      next.etapas.forEach(e => {
        e.actividades.forEach(a => {
          a.tareas = a.tareas.filter(t => t.id !== tareaId)
        })
      })
      return next
    })
    if (selTarea?.id === tareaId) { setSelTarea(null); setTareaForm(null) }
    setDeleteTaskConfirm(null)
  }

  function reorderTarea(fromIdx, toIdx) {
    if (fromIdx === toIdx) return
    setRutaState(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const flat = []
      next.etapas[selEtapa].actividades.forEach(a => a.tareas.forEach(t => flat.push(t)))
      const [moved] = flat.splice(fromIdx, 1)
      const insertAt = toIdx > fromIdx ? toIdx - 1 : toIdx
      flat.splice(insertAt, 0, moved)
      next.etapas[selEtapa].actividades = [{ name: 'General', tareas: flat }]
      return next
    })
    setDragNode(null)
  }

  function renameEtapa(idx, newName) {
    if (!newName.trim()) return
    setRutaState(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      next.etapas[idx].name = newName.trim()
      return next
    })
  }

  function addActividad() {
    setRutaState(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      next.etapas[selEtapa].actividades.push({
        name: `Nueva actividad ${next.etapas[selEtapa].actividades.length + 1}`,
        tareas: [],
      })
      return next
    })
  }

  function renameActividad(ai, newName) {
    if (!newName.trim()) return
    setRutaState(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      next.etapas[selEtapa].actividades[ai].name = newName.trim()
      return next
    })
    setEditingActividad(null)
  }

  function deleteActividad(ai) {
    setRutaState(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const acts = next.etapas[selEtapa].actividades
      if (acts.length <= 1) return prev
      const tareasHuerfanas = acts[ai].tareas
      acts.splice(ai, 1)
      if (tareasHuerfanas.length > 0) {
        acts[Math.min(ai, acts.length - 1)].tareas.push(...tareasHuerfanas)
      }
      return next
    })
    setActividadMenu(null)
  }

  function updateEtapaDuration(idx, dias) {
    setRutaState(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      next.etapas[idx].duracion = dias
      let acum = 1
      next.etapas.forEach((e, i) => {
        const d = e.duracion || 7
        e.days = d === 1 ? `Día ${acum}` : `Día ${acum} — Día ${acum + d - 1}`
        acum += d
      })
      return next
    })
  }

  function reorderEtapa(fromIdx, toIdx) {
    if (fromIdx === toIdx) return
    setRutaState(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const [moved] = next.etapas.splice(fromIdx, 1)
      next.etapas.splice(toIdx, 0, moved)
      let acum = 1
      next.etapas.forEach(e => {
        const d = e.duracion || 7
        e.days = d === 1 ? `Día ${acum}` : `Día ${acum} — Día ${acum + d - 1}`
        acum += d
      })
      return next
    })
    setSelEtapa(toIdx)
    setDragEtapa(null)
    setDropEtapaTarget(null)
  }

  function deleteEtapa(idx) {
    if (rutaState.etapas.length <= 1) return
    setRutaState(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      next.etapas.splice(idx, 1)
      return next
    })
    setSelEtapa(Math.max(0, idx - 1))
    setSelTarea(null)
    setTareaForm(null)
    setDeleteConfirm(null)
    setDeleteInput('')
  }

  function selectTarea(tarea) {
    if (selTarea?.id === tarea.id) {
      setSelTarea(null)
      setTareaForm(null)
    } else {
      setSelTarea(tarea)
      setTareaForm({ ...tarea })
    }
  }

  function saveTareaForm() {
    if (!tareaForm) return
    setRutaState(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      next.etapas.forEach(e => {
        e.actividades.forEach(a => {
          a.tareas = a.tareas.map(t => t.id === tareaForm.id ? { ...tareaForm } : t)
        })
      })
      return next
    })
    setSelTarea(null)
    setTareaForm(null)
  }

  function updateForm(field, value) {
    setTareaForm(prev => ({ ...prev, [field]: value }))
  }

  function closeModal() {
    setSelTarea(null)
    setTareaForm(null)
  }

  function handleDragStart(e, tipoKey) {
    e.dataTransfer.setData('tipoKey', tipoKey)
    e.dataTransfer.effectAllowed = 'copy'
    setTimeout(() => setIsDragging(true), 0)
  }

  function handleDragEnd() {
    setIsDragging(false)
    setDropTarget(null)
    stopAutoScroll()
  }

  function createTarea(tipoKey, flatIdx, actividadIdx) {
    const tipo = tipoMap[tipoKey]
    if (!tipo) return

    const newTarea = {
      id: `t${++idCounter}`,
      name: `Nueva tarea — ${tipo.label}`,
      tipo: tipoKey,
      obligatoria: false,
      puntos: 10,
      desc: '',
      responsable: tipo.resp,
      fechaRel: etapa.days.split('—')[0]?.trim() || 'Día 1',
      confirmacion: false,
      done: false,
      dias: 1,
    }

    setRutaState(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const acts = next.etapas[selEtapa].actividades

      if (actividadIdx !== undefined) {
        acts[actividadIdx].tareas.push(newTarea)
      } else if (flatIdx === undefined) {
        acts[acts.length - 1].tareas.push(newTarea)
      } else {
        let count = 0
        let inserted = false
        for (let ai = 0; ai < acts.length; ai++) {
          const tareas = acts[ai].tareas
          if (!inserted && count + tareas.length >= flatIdx) {
            tareas.splice(flatIdx - count, 0, newTarea)
            inserted = true
            break
          }
          count += tareas.length
        }
        if (!inserted) {
          acts[acts.length - 1].tareas.push(newTarea)
        }
      }
      return next
    })

    setSelTarea(newTarea)
    setTareaForm({ ...newTarea })
  }

  function handleDropAtIndex(e, flatIdx) {
    e.preventDefault()
    e.stopPropagation()
    setDropTarget(null)
    setIsDragging(false)
    const tipoKey = e.dataTransfer.getData('tipoKey')
    createTarea(tipoKey, flatIdx)
  }

  const totalTareas = rutaState.etapas.reduce((s, e) => s + e.actividades.reduce((s2, a) => s2 + a.tareas.length, 0), 0)
  const completadas = rutaState.etapas.reduce((s, e) => s + e.actividades.reduce((s2, a) => s2 + a.tareas.filter(t => t.done).length, 0), 0)

  return (
    <div className="jb">
      {/* BARRA SUPERIOR */}
      <div className="jb-topbar">
        <div className="jb-breadcrumb">
          <button className="jb-back" onClick={() => {
            if (onSave) {
              const hasTareas = rutaState.etapas.some(e => e.actividades.some(a => a.tareas.length > 0))
              if (hasTareas) onSave(rutaState.etapas)
            }
            onBack()
          }}>
            <ArrowLeft size={16} />
          </button>
          <span className="jb-bc-text">{isTroncoEditor ? 'Configuración' : (backLabel || 'Rutas')}</span>
          <ChevronRight size={14} className="jb-bc-sep" />
          <span className="jb-bc-current">{plantilla.name}</span>
        </div>
        <div className="jb-topbar-actions">
          <button className="jb-btn-outline" onClick={() => setShowConfig(true)}>
            <Settings2 size={14} />
          </button>
          <button className="jb-btn-outline" onClick={() => setShowPreview(true)}>
            <Eye size={14} />
            Vista previa
          </button>
          <button className="jb-btn-outline">
            <Save size={14} />
            Guardar borrador
          </button>
          <button className="jb-btn-primary" onClick={() => {
            if (onSave) {
              const hasTareas = rutaState.etapas.some(e => e.actividades.some(a => a.tareas.length > 0))
              if (hasTareas) onSave(rutaState.etapas)
            }
            if (!isTroncoEditor) {
              activarRuta(rutaState.etapas, { nombre: plantilla.name, area: plantilla.area })
            }
            if (isTroncoEditor) onBack()
          }}>
            <Save size={14} />
            Guardar ruta
          </button>
        </div>
      </div>

      {/* CANVAS COMPLETO */}
      <div className="jb-panels">
        <div className="jb-canvas">
            <div
              ref={canvasRef}
              className="jb-canvas-body jb-pizarra"
              onDragOver={handleCanvasDragOver}
              onDragLeave={stopAutoScroll}
              onDrop={e => { stopAutoScroll(); if (dropTarget === null) { e.preventDefault(); setIsDragging(false); const tk = e.dataTransfer.getData('tipoKey'); if (tk) createTarea(tk) } }}
            >

              {/* CARD ETAPAS — izquierda */}
              <div className="jb-float-card jb-float-left">
                <div className="jb-sb-title">Etapas <span className="jb-sb-count">{rutaState.etapas.length}</span></div>
                <p className="jb-sb-hint">Selecciona una etapa para ver sus tareas</p>
                <div className="jb-sb-list">
                  {rutaState.etapas.map((e, i) => {
                    const done = e.actividades.every(a => a.tareas.every(t => t.done))
                    const progress = e.actividades.some(a => a.tareas.some(t => t.done))
                    const canDrag = !e.locked && editingEtapaSb !== i
                    return (
                      <div
                        key={i}
                        onDragOver={ev => { ev.preventDefault(); ev.stopPropagation(); ev.dataTransfer.dropEffect = 'move'; if (dragEtapa !== null && dragEtapa !== i) setDropEtapaTarget(i) }}
                        onDragLeave={ev => { if (!ev.currentTarget.contains(ev.relatedTarget)) setDropEtapaTarget(null) }}
                        onDrop={ev => { ev.preventDefault(); ev.stopPropagation(); const from = ev.dataTransfer.getData('etapaIdx'); if (from !== '') reorderEtapa(Number(from), i) }}
                        style={{
                          opacity: dragEtapa === i ? 0.35 : 1,
                          transition: 'opacity .15s',
                          position: 'relative',
                        }}
                      >
                        {dropEtapaTarget === i && dragEtapa !== null && dragEtapa !== i && (
                          <div style={{
                            position: 'absolute', left: 8, right: 8, height: 2, borderRadius: 1,
                            background: '#0C2D40', zIndex: 5,
                            ...(dragEtapa > i ? { top: -1 } : { bottom: -1 }),
                          }} />
                        )}
                        {editingEtapaSb === i ? (
                          <div style={{ padding: '4px 0' }}>
                            <input
                              defaultValue={e.name}
                              autoFocus
                              onBlur={ev => { renameEtapa(i, ev.target.value); setEditingEtapaSb(null) }}
                              onKeyDown={ev => {
                                if (ev.key === 'Enter') { renameEtapa(i, ev.target.value); setEditingEtapaSb(null) }
                                if (ev.key === 'Escape') setEditingEtapaSb(null)
                              }}
                              style={{
                                width: '100%', padding: '7px 10px', border: '1.5px solid #0C2D40',
                                borderRadius: 8, fontSize: 12, fontFamily: 'inherit', outline: 'none',
                                fontWeight: 600,
                              }}
                            />
                          </div>
                        ) : (
                          <div
                            className={`jb-sb-item ${selEtapa === i ? 'active' : ''} ${done ? 'done' : ''}`}
                            draggable={canDrag}
                            onDragStart={ev => { ev.dataTransfer.setData('etapaIdx', String(i)); ev.dataTransfer.effectAllowed = 'move'; setDragEtapa(i) }}
                            onDragEnd={() => { setDragEtapa(null); setDropEtapaTarget(null) }}
                            onClick={() => { setSelEtapa(i); setSelTarea(null); setTab('contenido') }}
                            onContextMenu={ev => { ev.preventDefault(); setEtapaMenu({ idx: i, x: ev.clientX, y: ev.clientY }) }}
                            style={{ cursor: canDrag ? 'grab' : 'pointer' }}
                          >
                            {canDrag && (
                              <GripVertical size={12} style={{ color: '#cbd5e1', flexShrink: 0, marginRight: -4 }} />
                            )}
                            <div className={`jb-sb-dot ${done ? 'dot-done' : progress ? 'dot-progress' : ''}`}>
                              {e.locked ? <Lock size={9} /> : <span className="jb-sb-dot-num">{i + 1}</span>}
                            </div>
                            <div className="jb-sb-info">
                              <div className="jb-sb-name">{e.name}</div>
                              <div className="jb-sb-days">{e.days}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <button className="jb-sb-add" onClick={() => { setNewEtapaName(''); setNewEtapaDays(7); setShowNewEtapa(true) }}>
                  <Plus size={14} />
                  Agregar etapa
                </button>
              </div>

              {/* CARD TIPOS DE TAREA — derecha */}
              <div className="jb-float-card jb-float-right">
                <div className="jb-sb-title">Tipos de tarea</div>
                <p className="jb-sb-hint">Arrastra al lienzo o haz clic para agregar</p>
                <div className="jb-sb-palette">
                  {tiposTarea.map(t => (
                    <div
                      key={t.key}
                      className="jb-palette-item"
                      title={`Click para agregar o arrastra al camino`}
                      draggable
                      onDragStart={e => handleDragStart(e, t.key)}
                      onDragEnd={handleDragEnd}
                      onClick={() => createTarea(t.key)}
                    >
                      <div className="jb-palette-ico" style={{ background: `${t.color}15`, color: t.color }}>
                        <t.icon size={14} />
                      </div>
                      <span className="jb-palette-label">{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="jb-etapa-header" style={{ alignItems: 'stretch' }}>
                <div className={`jb-etapa-num ${etapa.locked ? 'locked' : ''}`}>
                  {etapa.locked ? <Lock size={14} /> : selEtapa + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="jb-etapa-name">{etapa.name}</div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    marginTop: 4, fontSize: 12, color: '#94a3b8',
                  }}>
                    <Calendar size={12} />
                    {etapa.days}
                  </div>
                </div>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '4px 16px', borderLeft: '1px solid #e2e8f0', marginLeft: 8,
                }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: '#0C2D40', lineHeight: 1 }}>
                    {etapa.duracion || 7}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', marginTop: 2 }}>
                    días
                  </span>
                </div>
                {etapa.locked && (
                  <div className="jb-etapa-actions">
                    <span className="jb-etapa-badge">Inducción general — protegido</span>
                  </div>
                )}
              </div>

              <div className={`jb-duo-path ${isDragging ? 'dragging' : ''}`}>
                {(() => {
                  const items = []
                  const positions = [0, 60, 90, 60, 0, -60, -90, -60]
                  let flatIdx = 0

                  etapa.actividades.forEach((actividad, ai) => {
                    items.push(
                      <div key={`act-${ai}`} className="jb-actividad-divider">
                        {editingActividad === ai ? (
                          <input
                            className="jb-actividad-input"
                            defaultValue={actividad.name}
                            autoFocus
                            onBlur={ev => renameActividad(ai, ev.target.value)}
                            onKeyDown={ev => {
                              if (ev.key === 'Enter') renameActividad(ai, ev.target.value)
                              if (ev.key === 'Escape') setEditingActividad(null)
                            }}
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <span
                            className="jb-actividad-pill jb-actividad-pill--admin"
                            onClick={() => setEditingActividad(ai)}
                            onContextMenu={e => { e.preventDefault(); setActividadMenu({ ai, x: e.clientX, y: e.clientY }) }}
                            title="Clic para renombrar · Clic derecho para más opciones"
                          >
                            {actividad.name}
                            <Pencil size={10} className="jb-actividad-edit-ico" />
                          </span>
                        )}
                      </div>
                    )

                    if (actividad.tareas.length === 0) {
                      items.push(
                        <div
                          key={`empty-${ai}`}
                          className={`jb-actividad-empty ${dropTarget === `act-${ai}` ? 'active' : ''}`}
                          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setDropTarget(`act-${ai}`) }}
                          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDropTarget(null) }}
                          onDrop={e => {
                            e.preventDefault(); e.stopPropagation()
                            setDropTarget(null); setIsDragging(false)
                            const tk = e.dataTransfer.getData('tipoKey')
                            if (tk) createTarea(tk, undefined, ai)
                          }}
                        >
                          <div className="jb-drop-indicator" title="Agregar tarea — arrastra desde el panel derecho">
                            <Plus size={16} />
                          </div>
                        </div>
                      )
                    }

                    actividad.tareas.forEach((tarea) => {
                      const i = flatIdx
                      const tipo = tipoMap[tarea.tipo] || tiposTarea[0]
                      const Icon = tipo.icon
                      const isSelected = selTarea?.id === tarea.id
                      const status = 'active'
                      const xOff = positions[i % positions.length]

                      items.push(
                        <div
                          key={`drop-${i}`}
                          className={`jb-drop-zone ${dropTarget === i ? 'active' : ''}`}
                          style={{ '--x-off': `${xOff}px` }}
                          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = dragNode !== null ? 'move' : 'copy'; setDropTarget(i) }}
                          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDropTarget(null) }}
                          onDrop={e => {
                            e.preventDefault(); e.stopPropagation()
                            const from = e.dataTransfer.getData('reorder')
                            if (from !== '') { reorderTarea(Number(from), i); setIsDragging(false) }
                            else { handleDropAtIndex(e, i) }
                          }}
                        >
                          <div className="jb-drop-indicator" title="Agregar tarea">
                            <Plus size={14} />
                          </div>
                        </div>
                      )

                      items.push(
                        <div
                          key={tarea.id}
                          className={`jb-duo-node-wrap ${dragNode === i ? 'dragging-node' : ''}`}
                          style={{ '--x-off': `${xOff}px` }}
                          draggable
                          onDragStart={e => { e.dataTransfer.setData('reorder', String(i)); e.dataTransfer.effectAllowed = 'move'; setDragNode(i); setTimeout(() => setIsDragging(true), 0) }}
                          onDragEnd={() => { setDragNode(null); setIsDragging(false); setDropTarget(null) }}
                        >
                          <button
                            className={`jb-duo-node ${status} ${isSelected ? 'selected' : ''}`}
                            onClick={() => selectTarea(tarea)}
                            onContextMenu={e => { e.preventDefault(); setContextMenu({ id: tarea.id, x: e.clientX, y: e.clientY }) }}
                            title={tarea.name}
                          >
                            <div className="jb-duo-circle">
                              <Icon size={18} />
                            </div>
                            {gamificacion && tarea.puntos > 0 && <span className="jb-duo-puntos">+{tarea.puntos}</span>}
                          </button>
                          <span className={`jb-duo-label ${status}`}>{tarea.name}</span>
                        </div>
                      )

                      flatIdx++
                    })

                    if (actividad.tareas.length > 0) {
                      const endIdx = flatIdx
                      const endXOff = positions[endIdx % positions.length]
                      items.push(
                        <div
                          key={`drop-end-${ai}`}
                          className={`jb-drop-zone ${dropTarget === endIdx ? 'active' : ''}`}
                          style={{ '--x-off': `${endXOff}px` }}
                          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = dragNode !== null ? 'move' : 'copy'; setDropTarget(endIdx) }}
                          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDropTarget(null) }}
                          onDrop={e => {
                            e.preventDefault(); e.stopPropagation()
                            const from = e.dataTransfer.getData('reorder')
                            if (from !== '') { reorderTarea(Number(from), endIdx); setIsDragging(false) }
                            else { handleDropAtIndex(e, endIdx) }
                          }}
                        >
                          <div className="jb-drop-indicator" title="Agregar tarea">
                            <Plus size={14} />
                          </div>
                        </div>
                      )
                    }
                  })

                  return items
                })()}

                {/* BOTÓN AGREGAR ACTIVIDAD */}
                <button className="jb-add-actividad-btn" onClick={addActividad}>
                  <Layers size={14} />
                  Agregar actividad
                </button>

                {/* INDICADOR AGREGAR TAREA */}
                <div className="jb-add-task-wrap">
                  <div className="jb-drop-indicator" title="Agregar tarea — arrastra desde el panel derecho">
                    <Plus size={16} />
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* MODAL PROPIEDADES */}
      {tareaForm && (() => {
        const tipo = tipoMap[tareaForm.tipo] || tiposTarea[0]
        const responsables = [
          { value: 'Colaborador', icon: UserCheck, color: '#10b981' },
          { value: 'Líder de área', icon: Star, color: '#f59e0b' },
          { value: 'Manager', icon: ShieldCheck, color: '#3b82f6' },
          { value: 'RR.HH. / Admin', icon: Settings2, color: '#8b5cf6' },
          { value: 'Colaborador + Manager', icon: UserCheck, color: '#06b6d4' },
          { value: 'Colaborador + Líder', icon: UserCheck, color: '#ec4899' },
        ]
        const selResp = responsables.find(r => r.value === tareaForm.responsable) || responsables[0]
        const totalDias = etapa.duracion || 7
        const desde = tareaForm.diaDesde || 1
        const hasta = tareaForm.diaHasta || desde
        const duracion = hasta - desde + 1
        return (
          <div className="pl-overlay" onClick={closeModal}>
            <div className="pl-modal jb-modal" onClick={e => e.stopPropagation()}>

              {/* HEADER CON BADGE DE TIPO */}
              <div style={{
                padding: '20px 24px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                borderBottom: '1px solid #f1f5f9',
              }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${tipo.color}12`, color: tipo.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1.5px solid ${tipo.color}25`,
                  }}>
                    <tipo.icon size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0C2D40', margin: 0 }}>Propiedades de la tarea</h2>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4,
                      padding: '2px 8px', borderRadius: 5,
                      background: `${tipo.color}10`, fontSize: 11, fontWeight: 600, color: tipo.color,
                    }}>
                      <tipo.icon size={11} />
                      {tipo.label}
                    </div>
                  </div>
                </div>
                <button className="pl-modal-close" onClick={closeModal}>
                  <X size={18} />
                </button>
              </div>

              <div className="pl-modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* SECCIÓN: INFORMACIÓN BÁSICA */}
                <div>
                  <label className="pl-label">
                    Nombre de la tarea
                    <input type="text" className="pl-input" value={tareaForm.name} onChange={e => updateForm('name', e.target.value)} />
                  </label>
                </div>

                {['video', 'audio', 'lectura', 'documento', 'enlace'].includes(tareaForm.tipo) && (() => {
                  const kbItems = [
                    { id: 'kb1', name: 'Código de conducta 2025.pdf', tipo: 'documento', cat: 'Políticas', url: '/docs/codigo-conducta.pdf', hasQuiz: true, quizName: 'Cuestionario de código de conducta', quizPreguntas: 5 },
                    { id: 'kb2', name: 'Política de vacaciones.pdf', tipo: 'documento', cat: 'Políticas', url: '/docs/vacaciones.pdf' },
                    { id: 'kb3', name: 'Manual de beneficios.pdf', tipo: 'documento', cat: 'Beneficios', url: '/docs/beneficios.pdf', hasQuiz: true, quizName: 'Cuestionario de beneficios', quizPreguntas: 8 },
                    { id: 'kb4', name: 'Guía de seguro médico.pdf', tipo: 'documento', cat: 'Beneficios', url: '/docs/seguro.pdf' },
                    { id: 'kb5', name: 'Guía acceso a sistemas.pdf', tipo: 'documento', cat: 'Procesos TI', url: '/docs/acceso-sistemas.pdf' },
                    { id: 'kb6', name: 'Valores y misión.pdf', tipo: 'documento', cat: 'Cultura', url: '/docs/valores.pdf', hasQuiz: true, quizName: 'Cuestionario de cultura organizacional', quizPreguntas: 5 },
                    { id: 'kb7', name: 'Video de bienvenida del CEO', tipo: 'video', cat: 'Cultura', url: 'https://youtube.com/watch?v=ejemplo1', hasQuiz: true, quizName: 'Cuestionario del video de bienvenida', quizPreguntas: 3 },
                    { id: 'kb8', name: 'Cómo usar el CRM', tipo: 'video', cat: 'Procesos TI', url: 'https://youtube.com/watch?v=ejemplo2' },
                    { id: 'kb9', name: 'Podcast de cultura organizacional', tipo: 'audio', cat: 'Cultura', url: 'https://spotify.com/episode/ejemplo' },
                  ]
                  const kbFiltered = kbItems.filter(item => {
                    if (['video'].includes(tareaForm.tipo)) return item.tipo === 'video'
                    if (['audio'].includes(tareaForm.tipo)) return item.tipo === 'audio'
                    return item.tipo === 'documento'
                  })
                  const kbSearch = tareaForm._kbSearch || ''
                  const kbVisible = kbFiltered.filter(item =>
                    item.name.toLowerCase().includes(kbSearch.toLowerCase())
                  )
                  return (
                    <div className="pl-label" style={{ position: 'relative' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Enlace del contenido</span>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <input
                          type="url"
                          className="pl-input"
                          style={{ flex: 1, margin: 0 }}
                          placeholder="https://..."
                          value={tareaForm.enlace || ''}
                          onChange={e => updateForm('enlace', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => updateForm('_kbOpen', !tareaForm._kbOpen)}
                          style={{
                            padding: '0 12px', borderRadius: 8, border: 'none',
                            background: tareaForm._kbOpen ? '#0C2D40' : '#f1f5f9',
                            color: tareaForm._kbOpen ? '#fff' : '#475569',
                            cursor: 'pointer', fontSize: 11, fontWeight: 600,
                            fontFamily: 'inherit', whiteSpace: 'nowrap',
                            display: 'flex', alignItems: 'center', gap: 5,
                            transition: 'all .15s',
                          }}
                        >
                          <BookOpen size={13} />
                          Base
                        </button>
                      </div>
                      {tareaForm._kbOpen && (
                        <div style={{
                          marginTop: 6, background: '#fff', borderRadius: 12, padding: 6,
                          boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid #e2e8f0',
                          animation: 'plSlideUp .12s',
                        }}>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 10px', background: '#f8fafc', borderRadius: 8,
                            border: '1px solid #e2e8f0', marginBottom: 4,
                          }}>
                            <Search size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                            <input
                              type="text"
                              placeholder="Buscar en biblioteca de recursos..."
                              value={kbSearch}
                              onChange={e => updateForm('_kbSearch', e.target.value)}
                              autoFocus
                              style={{
                                border: 'none', background: 'transparent', outline: 'none',
                                fontSize: 12, fontFamily: 'inherit', color: '#0C2D40', width: '100%',
                              }}
                            />
                          </div>
                          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                            {kbVisible.length === 0 ? (
                              <div style={{ padding: 12, textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>
                                No se encontraron contenidos
                              </div>
                            ) : kbVisible.map(item => {
                              const ItemIcon = item.tipo === 'video' ? Video : item.tipo === 'audio' ? Headphones : FileText
                              const itemColor = item.tipo === 'video' ? '#3b82f6' : item.tipo === 'audio' ? '#06b6d4' : '#64748b'
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => {
                                    updateForm('enlace', item.url)
                                    updateForm('_kbOpen', false)
                                    updateForm('_kbSearch', '')
                                    updateForm('_kbItem', item)
                                    if (item.hasQuiz) {
                                      updateForm('incluirQuiz', true)
                                    } else {
                                      updateForm('incluirQuiz', false)
                                    }
                                    if (!tareaForm.name || tareaForm.name.startsWith('Nueva tarea')) {
                                      updateForm('name', item.name)
                                    }
                                  }}
                                  style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '8px 10px', border: 'none', borderRadius: 8,
                                    background: 'transparent', cursor: 'pointer', textAlign: 'left',
                                    fontFamily: 'inherit', transition: 'background .1s',
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <div style={{
                                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                                    background: `${itemColor}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    <ItemIcon size={14} style={{ color: itemColor }} />
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{item.cat}</div>
                                  </div>
                                  {item.hasQuiz && (
                                    <div style={{
                                      padding: '2px 6px', borderRadius: 5,
                                      background: '#fef3c7', border: '1px solid #fde68a',
                                      fontSize: 8, fontWeight: 700, color: '#b45309', flexShrink: 0,
                                    }}>Cuest.</div>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      {tareaForm._kbItem?.hasQuiz && (
                        <div style={{
                          marginTop: 8, padding: '10px 14px', borderRadius: 10,
                          background: tareaForm.incluirQuiz ? '#fefce8' : '#f8fafc',
                          border: `1px solid ${tareaForm.incluirQuiz ? '#fde68a' : '#e2e8f0'}`,
                          display: 'flex', alignItems: 'center', gap: 10,
                          transition: 'all .15s',
                        }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                            background: tareaForm.incluirQuiz ? '#fef3c7' : '#f1f5f9',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <HelpCircle size={14} style={{ color: tareaForm.incluirQuiz ? '#f59e0b' : '#94a3b8' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40' }}>
                              {tareaForm._kbItem.quizName}
                            </div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>
                              {tareaForm._kbItem.quizPreguntas} preguntas · Se muestra al completar la tarea
                            </div>
                          </div>
                          <div
                            onClick={() => updateForm('incluirQuiz', !tareaForm.incluirQuiz)}
                            className={`jb-toggle ${tareaForm.incluirQuiz ? 'on' : ''}`}
                            style={{ cursor: 'pointer', flexShrink: 0 }}
                          >
                            <div className="jb-toggle-dot" />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}

                <label className="pl-label">
                  Descripción
                  <textarea className="pl-input" style={{ resize: 'vertical', minHeight: '56px' }} value={tareaForm.desc} rows={2} onChange={e => updateForm('desc', e.target.value)} />
                </label>

                {/* SECCIÓN: RESPONSABLE */}
                <div className="pl-label" style={{ position: 'relative' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>¿Quién la realiza?</span>
                  <div
                    onClick={() => updateForm('_respOpen', !tareaForm._respOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 10, marginTop: 4,
                      border: `1.5px solid ${tareaForm._respOpen ? '#0C2D40' : '#e2e8f0'}`,
                      background: '#fff', cursor: 'pointer', transition: 'border-color .15s',
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${selResp.color}12`,
                    }}>
                      <selResp.icon size={14} style={{ color: selResp.color }} />
                    </div>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#0C2D40' }}>{selResp.value}</span>
                    <ChevronRight size={13} style={{ color: '#94a3b8', transform: tareaForm._respOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }} />
                  </div>
                  {tareaForm._respOpen && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
                      background: '#fff', borderRadius: 12, padding: 4,
                      boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid #e2e8f0',
                      zIndex: 30, animation: 'plSlideUp .12s',
                    }}>
                      {responsables.map(r => (
                        <button
                          key={r.value}
                          onClick={() => { updateForm('responsable', r.value); updateForm('_respOpen', false) }}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 10px', border: 'none', borderRadius: 8,
                            background: tareaForm.responsable === r.value ? '#f8fafc' : 'transparent',
                            cursor: 'pointer', textAlign: 'left',
                            fontFamily: 'inherit', transition: 'background .1s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => { if (tareaForm.responsable !== r.value) e.currentTarget.style.background = 'transparent' }}
                        >
                          <div style={{
                            width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: `${r.color}12`,
                          }}>
                            <r.icon size={13} style={{ color: r.color }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40' }}>{r.value}</span>
                          {tareaForm.responsable === r.value && <CheckCircle2 size={13} style={{ color: '#10b981', marginLeft: 'auto' }} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* SECCIÓN: PLANIFICACIÓN — card agrupado */}
                <div style={{
                  background: '#f8fafc', borderRadius: 12, padding: 16,
                  border: '1px solid #e8ecf0',
                  display: 'flex', flexDirection: 'column', gap: 14,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0C2D40', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Planificación
                  </div>

                  {/* Rango de días */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 6 }}>¿En qué días se realiza?</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <select
                        className="pl-input"
                        value={desde}
                        style={{ flex: 1, background: '#fff' }}
                        onChange={e => {
                          const v = Number(e.target.value)
                          updateForm('diaDesde', v)
                          if (v > hasta) updateForm('diaHasta', v)
                        }}
                      >
                        {Array.from({ length: totalDias }, (_, i) => (
                          <option key={i + 1} value={i + 1}>Día {i + 1}</option>
                        ))}
                      </select>
                      <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>al</span>
                      <select
                        className="pl-input"
                        value={hasta}
                        style={{ flex: 1, background: '#fff' }}
                        onChange={e => updateForm('diaHasta', Number(e.target.value))}
                      >
                        {Array.from({ length: totalDias - desde + 1 }, (_, i) => (
                          <option key={desde + i} value={desde + i}>Día {desde + i}</option>
                        ))}
                      </select>
                      <div style={{
                        padding: '6px 10px', borderRadius: 8, background: '#0C2D40',
                        color: '#fff', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                      }}>
                        {duracion} {duracion === 1 ? 'día' : 'días'}
                      </div>
                    </div>
                  </div>

                  {/* Puntos + duración estimada */}
                  <div style={{ display: (gamificacion || ['video', 'audio', 'lectura'].includes(tareaForm.tipo)) ? 'grid' : 'none', gridTemplateColumns: gamificacion && ['video', 'audio', 'lectura'].includes(tareaForm.tipo) ? '1fr 1fr' : '1fr', gap: 10 }}>
                    {gamificacion && (
                      <label className="pl-label" style={{ margin: 0 }}>
                        Puntos
                        <input type="number" className="pl-input" style={{ background: '#fff' }} value={tareaForm.puntos} onChange={e => updateForm('puntos', Number(e.target.value))} />
                      </label>
                    )}
                    {['video', 'audio', 'lectura'].includes(tareaForm.tipo) && (
                      <label className="pl-label" style={{ margin: 0 }}>
                        Duración estimada
                        <input type="text" className="pl-input" style={{ background: '#fff' }} placeholder="5 min" value={tareaForm.duracion || ''} onChange={e => updateForm('duracion', e.target.value)} />
                      </label>
                    )}
                  </div>
                  {gamificacion && (
                    <div style={{ fontSize: 10, color: tareaForm.verificarQuiz ? '#f59e0b' : '#94a3b8' }}>
                      {tareaForm.verificarQuiz
                        ? 'Los puntos se otorgan solo si aprueba el cuestionario de verificación'
                        : 'Los puntos se otorgan cuando el colaborador marque como completada'
                      }
                    </div>
                  )}
                </div>

                <div style={{ fontSize: 10, color: tareaForm.verificarQuiz ? '#f59e0b' : '#94a3b8', marginTop: -2, marginBottom: 4, display: 'none' }}>
                  {tareaForm.verificarQuiz
                    ? 'Los puntos se otorgan solo si aprueba el cuestionario de verificación'
                    : 'Los puntos se otorgan cuando el colaborador marque como completada'
                  }
                </div>

                {tareaForm.tipo === 'quiz' && (
                  <div className="jb-form-row">
                    <label className="pl-label">
                      Nota mínima (%)
                      <input type="number" className="pl-input" placeholder="70" value={tareaForm.notaMinima ?? ''} onChange={e => updateForm('notaMinima', Number(e.target.value))} />
                    </label>
                    <label className="pl-label">
                      Intentos permitidos
                      <input type="number" className="pl-input" placeholder="3" value={tareaForm.intentos ?? ''} onChange={e => updateForm('intentos', Number(e.target.value))} />
                    </label>
                  </div>
                )}


                {tareaForm.tipo === 'recorrido' && (
                  <div className="jb-form-row">
                    <label className="pl-label">
                      Ubicación
                      <input type="text" className="pl-input" placeholder="Ej: Piso 3, Oficina principal" value={tareaForm.ubicacion || ''} onChange={e => updateForm('ubicacion', e.target.value)} />
                    </label>
                    <label className="pl-label">
                      Guía / Acompañante
                      <input type="text" className="pl-input" placeholder="Nombre del guía" value={tareaForm.guia || ''} onChange={e => updateForm('guia', e.target.value)} />
                    </label>
                  </div>
                )}

                {tareaForm.tipo === 'subida' && (
                  <label className="pl-label">
                    Formatos aceptados
                    <input type="text" className="pl-input" placeholder="Ej: PDF, JPG, PNG" value={tareaForm.formatos || ''} onChange={e => updateForm('formatos', e.target.value)} />
                  </label>
                )}

                {tareaForm.tipo === 'tarea-otro' && (
                  <label className="pl-label">
                    Asignado a
                    <input type="text" className="pl-input" placeholder="Nombre o rol del responsable" value={tareaForm.asignadoA || ''} onChange={e => updateForm('asignadoA', e.target.value)} />
                  </label>
                )}

                {['form-custom', 'completar-perfil'].includes(tareaForm.tipo) && (
                  <label className="pl-label">
                    Enlace al formulario
                    <input type="url" className="pl-input" placeholder="https://..." value={tareaForm.enlace || ''} onChange={e => updateForm('enlace', e.target.value)} />
                  </label>
                )}

                {/* TOGGLES */}

                <div className="jb-field-toggle" onClick={() => updateForm('obligatoria', !tareaForm.obligatoria)}>
                  <div>
                    <span>Obligatoria</span>
                    <div className="jb-toggle-hint">El colaborador debe completar esta tarea para avanzar</div>
                  </div>
                  <div className={`jb-toggle ${tareaForm.obligatoria ? 'on' : ''}`}>
                    <div className="jb-toggle-dot" />
                  </div>
                </div>

                {['video', 'audio', 'lectura', 'documento'].includes(tareaForm.tipo) && (
                  <>
                    <div className="jb-field-toggle" onClick={() => updateForm('verificarQuiz', !tareaForm.verificarQuiz)}>
                      <div>
                        <span>Verificar comprensión con cuestionario</span>
                        <div className="jb-toggle-hint">{gamificacion ? 'Agrega un cuestionario para asegurar que el colaborador entendió el contenido. Los puntos se otorgan según el resultado.' : 'Agrega un cuestionario para asegurar que el colaborador entendió el contenido.'}</div>
                      </div>
                      <div className={`jb-toggle ${tareaForm.verificarQuiz ? 'on' : ''}`}>
                        <div className="jb-toggle-dot" />
                      </div>
                    </div>

                    {tareaForm.verificarQuiz && (
                      <div style={{
                        background: '#f8fafc', borderRadius: 10, padding: '14px 16px',
                        display: 'flex', flexDirection: 'column', gap: 10,
                        border: '1px solid #e2e8f0',
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#0C2D40' }}>Configuración del cuestionario</div>
                        {(() => {
                          const quizzes = [
                            { id: 'q1', name: 'Cuestionario de cultura organizacional', preguntas: 5, cat: 'Cultura' },
                            { id: 'q2', name: 'Cuestionario de políticas internas', preguntas: 8, cat: 'Políticas' },
                            { id: 'q3', name: 'Cuestionario de seguridad informática', preguntas: 6, cat: 'Procesos TI' },
                            { id: 'q4', name: 'Cuestionario de producto', preguntas: 10, cat: 'Ventas' },
                            { id: 'q5', name: 'Cuestionario de procesos del área', preguntas: 4, cat: 'Procesos TI' },
                          ]
                          const selected = quizzes.find(q => q.id === tareaForm.quizId)
                          const filtered = quizzes.filter(q => q.name.toLowerCase().includes(quizSearch.toLowerCase()))
                          return (
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Seleccionar cuestionario de la biblioteca</div>
                              <div style={{ position: 'relative' }}>
                                <div
                                  onClick={() => { setQuizDropOpen(!quizDropOpen); setQuizSearch('') }}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '9px 12px', borderRadius: 10,
                                    border: `1.5px solid ${quizDropOpen ? '#0C2D40' : '#e2e8f0'}`,
                                    background: '#fff', cursor: 'pointer',
                                    transition: 'border-color .15s',
                                  }}
                                >
                                  {selected ? (
                                    <>
                                      <HelpCircle size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                                      <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#0C2D40' }}>{selected.name}</span>
                                      <span style={{ fontSize: 10, color: '#94a3b8' }}>{selected.preguntas} preg.</span>
                                    </>
                                  ) : (
                                    <span style={{ flex: 1, fontSize: 12, color: '#94a3b8' }}>Buscar cuestionario...</span>
                                  )}
                                  <ChevronRight size={13} style={{ color: '#94a3b8', transform: quizDropOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }} />
                                </div>

                                {quizDropOpen && (
                                  <div style={{
                                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
                                    background: '#fff', borderRadius: 12, padding: 6,
                                    boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid #e2e8f0',
                                    zIndex: 30, animation: 'plSlideUp .12s',
                                  }}>
                                    <div style={{ padding: '4px 6px 8px' }}>
                                      <div style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '7px 10px', background: '#f8fafc', borderRadius: 8,
                                        border: '1px solid #e2e8f0',
                                      }}>
                                        <Search size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                                        <input
                                          type="text"
                                          placeholder="Buscar cuestionario..."
                                          value={quizSearch}
                                          onChange={e => setQuizSearch(e.target.value)}
                                          autoFocus
                                          style={{
                                            border: 'none', background: 'transparent', outline: 'none',
                                            fontSize: 12, fontFamily: 'inherit', color: '#0C2D40', width: '100%',
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                                      {filtered.length === 0 ? (
                                        <div style={{ padding: '12px', textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>
                                          No se encontraron cuestionarios
                                        </div>
                                      ) : (
                                        filtered.map(q => (
                                          <button
                                            key={q.id}
                                            onClick={() => { updateForm('quizId', q.id); setQuizDropOpen(false); setQuizSearch('') }}
                                            style={{
                                              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                              padding: '9px 10px', border: 'none', borderRadius: 8,
                                              background: tareaForm.quizId === q.id ? '#f8fafc' : 'transparent',
                                              cursor: 'pointer', textAlign: 'left',
                                              fontFamily: 'inherit', transition: 'background .1s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={e => { if (tareaForm.quizId !== q.id) e.currentTarget.style.background = 'transparent' }}
                                          >
                                            <HelpCircle size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                              <div style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40' }}>{q.name}</div>
                                              <div style={{ fontSize: 10, color: '#94a3b8' }}>{q.preguntas} preguntas · {q.cat}</div>
                                            </div>
                                            {tareaForm.quizId === q.id && <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />}
                                          </button>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {!tareaForm.quizId && (
                                <div style={{ fontSize: 10, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                                  <HelpCircle size={11} />
                                  Crea cuestionarios en Biblioteca de recursos para verlos aquí
                                </div>
                              )}
                            </div>
                          )
                        })()}
                        <div className="jb-form-row">
                          <label className="pl-label">
                            Nota mínima (%)
                            <input type="number" className="pl-input" placeholder="70" value={tareaForm.notaMinima ?? 70} onChange={e => updateForm('notaMinima', Number(e.target.value))} />
                          </label>
                          <label className="pl-label">
                            Intentos permitidos
                            <input type="number" className="pl-input" placeholder="3" min="1" value={tareaForm.intentos ?? 3} onChange={e => updateForm('intentos', Math.max(1, Number(e.target.value)))} />
                          </label>
                        </div>
                        <div className="jb-field-toggle" onClick={() => updateForm('mostrarRespuestas', !tareaForm.mostrarRespuestas)}>
                          <div>
                            <span>Mostrar respuestas correctas</span>
                            <div className="jb-toggle-hint">Al finalizar, el colaborador verá las respuestas correctas</div>
                          </div>
                          <div className={`jb-toggle ${tareaForm.mostrarRespuestas ? 'on' : ''}`}>
                            <div className="jb-toggle-dot" />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {['lectura', 'documento'].includes(tareaForm.tipo) && (
                  <div className="jb-field-toggle" onClick={() => updateForm('confirmacion', !tareaForm.confirmacion)}>
                    <div>
                      <span>Confirmación de lectura</span>
                      <div className="jb-toggle-hint">Requiere que el colaborador confirme que leyó el contenido</div>
                    </div>
                    <div className={`jb-toggle ${tareaForm.confirmacion ? 'on' : ''}`}>
                      <div className="jb-toggle-dot" />
                    </div>
                  </div>
                )}

                {tareaForm.tipo === 'quiz' && (
                  <div className="jb-field-toggle" onClick={() => updateForm('mostrarRespuestas', !tareaForm.mostrarRespuestas)}>
                    <div>
                      <span>Mostrar respuestas correctas</span>
                      <div className="jb-toggle-hint">Al finalizar, el colaborador verá las respuestas correctas</div>
                    </div>
                    <div className={`jb-toggle ${tareaForm.mostrarRespuestas ? 'on' : ''}`}>
                      <div className="jb-toggle-dot" />
                    </div>
                  </div>
                )}
              </div>

              <div className="pl-modal-footer">
                <button className="pl-btn-cancel" onClick={closeModal}>Cancelar</button>
                <button className="pl-btn-save" onClick={saveTareaForm}>Guardar cambios</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL CONFIRMAR ELIMINAR ETAPA */}
      {deleteConfirm !== null && (() => {
        const etapaDel = rutaState.etapas[deleteConfirm]
        const totalTareasEtapa = etapaDel.actividades.reduce((s, a) => s + a.tareas.length, 0)
        return (
          <div className="pl-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
              <div className="pl-modal-body" style={{ textAlign: 'center', padding: '28px 24px 16px' }}>
                <div className="jb-del-ico">
                  <Trash2 size={24} />
                </div>
                <h2 className="pl-del-title">Eliminar etapa</h2>
                <p className="pl-del-desc">
                  ¿Estás seguro de eliminar <strong>{etapaDel.name}</strong>?
                  {totalTareasEtapa > 0 && (
                    <> Esta etapa tiene <strong>{totalTareasEtapa} tarea{totalTareasEtapa > 1 ? 's' : ''} configurada{totalTareasEtapa > 1 ? 's' : ''}</strong> que se perderán.</>
                  )}
                </p>
                {totalTareasEtapa > 0 && (
                  <div style={{ marginTop: '14px' }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Escribe <strong>eliminar</strong> para confirmar</span>
                    <input
                      type="text"
                      className="pl-input"
                      placeholder="eliminar"
                      value={deleteInput}
                      onChange={e => setDeleteInput(e.target.value)}
                      autoFocus
                      style={{ marginTop: 8 }}
                    />
                  </div>
                )}
              </div>
              <div className="pl-modal-footer" style={{ justifyContent: 'center' }}>
                <button className="pl-btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
                <button
                  className="pl-btn-delete"
                  disabled={totalTareasEtapa > 0 && deleteInput.toLowerCase() !== 'eliminar'}
                  onClick={() => deleteEtapa(deleteConfirm)}
                >
                  Eliminar etapa
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL CONFIGURACIÓN */}
      {showConfig && (
        <div className="pl-overlay" onClick={() => setShowConfig(false)}>
          <div className="pl-modal jb-modal" onClick={e => e.stopPropagation()}>
            <div className="pl-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Settings2 size={16} />
                </div>
                <h2>Configuración de la ruta</h2>
              </div>
              <button className="pl-modal-close" onClick={() => setShowConfig(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="pl-modal-body">
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px' }}>Cada ajuste puede heredar la configuración global, personalizarse o desactivarse.</p>
              {[
                { label: 'Gamificación (Puntos)', hint: 'Los colaboradores ganan puntos al completar tareas' },
                { label: 'Notificaciones automáticas', hint: 'Recordatorios por email y push' },
                { label: 'Plazos estrictos', hint: 'Bloquea avance si hay tareas vencidas' },
                { label: 'Permitir saltar tareas opcionales', hint: 'El colaborador puede omitir tareas no obligatorias' },
                { label: 'Cuestionario con nota mínima', hint: 'Requiere un puntaje mínimo para aprobar' },
                { label: 'Asistente IA', hint: 'Un asistente inteligente que guía al nuevo colaborador' },
              ].map((cfg, i) => (
                <div key={i} className="jb-field-toggle">
                  <div>
                    <span>{cfg.label}</span>
                    <div className="jb-toggle-hint">{cfg.hint}</div>
                  </div>
                  <select className="jb-config-select" defaultValue="Heredar">
                    <option>Heredar</option>
                    <option>Personalizar</option>
                    <option>Desactivar</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="pl-modal-footer">
              <button className="pl-btn-cancel" onClick={() => setShowConfig(false)}>Cancelar</button>
              <button className="pl-btn-save" onClick={() => setShowConfig(false)}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MENÚ CONTEXTUAL ETAPA */}
      {etapaMenu && (
        <div className="jb-ctx-backdrop" onClick={() => setEtapaMenu(null)}>
          <div className="jb-ctx-menu" style={{ left: etapaMenu.x, top: etapaMenu.y }} onClick={e => e.stopPropagation()}>
            <button className="jb-ctx-item" onClick={() => {
              const et = rutaState.etapas[etapaMenu.idx]
              setEditEtapaModal({ idx: etapaMenu.idx, name: et.name, days: et.duracion || 7 })
              setEtapaMenu(null)
            }}>
              <Pencil size={13} />
              Editar etapa
            </button>
            {!rutaState.etapas[etapaMenu.idx]?.locked && rutaState.etapas.length > 1 && (
              <button className="jb-ctx-item jb-ctx-danger" onClick={() => { setDeleteConfirm(etapaMenu.idx); setDeleteInput(''); setEtapaMenu(null) }}>
                <Trash2 size={13} />
                Eliminar etapa
              </button>
            )}
          </div>
        </div>
      )}

      {/* MENÚ CONTEXTUAL ACTIVIDAD */}
      {actividadMenu && (
        <div className="jb-ctx-backdrop" onClick={() => setActividadMenu(null)}>
          <div className="jb-ctx-menu" style={{ left: actividadMenu.x, top: actividadMenu.y }} onClick={e => e.stopPropagation()}>
            <button className="jb-ctx-item" onClick={() => { setEditingActividad(actividadMenu.ai); setActividadMenu(null) }}>
              <Pencil size={13} />
              Renombrar actividad
            </button>
            {etapa.actividades.length > 1 && (
              <button className="jb-ctx-item jb-ctx-danger" onClick={() => deleteActividad(actividadMenu.ai)}>
                <Trash2 size={13} />
                Eliminar actividad
              </button>
            )}
          </div>
        </div>
      )}

      {/* MENÚ CONTEXTUAL NODO */}
      {contextMenu && (
        <div className="jb-ctx-backdrop" onClick={() => setContextMenu(null)}>
          <div className="jb-ctx-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={e => e.stopPropagation()}>
            <button className="jb-ctx-item" onClick={() => { const t = etapa.actividades.flatMap(a => a.tareas).find(t => t.id === contextMenu.id); if (t) { selectTarea(t) }; setContextMenu(null) }}>
              <Pencil size={13} />
              Editar tarea
            </button>
            <button className="jb-ctx-item jb-ctx-danger" onClick={() => { setDeleteTaskConfirm(contextMenu.id); setContextMenu(null) }}>
              <Trash2 size={13} />
              Eliminar tarea
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINAR TAREA */}
      {deleteTaskConfirm && (() => {
        const tarea = rutaState.etapas.flatMap(e => e.actividades).flatMap(a => a.tareas).find(t => t.id === deleteTaskConfirm)
        if (!tarea) return null
        return (
          <div className="pl-overlay" onClick={() => setDeleteTaskConfirm(null)}>
            <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
              <div className="pl-modal-body" style={{ textAlign: 'center', padding: '28px 24px 16px' }}>
                <div className="jb-del-ico">
                  <Trash2 size={24} />
                </div>
                <h2 className="pl-del-title">Eliminar tarea</h2>
                <p className="pl-del-desc">
                  ¿Estás seguro de eliminar <strong>{tarea.name}</strong>? Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="pl-modal-footer" style={{ justifyContent: 'center' }}>
                <button className="pl-btn-cancel" onClick={() => setDeleteTaskConfirm(null)}>Cancelar</button>
                <button className="pl-btn-delete" onClick={() => deleteTarea(deleteTaskConfirm)}>Eliminar</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL VISTA PREVIA */}
      {showPreview && (() => {
        const allTareas = rutaState.etapas.flatMap(e => e.actividades.flatMap(a => a.tareas))
        const totalPuntos = allTareas.reduce((s, t) => s + (t.puntos || 0), 0)
        return (
          <div className="pl-overlay" onClick={() => setShowPreview(false)}>
            <div className="pl-modal" style={{ maxWidth: 480, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
              <div style={{
                padding: '20px 24px 16px', flexShrink: 0,
                borderBottom: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vista previa</div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0C2D40', margin: '2px 0 0' }}>{plantilla.name}</h2>
                </div>
                <button className="pl-modal-close" onClick={() => setShowPreview(false)}>
                  <X size={18} />
                </button>
              </div>

              <div style={{
                overflowY: 'auto', flex: 1,
                background: 'linear-gradient(180deg, #f0f4f8 0%, #e8eef4 100%)',
                padding: '24px 0',
              }}>
                {rutaState.etapas.map((et, ei) => {
                  const etTareas = et.actividades.flatMap(a => a.tareas)
                  return (
                    <div key={ei}>
                      {/* Etapa header pill */}
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 8,
                          padding: '6px 16px', borderRadius: 20,
                          background: '#fff', border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 4px rgba(0,0,0,.06)',
                        }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: '#0C2D40', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 800,
                          }}>
                            {ei + 1}
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40' }}>{et.name}</span>
                          <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>{et.duracion || 7}d</span>
                        </div>
                      </div>

                      {/* Nodos del camino */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                        {etTareas.map((tarea, ti) => {
                          const tp = tipoMap[tarea.tipo] || tiposTarea[0]
                          const TpIcon = tp.icon
                          const offsets = [0, 40, 60, 40, 0, -40, -60, -40]
                          const xOff = offsets[ti % offsets.length]
                          return (
                            <div key={tarea.id}>
                              {/* Línea conectora */}
                              {ti > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                  <div style={{ width: 2, height: 16, background: '#cbd5e1', borderRadius: 1 }} />
                                </div>
                              )}
                              <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                transform: `translateX(${xOff}px)`,
                                transition: 'transform .2s',
                              }}>
                                <div style={{ position: 'relative' }}>
                                  <div style={{
                                    width: 48, height: 48, borderRadius: '50%',
                                    background: '#0C2D40',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(12,45,64,.2)',
                                  }}>
                                    <TpIcon size={18} style={{ color: '#fff' }} />
                                  </div>
                                  {gamificacion && tarea.puntos > 0 && (
                                    <div style={{
                                      position: 'absolute', top: -4, right: -8,
                                      background: '#10b981', color: '#fff',
                                      fontSize: 8, fontWeight: 800, padding: '1px 5px',
                                      borderRadius: 8, lineHeight: 1.4,
                                    }}>
                                      +{tarea.puntos}
                                    </div>
                                  )}
                                </div>
                                <div style={{
                                  fontSize: 10, fontWeight: 600, color: '#0C2D40',
                                  marginTop: 4, textAlign: 'center', maxWidth: 100,
                                  lineHeight: 1.2, overflow: 'hidden',
                                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                }}>
                                  {tarea.name}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        {etTareas.length === 0 && (
                          <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', padding: '8px 0' }}>Sin tareas</div>
                        )}
                      </div>

                      {/* Separador entre etapas */}
                      {ei < rutaState.etapas.length - 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                          <div style={{
                            width: 2, height: 24, background: '#cbd5e1',
                            borderRadius: 1, position: 'relative',
                          }}>
                            <div style={{
                              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                              width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1',
                            }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div style={{
                padding: '12px 24px', borderTop: '1px solid #e2e8f0', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#fff',
              }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#475569',
                    background: '#f1f5f9', padding: '3px 8px', borderRadius: 6,
                  }}>
                    {rutaState.etapas.length} etapas
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#475569',
                    background: '#f1f5f9', padding: '3px 8px', borderRadius: 6,
                  }}>
                    {allTareas.length} tareas
                  </span>
                  {gamificacion && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: '#92400e',
                      background: '#fef3c7', padding: '3px 8px', borderRadius: 6,
                    }}>
                      {totalPuntos} Pts
                    </span>
                  )}
                </div>
                <button className="pl-btn-save" style={{ padding: '8px 20px', fontSize: 12 }} onClick={() => setShowPreview(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL EDITAR ETAPA */}
      {editEtapaModal && (
        <div className="pl-overlay" onClick={() => setEditEtapaModal(null)}>
          <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="pl-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: '#f1f5f9', color: '#475569',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Pencil size={15} />
                </div>
                <h2>Editar etapa</h2>
              </div>
              <button className="pl-modal-close" onClick={() => setEditEtapaModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="pl-modal-body">
              <label className="pl-label">
                Nombre de la etapa
                <input
                  type="text"
                  className="pl-input"
                  value={editEtapaModal.name}
                  onChange={e => setEditEtapaModal(prev => ({ ...prev, name: e.target.value }))}
                  autoFocus
                />
              </label>
              <label className="pl-label">
                Duración (días)
                <input
                  type="number"
                  className="pl-input"
                  min="1"
                  value={editEtapaModal.days}
                  onChange={e => setEditEtapaModal(prev => ({ ...prev, days: Math.max(1, Number(e.target.value)) }))}
                />
              </label>
            </div>
            <div className="pl-modal-footer">
              <button className="pl-btn-cancel" onClick={() => setEditEtapaModal(null)}>Cancelar</button>
              <button
                className="pl-btn-save"
                disabled={!editEtapaModal.name.trim()}
                onClick={() => {
                  const { idx, name, days } = editEtapaModal
                  setRutaState(prev => {
                    const next = JSON.parse(JSON.stringify(prev))
                    next.etapas[idx].name = name.trim()
                    next.etapas[idx].duracion = days
                    let acum = 1
                    next.etapas.forEach(e => {
                      const d = e.duracion || 7
                      e.days = d === 1 ? `Día ${acum}` : `Día ${acum} — Día ${acum + d - 1}`
                      acum += d
                    })
                    return next
                  })
                  setEditEtapaModal(null)
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVA ETAPA */}
      {showNewEtapa && (
        <div className="pl-overlay" onClick={() => setShowNewEtapa(false)}>
          <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="pl-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: '#0C2D40', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Plus size={16} />
                </div>
                <h2>Nueva etapa</h2>
              </div>
              <button className="pl-modal-close" onClick={() => setShowNewEtapa(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="pl-modal-body">
              <label className="pl-label">
                Nombre de la etapa
                <input
                  type="text"
                  className="pl-input"
                  placeholder="Ej: Mi primera semana, Conoce el área..."
                  value={newEtapaName}
                  onChange={e => setNewEtapaName(e.target.value)}
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newEtapaName.trim()) {
                      const n = rutaState.etapas.length
                      const dias = Math.max(1, newEtapaDays)
                      setRutaState(prev => {
                        const next = JSON.parse(JSON.stringify(prev))
                        let acum = 1
                        next.etapas.forEach(et => { acum += et.duracion || 7 })
                        next.etapas.push({
                          name: newEtapaName.trim(),
                          locked: false,
                          duracion: dias,
                          days: dias === 1 ? `Día ${acum}` : `Día ${acum} — Día ${acum + dias - 1}`,
                          actividades: [{ name: 'General', tareas: [] }],
                        })
                        return next
                      })
                      setSelEtapa(n)
                      setSelTarea(null)
                      setTareaForm(null)
                      setShowNewEtapa(false)
                    }
                  }}
                />
              </label>
              <label className="pl-label">
                Duración (días)
                <input
                  type="number"
                  className="pl-input"
                  min="1"
                  value={newEtapaDays}
                  onChange={e => setNewEtapaDays(Math.max(1, Number(e.target.value)))}
                />
              </label>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: -4 }}>
                Define cuántos días dura esta etapa dentro de la ruta de onboarding.
              </div>
            </div>
            <div className="pl-modal-footer">
              <button className="pl-btn-cancel" onClick={() => setShowNewEtapa(false)}>Cancelar</button>
              <button
                className="pl-btn-save"
                disabled={!newEtapaName.trim()}
                onClick={() => {
                  if (!newEtapaName.trim()) return
                  const n = rutaState.etapas.length
                  const dias = Math.max(1, newEtapaDays)
                  setRutaState(prev => {
                    const next = JSON.parse(JSON.stringify(prev))
                    let acum = 1
                    next.etapas.forEach(et => { acum += et.duracion || 7 })
                    next.etapas.push({
                      name: newEtapaName.trim(),
                      locked: false,
                      duracion: dias,
                      days: dias === 1 ? `Día ${acum}` : `Día ${acum} — Día ${acum + dias - 1}`,
                      actividades: [{ name: 'General', tareas: [] }],
                    })
                    return next
                  })
                  setSelEtapa(n)
                  setSelTarea(null)
                  setTareaForm(null)
                  setShowNewEtapa(false)
                }}
              >
                Crear etapa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
