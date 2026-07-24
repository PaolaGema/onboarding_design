/* Vocabulario de estados de una asignación: cómo se llama cada estado, con qué clase se
   pinta y de qué color va la barra de avance.

   Vive fuera de las pantallas porque la lista de Seguimiento y la ficha de una persona
   tienen que decir exactamente lo mismo: si la fila dice "En riesgo" y la ficha dice otra
   cosa, para quien mira son dos sistemas distintos. */
export const statusLabels = {
  'en-curso': 'En curso',
  'completado': 'Completado',
  'pendiente': 'Programado',
  'atrasado': 'Atrasado',
  'en-riesgo': 'En riesgo',
  'pausado': 'Pausado',
}

export const statusCls = {
  'en-curso': 'as-st-curso',
  'completado': 'as-st-completado',
  'pendiente': 'as-st-pendiente',
  'atrasado': 'as-st-atrasado',
  'en-riesgo': 'as-st-riesgo',
  'pausado': 'as-st-pausado',
}

export function barColor(status, pct) {
  if (status === 'completado') return 'var(--green)'
  if (status === 'atrasado' || status === 'en-riesgo') return 'var(--red)'
  if (pct < 30) return 'var(--yellow)'
  return 'var(--blue)'
}
