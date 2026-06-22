import { createContext, useContext, useState } from 'react'

const RutaActivaContext = createContext()

const rutaCompletada = {
  nombre: 'Onboarding RRHH — Generalista',
  area: 'Recursos Humanos',
  activadaEn: '2024-01-15',
  graduado: true,
  etapas: [
    {
      name: 'Tronco común', days: 'Día 1', duracion: 1,
      actividades: [
        { name: 'Bienvenida corporativa', tareas: [
          { id: 'g1', name: 'Video del CEO', tipo: 'video', xp: 15, obligatoria: true, done: true, desc: 'Video de bienvenida del CEO.' },
          { id: 'g2', name: 'Manual del colaborador', tipo: 'documento', xp: 10, obligatoria: true, done: true, desc: 'Políticas, beneficios y código de conducta.' },
          { id: 'g3', name: 'Quiz de cultura', tipo: 'quiz', xp: 20, obligatoria: true, done: true, desc: 'Cuestionario sobre valores y cultura.' },
        ]},
      ],
    },
    {
      name: 'Conoce RRHH', days: 'Día 2 — Día 14', duracion: 13,
      actividades: [
        { name: 'Procesos del área', tareas: [
          { id: 'g4', name: 'Estructura del área', tipo: 'video', xp: 10, obligatoria: true, done: true, desc: 'Organigrama y roles del equipo.' },
          { id: 'g5', name: 'Sistemas de gestión', tipo: 'video', xp: 15, obligatoria: true, done: true, desc: 'Capacitación en herramientas de RRHH.' },
          { id: 'g6', name: 'Quiz de procesos', tipo: 'quiz', xp: 20, obligatoria: true, done: true, desc: 'Evaluación de procesos internos.' },
        ]},
      ],
    },
    {
      name: 'Certificación', days: 'Día 15 — Día 30', duracion: 16,
      actividades: [
        { name: 'Graduación', tareas: [
          { id: 'g7', name: 'Evaluación final', tipo: 'quiz', xp: 50, obligatoria: true, done: true, desc: 'Examen integral.' },
          { id: 'g8', name: 'Certificado', tipo: 'confirmacion', xp: 100, obligatoria: true, done: true, desc: 'Certificado de graduación.' },
        ]},
      ],
    },
  ],
}

export function RutaActivaProvider({ children }) {
  const [rutaActiva, setRutaActiva] = useState(null)
  const [rutaAdmin] = useState(rutaCompletada)

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
