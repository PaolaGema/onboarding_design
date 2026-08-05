import { useEffect, useState } from 'react'
import { Check, Lock, Users, ToggleLeft, Pencil } from 'lucide-react'
import { transicionesDe, describirPuesto, rutasEnConflicto } from '../../utils/rutaEstados'

/* Un solo lugar para mover el estado de una ruta.

   Antes había tres verbos sueltos en el menú —"Activar", "Desactivar", "Archivar"— y cada
   uno aparecía o no según el estado, así que el menú cambiaba de forma entre una ruta y otra
   y nunca se veía el cuadro completo. Acá los tres estados están siempre a la vista: el
   actual marcado, los que se pueden elegir, y los que no con el motivo escrito. Un selector
   que esconde lo imposible no enseña la regla, hace creer que uno se equivocó de menú.

   Cada opción dice qué hace el sistema en ese estado y no solo cómo se llama: la única
   pregunta real al cambiarlo es "¿le entra gente nueva o no?".

   Si el destino es Activo y el puesto ya tiene otra ruta vigente, este modal no resuelve el
   choque: avisa y deja que lo confirme `ActivarRutaModal`, que es el que muestra el
   intercambio ruta por ruta. */
export default function CambiarEstadoRutaModal({ ruta, plantillas, enCurso = 0, onConfirmar, onEditarRuta, onCancelar }) {
  const opciones = transicionesDe(ruta)
  const primeraDisponible = opciones.find(o => !o.motivo)?.key
  const [elegido, setElegido] = useState(primeraDisponible || null)
  /* Callejón sin salida: ningún destino disponible. Pasa con un borrador vacío, que no puede
     ir a Activo hasta tener una tarea. Decir qué falta no alcanza si desde acá no se puede
     hacer nada al respecto, así que el pie deja de ofrecer "Cambiar estado" —que no tendría
     a qué cambiar— y ofrece ir a resolverlo. */
  const sinSalida = !primeraDisponible
  const faltanTareas = !ruta?.tareas

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onCancelar() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancelar])

  const conflictos = elegido === 'activa' ? rutasEnConflicto(plantillas, ruta) : []

  return (
    <div className="pl-overlay" onClick={onCancelar}>
      <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="pl-modal-body" style={{ padding: '26px 24px 18px' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: 'rgba(12,45,64,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ToggleLeft size={17} style={{ color: 'var(--navy)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1.35, margin: 0 }}>
                Estado de la ruta
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: '4px 0 0' }}>
                <strong style={{ color: 'var(--text-heading)' }}>{ruta.name}</strong>
                {ruta.cargo && <> — {describirPuesto(ruta)}</>}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {opciones.map(o => {
              const bloqueado = !!o.motivo
              const sel = elegido === o.key
              return (
                <button
                  key={o.key}
                  type="button"
                  disabled={bloqueado}
                  onClick={() => setElegido(o.key)}
                  title={o.motivo || undefined}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%',
                    padding: '11px 12px', borderRadius: 10, textAlign: 'left', fontFamily: 'inherit',
                    border: `1px solid ${sel ? 'var(--navy)' : 'var(--border-soft)'}`,
                    boxShadow: sel ? '0 0 0 2px rgba(12,45,64,.1)' : 'none',
                    background: bloqueado ? 'var(--bg-secondary)' : 'var(--surface-card)',
                    opacity: bloqueado ? 0.65 : 1,
                    cursor: bloqueado ? 'default' : 'pointer',
                    transition: 'border-color .12s, box-shadow .12s',
                  }}
                >
                  {/* La píldora del estado y no un radio con su nombre al lado: es la misma
                      que se ve en la lista, así que se reconoce sin leer. */}
                  <span className={`pl-status ${o.clase}`} style={{ flexShrink: 0, marginTop: 1 }}>{o.label}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {o.regla}
                    </span>
                    {o.motivo && !o.actual && (
                      <span style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginTop: 5, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                        <Lock size={11} style={{ flexShrink: 0, marginTop: 1 }} />
                        {o.motivo}
                      </span>
                    )}
                  </span>
                  {o.actual && (
                    <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', marginTop: 3 }}>Actual</span>
                  )}
                  {sel && !o.actual && (
                    <Check size={15} style={{ color: 'var(--navy)', flexShrink: 0, marginTop: 2 }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Lo que va a pasarle a la gente: en párrafo se lo salta todo el mundo, así que va
              como número y solo cuando hay alguien adentro. */}
          {elegido === 'inactiva' && enCurso > 0 && (
            <Nota>
              <strong>{enCurso} {enCurso === 1 ? 'colaborador sigue' : 'colaboradores siguen'}</strong>{' '}
              con esta ruta hasta terminar. Dejar de asignarla no saca a nadie de la suya.
            </Nota>
          )}

          {conflictos.length > 0 && (
            <Nota>
              <strong>{describirPuesto(ruta)}</strong> ya tiene{' '}
              {conflictos.length === 1 ? 'una ruta vigente' : `${conflictos.length} rutas vigentes`}. Al continuar
              vas a confirmar el reemplazo.
            </Nota>
          )}
        </div>

        <div className="pl-modal-footer">
          <button className="pl-btn-cancel" onClick={onCancelar}>Cancelar</button>
          {sinSalida && faltanTareas && onEditarRuta ? (
            <button
              className="pl-btn-save"
              onClick={onEditarRuta}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Pencil size={13} />
              Agregar tareas
            </button>
          ) : (
            <button
              className="pl-btn-save"
              disabled={!elegido || opciones.find(o => o.key === elegido)?.actual}
              onClick={() => onConfirmar(elegido)}
            >
              {conflictos.length > 0 ? 'Continuar' : 'Cambiar estado'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const Nota = ({ children }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 12,
    padding: '10px 12px', borderRadius: 10, background: 'var(--bg-secondary)',
  }}>
    <Users size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
    <span style={{ fontSize: 11.5, color: 'var(--text-heading)', lineHeight: 1.55 }}>{children}</span>
  </div>
)
