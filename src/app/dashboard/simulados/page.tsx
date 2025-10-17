import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, FileText, Play, Calculator, CheckCircle2, Calendar, CalendarX } from 'lucide-react'
import Link from 'next/link'

export default async function SimuladosPage() {
  const supabase = await createClient()

  // Buscar simulados ativos
  const { data: simulados, error } = await supabase
    .from('simulados')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar simulados:', error)
  }

  // Filtrar simulados por disponibilidade de data
  const now = new Date()
  const availableSimulados = simulados?.filter((simulado) => {
    const startDate = simulado.start_date ? new Date(simulado.start_date) : null
    const endDate = simulado.end_date ? new Date(simulado.end_date) : null

    // Se não tem data de início, está disponível
    if (!startDate && !endDate) return true

    // Verificar se está dentro do período
    const isAfterStart = !startDate || now >= startDate
    const isBeforeEnd = !endDate || now <= endDate

    return isAfterStart && isBeforeEnd
  }) || []

  // Função para obter o status do simulado
  const getSimuladoStatus = (simulado: { start_date: string | null; end_date: string | null }) => {
    if (!simulado.start_date && !simulado.end_date) {
      return null
    }

    const startDate = simulado.start_date ? new Date(simulado.start_date) : null
    const endDate = simulado.end_date ? new Date(simulado.end_date) : null

    if (startDate && now < startDate) {
      return { label: 'Agendado', variant: 'outline' as const }
    }

    if (endDate && now > endDate) {
      return { label: 'Encerrado', variant: 'destructive' as const }
    }

    if (endDate) {
      const hoursRemaining = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      if (hoursRemaining <= 24) {
        return { label: 'Encerrando em breve', variant: 'destructive' as const }
      }
    }

    return null
  }

  // Função para formatar data
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Buscar tentativas do usuário para marcar simulados já realizados
  const { data: { user } } = await supabase.auth.getUser()
  let completedSimuladoIds = new Set<string>()

  if (user) {
    const { data: attempts } = await supabase
      .from('simulado_attempts')
      .select('simulado_id, completed_at, percentage')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)

    if (attempts) {
      completedSimuladoIds = new Set(attempts.map(a => a.simulado_id))
    }
  }

  return (
    <div className="p-8 h-full overflow-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Simulados</h1>
        <p className="text-gray-600 mt-2">
          Escolha um simulado e teste seus conhecimentos
        </p>
      </div>

      {availableSimulados && availableSimulados.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableSimulados.map((simulado) => {
            const isCompleted = completedSimuladoIds.has(simulado.id)
            const status = getSimuladoStatus(simulado)
            
            return (
              <Link key={simulado.id} href={`/dashboard/simulados/${simulado.id}`}>
                <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-2">
                      <span className="line-clamp-2">{simulado.title}</span>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        {isCompleted && (
                          <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle2 className="h-3 w-3" />
                            Realizado
                          </Badge>
                        )}
                        {status && (
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                    {simulado.description && (
                      <CardDescription className="line-clamp-3">
                        {simulado.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{simulado.total_questions} questões</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{simulado.duration_minutes} min</span>
                      </div>
                    </div>
                    {simulado.fator_correcao && (
                      <div className="flex items-center gap-1 text-sm text-orange-600">
                        <Calculator className="h-4 w-4" />
                        <span>Fator de correção {simulado.fator_correcao}:1</span>
                      </div>
                    )}
                    
                    {/* Datas de disponibilidade */}
                    {(simulado.start_date || simulado.end_date) && (
                      <div className="flex flex-col gap-1 text-xs text-gray-600 pt-2 border-t">
                        {simulado.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-green-600" />
                            <span>Início: {formatDateTime(simulado.start_date)}</span>
                          </div>
                        )}
                        {simulado.end_date && (
                          <div className="flex items-center gap-1">
                            <CalendarX className="h-3 w-3 text-red-600" />
                            <span>Término: {formatDateTime(simulado.end_date)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button className="w-full gap-2 cursor-pointer">
                    <Play className="h-4 w-4" />
                    {isCompleted ? 'Acessar Simulado' : 'Iniciar Simulado'}
                  </Button>
                </CardContent>
              </Card>
            </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum simulado disponível
              </h3>
              <p className="text-gray-600">
                Novos simulados serão adicionados em breve. Fique atento!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

