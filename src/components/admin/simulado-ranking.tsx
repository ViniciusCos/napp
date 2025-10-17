'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Trophy, Medal, Award, Clock, Target, TrendingUp, Calendar, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

type RankingEntry = {
  position: number
  user_id: string
  user_name: string
  user_email: string
  completed_at: string
  time_spent_seconds: number
  correct_answers: number
  incorrect_answers: number
  blank_answers: number
  final_score: number
  percentage: number
  penalty_applied: number
}

type SimuladoStats = {
  total_attempts: number
  average_score: number
  average_percentage: number
  average_time: number
  best_score: number
  worst_score: number
}

interface SimuladoRankingProps {
  simuladoId: string
  simuladoTitle?: string
}

export function SimuladoRanking({ simuladoId, simuladoTitle }: SimuladoRankingProps) {
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [stats, setStats] = useState<SimuladoStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadRanking()
  }, [simuladoId])

  const loadRanking = async () => {
    setIsLoading(true)
    try {
      // Buscar todas as tentativas completadas do simulado com dados do usuário
      const { data: attempts, error } = await supabase
        .from('simulado_attempts')
        .select(`
          user_id,
          completed_at,
          time_spent_seconds,
          correct_answers,
          incorrect_answers,
          blank_answers,
          final_score,
          percentage,
          penalty_applied,
          users (
            name,
            email
          )
        `)
        .eq('simulado_id', simuladoId)
        .not('completed_at', 'is', null)
        .order('final_score', { ascending: false })
        .order('percentage', { ascending: false })
        .order('time_spent_seconds', { ascending: true })

      if (error) {
        toast.error('Erro ao carregar ranking', {
          description: error.message
        })
        return
      }

      if (!attempts || attempts.length === 0) {
        setRanking([])
        setStats(null)
        return
      }

      // Processar dados para o ranking
      const rankingData: RankingEntry[] = attempts.map((attempt, index) => ({
        position: index + 1,
        user_id: attempt.user_id,
        user_name: (attempt.users as any)?.name || 'Usuário desconhecido',
        user_email: (attempt.users as any)?.email || '',
        completed_at: attempt.completed_at!,
        time_spent_seconds: attempt.time_spent_seconds || 0,
        correct_answers: attempt.correct_answers,
        incorrect_answers: attempt.incorrect_answers,
        blank_answers: attempt.blank_answers,
        final_score: attempt.final_score || 0,
        percentage: attempt.percentage || 0,
        penalty_applied: attempt.penalty_applied
      }))

      setRanking(rankingData)

      // Calcular estatísticas
      const totalAttempts = attempts.length
      const scores = attempts.map(a => a.final_score || 0)
      const percentages = attempts.map(a => a.percentage || 0)
      const times = attempts.map(a => a.time_spent_seconds || 0)

      setStats({
        total_attempts: totalAttempts,
        average_score: scores.reduce((a, b) => a + b, 0) / totalAttempts,
        average_percentage: percentages.reduce((a, b) => a + b, 0) / totalAttempts,
        average_time: times.reduce((a, b) => a + b, 0) / totalAttempts,
        best_score: Math.max(...scores),
        worst_score: Math.min(...scores)
      })
    } catch (error) {
      console.error('Erro ao carregar ranking:', error)
      toast.error('Erro inesperado ao carregar ranking')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes}min ${secs}s`
  }

  const exportToCSV = () => {
    if (ranking.length === 0) {
      toast.error('Não há dados para exportar')
      return
    }

    // Criar cabeçalho do CSV
    const headers = [
      'Posição',
      'Nome',
      'Email',
      'Pontuação Final',
      'Percentual de Acerto',
      'Acertos',
      'Erros',
      'Em Branco',
      'Penalidade',
      'Tempo Gasto',
      'Data de Conclusão'
    ]

    // Criar linhas do CSV
    const rows = ranking.map(entry => [
      entry.position,
      entry.user_name,
      entry.user_email,
      entry.final_score,
      `${entry.percentage.toFixed(2)}%`,
      entry.correct_answers,
      entry.incorrect_answers,
      entry.blank_answers,
      entry.penalty_applied,
      formatTime(entry.time_spent_seconds),
      new Date(entry.completed_at).toLocaleString('pt-BR')
    ])

    // Combinar cabeçalhos e linhas
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => 
        typeof cell === 'string' && cell.includes(',') 
          ? `"${cell}"` 
          : cell
      ).join(','))
    ].join('\n')

    // Criar blob e fazer download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `ranking_${simuladoTitle?.replace(/\s+/g, '_') || 'simulado'}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Ranking exportado com sucesso!')
  }

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return null
    }
  }

  const getPositionClass = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-yellow-50 border-yellow-200 border-2'
      case 2:
        return 'bg-gray-50 border-gray-200 border-2'
      case 3:
        return 'bg-amber-50 border-amber-200 border-2'
      default:
        return 'bg-white border-gray-200 border'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando ranking...</p>
        </div>
      </div>
    )
  }

  if (ranking.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma tentativa registrada
            </h3>
            <p className="text-gray-600">
              O ranking será exibido quando houver tentativas completadas neste simulado.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Título e Ações */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          {simuladoTitle && (
            <>
              <h2 className="text-2xl font-bold text-gray-900">Ranking - {simuladoTitle}</h2>
              <p className="text-gray-600 mt-1">
                Classificação dos participantes por desempenho
              </p>
            </>
          )}
        </div>
        {ranking.length > 0 && (
          <Button
            onClick={exportToCSV}
            className="cursor-pointer gap-2"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        )}
      </div>

      {/* Estatísticas Gerais */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Tentativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stats.total_attempts}</span>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Média de Acertos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stats.average_percentage.toFixed(1)}%</span>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tempo Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{formatTime(Math.round(stats.average_time))}</span>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Melhor Pontuação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stats.best_score}</span>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Classificação</CardTitle>
          <CardDescription>
            Ranking ordenado por pontuação final, percentual de acerto e tempo gasto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ranking.map((entry) => (
              <div
                key={`${entry.user_id}-${entry.completed_at}`}
                className={`p-4 rounded-lg transition-all ${getPositionClass(entry.position)}`}
              >
                <div className="flex items-center gap-4">
                  {/* Posição */}
                  <div className="flex-shrink-0 w-12 text-center">
                    {entry.position <= 3 ? (
                      <div className="flex items-center justify-center">
                        {getMedalIcon(entry.position)}
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-gray-400">
                        {entry.position}º
                      </span>
                    )}
                  </div>

                  {/* Informações do Usuário */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {entry.user_name}
                      </h3>
                      {entry.position === 1 && (
                        <Badge className="bg-yellow-500 text-white">
                          Campeão
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{entry.user_email}</p>
                  </div>

                  {/* Estatísticas */}
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{entry.final_score}</p>
                      <p className="text-xs text-gray-600">Pontos</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{entry.percentage.toFixed(1)}%</p>
                      <p className="text-xs text-gray-600">Acerto</p>
                    </div>

                    <div className="text-center min-w-[80px]">
                      <p className="text-sm font-semibold text-gray-700">{formatTime(entry.time_spent_seconds)}</p>
                      <p className="text-xs text-gray-600">Tempo</p>
                    </div>

                    <div className="text-center min-w-[100px]">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(entry.completed_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {new Date(entry.completed_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Detalhes de Respostas */}
                  <div className="hidden lg:flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      ✓ {entry.correct_answers}
                    </Badge>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      ✗ {entry.incorrect_answers}
                    </Badge>
                    {entry.blank_answers > 0 && (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        - {entry.blank_answers}
                      </Badge>
                    )}
                    {entry.penalty_applied > 0 && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        Penalidade: -{entry.penalty_applied}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Detalhes mobile */}
                <div className="lg:hidden mt-3 pt-3 border-t flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    ✓ {entry.correct_answers} acertos
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    ✗ {entry.incorrect_answers} erros
                  </Badge>
                  {entry.blank_answers > 0 && (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      {entry.blank_answers} em branco
                    </Badge>
                  )}
                  {entry.penalty_applied > 0 && (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      Penalidade: -{entry.penalty_applied}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

