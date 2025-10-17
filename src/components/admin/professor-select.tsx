'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'

type Professor = {
  id: number
  nome: string
  bio?: string
  foto_url?: string
}

interface ProfessorSelectProps {
  value?: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function ProfessorSelect({ value, onValueChange, disabled }: ProfessorSelectProps) {
  const [professores, setProfessores] = useState<Professor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  // Dados do novo professor
  const [nome, setNome] = useState('')
  const [bio, setBio] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')

  const loadProfessores = useCallback(async () => {
    setIsLoading(true)
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Usuário não autenticado')
        return
      }

      const { data, error } = await supabase
        .from('professores')
        .select('id, nome, bio, foto_url')
        .order('nome', { ascending: true })

      if (error) {
        toast.error('Erro ao carregar professores', {
          description: error.message
        })
        return
      }

      setProfessores(data || [])
    } catch (err) {
      console.error('Erro ao carregar professores:', err)
      toast.error('Erro inesperado ao carregar professores')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadProfessores()
  }, [loadProfessores])

  const handleCreateProfessor = async () => {
    if (!nome.trim()) {
      toast.error('Nome do professor é obrigatório')
      return
    }

    setIsSaving(true)

    try {
      const { data, error } = await supabase
        .from('professores')
        .insert({
          nome: nome.trim(),
          bio: bio.trim() || null,
          foto_url: fotoUrl.trim() || null
        })
        .select()
        .single()

      if (error) {
        toast.error('Erro ao criar professor', {
          description: error.message
        })
        return
      }

      toast.success('Professor criado com sucesso!')

      // Limpar formulário
      setNome('')
      setBio('')
      setFotoUrl('')

      // Fechar dialog
      setIsDialogOpen(false)

      // Recarregar lista
      await loadProfessores()

      // Selecionar o professor recém-criado
      if (data) {
        onValueChange(data.id.toString())
      }
    } catch (err) {
      console.error('Erro ao criar professor:', err)
      toast.error('Erro inesperado ao criar professor')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
          <SelectTrigger className="w-full h-11">
            <SelectValue placeholder={isLoading ? 'Carregando...' : 'Selecione um professor'} />
          </SelectTrigger>
          <SelectContent>
            {professores.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Nenhum professor cadastrado
              </div>
            ) : (
              professores.map((professor) => (
                <SelectItem key={professor.id} value={professor.id.toString()}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {professor.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {professor.nome}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsDialogOpen(true)}
          disabled={disabled}
          className="cursor-pointer shrink-0 h-11 w-11"
          title="Adicionar novo professor"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Novo Professor
            </DialogTitle>
            <DialogDescription>
              Adicione um novo professor ao sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="professor-nome" className="text-sm font-medium">
                Nome *
              </Label>
              <Input
                id="professor-nome"
                placeholder="Nome completo do professor"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={isSaving}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professor-bio" className="text-sm font-medium">
                Biografia
              </Label>
              <Input
                id="professor-bio"
                placeholder="Breve descrição sobre o professor"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={isSaving}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professor-foto" className="text-sm font-medium">
                URL da Foto
              </Label>
              <Input
                id="professor-foto"
                type="url"
                placeholder="https://exemplo.com/foto.jpg"
                value={fotoUrl}
                onChange={(e) => setFotoUrl(e.target.value)}
                disabled={isSaving}
                className="h-11"
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
              className="h-10"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreateProfessor}
              disabled={isSaving || !nome.trim()}
              className="h-10 bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Professor
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
