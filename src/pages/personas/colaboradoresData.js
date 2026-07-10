// Directorio de colaboradores del prototipo. Vive fuera de `Colaboradores.jsx` para que
// los modales que necesitan la lista (asignar buddy, previsualizar ruta) no tengan que
// importar de vuelta a la pantalla que a su vez los importa a ellos.

export const departamentos = ['Todos', 'Ventas', 'Tecnología', 'Marketing', 'Operaciones', 'Recursos Humanos', 'Finanzas', 'Diseño']

/* Una ruta asignada no arranca sola: queda "Sin iniciar" hasta que el colaborador abre su
   primera tarea. Solo entonces pasa a "En curso". */
export const ESTADOS_ONBOARDING = {
  'n-a': { label: 'N/A', color: '#b0b8c4', dot: '#cbd5e1', bg: '#f8fafc', desc: 'Incorporado antes del sistema' },
  'sin-ruta': { label: 'Sin ruta', color: '#64748b', dot: '#94a3b8', bg: '#f8fafc', desc: 'Nuevo ingreso sin ruta asignada' },
  'sin-iniciar': { label: 'Sin iniciar', color: '#b45309', dot: '#f59e0b', bg: '#fefce8', desc: 'Ruta asignada, aún no la comienza' },
  'en-curso': { label: 'En curso', color: '#2563eb', dot: '#2563eb', bg: '#eff6ff', desc: 'Realizando su onboarding' },
  'en-riesgo': { label: 'En riesgo', color: '#dc2626', dot: '#dc2626', bg: '#fef2f2', desc: '+3 días sin actividad' },
  'graduado': { label: 'Graduado', color: '#16a34a', dot: '#16a34a', bg: '#f0fdf4', desc: 'Completó todas las etapas' },
}

// Estados en los que ya existe una ruta viva: se puede desasignar y se puede acompañar con un buddy.
export const CON_RUTA_ACTIVA = ['sin-iniciar', 'en-curso', 'en-riesgo']

// Solo puede acompañar a alguien quien ya terminó su propio onboarding (o entró antes del
// sistema). Nadie guía un camino que todavía está recorriendo.
export const BUDDY_ELEGIBLE = ['graduado', 'n-a']

// El buddy es una relación que cuelga de la asignación de onboarding: Diego es Colaborador
// graduado y, además, acompaña a tres personas.
const BUDDY_MARTIN = { name: 'Martín Solano', initials: 'MS', color: '#10b981' }
const BUDDY_DIEGO = { name: 'Diego Morales', initials: 'DM', color: '#3b82f6' }

export const colaboradoresData = [
  { id: 1, name: 'Diego Morales', email: 'diego.morales@trabajito.com', depto: 'Tecnología', cargo: 'Desarrollador Backend', rol: 'Colaborador', ingreso: '15 Mar 2025', status: 'activo', registro: 100, onb: 'graduado', initials: 'DM', color: '#3b82f6' },
  { id: 2, name: 'Camila Herrera', email: 'camila.herrera@trabajito.com', depto: 'Ventas', cargo: 'Ejecutiva Comercial', rol: 'Colaborador', ingreso: '02 Ene 2026', status: 'activo', registro: 100, onb: 'sin-iniciar', onbPct: 0, initials: 'CH', color: '#f97316', buddy: BUDDY_MARTIN },
  { id: 3, name: 'Valentina Cruz', email: 'valentina.cruz@trabajito.com', depto: 'Diseño', cargo: 'Diseñadora UX/UI', rol: 'Colaborador', ingreso: '20 May 2026', status: 'activo', registro: 100, onb: 'en-riesgo', onbPct: 25, initials: 'VC', color: '#ec4899', buddy: BUDDY_DIEGO },
  { id: 4, name: 'Facundo Medina', email: 'facundo.medina@trabajito.com', depto: 'Tecnología', cargo: 'QA Engineer', rol: 'Colaborador', ingreso: '10 Abr 2026', status: 'activo', registro: 100, onb: 'en-riesgo', onbPct: 15, initials: 'FM', color: '#ef4444' },
  { id: 5, name: 'Sofía Ramírez', email: 'sofia.ramirez@trabajito.com', depto: 'Ventas', cargo: 'Pasante Comercial', rol: 'Colaborador', ingreso: '10 Jun 2026', status: 'activo', registro: 60, onb: 'sin-ruta', initials: 'SR', color: '#f59e0b' },
  { id: 6, name: 'Martín Solano', email: 'martin.solano@trabajito.com', depto: 'Tecnología', cargo: 'Frontend Developer', rol: 'Colaborador', ingreso: '03 Feb 2025', status: 'activo', registro: 100, onb: 'graduado', initials: 'MS', color: '#10b981' },
  { id: 7, name: 'Luciana Paredes', email: 'luciana.paredes@trabajito.com', depto: 'Ventas', cargo: 'Account Manager', rol: 'Colaborador', ingreso: '17 Jun 2026', status: 'activo', registro: 40, onb: 'sin-ruta', initials: 'LP', color: '#0d9488' },
  { id: 8, name: 'Tomás Ibáñez', email: 'tomas.ibanez@trabajito.com', depto: 'Operaciones', cargo: 'Analista de Procesos', rol: 'Colaborador', ingreso: '17 Jun 2026', status: 'activo', registro: 25, onb: 'sin-ruta', initials: 'TI', color: '#8b5cf6' },
  { id: 9, name: 'Paola Arce', email: 'paola.arce@trabajito.com', depto: 'Recursos Humanos', cargo: 'Especialista RRHH', rol: 'Sub-admin RRHH', ingreso: '10 Ago 2024', status: 'activo', registro: 100, onb: 'n-a', initials: 'PA', color: '#d946ef' },
  { id: 10, name: 'Roberto Peña', email: 'roberto.pena@trabajito.com', depto: 'Finanzas', cargo: 'Contador General', rol: 'Supervisor', ingreso: '05 Nov 2024', status: 'activo', registro: 100, onb: 'n-a', initials: 'RP', color: '#0C2D40' },
  { id: 11, name: 'Andrea Núñez', email: 'andrea.nunez@trabajito.com', depto: 'Marketing', cargo: 'Community Manager', rol: 'Colaborador', ingreso: '22 Sep 2025', status: 'activo', registro: 100, onb: 'en-curso', onbPct: 55, initials: 'AN', color: '#06b6d4', buddy: BUDDY_DIEGO },
  { id: 12, name: 'Nicolás Zapata', email: 'nicolas.zapata@trabajito.com', depto: 'Ventas', cargo: 'Ejecutivo Senior', rol: 'Líder de área', ingreso: '14 Jul 2024', status: 'activo', registro: 100, onb: 'n-a', initials: 'NZ', color: '#84cc16' },
  { id: 13, name: 'Carolina Vega', email: 'carolina.vega@trabajito.com', depto: 'Marketing', cargo: 'Analista de Marketing', rol: 'Colaborador', ingreso: '08 Mar 2025', status: 'activo', registro: 100, onb: 'graduado', initials: 'CV', color: '#14b8a6' },
  { id: 14, name: 'Alejandro Ríos', email: 'alejandro.rios@trabajito.com', depto: 'Tecnología', cargo: 'DevOps Engineer', rol: 'Colaborador', ingreso: '22 Nov 2024', status: 'activo', registro: 100, onb: 'n-a', initials: 'AR', color: '#6366f1' },
  { id: 15, name: 'Daniela Flores', email: 'daniela.flores@trabajito.com', depto: 'Recursos Humanos', cargo: 'Analista de Nóminas', rol: 'Colaborador', ingreso: '15 Ene 2025', status: 'activo', registro: 100, onb: 'graduado', initials: 'DF', color: '#e11d48' },
  { id: 16, name: 'Sebastián Torres', email: 'sebastian.torres@trabajito.com', depto: 'Operaciones', cargo: 'Coordinador Logístico', rol: 'Supervisor', ingreso: '03 Sep 2025', status: 'vacaciones', registro: 100, onb: 'graduado', initials: 'ST', color: '#0891b2' },
  { id: 17, name: 'Isabella Mendoza', email: 'isabella.mendoza@trabajito.com', depto: 'Finanzas', cargo: 'Analista Financiera', rol: 'Colaborador', ingreso: '18 Abr 2025', status: 'activo', registro: 100, onb: 'en-curso', onbPct: 32, initials: 'IM', color: '#7c3aed' },
  { id: 18, name: 'Mateo Guzmán', email: 'mateo.guzman@trabajito.com', depto: 'Ventas', cargo: 'SDR Junior', rol: 'Colaborador', ingreso: '25 Jun 2026', status: 'activo', registro: 75, onb: 'sin-ruta', initials: 'MG', color: '#ca8a04' },
  { id: 19, name: 'Renata Castillo', email: 'renata.castillo@trabajito.com', depto: 'Diseño', cargo: 'Diseñadora Gráfica', rol: 'Colaborador', ingreso: '12 Feb 2026', status: 'activo', registro: 100, onb: 'en-curso', onbPct: 48, initials: 'RC', color: '#db2777' },
  { id: 20, name: 'Gabriel Pacheco', email: 'gabriel.pacheco@trabajito.com', depto: 'Tecnología', cargo: 'Data Analyst', rol: 'Colaborador', ingreso: '30 May 2025', status: 'activo', registro: 100, onb: 'en-curso', onbPct: 70, initials: 'GP', color: '#059669', buddy: BUDDY_DIEGO },
  { id: 21, name: 'Valeria Rojas', email: 'valeria.rojas@trabajito.com', depto: 'Marketing', cargo: 'Content Creator', rol: 'Colaborador', ingreso: '07 Ago 2025', status: 'activo', registro: 100, onb: 'graduado', initials: 'VR', color: '#c026d3' },
  { id: 22, name: 'Emilio Vargas', email: 'emilio.vargas@trabajito.com', depto: 'Operaciones', cargo: 'Asistente Operativo', rol: 'Colaborador', ingreso: '20 Jun 2026', status: 'licencia', registro: 50, onb: 'sin-ruta', initials: 'EV', color: '#ea580c' },
  { id: 23, name: 'Camilo Espinoza', email: 'camilo.espinoza@trabajito.com', depto: 'Finanzas', cargo: 'Tesorero', rol: 'Gerente', ingreso: '11 Oct 2024', status: 'activo', registro: 100, onb: 'n-a', initials: 'CE', color: '#2563eb' },
  { id: 24, name: 'Julieta Sánchez', email: 'julieta.sanchez@trabajito.com', depto: 'Recursos Humanos', cargo: 'Reclutadora', rol: 'Colaborador', ingreso: '28 Jun 2026', status: 'activo', registro: 15, onb: 'sin-ruta', initials: 'JS', color: '#9333ea' },
]
