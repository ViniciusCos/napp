'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

type AlternativaObjeto = {
  letra: string
  texto: string
  texto_html?: string
}

type QuestionDetails = {
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
  atualizado_em: string | null
  subtopicos: string[] | null
  texto_principal_rich: string | null
  texto_apoio_rich: string | null
  comentario_rich: string | null
  alternativas: Record<string, string> | AlternativaObjeto[] | null
}

type ViewQuestionDialogProps = {
  question: QuestionDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewQuestionDialog({ question, open, onOpenChange }: ViewQuestionDialogProps) {
  if (!question) return null

  // Normalizar alternativas para formato consistente
  const normalizeAlternativas = (alts: Record<string, string> | AlternativaObjeto[] | null) => {
    if (!alts) return null
    
    // Se for array (formato novo)
    if (Array.isArray(alts)) {
      const normalized: Record<string, string> = {}
      alts.forEach((alt) => {
        normalized[alt.letra] = alt.texto_html || alt.texto
      })
      return normalized
    }
    
    // Se for objeto (formato antigo)
    return alts as Record<string, string>
  }

  const alternativasNormalizadas = normalizeAlternativas(question.alternativas)

  // Verificar se o texto contém HTML
  const isHTML = (text: string | null) => {
    if (!text) return false
    return /<[^>]+>/.test(text)
  }

  // Renderizar texto com suporte a HTML
  const renderRichText = (text: string | null) => {
    if (!text) return null
    
    if (isHTML(text)) {
      return (
        <div 
          className="rich-text-content"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      )
    }
    
    return <div className="whitespace-pre-wrap">{text}</div>
  }

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header da questão - estilo similar ao exemplo */}
        <div className="sticky top-0 bg-white z-10 border-b">
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                  {question.tipo}
                </div>
                <div>
                  <DialogTitle className="text-xl mb-1">Questão {question.id.substring(0, 8)}</DialogTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{question.disciplina}</span>
                    {question.subtopicos && question.subtopicos.length > 0 && (
                      <>
                        <span>›</span>
                        <span>{question.subtopicos[0]}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {question.dificuldade && (
                <Badge className={getDifficultyColor(question.dificuldade)}>
                  {getDifficultyLabel(question.dificuldade)}
                </Badge>
              )}
            </div>

            {/* Informações da questão - estilo similar ao exemplo */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm border-t pt-4">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-700">Ano:</span>
                <span className="text-gray-600">{question.ano}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-700">Banca:</span>
                <span className="text-gray-600">{question.banca}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-700">Órgão:</span>
                <span className="text-gray-600">{question.orgao}</span>
              </div>
              {question.prova && (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-700">Prova:</span>
                  <span className="text-gray-600">{question.prova}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-700">Tipo:</span>
                <Badge variant="outline" className={question.tipo === 'ME' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}>
                  {question.tipo === 'ME' ? 'Múltipla Escolha' : 'Certo/Errado'}
                </Badge>
              </div>
            </div>

            {/* Subtópicos */}
            {question.subtopicos && question.subtopicos.length > 1 && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex flex-wrap gap-1.5">
                  {question.subtopicos.map((subtopico, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs font-normal">
                      {subtopico}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Texto de Apoio */}
          {question.texto_apoio_rich && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">Texto de Apoio</h4>
                  <div className="text-blue-950">
                    {renderRichText(question.texto_apoio_rich)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enunciado Principal */}
          {question.texto_principal_rich && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
              <h4 className="font-semibold text-gray-900 mb-3 text-base">Enunciado</h4>
              <div className="text-gray-800 text-[15px]">
                {renderRichText(question.texto_principal_rich)}
              </div>
            </div>
          )}

          {/* Alternativas */}
          {alternativasNormalizadas && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-base">
                {question.tipo === 'ME' ? 'Alternativas' : 'Afirmação'}
              </h4>
              <div className="space-y-3">
                {Object.entries(alternativasNormalizadas).map(([key, value]) => (
                  <div
                    key={key}
                    className={`relative rounded-lg border-2 transition-all ${
                      question.gabarito === key
                        ? 'bg-green-50 border-green-400 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex gap-4 p-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        question.gabarito === key
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {key}
                      </div>
                      <div className="flex-1 pt-0.5">
                        {isHTML(value) ? (
                          <div 
                            className="rich-text-content"
                            dangerouslySetInnerHTML={{ __html: value }}
                          />
                        ) : (
                          <span className="whitespace-pre-wrap text-gray-800">{value}</span>
                        )}
                      </div>
                      {question.gabarito === key && (
                        <div className="flex-shrink-0">
                          <Badge className="bg-green-600 text-white">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Gabarito
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comentário/Explicação */}
          {question.comentario_rich && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 text-lg">Comentário do Professor</h4>
                  <p className="text-sm text-blue-700">Explicação detalhada da resposta correta</p>
                </div>
              </div>
              <div className="bg-white/80 rounded-lg p-4 border border-blue-100">
                {renderRichText(question.comentario_rich)}
              </div>
            </div>
          )}

          {/* Footer com informações adicionais */}
          <div className="border-t pt-4 mt-6">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Criado em {new Date(question.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                {question.atualizado_em && question.atualizado_em !== question.criado_em && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Atualizado em {new Date(question.atualizado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
              <span className="font-mono text-gray-400">ID: {question.id.substring(0, 13)}...</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

