'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { 
  Shield, 
  User, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  Eye,
  Key,
  UserCog,
  Loader2
} from 'lucide-react'

type UserData = {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  created_at: string
  updated_at: string
}

interface UserManagementProps {
  initialUsers: UserData[]
}

export function UserManagement({ initialUsers }: UserManagementProps) {
  const [users, setUsers] = useState<UserData[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
  const [isChangingRole, setIsChangingRole] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const supabase = createClient()

  // Filtrar e buscar usuários
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone?.includes(searchTerm) || false)
      
      const matchesRole = 
        roleFilter === 'all' || user.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [users, searchTerm, roleFilter])

  // Estatísticas
  const stats = useMemo(() => {
    const total = users.length
    const admins = users.filter(u => u.role === 'admin').length
    const regularUsers = users.filter(u => u.role === 'user').length

    return { total, admins, regularUsers }
  }, [users])

  const handleReloadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setUsers(data || [])
    } catch (error) {
      console.error('Erro ao recarregar usuários:', error)
      toast.error('Erro ao recarregar lista de usuários')
    }
  }

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    
    if (!confirm(`Tem certeza que deseja ${newRole === 'admin' ? 'promover' : 'remover'} este usuário ${newRole === 'admin' ? 'para' : 'de'} administrador?`)) {
      return
    }

    setIsChangingRole(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      toast.success(`Usuário ${newRole === 'admin' ? 'promovido a' : 'removido de'} administrador com sucesso!`)
      await handleReloadUsers()
      
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole })
      }
    } catch (error) {
      console.error('Erro ao alterar role:', error)
      toast.error('Erro ao alterar permissão do usuário')
    } finally {
      setIsChangingRole(false)
    }
  }

  const handleResetPassword = async (email: string) => {
    setIsResettingPassword(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/atualizar-senha`
      })

      if (error) throw error

      toast.success('Email de redefinição de senha enviado com sucesso!')
      setIsResetPasswordOpen(false)
      setSelectedUser(null)
    } catch (error: unknown) {
      console.error('Erro ao enviar email:', error)
      toast.error('Erro ao enviar email de redefinição de senha', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setIsResettingPassword(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.admins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Regulares</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.regularUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busque e filtre usuários</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-filter">Filtrar por Função</Label>
              <Select value={roleFilter} onValueChange={(value: string) => setRoleFilter(value as "user" | "admin" | "all")}>
                <SelectTrigger id="role-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                  <SelectItem value="user">Usuários</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredUsers.length} de {users.length} usuários
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>Lista completa de usuários do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full font-semibold flex-shrink-0 ${
                      user.role === 'admin' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        {user.role === 'admin' && (
                          <Badge variant="default" className="bg-blue-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user)
                        setIsDetailsOpen(true)
                      }}
                      className="cursor-pointer"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalhes
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user)
                        setIsResetPasswordOpen(true)
                      }}
                      className="cursor-pointer"
                    >
                      <Key className="h-4 w-4 mr-1" />
                      Redefinir Senha
                    </Button>

                    <Button
                      variant={user.role === 'admin' ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => handleToggleRole(user.id, user.role)}
                      disabled={isChangingRole}
                      className="cursor-pointer"
                    >
                      <UserCog className="h-4 w-4 mr-1" />
                      {user.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">Nenhum usuário encontrado</p>
              <p className="text-sm text-gray-500 mt-1">
                Tente ajustar os filtros de busca
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Usuário */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
            <DialogDescription>
              Informações completas do usuário
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Avatar e Info Básica */}
              <div className="flex items-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full font-bold text-xl ${
                  selectedUser.role === 'admin' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {selectedUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <Badge variant={selectedUser.role === 'admin' ? 'default' : 'outline'}>
                    {selectedUser.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </Badge>
                </div>
              </div>

              {/* Informações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-600">Email</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{selectedUser.email}</span>
                  </div>
                </div>

                {selectedUser.phone && (
                  <div className="space-y-2">
                    <Label className="text-gray-600">Telefone</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedUser.phone}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-gray-600">Criado em</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(selectedUser.created_at)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-600">Última atualização</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(selectedUser.updated_at)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-600">ID</Label>
                  <div className="text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded">
                    {selectedUser.id}
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailsOpen(false)
                    setIsResetPasswordOpen(true)
                  }}
                  className="flex-1 cursor-pointer"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Redefinir Senha
                </Button>
                <Button
                  variant={selectedUser.role === 'admin' ? 'destructive' : 'default'}
                  onClick={() => {
                    handleToggleRole(selectedUser.id, selectedUser.role)
                    setIsDetailsOpen(false)
                  }}
                  className="flex-1 cursor-pointer"
                  disabled={isChangingRole}
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  {selectedUser.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Reset de Senha */}
      <AlertDialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Redefinir Senha</AlertDialogTitle>
            <AlertDialogDescription>
              Um email será enviado para <strong>{selectedUser?.email}</strong> com instruções para redefinir a senha.
              <br /><br />
              O usuário receberá um link seguro que expira em 1 hora.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setSelectedUser(null)}
              className="cursor-pointer"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleResetPassword(selectedUser.email)}
              disabled={isResettingPassword}
              className="cursor-pointer"
            >
              {isResettingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Email
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

