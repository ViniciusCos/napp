# 🚀 Início Rápido - NAP Concursos

## Passos para começar (5 minutos)

### 1️⃣ Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL**
   - **anon/public key**

### 2️⃣ Criar arquivo de ambiente

No terminal:

```bash
cd /Users/viniciuscosta/Desktop/NAP\ Concursos\ Apps/napp/web
```

Crie o arquivo `.env.local`:

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=cole-a-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole-a-chave-aqui
EOF
```

Ou crie manualmente:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3️⃣ Configurar Authentication no Supabase

No painel do Supabase:

**Authentication → URL Configuration:**
- Site URL: `http://localhost:3000`
- Redirect URLs: Adicionar `http://localhost:3000/atualizar-senha`

**Authentication → Providers:**
- Ativar **Email**
- (Opcional) Desativar "Confirm email" para testes

### 4️⃣ Executar o projeto

```bash
# Instalar dependências (se ainda não instalou)
npm install

# Executar em desenvolvimento
npm run dev
```

### 5️⃣ Acessar a aplicação

Abra o navegador em: **http://localhost:3000**

Você será redirecionado para a tela de login!

## 📋 Testando

### Criar primeira conta:
1. Clique em "Criar conta"
2. Preencha: nome, email, senha
3. Clique em "Criar Conta"
4. Faça login com as credenciais

### Testar recuperação de senha:
1. Na tela de login, clique em "Esqueceu a senha?"
2. Digite seu email
3. Verifique o email recebido
4. Clique no link para redefinir

## ✅ Checklist

- [ ] Supabase configurado
- [ ] Arquivo `.env.local` criado
- [ ] URLs de redirecionamento configuradas
- [ ] Projeto rodando (`npm run dev`)
- [ ] Primeira conta criada
- [ ] Login funcionando
- [ ] Dashboard acessível

## 🔍 Verificar se está tudo OK

### O projeto está rodando?
```bash
npm run dev
```
Deve mostrar: `Local: http://localhost:3000`

### As variáveis estão corretas?
```bash
cat .env.local
```
Deve mostrar suas credenciais do Supabase

### O build funciona?
```bash
npm run build
```
Deve completar sem erros

## 🆘 Problemas?

### Erro: "Invalid API key"
→ Verifique o `.env.local` e reinicie o servidor

### Erro: "Email not confirmed"
→ No Supabase, desative a confirmação de email

### Página em branco
→ Abra o DevTools (F12) e veja o console

### Outros problemas
→ Veja `INSTRUCOES.md` para troubleshooting detalhado

## 🎉 Pronto!

Seu projeto está funcionando! Agora você pode:

1. Personalizar o dashboard
2. Adicionar funcionalidades
3. Conectar com dados reais
4. Customizar o design

## 📚 Próxima leitura

- `README.md` - Documentação completa
- `SETUP.md` - Configuração detalhada
- `INSTRUCOES.md` - Instruções e troubleshooting
- `PROJETO_COMPLETO.md` - Visão geral do projeto

