import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Por favor, informe seu email.')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      await pb.collection('users').requestPasswordReset(email.trim())
      setIsSuccess(true)
    } catch (err: any) {
      // For security, PocketBase might still succeed or we give a gentle fallback
      setIsSuccess(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Recuperar senha" subtitle="Enviaremos um link de redefinição">
      {isSuccess ? (
        <div className="space-y-4 text-center">
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-start gap-3 text-left text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Email enviado!</p>
              <p className="text-emerald-700 mt-1 leading-relaxed">
                Se existir uma conta com o email <b>{email}</b>, você receberá um link para
                redefinir sua senha.
              </p>
            </div>
          </div>
          <Link to="/login">
            <Button className="w-full h-11 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold">
              Voltar para o login
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
            <Label htmlFor="email" className="text-xs font-bold text-slate-700">
              Email cadastrado
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="ex: voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                <span>Enviando…</span>
              </>
            ) : (
              'Enviar link de recuperação'
            )}
          </Button>

          <div className="pt-2 text-center text-xs text-slate-500">
            Lembrou da senha?{' '}
            <Link to="/login" className="text-orange-600 hover:text-orange-700 font-bold">
              Voltar ao login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
