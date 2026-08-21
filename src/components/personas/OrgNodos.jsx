import { useCallback, useState } from 'react'
import { User, Star, Briefcase, ChevronUp, ChevronDown } from 'lucide-react'

/* El dibujo del árbol: la tarjeta de un cargo, la píldora de una unidad y la rama que las
   cuelga. Se mira y se abre con doble clic; la estructura se cambia en el formulario.

   `acomodo` es lo único interactivo que queda: mueve el cuadro de LUGAR sin tocar ningún dato.
   Sin él —la vista de solo lectura— las piezas son puro dibujo. */

/* Cuántas caras entran en una tarjeta de 200 px antes de convertirse en una fila de puntos.
   El resto se cuenta; la lista completa está en la ficha. */
const CARAS = 3

function Ocupante({ nodo, externo }) {
  const { ocupantes } = nodo

  if (!ocupantes.length) {
    return (
      <div className="og-chip og-chip-vacio">
        {externo ? 'Sin prestador asignado' : 'Sin colaborador asignado'}
      </div>
    )
  }

  /* Una sola persona se lee con su nombre, que es el caso normal. Varias van como caras en
     fila: cinco nombres apilados harían crecer el cuadro justo donde hay más gente, que es
     donde menos espacio sobra. */
  if (ocupantes.length === 1) {
    const p = ocupantes[0]
    return (
      <div className="og-chip">
        <span className="og-chip-av" style={{ background: p.color }}>{p.initials}</span>
        <span className="og-chip-name">{p.name}</span>
      </div>
    )
  }

  return (
    <div className="og-chip og-chip-varios" title={ocupantes.map(p => p.name).join(' · ')}>
      <span className="og-caras">
        {ocupantes.slice(0, CARAS).map(p => (
          <span key={p.id} className="og-chip-av" style={{ background: p.color }}>{p.initials}</span>
        ))}
        {ocupantes.length > CARAS && (
          <span className="og-chip-av og-cara-mas">+{ocupantes.length - CARAS}</span>
        )}
      </span>
      <span className="og-chip-plazas">{ocupantes.length} personas</span>
    </div>
  )
}

export function TarjetaCargo({ nodo, onAbrir, plegable, acomodo }) {
  const { cargo, vacante } = nodo
  /* El color de la tarjeta dice el TIPO de puesto y la etiqueta dice si está VACANTE: son dos
     preguntas distintas y hasta un servicio tercerizado sin prestador es algo por cubrir, así
     que el violeta del outsourcing convive con la marca amarilla en vez de reemplazarla. */
  const externo = cargo.tipo === 'outsourcing'
  const lateral = cargo.tipo === 'staff' || externo
  const clases = ['og-card']
  /* El amarillo solo pinta lo que no tiene color propio: staff y outsourcing ya vienen
     teñidos por su tipo, y ahí lo que avisa de la vacante es la etiqueta. */
  if (vacante && !lateral) clases.push('og-card-vacante')
  if (cargo.tipo === 'staff') clases.push('og-card-staff')
  if (externo) clases.push('og-card-ext')

  /* Lo que uno movió a mano gana sobre lo que propuso el árbol. Va como transformación y no
     como posición absoluta: el cuadro conserva su lugar en la fila —nadie se recorre por
     haberlo movido— y volver al acomodo automático es borrar el corrimiento. */
  const corrido = acomodo?.corrimiento(cargo.id)
  if (corrido) clases.push('og-card-corrido')
  if (acomodo?.enMano === cargo.id) clases.push('og-card-arrastrando')

  return (
    <div
      className={clases.join(' ')}
      title={acomodo ? 'Doble clic para ver el detalle · arrastra para acomodarlo' : 'Doble clic para ver el detalle'}
      data-no-pan={acomodo ? '' : undefined}
      data-clave={acomodo ? cargo.id : undefined}
      style={corrido ? { transform: `translate(${corrido.dx}px, ${corrido.dy}px)` } : undefined}
      onPointerDown={acomodo ? e => acomodo.tomar(cargo.id, false, e) : undefined}
      onDoubleClick={() => onAbrir?.(nodo)}
    >
      {cargo.destacado && <Star size={11} className="og-card-star" />}
      {vacante && <span className="og-card-tag">Vacante</span>}
      <div className="og-card-title">
        {externo
          ? <Briefcase size={11} className="og-card-ico" />
          : <User size={11} className="og-card-ico" />}
        <span>{cargo.nombre}</span>
      </div>
      <Ocupante nodo={nodo} externo={externo} />
      {plegable}
    </div>
  )
}

function Nodo({ nodo, onAbrir, plegable, acomodo }) {
  if (nodo.tipo === 'empresa') {
    return <div className="og-empresa">{nodo.empresa.nombre}{plegable}</div>
  }
  if (nodo.tipo === 'unidad') {
    /* La píldora se agarra igual que un cuadro, pero lo que se mueve es su RAMA entera: un
       rótulo movido solo se despega de los cargos que encabeza. Por eso el corrimiento se
       aplica al `li` (ver `Rama`) y acá solo se toma el gesto. */
    const clave = `u:${nodo.unidad.id}`
    return (
      <div
        className={`og-unidad${acomodo?.enMano === clave ? ' og-unidad-arrastrando' : ''}`}
        data-no-pan={acomodo ? '' : undefined}
        onPointerDown={acomodo ? e => acomodo.tomar(clave, true, e) : undefined}
      >
        {nodo.unidad.nombre}
        {plegable}
      </div>
    )
  }
  return <TarjetaCargo nodo={nodo} onAbrir={onAbrir} plegable={plegable} acomodo={acomodo} />
}

/* Qué ramas están plegadas. Lo tiene el contenedor y baja por `pliegue` hasta cada rama. No se
   guarda en el dato ni en el almacenamiento: plegar es cómo estoy mirando esto ahora, no cómo
   es la empresa. */
export function usePliegue() {
  const [plegados, setPlegados] = useState(() => new Set())

  const alternar = useCallback(id => setPlegados(previos => {
    const siguiente = new Set(previos)
    if (!siguiente.delete(id)) siguiente.add(id)
    return siguiente
  }), [])

  const abrirTodo = useCallback(() => setPlegados(new Set()), [])

  return { plegados, alternar, abrirTodo }
}

/* Cuántos cargos se esconden al plegar. Se cuenta lo que hay ABAJO —la rama entera, con los
   laterales de cada escalón— porque es lo que deja de verse; los laterales del propio nodo
   siguen a la vista, que están a su costado y no debajo. */
function contarCargos(nodos) {
  return nodos.reduce((total, n) => total
    + (n.tipo === 'cargo' ? 1 : 0)
    + (n.staff?.length || 0)
    + contarCargos(n.hijos || []), 0)
}

function BotonPlegar({ nodo, ocultos, pliegue }) {
  const plegado = pliegue.plegados.has(nodo.id)
  return (
    <button
      className={`og-plegar${plegado ? ' on' : ''}`}
      onClick={e => { e.stopPropagation(); pliegue.alternar(nodo.id) }}
      onDoubleClick={e => e.stopPropagation()}
      title={plegado
        ? `Mostrar los ${ocultos} cargos que cuelgan de aquí`
        : `Plegar: esconde ${ocultos} ${ocultos === 1 ? 'cargo' : 'cargos'}`}
    >
      {/* El número solo cuando está plegado. Con la rama a la vista los cargos se cuentan
          mirando; escondida, es lo único que dice qué se dejó de ver. */}
      {plegado && ocultos}
      {plegado ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
    </button>
  )
}

export function Rama({ nodo, onAbrir, pliegue, acomodo }) {
  const hijos = nodo.hijos || []
  const laterales = nodo.staff || []

  /* Los laterales se reparten a los dos costados en vez de apilarse en una columna. Apilados,
     un jefe con dos servicios tercerizados estiraba su fila hacia abajo y empujaba a todos sus
     reportes con ella. A los costados no crece nada —la izquierda ya estaba reservada como
     hueco espejo— y la altura se parte por dos. El primero se queda a la derecha, que es donde
     estuvo siempre: quien tiene un solo staff no ve moverse nada. */
  const derecha = laterales.filter((_, i) => i % 2 === 0)
  const izquierda = laterales.filter((_, i) => i % 2 === 1)

  const bloque = (lista, lado) => (
    <div className={`og-staff og-staff-${lado}`}>
      {lista.map(s => <TarjetaCargo key={s.id} nodo={s} onAbrir={onAbrir} acomodo={acomodo} />)}
    </div>
  )

  const ocultos = pliegue ? contarCargos(hijos) : 0
  const plegado = pliegue?.plegados.has(nodo.id)

  /* El corrimiento de una unidad se aplica al `li` entero y no a la píldora: lo que se acomoda
     es el bloque —el rótulo con los cargos que encabeza—. Los cargos de adentro conservan
     además su corrimiento propio, que pasa a ser relativo al del grupo. */
  const rama = nodo.tipo === 'unidad' ? acomodo?.corrimiento(`u:${nodo.unidad.id}`) : null

  return (
    <li style={rama ? { transform: `translate(${rama.dx}px, ${rama.dy}px)` } : undefined}>
      <div className="og-nodo">
        {/* Con un solo lateral la izquierda queda vacía, pero el hueco se dibuja igual: sin él
            la tarjeta se corre y deja de caer sobre el conector que baja hacia sus hijos. */}
        {izquierda.length > 0
          ? bloque(izquierda, 'izq')
          : laterales.length > 0 && <div className="og-lateral-hueco" aria-hidden="true" />}
        <Nodo
          nodo={nodo}
          onAbrir={onAbrir}
          acomodo={acomodo}
          plegable={ocultos > 0 && <BotonPlegar nodo={nodo} ocultos={ocultos} pliegue={pliegue} />}
        />
        {derecha.length > 0 && bloque(derecha, 'der')}
      </div>
      {hijos.length > 0 && !plegado && (
        <ul>
          {hijos.map(h => <Rama key={h.id} nodo={h} onAbrir={onAbrir} pliegue={pliegue} acomodo={acomodo} />)}
        </ul>
      )}
    </li>
  )
}
