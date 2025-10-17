'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminQuestionsContent } from './admin-questions-content'
import { AdminSimuladosContent } from './admin-simulados-content'
import { AdminAulasContent } from './admin-aulas-content'
import { AdminProfessoresContent } from './admin-professores-content'
import { FileQuestion, ListChecks, Video, User } from 'lucide-react'

export function AdminTabs() {
  return (
    <Tabs defaultValue="questoes" className="flex-1 flex flex-col space-y-6">
      <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
        <TabsTrigger value="questoes" className="cursor-pointer">
          <FileQuestion className="h-4 w-4 mr-2" />
          Questões
        </TabsTrigger>
        <TabsTrigger value="simulados" className="cursor-pointer">
          <ListChecks className="h-4 w-4 mr-2" />
          Simulados
        </TabsTrigger>
        <TabsTrigger value="aulas" className="cursor-pointer">
          <Video className="h-4 w-4 mr-2" />
          Aulas
        </TabsTrigger>
        <TabsTrigger value="professores" className="cursor-pointer">
          <User className="h-4 w-4 mr-2" />
          Professores
        </TabsTrigger>
      </TabsList>

      <TabsContent value="questoes" className="flex-1">
        <AdminQuestionsContent />
      </TabsContent>

      <TabsContent value="simulados" className="flex-1">
        <AdminSimuladosContent />
      </TabsContent>

      <TabsContent value="aulas" className="flex-1">
        <AdminAulasContent />
      </TabsContent>

      <TabsContent value="professores" className="flex-1">
        <AdminProfessoresContent />
      </TabsContent>
    </Tabs>
  )
}

