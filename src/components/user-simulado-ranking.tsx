'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Trophy, Medal, Award, Clock, Target } from 'lucide-react'

type RankingEntry = {
  position: number
  user_id: string
  user_name: string
  completed_at: string
  time_spent_seconds: number
  final_score: number
  percentage: number
  is_current_user: boolean
}

interface UserSimuladoRankingProps {
  simuladoId: string
  simuladoTitle?: string
}

export function UserSimuladoRanking({ simuladoId, simuladoTitle }: UserSimuladoRankingProps) {
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const loadRanking = useCallback(async () => {
    setIsLoading(true)
    try {
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser()

      // Buscar todas as tentativas completadas do simulado com dados do usuário
      // IMPORTANTE: Selecionamos apenas o campo 'name' da tabela users para não expor dados sensíveis
      // A política RLS permite leitura, mas a aplicação é responsável por selecionar apenas campos públicos
      const { data: attempts, error } = await supabase
        .from('simulado_attempts')
        .select(`
          user_id,
          completed_at,
          time_spent_seconds,
          final_score,
          percentage,
          users!inner (
            name
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
        return
      }

      // Processar dados para o ranking
      const rankingData: RankingEntry[] = attempts.map((attempt, index) => ({
        position: index + 1,
        user_id: attempt.user_id,
        user_name: (attempt.users as { name: string }[])?.[0]?.name || 'Usuário',
        completed_at: attempt.completed_at!,
        time_spent_seconds: attempt.time_spent_seconds || 0,
        final_score: attempt.final_score || 0,
        percentage: attempt.percentage || 0,
        is_current_user: attempt.user_id === user?.id
      }))

      setRanking(rankingData)
    } catch (error) {
      console.error('Erro ao carregar ranking:', error)
      toast.error('Erro inesperado ao carregar ranking')
    } finally {
      setIsLoading(false)
    }
  }, [simuladoId, supabase])

  useEffect(() => {
    loadRanking()
  }, [loadRanking])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes}min ${secs}s`
  }

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return null
    }
  }

  const getPositionClass = (position: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-blue-50 border-blue-400 border-2'
    }
    
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

  const currentUserRank = ranking.find(entry => entry.is_current_user)

  return (
    <div className="space-y-6">
      {/* Título */}
      {simuladoTitle && (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🏆 Ranking - {simuladoTitle}
          </h2>
          <p className="text-gray-600">
            {ranking.length} {ranking.length === 1 ? 'participante' : 'participantes'}
          </p>
        </div>
      )}

      {/* Sua Posição (se participou) */}
      {currentUserRank && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Sua Posição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {currentUserRank.position}º
                  </div>
                  <p className="text-sm text-gray-600">Posição</p>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {currentUserRank.percentage.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">Acerto</p>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentUserRank.final_score}
                  </div>
                  <p className="text-sm text-gray-600">Pontos</p>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-700">
                    {formatTime(currentUserRank.time_spent_seconds)}
                  </div>
                  <p className="text-sm text-gray-600">Tempo</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ranking.slice(0, 3).map((entry, idx) => (
          <Card 
            key={`top3-${entry.user_id}-${entry.completed_at}`}
            className={`${getPositionClass(entry.position, entry.is_current_user)} ${idx === 0 ? 'md:col-start-2' : ''}`}
          >
            <CardContent className="pt-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center">
                  {getMedalIcon(entry.position)}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {entry.position}º Lugar
                  </p>
                  <p className="text-lg font-semibold text-gray-700 mt-1">
                    {entry.user_name}
                    {entry.is_current_user && ' (Você)'}
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{entry.percentage.toFixed(1)}%</p>
                    <p className="text-xs text-gray-600">Acerto</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600">{entry.final_score}</p>
                    <p className="text-xs text-gray-600">Pontos</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {formatTime(entry.time_spent_seconds)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ranking Completo */}
      <Card>
        <CardHeader>
          <CardTitle>Classificação Completa</CardTitle>
          <CardDescription>
            Ranking ordenado por pontuação final e percentual de acerto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ranking.map((entry) => (
              <div
                key={`${entry.user_id}-${entry.completed_at}`}
                className={`p-4 rounded-lg transition-all ${getPositionClass(entry.position, entry.is_current_user)}`}
              >
                <div className="flex items-center gap-4">
                  {/* Posição */}
                  <div className="flex-shrink-0 w-16 text-center">
                    {entry.position <= 3 ? (
                      <div className="flex items-center justify-center">
                        {getMedalIcon(entry.position)}
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-gray-600">
                        {entry.position}º
                      </span>
                    )}
                  </div>

                  {/* Informações do Usuário */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {entry.user_name}
                      </h3>
                      {entry.is_current_user && (
                        <Badge className="bg-blue-600">
                          Você
                        </Badge>
                      )}
                      {entry.position === 1 && (
                        <Badge className="bg-yellow-500 text-white">
                          Campeão
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="text-center min-w-[80px]">
                      <p className="text-2xl font-bold text-blue-600">{entry.final_score}</p>
                      <p className="text-xs text-gray-600">Pontos</p>
                    </div>
                    
                    <div className="text-center min-w-[80px]">
                      <p className="text-xl font-bold text-green-600">{entry.percentage.toFixed(1)}%</p>
                      <p className="text-xs text-gray-600">Acerto</p>
                    </div>

                    <div className="text-center min-w-[80px]">
                      <p className="text-sm font-semibold text-gray-700">{formatTime(entry.time_spent_seconds)}</p>
                      <p className="text-xs text-gray-600">Tempo</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

