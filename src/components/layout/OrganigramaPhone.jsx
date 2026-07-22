import { useState } from 'react'
import { ChevronLeft, ChevronRight, Building2, Star, User } from 'lucide-react'
import {
  unidadesRaiz, subunidadesDe, tarjetaUnidad, cargosDeUnidad, getUnidad,
} from '../../data/organigramaData'

const TIPO = { jefe: 'Jefe / Director', staff: 'Asistente/Staff', colaborador: 'Colaborador común' }

function Titulo({ texto, conteo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '10px 0 7px', paddingLeft: 6, borderLeft: '2px solid #0C2D40' }}>
      <span style={{ fontSize: 8, fontWeight: 700, color: '#0C2D40' }}>{texto}</span>
      <span style={{ fontSize: 6, color: '#94a3b8' }}>{conteo}</span>
    </div>
  )
}

function FilaUnidad({ datos, onEntrar }) {
  const { unidad, cabeza, totalCargos, totalSub } = datos
  return (
    <div
      onClick={() => onEntrar(unidad.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        background: '#0C2D40', borderRadius: 10, padding: '9px 10px', marginBottom: 6,
      }}
    >
      <div style={{
        width: 24, height: 24, borderRadius: 8, background: 'rgba(255,255,255,.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Building2 size={11} style={{ color: '#fff' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: '#fff' }}>{unidad.nombre}</div>
        {cabeza && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
            <Star size={7} style={{ color: '#f59e0b', fill: '#f59e0b', flexShrink: 0 }} />
            <span style={{ fontSize: 6, color: 'rgba(255,255,255,.7)' }}>{cabeza.nombre}</span>
          </div>
        )}
        <div style={{ fontSize: 5.5, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
          {totalCargos} {totalCargos === 1 ? 'cargo' : 'cargos'} · {totalSub} {totalSub === 1 ? 'sub-área' : 'sub-áreas'}
        </div>
      </div>
      <ChevronRight size={11} style={{ color: 'rgba(255,255,255,.5)', flexShrink: 0 }} />
    </div>
  )
}

function TarjetaCargo({ fila }) {
  const { cargo, tipo, ocupante, vacante, jefeNombre } = fila
  const staff = tipo === 'staff'
  return (
    <div style={{
      position: 'relative', background: vacante ? '#fffdf5' : staff ? '#f0fdfa' : '#fff',
      border: vacante ? '1px dashed #f59e0b' : staff ? '1px dashed #2dd4bf' : '1px solid #e2e8f0',
      borderRadius: 10, padding: '9px 10px', marginBottom: 6,
    }}>
      {vacante && (
        <span style={{
          position: 'absolute', top: -5, right: 8, background: '#fef3c7', color: '#b45309',
          fontSize: 5, fontWeight: 800, letterSpacing: '.03em', textTransform: 'uppercase',
          padding: '1px 5px', borderRadius: 4,
        }}>Vacante</span>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
        {tipo === 'jefe'
          ? <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
          : <User size={12} style={{ color: '#7C93A6', flexShrink: 0, marginTop: 1 }} />}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: staff ? '#0f766e' : '#0C2D40', lineHeight: 1.25 }}>{cargo.nombre}</div>
          <div style={{ fontSize: 6, fontWeight: 600, color: '#94a3b8', marginTop: 1 }}>{TIPO[tipo]}</div>
        </div>
      </div>

      {jefeNombre && (
        <div style={{ fontSize: 5.5, color: '#94a3b8', marginTop: 6 }}>
          ↑ Reporta a <span style={{ color: '#0C2D40', fontWeight: 700 }}>{jefeNombre}</span>
        </div>
      )}

      <div style={{ height: 1, background: '#f1f5f9', margin: '7px 0 6px' }} />

      {ocupante ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f1f5f9', borderRadius: 7, padding: '5px 7px' }}>
          <span style={{
            width: 15, height: 15, borderRadius: '50%', background: ocupante.color, color: '#fff',
            fontSize: 5.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>{ocupante.initials}</span>
          <span style={{ fontSize: 7, fontWeight: 600, color: '#0C2D40' }}>{ocupante.name}</span>
        </div>
      ) : (
        <div style={{
          background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: 7,
          padding: '5px 7px', fontSize: 6.5, fontWeight: 700, color: '#b45309',
        }}>Sin colaborador asignado</div>
      )}
    </div>
  )
}

export default function OrganigramaPhone({ onSalir }) {
  const [ruta, setRuta] = useState([])
  const actual = ruta.length ? ruta[ruta.length - 1] : null

  // Volver sube un nivel; desde la raíz, sale del módulo de vuelta a Zona HR.
  const volver = () => (ruta.length ? setRuta(r => r.slice(0, -1)) : onSalir())

  const raices = unidadesRaiz().map(u => tarjetaUnidad(u.id))
  const cargos = actual ? cargosDeUnidad(actual) : []
  const subs = actual ? subunidadesDe(actual).map(u => tarjetaUnidad(u.id)) : []
  const nombre = actual ? getUnidad(actual)?.nombre : null

  return (
    <div style={{ padding: '2px 2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <button
          onClick={volver}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 20, height: 20, borderRadius: 7, border: '1px solid #e2e8f0',
            background: '#fff', color: '#0C2D40', cursor: 'pointer', padding: 0, flexShrink: 0,
          }}
        >
          <ChevronLeft size={11} />
        </button>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#0C2D40' }}>Organigrama</div>
          <div style={{ fontSize: 6, color: '#94a3b8' }}>{nombre || 'Estructura de la empresa'}</div>
        </div>
      </div>

      {!actual ? (
        <>
          <Titulo texto="Unidades organizacionales" conteo={`${raices.length} ${raices.length === 1 ? 'área' : 'áreas'}`} />
          {raices.map(d => <FilaUnidad key={d.unidad.id} datos={d} onEntrar={id => setRuta(r => [...r, id])} />)}
        </>
      ) : (
        <>
          <Titulo texto="Cargos" conteo={`${cargos.length} ${cargos.length === 1 ? 'cargo' : 'cargos'}`} />
          {cargos.length === 0
            ? <div style={{ fontSize: 6.5, color: '#94a3b8', marginBottom: 8 }}>Esta unidad todavía no tiene cargos definidos.</div>
            : cargos.map(f => <TarjetaCargo key={f.cargo.id} fila={f} />)}

          {subs.length > 0 && (
            <>
              <Titulo texto="Sub-unidades" conteo={`${subs.length} ${subs.length === 1 ? 'área' : 'áreas'}`} />
              {subs.map(d => <FilaUnidad key={d.unidad.id} datos={d} onEntrar={id => setRuta(r => [...r, id])} />)}
            </>
          )}
        </>
      )}
    </div>
  )
}
