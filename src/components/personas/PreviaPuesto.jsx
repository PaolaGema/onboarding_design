import { Fragment } from 'react'
import { User, Star, Users, Briefcase, MapPin, CornerDownRight, Building2 } from 'lucide-react'
import { sucursales, getUnidad, tipoDe } from '../../data/organigramaData'

/* Dónde va a quedar el puesto, dibujado. Antes era una lista de tres renglones con flechitas
   —"Recursos Humanos › Gerente General › este puesto"— y contestaba la pregunta con texto,
   que es justo lo que el organigrama existe para no hacer.

   Va en el costado derecho del modal, igual que el detalle de una ruta de onboarding: los
   campos a la izquierda y lo que resulta de llenarlos a la derecha, sin que uno tape al otro.
   Y como la columna es angosta, el árbol se dibuja hacia abajo —codos y bajada punteada— en
   vez de a lo ancho: la misma información que el gráfico grande, en el ancho que hay.

   Los hermanos se muestran para que el puesto tenga con quién compararse: "queda junto a
   Reclutadora y Analista de Nóminas" ubica mejor que cualquier ruta escrita. Van con tope y
   el resto se declara en un `+N`, que es la regla del resto del producto: ninguna lista sin
   tope, y el truncado se dice. */

const ICONO = { colaborador: User, jefe: Star, staff: Users, outsourcing: Briefcase }

/* Cuántos hermanos se dibujan antes de resumir. Una dirección con doce reportes convertiría
   la previa en la lista de otro puesto. */
const MAX_HERMANOS = 4

function MiniCargo({ nombre, tipo = 'colaborador', area, estado, foco, marca }) {
  const Icon = ICONO[tipo] || User
  const clases = ['og-pv-card']
  if (tipo === 'staff') clases.push('og-pv-staff')
  if (tipo === 'outsourcing') clases.push('og-pv-ext')
  if (foco) clases.push('og-pv-foco')

  return (
    <div className={clases.join(' ')}>
      {marca && <span className="og-pv-tag">{marca}</span>}
      <span className="og-pv-nom"><Icon size={11} /> {nombre}</span>
      {area && <span className="og-pv-sub">{area}</span>}
      {estado && <span className="og-pv-estado">{estado}</span>}
    </div>
  )
}

export default function PreviaPuesto({ form, org, cargoId, ocupantes, nuevo }) {
  const jefe = form.reportaA ? org.cargos.find(c => c.id === form.reportaA) : null
  const lateral = form.tipo === 'staff' || form.tipo === 'outsourcing'
  /* Al costado solo se puede colgar de alguien: un staff sin jefe es una raíz, y no hay de qué
     colgarlo al costado. */
  const alCostado = lateral && !!jefe

  /* Los hermanos son la línea de mando: los laterales del mismo jefe no van en esa fila,
     porque en el árbol tampoco van ahí. */
  const hermanos = (jefe
    ? org.cargos.filter(c => c.reportaA === jefe.id)
    : org.cargos.filter(c => !c.reportaA)
  ).filter(c => c.id !== cargoId && c.tipo !== 'staff' && c.tipo !== 'outsourcing')

  /* Dónde cae este puesto dentro de la fila. Sin posición declarada —un cargo nuevo— va al
     final, que es donde lo va a poner la lista. */
  const lugar = form.posicion >= 0 ? form.posicion : hermanos.length
  const visibles = hermanos.slice(0, MAX_HERMANOS)
  const resto = hermanos.length - visibles.length
  const aCargo = cargoId ? org.cargos.filter(c => c.reportaA === cargoId).length : 0

  const area = getUnidad(form.unidadId, org)?.nombre
  const areaJefe = jefe ? getUnidad(jefe.unidadId, org)?.nombre : null
  const marcadas = sucursales.filter(s => form.sucursalIds.includes(s.id))
  /* Sin ninguna marcada el puesto existe en todas: es la misma regla que dice el formulario,
     y el pie tiene que decir lo mismo que el campo. */
  const sedes = marcadas.length ? marcadas : sucursales
  const todas = sedes.length === sucursales.length

  const foco = (
    <MiniCargo
      foco
      marca={nuevo ? 'Nuevo' : 'Este puesto'}
      nombre={form.nombre.trim() || 'Sin nombre todavía'}
      tipo={form.tipo}
      /* Con una persona se lee su nombre; con varias, cuántas son: cinco nombres no entran en
         una columna de 400 px. */
      estado={ocupantes.length > 1
        ? `${ocupantes.length} personas`
        : ocupantes.length
          ? ocupantes[0].name
          : form.tipo === 'outsourcing' ? 'Vacante · sin prestador' : 'Vacante'}
    />
  )

  return (
    <aside className="og-pv">
      <div className="og-pv-hd">Cómo va a quedar en el organigrama</div>

      {/* La unidad encabeza el panel porque es la primera respuesta a "¿dónde queda?": el
          organigrama dibuja los cargos dentro de la píldora de su área. Antes iba de renglón
          adentro del cuadro y lo que quedaba arriba era el nombre de la empresa, que se leía
          como si fuera el área equivocada. */}
      <div className="og-pv-area">
        <span className="og-pv-area-rot">Unidad organizacional</span>
        <span className="og-pv-area-nom"><Building2 size={13} /> {area || 'Sin área'}</span>
      </div>

      {/* Sin jefe no se dibuja ningún cuadro de empresa: el hilo baja del área y ya. El bloque
         de SoulyHR contestaba una pregunta que nadie hizo —de qué cuelga la raíz— y metía un
         nivel de más justo arriba del que importa. */}
      {/* Sin jefe no hay rótulo: la bajada sale del bloque del área, y meterle "Dentro del
          área" en el medio partía la línea en dos y hacía parecer que nacía del texto. Con
          jefe sí, porque ahí el rótulo encabeza al cuadro del que se cuelga. */}
      {jefe && <div className="og-pv-rot">Depende de</div>}

      <div className="og-pv-tree">
        {jefe && <MiniCargo nombre={jefe.nombre} tipo={tipoDe(jefe, org)} area={areaJefe} />}

        <div className={`og-pv-rama${jefe ? '' : ' og-pv-rama-raiz'}`}>
          {/* El lateral va antes que la línea de mando, como en el dibujo grande: primero lo
              que cuelga al costado del jefe, después sus reportes. */}
          {alCostado && (
            <div className="og-pv-hijo og-pv-hijo-rot">
              {/* El rótulo hace explícito lo que en el dibujo grande se ve solo: hacia abajo
                  todos los hijos se ven iguales, y este no cuelga de la línea de mando. */}
              <span className="og-pv-rotulo">Al costado de la línea</span>
              {foco}
            </div>
          )}
          {/* El puesto entra en la fila en el lugar que dice el campo "Orden entre sus pares",
              no siempre al final: si el dibujo no se mueve al tocar las flechas, el campo
              parece no hacer nada hasta después de guardar. */}
          {visibles.map((c, i) => (
            <Fragment key={c.id}>
              {!alCostado && i === lugar && <div className="og-pv-hijo">{foco}</div>}
              <div className="og-pv-hijo">
                <MiniCargo nombre={c.nombre} tipo={tipoDe(c, org)} />
              </div>
            </Fragment>
          ))}
          {!alCostado && lugar >= visibles.length && <div className="og-pv-hijo">{foco}</div>}
          {resto > 0 && (
            <div className="og-pv-hijo"><span className="og-pv-mas">+{resto} más en la misma línea</span></div>
          )}
        </div>
      </div>

      {alCostado && (
        <p className="og-pv-nota">
          No entra en la fila de reportes de <strong>{jefe.nombre}</strong>: en el organigrama
          cuelga a su costado, con línea punteada.
        </p>
      )}

      {/* Con tres sucursales la lista cabe; con cincuenta, no. Arriba de tres se cuenta en
          vez de enumerar: un renglón con veinte ciudades no lo lee nadie. */}
      <p className="og-pv-pie">
        <MapPin size={11} />
        {todas ? 'Existe en todas las sedes'
          : sedes.length <= 3 ? `Existe en ${sedes.map(s => s.ciudad).join(', ')}`
          : `Existe en ${sedes.length} de las ${sucursales.length} sedes`}
      </p>
      {aCargo > 0 && (
        <p className="og-pv-pie">
          <CornerDownRight size={11} />
          {aCargo === 1 ? '1 puesto depende de él' : `${aCargo} puestos dependen de él`}
        </p>
      )}
    </aside>
  )
}

