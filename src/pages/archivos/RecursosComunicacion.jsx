import RecursosLibrary from '../../components/archivos/RecursosLibrary'
import { useOnboardingData } from '../../context/OnboardingDataContext'

export default function RecursosComunicacion() {
  const { recursosComunicacion, setRecursosComunicacion } = useOnboardingData()
  return (
    <RecursosLibrary
      categorias={recursosComunicacion}
      setCategorias={setRecursosComunicacion}
      title="Recursos de comunicación"
      subtitle="Archivos y materiales del área de Comunicación"
      scopeLabel="comunicación"
    />
  )
}
