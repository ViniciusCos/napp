'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  ArrowLeft,
  Flag,
  AlertTriangle,
  History,
  Trophy
} from 'lucide-react'

type Question = {
  id: string
  ano: number
  banca: string
  orgao: string
  disciplina: string
  tipo: 'ME' | 'CE'
  alternativas: Record<string, string | { letra?: string; texto?: string; texto_html?: string }> | null
  gabarito: string
  texto_principal_rich: string | null
  texto_apoio_rich: string | null
}

type SimuladoQuestao = {
  order_position: number
  questions: Question
}

type Simulado = {
  id: string
  title: string
  description: string | null
  duration_minutes: number
  total_questions: number
  fator_correcao: number | null
  allow_retake: boolean
  start_date: string | null
  end_date: string | null
  simulados_questoes: SimuladoQuestao[]
}

export default function SimuladoPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const simuladoId = params.id as string

  const [simulado, setSimulado] = useState<Simulado | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)
  const [hasFinished, setHasFinished] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [canStartSimulado, setCanStartSimulado] = useState(true)
  const [previousAttempt, setPreviousAttempt] = useState<{ completed_at: string; percentage: number } | null>(null)
  const [dateAvailabilityMessage, setDateAvailabilityMessage] = useState<string | null>(null)
  const [showRanking, setShowRanking] = useState(false)

  // Verificar se há tentativa em andamento
  const checkOngoingAttempt = useCallback(async (durationMinutes: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Buscar tentativa em andamento (started_at preenchido mas completed_at null)
      const { data: ongoingAttempt, error } = await supabase
        .from('simulado_attempts')
        .select('id, started_at')
        .eq('user_id', user.id)
        .eq('simulado_id', simuladoId)
        .is('completed_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Erro ao verificar tentativa em andamento:', error)
        return
      }

      if (ongoingAttempt) {
        // Calcular tempo decorrido desde o início
        const startTime = new Date(ongoingAttempt.started_at)
        const now = new Date()
        const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000)
        const totalSeconds = durationMinutes * 60
        const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)

        // Configurar estados para continuar o simulado
        setAttemptId(ongoingAttempt.id)
        setStartTime(startTime)
        setTimeRemaining(remainingSeconds)
        setHasStarted(true)

        if (remainingSeconds === 0) {
          // Tempo esgotado, mostrar tela de finalização
          toast.info('O tempo do simulado acabou!')
          setHasFinished(true)
        } else {
          toast.info(`Continuando simulado... ${Math.floor(remainingSeconds / 60)} minutos restantes`)
        }

        return true // Indica que há tentativa em andamento
      }

      return false
    } catch (error) {
      console.error('Erro ao verificar tentativa em andamento:', error)
      return false
    }
  }, [simuladoId, supabase])

  // Verificar se o usuário já fez o simulado
  const checkPreviousAttempts = useCallback(async (allowRetake: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data, error } = await supabase
        .from('simulado_attempts')
        .select('completed_at, percentage')
        .eq('user_id', user.id)
        .eq('simulado_id', simuladoId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Erro ao verificar tentativas anteriores:', error)
        return
      }

      if (data) {
        setPreviousAttempt(data)
        
        // Se não permite refazer e já tem uma tentativa completa, bloquear
        if (!allowRetake) {
          setCanStartSimulado(false)
        }
      }
    } catch (error) {
      console.error('Erro ao verificar tentativas:', error)
    }
  }, [simuladoId, supabase])

  // Carregar simulado e questões
  const loadSimulado = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('simulados')
        .select(`
          *,
          simulados_questoes (
            order_position,
            questions (*)
          )
        `)
        .eq('id', simuladoId)
        .single()

      if (error) {
        toast.error('Erro ao carregar simulado', {
          description: error.message
        })
        router.push('/dashboard/simulados')
        return
      }

      if (!data) {
        toast.error('Simulado não encontrado')
        router.push('/dashboard/simulados')
        return
      }

      setSimulado(data)
      setShowRanking(data.show_ranking ?? false)
      
      // Verificar disponibilidade por data
      const now = new Date()
      const startDate = data.start_date ? new Date(data.start_date) : null
      const endDate = data.end_date ? new Date(data.end_date) : null

      if (startDate && now < startDate) {
        setCanStartSimulado(false)
        setDateAvailabilityMessage(
          `Este simulado estará disponível a partir de ${startDate.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}`
        )
      } else if (endDate && now > endDate) {
        setCanStartSimulado(false)
        setDateAvailabilityMessage(
          `Este simulado encerrou em ${endDate.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}`
        )
      }
      
      // Ordenar questões pela posição
      const sortedQuestions = data.simulados_questoes
        .sort((a: SimuladoQuestao, b: SimuladoQuestao) => a.order_position - b.order_position)
        .map((sq: SimuladoQuestao) => sq.questions)
      
      setQuestions(sortedQuestions)
      setTimeRemaining(data.duration_minutes * 60) // Converter para segundos

      // Só verificar tentativas se o simulado estiver disponível por data
      if (!dateAvailabilityMessage) {
        // Verificar se há tentativa em andamento
        const hasOngoing = await checkOngoingAttempt(data.duration_minutes)

        // Se não houver tentativa em andamento, verificar tentativas anteriores
        if (!hasOngoing) {
          await checkPreviousAttempts(data.allow_retake)
        }
      }
    } catch {
      toast.error('Erro inesperado ao carregar simulado')
      router.push('/dashboard/simulados')
    } finally {
      setIsLoading(false)
    }
  }, [simuladoId, supabase, router, checkOngoingAttempt, checkPreviousAttempts])

  useEffect(() => {
    loadSimulado()
  }, [loadSimulado])

  // Prevenir saída da página quando o simulado estiver ativo
  useEffect(() => {
    if (!hasStarted || hasFinished) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = 'O tempo do simulado continuará correndo. Deseja realmente sair?'
      return e.returnValue
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasStarted, hasFinished])

  // Timer
  useEffect(() => {
    if (!hasStarted || hasFinished || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleFinish()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [hasStarted, hasFinished, timeRemaining])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswer = (answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  // Iniciar tentativa no banco de dados
  const startAttempt = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !simulado) return

      const { data, error } = await supabase
        .from('simulado_attempts')
        .insert({
          user_id: user.id,
          simulado_id: simuladoId,
          total_questions: questions.length,
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao iniciar tentativa:', error)
        toast.error('Erro ao registrar início do simulado')
        return
      }

      setAttemptId(data.id)
      setStartTime(new Date())
      toast.success('Simulado iniciado!')
    } catch (error) {
      console.error('Erro ao iniciar tentativa:', error)
    }
  }

  // Salvar resultados no banco de dados
  const saveResults = async () => {
    if (!attemptId || !startTime) {
      console.error('Attempt ID ou startTime não encontrado')
      return
    }

    try {
      const score = calculateScore()
      const endTime = new Date()
      const timeSpentSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)

      // Atualizar a tentativa com os resultados
      const { error: attemptError } = await supabase
        .from('simulado_attempts')
        .update({
          completed_at: endTime.toISOString(),
          time_spent_seconds: timeSpentSeconds,
          correct_answers: score.correct,
          incorrect_answers: score.incorrect,
          blank_answers: score.total - Object.keys(userAnswers).length,
          final_score: score.finalScore,
          percentage: score.percentage,
          penalty_applied: score.penaltyApplied
        })
        .eq('id', attemptId)

      if (attemptError) {
        console.error('Erro ao salvar resultado da tentativa:', attemptError)
        toast.error('Erro ao salvar resultado')
        return
      }

      // Salvar as respostas individuais
      const answers = questions.map((question, index) => ({
        attempt_id: attemptId,
        question_id: question.id,
        user_answer: userAnswers[index] || null,
        correct_answer: question.gabarito,
        is_correct: userAnswers[index] === question.gabarito,
        question_order: index + 1
      }))

      const { error: answersError } = await supabase
        .from('simulado_answers')
        .insert(answers)

      if (answersError) {
        console.error('Erro ao salvar respostas:', answersError)
        toast.error('Erro ao salvar respostas')
        return
      }

      toast.success('Resultado salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar resultados:', error)
      toast.error('Erro ao salvar resultados')
    }
  }

  const handleNavigateAway = (navigationFn: () => void) => {
    if (hasStarted && !hasFinished) {
      setPendingNavigation(() => navigationFn)
      setShowExitDialog(true)
    } else {
      navigationFn()
    }
  }

  const confirmExit = () => {
    if (pendingNavigation) {
      pendingNavigation()
    }
    setShowExitDialog(false)
    setPendingNavigation(null)
  }

  const cancelExit = () => {
    setShowExitDialog(false)
    setPendingNavigation(null)
  }

  const handleFinish = async () => {
    // Salvar resultados antes de finalizar
    await saveResults()
    setHasFinished(true)
  }

  const calculateScore = () => {
    let correct = 0
    let incorrect = 0
    
    questions.forEach((question, index) => {
      if (userAnswers[index]) {
        if (userAnswers[index] === question.gabarito) {
          correct++
        } else {
          incorrect++
        }
      }
    })

    // Aplicar fator de correção se definido
    let finalScore = correct
    if (simulado?.fator_correcao && simulado.fator_correcao > 0) {
      const penalty = Math.floor(incorrect / simulado.fator_correcao)
      finalScore = Math.max(0, correct - penalty) // Não pode ser negativo
    }
    
    return {
      correct,
      incorrect,
      finalScore,
      total: questions.length,
      percentage: Math.round((finalScore / questions.length) * 100),
      hasPenalty: simulado?.fator_correcao ? true : false,
      penaltyApplied: simulado?.fator_correcao ? Math.floor(incorrect / simulado.fator_correcao) : 0
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando simulado...</p>
        </div>
      </div>
    )
  }

  if (!simulado || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Simulado não encontrado ou sem questões</p>
          <Button onClick={() => router.push('/dashboard/simulados')}>
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  // Tela de início
  if (!hasStarted) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/simulados')}
          className="mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{simulado.title}</CardTitle>
            {simulado.description && (
              <CardDescription className="text-base mt-2">
                {simulado.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`grid grid-cols-1 gap-4 ${simulado.fator_correcao ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Questões</p>
                <p className="text-2xl font-bold">{simulado.total_questions}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Duração</p>
                <p className="text-2xl font-bold">{simulado.duration_minutes} min</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Tipo</p>
                <p className="text-2xl font-bold">Simulado</p>
              </div>
              {simulado.fator_correcao && (
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-600">Fator de Correção</p>
                  <p className="text-2xl font-bold text-orange-700">{simulado.fator_correcao}:1</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Instruções:</h3>
              <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                <li>O timer iniciará assim que você clicar em &quot;Iniciar Simulado&quot;</li>
                <li>Você pode navegar entre as questões livremente</li>
                <li>Suas respostas serão salvas automaticamente</li>
                <li>Ao finalizar o tempo, o simulado será encerrado automaticamente</li>
                <li>Você pode finalizar o simulado a qualquer momento</li>
                {simulado.fator_correcao && (
                  <li className="text-orange-600 font-semibold">
                    Este simulado possui fator de correção {simulado.fator_correcao}:1 - cada {simulado.fator_correcao} questões erradas anulam 1 acerto
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Atenção:
              </h3>
              <p className="text-orange-800 text-sm">
                Se você sair desta tela durante o simulado, o tempo continuará correndo. 
                Certifique-se de estar em um local tranquilo e com tempo disponível antes de iniciar.
              </p>
            </div>

            {dateAvailabilityMessage && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Simulado indisponível
                </h3>
                <p className="text-yellow-800 text-sm">
                  {dateAvailabilityMessage}
                </p>
              </div>
            )}

            {!canStartSimulado && previousAttempt && !dateAvailabilityMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Simulado já realizado
                </h3>
                <p className="text-red-800 text-sm mb-2">
                  Você já realizou este simulado e não é permitido refazê-lo.
                </p>
                <div className="bg-white rounded p-3 mt-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Data de conclusão:</span>{' '}
                    {new Date(previousAttempt.completed_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-semibold">Sua pontuação:</span>{' '}
                    {previousAttempt.percentage?.toFixed(0) || 0}%
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex gap-4">
                {previousAttempt && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 cursor-pointer gap-2"
                    onClick={() => router.push(`/dashboard/simulados/${simuladoId}/historico`)}
                  >
                    <History className="h-4 w-4" />
                    Ver Histórico
                  </Button>
                )}
                
                <Button
                  size="lg"
                  className={`${previousAttempt ? 'flex-1' : 'w-full'} cursor-pointer`}
                  onClick={async () => {
                    setHasStarted(true)
                    await startAttempt()
                  }}
                  disabled={!canStartSimulado}
                >
                  {canStartSimulado ? 'Iniciar Simulado' : 'Simulado Indisponível'}
                </Button>
              </div>

              {showRanking && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full cursor-pointer gap-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                  onClick={() => router.push(`/dashboard/simulados/${simuladoId}/ranking`)}
                >
                  <Trophy className="h-4 w-4" />
                  Ver Ranking Público
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Tela de resultado
  if (hasFinished) {
    const score = calculateScore()
    
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Simulado Finalizado!</CardTitle>
            <CardDescription>Confira seu desempenho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-blue-100 mb-4">
                  <span className="text-4xl font-bold text-blue-600">{score.percentage}%</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {score.hasPenalty ? (
                    <>
                      Pontuação: {score.finalScore} de {score.total}
                      {score.penaltyApplied > 0 && (
                        <span className="text-base text-orange-600 block mt-1">
                          ({score.correct} acertos - {score.penaltyApplied} penalidade = {score.finalScore})
                        </span>
                      )}
                    </>
                  ) : (
                    `${score.correct} de {score.total} questões corretas`
                  )}
                </h3>
                <p className="text-gray-600">
                  {score.percentage >= 70 ? 'Parabéns! Ótimo desempenho!' : 
                   score.percentage >= 50 ? 'Bom trabalho! Continue praticando.' :
                   'Continue estudando. Você consegue melhorar!'}
                </p>
                {score.hasPenalty && simulado?.fator_correcao && (
                  <p className="text-sm text-gray-500 mt-2">
                    Fator de correção aplicado: cada {simulado.fator_correcao} erradas = -1 ponto
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Acertos</p>
                  <p className="text-3xl font-bold text-green-700">{score.correct}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">Erros</p>
                  <p className="text-3xl font-bold text-red-700">{score.incorrect}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Em branco</p>
                  <p className="text-3xl font-bold text-gray-700">
                    {score.total - Object.keys(userAnswers).length}
                  </p>
                </div>
                {score.hasPenalty && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600">Nota Final</p>
                    <p className="text-3xl font-bold text-orange-700">{score.finalScore}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => handleNavigateAway(() => router.push('/dashboard/simulados'))}
                >
                  Voltar para Simulados
                </Button>
                <Button
                  variant="outline"
                  className="cursor-pointer gap-2"
                  onClick={() => router.push(`/dashboard/simulados/${simuladoId}/historico`)}
                >
                  <History className="h-4 w-4" />
                  Ver Histórico
                </Button>
                <Button
                  className="cursor-pointer"
                  onClick={() => {
                    setHasStarted(false)
                    setHasFinished(false)
                    setCurrentQuestionIndex(0)
                    setUserAnswers({})
                    setTimeRemaining(simulado.duration_minutes * 60)
                    setAttemptId(null)
                    setStartTime(null)
                  }}
                  disabled={!simulado.allow_retake}
                >
                  Refazer Simulado
                </Button>
              </div>

              {showRanking && (
                <Button
                  variant="outline"
                  className="w-full cursor-pointer gap-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                  onClick={() => router.push(`/dashboard/simulados/${simuladoId}/ranking`)}
                >
                  <Trophy className="h-4 w-4" />
                  Ver Ranking Público
                </Button>
              )}
              
              {!simulado.allow_retake && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Este simulado não permite refazer. Você pode consultar seu histórico de resultados.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const answeredCount = Object.keys(userAnswers).length

  return (
    <>
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Tem certeza que deseja sair?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="text-base">
                O tempo do simulado continuará correndo mesmo que você saia desta tela.
              </p>
              <p className="text-sm text-orange-600 font-semibold">
                ⏱️ Tempo restante: {formatTime(timeRemaining)}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelExit} className="cursor-pointer">
              Continuar no Simulado
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit} className="cursor-pointer bg-red-600 hover:bg-red-700">
              Sair Mesmo Assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col h-full">
      {/* Header com Timer e Progresso */}
      <div className="bg-white border-b p-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">{simulado.title}</h1>
              <Badge variant="outline">
                Questão {currentQuestionIndex + 1} de {questions.length}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-700'}`}>
                <Clock className="h-5 w-5" />
                <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
              </div>
              
              <Button
                variant="destructive"
                onClick={handleFinish}
                className="cursor-pointer"
              >
                <Flag className="h-4 w-4 mr-2" />
                Finalizar
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{answeredCount} de {questions.length} respondidas</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Questão */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant="outline">{currentQuestion.ano}</Badge>
                    <Badge variant="default">{currentQuestion.banca}</Badge>
                    <Badge variant="secondary">{currentQuestion.orgao}</Badge>
                    <Badge className={currentQuestion.tipo === 'ME' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                      {currentQuestion.tipo === 'ME' ? 'Múltipla Escolha' : 'Certo/Errado'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{currentQuestion.disciplina}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Enunciado */}
                  {currentQuestion.texto_principal_rich && (
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentQuestion.texto_principal_rich }}
                    />
                  )}

                  {/* Texto de Apoio */}
                  {currentQuestion.texto_apoio_rich && (
                    <div 
                      className="p-4 bg-gray-50 rounded-lg prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentQuestion.texto_apoio_rich }}
                    />
                  )}

                  {/* Alternativas */}
                  <div className="space-y-3">
                    {currentQuestion.alternativas ? (
                      Object.entries(currentQuestion.alternativas).map(([key, value]) => {
                        // Lidar com diferentes formatos de alternativas
                        let alternativeText = '';
                        let alternativeLetter = key;
                        
                        if (typeof value === 'string') {
                          alternativeText = value;
                        } else if (value && typeof value === 'object') {
                          // Se for objeto com texto ou texto_html
                          const altObj = value as { letra?: string; texto?: string; texto_html?: string };
                          alternativeLetter = altObj.letra || key;
                          alternativeText = altObj.texto || altObj.texto_html || '';
                        }

                        return (
                          <button
                            key={key}
                            onClick={() => handleAnswer(key)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                              userAnswers[currentQuestionIndex] === key
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                userAnswers[currentQuestionIndex] === key
                                  ? 'border-blue-600 bg-blue-600'
                                  : 'border-gray-300'
                              }`}>
                                {userAnswers[currentQuestionIndex] === key && (
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <span className="font-semibold mr-2">{alternativeLetter})</span>
                                <span>{alternativeText}</span>
                              </div>
                            </div>
                          </button>
                        )
                      })
                    ) : (
                      <p className="text-gray-500 italic">Alternativas não disponíveis</p>
                    )}
                  </div>

                  {/* Navegação */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                      className="cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Anterior
                    </Button>
                    
                    <Button
                      onClick={handleNext}
                      disabled={currentQuestionIndex === questions.length - 1}
                      className="cursor-pointer"
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mapa de Questões */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-sm">Navegação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleGoToQuestion(index)}
                        className={`aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-semibold transition-colors ${
                          currentQuestionIndex === index
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : userAnswers[index]
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-6 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border-2 border-blue-600 bg-blue-600"></div>
                      <span className="text-gray-600">Atual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border-2 border-green-500 bg-green-50"></div>
                      <span className="text-gray-600">Respondida</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border-2 border-gray-200"></div>
                      <span className="text-gray-600">Não respondida</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

