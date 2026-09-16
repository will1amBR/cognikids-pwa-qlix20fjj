import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { Button } from '@/components/ui/button'
import {
  School,
  Play,
  Mic,
  Sparkles,
  FileText,
  Rocket,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  LogIn,
  Layers,
  GraduationCap,
  Shirt,
  Users,
  Award,
  Zap,
} from 'lucide-react'

export const DemoPresentationKitPage: React.FC = () => {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [isLoggingInDemo, setIsLoggingInDemo] = React.useState(false)

  // Ensure demo account is authenticated before navigating to guarded routes
  const ensureDemoAuthAndNavigate = async (targetPath: string) => {
    // If already logged in, navigate straight
    if (user) {
      navigate(targetPath)
      return
    }

    setIsLoggingInDemo(true)
    try {
      await login('demo@cognikids.app', 'demo1234')
      navigate(targetPath)
    } catch (err) {
      console.error(err)
      navigate('/login')
    } finally {
      setIsLoggingInDemo(false)
    }
  }

  const handle1ClickLogin = async () => {
    await ensureDemoAuthAndNavigate('/app')
  }

  const presentationSteps = [
    {
      step: '1',
      title: 'Entrar com Conta Demo Oficial (1 Clique)',
      badge: 'Comece Aqui',
      desc: 'Acesse instantaneamente a conta de demonstração (Mariana Ramos) já pré-calibrada com 3 perfis infantis: Theo (18m), Clara (4a) e Arthur (8a Junior), além de moedas e itens no Tico.',
      actionLabel: 'Entrar na Conta Demo',
      icon: LogIn,
      action: handle1ClickLogin,
      isButton: true,
      highlight: true,
    },
    {
      step: '2',
      title: 'Abrir Portal da Escola (ESCOLA-DEMO01)',
      badge: 'Sem Senha',
      desc: 'Painel da coordenação pedagógica por turmas (Berçário II, Maternal II, Jardim/3º Ano) com lista de alunos, status de desenvolvimento e cupons de matrícula.',
      actionLabel: 'Abrir Portal da Escola',
      link: '/escola?code=ESCOLA-DEMO01',
      icon: GraduationCap,
      highlight: true,
    },
    {
      step: '3',
      title: 'Painel de Matrículas & Cupons das Turmas',
      badge: 'Gestão Escolar',
      desc: 'Veja os cupons gerados (MATRIC-BERCARIO, MATRIC-MATERNAL, MATRIC-JUNIOR) e a lista de famílias que já resgataram convites automáticos da escola.',
      actionLabel: 'Ver Cupons & Matrículas',
      link: '/escola?code=ESCOLA-DEMO01&section=enrollments',
      icon: Users,
    },
    {
      step: '4',
      title: 'Sessão Diária Adaptada por Idade',
      badge: 'Neurociência',
      desc: 'Mostre como a inteligência pedagógica seleciona de 2 a 4 atividades rápidas (10-20 min) que evitam fadiga de tela e estimulam a neuroplasticidade.',
      actionLabel: 'Ver Sessão Diária',
      action: () => ensureDemoAuthAndNavigate('/app/daily/clara_demo_id'),
      isButton: true,
      icon: Play,
    },
    {
      step: '5',
      title: 'Fazenda Falante com Reconhecimento Fonético',
      badge: 'Fala & Multilíngue',
      desc: 'Demonstre a gravação de voz: a criança fala palavras em até 5 idiomas e o algoritmo fonético dá estrelas e moedas.',
      actionLabel: 'Ver Módulo de Fala',
      action: () => ensureDemoAuthAndNavigate('/app/game/clara_demo_id/fazenda_falante'),
      isButton: true,
      icon: Mic,
    },
    {
      step: '6',
      title: 'Gamificação: Loja & Guarda-Roupa do Tico',
      badge: 'Economia Lúdica',
      desc: 'Ao treinar e acertar, a criança ganha moedas de ouro para vestir o Tico com bonés, óculos e tênis! Estimula autonomia e hábito positivo diário.',
      actionLabel: 'Ver Guarda-Roupa do Tico',
      action: () => ensureDemoAuthAndNavigate('/app/wardrobe'),
      isButton: true,
      icon: Shirt,
    },
    {
      step: '7',
      title: 'Radar "Cérebro em Flor" & Relatório em PDF',
      badge: 'Avaliação BNCC',
      desc: 'O diagnóstico pedagógico das 5 áreas (Fala, Memória, Lógica, Motricidade, Socioemocional) com gerador oficial de PDF para reuniões de pais.',
      actionLabel: 'Ver Relatório Evolutivo',
      action: () => ensureDemoAuthAndNavigate('/app/reports'),
      isButton: true,
      icon: FileText,
    },
    {
      step: '8',
      title: 'Área CogniKids Junior (6 a 10 anos)',
      badge: 'Ensino Fundamental',
      desc: 'Ditado de voz, ortografia, missões de matemática, matriz lógica e vocabulário avançado para crianças em fase de alfabetização escolar.',
      actionLabel: 'Ver Área Junior',
      action: () => ensureDemoAuthAndNavigate('/junior'),
      isButton: true,
      icon: Rocket,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-4 sm:p-8 select-none">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-indigo-800/60">
          <div className="flex items-center gap-3">
            <TicoMascot size="md" mood="talking" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider mb-1">
                <span>🎭</span>
                <span>Kit de Apresentação Escolar</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Demonstração Pronta em 1 Clique
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200 mt-0.5">
                Roteiro de pitch rápido para diretores, coordenadores pedagógicos e mantenedores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link to="/" className="flex-1 sm:flex-initial">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto rounded-xl border-white/20 text-white bg-white/5 hover:bg-white/15 text-xs font-bold"
              >
                Voltar à Home
              </Button>
            </Link>
          </div>
        </div>

        {/* 3 HERO 1-CLICK ACTION BUTTONS (Super Big & Clear) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Button 1: Entrar com Conta Demo */}
          <Button
            onClick={handle1ClickLogin}
            disabled={isLoggingInDemo}
            className="h-20 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm sm:text-base shadow-xl shadow-orange-500/25 flex flex-col items-center justify-center p-3 text-center border-2 border-orange-400/40 active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-2">
              <LogIn className="w-5 h-5" />
              <span>{isLoggingInDemo ? 'Entrando...' : 'Entrar com Conta Demo'}</span>
            </div>
            <span className="text-[11px] font-medium text-amber-100 mt-0.5">
              1 clique • Mariana Ramos (3 perfis)
            </span>
          </Button>

          {/* Button 2: Abrir Portal da Escola */}
          <Link to="/escola?code=ESCOLA-DEMO01" className="block">
            <Button className="w-full h-20 rounded-3xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-indigo-950 font-black text-sm sm:text-base shadow-xl shadow-amber-400/20 flex flex-col items-center justify-center p-3 text-center border-2 border-amber-300 active:scale-98 transition-transform">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-900" />
                <span>Portal da Escola</span>
              </div>
              <span className="text-[11px] font-bold text-indigo-900 mt-0.5">
                Código ESCOLA-DEMO01 (sem login)
              </span>
            </Button>
          </Link>

          {/* Button 3: Painel de Matrículas */}
          <Link to="/escola?code=ESCOLA-DEMO01&section=enrollments" className="block">
            <Button
              variant="outline"
              className="w-full h-20 rounded-3xl bg-indigo-900/60 hover:bg-indigo-800/80 text-white border-2 border-indigo-400/40 font-black text-sm sm:text-base shadow-lg flex flex-col items-center justify-center p-3 text-center active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Painel de Matrículas</span>
              </div>
              <span className="text-[11px] font-medium text-indigo-200 mt-0.5">
                Cupons de Turma por WhatsApp
              </span>
            </Button>
          </Link>
        </div>

        {/* Pitch Summary Box (Curto & Objetivo) */}
        <div className="bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-indigo-500/15 border border-amber-400/30 rounded-3xl p-5 sm:p-6 text-xs sm:text-sm leading-relaxed space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-amber-300 flex items-center gap-2">
              <span>🎯</span>
              <span>Roteiro de Pitch (3 Minutos para a Escola)</span>
            </h2>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full font-black uppercase">
              Infalível
            </span>
          </div>

          <p className="text-slate-200">
            Apresente o CogniKids como o <strong>elo tecnológico e lúdico</strong> entre a rotina em
            casa e a escola: os pais estimulam a fala e a cognição com o mascote Tico, e a equipe
            pedagógica tem um painel em tempo real da turma, com relatórios em PDF para reuniões.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
              <span className="font-black text-amber-300 block mb-0.5">1. Para os Alunos</span>
              <span className="text-indigo-100 text-[11px]">
                Jogos com voz, moedas de ouro e roupinhas para vestir o Tico.
              </span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
              <span className="font-black text-amber-300 block mb-0.5">2. Para a Família</span>
              <span className="text-indigo-100 text-[11px]">
                Rotina guiada de 15 min sem tela excessiva e com evolução comprovada.
              </span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
              <span className="font-black text-amber-300 block mb-0.5">3. Para a Escola</span>
              <span className="text-indigo-100 text-[11px]">
                Painel por turmas, cupons no WhatsApp e relatórios alinhados à BNCC.
              </span>
            </div>
          </div>
        </div>

        {/* Step-by-Step Presentation Guide */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>📋</span>
              <span>Passo a Passo da Demonstração ao Vivo</span>
            </h2>
            <span className="text-xs text-indigo-300">8 etapas guiadas</span>
          </div>

          <div className="space-y-2.5">
            {presentationSteps.map((st) => {
              const Icon = st.icon
              return (
                <div
                  key={st.step}
                  className={`rounded-3xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ${
                    st.highlight
                      ? 'bg-indigo-900/50 border-amber-400/60 shadow-lg shadow-indigo-950/40'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4 flex-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-400 text-indigo-950 flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                      {st.step}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-white text-sm sm:text-base">
                          {st.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/15 text-amber-300">
                          {st.badge}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-200 leading-relaxed max-w-2xl">{st.desc}</p>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                    {st.isButton ? (
                      <Button
                        onClick={st.action}
                        disabled={isLoggingInDemo}
                        className="w-full sm:w-auto h-10 px-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-md shadow-orange-500/25 flex items-center justify-center gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{isLoggingInDemo ? 'Entrando…' : st.actionLabel}</span>
                      </Button>
                    ) : (
                      <Link to={st.link || '/app'} className="w-full sm:w-auto block">
                        <Button
                          variant={st.highlight ? 'default' : 'outline'}
                          className={`w-full sm:w-auto h-10 px-5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 ${
                            st.highlight
                              ? 'bg-amber-400 hover:bg-amber-300 text-indigo-950 font-black shadow-md'
                              : 'border-white/20 text-white bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{st.actionLabel}</span>
                          <ChevronRight className="w-4 h-4 opacity-70" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Closing Tip */}
        <div className="p-4 sm:p-5 rounded-3xl bg-indigo-900/30 border border-indigo-700/40 text-center text-xs text-indigo-300 space-y-1.5">
          <p className="font-bold text-white">💡 Argumento de Fechamento com a Escola:</p>
          <p>
            "A escola não precisa instalar nenhum servidor. O código{' '}
            <code className="bg-black/40 px-2 py-0.5 rounded text-amber-300 font-mono font-bold">
              ESCOLA-DEMO01
            </code>{' '}
            já funciona em qualquer navegador ou celular. Seus professores usam sem senha e os pais
            adotam no mesmo dia via WhatsApp!"
          </p>
        </div>
      </div>
    </div>
  )
}

export default DemoPresentationKitPage
