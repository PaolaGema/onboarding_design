import RecursosLibrary from '../../components/archivos/RecursosLibrary'
import { useOnboardingData } from '../../context/OnboardingDataContext'

export default function Conocimiento() {
  const { recursos, setRecursos } = useOnboardingData()
  return (
    <RecursosLibrary
      categorias={recursos}
      setCategorias={setRecursos}
      title="Recursos corporativos"
      subtitle="Centraliza todos los materiales que tus colaboradores necesitan durante su onboarding"
      scopeLabel="onboarding"
      enableQuiz
    />
  )
}
