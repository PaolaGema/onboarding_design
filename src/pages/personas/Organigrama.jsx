import { Fragment, useMemo, useState } from 'react'
import {
  Download, Network, LayoutGrid, Table2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  X, Building2, UploadCloud, FileSpreadsheet, Check, User, Search, Pencil, Star, Users,
  Minus, Plus, ArrowUp, Briefcase, MapPin, Trash2, FolderPlus, Database,
} from 'lucide-react'
import OrgGrafico from '../../components/personas/OrgGrafico'
import { colaboradoresData } from './colaboradoresData'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import {
  empresa, sucursales, getUnidad, nuevoId, tipoDe, TIPOS_CARGO, COLORES_UNIDAD,
  buildOrgTree, filasTabla, buscarCargos, unidadesRaiz, subunidadesDe,
  tarjetaUnidad, cargosDeUnidad, filtrarPorSucursal, TODAS_SUCURSALES,
  eliminarCargo, eliminarUnidad, bloqueoUnidad, unidadesPadrePosibles,
} from '../../data/organigramaData'

/* Lo visual de cada tipo. Los textos viven en `TIPOS_CARGO` (el modelo) y aquí solo se les
   suma ícono y clase: antes había dos mapas de etiquetas —uno en las cards, otro en la
   tabla— y ninguno conocía Outsourcing, así que los cargos externos se mostraban como
   colaboradores comunes. */
const PINTA_TIPO = {
  colaborador: { clase: 'colab', Icon: User },
  jefe: { clase: 'jefe', Icon: Star },
  staff: { clase: 'staff', Icon: Users },
  outsourcing: { clase: 'ext', Icon: Briefcase },
}

const tipoVisual = tipo => {
  const base = TIPOS_CARGO.find(t => t.key === tipo) || TIPOS_CARGO[0]
  return { ...base, ...PINTA_TIPO[base.key] }
}

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

function CargoModal({ cargo, onGuardar, onEliminar, onCerrar, org }) {
  const nuevo = !cargo
  const [form, setForm] = useState(() => ({
    nombre: cargo?.nombre || '',
    /* Los valores por defecto salen de la estructura que hay, no de ids sembrados: en un
       organigrama recién empezado no existe ni 'gg' ni un área en la segunda posición. */
    unidadId: cargo?.unidadId || org.unidades[0]?.id || '',
    reportaA: cargo ? cargo.reportaA : (org.cargos[0]?.id ?? null),
    ocupanteId: cargo?.ocupanteId ?? '',
    /* El tipo que se muestra es el que ve el resto de la pantalla: para un cargo con gente
       debajo, `tipoDe` devuelve 'jefe' aunque el cargo no lo declare. */
    tipo: cargo ? tipoDe(cargo, org) : 'colaborador',
    motivoContratacion: cargo?.motivoContratacion || '',
    sucursalIds: cargo?.sucursalIds || sucursales.map(s => s.id),
  }))

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const alternarSede = id => setForm(f => ({
    ...f,
    sucursalIds: f.sucursalIds.includes(id)
      ? f.sucursalIds.filter(x => x !== id)
      : [...f.sucursalIds, id],
  }))
  const t = tipoVisual(form.tipo)
  const externo = form.tipo === 'outsourcing'
  const valido = form.nombre.trim().length > 0 && (!externo || form.motivoContratacion.trim().length > 0)

  /* Solo se guarda lo que no se puede deducir: Jefe y Colaborador salen de la propia
     estructura, así que declararlos sería dejar en el dato una etiqueta que se contradice
     sola en cuanto alguien mueve un cargo de lugar. */
  const guardar = () => onGuardar({
    nombre: form.nombre.trim(),
    unidadId: form.unidadId,
    reportaA: form.reportaA,
    ocupanteId: form.ocupanteId === '' ? null : form.ocupanteId,
    tipo: t.lateral ? form.tipo : null,
    motivoContratacion: externo ? form.motivoContratacion.trim() : null,
    sucursalIds: form.sucursalIds,
  })

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
            <span>Tipo de cargo</span>
            <select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
              {TIPOS_CARGO.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            <p className="og-modal-nota">
              {t.desc}
              {t.lateral
                ? ' — cuelga al costado de su jefe, fuera de la línea de mando.'
                : ' — se deduce solo: el cargo pasa a Jefe en cuanto otro le reporta.'}
            </p>
          </label>

          {externo && (
            <label className="og-field">
              <span>Motivo de contratación</span>
              <input
                value={form.motivoContratacion}
                onChange={e => set('motivoContratacion', e.target.value)}
                placeholder="Ej. Guardia 24/7 de servidores, fuera del horario del equipo"
              />
              <p className="og-modal-nota">
                Por qué el servicio se terceriza en vez de ocupar una plaza interna. Es lo que
                justifica el gasto cuando se revisa la estructura.
              </p>
            </label>
          )}

          <label className="og-field">
            <span>Unidad</span>
            <select value={form.unidadId} onChange={e => set('unidadId', e.target.value)}>
              {org.unidades.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </label>

          {/* Un cargo puede existir en varias sedes a la vez —una gerencia regional es UN
              cargo con dos sedes, no dos cuadros repetidos— así que va como marcas, no como
              una lista desplegable de opción única. */}
          <div className="og-field">
            <span>Sedes donde existe el cargo</span>
            <div className="og-sedes-check">
              {sucursales.map(s => (
                <button
                  key={s.id}
                  type="button"
                  className={`og-sede-check${form.sucursalIds.includes(s.id) ? ' on' : ''}`}
                  onClick={() => alternarSede(s.id)}
                >
                  <MapPin size={11} /> {s.nombre} <em>{s.ciudad}</em>
                </button>
              ))}
            </div>
            {form.sucursalIds.length === 0 && (
              <p className="og-modal-nota">
                Sin ninguna marcada el cargo se considera presente en <strong>todas</strong> las sedes.
              </p>
            )}
          </div>

          <label className="og-field">
            <span>Reporta a</span>
            <select value={form.reportaA ?? ''} onChange={e => set('reportaA', e.target.value || null)}>
              <option value="">— Sin jefe (raíz) —</option>
              {org.cargos.filter(c => c.id !== cargo?.id).map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </label>

          <label className="og-field">
            <span>Ocupante</span>
            <select value={form.ocupanteId ?? ''} onChange={e => set('ocupanteId', e.target.value === '' ? null : Number(e.target.value))}>
              <option value="">{externo ? '— Lo presta el proveedor —' : '— Vacante —'}</option>
              {colaboradoresData.map(p => <option key={p.id} value={p.id}>{p.name} — {p.cargo}</option>)}
            </select>
          </label>

          {/* Un servicio tercerizado sin ocupante es lo normal, no una plaza por cubrir:
              marcarlo como vacante mandaría a RRHH a reclutar para un puesto que no existe. */}
          {form.ocupanteId === null || form.ocupanteId === '' ? (
            <p className="og-modal-nota">
              {externo
                ? <>No se marca como vacante: el trabajo lo cubre un <strong>proveedor externo</strong>.</>
                : <>El cargo quedará marcado como <strong>vacante</strong> en el organigrama.</>}
            </p>
          ) : null}
        </div>

        <div className="og-modal-ft">
          {/* Los subordinados no se borran con él: suben un escalón y quedan colgando de su
              jefe. El aviso lo dice antes de que pase, no después. */}
          {!nuevo && (
            <button className="og-btn-borrar" onClick={() => onEliminar(cargo)}>
              <Trash2 size={13} /> Eliminar
            </button>
          )}
          <button className="og-btn-ghost" onClick={onCerrar}>Cancelar</button>
          <button className="og-btn-primary" disabled={!valido} onClick={guardar}>
            <Check size={14} /> {nuevo ? 'Crear cargo' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Modal: alta y detalle de un área ---------- */

function UnidadModal({ unidad, org, onGuardar, onEliminar, onCerrar }) {
  const nueva = !unidad
  const [form, setForm] = useState(() => ({
    nombre: unidad?.nombre || '',
    corto: unidad?.corto || '',
    padreId: unidad ? unidad.padreId : (org.unidades[0]?.id ?? null),
    color: unidad?.color || COLORES_UNIDAD[0],
  }))

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const valido = form.nombre.trim().length > 0
  const bloqueo = unidad ? bloqueoUnidad(unidad.id, org) : null
  const padres = unidadesPadrePosibles(unidad?.id, org)

  return (
    <div className="og-modal-back" onClick={onCerrar}>
      <div className="og-modal" onClick={e => e.stopPropagation()}>
        <div className="og-modal-hd">
          <h3>{nueva ? 'Nueva área' : 'Detalle del área'}</h3>
          <button onClick={onCerrar}><X size={16} /></button>
        </div>

        <div className="og-modal-body">
          <label className="og-field">
            <span>Nombre del área</span>
            <input
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej. Recursos Humanos"
            />
          </label>

          <label className="og-field">
            <span>Nombre corto</span>
            <input
              value={form.corto}
              onChange={e => set('corto', e.target.value)}
              placeholder="Ej. RRHH"
            />
            <p className="og-modal-nota">
              Es la píldora “Pertenece a” de la tabla, donde el nombre largo no entra. Si lo
              dejás vacío se usa el nombre completo.
            </p>
          </label>

          <label className="og-field">
            <span>Depende de</span>
            <select value={form.padreId ?? ''} onChange={e => set('padreId', e.target.value || null)}>
              <option value="">— Área raíz (cuelga de la empresa) —</option>
              {padres.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </label>

          <div className="og-field">
            <span>Color</span>
            <div className="og-colores">
              {COLORES_UNIDAD.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`og-color${form.color === c ? ' on' : ''}`}
                  style={{ background: c }}
                  onClick={() => set('color', c)}
                  title={c}
                />
              ))}
            </div>
          </div>

          {bloqueo && <p className="og-modal-nota">No se puede eliminar: {bloqueo}</p>}
        </div>

        <div className="og-modal-ft">
          {!nueva && (
            <button className="og-btn-borrar" disabled={!!bloqueo} onClick={() => onEliminar(unidad)}>
              <Trash2 size={13} /> Eliminar
            </button>
          )}
          <button className="og-btn-ghost" onClick={onCerrar}>Cancelar</button>
          <button
            className="og-btn-primary"
            disabled={!valido}
            onClick={() => onGuardar({
              nombre: form.nombre.trim(),
              corto: form.corto.trim() || form.nombre.trim(),
              padreId: form.padreId,
              color: form.color,
            })}
          >
            <Check size={14} /> {nueva ? 'Crear área' : 'Guardar cambios'}
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
            <span>o haz clic para buscarlo — .xlsx o .csv</span>
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

function Seccion({ titulo, conteo }) {
  return (
    <div className="og-seccion">
      <h3>{titulo}</h3>
      <span>{conteo}</span>
    </div>
  )
}

function CargoCard({ fila, onAbrir }) {
  const { cargo, tipo, ocupante, vacante, jefeNombre, sedes } = fila
  const t = tipoVisual(tipo)
  const externo = tipo === 'outsourcing'
  const clases = ['og-cc']
  if (vacante && !externo) clases.push('og-cc-vacante')
  if (t.lateral) clases.push(`og-cc-${t.clase}`)

  return (
    <div className={clases.join(' ')} onDoubleClick={() => onAbrir(cargo)}>
      {externo
        ? <span className="og-cc-tag og-tag-ext">Externo</span>
        : vacante && <span className="og-cc-tag">Vacante</span>}
      <button className="og-cc-edit" onClick={() => onAbrir(cargo)} title="Editar cargo"><Pencil size={12} /></button>

      <div className="og-cc-hd">
        <span className="og-cc-ico"><t.Icon size={17} className={`og-ico-${t.clase}`} /></span>
        <div className="og-cc-hd-txt">
          <strong>{cargo.nombre}</strong>
          <span>{t.label}</span>
        </div>
      </div>

      {jefeNombre && (
        <div className="og-cc-reporta"><ArrowUp size={10} /> Reporta a <strong>{jefeNombre}</strong></div>
      )}

      {/* Un cargo puede existir en más de una sede; sin sedes declaradas está en todas. */}
      <div className="og-cc-sedes">
        <MapPin size={10} />
        {sedes.length === 0
          ? <span>Todas las sedes</span>
          : sedes.map(s => <span key={s.id}>{s.ciudad}</span>)}
      </div>

      <div className="og-cc-sep" />
      {externo && (
        <div className="og-cc-motivo">{cargo.motivoContratacion || 'Sin motivo de contratación registrado'}</div>
      )}
      {ocupante ? (
        <>
          <div className="og-cc-label">1 colaborador asignado</div>
          <div className="og-cc-persona"><Avatar persona={ocupante} size={22} />{ocupante.name}</div>
        </>
      ) : externo ? (
        <div className="og-cc-persona og-cc-persona-ext">Lo cubre un proveedor externo</div>
      ) : (
        <div className="og-cc-persona og-cc-persona-vacia">Sin colaborador asignado</div>
      )}
    </div>
  )
}

function UnidadCard({ datos, onEntrar, onEditar }) {
  const { unidad, cabeza, totalCargos, totalSub } = datos
  return (
    <div className="og-un" onClick={() => onEntrar(unidad.id)}>
      <button
        className="og-un-edit"
        title="Editar área"
        onClick={e => { e.stopPropagation(); onEditar(unidad) }}
      >
        <Pencil size={12} />
      </button>
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

function VistaCards({ org, busca, setBusca, onAbrir, onEditarUnidad }) {
  const [ruta, setRuta] = useState([])

  const actual = ruta.length ? ruta[ruta.length - 1] : null
  const q = busca.trim()

  const resultados = useMemo(() => (q ? buscarCargos(q, org) : []), [q, org])
  const raices = useMemo(() => unidadesRaiz(org).map(u => tarjetaUnidad(u.id, org)), [org])
  const cargosAqui = useMemo(() => (actual ? cargosDeUnidad(actual, org) : []), [actual, org])
  const subsAqui = useMemo(
    () => (actual ? subunidadesDe(actual, org).map(u => tarjetaUnidad(u.id, org)) : []),
    [actual, org],
  )

  const entrar = id => setRuta(r => [...r, id])
  const irA = i => setRuta(r => r.slice(0, i))
  const nombreActual = actual ? getUnidad(actual, org)?.nombre : null

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
              {getUnidad(id, org)?.nombre}
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
            <div className="og-grid">{raices.map(d => <UnidadCard key={d.unidad.id} datos={d} onEntrar={entrar} onEditar={onEditarUnidad} />)}</div>
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
                <div className="og-grid">{subsAqui.map(d => <UnidadCard key={d.unidad.id} datos={d} onEntrar={entrar} onEditar={onEditarUnidad} />)}</div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}

function TipoPill({ tipo }) {
  const t = tipoVisual(tipo)
  return <span className={`og-tipo og-tipo-${t.clase}`} title={t.desc}><t.Icon size={10} /> {t.label}</span>
}

function VistaTabla({ org, busca, setBusca, onAbrir }) {
  const [colapsados, setColapsados] = useState({})
  const grupos = useMemo(() => filasTabla(org), [org])

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
                            <em className="og-td-vacio">
                              {f.tipo === 'outsourcing' ? 'Lo cubre un proveedor externo' : 'Sin colaborador asignado'}
                            </em>
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

/* ---------- Organigrama todavía sin dibujar ---------- */

/* Las sucursales aparecen aquí a propósito: son lo único que ya existe cuando no hay nada
   dibujado, y verlas listadas contesta la pregunta obvia de "¿tengo que cargar las sedes
   otra vez?" antes de que alguien la haga. */
function VacioOrganigrama({ onCrearArea, onImportar, onEjemplo }) {
  return (
    <div className="og-scroll">
      <div className="og-vacio-caja">
        <span className="og-vacio-ico"><Building2 size={30} /></span>
        <h2>Todavía no hay un organigrama</h2>
        <p>
          Empezá por las áreas: cada cargo tiene que pertenecer a una. Después colgás los
          cargos, elegís de quién dependen y quién los ocupa.
        </p>

        <div className="og-vacio-sedes">
          <div className="og-vacio-sedes-hd">
            <MapPin size={12} /> Las sucursales de {empresa.nombre} ya están cargadas
          </div>
          <div className="og-vacio-sedes-lista">
            {sucursales.map(s => (
              <span key={s.id} className="og-vacio-sede">{s.nombre} <em>{s.ciudad}</em></span>
            ))}
          </div>
        </div>

        <div className="og-vacio-acciones">
          <button className="og-btn-primary" onClick={onCrearArea}>
            <FolderPlus size={14} /> Crear la primera área
          </button>
          <button className="og-btn-ghost" onClick={onImportar}>
            <Download size={14} /> Importar desde Excel
          </button>
          <button className="og-btn-ghost" onClick={onEjemplo}>
            <Database size={14} /> Cargar datos de ejemplo
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Pantalla ---------- */

export default function Organigrama() {
  /* La estructura vive en el contexto de la demo, no en la pantalla: así se persiste, la
     borra "Resetear demo" y la siembra "Cargar datos de ejemplo", igual que las rutas o los
     documentos. Es la estructura completa ({ unidades, cargos, relaciones }) porque es lo
     que esperan todas las funciones de `organigramaData`. */
  const { organigrama: org, setOrganigrama: setOrg, loadSampleData } = useOnboardingData()
  const [vista, setVista] = useState('grafico')
  const [pestana, setPestana] = useState('completo')
  const [sedeId, setSedeId] = useState(TODAS_SUCURSALES)
  const [sedeAbierta, setSedeAbierta] = useState(false)
  const [busca, setBusca] = useState('')
  const [importar, setImportar] = useState(false)
  const [editando, setEditando] = useState(null)      // { cargo } | { cargo: null } para alta
  const [editandoUnidad, setEditandoUnidad] = useState(null) // { unidad } | { unidad: null }

  /* Las vistas leen la estructura recortada a la sede; los modales, la completa: al elegir
     jefe o área hay que poder apuntar a algo que el filtro dejó fuera de pantalla. */
  const orgVisible = useMemo(() => filtrarPorSucursal(org, sedeId), [org, sedeId])
  const tree = useMemo(() => buildOrgTree(pestana, orgVisible), [pestana, orgVisible])

  const sede = sucursales.find(s => s.id === sedeId)
  const vacio = org.unidades.length === 0

  const guardar = form => {
    setOrg(prev => ({
      ...prev,
      cargos: editando.cargo
        ? prev.cargos.map(c => (c.id === editando.cargo.id ? { ...c, ...form } : c))
        : [...prev.cargos, { id: nuevoId('cargo', prev.cargos), ...form }],
    }))
    setEditando(null)
  }

  const borrarCargo = cargo => {
    setOrg(prev => eliminarCargo(cargo.id, prev))
    setEditando(null)
  }

  const guardarUnidad = form => {
    setOrg(prev => ({
      ...prev,
      unidades: editandoUnidad.unidad
        ? prev.unidades.map(u => (u.id === editandoUnidad.unidad.id ? { ...u, ...form } : u))
        : [...prev.unidades, { id: nuevoId('area', prev.unidades), ...form }],
    }))
    setEditandoUnidad(null)
  }

  const borrarUnidad = unidad => {
    setOrg(prev => eliminarUnidad(unidad.id, prev))
    setEditandoUnidad(null)
  }

  return (
    <div className="og-page">
      {/* BARRA SUPERIOR */}
      <div className="og-topbar">
        <span className="og-empresa-nombre">{empresa.nombre}</span>

        {/* "Todas las sucursales" es la opción por defecto: una empresa con varias sedes casi
            siempre quiere ver la estructura entera, y entrar a una sede es la excepción. */}
        <div className="og-sede">
          <button className="og-sede-btn" onClick={() => setSedeAbierta(v => !v)}>
            {sede ? sede.nombre : 'Todas las sucursales'}
            <span className="og-sede-chip">
              {sede ? sede.ciudad : `${sucursales.length} sedes`}
            </span>
            <ChevronDown size={14} />
          </button>
          {sedeAbierta && (
            <div className="og-sede-menu">
              <button
                className={sedeId === TODAS_SUCURSALES ? 'on' : ''}
                onClick={() => { setSedeId(TODAS_SUCURSALES); setSedeAbierta(false) }}
              >
                Todas las sucursales <span>{sucursales.length} sedes</span>
              </button>
              {sucursales.map(s => (
                <button
                  key={s.id}
                  className={sedeId === s.id ? 'on' : ''}
                  onClick={() => { setSedeId(s.id); setSedeAbierta(false) }}
                >
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
      {vista === 'grafico' && !vacio && (
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
      {vacio ? (
        <VacioOrganigrama
          onCrearArea={() => setEditandoUnidad({ unidad: null })}
          onImportar={() => setImportar(true)}
          onEjemplo={loadSampleData}
        />
      ) : (
        <>
          {vista === 'grafico' && (
            <OrgGrafico tree={tree} onAbrirCargo={nodo => setEditando({ cargo: nodo.cargo })} />
          )}
          {vista === 'cards' && (
            <VistaCards
              org={orgVisible}
              busca={busca}
              setBusca={setBusca}
              onAbrir={c => setEditando({ cargo: c })}
              onEditarUnidad={u => setEditandoUnidad({ unidad: u })}
            />
          )}
          {vista === 'tabla' && (
            <div className="og-scroll">
              <VistaTabla org={orgVisible} busca={busca} setBusca={setBusca} onAbrir={c => setEditando({ cargo: c })} />
            </div>
          )}

          <div className="og-fabs">
            <button className="og-fab og-fab-sec" onClick={() => setEditandoUnidad({ unidad: null })} title="Agregar área">
              <FolderPlus size={18} />
            </button>
            <button className="og-fab" onClick={() => setEditando({ cargo: null })} title="Agregar cargo">
              <Plus size={20} />
            </button>
          </div>
        </>
      )}

      {importar && <ImportarModal onCerrar={() => setImportar(false)} />}
      {editando && (
        <CargoModal
          cargo={editando.cargo}
          org={org}
          onGuardar={guardar}
          onEliminar={borrarCargo}
          onCerrar={() => setEditando(null)}
        />
      )}
      {editandoUnidad && (
        <UnidadModal
          unidad={editandoUnidad.unidad}
          org={org}
          onGuardar={guardarUnidad}
          onEliminar={borrarUnidad}
          onCerrar={() => setEditandoUnidad(null)}
        />
      )}
    </div>
  )
}
