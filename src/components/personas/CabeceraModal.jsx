import { X } from 'lucide-react'

/* La cabecera de los modales del organigrama. Existe porque son cinco y todos la repetían: el
   bloque del ícono son ocho líneas de estilos en línea, y copiado cinco veces se desalinea a la
   primera que alguien toque una.

   Las clases son las del resto del producto (`pl-*`), no unas propias. El organigrama se había
   armado su propio sistema de modales —`og-modal`, con otra cabecera, otros botones y otro
   ancho— y quedaba como una pantalla de otra aplicación al lado de las demás. */
export default function CabeceraModal({ Icon, titulo, onCerrar }) {
  return (
    <div className="pl-modal-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} style={{ color: '#fff' }} />
        </div>
        <h2>{titulo}</h2>
      </div>
      <button className="pl-modal-close" onClick={onCerrar}>
        <X size={18} />
      </button>
    </div>
  )
}
