'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Search, Plus, Trash2, GripVertical, Eye } from 'lucide-react'

type Question = {
  id: string
  ano: number
  banca: string
  orgao: string
  disciplina: string
  tipo: string
  gabarito: string
  subtopicos: string[] | null
}

type SimuladoQuestion = Question & {
  order_position: number
  simulado_question_id: string
}

interface ManageSimuladoQuestionsProps {
  simuladoId: string
  onUpdate?: () => void
}

export function ManageSimuladoQuestions({ simuladoId, onUpdate }: ManageSimuladoQuestionsProps) {
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([])
  const [simuladoQuestions, setSimuladoQuestions] = useState<SimuladoQuestion[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const supabase = createClient()

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBanca, setFilterBanca] = useState('all')
  const [filterTipo, setFilterTipo] = useState('all')
  const [filterDisciplina, setFilterDisciplina] = useState('all')

  // Carregar questões disponíveis e questões do simulado
  const loadQuestions = useCallback(async () => {
    setIsLoading(true)
    try {
      // Buscar todas as questões
      const { data: allQuestions, error: questionsError } = await supabase
        .from('questions')
        .select('id, ano, banca, orgao, disciplina, tipo, gabarito, subtopicos')
        .order('criado_em', { ascending: false })

      if (questionsError) throw questionsError

      // Buscar questões já adicionadas ao simulado
      const { data: simuladoQuestionsData, error: simuladoError } = await supabase
        .from('simulados_questoes')
        .select(`
          id,
          order_position,
          questions (
            id, ano, banca, orgao, disciplina, tipo, gabarito, subtopicos
          )
        `)
        .eq('simulado_id', simuladoId)
        .order('order_position')

      if (simuladoError) throw simuladoError

      // IDs das questões já adicionadas
      const addedQuestionIds = new Set(
        simuladoQuestionsData?.map((sq) => (sq.questions as unknown as Question).id) || []
      )

      // Filtrar questões disponíveis (que não estão no simulado)
      const available = allQuestions?.filter(q => !addedQuestionIds.has(q.id)) || []
      setAvailableQuestions(available)

      // Formatar questões do simulado
      const formatted = simuladoQuestionsData?.map((sq) => ({
        ...(sq.questions as unknown as Question),
        order_position: sq.order_position,
        simulado_question_id: sq.id
      })) || []
      setSimuladoQuestions(formatted)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao carregar questões', {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }, [simuladoId, supabase])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...availableQuestions]

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.banca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.orgao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.disciplina.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterBanca !== 'all') {
      filtered = filtered.filter(q => q.banca === filterBanca)
    }

    if (filterTipo !== 'all') {
      filtered = filtered.filter(q => q.tipo === filterTipo)
    }

    if (filterDisciplina !== 'all') {
      filtered = filtered.filter(q => q.disciplina === filterDisciplina)
    }

    setFilteredQuestions(filtered)
  }, [availableQuestions, searchTerm, filterBanca, filterTipo, filterDisciplina])

  // Adicionar questão ao simulado
  const handleAddQuestion = async (questionId: string) => {
    setIsAdding(true)
    try {
      const nextPosition = simuladoQuestions.length + 1

      const { error } = await supabase
        .from('simulados_questoes')
        .insert({
          simulado_id: simuladoId,
          question_id: questionId,
          order_position: nextPosition
        })

      if (error) throw error

      toast.success('Questão adicionada ao simulado!')
      await loadQuestions()
      if (onUpdate) onUpdate()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao adicionar questão', {
        description: errorMessage
      })
    } finally {
      setIsAdding(false)
    }
  }

  // Remover questão do simulado
  const handleRemoveQuestion = async (simuladoQuestionId: string) => {
    if (!confirm('Tem certeza que deseja remover esta questão do simulado?')) return

    try {
      const { error } = await supabase
        .from('simulados_questoes')
        .delete()
        .eq('id', simuladoQuestionId)

      if (error) throw error

      toast.success('Questão removida do simulado!')
      await loadQuestions()
      if (onUpdate) onUpdate()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao remover questão', {
        description: errorMessage
      })
    }
  }

  // Reordenar questões
  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    const newOrder = [...simuladoQuestions]
    const [moved] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, moved)

    // Atualizar ordem no estado temporariamente
    setSimuladoQuestions(newOrder)

    try {
      // Atualizar todas as posições no banco
      const updates = newOrder.map((q, index) => 
        supabase
          .from('simulados_questoes')
          .update({ order_position: index + 1 })
          .eq('id', q.simulado_question_id)
      )

      await Promise.all(updates)
      
      toast.success('Ordem atualizada!')
      if (onUpdate) onUpdate()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao reordenar questões', {
        description: errorMessage
      })
      // Recarregar em caso de erro
      loadQuestions()
    }
  }

  // Extrair valores únicos para filtros
  const uniqueBancas = Array.from(new Set(availableQuestions.map(q => q.banca))).sort()
  const uniqueDisciplinas = Array.from(new Set(availableQuestions.map(q => q.disciplina))).sort()

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Questões do Simulado */}
      <Card>
        <CardHeader>
          <CardTitle>Questões no Simulado</CardTitle>
          <CardDescription>
            {simuladoQuestions.length} questões adicionadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {simuladoQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">Nenhuma questão adicionada ainda</p>
              <p className="text-sm">Use a lista ao lado para adicionar questões</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {simuladoQuestions.map((question, index) => (
                <div
                  key={question.simulado_question_id}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => index > 0 && handleReorder(index, index - 1)}
                        disabled={index === 0}
                        className="cursor-pointer disabled:opacity-30"
                        title="Mover para cima"
                      >
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </button>
                      <span className="text-xs font-semibold text-gray-500 text-center">
                        {index + 1}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="outline" className="text-xs">{question.ano}</Badge>
                        <Badge variant="default" className="text-xs">{question.banca}</Badge>
                        <Badge variant="secondary" className="text-xs">{question.orgao}</Badge>
                      </div>
                      <p className="text-sm font-medium truncate">{question.disciplina}</p>
                      <p className="text-xs text-gray-500">Gabarito: {question.gabarito}</p>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer h-8 w-8"
                        title="Ver questão"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveQuestion(question.simulado_question_id)}
                        className="cursor-pointer hover:text-red-600 h-8 w-8"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questões Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Questões</CardTitle>
          <CardDescription>
            {filteredQuestions.length} questões disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por banca, órgão, disciplina..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Select value={filterBanca} onValueChange={setFilterBanca}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Banca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {uniqueBancas.map(banca => (
                    <SelectItem key={banca} value={banca}>{banca}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterDisciplina} onValueChange={setFilterDisciplina}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Disciplina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {uniqueDisciplinas.map(disc => (
                    <SelectItem key={disc} value={disc}>{disc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ME">ME</SelectItem>
                  <SelectItem value="CE">CE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('')
                setFilterBanca('all')
                setFilterTipo('all')
                setFilterDisciplina('all')
              }}
              className="w-full cursor-pointer text-xs"
            >
              Limpar Filtros
            </Button>
          </div>

          {/* Lista de Questões */}
          <div className="space-y-2 max-h-[450px] overflow-y-auto">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Nenhuma questão disponível
              </div>
            ) : (
              filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="outline" className="text-xs">{question.ano}</Badge>
                        <Badge variant="default" className="text-xs">{question.banca}</Badge>
                        <Badge variant="secondary" className="text-xs">{question.orgao}</Badge>
                      </div>
                      <p className="text-sm font-medium truncate">{question.disciplina}</p>
                      <p className="text-xs text-gray-500">
                        Tipo: {question.tipo} | Gabarito: {question.gabarito}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleAddQuestion(question.id)}
                      disabled={isAdding}
                      className="cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

