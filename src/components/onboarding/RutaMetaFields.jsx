import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

/* Los datos que identifican a una ruta: cómo se llama y a quién apunta.
   Viven acá y no dentro de una pantalla porque se editan en dos lugares —el modal de alta y
   la vista previa— y dos copias del mismo formulario se desincronizan al primer campo nuevo.

   El componente no guarda nada: recibe `form` y `setForm` y deja la persistencia a quien lo
   usa, que es el único que sabe si está creando o modificando. */

export const cargosPorArea = {
  'Ventas': ['Pasante Comercial', 'SDR Junior', 'Ejecutiva Comercial', 'Ejecutivo Senior', 'Account Manager', 'Gerente de Ventas'],
  'Comercial': ['Ejecutivo Comercial', 'Key Account Manager', 'Coordinador Comercial', 'Director Comercial'],
  'Dirección': ['Director General', 'Director de Área', 'Gerente General', 'Asistente de Dirección'],
  'Operaciones': ['Asistente Operativo', 'Analista de Procesos', 'Coordinador Logístico', 'Gerente de Operaciones'],
  'Tecnología': ['Desarrollador Backend', 'Frontend Developer', 'QA Engineer', 'DevOps Engineer', 'Data Analyst', 'Tech Lead'],
  'Finanzas': ['Analista Financiera', 'Contador General', 'Tesorero', 'Auditor Interno'],
  'Diseño': ['Diseñadora UX/UI', 'Diseñadora Gráfica', 'Director Creativo', 'Motion Designer'],
  'Marketing': ['Community Manager', 'Analista de Marketing', 'Especialista SEO', 'Content Creator', 'Ejecutiva de Marca', 'Líder de Marketing'],
  'Recursos Humanos': ['Analista de Nóminas', 'Reclutadora', 'Especialista RRHH', 'Gerente de RRHH'],
}

export const areas = Object.keys(cargosPorArea)
export const sucursales = ['La Paz', 'Cochabamba', 'Santa Cruz (Central)', 'Tarija']
export const tiposRuta = ['Onboarding', 'Reboarding']

export const TODAS_LAS_AREAS = 'Todas las áreas'

/* Qué falta para poder guardar. Se decide acá, junto a los campos, para que no haya una
   pantalla pidiendo un dato que el formulario ya no muestra. */
export function faltaAlgo(form) {
  if (!form.name?.trim()) return true
  if (form.esGlobal) return false
  if (!form.tipo || !form.area) return true
  return form.area !== TODAS_LAS_AREAS && !form.cargo
}

/* `compacto` es para paneles angostos, como el costado de la vista previa: ahí dos columnas
   dejan cada campo en ~165px y el texto del desplegable se parte en dos líneas, descuadrando
   la fila. Apiladas entran enteras. */
export default function RutaMetaFields({ form, setForm, autoFocus = false, compacto = false }) {
  const columnas = compacto ? '1fr' : '1fr 1fr'
  const [dropTipo, setDropTipo] = useState(false)
  const [dropSucursal, setDropSucursal] = useState(false)
  const [dropArea, setDropArea] = useState(false)
  const [dropCargo, setDropCargo] = useState(false)
  const [areaSearch, setAreaSearch] = useState('')
  const [cargoSearch, setCargoSearch] = useState('')

  const cerrarTodos = () => { setDropTipo(false); setDropSucursal(false); setDropArea(false); setDropCargo(false) }
  const set = (k, v) => setForm({ ...form, [k]: v })

  const areasFiltradas = [TODAS_LAS_AREAS, ...areas].filter(a => a.toLowerCase().includes(areaSearch.toLowerCase()))
  const todasLasAreas = form.area === TODAS_LAS_AREAS
  const cargosFiltrados = (cargosPorArea[form.area] || []).filter(c => c.toLowerCase().includes(cargoSearch.toLowerCase()))

  return (
    <>
      <label className="pl-label">
        <span>Nombre de la ruta <span style={{ color: '#ef4444' }}>*</span></span>
        <input
          type="text"
          className="pl-input"
          placeholder="Ej: Onboarding Ventas — Pasante"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          autoFocus={autoFocus}
        />
      </label>

      <label className="pl-label">
        Descripción
        <textarea
          className="pl-input"
          style={{ resize: 'vertical', minHeight: '52px' }}
          rows={2}
          placeholder="Breve descripción de esta ruta de onboarding"
          value={form.descripcion || ''}
          onChange={e => set('descripcion', e.target.value)}
        />
      </label>

      {/* La ruta general se aplica a todos, así que no hay a quién apuntarla: sin tipo,
          sucursal, área ni cargo. Pedirlos sería pedir un dato que no se usa. */}
      {form.esGlobal ? null : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: columnas, gap: 14 }}>
            <div className="pl-label">
              <span>Tipo <span style={{ color: '#ef4444' }}>*</span></span>
              <div className="pl-dropdown-wrap">
                <button
                  type="button"
                  className={`pl-dropdown-trigger${dropTipo ? ' open' : ''}`}
                  onClick={() => { const v = !dropTipo; cerrarTodos(); setDropTipo(v) }}
                >
                  <span>{form.tipo}</span>
                  <ChevronDown size={14} className="pl-dropdown-chevron" />
                </button>
                {dropTipo && (
                  <div className="pl-dropdown-menu">
                    {tiposRuta.map(t => (
                      <button
                        key={t}
                        type="button"
                        className={`pl-dropdown-item${form.tipo === t ? ' selected' : ''}`}
                        onClick={() => { set('tipo', t); setDropTipo(false) }}
                      >
                        <span>{t}</span>
                        {form.tipo === t && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pl-label">
              <span>Sucursal <span style={{ color: '#ef4444' }}>*</span></span>
              <div className="pl-dropdown-wrap">
                <button
                  type="button"
                  className={`pl-dropdown-trigger${dropSucursal ? ' open' : ''}`}
                  onClick={() => { const v = !dropSucursal; cerrarTodos(); setDropSucursal(v) }}
                >
                  <span>{form.sucursal}</span>
                  <ChevronDown size={14} className="pl-dropdown-chevron" />
                </button>
                {dropSucursal && (
                  <div className="pl-dropdown-menu" style={{ maxHeight: 220, overflowY: 'auto' }}>
                    {['Todas las sucursales', ...sucursales].map(s => (
                      <button
                        key={s}
                        type="button"
                        className={`pl-dropdown-item${form.sucursal === s ? ' selected' : ''}`}
                        onClick={() => { set('sucursal', s); setDropSucursal(false) }}
                      >
                        <span>{s}</span>
                        {form.sucursal === s && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: columnas, gap: 14 }}>
            <div className="pl-label">
              <span>Área <span style={{ color: '#ef4444' }}>*</span></span>
              <div className="pl-dropdown-wrap">
                <input
                  type="text"
                  className="pl-input"
                  placeholder="Buscar área…"
                  value={dropArea ? areaSearch : form.area}
                  onFocus={() => { setAreaSearch(''); cerrarTodos(); setDropArea(true) }}
                  onChange={e => { setAreaSearch(e.target.value); if (!dropArea) setDropArea(true) }}
                  onBlur={() => setDropArea(false)}
                />
                {dropArea && (
                  <div className="pl-dropdown-menu" onMouseDown={e => e.preventDefault()}>
                    {areasFiltradas.map(a => (
                      <button
                        key={a}
                        type="button"
                        className={`pl-dropdown-item${form.area === a ? ' selected' : ''}`}
                        onClick={() => { setForm({ ...form, area: a, cargo: '' }); setAreaSearch(''); setDropArea(false) }}
                      >
                        <span>{a}</span>
                        {form.area === a && <Check size={14} />}
                      </button>
                    ))}
                    {areasFiltradas.length === 0 && (
                      <div style={{ padding: '8px 9px', fontSize: 11.5, color: 'var(--text-muted)' }}>Sin resultados</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pl-label">
              <span>Cargo <span style={{ color: '#ef4444' }}>*</span></span>
              <div className="pl-dropdown-wrap">
                <input
                  type="text"
                  className="pl-input"
                  placeholder={todasLasAreas ? 'Todos los cargos' : 'Buscar cargo…'}
                  disabled={todasLasAreas}
                  value={dropCargo ? cargoSearch : form.cargo}
                  onFocus={() => { setCargoSearch(''); cerrarTodos(); setDropCargo(true) }}
                  onChange={e => { setCargoSearch(e.target.value); if (!dropCargo) setDropCargo(true) }}
                  onBlur={() => setDropCargo(false)}
                  style={todasLasAreas ? { opacity: 0.5, cursor: 'default' } : undefined}
                />
                {dropCargo && !todasLasAreas && (
                  <div className="pl-dropdown-menu" onMouseDown={e => e.preventDefault()}>
                    {cargosFiltrados.map(c => (
                      <button
                        key={c}
                        type="button"
                        className={`pl-dropdown-item${form.cargo === c ? ' selected' : ''}`}
                        onClick={() => { set('cargo', c); setCargoSearch(''); setDropCargo(false) }}
                      >
                        <span>{c}</span>
                        {form.cargo === c && <Check size={14} />}
                      </button>
                    ))}
                    {cargosFiltrados.length === 0 && (
                      <div style={{ padding: '8px 9px', fontSize: 11.5, color: 'var(--text-muted)' }}>Sin resultados</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
