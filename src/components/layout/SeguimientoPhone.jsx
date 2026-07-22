import { useState } from 'react'
import {
  AlertTriangle, ChevronDown, ChevronUp, Check, Clock, Activity, PauseCircle, CheckCircle2,
} from 'lucide-react'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { buildDetalleEtapas } from '../../utils/detalleEtapas'
import AvatarPhone from './AvatarPhone'
import BarraVolver from './BarraVolver'

const ETIQUETA = {
  'atrasado': 'Atrasado',
  'en-riesgo': 'En riesgo',
  'pendiente': 'Programado',
  'en-curso': 'En curso',
  'completado': 'Completado',
  'pausado': 'Pausado',
}

const TONO = {
  'atrasado': { fondo: '#fef2f2', texto: '#dc2626' },
  'en-riesgo': { fondo: '#fef2f2', texto: '#dc2626' },
  'pendiente': { fondo: '#fefce8', texto: '#b45309' },
  'en-curso': { fondo: '#eff6ff', texto: '#2563eb' },
  'completado': { fondo: '#f0fdf4', texto: '#16a34a' },
  'pausado': { fondo: '#f1f5f9', texto: '#64748b' },
}

/* Orden por urgencia, no alfabético: en un celular solo se leen las primeras filas, así que
   arriba va lo que necesita acción hoy y al fondo lo que ya se resolvió. */
const URGENCIA = { 'atrasado': 0, 'en-riesgo': 1, 'pendiente': 2, 'en-curso': 3, 'pausado': 4, 'completado': 5 }

/* La lista se agrupa por MOTIVO y no se lista persona por persona: con un equipo grande,
   el líder necesita escanear cuatro encabezados y decidir dónde entrar, no recorrer treinta
   fichas iguales. El contador de cada grupo es la información que usa para decidir. */
const GRUPOS = [
  { key: 'atencion', label: 'Necesitan atención', estados: ['atrasado', 'en-riesgo'], color: '#dc2626', Icon: AlertTriangle },
  { key: 'comenzar', label: 'Por comenzar', estados: ['pendiente'], color: '#b45309', Icon: Clock },
  { key: 'curso', label: 'En curso', estados: ['en-curso'], color: '#2563eb', Icon: Activity },
  { key: 'pausado', label: 'Pausados', estados: ['pausado'], color: '#64748b', Icon: PauseCircle },
  { key: 'completado', label: 'Completados', estados: ['completado'], color: '#16a34a', Icon: CheckCircle2 },
]

// Tope por grupo y no sobre el total: si no, los urgentes se comen los lugares y el resto
// queda detrás de un único "ver más" que no dice de qué.
const POR_GRUPO = 5

function barraColor(status, pct) {
  if (status === 'completado') return '#00E091'
  if (status === 'atrasado' || status === 'en-riesgo') return '#ef4444'
  if (pct < 30) return '#f59e0b'
  return '#3b82f6'
}

/* Píldora, no rectángulo: es `as-status` de escritorio, que va con borde 20. */
function Badge({ status }) {
  const tono = TONO[status] || TONO['en-curso']
  const alerta = status === 'atrasado' || status === 'en-riesgo'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: tono.fondo, color: tono.texto,
      fontSize: 7, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
    }}>
      {alerta && <AlertTriangle size={7} />}
      {ETIQUETA[status] || status}
    </span>
  )
}

/* Misma anatomía que `ColaboradorCard` en escritorio: identidad, avance y el botón al pie.
   La card del teléfono mide casi lo mismo que la de escritorio, así que la tipografía va a
   tres cuartos y no a la mitad: achicarla más deja el texto flotando en la caja. */
function Card({ a, onVerDetalles }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 9,
      background: '#fff', border: '1px solid #e8ecf0', borderRadius: 11,
      boxShadow: '0 4px 14px rgba(12,45,64,.07)',
      padding: 11, marginBottom: 9,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
        <AvatarPhone nombre={a.nombre} color={a.color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#0C2D40', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.nombre}</div>
          <div style={{ fontSize: 8, fontWeight: 500, color: '#94a3b8', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.cargo}</div>
          <div style={{ fontSize: 7, fontWeight: 600, color: '#94a3b8', opacity: .75, lineHeight: 1.35 }}>{a.area}</div>
          <div style={{ marginTop: 5 }}><Badge status={a.status} /></div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
          <span style={{ fontSize: 8, color: '#94a3b8' }}>Avance de su onboarding</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#0C2D40' }}>{a.pct}%</span>
        </div>
        <div style={{ height: 5, background: '#edf2f7', borderRadius: 100, overflow: 'hidden' }}>
          <div style={{ width: `${a.pct}%`, height: '100%', background: barraColor(a.status, a.pct), borderRadius: 100 }} />
        </div>
      </div>

      <div style={{ borderTop: '1px solid #eef2f6', paddingTop: 9, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 7.5, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {a.ruta} · Día {a.dia}/{a.totalDias}
        </span>
        <button
          onClick={() => onVerDetalles(a)}
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

function Detalle({ a, plantillas, onVolver }) {
  const etapas = buildDetalleEtapas(a, plantillas)

  return (
    <div style={{ padding: '2px 2px' }}>
      <BarraVolver texto="Seguimiento" onVolver={onVolver} />

      <div style={{ background: '#0C2D40', borderRadius: 12, padding: '12px 13px', marginBottom: 11 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <AvatarPhone nombre={a.nombre} color={a.color} size={32} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{a.nombre}</div>
            <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,.6)', marginTop: 1 }}>{a.ruta} — {a.area}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <span style={{ flex: 1, height: 5, background: 'rgba(255,255,255,.15)', borderRadius: 100, overflow: 'hidden' }}>
            <span style={{ display: 'block', width: `${a.pct}%`, height: '100%', background: barraColor(a.status, a.pct), borderRadius: 100 }} />
          </span>
          <span style={{ fontSize: 9, fontWeight: 800, color: '#fff' }}>{a.pct}%</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Badge status={a.status} />
        <span style={{ fontSize: 7.5, color: '#94a3b8' }}>Día {a.dia} / {a.totalDias}</span>
        <span style={{ fontSize: 7.5, color: '#94a3b8' }}>· Inicio {a.fechaInicio}</span>
        {a.buddy && (
          <span style={{ fontSize: 7.5, color: '#94a3b8' }}>
            · Buddy: <strong style={{ color: '#334155' }}>{a.buddy.name}</strong>
          </span>
        )}
      </div>

      <div style={{ fontSize: 9, fontWeight: 700, color: '#0C2D40', marginBottom: 8 }}>Su recorrido</div>
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
    </div>
  )
}

export default function SeguimientoPhone({ currentUser, onVolver }) {
  const { asignaciones, plantillas } = useOnboardingData()
  const [abiertos, setAbiertos] = useState({})
  const [expandidos, setExpandidos] = useState({})
  const [detalle, setDetalle] = useState(null)

  const area = currentUser.area
  const mios = asignaciones
    .filter(a => a.area === area)
    .sort((x, y) => (URGENCIA[x.status] ?? 9) - (URGENCIA[y.status] ?? 9) || x.pct - y.pct)

  if (detalle) {
    return <Detalle a={detalle} plantillas={plantillas} onVolver={() => setDetalle(null)} />
  }

  const enAlerta = mios.filter(a => a.status === 'atrasado' || a.status === 'en-riesgo').length
  const completados = mios.filter(a => a.status === 'completado').length

  // Los grupos vacíos no se dibujan: el contador de arriba ya dice que están en cero.
  const grupos = GRUPOS
    .map(g => ({ ...g, items: mios.filter(a => g.estados.includes(a.status)) }))
    .filter(g => g.items.length > 0)

  /* Abre solo el grupo más urgente que tenga gente. Abrir todos devuelve la lista larga que
     estamos tratando de evitar; cerrarlos todos deja la pantalla en blanco. */
  const primero = grupos[0]?.key
  const estaAbierto = g => (g.key in abiertos ? abiertos[g.key] : g.key === primero)

  return (
    <div style={{ padding: '2px 2px' }}>
      {onVolver && <BarraVolver texto="Onboarding" onVolver={onVolver} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#0C2D40' }}>Seguimiento</div>
          <div style={{ fontSize: 6.5, color: '#94a3b8', marginTop: 1 }}>Tu área: {area}</div>
        </div>
        <AvatarPhone nombre={currentUser.name} color={currentUser.color} size={22} />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {[
          { n: mios.length, t: 'en onboarding', c: '#0C2D40' },
          { n: enAlerta, t: 'necesitan atención', c: '#dc2626' },
          { n: completados, t: 'completados', c: '#16a34a' },
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

      {mios.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 10,
          padding: '18px 12px', textAlign: 'center', fontSize: 6.5, color: '#94a3b8',
        }}>
          Nadie de {area} tiene un onboarding en curso.
        </div>
      ) : (
        <>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#0C2D40', marginBottom: 8 }}>
            Tu equipo <span style={{ fontWeight: 500, color: '#94a3b8' }}>· por urgencia</span>
          </div>

          {grupos.map(g => {
            const abierto = estaAbierto(g)
            const todos = !!expandidos[g.key]
            const visibles = todos ? g.items : g.items.slice(0, POR_GRUPO)
            const ocultos = g.items.length - visibles.length
            return (
              <div key={g.key} style={{ marginBottom: 9 }}>
                <button
                  onClick={() => setAbiertos(p => ({ ...p, [g.key]: !abierto }))}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10,
                    boxShadow: '0 2px 8px rgba(12,45,64,.05)',
                    padding: '9px 11px', marginBottom: abierto ? 9 : 0,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <g.Icon size={12} style={{ color: g.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, textAlign: 'left', fontSize: 9, fontWeight: 700, color: '#0C2D40' }}>
                    {g.label}
                  </span>
                  <span style={{
                    background: `${g.color}14`, color: g.color,
                    fontSize: 7.5, fontWeight: 800, padding: '2px 8px', borderRadius: 20,
                  }}>
                    {g.items.length}
                  </span>
                  {abierto
                    ? <ChevronUp size={11} style={{ color: '#94a3b8', flexShrink: 0 }} />
                    : <ChevronDown size={11} style={{ color: '#94a3b8', flexShrink: 0 }} />}
                </button>

                {abierto && (
                  <>
                    {visibles.map(a => <Card key={a.id} a={a} onVerDetalles={setDetalle} />)}

                    {/* El truncado se declara y dice de qué grupo es: "ver 12 más" a secas
                        no deja saber si lo que falta es urgente o ya está resuelto. */}
                    {ocultos > 0 && (
                      <div
                        onClick={() => setExpandidos(p => ({ ...p, [g.key]: true }))}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                          background: '#fff', border: '1px solid #e8ecf0', borderRadius: 9,
                          padding: '8px 0', cursor: 'pointer',
                          fontSize: 8.5, fontWeight: 700, color: '#0C2D40',
                        }}
                      >
                        Ver {ocultos} más en “{g.label}”
                        <ChevronDown size={9} />
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
