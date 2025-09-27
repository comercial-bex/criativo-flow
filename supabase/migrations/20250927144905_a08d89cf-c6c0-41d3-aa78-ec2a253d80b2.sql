-- Corrigir roles dos usuários aprovados que estão sem role (usando valores válidos do enum)
INSERT INTO user_roles (user_id, role)
VALUES 
  ('7e72d5d3-7ab2-4f90-a0fb-667746d889ff', 'grs'),
  ('9643e708-ae0a-4ed1-a4f4-9cf03c28e2d9', 'grs'),
  ('e8204d7e-a8f2-414b-a7ff-84949ae77855', 'atendimento'),
  ('eb6b01f5-6b67-4b6f-b072-b4fb5c98f935', 'financeiro'),
  ('88d065da-2026-4c87-bbe2-f78bd4e21b29', 'grs')
ON CONFLICT (user_id, role) DO NOTHING;