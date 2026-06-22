import { createContext, useContext, useState } from 'react'

const ConfigContext = createContext()

export function ConfigProvider({ children }) {
  const [gamificacion, setGamificacion] = useState(true)

  return (
    <ConfigContext.Provider value={{ gamificacion, setGamificacion }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  return useContext(ConfigContext)
}
