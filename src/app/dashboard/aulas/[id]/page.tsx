import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, BookOpen, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface AulaPageProps {
  params: {
    id: string
  }
}

interface Professor {
  id: number
  nome: string
  bio?: string
  foto_url?: string
}

interface Question {
  id: number
  texto_principal_rich: string
  disciplina: string
  banca: string
  ano: number
  dificuldade?: string
  tipo: 'ME' | 'CE'
  alternativas?: Record<string, string>
  gabarito: string
}

interface AulaQuestao {
  id: number
  ordem: number
  questions: Question
}

interface Aula {
  id: number
  nome: string
  tema: string
  subtema: string[]
  descricao?: string
  material?: string
  link?: string
  data?: string
  created_at: string
  professores: Professor
  aulas_questoes: AulaQuestao[]
}

// Função para extrair ID do vídeo do YouTube
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

export default async function AulaPage({ params }: AulaPageProps) {
  const supabase = await createClient()
  const { id } = params

  // Buscar aula com questões associadas
  const { data: aula, error } = await supabase
    .from('aulas')
    .select(`
      *,
      professores (
        id,
        nome,
        bio,
        foto_url
      ),
      aulas_questoes (
        id,
        ordem,
        questions (
          id,
          texto_principal_rich,
          disciplina,
          banca,
          ano,
          dificuldade,
          tipo,
          alternativas,
          gabarito
        )
      )
    `)
    .eq('id', parseInt(id))
    .single() as { data: Aula | null; error: unknown }

  if (error || !aula) {
    redirect('/dashboard/aulas')
  }

  const youtubeId = aula.link ? getYouTubeVideoId(aula.link) : null

  return (
    <div className="p-8 h-full overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Voltar */}
        <Link href="/dashboard/aulas">
          <Button variant="ghost" className="mb-6 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o Catálogo
          </Button>
        </Link>

        {/* Vídeo Player */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
              {youtubeId ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={aula.nome || 'Aula'}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : aula.link ? (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <p className="mb-4">Vídeo não disponível ou formato não suportado</p>
                    <a 
                      href={aula.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Abrir link externo
                    </a>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p>Vídeo não disponível</p>
                </div>
              )}
            </div>

            <div className="p-6">
              {/* Título e Badges */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{aula.nome || 'Sem título'}</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="default" className="bg-blue-600">
                      {aula.tema || 'Sem tema'}
                    </Badge>
                    {aula.subtema && aula.subtema.length > 0 && (
                      aula.subtema.map((sub, idx) => (
                        <Badge key={idx} variant="secondary">{sub}</Badge>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Informações */}
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4 flex-wrap">
                {aula.data && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(aula.data).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Publicado em {new Date(aula.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Professor */}
              {aula.professores && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {aula.professores.foto_url ? (
                      <Image 
                        src={aula.professores.foto_url} 
                        alt={aula.professores.nome}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                        {(aula.professores.nome || 'P').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">Professor(a): {aula.professores.nome}</p>
                      {aula.professores.bio && (
                        <p className="text-sm text-gray-600">{aula.professores.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Descrição */}
              {aula.descricao && (
                <div className="prose max-w-none mb-4">
                  <h3 className="text-lg font-semibold mb-2">Sobre esta aula</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{aula.descricao}</p>
                </div>
              )}

              {/* Material Complementar */}
              {aula.material && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Material Complementar</h4>
                      <p className="text-sm text-blue-800">{aula.material}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Questões da Aula */}
              {aula.aulas_questoes && aula.aulas_questoes.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-orange-600" />
                    Questões da Aula ({aula.aulas_questoes.length})
                  </h3>
                  <div className="space-y-4">
                    {aula.aulas_questoes
                      .sort((a: AulaQuestao, b: AulaQuestao) => a.ordem - b.ordem)
                      .map((aulaQuestao: AulaQuestao, index: number) => {
                        const question = aulaQuestao.questions
                        if (!question) return null

                        return (
                          <Card key={aulaQuestao.id} className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge variant="outline" className="text-xs">
                                    {question.disciplina}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {question.banca}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {question.ano}
                                  </Badge>
                                  <Badge variant={question.tipo === 'ME' ? 'default' : 'secondary'} className="text-xs">
                                    {question.tipo === 'ME' ? 'Múltipla Escolha' : 'Certo/Errado'}
                                  </Badge>
                                  {question.dificuldade && (
                                    <Badge variant="outline" className="text-xs">
                                      {question.dificuldade}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div 
                                  className="text-sm text-gray-700 mb-4"
                                  dangerouslySetInnerHTML={{ 
                                    __html: question.texto_principal_rich || 'Sem texto' 
                                  }}
                                />

                                {question.tipo === 'ME' && question.alternativas && (
                                  <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Alternativas:</p>
                                    <div className="grid grid-cols-1 gap-2">
                                      {Object.entries(question.alternativas).map(([key, value]) => (
                                        <div key={key} className="flex items-center gap-2 text-sm">
                                          <span className="font-medium text-gray-600 w-6">{key})</span>
                                          <span className={question.gabarito === key ? 'text-green-600 font-semibold' : 'text-gray-700'}>
                                            {String(value)}
                                          </span>
                                          {question.gabarito === key && (
                                            <Badge variant="default" className="text-xs bg-green-600">
                                              Gabarito
                                            </Badge>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {question.tipo === 'CE' && (
                                  <div className="mt-3">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Gabarito:</p>
                                    <Badge variant={question.gabarito === 'C' ? 'default' : 'secondary'} className="text-sm">
                                      {question.gabarito === 'C' ? 'Certo' : 'Errado'}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Outras aulas do mesmo tema */}
        {aula.tema && <OutrasAulas tema={aula.tema} currentAulaId={aula.id} />}
      </div>
    </div>
  )
}

// Componente para mostrar outras aulas
async function OutrasAulas({ tema, currentAulaId }: { tema: string; currentAulaId: number }) {
  const supabase = await createClient()

  const { data: outras } = await supabase
    .from('aulas')
    .select('*')
    .eq('tema', tema)
    .eq('disponivel', true)
    .neq('id', currentAulaId)
    .order('created_at', { ascending: false })
    .limit(3)

  if (!outras || outras.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Outras Aulas de {tema}
        </CardTitle>
        <CardDescription>Continue aprendendo com mais conteúdo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {outras.map((aula) => (
            <Link key={aula.id} href={`/dashboard/aulas/${aula.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {aula.nome || 'Sem título'}
                  </h3>
                  {aula.subtema && aula.subtema.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {aula.subtema.slice(0, 2).map((sub: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
