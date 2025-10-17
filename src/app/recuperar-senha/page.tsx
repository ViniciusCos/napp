'use client'

import { useState } from 'react'

export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/atualizar-senha`,
      })

      if (error) {
        toast.error('Erro ao enviar email de recuperação', {
          description: error.message,
        })
        return
      }

      setEmailSent(true)
      toast.success('Email enviado!', {
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      })
    } catch {
      toast.error('Erro inesperado ao enviar email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Recuperar Senha</CardTitle>
          <CardDescription className="text-center">
            {emailSent
              ? 'Enviamos um link de recuperação para seu email'
              : 'Digite seu email para receber um link de recuperação'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                Se o email {email} estiver cadastrado, você receberá um link para redefinir sua senha.
              </p>
              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full cursor-pointer"
              >
                Enviar novamente
              </Button>
            </div>
          )}
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="text-blue-600 hover:underline cursor-pointer">
              Voltar para login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

