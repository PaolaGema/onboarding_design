import { useRef, useState } from 'react'
import { HelpCircle } from 'lucide-react'

/* La explicación de un campo, escondida detrás de un "?".

   Escrita debajo del campo —que era como estaba— cada renglón pesa lo mismo que el campo que
   explica, y un formulario de cuatro bloques se lee como una pared de texto gris. Detrás del
   signo, el que ya sabe llena los campos de un tirón y el que duda tiene la frase a un roce
   del puntero. Solo se esconde lo que DESCRIBE el campo: lo que reacciona a lo que se acaba
   de elegir —"ya tiene gente a cargo", "viene elegida esta sede"— sigue a la vista, porque
   eso no es ayuda, es la respuesta a lo que se hizo recién.

   El globo se posiciona con `fixed` y no con `absolute` porque la columna de campos scrollea:
   dentro del panel se recortaba contra el borde en cuanto el campo quedaba abajo de todo. */

const ANCHO = 232

export default function AyudaCampo({ children }) {
  const ancla = useRef(null)
  const [pos, setPos] = useState(null)

  const abrir = () => {
    const r = ancla.current.getBoundingClientRect()
    setPos({
      top: r.bottom + 8,
      /* Pegado al icono, salvo que ahí no entre: contra el borde derecho de la ventana el
         globo se corre lo justo para caber entero. */
      left: Math.max(12, Math.min(r.left - 10, window.innerWidth - ANCHO - 14)),
    })
  }

  return (
    <span
      ref={ancla}
      className="og-ayuda"
      tabIndex={0}
      onMouseEnter={abrir}
      onMouseLeave={() => setPos(null)}
      onFocus={abrir}
      onBlur={() => setPos(null)}
    >
      <HelpCircle size={12} />
      {pos && (
        <span className="og-ayuda-globo" style={{ ...pos, width: ANCHO }} role="tooltip">
          {children}
        </span>
      )}
    </span>
  )
}
