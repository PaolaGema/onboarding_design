import { toPng, toSvg } from 'html-to-image'

/* Sacar el organigrama de la pantalla. Son tres formatos porque son tres usos distintos:
   la imagen que se pega en una presentación, el archivo que escala sin pixelarse, y el papel.

   Lo que se captura es el ÁRBOL (`.og-tree`), no el lienzo: el lienzo lleva el zoom y el
   desplazamiento con los que uno estaba mirando, y exportar "lo que se ve" significa exportar
   un organigrama cortado por los bordes de la ventana. La librería clona el nodo, así que la
   transformación del escenario que está por encima no viaja: sale entero y a tamaño natural
   aunque en pantalla esté al 30%. */

/* Qué se captura. En el organigrama de solo lectura, el ÁRBOL: el lienzo lleva el zoom y el
   desplazamiento con los que uno estaba mirando, y exportar "lo que se ve" significa exportar
   un organigrama cortado por los bordes de la ventana.

   En la pizarra hay que subir un escalón, hasta el escenario, porque ahí las líneas de mando
   se dibujan en un SVG que es hermano del árbol y no parte de él: capturando solo el árbol
   saldrían los cuadros sin una sola línea. El zoom del escenario se anula en el clon. */
const dibujo = () => document.querySelector('.og-page .og-stage:has(.og-mando)')
  || document.querySelector('.og-page .og-tree')

/* El fondo tiene que ir explícito: el árbol es transparente y sin esto la imagen sale con el
   fondo del visor, que en un PNG pegado sobre una diapositiva oscura deja los nombres
   ilegibles. */
/* Aire alrededor del árbol. Va sumado al alto y al ancho a mano: el relleno se aplica al clon
   pero el tamaño del lienzo se calcula ANTES, sobre el nodo original, y sin sumarlo la última
   fila de cargos sale cortada por el borde de abajo. */
const MARGEN = 24

const opciones = () => ({
  backgroundColor: getComputedStyle(document.body).getPropertyValue('--surface-card')?.trim() || '#ffffff',
  pixelRatio: 2,
  /* La tipografía viene de Google Fonts, que es otro dominio: el navegador no deja leer esa
     hoja para incrustarla y la librería se queda en el intento. Se salta el embebido y la
     familia se declara a mano en el nodo exportado. */
  skipFonts: true,
  style: {
    margin: '0',
    padding: `${MARGEN}px`,
    fontFamily: getComputedStyle(document.body).fontFamily,
    /* El escenario de la pizarra viaja con el zoom y el desplazamiento puestos; en el clon se
       anulan para que salga entero y a tamaño natural. */
    transform: 'none',
    position: 'static',
  },
})

const medidas = nodo => ({
  width: nodo.scrollWidth + MARGEN * 2,
  height: nodo.scrollHeight + MARGEN * 2,
})

const bajar = (url, nombre) => {
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
}

const nombreArchivo = (empresa, ext) => {
  const limpio = empresa.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')
  const hoy = new Date().toISOString().slice(0, 10)
  return `organigrama-${limpio}-${hoy}.${ext}`
}

export async function exportarPNG(empresa) {
  const nodo = dibujo()
  if (!nodo) return
  bajar(await toPng(nodo, { ...opciones(), ...medidas(nodo) }), nombreArchivo(empresa, 'png'))
}

export async function exportarSVG(empresa) {
  const nodo = dibujo()
  if (!nodo) return
  bajar(await toSvg(nodo, { ...opciones(), ...medidas(nodo) }), nombreArchivo(empresa, 'svg'))
}

/* Imprimir va por el navegador y no por la librería: el diálogo de impresión ya trae "Guardar
   como PDF", y ese PDF sale con el texto de verdad —se puede buscar y copiar— en vez de una
   foto del texto. Lo que hace falta es una hoja de estilos que esconda la aplicación y deje el
   árbol a tamaño natural; vive en `@media print`. */
export function imprimir() {
  window.print()
}
