import { useState } from 'react'
import { Eye, X, User, Tag, Clock, CalendarPlus, ChevronDown, Plus, UserRound, Pencil, Search, Check, Lock, ToggleLeft, MapPin, Briefcase, Route, Info } from 'lucide-react'
import { useConfig } from '../../context/ConfigContext'
import { useUser } from '../../context/UserContext'
import { colaboradoresData } from '../../pages/personas/colaboradoresData'
import { RutaPath, TaskPreviewModal } from './RutaPreviewModal'
import { estadoRuta, normalizarStatus, REGLA_ESTADO, ESTADOS_EN_CURSO, impactoDeAlcance } from '../../utils/rutaEstados'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import PilaAvatares from './PilaAvatares'
import { TextoEnLinea, ListaEnLinea } from './CamposEnLinea'
import CambiarAlcanceRutaModal from './CambiarAlcanceRutaModal'
import { areas, cargosPorArea, sucursales, tiposRuta, TODAS_LAS_AREAS } from './RutaMetaFields'

/* Una fila de la ficha: ícono, etiqueta y el dato. El dato entra como hijo porque a veces es
   texto fijo y a veces un campo que se edita en el lugar. */
function FilaInfo({ icono: Icono, etiqueta, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 24 }}>
      <Icono size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11.5, minWidth: 0 }}>
        <span style={{ color: '#94a3b8', flexShrink: 0 }}>{etiqueta}:</span>
        {children}
      </div>
    </div>
  )
}

const hoyFecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
}

export default function RutaFullPreviewModal({ plantilla, responsables, canManage = false, onAddPersona, onRemovePersona, onClose, canEdit = false, onEdit, onGuardarDatos }) {
  const { gamificacion } = useConfig()
  const { currentUser } = useUser()
  /* La lista completa y no la que ve quien edita: la unicidad es una regla del sistema, y un
     líder que mueve su ruta de cargo puede estar desplazando a otra de un área que su filtro
     no le muestra. */
  const { asignaciones, plantillas: todasLasRutas } = useOnboardingData()

  /* Quiénes están recorriendo la ruta ahora mismo. Va antes que "Personas con acceso" porque
     responde la pregunta que más pesa antes de tocar algo: si hay gente adentro. Lo que ya
     empezaron conserva la versión con la que arrancó, así que editar aquí no los mueve —pero
     sí conviene saber a cuántos les va a llegar el cambio la próxima vez. */
  const enCurso = asignaciones.filter(a =>
    (a.rutaId === plantilla.id || a.ruta === plantilla.name) && ESTADOS_EN_CURSO.includes(a.status))
  const [activeTask, setActiveTask] = useState(null)
  const [infoAbierta, setInfoAbierta] = useState(true)

  /* Los datos se corrigen sobre el propio dato: se ven como texto y se vuelven campo al
     tocarlos. Antes había que cerrar la vista previa y abrir otro modal solo para cambiar
     una palabra; después eso mejoró a un modo de edición, pero seguía cambiando el panel
     entero de cara y dejaba seis inputs abiertos para leer una ficha.

     Cada campo guarda por su cuenta —el texto al salir, la lista al elegir— así que no hay
     borrador ni botón de confirmar. */
  const editable = canEdit && !!onGuardarDatos
  const guardar = (cambios, desplazadas) => onGuardarDatos({
    name: plantilla.name,
    descripcion: plantilla.descripcion || '',
    tipo: plantilla.tipo || 'Onboarding',
    sucursal: plantilla.sucursal || 'Todas las sucursales',
    area: plantilla.area,
    cargo: plantilla.cargo || '',
    esGlobal: !!plantilla.esGlobal,
    ...cambios,
  }, desplazadas)

  /* Sucursal, área y cargo no describen la ruta: deciden a quién le llega. Sobre una ruta
     vigente, cambiarlos la muda de puesto —deja el anterior sin ruta, puede apagar la del
     nuevo (RN-M60) y les mueve el piso a los que están en curso—, así que ahí se confirma
     antes de escribir. Cuando no arrastra nada —un borrador, una inactiva— se guarda igual de
     directo que el nombre: la fricción que aparece siempre deja de leerse. */
  const [alcanceConfirm, setAlcanceConfirm] = useState(null)
  const guardarAlcance = cambios => {
    const impacto = impactoDeAlcance(plantilla, cambios, todasLasRutas)
    if (!impacto.hay) { guardar(cambios); return }
    setAlcanceConfirm({ cambios, impacto })
  }
  const estado = { ...estadoRuta(plantilla.status), regla: REGLA_ESTADO[normalizarStatus(plantilla.status)] || REGLA_ESTADO.borrador }
  const [showAddModal, setShowAddModal] = useState(false)
  const [addSearch, setAddSearch] = useState('')
  const [selectedToAdd, setSelectedToAdd] = useState([])
  const etapas = plantilla.etapasData || []
  const titular = plantilla.creador || currentUser.name
  const titularRole = plantilla.creador ? plantilla.creadorRole : currentUser.roleLabel

  function openAddModal() {
    setAddSearch('')
    setSelectedToAdd([])
    setShowAddModal(true)
  }

  function toggleSelected(name) {
    setSelectedToAdd(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  function confirmAdd() {
    colaboradoresData
      .filter(c => selectedToAdd.includes(c.name))
      .forEach(c => onAddPersona({ name: c.name, initials: c.initials, color: c.color, cargo: c.cargo }))
    setShowAddModal(false)
  }

  const disponibles = colaboradoresData.filter(c =>
    c.name !== titular &&
    !responsables.find(r => r.name === c.name) &&
    c.name.toLowerCase().includes(addSearch.toLowerCase())
  )

  return (
    <>
      <div className="pl-overlay" onClick={onClose}>
        <div
          className="pl-modal"
          style={{ width: 960, maxWidth: '96vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* HEADER ÚNICO. El título depende de lo que la pantalla deje hacer: cuando los
              datos se editan aquí, "Vista previa" prometía lo contrario de lo que pasaba —una
              previa es donde uno toca sin miedo— y el botón del pie, "Editar etapas y tareas",
              reforzaba la idea de que para editar había que irse a otro lado. Sin permisos, o
              mirando una versión vieja, no se edita nada y el nombre vuelve a ser cierto. */}
          <div className="pl-modal-header" style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {editable ? <Info size={16} style={{ color: '#fff' }} /> : <Eye size={16} style={{ color: '#fff' }} />}
              </div>
              <h2>{editable ? 'Detalle de la ruta' : 'Vista previa'}</h2>
            </div>
            <button className="pl-modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            {/* IZQUIERDA: vista previa de la ruta */}
            <div style={{
              flex: '1 1 58%', minWidth: 0, display: 'flex', flexDirection: 'column',
              background: 'linear-gradient(180deg, #f0f4f8 0%, #e8eef4 100%)',
              borderRight: '1px solid #e2e8f0',
            }}>
              <div style={{ overflowY: 'auto', flex: 1, padding: '24px 0' }}>
                {etapas.length === 0 ? (
                  <div style={{ minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 30px', gap: 12 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(12,45,64,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Pencil size={22} style={{ color: '#94a3b8' }} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0C2D40' }}>Esta ruta aún no tiene etapas</div>
                    <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, maxWidth: 300 }}>
                      Ábrela en el editor para diseñar sus etapas y tareas. Aquí verás la vista previa en cuanto agregues contenido.
                    </div>
                  </div>
                ) : (
                  <>
                    {etapas.some(e => e.locked) && (
                      <div style={{ display: 'flex', justifyContent: 'center', margin: '0 20px 18px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 8, padding: '8px 13px', borderRadius: 10, background: '#EEF1F5', border: '1px solid #cdd5df', maxWidth: 460 }}>
                          <Lock size={13} style={{ color: '#475569', flexShrink: 0, marginTop: 1 }} />
                          <span style={{ fontSize: 11, color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>
                            Las etapas en <strong>gris</strong> vienen de la <strong>ruta general</strong>: comunes a todos los colaboradores y solo editables desde ahí.
                          </span>
                        </div>
                      </div>
                    )}
                    <RutaPath etapas={etapas} gamificacion={gamificacion} onSelectTask={setActiveTask} />
                  </>
                )}
              </div>
            </div>

            {/* DERECHA: info */}
            <div style={{ flex: '1 1 42%', minWidth: 300, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                {/* El margen negativo alinea el texto del campo con el resto del panel: el
                    input necesita padding propio para que el fondo de hover no quede pegado
                    a las letras. */}
                <div style={{ margin: '0 -6px 16px' }}>
                  <TextoEnLinea
                    value={plantilla.name}
                    onChange={name => name && guardar({ name })}
                    placeholder="Nombre de la ruta"
                    editable={editable}
                    estilo={{ fontSize: 20, fontWeight: 800, color: '#0C2D40', lineHeight: 1.25 }}
                  />
                  <TextoEnLinea
                    value={plantilla.descripcion || ''}
                    onChange={descripcion => guardar({ descripcion })}
                    placeholder="Sin descripción"
                    multilinea
                    editable={editable}
                    estilo={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginTop: 2 }}
                  />
                </div>

                {/* COLABORADORES EN CURSO */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40' }}>Haciendo esta ruta</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 10 }}>
                    Conservan la versión con la que empezaron
                  </div>
                  {enCurso.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <PilaAvatares
                        personas={enCurso}
                        size={34}
                        titulo={enCurso.map(a => `${a.nombre} — ${a.cargo}`).join('\n')}
                      />
                      <span style={{ fontSize: 11.5, color: '#334155', fontWeight: 600 }}>
                        {enCurso.length} {enCurso.length === 1 ? 'colaborador' : 'colaboradores'}
                      </span>
                    </div>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
                      <UserRound size={13} /> Nadie la está haciendo todavía
                    </span>
                  )}
                </div>

                {/* PERSONAS CON ACCESO */}
                <div style={{ marginBottom: 20, position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40' }}>Personas con acceso</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 10 }}>Pueden editar etapas y tareas de esta ruta</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div
                      title={`${titular} · Titular`}
                      style={{
                        width: 34, height: 34, borderRadius: '50%', background: '#0C2D40',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        boxShadow: '0 0 0 2px #fff, 0 0 0 3px #e2e8f0',
                      }}
                    >
                      <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{getInitials(titular)}</span>
                    </div>

                    {responsables.map(r => (
                      <div key={r.name} style={{ position: 'relative' }}>
                        <div
                          title={`${r.name} · ${r.role || r.cargo}`}
                          style={{
                            width: 34, height: 34, borderRadius: '50%', background: r.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            boxShadow: '0 0 0 2px #fff, 0 0 0 3px #e2e8f0',
                          }}
                        >
                          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{r.initials}</span>
                        </div>
                        {canManage && r.role !== 'Líder de área' && (
                          <button
                            onClick={() => onRemovePersona(r.name)}
                            title={`Quitar a ${r.name}`}
                            style={{
                              position: 'absolute', top: -3, right: -3, width: 16, height: 16, borderRadius: '50%',
                              border: '1.5px solid #fff', background: '#94a3b8', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                            }}
                          >
                            <X size={9} style={{ color: '#fff' }} />
                          </button>
                        )}
                      </div>
                    ))}

                    {canManage && (
                      <button
                        onClick={openAddModal}
                        title="Agregar personas"
                        style={{
                          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                          border: '1.5px dashed #cbd5e1', background: '#f8fafc', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Plus size={15} style={{ color: '#94a3b8' }} />
                      </button>
                    )}
                    {!canManage && responsables.length === 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
                        <UserRound size={13} /> Sin responsables asignados aún
                      </span>
                    )}
                  </div>
                </div>

                {/* INFORMACIÓN (colapsable) */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                  <button
                    onClick={() => setInfoAbierta(!infoAbierta)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginBottom: infoAbierta ? 12 : 0,
                      fontFamily: 'inherit',
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0C2D40' }}>Información</span>
                    <ChevronDown size={14} style={{ color: '#94a3b8', transform: infoAbierta ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
                  </button>

                  {infoAbierta && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Primero el estado: de todos los datos de la ruta es el que decide si
                          le llega a alguien. Como una fila más y con la píldora de la lista,
                          para que no compita con el nombre de la ruta. */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ToggleLeft size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                        <div style={{ fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: '#94a3b8' }}>Estado:</span>
                          <span className={`pl-status ${estado.clase}`} title={estado.regla}>{estado.label}</span>
                        </div>
                      </div>
                      {/* La ruta general no apunta a nadie: mostrarle sucursal, área y cargo
                          sería ofrecer a elegir algo que no se usa. */}
                      {plantilla.esGlobal ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Briefcase size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                          <div style={{ fontSize: 11.5 }}>
                            <span style={{ color: '#94a3b8' }}>Alcance: </span>
                            <span style={{ color: '#334155', fontWeight: 600 }}>Toda la empresa</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <FilaInfo icono={Tag} etiqueta="Tipo">
                            <ListaEnLinea
                              value={plantilla.tipo || 'Onboarding'}
                              opciones={tiposRuta}
                              onChange={tipo => guardarAlcance({ tipo })}
                              editable={editable}
                            />
                          </FilaInfo>
                          <FilaInfo icono={MapPin} etiqueta="Sucursal">
                            <ListaEnLinea
                              value={plantilla.sucursal || 'Todas las sucursales'}
                              opciones={['Todas las sucursales', ...sucursales]}
                              onChange={sucursal => guardarAlcance({ sucursal })}
                              editable={editable}
                            />
                          </FilaInfo>
                          <FilaInfo icono={Briefcase} etiqueta="Área">
                            {/* Cambiar de área deja el cargo anterior sin sentido, así que se
                                limpia en el mismo movimiento. */}
                            <ListaEnLinea
                              value={plantilla.area}
                              opciones={[TODAS_LAS_AREAS, ...areas]}
                              onChange={area => guardarAlcance({ area, cargo: '' })}
                              editable={editable}
                            />
                          </FilaInfo>
                          <FilaInfo icono={UserRound} etiqueta="Cargo">
                            <ListaEnLinea
                              value={plantilla.cargo}
                              opciones={cargosPorArea[plantilla.area] || []}
                              onChange={cargo => guardarAlcance({ cargo })}
                              editable={editable}
                              desactivado={plantilla.area === TODAS_LAS_AREAS}
                              placeholder={plantilla.area === TODAS_LAS_AREAS ? 'Todos los cargos' : 'Sin cargo'}
                            />
                          </FilaInfo>
                        </>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <User size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                        <div style={{ fontSize: 11.5 }}>
                          <span style={{ color: '#94a3b8' }}>Titular: </span>
                          <span style={{ color: '#334155', fontWeight: 600 }}>
                            {titular}{titularRole ? `: ${titularRole}` : ''}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Clock size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                        <div style={{ fontSize: 11.5 }}>
                          <span style={{ color: '#94a3b8' }}>Fecha de modificación: </span>
                          <span style={{ color: '#334155', fontWeight: 600 }}>{plantilla.updatedFecha || hoyFecha}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CalendarPlus size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                        <div style={{ fontSize: 11.5 }}>
                          <span style={{ color: '#94a3b8' }}>Fecha de creación: </span>
                          <span style={{ color: '#334155', fontWeight: 600 }}>{plantilla.creadoEl || plantilla.updatedFecha || hoyFecha}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pl-modal-footer">
                <button className="pl-btn-cancel" onClick={onClose}>Cerrar</button>
                {/* Va directo al constructor: los datos ya se corrigen en este mismo panel,
                    así que lo único que queda "para editar" son las etapas y las tareas. */}
                {canEdit && (
                  <button className="pl-btn-save" onClick={onEdit} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Route size={14} /> Editar etapas y tareas
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeTask && (
        <TaskPreviewModal task={activeTask} onClose={() => setActiveTask(null)} />
      )}

      {alcanceConfirm && (
        <CambiarAlcanceRutaModal
          ruta={plantilla}
          impacto={alcanceConfirm.impacto}
          enCurso={enCurso.length}
          onConfirmar={() => {
            guardar(alcanceConfirm.cambios, alcanceConfirm.impacto.desplaza)
            setAlcanceConfirm(null)
          }}
          onCancelar={() => setAlcanceConfirm(null)}
        />
      )}

      {showAddModal && (
        <div className="pl-overlay" style={{ zIndex: 1300 }} onClick={() => setShowAddModal(false)}>
          <div className="pl-modal" style={{ width: 440, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="pl-modal-header">
              <h2>Agregar personas con acceso</h2>
              <button className="pl-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '16px 24px 0' }}>
              <div className="pl-search-wrap" style={{ maxWidth: 'none' }}>
                <Search size={13} className="pl-search-ico" />
                <input
                  type="text"
                  className="pl-search"
                  placeholder="Buscar colaborador por nombre…"
                  value={addSearch}
                  onChange={e => setAddSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div style={{ padding: '12px 16px 16px', overflowY: 'auto', flex: 1 }}>
              {disponibles.map(c => {
                const checked = selectedToAdd.includes(c.name)
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleSelected(c.name)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', border: 'none', borderRadius: 9,
                      background: checked ? 'var(--green-tint)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                      textAlign: 'left', transition: 'background .1s',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      border: checked ? 'none' : '1.5px solid #cbd5e1',
                      background: checked ? 'var(--navy)' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {checked && <Check size={12} style={{ color: '#fff' }} />}
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{c.initials}</span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.cargo} · {c.depto}</div>
                    </div>
                  </button>
                )
              })}
              {disponibles.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '20px 4px', textAlign: 'center' }}>
                  {addSearch ? 'Sin resultados' : 'Todos los colaboradores ya tienen acceso'}
                </div>
              )}
            </div>
            <div className="pl-modal-footer">
              <button className="pl-btn-cancel" onClick={() => setShowAddModal(false)}>Cancelar</button>
              <button className="pl-btn-save" disabled={selectedToAdd.length === 0} onClick={confirmAdd}>
                Agregar{selectedToAdd.length > 0 ? ` (${selectedToAdd.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
