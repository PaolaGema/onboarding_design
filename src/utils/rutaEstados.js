/* Estado de una ruta y regla de unicidad ruta↔cargo (RN-M55 / RN-M60).

   Las claves internas quedaron en femenino ('activa' / 'inactiva' / 'borrador') de cuando
   se escribieron y se conservan para no migrar lo que ya está guardado; las etiquetas
   visibles sí son las oficiales, en masculino, porque nombran el estado de la ruta y no a
   la ruta. */

export const SUCURSAL_TODAS = 'Todas las sucursales'

/* Tres estados y ninguno más. Cada uno se define por lo que hace el sistema con él, no por
   la intención de quien lo puso: Borrador no se asigna porque todavía se está construyendo,
   Activo es el que reciben los ingresos nuevos del puesto, Inactivo dejó de asignarse.

   Antes existía además "Archivado", y para el sistema hacía exactamente lo mismo que
   Inactivo —ninguno de los dos se asigna—: la diferencia era la intención de quien lo
   apretaba, que es justo lo que nadie sabe en el momento de decidir. Dos etiquetas para un
   solo comportamiento obligan a elegir entre sinónimos. Quedó una. */
export const ESTADOS_RUTA = {
  activa: { label: 'Activo', clase: 'pl-st-activa', bg: '#f0fdf4', color: '#16a34a' },
  inactiva: { label: 'Inactivo', clase: 'pl-st-inactiva', bg: 'rgba(12,45,64,.08)', color: '#0C2D40' },
  borrador: { label: 'Borrador', clase: 'pl-st-borrador', bg: '#fef3c7', color: '#b45309' },
}

/* Qué hace el sistema en cada estado. Se muestra al elegirlo: el nombre solo no dice si
   entra gente nueva o no, y esa es la única pregunta que importa al cambiarlo. */
export const REGLA_ESTADO = {
  activa: 'Los ingresos nuevos de este cargo la reciben, y se puede asignar a mano.',
  inactiva: 'Deja de asignarse. Quienes ya la están haciendo la terminan igual.',
  borrador: 'En construcción. No se asigna a nadie, ni a mano ni automáticamente.',
}

/* La general no apunta a un cargo: activarla no es que "los ingresos de este cargo la reciban"
   sino que sus etapas se antepongan a todas las rutas. Los otros dos estados hacen lo mismo en
   los dos casos, así que solo se reemplaza el que cambia. */
const REGLA_ESTADO_GENERAL = {
  activa: 'Sus etapas se anteponen a las de todas las rutas, para toda la empresa.',
}

export const reglaEstado = (key, ruta) =>
  (ruta?.esGlobal && REGLA_ESTADO_GENERAL[key]) || REGLA_ESTADO[key]

/* Las rutas guardadas antes de que Archivado desapareciera siguen teniendo ese estado
   escrito. Se traduce al leerlo en vez de migrar el almacenamiento: un dato viejo no debería
   obligar a tocar lo que ya está guardado, y así la lectura es válida venga de donde venga. */
export const normalizarStatus = (status) => (status === 'archivada' ? 'inactiva' : status)

export const estadoRuta = (status) => ESTADOS_RUTA[normalizarStatus(status)] || ESTADOS_RUTA.borrador

/* Una asignación "en curso" es la que todavía no terminó: su colaborador sigue
   recorriendo la versión que le tocó y por eso no se ve afectado si la ruta
   deja de estar en Activo (RN-M65). */
export const ESTADOS_EN_CURSO = ['pendiente', 'en-curso', 'atrasado', 'en-riesgo', 'pausado']

/* Una ruta sin sucursal declarada aplica a todas: los datos sembrados son
   anteriores al campo y omitirlo significa lo mismo que elegir "Todas". */
export const sucursalDe = (ruta) => ruta?.sucursal || SUCURSAL_TODAS

/* Una ruta apunta a uno o varios cargos: el mismo recorrido suele servir para más de un
   puesto del área —"Pasante Comercial" y "SDR Junior" arrancan igual— y obligar a duplicar
   la ruta para cada uno multiplica el mantenimiento por nada.

   Se guarda en `cargos`. Las rutas creadas antes de esto tienen un `cargo` suelto y se leen
   igual desde acá, sin migrar lo que ya está guardado: mismo criterio que `normalizarStatus`
   con el viejo "archivada". */
export const cargosDe = (ruta) => {
  if (!ruta) return []
  if (Array.isArray(ruta.cargos)) return ruta.cargos.filter(Boolean)
  return ruta.cargo ? [ruta.cargo] : []
}

/* Cómo se nombran esos cargos dentro de una frase. Con más de dos se corta: este texto vive
   en avisos y botones, y una lista larga ahí deja de leerse. */
export function nombrarCargos(ruta, max = 2) {
  const cargos = cargosDe(ruta)
  if (!cargos.length) return ''
  if (cargos.length <= max) return cargos.join(' y ')
  const resto = cargos.length - max
  return `${cargos.slice(0, max).join(', ')} y ${resto} cargo${resto === 1 ? '' : 's'} más`
}

/* Unicidad (RN-M60): un cargo tiene una sola ruta en Activo por sucursal.
   La clave es el par exacto cargo + sucursal, así que una ruta de "Todas las
   sucursales" y otra de una sucursal concreta NO chocan —conviven, y al asignar
   gana la más específica—. Solo chocan las que apuntan al mismo par.

   La regla es por cargo y no por ruta: como una ruta puede apuntar a varios, alcanza con que
   compartan uno solo para que choquen. Si no fuera así, una ruta nueva de tres cargos podría
   dejar activas otras tres para los mismos puestos.

   La ruta general no ocupa ningún cargo, pero sí ocupa el único lugar que hay
   para lo transversal: también admite una sola en Activo, y se resuelve igual
   que las demás —la nueva nace en Borrador y desplaza al activarse—. Antes esto
   se bloqueaba al crear, y para armar el reemplazo de la general vigente había
   que quitarle la marca primero: dejar a la empresa sin ruta general para poder
   preparar la que la sucede.

   Quedan fuera las rutas sin cargo, que no reclaman un puesto del organigrama. */
export function rutasEnConflicto(plantillas, ruta) {
  const activas = (plantillas || []).filter(p =>
    p.id !== ruta?.id && normalizarStatus(p.status) === 'activa')
  if (ruta?.esGlobal) return activas.filter(p => p.esGlobal)
  const cargos = cargosDe(ruta)
  if (!cargos.length) return []
  return activas.filter(p =>
    !p.esGlobal &&
    sucursalDe(p) === sucursalDe(ruta) &&
    cargosDe(p).some(c => cargos.includes(c)))
}

/* Qué cargos de los que ocupa `ruta` se los lleva `otra`. Sirve para nombrar el choque sin
   generalizar: dos rutas pueden compartir un cargo de cinco, y decir "te reemplaza" entero
   sería falso. */
export const cargosCompartidos = (ruta, otra) => {
  const cargos = cargosDe(otra)
  return cargosDe(ruta).filter(c => cargos.includes(c))
}

/* Los campos que deciden a quién le llega la ruta, con el nombre que llevan en la ficha.
   Nombre y descripción quedan fuera a propósito: corregir una palabra no mueve a nadie de
   lugar, así que no tienen por qué pasar por una confirmación. */
export const CAMPOS_ALCANCE = { tipo: 'Tipo', sucursal: 'Sucursal', area: 'Área', cargos: 'Cargos' }

/* El valor de un campo de alcance, listo para mostrar. `cargos` es una lista y `sucursal`
   tiene un valor implícito cuando falta, así que ninguno se puede leer directo del objeto. */
export const valorDeAlcance = (ruta, campo) =>
  campo === 'sucursal' ? sucursalDe(ruta)
    : campo === 'cargos' ? cargosDe(ruta).join(', ')
      : ruta?.[campo] || ''

const clavePuesto = (r) => [...cargosDe(r)].sort().join('|')
const mismoPuesto = (a, b) => clavePuesto(a) === clavePuesto(b) && sucursalDe(a) === sucursalDe(b)

/* Qué se lleva por delante cambiarle el alcance a una ruta.

   Editar estos campos sobre una ruta en Activo no es corregir un dato: es mudarla de puesto.
   La unicidad (RN-M60) se defiende al crear y al activar, pero la edición en la ficha no
   pasaba por ninguno de los dos, así que dejaba dos rutas activas para el mismo puesto con
   un solo clic —justo lo que el resto del sistema pide confirmar—.

   Devuelve únicamente lo que va a pasar de verdad, y `hay` es falso cuando no pasa nada: una
   ruta en Borrador no le llega a nadie y ahí el cambio va directo, sin preguntar. La fricción
   tiene que aparecer solo cuando hay algo que perder; si aparece siempre, deja de leerse. */
export function impactoDeAlcance(ruta, cambios, plantillas) {
  const destino = { ...ruta, ...cambios }
  // La general no ocupa puesto: no hay unicidad que romper ni ingresos que dejen de recibirla.
  const activa = normalizarStatus(ruta.status) === 'activa' && !ruta.esGlobal
  const seMudo = activa && !mismoPuesto(ruta, destino)

  // A quiénes desplaza en el puesto nuevo. Sin cargos no reclama ninguno, y no desplaza nada.
  const desplaza = seMudo ? rutasEnConflicto(plantillas, destino) : []
  /* Los cargos que suelta: los que tenía y ya no. Con varios cargos el cambio puede ser
     parcial —suelta uno y conserva los otros—, así que se nombran en vez de decir "el puesto". */
  const cargosLiberados = seMudo ? cargosDe(ruta).filter(c => !cargosDe(destino).includes(c)) : []
  const liberaPuesto = cargosLiberados.length > 0
  // Activa y sin ningún cargo: no se le asigna a nadie, pero la píldora sigue diciendo Activo.
  const quedaSinCargo = activa && cargosDe(ruta).length > 0 && cargosDe(destino).length === 0

  return {
    destino,
    desplaza,
    cargosLiberados,
    liberaPuesto,
    quedaSinCargo,
    hay: desplaza.length > 0 || liberaPuesto || quedaSinCargo,
  }
}

/* Mapa de transiciones. Solo tres son posibles:

     Borrador → Activo     terminaste de armarla y la publicás para que el motor la use.
     Activo   → Inactivo   la empresa pausa o cierra ese proceso de onboarding.
     Inactivo → Activo     la pausa era temporal y se vuelve a encender.

   Nadie vuelve a Borrador: una ruta que llegó a Activo ya es oficial y pasó filtros, y una
   Inactiva ya está terminada. Además "volver a borrador" haría exactamente lo mismo que
   Inactivo —dejar de asignarse—, y tendríamos dos nombres para un solo comportamiento.

   Devuelve los tres estados siempre —también el actual y los imposibles— porque un selector
   que esconde opciones no enseña la regla: quien busca "volver a borrador" y no lo encuentra
   cree que se equivocó de menú, no que no existe. */
export function transicionesDe(ruta) {
  const actual = normalizarStatus(ruta?.status)
  const sinTareas = !ruta?.tareas
  return Object.keys(ESTADOS_RUTA).map(key => {
    let motivo = null
    if (key === actual) motivo = 'Es el estado actual'
    else if (key === 'borrador') {
      motivo = actual === 'activa'
        ? 'Es una ruta oficial que ya pasó filtros: no vuelve a borrador. Para pausarla, ponla en Inactivo.'
        : 'Ya es una ruta terminada: no vuelve a borrador. Para volver a usarla, ponla en Activo.'
    } else if (key === 'inactiva' && actual === 'borrador') {
      motivo = 'Un borrador todavía no se asigna a nadie, así que no hay nada que pausar.'
    } else if (key === 'activa' && sinTareas) {
      motivo = 'Agrega al menos una tarea antes de ponerla en uso.'
    }
    return { key, ...ESTADOS_RUTA[key], regla: reglaEstado(key, ruta), actual: key === actual, motivo }
  })
}

/* Cómo se nombra el lugar que se disputa, para los textos del modal y del aviso:
   "Analista de Datos en La Paz" o "Analista de Datos, en todas las sucursales".
   La general no disputa un cargo sino el lugar de lo común, así que se nombra por
   su alcance —es lo único que la distingue— y no por un puesto que no tiene. */
export function describirPuesto(ruta) {
  if (ruta?.esGlobal) return 'Toda la empresa'
  const suc = sucursalDe(ruta)
  const cargos = nombrarCargos(ruta)
  if (!cargos) return suc === SUCURSAL_TODAS ? 'Sin cargo, en todas las sucursales' : `Sin cargo en ${suc}`
  return suc === SUCURSAL_TODAS
    ? `${cargos}, en todas las sucursales`
    : `${cargos} en ${suc}`
}

/* Motivo del Inactivo. Se llega ahí por dos caminos —alguien lo cambió a mano, o la desplazó
   otra al ocupar su puesto (RN-M60)— y el estado solo no distingue cuál: la ruta aparece
   apagada y nadie recuerda por qué. El motivo se escribe al desplazar y se borra al salir de
   Inactivo, para que no sobreviva a la situación que describe y quede afirmando algo que ya
   no es cierto. */
export const marcarDesplazada = (ruta, porRuta, fecha) => ({
  ...ruta,
  status: 'inactiva',
  desplazadaPor: { id: porRuta.id, name: porRuta.name, fecha },
})

export function limpiarDesplazada(ruta) {
  if (!ruta.desplazadaPor) return ruta
  const { desplazadaPor, ...resto } = ruta
  return resto
}

export const motivoDesplazo = (ruta) =>
  normalizarStatus(ruta?.status) === 'inactiva' && ruta.desplazadaPor
    ? `Reemplazada por "${ruta.desplazadaPor.name}" el ${ruta.desplazadaPor.fecha}`
    : ''
