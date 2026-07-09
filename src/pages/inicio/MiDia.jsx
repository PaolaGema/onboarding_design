import { useState } from 'react'
import { useUser } from '../../context/UserContext'
import viaTrofeo from '../../assets/imagenes/via_trofeo.webp'
import {
  Calendar, MapPin, Clock, Users2, Inbox,
  Plane, FileText, Gift, Heart, MessageCircle,
} from 'lucide-react'

/* ── DATA ────────────────────────────────────── */

const miDia = {
  turno: '08:00 – 16:00',
  actividad: 'Reunión con RRHH',
  pendientes: '2 solicitudes',
}

const proximosEventos = [
  { nombre: 'María', fecha: '20 JUN', tipo: 'CUMPLEAÑOS', color: '#ec4899' },
  { nombre: 'Jorge', fecha: '25 JUN', tipo: 'CUMPLEAÑOS', color: '#f59e0b' },
  { nombre: 'Ana', fecha: '30 JUN', tipo: 'CUMPLEAÑOS', color: '#8b5cf6' },
  { nombre: 'Carlos', fecha: '03 JUL', tipo: 'CUMPLEAÑOS', color: '#0d9488' },
  { nombre: 'Aniversario TrabajitHR', fecha: '09 JUL', tipo: 'EVENTO', color: '#0C2D40', esEvento: true },
]

const accionesRapidas = [
  { icon: Plane, label: 'Solicitar vacación' },
  { icon: FileText, label: 'Solicitar permiso' },
  { icon: Gift, label: 'Ver beneficios' },
]

const TABS = [
  { key: 'destacados', label: 'Destacados' },
  { key: 'noticias', label: 'Noticias' },
  { key: 'muro', label: 'Muro' },
]

const posts = [
  {
    id: 1, categoria: 'destacados', autor: 'RRHH', time: 'Hace 2 h',
    texto: '¡Felicidades al equipo de Ventas por cumplir la meta comercial del trimestre! Gracias por el esfuerzo y compromiso.',
    logro: 'Meta comercial cumplida',
    likes: 24, comentarios: 6,
  },
  {
    id: 2, categoria: 'noticias', autor: 'Comunicación interna', time: 'Ayer',
    texto: 'Recuerda que el próximo lunes es el Town Hall trimestral a las 10:00. ¡No faltes!',
    likes: 12, comentarios: 2,
  },
  {
    id: 3, categoria: 'muro', autor: 'Ana Martínez Ruiz', time: 'Hace 2 días',
    texto: 'Bienvenida al equipo de Marketing a nuestros nuevos colaboradores. ¡Vamos con todo este semestre!',
    likes: 18, comentarios: 3,
  },
]

/* ── COMPONENT ───────────────────────────────── */

export default function MiDia() {
  const { currentUser } = useUser()
  const [tab, setTab] = useState('destacados')

  const firstName = currentUser.name.split(' ')[0]
  const postsFiltrados = posts.filter(p => p.categoria === tab)

  return (
    <div className="content-scroll">

      {/* HOY ES */}
      <div className="sec-card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Calendar size={20} style={{ color: 'var(--green)' }} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Hola {firstName}, hoy es</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-heading)' }}>Martes 17 de junio, 2026</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <MapPin size={11} /> La Paz, Bolivia
          </div>
        </div>
      </div>

      {/* TURNO / ACTIVIDAD / PENDIENTES */}
      <div className="sec-card">
        <div style={{ display: 'flex' }}>
          {[
            { icon: Clock, label: 'Turno', value: miDia.turno, color: 'var(--blue)' },
            { icon: Users2, label: 'Próxima actividad', value: miDia.actividad, color: 'var(--green)' },
            { icon: Inbox, label: 'Pendientes', value: miDia.pendientes, color: 'var(--yellow)' },
          ].map((t, i) => (
            <div key={t.label} style={{ flex: 1, padding: '18px 20px', borderLeft: i > 0 ? '1px solid var(--border-soft)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <t.icon size={13} style={{ color: t.color }} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: t.color, textTransform: 'uppercase', letterSpacing: '.03em' }}>{t.label}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)' }}>{t.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRÓXIMOS EVENTOS Y CUMPLEAÑOS */}
      <div className="sec-card">
        <div className="sc-hd"><h3>Próximos eventos y cumpleaños</h3></div>
        <div className="sc-body" style={{ display: 'flex', gap: 18, overflowX: 'auto' }}>
          {proximosEventos.map(e => (
            <div key={e.nombre} style={{ textAlign: 'center', flexShrink: 0, minWidth: 66 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: e.esEvento ? 'var(--text-heading)' : e.color, textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 6 }}>
                {e.tipo}
              </div>
              <div style={{
                width: 46, height: 46, borderRadius: '50%', margin: '0 auto 6px',
                background: e.esEvento ? 'var(--navy)' : e.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--border-soft)',
              }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{e.nombre[0]}</span>
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-heading)' }}>{e.nombre}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{e.fecha}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div className="sec-card">
        <div className="sc-hd"><h3>Acciones rápidas</h3></div>
        <div className="sc-body" style={{ display: 'flex', gap: 14 }}>
          {accionesRapidas.map(a => (
            <div key={a.label} style={{
              flex: 1, textAlign: 'center', padding: '16px 10px', borderRadius: 14,
              border: '1px solid var(--border-soft)', cursor: 'default',
            }}>
              <a.icon size={18} style={{ color: 'var(--text-muted)', margin: '0 auto 8px', display: 'block' }} />
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-heading)' }}>{a.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DESTACADOS / NOTICIAS / MURO */}
      <div className="sec-card">
        <div style={{ display: 'flex', gap: 6, padding: '16px 22px 0' }}>
          {TABS.map(t => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  fontSize: 12, fontWeight: 700, padding: '7px 16px', borderRadius: 20,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: active ? 'var(--navy)' : 'var(--input-bg)',
                  color: active ? '#fff' : 'var(--text-muted)',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>
        <div className="sc-body" style={{ padding: '14px 22px 18px' }}>
          {postsFiltrados.length > 0 ? postsFiltrados.map((p, i) => (
            <div key={p.id} style={{ padding: '16px 0', borderBottom: i < postsFiltrados.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{p.autor[0]}</span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)' }}>{p.autor}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{p.time}</div>
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 10px' }}>{p.texto}</p>
              {p.logro && (
                <div style={{
                  borderRadius: 12, overflow: 'hidden', marginBottom: 10,
                  background: 'linear-gradient(135deg, #0C2D40 0%, #1a4a63 100%)',
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                }}>
                  <img src={viaTrofeo} alt="" style={{ height: 56, width: 'auto', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>Logro</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{p.logro}</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Heart size={13} /> {p.likes}
                </span>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <MessageCircle size={13} /> {p.comentarios}
                </span>
              </div>
            </div>
          )) : (
            <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              Sin publicaciones en esta pestaña
            </div>
          )}
        </div>
      </div>

      <div style={{ height: '8px' }} />

    </div>
  )
}
