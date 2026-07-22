import { ChevronLeft } from 'lucide-react'

/* Cabecera de las sub-pantallas del teléfono: la barra inferior sigue visible porque no
   saliste de la pestaña, pero hace falta una salida explícita hacia el nivel de arriba. */
export default function BarraVolver({ texto, onVolver }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <button
        onClick={onVolver}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 20, height: 20, borderRadius: 7, border: '1px solid #e2e8f0',
          background: '#fff', color: '#0C2D40', cursor: 'pointer', padding: 0, flexShrink: 0,
        }}
      >
        <ChevronLeft size={11} />
      </button>
      <span style={{ fontSize: 8.5, fontWeight: 700, color: '#0C2D40' }}>{texto}</span>
    </div>
  )
}
