import { createContext, useContext, useCallback, useEffect } from 'react'
import { useLocalStorage, clearAllDemoData } from '../hooks/useLocalStorage'

const OnboardingDataContext = createContext()

const sampleRecursos = [
  {
    name: 'Políticas',
    docs: [
      { id: 1, name: 'Código de conducta 2025.pdf', size: '2.4 MB', estado: 'procesado', fecha: '12 Jun 2026', general: true, subidoPor: 'Paola Gema' },
      { id: 2, name: 'Política de vacaciones.pdf', size: '1.1 MB', estado: 'procesado', fecha: '10 Jun 2026', general: true, subidoPor: 'Paola Gema' },
      { id: 3, name: 'Reglamento interno.docx', size: '3.8 MB', estado: 'procesado', fecha: '18 Jun 2026', general: true, subidoPor: 'Paola Gema' },
    ],
  },
  {
    name: 'Beneficios',
    docs: [
      { id: 4, name: 'Manual de beneficios.pdf', size: '4.2 MB', estado: 'procesado', fecha: '8 Jun 2026', general: true, subidoPor: 'Paola Gema' },
      { id: 5, name: 'Guía de seguro médico.pdf', size: '1.8 MB', estado: 'procesado', fecha: '5 Jun 2026', general: true, subidoPor: 'Paola Gema' },
    ],
  },
  {
    name: 'Cultura',
    docs: [
      { id: 8, name: 'Valores y misión.pdf', size: '1.5 MB', estado: 'procesado', fecha: '1 Jun 2026', general: true, subidoPor: 'Paola Gema' },
    ],
  },
]

const samplePlantillas = [
  { id: 1, name: 'Onboarding Ventas — Pasante', area: 'Ventas', cargo: 'Pasante Comercial', etapas: 12, tareas: 34, asignados: 8, status: 'activa', updated: 'Hace 2 días', color: '#3b82f6' },
  { id: 2, name: 'Onboarding Comercial — Ejecutivo', area: 'Comercial', cargo: 'Ejecutivo Comercial', etapas: 10, tareas: 28, asignados: 5, status: 'activa', updated: 'Hace 5 días', color: '#10b981' },
  { id: 3, name: 'Onboarding Liderazgo', area: 'Dirección', cargo: 'Director de Área', etapas: 8, tareas: 22, asignados: 2, status: 'activa', updated: 'Hace 1 semana', color: '#8b5cf6' },
  { id: 4, name: 'Onboarding Operaciones', area: 'Operaciones', cargo: 'Analista de Procesos', etapas: 9, tareas: 25, asignados: 3, status: 'activa', updated: 'Hace 1 semana', color: '#f59e0b' },
  { id: 5, name: 'Onboarding Tech — Backend', area: 'Tecnología', cargo: 'Desarrollador Backend', etapas: 14, tareas: 40, asignados: 4, status: 'activa', updated: 'Hace 3 días', color: '#06b6d4' },
  { id: 6, name: 'Onboarding Finanzas', area: 'Finanzas', cargo: 'Analista Financiera', etapas: 7, tareas: 18, asignados: 0, status: 'borrador', updated: 'Ayer', color: '#f97316' },
  { id: 7, name: 'Onboarding Diseño & UX', area: 'Diseño', cargo: 'Diseñadora UX/UI', etapas: 11, tareas: 30, asignados: 2, status: 'activa', updated: 'Hace 4 días', color: '#ec4899' },
  { id: 8, name: 'Onboarding RRHH — Generalista', area: 'Recursos Humanos', cargo: 'Generalista RRHH', etapas: 6, tareas: 15, asignados: 0, status: 'borrador', updated: 'Hace 2 semanas', color: '#0d9488' },
  { id: 9, name: 'Onboarding Marketing Digital', area: 'Marketing', cargo: 'Content Creator', etapas: 10, tareas: 26, asignados: 1, status: 'activa', updated: 'Hace 6 días', color: '#d946ef' },
  { id: 10, name: 'Onboarding Legal 2025', area: 'Legal', cargo: 'Abogado Corporativo', etapas: 5, tareas: 12, asignados: 0, status: 'archivada', updated: 'Hace 3 meses', color: '#64748b' },
]

const sampleAsignaciones = [
  { id: 1, nombre: 'Diego Morales', area: 'Tecnología', ruta: 'Onboarding Tech — Backend', dia: 14, totalDias: 30, pct: 68, status: 'en-curso', fechaInicio: '03 Jun 2026', color: '#3b82f6' },
  { id: 2, nombre: 'Camila Herrera', area: 'Ventas', ruta: 'Onboarding Ventas — Pasante', dia: 18, totalDias: 30, pct: 42, status: 'en-curso', fechaInicio: '30 May 2026', color: '#f97316' },
  { id: 3, nombre: 'Valentina Cruz', area: 'Diseño', ruta: 'Onboarding Diseño & UX', dia: 20, totalDias: 30, pct: 25, status: 'atrasado', fechaInicio: '28 May 2026', color: '#ec4899' },
  { id: 4, nombre: 'Facundo Medina', area: 'Tecnología', ruta: 'Onboarding Tech — Backend', dia: 21, totalDias: 30, pct: 15, status: 'en-riesgo', fechaInicio: '27 May 2026', color: '#ef4444' },
  { id: 5, nombre: 'Sofía Ramírez', area: 'Ventas', ruta: 'Onboarding Ventas — Pasante', dia: 1, totalDias: 30, pct: 0, status: 'pendiente', fechaInicio: '17 Jun 2026', color: '#f59e0b' },
  { id: 6, nombre: 'Martín Solano', area: 'Tecnología', ruta: 'Onboarding Tech — Backend', dia: 30, totalDias: 30, pct: 100, status: 'completado', fechaInicio: '18 May 2026', color: '#10b981' },
  { id: 7, nombre: 'Isabella Vargas', area: 'Comercial', ruta: 'Onboarding Comercial — Ejecutivo', dia: 10, totalDias: 30, pct: 55, status: 'en-curso', fechaInicio: '07 Jun 2026', color: '#8b5cf6' },
  { id: 8, nombre: 'Nicolás Paredes', area: 'Ventas', ruta: 'Onboarding Ventas — Pasante', dia: 24, totalDias: 30, pct: 73, status: 'en-curso', fechaInicio: '24 May 2026', color: '#0d9488' },
  { id: 9, nombre: 'Andrea Ríos', area: 'Operaciones', ruta: 'Onboarding Operaciones', dia: 8, totalDias: 30, pct: 35, status: 'en-curso', fechaInicio: '09 Jun 2026', color: '#06b6d4' },
  { id: 10, nombre: 'Rodrigo Peña', area: 'Dirección', ruta: 'Onboarding Liderazgo', dia: 28, totalDias: 30, pct: 90, status: 'en-curso', fechaInicio: '20 May 2026', color: '#d946ef' },
  { id: 11, nombre: 'Paula Mendoza', area: 'Marketing', ruta: 'Onboarding Marketing Digital', dia: 30, totalDias: 30, pct: 100, status: 'completado', fechaInicio: '18 May 2026', color: '#3b82f6' },
  { id: 12, nombre: 'Emilio Castañeda', area: 'Recursos Humanos', ruta: 'Onboarding RRHH — Generalista', dia: 5, totalDias: 30, pct: 20, status: 'en-curso', fechaInicio: '12 Jun 2026', color: '#f97316' },
  { id: 13, nombre: 'Andrea Núñez', area: 'Marketing', ruta: 'Onboarding Marketing Digital', dia: 16, totalDias: 30, pct: 55, status: 'en-curso', fechaInicio: '01 Jun 2026', color: '#06b6d4' },
  { id: 14, nombre: 'Isabella Mendoza', area: 'Marketing', ruta: 'Onboarding Marketing Digital', dia: 10, totalDias: 30, pct: 32, status: 'en-curso', fechaInicio: '07 Jun 2026', color: '#7c3aed' },
]

const sampleFeed = [
  { text: 'Martín Solano completó su ruta de Onboarding Tech', time: 'Hace 2 h' },
  { text: 'Diego Morales completó la tarea "Mensaje del CEO"', time: 'Hace 3 h' },
  { text: 'Valentina Cruz fue marcada "en riesgo" por inactividad', time: 'Hace 5 h' },
  { text: 'Nueva ruta "Onboarding Finanzas" creada', time: 'Ayer' },
  { text: 'Sofía Ramírez fue asignada a Onboarding Ventas 2026', time: 'Ayer' },
]

const sampleConfig = {
  gamificacion: true,
  buddy: true,
  menciones: true,
  riesgo: true,
  extension: false,
  asignacion: 'auto',
  activacion: 'fecha',
  horaAsignacion: '08:00',
  riesgoDias: 3,
}

export function OnboardingDataProvider({ children }) {
  const [recursos, setRecursos] = useLocalStorage('recursos', [
    { name: 'Políticas', docs: [] },
    { name: 'Beneficios', docs: [] },
    { name: 'Cultura', docs: [] },
  ])
  const [plantillas, setPlantillas] = useLocalStorage('plantillas', [])
  const [asignaciones, setAsignaciones] = useLocalStorage('asignaciones', [])
  const [feed, setFeed] = useLocalStorage('feed', [])
  const [configToggles, setConfigToggles] = useLocalStorage('config', {
    gamificacion: true,
    buddy: true,
    menciones: true,
    riesgo: true,
    extension: true,
    asignacion: 'manual',
    activacion: 'manual',
    horaAsignacion: '08:00',
    riesgoDias: 3,
  })
  const [tronco, setTronco] = useLocalStorage('tronco', { configured: false, etapas: [] })

  // Migración de una sola vez: el viejo "tronco" (Inducción general hardcodeada)
  // pasa a ser una plantilla real marcada como global, para no perder lo ya configurado.
  useEffect(() => {
    if (!tronco.configured || !tronco.etapas.length) return
    setPlantillas(prev => {
      if (prev.some(p => p.migratedFromTronco)) return prev
      const tareasCount = tronco.etapas.reduce((s, e) => s + e.actividades.reduce((s2, a) => s2 + a.tareas.length, 0), 0)
      return [...prev, {
        id: Date.now(),
        name: 'Inducción general',
        area: 'Todas las áreas',
        cargo: '',
        esGlobal: true,
        ordenGlobal: 0,
        etapasData: tronco.etapas,
        etapas: tronco.etapas.length,
        tareas: tareasCount,
        asignados: 0,
        status: 'activa',
        updated: 'Migrada automáticamente',
        color: '#0C2D40',
        migratedFromTronco: true,
      }]
    })
  }, [tronco, setPlantillas])

  const addFeedEntry = useCallback((text) => {
    setFeed(prev => [{ text, time: 'Ahora' }, ...prev].slice(0, 20))
  }, [setFeed])

  const resetDemo = useCallback(() => {
    clearAllDemoData()
    window.location.href = '/onboarding'
  }, [])

  const loadSampleData = useCallback(() => {
    setRecursos(sampleRecursos)
    setPlantillas(samplePlantillas)
    setAsignaciones(sampleAsignaciones)
    setFeed(sampleFeed)
    setConfigToggles(sampleConfig)
  }, [setRecursos, setPlantillas, setAsignaciones, setFeed, setConfigToggles])

  const totalDocs = recursos.reduce((s, c) => s + c.docs.length, 0)
  const isDemoFresh = totalDocs === 0 && plantillas.length === 0 && asignaciones.length === 0

  return (
    <OnboardingDataContext.Provider value={{
      recursos, setRecursos,
      plantillas, setPlantillas,
      asignaciones, setAsignaciones,
      feed, addFeedEntry,
      configToggles, setConfigToggles,
      resetDemo, loadSampleData, isDemoFresh,
    }}>
      {children}
    </OnboardingDataContext.Provider>
  )
}

export function useOnboardingData() {
  return useContext(OnboardingDataContext)
}
