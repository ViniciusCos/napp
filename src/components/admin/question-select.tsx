'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { toast } from 'sonner'
import { Loader2, Plus, X, Search, BookOpen, Filter, ChevronLeft, ChevronRight, FileText, Eye } from 'lucide-react'

type Question = {
  id: string
  texto_principal_rich: string | null
  disciplina: string
  banca: string
  ano: number
  dificuldade: string | null
  tipo: 'ME' | 'CE'
  alternativas: any[] | null
  gabarito: string
}

interface QuestionSelectProps {
  selectedQuestions: string[]
  onQuestionsChange: (questionIds: string[]) => void
  disabled?: boolean
}

const ITEMS_PER_PAGE = 10

export function QuestionSelect({ selectedQuestions, onQuestionsChange, disabled }: QuestionSelectProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDisciplina, setFilterDisciplina] = useState('')
  const [filterBanca, setFilterBanca] = useState('')
  const [filterDificuldade, setFilterDificuldade] = useState('')
  const [disciplinas, setDisciplinas] = useState<string[]>([])
  const [bancas, setBancas] = useState<string[]>([])
  const [dificuldades, setDificuldades] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  
  // Estados do formulário de criação de questão
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    ano: new Date().getFullYear(),
    banca: '',
    orgao: '',
    prova: '',
    disciplina: '',
    tipo: 'ME' as 'ME' | 'CE',
    dificuldade: '',
    subtopicos: [] as string[],
    textoPrincipal: '',
    textoApoio: '',
    alternativaA: '',
    alternativaB: '',
    alternativaC: '',
    alternativaD: '',
    alternativaE: '',
    gabarito: '',
    comentario: ''
  })
  const [novoSubtopic, setNovoSubtopic] = useState('')
  const supabase = createClient()

  const loadQuestions = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id, texto_principal_rich, disciplina, banca, ano, dificuldade, tipo, alternativas, gabarito')
        .order('ano', { ascending: false })
        .order('criado_em', { ascending: false })

      if (error) {
        toast.error('Erro ao carregar questões', {
          description: error.message
        })
        return
      }

      setQuestions(data || [])
      
      // Extrair disciplinas, bancas e dificuldades únicas
      const disciplinasUnicas = [...new Set(data?.map(q => q.disciplina) || [])].sort()
      const bancasUnicas = [...new Set(data?.map(q => q.banca) || [])].sort()
      const dificuldadesUnicas = [...new Set(data?.map(q => q.dificuldade).filter(Boolean) || [])].sort()
      
      setDisciplinas(disciplinasUnicas)
      setBancas(bancasUnicas)
      setDificuldades(dificuldadesUnicas)
    } catch (err) {
      toast.error('Erro inesperado ao carregar questões')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = !searchTerm || 
      question.texto_principal_rich?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.disciplina.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.banca.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDisciplina = !filterDisciplina || question.disciplina === filterDisciplina
    const matchesBanca = !filterBanca || question.banca === filterBanca
    const matchesDificuldade = !filterDificuldade || question.dificuldade === filterDificuldade
    
    return matchesSearch && matchesDisciplina && matchesBanca && matchesDificuldade
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex)

  const handleQuestionToggle = (questionId: string) => {
    if (selectedQuestions.includes(questionId)) {
      onQuestionsChange(selectedQuestions.filter(id => id !== questionId))
    } else {
      onQuestionsChange([...selectedQuestions, questionId])
    }
  }

  const handleSelectAll = () => {
    const allIds = filteredQuestions.map(q => q.id)
    const newSelected = [...new Set([...selectedQuestions, ...allIds])]
    onQuestionsChange(newSelected)
  }

  const handleDeselectAll = () => {
    const filteredIds = filteredQuestions.map(q => q.id)
    const newSelected = selectedQuestions.filter(id => !filteredIds.includes(id))
    onQuestionsChange(newSelected)
  }

  const getSelectedQuestions = () => {
    return questions.filter(q => selectedQuestions.includes(q.id))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterDisciplina('')
    setFilterBanca('')
    setFilterDificuldade('')
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setExpandedQuestions(new Set()) // Reset expanded questions when changing pages
  }

  const toggleQuestionExpansion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
  }

  const handleCreateQuestion = () => {
    setIsCreateDialogOpen(false)
    setIsCreateSheetOpen(true)
  }

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addSubtopic = () => {
    if (novoSubtopic.trim() && !formData.subtopicos.includes(novoSubtopic.trim())) {
      setFormData(prev => ({
        ...prev,
        subtopicos: [...prev.subtopicos, novoSubtopic.trim()]
      }))
      setNovoSubtopic('')
    }
  }

  const removeSubtopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subtopicos: prev.subtopicos.filter((_, i) => i !== index)
    }))
  }

  const clearForm = () => {
    setFormData({
      ano: new Date().getFullYear(),
      banca: '',
      orgao: '',
      prova: '',
      disciplina: '',
      tipo: 'ME',
      dificuldade: '',
      subtopicos: [],
      textoPrincipal: '',
      textoApoio: '',
      alternativaA: '',
      alternativaB: '',
      alternativaC: '',
      alternativaD: '',
      alternativaE: '',
      gabarito: '',
      comentario: ''
    })
    setNovoSubtopic('')
  }

  const handleCreateQuestionSubmit = async () => {
    if (!formData.banca || !formData.orgao || !formData.disciplina || !formData.textoPrincipal || !formData.gabarito) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (formData.tipo === 'ME' && (!formData.alternativaA || !formData.alternativaB || !formData.alternativaC || !formData.alternativaD)) {
      toast.error('Preencha pelo menos as alternativas A, B, C e D')
      return
    }

    setIsCreating(true)
    try {
      // Preparar alternativas
      const alternativas = []
      if (formData.alternativaA) alternativas.push({ texto: formData.alternativaA })
      if (formData.alternativaB) alternativas.push({ texto: formData.alternativaB })
      if (formData.alternativaC) alternativas.push({ texto: formData.alternativaC })
      if (formData.alternativaD) alternativas.push({ texto: formData.alternativaD })
      if (formData.alternativaE) alternativas.push({ texto: formData.alternativaE })

      const { data, error } = await supabase
        .from('questions')
        .insert({
          ano: formData.ano,
          banca: formData.banca,
          orgao: formData.orgao,
          prova: formData.prova || null,
          disciplina: formData.disciplina,
          tipo: formData.tipo,
          dificuldade: formData.dificuldade || null,
          subtopicos: formData.subtopicos.length > 0 ? formData.subtopicos : null,
          texto_principal_rich: formData.textoPrincipal,
          texto_apoio_rich: formData.textoApoio || null,
          alternativas: alternativas.length > 0 ? alternativas : null,
          gabarito: formData.gabarito,
          comentario_rich: formData.comentario || null
        })
        .select()
        .single()

      if (error) {
        toast.error('Erro ao criar questão', {
          description: error.message
        })
        return
      }

      toast.success('Questão criada com sucesso!')
      
      // Adicionar a nova questão à lista selecionada
      onQuestionsChange([...selectedQuestions, data.id])
      
      // Recarregar a lista de questões
      await loadQuestions()
      
      // Fechar o sheet e limpar o formulário
      setIsCreateSheetOpen(false)
      clearForm()
      
    } catch (err) {
      toast.error('Erro inesperado ao criar questão')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">
              Questões da Aula
            </Label>
            <p className="text-xs text-muted-foreground">
              {selectedQuestions.length} questão(ões) selecionada(s)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
              disabled={disabled}
              className="cursor-pointer"
            >
              <FileText className="h-4 w-4 mr-2" />
              Nova Questão
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              disabled={disabled}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              {selectedQuestions.length > 0 ? 'Gerenciar' : 'Adicionar'}
            </Button>
          </div>
        </div>

        {selectedQuestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {getSelectedQuestions().map((question) => (
                <Badge key={question.id} variant="secondary" className="gap-2 px-3 py-1">
                  <span className="truncate max-w-[200px]">
                    {question.disciplina} - {question.banca} ({question.ano})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuestionToggle(question.id)}
                    className="ml-1 hover:text-destructive transition-colors"
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Question Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Nova Questão
            </DialogTitle>
            <DialogDescription>
              Como você gostaria de criar a questão?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Escolha uma das opções abaixo:
            </p>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={handleCreateQuestion}
              >
                <FileText className="h-4 w-4 mr-2" />
                Criar aqui mesmo
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  window.open('/dashboard/admin?tab=questoes', '_blank')
                  setIsCreateDialogOpen(false)
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Ir para página de questões
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Question Sheet */}
      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-0">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white z-10 border-b p-6">
            <SheetHeader>
              <SheetTitle>Nova Questão</SheetTitle>
              <SheetDescription>
                Preencha os dados para criar uma nova questão
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <form className="flex flex-col">
              <div className="grid gap-6">
                {/* Informações Básicas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                    <CardDescription>Dados gerais da questão</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ano">Ano *</Label>
                    <Input
                      id="ano"
                      type="number"
                      min="1900"
                      max="2100"
                      value={formData.ano}
                      onChange={(e) => handleFormChange('ano', parseInt(e.target.value))}
                      disabled={isCreating}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="banca">Banca *</Label>
                    <Input
                      id="banca"
                      placeholder="Ex: CESPE, FCC, FGV"
                      value={formData.banca}
                      onChange={(e) => handleFormChange('banca', e.target.value)}
                      disabled={isCreating}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgao">Órgão *</Label>
                    <Input
                      id="orgao"
                      placeholder="Ex: Polícia Federal"
                      value={formData.orgao}
                      onChange={(e) => handleFormChange('orgao', e.target.value)}
                      disabled={isCreating}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prova">Prova (opcional)</Label>
                    <Input
                      id="prova"
                      placeholder="Ex: Agente de Polícia"
                      value={formData.prova}
                      onChange={(e) => handleFormChange('prova', e.target.value)}
                      disabled={isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disciplina">Disciplina *</Label>
                    <Input
                      id="disciplina"
                      placeholder="Ex: Direito Constitucional"
                      value={formData.disciplina}
                      onChange={(e) => handleFormChange('disciplina', e.target.value)}
                      disabled={isCreating}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => handleFormChange('tipo', value)}
                      disabled={isCreating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ME">Múltipla Escolha</SelectItem>
                        <SelectItem value="CE">Certo/Errado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dificuldade">Dificuldade (opcional)</Label>
                    <Select
                      value={formData.dificuldade}
                      onValueChange={(value) => handleFormChange('dificuldade', value)}
                      disabled={isCreating}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Nenhuma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Muito Fácil">Muito Fácil</SelectItem>
                        <SelectItem value="Fácil">Fácil</SelectItem>
                        <SelectItem value="Médio">Médio</SelectItem>
                        <SelectItem value="Difícil">Difícil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Subtópicos (opcional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite um subtópico e pressione Enter"
                      value={novoSubtopic}
                      onChange={(e) => setNovoSubtopic(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addSubtopic()
                        }
                      }}
                      disabled={isCreating}
                    />
                    <Button
                      type="button"
                      onClick={addSubtopic}
                      disabled={isCreating || !novoSubtopic.trim()}
                      className="cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.subtopicos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.subtopicos.map((subtopic, index) => (
                        <Badge key={index} variant="secondary" className="gap-1 px-2 py-1">
                          {subtopic}
                          <button
                            type="button"
                            onClick={() => removeSubtopic(index)}
                            className="ml-1 hover:text-destructive transition-colors"
                            disabled={isCreating}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                  </CardContent>
                </Card>

                {/* Enunciado e Textos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Enunciado e Textos</CardTitle>
                    <CardDescription>Conteúdo da questão com formatação rich text</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RichTextEditor
                      id="textoPrincipal"
                      label="Texto Principal / Enunciado *"
                      value={formData.textoPrincipal}
                      onChange={(value) => handleFormChange('textoPrincipal', value)}
                      placeholder="Digite o enunciado da questão..."
                      disabled={isCreating}
                      rows={4}
                    />
                    <RichTextEditor
                      id="textoApoio"
                      label="Texto de Apoio (opcional)"
                      value={formData.textoApoio}
                      onChange={(value) => handleFormChange('textoApoio', value)}
                      placeholder="Texto adicional, lei, artigo, etc..."
                      disabled={isCreating}
                      rows={3}
                    />
                  </CardContent>
                </Card>

                {/* Alternativas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Alternativas</CardTitle>
                    <CardDescription>Opções de resposta da questão</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="altA">Alternativa A *</Label>
                  <Textarea
                    id="altA"
                    rows={2}
                    value={formData.alternativaA}
                    onChange={(e) => handleFormChange('alternativaA', e.target.value)}
                    disabled={isCreating}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altB">Alternativa B *</Label>
                  <Textarea
                    id="altB"
                    rows={2}
                    value={formData.alternativaB}
                    onChange={(e) => handleFormChange('alternativaB', e.target.value)}
                    disabled={isCreating}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altC">Alternativa C *</Label>
                  <Textarea
                    id="altC"
                    rows={2}
                    value={formData.alternativaC}
                    onChange={(e) => handleFormChange('alternativaC', e.target.value)}
                    disabled={isCreating}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altD">Alternativa D *</Label>
                  <Textarea
                    id="altD"
                    rows={2}
                    value={formData.alternativaD}
                    onChange={(e) => handleFormChange('alternativaD', e.target.value)}
                    disabled={isCreating}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altE">Alternativa E (opcional)</Label>
                  <Textarea
                    id="altE"
                    rows={2}
                    value={formData.alternativaE}
                    onChange={(e) => handleFormChange('alternativaE', e.target.value)}
                    disabled={isCreating}
                  />
                </div>
                  </CardContent>
                </Card>

                {/* Gabarito e Comentário */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gabarito e Comentário</CardTitle>
                    <CardDescription>Resposta correta e explicação</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gabarito">Gabarito *</Label>
                  <Select
                    value={formData.gabarito}
                    onValueChange={(value) => handleFormChange('gabarito', value)}
                    disabled={isCreating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a resposta correta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                      <SelectItem value="E">E</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <RichTextEditor
                  id="comentario"
                  label="Comentário / Explicação (opcional)"
                  value={formData.comentario}
                  onChange={(value) => handleFormChange('comentario', value)}
                  placeholder="Explicação da resposta correta..."
                  disabled={isCreating}
                  rows={3}
                />
                  </CardContent>
                </Card>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearForm}
                  disabled={isCreating}
                  className="cursor-pointer"
                >
                  Limpar
                </Button>
                <Button
                  type="submit"
                  onClick={handleCreateQuestionSubmit}
                  disabled={isCreating}
                  className="cursor-pointer"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Questão'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Question Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Selecionar Questões
            </DialogTitle>
            <DialogDescription>
              Escolha as questões que serão associadas a esta aula
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="search" className="text-xs">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Buscar por texto, disciplina ou banca..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1) // Reset to first page when searching
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="min-w-[150px]">
                <Label htmlFor="disciplina" className="text-xs">Disciplina</Label>
                <select
                  id="disciplina"
                  value={filterDisciplina}
                  onChange={(e) => {
                    setFilterDisciplina(e.target.value)
                    setCurrentPage(1) // Reset to first page when filtering
                  }}
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">Todas</option>
                  {disciplinas.map(disciplina => (
                    <option key={disciplina} value={disciplina}>{disciplina}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-[150px]">
                <Label htmlFor="banca" className="text-xs">Banca</Label>
                <select
                  id="banca"
                  value={filterBanca}
                  onChange={(e) => {
                    setFilterBanca(e.target.value)
                    setCurrentPage(1) // Reset to first page when filtering
                  }}
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">Todas</option>
                  {bancas.map(banca => (
                    <option key={banca} value={banca}>{banca}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-[150px]">
                <Label htmlFor="dificuldade" className="text-xs">Dificuldade</Label>
                <select
                  id="dificuldade"
                  value={filterDificuldade}
                  onChange={(e) => {
                    setFilterDificuldade(e.target.value)
                    setCurrentPage(1) // Reset to first page when filtering
                  }}
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">Todas</option>
                  {dificuldades.map(dificuldade => (
                    <option key={dificuldade} value={dificuldade}>{dificuldade}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="h-10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </div>

            {/* Ações em lote */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={isLoading}
                >
                  Selecionar Todas ({filteredQuestions.length})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={isLoading}
                >
                  Desmarcar Todas
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {filteredQuestions.length} questão(ões) encontrada(s)
              </p>
            </div>

            {/* Lista de questões com Accordion */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Carregando questões...
                </div>
              ) : paginatedQuestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma questão encontrada
                </div>
              ) : (
                <Accordion type="multiple" value={Array.from(expandedQuestions)} className="space-y-3">
                  {paginatedQuestions.map((question) => (
                    <AccordionItem key={question.id} value={question.id} className="border-0">
                      <Card className="hover:shadow-md transition-shadow overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedQuestions.includes(question.id)}
                              onCheckedChange={() => handleQuestionToggle(question.id)}
                              disabled={disabled}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0 space-y-3">
                              {/* Badges */}
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  {question.disciplina}
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                  {question.banca}
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                                  {question.ano}
                                </Badge>
                                <Badge
                                  variant={question.tipo === 'ME' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {question.tipo === 'ME' ? 'Múltipla Escolha' : 'Certo/Errado'}
                                </Badge>
                                {question.dificuldade && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                                  >
                                    {question.dificuldade}
                                  </Badge>
                                )}
                              </div>

                              {/* Preview do texto */}
                              <div
                                className="text-sm text-gray-700 line-clamp-2 prose prose-sm max-w-none [&>p]:m-0"
                                dangerouslySetInnerHTML={{
                                  __html: question.texto_principal_rich || 'Sem texto'
                                }}
                              />

                              {/* Trigger para expandir */}
                              <AccordionTrigger
                                className="py-0 px-0 hover:no-underline [&[data-state=open]>div]:text-blue-700"
                                onClick={() => toggleQuestionExpansion(question.id)}
                              >
                                <div className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 transition-colors font-medium">
                                  <Eye className="h-3.5 w-3.5" />
                                  {expandedQuestions.has(question.id) ? 'Ocultar detalhes' : 'Ver detalhes completos'}
                                </div>
                              </AccordionTrigger>

                               {/* Conteúdo expandido */}
                               <AccordionContent className="pb-0">
                                 <div className="pt-3 border-t space-y-4">
                                   {/* Texto da questão */}
                                   <div
                                     className="text-sm text-gray-700 prose prose-sm max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2"
                                     dangerouslySetInnerHTML={{
                                       __html: question.texto_principal_rich || 'Sem texto'
                                     }}
                                   />
                                   
                                   {/* Alternativas */}
                                   {question.alternativas && question.alternativas.length > 0 && (
                                     <div className="space-y-2">
                                       <h4 className="text-sm font-semibold text-gray-800 mb-2">Alternativas:</h4>
                                       <div className="space-y-2">
                                         {question.alternativas.map((alt: any, index: number) => {
                                           const letra = String.fromCharCode(65 + index)
                                           const isCorrect = letra === question.gabarito
                                           
                                           return (
                                             <div 
                                               key={index} 
                                               className={`flex items-start gap-2 p-2 rounded-md ${
                                                 isCorrect 
                                                   ? 'bg-green-50 border border-green-200' 
                                                   : 'bg-gray-50'
                                               }`}
                                             >
                                               <span className={`text-sm font-medium min-w-[20px] ${
                                                 isCorrect ? 'text-green-700' : 'text-gray-600'
                                               }`}>
                                                 {letra})
                                               </span>
                                               <div 
                                                 className={`text-sm flex-1 ${
                                                   isCorrect ? 'text-green-800' : 'text-gray-700'
                                                 }`}
                                                 dangerouslySetInnerHTML={{ 
                                                   __html: alt.texto || alt 
                                                 }}
                                               />
                                               {isCorrect && (
                                                 <span className="text-green-600 font-semibold text-xs">
                                                   ✓ CORRETA
                                                 </span>
                                               )}
                                             </div>
                                           )
                                         })}
                                       </div>
                                     </div>
                                   )}
                                 </div>
                               </AccordionContent>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} ({filteredQuestions.length} questões)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          type="button"
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isLoading}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="h-10"
            >
              Fechar
            </Button>
            <Button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="h-10 bg-blue-600 hover:bg-blue-700"
            >
              Concluir ({selectedQuestions.length} selecionadas)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
