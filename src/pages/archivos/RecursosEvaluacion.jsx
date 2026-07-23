import RecursosLibrary from '../../components/archivos/RecursosLibrary'
import { useOnboardingData } from '../../context/OnboardingDataContext'

export default function RecursosEvaluacion() {
  const { recursosEvaluacion, setRecursosEvaluacion } = useOnboardingData()
  return (
    <RecursosLibrary
      categorias={recursosEvaluacion}
      setCategorias={setRecursosEvaluacion}
      title="Recursos de evaluación"
      subtitle="Archivos y materiales del área de Evaluación"
      scopeLabel="evaluación"
      enableQuiz={false}
    />
  )
}
