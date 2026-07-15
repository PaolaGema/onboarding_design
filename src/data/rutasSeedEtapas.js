// Etapas de ejemplo para las rutas "activas" del seed, para que la vista previa
// muestre contenido realista. Estructura idéntica a la que consume RutaPath /
// RutaFullPreviewModal (etapa → actividades → tareas).
// Clave = id de la ruta en samplePlantillas (OnboardingDataContext).

const t = (id, name, tipo, puntos, desc, dia = 1, resp = ['Colaborador']) => ({
  id, name, tipo, obligatoria: true, puntos, desc,
  responsable: resp, diaDesde: dia, confirmacion: false, done: false,
})

export const rutasSeedEtapas = {
  // 1 — Onboarding Ventas — Pasante
  1: [
    { name: 'Bienvenida', duracion: 5, actividades: [
      { name: 'Primer día', tareas: [
        t(1001, 'Video de bienvenida del CEO', 'video', 10, 'Un mensaje de la dirección para darte la bienvenida.', 1),
        t(1002, 'Completa tu perfil', 'completar-perfil', 5, 'Registra tus datos personales en la plataforma.', 1),
        t(1003, 'Manual de cultura y valores', 'documento', 10, 'Conoce nuestra misión, visión y valores.', 2),
      ] },
      { name: 'Accesos', tareas: [
        t(1004, 'Configura tu correo y el CRM', 'tarea-otro', 10, 'Solicita y activa tus accesos de trabajo.', 3, ['Colaborador', 'Manager']),
      ] },
    ] },
    { name: 'Conoce el producto', duracion: 7, actividades: [
      { name: 'Catálogo comercial', tareas: [
        t(1005, 'Recorrido por el catálogo', 'video', 10, 'Presentación general de nuestros productos.', 6),
        t(1006, 'Ficha técnica de productos', 'documento', 10, 'Precios, características y beneficios clave.', 7),
        t(1007, 'Prueba de producto', 'quiz', 15, 'Evalúa lo aprendido sobre el catálogo.', 9),
      ] },
    ] },
    { name: 'Primeras ventas', duracion: 10, actividades: [
      { name: 'Práctica acompañada', tareas: [
        t(1008, 'Demo acompañada con tu mentor', 'tarea-otro', 15, 'Realiza una demo guiada junto a tu mentor.', 12),
        t(1009, 'Resumen de tu primera llamada', 'subida', 20, 'Sube el resumen de tu primera llamada con un cliente.', 18),
      ] },
    ] },
  ],

  // 2 — Onboarding Comercial — Ejecutivo
  2: [
    { name: 'Bienvenida', duracion: 4, actividades: [
      { name: 'Primer día', tareas: [
        t(2001, 'Video de bienvenida del CEO', 'video', 10, 'Mensaje de bienvenida de la dirección.', 1),
        t(2002, 'Completa tu perfil', 'completar-perfil', 5, 'Registra tus datos en la plataforma.', 1),
        t(2003, 'Código de conducta', 'documento', 10, 'Lee y confirma nuestro código de conducta.', 2),
      ] },
    ] },
    { name: 'Portafolio y clientes', duracion: 8, actividades: [
      { name: 'Conoce tu cartera', tareas: [
        t(2004, 'Segmentos y clientes clave', 'documento', 10, 'Panorama de la cartera y segmentos de mercado.', 5),
        t(2005, 'Uso avanzado del CRM', 'video', 10, 'Gestión de oportunidades y pipeline en el CRM.', 6),
      ] },
      { name: 'Proceso comercial', tareas: [
        t(2006, 'Metodología de venta', 'documento', 10, 'Nuestro método de calificación y cierre.', 8),
        t(2007, 'Prueba de proceso comercial', 'quiz', 15, 'Evalúa lo aprendido sobre el proceso.', 10),
      ] },
    ] },
    { name: 'Cierre de negocios', duracion: 12, actividades: [
      { name: 'En la práctica', tareas: [
        t(2008, 'Acompañamiento a reunión con cliente', 'tarea-otro', 15, 'Participa en una reunión real con tu líder.', 14, ['Colaborador', 'Manager']),
        t(2009, 'Propuesta comercial de práctica', 'subida', 20, 'Sube una propuesta para retroalimentación.', 20),
      ] },
    ] },
  ],

  // 3 — Onboarding Liderazgo
  3: [
    { name: 'Inmersión estratégica', duracion: 6, actividades: [
      { name: 'Contexto de la empresa', tareas: [
        t(3001, 'Visión y estrategia 2026', 'video', 10, 'La dirección presenta la estrategia del año.', 1),
        t(3002, 'Estructura organizacional', 'documento', 10, 'Áreas, líderes y cómo trabajamos juntos.', 2),
        t(3003, 'Tablero de indicadores', 'documento', 10, 'Los KPI que sigue la dirección.', 4),
      ] },
    ] },
    { name: 'Tu equipo', duracion: 8, actividades: [
      { name: 'Conoce a tu gente', tareas: [
        t(3004, '1:1 con cada integrante del equipo', 'tarea-otro', 15, 'Agenda una primera reunión con cada persona.', 7, ['Manager']),
        t(3005, 'Diagnóstico del área', 'subida', 15, 'Sube tu lectura inicial de fortalezas y riesgos.', 12, ['Manager']),
      ] },
    ] },
    { name: 'Primeros 90 días', duracion: 12, actividades: [
      { name: 'Plan de acción', tareas: [
        t(3006, 'Plan de los primeros 90 días', 'subida', 20, 'Presenta tu plan a la dirección.', 20, ['Manager']),
        t(3007, 'Alineación con tu líder', 'tarea-otro', 10, 'Valida objetivos y prioridades con tu líder.', 22, ['Manager']),
      ] },
    ] },
  ],

  // 4 — Onboarding Operaciones
  4: [
    { name: 'Bienvenida', duracion: 5, actividades: [
      { name: 'Primer día', tareas: [
        t(4001, 'Video de bienvenida', 'video', 10, 'Bienvenida al equipo de Operaciones.', 1),
        t(4002, 'Completa tu perfil', 'completar-perfil', 5, 'Registra tus datos en la plataforma.', 1),
        t(4003, 'Reglamento interno', 'documento', 10, 'Lee el reglamento interno de trabajo.', 2),
      ] },
    ] },
    { name: 'Procesos y herramientas', duracion: 8, actividades: [
      { name: 'Cómo operamos', tareas: [
        t(4004, 'Mapa de procesos clave', 'documento', 10, 'Los procesos centrales del área y sus dueños.', 5),
        t(4005, 'Herramientas de gestión', 'video', 10, 'Uso de las herramientas operativas del día a día.', 6),
        t(4006, 'Prueba de procesos', 'quiz', 15, 'Evalúa lo aprendido sobre los procesos.', 9),
      ] },
    ] },
    { name: 'Mejora continua', duracion: 10, actividades: [
      { name: 'Primer aporte', tareas: [
        t(4007, 'Observa un proceso end-to-end', 'tarea-otro', 15, 'Acompaña un proceso completo con tu mentor.', 12),
        t(4008, 'Propuesta de mejora', 'subida', 20, 'Sube una propuesta de mejora identificada.', 18),
      ] },
    ] },
  ],

  // 5 — Onboarding Tech — Backend
  5: [
    { name: 'Setup técnico', duracion: 5, actividades: [
      { name: 'Entorno de trabajo', tareas: [
        t(5001, 'Configura tu entorno de desarrollo', 'tarea-otro', 15, 'Instala y configura las herramientas necesarias.', 1),
        t(5002, 'Accesos a repositorios', 'tarea-otro', 10, 'Solicita y configura tus accesos de Git.', 2),
        t(5003, 'Completa tu perfil', 'completar-perfil', 5, 'Registra tus datos en la plataforma.', 1),
      ] },
    ] },
    { name: 'Arquitectura', duracion: 7, actividades: [
      { name: 'Conoce los sistemas', tareas: [
        t(5004, 'Documentación de arquitectura', 'documento', 10, 'Visión general de servicios y sistemas.', 4),
        t(5005, 'Estándares de código', 'documento', 10, 'Convenciones, revisión y buenas prácticas.', 5),
        t(5006, 'Prueba de arquitectura', 'quiz', 15, 'Evalúa lo aprendido sobre nuestros sistemas.', 7),
      ] },
    ] },
    { name: 'Primer entregable', duracion: 12, actividades: [
      { name: 'Manos al código', tareas: [
        t(5007, 'Primera tarea con code review', 'tarea-otro', 15, 'Completa una tarea pequeña con revisión de tu mentor.', 12),
        t(5008, 'Entrega de proyecto inicial', 'subida', 20, 'Sube tu primer entregable al equipo.', 20),
      ] },
    ] },
  ],

  // 7 — Onboarding Diseño & UX
  7: [
    { name: 'Bienvenida y marca', duracion: 5, actividades: [
      { name: 'Primer día', tareas: [
        t(7001, 'Video de bienvenida', 'video', 10, 'Bienvenida al equipo de Diseño.', 1),
        t(7002, 'Completa tu perfil', 'completar-perfil', 5, 'Registra tus datos en la plataforma.', 1),
        t(7003, 'Manual de marca', 'documento', 10, 'Logo, colores, tipografías y tono de comunicación.', 2),
      ] },
    ] },
    { name: 'Sistema de diseño', duracion: 7, actividades: [
      { name: 'Herramientas y librería', tareas: [
        t(7004, 'Acceso a Figma y librería de componentes', 'tarea-otro', 10, 'Configura tus accesos y explora el design system.', 4),
        t(7005, 'Principios de UX del producto', 'documento', 10, 'Cómo pensamos la experiencia de usuario.', 5),
        t(7006, 'Prueba del sistema de diseño', 'quiz', 15, 'Evalúa lo aprendido sobre el design system.', 7),
      ] },
    ] },
    { name: 'Primer proyecto', duracion: 10, actividades: [
      { name: 'A diseñar', tareas: [
        t(7007, 'Shadowing en una revisión de diseño', 'tarea-otro', 15, 'Acompaña una sesión de revisión con el equipo.', 12),
        t(7008, 'Propuesta de diseño inicial', 'subida', 20, 'Sube tu primera propuesta para retroalimentación.', 18),
      ] },
    ] },
  ],

  // 9 — Onboarding Marketing Digital
  9: [
    { name: 'Bienvenida y marca', duracion: 5, actividades: [
      { name: 'Primer día', tareas: [
        t(9001, 'Video de bienvenida', 'video', 10, 'Bienvenida al equipo de Marketing.', 1),
        t(9002, 'Completa tu perfil', 'completar-perfil', 5, 'Registra tus datos en la plataforma.', 1),
        t(9003, 'Manual de marca', 'documento', 10, 'Identidad, tono y lineamientos de comunicación.', 2),
      ] },
    ] },
    { name: 'Herramientas y procesos', duracion: 7, actividades: [
      { name: 'Cómo trabajamos', tareas: [
        t(9004, 'Acceso a herramientas del equipo', 'tarea-otro', 10, 'Configura tus accesos a las plataformas de marketing.', 4),
        t(9005, 'Calendario editorial', 'documento', 10, 'Cómo se planifica y aprueba el contenido.', 5),
        t(9006, 'Prueba de marca y procesos', 'quiz', 15, 'Evalúa lo aprendido sobre marca y flujo de trabajo.', 7),
      ] },
    ] },
    { name: 'Primera campaña', duracion: 10, actividades: [
      { name: 'A producir', tareas: [
        t(9007, 'Análisis de una campaña anterior', 'tarea-otro', 15, 'Revisa métricas y aprendizajes de una campaña previa.', 12),
        t(9008, 'Propuesta de contenido', 'subida', 20, 'Sube tu primera propuesta de contenido para revisión.', 18, ['Colaborador', 'Manager']),
      ] },
    ] },
  ],

  // 6 — Onboarding Finanzas (borrador)
  6: [
    { name: 'Bienvenida', duracion: 5, actividades: [
      { name: 'Primer día', tareas: [
        t(6001, 'Video de bienvenida', 'video', 10, 'Bienvenida al equipo de Finanzas.', 1),
        t(6002, 'Completa tu perfil', 'completar-perfil', 5, 'Registra tus datos en la plataforma.', 1),
        t(6003, 'Política de confidencialidad', 'documento', 10, 'Lee y confirma la política de manejo de información.', 2),
      ] },
    ] },
    { name: 'Sistemas y controles', duracion: 8, actividades: [
      { name: 'Cómo trabajamos', tareas: [
        t(6004, 'Acceso al ERP financiero', 'tarea-otro', 10, 'Configura tus accesos al sistema contable.', 4),
        t(6005, 'Políticas contables y controles', 'documento', 10, 'Lineamientos, aprobaciones y controles internos.', 5),
        t(6006, 'Prueba de controles internos', 'quiz', 15, 'Evalúa lo aprendido sobre controles y políticas.', 7),
      ] },
    ] },
    { name: 'Primer cierre', duracion: 10, actividades: [
      { name: 'En la práctica', tareas: [
        t(6007, 'Acompaña un cierre mensual', 'tarea-otro', 15, 'Observa el proceso de cierre junto a tu mentor.', 12),
        t(6008, 'Conciliación de práctica', 'subida', 20, 'Sube una conciliación de ejemplo para revisión.', 18),
      ] },
    ] },
  ],

  // 8 — Onboarding RRHH — Generalista (borrador)
  8: [
    { name: 'Bienvenida', duracion: 5, actividades: [
      { name: 'Primer día', tareas: [
        t(8001, 'Video de bienvenida', 'video', 10, 'Bienvenida al equipo de Recursos Humanos.', 1),
        t(8002, 'Completa tu perfil', 'completar-perfil', 5, 'Registra tus datos en la plataforma.', 1),
        t(8003, 'Código de conducta y ética', 'documento', 10, 'Lee y confirma nuestro código de conducta.', 2),
      ] },
    ] },
    { name: 'Procesos de gente', duracion: 8, actividades: [
      { name: 'Ciclo del colaborador', tareas: [
        t(8004, 'Mapa de procesos de RRHH', 'documento', 10, 'Selección, onboarding, desarrollo y salida.', 4),
        t(8005, 'Herramientas de gestión de personas', 'video', 10, 'Uso de las plataformas de RRHH del día a día.', 5),
        t(8006, 'Prueba de normativa laboral', 'quiz', 15, 'Evalúa lo aprendido sobre normativa y políticas.', 7),
      ] },
    ] },
    { name: 'Primer ciclo', duracion: 10, actividades: [
      { name: 'Manos a la obra', tareas: [
        t(8007, 'Acompaña un proceso de onboarding', 'tarea-otro', 15, 'Observa una incorporación real con tu mentor.', 12),
        t(8008, 'Propuesta de mejora al proceso', 'subida', 20, 'Sube una propuesta de mejora identificada.', 18),
      ] },
    ] },
  ],

  // 10 — Onboarding Legal 2025 (archivada)
  10: [
    { name: 'Bienvenida', duracion: 5, actividades: [
      { name: 'Primer día', tareas: [
        t(10001, 'Video de bienvenida', 'video', 10, 'Bienvenida al equipo Legal.', 1),
        t(10002, 'Completa tu perfil', 'completar-perfil', 5, 'Registra tus datos en la plataforma.', 1),
        t(10003, 'Política de confidencialidad', 'documento', 10, 'Lee y confirma la política de confidencialidad.', 2),
      ] },
    ] },
    { name: 'Marco legal y contratos', duracion: 8, actividades: [
      { name: 'Cómo operamos', tareas: [
        t(10004, 'Repositorio de contratos y plantillas', 'tarea-otro', 10, 'Accede y explora nuestras plantillas legales.', 4),
        t(10005, 'Marco normativo de la empresa', 'documento', 10, 'Normativa aplicable y criterios internos.', 5),
        t(10006, 'Prueba de marco normativo', 'quiz', 15, 'Evalúa lo aprendido sobre el marco legal.', 7),
      ] },
    ] },
    { name: 'Primer expediente', duracion: 10, actividades: [
      { name: 'En la práctica', tareas: [
        t(10007, 'Revisión de contrato acompañada', 'tarea-otro', 15, 'Revisa un contrato junto a tu mentor.', 12),
        t(10008, 'Minuta legal de práctica', 'subida', 20, 'Sube una minuta de ejemplo para retroalimentación.', 18),
      ] },
    ] },
  ],
}
