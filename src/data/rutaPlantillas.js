import { Globe2, TrendingUp, Megaphone, Code2, HeartHandshake, Landmark, Boxes, Palette, Compass, Handshake } from 'lucide-react'

/* Una plantilla por área de las que existen en el sistema, más la general. El catálogo es de
   ejemplo: sirve para ver cómo se comporta la lista del selector de base cuando hay varias y
   para arrancar una ruta sin partir del lienzo vacío.
   Los ids de tarea van por bloques de cien (90xx la general, 91xx Ventas…) para que dos
   plantillas traídas a la misma ruta no colisionen. */

export const rutaPlantillas = [
  {
    id: 'base',
    name: 'Bienvenida general',
    area: 'Todas las áreas',
    color: '#8b5cf6',
    icon: Globe2,
    descripcion: 'Cultura, valores y políticas generales. Ideal como ruta general para toda la empresa.',
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
  {
    id: 'rrhh',
    name: 'Recursos Humanos',
    area: 'Recursos Humanos',
    color: '#d946ef',
    icon: HeartHandshake,
    descripcion: 'Normativa laboral, nóminas y trato con las personas. Para nuevos integrantes del área de RRHH.',
    etapasData: [
      {
        name: 'Marco laboral', locked: false, days: 'Día 1 — Día 7', actividades: [
          { name: 'Normativa', tareas: [
            { id: 9401, name: 'Legislación laboral aplicable', tipo: 'documento', obligatoria: true, puntos: 10, desc: 'Marco legal que rige los contratos de la empresa.', responsable: ['Colaborador'], diaDesde: 1, diaHasta: 3, confirmacion: false, done: false },
            { id: 9402, name: 'Confidencialidad de datos personales', tipo: 'documento', obligatoria: true, puntos: 15, desc: 'Qué se puede consultar, qué no y con qué registro.', responsable: ['Colaborador'], diaDesde: 2, diaHasta: 3, confirmacion: false, done: false },
          ]},
          { name: 'Herramientas', tareas: [
            { id: 9403, name: 'Recorrido por el sistema de nóminas', tipo: 'video', obligatoria: true, puntos: 10, desc: 'Cómo se carga, revisa y cierra una nómina.', responsable: ['Colaborador'], diaDesde: 4, diaHasta: 5, confirmacion: false, done: false, verificarQuiz: true },
            { id: 9404, name: 'Prueba de normativa', tipo: 'quiz', obligatoria: true, puntos: 15, desc: 'Evalúa lo aprendido sobre el marco laboral.', responsable: ['Colaborador'], diaDesde: 7, confirmacion: false, done: false },
          ]},
        ],
      },
      {
        name: 'Primer ciclo', locked: false, days: 'Día 8 — Día 25', actividades: [
          { name: 'En la práctica', tareas: [
            { id: 9405, name: 'Acompañar una entrevista', tipo: 'tarea-otro', obligatoria: true, puntos: 15, desc: 'Participa como observador en un proceso de selección.', responsable: ['Colaborador'], diaDesde: 12, confirmacion: false, done: false },
            { id: 9406, name: 'Cierre de nómina asistido', tipo: 'tarea-otro', obligatoria: true, puntos: 20, desc: 'Acompaña el cierre del mes junto a tu líder.', responsable: ['Colaborador', 'Manager'], diaDesde: 22, diaHasta: 25, confirmacion: false, done: false },
          ]},
        ],
      },
    ],
  },
  {
    id: 'finanzas',
    name: 'Finanzas',
    area: 'Finanzas',
    color: '#0d9488',
    icon: Landmark,
    descripcion: 'Plan de cuentas, cierres y controles. Para analistas, contadores y perfiles financieros.',
    etapasData: [
      {
        name: 'Fundamentos', locked: false, days: 'Día 1 — Día 7', actividades: [
          { name: 'Estructura contable', tareas: [
            { id: 9501, name: 'Plan de cuentas de la empresa', tipo: 'documento', obligatoria: true, puntos: 10, desc: 'Cómo está organizada nuestra contabilidad.', responsable: ['Colaborador'], diaDesde: 1, diaHasta: 3, confirmacion: false, done: false },
            { id: 9502, name: 'Política de gastos y aprobaciones', tipo: 'documento', obligatoria: true, puntos: 10, desc: 'Quién autoriza qué y hasta qué monto.', responsable: ['Colaborador'], diaDesde: 3, diaHasta: 4, confirmacion: false, done: false },
          ]},
          { name: 'Sistemas', tareas: [
            { id: 9503, name: 'Accesos al sistema contable', tipo: 'tarea-otro', obligatoria: true, puntos: 10, desc: 'Solicita y configura tus credenciales.', responsable: ['Colaborador'], diaDesde: 2, confirmacion: false, done: false },
            { id: 9504, name: 'Prueba de fundamentos', tipo: 'quiz', obligatoria: true, puntos: 15, desc: 'Evalúa lo aprendido sobre el plan de cuentas.', responsable: ['Colaborador'], diaDesde: 7, confirmacion: false, done: false },
          ]},
        ],
      },
      {
        name: 'Primer cierre', locked: false, days: 'Día 8 — Día 30', actividades: [
          { name: 'Práctica guiada', tareas: [
            { id: 9505, name: 'Conciliación bancaria acompañada', tipo: 'tarea-otro', obligatoria: true, puntos: 15, desc: 'Realiza una conciliación junto a tu mentor.', responsable: ['Colaborador'], diaDesde: 14, confirmacion: false, done: false },
            { id: 9506, name: 'Reporte mensual de práctica', tipo: 'subida', obligatoria: true, puntos: 20, desc: 'Sube tu primer reporte para revisión.', responsable: ['Colaborador'], diaDesde: 26, diaHasta: 30, confirmacion: false, done: false },
          ]},
        ],
      },
    ],
  },
  {
    id: 'operaciones',
    name: 'Operaciones',
    area: 'Operaciones',
    color: '#8b5cf6',
    icon: Boxes,
    descripcion: 'Procesos, logística y seguridad en planta. Para asistentes, analistas y coordinadores de operaciones.',
    etapasData: [
      {
        name: 'Seguridad y procesos', locked: false, days: 'Día 1 — Día 6', actividades: [
          { name: 'Seguridad', tareas: [
            { id: 9601, name: 'Inducción de seguridad', tipo: 'video', obligatoria: true, puntos: 15, desc: 'Normas de seguridad obligatorias antes de pisar planta.', responsable: ['Colaborador'], diaDesde: 1, confirmacion: false, done: false, verificarQuiz: true },
            { id: 9602, name: 'Entrega de equipo de protección', tipo: 'tarea-otro', obligatoria: true, puntos: 10, desc: 'Retira y confirma la recepción de tu equipo.', responsable: ['Colaborador', 'Manager'], diaDesde: 1, confirmacion: true, done: false },
          ]},
          { name: 'Procesos', tareas: [
            { id: 9603, name: 'Mapa de procesos operativos', tipo: 'documento', obligatoria: true, puntos: 10, desc: 'Cómo fluye el trabajo desde el pedido hasta la entrega.', responsable: ['Colaborador'], diaDesde: 3, diaHasta: 4, confirmacion: false, done: false },
            { id: 9604, name: 'Prueba de seguridad', tipo: 'quiz', obligatoria: true, puntos: 15, desc: 'Evalúa lo aprendido sobre las normas de seguridad.', responsable: ['Colaborador'], diaDesde: 6, confirmacion: false, done: false },
          ]},
        ],
      },
      {
        name: 'En planta', locked: false, days: 'Día 7 — Día 20', actividades: [
          { name: 'Acompañamiento', tareas: [
            { id: 9605, name: 'Recorrido por almacén', tipo: 'tarea-otro', obligatoria: true, puntos: 10, desc: 'Recorrido guiado por las áreas de almacén y despacho.', responsable: ['Colaborador'], diaDesde: 8, confirmacion: false, done: false },
            { id: 9606, name: 'Turno acompañado', tipo: 'tarea-otro', obligatoria: true, puntos: 20, desc: 'Completa un turno junto a un operador con experiencia.', responsable: ['Colaborador'], diaDesde: 16, diaHasta: 20, confirmacion: false, done: false },
          ]},
        ],
      },
    ],
  },
  {
    id: 'diseno',
    name: 'Diseño',
    area: 'Diseño',
    color: '#f97316',
    icon: Palette,
    descripcion: 'Sistema de diseño, herramientas y flujo de entregas. Para diseñadores UX/UI y gráficos.',
    etapasData: [
      {
        name: 'Sistema y herramientas', locked: false, days: 'Día 1 — Día 7', actividades: [
          { name: 'Nuestro sistema', tareas: [
            { id: 9701, name: 'Sistema de diseño', tipo: 'documento', obligatoria: true, puntos: 10, desc: 'Componentes, tokens y reglas de uso.', responsable: ['Colaborador'], diaDesde: 1, diaHasta: 3, confirmacion: false, done: false },
            { id: 9702, name: 'Accesos a las herramientas de diseño', tipo: 'tarea-otro', obligatoria: true, puntos: 10, desc: 'Configura tus accesos y las bibliotecas compartidas.', responsable: ['Colaborador'], diaDesde: 1, diaHasta: 2, confirmacion: false, done: false },
          ]},
          { name: 'Cómo trabajamos', tareas: [
            { id: 9703, name: 'Flujo de entrega a desarrollo', tipo: 'video', obligatoria: true, puntos: 10, desc: 'Del archivo a la implementación: qué se entrega y cómo.', responsable: ['Colaborador'], diaDesde: 4, diaHasta: 5, confirmacion: false, done: false },
            { id: 9704, name: 'Prueba del sistema de diseño', tipo: 'quiz', obligatoria: true, puntos: 15, desc: 'Evalúa lo aprendido sobre nuestros componentes.', responsable: ['Colaborador'], diaDesde: 7, confirmacion: false, done: false },
          ]},
        ],
      },
      {
        name: 'Primera entrega', locked: false, days: 'Día 8 — Día 20', actividades: [
          { name: 'Práctica', tareas: [
            { id: 9705, name: 'Rediseño de una pantalla existente', tipo: 'subida', obligatoria: true, puntos: 20, desc: 'Sube tu propuesta usando el sistema de diseño.', responsable: ['Colaborador'], diaDesde: 14, diaHasta: 18, confirmacion: false, done: false },
            { id: 9706, name: 'Revisión con el equipo', tipo: 'tarea-otro', obligatoria: true, puntos: 15, desc: 'Presenta tu propuesta y recibe devoluciones.', responsable: ['Colaborador', 'Manager'], diaDesde: 20, confirmacion: false, done: false },
          ]},
        ],
      },
    ],
  },
  {
    id: 'direccion',
    name: 'Dirección',
    area: 'Dirección',
    color: '#0C2D40',
    icon: Compass,
    descripcion: 'Estrategia, indicadores y gobierno interno. Para gerencias y cargos de dirección.',
    etapasData: [
      {
        name: 'Contexto del negocio', locked: false, days: 'Día 1 — Día 10', actividades: [
          { name: 'Estrategia', tareas: [
            { id: 9801, name: 'Plan estratégico vigente', tipo: 'documento', obligatoria: true, puntos: 15, desc: 'Objetivos del año y prioridades por área.', responsable: ['Colaborador'], diaDesde: 1, diaHasta: 4, confirmacion: false, done: false },
            { id: 9802, name: 'Tablero de indicadores', tipo: 'video', obligatoria: true, puntos: 10, desc: 'Qué se mide, cada cuánto y quién responde por cada número.', responsable: ['Colaborador'], diaDesde: 3, diaHasta: 5, confirmacion: false, done: false },
          ]},
          { name: 'Gobierno interno', tareas: [
            { id: 9803, name: 'Reuniones de dirección', tipo: 'documento', obligatoria: true, puntos: 10, desc: 'Calendario, participantes y forma de tomar decisiones.', responsable: ['Colaborador'], diaDesde: 6, diaHasta: 7, confirmacion: false, done: false },
            { id: 9804, name: 'Presentación al comité', tipo: 'tarea-otro', obligatoria: true, puntos: 15, desc: 'Preséntate ante el comité de dirección.', responsable: ['Colaborador', 'Manager'], diaDesde: 10, confirmacion: false, done: false },
          ]},
        ],
      },
      {
        name: 'Primeros 90 días', locked: false, days: 'Día 11 — Día 45', actividades: [
          { name: 'Plan propio', tareas: [
            { id: 9805, name: 'Reuniones uno a uno con tu equipo', tipo: 'tarea-otro', obligatoria: true, puntos: 20, desc: 'Conocé a cada persona a cargo antes del primer mes.', responsable: ['Colaborador'], diaDesde: 15, diaHasta: 30, confirmacion: false, done: false },
            { id: 9806, name: 'Plan de los primeros 90 días', tipo: 'subida', obligatoria: true, puntos: 25, desc: 'Sube tu plan de trabajo para el trimestre.', responsable: ['Colaborador'], diaDesde: 40, diaHasta: 45, confirmacion: false, done: false },
          ]},
        ],
      },
    ],
  },
  {
    id: 'comercial',
    name: 'Comercial',
    area: 'Comercial',
    color: '#f59e0b',
    icon: Handshake,
    descripcion: 'Cartera, negociación y cierre. Para ejecutivos de cuentas y perfiles comerciales con clientes asignados.',
    etapasData: [
      {
        name: 'Tu cartera', locked: false, days: 'Día 1 — Día 8', actividades: [
          { name: 'Conoce a los clientes', tareas: [
            { id: 9901, name: 'Segmentos y clientes clave', tipo: 'documento', obligatoria: true, puntos: 10, desc: 'Cómo se agrupan nuestros clientes y qué espera cada uno.', responsable: ['Colaborador'], diaDesde: 1, diaHasta: 3, confirmacion: false, done: false },
            { id: 9902, name: 'Traspaso de cartera', tipo: 'tarea-otro', obligatoria: true, puntos: 15, desc: 'Reunión de traspaso con quien llevaba las cuentas.', responsable: ['Colaborador', 'Manager'], diaDesde: 2, diaHasta: 4, confirmacion: false, done: false },
          ]},
          { name: 'Método', tareas: [
            { id: 9903, name: 'Metodología de venta', tipo: 'video', obligatoria: true, puntos: 10, desc: 'Nuestro proceso comercial, etapa por etapa.', responsable: ['Colaborador'], diaDesde: 5, diaHasta: 6, confirmacion: false, done: false, verificarQuiz: true },
            { id: 9904, name: 'Prueba de proceso comercial', tipo: 'quiz', obligatoria: true, puntos: 15, desc: 'Evalúa lo aprendido sobre el proceso de venta.', responsable: ['Colaborador'], diaDesde: 8, confirmacion: false, done: false },
          ]},
        ],
      },
      {
        name: 'Cierre de negocios', locked: false, days: 'Día 9 — Día 25', actividades: [
          { name: 'En la práctica', tareas: [
            { id: 9905, name: 'Acompañamiento a reunión con cliente', tipo: 'tarea-otro', obligatoria: true, puntos: 15, desc: 'Participa en una reunión real junto a tu líder.', responsable: ['Colaborador'], diaDesde: 12, confirmacion: false, done: false },
            { id: 9906, name: 'Propuesta comercial de práctica', tipo: 'subida', obligatoria: true, puntos: 20, desc: 'Arma y sube una propuesta para revisión.', responsable: ['Colaborador'], diaDesde: 20, diaHasta: 25, confirmacion: false, done: false },
          ]},
        ],
      },
    ],
  },
]
