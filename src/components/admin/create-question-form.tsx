'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'

type CreateQuestionFormProps = {
  onSuccess?: () => void
}

export function CreateQuestionForm({ onSuccess }: CreateQuestionFormProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Dados básicos
  const [ano, setAno] = useState('')
  const [banca, setBanca] = useState('')
  const [orgao, setOrgao] = useState('')
  const [prova, setProva] = useState('')
  const [disciplina, setDisciplina] = useState('')
  const [tipo, setTipo] = useState<'ME' | 'CE'>('ME')
  const [dificuldade, setDificuldade] = useState('')

  // Textos
  const [textoPrincipal, setTextoPrincipal] = useState('')
  const [textoApoio, setTextoApoio] = useState('')
  const [comentario, setComentario] = useState('')

  // Alternativas e gabarito
  const [alternativaA, setAlternativaA] = useState('')
  const [alternativaB, setAlternativaB] = useState('')
  const [alternativaC, setAlternativaC] = useState('')
  const [alternativaD, setAlternativaD] = useState('')
  const [alternativaE, setAlternativaE] = useState('')
  const [gabarito, setGabarito] = useState('')

  // Subtópicos
  const [subtopicos, setSubtopicos] = useState<string[]>([])
  const [novoSubtopico, setNovoSubtopico] = useState('')

  const handleAddSubtopico = () => {
    if (novoSubtopico.trim()) {
      // Separa por vírgulas e adiciona cada subtópico individualmente
      const novosSubtopicos = novoSubtopico
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
      
      setSubtopicos([...subtopicos, ...novosSubtopicos])
      setNovoSubtopico('')
    }
  }

  const handleRemoveSubtopico = (index: number) => {
    setSubtopicos(subtopicos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!ano || !banca || !orgao || !disciplina || !tipo || !gabarito) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    const anoNum = parseInt(ano)
    if (anoNum < 1900 || anoNum > 2100) {
      toast.error('Ano deve estar entre 1900 e 2100')
      return
    }

    setIsLoading(true)

    try {
      // Montar alternativas baseado no tipo
      const alternativas = tipo === 'ME' 
        ? {
            A: alternativaA,
            B: alternativaB,
            C: alternativaC,
            D: alternativaD,
            ...(alternativaE && { E: alternativaE })
          }
        : {
            CE: textoPrincipal
          }

      const { error } = await supabase
        .from('questions')
        .insert({
          ano: anoNum,
          banca,
          orgao,
          prova: prova || null,
          disciplina,
          tipo,
          alternativas,
          gabarito,
          texto_principal_rich: textoPrincipal || null,
          texto_apoio_rich: textoApoio || null,
          comentario_rich: comentario || null,
          dificuldade: dificuldade || null,
          subtopicos: subtopicos.length > 0 ? subtopicos : null
        })

      if (error) {
        toast.error('Erro ao criar questão', {
          description: error.message
        })
        return
      }

      toast.success('Questão criada com sucesso!')

      // Limpar formulário
      setAno('')
      setBanca('')
      setOrgao('')
      setProva('')
      setDisciplina('')
      setTipo('ME')
      setDificuldade('')
      setTextoPrincipal('')
      setTextoApoio('')
      setComentario('')
      setAlternativaA('')
      setAlternativaB('')
      setAlternativaC('')
      setAlternativaD('')
      setAlternativaE('')
      setGabarito('')
      setSubtopicos([])

      // Chamar callback de sucesso
      onSuccess?.()
    } catch {
      toast.error('Erro inesperado ao criar questão')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
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
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banca">Banca *</Label>
                <Input
                  id="banca"
                  value={banca}
                  onChange={(e) => setBanca(e.target.value)}
                  placeholder="Ex: CESPE, FCC, FGV"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgao">Órgão *</Label>
                <Input
                  id="orgao"
                  value={orgao}
                  onChange={(e) => setOrgao(e.target.value)}
                  placeholder="Ex: Polícia Federal"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prova">Prova (opcional)</Label>
                <Input
                  id="prova"
                  value={prova}
                  onChange={(e) => setProva(e.target.value)}
                  placeholder="Ex: Agente de Polícia"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disciplina">Disciplina *</Label>
                <Input
                  id="disciplina"
                  value={disciplina}
                  onChange={(e) => setDisciplina(e.target.value)}
                  placeholder="Ex: Direito Constitucional"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={tipo} onValueChange={(value: 'ME' | 'CE') => setTipo(value)}>
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
                <Select value={dificuldade || "none"} onValueChange={(value) => setDificuldade(value === "none" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue>
                      {dificuldade ? (() => {
                        const labels: Record<string, string> = {
                          'muito_facil': 'Muito fácil',
                          'facil': 'Fácil',
                          'medio': 'Médio',
                          'dificil': 'Difícil',
                          'muito_dificil': 'Muito difícil'
                        }
                        return labels[dificuldade] || dificuldade
                      })() : 'Nenhuma'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    <SelectItem value="muito_facil">Muito fácil</SelectItem>
                    <SelectItem value="facil">Fácil</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="dificil">Difícil</SelectItem>
                    <SelectItem value="muito_dificil">Muito difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subtópicos */}
            <div className="space-y-2">
              <Label>Subtópicos (opcional)</Label>
              <div className="flex gap-2">
                <Input
                  value={novoSubtopico}
                  onChange={(e) => setNovoSubtopico(e.target.value)}
                  placeholder="Digite um subtópico"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtopico())}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  onClick={handleAddSubtopico}
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {subtopicos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {subtopicos.map((subtopico, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <span>{subtopico}</span>
                      <button
                        type="button"
                        className="ml-1 hover:text-red-600 cursor-pointer"
                        onClick={() => handleRemoveSubtopico(index)}
                        disabled={isLoading}
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

        {/* Textos da Questão */}
        <Card>
          <CardHeader>
            <CardTitle>Enunciado e Textos</CardTitle>
            <CardDescription>Conteúdo da questão com formatação rich text</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RichTextEditor
              id="textoPrincipal"
              label="Texto Principal / Enunciado"
              value={textoPrincipal}
              onChange={setTextoPrincipal}
              placeholder="Digite o enunciado da questão..."
              disabled={isLoading}
              rows={6}
            />

            <RichTextEditor
              id="textoApoio"
              label="Texto de Apoio (opcional)"
              value={textoApoio}
              onChange={setTextoApoio}
              placeholder="Texto adicional, lei, artigo, etc..."
              disabled={isLoading}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Alternativas (apenas para Múltipla Escolha) */}
        {tipo === 'ME' && (
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
                  value={alternativaA}
                  onChange={(e) => setAlternativaA(e.target.value)}
                  rows={2}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="altB">Alternativa B *</Label>
                <Textarea
                  id="altB"
                  value={alternativaB}
                  onChange={(e) => setAlternativaB(e.target.value)}
                  rows={2}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="altC">Alternativa C *</Label>
                <Textarea
                  id="altC"
                  value={alternativaC}
                  onChange={(e) => setAlternativaC(e.target.value)}
                  rows={2}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="altD">Alternativa D *</Label>
                <Textarea
                  id="altD"
                  value={alternativaD}
                  onChange={(e) => setAlternativaD(e.target.value)}
                  rows={2}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="altE">Alternativa E (opcional)</Label>
                <Textarea
                  id="altE"
                  value={alternativaE}
                  onChange={(e) => setAlternativaE(e.target.value)}
                  rows={2}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gabarito e Comentário */}
        <Card>
          <CardHeader>
            <CardTitle>Gabarito e Comentário</CardTitle>
            <CardDescription>Resposta correta e explicação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gabarito">Gabarito *</Label>
              <Select value={gabarito} onValueChange={setGabarito}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a resposta correta" />
                </SelectTrigger>
                <SelectContent>
                  {tipo === 'ME' ? (
                    <>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                      {alternativaE && <SelectItem value="E">E</SelectItem>}
                    </>
                  ) : (
                    <>
                      <SelectItem value="C">Certo</SelectItem>
                      <SelectItem value="E">Errado</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <RichTextEditor
              id="comentario"
              label="Comentário / Explicação (opcional)"
              value={comentario}
              onChange={setComentario}
              placeholder="Explicação da resposta correta..."
              disabled={isLoading}
              rows={6}
            />
          </CardContent>
        </Card>

      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (confirm('Tem certeza que deseja limpar o formulário?')) {
              setAno('')
              setBanca('')
              setOrgao('')
              setProva('')
              setDisciplina('')
              setTipo('ME')
              setDificuldade('')
              setTextoPrincipal('')
              setTextoApoio('')
              setComentario('')
              setAlternativaA('')
              setAlternativaB('')
              setAlternativaC('')
              setAlternativaD('')
              setAlternativaE('')
              setGabarito('')
              setSubtopicos([])
            }
          }}
          disabled={isLoading}
          className="cursor-pointer"
        >
          Limpar
        </Button>
        <Button type="submit" disabled={isLoading} className="cursor-pointer">
          {isLoading ? 'Criando...' : 'Criar Questão'}
        </Button>
      </div>
    </form>
  )
}

