/* Estado de una ruta y regla de unicidad ruta↔cargo (RN-M55 / RN-M60).

   Las claves internas quedaron en femenino de cuando el catálogo eran tres
   ('activa' / 'borrador' / 'archivada') y se conservan para no migrar los datos;
   las etiquetas visibles sí son las oficiales, en masculino, porque nombran el
   estado de la ruta y no a la ruta. */

export const SUCURSAL_TODAS = 'Todas las sucursales'

/* Los cuatro estados oficiales, en el orden del ciclo de vida
   (Borrador → No activo → Activo, y Archivado como salida lateral).
   Los tres "no está en uso" se distinguen por el motivo: Borrador todavía no
   está lista, No activo está lista pero no es la vigente, Archivado ya no se
   usará. Por eso No activo lleva el navy de la marca y no otro gris: es la
   única espera reutilizable y no debe leerse como descarte. */
export const ESTADOS_RUTA = {
  activa: { label: 'Activo', clase: 'pl-st-activa', bg: '#f0fdf4', color: '#16a34a' },
  inactiva: { label: 'No activo', clase: 'pl-st-inactiva', bg: 'rgba(12,45,64,.08)', color: '#0C2D40' },
  borrador: { label: 'Borrador', clase: 'pl-st-borrador', bg: '#fef3c7', color: '#b45309' },
  archivada: { label: 'Archivado', clase: 'pl-st-archivada', bg: 'var(--surface-hover)', color: '#64748b' },
}

export const estadoRuta = (status) => ESTADOS_RUTA[status] || ESTADOS_RUTA.borrador

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
    p.status === 'activa' &&
    !p.esGlobal &&
    p.cargo === ruta.cargo &&
    sucursalDe(p) === sucursalDe(ruta))
}

/* Cómo se nombra el puesto que se disputa, para los textos del modal y del aviso:
   "Analista de Datos en La Paz" o "Analista de Datos, en todas las sucursales". */
export function describirPuesto(ruta) {
  const suc = sucursalDe(ruta)
  return suc === SUCURSAL_TODAS
    ? `${ruta.cargo}, en todas las sucursales`
    : `${ruta.cargo} en ${suc}`
}

/* El verbo con el que se ofrece la activación depende de si el puesto está libre.
   Llamar "Activar" a las dos situaciones es lo que produce el "al activar, pasa a
   No activo": una sola frase con dos rutas distintas adentro, imposible de leer.
   Con el puesto ocupado la acción real es reemplazar, y nombrarla así hace que el
   efecto sobre la anterior deje de ser una sorpresa y pase a ser lo esperado. */
export const etiquetaActivar = (hayConflicto) => hayConflicto ? 'Reemplazar ruta' : 'Activar ruta'

/* Motivo del No activo. Se llega ahí por dos caminos —alguien la desactivó a mano,
   o la desplazó otra al ocupar su puesto (RN-M60)— y el estado solo no distingue
   cuál: la ruta aparece apagada y nadie recuerda por qué. El motivo se escribe al
   desplazar y se borra al salir de No activo, para que no sobreviva a la situación
   que describe y quede afirmando algo que ya no es cierto. */
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
  ruta?.status === 'inactiva' && ruta.desplazadaPor
    ? `Reemplazada por "${ruta.desplazadaPor.name}" el ${ruta.desplazadaPor.fecha}`
    : ''
