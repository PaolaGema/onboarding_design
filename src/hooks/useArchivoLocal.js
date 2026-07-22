import { useState, useEffect } from 'react'
import { leerArchivo } from '../utils/archivosLocales'

/* Devuelve una URL reproducible para un archivo guardado en el navegador, o null si no hay.

   Guarda la clave junto a la URL y compara al devolver, en vez de limpiar el estado apenas
   cambia la clave. Así nunca se sirve la URL del archivo anterior mientras se lee el nuevo
   —que en una biblioteca de videos significaría mostrar el que no es— y el efecto no necesita
   llamar a setState de entrada, que dispara renders en cascada.

   La URL se revoca al desmontar: cada `createObjectURL` retiene el blob en memoria hasta que
   se libera, y con varios videos abiertos eso se acumula. */
export function useArchivoLocal(clave) {
  const [entrada, setEntrada] = useState({ clave: null, url: null })

  useEffect(() => {
    if (!clave) return
    let vigente = true
    let creada = null
    leerArchivo(clave).then(file => {
      if (!vigente || !file) return
      creada = URL.createObjectURL(file)
      setEntrada({ clave, url: creada })
    })
    return () => {
      vigente = false
      if (creada) URL.revokeObjectURL(creada)
    }
  }, [clave])

  return entrada.clave === clave ? entrada.url : null
}
