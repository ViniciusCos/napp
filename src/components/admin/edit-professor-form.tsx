'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

type Professor = {
  id: number
  nome: string
  bio: string | null
  foto_url: string | null
  created_at: string
  updated_at: string
}

interface EditProfessorFormProps {
  professor: Professor
  onSuccess?: () => void
  onCancel?: () => void
}

export function EditProfessorForm({ professor, onSuccess, onCancel }: EditProfessorFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Dados do professor
  const [nome, setNome] = useState(professor.nome)
  const [bio, setBio] = useState(professor.bio || '')
  const [fotoUrl, setFotoUrl] = useState(professor.foto_url || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação
    if (!nome.trim()) {
      toast.error('Nome do professor é obrigatório')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('professores')
        .update({
          nome: nome.trim(),
          bio: bio.trim() || null,
          foto_url: fotoUrl.trim() || null
        })
        .eq('id', professor.id)

      if (error) {
        toast.error('Erro ao atualizar professor', {
          description: error.message
        })
        return
      }

      toast.success('Professor atualizado com sucesso!')

      // Chamar callback de sucesso
      if (onSuccess) {
        onSuccess()
      }
    } catch {
      toast.error('Erro inesperado ao atualizar professor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar Professor</CardTitle>
          <CardDescription>Atualize os dados do professor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Professor *</Label>
            <Input
              id="nome"
              placeholder="Ex: Dr. João Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              placeholder="Descreva a experiência e qualificações do professor..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={isLoading}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fotoUrl">URL da Foto</Label>
            <Input
              id="fotoUrl"
              type="url"
              placeholder="Ex: https://exemplo.com/foto.jpg (opcional)"
              value={fotoUrl}
              onChange={(e) => setFotoUrl(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              URL da foto de perfil do professor (opcional)
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="cursor-pointer"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} className="cursor-pointer">
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
