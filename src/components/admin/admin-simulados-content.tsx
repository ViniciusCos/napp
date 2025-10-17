'use client'

import { useState } from 'react'
import { ListSimulados } from './list-simulados'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CreateSimuladoForm } from './create-simulado-form'

export function AdminSimuladosContent() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleOpenSheet = () => {
    setIsSheetOpen(true)
  }

  const handleSimuladoCreated = () => {
    setIsSheetOpen(false)
    setRefreshKey(prev => prev + 1) // Força recarregar a lista
  }

  return (
    <>
      <ListSimulados key={refreshKey} onCreateClick={handleOpenSheet} />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
          <div className="sticky top-0 bg-white z-10 border-b p-6">
            <SheetHeader>
              <SheetTitle>Novo Simulado</SheetTitle>
              <SheetDescription>
                Preencha os dados para criar um novo simulado
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="p-6">
            <CreateSimuladoForm onSuccess={handleSimuladoCreated} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

