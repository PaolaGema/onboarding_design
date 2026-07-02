import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { ThemeProvider } from './context/ThemeContext'
import { RutaActivaProvider } from './context/RutaActivaContext'
import { ConfigProvider } from './context/ConfigContext'
import { OnboardingDataProvider } from './context/OnboardingDataContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/onboarding/Dashboard'
import Asignaciones from './pages/onboarding/Asignaciones'
import Plantillas from './pages/onboarding/Plantillas'
import Conocimiento from './pages/onboarding/Conocimiento'
import Configuracion from './pages/onboarding/Configuracion'
import MiOnboarding from './pages/colaborador/MiOnboarding'
import Colaboradores from './pages/personas/Colaboradores'
import Organigrama from './pages/personas/Organigrama'

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
      <OnboardingDataProvider>
      <ConfigProvider>
      <RutaActivaProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="asignaciones" element={<Asignaciones />} />
            <Route path="plantillas" element={<Plantillas />} />
            <Route path="conocimiento" element={<Conocimiento />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="mi-onboarding" element={<MiOnboarding />} />
          </Route>
          <Route path="/personas" element={<Layout />}>
            <Route path="colaboradores" element={<Colaboradores />} />
            <Route path="organigrama" element={<Organigrama />} />
          </Route>
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </BrowserRouter>
      </RutaActivaProvider>
      </ConfigProvider>
      </OnboardingDataProvider>
      </UserProvider>
    </ThemeProvider>
  )
}
