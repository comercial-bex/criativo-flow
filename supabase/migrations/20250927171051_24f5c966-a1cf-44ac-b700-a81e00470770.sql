-- Enum para tipos de especialidade/setor
CREATE TYPE especialidade_gamificacao AS ENUM ('grs', 'design', 'audiovisual');

-- Enum para tipos de pontuação
CREATE TYPE tipo_pontuacao AS ENUM ('feedback_positivo', 'entrega_prazo', 'agendamento_prazo', 'relatorio_entregue', 'atraso_postagem', 'meta_batida', 'pacote_concluido', 'entrega_antecipada', 'aprovado_primeira', 'material_reprovado', 'video_entregue', 'entregas_semanais', 'video_aprovado', 'video_reprovado');

-- Tabela principal de usuários da gamificação
CREATE TABLE public.gamificacao_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setor especialidade_gamificacao NOT NULL,
  pontos_totais INTEGER NOT NULL DEFAULT 0,
  pontos_mes_atual INTEGER NOT NULL DEFAULT 0,
  posicao_ranking INTEGER,
  selos_conquistados JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela de histórico de pontuação
CREATE TABLE public.gamificacao_pontos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_acao tipo_pontuacao NOT NULL,
  pontos INTEGER NOT NULL,
  descricao TEXT,
  is_privado BOOLEAN DEFAULT false, -- Se true, apenas gestores veem
  mes_referencia DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela de selos disponíveis
CREATE TABLE public.gamificacao_selos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  icone TEXT NOT NULL, -- emoji ou classe de ícone
  setor especialidade_gamificacao,
  condicao JSONB NOT NULL, -- condições para conquistar o selo
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de conquistas de selos pelos usuários
CREATE TABLE public.gamificacao_conquistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selo_id UUID NOT NULL REFERENCES public.gamificacao_selos(id) ON DELETE CASCADE,
  mes_referencia DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, selo_id, mes_referencia)
);

-- Tabela de ranking mensal
CREATE TABLE public.gamificacao_ranking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setor especialidade_gamificacao NOT NULL,
  posicao INTEGER NOT NULL,
  pontos_totais INTEGER NOT NULL,
  mes_referencia DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE),
  is_vencedor BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mes_referencia)
);

-- Tabela de prêmios
CREATE TABLE public.gamificacao_premios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  valor_estimado DECIMAL(10,2),
  mes_referencia DATE NOT NULL,
  setor especialidade_gamificacao NOT NULL,
  vencedor_id UUID REFERENCES auth.users(id),
  entregue BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.gamificacao_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamificacao_pontos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamificacao_selos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamificacao_conquistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamificacao_ranking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamificacao_premios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Gamificação usuários
CREATE POLICY "Usuários podem ver próprio perfil de gamificação" ON public.gamificacao_usuarios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver ranking público" ON public.gamificacao_usuarios
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Sistema pode atualizar gamificação" ON public.gamificacao_usuarios
  FOR ALL USING (true);

-- Pontos
CREATE POLICY "Usuários podem ver próprios pontos" ON public.gamificacao_pontos
  FOR SELECT USING (auth.uid() = user_id OR NOT is_privado);

CREATE POLICY "Gestores podem ver todos os pontos" ON public.gamificacao_pontos
  FOR SELECT USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor');

CREATE POLICY "Sistema pode gerenciar pontos" ON public.gamificacao_pontos
  FOR ALL USING (true);

-- Selos
CREATE POLICY "Usuários podem ver selos" ON public.gamificacao_selos
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins podem gerenciar selos" ON public.gamificacao_selos
  FOR ALL USING (is_admin(auth.uid()));

-- Conquistas
CREATE POLICY "Usuários podem ver próprias conquistas" ON public.gamificacao_conquistas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver conquistas públicas" ON public.gamificacao_conquistas
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Sistema pode gerenciar conquistas" ON public.gamificacao_conquistas
  FOR ALL USING (true);

-- Ranking
CREATE POLICY "Usuários podem ver ranking" ON public.gamificacao_ranking
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Sistema pode gerenciar ranking" ON public.gamificacao_ranking
  FOR ALL USING (true);

-- Prêmios
CREATE POLICY "Usuários podem ver prêmios" ON public.gamificacao_premios
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Gestores podem gerenciar prêmios" ON public.gamificacao_premios
  FOR ALL USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor');

-- Função para atualizar pontuação
CREATE OR REPLACE FUNCTION public.atualizar_pontuacao_gamificacao(
  p_user_id UUID,
  p_tipo_acao tipo_pontuacao,
  p_pontos INTEGER,
  p_descricao TEXT DEFAULT NULL,
  p_is_privado BOOLEAN DEFAULT false
) RETURNS BOOLEAN AS $$
BEGIN
  -- Inserir histórico de pontos
  INSERT INTO public.gamificacao_pontos (user_id, tipo_acao, pontos, descricao, is_privado)
  VALUES (p_user_id, p_tipo_acao, p_pontos, p_descricao, p_is_privado);
  
  -- Atualizar pontos do usuário
  INSERT INTO public.gamificacao_usuarios (user_id, setor, pontos_totais, pontos_mes_atual)
  VALUES (
    p_user_id, 
    (SELECT especialidade FROM public.profiles WHERE id = p_user_id),
    p_pontos,
    p_pontos
  )
  ON CONFLICT (user_id) DO UPDATE SET
    pontos_totais = gamificacao_usuarios.pontos_totais + p_pontos,
    pontos_mes_atual = gamificacao_usuarios.pontos_mes_atual + p_pontos,
    updated_at = now();
    
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar timestamps
CREATE TRIGGER update_gamificacao_usuarios_updated_at
  BEFORE UPDATE ON public.gamificacao_usuarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir selos padrão
INSERT INTO public.gamificacao_selos (nome, descricao, icone, setor, condicao) VALUES
('Meta Batida no Prazo', 'Entregou meta no prazo estabelecido', '🥇', NULL, '{"tipo": "meta_prazo"}'),
('Entrega Antecipada', 'Entregou antes do prazo', '⚡', NULL, '{"tipo": "antecipada"}'),
('Qualidade Aprovada de Primeira', 'Trabalho aprovado sem necessidade de ajustes', '⭐', NULL, '{"tipo": "aprovado_primeira"}'),
('Foco Total', 'Passou o mês sem reprovações', '🎯', NULL, '{"tipo": "sem_reprovacao"}'),
('Top 1 do Setor', 'Primeiro lugar no ranking mensal do setor', '🏆', NULL, '{"tipo": "primeiro_lugar"}'),
('Feedback Positivo', 'Recebeu feedback positivo de cliente', '👍', 'grs', '{"tipo": "feedback_cliente"}'),
('Planejamento Master', 'Especialista em entregas de planejamento', '📊', 'grs', '{"tipo": "planejamento_expert"}'),
('Designer Criativo', 'Excelência em criação de peças', '🎨', 'design', '{"tipo": "criativo_expert"}'),
('Filmmaker Pro', 'Mestre em produção audiovisual', '🎥', 'audiovisual', '{"tipo": "video_expert"}');