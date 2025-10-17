import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userName = user?.user_metadata?.nome || 'Estudante'

  return (
    <div className="p-8 h-full overflow-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vindo, {userName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Aqui está um resumo da sua jornada de estudos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Cursos Ativos</CardTitle>
            <CardDescription>Seus cursos em andamento</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Provas Realizadas</CardTitle>
            <CardDescription>Total de avaliações completas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horas de Estudo</CardTitle>
            <CardDescription>Tempo total dedicado</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0h</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Atividades</CardTitle>
            <CardDescription>Continue de onde parou</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Nenhuma atividade programada no momento.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

