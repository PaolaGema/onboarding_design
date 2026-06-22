import { createContext, useContext, useState } from 'react'

const users = [
  { id: 1, name: 'Juan Pérez Gómez', role: 'admin', roleLabel: 'Administrador HR', initials: 'JP', color: '#0C2D40' },
  { id: 2, name: 'María López Torres', role: 'colaborador', roleLabel: 'Colaboradora Web — Ventas', initials: 'ML', color: '#7c3aed' },
  { id: 3, name: 'Ana Martínez Ruiz', role: 'manager', roleLabel: 'Líder de Área — Marketing', initials: 'AM', color: '#c026d3' },
  { id: 4, name: 'Carlos Mendoza Ríos', role: 'colaborador', roleLabel: 'Colaborador Mobile — Tecnología', initials: 'CM', color: '#f59e0b' },
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
