import { useState } from 'react'
import { AlertTriangle, ShieldOff, Check, ChevronDown, HeartHandshake } from 'lucide-react'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { buildDetalleEtapas } from '../../utils/detalleEtapas'
import { colaboradoresData, ESTADOS_ONBOARDING } from '../../pages/personas/colaboradoresData'
import { tareasBuddyDe } from '../../data/tareasBuddy'
import AvatarPhone from './AvatarPhone'
import BarraVolver from './BarraVolver'

/* Orden por urgencia, no alfabético: en el celular solo se leen las primeras filas, así que
   arriba va quien está atascado y al fondo quien ya se graduó. Mismo criterio que
   SeguimientoPhone, con el vocabulario de estados del directorio. */
const URGENCIA = { 'en-riesgo': 0, 'sin-iniciar': 1, 'en-curso': 2, 'graduado': 3 }

/* Tope declarado: un buddy puede acompañar a muchas personas y la lista no puede crecer sin
   fin. Lo que se corta se dice, no se esconde. */
const TOPE = 6

/* Píldora con los colores del directorio (`ESTADOS_ONBOARDING`), que es la fuente que usa
   "Mis acompañados" en escritorio: si acá se inventaran tonos, el mismo estado se vería de
   dos colores según el dispositivo. */
function Badge({ onb }) {
  const estado = ESTADOS_ONBOARDING[onb]
  if (!estado) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: estado.bg, color: estado.color,
      fontSize: 7, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
    }}>
      {onb === 'en-riesgo' && <AlertTriangle size={7} />}
      {estado.label}
    </span>
  )
}

/* Nota de privacidad. Va en la lista y en el detalle porque es la regla que define el rol:
   el buddy acompaña, no supervisa, y en el celular cada pantalla se lee sola. */
function NotaPrivacidad({ nombre }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 7,
      background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10,
      padding: '9px 10px', marginTop: 10,
    }}>
      <ShieldOff size={11} style={{ color: '#94a3b8', flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 6.5, color: '#94a3b8', lineHeight: 1.5 }}>
        Ves el avance general y las tareas en las que participas. Las respuestas, las
        evaluaciones y los datos personales {nombre ? `de ${nombre}` : 'de cada colaborador'} siguen
        siendo visibles solo para Recursos Humanos.
      </span>
    </div>
  )
}

/* Misma anatomía que `ColaboradorCard` en escritorio: identidad, avance y el botón al pie.
   La diferencia con la card del líder es el pie: al buddy no le importa el día del calendario
   sino cuántas tareas suyas quedan, que es lo único sobre lo que puede actuar. */
function Card({ c, onVerDetalles }) {
  const estado = ESTADOS_ONBOARDING[c.onb]
  const mias = tareasBuddyDe(c.id)
  const hechas = mias.filter(t => t.done).length
  const pend = mias.length - hechas

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 9,
      background: '#fff', border: '1px solid #e8ecf0', borderRadius: 11,
      boxShadow: '0 4px 14px rgba(12,45,64,.07)',
      padding: 11, marginBottom: 9,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
        <AvatarPhone nombre={c.name} color={c.color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#0C2D40', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
          <div style={{ fontSize: 8, fontWeight: 500, color: '#94a3b8', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.cargo}</div>
          <div style={{ fontSize: 7, fontWeight: 600, color: '#94a3b8', opacity: .75, lineHeight: 1.35 }}>{c.depto}</div>
          <div style={{ marginTop: 5 }}><Badge onb={c.onb} /></div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
          <span style={{ fontSize: 8, color: '#94a3b8' }}>Avance de su onboarding</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#0C2D40' }}>{c.onbPct}%</span>
        </div>
        <div style={{ height: 5, background: '#edf2f7', borderRadius: 100, overflow: 'hidden' }}>
          <div style={{ width: `${c.onbPct}%`, height: '100%', background: estado.color, borderRadius: 100 }} />
        </div>
      </div>

      <div style={{ borderTop: '1px solid #eef2f6', paddingTop: 9, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 7.5, color: '#94a3b8' }}>
          Mis tareas: <strong style={{ color: '#334155' }}>{hechas}/{mias.length}</strong>
          {pend > 0 && <span style={{ color: '#b45309', fontWeight: 700 }}> · {pend} pendiente{pend > 1 ? 's' : ''}</span>}
        </span>
        <button
          onClick={() => onVerDetalles(c)}
          style={{
            width: '100%', padding: '8px 0', borderRadius: 7, border: 'none',
            background: '#0C2D40', color: '#fff', cursor: 'pointer',
            fontSize: 8.5, fontWeight: 700, fontFamily: 'inherit',
          }}
        >
          Ver detalles
        </button>
      </div>
    </div>
  )
}

/* El detalle abre con las tareas del buddy y no con la ruta del colaborador: en escritorio
   la ruta ocupa el centro porque hay lugar para mirar el panorama, pero en el celular se
   entra a hacer algo. El recorrido queda debajo, de solo lectura, para entender el contexto. */
function Detalle({ c, plantillas, onVolver }) {
  const estado = ESTADOS_ONBOARDING[c.onb]
  const etapas = buildDetalleEtapas({ pct: c.onbPct }, plantillas)

  /* El check vive en la pantalla porque el prototipo todavía no persiste tareas. En producción
     esto no es un estado local: es la misma tarea de la ruta con `responsable: 'Buddy'`, y
     marcarla mueve el avance que ve Recursos Humanos. */
  const [tareas, setTareas] = useState(() => tareasBuddyDe(c.id))
  const alternar = id => setTareas(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const pend = tareas.filter(t => !t.done).length
  const nombre = c.name.split(' ')[0]

  return (
    <div style={{ padding: '2px 2px' }}>
      <BarraVolver texto="Mis acompañados" onVolver={onVolver} />

      <div style={{ background: '#0C2D40', borderRadius: 12, padding: '12px 13px', marginBottom: 11 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <AvatarPhone nombre={c.name} color={c.color} size={32} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{c.name}</div>
            <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,.6)', marginTop: 1 }}>{c.cargo} — {c.depto}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <span style={{ flex: 1, height: 5, background: 'rgba(255,255,255,.15)', borderRadius: 100, overflow: 'hidden' }}>
            <span style={{ display: 'block', width: `${c.onbPct}%`, height: '100%', background: estado.color, borderRadius: 100 }} />
          </span>
          <span style={{ fontSize: 9, fontWeight: 800, color: '#fff' }}>{c.onbPct}%</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Badge onb={c.onb} />
        <span style={{ fontSize: 7.5, color: '#94a3b8' }}>Ingresó {c.ingreso}</span>
      </div>

      {/* El aviso es el mismo de escritorio: nombra el motivo y propone la acción del buddy. */}
      {c.onb === 'en-riesgo' && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 7,
          background: '#fef2f2', borderRadius: 10, padding: '9px 10px', marginBottom: 11,
        }}>
          <AlertTriangle size={11} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 7, color: '#dc2626', fontWeight: 600, lineHeight: 1.45 }}>
            Lleva más de 3 días sin actividad. Un mensaje tuyo puede desatascar el proceso.
          </span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#0C2D40' }}>Mis tareas con {nombre}</span>
        <span style={{ fontSize: 7, color: pend > 0 ? '#b45309' : '#16a34a', fontWeight: 700 }}>
          {pend > 0 ? `${pend} pendiente${pend > 1 ? 's' : ''}` : 'Todas hechas'}
        </span>
      </div>

      {tareas.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 10,
          padding: '14px 12px', textAlign: 'center', fontSize: 6.5, color: '#94a3b8', marginBottom: 12,
        }}>
          La ruta de {nombre} no tiene tareas asignadas al buddy.
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          {tareas.map(t => (
            <button
              key={t.id}
              onClick={() => alternar(t.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10,
                boxShadow: '0 2px 8px rgba(12,45,64,.05)',
                padding: '10px 11px', marginBottom: 7, cursor: 'pointer',
                fontFamily: 'inherit', textAlign: 'left',
              }}
            >
              <span style={{
                width: 16, height: 16, borderRadius: 5, flexShrink: 0,
                background: t.done ? '#00E091' : '#fff',
                border: t.done ? 'none' : '1.5px solid #cbd5e1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {t.done && <Check size={10} style={{ color: '#0C2D40' }} strokeWidth={3} />}
              </span>
              <span style={{
                flex: 1, fontSize: 8.5, fontWeight: 600, lineHeight: 1.35,
                color: t.done ? '#94a3b8' : '#0C2D40',
                textDecoration: t.done ? 'line-through' : 'none',
              }}>
                {t.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Solo lectura: sirve para ubicar dónde está atascado, no para intervenir su ruta. */}
      <div style={{ fontSize: 9, fontWeight: 700, color: '#0C2D40', marginBottom: 8 }}>
        Su recorrido <span style={{ fontWeight: 500, fontSize: 7, color: '#94a3b8' }}>· solo lectura</span>
      </div>
      {etapas.map((e, i) => {
        const completa = e.tareas.length > 0 && e.doneLocal === e.tareas.length
        return (
          <div key={i} style={{
            background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10,
            boxShadow: '0 2px 8px rgba(12,45,64,.05)',
            padding: '10px 11px', marginBottom: 7,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 19, height: 19, borderRadius: '50%', flexShrink: 0,
                background: completa ? '#00E091' : '#f1f5f9',
                color: completa ? '#0C2D40' : '#64748b',
                fontSize: 8, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {completa ? <Check size={10} /> : i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 8.5, fontWeight: 700, color: '#0C2D40', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                {e.days && <div style={{ fontSize: 6.5, color: '#94a3b8' }}>{e.days}</div>}
              </div>
              <span style={{
                flexShrink: 0, fontSize: 7.5, fontWeight: 700,
                background: completa ? '#f0fdf4' : '#f1f5f9',
                color: completa ? '#16a34a' : '#64748b',
                padding: '2px 8px', borderRadius: 20,
              }}>
                {e.doneLocal}/{e.tareas.length}
              </span>
            </div>
          </div>
        )
      })}

      <NotaPrivacidad nombre={nombre} />
    </div>
  )
}

export default function AcompanadosPhone({ currentUser, onVolver }) {
  const { plantillas } = useOnboardingData()
  const [detalle, setDetalle] = useState(null)
  const [todos, setTodos] = useState(false)

  /* La relación vive en el colaborador acompañado, igual que en escritorio: no hay una lista
     de "los acompañados de Diego", hay personas cuyo buddy es Diego. */
  const acompanados = colaboradoresData
    .filter(c => c.buddy?.name === currentUser.name)
    .sort((x, y) => (URGENCIA[x.onb] ?? 9) - (URGENCIA[y.onb] ?? 9) || x.onbPct - y.onbPct)

  if (detalle) {
    return <Detalle c={detalle} plantillas={plantillas} onVolver={() => setDetalle(null)} />
  }

  const pendientes = acompanados.reduce((s, c) => s + tareasBuddyDe(c.id).filter(t => !t.done).length, 0)
  const enRiesgo = acompanados.filter(c => c.onb === 'en-riesgo').length

  const visibles = todos ? acompanados : acompanados.slice(0, TOPE)
  const ocultos = acompanados.length - visibles.length

  return (
    <div style={{ padding: '2px 2px' }}>
      {onVolver && <BarraVolver texto="Onboarding" onVolver={onVolver} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#0C2D40' }}>Mis acompañados</div>
          <div style={{ fontSize: 6.5, color: '#94a3b8', marginTop: 1 }}>Onboardings que acompañas como buddy</div>
        </div>
        <AvatarPhone nombre={currentUser.name} color={currentUser.color} size={22} />
      </div>

      {acompanados.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 10,
          padding: '22px 14px', textAlign: 'center',
        }}>
          <HeartHandshake size={18} style={{ color: '#cbd5e1', margin: '0 auto 7px' }} />
          <div style={{ fontSize: 8, fontWeight: 700, color: '#0C2D40' }}>Todavía no acompañas a nadie</div>
          <div style={{ fontSize: 6.5, color: '#94a3b8', marginTop: 4, lineHeight: 1.5 }}>
            Cuando Recursos Humanos te asigne como buddy de alguien, esa persona aparecerá acá.
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {[
              { n: acompanados.length, t: 'acompañados', c: '#0C2D40' },
              { n: pendientes, t: 'tareas mías pendientes', c: '#b45309' },
              { n: enRiesgo, t: 'en riesgo', c: '#dc2626' },
            ].map(k => (
              <div key={k.t} style={{
                flex: 1, background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10,
                boxShadow: '0 2px 8px rgba(12,45,64,.05)',
                padding: '9px 4px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: k.c, lineHeight: 1.1 }}>{k.n}</div>
                <div style={{ fontSize: 6.5, color: '#94a3b8', marginTop: 2, lineHeight: 1.25 }}>{k.t}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 9, fontWeight: 700, color: '#0C2D40', marginBottom: 8 }}>
            Tu gente <span style={{ fontWeight: 500, color: '#94a3b8' }}>· por urgencia</span>
          </div>

          {visibles.map(c => <Card key={c.id} c={c} onVerDetalles={setDetalle} />)}

          {ocultos > 0 && (
            <div
              onClick={() => setTodos(true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                background: '#fff', border: '1px solid #e8ecf0', borderRadius: 9,
                padding: '8px 0', cursor: 'pointer',
                fontSize: 8.5, fontWeight: 700, color: '#0C2D40',
              }}
            >
              Ver {ocultos} acompañado{ocultos > 1 ? 's' : ''} más
              <ChevronDown size={9} />
            </div>
          )}

          <NotaPrivacidad />
        </>
      )}
    </div>
  )
}
