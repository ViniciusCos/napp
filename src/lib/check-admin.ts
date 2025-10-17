import { createClient } from '@/lib/supabase/server'

export async function checkIsAdmin() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    return false
  }

  return data.role === 'admin'
}

export async function requireAdmin() {
  const isAdmin = await checkIsAdmin()
  
  if (!isAdmin) {
    throw new Error('Acesso negado. Apenas administradores podem acessar esta página.')
  }
  
  return true
}

