import RecursosLibrary from '../../components/archivos/RecursosLibrary'
import { useOnboardingData } from '../../context/OnboardingDataContext'

export default function RecursosPersonas() {
  const { recursosPersonas, setRecursosPersonas } = useOnboardingData()
  return (
    <RecursosLibrary
      categorias={recursosPersonas}
      setCategorias={setRecursosPersonas}
      title="Recursos de gestión de personas"
      subtitle="Archivos y materiales del área de Gestión de personas"
      scopeLabel="gestión de personas"
    />
  )
}
