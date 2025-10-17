'use client'

import { useState } from 'react'
import { ListQuestions } from './list-questions'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CreateQuestionForm } from './create-question-form'

export function AdminQuestionsContent() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleOpenSheet = () => {
    setIsSheetOpen(true)
  }

  const handleQuestionCreated = () => {
    setIsSheetOpen(false)
    setRefreshKey(prev => prev + 1) // Força recarregar a lista
  }

  return (
    <>
      <ListQuestions key={refreshKey} onCreateClick={handleOpenSheet} />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-0">
          <div className="sticky top-0 bg-white z-10 border-b p-6">
            <SheetHeader>
              <SheetTitle>Nova Questão</SheetTitle>
              <SheetDescription>
                Preencha os dados para criar uma nova questão
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="p-6">
            <CreateQuestionForm onSuccess={handleQuestionCreated} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
