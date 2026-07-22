import { Video, Headphones, FileText, HelpCircle, ClipboardList, Upload, UserCheck, MapPin, Smile, IdCard } from 'lucide-react'

/* `unicaPorRuta` marca las tareas que no llevan contenido propio: su "hecho" no vive en la
   tarea sino en el registro del colaborador. Completar el perfil es un estado de la persona
   —¿tiene los campos llenos?—, así que dos copias no son dos trabajos, son dos ventanas al
   mismo dato: una aparecería marcada como hecha sin que nadie la tocara. Las demás sí se
   repiten a propósito (diez videos son diez tareas, y "Cómo se siente" se mide al día 7 y al
   30). Es una bandera aparte de `soloVistaPrevia`, que solo dice "no tiene formulario de
   edición": el día que exista una tarea configurable pero única, las dos dejan de coincidir. */
export const tiposTarea = [
  { key: 'perfil', label: 'Completar perfil', icon: IdCard, color: '#8b5cf6', soloVistaPrevia: true, unicaPorRuta: true },
  { key: 'video', label: 'Video', icon: Video, color: '#3b82f6' },
  { key: 'audio', label: 'Audio / Podcast', icon: Headphones, color: '#06b6d4' },
  { key: 'documento', label: 'Documento / PDF', icon: FileText, color: '#f97316' },
  { key: 'quiz', label: 'Prueba', icon: HelpCircle, color: '#f59e0b' },
  { key: 'completar-perfil', label: 'Formulario', icon: ClipboardList, color: '#10b981' },
  { key: 'subida', label: 'Subida de archivo', icon: Upload, color: '#ec4899' },
  { key: 'tarea-otro', label: 'Otra tarea', icon: UserCheck, color: '#ef4444' },
  { key: 'recorrido', label: 'Recorrido por área', icon: MapPin, color: '#d946ef' },
  { key: 'pulso', label: 'Cómo se siente', icon: Smile, color: '#f472b6' },
]

export const tipoMap = Object.fromEntries(tiposTarea.map(t => [t.key, t]))

/* Formatos que se pueden subir desde el equipo. Viven acá y no en cada pantalla porque la
   biblioteca de Recursos corporativos y el modal de contenido de una tarea tienen que aceptar
   exactamente lo mismo: un archivo subido desde una tarea termina siendo el mismo recurso que
   uno subido desde la biblioteca, y si las listas se separan un formato entra por una puerta
   y no por la otra. */
export const ACCEPT_DOCUMENTO = 'application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain,.txt,application/vnd.ms-powerpoint,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx'
export const ACCEPT_VIDEO = 'video/mp4,.mp4,video/webm,.webm,video/quicktime,.mov,video/x-matroska,.mkv'
export const ACCEPT_AUDIO = 'audio/mpeg,.mp3,audio/wav,.wav,audio/mp4,.m4a,audio/ogg,.ogg,audio/aac,.aac'
export const ACCEPT_TODOS = [ACCEPT_DOCUMENTO, ACCEPT_VIDEO, ACCEPT_AUDIO].join(',')

export const ACCEPT_POR_TIPO = {
  video: ACCEPT_VIDEO,
  audio: ACCEPT_AUDIO,
  documento: ACCEPT_DOCUMENTO,
  lectura: ACCEPT_DOCUMENTO,
}

/* Etiquetas legibles de esos formatos, para no escribirlas a mano en cada modal. */
export const FORMATOS_LEGIBLES = {
  video: 'MP4, WebM, MOV o MKV',
  audio: 'MP3, WAV, M4A, OGG o AAC',
  documento: 'PDF, Word, PowerPoint o TXT',
  lectura: 'PDF, Word, PowerPoint o TXT',
}

/* De qué tipo es un archivo que acaba de elegir la persona. Mira el MIME y cae a la extensión
   porque hay sistemas que mandan `application/octet-stream` para .mov o .m4a, y ahí un video
   entraría a la biblioteca disfrazado de documento. */
export function tipoDeArchivo(file) {
  const mime = file.type || ''
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)) return 'video'
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'ogg', 'aac'].includes(ext)) return 'audio'
  return 'documento'
}

/* Peso en texto. Lo usan la biblioteca y el modal de la tarea; estaba duplicado en los dos. */
export function pesoLegible(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function toEmbedUrl(url) {
  if (!url) return url
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`
    }
    if (u.hostname.includes('vimeo.com') && !u.hostname.includes('player.')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      return `https://player.vimeo.com/video/${id}`
    }
  } catch {
    return url
  }
  return url
}
