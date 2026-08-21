/* Modelo del organigrama.
   El nodo del árbol es el CARGO, no la persona. Esa distinción es la que permite
   representar un cargo vacante (existe la posición, no hay quien la ocupe) y la que
   evita duplicar un puesto cuando lo comparten dos personas.
   Las UNIDADES son las áreas; se anidan entre sí (Marketing → Marketing Digital) y
   agrupan cargos, pero no reportan: quien reporta es el cargo.
   Las personas viven en `colaboradoresData`; aquí solo se referencian por id.

   Todas las funciones reciben el `org` completo ({ unidades, cargos }) en vez de leer
   las constantes: la pantalla guarda su propia copia editable, así que las áreas y los
   cargos que ve el usuario no son necesariamente los sembrados. */

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
  { id: 'direccion', nombre: 'Dirección General', corto: 'Dir. General', padreId: null },
  { id: 'tecnologia', nombre: 'Tecnología', corto: 'Tecnología', padreId: 'direccion' },
  { id: 'rrhh', nombre: 'Recursos Humanos', corto: 'RRHH', padreId: 'direccion' },
  { id: 'marketing', nombre: 'Marketing', corto: 'Marketing', padreId: 'direccion' },
  { id: 'mkt-digital', nombre: 'Marketing Digital', corto: 'Mkt. Digital', padreId: 'marketing' },
  { id: 'contenidos', nombre: 'Contenidos y Creatividad', corto: 'Contenidos', padreId: 'marketing' },
  { id: 'ventas', nombre: 'Ventas', corto: 'Ventas', padreId: 'direccion' },
  { id: 'operaciones', nombre: 'Operaciones', corto: 'Operaciones', padreId: 'direccion' },
  { id: 'finanzas', nombre: 'Finanzas', corto: 'Finanzas', padreId: 'direccion' },
  { id: 'diseno', nombre: 'Diseño', corto: 'Diseño', padreId: 'direccion' },
]

/* Los cuatro tipos de cargo. `staff` y `outsourcing` cuelgan de lado en vez de bajar en la
   línea de mando: asesoran o prestan un servicio, pero no mandan sobre nadie.

   `jefatura` y `colaborador` se deducen de tener o no gente a cargo —ver `tipoDe`—, así que
   en los cargos sembrados casi ninguno lo declara. Los dos laterales sí tienen que
   declararse: de nada se puede deducir que alguien es externo. */
export const TIPOS_CARGO = [
  { key: 'colaborador', label: 'Colaborador', desc: 'Puesto sin gente a cargo', lateral: false },
  { key: 'jefe', label: 'Jefe / Director', desc: 'Puesto con línea de mando', lateral: false },
  { key: 'staff', label: 'Staff', desc: 'Asiste a un cargo sin estar en su línea de mando', lateral: true },
  { key: 'outsourcing', label: 'Outsourcing', desc: 'Lo cubre un prestador de servicios', lateral: true },
]

/* `sucursalIds` es una lista y no un id suelto a propósito: una gerencia responsable de dos
   regiones es UN cargo con dos sedes, no dos cuadros duplicados en el árbol. */
export const cargos = [
  { id: 'gg', nombre: 'Gerente General', unidadId: 'direccion', reportaA: null, ocupanteId: 28, destacado: true, sucursalIds: ['central', 'lpz', 'cbb'] },
  { id: 'asist-dir', nombre: 'Asistente de Dirección', unidadId: 'direccion', reportaA: 'gg', ocupanteId: 29, tipo: 'staff', sucursalIds: ['central'] },
  { id: 'legal-ext', nombre: 'Asesoría Legal Externa', unidadId: 'direccion', reportaA: 'gg', ocupanteId: null, tipo: 'outsourcing', sucursalIds: ['central', 'lpz', 'cbb'] },

  { id: 'dir-tec', nombre: 'Dirección de Tecnología', unidadId: 'tecnologia', reportaA: 'gg', ocupanteId: null, sucursalIds: ['central'] },
  { id: 'dev-back', nombre: 'Desarrollador Backend', unidadId: 'tecnologia', reportaA: 'dir-tec', ocupanteId: 1, sucursalIds: ['central'] },
  { id: 'dev-front', nombre: 'Frontend Developer', unidadId: 'tecnologia', reportaA: 'dir-tec', ocupanteId: 6, sucursalIds: ['lpz'] },
  { id: 'qa', nombre: 'QA Engineer', unidadId: 'tecnologia', reportaA: 'dir-tec', ocupanteId: 4, sucursalIds: ['central'] },
  { id: 'devops', nombre: 'DevOps Engineer', unidadId: 'tecnologia', reportaA: 'dir-tec', ocupanteId: 14, sucursalIds: ['central'] },
  { id: 'data', nombre: 'Data Analyst', unidadId: 'tecnologia', reportaA: 'dir-tec', ocupanteId: 20, sucursalIds: ['central'] },
  { id: 'soporte-ext', nombre: 'Soporte de Infraestructura', unidadId: 'tecnologia', reportaA: 'dir-tec', ocupanteId: null, tipo: 'outsourcing', sucursalIds: ['central'] },

  { id: 'dir-rrhh', nombre: 'Especialista RRHH', unidadId: 'rrhh', reportaA: 'gg', ocupanteId: 9, sucursalIds: ['central', 'lpz'] },
  { id: 'nominas', nombre: 'Analista de Nóminas', unidadId: 'rrhh', reportaA: 'dir-rrhh', ocupanteId: 15, sucursalIds: ['central'] },
  { id: 'recluta', nombre: 'Reclutadora', unidadId: 'rrhh', reportaA: 'dir-rrhh', ocupanteId: 24, sucursalIds: ['central'] },

  { id: 'dir-mkt', nombre: 'Líder de Marketing', unidadId: 'marketing', reportaA: 'gg', ocupanteId: 25, sucursalIds: ['central'] },
  { id: 'jefe-mkt-dig', nombre: 'Jefatura de Marketing Digital', unidadId: 'mkt-digital', reportaA: 'dir-mkt', ocupanteId: null, sucursalIds: ['central'] },
  { id: 'cm', nombre: 'Community Manager', unidadId: 'mkt-digital', reportaA: 'jefe-mkt-dig', ocupanteId: 11, sucursalIds: ['central'] },
  { id: 'seo', nombre: 'Especialista SEO', unidadId: 'mkt-digital', reportaA: 'jefe-mkt-dig', ocupanteId: 26, sucursalIds: ['lpz'] },
  { id: 'analista-mkt', nombre: 'Analista de Marketing', unidadId: 'contenidos', reportaA: 'dir-mkt', ocupanteId: 13, sucursalIds: ['central'] },
  { id: 'content', nombre: 'Content Creator', unidadId: 'contenidos', reportaA: 'dir-mkt', ocupanteId: 21, sucursalIds: ['central'] },
  { id: 'marca', nombre: 'Ejecutiva de Marca', unidadId: 'contenidos', reportaA: 'dir-mkt', ocupanteId: 27, sucursalIds: ['cbb'] },

  { id: 'lider-ventas', nombre: 'Ejecutivo Senior', unidadId: 'ventas', reportaA: 'gg', ocupanteId: 12, sucursalIds: ['central', 'lpz', 'cbb'] },
  { id: 'ejec-com', nombre: 'Ejecutiva Comercial', unidadId: 'ventas', reportaA: 'lider-ventas', ocupantes: [2], sucursalIds: ['central'] },
  { id: 'account', nombre: 'Account Manager', unidadId: 'ventas', reportaA: 'lider-ventas', ocupanteId: 7, sucursalIds: ['lpz'] },
  { id: 'sdr', nombre: 'SDR Junior', unidadId: 'ventas', reportaA: 'lider-ventas', ocupanteId: 18, sucursalIds: ['cbb'] },
  { id: 'pasante', nombre: 'Pasante Comercial', unidadId: 'ventas', reportaA: 'lider-ventas', ocupanteId: 5, sucursalIds: ['central'] },

  { id: 'coord-log', nombre: 'Coordinador Logístico', unidadId: 'operaciones', reportaA: 'gg', ocupanteId: 16, sucursalIds: ['central', 'cbb'] },
  { id: 'analista-proc', nombre: 'Analista de Procesos', unidadId: 'operaciones', reportaA: 'coord-log', ocupanteId: 8, sucursalIds: ['central'] },
  { id: 'asist-op', nombre: 'Asistente Operativo', unidadId: 'operaciones', reportaA: 'coord-log', ocupanteId: 22, sucursalIds: ['cbb'] },
  { id: 'limpieza-ext', nombre: 'Servicio de Limpieza', unidadId: 'operaciones', reportaA: 'coord-log', ocupanteId: null, tipo: 'outsourcing', sucursalIds: ['central', 'lpz', 'cbb'] },

  { id: 'tesorero', nombre: 'Tesorero', unidadId: 'finanzas', reportaA: 'gg', ocupanteId: 23, sucursalIds: ['central'] },
  { id: 'contador', nombre: 'Contador General', unidadId: 'finanzas', reportaA: 'tesorero', ocupanteId: 10, sucursalIds: ['central'] },
  { id: 'analista-fin', nombre: 'Analista Financiera', unidadId: 'finanzas', reportaA: 'tesorero', ocupanteId: 17, sucursalIds: ['central'] },

  { id: 'dis-ux', nombre: 'Diseñadora UX/UI', unidadId: 'diseno', reportaA: 'gg', ocupanteId: 3, sucursalIds: ['central'] },
  { id: 'dis-graf', nombre: 'Diseñadora Gráfica', unidadId: 'diseno', reportaA: 'dis-ux', ocupanteId: 19, sucursalIds: ['central'] },
]

/* Las relaciones que NO son la línea de mando. Van en su propia lista y no como un campo del
   cargo, porque son varias por cargo y porque cada una tiene su propia vigencia.

   `calidad` distingue las dos formas de coordinar y solo aplica al tipo `funcional`:
     · `par`                 — trabajan en conjunto, ninguno manda sobre el otro
     · `supervisor_funcional` — el destino le supervisa una parte del trabajo al origen,
                                sin ser su jefe

   Guardar la coordinación sin calidad sería capturar el dato y perder justo lo que lo hace
   útil: Desempeño necesita saber si el contraparte evalúa como par o como supervisor.

   `hasta: null` = vigente. Nada se borra: cuando una relación termina se le pone fecha. */
export const relaciones = [
  { id: 'r1', origen: 'dir-rrhh', destino: 'coord-log', tipo: 'funcional', calidad: 'par', desde: '2026-01-15', hasta: null },
  { id: 'r2', origen: 'dis-ux', destino: 'dir-mkt', tipo: 'funcional', calidad: 'par', desde: '2026-02-01', hasta: null },
  { id: 'r3', origen: 'dis-graf', destino: 'dir-mkt', tipo: 'funcional', calidad: 'supervisor_funcional', desde: '2026-02-01', hasta: null },
  { id: 'r4', origen: 'analista-fin', destino: 'nominas', tipo: 'funcional', calidad: 'par', desde: '2026-03-10', hasta: null },
  { id: 'r5', origen: 'qa', destino: 'dev-back', tipo: 'funcional', calidad: 'par', desde: '2026-01-20', hasta: null },
  { id: 'r6', origen: 'asist-op', destino: 'contador', tipo: 'funcional', calidad: 'supervisor_funcional', desde: '2026-04-02', hasta: null },
]

/* Estructura de arranque. La pantalla la clona en su estado persistido y a partir de ahí
   trabaja sobre la copia; esta constante nunca se muta. */
export const orgSeed = { unidades, cargos, relaciones }

/* Con qué arranca una demo reseteada. Las sucursales NO están aquí: son datos de la empresa
   —existen antes de que nadie dibuje un organigrama— y por eso sobreviven al reseteo. Lo que
   se construye desde cero son las áreas y los cargos. */
export const orgVacio = { unidades: [], cargos: [], relaciones: [] }

const personaPorId = new Map(colaboradoresData.map(c => [c.id, c]))

export const getPersona = id => (id == null ? null : personaPorId.get(id) || null)
export const getUnidad = (id, org = orgSeed) => org.unidades.find(u => u.id === id) || null

/* Staff y Outsourcing comparten una sola cosa —van al costado y no bajan en la línea de
   mando— y en todo lo demás son distintos. Se pregunta por esa cosa, no por el tipo, para que
   agregar un tercer tipo lateral no obligue a tocar el algoritmo del árbol. */
const esLateral = c => c.tipo === 'staff' || c.tipo === 'outsourcing'

/* Un cargo lo pueden ocupar VARIAS personas: "Ejecutiva Comercial" puede tener tres. Por eso
   los ocupantes son una lista y no un id suelto, que obligaba a duplicar el cuadro —con su
   tipo, sus sedes y mañana su ruta de onboarding— una vez por persona.

   No hay un número de plazas declarado: se probó y confundía más de lo que aclaraba. Vacante
   vuelve a ser lo que se entiende sin explicación —el puesto no tiene a nadie—, y cuántos
   caben es una decisión de RRHH, no un campo del organigrama.

   El campo viejo de un solo ocupante se sigue leyendo: hay organigramas guardados con él y
   no hace falta migrarlos para que se vean bien. */
export const ocupantesDe = cargo => (
  cargo.ocupantes ?? (cargo.ocupanteId != null ? [cargo.ocupanteId] : [])
)

const estadoDeOcupantes = cargo => {
  const ocupantes = ocupantesDe(cargo).map(getPersona).filter(Boolean)
  return { ocupantes, vacante: ocupantes.length === 0 }
}

const nodoSuelto = cargo => ({
  tipo: 'cargo', id: cargo.id, cargo,
  ...estadoDeOcupantes(cargo),
  staff: [], hijos: [],
})

/* `vistos` corta los ciclos: al editar "reporta a" se puede dejar a un cargo colgando de su
   propio subordinado, y sin este tope la recursión revienta la pila. */
function nodoCargo(cargo, org, verUnidades, vistos) {
  if (vistos.has(cargo.id)) return nodoSuelto(cargo)
  vistos.add(cargo.id)
  return {
    ...nodoSuelto(cargo),
    staff: org.cargos.filter(c => c.reportaA === cargo.id && esLateral(c)).map(nodoSuelto),
    hijos: agruparHijos(cargo, org, verUnidades, vistos),
  }
}

/* Un hijo que pertenece a otra unidad que su jefe entra envuelto en la píldora de esa
   unidad; el que comparte unidad cuelga directo. Así el árbol muestra dónde empieza
   cada área sin declarar la jerarquía dos veces. */
function agruparHijos(cargo, org, verUnidades, vistos) {
  const hijos = org.cargos.filter(c => c.reportaA === cargo.id && !esLateral(c))
  if (!verUnidades) return hijos.map(h => nodoCargo(h, org, verUnidades, vistos))

  const salida = []
  const grupoPorUnidad = new Map()
  for (const hijo of hijos) {
    if (hijo.unidadId === cargo.unidadId) {
      salida.push(nodoCargo(hijo, org, verUnidades, vistos))
      continue
    }
    let grupo = grupoPorUnidad.get(hijo.unidadId)
    if (!grupo) {
      grupo = { tipo: 'unidad', id: `u-${hijo.unidadId}`, unidad: getUnidad(hijo.unidadId, org), hijos: [], staff: [] }
      grupoPorUnidad.set(hijo.unidadId, grupo)
      salida.push(grupo)
    }
    grupo.hijos.push(nodoCargo(hijo, org, verUnidades, vistos))
  }
  return salida
}

/* modo: 'completo' (unidades + cargos) | 'cargos' (solo cargos) | 'unidades' (solo áreas) */
export function buildOrgTree(modo = 'completo', org = orgSeed) {
  if (modo === 'unidades') {
    const nodoUnidad = u => ({
      tipo: 'unidad', id: `u-${u.id}`, unidad: u, staff: [],
      hijos: org.unidades.filter(x => x.padreId === u.id).map(nodoUnidad),
    })
    return { tipo: 'empresa', id: 'empresa', empresa, staff: [], hijos: org.unidades.filter(u => u.padreId === null).map(nodoUnidad) }
  }

  /* RAÍCES, en plural. Antes se tomaba solo la primera y cualquier otro cargo sin jefe —con
     todo lo que colgara de él— desaparecía del dibujo: se guardaba y no se veía. Un organigrama
     a medio armar tiene varias piezas todavía sin enganchar, y hay que poder verlas para
     engancharlas.

     `vistos` es uno solo para todas: corta ciclos y además evita que un cargo aparezca dos
     veces si el dato quedó encadenado de forma rara. */
  const raices = org.cargos.filter(c => c.reportaA === null)
  const vistos = new Set()
  const nodos = raices.map(r => nodoCargo(r, org, modo === 'completo', vistos))

  /* "Ver por cargos" es solo la línea de mando: ahí no se dibuja ninguna unidad, ni siquiera
     las que todavía no tienen a nadie. */
  if (modo !== 'completo') {
    return { tipo: 'empresa', id: 'empresa', empresa, staff: [], hijos: nodos }
  }

  /* En "completo" cada raíz entra envuelta en la píldora de su unidad, igual que cualquier
     otro cargo que abre unidad. Las que comparten unidad comparten píldora. */
  const grupos = []
  const porUnidad = new Map()
  for (const nodo of nodos) {
    const uid = nodo.cargo.unidadId
    let grupo = porUnidad.get(uid)
    if (!grupo) {
      grupo = { tipo: 'unidad', id: `u-raiz-${uid}`, unidad: getUnidad(uid, org), staff: [], hijos: [] }
      porUnidad.set(uid, grupo)
      grupos.push(grupo)
    }
    grupo.hijos.push(nodo)
  }
  return { tipo: 'empresa', id: 'empresa', empresa, staff: [], hijos: colgarUnidadesVacias(grupos, org) }
}

/* Una unidad sin ningún cargo no tiene de dónde colgarse en un árbol que se arma desde los
   cargos. Antes se agregaban todas al pie, en fila, y ahí aparecía el problema de verdad: se
   creaba una sub-unidad dentro de Marketing y se dibujaba AL LADO de Marketing, no debajo. El
   dato estaba bien; el dibujo decía otra cosa.

   Ahora cada una se engancha a la píldora de su unidad madre cuando esa píldora está dibujada,
   y las vacías se anidan entre ellas —que es el caso de un organigrama recién empezado, donde
   todavía no hay ni un cargo y toda la estructura son unidades—. Solo queda al pie lo que
   cuelga de la empresa o lo que perdió a su madre. */
function colgarUnidadesVacias(hijosRaiz, org) {
  const vacias = org.unidades.filter(u => !org.cargos.some(c => c.unidadId === u.id))
  if (!vacias.length) return hijosRaiz

  /* Dónde quedó dibujada cada unidad que sí tiene cargos. Una unidad puede aparecer en más de
     un lugar del árbol —abre píldora cada vez que un jefe de otra unidad tiene hijos suyos—;
     se toma la primera para no duplicar la sub-unidad en todas. */
  const pildoras = new Map()
  const recorrer = nodos => {
    for (const n of nodos) {
      if (n.tipo === 'unidad' && n.unidad && !pildoras.has(n.unidad.id)) pildoras.set(n.unidad.id, n)
      if (n.hijos?.length) recorrer(n.hijos)
    }
  }
  recorrer(hijosRaiz)

  const idsVacias = new Set(vacias.map(u => u.id))
  const construir = u => ({
    tipo: 'unidad', id: `u-${u.id}`, unidad: u, staff: [], sinCargos: true,
    hijos: vacias.filter(x => x.padreId === u.id).map(construir),
  })

  /* Las cimas son las vacías cuya madre NO es otra vacía: las demás ya entran anidadas dentro
     de ellas y colocarlas otra vez las dibujaría dos veces. */
  const alPie = []
  for (const u of vacias.filter(x => !x.padreId || !idsVacias.has(x.padreId))) {
    const nodo = construir(u)
    const madre = u.padreId ? pildoras.get(u.padreId) : null
    if (madre) madre.hijos.push(nodo)
    else alPie.push(nodo)
  }
  return [...hijosRaiz, ...alPie]
}

/* Forma común de una fila/tarjeta de cargo: la comparten la tabla, las cards y el buscador. */
const datosFila = (cargo, org) => ({
  cargo,
  unidad: getUnidad(cargo.unidadId, org),
  tipo: tipoDe(cargo, org),
  sedes: sucursalesDe(cargo, org),
  ...estadoDeOcupantes(cargo),
  jefeNombre: cargo.reportaA ? (org.cargos.find(c => c.id === cargo.reportaA)?.nombre ?? null) : null,
})

/* La cabeza de un área es el cargo cuyo jefe está fuera del área: es por donde el área
   se engancha al resto de la empresa. */
export function cabezaDe(unidadId, org = orgSeed) {
  const propios = org.cargos.filter(c => c.unidadId === unidadId)
  return propios.find(c => !c.reportaA || !propios.some(p => p.id === c.reportaA)) || propios[0] || null
}

export const unidadesRaiz = (org = orgSeed) => org.unidades.filter(u => u.padreId === null)

export const subunidadesDe = (unidadId, org = orgSeed) => org.unidades.filter(u => u.padreId === unidadId)

export function tarjetaUnidad(unidadId, org = orgSeed) {
  return {
    unidad: getUnidad(unidadId, org),
    cabeza: cabezaDe(unidadId, org),
    totalCargos: org.cargos.filter(c => c.unidadId === unidadId).length,
    totalSub: subunidadesDe(unidadId, org).length,
  }
}

export const cargosDeUnidad = (unidadId, org = orgSeed) =>
  org.cargos.filter(c => c.unidadId === unidadId).map(c => datosFila(c, org))

export function buscarCargos(texto, org = orgSeed) {
  const q = texto.trim().toLowerCase()
  if (!q) return []
  return org.cargos
    .map(c => datosFila(c, org))
    .filter(f =>
      f.cargo.nombre.toLowerCase().includes(q) ||
      (f.ocupante?.name || '').toLowerCase().includes(q) ||
      (f.unidad?.nombre || '').toLowerCase().includes(q))
}

/* La tabla agrupa por ÁREA, no por unidad exacta: las subunidades (Marketing Digital,
   Contenidos) caen dentro de la banda de su área madre y se distinguen por la píldora
   "Pertenece a". Por eso el grupo es el ancestro que cuelga directo de la raíz. */
export function grupoDe(unidadId, org = orgSeed) {
  let u = getUnidad(unidadId, org)
  if (!u) return null
  while (u.padreId) {
    const padre = getUnidad(u.padreId, org)
    if (!padre || padre.padreId === null) break
    u = padre
  }
  return u
}

/* Lo declarado gana; lo que no se declaró se deduce. Staff y Outsourcing no se pueden
   deducir de nada, así que siempre vienen declarados. Jefe y colaborador sí: tener gente
   debajo es exactamente lo que los distingue, y deducirlo evita que el árbol se contradiga
   con su propia etiqueta cuando alguien mueve un cargo. */
export const tipoDe = (cargo, org = orgSeed) => {
  if (cargo.tipo && cargo.tipo !== 'jefe' && cargo.tipo !== 'colaborador') return cargo.tipo
  return org.cargos.some(c => c.reportaA === cargo.id) ? 'jefe' : 'colaborador'
}

/* Devuelve las filas ya ordenadas jerárquicamente y con el nivel de sangría calculado
   dentro de cada grupo, para que la tabla solo tenga que pintarlas. */
export function filasTabla(org = orgSeed) {
  const grupos = []
  const indice = new Map()
  const vistos = new Set()

  const claveGrupo = unidadId => grupoDe(unidadId, org)?.id || 'sin-unidad'

  const empujar = (cargo, profundidad) => {
    if (vistos.has(cargo.id)) return
    vistos.add(cargo.id)

    const clave = claveGrupo(cargo.unidadId)
    let grupo = indice.get(clave)
    if (!grupo) {
      grupo = { id: clave, unidad: grupoDe(cargo.unidadId, org), filas: [] }
      indice.set(clave, grupo)
      grupos.push(grupo)
    }

    const nivel = grupo.filas.length === 0 ? 0 : profundidad
    grupo.filas.push({ ...datosFila(cargo, org), nivel })

    for (const hijo of org.cargos.filter(c => c.reportaA === cargo.id)) {
      const mismoGrupo = claveGrupo(hijo.unidadId) === clave
      empujar(hijo, mismoGrupo ? nivel + 1 : 0)
    }
  }

  const raiz = org.cargos.find(c => c.reportaA === null)
  if (raiz) empujar(raiz, 0)
  // Un cargo cuyo jefe fue borrado quedaría fuera del recorrido: se lista igual.
  for (const c of org.cargos) empujar(c, 0)

  return grupos
}

/* ---------- Relaciones funcionales ---------- */

export const CALIDADES = [
  { key: 'par', label: 'Par', desc: 'Trabajan en conjunto; ninguno manda sobre el otro' },
  { key: 'supervisor_funcional', label: 'Supervisor funcional', desc: 'Le supervisa una parte del trabajo, sin ser su jefe' },
]

export const etiquetaCalidad = k => CALIDADES.find(c => c.key === k)?.label || k

/* Solo las vigentes: una relación cerrada sigue en la lista para poder reconstruir el pasado,
   pero no se dibuja en el organigrama de hoy. */
export const coordinaciones = (org = orgSeed) =>
  (org.relaciones || []).filter(r => r.tipo === 'funcional' && !r.hasta)

/* Las coordinaciones de un cargo, mire desde donde se mire: da igual si el cargo las declaró
   o si se las declararon a él. Quien abre una ficha quiere ver con quién coordina, no quién
   escribió la fila. */
export function coordinacionesDe(cargoId, org = orgSeed) {
  const porId = new Map(org.cargos.map(c => [c.id, c]))
  return coordinaciones(org)
    .filter(r => r.origen === cargoId || r.destino === cargoId)
    .map(r => {
      const esOrigen = r.origen === cargoId
      const otro = porId.get(esOrigen ? r.destino : r.origen)
      return {
        id: r.id,
        calidad: r.calidad,
        contraparte: otro || null,
        /* En una supervisión importa de qué lado está cada uno; entre pares, no. */
        rol: r.calidad !== 'supervisor_funcional' ? 'par'
          : esOrigen ? 'supervisado' : 'supervisor',
      }
    })
    .filter(c => c.contraparte)
}

/* ---------- Ubicaciones ---------- */

export const TODAS_SUCURSALES = 'todas'

export const sucursalesDe = (cargo, org = orgSeed) => {
  const ids = cargo.sucursalIds || []
  return sucursales.filter(s => ids.includes(s.id))
}

/* Un cargo sin sedes declaradas se considera presente en todas: es lo que evita que al
   filtrar desaparezca de la vista un cargo al que todavía nadie le cargó la sede. */
export const estaEnSucursal = (cargo, sucursalId) => {
  if (!sucursalId || sucursalId === TODAS_SUCURSALES) return true
  const ids = cargo.sucursalIds || []
  return ids.length === 0 || ids.includes(sucursalId)
}

/* Recorta la estructura a una sede. Un cargo también se queda si alguien debajo suyo está en
   la sede aunque él no lo esté: sacar a un jefe intermedio dejaría a su gente sin de quién
   colgar y partiría el árbol en pedazos sueltos. Filtrar un organigrama es quedarse con las
   ramas que llegan a esa sede, no con una lista de cargos. */
export function filtrarPorSucursal(org, sucursalId) {
  if (!sucursalId || sucursalId === TODAS_SUCURSALES) return org

  const hijosDe = new Map()
  org.cargos.forEach(c => {
    const lista = hijosDe.get(c.reportaA) || []
    lista.push(c)
    hijosDe.set(c.reportaA, lista)
  })

  const resuelto = new Map()
  const alcanza = cargo => {
    if (resuelto.has(cargo.id)) return resuelto.get(cargo.id)
    resuelto.set(cargo.id, false) // corta ciclos si el dato quedó mal encadenado
    const r = estaEnSucursal(cargo, sucursalId)
      || (hijosDe.get(cargo.id) || []).some(alcanza)
    resuelto.set(cargo.id, r)
    return r
  }

  const cargos = org.cargos.filter(alcanza)
  const vivos = new Set(cargos.map(c => c.id))
  return {
    ...org,
    cargos,
    relaciones: (org.relaciones || []).filter(r => vivos.has(r.origen) && vivos.has(r.destino)),
  }
}

/* ---------- Altas, bajas y modificaciones ---------- */

/* Ids de lo que se crea en la sesión. Van con prefijo propio para no chocar nunca con
   los sembrados, y se recalculan sobre la lista real porque el organigrama se persiste:
   un contador en memoria arrancaría de cero después de recargar y pisaría ids. */
export function nuevoId(prefijo, lista) {
  let n = lista.length + 1
  while (lista.some(x => x.id === `${prefijo}-${n}`)) n += 1
  return `${prefijo}-${n}`
}

/* Ids del cargo y de todo lo que cuelga debajo. Sirve para no ofrecer como jefe a un
   subordinado propio, que dejaría el árbol en ciclo. */
export function descendientesDe(cargoId, org) {
  const dentro = new Set([cargoId])
  let cambio = true
  while (cambio) {
    cambio = false
    for (const c of org.cargos) {
      if (c.reportaA && dentro.has(c.reportaA) && !dentro.has(c.id)) {
        dentro.add(c.id)
        cambio = true
      }
    }
  }
  return dentro
}

/* Los pares de un cargo: los que se dibujan en su misma fila. Se pregunta por la lateralidad
   y no por el tipo porque el árbol dibuja dos filas distintas —la línea de mando abajo, los
   laterales al costado— y mover un staff entre los reportes de su jefe no lo movería de lugar
   en el dibujo. Salen en el orden en que se dibujan, que es el de la lista de cargos. */
export function paresDe(cargo, org) {
  if (!cargo) return []
  const lateral = esLateral(cargo)
  return org.cargos.filter(c => c.reportaA === cargo.reportaA && esLateral(c) === lateral)
}

/* Mover un cargo entre sus pares. El orden del dibujo ES el orden de la lista de cargos, así
   que no hace falta un campo nuevo: se reordena la lista. Los pares vuelven a los mismos
   lugares que ocupaban —solo cambia cuál va en cada uno— para no alterar la posición de nadie
   más ni el orden en que se leen las otras ramas.

   Y sí cambia el dibujo de verdad: entre los laterales, el orden decide de qué lado del jefe
   cae cada uno; entre los reportes, quién queda a la izquierda. */
export function moverEntrePares(cargoId, nuevaPos, org) {
  const cargo = org.cargos.find(c => c.id === cargoId)
  const pares = paresDe(cargo, org)
  const actual = pares.findIndex(c => c.id === cargoId)
  const destino = Math.max(0, Math.min(pares.length - 1, nuevaPos))
  if (actual < 0 || actual === destino) return org

  const orden = pares.filter(c => c.id !== cargoId)
  orden.splice(destino, 0, cargo)

  const huecos = []
  org.cargos.forEach((c, i) => { if (pares.some(p => p.id === c.id)) huecos.push(i) })
  const cargos = [...org.cargos]
  huecos.forEach((hueco, i) => { cargos[hueco] = orden[i] })
  return { ...org, cargos }
}

/* Al borrar un cargo sus subordinados suben un escalón y quedan colgando del jefe que
   tenía el borrado, en vez de desaparecer del árbol. */
export function eliminarCargo(cargoId, org) {
  const cargo = org.cargos.find(c => c.id === cargoId)
  if (!cargo) return org
  return {
    ...org,
    cargos: org.cargos
      .filter(c => c.id !== cargoId)
      .map(c => (c.reportaA === cargoId ? { ...c, reportaA: cargo.reportaA } : c)),
    // Sus coordinaciones se van con él: una relación a un cargo que ya no existe
    // dibujaría una línea contra la nada.
    relaciones: (org.relaciones || []).filter(r => r.origen !== cargoId && r.destino !== cargoId),
  }
}

/* Un área no se borra en cascada: arrastraría cargos y sub-áreas sin que el usuario lo
   vea venir. Devuelve el motivo por el que está bloqueada, o null si se puede borrar. */
export function bloqueoUnidad(unidadId, org) {
  const conCargos = org.cargos.filter(c => c.unidadId === unidadId).length
  if (conCargos > 0) return `Primero mueve o elimina sus ${conCargos} ${conCargos === 1 ? 'cargo' : 'cargos'}.`
  const subs = subunidadesDe(unidadId, org).length
  if (subs > 0) return `Primero mueve o elimina sus ${subs} ${subs === 1 ? 'sub-unidad' : 'sub-unidades'}.`
  if (org.unidades.length === 1) return 'Es la única unidad: la empresa necesita al menos una.'
  return null
}

export const eliminarUnidad = (unidadId, org) => ({
  ...org,
  unidades: org.unidades.filter(u => u.id !== unidadId),
})

/* Áreas que pueden ser madre de esta sin cerrar un ciclo (ni ella misma ni sus hijas). */
export function unidadesPadrePosibles(unidadId, org) {
  if (!unidadId) return org.unidades
  const dentro = new Set([unidadId])
  let cambio = true
  while (cambio) {
    cambio = false
    for (const u of org.unidades) {
      if (u.padreId && dentro.has(u.padreId) && !dentro.has(u.id)) {
        dentro.add(u.id)
        cambio = true
      }
    }
  }
  return org.unidades.filter(u => !dentro.has(u.id))
}
