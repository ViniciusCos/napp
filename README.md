# NAP Concursos - Web App

Plataforma de estudos para concursos públicos desenvolvida com Next.js, TypeScript, Supabase e shadcn/ui.

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Supabase** - Backend (Auth + Database)
- **Lucide React** - Ícones

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase

## ⚙️ Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
```

Para obter essas credenciais:
1. Acesse [supabase.com](https://supabase.com)
2. Vá para o seu projeto
3. Settings → API
4. Copie a `Project URL` e `anon/public key`

### 3. Configurar Supabase Authentication

No painel do Supabase:
1. Vá em Authentication → Providers
2. Ative o provedor "Email" 
3. Configure as URLs de redirecionamento:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/atualizar-senha`

## 🏃 Executar o projeto

### Modo desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Build para produção

```bash
npm run build
npm start
```

## 📂 Estrutura do Projeto

```
web/
├── src/
│   ├── app/
│   │   ├── login/              # Página de login
│   │   ├── cadastro/           # Página de cadastro
│   │   ├── recuperar-senha/    # Recuperação de senha
│   │   ├── atualizar-senha/    # Atualização de senha
│   │   ├── dashboard/          # Dashboard (protegido)
│   │   │   ├── layout.tsx      # Layout com sidebar
│   │   │   └── page.tsx        # Página inicial
│   │   ├── layout.tsx          # Layout principal
│   │   └── page.tsx            # Redireciona para login
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   └── sidebar.tsx         # Menu lateral
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts       # Cliente Supabase (client-side)
│   │       └── server.ts       # Cliente Supabase (server-side)
│   ├── types/
│   │   └── supabase.ts         # Tipos do Supabase
│   └── middleware.ts           # Proteção de rotas
├── public/                     # Arquivos estáticos
└── package.json
```

## 🔐 Autenticação

O sistema de autenticação inclui:

- **Login** - Email e senha
- **Cadastro** - Nome, email, senha e confirmação
- **Recuperação de senha** - Envio de email para reset
- **Atualização de senha** - Nova senha após reset
- **Logout** - Encerramento de sessão

### Proteção de Rotas

O middleware protege automaticamente as rotas:
- `/dashboard/*` - Requer autenticação
- `/login`, `/cadastro` - Redireciona para dashboard se autenticado

## 🎨 Componentes UI

Componentes shadcn/ui disponíveis:
- Button
- Input
- Label
- Card
- Form
- Separator
- Avatar
- Sonner (Toasts/Notificações)

## 📱 Funcionalidades

### Implementadas ✅
- Sistema completo de autenticação
- Dashboard com sidebar
- Proteção de rotas
- Notificações (toasts)
- Layout responsivo

### Em desenvolvimento 🚧
- Funcionalidades específicas do dashboard
- Perfil do usuário
- Cursos e provas
- Estatísticas de estudo

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa o linter
```

## 📝 Notas

- O projeto usa Next.js 15 com App Router
- A autenticação é gerenciada pelo Supabase
- O middleware garante a proteção de rotas
- Os toasts são exibidos usando Sonner

## 🤝 Suporte

Para problemas ou dúvidas, consulte a documentação:
- [Next.js](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
