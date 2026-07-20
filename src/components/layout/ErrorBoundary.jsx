import { Component } from 'react'

/* TEMPORAL — diagnóstico. Cuando algo revienta al renderizar, React desmonta el árbol
   entero y deja la pantalla en blanco, sin pista de qué falló. Esto atrapa el error y lo
   muestra. Quitar cuando esté resuelto el problema del editor de rutas. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    this.setState({ info })
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.error) {
      return (
        <>
          {this.props.children}
          {/* Marca temporal: confirma que este código está cargado en el navegador. */}
          <div style={{
            position: 'fixed', bottom: 8, right: 8, zIndex: 99999,
            background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700,
            padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace', pointerEvents: 'none',
          }}>
            DIAGNÓSTICO ACTIVO
          </div>
        </>
      )
    }

    const { error, info } = this.state
    return (
      <div style={{ padding: 24, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.5, color: '#0C2D40', background: '#fff5f5', minHeight: '100vh', overflow: 'auto' }}>
        <h1 style={{ fontSize: 16, color: '#dc2626', marginBottom: 4 }}>Se rompió al renderizar</h1>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
          Copia todo este texto y pégalo en el chat.
        </p>

        {/* Solo las líneas de /src/: el resto del rastro es maquinaria de React y no dice
            nada útil sobre qué falló en esta app. */}
        <div style={{ background: '#fff', border: '2px solid #dc2626', borderRadius: 8, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: .5, marginBottom: 6 }}>1 · QUÉ FALLÓ</div>
          <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 14 }}>
            {String(error?.name || 'Error')}: {String(error?.message || error)}
          </div>
        </div>

        <div style={{ background: '#fff', border: '2px solid #0C2D40', borderRadius: 8, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: .5, marginBottom: 6 }}>2 · EN QUÉ ARCHIVO</div>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 12, color: '#0C2D40', fontWeight: 600 }}>
            {(error?.stack || '').split('\n').filter(l => l.includes('/src/')).slice(0, 6).join('\n') || '(ninguna línea del proyecto — mira el bloque 3)'}
          </pre>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: .5, marginBottom: 6 }}>3 · EN QUÉ COMPONENTE</div>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 12, color: '#334155' }}>
            {(info?.componentStack || '').split('\n').filter(Boolean).slice(0, 8).join('\n') || '(sin info)'}
          </pre>
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: 16, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#0C2D40', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Recargar
        </button>
      </div>
    )
  }
}
