import { createContext, useContext } from 'react'
import { useOnboardingData } from './OnboardingDataContext'

const TroncoContext = createContext()

export function TroncoProvider({ children }) {
  const { tronco, setTronco } = useOnboardingData()

  function saveTronco(etapas) {
    setTronco({ configured: true, etapas })
  }

  function resetTronco() {
    setTronco({ configured: false, etapas: [] })
  }

  return (
    <TroncoContext.Provider value={{ tronco, saveTronco, resetTronco }}>
      {children}
    </TroncoContext.Provider>
  )
}

export function useTronco() {
  return useContext(TroncoContext)
}
