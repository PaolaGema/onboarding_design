import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

/* Edición en el lugar: el dato se ve como texto y se convierte en campo recién al tocarlo.
   Es lo contrario de un formulario siempre abierto —una pantalla que existe para leer no
   debería verse como una planilla de carga— y evita el salto de modo, donde todo el panel
   cambiaba de cara para corregir una palabra.

   Sin botón de guardar: el texto confirma al salir del campo y la lista al elegir. Un
   "Guardar" acá obligaría a un paso extra por cada corrección suelta, que es justo lo que
   este patrón viene a sacar. */

export function TextoEnLinea({ value, onChange, placeholder, multilinea = false, editable = true, estilo }) {
  const [foco, setFoco] = useState(false)
  const [borrador, setBorrador] = useState(value)
  const ref = useRef(null)

  // Si el valor cambia desde afuera mientras no se está editando, seguirlo.
  useEffect(() => { if (!foco) setBorrador(value) }, [value, foco])

  if (!editable) {
    return <div style={{ ...estilo, padding: '3px 6px' }}>{value || placeholder}</div>
  }

  const confirmar = () => {
    setFoco(false)
    const limpio = (borrador || '').trim()
    if (limpio !== (value || '').trim()) onChange(limpio)
  }

  const comun = {
    ref,
    value: borrador ?? '',
    placeholder,
    onFocus: () => setFoco(true),
    onBlur: confirmar,
    onChange: e => setBorrador(e.target.value),
    className: 'cel-campo',
    style: { ...estilo, resize: multilinea ? 'vertical' : undefined },
  }

  return multilinea
    ? <textarea {...comun} rows={2} />
    : <input
        {...comun}
        type="text"
        onKeyDown={e => {
          if (e.key === 'Enter') e.currentTarget.blur()
          // Escape descarta: es la salida esperada cuando te arrepentiste a mitad de escribir.
          if (e.key === 'Escape') { setBorrador(value); e.currentTarget.blur() }
        }}
      />
}

export function ListaEnLinea({ value, opciones, onChange, editable = true, placeholder = '—', desactivado = false }) {
  const [abierta, setAbierta] = useState(false)
  const caja = useRef(null)

  useEffect(() => {
    if (!abierta) return
    const fuera = e => { if (caja.current && !caja.current.contains(e.target)) setAbierta(false) }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [abierta])

  if (!editable || desactivado) {
    return <span style={{ padding: '3px 6px', color: '#334155', fontWeight: 600 }}>{value || placeholder}</span>
  }

  return (
    <span className="cel-lista" ref={caja}>
      <button type="button" className={`cel-campo cel-disparador${abierta ? ' on' : ''}`} onClick={() => setAbierta(v => !v)}>
        {value || placeholder}
        <ChevronDown size={11} className="cel-chevron" />
      </button>
      {abierta && (
        <div className="cel-menu">
          {opciones.map(o => (
            <button
              key={o}
              type="button"
              className={`cel-opcion${o === value ? ' on' : ''}`}
              onClick={() => { onChange(o); setAbierta(false) }}
            >
              <span>{o}</span>
              {o === value && <Check size={13} />}
            </button>
          ))}
          {opciones.length === 0 && <div className="cel-vacio">Sin opciones</div>}
        </div>
      )}
    </span>
  )
}
