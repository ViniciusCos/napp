import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Clock, CheckCircle2, XCircle, FileQuestion, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function HistoricoSimuladoPage({ params }: PageProps) {
  const { id: simuladoId } = await params
  const supabase = await createClient()

  // Buscar dados do simulado
  const { data: simulado, error: simuladoError } = await supabase
    .from('simulados')
    .select('id, title, description, duration_minutes, total_questions, fator_correcao')
    .eq('id', simuladoId)
    .single()

  if (simuladoError || !simulado) {
    redirect('/dashboard/simulados')
  }

  // Buscar usuário autenticado
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar histórico de tentativas
  const { data: attempts, error: attemptsError } = await supabase
    .from('simulado_attempts')
    .select('*')
    .eq('user_id', user.id)
    .eq('simulado_id', simuladoId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })

  if (attemptsError) {
    console.error('Erro ao buscar histórico:', attemptsError)
  }

  // Calcular estatísticas gerais
  const totalAttempts = attempts?.length || 0
  const avgPercentage = attempts && attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length)
    : 0
  const bestPercentage = attempts && attempts.length > 0
    ? Math.max(...attempts.map(a => a.percentage || 0))
    : 0

  return (
    <div className="p-8 h-full overflow-auto">
      <div className="max-w-6xl mx-auto">
        <Link href={`/dashboard/simulados/${simuladoId}`}>
          <Button variant="ghost" className="mb-6 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Simulado
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{simulado.title}</h1>
          <p className="text-gray-600">Histórico de Resultados</p>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total de Tentativas</p>
                <p className="text-3xl font-bold text-blue-600">{totalAttempts}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Média de Acerto</p>
                <p className="text-3xl font-bold text-green-600">{avgPercentage}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Melhor Resultado</p>
                <p className="text-3xl font-bold text-purple-600">{bestPercentage}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Tentativas */}
        {attempts && attempts.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Tentativas Anteriores</h2>
            {attempts.map((attempt, index) => {
              const isFirstAttempt = index === attempts.length - 1
              const previousAttempt = index < attempts.length - 1 ? attempts[index + 1] : null
              const percentageDiff = previousAttempt 
                ? (attempt.percentage || 0) - (previousAttempt.percentage || 0)
                : 0

              return (
                <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {new Date(attempt.completed_at!).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {index === 0 && (
                            <Badge className="bg-blue-100 text-blue-800">Mais Recente</Badge>
                          )}
                          {isFirstAttempt && (
                            <Badge variant="outline">Primeira Tentativa</Badge>
                          )}
                        </CardTitle>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">
                          {attempt.percentage?.toFixed(0) || 0}%
                        </div>
                        {!isFirstAttempt && percentageDiff !== 0 && (
                          <div className={`text-sm flex items-center gap-1 justify-end mt-1 ${
                            percentageDiff > 0 ? 'text-green-600' : percentageDiff < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {percentageDiff > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : percentageDiff < 0 ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                            {percentageDiff > 0 ? '+' : ''}{percentageDiff.toFixed(0)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Acertos</p>
                          <p className="text-lg font-semibold text-green-700">{attempt.correct_answers}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-sm text-gray-600">Erros</p>
                          <p className="text-lg font-semibold text-red-700">{attempt.incorrect_answers}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FileQuestion className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600">Em Branco</p>
                          <p className="text-lg font-semibold text-gray-700">{attempt.blank_answers}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Tempo</p>
                          <p className="text-lg font-semibold text-blue-700">
                            {attempt.time_spent_seconds 
                              ? `${Math.floor(attempt.time_spent_seconds / 60)}min`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {simulado.fator_correcao && attempt.penalty_applied > 0 && (
                      <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm text-orange-800">
                          <span className="font-semibold">Fator de correção aplicado:</span> {' '}
                          {attempt.correct_answers} acertos - {attempt.penalty_applied} penalidade = {' '}
                          <span className="font-bold">{attempt.final_score} pontos</span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileQuestion className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma tentativa registrada
                </h3>
                <p className="text-gray-600 mb-6">
                  Você ainda não realizou este simulado.
                </p>
                <Link href={`/dashboard/simulados/${simuladoId}`}>
                  <Button className="cursor-pointer">
                    Iniciar Simulado
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

