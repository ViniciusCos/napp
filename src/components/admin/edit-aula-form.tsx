'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { toast } from 'sonner'
import { Loader2, Plus, X, BookOpen, Video, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ProfessorSelect } from './professor-select'

interface EditAulaFormProps {
  aulaId: number
  onSuccess?: () => void
}

export function EditAulaForm({ aulaId, onSuccess }: EditAulaFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const supabase = createClient()

  // Dados da aula
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [link, setLink] = useState('')
  const [material, setMaterial] = useState('')
  const [capa, setCapa] = useState('')
  const [tema, setTema] = useState('')
  const [subtemas, setSubtemas] = useState<string[]>([])
  const [subtemasInput, setSubtemasInput] = useState('')
  const [data, setData] = useState('')
  const [professorId, setProfessorId] = useState('')

  // Carregar dados da aula
  useEffect(() => {
    const loadAula = async () => {
      setIsLoadingData(true)
      try {
        const { data: aulaData, error } = await supabase
          .from('aulas')
          .select('*')
          .eq('id', aulaId)
          .single()

        if (error) {
          toast.error('Erro ao carregar aula', {
            description: error.message
          })
          return
        }

        if (aulaData) {
          setNome(aulaData.nome || '')
          setDescricao(aulaData.descricao || '')
          setLink(aulaData.link || '')
          setMaterial(aulaData.material || '')
          setCapa(aulaData.capa || '')
          setTema(aulaData.tema || '')
          setSubtemas(aulaData.subtema || [])
          setData(aulaData.data || '')
          setProfessorId(aulaData.professor_id?.toString() || '')
        }
      } catch {
        toast.error('Erro inesperado ao carregar aula')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadAula()
  }, [aulaId, supabase])

  const handleAddSubtema = () => {
    const input = subtemasInput.trim()
    if (!input) {
      toast.error('Digite um subtema antes de adicionar')
      return
    }

    // Separar por vírgula e processar cada item
    const novosSubtemas = input
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .filter(s => !subtemas.includes(s)) // Remove duplicados

    if (novosSubtemas.length === 0) {
      toast.error('Subtema(s) já adicionado(s) ou inválido(s)')
      return
    }

    setSubtemas([...subtemas, ...novosSubtemas])
    setSubtemasInput('')

    if (novosSubtemas.length > 1) {
      toast.success(`${novosSubtemas.length} subtemas adicionados`)
    }
  }

  const handleRemoveSubtema = (index: number) => {
    setSubtemas(subtemas.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação
    if (!nome.trim()) {
      toast.error('Nome da aula é obrigatório')
      return
    }

    if (!tema.trim()) {
      toast.error('Tema é obrigatório')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('aulas')
        .update({
          nome: nome.trim(),
          descricao: descricao.trim() || null,
          link: link.trim() || null,
          material: material.trim() || null,
          capa: capa.trim() || null,
          tema: tema.trim(),
          subtema: subtemas.length > 0 ? subtemas : null,
          data: data || null,
          professor_id: professorId ? parseInt(professorId) : null,
        })
        .eq('id', aulaId)

      if (error) {
        toast.error('Erro ao atualizar aula', {
          description: error.message
        })
        return
      }

      toast.success('Aula atualizada com sucesso!')

      // Chamar callback de sucesso
      if (onSuccess) {
        onSuccess()
      }
    } catch {
      toast.error('Erro inesperado ao atualizar aula')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <p className="text-gray-500 ml-2">Carregando dados da aula...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Informações Básicas
          </CardTitle>
          <CardDescription>
            Dados essenciais da aula
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Aula *</Label>
            <Input
              id="nome"
              placeholder="Ex: Introdução ao Direito Constitucional"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <RichTextEditor
            id="descricao"
            label="Descrição"
            value={descricao}
            onChange={setDescricao}
            placeholder="Descreva o conteúdo da aula, objetivos de aprendizagem e tópicos que serão abordados..."
            disabled={isLoading}
            rows={4}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tema">Tema *</Label>
              <Input
                id="tema"
                placeholder="Ex: Direito Constitucional"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtema">Subtópicos (opcional)</Label>
              <div className="flex gap-2">
                <Input
                  id="subtema"
                  placeholder="Digite um subtópico"
                  value={subtemasInput}
                  onChange={(e) => setSubtemasInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSubtema()
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  onClick={handleAddSubtema}
                  disabled={isLoading || !subtemasInput.trim()}
                  className="cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {subtemas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {subtemas.map((subtema, index) => (
                <Badge key={index} variant="secondary" className="gap-1 px-2 py-1">
                  {subtema}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtema(index)}
                    className="ml-1 hover:text-destructive transition-colors"
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conteúdo Multimídia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-green-600" />
            Conteúdo Multimídia
          </CardTitle>
          <CardDescription>
            Vídeos, materiais e recursos visuais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link">Link do Vídeo</Label>
            <Input
              id="link"
              type="url"
              placeholder="Ex: https://www.youtube.com/watch?v=..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Suporta YouTube, Vimeo e outros serviços de vídeo
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="material">Material Complementar</Label>
            <Input
              id="material"
              placeholder="Link ou descrição do material (opcional)"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capa">URL da Capa</Label>
            <Input
              id="capa"
              type="url"
              placeholder="Ex: https://exemplo.com/capa.jpg (opcional)"
              value={capa}
              onChange={(e) => setCapa(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações Avançadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Configurações Avançadas
          </CardTitle>
          <CardDescription>
            Data, professor e outras configurações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data da Aula</Label>
              <Input
                id="data"
                type="datetime-local"
                value={data}
                onChange={(e) => setData(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Data de publicação ou aula ao vivo (opcional)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="professorId">Professor (opcional)</Label>
              <ProfessorSelect
                value={professorId}
                onValueChange={setProfessorId}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          type="submit"
          disabled={isLoading}
          className="cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Alterações'
          )}
        </Button>
      </div>
    </form>
  )
}
