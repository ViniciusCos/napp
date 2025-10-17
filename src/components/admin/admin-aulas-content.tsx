'use client'

import { useState } from 'react'
import { ListAulas } from './list-aulas'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CreateAulaForm } from './create-aula-form'

export function AdminAulasContent() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleOpenSheet = () => {
    setIsSheetOpen(true)
  }

  const handleAulaCreated = () => {
    setIsSheetOpen(false)
    setRefreshKey(prev => prev + 1) // Força recarregar a lista
  }

  return (
    <>
      <ListAulas key={refreshKey} onCreateClick={handleOpenSheet} />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
          <div className="sticky top-0 bg-white z-10 border-b p-6">
            <SheetHeader>
              <SheetTitle>Nova Aula</SheetTitle>
              <SheetDescription>
                Preencha os dados para criar uma nova aula
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="p-6">
            <CreateAulaForm onSuccess={handleAulaCreated} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}