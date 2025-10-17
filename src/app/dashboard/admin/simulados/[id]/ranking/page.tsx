import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/check-admin'
import { SimuladoRanking } from '@/components/admin/simulado-ranking'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface RankingPageProps {
  params: {
    id: string
  }
}

export default async function RankingPage({ params }: RankingPageProps) {
  // Verificar se é admin
  try {
    await requireAdmin()
  } catch {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { id } = params

  // Buscar informações do simulado
  const { data: simulado, error } = await supabase
    .from('simulados')
    .select('id, title, description, total_questions, duration_minutes')
    .eq('id', id)
    .single()

  if (error || !simulado) {
    redirect('/dashboard/admin')
  }

  return (
    <div className="p-8 h-full overflow-auto">
      <div className="mb-6">
        <Link href="/dashboard/admin">
          <Button variant="ghost" className="mb-4 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Admin
          </Button>
        </Link>
      </div>

      <SimuladoRanking simuladoId={simulado.id} simuladoTitle={simulado.title} />
    </div>
  )
}

