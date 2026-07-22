import { Fragment, useMemo, useState } from 'react'
import {
  Download, Network, LayoutGrid, Table2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  X, Building2, UploadCloud, FileSpreadsheet, Check, User, Search, Pencil, Star, Users,
  Minus, Plus, ArrowUp,
} from 'lucide-react'
import OrgGrafico from '../../components/personas/OrgGrafico'
import { colaboradoresData } from './colaboradoresData'
import {
  empresa, sucursales, unidades, cargos as cargosSeed, getUnidad,
  buildOrgTree, filasTabla, buscarCargos, unidadesRaiz, subunidadesDe,
  tarjetaUnidad, cargosDeUnidad,
} from '../../data/organigramaData'

const VISTAS = [
  { key: 'grafico', label: 'Gráfico', icon: Network },
  { key: 'cards', label: 'Cards', icon: LayoutGrid },
  { key: 'tabla', label: 'Tabla', icon: Table2 },
]

const PESTANAS = [
  { key: 'completo', label: 'Organigrama completo', hint: 'Muestra unidades y cargos juntos' },
  { key: 'cargos', label: 'Ver por cargos', hint: 'Solo la línea de mando' },
  { key: 'unidades', label: 'Ver por unidades', hint: 'Solo la estructura de áreas' },
]

// Ids locales para los cargos que se crean en el prototipo, fuera del rango de los sembrados.
let seqCargo = 900

function Avatar({ persona, size = 22 }) {
  return (
    <span className="og-av" style={{ background: persona.color, width: size, height: size, fontSize: size * 0.4 }}>
      {persona.initials}
    </span>
  )
}

function Buscador({ value, onChange }) {
  return (
    <div className="og-buscador">
      <Search size={14} />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Buscar en todo el organigrama"
      />
      {value && <button onClick={() => onChange('')} title="Limpiar"><X size={13} /></button>}
    </div>
  )
}

/* ---------- Modal: alta y detalle de un cargo ---------- */

function CargoModal({ cargo, onGuardar, onCerrar, listaCargos }) {
  const nuevo = !cargo
  const [form, setForm] = useState(() => ({
    nombre: cargo?.nombre || '',
    unidadId: cargo?.unidadId || unidades[1].id,
    reportaA: cargo?.reportaA ?? 'gg',
    ocupanteId: cargo?.ocupanteId ?? '',
  }))

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const valido = form.nombre.trim().length > 0

  return (
    <div className="og-modal-back" onClick={onCerrar}>
      <div className="og-modal" onClick={e => e.stopPropagation()}>
        <div className="og-modal-hd">
          <h3>{nuevo ? 'Nuevo cargo' : 'Detalle del cargo'}</h3>
          <button onClick={onCerrar}><X size={16} /></button>
        </div>

        <div className="og-modal-body">
          <label className="og-field">
            <span>Nombre del cargo</span>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej. Analista de Marketing" />
          </label>

          <label className="og-field">
            <span>Unidad</span>
            <select value={form.unidadId} onChange={e => set('unidadId', e.target.value)}>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </label>

          <label className="og-field">
            <span>Reporta a</span>
            <select value={form.reportaA ?? ''} onChange={e => set('reportaA', e.target.value || null)}>
              <option value="">— Sin jefe (raíz) —</option>
              {listaCargos.filter(c => c.id !== cargo?.id).map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </label>

          <label className="og-field">
            <span>Ocupante</span>
            <select value={form.ocupanteId ?? ''} onChange={e => set('ocupanteId', e.target.value === '' ? null : Number(e.target.value))}>
              <option value="">— Vacante —</option>
              {colaboradoresData.map(p => <option key={p.id} value={p.id}>{p.name} — {p.cargo}</option>)}
            </select>
          </label>

          {form.ocupanteId === null || form.ocupanteId === '' ? (
            <p className="og-modal-nota">El cargo quedará marcado como <strong>vacante</strong> en el organigrama.</p>
          ) : null}
        </div>

        <div className="og-modal-ft">
          <button className="og-btn-ghost" onClick={onCerrar}>Cancelar</button>
          <button
            className="og-btn-primary"
            disabled={!valido}
            onClick={() => onGuardar({ ...form, nombre: form.nombre.trim(), ocupanteId: form.ocupanteId === '' ? null : form.ocupanteId })}
          >
            <Check size={14} /> {nuevo ? 'Crear cargo' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Modal: importar desde Excel ---------- */

function ImportarModal({ onCerrar }) {
  return (
    <div className="og-modal-back" onClick={onCerrar}>
      <div className="og-modal" onClick={e => e.stopPropagation()}>
        <div className="og-modal-hd">
          <h3>Importar organigrama desde Excel</h3>
          <button onClick={onCerrar}><X size={16} /></button>
        </div>
        <div className="og-modal-body">
          <div className="og-drop">
            <UploadCloud size={26} />
            <strong>Arrastra tu archivo aquí</strong>
            <span>o hacé clic para buscarlo — .xlsx o .csv</span>
          </div>
          <button className="og-btn-ghost og-btn-full">
            <FileSpreadsheet size={14} /> Descargar plantilla de ejemplo
          </button>
          <p className="og-modal-nota">
            La plantilla espera una fila por cargo con las columnas <strong>Cargo</strong>, <strong>Unidad</strong>,
            <strong> Reporta a</strong> y <strong>Ocupante</strong>. Las filas sin ocupante se cargan como vacantes.
          </p>
        </div>
        <div className="og-modal-ft">
          <button className="og-btn-ghost" onClick={onCerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Vistas alternativas ---------- */

const TIPO_CARD = { jefe: 'Jefe / Director', staff: 'Asistente/Staff', colaborador: 'Colaborador común' }

function Seccion({ titulo, conteo }) {
  return (
    <div className="og-seccion">
      <h3>{titulo}</h3>
      <span>{conteo}</span>
    </div>
  )
}

function CargoCard({ fila, onAbrir }) {
  const { cargo, tipo, ocupante, vacante, jefeNombre } = fila
  const clases = ['og-cc']
  if (vacante) clases.push('og-cc-vacante')
  if (tipo === 'staff') clases.push('og-cc-staff')

  return (
    <div className={clases.join(' ')} onDoubleClick={() => onAbrir(cargo)}>
      {vacante && <span className="og-cc-tag">Vacante</span>}
      <button className="og-cc-edit" onClick={() => onAbrir(cargo)} title="Editar cargo"><Pencil size={12} /></button>

      <div className="og-cc-hd">
        <span className="og-cc-ico">
          {tipo === 'jefe' ? <Star size={17} className="og-ico-jefe" /> : <User size={17} className="og-ico-persona" />}
        </span>
        <div className="og-cc-hd-txt">
          <strong>{cargo.nombre}</strong>
          <span>{TIPO_CARD[tipo]}</span>
        </div>
      </div>

      {jefeNombre && (
        <div className="og-cc-reporta"><ArrowUp size={10} /> Reporta a <strong>{jefeNombre}</strong></div>
      )}

      <div className="og-cc-sep" />
      {ocupante ? (
        <>
          <div className="og-cc-label">1 colaborador asignado</div>
          <div className="og-cc-persona"><Avatar persona={ocupante} size={22} />{ocupante.name}</div>
        </>
      ) : (
        <div className="og-cc-persona og-cc-persona-vacia">Sin colaborador asignado</div>
      )}
    </div>
  )
}

function UnidadCard({ datos, onEntrar }) {
  const { unidad, cabeza, totalCargos, totalSub } = datos
  return (
    <div className="og-un" onClick={() => onEntrar(unidad.id)}>
      <div className="og-un-top">
        <span className="og-un-ico"><Building2 size={16} /></span>
        <strong>{unidad.nombre}</strong>
        {cabeza && <span className="og-un-jefe"><Star size={11} /> {cabeza.nombre}</span>}
      </div>
      <div className="og-un-ft">
        <div className="og-un-stat"><b>{totalCargos}</b><span>{totalCargos === 1 ? 'cargo' : 'cargos'}</span></div>
        <div className="og-un-stat"><b>{totalSub}</b><span>{totalSub === 1 ? 'sub-unidad' : 'sub-unidades'}</span></div>
        <span className="og-un-cta">Ver unidad →</span>
      </div>
    </div>
  )
}

function VistaCards({ lista, busca, setBusca, onAbrir }) {
  const [ruta, setRuta] = useState([])

  const actual = ruta.length ? ruta[ruta.length - 1] : null
  const q = busca.trim()

  const resultados = useMemo(() => (q ? buscarCargos(q, lista) : []), [q, lista])
  const raices = useMemo(() => unidadesRaiz().map(u => tarjetaUnidad(u.id, lista)), [lista])
  const cargosAqui = useMemo(() => (actual ? cargosDeUnidad(actual, lista) : []), [actual, lista])
  const subsAqui = useMemo(
    () => (actual ? subunidadesDe(actual).map(u => tarjetaUnidad(u.id, lista)) : []),
    [actual, lista],
  )

  const entrar = id => setRuta(r => [...r, id])
  const irA = i => setRuta(r => r.slice(0, i))
  const nombreActual = actual ? getUnidad(actual)?.nombre : null

  return (
    <>
      {/* MIGAS */}
      <div className="og-crumbs">
        {ruta.length > 0 && (
          <button className="og-crumb-back" onClick={() => setRuta(r => r.slice(0, -1))}>
            <ChevronLeft size={13} /> Atrás
          </button>
        )}
        <button className={`og-crumb${ruta.length === 0 ? ' on' : ''}`} onClick={() => setRuta([])}>Inicio</button>
        {ruta.map((id, i) => (
          <Fragment key={id}>
            <ChevronRight size={12} className="og-crumb-sep" />
            <button
              className={`og-crumb${i === ruta.length - 1 ? ' on' : ''}`}
              onClick={() => irA(i + 1)}
            >
              {getUnidad(id)?.nombre}
            </button>
          </Fragment>
        ))}
        <Buscador value={busca} onChange={setBusca} />
      </div>

      <div className="og-scroll">
        {q ? (
          <>
            <Seccion titulo={`Resultados para "${q}"`} conteo={`${resultados.length} ${resultados.length === 1 ? 'cargo' : 'cargos'}`} />
            {resultados.length === 0
              ? <p className="og-vacio">Ningún cargo, persona ni área coincide con la búsqueda.</p>
              : <div className="og-grid">{resultados.map(f => <CargoCard key={f.cargo.id} fila={f} onAbrir={onAbrir} />)}</div>}
          </>
        ) : !actual ? (
          <>
            <Seccion titulo="Unidades organizacionales" conteo="Haz clic en una unidad para ver sus cargos y sub-áreas." />
            <div className="og-grid">{raices.map(d => <UnidadCard key={d.unidad.id} datos={d} onEntrar={entrar} />)}</div>
          </>
        ) : (
          <>
            <Seccion titulo={`Cargos en ${nombreActual}`} conteo={`${cargosAqui.length} ${cargosAqui.length === 1 ? 'cargo' : 'cargos'}`} />
            {cargosAqui.length === 0
              ? <p className="og-vacio">Esta unidad todavía no tiene cargos definidos.</p>
              : <div className="og-grid">{cargosAqui.map(f => <CargoCard key={f.cargo.id} fila={f} onAbrir={onAbrir} />)}</div>}

            {subsAqui.length > 0 && (
              <>
                <Seccion titulo={`Sub-unidades de ${nombreActual}`} conteo={`${subsAqui.length} ${subsAqui.length === 1 ? 'área' : 'áreas'}`} />
                <div className="og-grid">{subsAqui.map(d => <UnidadCard key={d.unidad.id} datos={d} onEntrar={entrar} />)}</div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}

const TIPOS = {
  jefe: { label: 'Jefe/Director', clase: 'jefe', Icon: Star },
  staff: { label: 'Staff', clase: 'staff', Icon: Users },
  colaborador: { label: 'Colaborador', clase: 'colab', Icon: User },
}

function TipoPill({ tipo }) {
  const t = TIPOS[tipo] || TIPOS.colaborador
  return <span className={`og-tipo og-tipo-${t.clase}`}><t.Icon size={10} /> {t.label}</span>
}

function VistaTabla({ lista, busca, setBusca, onAbrir }) {
  const [colapsados, setColapsados] = useState({})
  const grupos = useMemo(() => filasTabla(lista), [lista])

  const q = busca.trim().toLowerCase()
  const visibles = useMemo(() => {
    if (!q) return grupos
    const coincide = f =>
      f.cargo.nombre.toLowerCase().includes(q) ||
      (f.ocupante?.name || '').toLowerCase().includes(q) ||
      (f.unidad?.nombre || '').toLowerCase().includes(q)
    return grupos
      .map(g => ({ ...g, filas: g.filas.filter(coincide) }))
      .filter(g => g.filas.length > 0)
  }, [grupos, q])

  return (
    <>
      <div className="og-buscador-fila"><Buscador value={busca} onChange={setBusca} /></div>

      <div className="og-tabla-wrap">
        <table className="og-tabla">
          <thead>
            <tr>
              <th>Unidad organizacional / Cargo</th>
              <th>Pertenece a</th>
              <th>Tipo</th>
              <th>Colaborador</th>
              <th>Reporta a</th>
              <th className="og-th-acc">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map(g => {
              const cerrado = !!colapsados[g.id]
              return (
                <Fragment key={g.id}>
                  <tr className={`og-grupo${g.unidad?.padreId === null ? ' og-grupo-raiz' : ''}`}>
                    <td colSpan={6}>
                      <div className="og-grupo-in">
                        <Building2 size={13} />
                        <span className="og-grupo-nom">{g.unidad?.nombre || 'Sin unidad'}</span>
                        <span className="og-grupo-chip">{g.filas.length} {g.filas.length === 1 ? 'Cargo' : 'Cargos'}</span>
                        <button onClick={() => setColapsados(p => ({ ...p, [g.id]: !cerrado }))}>
                          {cerrado ? 'Expandir' : 'Colapsar'}
                          {cerrado ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {!cerrado && g.filas.map(f => (
                    <tr
                      key={f.cargo.id}
                      className={f.cargo.destacado ? 'og-fila-top' : undefined}
                      onDoubleClick={() => onAbrir(f.cargo)}
                    >
                      <td>
                        <div className="og-cargo-cel" style={{ paddingLeft: f.nivel * 22 }}>
                          {f.nivel > 0 && <span className="og-sangria" />}
                          <span className="og-cargo-nom">{f.cargo.nombre}</span>
                        </div>
                      </td>
                      <td><span className="og-pertenece">{f.unidad?.corto || '—'}</span></td>
                      <td><TipoPill tipo={f.tipo} /></td>
                      <td>
                        {f.ocupante ? (
                          <span className="og-td-persona"><Avatar persona={f.ocupante} size={22} />{f.ocupante.name}</span>
                        ) : (
                          <span className="og-td-persona">
                            <span className="og-av og-av-vacio"><Minus size={11} /></span>
                            <em className="og-td-vacio">Sin colaborador asignado</em>
                          </span>
                        )}
                      </td>
                      <td className="og-reporta">{f.jefeNombre || '— Empresa'}</td>
                      <td className="og-td-acc">
                        <button onClick={() => onAbrir(f.cargo)} title="Editar cargo"><Pencil size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

/* ---------- Pantalla ---------- */

export default function Organigrama() {
  const [lista, setLista] = useState(cargosSeed)
  const [vista, setVista] = useState('grafico')
  const [pestana, setPestana] = useState('completo')
  const [sede, setSede] = useState(sucursales[0])
  const [sedeAbierta, setSedeAbierta] = useState(false)
  const [busca, setBusca] = useState('')
  const [importar, setImportar] = useState(false)
  const [editando, setEditando] = useState(null) // { cargo } | { cargo: null } para alta

  const tree = useMemo(() => buildOrgTree(pestana, lista), [pestana, lista])

  const guardar = form => {
    if (editando.cargo) {
      setLista(prev => prev.map(c => (c.id === editando.cargo.id ? { ...c, ...form } : c)))
    } else {
      seqCargo += 1
      setLista(prev => [...prev, { id: `local-${seqCargo}`, ...form }])
    }
    setEditando(null)
  }

  return (
    <div className="og-page">
      {/* BARRA SUPERIOR */}
      <div className="og-topbar">
        <span className="og-empresa-nombre">{empresa.nombre}</span>

        <div className="og-sede">
          <button className="og-sede-btn" onClick={() => setSedeAbierta(v => !v)}>
            {sede.nombre}
            <span className="og-sede-chip">{sede.ciudad}</span>
            <ChevronDown size={14} />
          </button>
          {sedeAbierta && (
            <div className="og-sede-menu">
              {sucursales.map(s => (
                <button key={s.id} onClick={() => { setSede(s); setSedeAbierta(false) }}>
                  {s.nombre} <span>{s.ciudad}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="og-topbar-actions">
          <button className="og-import" onClick={() => setImportar(true)}>
            <Download size={13} /> Importar Excel
          </button>
          <div className="og-seg">
            {VISTAS.map(v => (
              <button
                key={v.key}
                className={vista === v.key ? 'on' : ''}
                onClick={() => setVista(v.key)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PESTAÑAS — son modos de dibujar el árbol, así que solo aplican a la vista Gráfico */}
      {vista === 'grafico' && (
      <div className="og-tabs">
        {PESTANAS.map(t => (
          <button
            key={t.key}
            className={`og-tab${pestana === t.key ? ' on' : ''}`}
            onClick={() => setPestana(t.key)}
          >
            <span className="og-tab-label">{t.label}</span>
            {pestana === t.key && <span className="og-tab-hint">{t.hint}</span>}
          </button>
        ))}
      </div>
      )}

      {/* CONTENIDO */}
      {vista === 'grafico' && (
        <OrgGrafico tree={tree} onAbrirCargo={nodo => setEditando({ cargo: nodo.cargo })} />
      )}
      {vista === 'cards' && (
        <VistaCards lista={lista} busca={busca} setBusca={setBusca} onAbrir={c => setEditando({ cargo: c })} />
      )}
      {vista === 'tabla' && (
        <div className="og-scroll">
          <VistaTabla lista={lista} busca={busca} setBusca={setBusca} onAbrir={c => setEditando({ cargo: c })} />
        </div>
      )}

      <button className="og-fab" onClick={() => setEditando({ cargo: null })} title="Agregar cargo">
        <Plus size={20} />
      </button>

      {importar && <ImportarModal onCerrar={() => setImportar(false)} />}
      {editando && (
        <CargoModal
          cargo={editando.cargo}
          listaCargos={lista}
          onGuardar={guardar}
          onCerrar={() => setEditando(null)}
        />
      )}
    </div>
  )
}
