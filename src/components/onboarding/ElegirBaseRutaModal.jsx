import { useState } from 'react'
import { X, Search, Layers, Route, Copy, ArrowRight } from 'lucide-react'
import { rutaPlantillas } from '../../data/rutaPlantillas'

/* De dónde sale el contenido de una ruta vacía: una plantilla del catálogo o una copia de
   otra ruta ya armada.

   Vive dentro del constructor y no antes de crear la ruta. Antes lo primero que se preguntaba
   al tocar "Nueva ruta" era "¿desde cero o desde plantilla?", y esa pregunta llegaba a ciegas:
   todavía no habías puesto el nombre ni visto qué trae cada plantilla. Peor, era una puerta de
   un solo sentido — quien elegía "desde cero" ya no volvía a ver el catálogo.

   Acá la oferta aparece cuando el lienzo vacío la vuelve evidente, y sigue disponible después.

   Copiar otra ruta no estaba en el flujo viejo y es lo que más se usa en la práctica: la
   segunda ruta de una empresa casi siempre se parece a la primera. */

const cuenta = (etapas = []) => ({
  etapas: etapas.length,
  tareas: etapas.reduce((s, e) => s + (e.actividades || []).reduce((ss, a) => ss + (a.tareas?.length || 0), 0), 0),
})

export default function ElegirBaseRutaModal({ rutaActualId, rutas = [], onUsar, onCerrar }) {
  const [pestana, setPestana] = useState('plantillas')
  const [busca, setBusca] = useState('')

  const q = busca.trim().toLowerCase()
  const coincide = (nombre, area) => !q || nombre.toLowerCase().includes(q) || (area || '').toLowerCase().includes(q)

  const plantillasBase = rutaPlantillas
    .filter(t => t.etapasData?.length && coincide(t.name, t.area))
    .map(t => ({ id: `tpl-${t.id ?? t.name}`, nombre: t.name, area: t.area, etapasData: t.etapasData }))

  /* Solo rutas con contenido y nunca la que se está editando: copiarse a sí misma no hace
     nada y ofrecerlo obliga a descartar la opción a mano. */
  const copiables = rutas
    .filter(r => r.id !== rutaActualId && r.etapasData?.length && !r.esGlobal && coincide(r.name, r.area))
    .map(r => ({ id: `ruta-${r.id}`, nombre: r.name, area: r.area, cargo: r.cargo, etapasData: r.etapasData }))

  const lista = pestana === 'plantillas' ? plantillasBase : copiables

  return (
    <div className="pl-overlay" onClick={onCerrar}>
      <div
        className="pl-modal"
        style={{ maxWidth: 620, width: '92vw', height: '76vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="pl-modal-header" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} style={{ color: '#fff' }} />
            </div>
            <h2>Empezar desde algo hecho</h2>
          </div>
          <button className="pl-modal-close" onClick={onCerrar}><X size={18} /></button>
        </div>

        <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface-hover)', borderRadius: 9, padding: 3, marginBottom: 12 }}>
            {[
              { key: 'plantillas', icon: Route, label: 'Plantillas', n: plantillasBase.length },
              { key: 'copiar', icon: Copy, label: 'Copiar otra ruta', n: copiables.length },
            ].map(t => {
              const TIcon = t.icon
              const on = pestana === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => setPestana(t.key)}
                  style={{
                    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    padding: '8px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    background: on ? 'var(--surface-card)' : 'transparent',
                    color: on ? 'var(--text-heading)' : 'var(--text-muted)',
                    fontSize: 12, fontWeight: 700,
                    boxShadow: on ? 'var(--sh-sm)' : 'none',
                  }}
                >
                  <TIcon size={13} /> {t.label}
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)' }}>{t.n}</span>
                </button>
              )
            })}
          </div>

          <div className="pl-search-wrap" style={{ marginBottom: 12 }}>
            <Search size={13} className="pl-search-ico" />
            <input
              type="text"
              className="pl-search"
              placeholder={pestana === 'plantillas' ? 'Buscar plantilla por nombre o área…' : 'Buscar ruta por nombre o área…'}
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }}>
          {lista.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {pestana === 'copiar' && !q
                ? 'Todavía no hay otra ruta con contenido para copiar. Cuando armes una, va a aparecer acá.'
                : 'No hay resultados para esa búsqueda.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lista.map(item => {
                const n = cuenta(item.etapasData)
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 13px', borderRadius: 11,
                      border: '1px solid var(--border-soft)', background: 'var(--surface-card)',
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: 'var(--green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Route size={16} style={{ color: 'var(--green)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.nombre}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.area}{item.cargo ? ` · ${item.cargo}` : ''} — {n.etapas} {n.etapas === 1 ? 'etapa' : 'etapas'} · {n.tareas} {n.tareas === 1 ? 'tarea' : 'tareas'}
                      </div>
                    </div>
                    <button
                      className="pl-btn-save"
                      style={{ flexShrink: 0, height: 34, padding: '0 14px', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      onClick={() => onUsar(item.etapasData, item.nombre)}
                    >
                      Usar <ArrowRight size={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
