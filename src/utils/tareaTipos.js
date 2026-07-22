import { Video, Headphones, FileText, HelpCircle, ClipboardList, Upload, UserCheck, MapPin, Smile, IdCard } from 'lucide-react'

export const tiposTarea = [
  { key: 'perfil', label: 'Completar perfil', icon: IdCard, color: '#8b5cf6', soloVistaPrevia: true },
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
