import { requireAdmin } from '@/lib/check-admin'
import { redirect } from 'next/navigation'
import { AdminTabs } from '@/components/admin/admin-tabs'

export default async function AdminPage() {
  try {
    await requireAdmin()
  } catch {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-full flex flex-col p-8">
      <div className="mb-8 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
          <p className="text-gray-600 mt-2">
            Gerencie questões, simulados e usuários
          </p>
        </div>
      </div>

      <AdminTabs />
    </div>
  )
}

