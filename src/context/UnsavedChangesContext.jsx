import { createContext, useContext, useCallback, useRef, useState } from 'react'

const UnsavedChangesContext = createContext()

export function UnsavedChangesProvider({ children }) {
  const [dirty, setDirty] = useState(false)
  const [pendingNav, setPendingNav] = useState(null)
  const saveHandlerRef = useRef(null)

  const setSaveHandler = useCallback(fn => { saveHandlerRef.current = fn }, [])

  const guardNavigate = useCallback((navigateFn) => {
    if (!dirty) { navigateFn(); return }
    setPendingNav(() => navigateFn)
  }, [dirty])

  function confirmDiscard() {
    const fn = pendingNav
    setDirty(false)
    setPendingNav(null)
    fn?.()
  }

  function confirmSave() {
    saveHandlerRef.current?.()
    const fn = pendingNav
    setDirty(false)
    setPendingNav(null)
    fn?.()
  }

  function cancelExit() {
    setPendingNav(null)
  }

  return (
    <UnsavedChangesContext.Provider value={{
      dirty, setDirty, setSaveHandler, guardNavigate,
      exitConfirmOpen: !!pendingNav, confirmDiscard, confirmSave, cancelExit,
    }}>
      {children}
    </UnsavedChangesContext.Provider>
  )
}

export function useUnsavedChanges() {
  return useContext(UnsavedChangesContext)
}
