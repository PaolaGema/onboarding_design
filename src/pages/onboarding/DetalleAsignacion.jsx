import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Users, Check, Send, UserCheck, UserMinus, Pause, Play, PlayCircle,
  AlertTriangle, Layers,
} from 'lucide-react'
import { useUser } from '../../context/UserContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { buildDetalleEtapas } from '../../utils/detalleEtapas'
import { statusLabels, statusCls, barColor } from '../../utils/estadoAsignacion'
import { infoTipo } from '../../utils/tareaTipos'
import { avatarUrl } from '../../utils/calendarEvents'
import EmptyState from '../../components/layout/EmptyState'
import ConfirmarAccionModal from '../../components/layout/ConfirmarAccionModal'
import AsignarBuddyModal from '../../components/onboarding/AsignarBuddyModal'
import EnviarRecordatorioModal from '../../components/onboarding/EnviarRecordatorioModal'
import RespuestasTareaModal from '../../components/onboarding/RespuestasTareaModal'
import PausarOnboardingModal from '../../components/onboarding/PausarOnboardingModal'
import { TaskPreviewModal } from '../../components/onboarding/RutaPreviewModal'

/* Ficha de una persona en su onboarding: pantalla propia y no un modal.

   El recorrido se dibuja como el mismo camino de nodos que ve el colaborador (las clases
   jb-duo-*), para que Recursos Humanos y la persona miren exactamente la misma ruta. La
   diferencia es la lectura: cada nodo se pinta según si esa tarea ya se completó, y bajo el
   nodo cuelgan los datos que solo RH necesita (cuántas veces vio el video, abrir sus
   respuestas). La ficha —datos y acciones— vive fija a la derecha, y la pantalla tiene URL
   propia: se puede compartir o volver con el navegador. */

// Tareas cuyo contenido respondió el colaborador y Recursos Humanos puede abrir.
const CON_RESPUESTAS = ['quiz', 'completar-perfil']

/* Zigzag del camino: cada nodo se corre en X según su orden dentro de la etapa. Son valores
   más chicos que en la vista del colaborador porque acá el recorrido comparte el ancho con
   el rail derecho, no ocupa la pantalla entera. */
const OFFSETS = [0, 36, 54, 36, 0, -36, -54, -36]

// Estadísticas de reproducción del video — derivadas de forma estable a partir del id de la tarea
function videoStats(taskId, done) {
  const seed = String(taskId).split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  if (done) return { veces: 1 + (seed % 3), completo: true }
  return { veces: seed % 3, completo: false }
}

function Dato({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--border-soft)' }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-heading)', textAlign: 'right', minWidth: 0 }}>{children}</span>
    </div>
  )
}

// Un dato de la tira inferior: etiqueta chica, valor grande y un detalle opcional. Sin icono
// —tres cuadros de colores distintos ensuciaban la cabecera— y separados por una línea fina.
function Stat({ label, valor, detalle }) {
  return (
    <div className="det-stat">
      <div className="det-stat-label">{label}</div>
      <div className="det-stat-val">{valor}</div>
      {detalle && <div className="det-stat-sub">{detalle}</div>}
    </div>
  )
}

export default function DetalleAsignacion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useUser()
  const { asignaciones, setAsignaciones, plantillas, addFeedEntry } = useOnboardingData()

  const [verRespuestas, setVerRespuestas] = useState(null)
  const [verTarea, setVerTarea] = useState(null)
  const [buddyModal, setBuddyModal] = useState(false)
  const [recordatorio, setRecordatorio] = useState(false)
  const [pausarConfirm, setPausarConfirm] = useState(false)
  const [desasignarConfirm, setDesasignarConfirm] = useState(false)

  /* Al tocar un nodo se ve su detalle: una prueba/formulario que la persona ya completó abre
     lo que respondió (con sus intentos); cualquier otra tarea —o una aún pendiente— abre su
     contenido tal como lo ve el colaborador. Las respuestas van de la mano del verde: sin
     tarea hecha no hay resultado que mostrar. */
  function abrirTarea(t) {
    if (t.done && CON_RESPUESTAS.includes(t.tipo)) setVerRespuestas(t)
    else setVerTarea(t)
  }

  const volver = () => navigate('/onboarding/asignaciones')

  /* El líder y el auxiliar solo ven su área. La lista ya los filtra, pero la ficha tiene URL
     propia: sin este control, escribir un id a mano abriría la de cualquier persona. */
  const isAreaRole = currentUser.role === 'manager' || currentUser.role === 'auxiliar'
  const encontrada = asignaciones.find(x => String(x.id) === String(id))
  const a = encontrada && (!isAreaRole || encontrada.area === currentUser.area) ? encontrada : null

  if (!a) {
    return (
      <div className="content-scroll">
        <button className="det-back" onClick={volver}>
          <ArrowLeft size={15} /> Seguimiento
        </button>
        <div className="sec-card">
          <EmptyState
            icon={Users}
            title="No encontramos esta asignación"
            description="Puede que se haya desasignado o que pertenezca a un área que no administras."
            actionLabel="Volver a Seguimiento"
            onAction={volver}
          />
        </div>
      </div>
    )
  }

  const ruta = plantillas.find(p => p.id === a.rutaId || p.name === a.ruta)
  const etapas = buildDetalleEtapas(a, plantillas)
  const tareas = etapas.flatMap(e => e.tareas)
  const totalActividades = etapas.reduce((s, e) => s + e.actividades.length, 0)
  const hechas = tareas.filter(t => t.done).length
  const diasRestantes = Math.max(0, a.totalDias - a.dia)
  const enAlerta = a.status === 'atrasado' || a.status === 'en-riesgo'
  // Dónde está parada la persona: la primera etapa con tareas sin terminar.
  const etapaActual = a.status === 'completado' || a.status === 'pendiente'
    ? -1
    : etapas.findIndex(e => e.doneLocal < e.tareas.length)

  function actualizar(cambios) {
    setAsignaciones(asignaciones.map(x => (x.id === a.id ? { ...x, ...cambios } : x)))
  }

  function asignarBuddy(candidato) {
    actualizar({ buddy: { name: candidato.name, initials: candidato.initials, color: candidato.color } })
    addFeedEntry(`${candidato.name} fue asignado/a como buddy de ${a.nombre}`)
    setBuddyModal(false)
  }

  /* Al desasignar, la ficha se queda sin sujeto: la asignación que le da sentido a esta URL
     deja de existir. Por eso vuelve a la lista en vez de quedarse mostrando el vacío. */
  function desasignar() {
    setAsignaciones(asignaciones.filter(x => x.id !== a.id))
    addFeedEntry(`${a.nombre} fue desasignado/a de ${a.ruta}`)
    setDesasignarConfirm(false)
    volver()
  }

  return (
    <div className="content-scroll">
      <button className="det-back" onClick={volver}>
        <ArrowLeft size={15} /> Seguimiento
      </button>

      {/* IDENTIDAD + AVANCE */}
      <div className="sec-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 22px' }}>
          {/* Las iniciales van debajo de la foto: si la imagen no carga, la ficha sigue
              identificando a la persona en vez de mostrar un círculo vacío. */}
          <div className="ai-av" style={{
            width: 52, height: 52, flexShrink: 0, position: 'relative',
            background: a.color || 'var(--navy)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
              {a.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
            <img
              src={avatarUrl(a.nombre, 104)}
              alt={a.nombre}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.2px' }}>{a.nombre}</h1>
              <span className={`as-status ${statusCls[a.status]}`}>{statusLabels[a.status]}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {[a.cargo, a.area].filter(Boolean).join(' · ')}
            </div>
            {/* La ruta como texto, sin píldora ni icono: es contexto, no una acción. */}
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue)', marginTop: 3 }}>
              {a.ruta}
            </div>
          </div>
          {enAlerta && (
            <button
              className="pl-btn-new"
              onClick={() => setRecordatorio(true)}
              style={{ padding: '0 14px', height: 34, fontSize: 11.5, flexShrink: 0 }}
            >
              <Send size={14} /> Enviar recordatorio
            </button>
          )}
        </div>

        {/* Tira de datos: solo texto, separados por líneas finas. Avance lleva su barra. */}
        <div className="det-stats">
          <div className="det-stat">
            <div className="det-stat-label">Avance</div>
            <div className="det-stat-val">{a.pct}%</div>
            <div className="pr-bar" style={{ height: 6, marginTop: 7 }}>
              <div className="pr-fill" style={{ width: `${a.pct}%`, background: barColor(a.status, a.pct) }} />
            </div>
          </div>
          <Stat
            label="Tareas" valor={`${hechas} de ${tareas.length}`}
            detalle={tareas.length - hechas > 0 ? `${tareas.length - hechas} pendientes` : 'Todas completadas'}
          />
          <Stat
            label="Día" valor={`${a.dia} de ${a.totalDias}`}
            detalle={a.status === 'completado' ? 'Proceso terminado' : `Faltan ${diasRestantes} días`}
          />
          <Stat
            label="Inicio" valor={a.fechaInicio}
            detalle={ruta?.tipo || 'Onboarding'}
          />
        </div>
      </div>

      <div className="det-grid">
        {/* RECORRIDO */}
        <div className="sec-card">
          <div className="sc-hd">
            <h3 style={{ flex: 1 }}>
              Recorrido de {a.nombre.split(' ')[0]}
              <span style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginTop: 2 }}>
                {etapas.length} etapas · {totalActividades} actividades · {hechas}/{tareas.length} tareas
                {a.version != null && ` · versión ${a.version} de la ruta`}
              </span>
            </h3>
          </div>

          {/* Leyenda: sin ella, un nodo verde y uno gris no dicen por sí solos qué significan. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 22px', borderBottom: '1px solid var(--border-soft)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--green)' }} /> Completada
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--surface-card)', border: '2px solid var(--border-dark)' }} /> Pendiente
            </span>
          </div>

          <div className="det-path-canvas">
            {etapas.map((etapa, i) => {
              const completa = etapa.tareas.length > 0 && etapa.doneLocal === etapa.tareas.length
              const actual = i === etapaActual
              return (
                <div key={i} className="det-etapa-block">
                  {/* Cabecera de etapa: misma píldora que en la vista previa de la ruta. */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                    <div className={`det-etapa-pill${actual ? ' actual' : ''}`}>
                      <div className="det-etapa-num" style={completa ? { background: 'var(--green)' } : undefined}>
                        {completa ? <Check size={12} /> : i + 1}
                      </div>
                      <span className="det-etapa-name">{etapa.name}</span>
                      {etapa.days && <span className="det-etapa-days">{etapa.days}</span>}
                      {actual && <span className="det-etapa-tag">Etapa actual</span>}
                      <span className={`det-etapa-count${completa ? ' done' : ''}`}>{etapa.doneLocal}/{etapa.tareas.length}</span>
                    </div>
                  </div>

                  {etapa.tareas.length === 0 ? (
                    <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>Sin tareas</div>
                  ) : (
                    <div className="jb-duo-path" style={{ padding: '10px 0 6px' }}>
                      {etapa.actividades.map((act, ai) => {
                        const actDone = act.tareas.filter(t => t.done).length
                        return (
                          <div key={ai} style={{ width: '100%' }}>
                            {/* Divisor de actividad: el nivel intermedio entre la etapa y las
                                tareas, igual que en el camino del colaborador. */}
                            <div className="det-act-divider">
                              <span className="det-act-pill">
                                <Layers size={11} />
                                {act.name || `Actividad ${ai + 1}`}
                                <span className="det-act-count">{actDone}/{act.tareas.length}</span>
                              </span>
                            </div>

                            {act.tareas.map((t, ti) => {
                              const tipo = infoTipo(t.tipo)
                              const TIcon = tipo.icon
                              const vs = t.tipo === 'video' ? videoStats(t.id, t.done) : null
                              // Solo las pruebas/formularios ya completados tienen respuestas que abrir.
                              const verResp = t.done && CON_RESPUESTAS.includes(t.tipo)
                              return (
                                <div key={t.id}>
                                  {/* Conector entre nodos */}
                                  {ti > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                      <div style={{ width: 2, height: 14, background: 'var(--border-dark)', borderRadius: 1 }} />
                                    </div>
                                  )}
                                  <div className="jb-duo-node-wrap" style={{ '--x-off': `${OFFSETS[ti % OFFSETS.length]}px`, margin: '6px 0' }}>
                                    <button
                                      className={`jb-duo-node ${t.done ? 'done' : 'det-pend'}`}
                                      onClick={() => abrirTarea(t)}
                                      title={`${t.name} — ver ${verResp ? 'respuestas' : 'contenido'}`}
                                    >
                                      <div className="jb-duo-circle">
                                        <TIcon size={18} />
                                      </div>
                                      {t.done && (
                                        <span className="det-node-check"><Check size={10} /></span>
                                      )}
                                    </button>
                                    <button className="det-node-labelbtn" onClick={() => abrirTarea(t)}>
                                      <span className={`jb-duo-label ${t.done ? 'done' : 'locked'}`}>{t.name}</span>
                                      <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', marginTop: 1 }}>{tipo.label}</span>
                                    </button>

                                    {/* Cuántas veces vio el video: dato de estado, no un botón —el
                                        detalle se abre tocando el nodo. */}
                                    {vs && (
                                      <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 8.5, fontWeight: 700,
                                        padding: '2px 7px', borderRadius: 20, marginTop: 4,
                                        background: vs.veces > 0 ? 'var(--yellow-bg)' : 'var(--surface-hover)',
                                        color: vs.veces > 0 ? 'var(--yellow)' : 'var(--text-muted)',
                                      }}>
                                        <PlayCircle size={8} />
                                        {vs.veces === 0 ? 'No visto' : `${vs.veces}×${vs.completo ? ' · completo' : ' · incompleto'}`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Separador entre etapas: el mismo del camino del colaborador. */}
                  {i < etapas.length - 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                      <div style={{ width: 2, height: 22, background: 'var(--border-dark)', borderRadius: 1 }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* FICHA Y ACCIONES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {enAlerta && (
            <div className="sec-card" style={{ borderColor: 'var(--red)' }}>
              <div className="sc-body" style={{ display: 'flex', gap: 10 }}>
                <AlertTriangle size={16} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)' }}>
                    {a.status === 'atrasado' ? 'Tiene tareas vencidas' : 'Lleva +3 días sin actividad'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 3 }}>
                    Va por el {a.pct}% en el día {a.dia} de {a.totalDias}. Un recordatorio o un mensaje del buddy suele destrabar el proceso.
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="sec-card">
            <div className="sc-hd"><h3>Ficha</h3></div>
            <div className="sc-body" style={{ paddingTop: 4, paddingBottom: 6 }}>
              <Dato label="Ruta">{a.ruta}</Dato>
              <Dato label="Tipo">{ruta?.tipo || 'Onboarding'}</Dato>
              {a.version != null && <Dato label="Versión">v{a.version}</Dato>}
              <Dato label="Área">{a.area}</Dato>
              {a.cargo && <Dato label="Cargo">{a.cargo}</Dato>}
              <Dato label="Inicio">{a.fechaInicio}</Dato>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '9px 0' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Buddy</span>
                {a.buddy ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: a.buddy.color || '#8b5cf6', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8.5, fontWeight: 700,
                    }}>{a.buddy.initials}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-heading)' }}>{a.buddy.name}</span>
                  </span>
                ) : (
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Sin asignar</span>
                )}
              </div>
            </div>
          </div>

          {/* Todo lo que se puede hacer con esta persona, acá. Desasignar vivía solo en la
              lista, y eso obligaba a volver atrás y buscarla de nuevo justo cuando la ficha
              es donde se ve el motivo para hacerlo. */}
          <div className="sec-card">
            <div className="sc-hd"><h3>Acciones</h3></div>
            <div className="sc-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* "Enviar recordatorio" no se repite acá: cuando aplica ya está arriba, junto
                  al nombre, que es donde se mira al abrir la ficha. */}
              <button className="det-accion" onClick={() => setBuddyModal(true)}>
                <UserCheck size={13} /> {a.buddy ? 'Cambiar buddy' : 'Asignar buddy'}
              </button>
              <button className="det-accion" onClick={() => setPausarConfirm(true)}>
                {a.status === 'pausado' ? <Play size={13} /> : <Pause size={13} />}
                {a.status === 'pausado' ? 'Reanudar onboarding' : 'Pausar onboarding'}
              </button>
              {/* Separada del resto y en rojo: es la única de las tres que no se deshace.
                  Pausar y cambiar de buddy se revierten en un clic; esto borra el proceso. */}
              <button className="det-accion det-accion-riesgo" onClick={() => setDesasignarConfirm(true)}>
                <UserMinus size={13} /> Desasignar ruta de onboarding
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 8 }} />

      {verRespuestas && (
        <RespuestasTareaModal tarea={verRespuestas} asignacion={a} onClose={() => setVerRespuestas(null)} />
      )}

      {/* Contenido de la tarea tal como lo ve el colaborador (solo lectura, sin "Editar"). */}
      {verTarea && (
        <TaskPreviewModal task={verTarea} onClose={() => setVerTarea(null)} />
      )}

      {buddyModal && (
        <AsignarBuddyModal colaborador={a} onClose={() => setBuddyModal(false)} onConfirm={asignarBuddy} />
      )}

      {/* Pide escribir "desasignar": el progreso no se recupera, y es la misma confirmación
          que ya usa la lista para que la acción se sienta igual desde donde se dispare. */}
      {desasignarConfirm && (
        <ConfirmarAccionModal
          titulo="Desasignar ruta"
          descripcion={<>¿Desasignar a <strong>{a.nombre}</strong> de <strong>{a.ruta}</strong>? Se perderá el progreso actual.</>}
          palabra="desasignar"
          textoConfirmar="Desasignar"
          onConfirmar={desasignar}
          onCancelar={() => setDesasignarConfirm(false)}
          icono={AlertTriangle}
        />
      )}

      {pausarConfirm && (
        <PausarOnboardingModal
          asignacion={a}
          onClose={() => setPausarConfirm(false)}
          onConfirm={() => {
            actualizar({ status: a.status === 'pausado' ? 'en-curso' : 'pausado' })
            setPausarConfirm(false)
          }}
        />
      )}

      {recordatorio && (
        <EnviarRecordatorioModal
          asignacion={a}
          onClose={() => setRecordatorio(false)}
          onEnviar={canal => addFeedEntry(`Recordatorio enviado a ${a.nombre} por ${canal === 'whatsapp' ? 'WhatsApp' : 'la plataforma'}`)}
        />
      )}
    </div>
  )
}
