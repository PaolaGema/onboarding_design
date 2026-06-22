import { useState, useRef, useCallback } from 'react'
import { useUser } from '../../context/UserContext'
import { useRutaActiva } from '../../context/RutaActivaContext'
import {
  CheckCircle2, Lock, Star, Trophy, Clock, Calendar,
  Video, Headphones, FileText, HelpCircle, Upload,
  ClipboardList, UserCheck, MapPin, ShieldCheck,
  ExternalLink, X, Route, Info, Rocket, Sparkles,
  Play, Pause, Volume2, Download, ChevronRight,
  Send, Camera, Link2, CircleDot, RotateCcw,
  MessageSquare, Award, PackageOpen, ArrowLeft
} from 'lucide-react'
import viaBebe from '../../assets/imagenes/via_bebe.webp'
import manualPdf from '../../assets/documentos/manual_funciones.pdf'
import viaContinuar from '../../assets/imagenes/continuar_via.webp'
import viaTrofeo from '../../assets/imagenes/via_trofeo.webp'
import trofeoImg from '../../assets/imagenes/trofeo_onboarding.webp'

const viaHuevo = viaBebe

const iconMap = {
  video: Video, audio: Headphones, documento: FileText,
  quiz: HelpCircle, 'completar-perfil': ClipboardList,
  subida: Upload, 'tarea-otro': UserCheck,
  recorrido: MapPin, 'tarea-rrhh': ShieldCheck, lectura: FileText,
  enlace: ExternalLink, 'form-custom': ClipboardList, confirmacion: Trophy,
}

const colorMap = {
  video: '#3b82f6', audio: '#06b6d4', documento: '#f97316',
  quiz: '#f59e0b', 'completar-perfil': '#10b981', subida: '#ec4899',
  'tarea-otro': '#ef4444', recorrido: '#d946ef',
  'tarea-rrhh': '#0C2D40', lectura: '#f97316', enlace: '#6366f1',
  'form-custom': '#10b981', confirmacion: '#f59e0b',
}

function flatTareas(etapa) {
  return etapa.actividades.flatMap(a => a.tareas)
}

export default function MiOnboarding() {
  const { currentUser } = useUser()
  const { rutaActiva, rutaAdmin, actualizarEtapas } = useRutaActiva()
  const isMobile = currentUser.id === 4

  const ruta = currentUser.role === 'colaborador' ? rutaActiva : (rutaAdmin || rutaActiva)
  const isGraduado = ruta?.graduado === true

  const [etapas, setEtapas] = useState([])
  const [started, setStarted] = useState(false)
  const [rutaLoaded, setRutaLoaded] = useState(false)

  if (ruta && !rutaLoaded) {
    const mapped = ruta.etapas.map((e, i) => ({
      ...e,
      status: i === 0 ? 'current' : 'locked',
      actividades: e.actividades.map(a => ({
        ...a,
        tareas: a.tareas.map(t => ({ ...t, done: t.done || false })),
      })),
    }))
    setEtapas(mapped)
    setRutaLoaded(true)
  }
  const [selTarea, setSelTarea] = useState(null)
  const [recorridoStops, setRecorridoStops] = useState({})
  const [showAlert, setShowAlert] = useState(false)
  const [quizStarted, setQuizStarted] = useState({})
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState({})
  const [selContext, setSelContext] = useState(null)
  const [etapasOpen, setEtapasOpen] = useState(true)
  const [infoOpen, setInfoOpen] = useState(true)

  const etapaRefs = useRef({})
  const setEtapaRef = useCallback((ei, el) => { etapaRefs.current[ei] = el }, [])

  const totalXP = etapas.flatMap(e => flatTareas(e)).filter(t => t.done).reduce((s, t) => s + t.xp, 0)
  const totalDone = etapas.flatMap(e => flatTareas(e)).filter(t => t.done).length
  const totalAll = etapas.flatMap(e => flatTareas(e)).length
  const pct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0

  function scrollToEtapa(ei) {
    const el = etapaRefs.current[ei]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function toggleDone(tareaId) {
    setEtapas(prev => {
      const next = prev.map(et => ({
        ...et,
        actividades: et.actividades.map(a => ({
          ...a,
          tareas: a.tareas.map(t => t.id === tareaId ? { ...t, done: !t.done } : t),
        })),
      }))
      if (currentUser.role === 'colaborador') actualizarEtapas(next)
      return next
    })
  }

  const positions = [0, 60, 90, 60, 0, -60, -90, -60]
  const firstName = currentUser.name.split(' ')[0]

  if (!ruta) {
    return (
      <div className="jb">
        <div className="jb-panels">
          <div className="jb-canvas">
            <div className="jb-canvas-body jb-pizarra" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}>
              <div className="jb-welcome-screen">
                <div className="jb-welcome-hero">
                  <div className="jb-welcome-text">
                    <h1 className="jb-welcome-title">¡Hola, {firstName}!</h1>
                    <p className="jb-welcome-desc" style={{ maxWidth: 400 }}>
                      Tu ruta de onboarding aún no ha sido configurada por el equipo de Recursos Humanos. Pronto recibirás tu recorrido personalizado.
                    </p>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '14px 18px', borderRadius: 12,
                      background: '#f8fafc', border: '1px solid #e2e8f0',
                      marginTop: 8,
                    }}>
                      <PackageOpen size={20} style={{ color: '#94a3b8' }} />
                      <span style={{ fontSize: 13, color: '#64748b' }}>Esperando asignación de ruta...</span>
                    </div>
                  </div>
                  <img src={viaHuevo} alt="Via en su huevo" className="jb-welcome-mascot" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isGraduado && !started) {
    return (
      <div className="jb">
        <div className="jb-panels">
          <div className="jb-canvas">
            <div className="jb-canvas-body jb-pizarra" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}>
              <div className="jb-welcome-screen">
                <div className="jb-welcome-hero">
                  <div className="jb-welcome-text">
                    <h1 className="jb-welcome-title">¡Felicidades, {firstName}!</h1>
                    <p className="jb-welcome-desc" style={{ maxWidth: 400 }}>
                      Has completado todas las etapas de tu ruta de onboarding. Aquí puedes revisar tu recorrido cuando quieras.
                    </p>
                    <div className="jb-welcome-stats">
                      <div className="jb-welcome-pill" style={{ background: '#10DC97' }}>
                        <span className="jb-welcome-pill-num">{totalAll}/{totalAll}</span>
                        <span className="jb-welcome-pill-label">tareas</span>
                      </div>
                      <div className="jb-welcome-pill" style={{ background: '#f59e0b' }}>
                        <span className="jb-welcome-pill-num">{totalXP}</span>
                        <span className="jb-welcome-pill-label">XP</span>
                      </div>
                      <div className="jb-welcome-pill" style={{ background: '#0C2D40' }}>
                        <span className="jb-welcome-pill-num">100%</span>
                        <span className="jb-welcome-pill-label">completado</span>
                      </div>
                    </div>
                    <button className="jb-welcome-btn" onClick={() => setStarted(true)}>
                      <Trophy size={16} />
                      Ver mi ruta completada
                    </button>
                  </div>
                  <img src={viaTrofeo} alt="Via graduado" className="jb-welcome-mascot" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!started && totalDone === 0) {
    if (isMobile) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 8px', textAlign: 'center', minHeight: '100%' }}>
          <img src={viaBebe} alt="Mascota" style={{ width: 60, marginBottom: 10 }} />
          <h1 style={{ fontSize: 14, fontWeight: 800, color: '#0C2D40', margin: '0 0 4px' }}>¡Hola, {firstName}!</h1>
          <p style={{ fontSize: 8, color: '#64748b', margin: '0 0 12px', lineHeight: 1.4 }}>
            Tu aventura comienza aquí. Recorrido paso a paso para integrarte.
          </p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {[
              { val: etapas.length, label: 'etapas', bg: '#0C2D40' },
              { val: totalAll, label: 'tareas', bg: '#10DC97' },
              { val: etapas.flatMap(e => flatTareas(e)).reduce((s, t) => s + t.xp, 0), label: 'XP', bg: '#f59e0b' },
            ].map(p => (
              <div key={p.label} style={{
                background: p.bg, borderRadius: 8, padding: '6px 10px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 48,
              }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{p.val}</span>
                <span style={{ fontSize: 6, fontWeight: 600, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>{p.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setStarted(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: '#0C2D40', color: '#fff', border: 'none',
              borderRadius: 8, padding: '8px 16px',
              fontSize: 9, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Rocket size={10} />
            Empezar mi onboarding
          </button>
        </div>
      )
    }
    return (
      <div className="jb">
        <div className="jb-panels">
          <div className="jb-canvas">
            <div className="jb-canvas-body jb-pizarra" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}>
              <div className="jb-welcome-screen">
                <div className="jb-welcome-hero">
                  <div className="jb-welcome-text">
                    <h1 className="jb-welcome-title">¡Hola, {firstName}!</h1>
                    <p className="jb-welcome-desc">
                      Tu aventura en el equipo comienza aquí.
                      Hemos preparado un recorrido paso a paso para que te integres rápidamente.
                    </p>
                    <div className="jb-welcome-stats">
                      <div className="jb-welcome-pill" style={{ background: '#0C2D40' }}>
                        <span className="jb-welcome-pill-num">{etapas.length}</span>
                        <span className="jb-welcome-pill-label">etapas</span>
                      </div>
                      <div className="jb-welcome-pill" style={{ background: '#10DC97' }}>
                        <span className="jb-welcome-pill-num">{totalAll}</span>
                        <span className="jb-welcome-pill-label">tareas</span>
                      </div>
                      <div className="jb-welcome-pill" style={{ background: '#f59e0b' }}>
                        <span className="jb-welcome-pill-num">{etapas.flatMap(e => flatTareas(e)).reduce((s, t) => s + t.xp, 0)}</span>
                        <span className="jb-welcome-pill-label">XP</span>
                      </div>
                    </div>
                    <button className="jb-welcome-btn" onClick={() => setStarted(true)}>
                      <Rocket size={16} />
                      Empezar mi onboarding
                    </button>
                  </div>
                  <img src={viaBebe} alt="Mascota" className="jb-welcome-mascot" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!started && totalDone > 0) {
    const nextTarea = etapas.flatMap(e => flatTareas(e)).find(t => !t.done)
    const NextIcon = nextTarea ? (iconMap[nextTarea.tipo] || FileText) : null
    const nextColor = nextTarea ? (colorMap[nextTarea.tipo] || '#94a3b8') : null
    return (
      <div className="jb">
        <div className="jb-panels">
          <div className="jb-canvas">
            <div className="jb-canvas-body jb-pizarra" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}>
              <div style={{ maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                <img src={viaContinuar} alt="Mascota" style={{ width: 90, height: 'auto' }} />
                <div style={{ textAlign: 'center' }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0C2D40', margin: '0 0 6px' }}>¡Bienvenida de vuelta, {firstName}!</h1>
                  <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>Aquí tienes un resumen de tu progreso</p>
                </div>

                {/* Barra de progreso */}
                <div style={{
                  width: '100%', padding: '16px 20px', borderRadius: 12,
                  background: '#fff', border: '1px solid #e2e8f0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0C2D40' }}>{totalDone} de {totalAll} tareas</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#10DC97' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#10DC97', borderRadius: 99, transition: 'width .4s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{totalXP} XP ganados</span>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{totalAll - totalDone} pendientes</span>
                  </div>
                </div>

                {/* Siguiente tarea */}
                {nextTarea && (
                  <div style={{
                    width: '100%', padding: '14px 18px', borderRadius: 12,
                    background: '#fff', border: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: `${nextColor}12`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <NextIcon size={16} style={{ color: nextColor }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Siguiente tarea</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0C2D40', marginTop: 2 }}>{nextTarea.name}</div>
                    </div>
                    {nextTarea.xp > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '2px 8px', borderRadius: 6 }}>+{nextTarea.xp} XP</span>
                    )}
                  </div>
                )}

                <button className="jb-welcome-btn" onClick={() => setStarted(true)}>
                  <Rocket size={16} />
                  Continuar mi onboarding
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selTarea) {
    const Icon = iconMap[selTarea.tipo] || FileText
    const color = colorMap[selTarea.tipo] || '#94a3b8'

    const renderContent = () => {
      switch (selTarea.tipo) {
        case 'video': {
          const embedUrl = selTarea.videoUrl || 'https://www.youtube.com/embed/WnD2H9rHNec'
          const videoId = embedUrl.match(/embed\/([a-zA-Z0-9_-]+)/)?.[1] || 'WnD2H9rHNec'
          const hasQuiz = selTarea.verificarQuiz !== false
          const quizQuestions = [
            { id: 1, texto: '¿Cuál es el objetivo principal presentado en el video?', opciones: ['Aumentar las ventas', 'Dar la bienvenida al equipo', 'Presentar el producto', 'Explicar las políticas'], correcta: 1 },
            { id: 2, texto: '¿Qué valor se destaca como fundamental en la organización?', opciones: ['Competitividad', 'Innovación', 'Trabajo en equipo', 'Velocidad'], correcta: 2 },
            { id: 3, texto: '¿Qué se espera del colaborador según el video?', opciones: ['Trabajar horas extra', 'Compromiso y proactividad', 'Solo cumplir tareas', 'Reportar diariamente'], correcta: 1 },
          ]
          const tid = selTarea.id
          const isQuizStarted = !!quizStarted[tid]
          const isQuizDone = !!quizSubmitted[tid]
          const answers = quizAnswers[tid] || {}
          const allAnswered = quizQuestions.every((_, i) => answers[i] !== undefined)

          function selectAnswer(qIdx, oIdx) {
            setQuizAnswers(prev => ({ ...prev, [tid]: { ...(prev[tid] || {}), [qIdx]: oIdx } }))
          }

          function submitQuiz() {
            const correct = quizQuestions.filter((q, i) => answers[i] === q.correcta).length
            setQuizSubmitted(prev => ({ ...prev, [tid]: { correct, total: quizQuestions.length } }))
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ borderRadius: 12, overflow: 'hidden', background: '#0f172a' }}>
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                    title={selTarea.name}
                    frameBorder="0"
                    referrerPolicy="no-referrer-when-downgrade"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  />
                </div>
              </div>

              {hasQuiz && !isQuizStarted && !isQuizDone && (
                <div style={{
                  border: '1px solid #fde68a', borderRadius: 12, padding: '20px 24px',
                  background: '#fffbeb', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                }}>
                  <HelpCircle size={28} style={{ color: '#d97706' }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>Quiz de verificación</div>
                    <p style={{ fontSize: 12, color: '#b45309', margin: '4px 0 0', lineHeight: 1.5 }}>
                      Responde una breve evaluación para verificar que comprendiste el contenido del video.
                    </p>
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{quizQuestions.length} preguntas · Necesitas 70% para aprobar</div>
                  <button
                    onClick={() => setQuizStarted(prev => ({ ...prev, [tid]: true }))}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 20px', borderRadius: 8,
                      background: '#d97706', color: '#fff', border: 'none',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    <HelpCircle size={14} />
                    Empezar quiz
                  </button>
                </div>
              )}

              {hasQuiz && isQuizStarted && !isQuizDone && (
                <div style={{ border: '1px solid #fde68a', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{
                    padding: '10px 16px', background: '#fffbeb', borderBottom: '1px solid #fde68a',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <HelpCircle size={15} style={{ color: '#d97706' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>Quiz de verificación</span>
                    </div>
                    <span style={{ fontSize: 10, color: '#b45309' }}>{Object.keys(answers).length}/{quizQuestions.length} respondidas</span>
                  </div>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {quizQuestions.map((q, qIdx) => (
                      <div key={q.id}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', margin: '0 0 8px' }}>
                          {qIdx + 1}. {q.texto}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {q.opciones.map((opt, oIdx) => {
                            const selected = answers[qIdx] === oIdx
                            return (
                              <button
                                key={oIdx}
                                onClick={() => selectAnswer(qIdx, oIdx)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 10,
                                  padding: '8px 12px', borderRadius: 8,
                                  border: selected ? '1.5px solid #d97706' : '1px solid #f1f5f9',
                                  background: selected ? '#fef3c7' : '#fff',
                                  cursor: 'pointer', fontSize: 12, color: '#475569',
                                  fontFamily: 'inherit', textAlign: 'left', width: '100%',
                                  transition: 'all .12s',
                                }}
                              >
                                <div style={{
                                  width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                                  border: selected ? '5px solid #d97706' : '2px solid #cbd5e1',
                                  background: '#fff',
                                }} />
                                {opt}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={submitQuiz}
                      disabled={!allAnswered}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px 20px', borderRadius: 8,
                        background: allAnswered ? '#d97706' : '#e2e8f0',
                        color: allAnswered ? '#fff' : '#94a3b8',
                        border: 'none', fontSize: 12, fontWeight: 700,
                        cursor: allAnswered ? 'pointer' : 'default', fontFamily: 'inherit',
                      }}
                    >
                      Enviar respuestas
                    </button>
                  </div>
                </div>
              )}

              {hasQuiz && isQuizDone && (() => {
                const result = quizSubmitted[tid]
                const passed = (result.correct / result.total) >= 0.7
                return (
                  <div style={{
                    border: `1px solid ${passed ? '#bbf7d0' : '#fecaca'}`, borderRadius: 12,
                    padding: '16px 20px', textAlign: 'center',
                    background: passed ? '#f0fdf4' : '#fef2f2',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  }}>
                    <CheckCircle2 size={24} style={{ color: passed ? '#16a34a' : '#ef4444' }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: passed ? '#166534' : '#991b1b' }}>
                      {passed ? '¡Quiz aprobado!' : 'Quiz no aprobado'}
                    </div>
                    <div style={{ fontSize: 12, color: passed ? '#166534' : '#991b1b' }}>
                      {result.correct} de {result.total} respuestas correctas ({Math.round((result.correct / result.total) * 100)}%)
                    </div>
                    {!passed && (
                      <button
                        onClick={() => { setQuizStarted(prev => ({ ...prev, [tid]: false })); setQuizSubmitted(prev => ({ ...prev, [tid]: null })); setQuizAnswers(prev => ({ ...prev, [tid]: {} })) }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4,
                          padding: '8px 16px', borderRadius: 8,
                          background: '#ef4444', color: '#fff', border: 'none',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        Reintentar quiz
                      </button>
                    )}
                  </div>
                )
              })()}
            </div>
          )
        }

        case 'audio':
          return (
            <div style={{ padding: 20, borderRadius: 12, background: 'linear-gradient(135deg, #0e7490 0%, #155e75 100%)', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Play size={22} style={{ color: '#fff', marginLeft: 2 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{selTarea.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Audio · 5:20 min</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>0:00</span>
                <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 99 }}><div style={{ width: '0%', height: '100%', background: '#fff', borderRadius: 99 }} /></div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>5:20</span>
              </div>
            </div>
          )

        case 'documento': {
          const isManual = selTarea.name.toLowerCase().includes('manual')
          const pdfUrl = isManual ? manualPdf : null
          const hasDocQuiz = selTarea.verificarQuiz !== false
          const docQuizQs = [
            { id: 1, texto: '¿Cuál es el horario de trabajo establecido en el manual?', opciones: ['6:00 a 14:00', '8:00 a 17:00 con 1 hora de almuerzo', '9:00 a 18:00', 'Horario libre'], correcta: 1 },
            { id: 2, texto: '¿A quién debes reportar una ausencia según el manual?', opciones: ['A cualquier compañero', 'A tu líder directo y RRHH', 'No es necesario reportar', 'Solo a RRHH'], correcta: 1 },
          ]
          const tid = selTarea.id
          const isDocQuizStarted = !!quizStarted[tid]
          const isDocQuizDone = !!quizSubmitted[tid]
          const docAns = quizAnswers[tid] || {}
          const allDocAns = docQuizQs.every((_, i) => docAns[i] !== undefined)

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ border: '1px solid #fed7aa', borderRadius: 12, overflow: 'hidden', background: '#fffbf5' }}>
                <div style={{ padding: '12px 16px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileText size={16} style={{ color: '#ea580c' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#9a3412' }}>{selTarea.name}.pdf</span>
                  </div>
                  {pdfUrl ? (
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#ea580c', background: '#fff', border: '1px solid #fed7aa', borderRadius: 6, padding: '4px 10px', textDecoration: 'none' }}>
                      <Download size={12} /> Descargar PDF
                    </a>
                  ) : (
                    <button style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#ea580c', background: '#fff', border: '1px solid #fed7aa', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                      <Download size={12} /> Descargar PDF
                    </button>
                  )}
                </div>
                <div style={{ padding: 0 }}>
                  {pdfUrl ? (
                    <iframe src={pdfUrl} title={selTarea.name} style={{ width: '100%', height: 500, border: 'none' }} />
                  ) : (
                    <div style={{ padding: 20 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>{selTarea.name}</div>
                      {[100, 90, 95, 70, 85, 100, 80, 60].map((w, i) => (
                        <div key={i} style={{ height: 10, background: '#f1f5f9', borderRadius: 4, marginBottom: 6, width: `${w}%` }} />
                      ))}
                      <div style={{ marginTop: 14, fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>Página 1 de 4</div>
                    </div>
                  )}
                </div>
              </div>

              {hasDocQuiz && !isDocQuizStarted && !isDocQuizDone && (
                <div style={{
                  border: '1px solid #fde68a', borderRadius: 12, padding: '20px 24px',
                  background: '#fffbeb', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                }}>
                  <HelpCircle size={28} style={{ color: '#d97706' }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>Quiz de verificación</div>
                    <p style={{ fontSize: 12, color: '#b45309', margin: '4px 0 0', lineHeight: 1.5 }}>
                      Responde una breve evaluación para verificar que comprendiste el documento.
                    </p>
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{docQuizQs.length} preguntas</div>
                  <button
                    onClick={() => setQuizStarted(prev => ({ ...prev, [tid]: true }))}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 20px', borderRadius: 8,
                      background: '#d97706', color: '#fff', border: 'none',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    <HelpCircle size={14} /> Empezar quiz
                  </button>
                </div>
              )}

              {hasDocQuiz && isDocQuizStarted && !isDocQuizDone && (
                <div style={{ border: '1px solid #fde68a', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', background: '#fffbeb', borderBottom: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <HelpCircle size={15} style={{ color: '#d97706' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>Quiz de verificación</span>
                    </div>
                    <span style={{ fontSize: 10, color: '#b45309' }}>{Object.keys(docAns).length}/{docQuizQs.length} respondidas</span>
                  </div>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {docQuizQs.map((q, qIdx) => (
                      <div key={q.id}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', margin: '0 0 8px' }}>{qIdx + 1}. {q.texto}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {q.opciones.map((opt, oIdx) => {
                            const selected = docAns[qIdx] === oIdx
                            return (
                              <button key={oIdx} onClick={() => setQuizAnswers(prev => ({ ...prev, [tid]: { ...(prev[tid] || {}), [qIdx]: oIdx } }))}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
                                  border: selected ? '1.5px solid #d97706' : '1px solid #f1f5f9',
                                  background: selected ? '#fef3c7' : '#fff',
                                  cursor: 'pointer', fontSize: 12, color: '#475569',
                                  fontFamily: 'inherit', textAlign: 'left', width: '100%', transition: 'all .12s',
                                }}>
                                <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, border: selected ? '5px solid #d97706' : '2px solid #cbd5e1', background: '#fff' }} />
                                {opt}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const correct = docQuizQs.filter((q, i) => docAns[i] === q.correcta).length
                        setQuizSubmitted(prev => ({ ...prev, [tid]: { correct, total: docQuizQs.length } }))
                      }}
                      disabled={!allDocAns}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px 20px', borderRadius: 8,
                        background: allDocAns ? '#d97706' : '#e2e8f0',
                        color: allDocAns ? '#fff' : '#94a3b8',
                        border: 'none', fontSize: 12, fontWeight: 700,
                        cursor: allDocAns ? 'pointer' : 'default', fontFamily: 'inherit',
                      }}
                    >Enviar respuestas</button>
                  </div>
                </div>
              )}

              {hasDocQuiz && isDocQuizDone && (() => {
                const result = quizSubmitted[tid]
                return (
                  <div style={{
                    border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px 20px',
                    textAlign: 'center', background: '#f0fdf4',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  }}>
                    <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>Quiz completado</div>
                    <div style={{ fontSize: 12, color: '#166534' }}>{result.correct} de {result.total} respuestas correctas ({Math.round((result.correct / result.total) * 100)}%)</div>
                  </div>
                )
              })()}
            </div>
          )
        }

        case 'quiz': {
          const quizQs = [
            { id: 1, texto: '¿Cuáles son las áreas principales que visitaste en el recorrido?', opciones: ['Solo oficinas', 'Recepción, área de trabajo, salas y áreas comunes', 'Solo el comedor', 'No hubo recorrido'], correcta: 1 },
            { id: 2, texto: '¿A quién debes acudir si tienes problemas con el acceso a sistemas?', opciones: ['Recursos Humanos', 'Tu líder directo', 'El área de TI', 'Seguridad'], correcta: 2 },
            { id: 3, texto: '¿Cuál es la metodología de trabajo del equipo según el video?', opciones: ['Cascada tradicional', 'Trabajo individual', 'Metodología ágil con sprints semanales', 'No se mencionó'], correcta: 2 },
          ]
          const tid = selTarea.id
          const isStarted = !!quizStarted[tid]
          const isDone = !!quizSubmitted[tid]
          const ans = quizAnswers[tid] || {}
          const allAns = quizQs.every((_, i) => ans[i] !== undefined)

          if (!isStarted && !isDone) {
            return (
              <div style={{
                border: '1px solid #fde68a', borderRadius: 12, padding: '20px 24px',
                background: '#fffbeb', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              }}>
                <HelpCircle size={28} style={{ color: '#d97706' }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>Evaluación de la actividad</div>
                  <p style={{ fontSize: 12, color: '#b45309', margin: '4px 0 0', lineHeight: 1.5 }}>
                    Responde esta evaluación sobre todo lo aprendido en esta actividad.
                  </p>
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{quizQs.length} preguntas</div>
                <button
                  onClick={() => setQuizStarted(prev => ({ ...prev, [tid]: true }))}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 20px', borderRadius: 8,
                    background: '#d97706', color: '#fff', border: 'none',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <HelpCircle size={14} />
                  Empezar evaluación
                </button>
              </div>
            )
          }

          if (isStarted && !isDone) {
            return (
              <div style={{ border: '1px solid #fde68a', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{
                  padding: '10px 16px', background: '#fffbeb', borderBottom: '1px solid #fde68a',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HelpCircle size={15} style={{ color: '#d97706' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>Evaluación</span>
                  </div>
                  <span style={{ fontSize: 10, color: '#b45309' }}>{Object.keys(ans).length}/{quizQs.length} respondidas</span>
                </div>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {quizQs.map((q, qIdx) => (
                    <div key={q.id}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', margin: '0 0 8px' }}>
                        {qIdx + 1}. {q.texto}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {q.opciones.map((opt, oIdx) => {
                          const selected = ans[qIdx] === oIdx
                          return (
                            <button
                              key={oIdx}
                              onClick={() => setQuizAnswers(prev => ({ ...prev, [tid]: { ...(prev[tid] || {}), [qIdx]: oIdx } }))}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '8px 12px', borderRadius: 8,
                                border: selected ? '1.5px solid #d97706' : '1px solid #f1f5f9',
                                background: selected ? '#fef3c7' : '#fff',
                                cursor: 'pointer', fontSize: 12, color: '#475569',
                                fontFamily: 'inherit', textAlign: 'left', width: '100%',
                                transition: 'all .12s',
                              }}
                            >
                              <div style={{
                                width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                                border: selected ? '5px solid #d97706' : '2px solid #cbd5e1',
                                background: '#fff',
                              }} />
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const correct = quizQs.filter((q, i) => ans[i] === q.correcta).length
                      setQuizSubmitted(prev => ({ ...prev, [tid]: { correct, total: quizQs.length } }))
                    }}
                    disabled={!allAns}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '10px 20px', borderRadius: 8,
                      background: allAns ? '#d97706' : '#e2e8f0',
                      color: allAns ? '#fff' : '#94a3b8',
                      border: 'none', fontSize: 12, fontWeight: 700,
                      cursor: allAns ? 'pointer' : 'default', fontFamily: 'inherit',
                    }}
                  >
                    Enviar respuestas
                  </button>
                </div>
              </div>
            )
          }

          if (isDone) {
            const result = quizSubmitted[tid]
            const pctResult = Math.round((result.correct / result.total) * 100)
            return (
              <div style={{
                border: '1px solid #bbf7d0', borderRadius: 12,
                padding: '16px 20px', textAlign: 'center',
                background: '#f0fdf4',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>Evaluación completada</div>
                <div style={{ fontSize: 12, color: '#166534' }}>
                  {result.correct} de {result.total} respuestas correctas ({pctResult}%)
                </div>
              </div>
            )
          }

          return null
        }

        case 'subida':
          return (
            <div style={{ border: '2px dashed #f9a8d4', borderRadius: 12, padding: 28, textAlign: 'center', background: '#fdf2f8' }}>
              <Upload size={32} style={{ color: '#ec4899', marginBottom: 10 }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: '#9d174d', margin: '0 0 4px' }}>Arrastra tus archivos aquí</p>
              <p style={{ fontSize: 11, color: '#be185d', margin: '0 0 14px' }}>o haz clic para seleccionar</p>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                {['PDF', 'JPG', 'PNG'].map(f => (<span key={f} style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: '#fce7f3', color: '#be185d' }}>{f}</span>))}
              </div>
            </div>
          )

        case 'completar-perfil':
          return (
            <div style={{ border: '1px solid #a7f3d0', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: '#ecfdf5', borderBottom: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClipboardList size={15} style={{ color: '#059669' }} /><span style={{ fontSize: 12, fontWeight: 700, color: '#065f46' }}>Completa tu perfil</span>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', cursor: 'pointer' }}><Camera size={18} style={{ color: '#94a3b8' }} /></div>
                  <div><div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Foto de perfil</div><div style={{ fontSize: 10, color: '#94a3b8' }}>Sube una foto tuya</div></div>
                </div>
                {['Teléfono personal', 'Contacto de emergencia', 'Dirección'].map((field, i) => (
                  <div key={i}>
                    <label style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginBottom: 3, display: 'block' }}>{field}</label>
                    <div style={{ height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 10px', display: 'flex', alignItems: 'center', fontSize: 11, color: '#94a3b8' }}>Ingresa {field.toLowerCase()}...</div>
                  </div>
                ))}
              </div>
            </div>
          )


        case 'recorrido': {
          const recorridoTipo = 'libre'
          const stops = [
            { name: 'Recepción y entrada principal', guia: 'Carlos Méndez', rol: 'Seguridad' },
            { name: 'Tu área de trabajo', guia: 'Nicolás Zapata', rol: 'Líder de área' },
            { name: 'Sala de reuniones', guia: 'Nicolás Zapata', rol: 'Líder de área' },
            { name: 'Comedor y áreas comunes', guia: 'Paola Arce', rol: 'RRHH' },
            { name: 'Área de impresoras', guia: 'Paola Arce', rol: 'RRHH' },
            { name: 'Estacionamiento', guia: 'Carlos Méndez', rol: 'Seguridad' },
            { name: 'Sala de capacitación', guia: 'Alejandro Ríos', rol: 'TI' },
            { name: 'Enfermería', guia: 'Paola Arce', rol: 'RRHH' },
            { name: 'Terraza y áreas verdes', guia: 'Paola Arce', rol: 'RRHH' },
            { name: 'Salida de emergencia', guia: 'Carlos Méndez', rol: 'Seguridad' },
          ]
          const doneSet = recorridoStops[selTarea.id] || {}
          const doneCount = typeof doneSet === 'object' ? Object.keys(doneSet).filter(k => doneSet[k]).length : 0
          const allStopsDone = doneCount >= stops.length
          const toggleStop = (i) => {
            setRecorridoStops(prev => {
              const current = typeof prev[selTarea.id] === 'object' ? prev[selTarea.id] : {}
              return { ...prev, [selTarea.id]: { ...current, [i]: !current[i] } }
            })
          }
          return (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: '#eff6ff', color: '#2563eb' }}>Recorrido libre</span>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>{doneCount}/{stops.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {stops.map((stop, i) => {
                  const isDone = !!doneSet[i]
                  return (
                    <div key={i} onClick={() => !selTarea.done && toggleStop(i)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 8, background: isDone ? '#faf5ff' : '#f8fafc', border: '1px solid #f1f5f9', cursor: selTarea.done ? 'default' : 'pointer', opacity: selTarea.done ? 0.7 : 1, transition: 'all .15s' }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, background: isDone ? '#7c3aed' : '#fff', border: isDone ? 'none' : '1.5px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isDone && <CheckCircle2 size={10} style={{ color: '#fff' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: isDone ? 600 : 400, color: isDone ? '#7c3aed' : '#334155' }}>{stop.name}</div>
                        <div style={{ fontSize: 9, color: '#94a3b8' }}>{stop.guia} · {stop.rol}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ fontSize: 10, color: allStopsDone ? '#16a34a' : '#94a3b8', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                {allStopsDone ? <><CheckCircle2 size={11} /> Recorrido completado</> : <><MapPin size={11} /> Marca cada lugar cuando lo visites</>}
              </div>
            </>
          )
        }

        case 'tarea-otro':
          return (
            <div style={{ border: '1px solid #fecaca', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserCheck size={15} style={{ color: '#dc2626' }} /><span style={{ fontSize: 12, fontWeight: 700, color: '#991b1b' }}>Tarea supervisada</span>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, margin: 0 }}>Esta tarea será supervisada por tu líder o un compañero designado.</p>
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={13} style={{ color: '#dc2626' }} /><span style={{ fontSize: 11, color: '#991b1b', fontWeight: 600 }}>Requiere validación del supervisor</span>
                </div>
              </div>
            </div>
          )

        case 'tarea-rrhh':
          return (
            <div style={{ border: '1px solid #cbd5e1', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: '#0C2D40', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={15} style={{ color: '#fff' }} /><span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Tarea de RRHH</span>
              </div>
              <div style={{ padding: 16, fontSize: 12, color: '#475569', lineHeight: 1.6 }}>Esta tarea será gestionada por el equipo de Recursos Humanos.</div>
            </div>
          )

        case 'enlace':
          return (
            <div style={{ border: '1px solid #c7d2fe', borderRadius: 12, padding: 20, textAlign: 'center', background: '#eef2ff' }}>
              <ExternalLink size={28} style={{ color: '#6366f1', marginBottom: 8 }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: '#3730a3', margin: '0 0 4px' }}>Recurso externo</p>
              <p style={{ fontSize: 11, color: '#6366f1', margin: '0 0 14px' }}>Se abrirá en una nueva pestaña</p>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                <ExternalLink size={13} /> Abrir enlace
              </button>
            </div>
          )

        case 'form-custom':
          return (
            <div style={{ border: '1px solid #a7f3d0', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: '#ecfdf5', borderBottom: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClipboardList size={15} style={{ color: '#059669' }} /><span style={{ fontSize: 12, fontWeight: 700, color: '#065f46' }}>Formulario práctico</span>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, margin: 0 }}>Completa el ejercicio práctico siguiendo las instrucciones.</p>
                {['Campo 1', 'Campo 2'].map((field, i) => (
                  <div key={i}><label style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginBottom: 3, display: 'block' }}>{field}</label><div style={{ height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc' }} /></div>
                ))}
                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#059669', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}><Send size={13} /> Enviar respuesta</button>
              </div>
            </div>
          )

        case 'confirmacion':
          return (
            <div style={{ borderRadius: 12, padding: 28, textAlign: 'center', background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)', border: '1px solid #fde68a' }}>
              <Award size={40} style={{ color: '#d97706', marginBottom: 10 }} />
              <p style={{ fontSize: 15, fontWeight: 800, color: '#92400e', margin: '0 0 6px' }}>Certificado de graduación</p>
              <p style={{ fontSize: 12, color: '#b45309', margin: '0 0 14px', lineHeight: 1.5 }}>Al completar todas las tareas obligatorias recibirás tu certificado de onboarding.</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'rgba(217,119,6,0.1)', fontSize: 11, fontWeight: 700, color: '#d97706' }}><Trophy size={13} /> +{selTarea.xp} XP al completar</div>
            </div>
          )

        default:
          return null
      }
    }

    return (
      <div className="jb">
        <div className="jb-topbar">
          <div className="jb-breadcrumb">
            <button className="jb-back" onClick={() => { setSelTarea(null); setSelContext(null) }}>
              <ArrowLeft size={16} />
            </button>
            {selContext && (
              <>
                <span className="jb-bc-text">{selContext.etapa}</span>
                <ChevronRight size={14} className="jb-bc-sep" />
                <span className="jb-bc-text">{selContext.actividad}</span>
                <ChevronRight size={14} className="jb-bc-sep" />
              </>
            )}
            <span className="jb-bc-current">{selTarea.name}</span>
          </div>
          <div className="jb-topbar-actions" style={{ gap: 8 }}>
            {selTarea.done ? (
              <>
                <button
                  className="jb-btn-outline"
                  onClick={() => { toggleDone(selTarea.id); setSelTarea(prev => ({ ...prev, done: !prev.done })); setShowAlert(false) }}
                >Desmarcar</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <CheckCircle2 size={14} style={{ color: '#16a34a' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>Completada</span>
                </div>
              </>
            ) : (
              <button
                className="jb-btn-primary"
                onClick={() => {
                  if (selTarea.tipo === 'recorrido') {
                    const doneSet = recorridoStops[selTarea.id] || {}
                    const doneCount = typeof doneSet === 'object' ? Object.keys(doneSet).filter(k => doneSet[k]).length : 0
                    if (doneCount < 10) {
                      setShowAlert('Debes completar todas las paradas del recorrido antes de marcar como completada')
                      setTimeout(() => setShowAlert(false), 3000)
                      return
                    }
                  }
                  if ((selTarea.tipo === 'video' || selTarea.tipo === 'documento') && selTarea.verificarQuiz !== false) {
                    if (!quizSubmitted[selTarea.id]) {
                      setShowAlert('Debes completar el quiz de verificación antes de marcar como completada')
                      setTimeout(() => setShowAlert(false), 3000)
                      return
                    }
                  }
                  toggleDone(selTarea.id); setSelTarea(prev => ({ ...prev, done: !prev.done }))
                }}
              >
                <CheckCircle2 size={14} />
                Marcar como completada
              </button>
            )}
          </div>
        </div>

        {/* ALERTA */}
        {showAlert && (
          <div style={{
            position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)',
            background: '#0C2D40', color: '#fff', padding: '10px 20px',
            borderRadius: 10, fontSize: 12, fontWeight: 600, zIndex: 100,
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 8px 30px rgba(0,0,0,.2)',
            animation: 'plSlideUp .2s',
          }}>
            <MapPin size={14} style={{ color: '#f59e0b' }} />
            {showAlert}
            <button onClick={() => setShowAlert(false)} style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,.5)', cursor: 'pointer', marginLeft: 4 }}>
              <X size={14} />
            </button>
          </div>
        )}

        <div className="jb-panels">
          <div className="jb-canvas">
            <div className="jb-canvas-body" style={{ padding: '24px 0' }}>
              <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}12`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0C2D40' }}>{selTarea.name}</h1>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      {selTarea.obligatoria && (<span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#fef3c7', color: '#92400e', textTransform: 'uppercase' }}>Obligatoria</span>)}
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${color}12`, color }}>{selTarea.tipo.replace('-', ' ')}</span>
                      {selTarea.xp > 0 && (<span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#fef3c7', color: '#d97706' }}>+{selTarea.xp} XP</span>)}
                    </div>
                  </div>
                </div>

                {selTarea.desc && (
                  <div style={{ padding: '16px 20px', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9', marginBottom: 20 }}>
                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, margin: 0 }}>{selTarea.desc}</p>
                  </div>
                )}

                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={isMobile ? 'jb-mobile' : 'jb'}>
      {/* BARRA SUPERIOR */}
      {isMobile ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 4px', marginBottom: 4,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#0C2D40' }}>Mi Onboarding</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#fef3c7', padding: '3px 6px', borderRadius: 5 }}>
              <Star size={8} style={{ color: '#d97706' }} />
              <span style={{ fontSize: 7, fontWeight: 800, color: '#92400e' }}>{totalXP}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#f0fdf4', padding: '3px 6px', borderRadius: 5 }}>
              <Trophy size={8} style={{ color: '#16a34a' }} />
              <span style={{ fontSize: 7, fontWeight: 800, color: '#166534' }}>{totalDone}/{totalAll}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#f1f5f9', padding: '3px 6px', borderRadius: 5 }}>
              <span style={{ fontSize: 7, fontWeight: 700, color: '#475569' }}>{pct}%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="jb-topbar">
          <div className="jb-breadcrumb">
            <span className="jb-bc-current" style={{ fontSize: 14, fontWeight: 700 }}>Mi Onboarding</span>
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 10 }}>
              Ruta: {ruta?.nombre || 'Sin asignar'}{ruta?.area ? ` — ${ruta.area}` : ''}
            </span>
          </div>
          <div className="jb-topbar-actions" style={{ gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#fef3c7', padding: '6px 12px', borderRadius: 8,
            }}>
              <Star size={13} style={{ color: '#d97706' }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: '#92400e' }}>{totalXP} XP</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#f0fdf4', padding: '6px 12px', borderRadius: 8,
            }}>
              <Trophy size={13} style={{ color: '#16a34a' }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: '#166534' }}>{totalDone}/{totalAll}</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#f1f5f9', padding: '6px 12px', borderRadius: 8,
            }}>
              <Clock size={13} style={{ color: '#64748b' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>{pct}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="jb-panels">
        <div className="jb-canvas">
          <div className="jb-canvas-body jb-pizarra">

            {/* CARD ETAPAS — izquierda */}
            {!isMobile && etapasOpen ? (
              <div className="jb-float-card jb-float-left">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div className="jb-sb-title">Etapas <span className="jb-sb-count">{etapas.length}</span></div>
                  <button className="jb-colab-collapse-btn" onClick={() => setEtapasOpen(false)} title="Cerrar">
                    <X size={13} />
                  </button>
                </div>
                <p className="jb-sb-hint">Tu recorrido de onboarding</p>

                <div style={{ padding: '0 0 12px' }}>
                  <div style={{ height: 4, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: '#10DC97', borderRadius: 99,
                      transition: 'width .4s ease',
                    }} />
                  </div>
                </div>

                <div className="jb-sb-list">
                  {etapas.map((e, i) => {
                    const tareas = flatTareas(e)
                    const done = tareas.every(t => t.done)
                    const progress = tareas.some(t => t.done)
                    const etapaDone = tareas.filter(t => t.done).length
                    return (
                      <button
                        key={i}
                        className={`jb-sb-item ${done ? 'done' : ''}`}
                        onClick={() => scrollToEtapa(i)}
                      >
                        <div className={`jb-sb-dot ${done ? 'dot-done' : progress ? 'dot-progress' : ''}`}>
                          {i === 0 ? <Lock size={9} /> : <span className="jb-sb-dot-num">{i + 1}</span>}
                        </div>
                        <div className="jb-sb-info">
                          <div className="jb-sb-name">{e.name}</div>
                          <div className="jb-sb-days">{e.days} · {etapaDone}/{tareas.length} completadas</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : !isMobile ? (
              <div className="jb-float-left">
                <button className="jb-colab-fab" onClick={() => setEtapasOpen(true)} title="Ver etapas">
                  <Route size={18} />
                </button>
              </div>
            ) : null}

            {/* CARD INFO — derecha */}
            {!isMobile && infoOpen ? (
              <div className="jb-float-card jb-float-right">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div className="jb-sb-title">Información</div>
                  <button className="jb-colab-collapse-btn" onClick={() => setInfoOpen(false)} title="Cerrar">
                    <X size={13} />
                  </button>
                </div>
                <p className="jb-sb-hint">Haz clic en un nodo para ver el detalle</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10DC97' }} />
                    <span style={{ fontSize: 11, color: '#475569' }}>Completada</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0C2D40', boxShadow: '0 0 0 3px rgba(12,45,64,0.2)' }} />
                    <span style={{ fontSize: 11, color: '#475569' }}>Pendiente</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e2e8f0' }} />
                    <span style={{ fontSize: 11, color: '#475569' }}>Bloqueada</span>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 14, paddingTop: 12 }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: 6 }}>Tip</div>
                  <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4, margin: 0 }}>
                    Completa las tareas obligatorias para desbloquear la siguiente etapa.
                  </p>
                </div>
              </div>
            ) : !isMobile ? (
              <div className="jb-float-right" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="jb-colab-fab" onClick={() => setInfoOpen(true)} title="Ver información">
                  <Info size={18} />
                </button>
              </div>
            ) : null}

            {/* TODAS LAS ETAPAS */}
            {etapas.map((etapa, ei) => {
              const etapaTareas = flatTareas(etapa)
              const etapaDone = etapaTareas.filter(t => t.done).length

              return (
                <div key={ei} ref={el => setEtapaRef(ei, el)}>
                  {/* HEADER ETAPA */}
                  <div className="jb-etapa-header" style={isMobile ? { padding: '6px 8px', gap: 6, borderRadius: 8, marginBottom: 8, alignItems: 'stretch' } : { alignItems: 'stretch' }}>
                    <div className="jb-etapa-num" style={isMobile ? { width: 20, height: 20, fontSize: 8 } : undefined}>
                      {ei === 0 ? <Lock size={isMobile ? 9 : 14} /> : ei + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="jb-etapa-name" style={isMobile ? { fontSize: 8.5, fontWeight: 700 } : undefined}>{etapa.name}</div>
                      <div className="jb-etapa-duration" style={isMobile ? { gap: 3 } : undefined}>
                        <Calendar size={isMobile ? 8 : 13} className="jb-dur-ico" />
                        <span className="jb-dur-label" style={isMobile ? { fontSize: 7 } : undefined}>{etapa.days}</span>
                        <span className="jb-dur-sep">·</span>
                        <span className="jb-dur-unit" style={isMobile ? { fontSize: 7 } : undefined}>
                          {etapaDone}/{etapaTareas.length}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: isMobile ? '2px 8px' : '4px 16px',
                      borderLeft: '1px solid #e2e8f0', marginLeft: isMobile ? 4 : 8,
                    }}>
                      <span style={{ fontSize: isMobile ? 14 : 28, fontWeight: 800, color: '#0C2D40', lineHeight: 1 }}>
                        {etapa.duracion || 7}
                      </span>
                      <span style={{ fontSize: isMobile ? 6 : 10, fontWeight: 600, color: '#94a3b8', marginTop: 1 }}>
                        días
                      </span>
                    </div>
                  </div>

                  {ei === 0 && (
                    <div className="jb-colab-mascot">
                      <img src={viaBebe} alt="Mascota" className="jb-colab-mascot-img" />
                    </div>
                  )}

                  {/* CAMINO DE NODOS */}
                  <div className="jb-duo-path">
                    {(() => {
                      const items = []
                      let flatIdx = 0

                      etapa.actividades.forEach((actividad, ai) => {
                        items.push(
                          <div key={`act-${ei}-${ai}`} className="jb-actividad-divider">
                            <span className="jb-actividad-pill">{actividad.name}</span>
                          </div>
                        )

                        actividad.tareas.forEach((tarea) => {
                          const i = flatIdx
                          const Icon = iconMap[tarea.tipo] || FileText
                          const isSelected = selTarea?.id === tarea.id
                          const status = tarea.done ? 'done' : 'active'
                          const xOff = positions[i % positions.length]

                          items.push(
                            <div
                              key={tarea.id}
                              className="jb-duo-node-wrap"
                              style={{ '--x-off': `${xOff}px`, cursor: 'default' }}
                            >
                              {ei === 0 && i === 0 && !tarea.done && (
                                <div className="jb-start-bubble">¡Empezar!</div>
                              )}
                              <button
                                className={`jb-duo-node ${status} ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                  if (selTarea?.id === tarea.id) {
                                    setSelTarea(null)
                                    setSelContext(null)
                                  } else {
                                    setSelTarea(tarea)
                                    setSelContext({ etapa: etapa.name, actividad: actividad.name, days: etapa.days })
                                  }
                                }}
                                title={tarea.name}
                              >
                                <div className="jb-duo-circle">
                                  {tarea.done ? <CheckCircle2 size={22} /> : <Icon size={18} />}
                                </div>
                                {tarea.xp > 0 && <span className="jb-duo-xp">+{tarea.xp}</span>}
                              </button>
                              <span className={`jb-duo-label ${status}`}>{tarea.name}</span>
                              {tarea.obligatoria && (
                                <span style={{
                                  fontSize: 8, fontWeight: 700, color: '#b45309',
                                  background: '#fef3c7', padding: '1px 5px', borderRadius: 4,
                                  marginTop: 3, textTransform: 'uppercase',
                                }}>
                                  Obligatoria
                                </span>
                              )}
                            </div>
                          )

                          flatIdx++
                        })
                      })

                      return items
                    })()}
                  </div>
                </div>
              )
            })}

            {/* FIN DEL CAMINO */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 40px', gap: 8 }}>
              <img src={trofeoImg} alt="Trofeo" style={{ width: 80, height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.1))' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40' }}>Fin del onboarding</span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Completa todas las tareas para graduarte</span>
            </div>

          </div>
        </div>
      </div>

      {false && (() => {
        const Icon = iconMap[selTarea.tipo] || FileText
        const color = colorMap[selTarea.tipo] || '#94a3b8'

        const renderContent = () => {
          switch (selTarea.tipo) {
            case 'video':
              return selTarea.videoUrl ? (
                <div style={{ borderRadius: 12, overflow: 'hidden', background: '#0f172a' }}>
                  <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                    <iframe
                      src={`${selTarea.videoUrl}?rel=0&modestbranding=1`}
                      title={selTarea.name}
                      frameBorder="0"
                      referrerPolicy="no-referrer-when-downgrade"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{
                        position: 'absolute', top: 0, left: 0,
                        width: '100%', height: '100%', border: 'none',
                      }}
                    />
                  </div>
                </div>
              ) : null

            case 'audio':
              return (
                <div style={{
                  padding: 20, borderRadius: 12,
                  background: 'linear-gradient(135deg, #0e7490 0%, #155e75 100%)',
                  display: 'flex', flexDirection: 'column', gap: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}>
                      <Play size={22} style={{ color: '#fff', marginLeft: 2 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{selTarea.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Audio · 5:20 min</div>
                    </div>
                    <Headphones size={20} style={{ color: 'rgba(255,255,255,0.4)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>0:00</span>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 99 }}>
                      <div style={{ width: '0%', height: '100%', background: '#fff', borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>5:20</span>
                  </div>
                </div>
              )

            case 'documento':
            case 'lectura':
              return (
                <div style={{
                  border: '1px solid #fed7aa', borderRadius: 12,
                  overflow: 'hidden', background: '#fffbf5',
                }}>
                  <div style={{
                    padding: '14px 16px', background: '#fff7ed',
                    borderBottom: '1px solid #fed7aa',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FileText size={16} style={{ color: '#ea580c' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#9a3412' }}>{selTarea.name}.pdf</span>
                    </div>
                    <button style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: 10, fontWeight: 700, color: '#ea580c',
                      background: '#fff', border: '1px solid #fed7aa',
                      borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                    }}>
                      <Download size={12} /> Descargar
                    </button>
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>
                      {selTarea.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>
                      <div style={{ height: 10, background: '#f1f5f9', borderRadius: 4, marginBottom: 6, width: '100%' }} />
                      <div style={{ height: 10, background: '#f1f5f9', borderRadius: 4, marginBottom: 6, width: '90%' }} />
                      <div style={{ height: 10, background: '#f1f5f9', borderRadius: 4, marginBottom: 6, width: '95%' }} />
                      <div style={{ height: 10, background: '#f1f5f9', borderRadius: 4, marginBottom: 6, width: '70%' }} />
                      <div style={{ height: 10, background: '#f1f5f9', borderRadius: 4, marginBottom: 14, width: '85%' }} />
                      <div style={{ height: 10, background: '#f1f5f9', borderRadius: 4, marginBottom: 6, width: '100%' }} />
                      <div style={{ height: 10, background: '#f1f5f9', borderRadius: 4, marginBottom: 6, width: '80%' }} />
                      <div style={{ height: 10, background: '#f1f5f9', borderRadius: 4, width: '60%' }} />
                    </div>
                    <div style={{
                      marginTop: 14, fontSize: 10, color: '#94a3b8', textAlign: 'center',
                    }}>Página 1 de 4</div>
                  </div>
                </div>
              )

            case 'quiz':
              return (
                <div style={{
                  border: '1px solid #fde68a', borderRadius: 12,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '12px 16px', background: '#fffbeb',
                    borderBottom: '1px solid #fde68a',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <HelpCircle size={15} style={{ color: '#d97706' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>Cuestionario</span>
                    </div>
                    <span style={{ fontSize: 10, color: '#b45309' }}>3 preguntas</span>
                  </div>
                  <div style={{ padding: 16 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', margin: '0 0 12px' }}>
                      1. ¿Cuál es la misión principal de la empresa?
                    </p>
                    {['Ser líderes en innovación tecnológica', 'Maximizar las ganancias', 'Transformar la gestión de personas', 'Ninguna de las anteriores'].map((opt, i) => (
                      <label key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', borderRadius: 8, marginBottom: 6,
                        border: '1px solid #f1f5f9', cursor: 'pointer',
                        fontSize: 12, color: '#475569',
                        background: '#fff',
                      }}>
                        <CircleDot size={14} style={{ color: '#cbd5e1' }} />
                        {opt}
                      </label>
                    ))}
                    <div style={{
                      marginTop: 12, padding: '8px 12px', borderRadius: 8,
                      background: '#f8fafc', fontSize: 10, color: '#94a3b8',
                      textAlign: 'center',
                    }}>
                      Pregunta 1 de 3 — Necesitas 70% para aprobar
                    </div>
                  </div>
                </div>
              )

            case 'subida':
              return (
                <div style={{
                  border: '2px dashed #f9a8d4', borderRadius: 12,
                  padding: 28, textAlign: 'center',
                  background: '#fdf2f8',
                }}>
                  <Upload size={32} style={{ color: '#ec4899', marginBottom: 10 }} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#9d174d', margin: '0 0 4px' }}>
                    Arrastra tus archivos aquí
                  </p>
                  <p style={{ fontSize: 11, color: '#be185d', margin: '0 0 14px' }}>
                    o haz clic para seleccionar
                  </p>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {['PDF', 'JPG', 'PNG'].map(f => (
                      <span key={f} style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 8px',
                        borderRadius: 4, background: '#fce7f3', color: '#be185d',
                      }}>{f}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 10, color: '#d946ef', marginTop: 10, margin: '10px 0 0' }}>
                    Tamaño máximo: 10 MB
                  </p>
                </div>
              )

            case 'completar-perfil':
              return (
                <div style={{
                  border: '1px solid #a7f3d0', borderRadius: 12,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '12px 16px', background: '#ecfdf5',
                    borderBottom: '1px solid #a7f3d0',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <ClipboardList size={15} style={{ color: '#059669' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#065f46' }}>Completa tu perfil</span>
                  </div>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: '50%', background: '#f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px dashed #cbd5e1', cursor: 'pointer',
                      }}>
                        <Camera size={18} style={{ color: '#94a3b8' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Foto de perfil</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>Sube una foto tuya</div>
                      </div>
                    </div>
                    {['Teléfono personal', 'Contacto de emergencia', 'Dirección'].map((field, i) => (
                      <div key={i}>
                        <label style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginBottom: 3, display: 'block' }}>{field}</label>
                        <div style={{
                          height: 34, borderRadius: 8, border: '1px solid #e2e8f0',
                          background: '#f8fafc', padding: '0 10px',
                          display: 'flex', alignItems: 'center',
                          fontSize: 11, color: '#94a3b8',
                        }}>
                          Ingresa {field.toLowerCase()}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )

            case 'reunion':
              return (
                <div style={{
                  border: '1px solid #bfdbfe', borderRadius: 12,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '14px 16px',
                    background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Calendar size={16} style={{ color: '#fff' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Reunión programada</span>
                    </div>
                    <span style={{ fontSize: 10, color: '#bfdbfe' }}>30 min</span>
                  </div>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', background: '#dbeafe',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <UserCheck size={16} style={{ color: '#2563eb' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Con: Tu líder directo</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>Se coordinará la fecha</div>
                      </div>
                    </div>
                    <div style={{
                      padding: '10px 14px', borderRadius: 8, background: '#eff6ff',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <Link2 size={13} style={{ color: '#2563eb' }} />
                      <span style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 600 }}>El link se enviará a tu correo</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MessageSquare size={11} />
                      Tu líder marcará esta tarea cuando se complete la reunión
                    </div>
                  </div>
                </div>
              )

            case 'recorrido': {
              const recorridoTipo = 'libre'
              const stops = [
                { name: 'Recepción y entrada principal', guia: 'Carlos Méndez', rol: 'Seguridad' },
                { name: 'Tu área de trabajo', guia: 'Nicolás Zapata', rol: 'Líder de área' },
                { name: 'Sala de reuniones', guia: 'Nicolás Zapata', rol: 'Líder de área' },
                { name: 'Comedor y áreas comunes', guia: 'Paola Arce', rol: 'RRHH' },
                { name: 'Área de impresoras', guia: 'Paola Arce', rol: 'RRHH' },
                { name: 'Estacionamiento', guia: 'Carlos Méndez', rol: 'Seguridad' },
                { name: 'Sala de capacitación', guia: 'Alejandro Ríos', rol: 'TI' },
                { name: 'Enfermería', guia: 'Paola Arce', rol: 'RRHH' },
                { name: 'Terraza y áreas verdes', guia: 'Paola Arce', rol: 'RRHH' },
                { name: 'Salida de emergencia', guia: 'Carlos Méndez', rol: 'Seguridad' },
              ]
              const doneSet = recorridoStops[selTarea.id] || {}
              const doneCount = typeof doneSet === 'object' ? Object.keys(doneSet).filter(k => doneSet[k]).length : 0
              const allStopsDone = doneCount >= stops.length

              function toggleStop(i) {
                setRecorridoStops(prev => {
                  const current = typeof prev[selTarea.id] === 'object' ? prev[selTarea.id] : {}
                  return { ...prev, [selTarea.id]: { ...current, [i]: !current[i] } }
                })
              }

              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5,
                      background: recorridoTipo === 'libre' ? '#eff6ff' : '#faf5ff',
                      color: recorridoTipo === 'libre' ? '#2563eb' : '#7c3aed',
                    }}>
                      {recorridoTipo === 'libre' ? 'Recorrido libre' : 'Recorrido guiado'}
                    </span>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{doneCount}/{stops.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 200, overflowY: 'auto' }}>
                    {stops.map((stop, i) => {
                      const isDone = !!doneSet[i]
                      return (
                        <div
                          key={i}
                          onClick={() => toggleStop(i)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '6px 10px', borderRadius: 8,
                            background: isDone ? '#faf5ff' : '#f8fafc',
                            border: '1px solid #f1f5f9',
                            cursor: 'pointer', transition: 'all .15s',
                          }}
                        >
                          <div style={{
                            width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                            background: isDone ? '#7c3aed' : '#fff',
                            border: isDone ? 'none' : '1.5px solid #d1d5db',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isDone && <CheckCircle2 size={10} style={{ color: '#fff' }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: isDone ? 600 : 400, color: isDone ? '#7c3aed' : '#334155' }}>{stop.name}</div>
                            <div style={{ fontSize: 9, color: '#94a3b8' }}>{stop.guia} · {stop.rol}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ fontSize: 10, color: allStopsDone ? '#16a34a' : '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                    {allStopsDone ? <><CheckCircle2 size={11} /> Recorrido completado</> : <><MapPin size={11} /> Marca cada lugar cuando lo visites</>}
                  </div>
                </>
              )
            }

            case 'tarea-otro':
              return (
                <div style={{
                  border: '1px solid #fecaca', borderRadius: 12,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '12px 16px', background: '#fef2f2',
                    borderBottom: '1px solid #fecaca',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <UserCheck size={15} style={{ color: '#dc2626' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#991b1b' }}>Tarea supervisada</span>
                  </div>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                      Esta tarea será supervisada por tu líder o un compañero designado.
                      Recibirás instrucciones específicas cuando llegue el momento.
                    </p>
                    <div style={{
                      padding: '10px 14px', borderRadius: 8, background: '#fef2f2',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <ShieldCheck size={13} style={{ color: '#dc2626' }} />
                      <span style={{ fontSize: 11, color: '#991b1b', fontWeight: 600 }}>Requiere validación del supervisor</span>
                    </div>
                  </div>
                </div>
              )

            case 'tarea-rrhh':
              return (
                <div style={{
                  border: '1px solid #cbd5e1', borderRadius: 12,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '12px 16px', background: '#0C2D40',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <ShieldCheck size={15} style={{ color: '#fff' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Tarea de RRHH</span>
                  </div>
                  <div style={{ padding: 16, fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                    Esta tarea será gestionada por el equipo de Recursos Humanos.
                    Se marcará automáticamente cuando se complete el proceso.
                  </div>
                </div>
              )

            case 'enlace':
              return (
                <div style={{
                  border: '1px solid #c7d2fe', borderRadius: 12,
                  padding: 20, textAlign: 'center', background: '#eef2ff',
                }}>
                  <ExternalLink size={28} style={{ color: '#6366f1', marginBottom: 8 }} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#3730a3', margin: '0 0 4px' }}>
                    Recurso externo
                  </p>
                  <p style={{ fontSize: 11, color: '#6366f1', margin: '0 0 14px' }}>
                    Se abrirá en una nueva pestaña
                  </p>
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 8,
                    background: '#6366f1', color: '#fff', border: 'none',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>
                    <ExternalLink size={13} /> Abrir enlace
                  </button>
                </div>
              )

            case 'form-custom':
              return (
                <div style={{
                  border: '1px solid #a7f3d0', borderRadius: 12,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '12px 16px', background: '#ecfdf5',
                    borderBottom: '1px solid #a7f3d0',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <ClipboardList size={15} style={{ color: '#059669' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#065f46' }}>Formulario práctico</span>
                  </div>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, margin: 0 }}>
                      Completa el ejercicio práctico siguiendo las instrucciones.
                    </p>
                    {['Campo 1', 'Campo 2'].map((field, i) => (
                      <div key={i}>
                        <label style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginBottom: 3, display: 'block' }}>{field}</label>
                        <div style={{
                          height: 34, borderRadius: 8, border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                        }} />
                      </div>
                    ))}
                    <button style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 8,
                      background: '#059669', color: '#fff', border: 'none',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}>
                      <Send size={13} /> Enviar respuesta
                    </button>
                  </div>
                </div>
              )

            case 'confirmacion':
              return (
                <div style={{
                  borderRadius: 12, padding: 28, textAlign: 'center',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
                  border: '1px solid #fde68a',
                }}>
                  <Award size={40} style={{ color: '#d97706', marginBottom: 10 }} />
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#92400e', margin: '0 0 6px' }}>
                    Certificado de graduación
                  </p>
                  <p style={{ fontSize: 12, color: '#b45309', margin: '0 0 14px', lineHeight: 1.5 }}>
                    Al completar todas las tareas obligatorias recibirás tu certificado de onboarding.
                  </p>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 8,
                    background: 'rgba(217,119,6,0.1)', fontSize: 11, fontWeight: 700, color: '#d97706',
                  }}>
                    <Trophy size={13} /> +{selTarea.xp} XP al completar
                  </div>
                </div>
              )

            default:
              return null
          }
        }

        return (
          <div className="jb">
            {/* TOPBAR */}
            <div className="jb-topbar">
              <div className="jb-breadcrumb">
                <button className="jb-back" onClick={() => { setSelTarea(null); setSelContext(null) }}>
                  <ArrowLeft size={16} />
                </button>
                {selContext && (
                  <>
                    <span className="jb-bc-text">{selContext.etapa}</span>
                    <ChevronRight size={14} className="jb-bc-sep" />
                    <span className="jb-bc-text">{selContext.actividad}</span>
                    <ChevronRight size={14} className="jb-bc-sep" />
                  </>
                )}
                <span className="jb-bc-current">{selTarea.name}</span>
              </div>
              <div className="jb-topbar-actions" style={{ gap: 8 }}>
                <button
                  className="jb-btn-outline"
                  style={selTarea.done ? {} : { opacity: 0.5 }}
                  onClick={() => { toggleDone(selTarea.id); setSelTarea(prev => ({ ...prev, done: !prev.done })) }}
                >
                  {selTarea.done ? 'Desmarcar' : ''}
                </button>
                {!selTarea.done && (
                  <button
                    className="jb-btn-primary"
                    onClick={() => { toggleDone(selTarea.id); setSelTarea(prev => ({ ...prev, done: !prev.done })) }}
                  >
                    <CheckCircle2 size={14} />
                    Marcar como completada
                  </button>
                )}
                {selTarea.done && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 8,
                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                  }}>
                    <CheckCircle2 size={14} style={{ color: '#16a34a' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>Completada</span>
                  </div>
                )}
              </div>
            </div>

            <div className="jb-panels">
              <div className="jb-canvas">
                <div className="jb-canvas-body" style={{ padding: '24px 0' }}>
                  <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>

                    {/* HEADER DE TAREA */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: `${color}12`, color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0C2D40' }}>{selTarea.name}</h1>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                          {selTarea.obligatoria && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                              background: '#fef3c7', color: '#92400e', textTransform: 'uppercase',
                            }}>Obligatoria</span>
                          )}
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                            background: `${color}12`, color,
                          }}>{selTarea.tipo.replace('-', ' ')}</span>
                          {selTarea.xp > 0 && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                              background: '#fef3c7', color: '#d97706',
                            }}>+{selTarea.xp} XP</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* DESCRIPCIÓN */}
                    {selTarea.desc && (
                      <div style={{
                        padding: '16px 20px', borderRadius: 12,
                        background: '#f8fafc', border: '1px solid #f1f5f9',
                        marginBottom: 20,
                      }}>
                        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, margin: 0 }}>
                          {selTarea.desc}
                        </p>
                      </div>
                    )}

                    {/* CONTENIDO SEGÚN TIPO */}
                    {renderContent()}

                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
