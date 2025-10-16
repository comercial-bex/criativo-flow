-- População básica Audiovisual + FK Gamificação
INSERT INTO audiovisual_metas (especialista_id, mes_ano, meta_projetos, meta_horas, projetos_concluidos, horas_trabalhadas)
SELECT p.id, DATE_TRUNC('month', CURRENT_DATE)::date, 5, 160, 2, 85
FROM profiles p WHERE p.especialidade IN ('filmmaker', 'audiovisual') AND p.status = 'aprovado' LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO equipamentos (nome, tipo, status, observacoes) VALUES 
  ('Sony A7S III', 'camera', 'disponivel', 'Câmera 4K'),
  ('DJI Mavic 3', 'drone', 'disponivel', 'Drone'),
  ('Sony 24-70mm', 'lente', 'disponivel', 'Zoom'),
  ('Rode NTG3', 'microfone', 'disponivel', 'Shotgun'),
  ('Aputure 300D', 'iluminacao', 'em_uso', 'LED'),
  ('DJI Ronin', 'estabilizador', 'disponivel', 'Gimbal'),
  ('Zoom H6', 'audio', 'disponivel', 'Gravador'),
  ('Blackmagic 6K', 'camera', 'manutencao', 'Cinema')
ON CONFLICT DO NOTHING;

UPDATE tarefa SET executor_area = 'Audiovisual', 
  horas_trabalhadas = CASE WHEN status = 'concluido' THEN 2.5 WHEN status = 'em_andamento' THEN 1.5 ELSE NULL END,
  updated_at = NOW()
WHERE executor_area IS NULL AND id IN (SELECT id FROM tarefa WHERE executor_area IS NULL LIMIT 5);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_gamificacao_usuarios_profile') THEN
    ALTER TABLE gamificacao_usuarios ADD CONSTRAINT fk_gamificacao_usuarios_profile 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;