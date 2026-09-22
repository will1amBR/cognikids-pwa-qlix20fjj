import React, { useState } from 'react'
import {
  AlertTriangle,
  PhoneCall,
  HeartPulse,
  Thermometer,
  ShieldAlert,
  Droplets,
  Wind,
  Bug,
  Moon,
  Syringe,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  Info,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSound } from '@/context/SoundContext'

interface HealthTopic {
  id: string
  title: string
  icon: any
  tag: string
  summary: string
  whatToObserve: string[]
  whatToDoAtHome: string[]
  whenToGoToDoctor: string[]
  emergencyPhoneTip?: string
}

const HEALTH_TOPICS: HealthTopic[] = [
  {
    id: 'febre',
    title: 'Febre na Infância',
    icon: Thermometer,
    tag: 'Temperatura & Conforto',
    summary:
      'A febre é uma resposta natural do sistema imunológico para combater vírus e bactérias, não uma doença em si.',
    whatToObserve: [
      'Temperatura axilar acima de 37,8 °C medida com termômetro confiável.',
      'Estado geral da criança: ela brinca, interage e se hidrata quando a febre baixa?',
      'Presença de outros sintomas: manchas no corpo, vômitos, tosse ou rigidez na nuca.',
    ],
    whatToDoAtHome: [
      'Mantenha a criança com roupas leves e confortáveis, em ambiente ventilado e arejado.',
      'Ofereça líquidos frequentemente (água, leite materno ou soro caseiro) para prevenir desidratação.',
      'Banhos mornos (nunca água fria ou álcool) podem trazer conforto térmico.',
      'Use antitérmicos apenas conforme orientação prévia do pediatra da criança, respeitando as doses indicadas.',
    ],
    whenToGoToDoctor: [
      '🚨 Bebê menor de 3 meses com qualquer febre (>= 37,8 °C): procure o pronto-socorro imediatamente.',
      'Febre persistente por mais de 72 horas consecutivas sem foco evidente.',
      'Criança apática, muito sonolenta, com dificuldade para acordar ou que não aceita líquidos.',
      'Aparecimento de manchas avermelhadas ou roxas na pele que não somem ao pressionar.',
      'Dificuldade para respirar (peito afundando ou respiração muito ofegante).',
      'Crise convulsiva febril.',
    ],
    emergencyPhoneTip:
      'Em caso de convulsão ou perda de consciência, ligue imediatamente SAMU 192.',
  },
  {
    id: 'quedas',
    title: 'Quedas e Batidas na Cabeça (Trauma Craniano Leve)',
    icon: AlertTriangle,
    tag: 'Segurança & Acidentes',
    summary:
      'Quedas da própria altura, do sofá ou da cama são frequentes quando os pequenos começam a engatinhar e andar.',
    whatToObserve: [
      'Se houve choro imediato após a queda (choro imediato e rápido consolo costumam ser bons sinais).',
      'Presença de "galo" (hematoma subgaleal externo) ou corte com sangramento.',
      'Comportamento nas 24 a 48 horas seguintes: atenção a vômitos em jato, irritabilidade excessiva ou sonolência incomum.',
    ],
    whatToDoAtHome: [
      'Acalme a criança no colo e faça compressa fria (gelo envolvido em pano limpo) sobre o local do inchaço por 10 a 15 minutos.',
      'Mantenha a criança em repouso e sob observação próxima nas próximas 24 a 48 horas.',
      'Durante a noite após a queda, acorde a criança suavemente uma ou duas vezes para verificar se reage normalmente.',
    ],
    whenToGoToDoctor: [
      '🚨 Perda de consciência após a queda, mesmo que por poucos segundos.',
      'Dois ou mais episódios de vômitos.',
      'Sonolência profunda, dificuldade para acordar ou falar.',
      'Sangramento ou saída de líquido claro pelo nariz ou pelos ouvidos.',
      'Queda de altura superior a 1 metro (ou mais do que a própria altura do bebê).',
      'Olhos com pupilas de tamanhos diferentes ou andar cambaleante.',
    ],
    emergencyPhoneTip:
      'Ligue 192 (SAMU) se houver inconsciência ou traumatismo com suspeita no pescoço/coluna.',
  },
  {
    id: 'engasgo',
    title: 'Engasgo e Obstrução de Vias Aéreas',
    icon: ShieldAlert,
    tag: 'Primeiros Socorros Rápidos',
    summary:
      'O engasgo pode ocorrer com alimentos (pipoca, uvas inteiras, castanhas) ou pequenos brinquedos. Saber agir rápido salva vidas.',
    whatToObserve: [
      'Engasgo leve: a criança consegue tossir com força e emitir sons. Deixe-a tossir, pois a tosse é o mecanismo mais eficaz.',
      'Engasgo grave: a criança NÃO emite som, não consegue chorar, tossir ou respirar, e os lábios podem ficar arroxeados.',
    ],
    whatToDoAtHome: [
      'Se a criança estiver tossindo ativamente: NÃO bata nas costas nem enfie o dedo às cegas na garganta — incentive a tosse.',
      'Em BEBÊS (< 1 ano) com engasgo GRAVE (sem som): Coloque o bebê de bruços apoiado no seu antebraço, com a cabeça mais baixa que o tórax, e aplique 5 batidas firmes entre as escápulas (costas) com a palma da mão. Em seguida, vire o bebê de frente e aplique 5 compressões no meio do peito com dois dedos. Repita até desobstruir.',
      'Em CRIANÇAS MAIORES (> 1 ano): Posicione-se atrás da criança e realize a Manobra de Heimlich (compressões rápidas no abdômen, entre o umbigo e a costela, puxando para trás e para cima).',
    ],
    whenToGoToDoctor: [
      '🚨 Em caso de engasgo grave, peça para alguém LIGAR SAMU 192 IMEDIATAMENTE enquanto inicia as manobras.',
      'Se a criança perder a consciência, inicie compressões torácicas (RCP) e ligue 192.',
      'Mesmo após a saída do objeto, leve a criança a uma emergência para avaliar as vias aéreas se houve esforço intenso.',
    ],
    emergencyPhoneTip:
      'Ligue 192 (SAMU) ou 193 (Bombeiros) imediatamente se a criança não respirar.',
  },
  {
    id: 'diarreia',
    title: 'Diarreia e Desidratação',
    icon: Droplets,
    tag: 'Digestão & Hidratação',
    summary:
      'Gastroenterites virais são frequentes na infância. O maior risco da diarreia e dos vômitos é a perda de líquidos.',
    whatToObserve: [
      'Frequência e aspecto das fezes (muito líquidas, presença de sangue ou muco).',
      'Quantidade de fraldas molhadas nas últimas 6 horas (xixi reduzido ou ausente é sinal de alerta).',
      'Boca seca, olhos fundos, choro sem lágrimas e moleza (fontanela) afundada em bebês.',
    ],
    whatToDoAtHome: [
      'O pilar principal é o SORO DE REIDRATAÇÃO ORAL (comprado pronto na farmácia ou posto de saúde) oferecido aos poucos (de colher em colher).',
      'Mantenha aleitamento materno em livre demanda se a criança mama.',
      'Não interrompa a alimentação habitual: ofereça alimentos leves como banana, maçã raspada, arroz, frango cozido e purês.',
      'Evite refrigerantes, sucos muito açucarados ou remédios caseiros antidiarreicos para prender o intestino sem orientação médica.',
    ],
    whenToGoToDoctor: [
      '🚨 Sinais evidentes de desidratação: boca muito seca, sem urina por mais de 6 horas, olhos fundos ou letargia.',
      'Vômitos incontroláveis que impedem a criança de beber até mesmo soro aos goles pequenos.',
      'Fezes com sangue visível.',
      'Diarreia intensa que não melhora após 3 a 5 dias.',
      'Bebê menor de 6 meses com diarreia aguda.',
    ],
  },
  {
    id: 'resfriados',
    title: 'Resfriados, Gripes e Tosse',
    icon: Wind,
    tag: 'Respiração & Vias Aéreas',
    summary:
      'Crianças em idade de creche e escola podem ter de 6 a 10 resfriados por ano. Faz parte da maturação do sistema imune.',
    whatToObserve: [
      'Coriza (nariz escorrendo), espirros e tosse seca ou cheia.',
      'Padrão da respiração: a respiração está acelerada? A barriga ou as costelas afundam ao puxar o ar?',
      'Sono e alimentação: o nariz entupido está atrapalhando a mamada ou o descanso?',
    ],
    whatToDoAtHome: [
      'Lavagem nasal abundante com SORO FISIOLÓGICO 0,9% antes das mamadas, refeições e antes de dormir.',
      'Manter a hidratação generosa (água, sopas, água de coco ou leite).',
      'Umidificar o ambiente em dias muito secos (usar bacia de água ou umidificador limpo).',
      'Elevar suavemente a cabeceira do berço ou da cama para facilitar a respiração noturna.',
      'Evite xaropes para tosse vendidos sem receita para menores de 2 anos.',
    ],
    whenToGoToDoctor: [
      '🚨 Dificuldade respiratória clara: asas do nariz abrindo ao respirar, costelas afundando ou respiração muito rápida.',
      'Chiado no peito (cansaço) que não passa após lavagem nasal.',
      'Febre alta por mais de 3 dias ou febre que volta após ter desaparecido.',
      'Recusa alimentar total por dificuldade para respirar.',
      'Prostração acentuada mesmo nos intervalos sem febre.',
    ],
  },
  {
    id: 'alergias',
    title: 'Alergias na Pele e Picadas de Insetos',
    icon: Bug,
    tag: 'Pele & Alergias',
    summary:
      'Placas vermelhas, coceira e inchaço por contato, alimentos ou picadas de insetos comuns.',
    whatToObserve: [
      'Localização das manchas: localizadas apenas na picada ou espalhadas pelo corpo todo?',
      'Inchaço nos lábios, olhos, língua ou dificuldade para engolir ou respirar (sinal de anafilaxia).',
      'Presença de pus ou casquinhas amarelas (sinal de infecção bacteriana secundária por coçar).',
    ],
    whatToDoAtHome: [
      'Lave o local da picada com água corrente e sabão neutro.',
      'Aplique compressas frias para aliviar a coceira e reduzir o inchaço.',
      'Corte as unhas da criança para evitar que ela machuque a pele ao coçar.',
      'Use repelentes apropriados para a faixa etária da criança aprovados pela ANVISA.',
    ],
    whenToGoToDoctor: [
      '🚨 Qualquer inchaço repentino em lábios, língua, pálpebras, rouquidão ou falta de ar: EMERGÊNCIA IMEDIATA (SAMU 192).',
      'Manchas que se espalham rapidamente por todo o corpo acompanhadas de vômito ou mal-estar.',
      'Sinais de infecção na ferida (muito quente, vermelhidão extensa, dor forte ou pus).',
    ],
    emergencyPhoneTip:
      'Reações anafiláticas com falta de ar exigem SAMU 192 ou pronto-socorro imediato.',
  },
  {
    id: 'sono',
    title: 'Higiene do Sono e Rotina Noturna',
    icon: Moon,
    tag: 'Desenvolvimento & Descanso',
    summary:
      'O sono adequado é fundamental para a liberação do hormônio do crescimento (GH), fixação do aprendizado e regulação emocional.',
    whatToObserve: [
      'Quantidade de horas dormidas por dia (bebês de 1 a 2 anos: 11-14h; 3 a 5 anos: 10-13h incluindo sonecas).',
      'Presença de roncos frequentes, respiração pela boca ou sono muito agitado.',
      'Irritabilidade ou choro excessivo no final da tarde (sinal de cansaço acumulado).',
    ],
    whatToDoAtHome: [
      'Crie um ritual previsível de desaceleração: banho morno, pijama, luz baixa, historinha ou música suave.',
      'Desligue telas (TV, tablets, celulares) pelo menos 1 a 2 horas antes de dormir — a luz azul inibe a melatonina.',
      'Mantenha horários consistentes para acordar e dormir, inclusive nos finais de semana.',
      'Quarto escuro, silencioso e com temperatura agradável.',
    ],
    whenToGoToDoctor: [
      'Ronco frequente todas as noites acompanhado de pausas respiratórias (apneia).',
      'Dificuldade extrema e constante para adormecer que interfere no rendimento escolar ou no crescimento.',
      'Terror noturno com crises frequentes que colocam a criança em risco.',
    ],
  },
  {
    id: 'vacinas',
    title: 'Vacinação e Calendário em Dia',
    icon: Syringe,
    tag: 'Prevenção & Imunização',
    summary:
      'As vacinas do Programa Nacional de Imunizações (PNI) protegem contra mais de 20 doenças graves e salvam milhões de vidas.',
    whatToObserve: [
      'Caderneta de Saúde da Criança sempre atualizada com todas as doses e reforços recomendados.',
      'Reações pós-vacinais comuns: febre baixa passageira, dor local e sonolência nas primeiras 24-48 horas.',
    ],
    whatToDoAtHome: [
      'Faça compressa fria no local da injeção se houver dor ou inchaço.',
      'Não dê medicamentos preventivos antes da vacina sem recomendação expressa do posto ou pediatra.',
      'Ofereça muito carinho, colo e hidratação no dia da vacina.',
      'Mantenha a caderneta guardada em local protegido e leve-a a todas as consultas pediátricas.',
    ],
    whenToGoToDoctor: [
      'Febre muito alta (>= 39,5 °C) ou convulsão após a aplicação.',
      'Choro persistente e inconsolável por mais de 3 horas após a vacinação.',
      'Inchaço ou vermelhidão excessiva que se espalha além da articulação do membro vacinado.',
    ],
  },
]

export const GuardianHealthGuidePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [expandedTopic, setExpandedTopic] = useState<string | null>('febre')
  const { playPop } = useSound()

  const allTags = Array.from(new Set(HEALTH_TOPICS.map((t) => t.tag)))

  const filteredTopics = HEALTH_TOPICS.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.whatToObserve.some((o) => o.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.whenToGoToDoctor.some((w) => w.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesTag = selectedTag === 'all' || t.tag === selectedTag
    return matchesSearch && matchesTag
  })

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* AVISO MÉDICO OBRIGATÓRIO, PERMANENTE E NÃO DISPENSÁVEL */}
      <section
        aria-label="Aviso Médico Importante"
        className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-700 text-white rounded-3xl p-5 sm:p-7 shadow-xl border-4 border-rose-400 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white text-rose-700 flex items-center justify-center shrink-0 shadow-lg">
              <AlertTriangle className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur-xs">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Aviso Permanente de Informação Educativa</span>
              </div>

              <h2 className="text-lg sm:text-xl font-black tracking-tight leading-snug">
                ⚠️ IMPORTANTE: O CogniKids NÃO é um serviço médico
              </h2>

              <p className="text-xs sm:text-sm text-rose-50 leading-relaxed font-medium max-w-3xl">
                Não somos médicos — oferecemos exclusivamente{' '}
                <strong>dicas e informações educativas de caráter geral</strong> para apoio à rotina
                familiar. Em caso de doença, suspeita, acidente, emergência ou qualquer dúvida sobre
                a saúde da criança,{' '}
                <strong className="underline decoration-white/60">
                  consulte sempre um médico pediatra ou procure imediatamente uma unidade de saúde
                </strong>
                . O médico jamais será substituído por este aplicativo.
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-200">
              Emergência Médica no Brasil
            </p>
            <a
              href="tel:192"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-black text-sm shadow-md transition-all active:scale-95"
            >
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <span>Ligar SAMU 192</span>
            </a>
            <p className="text-[10px] text-rose-100">Ligação gratuita • 24 horas</p>
          </div>
        </div>
      </section>

      {/* Header da Central */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
            <HeartPulse className="w-4 h-4" />
            <span>Guia Prático para os Pais</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Dicas & Bem-estar Infantil
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Orientações gerais sobre situações cotidianas da infância, o que observar em casa e
            quando procurar o médico.
          </p>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Buscar por sintoma ou situação (ex: febre, queda, tosse, engasgo, diarreia)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 text-xs rounded-2xl bg-white shadow-xs"
          />
        </div>

        {/* Tags de categorias */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => {
              playPop()
              setSelectedTag('all')
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              selectedTag === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Todos ({HEALTH_TOPICS.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                playPop()
                setSelectedTag(tag)
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Cartões de Saúde */}
      <div className="space-y-4">
        {filteredTopics.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-400 space-y-2">
            <Info className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">
              Nenhum tema encontrado para essa busca.
            </p>
            <p className="text-xs text-slate-400">
              Tente buscar por febre, queda, tosse ou limpe os filtros.
            </p>
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const Icon = topic.icon
            const isExpanded = expandedTopic === topic.id

            return (
              <div
                key={topic.id}
                className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-indigo-300 shadow-md ring-1 ring-indigo-200'
                    : 'border-slate-200/90 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Header clicável do cartão */}
                <button
                  type="button"
                  onClick={() => {
                    playPop()
                    setExpandedTopic(isExpanded ? null : topic.id)
                  }}
                  className="w-full text-left p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {topic.tag}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-slate-800 truncate">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{topic.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-indigo-600 hidden sm:inline">
                      {isExpanded ? 'Recolher detalhes' : 'Ver orientações'}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Conteúdo Expandido do Cartão */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-5 animate-fade-in text-xs">
                    {/* Bloco 1: O que observar */}
                    <div className="space-y-2">
                      <h4 className="font-black text-slate-800 text-xs sm:text-sm flex items-center gap-1.5 uppercase tracking-wider text-slate-700">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span>1. O que observar</span>
                      </h4>
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                        {topic.whatToObserve.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-slate-700 leading-relaxed"
                          >
                            <span className="text-indigo-600 font-bold shrink-0">•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bloco 2: O que fazer em casa */}
                    <div className="space-y-2">
                      <h4 className="font-black text-emerald-800 text-xs sm:text-sm flex items-center gap-1.5 uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>2. O que fazer em casa (Cuidados de Conforto)</span>
                      </h4>
                      <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/70 space-y-2">
                        {topic.whatToDoAtHome.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-emerald-950 leading-relaxed"
                          >
                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bloco 3: Quando levar ao médico (Sinais de Alerta) */}
                    <div className="space-y-2">
                      <h4 className="font-black text-rose-800 text-xs sm:text-sm flex items-center gap-1.5 uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>
                          ⚠️ 3. Quando levar ao médico ou pronto-socorro (Sinais de Alerta)
                        </span>
                      </h4>
                      <div className="bg-rose-50/70 rounded-2xl p-4 border border-rose-200 space-y-2">
                        {topic.whenToGoToDoctor.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-rose-950 font-medium leading-relaxed"
                          >
                            <span className="text-rose-600 font-bold shrink-0">⚠️</span>
                            <span>{item}</span>
                          </div>
                        ))}

                        {topic.emergencyPhoneTip && (
                          <div className="mt-3 pt-3 border-t border-rose-200/80 flex items-center justify-between flex-wrap gap-2">
                            <span className="text-[11px] font-bold text-rose-800">
                              {topic.emergencyPhoneTip}
                            </span>
                            <a
                              href="tel:192"
                              className="px-3 py-1 rounded-lg bg-rose-600 text-white font-black text-[11px] flex items-center gap-1 hover:bg-rose-700"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>SAMU 192</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 italic pt-1 text-center">
                      * Conteúdo de apoio educativo geral. Não substitui consulta médica pediátrica
                      individualizada.
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
