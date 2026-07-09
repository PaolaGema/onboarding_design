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
            { id: 101, name: 'Video de bienvenida', tipo: 'video', puntos: 10, obligatoria: true, done: false, desc: 'Conoce nuestra cultura y valores.', verificarQuiz: true },
            { id: 102, name: 'Manual de funciones', tipo: 'documento', puntos: 15, obligatoria: true, done: false, desc: 'Lee el manual de tu cargo.' },
            { id: 103, name: 'Completar mi perfil', tipo: 'perfil', puntos: 5, obligatoria: false, done: false, desc: 'Completa tus datos personales, laborales, preferencias y documentación.' },
            { id: 109, name: 'Podcast de bienvenida', tipo: 'audio', puntos: 5, obligatoria: false, done: false, desc: 'Escucha el mensaje de bienvenida de nuestro equipo.' },
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
            { id: 104, name: 'Recorrido por instalaciones', tipo: 'recorrido', puntos: 20, obligatoria: true, done: false, desc: 'Visita las áreas principales de la empresa.' },
            { id: 105, name: 'Prueba de cultura', tipo: 'quiz', puntos: 15, obligatoria: true, done: false, desc: 'Evalúa lo que aprendiste sobre nuestra cultura.' },
            { id: 106, name: 'Formulario bancario', tipo: 'completar-perfil', puntos: 5, obligatoria: false, done: false, desc: 'Completa tus datos para el pago de nómina.' },
            { id: 110, name: 'Reunión 1:1 con tu buddy', tipo: 'tarea-otro', puntos: 10, obligatoria: true, done: false, desc: 'Coordina una reunión de bienvenida con tu buddy asignado.' },
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
            { id: 111, name: '¿Cómo te sientes en tu primer mes?', tipo: 'pulso', puntos: 5, obligatoria: false, done: false, desc: 'Cuéntanos cómo va tu proceso de integración.' },
          ],
        },
      ],
    },
  ],
}

const rutaGraduadoDefault = {
  nombre: 'Onboarding Ventas — Ejecutivo Senior',
  area: 'Ventas',
  graduado: true,
  activadaEn: '2026-05-04T09:00:00.000Z',
  etapas: [
    {
      name: 'Mi primera semana',
      days: 'Día 1 — Día 7',
      duracion: 7,
      actividades: [
        {
          name: 'Bienvenida',
          tareas: [
            { id: 201, name: 'Video de bienvenida del equipo', tipo: 'video', puntos: 10, obligatoria: true, done: true, desc: 'Conoce nuestra cultura y valores.', verificarQuiz: true },
            { id: 202, name: 'Manual de funciones', tipo: 'documento', puntos: 15, obligatoria: true, done: true, desc: 'Lee el manual de tu cargo.' },
            { id: 203, name: 'Completar mi perfil', tipo: 'completar-perfil', puntos: 5, obligatoria: false, done: true, desc: 'Completa tus datos en la plataforma.' },
          ],
        },
      ],
    },
    {
      name: 'Conoce Ventas',
      days: 'Día 8 — Día 15',
      duracion: 8,
      actividades: [
        {
          name: 'Producto y proceso comercial',
          tareas: [
            { id: 204, name: 'Recorrido por instalaciones', tipo: 'recorrido', puntos: 20, obligatoria: true, done: true, desc: 'Visita las áreas principales de la empresa.' },
            { id: 205, name: 'Prueba de producto', tipo: 'quiz', puntos: 15, obligatoria: true, done: true, desc: 'Evalúa lo que aprendiste sobre el catálogo comercial.' },
            { id: 206, name: 'Demo del producto con tu mentor', tipo: 'tarea-otro', puntos: 10, obligatoria: true, done: true, desc: 'Realiza una demo guiada junto a tu mentor asignado.' },
          ],
        },
      ],
    },
    {
      name: 'Primer mes',
      days: 'Día 16 — Día 30',
      duracion: 15,
      actividades: [
        {
          name: 'Cierre',
          tareas: [
            { id: 207, name: 'Evaluación de integración', tipo: 'quiz', puntos: 25, obligatoria: true, done: true, desc: 'Evaluación final de tu proceso de onboarding.' },
            { id: 208, name: 'Primera llamada real', tipo: 'subida', puntos: 20, obligatoria: true, done: true, desc: 'Sube la grabación o resumen de tu primera llamada con un cliente.' },
          ],
        },
      ],
    },
  ],
}

export function RutaActivaProvider({ children }) {
  // rutaActiva: para el colaborador — precargada, sin localStorage
  const [rutaActiva, setRutaActiva] = useState(rutaColaboradorDefault)
  // rutaGraduado: colaboradores cuyo onboarding ya está finalizado — solo lectura
  const [rutaGraduado] = useState(rutaGraduadoDefault)
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

  return (
    <RutaActivaContext.Provider value={{ rutaActiva, rutaGraduado, rutaAdmin, activarRuta, actualizarEtapas }}>
      {children}
    </RutaActivaContext.Provider>
  )
}

export function useRutaActiva() {
  return useContext(RutaActivaContext)
}
