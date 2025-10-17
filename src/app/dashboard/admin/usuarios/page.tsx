import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/check-admin'
import { redirect } from 'next/navigation'
import { UserManagement } from '@/components/admin/user-management'

export default async function AdminUsuariosPage() {
  try {
    await requireAdmin()
  } catch {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar usuários:', error)
  }

  return (
    <div className="p-8 h-full overflow-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
        <p className="text-gray-600 mt-2">
          Controle completo de usuários, permissões e acessos
        </p>
      </div>

      <UserManagement initialUsers={users || []} />
    </div>
  )
}

