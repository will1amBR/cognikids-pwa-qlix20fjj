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
} from 'lucide-react'

export const DemoPresentationKitPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isLoggingInDemo, setIsLoggingInDemo] = React.useState(false)

  const handle1ClickLogin = async () => {
    setIsLoggingInDemo(true)
    try {
      await login('demo@cognikids.app', 'demo1234')
      navigate('/app')
    } catch (err) {
      console.error(err)
      navigate('/login')
    } finally {
      setIsLoggingInDemo(false)
    }
  }

  const presentationSteps = [
    {
      step: '1',
      title: 'Login em 1 Clique (Conta Demo Oficial)',
      badge: 'Início',
      desc: 'Entre direto com a conta demo (Mariana Ramos) que já vem com 3 perfis fictícios calibrados: Theo (18m), Clara (4a) e Arthur (8a Junior).',
      actionLabel: 'Fazer Login Demo em 1 Clique',
      icon: LogIn,
      action: handle1ClickLogin,
      isButton: true,
      highlight: true,
    },
    {
      step: '2',
      title: 'Sessão Diária Recomendada por Idade',
      badge: 'Rotina Guiada',
      desc: 'Mostre como a rotina diária inteligente seleciona de 2 a 4 atividades rápidas (10 a 20 min) que evitam sobrecarga de tela e estimulam a neuroplasticidade.',
      actionLabel: 'Ver Sessão Diária (Clara)',
      link: '/app',
      icon: Play,
    },
    {
      step: '3',
      title: 'Fazenda Falante com Reconhecimento de Voz',
      badge: 'Fala & Multilíngue',
      desc: 'Demonstre a gravação de voz real: a criança escuta o som, pronuncia a palavra ("Leão", "Cow", "Perro") e o algoritmo de similaridade fonética dá estrelas.',
      actionLabel: 'Ver Módulo de Fala',
      link: '/app',
      icon: Mic,
    },
    {
      step: '4',
      title: 'Radar "Cérebro em Flor" & Diagnóstico',
      badge: '5 Áreas Cognitivas',
      desc: 'Mostre a visualização em pétalas das 5 áreas (Fala, Memória, Lógica, Motricidade, Socioemocional), com diagnóstico pedagógico claro ("Indo bem" vs "Precisa praticar").',
      actionLabel: 'Abrir Painel da Clara',
      link: '/app',
      icon: Sparkles,
    },
    {
      step: '5',
      title: 'Relatório Evolutivo & Exportação em PDF',
      badge: 'Documentação',
      desc: 'Exiba a evolução semanal/mensal com comparativo percentual e o gerador de relatório oficial em PDF pronto para reuniões pedagógicas de pais e mestres.',
      actionLabel: 'Ver Relatório Evolutivo',
      link: '/app/reports',
      icon: FileText,
    },
    {
      step: '6',
      title: 'Área CogniKids Junior (6 a 10 anos)',
      badge: 'Alfabetização & Matemática',
      desc: 'Apresente a interface autônoma de desafios para crianças em idade escolar: ditado por voz, missões matemáticas, matriz lógica e vocabulário avançado em 5 idiomas.',
      actionLabel: 'Explorar Área Junior',
      link: '/junior',
      icon: Rocket,
    },
    {
      step: '7',
      title: 'Portal da Escola (Acesso Sem Login)',
      badge: 'Visão Pedagógica',
      desc: 'O ápice da apresentação para coordenadores e professores: com o código ESCOLA-DEMO01, eles têm acesso somente leitura por turmas (Berçário, Maternal, Jardim).',
      actionLabel: 'Abrir Portal da Escola (ESCOLA-DEMO01)',
      link: '/escola?code=ESCOLA-DEMO01',
      icon: GraduationCap,
      isExternalLike: true,
      highlight: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-4 sm:p-8 select-none">
      <div className="max-w-4xl mx-auto space-y-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-indigo-800/60">
          <div className="flex items-center gap-3">
            <TicoMascot size="md" mood="talking" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider mb-1">
                <span>🎭</span>
                <span>Kit Oficial de Apresentação</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Roteiro de Demonstração para Escolas
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200 mt-0.5">
                Passo a passo rápido para coordenadores, diretores e pedagogos (100% funcional sem
                dados reais)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/20 text-white bg-white/5 hover:bg-white/15 text-xs font-bold"
              >
                Voltar à Home
              </Button>
            </Link>
            <Link to="/escola?code=ESCOLA-DEMO01">
              <Button
                size="sm"
                className="rounded-xl bg-amber-400 hover:bg-amber-300 text-indigo-950 font-black text-xs"
              >
                Portal Escola Direto
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Pitch Banner */}
        <div className="bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-indigo-500/20 border border-amber-400/30 rounded-3xl p-5 sm:p-6 text-xs sm:text-sm leading-relaxed space-y-3">
          <h2 className="text-base font-black text-amber-300 flex items-center gap-2">
            <span>🎯</span>
            <span>Objetivo do Pitch em 5 Minutos:</span>
          </h2>
          <p className="text-slate-200">
            Demonstrar como o <strong>CogniKids</strong> conecta a rotina em casa com o plano
            pedagógico da escola, oferecendo à coordenação uma ferramenta de triagem precoce e aos
            pais um estímulo lúdico com inteligência fonética e registro de evolução.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
              <span className="font-black text-amber-300 block mb-1">1. Conta Demo Pronta</span>
              <span className="text-[11px] text-indigo-200">
                demo@cognikids.app / demo1234 com 3 idades reais
              </span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
              <span className="font-black text-amber-300 block mb-1">2. Código da Escola</span>
              <span className="text-[11px] text-indigo-200">
                ESCOLA-DEMO01 dispensa senha de professor
              </span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
              <span className="font-black text-amber-300 block mb-1">3. Vínculo por Turma</span>
              <span className="text-[11px] text-indigo-200">
                Pais entram com convite e vinculam a criança à sala
              </span>
            </div>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <span>📋</span>
            <span>Ordem Recomendada da Apresentação</span>
          </h2>

          <div className="space-y-3">
            {presentationSteps.map((st) => {
              const Icon = st.icon
              return (
                <div
                  key={st.step}
                  className={`rounded-3xl p-5 border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    st.highlight
                      ? 'bg-indigo-900/40 border-amber-400/50 shadow-lg shadow-indigo-950/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400 text-indigo-950 flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                      {st.step}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-white text-base">{st.title}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/15 text-amber-300">
                          {st.badge}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-200 leading-relaxed max-w-2xl">{st.desc}</p>
                    </div>
                  </div>

                  <div className="w-full md:w-auto shrink-0">
                    {st.isButton ? (
                      <Button
                        onClick={st.action}
                        disabled={isLoggingInDemo}
                        className="w-full md:w-auto h-11 px-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-md shadow-orange-500/25 flex items-center justify-center gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{isLoggingInDemo ? 'Entrando na Demo…' : st.actionLabel}</span>
                      </Button>
                    ) : (
                      <Link to={st.link || '/app'} className="w-full md:w-auto block">
                        <Button
                          variant={st.highlight ? 'default' : 'outline'}
                          className={`w-full md:w-auto h-11 px-5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 ${
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

        {/* Footer Card */}
        <div className="p-5 rounded-3xl bg-indigo-900/30 border border-indigo-700/40 text-center text-xs text-indigo-300 space-y-2">
          <p className="font-bold text-white">💡 Dica prática para fechar com a escola:</p>
          <p>
            Mostre que a escola pode emitir cupons como{' '}
            <code className="bg-black/30 px-2 py-0.5 rounded text-amber-300 font-mono">
              MATRIC-BERCARIO
            </code>{' '}
            e enviar pelo WhatsApp dos pais. Quando a família se cadastra, o aluno já cai
            automaticamente vinculado à turma!
          </p>
        </div>
      </div>
    </div>
  )
}

export default DemoPresentationKitPage
