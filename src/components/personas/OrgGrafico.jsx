import { useCallback, useEffect, useRef, useState } from 'react'
import { User, Star, Plus, Minus, Home, Move, MousePointer2, Lightbulb, ScanSearch } from 'lucide-react'

const ZOOM_MIN = 0.4
const ZOOM_MAX = 1.6

function Ocupante({ nodo }) {
  if (nodo.vacante) {
    return <div className="og-chip og-chip-vacio">Sin colaborador asignado</div>
  }
  const p = nodo.ocupante
  return (
    <div className="og-chip">
      <span className="og-chip-av" style={{ background: p.color }}>{p.initials}</span>
      <span className="og-chip-name">{p.name}</span>
    </div>
  )
}

function TarjetaCargo({ nodo, onAbrir }) {
  const { cargo, vacante } = nodo
  const clases = ['og-card']
  if (vacante) clases.push('og-card-vacante')
  if (cargo.tipo === 'staff') clases.push('og-card-staff')

  return (
    <div
      className={clases.join(' ')}
      onDoubleClick={() => onAbrir?.(nodo)}
      title="Doble clic para ver el detalle"
    >
      {cargo.destacado && <Star size={11} className="og-card-star" />}
      {vacante && <span className="og-card-tag">Vacante</span>}
      <div className="og-card-title">
        <User size={11} className="og-card-ico" />
        <span>{cargo.nombre}</span>
      </div>
      <Ocupante nodo={nodo} />
    </div>
  )
}

function Nodo({ nodo, onAbrir }) {
  if (nodo.tipo === 'empresa') return <div className="og-empresa">{nodo.empresa.nombre}</div>
  if (nodo.tipo === 'unidad') return <div className="og-unidad">{nodo.unidad.nombre}</div>
  return <TarjetaCargo nodo={nodo} onAbrir={onAbrir} />
}

function Rama({ nodo, onAbrir }) {
  const hijos = nodo.hijos || []
  const staff = nodo.staff || []
  return (
    <li>
      <div className="og-nodo">
        <Nodo nodo={nodo} onAbrir={onAbrir} />
        {staff.length > 0 && (
          <div className="og-staff">
            {staff.map(s => <TarjetaCargo key={s.id} nodo={s} onAbrir={onAbrir} />)}
          </div>
        )}
      </div>
      {hijos.length > 0 && (
        <ul>{hijos.map(h => <Rama key={h.id} nodo={h} onAbrir={onAbrir} />)}</ul>
      )}
    </li>
  )
}

export default function OrgGrafico({ tree, onAbrirCargo }) {
  const canvasRef = useRef(null)
  const stageRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [arrastrando, setArrastrando] = useState(false)
  const origen = useRef({ x: 0, y: 0 })

  /* Un organigrama real no entra a escala 1:1 en una pantalla, así que la vista arranca
     ajustada al ancho. `offsetWidth` mide sin transformar, o sea el tamaño natural. */
  const ajustar = useCallback(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!canvas || !stage || !stage.offsetWidth) return
    const escala = (canvas.clientWidth - 56) / stage.offsetWidth
    setZoom(Math.max(ZOOM_MIN, Math.min(1, escala)))
    setPan({ x: 0, y: 0 })
  }, [])

  useEffect(() => { ajustar() }, [tree, ajustar])

  // La rueda hace zoom en vez de scrollear, así que el listener va nativo: React
  // registra onWheel como pasivo y ahí preventDefault() no tiene efecto.
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const onWheel = e => {
      e.preventDefault()
      setZoom(z => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z - e.deltaY * 0.0012)))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  useEffect(() => {
    if (!arrastrando) return
    const mover = e => setPan({ x: e.clientX - origen.current.x, y: e.clientY - origen.current.y })
    const soltar = () => setArrastrando(false)
    window.addEventListener('mousemove', mover)
    window.addEventListener('mouseup', soltar)
    return () => {
      window.removeEventListener('mousemove', mover)
      window.removeEventListener('mouseup', soltar)
    }
  }, [arrastrando])

  const empezarArrastre = e => {
    if (e.button !== 0) return
    origen.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
    setArrastrando(true)
  }

  return (
    <div
      ref={canvasRef}
      className={`og-canvas${arrastrando ? ' og-canvas-drag' : ''}`}
      onMouseDown={empezarArrastre}
    >
      <div
        ref={stageRef}
        className="og-stage"
        style={{ transform: `translate(calc(-50% + ${pan.x}px), ${pan.y}px) scale(${zoom})` }}
      >
        <ul className="og-tree">
          <Rama nodo={tree} onAbrir={onAbrirCargo} />
        </ul>
      </div>

      <div className="og-atajos">
        <div className="og-atajos-hd"><Lightbulb size={11} /> Atajos</div>
        <div className="og-atajo"><Move size={10} /> Arrastra el fondo → Mover</div>
        <div className="og-atajo"><ScanSearch size={10} /> Rueda → Zoom</div>
        <div className="og-atajo"><MousePointer2 size={10} /> Doble clic → Ver detalle</div>
      </div>

      <div className="og-zoom">
        <button onClick={() => setZoom(z => Math.max(ZOOM_MIN, z - 0.1))} title="Alejar"><Minus size={13} /></button>
        <span className="og-zoom-val">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(ZOOM_MAX, z + 0.1))} title="Acercar"><Plus size={13} /></button>
        <button onClick={ajustar} title="Ajustar a la pantalla"><Home size={13} /></button>
      </div>
    </div>
  )
}
