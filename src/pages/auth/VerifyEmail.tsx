import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Token de verificação ausente na URL.')
      setIsLoading(false)
      return
    }

    const verify = async () => {
      try {
        await pb.collection('users').confirmVerification(token)
        setIsSuccess(true)
      } catch (err: any) {
        setError('O token de verificação expirou ou é inválido.')
      } finally {
        setIsLoading(false)
      }
    }
    verify()
  }, [token])

  return (
    <AuthLayout title="Verificação de email" subtitle="Ativação da sua conta CogniKids">
      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Verificando seu email…</p>
        </div>
      ) : isSuccess ? (
        <div className="space-y-4 text-center">
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-left text-xs">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Email confirmado com sucesso! 🎉</p>
              <p className="text-emerald-700 mt-0.5">
                Sua conta está verificada e pronta para uso.
              </p>
            </div>
          </div>
          <Link to="/app">
            <Button className="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold">
              Ir para o app
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-3 text-left text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Falha na verificação</p>
              <p className="text-rose-700 mt-1">{error}</p>
            </div>
          </div>
          <Link to="/login">
            <Button className="w-full h-11 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold">
              Voltar ao login
            </Button>
          </Link>
        </div>
      )}
    </AuthLayout>
  )
}
