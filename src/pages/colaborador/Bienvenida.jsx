import { useUser } from '../../context/UserContext'
import { useRutaActiva } from '../../context/RutaActivaContext'
import { useNavigate } from 'react-router-dom'
import {
  Play, BookOpen, Users, ArrowRight,
  CheckCircle2, Clock, Star, Rocket,
  Video, Headphones, FileText, HelpCircle, Upload,
  ClipboardList, UserCheck, Calendar, MapPin, ShieldCheck,
  ExternalLink, PackageOpen
} from 'lucide-react'

const iconMap = {
  video: Video, audio: Headphones, documento: FileText,
  quiz: HelpCircle, 'completar-perfil': ClipboardList,
  subida: Upload, 'tarea-otro': UserCheck, reunion: Calendar,
  recorrido: MapPin, 'tarea-rrhh': ShieldCheck, lectura: FileText,
  enlace: ExternalLink, 'form-custom': ClipboardList, confirmacion: Star,
}

const colorMap = {
  video: '#3b82f6', audio: '#06b6d4', documento: '#f97316',
  quiz: '#f59e0b', 'completar-perfil': '#10b981', subida: '#ec4899',
  'tarea-otro': '#ef4444', reunion: '#2563eb', recorrido: '#d946ef',
  'tarea-rrhh': '#0C2D40', lectura: '#f97316', enlace: '#6366f1',
  'form-custom': '#10b981', confirmacion: '#f59e0b',
}

export default function Bienvenida() {
  const { currentUser } = useUser()
  const { rutaActiva, rutaAdmin } = useRutaActiva()
  const navigate = useNavigate()
  const firstName = currentUser.name.split(' ')[0]
  const isMobile = currentUser.id === 4

  const ruta = currentUser.role === 'colaborador' ? rutaActiva : (rutaAdmin || rutaActiva)

  const allTareas = ruta
    ? ruta.etapas.flatMap(e => e.actividades.flatMap(a => a.tareas))
    : []
  const totalTareas = allTareas.length
  const totalDone = allTareas.filter(t => t.done).length
  const totalXP = allTareas.reduce((s, t) => s + (t.xp || 0), 0)
  const pct = totalTareas > 0 ? Math.round((totalDone / totalTareas) * 100) : 0

  const totalDias = ruta
    ? ruta.etapas.reduce((s, e) => s + (e.duracion || 7), 0)
    : 0

  const nextTareas = allTareas.filter(t => !t.done).slice(0, 3)

  return (
    <div style={{ maxWidth: isMobile ? '100%' : 880, margin: '0 auto' }}>

      {/* HERO */}
      <div style={{
        background: '#0C2D40',
        borderRadius: isMobile ? 10 : 16,
        padding: isMobile ? '14px 12px' : '36px 40px',
        marginBottom: isMobile ? 10 : 24,
      }}>
        <span style={{ color: '#10DC97', fontSize: isMobile ? 7 : 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
          Bienvenido/a
        </span>
        <h1 style={{ color: '#fff', fontSize: isMobile ? 14 : 26, fontWeight: 800, margin: '0 0 4px', lineHeight: 1.2 }}>
          ¡Hola, {firstName}! 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? 8 : 14, margin: 0, maxWidth: 520, lineHeight: 1.4 }}>
          {currentUser.onbNA
            ? 'Tu espacio personal en la plataforma de Recursos Humanos.'
            : ruta
              ? 'Aquí encontrarás todo lo que necesitas para tu onboarding.'
              : 'Tu ruta de onboarding será asignada pronto.'
          }
        </p>
        {ruta && !currentUser.onbNA && (
          <div style={{ marginTop: 6, fontSize: isMobile ? 8 : 12, color: 'rgba(255,255,255,0.5)' }}>
            Ruta: <span style={{ color: '#10DC97', fontWeight: 600 }}>{ruta.nombre}</span>
            {ruta.area && <span> — {ruta.area}</span>}
          </div>
        )}
      </div>

      {currentUser.onbNA ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 16 }}>
          <div style={{
            background: '#fff', borderRadius: isMobile ? 8 : 12,
            padding: isMobile ? '12px' : '24px 28px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, marginBottom: isMobile ? 8 : 14 }}>
              <div style={{
                width: isMobile ? 26 : 40, height: isMobile ? 26 : 40, borderRadius: isMobile ? 7 : 10,
                background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle2 size={isMobile ? 12 : 18} style={{ color: '#16a34a' }} />
              </div>
              <div>
                <div style={{ fontSize: isMobile ? 10 : 15, fontWeight: 700, color: '#0C2D40' }}>Todo en orden</div>
                <div style={{ fontSize: isMobile ? 7 : 11, color: '#64748b' }}>Sin tareas pendientes</div>
              </div>
            </div>
            <p style={{ fontSize: isMobile ? 8 : 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              El módulo de onboarding es para nuevos colaboradores en proceso de incorporación.
              Como ya eres parte del equipo, aquí tienes acceso a los recursos generales de la empresa.
            </p>
          </div>

          <div style={{
            background: '#fff', borderRadius: isMobile ? 8 : 12,
            padding: isMobile ? '10px' : '20px 24px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ fontSize: isMobile ? 8 : 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: isMobile ? 6 : 12 }}>
              Recursos de la empresa
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 5 : 10 }}>
              {[
                { icon: Calendar, label: 'Calendario', desc: 'Feriados y eventos internos', color: '#3b82f6' },
                { icon: Users, label: 'Organigrama', desc: 'Estructura de la empresa', color: '#8b5cf6' },
                { icon: BookOpen, label: 'Recursos', desc: 'Manuales, políticas y guías', color: '#10b981' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10,
                  padding: isMobile ? '8px' : '14px 16px', borderRadius: isMobile ? 6 : 10,
                  background: '#f8fafc', border: '1px solid #f1f5f9', cursor: 'pointer',
                  transition: 'all .12s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#f8fafc' }}
                >
                  <div style={{
                    width: isMobile ? 22 : 34, height: isMobile ? 22 : 34, borderRadius: isMobile ? 5 : 8,
                    background: `${item.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <item.icon size={isMobile ? 10 : 15} style={{ color: item.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: isMobile ? 8 : 12, fontWeight: 600, color: '#334155' }}>{item.label}</div>
                    <div style={{ fontSize: isMobile ? 6.5 : 10, color: '#94a3b8', marginTop: 1 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !ruta ? (
        <div style={{
          background: '#fff', borderRadius: 12, padding: '40px 28px',
          border: '1px solid #e2e8f0', textAlign: 'center',
        }}>
          <PackageOpen size={40} style={{ color: '#cbd5e1', marginBottom: 12 }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0C2D40', margin: '0 0 6px' }}>
            Ruta pendiente de asignación
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0, maxWidth: 380, marginInline: 'auto', lineHeight: 1.5 }}>
            Cuando el equipo de Recursos Humanos active tu ruta de onboarding, aquí verás tu progreso, etapas y próximas tareas.
          </p>
        </div>
      ) : (
        <>
          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: isMobile ? 5 : 16, marginBottom: isMobile ? 10 : 24 }}>
            {[
              { icon: CheckCircle2, label: 'Tareas', value: `${totalDone}/${totalTareas}`, color: '#10b981' },
              { icon: Clock, label: 'Días', value: `${totalDias}`, color: '#f59e0b' },
              { icon: Star, label: 'XP', value: `${totalXP}`, color: '#8b5cf6' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: isMobile ? 8 : 12, padding: isMobile ? '8px 6px' : '20px 22px',
                border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center',
                flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 3 : 14, textAlign: isMobile ? 'center' : 'left',
              }}>
                <div style={{
                  width: isMobile ? 22 : 40, height: isMobile ? 22 : 40, borderRadius: isMobile ? 6 : 10,
                  background: `${stat.color}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <stat.icon size={isMobile ? 10 : 18} style={{ color: stat.color }} />
                </div>
                <div>
                  <div style={{ fontSize: isMobile ? 11 : 20, fontWeight: 800, color: '#0C2D40' }}>{stat.value}</div>
                  <div style={{ fontSize: isMobile ? 7 : 11, color: '#64748b' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* SIGUIENTES TAREAS */}
          {nextTareas.length > 0 && (
            <div style={{ marginBottom: isMobile ? 10 : 24 }}>
              <h2 style={{ fontSize: isMobile ? 9 : 15, fontWeight: 700, color: '#0C2D40', marginBottom: isMobile ? 6 : 14 }}>
                Siguientes pasos
              </h2>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 5 : 14 }}>
                {nextTareas.map((tarea, i) => {
                  const Icon = iconMap[tarea.tipo] || FileText
                  const color = colorMap[tarea.tipo] || '#64748b'
                  return (
                    <button key={tarea.id} style={{
                      background: '#fff', borderRadius: isMobile ? 8 : 12, padding: isMobile ? '8px 10px' : '20px',
                      border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'left',
                      transition: 'all .15s ease', display: 'flex',
                      flexDirection: isMobile ? 'row' : 'column',
                      alignItems: isMobile ? 'center' : 'stretch',
                      gap: isMobile ? 8 : 12,
                      fontFamily: 'inherit', flex: isMobile ? 'none' : 1,
                    }}
                      onClick={() => navigate('/onboarding/mi-onboarding')}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${color}15` }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                      <div style={{
                        width: isMobile ? 24 : 38, height: isMobile ? 24 : 38, borderRadius: isMobile ? 6 : 10,
                        background: `${color}12`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Icon size={isMobile ? 11 : 18} style={{ color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: isMobile ? 8.5 : 13, fontWeight: 700, color: '#0C2D40' }}>{tarea.name}</div>
                        {!isMobile && <div style={{
                          fontSize: 11, color: '#64748b', lineHeight: 1.4,
                          overflow: 'hidden', display: '-webkit-box',
                          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        }}>{tarea.desc || tarea.tipo.replace('-', ' ')}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, color, fontSize: isMobile ? 7 : 11, fontWeight: 600, marginTop: isMobile ? 0 : 'auto', flexShrink: 0 }}>
                        {isMobile ? '' : 'Comenzar'} <ArrowRight size={isMobile ? 9 : 12} />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* PROGRESO DE ETAPA */}
          <div style={{
            background: '#fff', borderRadius: isMobile ? 8 : 12, padding: isMobile ? '10px' : '22px 24px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 8 : 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10 }}>
                <Rocket size={isMobile ? 11 : 16} style={{ color: '#0C2D40' }} />
                <h2 style={{ fontSize: isMobile ? 9 : 14, fontWeight: 700, color: '#0C2D40', margin: 0 }}>Tu progreso</h2>
              </div>
              <span style={{ fontSize: isMobile ? 9 : 12, fontWeight: 700, color: '#10b981' }}>{pct}%</span>
            </div>

            <div style={{ height: isMobile ? 5 : 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden', marginBottom: isMobile ? 10 : 20 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: 99, transition: 'width .5s ease' }} />
            </div>

            <div style={{ display: 'flex', gap: isMobile ? 5 : 12, overflowX: 'auto' }}>
              {ruta.etapas.map((etapa, i) => {
                const etapaTareas = etapa.actividades.flatMap(a => a.tareas)
                const etapaDone = etapaTareas.filter(t => t.done).length
                const allDone = etapaTareas.length > 0 && etapaDone === etapaTareas.length
                const isCurrent = !allDone && (i === 0 || ruta.etapas.slice(0, i).every(pe =>
                  pe.actividades.flatMap(a => a.tareas).every(t => t.done)
                ))
                return (
                  <div key={i} style={{
                    flex: isMobile ? 'none' : 1, minWidth: isMobile ? 70 : 120,
                    padding: isMobile ? '6px 8px' : '12px 14px', borderRadius: isMobile ? 6 : 8,
                    background: isCurrent ? '#0C2D40' : allDone ? '#f0fdf4' : '#f8fafc',
                    border: isCurrent ? 'none' : allDone ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                  }}>
                    <div style={{
                      fontSize: isMobile ? 7 : 11, fontWeight: 700, marginBottom: 1,
                      color: isCurrent ? '#10DC97' : allDone ? '#16a34a' : '#94a3b8',
                    }}>
                      {allDone ? 'Completada' : `Etapa ${i + 1}`}
                    </div>
                    <div style={{
                      fontSize: isMobile ? 8 : 12, fontWeight: 600,
                      color: isCurrent ? '#fff' : allDone ? '#166534' : '#64748b',
                    }}>
                      {etapa.name}
                    </div>
                    <div style={{
                      fontSize: isMobile ? 7 : 10, marginTop: isMobile ? 2 : 4,
                      color: isCurrent ? 'rgba(255,255,255,0.5)' : '#94a3b8',
                    }}>
                      {etapaDone}/{etapaTareas.length} tareas
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
