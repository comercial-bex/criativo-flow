-- Fix function search path mutable warning
CREATE OR REPLACE FUNCTION public.atualizar_pontuacao_gamificacao(
  p_user_id UUID,
  p_tipo_acao tipo_pontuacao,
  p_pontos INTEGER,
  p_descricao TEXT DEFAULT NULL,
  p_is_privado BOOLEAN DEFAULT false
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;