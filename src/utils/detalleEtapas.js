import { rutasData } from '../pages/onboarding/JourneyBuilder'

/* Reconstruye las etapas que le tocan a una asignación y marca cuáles ya cumplió.
   Vive fuera de la pantalla porque el detalle se abre desde Seguimiento en escritorio y
   desde el celular del líder: la regla de qué versión de la ruta aplica no puede estar
   escrita dos veces, es justamente la parte delicada.

   El orden de las fuentes no es casual: primero la versión fijada al asignar, después el
   snapshot guardado en la asignación y recién al final la ruta viva. Editar una ruta no
   debe cambiarle el recorrido a quien ya la está haciendo. */
export function buildDetalleEtapas(a, plantillas) {
  const ruta = plantillas.find(p => p.id === a.rutaId || p.name === a.ruta)
  const porVersion = ruta?.versiones && a.version != null
    ? ruta.versiones.find(v => v.v === a.version)?.etapasData
    : null
  const fuente = porVersion
    || (a.etapasData && a.etapasData.length ? a.etapasData : null)
    || ruta?.etapasData
    || rutasData[1].etapas

  const flat = fuente.flatMap(e => e.actividades.flatMap(act => act.tareas))
  const doneCount = Math.round(flat.length * a.pct / 100)
  let seen = 0

  return fuente.map(etapa => {
    const tareas = etapa.actividades.flatMap(act => act.tareas).map(t => {
      const done = seen < doneCount
      seen += 1
      return { ...t, done }
    })
    return {
      name: etapa.name,
      days: etapa.days || (etapa.duracion ? `${etapa.duracion} días` : ''),
      tareas,
      doneLocal: tareas.filter(t => t.done).length,
    }
  })
}
