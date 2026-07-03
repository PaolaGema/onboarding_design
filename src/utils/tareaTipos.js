import { Video, Headphones, FileText, HelpCircle, ClipboardList, Upload, UserCheck, MapPin, Smile } from 'lucide-react'

export const tiposTarea = [
  { key: 'video', label: 'Video', icon: Video, color: '#3b82f6', resp: 'Colaborador' },
  { key: 'audio', label: 'Audio / Podcast', icon: Headphones, color: '#06b6d4', resp: 'Colaborador' },
  { key: 'documento', label: 'Documento / PDF', icon: FileText, color: '#f97316', resp: 'Colaborador' },
  { key: 'quiz', label: 'Prueba', icon: HelpCircle, color: '#f59e0b', resp: 'Colaborador' },
  { key: 'completar-perfil', label: 'Formulario', icon: ClipboardList, color: '#10b981', resp: 'Colaborador' },
  { key: 'subida', label: 'Subida de archivo', icon: Upload, color: '#ec4899', resp: 'Colaborador' },
  { key: 'tarea-otro', label: 'Otra tarea', icon: UserCheck, color: '#ef4444', resp: 'Otro usuario' },
  { key: 'recorrido', label: 'Recorrido por área', icon: MapPin, color: '#d946ef', resp: 'Colab + responsable' },
  { key: 'pulso', label: 'Cómo se siente', icon: Smile, color: '#f472b6', resp: 'Colaborador' },
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
