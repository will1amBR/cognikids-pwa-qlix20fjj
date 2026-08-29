import React, { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setError('Token de recuperação ausente ou inválido.')
      return
    }
    if (password.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (password !== passwordConfirm) {
      setError('As senhas não coincidem.')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm)
      setIsSuccess(true)
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Token expirado ou inválido. Solicite um novo link.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Redefinir senha" subtitle="Digite sua nova senha de acesso">
      {isSuccess ? (
        <div className="space-y-4 text-center">
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-start gap-3 text-left text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Senha redefinida com sucesso!</p>
              <p className="text-emerald-700 mt-1">
                Agora você já pode fazer login com sua nova senha.
              </p>
            </div>
          </div>
          <Link to="/login">
            <Button className="w-full h-11 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold">
              Fazer login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <Label htmlFor="password" className="text-xs font-bold text-slate-700">
              Nova senha (mínimo 8 caracteres)
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="rounded-2xl h-11"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <Label htmlFor="passwordConfirm" className="text-xs font-bold text-slate-700">
              Confirmar nova senha
            </Label>
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={isLoading}
              className="rounded-2xl h-11"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Salvando nova senha…</span>
              </>
            ) : (
              'Redefinir senha'
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
