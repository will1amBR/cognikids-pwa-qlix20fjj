import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchChildById } from '@/services/children'
import type { Child } from '@/types/cognikids'
import { Loader2 } from 'lucide-react'
import { FazendaFalanteGame } from '@/components/games/FazendaFalanteGame'
import { CadeOBichinhoGame } from '@/components/games/CadeOBichinhoGame'
import { SomDoBichoGame } from '@/components/games/SomDoBichoGame'
import { RimaDivertidaGame } from '@/components/games/RimaDivertidaGame'
import { ParDosAnimaisGame } from '@/components/games/ParDosAnimaisGame'
import { MemoriaDinosGame } from '@/components/games/MemoriaDinosGame'
import { CaixaDasFormasGame } from '@/components/games/CaixaDasFormasGame'
import { ContaDinosGame } from '@/components/games/ContaDinosGame'
import { SequenciaPadroesGame } from '@/components/games/SequenciaPadroesGame'
import { SequenciaCoresGame } from '@/components/games/SequenciaCoresGame'
import { EstouraBolhasGame } from '@/components/games/EstouraBolhasGame'
import { TrilhaDasLetrasGame } from '@/components/games/TrilhaDasLetrasGame'
import { ClimaERoupaGame } from '@/components/games/ClimaERoupaGame'
import { CarinhasFelizesGame } from '@/components/games/CarinhasFelizesGame'

export const GameRunnerPage: React.FC = () => {
  const { childId, moduleId, activityId: subActivityId, module: routeModule } = useParams()
  const activityId = subActivityId || moduleId || routeModule
  const navigate = useNavigate()

  const [child, setChild] = useState<Child | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!childId) return
    const load = async () => {
      setIsLoading(true)
      const kid = await fetchChildById(childId)
      if (!kid) {
        navigate('/app')
        return
      }
      setChild(kid)
      setIsLoading(false)
    }
    load()
  }, [childId, navigate])

  if (isLoading || !child) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  switch (activityId) {
    case 'fazenda_falante':
    case 'speech':
      return <FazendaFalanteGame child={child} />
    case 'rima_divertida':
      return <RimaDivertidaGame child={child} />
    case 'cade_o_bichinho':
      return <CadeOBichinhoGame child={child} />
    case 'som_do_bicho':
      return <SomDoBichoGame child={child} />
    case 'par_dos_animais':
    case 'memory':
      return <ParDosAnimaisGame child={child} />
    case 'memoria_dinos':
      return <MemoriaDinosGame child={child} />
    case 'caixa_das_formas':
    case 'logic':
      return <CaixaDasFormasGame child={child} />
    case 'conta_dinos':
      return <ContaDinosGame child={child} />
    case 'sequencia_padroes':
      return <SequenciaPadroesGame child={child} />
    case 'sequencia_cores':
      return <SequenciaCoresGame child={child} />
    case 'estoura_bolhas':
    case 'motor':
      return <EstouraBolhasGame child={child} />
    case 'trilha_das_letras':
      return <TrilhaDasLetrasGame child={child} />
    case 'clima_roupa':
      return <ClimaERoupaGame child={child} />
    case 'carinhas_felizes':
    case 'socioemotional':
      return <CarinhasFelizesGame child={child} />
    default:
      return <FazendaFalanteGame child={child} />
  }
}
