import { createContext, useContext, useState } from 'react'

const TroncoContext = createContext()

const defaultTronco = {
  configured: false,
  etapas: [],
}

export function TroncoProvider({ children }) {
  const [tronco, setTronco] = useState(defaultTronco)

  function saveTronco(etapas) {
    setTronco({ configured: true, etapas })
  }

  function resetTronco() {
    setTronco(defaultTronco)
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
