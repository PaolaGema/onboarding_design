import { createContext, useContext } from 'react'
import { useOnboardingData } from './OnboardingDataContext'

const ConfigContext = createContext()

export function ConfigProvider({ children }) {
  const { configToggles, setConfigToggles } = useOnboardingData()

  const gamificacion = configToggles.gamificacion
  const asistenteIA = configToggles.buddy

  function setGamificacion(val) {
    setConfigToggles(prev => ({ ...prev, gamificacion: val }))
  }
  function setAsistenteIA(val) {
    setConfigToggles(prev => ({ ...prev, buddy: val }))
  }

  return (
    <ConfigContext.Provider value={{ gamificacion, setGamificacion, asistenteIA, setAsistenteIA }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  return useContext(ConfigContext)
}
