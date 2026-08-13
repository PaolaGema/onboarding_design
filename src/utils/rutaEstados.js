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

/* Unicidad (RN-M60): un cargo tiene una sola ruta en Activo por sucursal.
   La clave es el par exacto cargo + sucursal, así que una ruta de "Todas las
   sucursales" y otra de una sucursal concreta NO chocan —conviven, y al asignar
   gana la más específica—. Solo chocan las que apuntan al mismo par.

   Quedan fuera: la ruta general (es transversal, no ocupa ningún cargo) y las
   rutas sin cargo, que no reclaman un puesto del organigrama. */
export function rutasEnConflicto(plantillas, ruta) {
  if (!ruta?.cargo || ruta.esGlobal) return []
  return (plantillas || []).filter(p =>
    p.id !== ruta.id &&
    normalizarStatus(p.status) === 'activa' &&
    !p.esGlobal &&
    p.cargo === ruta.cargo &&
    sucursalDe(p) === sucursalDe(ruta))
}

/* Los campos que deciden a quién le llega la ruta, con el nombre que llevan en la ficha.
   Nombre y descripción quedan fuera a propósito: corregir una palabra no mueve a nadie de
   lugar, así que no tienen por qué pasar por una confirmación. */
export const CAMPOS_ALCANCE = { tipo: 'Tipo', sucursal: 'Sucursal', area: 'Área', cargo: 'Cargo' }

const mismoPuesto = (a, b) => (a.cargo || '') === (b.cargo || '') && sucursalDe(a) === sucursalDe(b)

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

  // A quiénes desplaza en el puesto nuevo. Sin cargo no reclama ninguno, y no desplaza nada.
  const desplaza = seMudo ? rutasEnConflicto(plantillas, destino) : []
  // El puesto que deja atrás se queda sin ruta vigente hasta que se active otra.
  const liberaPuesto = seMudo && !!ruta.cargo
  // Activa y sin cargo: no se le asigna a nadie, pero la píldora sigue diciendo Activo.
  const quedaSinCargo = activa && !!ruta.cargo && !destino.cargo

  return {
    destino,
    desplaza,
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
    return { key, ...ESTADOS_RUTA[key], regla: REGLA_ESTADO[key], actual: key === actual, motivo }
  })
}

/* Cómo se nombra el puesto que se disputa, para los textos del modal y del aviso:
   "Analista de Datos en La Paz" o "Analista de Datos, en todas las sucursales". */
export function describirPuesto(ruta) {
  const suc = sucursalDe(ruta)
  return suc === SUCURSAL_TODAS
    ? `${ruta.cargo}, en todas las sucursales`
    : `${ruta.cargo} en ${suc}`
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
