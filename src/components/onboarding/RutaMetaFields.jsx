import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { nombrarCargos } from '../../utils/rutaEstados'

/* Los datos que identifican a una ruta: cómo se llama y a quién apunta.
   Viven aquí y no dentro de una pantalla porque se editan en dos lugares —el modal de alta y
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

/* Qué falta para poder guardar. Se decide aquí, junto a los campos, para que no haya una
   pantalla pidiendo un dato que el formulario ya no muestra. */
export function faltaAlgo(form) {
  if (!form.name?.trim()) return true
  if (form.esGlobal) return false
  if (!form.tipo || !form.area) return true
  // Al menos un cargo: una ruta de área sin ningún puesto no le llega a nadie.
  return form.area !== TODAS_LAS_AREAS && !(form.cargos?.length)
}

/* La casilla de una opción que se marca de a varias. Se dibuja acá y no con un <input
   type="checkbox"> porque la opción entera ya es el botón que alterna: un control dentro de
   otro control duplica el punto de clic y deja la mitad de los píxeles sin hacer nada. */
export function Casilla({ marcada }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 15, height: 15, borderRadius: 4, flexShrink: 0,
        border: `1.5px solid ${marcada ? 'var(--blue)' : 'var(--border-dark)'}`,
        background: marcada ? 'var(--blue)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .12s',
      }}
    >
      {marcada && <Check size={10} strokeWidth={3.5} style={{ color: '#fff' }} />}
    </span>
  )
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
  const cajaCargos = useRef(null)

  const cerrarTodos = () => { setDropTipo(false); setDropSucursal(false); setDropArea(false); setDropCargo(false) }
  const set = (k, v) => setForm({ ...form, [k]: v })

  const areasFiltradas = [TODAS_LAS_AREAS, ...areas].filter(a => a.toLowerCase().includes(areaSearch.toLowerCase()))
  const todasLasAreas = form.area === TODAS_LAS_AREAS
  const cargosFiltrados = (cargosPorArea[form.area] || []).filter(c => c.toLowerCase().includes(cargoSearch.toLowerCase()))

  /* Una ruta puede apuntar a varios cargos, así que el campo elige de a varios: el menú no se
     cierra al marcar uno —cerrarlo obligaba a reabrirlo para el segundo— y el campo resume lo
     elegido en su propia línea.

     Sin fichas debajo: con cuatro o cinco cargos crecían hacia abajo y le movían el piso al
     resto del formulario, para repetir lo que el menú ya muestra marcado. El campo mide
     siempre lo mismo y la lista entera está en el título. */
  const cargosElegidos = form.cargos || []
  const toggleCargo = (c) => set('cargos', cargosElegidos.includes(c)
    ? cargosElegidos.filter(x => x !== c)
    : [...cargosElegidos, c])

  // El menú de cargos se queda abierto entre marca y marca, así que necesita su propio cierre.
  useEffect(() => {
    if (!dropCargo) return
    const fuera = e => { if (cajaCargos.current && !cajaCargos.current.contains(e.target)) setDropCargo(false) }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [dropCargo])

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
                        onClick={() => { setForm({ ...form, area: a, cargos: [] }); setAreaSearch(''); setDropArea(false) }}
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

            {/* `minWidth: 0` para que la columna no se estire con el resumen: sin eso el texto
                largo empuja la grilla y le come el ancho al Área de al lado. */}
            <div className="pl-label" style={{ minWidth: 0 }}>
              <span>Cargos <span style={{ color: '#ef4444' }}>*</span></span>
              <div className="pl-dropdown-wrap" ref={cajaCargos}>
                <button
                  type="button"
                  className={`pl-dropdown-trigger${dropCargo ? ' open' : ''}`}
                  disabled={todasLasAreas}
                  title={cargosElegidos.length > 1 ? cargosElegidos.join(', ') : undefined}
                  onClick={() => { const v = !dropCargo; cerrarTodos(); setCargoSearch(''); setDropCargo(v) }}
                  style={todasLasAreas ? { opacity: 0.5, cursor: 'default' } : undefined}
                >
                  <span style={{
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    color: cargosElegidos.length ? undefined : 'var(--text-muted)',
                    fontWeight: cargosElegidos.length ? undefined : 500,
                  }}>
                    {todasLasAreas ? 'Todos los cargos'
                      : cargosElegidos.length ? nombrarCargos({ cargos: cargosElegidos })
                        : 'Elegir uno o varios'}
                  </span>
                  <ChevronDown size={14} className="pl-dropdown-chevron" />
                </button>
                {dropCargo && !todasLasAreas && (
                  <div className="pl-dropdown-menu" style={{ maxHeight: 260, overflowY: 'auto' }}>
                    {/* El buscador vive dentro del menú: afuera competía con el resumen por la
                        única línea que tiene el campo. */}
                    <input
                      type="text"
                      className="pl-input"
                      placeholder="Buscar cargo…"
                      value={cargoSearch}
                      onChange={e => setCargoSearch(e.target.value)}
                      autoFocus
                      style={{ marginBottom: 4 }}
                    />
                    {/* Casilla y no palomita al final: el cuadradito se lee antes que la opción
                        y dice, sin texto, que acá se marca más de uno. */}
                    {cargosFiltrados.map(c => {
                      const elegido = cargosElegidos.includes(c)
                      return (
                        <button
                          key={c}
                          type="button"
                          className={`pl-dropdown-item${elegido ? ' selected' : ''}`}
                          onClick={() => toggleCargo(c)}
                        >
                          <Casilla marcada={elegido} />
                          <span style={{ flex: 1 }}>{c}</span>
                        </button>
                      )
                    })}
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
