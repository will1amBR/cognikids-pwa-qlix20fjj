import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchChildren, deleteChild, getChildAvatarUrl } from '@/services/children'
import type { Child } from '@/types/cognikids'
import { formatChildAge } from '@/types/cognikids'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, UserPlus, Play, ArrowLeft } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

export const ChildrenListPage: React.FC = () => {
  const [childrenList, setChildrenList] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [childToDelete, setChildToDelete] = useState<Child | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  const loadData = async () => {
    setIsLoading(false)
    const list = await fetchChildren()
    setChildrenList(list)
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDeleteConfirm = async () => {
    if (!childToDelete) return
    try {
      await deleteChild(childToDelete.id)
      toast({
        title: 'Perfil removido',
        description: `O perfil de ${childToDelete.name} foi apagado com sucesso.`,
      })
      setChildrenList((prev) => prev.filter((c) => c.id !== childToDelete.id))
    } catch (_) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível apagar o perfil.',
        variant: 'destructive',
      })
    } finally {
      setChildToDelete(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">Perfis das Crianças</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gerencie os dados e personalize a experiência de cada filho
          </p>
        </div>

        <Link to="/app/children/new">
          <Button className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20">
            <Plus className="w-4 h-4 mr-1.5" />
            Nova criança
          </Button>
        </Link>
      </div>

      {childrenList.length === 0 && !isLoading ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
          <p className="text-base font-bold text-slate-700">Nenhuma criança cadastrada ainda.</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Cadastre um perfil para iniciar as atividades adaptadas por idade.
          </p>
          <Link to="/app/children/new">
            <Button className="bg-orange-500 hover:bg-orange-600 rounded-2xl text-white font-bold">
              Cadastrar primeira criança
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {childrenList.map((child) => {
            const avatarUrl = getChildAvatarUrl(child)
            return (
              <div
                key={child.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-sm overflow-hidden shrink-0"
                    style={{ backgroundColor: child.favorite_color || '#FF7A45' }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={child.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      child.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-800">{child.name}</h3>
                    <p className="text-xs font-semibold text-slate-500">
                      {formatChildAge(child.birth_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/app/child/${child.id}`)}
                    className="rounded-xl text-orange-600 hover:bg-orange-50 font-bold"
                  >
                    <Play className="w-4 h-4 fill-current mr-1" />
                    Jogar
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => navigate(`/app/children/${child.id}/edit`)}
                    className="w-9 h-9 rounded-xl text-slate-600 hover:bg-slate-100"
                    title="Editar dados"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setChildToDelete(child)}
                    className="w-9 h-9 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                    title="Excluir perfil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!childToDelete} onOpenChange={(open) => !open && setChildToDelete(null)}>
        <AlertDialogContent className="rounded-3xl p-6 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-800 text-center">
              Excluir perfil?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-slate-500">
              Excluir o perfil de <b>{childToDelete?.name}</b> apagará todo o histórico de jogadas e
              progresso. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel className="rounded-2xl font-semibold border-slate-200">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="rounded-2xl font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
