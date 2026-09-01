import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchChildById } from '@/services/children'
import { Child } from '@/types/cognikids'
import { JuniorVocabBuilderGame } from '@/components/games/JuniorVocabBuilderGame'
import { JuniorMathQuestGame } from '@/components/games/JuniorMathQuestGame'
import { JuniorLogicMatrixGame } from '@/components/games/JuniorLogicMatrixGame'
import { JuniorDictationGame } from '@/components/games/JuniorDictationGame'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

export const JuniorGameRunnerPage: React.FC = () => {
  const { childId, module } = useParams<{ childId: string; module: string }>()
  const navigate = useNavigate()
  const [child, setChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!childId) {
      setError('Criança não identificada.')
      setLoading(false)
      return
    }

    fetchChildById(childId)
      .then((data) => {
        if (!data) {
          setError('Perfil da criança não encontrado.')
        } else {
          setChild(data)
        }
      })
      .catch((err) => {
        console.error('Error fetching child for Junior Game:', err)
        setError('Não foi possível carregar os dados da criança.')
      })
      .finally(() => setLoading(false))
  }, [childId])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-600">Carregando missão Junior...</p>
      </div>
    )
  }

  if (error || !child) {
    return (
      <div className="max-w-md mx-auto my-12 p-6">
        <Card className="p-6 text-center space-y-4 rounded-3xl border-2 border-rose-100 bg-rose-50/50 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Ops! Algo deu errado</h2>
          <p className="text-xs text-slate-600">{error || 'Criança não encontrada.'}</p>
          <Button
            onClick={() => navigate('/junior')}
            className="rounded-2xl bg-indigo-600 text-white font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao CogniKids Junior
          </Button>
        </Card>
      </div>
    )
  }

  // Render the appropriate Junior Game based on module route param
  switch (module?.toLowerCase()) {
    case 'vocab':
    case 'junior_vocab':
    case 'junior_vocab_builder':
      return <JuniorVocabBuilderGame child={child} />

    case 'math':
    case 'junior_math':
    case 'junior_math_quest':
      return <JuniorMathQuestGame child={child} />

    case 'logic':
    case 'junior_logic':
    case 'junior_logic_matrix':
      return <JuniorLogicMatrixGame child={child} />

    case 'dictation':
    case 'junior_dictation':
    case 'junior_dictation_game':
    case 'junior_dictation_voice':
      return <JuniorDictationGame child={child} />

    default:
      return (
        <div className="max-w-md mx-auto my-12 p-6">
          <Card className="p-6 text-center space-y-4 rounded-3xl border-2 border-indigo-100 bg-indigo-50/50 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Módulo Não Encontrado</h2>
            <p className="text-xs text-slate-600">
              O módulo "{module}" não existe no CogniKids Junior.
            </p>
            <Button
              onClick={() => navigate('/junior')}
              className="rounded-2xl bg-indigo-600 text-white font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ver Atividades Junior
            </Button>
          </Card>
        </div>
      )
  }
}
