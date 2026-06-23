import { createContext, useContext, useState } from 'react'

const users = [
  { id: 1, name: 'Juan Pérez Gómez', role: 'admin', roleLabel: 'Administrador HR', initials: 'JP', color: '#0C2D40' },
  { id: 2, name: 'María López Torres', role: 'colaborador', roleLabel: 'Colaboradora Web — Ventas', initials: 'ML', color: '#7c3aed' },
  { id: 3, name: 'Ana Martínez Ruiz', role: 'manager', roleLabel: 'Líder de Área — Marketing', initials: 'AM', color: '#c026d3' },
  { id: 4, name: 'Carlos Mendoza Ríos', role: 'colaborador', roleLabel: 'Colaborador Mobile — Tecnología', initials: 'CM', color: '#f59e0b' },
  { id: 5, name: 'Nicolás Zapata Silva', role: 'colaborador', roleLabel: 'Ejecutivo Senior — Ventas', initials: 'NZ', color: '#84cc16', onbNA: true },
  { id: 6, name: 'Laura Díaz Romero', role: 'auxiliar', roleLabel: 'Auxiliar — Marketing', initials: 'LD', color: '#14b8a6', area: 'Marketing', delegadoPor: 'Ana Martínez Ruiz' },
]

const UserContext = createContext()

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(users[0])
  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, users }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
