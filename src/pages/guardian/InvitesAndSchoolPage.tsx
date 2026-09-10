import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  fetchChildren,
  fetchUserInvites,
  createInviteCode,
  redeemInviteCode,
  fetchSchoolAccessTokens,
  createSchoolAccessToken,
  toggleSchoolAccessToken,
  deleteSchoolAccessToken,
} from '@/services/children'
import type { Child, InviteRecord, SchoolAccessToken } from '@/types/cognikids'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useSound } from '@/context/SoundContext'
import {
  Share2,
  Users,
  School,
  Copy,
  Check,
  Plus,
  Trash2,
  Eye,
  Sparkles,
  Award,
  ExternalLink,
  ShieldCheck,
  QrCode,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const InvitesAndSchoolPage: React.FC = () => {
  const { toast } = useToast()
  const { playPop, playStarReward, playVictory } = useSound()
  const navigate = useNavigate()

  const [childrenList, setChildrenList] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [invites, setInvites] = useState<InviteRecord[]>([])
  const [schoolTokens, setSchoolTokens] = useState<SchoolAccessToken[]>([])

  const [redeemInput, setRedeemInput] = useState('')
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [isCreatingInvite, setIsCreatingInvite] = useState(false)

  // School modal
  const [showSchoolModal, setShowSchoolModal] = useState(false)
  const [schoolName, setSchoolName] = useState('')
  const [teacherName, setTeacherName] = useState('')
  const [schoolClassGroup, setSchoolClassGroup] = useState('')
  const [schoolNote, setSchoolNote] = useState('')
  const [schoolTargetChildId, setSchoolTargetChildId] = useState('')
  const [isCreatingSchool, setIsCreatingSchool] = useState(false)

  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const [kids, invs, schools] = await Promise.all([
        fetchChildren(),
        fetchUserInvites(),
        fetchSchoolAccessTokens(),
      ])
      setChildrenList(kids)
      if (kids.length > 0) {
        setSelectedChildId(kids[0].id)
        setSchoolTargetChildId(kids[0].id)
      }
      setInvites(invs)
      setSchoolTokens(schools)
      setIsLoading(false)
    }
    load()
  }, [])

  const handleCopy = (code: string, text: string) => {
    playPop()
    navigator.clipboard.writeText(text)
    setCopiedCode(code)
    toast({ title: 'Copiado para a área de transferência! 📋' })
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Generate peer invite code
  const handleGenerateInvite = async () => {
    playPop()
    setIsCreatingInvite(true)
    try {
      const selectedKid = childrenList.find((c) => c.id === selectedChildId)
      const newInvite = await createInviteCode(selectedKid?.id, selectedKid?.name)
      setInvites((prev) => [newInvite, ...prev])
      playStarReward(3)
      toast({
        title: 'Código gerado com sucesso! 🎉',
        description: `Código: ${newInvite.invite_code}. Compartilhe com os colegas!`,
      })
    } catch (_) {
      toast({ title: 'Erro ao gerar código de convite', variant: 'destructive' })
    } finally {
      setIsCreatingInvite(false)
    }
  }

  // Redeem peer invite code
  const handleRedeemInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!redeemInput.trim()) return

    setIsRedeeming(true)
    const selectedKid = childrenList.find((c) => c.id === selectedChildId)
    const result = await redeemInviteCode(redeemInput, selectedKid?.name)
    setIsRedeeming(false)

    if (result.success) {
      playVictory()
      if (result.invite?.class_group) {
        localStorage.setItem('cognikids_pending_class_group', result.invite.class_group)
      }
      if (result.invite?.school_name) {
        localStorage.setItem('cognikids_pending_school_name', result.invite.school_name)
      }
      toast({
        title: 'Convite Resgatado! 🎉',
        description: result.message,
      })
      setRedeemInput('')
      const invs = await fetchUserInvites()
      setInvites(invs)
    } else {
      toast({
        title: 'Não foi possível resgatar',
        description: result.message,
        variant: 'destructive',
      })
    }
  }

  // Create school access code
  const handleCreateSchoolToken = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!schoolName.trim()) {
      toast({ title: 'Nome da escola obrigatório', variant: 'destructive' })
      return
    }

    setIsCreatingSchool(true)
    try {
      const newToken = await createSchoolAccessToken({
        childId: schoolTargetChildId || undefined,
        schoolName: schoolName.trim(),
        teacherName: teacherName.trim(),
        classGroup: schoolClassGroup.trim(),
        note: schoolNote.trim(),
      })
      setSchoolTokens((prev) => [newToken, ...prev])
      setShowSchoolModal(false)
      setSchoolName('')
      setTeacherName('')
      setSchoolClassGroup('')
      setSchoolNote('')
      playStarReward(3)
      toast({
        title: 'Código da escola gerado! 🏫',
        description: `Código: ${newToken.access_code}. A equipe pedagógica pode visualizar os relatórios em modo somente leitura.`,
      })
    } catch (_) {
      toast({ title: 'Erro ao gerar código para a escola', variant: 'destructive' })
    } finally {
      setIsCreatingSchool(false)
    }
  }

  const handleDeleteSchoolToken = async (id: string) => {
    playPop()
    await deleteSchoolAccessToken(id)
    setSchoolTokens((prev) => prev.filter((t) => t.id !== id))
    toast({ title: 'Acesso da escola revogado com sucesso.' })
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <Share2 className="w-3.5 h-3.5" />
            <span>Comunidade & Escola</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Convites de Colegas & Acesso Pedagógico da Escola
          </h1>
          <p className="text-sm text-white/90 mt-1 leading-relaxed">
            Chame amiguinhos para brincar com o Tico e ganhe medalhas especiais, ou compartilhe o
            progresso com professores e pedagogos com um código seguro somente leitura.
          </p>
        </div>
      </div>

      <Tabs defaultValue="invites" className="space-y-6">
        <TabsList className="bg-slate-200/70 p-1.5 rounded-2xl h-13 max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger
            value="invites"
            className="rounded-xl font-extrabold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm flex items-center gap-1.5 justify-center"
          >
            <Users className="w-4 h-4" />
            <span>Convite de Colegas</span>
          </TabsTrigger>
          <TabsTrigger
            value="school"
            className="rounded-xl font-extrabold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm flex items-center gap-1.5 justify-center"
          >
            <School className="w-4 h-4" />
            <span>Portal da Escola</span>
          </TabsTrigger>
        </TabsList>

        {/* ================= TAB 1: COLEGAS / CONVITES ================= */}
        <TabsContent value="invites" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Generate & Redeem Form */}
            <div className="md:col-span-6 space-y-6">
              {/* Card 1: Gerar novo convite */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-800">
                      Convidar Colega de Turma
                    </h2>
                    <p className="text-xs text-slate-400">
                      Gere um código e envie pelo WhatsApp ou bilhete
                    </p>
                  </div>
                </div>

                {childrenList.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">
                      Em nome de qual criança?
                    </Label>
                    <select
                      value={selectedChildId}
                      onChange={(e) => setSelectedChildId(e.target.value)}
                      className="w-full h-11 rounded-2xl border border-slate-200 px-3 text-xs font-bold text-slate-700 bg-white"
                    >
                      {childrenList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="bg-orange-50/70 p-3.5 rounded-2xl border border-orange-200/80 text-xs text-orange-950 flex items-start gap-2">
                  <Award className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <span>
                    Quando o colega entrar com o código, você e ele desbloqueiam a medalha{' '}
                    <strong>"Amigo do Tico"</strong>!
                  </span>
                </div>

                <Button
                  onClick={handleGenerateInvite}
                  disabled={isCreatingInvite}
                  className="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isCreatingInvite ? 'Gerando código…' : 'Gerar Novo Código de Convite'}
                  </span>
                </Button>
              </div>

              {/* Card 2: Resgatar convite recebido */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-800">
                      Recebeu um Convite de um Amigo?
                    </h2>
                    <p className="text-xs text-slate-400">
                      Insira o código recebido para vincular a amizade
                    </p>
                  </div>
                </div>

                <form onSubmit={handleRedeemInvite} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Código do Convite</Label>
                    <Input
                      type="text"
                      placeholder="ex: TICO-7X9AB"
                      value={redeemInput}
                      onChange={(e) => setRedeemInput(e.target.value.toUpperCase())}
                      className="rounded-2xl h-11 uppercase font-mono font-bold tracking-wider"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isRedeeming || !redeemInput.trim()}
                    className="w-full h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    {isRedeeming ? 'Resgatando…' : 'Resgatar Convite e Ganhar Medalha'}
                  </Button>
                </form>
              </div>
            </div>

            {/* List of Generated Invites */}
            <div className="md:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500" />
                  <span>Seus Convites Gerados</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Acompanhe quem já aceitou e compartilhe os códigos ativos
                </p>

                <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {invites.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Nenhum convite gerado ainda. Clique em "Gerar Novo Código" para começar!
                    </div>
                  ) : (
                    invites.map((inv) => {
                      const shareMessage = `Olá! Meu filho(a) ${inv.sender_child_name || ''} está brincando no CogniKids e te convidou! Use o código ${inv.invite_code} no aplicativo para jogarem juntos e ganharem a medalha do Tico: ${window.location.origin}/app/community`
                      const isUsed = inv.status === 'used'

                      return (
                        <div
                          key={inv.id}
                          className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 ${
                            isUsed
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-base text-slate-800">
                                {inv.invite_code}
                              </span>
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  isUsed
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {isUsed ? 'Aceito ✓' : 'Ativo'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {isUsed
                                ? `Aceito por: ${inv.accepted_child_name || 'Amigo do Tico'}`
                                : `De: ${inv.sender_child_name || 'Sua família'}`}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(inv.invite_code, shareMessage)}
                            className="h-9 px-3 rounded-xl border-slate-300 font-bold text-xs shrink-0 flex items-center gap-1.5"
                          >
                            {copiedCode === inv.invite_code ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Copiar</span>
                              </>
                            )}
                          </Button>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">
                  Brincar junto com colegas estimula o senso de comunidade e empatia!
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ================= TAB 2: PORTAL DA ESCOLA ================= */}
        <TabsContent value="school" className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">
                    Códigos de Acesso Pedagógico da Escola
                  </h2>
                  <p className="text-xs text-slate-500">
                    Permite que coordenadores e professores visualizem o Cérebro em Flor e
                    relatórios em modo somente leitura
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setShowSchoolModal(true)}
                className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Gerar Código para a Escola</span>
              </Button>
            </div>

            {/* Explanatory Banner */}
            <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200/80 flex items-start gap-3 text-xs text-indigo-950">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Como funciona o acesso da escola: </span>
                A equipe pedagógica não precisa criar conta nem ter sua senha. Basta acessar a
                página <strong className="underline">/escola</strong> e digitar o código gerado
                abaixo para ver o progresso de desenvolvimento e temas trabalhados.
              </div>
            </div>

            {/* Tokens List */}
            <div className="space-y-3">
              {schoolTokens.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Nenhum código para a escola gerado ainda. Clique no botão acima para criar o
                  primeiro vínculo com a creche ou escola do seu filho!
                </div>
              ) : (
                schoolTokens.map((st) => {
                  const targetKid = childrenList.find((c) => c.id === st.child_id)
                  const schoolUrl = `${window.location.origin}/escola?code=${st.access_code}`

                  return (
                    <div
                      key={st.id}
                      className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-lg text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                            {st.access_code}
                          </span>
                          <span className="text-xs font-black text-slate-800">
                            {st.school_name}
                          </span>
                          {st.teacher_name && (
                            <span className="text-xs font-semibold text-slate-500">
                              (Prof(a). {st.teacher_name})
                            </span>
                          )}
                          {st.class_group && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                              Turma: {st.class_group}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              st.is_active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {st.is_active ? 'Ativo' : 'Desativado'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Criança vinculada: <strong>{targetKid ? targetKid.name : 'Todas'}</strong>
                          {targetKid?.class_group && ` (Turma: ${targetKid.class_group})`}
                          {st.note ? ` • Nota: "${st.note}"` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(st.access_code, schoolUrl)}
                          className="h-9 px-3 rounded-xl border-slate-300 font-bold text-xs flex items-center gap-1.5"
                        >
                          {copiedCode === st.access_code ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Link Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copiar Link da Escola</span>
                            </>
                          )}
                        </Button>

                        <Link to={`/escola?code=${st.access_code}`} target="_blank">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 px-3 rounded-xl text-indigo-600 hover:bg-indigo-50 font-bold text-xs flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Visualizar</span>
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSchoolToken(st.id)}
                          className="h-9 w-9 p-0 rounded-xl text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal: Create School Token */}
      <Dialog open={showSchoolModal} onOpenChange={setShowSchoolModal}>
        <DialogContent className="rounded-3xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              Gerar Código de Acesso da Escola
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Cria um link seguro de leitura para professores e pedagogos
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSchoolToken} className="space-y-4 mt-2">
            <div className="space-y-1.5 text-left">
              <Label className="text-xs font-bold text-slate-700">Criança vinculada</Label>
              <select
                value={schoolTargetChildId}
                onChange={(e) => setSchoolTargetChildId(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 px-3 text-xs font-bold text-slate-700 bg-white"
              >
                {childrenList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 text-left">
              <Label className="text-xs font-bold text-slate-700">Nome da Escola / Creche *</Label>
              <Input
                type="text"
                placeholder="ex: Escola Pequeno Príncipe"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                className="rounded-2xl h-11"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 text-left">
                <Label className="text-xs font-bold text-slate-700">
                  Professor(a) ou Pedagogo(a)
                </Label>
                <Input
                  type="text"
                  placeholder="ex: Profa. Juliana"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="rounded-2xl h-11"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <Label className="text-xs font-bold text-slate-700">Turma / Sala</Label>
                <Input
                  type="text"
                  placeholder="ex: Maternal II"
                  value={schoolClassGroup}
                  onChange={(e) => setSchoolClassGroup(e.target.value)}
                  className="rounded-2xl h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <Label className="text-xs font-bold text-slate-700">Observação ou bilhete</Label>
              <Input
                type="text"
                placeholder="ex: Relatório para reunião pedagógica do 1º bimestre"
                value={schoolNote}
                onChange={(e) => setSchoolNote(e.target.value)}
                className="rounded-2xl h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={isCreatingSchool}
              className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold mt-4"
            >
              {isCreatingSchool ? 'Gerando…' : 'Criar Código de Acesso'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
