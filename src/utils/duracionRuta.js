/* Cuánto dura una ruta no es un dato guardado: sale de sumar lo que dura cada etapa, con los
   mismos 7 días por defecto que usa el constructor para armar los tramos "Día 8 — Día 15".
   Vive acá porque la miran tres lugares —el constructor, el modal de asignación y el alta de
   la asignación—, y si cada uno la calculara distinto, la fecha de término que se le promete
   al colaborador dejaría de coincidir con su propio recorrido. */
export function duracionEnDias(etapas) {
  if (!etapas?.length) return 0
  return etapas.reduce((s, e) => s + (e.duracion || 7), 0)
}

/* El primer día de la ruta es el día de inicio, así que una ruta de 30 días termina 29 días
   después de arrancar, no 30. Devuelve null si falta alguno de los dos datos. */
export function fechaFinRuta(inicioISO, dias) {
  if (!inicioISO || !dias) return null
  const d = new Date(inicioISO + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return null
  d.setDate(d.getDate() + dias - 1)
  return d
}
