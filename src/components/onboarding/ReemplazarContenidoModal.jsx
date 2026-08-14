import { useEffect } from 'react'
import { AlertTriangle, ArrowDown, Layers, LayoutTemplate, RotateCcw, Users } from 'lucide-react'
import { Rotulo, Nota } from './PiezasAviso'

/* Confirmación de traer una base al constructor cuando el lienzo ya tiene contenido.

   Antes esto era un párrafo dentro del diálogo genérico: decía todo lo que hay que decir —qué
   se borra, qué entra, a quién alcanza, cómo deshacerlo— pero en un bloque de prosa centrado,
   y un bloque de prosa en el momento de apretar un botón rojo no se lee. Los tres hechos se
   separan: el intercambio se dibuja, y lo que no es el intercambio queda debajo como notas.

   Mismo lenguaje que `ActivarRutaModal`: una tarjeta por lado y una flecha en medio. Ahí el
   intercambio es entre dos rutas y acá entre dos contenidos, pero la pregunta que responde es
   la misma —qué se va y qué queda— y quien lo vio una vez lo reconoce sin leer. */
export default function ReemplazarContenidoModal({ actual, entrante, nombreEntrante, enCurso = 0, onConfirmar, onCancelar }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onCancelar() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancelar])

  return (
    <div className="pl-overlay" style={{ zIndex: 1300 }} onClick={onCancelar}>
      <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="pl-modal-body" style={{ padding: '26px 24px 18px' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
            {/* Advertencia y no intercambio: a diferencia de reemplazar una ruta por otra,
                acá lo que sale se pierde. El ícono tiene que decir eso antes que el texto. */}
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={17} style={{ color: '#dc2626' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0C2D40', lineHeight: 1.35, margin: 0 }}>
                Se va a reemplazar lo que ya armaste
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: '4px 0 0' }}>
                El contenido del lienzo se cambia entero por el de la base que elegiste.
              </p>
            </div>
          </div>

          <Rotulo>Se borra</Rotulo>
          <Bloque
            icono={Layers}
            titulo="Lo que armaste en esta ruta"
            conteo={actual}
            tono="sale"
          />

          {/* La flecha ocupa su propio renglón: entre dos tarjetas del mismo ancho, es lo que
              convierte dos bloques sueltos en un antes y un después. */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '7px 0' }}>
            <ArrowDown size={16} style={{ color: '#94a3b8' }} />
          </div>

          <Rotulo>Entra en su lugar</Rotulo>
          <Bloque
            icono={LayoutTemplate}
            titulo={nombreEntrante}
            conteo={entrante}
            tono="entra"
          />

          {enCurso > 0 && (
            <Nota icon={Users}>
              <strong>{enCurso} {enCurso === 1 ? 'colaborador está' : 'colaboradores están'}</strong> haciendo
              esta ruta. {enCurso === 1 ? 'Sigue' : 'Siguen'} con la versión que
              {enCurso === 1 ? ' empezó' : ' empezaron'}: al guardar eliges si el cambio les llega.
            </Nota>
          )}

          {/* Lo que vuelve reversible a una acción no es la advertencia, es saber por dónde se
              deshace. Va último porque es lo que queda en la cabeza al apretar. */}
          <Nota icon={RotateCcw}>
            Todavía no se guarda nada. Si te arrepientes, sal del constructor sin guardar y la
            ruta queda como estaba.
          </Nota>
        </div>

        <div className="pl-modal-footer">
          <button className="pl-btn-cancel" onClick={onCancelar}>Cancelar</button>
          <button className="pl-btn-delete" onClick={onConfirmar}>Sí, reemplazar</button>
        </div>
      </div>
    </div>
  )
}

/* Un lado del intercambio. Los conteos van como cifras separadas y no como frase —"3 etapas ·
   2 actividades · 8 tareas"— porque lo que se compara entre un lado y otro son los números, y
   en una frase corrida hay que buscarlos. */
const Bloque = ({ icono: Icono, titulo, conteo, tono }) => {
  const sale = tono === 'sale'
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 12px', borderRadius: 10,
      background: sale ? '#fef2f2' : 'var(--green-tint)',
      border: `1px solid ${sale ? 'rgba(220,38,38,.2)' : 'rgba(22,163,74,.25)'}`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: sale ? 'rgba(220,38,38,.12)' : 'rgba(22,163,74,.16)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icono size={14} style={{ color: sale ? '#dc2626' : 'var(--green)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: 700, color: '#0C2D40', lineHeight: 1.35,
          textDecoration: sale ? 'line-through' : 'none',
          textDecorationColor: sale ? 'rgba(220,38,38,.5)' : undefined,
        }}>
          {titulo}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 5 }}>
          <Cifra n={conteo.etapas} label={conteo.etapas === 1 ? 'etapa' : 'etapas'} />
          <Cifra n={conteo.actividades} label={conteo.actividades === 1 ? 'actividad' : 'actividades'} />
          <Cifra n={conteo.tareas} label={conteo.tareas === 1 ? 'tarea' : 'tareas'} />
        </div>
      </div>
    </div>
  )
}

const Cifra = ({ n, label }) => (
  <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
    <strong style={{ fontSize: 14, fontWeight: 800, color: '#0C2D40', lineHeight: 1 }}>{n}</strong>
    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</span>
  </span>
)
