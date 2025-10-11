-- =====================================================
-- PARTE 1: ADICIONAR ROLE RH
-- =====================================================

-- Adicionar 'rh' ao enum user_role
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    WHERE t.typname = 'user_role' AND e.enumlabel = 'rh') THEN
    ALTER TYPE user_role ADD VALUE 'rh';
  END IF;
END$$;

-- Atualizar perfil da Victória para ter especialidade 'grs'
UPDATE public.profiles 
SET especialidade = 'grs', updated_at = NOW()
WHERE email ILIKE '%victoria%' OR nome ILIKE '%Victória%Oliveira%Cardoso%';