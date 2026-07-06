import { useState, useRef, useCallback, useEffect } from 'react'
import { useRutaActiva } from '../../context/RutaActivaContext'
import { useConfig } from '../../context/ConfigContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { getGlobalEtapas } from '../../utils/globalEtapas'
import { tiposTarea, tipoMap, toEmbedUrl } from '../../utils/tareaTipos'
import RutaPreviewModal, { TaskPreviewModal } from '../../components/onboarding/RutaPreviewModal'
import {
  ArrowLeft, Eye, Save, ChevronRight, ChevronDown, Check,
  Lock, CheckCircle2, GripVertical, Plus, MoreVertical,
  BookOpen, Video, Headphones, FileText, HelpCircle,
  ClipboardList,
  UserCheck, Calendar, ExternalLink,
  ShieldCheck, X, Star, Pencil, Trash2, Settings2, Layers, Search, Copy, FolderOpen, Smile, Info, Upload, Link2
} from 'lucide-react'
import imagenIdea from '../../assets/imagenes/imagen_idea.png'
import imagenEtapa from '../../assets/imagenes/imagen_etapa.png'

const pulsoPreguntasSugeridas = [
  '¿Cómo te sientes con tu proceso de onboarding hasta ahora?',
  '¿Sientes que tienes las herramientas y la información que necesitas?',
  '¿Qué tan claro tienes tu rol y tus responsabilidades?',
  '¿Cómo calificarías el acompañamiento de tu líder o mentor?',
  '¿Hay algo que te esté generando dudas o preocupación?',
  '¿Qué tan a gusto te sientes con el equipo hasta ahora?',
]

const CONTENT_UPLOAD_LABEL = { video: 'Subir video', audio: 'Subir audio', lectura: 'Subir documento', documento: 'Subir documento', enlace: 'Agregar enlace' }
const CONTENT_RESOURCE_DESC = { video: 'Elegí un video ya subido por tu equipo', audio: 'Elegí un audio ya subido por tu equipo', lectura: 'Elegí un documento ya subido por tu equipo', documento: 'Elegí un documento ya subido por tu equipo', enlace: 'Elegí un recurso ya guardado por tu equipo' }
const CONTENT_LINK_DESC = { video: 'Pegá el enlace de un video de YouTube, Vimeo, Google Drive, etc. Todavía no se pueden subir archivos de video directamente.', audio: 'Pegá el enlace de un audio o podcast. Todavía no se pueden subir archivos de audio directamente.', lectura: 'Pegá el enlace a un documento (Drive, Notion, PDF, etc.)', documento: 'Pegá el enlace a un documento (Drive, Notion, PDF, etc.)', enlace: 'Pegá cualquier enlace externo' }
const CONTENT_LINK_PLACEHOLDER = { video: 'Pegá aquí el link de tu video (YouTube, Vimeo...)', audio: 'Pegá aquí el link de tu audio o podcast', lectura: 'Pegá aquí el link de tu documento (Drive, PDF...)', documento: 'Pegá aquí el link de tu documento (Drive, PDF...)', enlace: 'Pegá aquí tu enlace' }
const CONTENT_ITEM_LABEL = { video: 'este video', audio: 'este audio', lectura: 'este documento', documento: 'este documento', enlace: 'este enlace' }

const formTiposCampo = [
  { v: 'texto-corto', l: 'Texto corto' },
  { v: 'parrafo', l: 'Párrafo' },
  { v: 'opcion-multiple', l: 'Opción múltiple' },
  { v: 'casillas', l: 'Casillas' },
  { v: 'desplegable', l: 'Desplegable' },
]


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
          { id: 't14', name: 'Prueba de producto', tipo: 'quiz', obligatoria: true, puntos: 25, desc: 'Evaluación de conocimiento sobre el producto y CRM.', responsable: 'Colaborador', fechaRel: 'Día 11', confirmacion: false, done: false },
        ]},
        { name: 'Pitch comercial', tareas: [
          { id: 't15', name: 'Guía de pitch', tipo: 'lectura', obligatoria: true, puntos: 10, desc: 'Documento con la estructura y argumentos del pitch comercial.', responsable: 'Colaborador', fechaRel: 'Día 12', confirmacion: true, done: false },
        ]},
      ]},
      { name: 'Primer mes', locked: false, days: 'Día 16 — Día 30', actividades: [
        { name: 'Autonomía', tareas: [
          { id: 't17', name: 'Primera llamada real', tipo: 'tarea-otro', obligatoria: true, puntos: 30, desc: 'Realizar la primera llamada supervisada a un prospecto.', responsable: 'Líder de área', fechaRel: 'Día 16', confirmacion: false, done: false },
          { id: 't19', name: 'Enlace a recursos ventas', tipo: 'enlace', obligatoria: false, puntos: 5, desc: 'Recursos corporativos y materiales de apoyo.', responsable: 'Colaborador', fechaRel: 'Día 22', confirmacion: false, done: false },
        ]},
        { name: 'Certificación', tareas: [
          { id: 't20', name: 'Evaluación final', tipo: 'quiz', obligatoria: true, puntos: 50, desc: 'Examen integral de conocimientos y habilidades.', responsable: 'Colaborador', fechaRel: 'Día 28', confirmacion: false, done: false },
          { id: 't21', name: 'Tarea RRHH: Cerrar expediente', tipo: 'tarea-otro', obligatoria: true, puntos: 0, desc: 'Verificar que toda la documentación está completa.', responsable: 'RR.HH. / Admin', fechaRel: 'Día 29', confirmacion: false, done: false },
          { id: 't22', name: 'Certificado de onboarding', tipo: 'confirmacion', obligatoria: true, puntos: 100, desc: 'Entrega del certificado de graduación del onboarding.', responsable: 'Colaborador', fechaRel: 'Día 30', confirmacion: true, done: false },
        ]},
      ]},
    ],
  },
}

const defaultRuta = rutasData[1]

let idCounter = 100

const emptyRuta = {
  etapas: [],
}

const rutaConfigOpciones = [
  { key: 'gamificacion', label: 'Gamificación (Puntos)', hint: 'Los colaboradores ganan puntos al completar tareas',
    onMsg: 'Los colaboradores volverán a ganar puntos al completar tareas en esta ruta.',
    offMsg: 'Los colaboradores dejarán de ganar puntos al completar tareas en esta ruta.' },
  { key: 'notificaciones', label: 'Notificaciones automáticas', hint: 'Recordatorios por email y push',
    onMsg: 'Los colaboradores volverán a recibir recordatorios por email y push para esta ruta.',
    offMsg: 'Los colaboradores dejarán de recibir recordatorios por email y push para esta ruta.' },
  { key: 'plazosEstrictos', label: 'Plazos estrictos', hint: 'Bloquea avance si hay tareas vencidas',
    onMsg: 'Se bloqueará el avance de los colaboradores si tienen tareas vencidas.',
    offMsg: 'Los colaboradores podrán seguir avanzando aunque tengan tareas vencidas.' },
  { key: 'saltarOpcionales', label: 'Permitir saltar tareas opcionales', hint: 'El colaborador puede omitir tareas no obligatorias',
    onMsg: 'Los colaboradores podrán omitir las tareas marcadas como no obligatorias.',
    offMsg: 'Los colaboradores deberán completar todas las tareas, incluso las no obligatorias.' },
  { key: 'notaMinima', label: 'Prueba con nota mínima', hint: 'Requiere un puntaje mínimo para aprobar',
    onMsg: 'Se exigirá un puntaje mínimo para aprobar las pruebas de esta ruta.',
    offMsg: 'Ya no se exigirá un puntaje mínimo para aprobar las pruebas de esta ruta.' },
  { key: 'asistenteIA', label: 'Asistente IA', hint: 'Un asistente inteligente que guía al nuevo colaborador',
    onMsg: 'Los colaboradores tendrán disponible el asistente inteligente para guiarlos.',
    offMsg: 'El asistente inteligente dejará de estar disponible para guiarlos en esta ruta.' },
]
const defaultRutaConfig = Object.fromEntries(rutaConfigOpciones.map(o => [o.key, true]))

export default function JourneyBuilder({ plantilla, onBack, empty, backLabel, editing }) {
  const { activarRuta } = useRutaActiva()
  const { gamificacion } = useConfig()
  const { plantillas, setPlantillas, addFeedEntry, recursos, setRecursos } = useOnboardingData()

  const [rutaState, setRutaState] = useState(() => {
    const src = empty
      ? emptyRuta
      : (plantilla.etapasData?.length ? { etapas: plantilla.etapasData } : (rutasData[plantilla.id] || defaultRuta))
    const data = JSON.parse(JSON.stringify(src))
    if (!plantilla.esGlobal) {
      const globalEtapas = getGlobalEtapas(plantillas, plantilla.id)
      data.etapas = [...globalEtapas, ...data.etapas.filter(e => !e.locked)]
    }
    return data
  })
  const [rutaConfig, setRutaConfig] = useState(() => ({ ...defaultRutaConfig, ...(plantilla.config || {}) }))
  const [configConfirm, setConfigConfirm] = useState(null)
  const [selEtapa, setSelEtapa] = useState(0)
  const [selTarea, setSelTarea] = useState(null)
  const [tareaForm, setTareaForm] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteInput, setDeleteInput] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [quizEditorJB, setQuizEditorJB] = useState(null)
  const [formEditorJB, setFormEditorJB] = useState(null)
  const [quizPreview, setQuizPreview] = useState(null)
  const [addPickerTarget, setAddPickerTarget] = useState(null)
  const [formTipoDropOpen, setFormTipoDropOpen] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const [respMenuPos, setRespMenuPos] = useState(null)
  const [resourcePickerOpen, setResourcePickerOpen] = useState(false)
  const [contentChooserOpen, setContentChooserOpen] = useState(false)
  const [contentPickerOpen, setContentPickerOpen] = useState(false)
  const [rpFolder, setRpFolder] = useState(null)
  const [rpSearch, setRpSearch] = useState('')
  const [saveLinkOpen, setSaveLinkOpen] = useState(false)
  const [saveLinkConfirm, setSaveLinkConfirm] = useState(null)
  const [saveLinkDone, setSaveLinkDone] = useState(null)
  const [previewTask, setPreviewTask] = useState(null)
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
  const [draftSavedAt, setDraftSavedAt] = useState(null)
  const canvasRef = useRef(null)
  const scrollInterval = useRef(null)
  const isFirstRutaRender = useRef(true)
  const [floatLeftOffset, setFloatLeftOffset] = useState(320)

  // El panel "Etapas" es position:fixed (para quedar visible al scrollear el canvas),
  // así que su offset izquierdo debe seguir el borde real del canvas cuando el
  // sidebar o el navbar del módulo se contraen o expanden.
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    function updateOffset() {
      setFloatLeftOffset(el.getBoundingClientRect().left + 20)
    }
    updateOffset()
    const ro = new ResizeObserver(updateOffset)
    ro.observe(el)
    window.addEventListener('resize', updateOffset)
    return () => { ro.disconnect(); window.removeEventListener('resize', updateOffset) }
  }, [])

  function saveDraft() {
    const etapasPropias = rutaState.etapas.filter(e => !e.locked)
    setPlantillas(prev => prev.map(p =>
      p.id === plantilla.id
        ? {
            ...p, etapasData: etapasPropias,
            etapas: etapasPropias.length,
            tareas: etapasPropias.reduce((s, e) => s + e.actividades.reduce((ss, a) => ss + a.tareas.length, 0), 0),
            updated: 'Ahora',
            config: rutaConfig,
          }
        : p
    ))
    setDraftSavedAt(Date.now())
  }

  // Autoguardado: persiste el progreso como borrador sin necesidad de publicar la ruta
  useEffect(() => {
    if (isFirstRutaRender.current) { isFirstRutaRender.current = false; return }
    const t = setTimeout(() => saveDraft(), 800)
    return () => clearTimeout(t)
  }, [rutaState, rutaConfig])

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

  function duplicateTarea(tareaId) {
    setRutaState(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      for (const e of next.etapas) {
        for (const a of e.actividades) {
          const idx = a.tareas.findIndex(t => t.id === tareaId)
          if (idx !== -1) {
            const copy = { ...a.tareas[idx], id: `t${++idCounter}`, name: `${a.tareas[idx].name} (copia)` }
            a.tareas.splice(idx + 1, 0, copy)
            return next
          }
        }
      }
      return next
    })
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
      const tareasHuerfanas = acts[ai].tareas
      acts.splice(ai, 1)
      if (tareasHuerfanas.length > 0 && acts.length > 0) {
        acts[Math.min(ai, acts.length - 1)].tareas.push(...tareasHuerfanas)
      }
      return next
    })
    setActividadMenu(null)
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
      setContentPickerOpen(false)
    }
  }

  function closePreview() {
    setShowPreview(false)
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

  function saveLinkToRecursos(folderIdx) {
    const tipo = tareaForm.tipo === 'video' ? 'video' : tareaForm.tipo === 'audio' ? 'audio' : undefined
    const newDoc = {
      id: Date.now(),
      name: tareaForm.name || 'Recurso sin título',
      size: tipo === 'video' ? 'Video' : tipo === 'audio' ? 'Audio' : '-',
      estado: 'procesado',
      fecha: 'Ahora',
      ...(tipo ? { tipo } : {}),
      url: tareaForm.enlace,
    }
    setRecursos(prev => prev.map((c, i) => i === folderIdx ? { ...c, docs: [newDoc, ...c.docs], updatedAt: Date.now() } : c))
    addFeedEntry(`Nuevo recurso "${newDoc.name}" guardado en ${recursos[folderIdx].name}`)
    setSaveLinkOpen(false)
    setSaveLinkDone(recursos[folderIdx].name)
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
    if (!tipo || !etapa || etapa.actividades.length === 0) return

    const newTarea = {
      id: `t${++idCounter}`,
      name: `Nueva tarea — ${tipo.label}`,
      tipo: tipoKey,
      obligatoria: false,
      puntos: 10,
      desc: '',
      responsable: [tipo.resp],
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
    setContentPickerOpen(false)
  }

  function openAddPicker(rect, insert) {
    const menuH = 8 + tiposTarea.length * 34
    const menuW = 200
    const margin = 12
    let top = rect.bottom + 6
    if (top + menuH > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - menuH - 6)
    }
    let left = rect.left
    if (left + menuW > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - menuW - margin)
    }
    setAddPickerTarget({ x: left, y: top, insert })
  }

  function openTaskNodeMenu(rect, tareaId) {
    const menuH = 4 + 4 * 34
    const menuW = 170
    const margin = 12
    let top = rect.bottom + 6
    if (top + menuH > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - menuH - 6)
    }
    let left = rect.left
    if (left + menuW > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - menuW - margin)
    }
    setContextMenu({ id: tareaId, x: left, y: top })
  }

  function handleDropAtIndex(e, flatIdx) {
    e.preventDefault()
    e.stopPropagation()
    setDropTarget(null)
    setIsDragging(false)
    const tipoKey = e.dataTransfer.getData('tipoKey')
    createTarea(tipoKey, flatIdx)
  }

  return (
    <div className="jb">
      {/* BARRA SUPERIOR */}
      <div className="jb-topbar">
        <div className="jb-breadcrumb">
          <button className="jb-back" onClick={onBack}>
            <ArrowLeft size={16} />
          </button>
          <span className="jb-bc-text">{backLabel || 'Rutas'}</span>
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
          {draftSavedAt && (
            <span style={{ fontSize: 10.5, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
              <CheckCircle2 size={12} /> Guardado
            </span>
          )}
          <button className="jb-btn-primary" onClick={() => {
            const etapasPropias = rutaState.etapas.filter(e => !e.locked)
            activarRuta(rutaState.etapas, { nombre: plantilla.name, area: plantilla.area })
            setPlantillas(prev => prev.map(p =>
              p.id === plantilla.id
                ? {
                    ...p, status: 'activa', etapasData: etapasPropias,
                    etapas: etapasPropias.length,
                    tareas: etapasPropias.reduce((s, e) => s + e.actividades.reduce((ss, a) => ss + a.tareas.length, 0), 0),
                    updated: 'Ahora',
                    config: rutaConfig,
                  }
                : p
            ))
            addFeedEntry(`Ruta "${plantilla.name}" ${editing ? 'actualizada' : 'activada'}`)
            onBack()
          }}>
            <Save size={14} />
            {editing ? 'Guardar cambios' : 'Guardar ruta'}
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
              <div className="jb-float-card jb-float-left" style={{ left: floatLeftOffset }}>
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
                            onClick={() => { setSelEtapa(i); setSelTarea(null) }}
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
                            {!e.locked && (
                              <button
                                className="jb-sb-menu-btn"
                                onClick={ev => { ev.stopPropagation(); const r = ev.currentTarget.getBoundingClientRect(); setEtapaMenu({ idx: i, x: r.left, y: r.bottom + 4 }) }}
                              >
                                <MoreVertical size={13} />
                              </button>
                            )}
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
              {etapa && etapa.actividades.length > 0 && (
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
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e8ecf0', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <img src={imagenIdea} alt="" style={{ width: 34, height: 'auto', flexShrink: 0 }} />
                  <p style={{ fontSize: 9.5, color: '#94a3b8', lineHeight: 1.4, margin: 0 }}>
                    Conecta las tareas en el orden que deben completarse
                  </p>
                </div>
              </div>
              )}

              {etapa ? (<>
              <div className="jb-etapa-header" style={{ alignItems: 'stretch' }}>
                <img src={imagenEtapa} alt="" style={{ height: 64, width: 'auto', flexShrink: 0 }} />
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
                    <span className="jb-etapa-badge">{etapa.sourceRouteName || 'Ruta global'} — protegido</span>
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
                          <div
                            className="jb-drop-indicator"
                            onClick={e => {
                              e.stopPropagation()
                              const rect = e.currentTarget.getBoundingClientRect()
                              openAddPicker(rect, tipoKey => createTarea(tipoKey, undefined, ai))
                            }}
                          >
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
                          <div
                            className="jb-drop-indicator"
                            onClick={e => {
                              e.stopPropagation()
                              const rect = e.currentTarget.getBoundingClientRect()
                              openAddPicker(rect, tipoKey => createTarea(tipoKey, i))
                            }}
                          >
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
                            onClick={e => { e.stopPropagation(); openTaskNodeMenu(e.currentTarget.getBoundingClientRect(), tarea.id) }}
                            onContextMenu={e => { e.preventDefault(); setContextMenu({ id: tarea.id, x: e.clientX, y: e.clientY }) }}
                            title={tarea.name}
                          >
                            <span className="jb-duo-num">{i + 1}</span>
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
                          <div
                            className="jb-drop-indicator"
                            onClick={e => {
                              e.stopPropagation()
                              const rect = e.currentTarget.getBoundingClientRect()
                              openAddPicker(rect, tipoKey => createTarea(tipoKey, endIdx))
                            }}
                          >
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
                {etapa.actividades.length > 0 && (
                <div className="jb-add-task-wrap">
                  <div
                    className="jb-drop-indicator"
                    onClick={e => {
                      e.stopPropagation()
                      const rect = e.currentTarget.getBoundingClientRect()
                      openAddPicker(rect, tipoKey => createTarea(tipoKey))
                    }}
                  >
                    <Plus size={16} />
                  </div>
                </div>
                )}
              </div>
              </>) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px', height: '100%' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Layers size={30} strokeWidth={1.5} style={{ color: 'var(--green)' }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0C2D40' }}>Agrega tu primera etapa</div>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0', maxWidth: 280 }}>
                    Una etapa agrupa las actividades y tareas de un período de la ruta, por ejemplo "Mi primera semana".
                  </p>
                </div>
              )}
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
        ]
        const respValues = Array.isArray(tareaForm.responsable) ? tareaForm.responsable : [tareaForm.responsable].filter(Boolean)
        const selResps = responsables.filter(r => respValues.includes(r.value))
        function toggleResp(value) {
          const next = respValues.includes(value) ? respValues.filter(v => v !== value) : [...respValues, value]
          updateForm('responsable', next)
        }
        const totalDias = etapa.duracion || 7
        const desde = tareaForm.diaDesde || 1
        const hasta = tareaForm.diaHasta || desde
        const duracion = hasta - desde + 1
        return (
          <div className="pl-overlay">
            <div className="pl-modal jb-modal jb-modal-tarea" onClick={e => e.stopPropagation()}>

              {/* HEADER */}
              <div className="pl-modal-header">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <tipo.icon size={16} style={{ color: '#fff' }} />
                  </div>
                  <div>
                    <h2>Propiedades de la tarea</h2>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>
                      {tipo.label}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    className="pl-modal-close"
                    onClick={() => setPreviewTask(tareaForm)}
                    title="Vista previa"
                  >
                    <Eye size={16} />
                  </button>
                  <button className="pl-modal-close" onClick={saveTareaForm} title="Guarda y cierra">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="pl-modal-body" style={{ padding: '20px 24px' }}>
                <div className="jb-modal-2col">
                <div className="jb-modal-col">
                <div className="jb-modal-col-title">1. Información básica</div>

                {/* SECCIÓN: INFORMACIÓN BÁSICA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label className="pl-label" style={{ fontSize: 11, color: '#475569' }}>
                    Nombre de la tarea <span style={{ color: '#ef4444' }}>*</span>
                    <input type="text" className="pl-input" value={tareaForm.name} onChange={e => updateForm('name', e.target.value)} />
                  </label>
                  <label className="pl-label" style={{ fontSize: 11, color: '#475569' }}>
                    Descripción <span style={{ color: '#94a3b8', fontWeight: 500 }}>(opcional)</span>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500, margin: '2px 0 5px' }}>
                      El colaborador la verá al abrir la tarea. Explicale qué debe hacer.
                    </div>
                    <textarea
                      className="pl-input" style={{ resize: 'vertical', minHeight: '52px', marginTop: 0 }}
                      value={tareaForm.desc} rows={2}
                      placeholder="Ej: Mira el video de bienvenida y conoce nuestra cultura."
                      onChange={e => updateForm('desc', e.target.value)}
                    />
                  </label>
                </div>

                {/* SECCIÓN: RESPONSABLE */}
                {tareaForm.tipo === 'video' ? (
                  <div className="pl-label">
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>¿Quién la realiza?</span>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 10, marginTop: 4,
                      border: '1.5px solid #e2e8f0', background: '#f8fafc',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        background: '#10b98112',
                      }}>
                        <UserCheck size={14} style={{ color: '#10b981' }} />
                      </div>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#0C2D40' }}>Colaborador</span>
                    </div>
                  </div>
                ) : (
                <div className="pl-label" style={{ position: 'relative' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>¿Quién la realiza? <span style={{ color: '#ef4444' }}>*</span></span>
                  <div
                    onClick={e => {
                      if (!tareaForm._respOpen) {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const menuH = 8 + responsables.length * 38 + 44
                        const margin = 12
                        let top = rect.bottom + 4
                        if (top + menuH > window.innerHeight - margin) {
                          top = Math.max(margin, rect.top - menuH - 4)
                        }
                        setRespMenuPos({ top, left: rect.left, width: rect.width })
                      }
                      updateForm('_respOpen', !tareaForm._respOpen)
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 10, marginTop: 4,
                      border: `1.5px solid ${tareaForm._respOpen ? '#0C2D40' : '#e2e8f0'}`,
                      background: '#fff', cursor: 'pointer', transition: 'border-color .15s',
                    }}
                  >
                    {selResps.length <= 1 ? (
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        background: `${(selResps[0] || responsables[0]).color}12`,
                      }}>
                        {(() => { const Ico = (selResps[0] || responsables[0]).icon; return <Ico size={14} style={{ color: (selResps[0] || responsables[0]).color }} /> })()}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexShrink: 0 }}>
                        {selResps.slice(0, 3).map((r, i) => (
                          <div key={r.value} style={{
                            width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: `${r.color}12`, border: '2px solid #fff', marginLeft: i === 0 ? 0 : -10,
                          }}>
                            <r.icon size={13} style={{ color: r.color }} />
                          </div>
                        ))}
                      </div>
                    )}
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#0C2D40', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selResps.length === 0 ? 'Seleccionar responsable' : selResps.map(r => r.value).join(', ')}
                    </span>
                    <ChevronRight size={13} style={{ color: '#94a3b8', transform: tareaForm._respOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }} />
                  </div>
                  {tareaForm._respOpen && respMenuPos && (
                    <div style={{
                      position: 'fixed', top: respMenuPos.top, left: respMenuPos.left, width: respMenuPos.width,
                      background: '#fff', borderRadius: 12, padding: 4,
                      boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid #e2e8f0',
                      maxHeight: 'calc(100vh - 24px)', overflowY: 'auto',
                      zIndex: 1200, animation: 'plSlideUp .12s',
                    }}>
                      {responsables.map(r => {
                        const checked = respValues.includes(r.value)
                        return (
                          <button
                            key={r.value}
                            onClick={() => toggleResp(r.value)}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                              padding: '8px 10px', border: 'none', borderRadius: 8,
                              background: checked ? '#f8fafc' : 'transparent',
                              cursor: 'pointer', textAlign: 'left',
                              fontFamily: 'inherit', transition: 'background .1s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => { if (!checked) e.currentTarget.style.background = 'transparent' }}
                          >
                            <div style={{
                              width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                              border: `1.5px solid ${checked ? '#00E091' : '#cbd5e1'}`,
                              background: checked ? '#00E091' : '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {checked && <CheckCircle2 size={12} style={{ color: '#fff' }} />}
                            </div>
                            <div style={{
                              width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              background: `${r.color}12`,
                            }}>
                              <r.icon size={13} style={{ color: r.color }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40' }}>{r.value}</span>
                          </button>
                        )
                      })}
                      <button
                        onClick={() => updateForm('_respOpen', false)}
                        style={{
                          width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8,
                          border: 'none', borderTop: '1px solid #e8ecf0', background: 'transparent',
                          cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#0C2D40', fontFamily: 'inherit',
                        }}
                      >
                        Listo
                      </button>
                    </div>
                  )}
                </div>
                )}

                </div>
                <div className="jb-modal-col">
                <div className="jb-modal-col-title">2. Contenido</div>

                {['video', 'audio', 'lectura', 'documento', 'enlace'].includes(tareaForm.tipo) && (() => {
                  const kbItem = tareaForm._kbItem
                  const ItemIconSel = kbItem ? (kbItem.tipo === 'video' ? Video : kbItem.tipo === 'audio' ? Headphones : FileText) : null
                  const itemColorSel = kbItem ? (kbItem.tipo === 'video' ? '#3b82f6' : kbItem.tipo === 'audio' ? '#06b6d4' : '#64748b') : null
                  const uploadLabel = CONTENT_UPLOAD_LABEL[tareaForm.tipo] || 'Agregar contenido'
                  const linkDesc = CONTENT_LINK_DESC[tareaForm.tipo] || 'Pegá un enlace externo'
                  const linkPlaceholder = CONTENT_LINK_PLACEHOLDER[tareaForm.tipo] || 'Pegá aquí tu enlace'
                  const itemLabel = CONTENT_ITEM_LABEL[tareaForm.tipo] || 'este recurso'
                  return (
                    <div className="pl-label" style={{ position: 'relative' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Contenido de la tarea</span>

                      {kbItem ? (
                        <div style={{
                          marginTop: 4, borderRadius: 12,
                          border: '1px solid #e2e8f0', background: '#fff',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                              background: `${itemColorSel}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <ItemIconSel size={16} style={{ color: itemColorSel }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#0C2D40', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kbItem.name}</div>
                              <div style={{ fontSize: 10, color: '#94a3b8' }}>De tu biblioteca de Recursos · {kbItem.cat}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => { updateForm('_kbItem', null); updateForm('enlace', ''); setContentPickerOpen(false) }}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, display: 'flex', flexShrink: 0 }}
                              title="Quitar"
                            >
                              <X size={15} />
                            </button>
                          </div>
                          {kbItem.url && (
                            <div style={{ padding: '0 12px 12px' }}>
                              {kbItem.tipo === 'video' ? (
                                <div style={{ borderRadius: 8, overflow: 'hidden', background: '#000', aspectRatio: '16 / 9' }}>
                                  <iframe
                                    src={toEmbedUrl(kbItem.url)}
                                    title={kbItem.name}
                                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                                    allow="autoplay; encrypted-media; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                              ) : kbItem.tipo === 'audio' ? (
                                <audio controls src={kbItem.url} style={{ width: '100%', display: 'block' }} />
                              ) : null}
                              <a
                                href={kbItem.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 6, marginTop: kbItem.tipo === 'documento' ? 0 : 8,
                                  fontSize: 11, fontWeight: 600, color: '#0C2D40', textDecoration: 'none',
                                }}
                              >
                                <ExternalLink size={11} />
                                Abrir en una pestaña nueva
                              </a>
                            </div>
                          )}
                        </div>
                      ) : !contentPickerOpen && !tareaForm.enlace ? (
                        <button
                          type="button"
                          onClick={() => setContentChooserOpen(true)}
                          style={{
                            width: '100%', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            padding: '14px 12px', borderRadius: 10,
                            border: '1.5px dashed #cbd5e1',
                            background: '#f8fafc', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#0C2D40',
                            fontFamily: 'inherit', transition: 'border-color .15s',
                          }}
                        >
                          <Upload size={15} style={{ color: '#00E091' }} />
                          {uploadLabel}
                        </button>
                      ) : (
                        <>
                          <div style={{ position: 'relative', marginTop: 4 }}>
                            <input
                              type="url"
                              className="pl-input"
                              style={{ margin: 0, paddingRight: tareaForm.enlace ? 32 : undefined }}
                              placeholder={linkPlaceholder}
                              value={tareaForm.enlace || ''}
                              onChange={e => { updateForm('enlace', e.target.value); setSaveLinkOpen(false); setSaveLinkConfirm(null); setSaveLinkDone(null) }}
                              autoFocus
                            />
                            {tareaForm.enlace && (
                              <button
                                type="button"
                                onClick={() => { updateForm('enlace', ''); setSaveLinkOpen(false); setSaveLinkConfirm(null); setSaveLinkDone(null); setContentPickerOpen(false) }}
                                style={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, display: 'flex' }}
                                title="Quitar enlace"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                          {!tareaForm.enlace && (
                            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, lineHeight: 1.4 }}>{linkDesc}</div>
                          )}

                          {tareaForm.enlace && (tareaForm.tipo === 'video' || tareaForm.tipo === 'audio') && (
                            <div style={{ marginTop: 8 }}>
                              {tareaForm.tipo === 'video' ? (
                                <div style={{ borderRadius: 8, overflow: 'hidden', background: '#000', aspectRatio: '16 / 9' }}>
                                  <iframe
                                    src={toEmbedUrl(tareaForm.enlace)}
                                    title={tareaForm.name || 'preview'}
                                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                                    allow="autoplay; encrypted-media; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                              ) : (
                                <audio controls src={tareaForm.enlace} style={{ width: '100%', display: 'block' }} />
                              )}
                            </div>
                          )}

                          {tareaForm.enlace && (
                            <div style={{ marginTop: 8, position: 'relative' }}>
                              {saveLinkDone ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#16a34a' }}>
                                  <CheckCircle2 size={13} />
                                  Guardado en "{saveLinkDone}"
                                </div>
                              ) : saveLinkConfirm !== null ? (
                                <div style={{
                                  background: '#fff', borderRadius: 10, padding: 12,
                                  boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid #e2e8f0',
                                  animation: 'plSlideUp .12s',
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                                    <FolderOpen size={15} style={{ color: '#64748b', flexShrink: 0, marginTop: 1 }} />
                                    <span style={{ fontSize: 11.5, color: '#334155', lineHeight: 1.4 }}>
                                      Se va a guardar una copia de {itemLabel} en la carpeta <strong style={{ color: '#0C2D40' }}>"{recursos[saveLinkConfirm].name}"</strong> de Recursos corporativos, para que puedas reutilizarlo en otras tareas.
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                    <button
                                      type="button"
                                      onClick={() => setSaveLinkConfirm(null)}
                                      style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, color: '#64748b' }}
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => saveLinkToRecursos(saveLinkConfirm)}
                                      style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: '#0C2D40', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 700, color: '#fff' }}
                                    >
                                      Sí, guardar aquí
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setSaveLinkOpen(!saveLinkOpen)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: 11, fontWeight: 600, color: '#0C2D40', fontFamily: 'inherit' }}
                                  >
                                    <BookOpen size={12} style={{ color: '#00E091' }} />
                                    Guardar en Recursos corporativos
                                  </button>
                                  {!saveLinkOpen && (
                                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, lineHeight: 1.4 }}>
                                      Guardá una copia de {itemLabel} en tu biblioteca para poder reutilizarlo en otras tareas, sin tener que volver a pegar el link.
                                    </div>
                                  )}
                                  {saveLinkOpen && (
                                    <div style={{
                                      marginTop: 6, background: '#fff', borderRadius: 10, padding: 4,
                                      boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid #e2e8f0',
                                      animation: 'plSlideUp .12s',
                                    }}>
                                      {recursos.length === 0 ? (
                                        <div style={{ padding: 10, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>No hay carpetas creadas todavía</div>
                                      ) : (
                                        <>
                                          <div style={{ padding: '6px 10px 4px', fontSize: 9.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.02em' }}>
                                            ¿En qué carpeta lo guardamos?
                                          </div>
                                          {recursos.map((c, i) => (
                                            <button
                                              key={i}
                                              onClick={() => { setSaveLinkConfirm(i); setSaveLinkOpen(false) }}
                                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', border: 'none', borderRadius: 7, background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#0C2D40', transition: 'background .1s' }}
                                              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                              <FolderOpen size={13} style={{ color: '#64748b' }} />
                                              {c.name}
                                            </button>
                                          ))}
                                        </>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </>
                      )}

                    </div>
                  )
                })()}

                {tareaForm.tipo === 'quiz' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Card resumen preguntas */}
                    {(() => {
                      const preguntas = tareaForm.quizPreguntas || []
                      const completas = preguntas.filter(p => p.texto.trim() && (p.tipo === 'abierta' || p.opciones.some(o => o.correcta && o.texto.trim()))).length
                      return (
                        <div style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: preguntas.length > 0 ? '#fef3c7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <HelpCircle size={16} style={{ color: preguntas.length > 0 ? '#d97706' : '#94a3b8' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40' }}>
                                {preguntas.length === 0 ? 'Sin preguntas aún' : `${preguntas.length} pregunta${preguntas.length !== 1 ? 's' : ''}`}
                              </div>
                              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                                {preguntas.length === 0 ? 'Crea las preguntas para esta prueba' : `${completas} completa${completas !== 1 ? 's' : ''} · ${preguntas.length - completas} pendiente${preguntas.length - completas !== 1 ? 's' : ''}`}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {preguntas.length > 0 && (
                              <button
                                onClick={() => setQuizPreview(preguntas)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, background: '#fff', color: '#0C2D40', border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600, cursor: 'pointer', flex: 1 }}
                              >
                                <Eye size={11} />
                                Previsualizar
                              </button>
                            )}
                            <button
                              onClick={() => setQuizEditorJB({ preguntas: tareaForm.quizPreguntas ? JSON.parse(JSON.stringify(tareaForm.quizPreguntas)) : [] })}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, background: '#0C2D40', color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', flex: 1 }}
                            >
                              <Pencil size={11} />
                              {preguntas.length === 0 ? 'Crear preguntas' : 'Editar preguntas'}
                            </button>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}


                {tareaForm.tipo === 'pulso' && (() => {
                  const preguntas = tareaForm.pulsoPreguntas || []
                  function togglePregunta(texto) {
                    const next = preguntas.includes(texto) ? preguntas.filter(p => p !== texto) : [...preguntas, texto]
                    updateForm('pulsoPreguntas', next)
                  }
                  function addCustom() {
                    const texto = (tareaForm._pulsoCustom || '').trim()
                    if (!texto) return
                    updateForm('pulsoPreguntas', [...preguntas, texto])
                    updateForm('_pulsoCustom', '')
                  }
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#0C2D40' }}>Preguntas sugeridas</div>
                        {pulsoPreguntasSugeridas.map(p => {
                          const checked = preguntas.includes(p)
                          return (
                            <div key={p} onClick={() => togglePregunta(p)} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                              <div style={{
                                width: 15, height: 15, borderRadius: 4, marginTop: 1, flexShrink: 0,
                                border: checked ? '2px solid #f472b6' : '1.5px solid #d1d5db',
                                background: checked ? '#f472b6' : '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                {checked && <Check size={9} style={{ color: '#fff' }} />}
                              </div>
                              <span style={{ fontSize: 11.5, color: '#334155', lineHeight: 1.4 }}>{p}</span>
                            </div>
                          )
                        })}
                      </div>
                      <label className="pl-label" style={{ fontSize: 11, color: '#475569' }}>
                        Agregar pregunta personalizada
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input
                            type="text" className="pl-input" placeholder="Escribe tu propia pregunta"
                            value={tareaForm._pulsoCustom || ''}
                            onChange={e => updateForm('_pulsoCustom', e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
                          />
                          <button type="button" onClick={addCustom} style={{ padding: '0 14px', borderRadius: 8, border: 'none', background: '#0C2D40', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                            Agregar
                          </button>
                        </div>
                      </label>
                      {preguntas.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {preguntas.map((p, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 6, background: '#fdf2f8' }}>
                              <Smile size={11} style={{ color: '#f472b6', flexShrink: 0 }} />
                              <span style={{ fontSize: 11, color: '#334155', flex: 1 }}>{p}</span>
                              <button onClick={() => updateForm('pulsoPreguntas', preguntas.filter((_, idx) => idx !== i))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })()}

                {tareaForm.tipo === 'recorrido' && (
                  <div className="jb-form-row">
                    <label className="pl-label" style={{ fontSize: 11, color: '#475569' }}>
                      Ubicación
                      <input type="text" className="pl-input" placeholder="Ej: Piso 3, Oficina principal" value={tareaForm.ubicacion || ''} onChange={e => updateForm('ubicacion', e.target.value)} />
                    </label>
                    <label className="pl-label" style={{ fontSize: 11, color: '#475569' }}>
                      Guía / Acompañante
                      <input type="text" className="pl-input" placeholder="Nombre del guía" value={tareaForm.guia || ''} onChange={e => updateForm('guia', e.target.value)} />
                    </label>
                  </div>
                )}

                {tareaForm.tipo === 'subida' && (
                  <label className="pl-label" style={{ fontSize: 11, color: '#475569' }}>
                    Formatos aceptados
                    <input type="text" className="pl-input" placeholder="Ej: PDF, JPG, PNG" value={tareaForm.formatos || ''} onChange={e => updateForm('formatos', e.target.value)} />
                  </label>
                )}

                {tareaForm.tipo === 'tarea-otro' && (
                  <label className="pl-label" style={{ fontSize: 11, color: '#475569' }}>
                    Asignado a
                    <input type="text" className="pl-input" placeholder="Nombre o rol del responsable" value={tareaForm.asignadoA || ''} onChange={e => updateForm('asignadoA', e.target.value)} />
                  </label>
                )}

                {tareaForm.tipo === 'completar-perfil' && (() => {
                  const campos = tareaForm.formCampos || []
                  return (
                    <div style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: campos.length > 0 ? '#d1fae5' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <ClipboardList size={16} style={{ color: campos.length > 0 ? '#059669' : '#94a3b8' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40' }}>
                            {campos.length === 0 ? 'Sin preguntas aún' : `${campos.length} pregunta${campos.length !== 1 ? 's' : ''}`}
                          </div>
                          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                            {campos.length === 0 ? 'Crea las preguntas de este formulario' : campos.map(c => c.etiqueta || '(sin nombre)').join(', ')}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setFormEditorJB({ campos: campos.length ? JSON.parse(JSON.stringify(campos)) : [] })}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, background: '#0C2D40', color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                      >
                        <Pencil size={11} />
                        {campos.length === 0 ? 'Crear preguntas' : 'Editar preguntas'}
                      </button>
                    </div>
                  )
                })()}

                {tareaForm.tipo === 'form-custom' && (
                  <label className="pl-label" style={{ fontSize: 11, color: '#475569' }}>
                    Enlace al formulario
                    <input type="url" className="pl-input" placeholder="https://..." value={tareaForm.enlace || ''} onChange={e => updateForm('enlace', e.target.value)} />
                  </label>
                )}

                </div>
                <div className="jb-modal-col">
                <div className="jb-modal-col-title">3. Configuración</div>

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

                </div>

                {/* TOGGLES */}

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
                </div>
              </div>

              <div className="pl-modal-footer">
                <button className="pl-btn-cancel" onClick={closeModal}>Cancelar</button>
                <button className="pl-btn-save" disabled={!tareaForm.name?.trim() || respValues.length === 0} onClick={saveTareaForm}>Guardar cambios</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL ELEGIR ORIGEN DEL CONTENIDO (Recursos / Enlace) */}
      {contentChooserOpen && tareaForm && (() => {
        const uploadLabel = CONTENT_UPLOAD_LABEL[tareaForm.tipo] || 'Agregar contenido'
        const resourceDesc = CONTENT_RESOURCE_DESC[tareaForm.tipo] || 'Elegí un recurso ya subido por tu equipo'
        const linkDesc = CONTENT_LINK_DESC[tareaForm.tipo] || 'Pegá un enlace externo'
        return (
          <div className="pl-overlay" style={{ zIndex: 1100 }} onClick={() => setContentChooserOpen(false)}>
            <div className="pl-modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Upload size={16} style={{ color: '#fff' }} />
                  </div>
                  <h2>{uploadLabel}</h2>
                </div>
                <button className="pl-modal-close" onClick={() => setContentChooserOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => { setContentChooserOpen(false); setRpFolder(null); setRpSearch(''); setResourcePickerOpen(true) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '14px 16px', borderRadius: 12,
                    border: '1.5px solid #e2e8f0', background: '#fff',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'border-color .15s, background .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#00E091'; e.currentTarget.style.background = '#f8fafc' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: '#00E09118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={18} style={{ color: '#00E091' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40' }}>Recursos corporativos</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, lineHeight: 1.4 }}>{resourceDesc}</div>
                  </div>
                  <ChevronRight size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
                </button>

                <button
                  type="button"
                  onClick={() => { setContentChooserOpen(false); setContentPickerOpen(true) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '14px 16px', borderRadius: 12,
                    border: '1.5px solid #e2e8f0', background: '#fff',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'border-color .15s, background .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#0C2D40'; e.currentTarget.style.background = '#f8fafc' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: '#0C2D4012', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Link2 size={18} style={{ color: '#0C2D40' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40' }}>Enlace externo</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, lineHeight: 1.4 }}>{linkDesc}</div>
                  </div>
                  <ChevronRight size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL SELECCIONAR RECURSO (por carpetas) */}
      {resourcePickerOpen && tareaForm && (() => {
        const wantType = tareaForm.tipo === 'video' ? 'video' : tareaForm.tipo === 'audio' ? 'audio' : 'documento'
        const matchesType = d => {
          if (d.tipo === 'quiz') return false
          if (wantType === 'video') return d.tipo === 'video'
          if (wantType === 'audio') return d.tipo === 'audio'
          return d.tipo !== 'video' && d.tipo !== 'audio'
        }
        const folder = rpFolder !== null ? recursos[rpFolder] : null
        const folderList = recursos
          .map((c, i) => ({ ...c, idx: i }))
          .filter(c => c.name.toLowerCase().includes(rpSearch.toLowerCase()))
        const docList = folder ? folder.docs.filter(d => matchesType(d) && d.name.toLowerCase().includes(rpSearch.toLowerCase())) : []

        function pickDoc(doc) {
          const item = {
            name: doc.name,
            tipo: doc.tipo === 'video' ? 'video' : doc.tipo === 'audio' ? 'audio' : 'documento',
            cat: folder.name,
            url: doc.url || '',
          }
          updateForm('enlace', item.url)
          updateForm('_kbItem', item)
          if (!tareaForm.name || tareaForm.name.startsWith('Nueva tarea')) {
            updateForm('name', doc.name)
          }
          setResourcePickerOpen(false)
        }

        return (
          <div className="pl-overlay" style={{ zIndex: 1100 }} onClick={() => setResourcePickerOpen(false)}>
            <div className="pl-modal" style={{ maxWidth: 520, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <BookOpen size={16} style={{ color: '#fff' }} />
                  </div>
                  <h2>Recursos corporativos</h2>
                </div>
                <button className="pl-modal-close" onClick={() => setResourcePickerOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
                  <button
                    onClick={() => { setRpFolder(null); setRpSearch('') }}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: rpFolder !== null ? '#94a3b8' : '#0C2D40', fontWeight: 700, fontSize: 12, fontFamily: 'inherit' }}
                  >
                    Carpetas
                  </button>
                  {folder && (
                    <>
                      <ChevronRight size={12} style={{ color: '#cbd5e1' }} />
                      <span style={{ color: '#0C2D40' }}>{folder.name}</span>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 12 }}>
                  <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder={folder ? 'Buscar en esta carpeta...' : 'Buscar carpeta...'}
                    value={rpSearch}
                    onChange={e => setRpSearch(e.target.value)}
                    autoFocus
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontFamily: 'inherit', color: '#0C2D40', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ overflowY: 'auto', flex: 1, padding: '0 12px 12px' }}>
                {!folder ? (
                  folderList.length === 0 ? (
                    recursos.length === 0 ? (
                      <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                        <FolderOpen size={22} style={{ color: '#cbd5e1', marginBottom: 8 }} />
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Todavía no subiste ningún recurso</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>Andá a "Recursos corporativos" en el menú lateral para crear una carpeta y subir tus primeros archivos.</div>
                      </div>
                    ) : (
                      <div style={{ padding: '30px 0', textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>No se encontraron carpetas con ese nombre</div>
                    )
                  ) : folderList.map(c => {
                    const count = c.docs.filter(matchesType).length
                    return (
                      <button
                        key={c.idx}
                        onClick={() => { setRpFolder(c.idx); setRpSearch('') }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px', border: 'none', borderRadius: 8, background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'background .1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FolderOpen size={16} style={{ color: '#64748b' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0C2D40' }}>{c.name}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>{count} {count === 1 ? 'recurso compatible' : 'recursos compatibles'}</div>
                        </div>
                        <ChevronRight size={13} style={{ color: '#94a3b8' }} />
                      </button>
                    )
                  })
                ) : (
                  docList.length === 0 ? (
                    <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                      <FileText size={22} style={{ color: '#cbd5e1', marginBottom: 8 }} />
                      {folder.docs.length === 0 ? (
                        <>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>La carpeta "{folder.name}" está vacía</div>
                          <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>Subí archivos acá desde la sección "Recursos corporativos" en el menú lateral.</div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Sin {wantType === 'video' ? 'videos' : wantType === 'audio' ? 'audios' : 'documentos'} en esta carpeta</div>
                          <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>Subí {wantType === 'video' ? 'un video' : wantType === 'audio' ? 'un audio' : 'un documento'} a "{folder.name}" desde "Recursos corporativos", o elegí otra carpeta.</div>
                        </>
                      )}
                    </div>
                  ) : docList.map(doc => {
                    const linkedQuiz = doc.quiz || null
                    const DocIcon = doc.tipo === 'video' ? Video : doc.tipo === 'audio' ? Headphones : FileText
                    const docColor = doc.tipo === 'video' ? '#3b82f6' : doc.tipo === 'audio' ? '#06b6d4' : '#64748b'
                    return (
                      <button
                        key={doc.id}
                        onClick={() => pickDoc(doc)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', border: 'none', borderRadius: 8, background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'background .1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: `${docColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <DocIcon size={14} style={{ color: docColor }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0C2D40', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>{doc.size || ''}</div>
                        </div>
                        {linkedQuiz && (
                          <div style={{ padding: '2px 6px', borderRadius: 5, background: '#fef3c7', border: '1px solid #fde68a', fontSize: 8, fontWeight: 700, color: '#b45309', flexShrink: 0 }}>Prueba</div>
                        )}
                      </button>
                    )
                  })
                )}
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
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Settings2 size={16} style={{ color: '#fff' }} />
                </div>
                <h2>Configuración de la ruta</h2>
              </div>
              <button className="pl-modal-close" onClick={() => setShowConfig(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="pl-modal-body">
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px' }}>Activa o desactiva cada ajuste para esta ruta. Por defecto, todos están activos.</p>
              {rutaConfigOpciones.map((cfg) => (
                <div key={cfg.key} className="jb-field-toggle" onClick={() => setConfigConfirm({ key: cfg.key, label: cfg.label, next: !rutaConfig[cfg.key], msg: !rutaConfig[cfg.key] ? cfg.onMsg : cfg.offMsg })} style={{ cursor: 'pointer' }}>
                  <div>
                    <span>{cfg.label}</span>
                    <div className="jb-toggle-hint">{cfg.hint}</div>
                  </div>
                  <div className={`jb-toggle ${rutaConfig[cfg.key] ? 'on' : ''}`}>
                    <div className="jb-toggle-dot" />
                  </div>
                </div>
              ))}
            </div>
            <div className="pl-modal-footer">
              <button className="pl-btn-save" onClick={() => setShowConfig(false)}>Listo</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR CAMBIO DE CONFIGURACIÓN */}
      {configConfirm && (
        <div className="pl-overlay" style={{ zIndex: 1200 }} onClick={() => setConfigConfirm(null)}>
          <div className="pl-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="pl-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Settings2 size={15} color="#fff" />
                </div>
                <h2 style={{ margin: 0, fontSize: 15 }}>{configConfirm.next ? 'Activar' : 'Desactivar'} "{configConfirm.label}"</h2>
              </div>
              <button className="pl-modal-close" onClick={() => setConfigConfirm(null)}><X size={18} /></button>
            </div>
            <div className="pl-modal-body">
              <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                ¿Estás seguro de {configConfirm.next ? 'activar' : 'desactivar'} este ajuste para esta ruta?
              </p>
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 12,
                padding: '12px 14px', borderRadius: 10,
                background: configConfirm.next ? '#f0f9ff' : '#fef2f2',
                border: `1px solid ${configConfirm.next ? '#dbeafe' : '#fecaca'}`,
              }}>
                <Info size={15} style={{ color: configConfirm.next ? '#1e40af' : '#dc2626', flexShrink: 0, marginTop: 1 }} />
                <p style={{ margin: 0, fontSize: 11.5, color: configConfirm.next ? '#1e40af' : '#991b1b', lineHeight: 1.6 }}>
                  {configConfirm.msg}
                </p>
              </div>
            </div>
            <div className="pl-modal-footer">
              <button className="pl-btn-cancel" onClick={() => setConfigConfirm(null)}>Cancelar</button>
              <button
                className="pl-btn-save"
                onClick={() => { setRutaConfig(prev => ({ ...prev, [configConfirm.key]: configConfirm.next })); setConfigConfirm(null) }}
              >
                {configConfirm.next ? 'Activar' : 'Desactivar'}
              </button>
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
            <button className="jb-ctx-item jb-ctx-danger" onClick={() => deleteActividad(actividadMenu.ai)}>
              <Trash2 size={13} />
              Eliminar actividad
            </button>
          </div>
        </div>
      )}

      {/* MENÚ CONTEXTUAL NODO */}
      {contextMenu && (
        <div className="jb-ctx-backdrop" onClick={() => setContextMenu(null)}>
          <div className="jb-ctx-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={e => e.stopPropagation()}>
            <button className="jb-ctx-item" onClick={() => { const t = etapa.actividades.flatMap(a => a.tareas).find(t => t.id === contextMenu.id); if (t) { setPreviewTask(t) }; setContextMenu(null) }}>
              <Eye size={13} />
              Previsualizar tarea
            </button>
            <button className="jb-ctx-item" onClick={() => { const t = etapa.actividades.flatMap(a => a.tareas).find(t => t.id === contextMenu.id); if (t) { selectTarea(t) }; setContextMenu(null) }}>
              <Pencil size={13} />
              Editar tarea
            </button>
            <button className="jb-ctx-item" onClick={() => { duplicateTarea(contextMenu.id); setContextMenu(null) }}>
              <Copy size={13} />
              Duplicar tarea
            </button>
            <button className="jb-ctx-item jb-ctx-danger" onClick={() => { setDeleteTaskConfirm(contextMenu.id); setContextMenu(null) }}>
              <Trash2 size={13} />
              Eliminar tarea
            </button>
          </div>
        </div>
      )}

      {/* PICKER TIPO DE TAREA (clic en un "+" del lienzo) */}
      {addPickerTarget && (
        <div className="jb-ctx-backdrop" onClick={() => setAddPickerTarget(null)}>
          <div
            className="jb-ctx-menu"
            style={{ left: addPickerTarget.x, top: addPickerTarget.y, padding: 4, minWidth: 200 }}
            onClick={e => e.stopPropagation()}
          >
            {tiposTarea.map(t => (
              <button
                key={t.key}
                className="jb-ctx-item"
                onClick={() => { addPickerTarget.insert(t.key); setAddPickerTarget(null) }}
              >
                <div style={{ width: 22, height: 22, borderRadius: 6, background: `${t.color}15`, color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <t.icon size={12} />
                </div>
                {t.label}
              </button>
            ))}
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

      {/* PREVISUALIZAR TAREA */}
      {previewTask && (
        <TaskPreviewModal
          task={previewTask}
          onClose={() => setPreviewTask(null)}
          onEdit={() => { selectTarea(previewTask); setPreviewTask(null) }}
        />
      )}

      {/* MODAL VISTA PREVIA */}
      {showPreview && (
        <RutaPreviewModal
          name={plantilla.name}
          etapas={rutaState.etapas}
          onClose={closePreview}
          onEditTask={(t) => { selectTarea(t); setShowPreview(false) }}
        />
      )}

      {/* MODAL EDITAR ETAPA */}
      {editEtapaModal && (
        <div className="pl-overlay" onClick={() => setEditEtapaModal(null)}>
          <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="pl-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Pencil size={15} style={{ color: '#fff' }} />
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
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Plus size={16} style={{ color: '#fff' }} />
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
                          actividades: [],
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
                      actividades: [],
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

      {/* MODAL EDITOR DE CUESTIONARIO (quiz task) */}
      {quizEditorJB && (() => {
        const qe = quizEditorJB

        function updateQ(pIdx, texto) {
          setQuizEditorJB(prev => ({ ...prev, preguntas: prev.preguntas.map((p, i) => i === pIdx ? { ...p, texto } : p) }))
        }
        function deleteQ(pIdx) {
          setQuizEditorJB(prev => ({ ...prev, preguntas: prev.preguntas.filter((_, i) => i !== pIdx) }))
        }
        function addQ() {
          setQuizEditorJB(prev => ({ ...prev, preguntas: [...prev.preguntas, { id: Date.now(), texto: '', tipo: 'opcion_multiple', opciones: [{ id: Date.now()+1, texto: '', correcta: true }, { id: Date.now()+2, texto: '', correcta: false }, { id: Date.now()+3, texto: '', correcta: false }, { id: Date.now()+4, texto: '', correcta: false }] }] }))
        }
        function setTipoQ(pIdx, tipo) {
          setQuizEditorJB(prev => ({ ...prev, preguntas: prev.preguntas.map((p, i) => i === pIdx ? { ...p, tipo } : p) }))
        }
        function updateOpt(pIdx, oIdx, texto) {
          setQuizEditorJB(prev => ({ ...prev, preguntas: prev.preguntas.map((p, i) => i === pIdx ? { ...p, opciones: p.opciones.map((o, j) => j === oIdx ? { ...o, texto } : o) } : p) }))
        }
        function setCorrecta(pIdx, oIdx) {
          setQuizEditorJB(prev => ({ ...prev, preguntas: prev.preguntas.map((p, i) => i === pIdx ? { ...p, opciones: p.opciones.map((o, j) => ({ ...o, correcta: j === oIdx })) } : p) }))
        }
        function addOpt(pIdx) {
          setQuizEditorJB(prev => ({ ...prev, preguntas: prev.preguntas.map((p, i) => i === pIdx ? { ...p, opciones: [...p.opciones, { id: Date.now(), texto: '', correcta: false }] } : p) }))
        }
        function deleteOpt(pIdx, oIdx) {
          setQuizEditorJB(prev => ({ ...prev, preguntas: prev.preguntas.map((p, i) => i === pIdx ? { ...p, opciones: p.opciones.filter((_, j) => j !== oIdx) } : p) }))
        }
        function guardar() {
          updateForm('quizPreguntas', qe.preguntas.filter(p => p.texto.trim()))
          setQuizEditorJB(null)
        }

        return (
          <div className="pl-overlay" style={{ zIndex: 1100 }} onClick={() => setQuizEditorJB(null)}>
            <div className="pl-modal jb-modal" style={{ maxWidth: 580, maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HelpCircle size={16} style={{ color: '#fff' }} />
                  </div>
                  <h2 style={{ margin: 0 }}>Editor de prueba</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    className="pl-modal-close"
                    onClick={() => setPreviewTask({ ...(tareaForm || {}), tipo: 'quiz', quizPreguntas: qe.preguntas })}
                    title="Vista previa"
                  >
                    <Eye size={16} />
                  </button>
                  <button className="pl-modal-close" onClick={() => setQuizEditorJB(null)}><X size={18} /></button>
                </div>
              </div>

              <div className="pl-modal-body" style={{ overflowY: 'auto', maxHeight: '60vh' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40', marginBottom: 12 }}>
                  Preguntas ({qe.preguntas.length})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {qe.preguntas.map((pregunta, pIdx) => (
                    <div key={pregunta.id} style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ width: 22, height: 22, borderRadius: 6, background: '#0C2D40', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{pIdx + 1}</span>
                        <input
                          type="text"
                          placeholder="Escribe la pregunta..."
                          value={pregunta.texto}
                          onChange={e => updateQ(pIdx, e.target.value)}
                          style={{ flex: 1, padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', outline: 'none', background: '#fff' }}
                        />
                        {qe.preguntas.length > 1 && (
                          <button onClick={() => deleteQ(pIdx)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, color: '#cbd5e1' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 6, paddingLeft: 30, marginBottom: 10 }}>
                        {[{ v: 'opcion_multiple', l: 'Opción múltiple' }, { v: 'abierta', l: 'Respuesta abierta' }].map(o => (
                          <button
                            key={o.v}
                            onClick={() => setTipoQ(pIdx, o.v)}
                            style={{
                              padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                              border: (pregunta.tipo || 'opcion_multiple') === o.v ? '1.5px solid #0C2D40' : '1px solid #e2e8f0',
                              background: (pregunta.tipo || 'opcion_multiple') === o.v ? '#0C2D40' : '#fff',
                              color: (pregunta.tipo || 'opcion_multiple') === o.v ? '#fff' : '#64748b',
                            }}
                          >{o.l}</button>
                        ))}
                      </div>

                      {pregunta.tipo === 'abierta' ? (
                        <div style={{ paddingLeft: 30, fontSize: 10.5, color: '#94a3b8', fontStyle: 'italic' }}>
                          El colaborador responderá con texto libre. Esta pregunta no se califica automáticamente.
                        </div>
                      ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 30 }}>
                        {pregunta.opciones.map((opcion, oIdx) => (
                          <div key={opcion.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                              onClick={() => setCorrecta(pIdx, oIdx)}
                              style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${opcion.correcta ? '#00E091' : '#d1d5db'}`, background: opcion.correcta ? '#00E091' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}
                            >
                              {opcion.correcta && <CheckCircle2 size={11} style={{ color: '#fff' }} />}
                            </button>
                            <input
                              type="text"
                              placeholder={`Opción ${oIdx + 1}`}
                              value={opcion.texto}
                              onChange={e => updateOpt(pIdx, oIdx, e.target.value)}
                              style={{ flex: 1, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 11, fontFamily: 'inherit', outline: 'none', background: '#fff' }}
                            />
                            {pregunta.opciones.length > 2 && (
                              <button onClick={() => deleteOpt(pIdx, oIdx)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, color: '#cbd5e1' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}>
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button onClick={() => addOpt(pIdx)} style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, color: '#94a3b8', fontFamily: 'inherit', padding: '4px 0' }} onMouseEnter={e => e.currentTarget.style.color = '#0C2D40'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                          <Plus size={11} /> Agregar opción
                        </button>
                      </div>
                      )}
                      {pregunta.tipo !== 'abierta' && (
                        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 8, paddingLeft: 30 }}>Haz clic en el círculo verde para marcar la respuesta correcta</div>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={addQ} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', marginTop: 12, padding: '10px', border: '1.5px dashed #cbd5e1', borderRadius: 10, background: 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#64748b', fontFamily: 'inherit' }}>
                  <Plus size={13} /> Agregar pregunta
                </button>
              </div>

              <div className="pl-modal-footer">
                <button className="pl-btn-cancel" onClick={() => setQuizEditorJB(null)}>Cancelar</button>
                <button className="pl-btn-save" disabled={qe.preguntas.length === 0} onClick={guardar}>
                  Guardar prueba
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* EDITOR DE FORMULARIO */}
      {formEditorJB && (() => {
        const fe = formEditorJB
        const choiceTypes = ['opcion-multiple', 'casillas', 'desplegable']

        function updateCampo(idx, field, value) {
          setFormEditorJB(prev => ({ ...prev, campos: prev.campos.map((c, i) => i === idx ? { ...c, [field]: value } : c) }))
        }
        function deleteCampo(idx) {
          setFormEditorJB(prev => ({ ...prev, campos: prev.campos.filter((_, i) => i !== idx) }))
        }
        function addCampo() {
          setFormEditorJB(prev => ({ ...prev, campos: [...prev.campos, { id: Date.now(), etiqueta: '', tipo: 'texto-corto', obligatorio: true, opciones: [] }] }))
        }
        function setTipoCampo(idx, tipo) {
          setFormEditorJB(prev => ({ ...prev, campos: prev.campos.map((c, i) => {
            if (i !== idx) return c
            const needsOpciones = choiceTypes.includes(tipo)
            return { ...c, tipo, opciones: needsOpciones ? (c.opciones?.length ? c.opciones : [{ id: Date.now() + 1, texto: '' }, { id: Date.now() + 2, texto: '' }]) : c.opciones }
          }) }))
        }
        function updateOpcion(cIdx, oIdx, texto) {
          setFormEditorJB(prev => ({ ...prev, campos: prev.campos.map((c, i) => i === cIdx ? { ...c, opciones: c.opciones.map((o, j) => j === oIdx ? { ...o, texto } : o) } : c) }))
        }
        function addOpcion(cIdx) {
          setFormEditorJB(prev => ({ ...prev, campos: prev.campos.map((c, i) => i === cIdx ? { ...c, opciones: [...c.opciones, { id: Date.now(), texto: '' }] } : c) }))
        }
        function deleteOpcion(cIdx, oIdx) {
          setFormEditorJB(prev => ({ ...prev, campos: prev.campos.map((c, i) => i === cIdx ? { ...c, opciones: c.opciones.filter((_, j) => j !== oIdx) } : c) }))
        }
        function closeFormEditor() {
          setFormEditorJB(null)
          setFormTipoDropOpen(null)
        }
        function guardar() {
          updateForm('formCampos', fe.campos.filter(c => c.etiqueta.trim()))
          closeFormEditor()
        }

        return (
          <div className="pl-overlay" style={{ zIndex: 1100 }} onClick={closeFormEditor}>
            <div className="pl-modal jb-modal" style={{ maxWidth: 580, maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
              <div className="pl-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ClipboardList size={16} style={{ color: '#fff' }} />
                  </div>
                  <h2 style={{ margin: 0 }}>Editor de formulario</h2>
                </div>
                <button className="pl-modal-close" onClick={closeFormEditor}><X size={18} /></button>
              </div>

              <div className="pl-modal-body" style={{ overflowY: 'auto', maxHeight: '60vh' }} onClick={() => setFormTipoDropOpen(null)}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40', marginBottom: 12 }}>
                  Preguntas ({fe.campos.length})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {fe.campos.map((campo, cIdx) => (
                    <div key={campo.id} style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ width: 22, height: 22, borderRadius: 6, background: '#0C2D40', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{cIdx + 1}</span>
                        <input
                          type="text"
                          placeholder="Escribe la pregunta..."
                          value={campo.etiqueta}
                          onChange={e => updateCampo(cIdx, 'etiqueta', e.target.value)}
                          style={{ flex: 1, padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', outline: 'none', background: '#fff' }}
                        />
                        <button onClick={() => deleteCampo(cIdx)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, color: '#cbd5e1' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}>
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div style={{ paddingLeft: 30, marginBottom: 10 }} onClick={e => e.stopPropagation()}>
                        <div className="pl-dropdown-wrap" style={{ width: 200 }}>
                          <button
                            type="button"
                            className={`pl-dropdown-trigger${formTipoDropOpen === cIdx ? ' open' : ''}`}
                            onClick={() => setFormTipoDropOpen(formTipoDropOpen === cIdx ? null : cIdx)}
                            style={{ padding: '6px 10px', paddingRight: 32, fontSize: 11.5, fontWeight: 600, borderRadius: 8 }}
                          >
                            <span>{formTiposCampo.find(o => o.v === campo.tipo)?.l}</span>
                            <ChevronDown size={13} className="pl-dropdown-chevron" />
                          </button>
                          {formTipoDropOpen === cIdx && (
                            <div className="pl-dropdown-menu" style={{ padding: 4 }}>
                              {formTiposCampo.map(o => (
                                <button
                                  key={o.v}
                                  type="button"
                                  className={`pl-dropdown-item${campo.tipo === o.v ? ' selected' : ''}`}
                                  onClick={() => { setTipoCampo(cIdx, o.v); setFormTipoDropOpen(null) }}
                                  style={{ padding: '7px 10px', fontSize: 11.5 }}
                                >
                                  <span>{o.l}</span>
                                  {campo.tipo === o.v && <Check size={13} />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {choiceTypes.includes(campo.tipo) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 30 }}>
                          {campo.opciones.map((opcion, oIdx) => (
                            <div key={opcion.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <input
                                type="text"
                                placeholder={`Opción ${oIdx + 1}`}
                                value={opcion.texto}
                                onChange={e => updateOpcion(cIdx, oIdx, e.target.value)}
                                style={{ flex: 1, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 11, fontFamily: 'inherit', outline: 'none', background: '#fff' }}
                              />
                              {campo.opciones.length > 1 && (
                                <button onClick={() => deleteOpcion(cIdx, oIdx)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, color: '#cbd5e1' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}>
                                  <X size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                          <button onClick={() => addOpcion(cIdx)} style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, color: '#94a3b8', fontFamily: 'inherit', padding: '4px 0' }} onMouseEnter={e => e.currentTarget.style.color = '#0C2D40'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                            <Plus size={11} /> Agregar opción
                          </button>
                        </div>
                      ) : (
                        <div style={{ paddingLeft: 30, fontSize: 10.5, color: '#94a3b8', fontStyle: 'italic' }}>
                          {campo.tipo === 'parrafo' ? 'El colaborador responderá con un texto más largo.' : 'El colaborador responderá con una línea de texto corta.'}
                        </div>
                      )}

                      <div className="jb-field-toggle" style={{ paddingLeft: 30, marginTop: 10 }} onClick={() => updateCampo(cIdx, 'obligatorio', !campo.obligatorio)}>
                        <span style={{ fontSize: 10.5, color: '#475569' }}>Pregunta obligatoria</span>
                        <div className={`jb-toggle ${campo.obligatorio ? 'on' : ''}`}>
                          <div className="jb-toggle-dot" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={addCampo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', marginTop: 12, padding: '10px', border: '1.5px dashed #cbd5e1', borderRadius: 10, background: 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#64748b', fontFamily: 'inherit' }}>
                  <Plus size={13} /> Agregar pregunta
                </button>
              </div>

              <div className="pl-modal-footer">
                <button
                  className="pl-btn-cancel"
                  onClick={() => setPreviewTask({ ...(tareaForm || {}), tipo: 'completar-perfil', formCampos: fe.campos })}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 'auto', whiteSpace: 'nowrap' }}
                >
                  <Eye size={13} /> Vista previa
                </button>
                <button className="pl-btn-cancel" onClick={closeFormEditor}>Cancelar</button>
                <button className="pl-btn-save" disabled={fe.campos.length === 0} onClick={guardar}>
                  Guardar formulario ({fe.campos.length} pregunta{fe.campos.length !== 1 ? 's' : ''})
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* PREVISUALIZAR CUESTIONARIO */}
      {quizPreview && (
        <div className="pl-overlay" style={{ zIndex: 1100 }} onClick={() => setQuizPreview(null)}>
          <div className="pl-modal jb-modal" style={{ maxWidth: 520, maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
            <div className="pl-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Eye size={16} style={{ color: '#fff' }} />
                </div>
                <h2>Así la ve el colaborador</h2>
              </div>
              <button className="pl-modal-close" onClick={() => setQuizPreview(null)}><X size={18} /></button>
            </div>

            <div className="pl-modal-body" style={{ overflowY: 'auto', maxHeight: '65vh', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {quizPreview.map((pregunta, pIdx) => (
                <div key={pregunta.id} style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: '#0C2D40', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{pIdx + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0C2D40', paddingTop: 2 }}>{pregunta.texto}</span>
                  </div>
                  {pregunta.tipo === 'abierta' ? (
                    <div style={{ marginLeft: 30, padding: '10px 12px', borderRadius: 8, background: '#fff', border: '1.5px dashed #cbd5e1', fontSize: 11.5, color: '#94a3b8', fontStyle: 'italic' }}>
                      Respuesta abierta — el colaborador escribirá su respuesta aquí
                    </div>
                  ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 30 }}>
                    {pregunta.opciones.map(opcion => (
                      <div
                        key={opcion.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                          borderRadius: 8, background: '#fff',
                          border: `1.5px solid ${opcion.correcta ? '#00E091' : '#e2e8f0'}`,
                        }}
                      >
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                          border: `1.5px solid ${opcion.correcta ? '#00E091' : '#cbd5e1'}`,
                          background: opcion.correcta ? '#00E091' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {opcion.correcta && <CheckCircle2 size={11} style={{ color: '#fff' }} />}
                        </div>
                        <span style={{ fontSize: 12, color: '#0C2D40' }}>{opcion.texto}</span>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pl-modal-footer" style={{ justifyContent: 'center' }}>
              <button className="pl-btn-cancel" onClick={() => setQuizPreview(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
