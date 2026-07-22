/* Modelo del organigrama.
   El nodo del árbol es el CARGO, no la persona. Esa distinción es la que permite
   representar un cargo vacante (existe la posición, no hay quien la ocupe) y la que
   evita duplicar un puesto cuando lo comparten dos personas.
   Las UNIDADES son las áreas; se anidan entre sí (Marketing → Marketing Digital) y
   agrupan cargos, pero no reportan: quien reporta es el cargo.
   Las personas viven en `colaboradoresData`; acá solo se referencian por id. */

import { colaboradoresData } from '../pages/personas/colaboradoresData'

export const empresa = { nombre: 'SoulyHR', razonSocial: 'SoulyHR S.R.L.' }

export const sucursales = [
  { id: 'central', nombre: 'Sede Central', ciudad: 'Santa Cruz' },
  { id: 'lpz', nombre: 'Sucursal', ciudad: 'La Paz' },
  { id: 'cbb', nombre: 'Sucursal', ciudad: 'Cochabamba' },
]

/* `corto` es la etiqueta de la píldora "Pertenece a" en la tabla, donde el nombre largo
   no entra. */
export const unidades = [
  { id: 'direccion', nombre: 'Dirección General', corto: 'Dir. General', padreId: null, color: '#0C2D40' },
  { id: 'tecnologia', nombre: 'Tecnología', corto: 'Tecnología', padreId: 'direccion', color: '#06b6d4' },
  { id: 'rrhh', nombre: 'Recursos Humanos', corto: 'RRHH', padreId: 'direccion', color: '#d946ef' },
  { id: 'marketing', nombre: 'Marketing', corto: 'Marketing', padreId: 'direccion', color: '#ec4899' },
  { id: 'mkt-digital', nombre: 'Marketing Digital', corto: 'Mkt. Digital', padreId: 'marketing', color: '#ec4899' },
  { id: 'contenidos', nombre: 'Contenidos y Creatividad', corto: 'Contenidos', padreId: 'marketing', color: '#ec4899' },
  { id: 'ventas', nombre: 'Ventas', corto: 'Ventas', padreId: 'direccion', color: '#3b82f6' },
  { id: 'operaciones', nombre: 'Operaciones', corto: 'Operaciones', padreId: 'direccion', color: '#8b5cf6' },
  { id: 'finanzas', nombre: 'Finanzas', corto: 'Finanzas', padreId: 'direccion', color: '#0C2D40' },
  { id: 'diseno', nombre: 'Diseño', corto: 'Diseño', padreId: 'direccion', color: '#f97316' },
]

/* `tipo: 'staff'` cuelga de lado con línea punteada en vez de bajar en la línea de mando:
   asesora a su jefe pero no tiene gente a cargo debajo. */
export const cargos = [
  { id: 'gg', nombre: 'Gerente General', unidadId: 'direccion', reportaA: null, ocupanteId: 28, destacado: true },
  { id: 'asist-dir', nombre: 'Asistente de Dirección', unidadId: 'direccion', reportaA: 'gg', ocupanteId: 29, tipo: 'staff' },

  { id: 'dir-tec', nombre: 'Dirección de Tecnología', unidadId: 'tecnologia', reportaA: 'gg', ocupanteId: null },
  { id: 'dev-back', nombre: 'Desarrollador Backend', unidadId: 'tecnologia', reportaA: 'dir-tec', ocupanteId: 1 },
  { id: 'dev-front', nombre: 'Frontend Developer', unidadId: 'tecnologia', reportaA: 'dir-tec', ocupanteId: 6 },
  { id: 'qa', nombre: 'QA Engineer', unidadId: 'tecnologia', reportaA: 'dir-tec', ocupanteId: 4 },
  { id: 'devops', nombre: 'DevOps Engineer', unidadId: 'tecnologia', reportaA: 'dir-tec', ocupanteId: 14 },
  { id: 'data', nombre: 'Data Analyst', unidadId: 'tecnologia', reportaA: 'dir-tec', ocupanteId: 20 },

  { id: 'dir-rrhh', nombre: 'Especialista RRHH', unidadId: 'rrhh', reportaA: 'gg', ocupanteId: 9 },
  { id: 'nominas', nombre: 'Analista de Nóminas', unidadId: 'rrhh', reportaA: 'dir-rrhh', ocupanteId: 15 },
  { id: 'recluta', nombre: 'Reclutadora', unidadId: 'rrhh', reportaA: 'dir-rrhh', ocupanteId: 24 },

  { id: 'dir-mkt', nombre: 'Líder de Marketing', unidadId: 'marketing', reportaA: 'gg', ocupanteId: 25 },
  { id: 'jefe-mkt-dig', nombre: 'Jefatura de Marketing Digital', unidadId: 'mkt-digital', reportaA: 'dir-mkt', ocupanteId: null },
  { id: 'cm', nombre: 'Community Manager', unidadId: 'mkt-digital', reportaA: 'jefe-mkt-dig', ocupanteId: 11 },
  { id: 'seo', nombre: 'Especialista SEO', unidadId: 'mkt-digital', reportaA: 'jefe-mkt-dig', ocupanteId: 26 },
  { id: 'analista-mkt', nombre: 'Analista de Marketing', unidadId: 'contenidos', reportaA: 'dir-mkt', ocupanteId: 13 },
  { id: 'content', nombre: 'Content Creator', unidadId: 'contenidos', reportaA: 'dir-mkt', ocupanteId: 21 },
  { id: 'marca', nombre: 'Ejecutiva de Marca', unidadId: 'contenidos', reportaA: 'dir-mkt', ocupanteId: 27 },

  { id: 'lider-ventas', nombre: 'Ejecutivo Senior', unidadId: 'ventas', reportaA: 'gg', ocupanteId: 12 },
  { id: 'ejec-com', nombre: 'Ejecutiva Comercial', unidadId: 'ventas', reportaA: 'lider-ventas', ocupanteId: 2 },
  { id: 'account', nombre: 'Account Manager', unidadId: 'ventas', reportaA: 'lider-ventas', ocupanteId: 7 },
  { id: 'sdr', nombre: 'SDR Junior', unidadId: 'ventas', reportaA: 'lider-ventas', ocupanteId: 18 },
  { id: 'pasante', nombre: 'Pasante Comercial', unidadId: 'ventas', reportaA: 'lider-ventas', ocupanteId: 5 },

  { id: 'coord-log', nombre: 'Coordinador Logístico', unidadId: 'operaciones', reportaA: 'gg', ocupanteId: 16 },
  { id: 'analista-proc', nombre: 'Analista de Procesos', unidadId: 'operaciones', reportaA: 'coord-log', ocupanteId: 8 },
  { id: 'asist-op', nombre: 'Asistente Operativo', unidadId: 'operaciones', reportaA: 'coord-log', ocupanteId: 22 },

  { id: 'tesorero', nombre: 'Tesorero', unidadId: 'finanzas', reportaA: 'gg', ocupanteId: 23 },
  { id: 'contador', nombre: 'Contador General', unidadId: 'finanzas', reportaA: 'tesorero', ocupanteId: 10 },
  { id: 'analista-fin', nombre: 'Analista Financiera', unidadId: 'finanzas', reportaA: 'tesorero', ocupanteId: 17 },

  { id: 'dis-ux', nombre: 'Diseñadora UX/UI', unidadId: 'diseno', reportaA: 'gg', ocupanteId: 3 },
  { id: 'dis-graf', nombre: 'Diseñadora Gráfica', unidadId: 'diseno', reportaA: 'dis-ux', ocupanteId: 19 },
]

const personaPorId = new Map(colaboradoresData.map(c => [c.id, c]))
const unidadPorId = new Map(unidades.map(u => [u.id, u]))

export const getPersona = id => (id == null ? null : personaPorId.get(id) || null)
export const getUnidad = id => unidadPorId.get(id) || null

/* Todas las funciones reciben la lista de cargos en vez de leer la constante: la pantalla
   guarda su propia copia en estado para poder crear y editar sin tocar el módulo. */
const esStaff = c => c.tipo === 'staff'

const nodoSuelto = cargo => ({
  tipo: 'cargo', id: cargo.id, cargo,
  ocupante: getPersona(cargo.ocupanteId),
  vacante: cargo.ocupanteId == null,
  staff: [], hijos: [],
})

/* `vistos` corta los ciclos: al editar "reporta a" se puede dejar a un cargo colgando de su
   propio subordinado, y sin este tope la recursión revienta la pila. */
function nodoCargo(cargo, lista, verUnidades, vistos) {
  if (vistos.has(cargo.id)) return nodoSuelto(cargo)
  vistos.add(cargo.id)
  return {
    ...nodoSuelto(cargo),
    staff: lista.filter(c => c.reportaA === cargo.id && esStaff(c)).map(nodoSuelto),
    hijos: agruparHijos(cargo, lista, verUnidades, vistos),
  }
}

/* Un hijo que pertenece a otra unidad que su jefe entra envuelto en la píldora de esa
   unidad; el que comparte unidad cuelga directo. Así el árbol muestra dónde empieza
   cada área sin declarar la jerarquía dos veces. */
function agruparHijos(cargo, lista, verUnidades, vistos) {
  const hijos = lista.filter(c => c.reportaA === cargo.id && !esStaff(c))
  if (!verUnidades) return hijos.map(h => nodoCargo(h, lista, verUnidades, vistos))

  const salida = []
  const grupoPorUnidad = new Map()
  for (const hijo of hijos) {
    if (hijo.unidadId === cargo.unidadId) {
      salida.push(nodoCargo(hijo, lista, verUnidades, vistos))
      continue
    }
    let grupo = grupoPorUnidad.get(hijo.unidadId)
    if (!grupo) {
      grupo = { tipo: 'unidad', id: `u-${hijo.unidadId}`, unidad: getUnidad(hijo.unidadId), hijos: [], staff: [] }
      grupoPorUnidad.set(hijo.unidadId, grupo)
      salida.push(grupo)
    }
    grupo.hijos.push(nodoCargo(hijo, lista, verUnidades, vistos))
  }
  return salida
}

/* modo: 'completo' (unidades + cargos) | 'cargos' (solo cargos) | 'unidades' (solo áreas) */
export function buildOrgTree(modo = 'completo', lista = cargos) {
  if (modo === 'unidades') {
    const nodoUnidad = u => ({
      tipo: 'unidad', id: `u-${u.id}`, unidad: u, staff: [],
      hijos: unidades.filter(x => x.padreId === u.id).map(nodoUnidad),
    })
    return { tipo: 'empresa', id: 'empresa', empresa, staff: [], hijos: unidades.filter(u => u.padreId === null).map(nodoUnidad) }
  }

  const raiz = lista.find(c => c.reportaA === null)
  if (!raiz) return { tipo: 'empresa', id: 'empresa', empresa, staff: [], hijos: [] }

  const nodoRaiz = nodoCargo(raiz, lista, modo === 'completo', new Set())
  const hijos = modo === 'completo'
    ? [{ tipo: 'unidad', id: 'u-direccion', unidad: getUnidad(raiz.unidadId), staff: [], hijos: [nodoRaiz] }]
    : [nodoRaiz]
  return { tipo: 'empresa', id: 'empresa', empresa, staff: [], hijos }
}

/* Forma común de una fila/tarjeta de cargo: la comparten la tabla, las cards y el buscador. */
const datosFila = (cargo, lista) => ({
  cargo,
  unidad: getUnidad(cargo.unidadId),
  tipo: tipoDe(cargo, lista),
  ocupante: getPersona(cargo.ocupanteId),
  vacante: cargo.ocupanteId == null,
  jefeNombre: cargo.reportaA ? (lista.find(c => c.id === cargo.reportaA)?.nombre ?? null) : null,
})

/* La cabeza de un área es el cargo cuyo jefe está fuera del área: es por donde el área
   se engancha al resto de la empresa. */
export function cabezaDe(unidadId, lista = cargos) {
  const propios = lista.filter(c => c.unidadId === unidadId)
  return propios.find(c => !c.reportaA || !propios.some(p => p.id === c.reportaA)) || propios[0] || null
}

export const unidadesRaiz = () => unidades.filter(u => u.padreId === null)

export const subunidadesDe = unidadId => unidades.filter(u => u.padreId === unidadId)

export function tarjetaUnidad(unidadId, lista = cargos) {
  return {
    unidad: getUnidad(unidadId),
    cabeza: cabezaDe(unidadId, lista),
    totalCargos: lista.filter(c => c.unidadId === unidadId).length,
    totalSub: subunidadesDe(unidadId).length,
  }
}

export const cargosDeUnidad = (unidadId, lista = cargos) =>
  lista.filter(c => c.unidadId === unidadId).map(c => datosFila(c, lista))

export function buscarCargos(texto, lista = cargos) {
  const q = texto.trim().toLowerCase()
  if (!q) return []
  return lista
    .map(c => datosFila(c, lista))
    .filter(f =>
      f.cargo.nombre.toLowerCase().includes(q) ||
      (f.ocupante?.name || '').toLowerCase().includes(q) ||
      (f.unidad?.nombre || '').toLowerCase().includes(q))
}

/* La tabla agrupa por ÁREA, no por unidad exacta: las subunidades (Marketing Digital,
   Contenidos) caen dentro de la banda de su área madre y se distinguen por la píldora
   "Pertenece a". Por eso el grupo es el ancestro que cuelga directo de la raíz. */
export function grupoDe(unidadId) {
  let u = getUnidad(unidadId)
  if (!u) return null
  while (u.padreId) {
    const padre = getUnidad(u.padreId)
    if (!padre || padre.padreId === null) break
    u = padre
  }
  return u
}

const tipoDe = (cargo, lista) => {
  if (cargo.tipo === 'staff') return 'staff'
  return lista.some(c => c.reportaA === cargo.id) ? 'jefe' : 'colaborador'
}

/* Devuelve las filas ya ordenadas jerárquicamente y con el nivel de sangría calculado
   dentro de cada grupo, para que la tabla solo tenga que pintarlas. */
export function filasTabla(lista = cargos) {
  const grupos = []
  const indice = new Map()
  const vistos = new Set()

  const claveGrupo = unidadId => grupoDe(unidadId)?.id || 'sin-unidad'

  const empujar = (cargo, profundidad) => {
    if (vistos.has(cargo.id)) return
    vistos.add(cargo.id)

    const clave = claveGrupo(cargo.unidadId)
    let grupo = indice.get(clave)
    if (!grupo) {
      grupo = { id: clave, unidad: grupoDe(cargo.unidadId), filas: [] }
      indice.set(clave, grupo)
      grupos.push(grupo)
    }

    const nivel = grupo.filas.length === 0 ? 0 : profundidad
    grupo.filas.push({ ...datosFila(cargo, lista), nivel })

    for (const hijo of lista.filter(c => c.reportaA === cargo.id)) {
      const mismoGrupo = claveGrupo(hijo.unidadId) === clave
      empujar(hijo, mismoGrupo ? nivel + 1 : 0)
    }
  }

  const raiz = lista.find(c => c.reportaA === null)
  if (raiz) empujar(raiz, 0)
  // Un cargo cuyo jefe fue borrado quedaría fuera del recorrido: se lista igual.
  for (const c of lista) empujar(c, 0)

  return grupos
}
