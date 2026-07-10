import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import {
  HOY, MESES, DIAS_SEMANA, buildCalendarCells, buildEventosDelMes, CALENDAR_LEGEND, avatarUrl,
} from '../../utils/calendarEvents'

export default function Calendario() {
  const [searchParams] = useSearchParams()
  const mesOffset = Number(searchParams.get('mes')) || 0
  const diaInicial = Number(searchParams.get('dia')) || null

  const [viewDate, setViewDate] = useState(() => new Date(HOY.getFullYear(), HOY.getMonth() + mesOffset, 1))
  const [selectedDay, setSelectedDay] = useState(diaInicial)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const isCurrentMonth = year === HOY.getFullYear() && month === HOY.getMonth()
  const activeDay = selectedDay ?? (isCurrentMonth ? HOY.getDate() : 1)
  const isTodaySelected = isCurrentMonth && activeDay === HOY.getDate()

  const calendarCells = buildCalendarCells(year, month)
  const eventosPorDia = buildEventosDelMes(year, month)
  const eventosDelDia = eventosPorDia[activeDay] || []

  function goMonth(delta) {
    setViewDate(new Date(year, month + delta, 1))
    setSelectedDay(null)
  }

  return (
    <div className="content-scroll">
      <div className="two-col" style={{ alignItems: 'start' }}>

        {/* CALENDARIO */}
        <div className="sec-card">
          <div className="sc-hd">
            <CalendarDays size={15} style={{ color: 'var(--blue)' }} />
            <h3>{MESES[month]} {year}</h3>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => goMonth(-1)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border-soft)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => goMonth(1)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border-soft)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="sc-body" style={{ padding: '20px 26px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {DIAS_SEMANA.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '0 0 10px' }}>{d}</div>
              ))}
              {calendarCells.map((cell, i) => {
                const isToday = cell.inMonth && isCurrentMonth && cell.day === HOY.getDate()
                const isSelected = cell.inMonth && cell.day === activeDay
                const eventos = cell.inMonth ? eventosPorDia[cell.day] : null
                return (
                  <button
                    key={i}
                    onClick={() => cell.inMonth && setSelectedDay(cell.day)}
                    disabled={!cell.inMonth}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 0',
                      background: 'none', border: 'none', fontFamily: 'inherit', cursor: cell.inMonth ? 'pointer' : 'default',
                    }}
                  >
                    <span style={{
                      width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: isSelected || isToday ? 700 : 500,
                      background: isSelected ? 'var(--navy)' : 'transparent',
                      border: !isSelected && isToday ? '1.5px solid var(--navy)' : 'none',
                      color: !cell.inMonth ? 'var(--border-dark)' : isSelected ? '#fff' : isToday ? 'var(--navy)' : 'var(--text-heading)',
                    }}>{cell.day}</span>
                    <span style={{ display: 'flex', gap: 2, height: 4 }}>
                      {eventos && eventos.slice(0, 4).map((e, j) => (
                        <span key={j} style={{ width: 4, height: 4, borderRadius: '50%', background: e.color }} />
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-soft)', flexWrap: 'wrap' }}>
              {CALENDAR_LEGEND.map(l => (
                <span key={l.label} style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: l.color, display: 'inline-block' }} /> {l.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* DETALLE DEL DÍA */}
        <div className="sec-card">
          <div className="sc-hd">
            <h3>{activeDay} de {MESES[month]}{isTodaySelected ? ' · Hoy' : ''} <span className="sc-hd-count">{eventosDelDia.length}</span></h3>
          </div>
          <div className="sc-body" style={{ padding: '8px 22px 18px', maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }}>
            {eventosDelDia.length > 0 ? eventosDelDia.map((e, i) => (
              <div key={i} className="upcoming-item">
                <div className="ui-date">
                  <div className="ui-day">{String(activeDay).padStart(2, '0')}</div>
                  <div className="ui-month">{MESES[month].slice(0, 3).toUpperCase()}</div>
                </div>
                <div className="ui-info">
                  <div className="ui-name">{e.titulo}</div>
                  <div className="ui-sub">{e.subtitulo}</div>
                  <div className="ui-sub">{e.tipo}</div>
                </div>
                {e.kind === 'persona' ? (
                  <div className="ui-av"><img src={avatarUrl(e.titulo)} alt={e.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={ev => { ev.currentTarget.style.display = 'none' }} /></div>
                ) : (
                  <div className="ui-av" style={{ background: `${e.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <e.Icon size={14} style={{ color: e.color }} />
                  </div>
                )}
              </div>
            )) : (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <CheckCircle2 size={24} style={{ color: 'var(--green)', margin: '0 auto 8px' }} />
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sin actividades este día</div>
              </div>
            )}
          </div>
        </div>

      </div>

      <div style={{ height: '8px' }} />

    </div>
  )
}
