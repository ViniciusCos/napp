'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { Trash2, Video, Plus, Eye, EyeOff, Calendar, FileText, Edit, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { EditAulaForm } from './edit-aula-form'

type Aula = {
  id: number
  nome: string | null
  descricao: string | null
  link: string | null
  material: string | null
  tema: string | null
  subtema: string[] | null
  capa: string | null
  data: string | null
  professor_id: number | null
  disponivel: boolean | null
  created_at: string
}

interface ListAulasProps {
  onCreateClick?: () => void
}

export function ListAulas({ onCreateClick }: ListAulasProps) {
  const [aulas, setAulas] = useState<Aula[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [selectedAulaId, setSelectedAulaId] = useState<number | null>(null)
  const supabase = createClient()

  const loadAulas = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('aulas')
        .select('*')
        .order('tema', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Erro ao carregar aulas', {
          description: error.message
        })
        return
      }

      setAulas(data || [])
    } catch {
      toast.error('Erro inesperado ao carregar aulas')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadAulas()
  }, [loadAulas])

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta aula?')) return

    setIsDeleting(id)
    try {
      const { error} = await supabase
        .from('aulas')
        .delete()
        .eq('id', id)

      if (error) {
        toast.error('Erro ao excluir aula', {
          description: error.message
        })
        return
      }

      toast.success('Aula excluída com sucesso!')
      loadAulas()
    } catch {
      toast.error('Erro inesperado ao excluir aula')
    } finally {
      setIsDeleting(null)
    }
  }

  const toggleDisponivel = async (id: number, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from('aulas')
        .update({ disponivel: !currentStatus })
        .eq('id', id)

      if (error) {
        toast.error('Erro ao atualizar status', {
          description: error.message
        })
        return
      }

      toast.success(`Aula ${!currentStatus ? 'disponibilizada' : 'ocultada'} com sucesso!`)
      loadAulas()
    } catch {
      toast.error('Erro inesperado ao atualizar status')
    }
  }

  const handleEditClick = (id: number) => {
    setSelectedAulaId(id)
    setEditSheetOpen(true)
  }

  const handleEditSuccess = () => {
    setEditSheetOpen(false)
    setSelectedAulaId(null)
    loadAulas()
  }

  // Agrupar por tema
  const aulasPorTema = aulas.reduce((acc, aula) => {
    const temaKey = aula.tema || 'Sem Tema'
    if (!acc[temaKey]) {
      acc[temaKey] = []
    }
    acc[temaKey].push(aula)
    return acc
  }, {} as Record<string, Aula[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Aulas</h2>
          <p className="text-gray-600 mt-1">
            {isLoading ? 'Carregando...' : `${aulas.length} aulas cadastradas`}
          </p>
        </div>
        <Button onClick={onCreateClick} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Nova Aula
        </Button>
      </div>

      {/* Lista de Aulas */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              Carregando aulas...
            </div>
          </CardContent>
        </Card>
      ) : aulas.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">Nenhuma aula cadastrada</p>
              <p className="text-sm text-gray-600">Clique em &quot;Nova Aula&quot; para criar a primeira</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.keys(aulasPorTema).map((temaKey) => (
            <Card key={temaKey}>
              <CardHeader>
                <CardTitle>{temaKey}</CardTitle>
                <CardDescription>
                  {aulasPorTema[temaKey].length} {aulasPorTema[temaKey].length === 1 ? 'aula' : 'aulas'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aulasPorTema[temaKey].map((aula) => (
                    <div
                      key={aula.id}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-all"
                    >
                      <div className="p-4 space-y-3">
                        {/* Header com título e badges */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {aula.nome || 'Sem título'}
                              </h3>
                              <Badge
                                variant={aula.disponivel ? 'default' : 'secondary'}
                                className="shrink-0"
                              >
                                {aula.disponivel ? 'Disponível' : 'Oculta'}
                              </Badge>
                            </div>

                            {/* Subtemas */}
                            {aula.subtema && aula.subtema.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {aula.subtema.map((sub, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {sub}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Ações */}
                          <div className="flex gap-1.5 shrink-0">
                            <Link href={`/dashboard/aulas/${aula.id}`} target="_blank">
                              <Button
                                variant="outline"
                                size="icon"
                                className="cursor-pointer h-8 w-8"
                                title="Visualizar aula"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditClick(aula.id)}
                              className="cursor-pointer h-8 w-8"
                              title="Editar aula"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => toggleDisponivel(aula.id, aula.disponivel)}
                              className="cursor-pointer h-8 w-8"
                              title={aula.disponivel ? 'Ocultar' : 'Disponibilizar'}
                            >
                              {aula.disponivel ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDelete(aula.id)}
                              disabled={isDeleting === aula.id}
                              className="cursor-pointer h-8 w-8"
                              title="Excluir aula"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Descrição */}
                        {aula.descricao && (
                          <div
                            className="text-sm text-gray-600 line-clamp-2 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: aula.descricao }}
                          />
                        )}

                        {/* Metadados */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t">
                          {aula.data && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {new Date(aula.data).toLocaleString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          )}
                          {aula.data && <span className="text-gray-300">•</span>}
                          <span>Criado em {new Date(aula.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>

                        {/* Links e Recursos */}
                        {(aula.link || aula.material) && (
                          <div className="flex items-center gap-3 text-xs pt-2">
                            {aula.link && (
                              <a
                                href={aula.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 font-medium"
                              >
                                <Video className="h-3.5 w-3.5" />
                                Assistir vídeo
                              </a>
                            )}
                            {aula.material && (
                              <a
                                href={aula.material}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700 hover:underline flex items-center gap-1.5 font-medium"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Material complementar
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sheet de Edição */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-0">
          <div className="sticky top-0 bg-white z-10 border-b p-6">
            <SheetHeader>
              <SheetTitle>Editar Aula</SheetTitle>
              <SheetDescription>
                Faça alterações nos dados da aula
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="p-6">
            {selectedAulaId && (
              <EditAulaForm
                aulaId={selectedAulaId}
                onSuccess={handleEditSuccess}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
