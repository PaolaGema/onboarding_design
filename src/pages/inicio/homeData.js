// Datos simulados del dashboard de Inicio — reflejan la forma real de cada módulo
// (Gestión de Personas, Comunicación, Evaluación) para que los widgets y filtros
// operen sobre datos con la misma estructura que tendrían en producción.

export const AREAS = ['Ventas', 'Tecnología', 'Marketing', 'Operaciones', 'Recursos Humanos', 'Diseño', 'Dirección General', 'Psicometría']

export const colaboradores = [
  { id: 1, nombre: 'Renata Solís', area: 'Ventas', cargo: 'Ejecutiva Comercial', estado: 'activo', rol: 'Colaborador', fechaIngreso: '14/03/2022', fechaNacimiento: '14/06/1994' },
  { id: 2, nombre: 'Bruno Alcázar', area: 'Tecnología', cargo: 'Desarrollador Backend', estado: 'activo', rol: 'Colaborador', fechaIngreso: '02/11/2023', fechaNacimiento: '22/09/1990' },
  { id: 3, nombre: 'Melisa Ortega', area: 'Marketing', cargo: 'Content Creator', estado: 'licencia', rol: 'Colaborador', fechaIngreso: '20/06/2024', fechaNacimiento: '05/03/1996' },
  { id: 4, nombre: 'Ignacio Rivas', area: 'Operaciones', cargo: 'Analista de Procesos', estado: 'licencia', rol: 'Colaborador', fechaIngreso: '05/01/2021', fechaNacimiento: '30/06/1988' },
  { id: 5, nombre: 'Carla Ibáñez', area: 'Recursos Humanos', cargo: 'Generalista RRHH', estado: 'activo', rol: 'Admin. RRHH', fechaIngreso: '11/09/2020', fechaNacimiento: '11/11/1985' },
  { id: 6, nombre: 'Tomás Cáceres', area: 'Diseño', cargo: 'Diseñador UX/UI', estado: 'suspendido', rol: 'Colaborador', fechaIngreso: '30/07/2025', fechaNacimiento: '19/06/1997' },
  { id: 7, nombre: 'Valeria Roque', area: 'Ventas', cargo: 'Gerente de Ventas', estado: 'activo', rol: 'Asistente', fechaIngreso: '02/01/2019', fechaNacimiento: '02/01/1982' },
  { id: 8, nombre: 'Sebastián Quiroga', area: 'Dirección General', cargo: 'Director Ejecutivo', estado: 'activo', rol: 'Admin. General', fechaIngreso: '15/02/2018', fechaNacimiento: '15/08/1975' },
  { id: 9, nombre: 'Fabiola Terán', area: 'Psicometría', cargo: 'Psicómetra Especialista', estado: 'activo', rol: 'Colaborador', fechaIngreso: '02/05/2021', fechaNacimiento: '28/06/1993' },
  { id: 10, nombre: 'Marco Andrade', area: 'Tecnología', cargo: 'QA Tester', estado: 'inactivo', rol: 'Colaborador', fechaIngreso: '19/08/2022', fechaNacimiento: '09/12/1991' },
  { id: 11, nombre: 'Daniela Ponce', area: 'Marketing', cargo: 'Asistente de Marketing', estado: 'activo', rol: 'Colaborador', fechaIngreso: '09/07/2024', fechaNacimiento: '09/07/1998' },
  { id: 12, nombre: 'Gabriel Nava', area: 'Operaciones', cargo: 'Project Manager', estado: 'activo', rol: 'Colaborador', fechaIngreso: '09/07/2023', fechaNacimiento: '23/06/1989' },
]

export const invitaciones = { pendientes: 4, aceptadas: 5, expiradas: 0, canceladas: 0 }

export const publicaciones = [
  { id: 1, titulo: 'Nuevo horario de atención', fecha: '03/07/2026 15:47', audiencia: '1 sucursal', vistas: 14, likes: 2 },
  { id: 2, titulo: 'Reconocimiento de Departamento: Logros Q3', fecha: '03/07/2026 13:40', audiencia: '2 sucursales', vistas: 15, likes: 4 },
  { id: 3, titulo: 'Aviso: Mantenimiento programado de sistemas', fecha: '02/07/2026 09:00', audiencia: 'Toda la empresa', vistas: 22, likes: 1 },
  { id: 4, titulo: 'Próximo Town Hall Q3: reserva la fecha', fecha: '01/07/2026 08:00', audiencia: 'Toda la empresa', vistas: 31, likes: 6 },
  { id: 5, titulo: '¡Meta comercial cumplida!', fecha: '28/06/2026 17:00', audiencia: '1 sucursal', vistas: 26, likes: 8 },
]
export const totalPublicaciones = 19

export const reconocimientos = [
  { id: 1, tipo: 'Celebración', motivo: 'Proyecto completado', persona: 'Gabriel Nava', audiencia: 'Toda la empresa', fecha: '07/07/2026' },
  { id: 2, tipo: 'Reconocimiento', motivo: 'Liderazgo', persona: 'Carla Ibáñez', audiencia: '1 sucursal', fecha: '03/07/2026' },
  { id: 3, tipo: 'Celebración', motivo: 'Nuevo puesto', persona: 'Valeria Roque', audiencia: 'Toda la empresa', fecha: '03/07/2026' },
  { id: 4, tipo: 'Celebración', motivo: 'Cumpleaños', persona: 'Daniela Ponce', audiencia: 'Toda la empresa', fecha: '01/07/2026' },
  { id: 5, tipo: 'Celebración', motivo: 'Aniversario laboral', persona: 'Bruno Alcázar', audiencia: '1 sucursal', fecha: '28/06/2026' },
]

export const evalTotales = { 'en-curso': 10, finalizado: 18, programado: 3, borrador: 0 }

export const procesosPorTipo = [
  { tipo: 'Objetivos', count: 12 },
  { tipo: 'Desempeño', count: 9 },
  { tipo: 'Encuesta', count: 6 },
  { tipo: 'Test psicométrico', count: 4 },
]

export const procesosEvaluacion = [
  { id: 1, nombre: 'Evaluación de Desempeño Q3', tipo: 'Desempeño 90°', estado: 'en-curso', salud: 'buen-avance', completadas: 1, total: 2, inicio: '06/07/2026', fin: '30/07/2026' },
  { id: 2, nombre: 'Evaluación Trimestral Ventas', tipo: 'Objetivos 90°', estado: 'en-curso', salud: 'en-alerta', completadas: 5, total: 46, inicio: '21/04/2026', fin: '27/05/2026' },
  { id: 3, nombre: 'Encuesta de Clima Laboral', tipo: 'Encuesta · Clima', estado: 'en-curso', salud: 'en-alerta', completadas: 3, total: 23, inicio: '09/04/2026', fin: '13/04/2026' },
  { id: 4, nombre: 'Test DISC — Nuevos ingresos', tipo: 'Test psicométrico · DISC', estado: 'en-curso', salud: 'buen-avance', completadas: 12, total: 20, inicio: '01/06/2026', fin: '15/07/2026' },
  { id: 5, nombre: 'Evaluación 180° Liderazgo', tipo: 'Desempeño 180°', estado: 'finalizado', salud: 'completado', completadas: 22, total: 22, inicio: '06/05/2026', fin: '24/06/2026' },
  { id: 6, nombre: 'Evaluación de Objetivos Q2', tipo: 'Objetivos 90°', estado: 'finalizado', salud: 'completado', completadas: 8, total: 8, inicio: '15/04/2026', fin: '31/05/2026' },
  { id: 7, nombre: 'Evaluación 360° Gerencial', tipo: 'Desempeño 360°', estado: 'programado', salud: 'programado', completadas: 0, total: 12, inicio: '01/08/2026', fin: '30/08/2026' },
  { id: 8, nombre: 'Encuesta eNPS Semestral', tipo: 'Encuesta · eNPS', estado: 'programado', salud: 'programado', completadas: 0, total: 48, inicio: '15/08/2026', fin: '22/08/2026' },
]

export const pdi = { activos: 18, total: 21, objetivosCumplidosPct: 14, avancePromedioPct: 17 }

export const climaLaboralEnps = 62

export const rotacionMensual = { pct: 3.2, salidas: 1 }
