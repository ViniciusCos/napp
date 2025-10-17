'use client'

import { useState } from 'react'
import { ListProfessores } from './list-professores'
import { CreateProfessorForm } from './create-professor-form'
import { EditProfessorForm } from './edit-professor-form'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

type Professor = {
  id: number
  nome: string
  bio: string | null
  foto_url: string | null
  created_at: string
  updated_at: string
}

export function AdminProfessoresContent() {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleOpenCreateSheet = () => {
    setIsCreateSheetOpen(true)
  }

  const handleProfessorCreated = () => {
    setIsCreateSheetOpen(false)
    setRefreshKey(prev => prev + 1) // Força recarregar a lista
  }

  const handleEditProfessor = (professor: Professor) => {
    setEditingProfessor(professor)
    setIsEditSheetOpen(true)
  }

  const handleProfessorUpdated = () => {
    setIsEditSheetOpen(false)
    setEditingProfessor(null)
    setRefreshKey(prev => prev + 1) // Força recarregar a lista
  }

  const handleCancelEdit = () => {
    setIsEditSheetOpen(false)
    setEditingProfessor(null)
  }

  return (
    <>
      <ListProfessores 
        key={refreshKey} 
        onCreateClick={handleOpenCreateSheet}
        onEditClick={handleEditProfessor}
      />

      {/* Sheet para criar professor */}
      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
          <div className="sticky top-0 bg-white z-10 border-b p-6">
            <SheetHeader>
              <SheetTitle>Novo Professor</SheetTitle>
              <SheetDescription>
                Preencha os dados para criar um novo professor
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="p-6">
            <CreateProfessorForm onSuccess={handleProfessorCreated} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet para editar professor */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
          <div className="sticky top-0 bg-white z-10 border-b p-6">
            <SheetHeader>
              <SheetTitle>Editar Professor</SheetTitle>
              <SheetDescription>
                Atualize os dados do professor
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="p-6">
            {editingProfessor && (
              <EditProfessorForm 
                professor={editingProfessor}
                onSuccess={handleProfessorUpdated}
                onCancel={handleCancelEdit}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
