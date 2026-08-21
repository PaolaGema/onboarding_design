import { Palette } from 'lucide-react'

/* Qué significa cada color del dibujo.

   El organigrama pinta dos cosas distintas y hasta acá no lo decía en ninguna parte: el COLOR
   dice de qué tipo es el puesto —interno, staff, tercerizado— y la ETIQUETA dice si le falta
   quien lo cubra. Sin leyenda, un cuadro violeta se lee como "algo raro pasa acá" y la duda
   que aparece sola es si ese violeta significa que el puesto está vacante.

   Nunca en un panel propio: comparte el recuadro con los atajos. Los dos contestan la misma
   pregunta —cómo se lee esto— y dos flotantes apilados tapan el dibujo que vienen a explicar.

   Las muestras usan los mismos colores que las tarjetas de verdad y no una copia: si mañana
   cambia el violeta del outsourcing, cambia en los dos lados a la vez. */

const TIPOS = [
  { key: 'interno', label: 'Interno', desc: 'en planilla' },
  { key: 'staff', label: 'Staff', desc: 'asiste sin mandar' },
  { key: 'ext', label: 'Outsourcing', desc: 'prestador de servicios' },
]

export default function LeyendaColores() {
  return (
    <div className="og-lc">
      <div className="og-lc-hd"><Palette size={11} /> Cómo se lee</div>

      <div className="og-lc-rot">El color dice el tipo de puesto</div>
      {TIPOS.map(t => (
        <div key={t.key} className="og-lc-fila">
          <span className={`og-lc-muestra og-lc-${t.key}`} />
          <span className="og-lc-txt"><strong>{t.label}</strong> · {t.desc}</span>
        </div>
      ))}

      <div className="og-lc-rot">La etiqueta dice si falta cubrirlo</div>
      <div className="og-lc-fila">
        <span className="og-lc-tag">Vacante</span>
        <span className="og-lc-txt">Sin ocupante ni prestador asignado</span>
      </div>
    </div>
  )
}
