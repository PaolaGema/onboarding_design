/* Tarjeta de una persona en onboarding. La usan Seguimiento (RH y líderes) y Mis acompañados
   (buddy): quien mira cambia, la persona no, así que la ficha se ve igual en todo el módulo.

   Lo que sí cambia por pantalla entra como prop en vez de resolverse aquí dentro:
   - `badge` y `barColor`, porque el vocabulario de estados no es el mismo (una asignación
     puede estar "Pausada"; un colaborador del directorio, "Sin ruta").
   - `meta`, la línea de contexto sobre el botón: la ruta y el día para RH, las tareas
     pendientes para el buddy.
   - `acciones`, el menú "…", que solo existe donde se puede actuar sobre la asignación. */
import { avatarUrl } from '../../utils/calendarEvents'

export default function ColaboradorCard({ nombre, cargo, area, badge, pct, barColor, meta, onVerDetalles, acciones }) {
  return (
    <div style={{
      background: 'var(--surface-card)', border: '1px solid var(--border-soft)', borderRadius: 14,
      boxShadow: 'var(--shadow-card)', padding: 14, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Alineado arriba y no al centro: con tres líneas, el avatar y el badge deben
          quedar a la altura del nombre, no flotando a media tarjeta. */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div className="ai-av" style={{ width: 36, height: 36, flexShrink: 0 }}>
          <img
            src={avatarUrl(nombre)}
            alt={nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        </div>
        {/* Tres niveles: quién es, qué hace, dónde está. Cada dato en su línea para que
            un cargo largo no se coma el área, que es lo que pasaba al ir ambos juntos. */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nombre}</div>
          {cargo && (
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cargo}</div>
          )}
          {/* El área usa opacidad en vez de un color propio: así el tercer nivel de gris
              sigue funcionando cuando las variables cambian en modo oscuro. */}
          {area && (
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', opacity: .75, lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{area}</div>
          )}
          {/* El estado cuelga de la identidad, no de la esquina: compartir la fila con el
              "…" lo dejaba apretado con etiquetas largas ("Completado"), y aquí además cae
              alineado con el resto de los datos de la persona. */}
          {badge && <div style={{ marginTop: 6 }}>{badge}</div>}
        </div>
        {/* Arriba a la derecha queda solo el menú: es una acción sobre la persona, no sobre
            "Ver detalles", así que no vive al pie de la ficha. */}
        <div style={{ flexShrink: 0, alignSelf: 'flex-start' }}>{acciones}</div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avance de su onboarding</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)' }}>{pct}%</span>
        </div>
        <div className="pr-bar">
          <div className="pr-fill" style={{ width: `${pct}%`, background: barColor }} />
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {meta}
        <button
            onClick={onVerDetalles}
            style={{
              width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 0', borderRadius: 8, border: 'none', background: 'var(--navy)', color: '#fff',
              cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', transition: 'background .12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#16405a'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--navy)'}
          >
            Ver detalles
        </button>
      </div>
    </div>
  )
}
