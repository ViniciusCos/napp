'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface CreateSimuladoFormProps {
  onSuccess?: () => void
}

export function CreateSimuladoForm({ onSuccess }: CreateSimuladoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Dados do simulado
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [fatorCorrecao, setFatorCorrecao] = useState('')
  const [allowRetake, setAllowRetake] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showRanking, setShowRanking] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação
    if (!title.trim()) {
      toast.error('Título é obrigatório')
      return
    }

    const durationNum = parseInt(durationMinutes)

    if (isNaN(durationNum) || durationNum <= 0) {
      toast.error('Duração deve ser maior que zero')
      return
    }

    // Validar fator de correção se fornecido
    let fatorNum: number | null = null
    if (fatorCorrecao.trim()) {
      fatorNum = parseInt(fatorCorrecao)
      if (isNaN(fatorNum) || fatorNum < 2) {
        toast.error('Fator de correção deve ser pelo menos 2')
        return
      }
    }

    // Validar datas se fornecidas
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (end <= start) {
        toast.error('A data de término deve ser posterior à data de início')
        return
      }
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('simulados')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          duration_minutes: durationNum,
          fator_correcao: fatorNum,
          is_active: true,
          allow_retake: allowRetake,
          start_date: startDate || null,
          end_date: endDate || null,
          show_ranking: showRanking
        })

      if (error) {
        toast.error('Erro ao criar simulado', {
          description: error.message
        })
        return
      }

      toast.success('Simulado criado com sucesso!')
      
      // Limpar formulário
      setTitle('')
      setDescription('')
      setDurationMinutes('')
      setFatorCorrecao('')
      setAllowRetake(true)
      setStartDate('')
      setEndDate('')
      setShowRanking(false)

      // Chamar callback de sucesso
      if (onSuccess) {
        onSuccess()
      }
    } catch {
      toast.error('Erro inesperado ao criar simulado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Simulado</CardTitle>
          <CardDescription>Preencha os dados básicos do simulado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Simulado PCDF - Agente de Polícia"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o simulado, conteúdo abordado, etc..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="Ex: 180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatorCorrecao">Fator de Correção</Label>
              <Input
                id="fatorCorrecao"
                type="number"
                min="2"
                placeholder="Ex: 3 (opcional)"
                value={fatorCorrecao}
                onChange={(e) => setFatorCorrecao(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Se fator=3, cada 3 erradas anulam 1 correta
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Data e hora de liberação do simulado (opcional)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Término</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Data e hora de término do simulado (opcional)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowRetake"
                  checked={allowRetake}
                  onCheckedChange={(checked) => setAllowRetake(checked === true)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="allowRetake"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Permitir que o usuário refaça o simulado
                </Label>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Se desmarcado, o usuário poderá fazer o simulado apenas uma vez
              </p>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showRanking"
                  checked={showRanking}
                  onCheckedChange={(checked) => setShowRanking(checked === true)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="showRanking"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Exibir ranking público para os usuários
                </Label>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Se marcado, os usuários poderão visualizar o ranking de todos os participantes
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            O número de questões será definido ao adicionar questões ao simulado
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (confirm('Tem certeza que deseja limpar o formulário?')) {
              setTitle('')
              setDescription('')
              setDurationMinutes('')
              setFatorCorrecao('')
              setAllowRetake(true)
              setStartDate('')
              setEndDate('')
              setShowRanking(false)
            }
          }}
          disabled={isLoading}
          className="cursor-pointer"
        >
          Limpar
        </Button>
        <Button type="submit" disabled={isLoading} className="cursor-pointer">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            'Criar Simulado'
          )}
        </Button>
      </div>
    </form>
  )
}

