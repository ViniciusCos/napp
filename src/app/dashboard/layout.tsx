import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar dados completos do usuário incluindo role
  const { data: userProfile } = await supabase
    .from('users')
    .select('name, email, role')
    .eq('id', user.id)
    .single()

  const userData = {
    email: userProfile?.email || user.email || '',
    nome: userProfile?.name || user.user_metadata?.nome || '',
    role: userProfile?.role || 'user',
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={userData} />
      <main className="flex-1 bg-gray-50 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

