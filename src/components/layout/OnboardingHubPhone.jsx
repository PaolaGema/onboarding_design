import { Rocket, Users, HeartHandshake, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { colaboradoresData } from '../../pages/personas/colaboradoresData'
import { tareasBuddyDe } from '../../data/tareasBuddy'

function Pildora({ children, fondo = '#f1f5f9', texto = '#0C2D40', Icon }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      background: fondo, color: texto, fontSize: 5.5, fontWeight: 700,
      padding: '2px 6px', borderRadius: 5,
    }}>
      {Icon && <Icon size={6} />}
      {children}
    </span>
  )
}

/* Hub del módulo Onboarding para quien tiene más de un destino adentro: el líder (su ruta y
   el seguimiento de su área) y el buddy (su ruta y su gente acompañada). El colaborador no
   pasa por acá: con un solo destino, un hub sobra.

   El orden de las tarjetas no es fijo, es por urgencia: arriba va el trabajo que le queda a
   la persona y abajo lo que ya cerró. Por eso al buddy graduado le abre con "Mis acompañados"
   y deja "Mi Onboarding" como consulta. */
export default function OnboardingHubPhone({ currentUser, onIr }) {
  const { asignaciones } = useOnboardingData()
  const esBuddy = currentUser.role === 'buddy'

  const cardMiOnboarding = {
    key: 'mi-onboarding',
    icon: Rocket,
    titulo: 'Mi Onboarding',
    detalle: 'Tu propia ruta de incorporación',
    pie: currentUser.onbGraduado
      ? <div style={{ marginTop: 6 }}>
          <Pildora fondo="#f0fdf4" texto="#16a34a" Icon={CheckCircle2}>Completado</Pildora>
        </div>
      : null,
  }

  let tarjetas
  if (esBuddy) {
    const acompanados = colaboradoresData.filter(c => c.buddy?.name === currentUser.name)
    const enRiesgo = acompanados.filter(c => c.onb === 'en-riesgo').length
    const pendientes = acompanados.reduce((s, c) => s + tareasBuddyDe(c.id).filter(t => !t.done).length, 0)

    tarjetas = [
      {
        key: 'acompanados',
        icon: HeartHandshake,
        titulo: 'Mis acompañados',
        detalle: 'Las personas que acompañas',
        pie: (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginTop: 6 }}>
            <Pildora>{acompanados.length} {acompanados.length === 1 ? 'persona' : 'personas'}</Pildora>
            {pendientes > 0 && (
              <Pildora fondo="#fefce8" texto="#b45309">
                {pendientes} {pendientes === 1 ? 'tarea mía' : 'tareas mías'}
              </Pildora>
            )}
            {enRiesgo > 0 && (
              <Pildora fondo="#fef2f2" texto="#dc2626" Icon={AlertTriangle}>
                {enRiesgo} en riesgo
              </Pildora>
            )}
          </div>
        ),
      },
      cardMiOnboarding,
    ]
  } else {
    const mios = asignaciones.filter(a => a.area === currentUser.area)
    const enAlerta = mios.filter(a => a.status === 'atrasado' || a.status === 'en-riesgo').length

    tarjetas = [
      cardMiOnboarding,
      {
        key: 'seguimiento',
        icon: Users,
        titulo: 'Seguimiento',
        detalle: `Tu área: ${currentUser.area}`,
        pie: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <Pildora>{mios.length} {mios.length === 1 ? 'persona' : 'personas'}</Pildora>
            {enAlerta > 0 && (
              <Pildora fondo="#fef2f2" texto="#dc2626" Icon={AlertTriangle}>
                {enAlerta} necesitan atención
              </Pildora>
            )}
          </div>
        ),
      },
    ]
  }

  return (
    <div style={{ padding: '2px 2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#0C2D40' }}>Onboarding</div>
          <div style={{ fontSize: 6.5, color: '#94a3b8', marginTop: 1 }}>
            {esBuddy ? 'Tu ruta y tu gente.' : 'Tu ruta y la de tu equipo.'}
          </div>
        </div>
        <div style={{
          width: 22, height: 22, borderRadius: '50%', background: currentUser.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontSize: 6, fontWeight: 700 }}>{currentUser.initials}</span>
        </div>
      </div>

      {tarjetas.map(t => (
        <div
          key={t.key}
          onClick={() => onIr(t.key)}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer',
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
            padding: '12px 11px', marginBottom: 8,
          }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 10, background: '#0C2D40', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <t.icon size={14} style={{ color: '#00E091' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: '#0C2D40' }}>{t.titulo}</div>
            <div style={{ fontSize: 6, color: '#94a3b8', marginTop: 1 }}>{t.detalle}</div>
            {t.pie}
          </div>
          <ChevronRight size={12} style={{ color: '#cbd5e1', flexShrink: 0, marginTop: 3 }} />
        </div>
      ))}
    </div>
  )
}
