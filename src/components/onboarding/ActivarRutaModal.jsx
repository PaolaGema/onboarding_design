import { useEffect } from 'react'
import { ArrowLeftRight, RotateCcw, Users } from 'lucide-react'
import { describirPuesto } from '../../utils/rutaEstados'
import { Rotulo, Nota, FilaRuta } from './PiezasAviso'

/* Modal de unicidad (RN-M60): salta al activar una ruta cuando el cargo+sucursal
   ya tiene otra en Activo.

   Está escrito como un reemplazo y no como una activación con letra chica. La
   versión anterior lo contaba en prosa —"al activar X, Y pasa a Inactivo"— y esa
   frase es ilegible: mete dos rutas y dos estados en un renglón, y quien la lee
   entiende que la que se apaga es la que está activando. Acá el intercambio se
   muestra en vez de narrarse: una fila por ruta, cada una con su estado de antes y
   el de después, agrupadas bajo "sale" y "entra". Se lee de un vistazo y no hay
   pronombre que pueda apuntar a la ruta equivocada.

   No pregunta qué hacer con la anterior: pasa a Inactivo, íntegra y reactivable.
   Por eso el modal cierra mostrando la vuelta atrás — lo que vuelve reversible a
   una acción no es la advertencia, es saber por dónde se deshace.

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

  /* El estado no se nombra en el texto sino que se dibuja con las mismas píldoras
     de la lista de rutas: quien las vio ahí las reconoce aquí sin tener que leer. */

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
              {/* La general no ocupa un puesto sino el lugar de lo común, así que el título y la
                  regla se nombran distinto: hablarle de "este puesto" a una ruta que no tiene
                  cargo describe mal justo lo que está por pasar. */}
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0C2D40', lineHeight: 1.35, margin: 0 }}>
                {ruta.esGlobal ? 'Reemplazar la ruta general' : 'Reemplazar la ruta de este puesto'}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: '4px 0 0' }}>
                {ruta.esGlobal
                  ? 'La empresa tiene una sola ruta general a la vez, y hoy'
                  : 'Un puesto tiene una sola ruta vigente a la vez.'}{' '}
                {!ruta.esGlobal && <strong style={{ color: '#0C2D40' }}>{describirPuesto(ruta)}</strong>}
                {ruta.esGlobal
                  ? (varias ? `hay ${anteriores.length} marcadas como tal.` : 'ya hay una.')
                  : <> ya {varias ? `tiene ${anteriores.length} rutas activas` : 'tiene una'}.</>}
              </p>
            </div>
          </div>

          <Rotulo>{varias ? 'Salen de circulación' : 'Sale de circulación'}</Rotulo>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {anteriores.map(a => (
              <FilaRuta
                key={a.id}
                r={a}
                de="activa"
                a="inactiva"
                meta={`v${a.versionActual || 1} · ${a.updated || 'Sin cambios recientes'}${a.creador ? ` · ${a.creador}` : ''}`}
              />
            ))}
          </div>

          <Rotulo style={{ marginTop: 14 }}>Queda vigente</Rotulo>
          <FilaRuta
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
            <strong>Inactivo</strong>: {varias ? 'podrás volver a activarlas' : 'podrás volver a activarla'} cuando
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
