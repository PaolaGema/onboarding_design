import { useEffect } from 'react'
import { ArrowLeftRight, ArrowRight, Route, RotateCcw, Users } from 'lucide-react'
import { describirPuesto, estadoRuta } from '../../utils/rutaEstados'

/* Modal de unicidad (RN-M60): salta al activar una ruta cuando el cargo+sucursal
   ya tiene otra en Activo.

   Está escrito como un reemplazo y no como una activación con letra chica. La
   versión anterior lo contaba en prosa —"al activar X, Y pasa a No activo"— y esa
   frase es ilegible: mete dos rutas y dos estados en un renglón, y quien la lee
   entiende que la que se apaga es la que está activando. Acá el intercambio se
   muestra en vez de narrarse: una fila por ruta, cada una con su estado de antes y
   el de después, agrupadas bajo "sale" y "entra". Se lee de un vistazo y no hay
   pronombre que pueda apuntar a la ruta equivocada.

   No pregunta qué hacer con la anterior. En el momento de reemplazar nadie sabe
   todavía si la vieja se va a reutilizar, así que pedir "¿desactivar o archivar?"
   es pedir que se adivine el futuro para poder seguir: la anterior pasa siempre a
   No activo —íntegra y reactivable— y archivarla queda como acción aparte del
   menú, para cuando ya se sepa que no se reutilizará. Por eso el modal cierra
   mostrando la vuelta atrás: lo que vuelve reversible a una acción no es la
   advertencia, es saber por dónde se deshace.

   `anteriores` viene con el conteo `enCurso` ya resuelto por quien abre el modal.
   Es una lista y no una sola ruta porque los datos previos a esta regla pueden
   tener más de una ruta en Activo para el mismo puesto. */
export default function ActivarRutaModal({ ruta, anteriores, onConfirmar, onCancelar }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onCancelar() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancelar])

  const varias = anteriores.length > 1
  const totalEnCurso = anteriores.reduce((s, a) => s + (a.enCurso || 0), 0)

  /* Una fila del intercambio. El estado no se nombra en el texto sino que se
     dibuja con las mismas píldoras de la lista de rutas: quien las vio ahí las
     reconoce acá sin tener que leer.

     El nombre ocupa el ancho completo y la transición va debajo, y no los dos en
     la misma línea: compartiendo renglón con las píldoras, los nombres largos —que
     en este producto son la norma— se truncaban a "Onboarding Finanzas…" en las dos
     filas, y quedaban idénticos justo en el modal que existe para distinguirlas. */
  const Fila = ({ r, de, a, entrante, meta }) => (
    <div style={{
      padding: '11px 12px', borderRadius: 10,
      background: entrante ? 'var(--green-tint)' : 'var(--bg-secondary)',
      border: `1px solid ${entrante ? 'rgba(22,163,74,.25)' : 'var(--surface-hover)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: entrante ? 'rgba(22,163,74,.16)' : 'var(--surface-hover)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Route size={14} style={{ color: entrante ? 'var(--green)' : 'var(--text-muted)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0C2D40', lineHeight: 1.35 }}>
            {r.name}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {meta}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
            <Pildora estado={de} apagada />
            <ArrowRight size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <Pildora estado={a} />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="pl-overlay" onClick={onCancelar}>
      <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="pl-modal-body" style={{ padding: '26px 24px 18px' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
            {/* Icono de intercambio y no de advertencia: esto no es un error del
                que haya que salir, es la operación que se pidió, explicada. */}
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: 'rgba(12,45,64,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ArrowLeftRight size={17} style={{ color: '#0C2D40' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0C2D40', lineHeight: 1.35, margin: 0 }}>
                Reemplazar la ruta de este puesto
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: '4px 0 0' }}>
                Un puesto tiene una sola ruta vigente a la vez.{' '}
                <strong style={{ color: '#0C2D40' }}>{describirPuesto(ruta)}</strong> ya{' '}
                {varias ? `tiene ${anteriores.length} rutas activas` : 'tiene una'}.
              </p>
            </div>
          </div>

          <Rotulo>{varias ? 'Salen de circulación' : 'Sale de circulación'}</Rotulo>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {anteriores.map(a => (
              <Fila
                key={a.id}
                r={a}
                de="activa"
                a="inactiva"
                meta={`v${a.versionActual || 1} · ${a.updated || 'Sin cambios recientes'}${a.creador ? ` · ${a.creador}` : ''}`}
              />
            ))}
          </div>

          <Rotulo style={{ marginTop: 14 }}>Queda vigente</Rotulo>
          <Fila
            r={ruta}
            de={ruta.status || 'borrador'}
            a="activa"
            entrante
            meta={`v${ruta.versionActual || 1} · Se asignará a los próximos ingresos`}
          />

          {/* El impacto sobre la gente va como número y no como política: en párrafo
              se lo salta todo el mundo, y es justo lo que más miedo da al reemplazar. */}
          {totalEnCurso > 0 && (
            <Nota icon={Users}>
              <strong>{totalEnCurso} {totalEnCurso === 1 ? 'colaborador sigue' : 'colaboradores siguen'}</strong>{' '}
              con {varias ? 'sus rutas actuales' : 'la ruta actual'} hasta terminar. Nadie cambia de ruta a mitad de camino.
            </Nota>
          )}

          <Nota icon={RotateCcw}>
            {varias ? 'Las rutas que salen quedan íntegras' : 'La ruta que sale queda íntegra'} en{' '}
            <strong>No activo</strong>: {varias ? 'podrás volver a activarlas' : 'podrás volver a activarla'} cuando
            quieras desde su menú.
          </Nota>
        </div>

        <div className="pl-modal-footer">
          <button className="pl-btn-cancel" onClick={onCancelar}>Cancelar</button>
          <button className="pl-btn-save" onClick={onConfirmar}>Reemplazar ruta</button>
        </div>
      </div>
    </div>
  )
}

const Rotulo = ({ children, style }) => (
  <div style={{
    fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
    color: 'var(--text-muted)', marginBottom: 7, ...style,
  }}>
    {children}
  </div>
)

/* El estado de origen va atenuado y el de destino a color pleno: la jerarquía
   dice por sí sola cuál de los dos es el que va a quedar. */
const Pildora = ({ estado, apagada }) => {
  const e = estadoRuta(estado)
  return (
    <span style={{
      fontSize: 9.5, fontWeight: 700, padding: '3px 8px', borderRadius: 20, whiteSpace: 'nowrap',
      background: e.bg, color: e.color, opacity: apagada ? 0.5 : 1,
    }}>
      {e.label}
    </span>
  )
}

const Nota = ({ icon: Icon, children }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 12,
    padding: '10px 12px', borderRadius: 10, background: 'var(--bg-secondary)',
  }}>
    <Icon size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
    <span style={{ fontSize: 11.5, color: '#0C2D40', lineHeight: 1.55 }}>{children}</span>
  </div>
)
