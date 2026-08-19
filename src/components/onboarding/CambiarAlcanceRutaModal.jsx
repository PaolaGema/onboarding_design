import { useEffect } from 'react'
import { ArrowLeftRight, ArrowRight, Briefcase, Users, UserRoundX } from 'lucide-react'
import { CAMPOS_ALCANCE, describirPuesto, valorDeAlcance } from '../../utils/rutaEstados'
import { Rotulo, Nota, FilaRuta } from './PiezasAviso'

/* Confirmación al cambiarle el alcance —sucursal, área o cargo— a una ruta que está en
   Activo. La ficha de la vista previa deja corregir esos campos en el lugar, y para el
   nombre o la descripción eso está bien: se escribe y ya. Pero estos cuatro campos no
   describen la ruta, deciden a quién le llega, y editarlos sobre una ruta vigente es mudarla
   de puesto: el puesto viejo se queda sin ruta, el nuevo puede tener una que se apaga
   (RN-M60) y los que están en curso terminan figurando en otro lado.

   Solo aparece cuando algo de eso va a pasar de verdad: sobre un borrador el mismo cambio se
   guarda sin preguntar nada. Ver `impactoDeAlcance`.

   Igual que en `ActivarRutaModal`, el ícono es de intercambio y no de advertencia: esto no es
   un error del que haya que salir, es la operación que se pidió, explicada antes de hacerla.
   Y lo que va a pasar se muestra —una fila por ruta, con su estado de antes y el de después—
   en vez de narrarse en un párrafo donde ningún pronombre apunta a la ruta correcta. */
export default function CambiarAlcanceRutaModal({ ruta, impacto, enCurso = 0, onConfirmar, onCancelar }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onCancelar() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancelar])

  const { destino, desplaza, cargosLiberados = [], liberaPuesto, quedaSinCargo } = impacto
  const varias = desplaza.length > 1

  /* Solo los campos que efectivamente cambian. Cambiar de área arrastra el cargo —un cargo de
     Ventas no existe en Tecnología— y esa limpieza tiene que verse aquí: es la mitad de lo que
     el cambio hace y la que nadie pidió explícitamente. */
  const filas = Object.entries(CAMPOS_ALCANCE)
    .map(([campo, etiqueta]) => ({
      campo,
      etiqueta,
      de: valorDeAlcance(ruta, campo),
      a: valorDeAlcance(destino, campo),
    }))
    .filter(f => f.de !== f.a)

  return (
    <div className="pl-overlay" style={{ zIndex: 1300 }} onClick={onCancelar}>
      <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="pl-modal-body" style={{ padding: '26px 24px 18px' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: 'rgba(12,45,64,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ArrowLeftRight size={17} style={{ color: '#0C2D40' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0C2D40', lineHeight: 1.35, margin: 0 }}>
                {quedaSinCargo ? 'Esta ruta se va a quedar sin puesto' : 'Mover esta ruta a otro puesto'}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: '4px 0 0' }}>
                <strong style={{ color: '#0C2D40' }}>{ruta.name}</strong> está vigente para{' '}
                <strong style={{ color: '#0C2D40' }}>{describirPuesto(ruta)}</strong>. Esto es lo que cambia.
              </p>
            </div>
          </div>

          <Rotulo>{filas.length > 1 ? 'Los campos' : 'El campo'}</Rotulo>
          <div style={{
            display: 'flex', flexDirection: 'column',
            borderRadius: 10, border: '1px solid var(--surface-hover)', overflow: 'hidden',
          }}>
            {filas.map((f, i) => (
              <div
                key={f.campo}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  borderTop: i > 0 ? '1px solid var(--surface-hover)' : 'none',
                }}
              >
                <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 62, flexShrink: 0 }}>{f.etiqueta}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{f.de || '—'}</span>
                  <ArrowRight size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: f.a ? '#0C2D40' : 'var(--text-muted)' }}>
                    {f.a || 'Sin cargos'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Las rutas que se apagan van primero y dibujadas: son el efecto que alcanza a
              trabajo de otra persona, no solo al de quien está editando. */}
          {desplaza.length > 0 && (
            <>
              <Rotulo style={{ marginTop: 16, marginBottom: 3 }}>
                {varias ? 'Salen de circulación' : 'Sale de circulación'}
              </Rotulo>
              {/* El motivo va en minúscula y debajo del rótulo: en versaditas ocupaba dos
                  renglones enteros y pesaba más que las rutas que venía a explicar. */}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>
                <strong style={{ color: '#0C2D40' }}>{describirPuesto(destino)}</strong> ya{' '}
                {varias ? `tiene ${desplaza.length} rutas vigentes` : 'tiene una ruta vigente'}.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {desplaza.map(a => (
                  <FilaRuta
                    key={a.id}
                    r={a}
                    de="activa"
                    a="inactiva"
                    meta={`v${a.versionActual || 1} · ${a.updated || 'Sin cambios recientes'}${a.creador ? ` · ${a.creador}` : ''}`}
                  />
                ))}
              </div>
            </>
          )}

          {liberaPuesto && (
            <Nota icon={Briefcase}>
              {/* Se nombran los cargos que suelta y no los que tenía: con varios, el cambio
                  puede ser parcial —deja uno y conserva el resto—. */}
              <strong>{describirPuesto({ ...ruta, cargos: cargosLiberados })}</strong> se queda sin ruta vigente:
              los próximos ingresos de {cargosLiberados.length === 1 ? 'ese puesto' : 'esos puestos'} no reciben
              ninguna hasta que actives otra.
            </Nota>
          )}

          {/* Una ruta en Activo y sin cargo no se le asigna a nadie, pero su píldora sigue
              diciendo Activo: el estado afirmaría algo que dejó de ser cierto. */}
          {quedaSinCargo && (
            <Nota icon={UserRoundX}>
              La ruta queda en <strong>Activo</strong> pero sin ningún cargo, así que no le llega a nadie.
              Elige al menos un cargo del área nueva para volver a ponerla en circulación.
            </Nota>
          )}

          {/* El snapshot los protege del contenido, y hasta aquí el producto lo decía así. Pero
              cargo y área no son contenido: son a quién apunta la ruta, y eso sí se les mueve
              debajo. Decir solo la mitad tranquilizadora es lo que hacía falta arreglar. */}
          {enCurso > 0 && (
            <Nota icon={Users}>
              <strong>{enCurso} {enCurso === 1 ? 'colaborador sigue' : 'colaboradores siguen'}</strong> con la
              versión que empezaron y {enCurso === 1 ? 'la termina' : 'la terminan'} igual. En sus registros,
              eso sí, esta ruta pasará a figurar como{' '}
              <strong>{quedaSinCargo ? `${destino.area}, sin cargos` : describirPuesto(destino)}</strong>.
            </Nota>
          )}
        </div>

        <div className="pl-modal-footer">
          <button className="pl-btn-cancel" onClick={onCancelar}>Cancelar</button>
          {/* El botón nombra lo que va a pasar, no "Confirmar": es lo último que se lee antes
              de apretar, y en un cambio que apaga otra ruta el verbo tiene que decirlo. */}
          <button className="pl-btn-save" onClick={onConfirmar}>
            {desplaza.length > 0 ? 'Mover y reemplazar' : quedaSinCargo ? 'Cambiar el área' : 'Mover la ruta'}
          </button>
        </div>
      </div>
    </div>
  )
}
