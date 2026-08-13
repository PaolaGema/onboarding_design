import { ArrowRight, Route } from 'lucide-react'
import { estadoRuta } from '../../utils/rutaEstados'

/* Piezas de los modales que explican un cambio antes de aplicarlo (RN-M60 y los cambios de
   alcance). Viven juntas porque las dos pantallas cuentan lo mismo —qué ruta se apaga, qué
   ruta queda, qué se conserva— y escritas por separado empezaban a divergir en tamaños y
   tonos justo donde el usuario compara una con otra. */

export const Rotulo = ({ children, style }) => (
  <div style={{
    fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
    color: 'var(--text-muted)', marginBottom: 7, ...style,
  }}>
    {children}
  </div>
)

/* El estado de origen va atenuado y el de destino a color pleno: la jerarquía
   dice por sí sola cuál de los dos es el que va a quedar. */
export const Pildora = ({ estado, apagada }) => {
  const e = estadoRuta(estado)
  return (
    <span style={{
      fontSize: 9.5, fontWeight: 700, padding: '3px 8px', borderRadius: 20, whiteSpace: 'nowrap',
      background: e.bg, color: e.color, opacity: apagada ? 0.5 : 1,
    }}>
      {e.label}
    </span>
  )
}

export const Nota = ({ icon: Icon, children }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 12,
    padding: '10px 12px', borderRadius: 10, background: 'var(--bg-secondary)',
  }}>
    <Icon size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
    <span style={{ fontSize: 11.5, color: '#0C2D40', lineHeight: 1.55 }}>{children}</span>
  </div>
)

/* Una ruta con su transición de estado.

   El nombre ocupa el ancho completo y la transición va debajo, y no los dos en la misma
   línea: compartiendo renglón con las píldoras, los nombres largos —que en este producto son
   la norma— se truncaban a "Onboarding Finanzas…" en todas las filas, y quedaban idénticos
   justo en el modal que existe para distinguirlas. */
export const FilaRuta = ({ r, de, a, entrante, meta }) => (
  <div style={{
    padding: '11px 12px', borderRadius: 10,
    background: entrante ? 'var(--green-tint)' : 'var(--bg-secondary)',
    border: `1px solid ${entrante ? 'rgba(22,163,74,.25)' : 'var(--surface-hover)'}`,
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: entrante ? 'rgba(22,163,74,.16)' : 'var(--surface-hover)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Route size={14} style={{ color: entrante ? 'var(--green)' : 'var(--text-muted)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0C2D40', lineHeight: 1.35 }}>
          {r.name}
        </div>
        <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {meta}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
          <Pildora estado={de} apagada />
          <ArrowRight size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <Pildora estado={a} />
        </div>
      </div>
    </div>
  </div>
)
