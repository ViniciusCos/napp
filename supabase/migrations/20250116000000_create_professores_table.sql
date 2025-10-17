-- Criar tabela professores
CREATE TABLE IF NOT EXISTS public.professores (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  biografia TEXT,
  foto_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índice no nome para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_professores_nome ON public.professores(nome);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler professores
CREATE POLICY "Permitir leitura pública de professores"
  ON public.professores
  FOR SELECT
  USING (true);

-- Política: Apenas usuários autenticados podem inserir professores
CREATE POLICY "Permitir inserção para usuários autenticados"
  ON public.professores
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Apenas usuários autenticados podem atualizar professores
CREATE POLICY "Permitir atualização para usuários autenticados"
  ON public.professores
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política: Apenas usuários autenticados podem deletar professores
CREATE POLICY "Permitir deleção para usuários autenticados"
  ON public.professores
  FOR DELETE
  TO authenticated
  USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_professores_updated_at
  BEFORE UPDATE ON public.professores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.professores IS 'Tabela de professores do sistema';
COMMENT ON COLUMN public.professores.nome IS 'Nome completo do professor';
COMMENT ON COLUMN public.professores.biografia IS 'Biografia ou descrição do professor';
COMMENT ON COLUMN public.professores.foto_url IS 'URL da foto do perfil do professor';
