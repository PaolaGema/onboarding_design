// Datos simulados del dashboard de Inicio — reflejan la forma real de cada módulo
// (Gestión de Personas, Comunicación, Evaluación) para que los widgets y filtros
// operen sobre datos con la misma estructura que tendrían en producción.

export const AREAS = ['Ventas', 'Tecnología', 'Marketing', 'Operaciones', 'Recursos Humanos', 'Diseño', 'Dirección General', 'Psicometría']

export const colaboradores = [
  { id: 1, nombre: 'Renata Solís', area: 'Ventas', cargo: 'Ejecutiva Comercial', estado: 'activo', rol: 'Colaborador', fechaIngreso: '14/03/2022', fechaNacimiento: '14/06/1994' },
  { id: 2, nombre: 'Bruno Alcázar', area: 'Tecnología', cargo: 'Desarrollador Backend', estado: 'activo', rol: 'Colaborador', fechaIngreso: '02/11/2023', fechaNacimiento: '22/09/1990' },
  { id: 3, nombre: 'Melisa Ortega', area: 'Marketing', cargo: 'Content Creator', estado: 'licencia', rol: 'Colaborador', fechaIngreso: '20/06/2024', fechaNacimiento: '05/03/1996' },
  { id: 4, nombre: 'Ignacio Rivas', area: 'Operaciones', cargo: 'Analista de Procesos', estado: 'licencia', rol: 'Colaborador', fechaIngreso: '05/01/2021', fechaNacimiento: '30/06/1988' },
  { id: 5, nombre: 'Carla Ibáñez', area: 'Recursos Humanos', cargo: 'Generalista RRHH', estado: 'activo', rol: 'Admin. RRHH', fechaIngreso: '11/09/2020', fechaNacimiento: '28/06/1985' },
  { id: 6, nombre: 'Tomás Cáceres', area: 'Diseño', cargo: 'Diseñador UX/UI', estado: 'suspendido', rol: 'Colaborador', fechaIngreso: '30/07/2025', fechaNacimiento: '19/06/1997' },
  { id: 7, nombre: 'Valeria Roque', area: 'Ventas', cargo: 'Gerente de Ventas', estado: 'activo', rol: 'Asistente', fechaIngreso: '28/06/2019', fechaNacimiento: '02/01/1982' },
  { id: 8, nombre: 'Sebastián Quiroga', area: 'Dirección General', cargo: 'Director Ejecutivo', estado: 'activo', rol: 'Admin. General', fechaIngreso: '15/02/2018', fechaNacimiento: '28/06/1975' },
  { id: 9, nombre: 'Fabiola Terán', area: 'Psicometría', cargo: 'Psicómetra Especialista', estado: 'activo', rol: 'Colaborador', fechaIngreso: '02/05/2021', fechaNacimiento: '28/06/1993' },
  { id: 10, nombre: 'Marco Andrade', area: 'Tecnología', cargo: 'QA Tester', estado: 'inactivo', rol: 'Colaborador', fechaIngreso: '19/08/2022', fechaNacimiento: '09/12/1991', fechaBaja: '12/03/2026' },
  { id: 11, nombre: 'Daniela Ponce', area: 'Marketing', cargo: 'Asistente de Marketing', estado: 'activo', rol: 'Colaborador', fechaIngreso: '09/07/2024', fechaNacimiento: '28/06/1998' },
  { id: 12, nombre: 'Gabriel Nava', area: 'Operaciones', cargo: 'Project Manager', estado: 'activo', rol: 'Colaborador', fechaIngreso: '09/07/2023', fechaNacimiento: '23/06/1989' },
  // Ingresos recientes. Diego y Sofía tienen su nombre en `asignaciones` (módulo de
  // Onboarding), así que el widget "Requieren atención" no debe marcarlos; el resto sí.
  { id: 13, nombre: 'Diego Morales', area: 'Tecnología', cargo: 'Desarrollador Backend', estado: 'activo', rol: 'Colaborador', fechaIngreso: '03/06/2026', fechaNacimiento: '12/02/1995' },
  { id: 14, nombre: 'Sofía Ramírez', area: 'Ventas', cargo: 'Pasante Comercial', estado: 'activo', rol: 'Colaborador', fechaIngreso: '17/06/2026', fechaNacimiento: '07/10/1999' },
  { id: 15, nombre: 'Lucía Vera', area: 'Marketing', cargo: 'Community Manager', estado: 'activo', rol: 'Colaborador', fechaIngreso: '08/06/2026', fechaNacimiento: '25/11/1997' },
  { id: 16, nombre: 'Andrés Kohl', area: 'Tecnología', cargo: 'Desarrollador Frontend', estado: 'activo', rol: 'Colaborador', fechaIngreso: '15/06/2026', fechaNacimiento: '03/04/1993' },
  { id: 17, nombre: 'Ariana Ledezma', area: 'Recursos Humanos', cargo: 'Analista de Selección', estado: 'activo', rol: 'Colaborador', fechaIngreso: '01/06/2026', fechaNacimiento: '16/08/1996' },
  { id: 20, nombre: 'Iván Bustos', area: 'Ventas', cargo: 'Ejecutivo Comercial', estado: 'activo', rol: 'Colaborador', fechaIngreso: '12/09/2025', fechaNacimiento: '07/01/1994' },
  { id: 21, nombre: 'Noelia Sanz', area: 'Ventas', cargo: 'Analista Comercial', estado: 'activo', rol: 'Colaborador', fechaIngreso: '04/02/2026', fechaNacimiento: '19/10/1993' },
  { id: 22, nombre: 'Hugo Peralta', area: 'Tecnología', cargo: 'DevOps Engineer', estado: 'activo', rol: 'Colaborador', fechaIngreso: '21/11/2025', fechaNacimiento: '30/03/1988' },
  { id: 23, nombre: 'Sara Villalba', area: 'Tecnología', cargo: 'Data Analyst', estado: 'activo', rol: 'Colaborador', fechaIngreso: '06/04/2026', fechaNacimiento: '12/07/1996' },
  { id: 24, nombre: 'Mateo Rojas', area: 'Tecnología', cargo: 'Tech Lead', estado: 'activo', rol: 'Colaborador', fechaIngreso: '03/03/2020', fechaNacimiento: '25/02/1986' },
  { id: 25, nombre: 'Julia Cabrera', area: 'Marketing', cargo: 'Brand Manager', estado: 'activo', rol: 'Colaborador', fechaIngreso: '17/01/2022', fechaNacimiento: '08/11/1990' },
  { id: 26, nombre: 'Pablo Ferrer', area: 'Operaciones', cargo: 'Analista de Calidad', estado: 'activo', rol: 'Colaborador', fechaIngreso: '25/05/2023', fechaNacimiento: '14/04/1992' },
  { id: 27, nombre: 'Elena Duarte', area: 'Operaciones', cargo: 'Jefa de Operaciones', estado: 'activo', rol: 'Asistente', fechaIngreso: '09/09/2019', fechaNacimiento: '21/12/1983' },
  { id: 28, nombre: 'Rodrigo Salas', area: 'Recursos Humanos', cargo: 'Especialista en Compensaciones', estado: 'activo', rol: 'Colaborador', fechaIngreso: '14/08/2021', fechaNacimiento: '03/09/1987' },
  { id: 29, nombre: 'Ximena Ávila', area: 'Diseño', cargo: 'Diseñadora Gráfica', estado: 'licencia', rol: 'Colaborador', fechaIngreso: '28/02/2023', fechaNacimiento: '16/09/1995' },
  { id: 30, nombre: 'Damián Rueda', area: 'Diseño', cargo: 'Diseñador de Producto', estado: 'activo', rol: 'Colaborador', fechaIngreso: '11/10/2024', fechaNacimiento: '05/05/1991' },
  { id: 31, nombre: 'Lorena Pinto', area: 'Psicometría', cargo: 'Analista Psicométrica', estado: 'activo', rol: 'Colaborador', fechaIngreso: '07/03/2024', fechaNacimiento: '27/08/1994' },
  // `fechaBaja` es lo que respalda la rotación y la curva de altas/bajas: sin ella, el
  // porcentaje sería un número inventado. Están repartidas a lo largo del último año.
  { id: 18, nombre: 'Renzo Ferreira', area: 'Ventas', cargo: 'Ejecutivo Comercial', estado: 'inactivo', rol: 'Colaborador', fechaIngreso: '03/02/2023', fechaNacimiento: '11/05/1992', fechaBaja: '28/01/2026' },
  { id: 19, nombre: 'Camila Duarte', area: 'Operaciones', cargo: 'Coordinadora Logística', estado: 'inactivo', rol: 'Colaborador', fechaIngreso: '17/10/2021', fechaNacimiento: '04/09/1990', fechaBaja: '05/11/2025' },
  { id: 32, nombre: 'Óscar Lemos', area: 'Ventas', cargo: 'Ejecutivo Comercial', estado: 'inactivo', rol: 'Colaborador', fechaIngreso: '05/06/2022', fechaNacimiento: '18/01/1990', fechaBaja: '22/08/2025' },
  { id: 33, nombre: 'Tania Mercado', area: 'Marketing', cargo: 'Diseñadora de Contenido', estado: 'inactivo', rol: 'Colaborador', fechaIngreso: '13/03/2023', fechaNacimiento: '09/07/1995', fechaBaja: '14/10/2025' },
  { id: 34, nombre: 'Gonzalo Ferrari', area: 'Tecnología', cargo: 'Desarrollador Backend', estado: 'inactivo', rol: 'Colaborador', fechaIngreso: '02/02/2024', fechaNacimiento: '23/11/1992', fechaBaja: '09/05/2026' },
]

export const invitaciones = { pendientes: 4, aceptadas: 5, expiradas: 0, canceladas: 0 }

// Todas las fechas son anteriores al "hoy" del demo (17/06/2026): son publicaciones ya
// emitidas, no programadas. De lo contrario "recientes" contaría eventos del futuro.
export const publicaciones = [
  { id: 1, titulo: 'Nuevo horario de atención', fecha: '15/06/2026 15:47', audiencia: '1 sucursal', vistas: 14, likes: 2, comentarios: 3 },
  { id: 2, titulo: 'Reconocimiento de Departamento: Logros Q2', fecha: '12/06/2026 13:40', audiencia: '2 sucursales', vistas: 15, likes: 4, comentarios: 1 },
  { id: 3, titulo: 'Aviso: Mantenimiento programado de sistemas', fecha: '09/06/2026 09:00', audiencia: 'Toda la empresa', vistas: 22, likes: 1, comentarios: 0 },
  { id: 4, titulo: 'Próximo Town Hall Q3: reserva la fecha', fecha: '04/06/2026 08:00', audiencia: 'Toda la empresa', vistas: 31, likes: 6, comentarios: 9 },
  { id: 5, titulo: '¡Meta comercial cumplida!', fecha: '29/05/2026 17:00', audiencia: '1 sucursal', vistas: 26, likes: 8, comentarios: 5 },
]
export const totalPublicaciones = 19

// El motivo tiene que cuadrar con la ficha de la persona: el cumpleaños de Renata es el
// 14/06 y Fabiola ingresó el 02/05/2021, así que su aniversario cae ese mismo día.
export const reconocimientos = [
  { id: 1, tipo: 'Celebración', motivo: 'Proyecto completado', persona: 'Gabriel Nava', audiencia: 'Toda la empresa', fecha: '16/06/2026' },
  { id: 2, tipo: 'Celebración', motivo: 'Cumpleaños', persona: 'Renata Solís', audiencia: 'Toda la empresa', fecha: '14/06/2026' },
  { id: 3, tipo: 'Reconocimiento', motivo: 'Liderazgo', persona: 'Carla Ibáñez', audiencia: '1 sucursal', fecha: '11/06/2026' },
  { id: 4, tipo: 'Celebración', motivo: 'Nuevo puesto', persona: 'Valeria Roque', audiencia: 'Toda la empresa', fecha: '08/06/2026' },
  { id: 5, tipo: 'Celebración', motivo: 'Aniversario laboral', persona: 'Fabiola Terán', audiencia: '1 sucursal', fecha: '02/05/2026' },
]

export const procesosEvaluacion = [
  { id: 1, nombre: 'Evaluación de Desempeño Q3', tipo: 'Desempeño 90°', estado: 'en-curso', salud: 'buen-avance', completadas: 1, total: 2, inicio: '06/06/2026', fin: '30/07/2026' },
  { id: 2, nombre: 'Evaluación Trimestral Ventas', tipo: 'Objetivos 90°', estado: 'en-curso', salud: 'en-alerta', completadas: 5, total: 46, inicio: '21/04/2026', fin: '27/05/2026' },
  { id: 3, nombre: 'Encuesta de Clima Laboral', tipo: 'Encuesta · Clima', estado: 'en-curso', salud: 'en-alerta', completadas: 3, total: 23, inicio: '09/04/2026', fin: '13/04/2026' },
  { id: 4, nombre: 'Test DISC — Nuevos ingresos', tipo: 'Test psicométrico · DISC', estado: 'en-curso', salud: 'buen-avance', completadas: 12, total: 20, inicio: '01/06/2026', fin: '15/07/2026' },
  { id: 5, nombre: 'Evaluación 180° Liderazgo', tipo: 'Desempeño 180°', estado: 'finalizado', salud: 'completado', completadas: 22, total: 22, inicio: '06/05/2026', fin: '24/06/2026' },
  { id: 6, nombre: 'Evaluación de Objetivos Q2', tipo: 'Objetivos 90°', estado: 'finalizado', salud: 'completado', completadas: 8, total: 8, inicio: '15/04/2026', fin: '31/05/2026' },
  { id: 7, nombre: 'Evaluación 360° Gerencial', tipo: 'Desempeño 360°', estado: 'programado', salud: 'programado', completadas: 0, total: 12, inicio: '01/08/2026', fin: '30/08/2026' },
  { id: 8, nombre: 'Encuesta eNPS Semestral', tipo: 'Encuesta · eNPS', estado: 'programado', salud: 'programado', completadas: 0, total: 48, inicio: '15/08/2026', fin: '22/08/2026' },
  // Todavía no vencen, pero cierran esta semana con menos de la mitad respondida: eso es
  // lo que el dashboard llama "en riesgo". Sin estos dos, ese widget nacería vacío.
  { id: 9, nombre: 'Encuesta de Pulso — Junio', tipo: 'Encuesta · Pulso', estado: 'en-curso', salud: 'en-alerta', completadas: 9, total: 40, inicio: '05/06/2026', fin: '19/06/2026' },
  { id: 10, nombre: 'Evaluación 90° Operaciones', tipo: 'Desempeño 90°', estado: 'en-curso', salud: 'en-alerta', completadas: 4, total: 18, inicio: '01/06/2026', fin: '22/06/2026' },
]

// Se cuenta desde `procesosEvaluacion` para que el número de la pestaña coincida con las
// filas que realmente se listan debajo.
export const evalTotales = procesosEvaluacion.reduce(
  (acc, p) => ({ ...acc, [p.estado]: acc[p.estado] + 1 }),
  { 'en-curso': 0, finalizado: 0, programado: 0, borrador: 0 },
)

// `total` es la plantilla vigente: quien causó baja ya no puede tener un PDI activo.
export const pdi = { activos: 9, total: colaboradores.filter(c => !c.fechaBaja).length, objetivosCumplidosPct: 14, avancePromedioPct: 17 }
