import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Play, Video, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { AulasSearch } from '@/components/aulas-search'

export default async function AulasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const searchTerm = params.q?.toLowerCase() || ''

  const supabase = await createClient()

  // Buscar aulas disponíveis com dados do professor
  const { data: allAulas, error } = await supabase
    .from('aulas')
    .select(`
      *,
      professor:professores(
        id,
        nome,
        foto_url
      )
    `)
    .eq('disponivel', true)
    .order('data', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar aulas:', error)
  }

  // Filtrar aulas pelo termo de busca
  const aulas = searchTerm
    ? allAulas?.filter((aula) => {
        const nome = aula.nome?.toLowerCase() || ''
        const tema = aula.tema?.toLowerCase() || ''
        const subtemas = aula.subtema?.map((s: string) => s.toLowerCase()).join(' ') || ''

        return (
          nome.includes(searchTerm) ||
          tema.includes(searchTerm) ||
          subtemas.includes(searchTerm)
        )
      })
    : allAulas

  return (
    <div className="p-8 h-full overflow-auto">
      {/* Header e Busca */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Aulas</h1>
        <p className="text-gray-600 mb-6">
          Acesse vídeoaulas e materiais de estudo
        </p>
        <AulasSearch />
      </div>

      {/* Lista de Aulas */}
      {aulas && aulas.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {aulas.map((aula) => (
                  <Link key={aula.id} href={`/dashboard/aulas/${aula.id}`}>
                    <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer group overflow-hidden p-0">
                      {/* Thumbnail com proporção 16:9 */}
                      <div className="relative aspect-video bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                        {aula.capa ? (
                          <Image
                            src={aula.capa}
                            alt={aula.nome || 'Aula'}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="h-16 w-16 text-white opacity-80" />
                          </div>
                        )}

                        {/* Data sobreposta */}
                        {aula.data && (
                          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(aula.data).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>

                      <CardHeader>
                        <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {aula.nome || 'Sem título'}
                        </CardTitle>
                        {aula.descricao && (
                          <CardDescription
                            className="line-clamp-2 prose prose-sm max-w-none [&>p]:m-0"
                            dangerouslySetInnerHTML={{ __html: aula.descricao }}
                          />
                        )}
                      </CardHeader>

                      <CardContent className="pb-4">
                        <div className="flex items-center justify-between gap-3">
                          {/* Informações do Professor */}
                          {aula.professor ? (
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Avatar className="h-8 w-8 shrink-0">
                                {aula.professor.foto_url ? (
                                  <AvatarImage src={aula.professor.foto_url} alt={aula.professor.nome} />
                                ) : null}
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                  {aula.professor.nome?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs text-gray-500">Professor(a)</span>
                                <span className="text-sm font-medium text-gray-900 truncate">{aula.professor.nome}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1" />
                          )}

                          {/* Botão Assistir */}
                          <Button size="sm" className="cursor-pointer gap-2 shrink-0">
                            <Play className="h-4 w-4" />
                            Assistir
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma aula disponível
              </h3>
              <p className="text-gray-600">
                Novas aulas serão adicionadas em breve. Fique atento!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
