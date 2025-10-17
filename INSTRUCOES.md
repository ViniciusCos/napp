# Instruções de Configuração - NAP Concursos Web

## ✅ O que foi implementado

### 1. Estrutura do Projeto
- ✅ Next.js 15 com TypeScript e App Router
- ✅ Tailwind CSS configurado
- ✅ shadcn/ui instalado e configurado
- ✅ Supabase para autenticação e backend

### 2. Sistema de Autenticação Completo
- ✅ Página de Login (`/login`)
- ✅ Página de Cadastro (`/cadastro`)
- ✅ Recuperação de Senha (`/recuperar-senha`)
- ✅ Atualização de Senha (`/atualizar-senha`)
- ✅ Middleware para proteção de rotas
- ✅ Logout funcional

### 3. Dashboard
- ✅ Layout com sidebar
- ✅ Menu lateral com navegação
- ✅ Página inicial do dashboard
- ✅ Perfil do usuário na sidebar
- ✅ Cards informativos (em branco, prontos para dados)

### 4. Componentes UI (shadcn/ui)
- ✅ Button
- ✅ Input
- ✅ Label
- ✅ Card
- ✅ Form
- ✅ Separator
- ✅ Avatar
- ✅ Sonner (Toasts/Notificações)

## 🚀 Próximos Passos

### 1. Configurar Supabase

Você precisa criar um arquivo `.env.local` na raiz do projeto web:

```bash
cd /Users/viniciuscosta/Desktop/NAP\ Concursos\ Apps/napp/web
```

Crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
```

**Como obter as credenciais:**

1. Acesse https://supabase.com
2. Faça login e selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Configurar Authentication no Supabase

No painel do Supabase:

1. **Authentication** → **URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/atualizar-senha`

2. **Authentication** → **Providers**
   - Ative o provider **Email**
   - Para testes, você pode desabilitar "Confirm email"

### 3. Executar o Projeto

```bash
cd /Users/viniciuscosta/Desktop/NAP\ Concursos\ Apps/napp/web

# Instalar dependências (se necessário)
npm install

# Executar em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## 📁 Estrutura de Arquivos

```
web/
├── src/
│   ├── app/
│   │   ├── login/page.tsx
│   │   ├── cadastro/page.tsx
│   │   ├── recuperar-senha/page.tsx
│   │   ├── atualizar-senha/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/               # Componentes shadcn/ui
│   │   └── sidebar.tsx
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── server.ts
│   ├── types/
│   │   └── supabase.ts
│   └── middleware.ts
├── public/
├── README.md
├── SETUP.md
└── package.json
```

## 🔐 Fluxo de Autenticação

1. **Acesso inicial** → Redireciona para `/login`
2. **Login** → Valida credenciais → Dashboard
3. **Cadastro** → Cria conta → Login
4. **Esqueceu senha** → Envia email → Link para atualizar senha
5. **Dashboard** → Protegido por middleware

## 🎨 Personalização

### Sidebar
Editar: `src/components/sidebar.tsx`
- Adicionar/remover itens de menu
- Mudar cores e estilo

### Dashboard
Editar: `src/app/dashboard/page.tsx`
- Adicionar conteúdo
- Conectar com dados reais

### Tema
Editar: `src/app/globals.css`
- Variáveis de cores do Tailwind
- Estilos globais

## 📝 Notas Importantes

1. **Variáveis de Ambiente**: São necessárias para o funcionamento correto
2. **Confirmação de Email**: Pode ser desabilitada no Supabase para testes
3. **Middleware**: Protege rotas automaticamente
4. **Toasts**: Usam Sonner (substituiu toast deprecated)

## 🐛 Problemas Comuns

### "Invalid API key"
- Verifique se o `.env.local` está correto
- Reinicie o servidor: `npm run dev`

### "Email not confirmed"
- No Supabase: Authentication → Providers → Email
- Desabilite "Confirm email" para testes

### Página em branco
- Verifique o console do navegador
- Verifique se as variáveis de ambiente estão definidas

## 📞 Suporte

Documentação:
- [Next.js](https://nextjs.org/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

