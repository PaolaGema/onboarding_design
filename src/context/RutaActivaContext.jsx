import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const RutaActivaContext = createContext()

export function RutaActivaProvider({ children }) {
  const [rutaActiva, setRutaActiva] = useLocalStorage('rutaActiva', null)
  const [rutaAdmin, setRutaAdmin] = useLocalStorage('rutaAdmin', null)

  function activarRuta(etapas, info) {
    setRutaActiva({
      etapas: JSON.parse(JSON.stringify(etapas)),
      nombre: info?.nombre || 'Mi ruta',
      area: info?.area || '',
      activadaEn: new Date().toISOString(),
    })
  }

  function actualizarEtapas(etapas) {
    setRutaActiva(prev => prev ? { ...prev, etapas: JSON.parse(JSON.stringify(etapas)) } : prev)
  }

  function resetRuta() {
    setRutaActiva(null)
  }

  return (
    <RutaActivaContext.Provider value={{ rutaActiva, rutaAdmin, activarRuta, actualizarEtapas, resetRuta }}>
      {children}
    </RutaActivaContext.Provider>
  )
}

export function useRutaActiva() {
  return useContext(RutaActivaContext)
}
