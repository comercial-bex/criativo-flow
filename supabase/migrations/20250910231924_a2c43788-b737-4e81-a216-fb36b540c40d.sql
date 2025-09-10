-- Adicionar apenas os valores que faltam no enum user_role
ALTER TYPE user_role ADD VALUE 'grs';
ALTER TYPE user_role ADD VALUE 'filmmaker';
ALTER TYPE user_role ADD VALUE 'gestor';