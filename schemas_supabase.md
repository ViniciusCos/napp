# Schemas do Supabase - NAP Concursos

## 📋 Índice

1. [Tabela: users](#tabela-users)
2. [Tabela: admin_actions](#tabela-admin_actions)
3. [Tabela: questions](#tabela-questions)
4. [Tabela: simulados](#tabela-simulados)
5. [Tabela: simulados_questoes](#tabela-simulados_questoes)
6. [Tabela: aulas](#tabela-aulas)
7. [Tabela: aulas_questoes](#tabela-aulas_questoes)
8. [Sistema de Administração](#sistema-de-administração)

---

## 📊 Tabela: `users`

Armazena informações de perfil dos usuários do sistema.

### Campos

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| `id` | UUID | ❌ | `gen_random_uuid()` | ID único do usuário (Primary Key) |
| `name` | TEXT | ❌ | - | Nome completo do usuário |
| `email` | TEXT | ❌ | - | Email do usuário (único) |
| `phone` | TEXT | ✅ | - | Telefone do usuário |
| `role` | TEXT | ❌ | `'user'` | Perfil do usuário ('user' ou 'admin') |
| `created_at` | TIMESTAMPTZ | ❌ | `NOW()` | Data de criação do registro |
| `updated_at` | TIMESTAMPTZ | ❌ | `NOW()` | Data da última atualização |

### Constraints

- `CHECK` role em ('user', 'admin')

### Índices

- `PRIMARY KEY` em `id`
- `UNIQUE INDEX` em `email`
- `idx_users_email` para buscas rápidas por email
- `idx_users_role` em `role` para filtros de administradores

### Row Level Security (RLS)

✅ **RLS Habilitado**

#### Políticas de Segurança

1. **"Users can view own data"** (SELECT)
   - Usuários podem visualizar todos os seus próprios dados
   - Condição: `auth.uid() = id`

2. **"Authenticated users can read names for rankings"** (SELECT)
   - Usuários autenticados podem ler informações de outros usuários
   - Usado para exibição de rankings públicos
   - ⚠️ **Importante**: A aplicação deve selecionar apenas campos públicos (id, name)
   - Condição: `true` (para authenticated)

3. **"Users can update own data"** (UPDATE)
   - Usuários só podem atualizar seus próprios dados
   - Condição: `auth.uid() = id`

4. **"Users can insert own data"** (INSERT)
   - Usuários só podem inserir dados com seu próprio ID
   - Condição: `auth.uid() = id`

### Triggers

- **`set_updated_at`**: Atualiza automaticamente o campo `updated_at` antes de cada UPDATE

### Funções Relacionadas

#### `handle_updated_at()`

Função trigger que atualiza o campo `updated_at` automaticamente.

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$;
```

## 🔄 Relação com Auth do Supabase

A tabela `users` está vinculada ao sistema de autenticação do Supabase através do campo `id`:
- O `id` deve corresponder ao `auth.uid()` do usuário autenticado
- As políticas RLS garantem que cada usuário só acesse seus próprios dados

## 📝 Exemplos de Uso

### Criar novo usuário

```typescript
const { data, error } = await supabase
  .from('users')
  .insert({
    id: user.id, // ID do auth.users
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '11999999999'
  })
```

### Buscar dados do usuário

```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single()
```

### Atualizar perfil

```typescript
const { data, error } = await supabase
  .from('users')
  .update({
    name: 'João Pedro Silva',
    phone: '11988888888'
  })
  .eq('id', user.id)
```

## 🔒 Segurança

- ✅ Row Level Security habilitado
- ✅ Políticas de acesso por usuário
- ✅ Políticas adicionais para rankings públicos (apenas nome visível)
- ✅ View segura `user_public_profiles` para dados públicos
- ✅ Search path seguro nas funções
- ✅ Email único no sistema
- ✅ Sistema de roles (user/admin)

### 📋 View: `user_public_profiles`

View segura que expõe apenas informações públicas dos usuários:

```sql
SELECT 
  id,
  name,
  created_at
FROM public.users
```

**Uso**: Pode ser usada para buscar informações públicas sem expor dados sensíveis como email e telefone.

---

## 📊 Tabela: `admin_actions`

Log de auditoria de ações administrativas no sistema.

### Campos

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| `id` | UUID | ❌ | `gen_random_uuid()` | ID único da ação |
| `admin_id` | UUID | ❌ | - | ID do administrador que executou (FK users) |
| `action_type` | TEXT | ❌ | - | Tipo de ação executada |
| `target_user_id` | UUID | ✅ | - | ID do usuário alvo (FK users) |
| `details` | JSONB | ✅ | - | Detalhes adicionais da ação |
| `created_at` | TIMESTAMPTZ | ❌ | `NOW()` | Data da ação |

### Foreign Keys

- `admin_id` → `users.id` (ON DELETE CASCADE)
- `target_user_id` → `users.id` (ON DELETE SET NULL)

### RLS

✅ **RLS Habilitado**

- **SELECT**: Apenas administradores podem visualizar
- **INSERT**: Apenas administradores podem inserir

### Exemplos de Uso

```typescript
// Registrar promoção a admin
await supabase
  .from('admin_actions')
  .insert({
    admin_id: currentAdminId,
    action_type: 'promote_to_admin',
    target_user_id: userId,
    details: { previous_role: 'user', new_role: 'admin' }
  })
```

---

## 📊 Tabela: `questions`

Armazena questões de concursos com informações detalhadas para o sistema de simulados.

### Campos

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| `id` | UUID | ❌ | `gen_random_uuid()` | ID único da questão |
| `ano` | INTEGER | ❌ | - | Ano do concurso (1900-2100) |
| `banca` | TEXT | ❌ | - | Banca organizadora |
| `orgao` | TEXT | ❌ | - | Órgão do concurso |
| `prova` | TEXT | ✅ | - | Nome/tipo da prova |
| `disciplina` | TEXT | ❌ | - | Disciplina/matéria |
| `subtopicos` | TEXT[] | ✅ | - | Array de subtópicos |
| `tipo` | TEXT | ❌ | - | Tipo: 'ME' (Múltipla Escolha) ou 'CE' (Certo/Errado) |
| `alternativas` | JSONB | ✅ | - | JSON com alternativas da questão |
| `gabarito` | TEXT | ❌ | - | Resposta correta |
| `criado_em` | TIMESTAMPTZ | ✅ | `NOW()` | Data de criação |
| `atualizado_em` | TIMESTAMPTZ | ✅ | `NOW()` | Última atualização |
| `texto_principal_rich` | TEXT | ✅ | - | Enunciado da questão (rich text) |
| `texto_apoio_rich` | TEXT | ✅ | - | Texto de apoio (rich text) |
| `dificuldade` | TEXT | ✅ | - | Nível de dificuldade |
| `comentario_rich` | TEXT | ✅ | - | Comentário/explicação (rich text) |
| `plataforma_id` | TEXT | ✅ | - | ID na plataforma de origem |
| `plataforma` | TEXT | ✅ | - | Nome da plataforma de origem |

### Constraints

- `PRIMARY KEY` em `id`
- `CHECK` ano entre 1900 e 2100
- `CHECK` tipo em ('ME', 'CE')

### Índices

- `idx_questions_ano` em `ano`
- `idx_questions_banca` em `banca`
- `idx_questions_orgao` em `orgao`
- `idx_questions_disciplina` em `disciplina`
- `idx_questions_tipo` em `tipo`
- `idx_questions_dificuldade` em `dificuldade`
- `idx_questions_plataforma` em `plataforma`

### RLS

✅ **RLS Habilitado**

- **SELECT**: Qualquer pessoa pode visualizar questões
- **INSERT/UPDATE/DELETE**: Apenas usuários autenticados

### Triggers

- `set_atualizado_em_questions`: Atualiza `atualizado_em` automaticamente

### Formato do Campo `alternativas` (JSONB)

```json
{
  "A": "Texto da alternativa A",
  "B": "Texto da alternativa B",
  "C": "Texto da alternativa C",
  "D": "Texto da alternativa D",
  "E": "Texto da alternativa E (opcional)"
}
```

Ou para questões Certo/Errado:

```json
{
  "CE": "Texto da afirmação"
}
```

---

## 📊 Tabela: `simulados`

Armazena os simulados/provas disponíveis para os usuários.

### Campos

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| `id` | UUID | ❌ | `gen_random_uuid()` | ID único do simulado |
| `title` | TEXT | ❌ | - | Título do simulado |
| `description` | TEXT | ✅ | - | Descrição do simulado |
| `duration_minutes` | INTEGER | ❌ | `60` | Duração em minutos |
| `total_questions` | INTEGER | ❌ | `0` | Total de questões (auto-calculado) |
| `created_by` | UUID | ✅ | - | ID do usuário criador (FK users) |
| `is_active` | BOOLEAN | ✅ | `true` | Se está ativo |
| `created_at` | TIMESTAMPTZ | ❌ | `NOW()` | Data de criação |
| `updated_at` | TIMESTAMPTZ | ❌ | `NOW()` | Última atualização |
| `allow_retake` | BOOLEAN | ❌ | `true` | Se permite refazer o simulado |
| `start_date` | TIMESTAMPTZ | ✅ | - | Data e hora de liberação do simulado |
| `end_date` | TIMESTAMPTZ | ✅ | - | Data e hora de término do simulado |
| `show_ranking` | BOOLEAN | ❌ | `false` | Se permite que usuários visualizem o ranking público |

### Índices

- `PRIMARY KEY` em `id`
- `idx_simulados_active` em `is_active`
- `idx_simulados_created_by` em `created_by`
- `idx_simulados_start_date` em `start_date`
- `idx_simulados_end_date` em `end_date`

### Foreign Keys

- `created_by` → `users.id` (ON DELETE SET NULL)

### RLS

✅ **RLS Habilitado**

- **SELECT**: Qualquer pessoa pode ver simulados ativos ou próprios
- **INSERT**: Usuários autenticados podem criar
- **UPDATE/DELETE**: Apenas o criador pode editar/deletar

### Triggers

- `set_updated_at_simulados`: Atualiza `updated_at` automaticamente
- `update_total_questions_on_insert/delete`: Atualiza `total_questions` automaticamente

---

## 📊 Tabela: `simulados_questoes`

Tabela de relacionamento entre simulados e questões (many-to-many).

### Campos

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| `id` | UUID | ❌ | `gen_random_uuid()` | ID único |
| `simulado_id` | UUID | ❌ | - | ID do simulado (FK) |
| `question_id` | UUID | ❌ | - | ID da questão (FK) |
| `order_position` | INTEGER | ❌ | - | Posição/ordem da questão |
| `created_at` | TIMESTAMPTZ | ❌ | `NOW()` | Data de criação |

### Índices

- `PRIMARY KEY` em `id`
- `UNIQUE` em `(simulado_id, question_id)` - Impede questões duplicadas
- `UNIQUE` em `(simulado_id, order_position)` - Impede posições duplicadas
- `idx_simulados_questoes_simulado` em `simulado_id`
- `idx_simulados_questoes_question` em `question_id`

### Foreign Keys

- `simulado_id` → `simulados.id` (ON DELETE CASCADE)
- `question_id` → `questions.id` (ON DELETE CASCADE)

### RLS

✅ **RLS Habilitado**

- **SELECT**: Qualquer pessoa pode visualizar
- **INSERT/DELETE**: Usuários autenticados podem gerenciar

---


## 📊 Tabela: `professores`

Armazena informações dos professores.

### Campos

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| `id` | BIGINT | ❌ | `IDENTITY` | ID único do professor |
| `nome` | TEXT | ❌ | - | Nome do professor |
| `bio` | TEXT | ✅ | - | Biografia/descrição |
| `foto_url` | TEXT | ✅ | - | URL da foto do professor |
| `created_at` | TIMESTAMPTZ | ❌ | `NOW()` | Data de criação |
| `updated_at` | TIMESTAMPTZ | ❌ | `NOW()` | Última atualização |

### Triggers

- **`set_updated_at_professores`**: Atualiza automaticamente o campo `updated_at` antes de cada UPDATE

### RLS
✅ **RLS Habilitado**
- **SELECT**: Todos podem visualizar
- **INSERT/UPDATE/DELETE**: Apenas administradores

---

## 📊 Tabela: `aulas`

Armazena aulas/vídeoaulas agendadas e disponíveis para os alunos.

### Campos

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| `id` | BIGINT | ❌ | `IDENTITY` | ID único da aula |
| `nome` | TEXT | ✅ | - | Nome/título da aula |
| `descricao` | TEXT | ✅ | - | Descrição detalhada da aula |
| `link` | TEXT | ✅ | - | Link do vídeo da aula |
| `material` | TEXT | ✅ | - | Link ou descrição do material complementar |
| `tema` | TEXT | ✅ | - | Tema principal da aula |
| `subtema` | TEXT[] | ✅ | - | Array de subtemas abordados |
| `capa` | TEXT | ✅ | - | URL da imagem de capa |
| `data` | TIMESTAMPTZ | ✅ | - | Data e hora da aula ao vivo ou de publicação |
| `professor_id` | BIGINT | ✅ | - | ID do professor (FK professores) |
| `disponivel` | BOOLEAN | ✅ | `true` | Se a aula está disponível para visualização |
| `created_at` | TIMESTAMPTZ | ❌ | `NOW()` | Data de criação |

### Índices

- `PRIMARY KEY` em `id`
- `idx_aulas_tema` em `tema`
- `idx_aulas_disponivel` em `disponivel`
- `idx_aulas_professor_id` em `professor_id`
- `idx_aulas_data` em `data`

### Foreign Keys

- `professor_id` → `professores.id` (ON UPDATE CASCADE)

### RLS

✅ **RLS Habilitado**

#### Políticas de Segurança

1. **"Anyone can view available aulas"** (SELECT)
   - Qualquer pessoa pode visualizar aulas disponíveis
   - Condição: `disponivel = true`

2. **"Admins can view all aulas"** (SELECT)
   - Administradores podem ver todas as aulas
   - Condição: Usuário é admin

3. **"Only admins can insert aulas"** (INSERT)
   - Apenas administradores podem criar aulas

4. **"Only admins can update aulas"** (UPDATE)
   - Apenas administradores podem atualizar aulas

5. **"Only admins can delete aulas"** (DELETE)
   - Apenas administradores podem deletar aulas

### Exemplos de Uso

#### Criar aula

```typescript
const { data, error } = await supabase
  .from('aulas')
  .insert({
    nome: 'Introdução ao Direito Constitucional',
    descricao: 'Aula sobre os princípios fundamentais...',
    link: 'https://www.youtube.com/watch?v=xxxxx',
    material: 'https://drive.google.com/...',
    tema: 'Direito Constitucional',
    subtema: ['Princípios Fundamentais', 'Garantias'],
    capa: 'https://img.youtube.com/vi/xxxxx/maxresdefault.jpg',
    data: '2024-10-20T14:00:00',
    professor_id: 1,
    disponivel: true
  })
```

#### Buscar aulas disponíveis de um tema

```typescript
const { data, error } = await supabase
  .from('aulas')
  .select(`
    *,
    professores (
      id,
      nome,
      bio,
      foto_url
    )
  `)
  .eq('disponivel', true)
  .eq('tema', 'Direito Constitucional')
  .order('data', { ascending: false })
```

---

## 📊 Tabela: `aulas_questoes`

Tabela de relacionamento entre aulas e questões, permitindo associar questões específicas a cada aula.

### Campos

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| `id` | BIGINT | ❌ | `GENERATED BY DEFAULT AS IDENTITY` | ID único do relacionamento (Primary Key) |
| `aula_id` | BIGINT | ❌ | - | ID da aula (Foreign Key) |
| `question_id` | UUID | ❌ | - | ID da questão (Foreign Key) |
| `ordem` | INTEGER | ❌ | `1` | Ordem da questão na aula |
| `created_at` | TIMESTAMPTZ | ❌ | `NOW()` | Data de criação do relacionamento |

### Constraints

- `FOREIGN KEY` aula_id → aulas(id) ON DELETE CASCADE
- `FOREIGN KEY` question_id → questions(id) ON DELETE CASCADE
- `UNIQUE` (aula_id, question_id) - Evita duplicatas

### Índices

- `PRIMARY KEY` em `id`
- `idx_aulas_questoes_aula_id` em `aula_id`
- `idx_aulas_questoes_question_id` em `question_id`
- `idx_aulas_questoes_ordem` em `(aula_id, ordem)`

### Row Level Security (RLS)

✅ **RLS Habilitado**

#### Políticas de Segurança

1. **"Users can view aula questions"** (SELECT)
   - Usuários autenticados podem visualizar questões das aulas
   - Condição: `auth.role() = 'authenticated'`

2. **"Admins can manage aula questions"** (ALL)
   - Apenas administradores podem gerenciar questões das aulas
   - Condição: `EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')`

### Exemplos de Uso

#### Associar questão a uma aula

```typescript
const { data, error } = await supabase
  .from('aulas_questoes')
  .insert({
    aula_id: 1,
    question_id: 'uuid-da-questao',
    ordem: 1
  })
```

#### Buscar questões de uma aula

```typescript
const { data, error } = await supabase
  .from('aulas_questoes')
  .select(`
    *,
    questions (
      id,
      texto_principal_rich,
      alternativas,
      gabarito,
      dificuldade
    )
  `)
  .eq('aula_id', 1)
  .order('ordem', { ascending: true })
```

---

## 🔄 Relacionamentos

```
users (1) ──── (N) simulados
                    │
                    │ (N)
                    │
              simulados_questoes
                    │
                    │ (N)
                    │
                questions
                    │
                    │ (N)
                    │
              aulas_questoes
                    │
                    │ (1)
                    │
                   aulas
                    │
                    │ (1)
                    │
                professores
```

---

## 📅 Migrações Aplicadas

1. `create_users_table` - Criação da tabela users
2. `fix_handle_updated_at_security_cascade` - Correção de segurança da função
3. `create_user_profile_trigger` - Trigger para criar perfil ao signup
4. `create_simulados_tables` - Criação das tabelas de simulados
5. `update_questions_schema_fixed` - Atualização do schema de questões
6. `restore_questions_foreign_key` - Restauração das foreign keys
7. `add_user_roles_and_admin_system` - Sistema de administração e roles
8. `add_simulados_date_fields` - Adição de campos de data de início e término aos simulados
9. `add_show_ranking_to_simulados` - Adição de campo para controlar visualização de ranking pelos usuários
10. `allow_users_read_names` - Tentativa inicial de permitir leitura de nomes
11. `fix_user_names_visibility` - Correção de permissões de visibilidade
12. `create_secure_ranking_system` - Tentativa de criar sistema seguro com view
13. `create_user_public_profiles_view` - Criação de view segura para perfis públicos
14. `allow_authenticated_read_user_names` - Permite usuários autenticados lerem nomes para rankings
15. `create_aulas_table` - Criação da tabela de aulas/vídeoaulas (versão antiga - removida)
16. `create_apps_and_professores_tables` - Criação das tabelas apps e professores (apps removida)
17. `recreate_aulas_table_new_structure` - Recriação da tabela aulas com nova estrutura
18. `remove_apps_table_and_app_id_from_aulas` - Remoção da tabela apps e campo app_id
19. `simplify_professores_table` - Simplificação da tabela professores (removido email)
20. `add_timestamps_to_professores` - Adição de campos created_at e updated_at na tabela professores
21. `create_aulas_questoes_table` - Criação da tabela de relacionamento entre aulas e questões

---

## 📝 Exemplos de Uso

### Questões

#### Criar questão de múltipla escolha

```typescript
const { data, error } = await supabase
  .from('questions')
  .insert({
    ano: 2024,
    banca: 'CESPE',
    orgao: 'Polícia Federal',
    prova: 'Agente de Polícia Federal',
    disciplina: 'Direito Constitucional',
    subtopicos: ['Direitos Fundamentais', 'Garantias'],
    tipo: 'ME',
    alternativas: {
      A: 'Alternativa A',
      B: 'Alternativa B',
      C: 'Alternativa C',
      D: 'Alternativa D',
      E: 'Alternativa E'
    },
    gabarito: 'C',
    texto_principal_rich: '<p>Qual é a questão?</p>',
    dificuldade: 'médio',
    comentario_rich: '<p>Explicação da resposta</p>'
  })
```

#### Criar questão Certo/Errado

```typescript
const { data, error } = await supabase
  .from('questions')
  .insert({
    ano: 2024,
    banca: 'FCC',
    orgao: 'TRT-SP',
    disciplina: 'Direito do Trabalho',
    tipo: 'CE',
    alternativas: {
      CE: 'A CLT garante aos trabalhadores...'
    },
    gabarito: 'C',
    texto_principal_rich: '<p>Julgue o item.</p>'
  })
```

#### Buscar questões por filtros

```typescript
const { data, error } = await supabase
  .from('questions')
  .select('*')
  .eq('banca', 'CESPE')
  .eq('disciplina', 'Direito Constitucional')
  .gte('ano', 2020)
  .order('ano', { ascending: false })
```

### Simulados

#### Buscar simulados ativos

```typescript
const { data, error } = await supabase
  .from('simulados')
  .select('*')
  .eq('is_active', true)
```

#### Buscar simulado com questões

```typescript
const { data, error } = await supabase
  .from('simulados')
  .select(`
    *,
    simulados_questoes (
      order_position,
      questions (*)
    )
  `)
  .eq('id', simuladoId)
  .single()
```

#### Criar simulado

```typescript
const { data, error } = await supabase
  .from('simulados')
  .insert({
    title: 'Simulado ENEM 2024',
    description: 'Simulado completo do ENEM',
    duration_minutes: 180,
    created_by: userId
  })
```

#### Adicionar questão ao simulado

```typescript
const { data, error } = await supabase
  .from('simulados_questoes')
  .insert({
    simulado_id: simuladoId,
    question_id: questionId,
    order_position: 1
  })
```

---

---

## 🛡️ Sistema de Administração

### Função `is_admin()`

Verifica se o usuário autenticado é um administrador.

```sql
CREATE FUNCTION public.is_admin()
RETURNS BOOLEAN
```

**Uso:**
```typescript
const { data, error } = await supabase.rpc('is_admin')
```

### Políticas RLS Atualizadas

#### Questões (questions)
- **SELECT**: Qualquer pessoa (público)
- **INSERT/UPDATE/DELETE**: Apenas administradores

#### Simulados
- **SELECT**: Qualquer pessoa pode ver simulados ativos
- **INSERT/UPDATE/DELETE**: Apenas administradores

#### Simulados_Questões
- **SELECT**: Público
- **INSERT/DELETE**: Apenas administradores

### Controle de Acesso

#### Promover usuário a admin

```typescript
// 1. Verificar se usuário atual é admin
const { data: isAdmin } = await supabase.rpc('is_admin')

if (isAdmin) {
  // 2. Promover usuário
  await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('id', userId)
}
```

#### Verificar permissão no servidor (Next.js)

```typescript
import { requireAdmin } from '@/lib/check-admin'

export default async function AdminPage() {
  try {
    await requireAdmin() // Lança erro se não for admin
  } catch {
    redirect('/dashboard')
  }
  
  // Código para admins...
}
```

### Páginas de Administração

- **`/dashboard/admin/usuarios`**: Gerenciar usuários e permissões
  - Listar todos os usuários
  - Promover/despromover administradores
  - Visualizar estatísticas

### Funcionalidades Admin

✅ **Implementadas:**
- Promover/despromover usuários a admin
- Listar todos os usuários
- Badge de admin na sidebar
- Menu de administração visível apenas para admins
- Proteção de rotas admin

🔜 **Futuras:**
- Criar/editar questões (interface)
- Criar/editar simulados (interface)
- Relatórios e analytics
- Log de ações administrativas (visualização)

---

## 📊 Tabela: `simulado_attempts`

Registra as tentativas dos usuários nos simulados.

### Campos

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| `id` | UUID | ❌ | `gen_random_uuid()` | ID único da tentativa |
| `user_id` | UUID | ❌ | - | ID do usuário (FK users) |
| `simulado_id` | UUID | ❌ | - | ID do simulado (FK simulados) |
| `started_at` | TIMESTAMPTZ | ❌ | `NOW()` | Data/hora de início |
| `completed_at` | TIMESTAMPTZ | ✅ | - | Data/hora de conclusão |
| `time_spent_seconds` | INTEGER | ✅ | - | Tempo gasto em segundos |
| `total_questions` | INTEGER | ❌ | - | Total de questões |
| `correct_answers` | INTEGER | ❌ | `0` | Número de acertos |
| `incorrect_answers` | INTEGER | ❌ | `0` | Número de erros |
| `blank_answers` | INTEGER | ❌ | `0` | Questões não respondidas |
| `final_score` | NUMERIC | ✅ | - | Pontuação final (com fator de correção) |
| `percentage` | NUMERIC | ✅ | - | Percentual de acerto |
| `penalty_applied` | INTEGER | ❌ | `0` | Penalidade aplicada |
| `created_at` | TIMESTAMPTZ | ❌ | `NOW()` | Data de criação |
| `updated_at` | TIMESTAMPTZ | ❌ | `NOW()` | Última atualização |

### Foreign Keys

- `user_id` → `users.id` (ON DELETE CASCADE)
- `simulado_id` → `simulados.id` (ON DELETE CASCADE)

### Índices

- `idx_simulado_attempts_user_id` em `user_id`
- `idx_simulado_attempts_simulado_id` em `simulado_id`
- `idx_simulado_attempts_completed_at` em `completed_at`
- `idx_simulado_attempts_user_simulado` em `(user_id, simulado_id)`

### RLS

✅ **RLS Habilitado**

- **SELECT**: Usuários veem apenas suas tentativas; Admins veem todas
- **INSERT/UPDATE**: Usuários podem gerenciar apenas suas tentativas

---

## 📊 Tabela: `simulado_answers`

Registra as respostas individuais dos usuários em cada questão do simulado.

### Campos

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| `id` | UUID | ❌ | `gen_random_uuid()` | ID único |
| `attempt_id` | UUID | ❌ | - | ID da tentativa (FK simulado_attempts) |
| `question_id` | UUID | ❌ | - | ID da questão (FK questions) |
| `user_answer` | TEXT | ✅ | - | Resposta do usuário (NULL se não respondeu) |
| `correct_answer` | TEXT | ❌ | - | Gabarito correto |
| `is_correct` | BOOLEAN | ❌ | `false` | Se a resposta está correta |
| `question_order` | INTEGER | ❌ | - | Ordem da questão no simulado |
| `answered_at` | TIMESTAMPTZ | ✅ | - | Data/hora da resposta |
| `created_at` | TIMESTAMPTZ | ❌ | `NOW()` | Data de criação |

### Foreign Keys

- `attempt_id` → `simulado_attempts.id` (ON DELETE CASCADE)
- `question_id` → `questions.id` (ON DELETE CASCADE)

### Índices

- `idx_simulado_answers_attempt_id` em `attempt_id`
- `idx_simulado_answers_question_id` em `question_id`
- `idx_simulado_answers_attempt_question` (UNIQUE) em `(attempt_id, question_id)`

### RLS

✅ **RLS Habilitado**

- **SELECT**: Usuários veem apenas respostas de suas tentativas; Admins veem todas
- **INSERT**: Usuários podem inserir apenas em suas tentativas

---

## 🔄 Relacionamentos Atualizados

```
users (1) ──── (N) simulados
  │                 │
  │ (N)             │ (N)
  │                 │
simulado_attempts   simulados_questoes
  │                 │
  │ (N)             │ (N)
  │                 │
simulado_answers    questions
  │                 │
  └─────────────────┘
         (N)
```

---

## 🚀 Próximos Passos

Considere adicionar:
- Sistema de pontuação e ranking
- Relatórios de desempenho por disciplina
- Gráficos de evolução do usuário
- Comparação com média geral
- Exportação de resultados em PDF

