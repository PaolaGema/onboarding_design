import { Check, Layers, ShieldOff, Calendar, UserCheck } from 'lucide-react'
import { useConfig } from '../../context/ConfigContext'
import { infoTipo } from '../../utils/tareaTipos'
import BarraVolver from './BarraVolver'

/* El recorrido de una persona en el teléfono, de solo lectura: el mismo camino de nodos que
   ve el colaborador en su onboarding y Recursos Humanos en la ficha de la asignación. Vive
   acá y no dentro de una pantalla porque lo miran el buddy y el líder, y una lista de etapas
   en un lado y un camino en el otro serían dos rutas distintas para la misma persona.

   Quien mira no actúa: los nodos abren la tarea para saber de qué se trata, nada más. */

/* Zigzag del camino. Los valores son la mitad que en escritorio porque el nodo del teléfono
   mide 40 px y la etiqueta 74: con el desplazamiento de la ficha de RH, los nombres se
   cortarían contra el borde de la pantalla. */
const OFFSETS = [0, 24, 34, 24, 0, -24, -34, -24]

// Tipos cuyo contenido responde el colaborador: lo que contestó no se muestra acá.
const CON_RESPUESTAS = ['quiz', 'completar-perfil', 'form-custom', 'pulso', 'perfil']

function Dato({ Icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 7, color: '#64748b' }}>
      <Icon size={9} style={{ color: '#94a3b8', flexShrink: 0 }} />
      {children}
    </div>
  )
}

/* Sub-pantalla de una tarea. Responde "de qué se trata", que es lo que necesita quien
   acompaña para poder ayudar: qué hay que hacer, cuándo y quién la hace. El contenido en sí
   —las preguntas de una prueba, los campos de un formulario— no se abre: es material del
   colaborador, y mostrarlo acá convertiría el acompañamiento en supervisión. */
export function TareaPhone({ tarea, nombre, volverA = 'Su recorrido', onVolver }) {
  const { gamificacion } = useConfig()
  const tipo = infoTipo(tarea.tipo)
  const TIcon = tipo.icon
  const pasos = (tarea.checklist || []).filter(i => i.text?.trim())
  const paradas = (tarea.paradas || []).map(p => p.lugar).filter(Boolean)
  const preguntas = tarea.quizPreguntas?.length || tarea.formCampos?.length || 0

  return (
    <div style={{ padding: '2px 2px' }}>
      <BarraVolver texto={volverA} onVolver={onVolver} />

      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 9,
        background: '#fff', border: '1px solid #e8ecf0', borderRadius: 11,
        boxShadow: '0 4px 14px rgba(12,45,64,.07)', padding: 11, marginBottom: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9, flexShrink: 0,
          background: `${tipo.color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TIcon size={15} style={{ color: tipo.color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: '#0C2D40', lineHeight: 1.3 }}>{tarea.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <span style={{ fontSize: 7, fontWeight: 700, color: tipo.color }}>{tipo.label}</span>
            {gamificacion && tarea.puntos > 0 && (
              <span style={{ fontSize: 7, fontWeight: 800, color: '#16a34a' }}>+{tarea.puntos} pts</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, marginBottom: 10 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 7, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
          background: tarea.done ? '#f0fdf4' : '#f1f5f9',
          color: tarea.done ? '#16a34a' : '#64748b',
        }}>
          {tarea.done && <Check size={8} strokeWidth={3} />}
          {tarea.done ? 'Completada' : 'Pendiente'}
        </span>
        {tarea.obligatoria && (
          <span style={{
            fontSize: 6.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
            background: '#fef3c7', color: '#b45309', textTransform: 'uppercase',
          }}>
            Obligatoria
          </span>
        )}
      </div>

      {tarea.desc && (
        <div style={{
          background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10,
          padding: '9px 10px', marginBottom: 8,
          fontSize: 7.5, color: '#475569', lineHeight: 1.55,
        }}>
          {tarea.desc}
        </div>
      )}

      <div style={{
        background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10,
        padding: '9px 10px', marginBottom: 8,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {tarea.fechaRel && <Dato Icon={Calendar}>{tarea.fechaRel} de la ruta</Dato>}
        {tarea.responsable && (
          <Dato Icon={UserCheck}>
            La hace <strong style={{ color: '#334155' }}>
              {Array.isArray(tarea.responsable) ? tarea.responsable.join(', ') : tarea.responsable}
            </strong>
          </Dato>
        )}
      </div>

      {/* Los pasos de una tarea supervisada y las paradas de un recorrido sí se muestran: no
          son respuestas de nadie, son en qué consiste la tarea. */}
      {(pasos.length > 0 || paradas.length > 0) && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 7.5, fontWeight: 700, color: '#0C2D40', marginBottom: 5 }}>
            {pasos.length > 0 ? 'Qué incluye' : 'Paradas del recorrido'}
          </div>
          {(pasos.length > 0 ? pasos.map(p => p.text) : paradas).map((texto, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: '#fff', border: '1px solid #e8ecf0', borderRadius: 8,
              padding: '7px 9px', marginBottom: 5,
              fontSize: 7.5, color: '#475569',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 3, border: '1.5px solid #cbd5e1', flexShrink: 0 }} />
              {texto}
            </div>
          ))}
        </div>
      )}

      {CON_RESPUESTAS.includes(tarea.tipo) && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 7,
          background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10,
          padding: '9px 10px',
        }}>
          <ShieldOff size={11} style={{ color: '#94a3b8', flexShrink: 0, marginTop: 1 }} />
          {/* En presente y no en pasado: la tarea puede estar pendiente, y "lo que respondió"
              daría por hecho que ya la contestó. */}
          <span style={{ fontSize: 6.5, color: '#94a3b8', lineHeight: 1.5 }}>
            {preguntas > 0 && `${preguntas} ${preguntas === 1 ? 'pregunta' : 'preguntas'}. `}
            Las respuestas {nombre ? `de ${nombre}` : 'del colaborador'} las ve solo Recursos Humanos.
          </span>
        </div>
      )}
    </div>
  )
}

/* El camino: cabecera de etapa, divisor de actividad y un nodo por tarea. Verde relleno es
   una tarea hecha; el círculo hueco, una pendiente. */
export default function RecorridoPhone({ etapas, onVerTarea }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
        {[
          { t: 'Completada', bg: '#00E091', bd: 'none' },
          { t: 'Pendiente', bg: '#fff', bd: '1.5px solid #cbd5e1' },
        ].map(l => (
          <span key={l.t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 6.5, fontWeight: 600, color: '#94a3b8' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.bg, border: l.bd }} />
            {l.t}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 6.5, color: '#cbd5e1' }}>Toca una tarea</span>
      </div>

      <div className="det-path-phone" style={{
        borderRadius: 12, overflow: 'hidden',
        background: 'linear-gradient(180deg, #f0f4f8 0%, #e8eef4 100%)',
        padding: '11px 4px 4px',
      }}>
        {etapas.map((e, i) => {
          const completa = e.tareas.length > 0 && e.doneLocal === e.tareas.length
          /* El zigzag corre a lo largo de toda la etapa y no se reinicia en cada actividad:
             si no, con dos o tres tareas por actividad el camino solo dobla hacia un lado. */
          const offsetDe = new Map(e.tareas.map((t, k) => [t.id, OFFSETS[k % OFFSETS.length]]))
          return (
            <div key={i}>
              {/* Cabecera de etapa: la misma píldora centrada de la ficha de RH, a escala. */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, maxWidth: '100%',
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20,
                  boxShadow: '0 1px 4px rgba(12,45,64,.06)', padding: '4px 9px',
                }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                    background: completa ? '#00E091' : '#0C2D40', color: '#fff',
                    fontSize: 7, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {completa ? <Check size={8} strokeWidth={3} /> : i + 1}
                  </span>
                  <span style={{ fontSize: 8, fontWeight: 700, color: '#0C2D40', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</span>
                  {e.days && <span style={{ fontSize: 6.5, fontWeight: 600, color: '#94a3b8', whiteSpace: 'nowrap' }}>{e.days}</span>}
                  <span style={{
                    flexShrink: 0, fontSize: 6.5, fontWeight: 700, padding: '1px 6px', borderRadius: 20,
                    background: completa ? '#f0fdf4' : '#f1f5f9',
                    color: completa ? '#16a34a' : '#64748b',
                  }}>
                    {e.doneLocal}/{e.tareas.length}
                  </span>
                </div>
              </div>

              <div className="jb-duo-path" style={{ padding: '6px 0 2px' }}>
                {e.actividades.map((act, ai) => (
                  <div key={ai} style={{ width: '100%' }}>
                    {/* Actividad: el nivel intermedio entre la etapa y las tareas. */}
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '9px 0 6px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: 'rgba(12,45,64,.05)', border: '1px solid rgba(12,45,64,.08)',
                        borderRadius: 7, padding: '2px 8px',
                        fontSize: 6.5, fontWeight: 700, color: '#475569',
                      }}>
                        <Layers size={8} style={{ color: '#64748b' }} />
                        {act.name || `Actividad ${ai + 1}`}
                        <span style={{ background: '#fff', borderRadius: 20, padding: '0 4px', fontSize: 6, color: '#94a3b8' }}>
                          {act.tareas.filter(t => t.done).length}/{act.tareas.length}
                        </span>
                      </span>
                    </div>

                    {act.tareas.map((t, ti) => {
                      const tipo = infoTipo(t.tipo)
                      const TIcon = tipo.icon
                      return (
                        <div key={t.id}>
                          {ti > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <div style={{ width: 2, height: 9, background: '#cbd5e1', borderRadius: 1 }} />
                            </div>
                          )}
                          <div className="jb-duo-node-wrap" style={{ '--x-off': `${offsetDe.get(t.id)}px` }}>
                            {/* El nodo y su nombre abren lo mismo: apuntarle a un círculo de
                                40 px con el pulgar es de los blancos que más se fallan. */}
                            <button
                              className={`jb-duo-node ${t.done ? 'done' : 'det-pend'}`}
                              onClick={() => onVerTarea(t)}
                              title={t.name}
                            >
                              <div className="jb-duo-circle">
                                <TIcon size={14} />
                              </div>
                              {t.done && <span className="det-node-check"><Check size={7} strokeWidth={3} /></span>}
                            </button>
                            <button className="det-node-labelbtn" onClick={() => onVerTarea(t)}>
                              <span className={`jb-duo-label ${t.done ? 'done' : 'locked'}`}>{t.name}</span>
                              <span style={{ fontSize: 6, fontWeight: 600, color: '#94a3b8', marginTop: 1 }}>{tipo.label}</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Separador entre etapas: el mismo del camino del colaborador. */}
              {i < etapas.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '5px 0 9px' }}>
                  <div style={{ width: 2, height: 14, background: '#cbd5e1', borderRadius: 1 }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
