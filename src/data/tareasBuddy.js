/* Tareas de acompañamiento, indexadas por el id del colaborador acompañado.

   Vive fuera de la pantalla porque el buddy ve lo mismo en escritorio ("Mis acompañados")
   y en el celular: si la lista estuviera escrita dos veces, los contadores de una vista
   contradirían a la otra en cuanto alguien tocara una.

   En producción NO son un dato aparte: salen de las tareas de la ruta con
   `responsable: 'Buddy'` (ver rutasData en JourneyBuilder). */
export const TAREAS_BUDDY = {
  3: [
    { id: 'b1', name: 'Reunión 1:1 de bienvenida', done: true },
    { id: 'b2', name: 'Presentarle al equipo de Diseño', done: true },
    { id: 'b3', name: 'Revisar su primer entregable', done: false },
    { id: 'b4', name: 'Check-in de fin de mes', done: false },
  ],
  11: [
    { id: 'b5', name: 'Reunión 1:1 de bienvenida', done: true },
    { id: 'b6', name: 'Acompañar su primera campaña', done: false },
  ],
  20: [
    { id: 'b7', name: 'Reunión 1:1 de bienvenida', done: true },
    { id: 'b8', name: 'Revisar su primer dashboard', done: true },
    { id: 'b9', name: 'Check-in de fin de mes', done: false },
  ],
  13: [
    { id: 'b10', name: 'Reunión 1:1 de bienvenida', done: true },
    { id: 'b11', name: 'Acompañar su primera campaña', done: true },
    { id: 'b12', name: 'Check-in de fin de mes', done: true },
  ],
}

export const tareasBuddyDe = id => TAREAS_BUDDY[id] || []
