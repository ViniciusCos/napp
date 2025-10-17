# Setup do Projeto

## Configuração das Variáveis de Ambiente

Para o projeto funcionar corretamente, você precisa criar um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Como obter as credenciais do Supabase:

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto (ou crie um novo)
4. No menu lateral, vá em **Settings** → **API**
5. Copie as seguintes informações:
   - **Project URL** → Cole em `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → anon/public → Cole em `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Exemplo de `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Configuração do Supabase

### 1. Authentication Settings

No painel do Supabase, configure o seguinte:

1. Vá em **Authentication** → **URL Configuration**
2. Configure:
   - **Site URL**: `http://localhost:3000` (desenvolvimento)
   - **Redirect URLs**: Adicione `http://localhost:3000/atualizar-senha`

### 2. Email Templates (Opcional)

Para personalizar os emails de recuperação de senha:

1. Vá em **Authentication** → **Email Templates**
2. Edite o template "Reset Password"
3. Certifique-se de que o link aponta para: `{{ .SiteURL }}/atualizar-senha?token={{ .Token }}`

### 3. Providers

1. Vá em **Authentication** → **Providers**
2. Certifique-se de que o provider **Email** está habilitado
3. Desabilite "Confirm email" se quiser permitir login sem confirmação de email (apenas para desenvolvimento)

## Primeira Execução

Após configurar as variáveis de ambiente:

```bash
# Instalar dependências (se ainda não instalou)
npm install

# Executar em modo de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) - você será redirecionado para a página de login.

## Testando a Autenticação

1. Clique em "Criar conta"
2. Preencha os dados (nome, email, senha)
3. Você receberá um email de confirmação (se a confirmação estiver habilitada)
4. Faça login com as credenciais criadas
5. Você será redirecionado para o dashboard

## Solução de Problemas

### Erro: "Invalid API key"
- Verifique se as variáveis de ambiente estão corretas
- Reinicie o servidor de desenvolvimento após adicionar o `.env.local`

### Erro: "Email not confirmed"
- Vá no Supabase → Authentication → Providers → Email
- Desabilite temporariamente a confirmação de email para testes

### Erro de redirecionamento
- Verifique se as URLs de redirecionamento estão configuradas no Supabase
- A URL deve incluir o protocolo (http:// ou https://)

