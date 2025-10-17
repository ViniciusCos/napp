'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-blue-600 rounded-full opacity-10 animate-pulse"></div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Página não encontrada
          </h2>
          <p className="text-gray-600">
            Desculpe, não conseguimos encontrar a página que você está procurando.
            Ela pode ter sido movida ou removida.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button className="w-full sm:w-auto cursor-pointer gap-2">
              <Home className="h-4 w-4" />
              Ir para o Dashboard
            </Button>
          </Link>
          
          <Button
            variant="outline"
            className="w-full sm:w-auto cursor-pointer gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Additional Help */}
        <div className="pt-8 text-sm text-gray-500">
          <p>
            Precisa de ajuda?{' '}
            <Link href="/dashboard" className="text-blue-600 hover:underline cursor-pointer">
              Voltar ao início
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

