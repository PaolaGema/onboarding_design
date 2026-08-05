import { avatarUrl } from '../../utils/calendarEvents'

/* Las caras de quienes están dentro de algo, superpuestas y con un "+N" al final.

   Existe porque un párrafo no se lee. "2 colaboradores están haciendo esta ruta" es cierto y
   nadie lo registra; dos caras al lado del nombre de la ruta se ven sin leer, y eso es lo que
   hace que quien va a editarla sepa que hay gente adentro antes de tocar nada.

   El "+N" no es una cara más: es un número, porque tres fotos borrosas de 22 px no informan
   más que un dígito y sí ocupan el mismo lugar. */
export default function PilaAvatares({ personas = [], max = 3, size = 24, titulo }) {
  if (!personas.length) return null
  const visibles = personas.slice(0, max)
  const restantes = personas.length - visibles.length
  // El anillo del color del fondo separa una cara de la siguiente sin dibujar un borde.
  const anillo = { borderRadius: '50%', border: '2px solid var(--surface-card)', flexShrink: 0 }

  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'center' }}
      title={titulo || personas.map(p => p.nombre).join(', ')}
    >
      {visibles.map((p, i) => (
        <div
          key={p.nombre || i}
          style={{
            ...anillo, width: size, height: size, overflow: 'hidden',
            background: p.color || 'var(--navy)',
            marginLeft: i === 0 ? 0 : -size / 3,
            zIndex: max - i,
          }}
        >
          <img
            src={avatarUrl(p.nombre, size * 2)}
            alt={p.nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        </div>
      ))}
      {restantes > 0 && (
        <div style={{
          ...anillo, height: size, minWidth: size, marginLeft: -size / 3,
          padding: '0 5px', background: 'var(--surface-hover)', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.42, fontWeight: 700,
        }}>
          +{restantes}
        </div>
      )}
    </div>
  )
}
