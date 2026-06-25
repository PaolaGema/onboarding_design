import { useState, useCallback } from 'react'

const PREFIX = 'onb_demo_'

export function useLocalStorage(key, initialValue) {
  const prefixedKey = PREFIX + key

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(prefixedKey)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    setStoredValue(prev => {
      const next = typeof value === 'function' ? value(prev) : value
      try {
        localStorage.setItem(prefixedKey, JSON.stringify(next))
      } catch { /* quota exceeded — ignore */ }
      return next
    })
  }, [prefixedKey])

  return [storedValue, setValue]
}

export function clearAllDemoData() {
  const keys = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k.startsWith(PREFIX)) keys.push(k)
  }
  keys.forEach(k => localStorage.removeItem(k))
}
