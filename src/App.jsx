import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { TroncoProvider } from './context/TroncoContext'
import { RutaActivaProvider } from './context/RutaActivaContext'
import { ConfigProvider } from './context/ConfigContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/onboarding/Dashboard'
import Asignaciones from './pages/onboarding/Asignaciones'
import Plantillas from './pages/onboarding/Plantillas'
import Conocimiento from './pages/onboarding/Conocimiento'
import Configuracion from './pages/onboarding/Configuracion'
import Bienvenida from './pages/colaborador/Bienvenida'
import MiOnboarding from './pages/colaborador/MiOnboarding'
import Colaboradores from './pages/personas/Colaboradores'

export default function App() {
  return (
    <UserProvider>
      <ConfigProvider>
      <TroncoProvider>
      <RutaActivaProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="asignaciones" element={<Asignaciones />} />
            <Route path="plantillas" element={<Plantillas />} />
            <Route path="conocimiento" element={<Conocimiento />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="bienvenida" element={<Bienvenida />} />
            <Route path="mi-onboarding" element={<MiOnboarding />} />
          </Route>
          <Route path="/personas" element={<Layout />}>
            <Route path="colaboradores" element={<Colaboradores />} />
          </Route>
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </BrowserRouter>
      </RutaActivaProvider>
      </TroncoProvider>
      </ConfigProvider>
    </UserProvider>
  )
}
