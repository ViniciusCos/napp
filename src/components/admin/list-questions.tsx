'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { Search, Trash2, Eye, Filter, PlusCircle, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { ViewQuestionDialog } from './view-question-dialog'
import { EditQuestionForm } from './edit-question-form'

type ListQuestionsProps = {
  onCreateClick?: () => void
}

type AlternativaObjeto = {
  letra: string
  texto: string
  texto_html?: string
}

type Question = {
  id: string
  ano: number
  banca: string
  orgao: string
  prova: string | null
  disciplina: string
  tipo: string
  dificuldade: string | null
  gabarito: string
  criado_em: string
  subtopicos: string[] | null
}

type QuestionDetails = Question & {
  atualizado_em: string | null
  texto_principal_rich: string | null
  texto_apoio_rich: string | null
  comentario_rich: string | null
  alternativas: Record<string, string> | AlternativaObjeto[] | null
}

export function ListQuestions({ onCreateClick }: ListQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const supabase = createClient()

  // Estados para visualização e edição
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDetails | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBanca, setFilterBanca] = useState('all')
  const [filterTipo, setFilterTipo] = useState('all')
  const [filterDisciplina, setFilterDisciplina] = useState('all')
  const [filterAno, setFilterAno] = useState('all')

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const loadQuestions = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id, ano, banca, orgao, prova, disciplina, tipo, dificuldade, gabarito, criado_em, subtopicos')
        .order('criado_em', { ascending: false })

      if (error) {
        toast.error('Erro ao carregar questões', {
          description: error.message
        })
        return
      }

      setQuestions(data || [])
    } catch {
      toast.error('Erro inesperado ao carregar questões')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const applyFilters = useCallback(() => {
    let filtered = [...questions]

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.banca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.orgao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.disciplina.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.prova?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    }

    // Filtro de banca
    if (filterBanca !== 'all') {
      filtered = filtered.filter(q => q.banca === filterBanca)
    }

    // Filtro de tipo
    if (filterTipo !== 'all') {
      filtered = filtered.filter(q => q.tipo === filterTipo)
    }

    // Filtro de disciplina
    if (filterDisciplina !== 'all') {
      filtered = filtered.filter(q => q.disciplina === filterDisciplina)
    }

    // Filtro de ano
    if (filterAno !== 'all') {
      filtered = filtered.filter(q => q.ano.toString() === filterAno)
    }

    setFilteredQuestions(filtered)
  }, [questions, searchTerm, filterBanca, filterTipo, filterDisciplina, filterAno])

  // Carregar questões
  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  // Aplicar filtros
  useEffect(() => {
    applyFilters()
    setCurrentPage(1) // Resetar para primeira página quando filtros mudarem
  }, [applyFilters])

  // Cálculos de paginação
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex)

  // Resetar para primeira página se a página atual ficar fora do range
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1) // Resetar para primeira página
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta questão?')) return

    setIsDeleting(id)
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id)

      if (error) {
        toast.error('Erro ao excluir questão', {
          description: error.message
        })
        return
      }

      toast.success('Questão excluída com sucesso!')
      loadQuestions()
    } catch {
      toast.error('Erro inesperado ao excluir questão')
    } finally {
      setIsDeleting(null)
    }
  }

  const loadQuestionDetails = async (id: string) => {
    setIsLoadingDetails(true)
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        toast.error('Erro ao carregar detalhes da questão', {
          description: error.message
        })
        return null
      }

      return data as QuestionDetails
    } catch {
      toast.error('Erro inesperado ao carregar detalhes')
      return null
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleViewQuestion = async (id: string) => {
    const details = await loadQuestionDetails(id)
    if (details) {
      setSelectedQuestion(details)
      setViewDialogOpen(true)
    }
  }

  const handleEditQuestion = async (id: string) => {
    const details = await loadQuestionDetails(id)
    if (details) {
      setSelectedQuestion(details)
      setEditSheetOpen(true)
    }
  }

  const handleEditSuccess = () => {
    setEditSheetOpen(false)
    setSelectedQuestion(null)
    loadQuestions()
  }

  // Extrair valores únicos para filtros
  const uniqueBancas = Array.from(new Set(questions.map(q => q.banca))).sort()
  const uniqueDisciplinas = Array.from(new Set(questions.map(q => q.disciplina))).sort()
  const uniqueAnos = Array.from(new Set(questions.map(q => q.ano))).sort((a, b) => b - a)

  const getDifficultyLabel = (diff: string | null) => {
    const labels: Record<string, string> = {
      'muito_facil': 'Muito fácil',
      'facil': 'Fácil',
      'medio': 'Médio',
      'dificil': 'Difícil',
      'muito_dificil': 'Muito difícil'
    }
    return diff ? labels[diff] || diff : '-'
  }

  const getDifficultyColor = (diff: string | null) => {
    const colors: Record<string, string> = {
      'muito_facil': 'bg-green-100 text-green-800',
      'facil': 'bg-green-50 text-green-700',
      'medio': 'bg-yellow-100 text-yellow-800',
      'dificil': 'bg-orange-100 text-orange-800',
      'muito_dificil': 'bg-red-100 text-red-800'
    }
    return diff ? colors[diff] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
  }

  return (
    <>
      <div className="space-y-6 h-full overflow-y-auto pr-2">
      {/* Botão Nova Questão */}
      {onCreateClick && (
        <div className="flex justify-end">
          <Button onClick={onCreateClick} className="cursor-pointer">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Questão
          </Button>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>Refine sua busca de questões</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por banca, órgão, disciplina..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Banca */}
            <div className="space-y-2">
              <Label>Banca</Label>
              <Select value={filterBanca} onValueChange={setFilterBanca}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {uniqueBancas.map(banca => (
                    <SelectItem key={banca} value={banca}>{banca}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Disciplina */}
            <div className="space-y-2">
              <Label>Disciplina</Label>
              <Select value={filterDisciplina} onValueChange={setFilterDisciplina}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {uniqueDisciplinas.map(disc => (
                    <SelectItem key={disc} value={disc}>{disc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ano */}
            <div className="space-y-2">
              <Label>Ano</Label>
              <Select value={filterAno} onValueChange={setFilterAno}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueAnos.map(ano => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ME">Múltipla Escolha</SelectItem>
                  <SelectItem value="CE">Certo/Errado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Limpar filtros */}
            <div className="space-y-2 flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setFilterBanca('all')
                  setFilterTipo('all')
                  setFilterDisciplina('all')
                  setFilterAno('all')
                }}
                className="w-full cursor-pointer"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Questões */}
      <Card>
        <CardHeader>
          <CardTitle>Questões Cadastradas</CardTitle>
          <CardDescription>
            {isLoading ? 'Carregando...' : `${filteredQuestions.length} questões encontradas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Carregando questões...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma questão encontrada
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedQuestions.map((question) => (
                <div
                  key={question.id}
                  className="group border-2 border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Badges de Tipo e Dificuldade */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={question.tipo === 'ME' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-purple-100 text-purple-800 border-purple-200'}>
                          {question.tipo === 'ME' ? 'Múltipla Escolha' : 'Certo/Errado'}
                        </Badge>
                        {question.dificuldade && (
                          <Badge className={getDifficultyColor(question.dificuldade)}>
                            {getDifficultyLabel(question.dificuldade)}
                          </Badge>
                        )}
                      </div>

                      {/* Disciplina */}
                      <div>
                        <p className="font-semibold text-gray-900 text-base">{question.disciplina}</p>
                        
                        {/* Informações detalhadas */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 mt-2">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-gray-700">Banca:</span>
                            <span>{question.banca}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-gray-700">Ano:</span>
                            <span>{question.ano}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-gray-700">Órgão:</span>
                            <span>{question.orgao}</span>
                          </span>
                          {question.prova && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <span className="font-semibold text-gray-700">Prova:</span>
                                <span>{question.prova}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Subtópicos */}
                      {question.subtopicos && question.subtopicos.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {question.subtopicos.map((subtopico, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs font-normal bg-gray-50">
                              {subtopico}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Footer com Gabarito e Data */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span className="flex items-center gap-1.5">
                          <span>Gabarito:</span>
                          <strong className="text-green-600 text-sm font-bold">{question.gabarito}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(question.criado_em).toLocaleDateString('pt-BR', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Ações - Visíveis no hover */}
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="icon"
                        className="cursor-pointer h-9 w-9 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                        title="Ver detalhes"
                        onClick={() => handleViewQuestion(question.id)}
                        disabled={isLoadingDetails}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="cursor-pointer h-9 w-9 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300"
                        title="Editar questão"
                        onClick={() => handleEditQuestion(question.id)}
                        disabled={isLoadingDetails}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(question.id)}
                        disabled={isDeleting === question.id}
                        className="cursor-pointer h-9 w-9 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                        title="Excluir questão"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-gray-600">Itens por página:</Label>
                  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages} ({filteredQuestions.length} itens)
                  </p>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
          )}
        </CardContent>
      </Card>
    </div>

    {/* Dialog de visualização */}
    <ViewQuestionDialog
      question={selectedQuestion}
      open={viewDialogOpen}
      onOpenChange={setViewDialogOpen}
    />

    {/* Sheet de edição */}
    <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-0">
        <div className="sticky top-0 bg-white z-10 border-b p-6">
          <SheetHeader>
            <SheetTitle>Editar Questão</SheetTitle>
            <SheetDescription>
              Atualize os dados da questão selecionada
            </SheetDescription>
          </SheetHeader>
        </div>
        <div className="p-6">
          {selectedQuestion && (
            <EditQuestionForm
              questionId={selectedQuestion.id}
              onSuccess={handleEditSuccess}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  </>
  )
}

