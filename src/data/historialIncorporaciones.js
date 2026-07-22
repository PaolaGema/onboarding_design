/* Historial de incorporaciones de cada persona.
   Una persona no tiene "un onboarding": tiene una línea de tiempo. El onboarding es el
   primero — el que ocurre al entrar a la empresa — y los reboarding son los que vienen
   después: un ascenso, un cambio de área o de sede, una normativa nueva, la vuelta de una
   licencia larga. Es el mismo objeto con distinto disparador, por eso comparten forma.

   `etapas` es el recorrido CONGELADO y usa la misma estructura que una ruta viva
   (etapa → actividades → tareas), para que se pueda dibujar con `RutaPath` sin traducir y
   para que el día que esto derive de las asignaciones no haya que cambiar la forma.

   Va guardado dentro del proceso y no se resuelve contra la plantilla actual: si RR.HH.
   reescribe la ruta en 2026, lo que Diego completó en 2021 tiene que seguir mostrando lo
   que él efectivamente vio. Es la misma regla del snapshot al asignar.

   Está indexado por el id del usuario del simulador (UserContext) porque quien mira su
   propia trayectoria es siempre el usuario activo. El proceso en curso vive acá también,
   con `fin: null`: así la línea sale de una sola fuente. */

const t = (id, name, tipo, puntos, obligatoria = false) => ({ id, name, tipo, puntos, obligatoria })

export const historialIncorporaciones = {
  // María recién empezó: su onboarding es también su primera incorporación.
  2: [
    {
      id: 'm1', tipo: 'Onboarding', ruta: 'Onboarding Ventas — Pasante',
      motivo: 'Ingreso a la empresa', inicio: '02 Ene 2026', fin: null, estado: 'en-curso', pct: 0,
      etapas: [
        { name: 'Mi primera semana', duracion: 7, actividades: [
          { name: 'General', tareas: [
            t('m1-1', 'Video de bienvenida', 'video', 10, true),
            t('m1-2', 'Manual de funciones', 'documento', 15, true),
            t('m1-3', 'Completar mi perfil', 'completar-perfil', 5),
          ] },
        ] },
      ],
    },
  ],

  4: [
    {
      id: 'c2', tipo: 'Reboarding', ruta: 'Onboarding Tech — Backend',
      motivo: 'Cambio de área a Tecnología', inicio: '10 Abr 2026', fin: null, estado: 'en-curso', pct: 15,
      etapas: [
        { name: 'Tu nuevo equipo', duracion: 5, actividades: [
          { name: 'Integración', tareas: [
            t('c2-1', 'Conoce al equipo de Tecnología', 'video', 10, true),
            t('c2-2', 'Guía de arquitectura', 'documento', 15, true),
          ] },
        ] },
      ],
    },
    {
      id: 'c1', tipo: 'Onboarding', ruta: 'Onboarding Operaciones',
      motivo: 'Ingreso a la empresa', inicio: '05 Feb 2025', fin: '07 Mar 2025', estado: 'completado', pct: 100,
      etapas: [
        { name: 'Bienvenida', duracion: 7, actividades: [
          { name: 'Cultura', tareas: [
            t('c1-1', 'Manual de cultura y valores', 'documento', 10, true),
            t('c1-2', 'Video de bienvenida del CEO', 'video', 10, true),
          ] },
        ] },
        { name: 'Procesos de Operaciones', duracion: 23, actividades: [
          { name: 'Formación', tareas: [
            t('c1-3', 'Manual de procesos internos', 'documento', 15, true),
            t('c1-4', 'Prueba de procesos', 'quiz', 20, true),
          ] },
        ] },
      ],
    },
  ],

  // Diego es el caso largo: cinco procesos en cinco años de casa.
  7: [
    {
      id: 'd5', tipo: 'Reboarding', ruta: 'Reboarding — Rol de Buddy',
      motivo: 'Nueva responsabilidad: acompañar ingresantes', inicio: '02 Jun 2025', fin: '16 Jun 2025', estado: 'completado', pct: 100,
      etapas: [
        { name: 'Ser buddy', duracion: 14, actividades: [
          { name: 'Formación', tareas: [
            t('d5-1', 'Guía del buddy', 'documento', 10, true),
            t('d5-2', 'Video: cómo acompañar a un ingresante', 'video', 10, true),
            t('d5-3', 'Reunión con RR.HH.', 'tarea-otro', 10, true),
          ] },
        ] },
      ],
    },
    {
      id: 'd4', tipo: 'Reboarding', ruta: 'Reboarding — Backend Senior',
      motivo: 'Ascenso a Desarrollador Backend Senior', inicio: '08 Ene 2024', fin: '05 Feb 2024', estado: 'completado', pct: 100,
      etapas: [
        { name: 'Tu nuevo alcance', duracion: 10, actividades: [
          { name: 'Marco del rol', tareas: [
            t('d4-1', 'Manual de funciones — Senior', 'documento', 10, true),
            t('d4-2', 'Política de revisión de código', 'documento', 10, true),
          ] },
        ] },
        { name: 'Liderazgo técnico', duracion: 18, actividades: [
          { name: 'Formación', tareas: [
            t('d4-3', 'Curso: mentoría técnica', 'video', 20, true),
            t('d4-4', 'Evaluación de liderazgo', 'quiz', 25, true),
          ] },
        ] },
      ],
    },
    {
      id: 'd3', tipo: 'Reboarding', ruta: 'Reboarding — Política de seguridad',
      motivo: 'Actualización normativa obligatoria', inicio: '12 Mar 2023', fin: '20 Mar 2023', estado: 'completado', pct: 100,
      etapas: [
        { name: 'Nueva normativa', duracion: 8, actividades: [
          { name: 'Cumplimiento', tareas: [
            t('d3-1', 'Política de seguridad de la información', 'documento', 10, true),
            t('d3-2', 'Prueba de seguridad', 'quiz', 20, true),
          ] },
        ] },
      ],
    },
    {
      id: 'd2', tipo: 'Reboarding', ruta: 'Reboarding — Migración de stack',
      motivo: 'Cambio de stack del equipo a Node', inicio: '04 Jul 2022', fin: '25 Jul 2022', estado: 'completado', pct: 100,
      etapas: [
        { name: 'Fundamentos de Node', duracion: 14, actividades: [
          { name: 'Formación', tareas: [
            t('d2-1', 'Curso interno de Node', 'video', 20, true),
            t('d2-2', 'Guía de migración', 'documento', 10, true),
          ] },
        ] },
        { name: 'Práctica', duracion: 7, actividades: [
          { name: 'Ejercicio', tareas: [
            t('d2-3', 'Migrar un servicio de ejemplo', 'subida', 25, true),
          ] },
        ] },
      ],
    },
    {
      id: 'd1', tipo: 'Onboarding', ruta: 'Onboarding Tech — Backend',
      motivo: 'Ingreso a la empresa', inicio: '11 Ene 2021', fin: '10 Feb 2021', estado: 'completado', pct: 100,
      etapas: [
        { name: 'Mi primera semana', duracion: 7, actividades: [
          { name: 'General', tareas: [
            t('d1-1', 'Video de bienvenida del CEO', 'video', 10, true),
            t('d1-2', 'Manual de cultura y valores', 'documento', 10, true),
            t('d1-3', 'Reglamento interno', 'documento', 10, true),
            t('d1-4', 'Completar mi perfil', 'completar-perfil', 5),
          ] },
        ] },
        { name: 'Conoce el equipo', duracion: 8, actividades: [
          { name: 'Integraciones', tareas: [
            t('d1-5', 'Recorrido por instalaciones', 'recorrido', 20, true),
            t('d1-6', 'Prueba de cultura', 'quiz', 15, true),
            t('d1-7', 'Reunión 1:1 con tu buddy', 'tarea-otro', 10, true),
          ] },
        ] },
        { name: 'Tu primer mes', duracion: 15, actividades: [
          { name: 'Cierre', tareas: [
            t('d1-8', 'Manual técnico de Backend', 'documento', 15, true),
            t('d1-9', 'Entrega de proyecto', 'subida', 25, true),
            t('d1-10', '¿Cómo te sientes en tu primer mes?', 'pulso', 5),
          ] },
        ] },
      ],
    },
  ],

  5: [
    {
      id: 'n2', tipo: 'Reboarding', ruta: 'Reboarding — Ejecutivo Senior',
      motivo: 'Ascenso a Ejecutivo Senior', inicio: '03 Mar 2025', fin: '24 Mar 2025', estado: 'completado', pct: 100,
      etapas: [
        { name: 'Tu nuevo rol', duracion: 21, actividades: [
          { name: 'Formación', tareas: [
            t('n2-1', 'Manual de funciones — Senior', 'documento', 10, true),
            t('n2-2', 'Técnicas de negociación', 'video', 20, true),
          ] },
        ] },
      ],
    },
    {
      id: 'n1', tipo: 'Onboarding', ruta: 'Onboarding Ventas — Pasante',
      motivo: 'Ingreso a la empresa', inicio: '14 Jul 2024', fin: '15 Ago 2024', estado: 'completado', pct: 100,
      etapas: [
        { name: 'Mi primera semana', duracion: 7, actividades: [
          { name: 'General', tareas: [
            t('n1-1', 'Manual de cultura y valores', 'documento', 10, true),
            t('n1-2', 'Video de bienvenida del CEO', 'video', 10, true),
          ] },
        ] },
        { name: 'Producto y CRM', duracion: 23, actividades: [
          { name: 'Formación', tareas: [
            t('n1-3', 'Ficha técnica de productos', 'documento', 10, true),
            t('n1-4', 'Prueba de producto', 'quiz', 15, true),
          ] },
        ] },
      ],
    },
  ],
}

export function historialDe(userId) {
  return historialIncorporaciones[userId] || []
}

export const ESTADO_HISTORIAL = {
  'en-curso': { label: 'En curso', color: '#2563eb', fondo: '#eff6ff' },
  'completado': { label: 'Completado', color: '#16a34a', fondo: '#f0fdf4' },
  'cerrado': { label: 'Cerrado sin completar', color: '#b45309', fondo: '#fffbeb' },
}

export const contarTareas = proceso =>
  (proceso.etapas || []).reduce((n, e) => n + e.actividades.reduce((m, a) => m + a.tareas.length, 0), 0)
