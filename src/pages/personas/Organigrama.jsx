import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import {
  Download, Network, LayoutGrid, Table2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  X, Building2, UploadCloud, FileSpreadsheet, Check, User, Search, Pencil, Star, Users,
  Minus, Plus, ArrowUp, Briefcase, MapPin, Trash2, FolderPlus, Printer, Image, FileCode2,
  ClipboardList,
} from 'lucide-react'
import OrgGrafico from '../../components/personas/OrgGrafico'
import CabeceraModal from '../../components/personas/CabeceraModal'
import PreviaPuesto from '../../components/personas/PreviaPuesto'
import PreviaUnidad from '../../components/personas/PreviaUnidad'
import AyudaCampo from '../../components/personas/AyudaCampo'
import SelectorLista from '../../components/personas/SelectorLista'
import { exportarPNG, exportarSVG, imprimir } from '../../components/personas/exportarOrganigrama'
import { colaboradoresData } from './colaboradoresData'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import {
  empresa, sucursales, getUnidad, nuevoId, tipoDe, TIPOS_CARGO,
  buildOrgTree, filasTabla, buscarCargos, unidadesRaiz, subunidadesDe,
  tarjetaUnidad, cargosDeUnidad, filtrarPorSucursal, TODAS_SUCURSALES,
  eliminarCargo, eliminarUnidad, bloqueoUnidad, unidadesPadrePosibles, cabezaDe, paresDe, moverEntrePares,
  ocupantesDe,
  coordinacionesDe,
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

/* Lo que sí se elige del tipo de puesto. Jefe queda fuera a propósito: `tipoDe` lo deduce de
   tener gente a cargo, así que ofrecerlo en el formulario sería una opción que al guardar no
   cambia nada. Los subtítulos hablan en el idioma del contrato —planilla, servicios,
   prestador de servicios— porque es como lo nombra RRHH al dar de alta. */
const TIPOS_PUESTO = [
  { key: 'colaborador', label: 'Colaborador', sub: 'En planilla, baja en la línea', Icon: User },
  { key: 'staff', label: 'Staff', sub: 'Asiste al costado de la línea', Icon: Users },
  { key: 'outsourcing', label: 'Outsourcing', sub: 'Lo cubre un prestador externo', Icon: Briefcase },
]

/* El formulario del puesto va en pestañas, como en el diseño: son cuatro preguntas de
   naturaleza distinta y verlas todas de una vez es lo que lo hacía pesado. Solo hay pestañas
   para lo que el modelo sabe contestar: "Perfil" y "Laboral" del diseño quedan fuera hasta
   que exista el dato detrás, porque una pestaña vacía promete algo que no está. */
const PESTANAS_CARGO = [
  { key: 'basico', label: 'Básico', Icon: ClipboardList },
  { key: 'donde', label: 'Localización', Icon: MapPin },
  { key: 'gente', label: 'Colaboradores', Icon: Users },
]

/* A partir de cuántas sedes el campo deja de leerse de un vistazo y necesita buscador. */
const SEDES_CON_BUSCADOR = 6

const VISTAS = [
  { key: 'grafico', label: 'Gráfico', icon: Network },
  { key: 'cards', label: 'Cards', icon: LayoutGrid },
  { key: 'tabla', label: 'Tabla', icon: Table2 },
]

/* Colores de marca sugeridos. Son de arranque: al lado hay un selector libre, porque ninguna
   paleta de diez adivina el azul exacto de una empresa. */
const COLORES_MARCA = [
  '#0C2D40', '#1e3a8a', '#0f766e', '#166534', '#7c2d12',
  '#831843', '#4c1d95', '#334155', '#b45309', '#991b1b',
]

const PESTANAS = [
  { key: 'completo', label: 'Organigrama completo', hint: 'Muestra unidades y cargos juntos' },
  { key: 'cargos', label: 'Ver por cargos', hint: 'Solo la línea de mando' },
  { key: 'unidades', label: 'Ver por unidades', hint: 'Solo la estructura de unidades' },
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

/* `base` son los valores que el gesto ya decidió: al soltar una cajita sobre un cuadro, de
   quién depende y en qué unidad queda ya están dichos, y volver a preguntarlos sería deshacer
   con el formulario lo que se acaba de hacer con la mano. */
function CargoModal({ cargo, base, sedeActiva, onGuardar, onEliminar, onCerrar, org }) {
  const nuevo = !cargo
  /* Lo que había al abrir. Sirve para saber si se escribió algo y no cerrar el formulario de un
     clic al costado: perder seis campos por errarle al modal por veinte píxeles no es un
     accidente del usuario, es un descuido del diseño. */
  const inicial = useRef(null)
  const [hoja, setHoja] = useState('basico')
  const [form, setForm] = useState(() => ({
    codigo: cargo?.codigo || '',
    nombre: cargo?.nombre || '',
    /* Los valores por defecto salen de la estructura que hay, no de ids sembrados: en un
       organigrama recién empezado no existe ni 'gg' ni una unidad en la segunda posición. */
    unidadId: cargo?.unidadId || base?.unidadId || org.unidades[0]?.id || '',
    reportaA: cargo ? cargo.reportaA
      : base && 'reportaA' in base ? base.reportaA
      : (org.cargos[0]?.id ?? null),
    ocupantes: cargo ? ocupantesDe(cargo) : [],
    /* El tipo que se muestra es el que ve el resto de la pantalla: para un cargo con gente
       debajo, `tipoDe` devuelve 'jefe' aunque el cargo no lo declare. */
    tipo: cargo ? tipoDe(cargo, org) : (base?.tipo || 'colaborador'),
    /* Si se está mirando una sede concreta, el puesto nuevo nace en esa sede y no en las
       tres. Es la respuesta a "¿para qué sucursal estoy creando?": para la que se está
       viendo, y el formulario lo deja dicho y modificable en vez de suponerlo en silencio. */
    sucursalIds: cargo?.sucursalIds || (sedeActiva ? [sedeActiva.id] : sucursales.map(s => s.id)),
    /* El lugar que ocupa entre los cargos que se dibujan en su misma fila. No es un campo del
       cargo —el orden es el de la lista— pero se edita acá y se guarda con el resto: mover un
       cuadro y que el cambio quede a medias entre "ya pasó" y "hay que guardar" sería la peor
       de las dos cosas. */
    posicion: cargo ? paresDe(cargo, org).findIndex(c => c.id === cargo.id) : -1,
  }))

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const alternarSede = id => setForm(f => ({
    ...f,
    sucursalIds: f.sucursalIds.includes(id)
      ? f.sucursalIds.filter(x => x !== id)
      : [...f.sucursalIds, id],
  }))

  /* "En todas" no es un modo aparte sino un valor: ninguna sede declarada. Así lo lee el resto
     del sistema (`estaEnSucursal`) y así se guarda, que además es lo correcto a futuro —una
     sede nueva entra sola en los puestos que existen en todas, y no en los que enumeran tres—. */
  const [buscaSede, setBuscaSede] = useState('')
  const [dropSedes, setDropSedes] = useState(false)
  const cajaSedes = useRef(null)
  const sedesFiltradas = sucursales.filter(s =>
    `${s.nombre} ${s.ciudad}`.toLowerCase().includes(buscaSede.trim().toLowerCase()))
  const enTodasLasSedes = form.sucursalIds.length === 0
    || form.sucursalIds.length === sucursales.length
  useEffect(() => {
    if (!dropSedes) return
    const fuera = e => { if (cajaSedes.current && !cajaSedes.current.contains(e.target)) setDropSedes(false) }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [dropSedes])
  const coordinaciones = cargo ? coordinacionesDe(cargo.id, org) : []
  const ocupantes = form.ocupantes
    .map(id => colaboradoresData.find(pe => pe.id === id))
    .filter(Boolean)
  const t = tipoVisual(form.tipo)
  const externo = form.tipo === 'outsourcing'
  const valido = form.nombre.trim().length > 0 && !!form.unidadId

  /* Solo se guarda lo que no se puede deducir: Jefe y Colaborador salen de la propia
     estructura, así que declararlos sería dejar en el dato una etiqueta que se contradice
     sola en cuanto alguien mueve un cargo de lugar. */
  /* El clic en el fondo cierra solo si no se tocó nada. Es el punto medio entre cerrarse de
     un roce —y perder lo escrito— y obligar a apuntarle a la X aunque el formulario esté
     intacto. */
  if (inicial.current === null) inicial.current = JSON.stringify(form)
  const sucio = JSON.stringify(form) !== inicial.current
  const intentarCerrar = () => { if (!sucio) onCerrar() }

  /* Reordenar solo tiene sentido mientras el cargo siga entre los mismos pares: si en esta
     misma edición se le cambió el jefe o dejó de ser lateral, la fila donde estaba ya no es la
     suya y "3.º de 5" hablaría de un lugar que no existe. */
  const pares = cargo ? paresDe(cargo, org) : []
  const mismaFila = !nuevo
    && form.reportaA === cargo.reportaA
    && t.lateral === (cargo.tipo === 'staff' || cargo.tipo === 'outsourcing')

  const guardar = () => onGuardar({
    codigo: form.codigo.trim() || null,
    nombre: form.nombre.trim(),
    unidadId: form.unidadId,
    reportaA: form.reportaA,
    ocupantes: form.ocupantes,
    /* El campo viejo se limpia para que no queden dos verdades sobre quién ocupa el puesto. */
    ocupanteId: null,
    tipo: t.lateral ? form.tipo : null,
    sucursalIds: form.sucursalIds,
  }, mismaFila ? form.posicion : null)

  return (
    <div className="pl-overlay" onClick={intentarCerrar}>
      <div className="pl-modal og-modal-puesto" onClick={e => e.stopPropagation()}>
        <CabeceraModal
          Icon={nuevo ? Plus : User}
          titulo={nuevo ? 'Nuevo cargo / puesto' : 'Detalle del cargo / puesto'}
          onCerrar={onCerrar}
        />

        {/* Dos columnas: el dibujo a la izquierda y los campos a la derecha, cada una con su
            propio scroll. El dibujo no se va de la pantalla al bajar hasta el ocupante —que es
            justo cuando cambia— ni empuja los campos hacia abajo. */}
        <div className="og-puesto-cuerpo">
          <PreviaPuesto
            form={form}
            org={org}
            cargoId={cargo?.id}
            ocupantes={ocupantes}
            nuevo={nuevo}
          />

          <div className="og-hojas-col">
            <div className="og-hojas">
              {PESTANAS_CARGO.map(h => (
                <button
                  key={h.key}
                  type="button"
                  className={`og-hoja${hoja === h.key ? ' on' : ''}`}
                  onClick={() => setHoja(h.key)}
                >
                  <h.Icon size={13} /> {h.label}
                  {/* El punto avisa dónde falta algo obligatorio: sin esto, con el botón de
                      guardar apagado y la pestaña equivocada abierta, no hay forma de saber
                      qué falta. */}
                  {h.key === 'basico' && !valido && <span className="og-hoja-falta" />}
                </button>
              ))}
            </div>

          <div className="pl-modal-body og-cargo-campos">
            {hoja === 'basico' && (
            <>
            <section className="og-bloque">
              <h4 className="og-bloque-hd">Datos básicos</h4>

              <label className="pl-label">
                <span className="og-label-fila">
                  Código
                  <AyudaCampo>
                    El identificador del puesto en planilla o en los reportes de RRHH. Es
                    opcional: si la empresa no los usa, se deja vacío.
                  </AyudaCampo>
                </span>
                <input
                  className="pl-input"
                  value={form.codigo}
                  maxLength={20}
                  onChange={e => set('codigo', e.target.value)}
                  placeholder="Ej. CAR-001"
                />
              </label>

              <label className="pl-label">
                <span className="og-label-fila">
                  Nombre del puesto <em className="og-req">*</em>
                  <AyudaCampo>El título del cargo, no el nombre de quien lo ocupa.</AyudaCampo>
                  <span className="og-contador">{form.nombre.length}/60</span>
                </span>
                <input
                  className="pl-input"
                  value={form.nombre}
                  maxLength={60}
                  onChange={e => set('nombre', e.target.value)}
                  placeholder="Ej. Analista de Marketing Digital"
                  autoFocus={nuevo}
                />
              </label>

              <label className="pl-label">
                <span className="og-label-fila">
                  Unidad organizacional <em className="og-req">*</em>
                  <AyudaCampo>Área, gerencia o departamento al que pertenece el puesto.</AyudaCampo>
                </span>
                <SelectorLista
                  valor={form.unidadId}
                  onCambio={v => set('unidadId', v)}
                  placeholder="Elige la unidad"
                  opciones={org.unidades.map(u => ({
                    id: u.id,
                    nombre: u.nombre,
                    detalle: getUnidad(u.padreId, org)?.nombre,
                  }))}
                />
              </label>
            </section>

            <section className="og-bloque">
              <h4 className="og-bloque-hd">Relación y jerarquía</h4>

              <label className="pl-label">
                <span className="og-label-fila">
                  Reporta a
                  <AyudaCampo>El cargo al que le responde este puesto. De acá sale la línea de mando: quién aprueba y a quién le llega la bandeja.</AyudaCampo>
                </span>
                <SelectorLista
                  valor={form.reportaA}
                  onCambio={v => set('reportaA', v)}
                  vacia="Sin jefe: queda como raíz"
                  opciones={org.cargos.filter(c => c.id !== cargo?.id).map(c => ({
                    id: c.id,
                    nombre: c.nombre,
                    detalle: getUnidad(c.unidadId, org)?.nombre,
                  }))}
                />
              </label>

              {/* Dónde queda dentro de su fila. Es lo único del dibujo que se puede acomodar a
                  mano, y por eso vive acá y no en un gesto del lienzo: no es una posición
                  libre, es el orden entre iguales, que sí significa algo. */}
              {mismaFila && pares.length > 1 && (
                <div className="pl-label">
                  <span className="og-label-fila">
                    Orden entre sus pares
                    <AyudaCampo>
                      Mueve el cuadro dentro de su propia fila, sin cambiar de quién depende.
                      {t.lateral
                        ? ' En los laterales el orden decide de qué lado del jefe cae cada uno.'
                        : ' Entre los reportes de un mismo jefe, quién va antes y quién después.'}
                    </AyudaCampo>
                  </span>
                  <div className="og-orden">
                    <button
                      type="button"
                      disabled={form.posicion <= 0}
                      onClick={() => set('posicion', form.posicion - 1)}
                      title="Un lugar antes"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="og-orden-txt">
                      <strong>{form.posicion + 1}.º</strong> de {pares.length}
                    </span>
                    <button
                      type="button"
                      disabled={form.posicion >= pares.length - 1}
                      onClick={() => set('posicion', form.posicion + 1)}
                      title="Un lugar después"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Tres tarjetas y no un desplegable: son tres cosas distintas —una en planilla,
                  una al costado de la línea, una que presta un tercero— y en un `select` se leen
                  como tres palabras hasta que alguien las abre una por una. Jefe no está entre
                  ellas a propósito: no se elige, se deduce de tener gente a cargo, y ofrecerlo
                  sería una opción que no hace nada al guardar. */}
              <div className="pl-label">
                <span className="og-label-fila">Tipo de puesto <em className="og-req">*</em></span>
                <div className="og-tipo-cards">
                  {TIPOS_PUESTO.map(o => {
                    const activa = o.key === form.tipo || (o.key === 'colaborador' && form.tipo === 'jefe')
                    return (
                      <button
                        key={o.key}
                        type="button"
                        className={`og-tipo-card og-tipo-card-${o.key}${activa ? ' on' : ''}`}
                        onClick={() => set('tipo', o.key)}
                      >
                        <span className="og-tipo-card-hd">
                          <o.Icon size={12} /> {o.label}
                          {/* La muestra dice de qué color va a salir el cuadro ANTES de
                              marcarlo, con los mismos colores de la leyenda del dibujo. */}
                          <span className={`og-tipo-muestra og-tipo-muestra-${o.key}`} />
                        </span>
                        <em>{o.sub}</em>
                      </button>
                    )
                  })}
                </div>
                {form.tipo === 'jefe' && (
                  <p className="og-modal-nota">
                    Ya tiene gente a cargo, así que en el organigrama figura como <strong>Jefe</strong>.
                    Es lo mismo que un puesto interno: la jefatura se deduce sola.
                  </p>
                )}
              </div>
            </section>

            </>
            )}

            {hoja === 'donde' && (
            <section className="og-bloque">
              <h4 className="og-bloque-hd">Dónde existe el puesto</h4>

                {/* Un puesto puede existir en varias sedes a la vez —una gerencia regional es UN
                  cargo con dos sedes, no dos cuadros repetidos—, así que se marcan varias.

                  Un solo campo y no dos pestañas. Antes se contestaba primero "¿en todas?" y
                  recién ahí aparecía la lista: tres controles apilados —pestañas, cuenta,
                  desplegable— para una pregunta que se contesta con uno. "Todas las sedes" es la
                  primera opción de la misma lista, que además es lo que significa en el dato:
                  ninguna declarada = está en todas, incluidas las que se abran después. */}
              <div className="pl-label">
                <span className="og-label-fila">
                  Sedes donde existe el puesto
                  <AyudaCampo>
                    El organigrama es uno solo: lo que cambia por sede es en cuáles existe cada
                    puesto. Una gerencia regional es <strong>un</strong> cargo con dos sedes, no
                    dos cuadros repetidos.
                  </AyudaCampo>
                </span>

                <div className="pl-dropdown-wrap" ref={cajaSedes}>
                  <button
                    type="button"
                    className={`pl-dropdown-trigger og-sedes-trigger${dropSedes ? ' open' : ''}`}
                    onClick={() => setDropSedes(abierto => !abierto)}
                    aria-expanded={dropSedes}
                  >
                    <span className="og-sedes-resumen">
                      {enTodasLasSedes ? (
                        <><Building2 size={13} /> Todas las sedes</>
                      ) : (
                        <>
                          <MapPin size={13} />
                          {sucursales.filter(s => form.sucursalIds.includes(s.id)).slice(0, 2).map(s => s.ciudad).join(', ')}
                          {form.sucursalIds.length > 2 && ` +${form.sucursalIds.length - 2}`}
                        </>
                      )}
                    </span>
                    <ChevronDown size={14} className="pl-dropdown-chevron" />
                  </button>

                  {dropSedes && (
                    <div className="pl-dropdown-menu og-sedes-menu">
                      {sucursales.length > SEDES_CON_BUSCADOR && (
                        <div className="pl-search-wrap og-sedes-search">
                          <Search size={13} className="pl-search-ico" />
                          <input
                            className="pl-search"
                            value={buscaSede}
                            onChange={e => setBuscaSede(e.target.value)}
                            placeholder="Buscar por sede o ciudad"
                            autoFocus
                          />
                        </div>
                      )}
                      <div className="og-sedes-check">
                        {/* "Todas" no es una sede más: es la regla que las abarca, así que va
                            primera, separada, y al elegirla se limpia lo marcado. */}
                        <button
                          type="button"
                          className={`og-sede-check og-sede-todas${enTodasLasSedes ? ' on' : ''}`}
                          onClick={() => set('sucursalIds', [])}
                        >
                          <span className="og-sede-tick">{enTodasLasSedes && <Check size={11} />}</span>
                          <span className="og-sede-txt">
                            <span className="og-sede-nom">Todas las sedes</span>
                            <em>Incluye las que se abran más adelante</em>
                          </span>
                        </button>

                        {sedesFiltradas.map(sc => {
                          const marcada = form.sucursalIds.includes(sc.id)
                          return (
                            <button
                              key={sc.id}
                              type="button"
                              className={`og-sede-check${marcada ? ' on' : ''}`}
                              onClick={() => alternarSede(sc.id)}
                            >
                              <span className="og-sede-tick">{marcada && <Check size={11} />}</span>
                              <span className="og-sede-txt">
                                <span className="og-sede-nom">{sc.nombre}</span>
                                <em>{sc.ciudad}</em>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      {sedesFiltradas.length === 0 && (
                        <p className="og-sedes-vacio">Ninguna sede coincide con “{buscaSede.trim()}”.</p>
                      )}
                    </div>
                  )}
                </div>

                {nuevo && sedeActiva && form.sucursalIds.length === 1
                  && form.sucursalIds[0] === sedeActiva.id && (
                  <p className="og-modal-nota">
                    Viene elegida <strong>{sedeActiva.ciudad}</strong> porque es la sede que estás viendo.
                  </p>
                )}
              </div>
            </section>

            )}

            {hoja === 'gente' && (
            <section className="og-bloque">
              <h4 className="og-bloque-hd">Quién lo ocupa</h4>

              <div className="pl-label">
                <span className="og-label-fila">
                  Quiénes lo ocupan
                  <AyudaCampo>
                    Se pueden marcar <strong>varias personas</strong> en un mismo puesto: tres
                    ejecutivas comerciales son un cargo con tres ocupantes, no tres cuadros. Sin
                    nadie, el puesto sale como vacante en el dibujo.
                  </AyudaCampo>
                  <span className="og-contador">
                    {form.ocupantes.length === 1 ? '1 persona' : `${form.ocupantes.length} personas`}
                  </span>
                </span>
                <SelectorLista
                  multiple
                  valores={form.ocupantes}
                  onCambio={v => set('ocupantes', v)}
                  vacia={externo ? 'Sin prestador asignado' : 'Nadie asignado todavía'}
                  opciones={colaboradoresData.map(pe => ({ id: pe.id, nombre: pe.name, detalle: pe.cargo }))}
                />
              </div>

              {/* Las coordinaciones no se editan aquí —se trazan sobre el lienzo— pero sí se
                  muestran: son la otra mitad de con quién trabaja el puesto. */}
              {!nuevo && coordinaciones.length > 0 && (
                <div className="pl-label">
                  <span className="og-label-fila">
                    Coordina con <span className="og-coord-count">{coordinaciones.length}</span>
                    <AyudaCampo>
                      Coordinan trabajo sin ser línea de mando: no cambian de quién depende el
                      puesto. Se trazan sobre el lienzo, no acá.
                    </AyudaCampo>
                  </span>
                  {coordinaciones.map(c => (
                    <div key={c.id} className="og-coord-fila">
                      <span className={`og-coord-rol og-coord-${c.rol}`}>
                        {c.rol === 'par' ? 'Par' : c.rol === 'supervisor' ? 'Supervisa' : 'Lo supervisa'}
                      </span>
                      <span className="og-coord-cargo">{c.contraparte.nombre}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
            )}
          </div>
          </div>
        </div>

        <div className="pl-modal-footer">
          {/* Los subordinados no se borran con él: suben un escalón y quedan colgando de su
              jefe. El aviso lo dice antes de que pase, no después. */}
          {!nuevo && (
            <button className="pl-btn-delete" onClick={() => onEliminar(cargo)}>
              <Trash2 size={13} /> Eliminar
            </button>
          )}
          <button className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
          <button className="pl-btn-save" disabled={!valido} onClick={guardar}>
            {nuevo ? 'Crear cargo / puesto' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* Qué se lleva puesto cambiar de quién depende una unidad. Devuelve null cuando no arrastra
   nada, y entonces no se dice nada: avisar de un cambio que no ocurre entrena a ignorar los
   avisos. Ver la misma idea en el resto del constructor. */
function avisoDeMudanza(unidad, nuevoPadreId, org) {
  if (!unidad || nuevoPadreId === unidad.padreId) return null
  const cabeza = cabezaDe(unidad.id, org)
  if (!cabeza) return `Al guardar, ${unidad.nombre} se mueve de lugar. Todavía no tiene cargos, así que no le cambia el jefe a nadie.`
  if (!nuevoPadreId) return `Al guardar, ${cabeza.nombre} deja de tener jefe y ${unidad.nombre} pasa a colgar de la empresa.`
  const nueva = cabezaDe(nuevoPadreId, org)
  const nombrePadre = getUnidad(nuevoPadreId, org)?.nombre ?? 'la unidad elegida'
  if (!nueva) return `${nombrePadre} todavía no tiene ningún cargo, así que ${cabeza.nombre} se queda con el jefe que tiene y el gráfico no cambia.`
  if (nueva.id === cabeza.reportaA) return null
  return `Al guardar, ${cabeza.nombre} pasa a reportar a ${nueva.nombre}.`
}

/* ---------- Modal: alta y detalle de una unidad organizacional ---------- */

function UnidadModal({ unidad, base, org, onGuardar, onEliminar, onCerrar }) {
  const nueva = !unidad
  const [form, setForm] = useState(() => ({
    codigo: unidad?.codigo || '',
    nombre: unidad?.nombre || '',
    corto: unidad?.corto || '',
    padreId: unidad ? unidad.padreId
      : base && 'padreId' in base ? base.padreId
      : (org.unidades[0]?.id ?? null),
  }))

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const valido = form.nombre.trim().length > 0
  const inicial = useRef(null)
  if (inicial.current === null) inicial.current = JSON.stringify(form)
  const intentarCerrar = () => { if (JSON.stringify(form) === inicial.current) onCerrar() }
  const bloqueo = unidad ? bloqueoUnidad(unidad.id, org) : null
  const padres = unidadesPadrePosibles(unidad?.id, org)
  const mudanza = avisoDeMudanza(unidad, form.padreId, org)

  /* Un desplegable plano con veinte unidades no dice dónde queda la que se está colocando:
     "Marketing Digital" y "Marketing" se leen como hermanas cuando una está dentro de la otra.
     Las opciones salen en orden de árbol y sangradas, así el propio desplegable dibuja la
     jerarquía. */
  const opciones = []
  const permitidas = new Set(padres.map(u => u.id))
  const recorrer = (padreId, nivel) => {
    for (const u of org.unidades.filter(x => x.padreId === padreId)) {
      if (permitidas.has(u.id)) opciones.push({ u, nivel })
      recorrer(u.id, nivel + 1)
    }
  }
  recorrer(null, 0)


  return (
    <div className="pl-overlay" onClick={intentarCerrar}>
      <div className="pl-modal og-modal-puesto" onClick={e => e.stopPropagation()}>
        <CabeceraModal
          Icon={nueva ? FolderPlus : Building2}
          titulo={nueva ? 'Nueva unidad organizacional' : 'Detalle de la unidad'}
          onCerrar={onCerrar}
        />

        {/* La misma forma que el detalle de un cargo: el dibujo a la izquierda y los campos a
            la derecha. Antes el costado contaba con texto sangrado dónde iba a quedar la
            unidad —"SoulyHR › esta unidad"—, que es justo lo que un organigrama existe para
            no tener que hacer. */}
        <div className="og-puesto-cuerpo">
          <PreviaUnidad form={form} org={org} unidad={unidad} nueva={nueva} empresa={empresa} />

          <div className="pl-modal-body og-unidad-campos">
          <label className="pl-label">
            <span className="og-label-fila">
              Código
              <AyudaCampo>
                El identificador del área en los reportes de RRHH. Es opcional: si la empresa no
                los usa, se deja vacío.
              </AyudaCampo>
            </span>
            <input
              className="pl-input"
              value={form.codigo}
              maxLength={20}
              onChange={e => set('codigo', e.target.value)}
              placeholder="Ej. COD-001"
            />
          </label>

          <label className="pl-label">
            Nombre de la unidad
            <input
              className="pl-input"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej. Recursos Humanos"
            />
          </label>

          <label className="pl-label">
            <span className="og-label-fila">
              Nombre corto
              <AyudaCampo>
                Es la píldora “Pertenece a” de la tabla, donde el nombre largo no entra. Si lo
                dejas vacío se usa el nombre completo.
              </AyudaCampo>
            </span>
            <input
              className="pl-input"
              value={form.corto}
              onChange={e => set('corto', e.target.value)}
              placeholder="Ej. RRHH"
            />
          </label>

          <div className="pl-label">
            <span className="og-label-fila">
              Dentro de
              <AyudaCampo>
                En qué unidad está esta. Es contención, no mando: una unidad no le reporta a otra,
                está adentro. Quien reporta es el <strong>cargo</strong>, y eso se define en su
                propio formulario.
              </AyudaCampo>
            </span>
            <SelectorLista
              valor={form.padreId}
              onCambio={v => set('padreId', v)}
              vacia={`Ninguna: cuelga de ${empresa.nombre}`}
              opciones={opciones.map(({ u, nivel }) => ({ id: u.id, nombre: u.nombre, nivel }))}
            />

            {/* El organigrama tiene dos jerarquías: la de cargos y la de unidades. El dibujo
                principal se arma con la de cargos, así que mover una unidad de madre sin tocar
                a nadie más la movía solo en la pestaña "Ver por unidades" y en el gráfico se
                quedaba donde estaba. Se arrastra la cabeza —y se dice acá, antes de guardar,
                a quién le cambia el jefe. */}
            {mudanza && <p className="og-field-nota">{mudanza}</p>}
          </div>
          </div>


        </div>

        <div className="pl-modal-footer">
          {!nueva && (
            <button className="pl-btn-delete" disabled={!!bloqueo} onClick={() => onEliminar(unidad)}>
              <Trash2 size={13} /> Eliminar
            </button>
          )}
          <button className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
          <button
            className="pl-btn-save"
            disabled={!valido}
            onClick={() => onGuardar({
              codigo: form.codigo.trim() || null,
              nombre: form.nombre.trim(),
              corto: form.corto.trim() || form.nombre.trim(),
              padreId: form.padreId,
            })}
          >
            {nueva ? 'Crear unidad' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Modal: importar desde Excel ---------- */

function ImportarModal({ onCerrar }) {
  return (
    <div className="pl-overlay" onClick={onCerrar}>
      <div className="pl-modal" onClick={e => e.stopPropagation()}>
        <CabeceraModal Icon={FileSpreadsheet} titulo="Importar organigrama desde Excel" onCerrar={onCerrar} />
        <div className="pl-modal-body">
          <div className="og-drop">
            <UploadCloud size={26} />
            <strong>Arrastra tu archivo aquí</strong>
            <span>o haz clic para buscarlo — .xlsx o .csv</span>
          </div>
          <button className="pl-btn-cancel" style={{ width: '100%', justifyContent: 'center' }}>
            <FileSpreadsheet size={14} /> Descargar plantilla de ejemplo
          </button>
          <p className="og-modal-nota">
            La plantilla espera una fila por cargo con las columnas <strong>Cargo</strong>, <strong>Unidad</strong>,
            <strong> Reporta a</strong> y <strong>Ocupante</strong>. Las filas sin ocupante se cargan como vacantes.
          </p>
        </div>
        <div className="pl-modal-footer">
          <button className="pl-btn-cancel" onClick={onCerrar}>Cerrar</button>
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
  const { cargo, tipo, ocupantes, vacante, jefeNombre, sedes } = fila
  const t = tipoVisual(tipo)
  const externo = tipo === 'outsourcing'
  const clases = ['og-cc']
  /* Mismo reparto que en el árbol: el color es el tipo de puesto y la etiqueta es la vacante.
     El amarillo solo entra donde no hay color de tipo que pisar. */
  if (vacante && !t.lateral) clases.push('og-cc-vacante')
  if (t.lateral) clases.push(`og-cc-${t.clase}`)

  return (
    <div className={clases.join(' ')} onDoubleClick={() => onAbrir(cargo)}>
      {vacante && <span className="og-cc-tag">Vacante</span>}
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
      {ocupantes.length ? (
        <>
          <div className="og-cc-label">
            {ocupantes.length === 1
              ? '1 colaborador asignado'
              : `${ocupantes.length} colaboradores asignados`}
          </div>
          {/* La ficha sí tiene lugar para la lista entera: es la pantalla a la que uno viene
              justamente a ver quiénes ocupan el puesto. */}
          {ocupantes.map(p => (
            <div key={p.id} className="og-cc-persona"><Avatar persona={p} size={22} />{p.name}</div>
          ))}
        </>
      ) : externo ? (
        <div className="og-cc-persona og-cc-persona-vacia">Sin prestador asignado</div>
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
        title="Editar unidad organizacional"
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
              ? <p className="og-vacio">Ningún cargo, persona ni unidad coincide con la búsqueda.</p>
              : <div className="og-grid">{resultados.map(f => <CargoCard key={f.cargo.id} fila={f} onAbrir={onAbrir} />)}</div>}
          </>
        ) : !actual ? (
          <>
            <Seccion titulo="Unidades organizacionales" conteo="Haz clic en una unidad para ver sus cargos y sub-unidades." />
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
                <Seccion titulo={`Sub-unidades de ${nombreActual}`} conteo={`${subsAqui.length} ${subsAqui.length === 1 ? 'unidad' : 'unidades'}`} />
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
      f.ocupantes.some(p => p.name.toLowerCase().includes(q)) ||
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
              {/* El código va después del nombre y no antes: se busca por nombre, se confirma por
                  código. Vacío se muestra con una raya, que dice "no tiene" sin ocupar lugar. */}
              <th className="og-th-codigo">Código</th>
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
                    <td colSpan={7}>
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
                      <td className="og-td-codigo">{f.cargo.codigo || '—'}</td>
                      <td><span className="og-pertenece">{f.unidad?.corto || '—'}</span></td>
                      <td><TipoPill tipo={f.tipo} /></td>
                      <td>
                        {f.ocupantes.length ? (
                          <span className="og-td-persona">
                            {f.ocupantes.slice(0, 3).map(p => <Avatar key={p.id} persona={p} size={22} />)}
                            {f.ocupantes.length === 1
                              ? f.ocupantes[0].name
                              : `${f.ocupantes.length} personas`}
                          </span>
                        ) : (
                          <span className="og-td-persona">
                            <span className="og-av og-av-vacio"><Minus size={11} /></span>
                            <em className="og-td-vacio">
                              {f.tipo === 'outsourcing' ? 'Sin prestador asignado' : 'Sin colaborador asignado'}
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
/* Sin botones acá: los de abajo a la derecha son los mismos que se usan el resto del tiempo,
   y tener dos puertas para lo mismo obliga a aprender dos veces dónde se crea una unidad. El
   aviso explica, la acción vive donde siempre. */
function VacioOrganigrama() {
  return (
    <div className="og-scroll">
      <div className="og-vacio-caja">
        <span className="og-vacio-ico"><Building2 size={30} /></span>
        <h2>Todavía no hay un organigrama</h2>
        <p>
          Empieza por las unidades organizacionales: cada cargo tiene que pertenecer a una.
          Después cuelgas los cargos, eliges de quién dependen y quién los ocupa.
        </p>
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
  const { organigrama: org, setOrganigrama: setOrg } = useOnboardingData()
  const [vista, setVista] = useState('grafico')
  const [pestana, setPestana] = useState('completo')
  const [sedeId, setSedeId] = useState(TODAS_SUCURSALES)
  const [sedeAbierta, setSedeAbierta] = useState(false)
  const [busca, setBusca] = useState('')
  const [importar, setImportar] = useState(false)
  /* El color vive fuera de la pantalla porque tiene que sobrevivir a recargar: enseñarlo en una
     reunión y que vuelva al azul de fábrica al cambiar de pestaña sería peor que no tenerlo. */
  const [colorMarca, setColorMarca] = useLocalStorage('organigramaColor', COLORES_MARCA[0])
  const [marcaAbierta, setMarcaAbierta] = useState(false)
  const [exportAbierto, setExportAbierto] = useState(false)
  /* Mientras se dibuja la imagen el árbol tiene que quedarse quieto y entero, así que el botón
     avisa que está trabajando en vez de parecer que no hizo nada: en un organigrama de treinta
     cargos el PNG tarda un segundo largo. */
  const [exportando, setExportando] = useState(null)

  const exportar = async (formato, fn) => {
    setExportando(formato)
    setExportAbierto(false)
    try { await fn(empresa.nombre) } finally { setExportando(null) }
  }
  const [editando, setEditando] = useState(null)      // { cargo } | { cargo: null } para alta
  const [editandoUnidad, setEditandoUnidad] = useState(null) // { unidad } | { unidad: null }

  /* Las vistas leen la estructura recortada a la sede; los modales, la completa: al elegir
     jefe o unidad hay que poder apuntar a algo que el filtro dejó fuera de pantalla. */
  const orgVisible = useMemo(() => filtrarPorSucursal(org, sedeId), [org, sedeId])
  const tree = useMemo(() => buildOrgTree(pestana, orgVisible), [pestana, orgVisible])

  const sede = sucursales.find(s => s.id === sedeId)
  const vacio = org.unidades.length === 0
  const guardar = (form, posicion) => {
    setOrg(prev => {
      const cargos = editando.cargo
        ? prev.cargos.map(c => (c.id === editando.cargo.id ? { ...c, ...form } : c))
        : [...prev.cargos, { id: nuevoId('cargo', prev.cargos), ...form }]
      const siguiente = { ...prev, cargos }
      /* El orden se aplica sobre el organigrama YA actualizado: si en la misma edición cambió
         algo más, los pares que cuentan son los de después del cambio. */
      return posicion == null ? siguiente : moverEntrePares(editando.cargo.id, posicion, siguiente)
    })
    setEditando(null)
  }

  const borrarCargo = cargo => {
    setOrg(prev => eliminarCargo(cargo.id, prev))
    setEditando(null)
  }

  const guardarUnidad = form => {
    const anterior = editandoUnidad.unidad
    setOrg(prev => {
      const unidades = anterior
        ? prev.unidades.map(u => (u.id === anterior.id ? { ...u, ...form } : u))
        : [...prev.unidades, { id: nuevoId('area', prev.unidades), ...form }]

      /* Mover una unidad de madre tiene que mover también su cabeza, o el cambio se ve en
         "Ver por unidades" y no en el gráfico: son dos jerarquías y el dibujo principal usa la
         de cargos. Lo que se recuelga es solo la cabeza; todo lo que colgaba de ella la sigue
         sin tocar nada más. */
      if (!anterior || form.padreId === anterior.padreId) return { ...prev, unidades }
      const cabeza = cabezaDe(anterior.id, prev)
      if (!cabeza) return { ...prev, unidades }
      const nuevoJefe = form.padreId ? cabezaDe(form.padreId, prev) : null
      if (form.padreId && !nuevoJefe) return { ...prev, unidades }
      return {
        ...prev,
        unidades,
        cargos: prev.cargos.map(c => (c.id === cabeza.id ? { ...c, reportaA: nuevoJefe?.id ?? null } : c)),
      }
    })
    setEditandoUnidad(null)
  }

  /* Acomodar un cuadro no toca ningún dato del organigrama: se guarda aparte, en un mapa de
     corrimientos respecto del lugar que le dio el árbol. Por eso no vive dentro del cargo —un
     cargo no tiene coordenadas, tiene jefe y unidad— y por eso volver al acomodo automático es
     simplemente borrar el mapa. Se suma al anterior: mover dos veces mueve dos veces. */
  const mover = (clave, delta) => setOrg(prev => {
    const previo = prev.desplazamientos?.[clave] || { dx: 0, dy: 0 }
    return {
      ...prev,
      desplazamientos: {
        ...prev.desplazamientos,
        [clave]: { dx: previo.dx + delta.dx, dy: previo.dy + delta.dy },
      },
    }
  })

  const acomodar = () => setOrg(prev => ({ ...prev, desplazamientos: {} }))

  const borrarUnidad = unidad => {
    setOrg(prev => eliminarUnidad(unidad.id, prev))
    setEditandoUnidad(null)
  }

  return (
    <div className="og-page" style={{ '--og-marca': colorMarca }}>
      {/* BARRA SUPERIOR */}
      <div className="og-topbar">
        <span className="og-empresa-nombre">{empresa.nombre}</span>

        {/* "Todas las sucursales" es la opción por defecto: una empresa con varias sedes casi
            siempre quiere ver la estructura entera, y entrar a una sede es la excepción. */}
        <div className="og-sede">
          <button className="og-sede-btn" onClick={() => setSedeAbierta(v => !v)}>
            {sede ? `Viendo ${sede.nombre}` : 'Viendo todas las sucursales'}
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
          {/* Color de la empresa. Tiñe las superficies del organigrama —barra, nodos, píldoras,
              controles—, no los textos: con una marca naranja los nombres de los cargos
              saldrían naranjas y el dibujo se volvería ilegible. */}
          <div className="og-marca">
            <button className="og-marca-btn" onClick={() => setMarcaAbierta(v => !v)} title="Color de la empresa">
              <span className="og-marca-muestra" style={{ background: colorMarca }} />
              Color
            </button>
            {marcaAbierta && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setMarcaAbierta(false)} />
                <div className="og-marca-menu">
                  <div className="og-marca-hd">Color de la empresa</div>
                  <div className="og-marca-grid">
                    {COLORES_MARCA.map(c => (
                      <button
                        key={c}
                        className={`og-marca-op${colorMarca === c ? ' on' : ''}`}
                        style={{ background: c }}
                        onClick={() => setColorMarca(c)}
                        title={c}
                      />
                    ))}
                  </div>
                  <label className="og-marca-libre">
                    El de tu marca
                    <input type="color" value={colorMarca} onChange={e => setColorMarca(e.target.value)} />
                  </label>
                  <p className="og-marca-pie">
                    Tiñe el dibujo: la empresa y las píldoras de cada unidad. La barra y los
                    controles no cambian, y los colores de staff, outsourcing y vacante tampoco:
                    son la leyenda del organigrama.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Exportar. Tres formatos porque son tres usos: la imagen que se pega en una
              presentación, el archivo que escala sin pixelarse, y el papel. */}
          <div className="og-marca">
            <button className="og-marca-btn" onClick={() => setExportAbierto(v => !v)} disabled={!!exportando} title="Exportar el organigrama">
              <Download size={13} />
              {exportando ? 'Generando…' : 'Exportar'}
            </button>
            {exportAbierto && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setExportAbierto(false)} />
                <div className="og-marca-menu og-export-menu">
                  <div className="og-marca-hd">Exportar</div>
                  <button className="og-export-op" onClick={() => exportar('png', exportarPNG)}>
                    <Image size={14} />
                    <div>
                      <strong>Imagen PNG</strong>
                      <small>Para pegar en una presentación</small>
                    </div>
                  </button>
                  <button className="og-export-op" onClick={() => exportar('svg', exportarSVG)}>
                    <FileCode2 size={14} />
                    <div>
                      <strong>Vector SVG</strong>
                      <small>Escala sin pixelarse</small>
                    </div>
                  </button>
                  <button className="og-export-op" onClick={() => { setExportAbierto(false); imprimir() }}>
                    <Printer size={14} />
                    <div>
                      <strong>Imprimir o PDF</strong>
                      <small>El PDF sale con texto buscable</small>
                    </div>
                  </button>
                  <p className="og-marca-pie">
                    Se exporta el organigrama entero a tamaño natural, no el pedazo que se ve en
                    pantalla.
                  </p>
                </div>
              </>
            )}
          </div>

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
        /* El aviso y los botones flotantes conviven: el organigrama vacío sigue siendo el
           lienzo, no otra pantalla, así que las dos formas de crear —unidad y cargo— están donde
           van a estar siempre. */
        <>
          <VacioOrganigrama />
          <div className="og-fabs">
            <button className="og-fab og-fab-sec" onClick={() => setEditandoUnidad({ unidad: null })} title="Agregar unidad organizacional">
              <FolderPlus size={18} />
            </button>
            <button className="og-fab" onClick={() => setEditando({ cargo: null })} title="Agregar cargo" disabled={org.unidades.length === 0} style={org.unidades.length === 0 ? { opacity: .45, cursor: 'default' } : undefined}>
              <Plus size={20} />
            </button>
          </div>
        </>
      ) : (
        <>
          {vista === 'grafico' && !vacio && (
            <OrgGrafico
              tree={tree}
              onAbrirCargo={nodo => setEditando({ cargo: nodo.cargo })}
              desplazamientos={org.desplazamientos}
              onMover={mover}
              onAcomodar={acomodar}
            />
          )}
          {vista === 'cards' && !vacio && (
            <VistaCards
              org={orgVisible}
              busca={busca}
              setBusca={setBusca}
              onAbrir={c => setEditando({ cargo: c })}
              onEditarUnidad={u => setEditandoUnidad({ unidad: u })}
            />
          )}
          {vista === 'tabla' && !vacio && (
            <div className="og-scroll">
              <VistaTabla org={orgVisible} busca={busca} setBusca={setBusca} onAbrir={c => setEditando({ cargo: c })} />
            </div>
          )}

          <div className="og-fabs">
            <button className="og-fab og-fab-sec" onClick={() => setEditandoUnidad({ unidad: null })} title="Agregar unidad organizacional">
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
          base={editando.base}
          sedeActiva={sede || null}
          org={org}
          onGuardar={guardar}
          onEliminar={borrarCargo}
          onCerrar={() => setEditando(null)}
        />
      )}
      {editandoUnidad && (
        <UnidadModal
          unidad={editandoUnidad.unidad}
          base={editandoUnidad.base}
          org={org}
          onGuardar={guardarUnidad}
          onEliminar={borrarUnidad}
          onCerrar={() => setEditandoUnidad(null)}
        />
      )}
    </div>
  )
}
