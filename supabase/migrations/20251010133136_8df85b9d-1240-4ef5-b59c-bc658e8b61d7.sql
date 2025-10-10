-- Popular categorias base do inventário (apenas se não existirem)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.inventario_categorias WHERE nome = 'Câmeras') THEN
    INSERT INTO public.inventario_categorias (nome, descricao, icone, ativo)
    VALUES 
      ('Câmeras', 'Câmeras de vídeo e fotografia profissional', '📷', true),
      ('Áudio', 'Microfones, gravadores e acessórios de áudio', '🎤', true),
      ('Iluminação', 'Luzes, refletores e modificadores de luz', '💡', true),
      ('Drones', 'Drones para captação aérea', '🚁', true),
      ('Estabilizadores', 'Gimbal, steadicam, slider e equipamentos de estabilização', '🎬', true),
      ('Lentes', 'Lentes e objetivas para câmeras', '🔭', true);
  END IF;
END $$;

-- Inserir modelo exemplo para facilitar testes (apenas se categoria existir)
DO $$
DECLARE
  v_categoria_id UUID;
BEGIN
  SELECT id INTO v_categoria_id 
  FROM public.inventario_categorias 
  WHERE nome = 'Câmeras' 
  LIMIT 1;
  
  IF v_categoria_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.inventario_modelos 
    WHERE marca = 'Sony' AND modelo = 'A7 III'
  ) THEN
    INSERT INTO public.inventario_modelos (categoria_id, marca, modelo, especificacoes)
    VALUES (
      v_categoria_id,
      'Sony',
      'A7 III',
      '{"sensor": "Full Frame 24.2MP", "video": "4K 30fps", "iso": "100-51200"}'::jsonb
    );
  END IF;
END $$;