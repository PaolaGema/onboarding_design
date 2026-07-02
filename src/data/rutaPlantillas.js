import { Globe2, TrendingUp, Megaphone, Code2 } from 'lucide-react'

export const rutaPlantillas = [
  {
    id: 'base',
    name: 'Bienvenida general',
    area: 'Todas las áreas',
    color: '#8b5cf6',
    icon: Globe2,
    descripcion: 'Cultura, valores y políticas generales. Ideal como ruta base para toda la empresa.',
    etapasData: [
      {
        name: 'Mi primera semana', locked: false, days: 'Día 1 — Día 5', actividades: [
          { name: 'Bienvenida', tareas: [
            { id: 9001, name: 'Video de bienvenida del CEO', tipo: 'video', obligatoria: true, puntos: 10, desc: 'Un mensaje de bienvenida de parte de la dirección.', responsable: ['Colaborador'], diaDesde: 1, confirmacion: false, done: false, verificarQuiz: false },
            { id: 9002, name: 'Manual de cultura y valores', tipo: 'documento', obligatoria: true, puntos: 10, desc: 'Conoce nuestra misión, visión y valores.', responsable: ['Colaborador'], diaDesde: 1, diaHasta: 2, confirmacion: false, done: false },
            { id: 9003, name: 'Completar mi perfil', tipo: 'completar-perfil', obligatoria: true, puntos: 5, desc: 'Completa tus datos personales en la plataforma.', responsable: ['Colaborador'], diaDesde: 1, confirmacion: false, done: false },
          ]},
          { name: 'Políticas internas', tareas: [
            { id: 9004, name: 'Reglamento interno', tipo: 'documento', obligatoria: true, puntos: 10, desc: 'Lee el reglamento interno de trabajo.', responsable: ['Colaborador'], diaDesde: 3, diaHasta: 4, confirmacion: false, done: false },
            { id: 9005, name: 'Prueba de políticas', tipo: 'quiz', obligatoria: true, puntos: 15, desc: 'Evalúa lo aprendido sobre nuestras políticas.', responsable: ['Colaborador'], diaDesde: 5, confirmacion: false, done: false },
          ]},
        ],
      },
      {
        name: 'Primer mes', locked: false, days: 'Día 6 — Día 30', actividades: [
          { name: 'Seguimiento', tareas: [
            { id: 9006, name: 'Check-in con tu líder', tipo: 'tarea-otro', obligatoria: true, puntos: 10, desc: 'Reunión de seguimiento a los 15 días.', responsable: ['Manager'], diaDesde: 15, confirmacion: false, done: false },
          ]},
        ],
      },
    ],
  },
  {
    id: 'ventas',
    name: 'Ventas',
    area: 'Ventas',
    color: '#3b82f6',
    icon: TrendingUp,
    descripcion: 'Producto, proceso comercial y CRM. Para nuevos ejecutivos y pasantes del área comercial.',
    etapasData: [
      {
        name: 'Conoce el producto', locked: false, days: 'Día 1 — Día 7', actividades: [
          { name: 'Catálogo comercial', tareas: [
            { id: 9101, name: 'Video: nuestro producto', tipo: 'video', obligatoria: true, puntos: 10, desc: 'Presentación general del catálogo de productos.', responsable: ['Colaborador'], diaDesde: 1, diaHasta: 2, confirmacion: false, done: false, verificarQuiz: true },
            { id: 9102, name: 'Ficha técnica de productos', tipo: 'documento', obligatoria: true, puntos: 10, desc: 'Detalle de precios, características y beneficios.', responsable: ['Colaborador'], diaDesde: 2, diaHasta: 3, confirmacion: false, done: false },
          ]},
          { name: 'Proceso comercial', tareas: [
            { id: 9103, name: 'Configuración del CRM', tipo: 'tarea-otro', obligatoria: true, puntos: 10, desc: 'Acceso y configuración inicial del CRM.', responsable: ['Colaborador', 'Manager'], diaDesde: 4, confirmacion: false, done: false },
            { id: 9104, name: 'Prueba de producto', tipo: 'quiz', obligatoria: true, puntos: 15, desc: 'Evalúa lo aprendido sobre el catálogo.', responsable: ['Colaborador'], diaDesde: 7, confirmacion: false, done: false },
          ]},
        ],
      },
      {
        name: 'Primeras ventas', locked: false, days: 'Día 8 — Día 20', actividades: [
          { name: 'Acompañamiento', tareas: [
            { id: 9105, name: 'Demo acompañada con tu mentor', tipo: 'tarea-otro', obligatoria: true, puntos: 15, desc: 'Realiza una demo guiada junto a tu mentor asignado.', responsable: ['Colaborador'], diaDesde: 10, confirmacion: false, done: false },
            { id: 9106, name: 'Primera llamada real', tipo: 'subida', obligatoria: true, puntos: 20, desc: 'Sube el resumen de tu primera llamada con un cliente.', responsable: ['Colaborador'], diaDesde: 18, diaHasta: 20, confirmacion: false, done: false },
          ]},
        ],
      },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    area: 'Marketing',
    color: '#ec4899',
    icon: Megaphone,
    descripcion: 'Herramientas, guía de marca y calendario editorial. Para nuevos integrantes del equipo de marketing.',
    etapasData: [
      {
        name: 'Herramientas y marca', locked: false, days: 'Día 1 — Día 7', actividades: [
          { name: 'Identidad de marca', tareas: [
            { id: 9201, name: 'Manual de marca', tipo: 'documento', obligatoria: true, puntos: 10, desc: 'Logo, colores, tipografías y tono de comunicación.', responsable: ['Colaborador'], diaDesde: 1, diaHasta: 2, confirmacion: false, done: false },
            { id: 9202, name: 'Acceso a herramientas', tipo: 'tarea-otro', obligatoria: true, puntos: 10, desc: 'Configura tus accesos a las herramientas del equipo.', responsable: ['Colaborador'], diaDesde: 2, diaHasta: 3, confirmacion: false, done: false },
          ]},
          { name: 'Procesos', tareas: [
            { id: 9203, name: 'Calendario editorial', tipo: 'documento', obligatoria: true, puntos: 10, desc: 'Cómo se planifica y aprueba el contenido.', responsable: ['Colaborador'], diaDesde: 4, diaHasta: 5, confirmacion: false, done: false },
            { id: 9204, name: 'Prueba de marca', tipo: 'quiz', obligatoria: true, puntos: 15, desc: 'Evalúa lo aprendido sobre nuestra identidad de marca.', responsable: ['Colaborador'], diaDesde: 7, confirmacion: false, done: false },
          ]},
        ],
      },
      {
        name: 'Primera campaña', locked: false, days: 'Día 8 — Día 20', actividades: [
          { name: 'Práctica', tareas: [
            { id: 9205, name: 'Propuesta de contenido', tipo: 'subida', obligatoria: true, puntos: 15, desc: 'Sube tu primera propuesta de contenido para revisión.', responsable: ['Colaborador', 'Manager'], diaDesde: 15, diaHasta: 18, confirmacion: false, done: false },
          ]},
        ],
      },
    ],
  },
  {
    id: 'tecnologia',
    name: 'Tecnología',
    area: 'Tecnología',
    color: '#06b6d4',
    icon: Code2,
    descripcion: 'Setup técnico, arquitectura y buenas prácticas. Para nuevos desarrolladores y perfiles técnicos.',
    etapasData: [
      {
        name: 'Setup técnico', locked: false, days: 'Día 1 — Día 5', actividades: [
          { name: 'Accesos y entorno', tareas: [
            { id: 9301, name: 'Configuración del entorno de desarrollo', tipo: 'tarea-otro', obligatoria: true, puntos: 15, desc: 'Instala y configura las herramientas necesarias.', responsable: ['Colaborador'], diaDesde: 1, diaHasta: 2, confirmacion: false, done: false },
            { id: 9302, name: 'Accesos a repositorios', tipo: 'tarea-otro', obligatoria: true, puntos: 10, desc: 'Solicita y configura tus accesos de Git.', responsable: ['Colaborador'], diaDesde: 2, confirmacion: false, done: false },
          ]},
          { name: 'Arquitectura', tareas: [
            { id: 9303, name: 'Documentación de arquitectura', tipo: 'documento', obligatoria: true, puntos: 10, desc: 'Visión general de los sistemas y servicios.', responsable: ['Colaborador'], diaDesde: 3, diaHasta: 4, confirmacion: false, done: false },
            { id: 9304, name: 'Prueba de arquitectura', tipo: 'quiz', obligatoria: true, puntos: 15, desc: 'Evalúa lo aprendido sobre nuestros sistemas.', responsable: ['Colaborador'], diaDesde: 5, confirmacion: false, done: false },
          ]},
        ],
      },
      {
        name: 'Primer entregable', locked: false, days: 'Día 6 — Día 20', actividades: [
          { name: 'Código y deploy', tareas: [
            { id: 9305, name: 'Primera tarea con code review', tipo: 'tarea-otro', obligatoria: true, puntos: 15, desc: 'Completa una tarea pequeña con revisión de tu mentor.', responsable: ['Colaborador'], diaDesde: 10, diaHasta: 14, confirmacion: false, done: false },
            { id: 9306, name: 'Entrega de proyecto', tipo: 'subida', obligatoria: true, puntos: 20, desc: 'Sube tu primer entregable al equipo.', responsable: ['Colaborador'], diaDesde: 18, diaHasta: 20, confirmacion: false, done: false },
          ]},
        ],
      },
    ],
  },
]
