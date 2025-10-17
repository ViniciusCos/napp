import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserSimuladoRanking } from '@/components/user-simulado-ranking'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface RankingPageProps {
  params: {
    id: string
  }
}

export default async function RankingPage({ params }: RankingPageProps) {
  const supabase = await createClient()
  const { id } = params

  // Buscar informações do simulado
  const { data: simulado, error } = await supabase
    .from('simulados')
    .select('id, title, description, total_questions, show_ranking, is_active')
    .eq('id', id)
    .single()

  if (error || !simulado) {
    redirect('/dashboard/simulados')
  }

  // Verificar se o ranking está habilitado
  if (!simulado.show_ranking) {
    redirect(`/dashboard/simulados/${id}`)
  }

  return (
    <div className="p-8 h-full overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href={`/dashboard/simulados/${id}`}>
            <Button variant="ghost" className="mb-4 cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o Simulado
            </Button>
          </Link>
        </div>

        <UserSimuladoRanking 
          simuladoId={simulado.id} 
          simuladoTitle={simulado.title}
          totalQuestions={simulado.total_questions}
        />
      </div>
    </div>
  )
}

