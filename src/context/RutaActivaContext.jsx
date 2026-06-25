import { createContext, useContext, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const RutaActivaContext = createContext()

const rutaColaboradorDefault = {
  nombre: 'Inducción General',
  area: 'Tecnología',
  activadaEn: new Date().toISOString(),
  etapas: [
    {
      name: 'Mi primera semana',
      days: 'Día 1 — Día 7',
      duracion: 7,
      actividades: [
        {
          name: 'General',
          tareas: [
            { id: 101, name: 'Video de bienvenida', tipo: 'video', puntos: 10, obligatoria: true, done: true, desc: 'Conoce nuestra cultura y valores.', verificarQuiz: true },
            { id: 102, name: 'Manual de funciones', tipo: 'documento', puntos: 15, obligatoria: true, done: true, desc: 'Lee el manual de tu cargo.' },
            { id: 103, name: 'Completar mi perfil', tipo: 'completar-perfil', puntos: 5, obligatoria: false, done: true, desc: 'Completa tus datos en la plataforma.' },
          ],
        },
      ],
    },
    {
      name: 'Conoce el equipo',
      days: 'Día 8 — Día 15',
      duracion: 8,
      actividades: [
        {
          name: 'Integraciones',
          tareas: [
            { id: 104, name: 'Recorrido por instalaciones', tipo: 'recorrido', puntos: 20, obligatoria: true, done: true, desc: 'Visita las áreas principales de la empresa.' },
            { id: 105, name: 'Cuestionario de cultura', tipo: 'quiz', puntos: 15, obligatoria: true, done: false, desc: 'Evalúa lo que aprendiste sobre nuestra cultura.' },
            { id: 106, name: 'Formulario bancario', tipo: 'form-custom', puntos: 5, obligatoria: false, done: false, desc: 'Completa tus datos para el pago de nómina.' },
          ],
        },
      ],
    },
    {
      name: 'Tu primer mes',
      days: 'Día 16 — Día 30',
      duracion: 15,
      actividades: [
        {
          name: 'Cierre',
          tareas: [
            { id: 107, name: 'Evaluación de integración', tipo: 'quiz', puntos: 25, obligatoria: true, done: false, desc: 'Evaluación final de tu proceso de onboarding.' },
            { id: 108, name: 'Entrega de proyecto', tipo: 'subida', puntos: 20, obligatoria: true, done: false, desc: 'Sube tu primer entregable al equipo.' },
          ],
        },
      ],
    },
  ],
}

export function RutaActivaProvider({ children }) {
  // rutaActiva: para el colaborador — precargada, sin localStorage
  const [rutaActiva, setRutaActiva] = useState(rutaColaboradorDefault)
  // rutaAdmin: para el admin al previsualizar desde JourneyBuilder — sigue con localStorage
  const [rutaAdmin, setRutaAdmin] = useLocalStorage('rutaAdmin', null)

  function activarRuta(etapas, info) {
    setRutaAdmin({
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
    setRutaActiva(rutaColaboradorDefault)
    setRutaAdmin(null)
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
