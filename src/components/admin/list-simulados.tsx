'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { Trash2, Clock, FileText, Plus, ListPlus, Pencil, Calculator, Calendar, CalendarX, Trophy } from 'lucide-react'
import { ManageSimuladoQuestions } from './manage-simulado-questions'
import { EditSimuladoForm } from './edit-simulado-form'
import { SimuladoRanking } from './simulado-ranking'

type Simulado = {
  id: string
  title: string
  description: string | null
  total_questions: number
  duration_minutes: number
  fator_correcao: number | null
  is_active: boolean
  created_at: string
  start_date: string | null
  end_date: string | null
}

interface ListSimuladosProps {
  onCreateClick: () => void
}

export function ListSimulados({ onCreateClick }: ListSimuladosProps) {
  const [simulados, setSimulados] = useState<Simulado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [selectedSimulado, setSelectedSimulado] = useState<Simulado | null>(null)
  const [isManageQuestionsOpen, setIsManageQuestionsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isRankingOpen, setIsRankingOpen] = useState(false)
  const supabase = createClient()

  const loadSimulados = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('simulados')
        .select('id, title, description, total_questions, duration_minutes, fator_correcao, is_active, created_at, start_date, end_date')
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Erro ao carregar simulados', {
          description: error.message
        })
        return
      }

      setSimulados(data || [])
    } catch {
      toast.error('Erro inesperado ao carregar simulados')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Função para obter o status baseado nas datas
  const getSimuladoStatus = (simulado: Simulado) => {
    if (!simulado.start_date && !simulado.end_date) {
      return { label: 'Sem agenda', variant: 'secondary' as const }
    }

    const now = new Date()
    const startDate = simulado.start_date ? new Date(simulado.start_date) : null
    const endDate = simulado.end_date ? new Date(simulado.end_date) : null

    if (startDate && now < startDate) {
      return { label: 'Agendado', variant: 'outline' as const }
    }

    if (endDate && now > endDate) {
      return { label: 'Encerrado', variant: 'destructive' as const }
    }

    return { label: 'Disponível', variant: 'default' as const }
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

  useEffect(() => {
    loadSimulados()
  }, [loadSimulados])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este simulado?')) return

    setIsDeleting(id)
    try {
      const { error } = await supabase
        .from('simulados')
        .delete()
        .eq('id', id)

      if (error) {
        toast.error('Erro ao excluir simulado', {
          description: error.message
        })
        return
      }

      toast.success('Simulado excluído com sucesso!')
      loadSimulados()
    } catch {
      toast.error('Erro inesperado ao excluir simulado')
    } finally {
      setIsDeleting(null)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('simulados')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) {
        toast.error('Erro ao atualizar status', {
          description: error.message
        })
        return
      }

      toast.success(`Simulado ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`)
      loadSimulados()
    } catch {
      toast.error('Erro inesperado ao atualizar status')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de criar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Simulados</h2>
          <p className="text-gray-600 mt-1">
            {isLoading ? 'Carregando...' : `${simulados.length} simulados cadastrados`}
          </p>
        </div>
        <Button onClick={onCreateClick} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Novo Simulado
        </Button>
      </div>

      {/* Lista de Simulados */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Simulados</CardTitle>
          <CardDescription>
            Gerencie os simulados disponíveis para os alunos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Carregando simulados...
            </div>
          ) : simulados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">Nenhum simulado cadastrado</p>
              <p className="text-sm">Clique em &quot;Novo Simulado&quot; para criar o primeiro</p>
            </div>
          ) : (
            <div className="space-y-4">
              {simulados.map((simulado) => (
                <div
                  key={simulado.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Header */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{simulado.title}</h3>
                        <Badge
                          variant={simulado.is_active ? 'default' : 'secondary'}
                          className="cursor-pointer"
                          onClick={() => toggleActive(simulado.id, simulado.is_active)}
                        >
                          {simulado.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {(() => {
                          const status = getSimuladoStatus(simulado)
                          return (
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          )
                        })()}
                      </div>

                      {/* Descrição */}
                      {simulado.description && (
                        <p className="text-sm text-gray-600">{simulado.description}</p>
                      )}

                      {/* Informações */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{simulado.total_questions} questões</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{simulado.duration_minutes} minutos</span>
                        </div>
                        {simulado.fator_correcao && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Calculator className="h-4 w-4" />
                              <span>Fator {simulado.fator_correcao}:1</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Datas de agendamento */}
                      {(simulado.start_date || simulado.end_date) && (
                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          {simulado.start_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span className="font-medium">Início:</span>
                              <span>{formatDateTime(simulado.start_date)}</span>
                            </div>
                          )}
                          {simulado.end_date && (
                            <>
                              {simulado.start_date && <span>•</span>}
                              <div className="flex items-center gap-1">
                                <CalendarX className="h-4 w-4 text-red-600" />
                                <span className="font-medium">Término:</span>
                                <span>{formatDateTime(simulado.end_date)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Data de criação */}
                      <div className="text-xs text-gray-500">
                        Criado em {new Date(simulado.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedSimulado(simulado)
                          setIsRankingOpen(true)
                        }}
                        className="cursor-pointer"
                        title="Ver ranking"
                      >
                        <Trophy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedSimulado(simulado)
                          setIsManageQuestionsOpen(true)
                        }}
                        className="cursor-pointer"
                        title="Gerenciar questões"
                      >
                        <ListPlus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedSimulado(simulado)
                          setIsEditOpen(true)
                        }}
                        className="cursor-pointer"
                        title="Editar simulado"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(simulado.id)}
                        disabled={isDeleting === simulado.id}
                        className="cursor-pointer"
                        title="Excluir simulado"
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

      {/* Sheet para gerenciar questões */}
      <Sheet open={isManageQuestionsOpen} onOpenChange={setIsManageQuestionsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-6xl overflow-y-auto p-0">
          <div className="sticky top-0 bg-white z-10 border-b p-6">
            <SheetHeader>
              <SheetTitle>Gerenciar Questões - {selectedSimulado?.title}</SheetTitle>
              <SheetDescription>
                Adicione, remova ou reordene as questões do simulado
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="p-6">
            {selectedSimulado && (
              <ManageSimuladoQuestions 
                simuladoId={selectedSimulado.id}
                onUpdate={loadSimulados}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
          <div className="sticky top-0 bg-white z-10 border-b p-6">
            <SheetHeader>
              <SheetTitle>Editar Simulado</SheetTitle>
              <SheetDescription>
                Altere as informações do simulado
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="p-6">
            {selectedSimulado && (
              <EditSimuladoForm 
                simuladoId={selectedSimulado.id}
                onSuccess={() => {
                  setIsEditOpen(false)
                  loadSimulados()
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet para visualizar ranking */}
      <Sheet open={isRankingOpen} onOpenChange={setIsRankingOpen}>
        <SheetContent side="right" className="w-full sm:max-w-7xl overflow-y-auto p-0">
          <div className="sticky top-0 bg-white z-10 border-b p-6">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Ranking - {selectedSimulado?.title}
              </SheetTitle>
              <SheetDescription>
                Classificação dos participantes por desempenho
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="p-6">
            {selectedSimulado && (
              <SimuladoRanking 
                simuladoId={selectedSimulado.id}
                simuladoTitle={selectedSimulado.title}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

