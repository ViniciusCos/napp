'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Shield, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface UserRoleToggleProps {
  userId: string
  currentRole: string
}

export function UserRoleToggle({ userId, currentRole }: UserRoleToggleProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleToggleRole = async () => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    
    const confirmed = window.confirm(
      `Tem certeza que deseja ${newRole === 'admin' ? 'promover este usuário a administrador' : 'remover permissões de administrador'}?`
    )
    
    if (!confirmed) return

    setIsLoading(true)

    try {
      // Update user role
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) {
        toast.error('Erro ao atualizar permissões', {
          description: error.message,
        })
        return
      }

      toast.success(
        newRole === 'admin' 
          ? 'Usuário promovido a administrador com sucesso!' 
          : 'Permissões de administrador removidas com sucesso!'
      )

      router.refresh()
    } catch {
      toast.error('Erro inesperado ao atualizar permissões')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={currentRole === 'admin' ? 'destructive' : 'default'}
      size="sm"
      onClick={handleToggleRole}
      disabled={isLoading}
      className="cursor-pointer"
    >
      {currentRole === 'admin' ? (
        <>
          <ShieldOff className="h-4 w-4 mr-2" />
          {isLoading ? 'Removendo...' : 'Remover Admin'}
        </>
      ) : (
        <>
          <Shield className="h-4 w-4 mr-2" />
          {isLoading ? 'Promovendo...' : 'Promover a Admin'}
        </>
      )}
    </Button>
  )
}

