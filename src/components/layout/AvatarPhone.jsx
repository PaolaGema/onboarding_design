import { useState } from 'react'
import { avatarUrl } from '../../utils/calendarEvents'

export const iniciales = n => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

/* Igual que `.ai-av` de escritorio: foto en círculo con borde. Las iniciales quedan debajo
   en vez de ocultarse, así una foto que no carga deja un avatar legible y no un disco vacío.
   Lo usan todas las pantallas de celular que listan personas. */
export default function AvatarPhone({ nombre, color, size = 30 }) {
  const [falla, setFalla] = useState(false)
  return (
    <span style={{
      position: 'relative', width: size, height: size, borderRadius: '50%',
      background: color, flexShrink: 0, overflow: 'hidden',
      border: '1.5px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: size * 0.34, fontWeight: 700, color: '#fff' }}>{iniciales(nombre)}</span>
      {!falla && (
        <img
          src={avatarUrl(nombre)}
          alt=""
          onError={() => setFalla(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </span>
  )
}
