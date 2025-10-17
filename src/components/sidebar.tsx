'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Settings, 
  LogOut,
  GraduationCap,
  Shield,
  Video
} from 'lucide-react'

interface SidebarProps {
  user: {
    email: string
    nome?: string
    role?: string
  }
}

export function Sidebar({ user }: SidebarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      toast.error('Erro ao fazer logout')
      return
    }

    toast.success('Logout realizado com sucesso')
    router.push('/login')
    router.refresh()
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', adminOnly: false },
    { icon: Video, label: 'Aulas', href: '/dashboard/aulas', adminOnly: false },
    { icon: BookOpen, label: 'Cursos', href: '/dashboard/cursos', adminOnly: false },
    { icon: FileText, label: 'Simulados', href: '/dashboard/simulados', adminOnly: false },
    { icon: GraduationCap, label: 'Meu Progresso', href: '/dashboard/progresso', adminOnly: false },
    { icon: Settings, label: 'Configurações', href: '/dashboard/configuracoes', adminOnly: false },
  ]

  const adminMenuItems = [
    { icon: Shield, label: 'Painel Admin', href: '/dashboard/admin' },
    { icon: Shield, label: 'Usuários', href: '/dashboard/admin/usuarios' },
  ]

  const isAdmin = user.role === 'admin'

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">NAP Concursos</h1>
        <p className="text-sm text-muted-foreground">Plataforma de Estudos</p>
      </div>

      <Separator />

      {/* Menu Items */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} className="cursor-pointer">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 cursor-pointer"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Button>
          </Link>
        ))}

        {isAdmin && (
          <>
            <Separator className="my-2" />
            <div className="pt-2">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Administração
              </p>
              {adminMenuItems.map((item) => (
                <Link key={item.href} href={item.href} className="cursor-pointer">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>

      <Separator />

      {/* User Profile */}
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
          <Avatar>
            <AvatarFallback className="bg-blue-600 text-white">
              {getInitials(user.nome)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">
                {user.nome || 'Usuário'}
              </p>
              {isAdmin && (
                <Badge variant="default" className="bg-blue-600 text-xs px-1.5 py-0">
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="mt-2 w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  )
}

