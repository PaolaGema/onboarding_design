import { X, Check, Info, Award, HelpCircle, ClipboardList, RotateCcw } from 'lucide-react'

/* Lo que respondió el colaborador en una Prueba o un Formulario.

   PROTOTIPO — hoy las respuestas reales no se guardan: viven en el estado local de la vista
   del colaborador (MiOnboarding) y se pierden al salir. Hasta que se persistan en la
   asignación, esta pantalla las simula de forma DETERMINISTA (misma persona + misma tarea →
   mismas respuestas) para que Recursos Humanos pueda validar cómo se verá el panel. Si la
   tarea trae preguntas propias (quizPreguntas/formCampos, creadas en el builder) se usan
   esas; si no, un banco genérico. */
const QUIZ_BANCO = [
  { q: '¿Cuál es uno de los valores centrales de la empresa?', opts: ['Transparencia', 'Individualismo', 'Jerarquía estricta'], correcta: 0 },
  { q: '¿A quién acudes ante una duda sobre tu rol?', opts: ['A un cliente', 'A tu buddy o líder', 'A nadie'], correcta: 1 },
  { q: '¿Dónde encuentras el manual de tu cargo?', opts: ['En Recursos corporativos', 'En redes sociales', 'No existe'], correcta: 0 },
  { q: '¿Qué debes completar en tu primera semana?', opts: ['La evaluación final', 'Tu perfil y la bienvenida', 'Un reporte anual'], correcta: 1 },
  { q: '¿Cada cuánto es el check-in con tu líder?', opts: ['Nunca', 'Solo el primer día', 'De forma quincenal'], correcta: 2 },
]

const FORM_BANCO = [
  { q: '¿Cómo te has sentido en tu primera semana?', a: ['Muy acompañado/a, el equipo fue muy abierto.', 'Bien en general, con algunas dudas al inicio.', 'Algo perdido/a los primeros días, luego mejor.'] },
  { q: '¿Qué tema te gustaría reforzar?', a: ['Las herramientas internas del área.', 'El proceso de aprobación de contenido.', 'Conocer mejor a las otras áreas.'] },
  { q: '¿Tuviste todo lo necesario para empezar (accesos, equipo)?', a: ['Sí, todo listo desde el día uno.', 'Casi todo; faltó un acceso que ya se resolvió.', 'Tardaron algunos accesos la primera semana.'] },
  { q: 'Un comentario para tu líder', a: ['Gracias por el acompañamiento.', 'Me gustaría un poco más de feedback semanal.', 'Todo claro por ahora, ¡con muchas ganas!'] },
]

function respuestasSimuladas(asignacion, tarea) {
  const seed = String(asignacion.id).split('').reduce((s, c) => s + c.charCodeAt(0), 0)
             + String(tarea.id).split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  // Falla ~1 de cada 4 preguntas calificables, para que el acierto no sea siempre perfecto.
  const fallaEn = i => (seed + i) % 4 === 0

  if (tarea.tipo === 'quiz') {
    const reales = tarea.quizPreguntas?.length ? tarea.quizPreguntas : null
    if (reales) {
      return reales.map((p, i) => {
        if (p.tipo === 'abierta') {
          const banco = FORM_BANCO[(seed + i) % FORM_BANCO.length].a
          return { q: p.texto, resp: banco[(seed + i) % banco.length] }
        }
        const correctaIdx = Math.max(0, p.opciones.findIndex(o => o.correcta))
        const pickIdx = fallaEn(i) ? (correctaIdx + 1) % p.opciones.length : correctaIdx
        return { q: p.texto, resp: p.opciones[pickIdx]?.texto || '—', ok: pickIdx === correctaIdx }
      })
    }
    const n = 3 + (seed % 2) // 3 o 4 preguntas
    return Array.from({ length: n }, (_, i) => {
      const item = QUIZ_BANCO[(seed + i) % QUIZ_BANCO.length]
      const pickIdx = fallaEn(i) ? (item.correcta + 1) % item.opts.length : item.correcta
      return { q: item.q, resp: item.opts[pickIdx], ok: pickIdx === item.correcta }
    })
  }

  // Formulario (completar-perfil): sin respuesta correcta, solo texto/opción elegida.
  const reales = tarea.formCampos?.length ? tarea.formCampos : null
  if (reales) {
    return reales.map((c, i) => {
      if (c.opciones?.length) return { q: c.etiqueta, resp: c.opciones[(seed + i) % c.opciones.length]?.texto || '—' }
      const banco = FORM_BANCO[(seed + i) % FORM_BANCO.length].a
      return { q: c.etiqueta, resp: banco[(seed + i) % banco.length] }
    })
  }
  const n = 3 + (seed % 2)
  return Array.from({ length: n }, (_, i) => {
    const item = FORM_BANCO[(seed + i) % FORM_BANCO.length]
    return { q: item.q, resp: item.a[(seed + i) % item.a.length] }
  })
}

/* Intentos que le tomó aprobar la prueba. Mismo criterio determinista que el resto del
   prototipo (semilla estable por persona + tarea): quien falló alguna pregunta la primera
   vez tuvo más de un intento. Solo aplica a pruebas; un formulario no se "reintenta". */
function intentosDe(asignacion, tarea, hayFallas) {
  if (!hayFallas) return 1
  const seed = String(asignacion.id).split('').reduce((s, c) => s + c.charCodeAt(0), 0)
             + String(tarea.id).split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  return 2 + (seed % 2) // 2 o 3 intentos
}

export default function RespuestasTareaModal({ tarea, asignacion, onClose }) {
  const esQuiz = tarea.tipo === 'quiz'
  const items = respuestasSimuladas(asignacion, tarea)
  const calificables = items.filter(it => it.ok !== undefined)
  const aciertos = calificables.filter(it => it.ok).length
  const HeaderIcon = esQuiz ? HelpCircle : ClipboardList
  const perfecto = aciertos === calificables.length
  const intentos = esQuiz ? intentosDe(asignacion, tarea, !perfecto) : null

  return (
    <div className="pl-overlay" onClick={onClose}>
      <div className="pl-modal" style={{ maxWidth: 480, maxHeight: '82vh' }} onClick={e => e.stopPropagation()}>
        <div className="pl-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HeaderIcon size={16} style={{ color: '#fff' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tarea.name}</h2>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Respuestas de {asignacion.nombre}
              </div>
            </div>
          </div>
          <button className="pl-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="pl-modal-body" style={{ overflowY: 'auto', maxHeight: '62vh' }}>
          {/* Nota de prototipo: dejar claro que aún no son respuestas reales. */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', borderRadius: 10, background: 'var(--yellow-bg)', border: '1px solid var(--yellow)', marginBottom: 14 }}>
            <Info size={14} style={{ color: 'var(--yellow)', flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 11, color: 'var(--text-heading)', lineHeight: 1.45 }}>
              Vista previa: respuestas de ejemplo. Aún no se guarda lo que responde el colaborador.
            </span>
          </div>

          {esQuiz && calificables.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '6px 12px', borderRadius: 20,
                background: perfecto ? 'var(--green-bg)' : 'var(--red-bg)',
                border: `1px solid ${perfecto ? 'var(--green)' : 'var(--red)'}`,
              }}>
                <Award size={13} style={{ color: perfecto ? 'var(--green)' : 'var(--red)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: perfecto ? 'var(--green)' : 'var(--red)' }}>
                  {aciertos}/{calificables.length} correctas
                </span>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 20,
                background: 'var(--surface-hover)', border: '1px solid var(--border-soft)',
              }}>
                <RotateCcw size={12} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)' }}>
                  {intentos} {intentos === 1 ? 'intento' : 'intentos'}
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((it, i) => (
              <div key={i} style={{ background: 'var(--surface-hover)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-soft)' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 7 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-heading)', lineHeight: 1.35 }}>{it.q}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 28 }}>
                  {it.ok !== undefined && (
                    <span style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: it.ok ? 'var(--green)' : 'var(--red)',
                    }}>
                      {it.ok ? <Check size={11} style={{ color: '#fff' }} /> : <X size={11} style={{ color: '#fff' }} />}
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: it.ok === false ? 'var(--red)' : 'var(--text-heading)', lineHeight: 1.4 }}>
                    {it.resp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pl-modal-footer">
          <button className="pl-btn-cancel" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
