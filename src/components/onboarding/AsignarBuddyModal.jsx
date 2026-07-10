import { useState } from 'react'
import { X, Search, Check, UserCheck } from 'lucide-react'
import { colaboradoresData, BUDDY_ELEGIBLE } from '../../pages/personas/colaboradoresData'

export default function AsignarBuddyModal({ colaborador, onClose, onConfirm }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  // Solo se ofrece a quien ya terminó su propio onboarding: nadie guía un camino que
  // todavía está recorriendo.
  const candidatos = colaboradoresData.filter(c =>
    c.status === 'activo' &&
    BUDDY_ELEGIBLE.includes(c.onb) &&
    c.name !== colaborador.nombre &&
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.cargo.toLowerCase().includes(search.toLowerCase()) ||
      c.depto.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="pl-overlay" onClick={onClose}>
      <div className="pl-modal" style={{ width: 420, maxWidth: '92vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="pl-modal-header">
          <div>
            <h2 style={{ margin: 0, fontSize: 15 }}>{colaborador.buddy ? 'Cambiar buddy' : 'Asignar buddy'}</h2>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Elige quién acompañará a {colaborador.nombre} durante su onboarding</span>
          </div>
          <button className="pl-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0 }}>
          <div className="pl-search-wrap">
            <Search size={13} className="pl-search-ico" />
            <input type="text" className="pl-search" placeholder="Buscar por nombre, cargo o área…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {candidatos.map(c => {
              const sel = selected?.id === c.id
              return (
                <button key={c.id} onClick={() => setSelected(c)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 8, width: '100%', border: 'none',
                  background: sel ? '#d1fae5' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  transition: 'all .12s',
                }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = '#f8fafc' }}
                  onMouseLeave={e => { e.currentTarget.style.background = sel ? '#d1fae5' : 'transparent' }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{c.initials}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: sel ? 600 : 500, color: sel ? '#0C2D40' : '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                    <div style={{ fontSize: 9.5, color: '#94a3b8' }}>{c.cargo} · {c.depto}</div>
                  </div>
                  {sel && <Check size={14} style={{ color: '#059669', flexShrink: 0 }} />}
                </button>
              )
            })}
            {candidatos.length === 0 && (
              <div style={{ padding: 16, textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>Sin resultados</div>
            )}
          </div>
        </div>

        <div className="pl-modal-footer">
          <button className="pl-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="pl-btn-save" disabled={!selected}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...(!selected ? { opacity: 0.5, cursor: 'default' } : {}) }}
            onClick={() => selected && onConfirm(selected)}>
            <UserCheck size={13} />
            Asignar buddy
          </button>
        </div>
      </div>
    </div>
  )
}
