'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Trash2, User, Plus, Edit, Calendar } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Professor = {
  id: number
  nome: string
  bio: string | null
  foto_url: string | null
  created_at: string
  updated_at: string
}

interface ListProfessoresProps {
  onCreateClick?: () => void
  onEditClick?: (professor: Professor) => void
}

export function ListProfessores({ onCreateClick, onEditClick }: ListProfessoresProps) {
  const [professores, setProfessores] = useState<Professor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const supabase = createClient()

  const loadProfessores = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('professores')
        .select('*')
        .order('nome', { ascending: true })

      if (error) {
        toast.error('Erro ao carregar professores', {
          description: error.message
        })
        return
      }

      setProfessores(data || [])
    } catch {
      toast.error('Erro inesperado ao carregar professores')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadProfessores()
  }, [loadProfessores])

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este professor?')) return

    setIsDeleting(id)
    try {
      const { error} = await supabase
        .from('professores')
        .delete()
        .eq('id', id)

      if (error) {
        toast.error('Erro ao excluir professor', {
          description: error.message
        })
        return
      }

      toast.success('Professor excluído com sucesso!')
      loadProfessores()
    } catch {
      toast.error('Erro inesperado ao excluir professor')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Professores</h2>
          <p className="text-gray-600 mt-1">
            {isLoading ? 'Carregando...' : `${professores.length} professores cadastrados`}
          </p>
        </div>
        {onCreateClick && (
          <Button onClick={onCreateClick} className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Novo Professor
          </Button>
        )}
      </div>

      {/* Lista de Professores */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              Carregando professores...
            </div>
          </CardContent>
        </Card>
      ) : professores.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">Nenhum professor cadastrado</p>
              <p className="text-sm text-gray-600">Clique em &quot;Novo Professor&quot; para criar o primeiro</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {professores.map((professor) => (
            <Card key={professor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={professor.foto_url || ''} alt={professor.nome} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {professor.nome.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{professor.nome}</CardTitle>
                    <CardDescription className="text-sm">
                      ID: {professor.id}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Bio */}
                {professor.bio && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-3">{professor.bio}</p>
                  </div>
                )}

                {/* Informações */}
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Criado em {new Date(professor.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Atualizado em {new Date(professor.updated_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  {onEditClick && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditClick(professor)}
                      className="cursor-pointer flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(professor.id)}
                    disabled={isDeleting === professor.id}
                    className="cursor-pointer flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {isDeleting === professor.id ? 'Excluindo...' : 'Excluir'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
