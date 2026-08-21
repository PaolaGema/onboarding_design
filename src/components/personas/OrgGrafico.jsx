import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  Plus, Minus, Home, Move, MousePointer2, Lightbulb, ScanSearch, ChevronsDownUp, Maximize2, X,
  Hand, Wand2,
} from 'lucide-react'
import { Rama, usePliegue } from './OrgNodos'
import LeyendaColores from './LeyendaColores'
import { useLienzo, ZOOM_MIN, ZOOM_MAX } from './useLienzo'
import { useLocalStorage } from '../../hooks/useLocalStorage'

/* El organigrama: el árbol se mira, se navega y se acomoda; la estructura se cambia en el
   formulario que abre el doble clic.

   ACOMODAR NO ES ESTRUCTURA. El árbol propone una posición para cada cuadro y cualquiera se
   puede correr de ahí arrastrándolo, pero eso no toca ningún dato: es un corrimiento respecto
   del lugar que le dio el árbol (`desplazamientos[clave]`, puro dibujo). La regla que sí manda
   —cada cuadro cuelga de quien depende— la sigue diciendo la línea, que se dibuja calculada y
   por eso sigue al cuadro movido en vez de quedarse donde estaba. De quién depende se cambia
   en el formulario; dónde se dibuja, con la mano.

   El arrastre NO usa el drag-and-drop de HTML: el escenario vive dentro de un `transform:
   scale()` y ahí el arrastre nativo es impredecible —el navegador calcula las coordenadas sin
   escalar—. Con eventos de puntero el gesto es nuestro de punta a punta y funciona igual con
   zoom, con mouse y con dedo. */

/* Cuánto hay que mover el puntero para que sea un arrastre y no un clic con pulso. */
const UMBRAL = 5

/* El codo de la línea de mando: baja del padre, dobla a media altura y entra por arriba del
   hijo. Es el mismo trazo que dibujaría el CSS, pero calculado: así sigue al cuadro que se
   corrió de su lugar. */
function codo(padre, hijo) {
  const x1 = padre.x + padre.w / 2
  const y1 = padre.y + padre.h
  const x2 = hijo.x + hijo.w / 2
  const y2 = hijo.y
  if (Math.abs(x1 - x2) < 1) return `M ${x1} ${y1} L ${x2} ${y2}`
  const medio = y1 + Math.max(12, (y2 - y1) / 2)
  const r = Math.min(8, Math.abs(x2 - x1) / 2, Math.max(0, y2 - medio))
  const hacia = x2 > x1 ? 1 : -1
  return `M ${x1} ${y1} L ${x1} ${medio - r} Q ${x1} ${medio} ${x1 + r * hacia} ${medio} `
    + `L ${x2 - r * hacia} ${medio} Q ${x2} ${medio} ${x2} ${medio + r} L ${x2} ${y2}`
}

/* El lateral no baja: sale del costado del cuadro, a la altura del cuerpo de la tarjeta. */
function alCostado(padre, lateral, aLaIzquierda) {
  const y = lateral.y + 26
  const x1 = aLaIzquierda ? padre.x : padre.x + padre.w
  const x2 = aLaIzquierda ? lateral.x + lateral.w : lateral.x
  return `M ${x1} ${padre.y + Math.min(26, padre.h / 2)} L ${x1} ${y} L ${x2} ${y}`
}

export default function OrgGrafico({ tree, onAbrirCargo, desplazamientos, onMover, onAcomodar }) {
  const { canvasRef, stageRef, zoom, setZoom, arrastrando, empezarArrastre, ajustar, estiloStage } =
    useLienzo({ tree, ignorarPan: '[data-no-pan]' })
  const pliegue = usePliegue()

  /* El recuadro de ayuda se cierra y queda como burbuja. Se recuerda entre sesiones porque a
     la tercera vez que uno lo lee ya no lo necesita, y volver a cerrarlo cada vez que entra a
     la pantalla lo convierte en un estorbo con instrucciones. */
  const [ayudaAbierta, setAyudaAbierta] = useLocalStorage('organigramaAyuda', true)

  /* Lo que se lleva movido el cuadro que está en la mano AHORA, aparte del corrimiento ya
     guardado: mientras no se suelte, todavía no pasó nada. */
  const [vivo, setVivo] = useState(null)
  const [trazos, setTrazos] = useState([])
  /* Las aristas como pares de ELEMENTOS: con ellas se rehace una línea suelta sin volver a
     recorrer el DOM entero en cada movimiento del puntero. */
  const aristas = useRef([])
  const gesto = useRef(null)
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom

  const corrimiento = useCallback(clave => {
    const guardado = desplazamientos?.[clave]
    if (vivo?.clave !== clave) return guardado
    return { dx: (guardado?.dx || 0) + vivo.dx, dy: (guardado?.dy || 0) + vivo.dy }
  }, [desplazamientos, vivo])

  const medidor = useCallback(() => {
    const base = stageRef.current.getBoundingClientRect()
    return el => {
      const r = el.getBoundingClientRect()
      return {
        x: (r.left - base.left) / zoom,
        y: (r.top - base.top) / zoom,
        w: r.width / zoom,
        h: r.height / zoom,
      }
    }
  }, [zoom, stageRef])

  const trazoDe = (arista, caja) => (arista.lateral
    ? alCostado(caja(arista.padre), caja(arista.hijo), arista.aLaIzquierda)
    : codo(caja(arista.padre), caja(arista.hijo)))

  /* Las líneas salen del DOM y no de los ids del árbol: una misma unidad puede abrir píldora en
     dos lugares distintos, así que los ids se repiten y los elementos no. Cada `li` sabe quién
     es su padre —el `li` que lo contiene— y eso es todo el árbol. */
  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const caja = medidor()
    const propio = li => li.querySelector(':scope > .og-nodo > .og-card, :scope > .og-nodo > .og-unidad, :scope > .og-nodo > .og-empresa')
    const lista = []
    for (const li of stage.querySelectorAll('.og-tree li')) {
      const hijo = propio(li)
      if (!hijo) continue
      const padreLi = li.parentElement?.closest('li')
      const padre = padreLi && propio(padreLi)
      if (padre) lista.push({ id: `m${lista.length}`, padre, hijo, lateral: false })

      for (const bloque of li.querySelectorAll(':scope > .og-nodo > .og-staff')) {
        const aLaIzquierda = bloque.classList.contains('og-staff-izq')
        for (const tarjeta of bloque.querySelectorAll(':scope > .og-card')) {
          lista.push({ id: `l${lista.length}`, padre: hijo, hijo: tarjeta, lateral: true, aLaIzquierda })
        }
      }
    }
    aristas.current = lista
    setTrazos(lista.map(a => ({ id: a.id, d: trazoDe(a, caja) })))
  }, [tree, zoom, desplazamientos, stageRef, pliegue.plegados, medidor])

  /* Mientras algo va en la mano solo se rehacen sus líneas. Con una unidad no alcanza: se mueve
     la rama entera y todas las de adentro cambian de sitio. */
  useLayoutEffect(() => {
    if (!vivo || !stageRef.current) return
    const caja = medidor()
    if (vivo.grupo) {
      setTrazos(aristas.current.map(a => ({ id: a.id, d: trazoDe(a, caja) })))
      return
    }
    const el = stageRef.current.querySelector(`[data-clave="${vivo.clave}"]`)
    if (!el) return
    setTrazos(previos => previos.map((t, i) => {
      const a = aristas.current[i]
      if (!a || (a.padre !== el && a.hijo !== el)) return t
      return { id: t.id, d: trazoDe(a, caja) }
    }))
  }, [vivo, medidor, stageRef])

  const tomar = (clave, grupo, e) => {
    if (e.button !== undefined && e.button !== 0) return
    gesto.current = { clave, grupo, x0: e.clientX, y0: e.clientY, activo: false }
  }

  useEffect(() => {
    const mover = e => {
      const g = gesto.current
      if (!g) return
      if (!g.activo && Math.hypot(e.clientX - g.x0, e.clientY - g.y0) < UMBRAL) return
      g.activo = true
      g.x = e.clientX
      g.y = e.clientY
      setVivo({
        clave: g.clave,
        grupo: g.grupo,
        dx: (e.clientX - g.x0) / zoomRef.current,
        dy: (e.clientY - g.y0) / zoomRef.current,
      })
    }
    const soltar = () => {
      const g = gesto.current
      /* Acomodar se acepta siempre: no crea ni cambia nada, así que descartarlo por soltar
         encima de un panel se sentiría como que la pieza "no se puede mover". */
      if (g?.activo) {
        onMover?.(g.clave, {
          dx: (g.x - g.x0) / zoomRef.current,
          dy: (g.y - g.y0) / zoomRef.current,
        })
      }
      gesto.current = null
      setVivo(null)
    }
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', soltar)
    window.addEventListener('pointercancel', soltar)
    return () => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', soltar)
      window.removeEventListener('pointercancel', soltar)
    }
  }, [onMover])

  const acomodo = onMover ? { corrimiento, tomar, enMano: vivo?.clave ?? null } : null
  const movidos = Object.keys(desplazamientos || {}).length
  const lienzoDim = stageRef.current
    ? { w: stageRef.current.offsetWidth, h: stageRef.current.offsetHeight }
    : { w: 0, h: 0 }

  return (
    <div
      ref={canvasRef}
      className={`og-canvas${arrastrando ? ' og-canvas-drag' : ''}`}
      onMouseDown={empezarArrastre}
    >
      <div ref={stageRef} className="og-stage" style={estiloStage}>
        {/* La línea de mando, dibujada. Va debajo de los cuadros y no recibe clics: es el
            dibujo de una relación que se cambia en el formulario, no tocando la línea. */}
        <svg className="og-mando" width={lienzoDim.w} height={lienzoDim.h}>
          {trazos.map(t => <path key={t.id} d={t.d} className="og-mando-linea" />)}
        </svg>

        <ul className="og-tree og-tree-libre">
          <Rama nodo={tree} onAbrir={onAbrirCargo} pliegue={pliegue} acomodo={acomodo} />
        </ul>
      </div>

      {/* Qué significa lo que se ve y qué se puede hacer, en el mismo recuadro: son las dos
          mitades de la misma pregunta y separarlas apilaba dos paneles sobre el dibujo. */}
      {ayudaAbierta ? (
        <div className="og-atajos">
          <button className="og-atajos-x" onClick={() => setAyudaAbierta(false)} title="Esconder la ayuda">
            <X size={12} />
          </button>

          <LeyendaColores />
          <div className="og-atajos-sep" />
          <div className="og-atajos-hd"><Lightbulb size={11} /> Atajos</div>
          <div className="og-atajo"><Hand size={10} /> Arrastra un cuadro → Acomodarlo</div>
          <div className="og-atajo"><Move size={10} /> Arrastra el fondo → Mover la vista</div>
          <div className="og-atajo"><ScanSearch size={10} /> Rueda → Zoom</div>
          <div className="og-atajo"><MousePointer2 size={10} /> Doble clic → Ver detalle</div>
          <div className="og-atajo"><ChevronsDownUp size={10} /> Flecha del cuadro → Plegar rama</div>

          {/* Los dos botones aparecen solo cuando hay algo que deshacer: uno para revertir lo
              que nadie hizo enseña a ignorar la fila donde vive. */}
          {pliegue.plegados.size > 0 && (
            <button className="og-atajo og-atajo-btn" onClick={pliegue.abrirTodo}>
              <Maximize2 size={10} /> Abrir las {pliegue.plegados.size} ramas plegadas
            </button>
          )}
          {movidos > 0 && (
            <button className="og-atajo og-atajo-btn" onClick={onAcomodar}>
              <Wand2 size={10} /> Reacomodar solo ({movidos} a mano)
            </button>
          )}
        </div>
      ) : (
        /* Cerrada, la ayuda no desaparece: se encoge a una burbuja en el mismo lugar. Si se
           fuera del todo, el que la cerró sin querer se queda sin la leyenda y sin forma de
           saber que existía. */
        <button
          className="og-ayuda-burbuja"
          onClick={() => setAyudaAbierta(true)}
          title="Cómo se lee el organigrama y atajos"
        >
          <Lightbulb size={17} />
        </button>
      )}

      <div className="og-zoom">
        <button onClick={() => setZoom(z => Math.max(ZOOM_MIN, z - 0.1))} title="Alejar"><Minus size={13} /></button>
        <span className="og-zoom-val">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(ZOOM_MAX, z + 0.1))} title="Acercar"><Plus size={13} /></button>
        <button onClick={() => ajustar()} title="Ver todo el organigrama"><Home size={13} /></button>
      </div>
    </div>
  )
}
