-- Atualizar enum de roles para incluir todos os perfis da agência (em etapas)
ALTER TYPE user_role ADD VALUE 'grs';
ALTER TYPE user_role ADD VALUE 'atendimento';
ALTER TYPE user_role ADD VALUE 'designer';
ALTER TYPE user_role ADD VALUE 'filmmaker';
ALTER TYPE user_role ADD VALUE 'gestor';
ALTER TYPE user_role ADD VALUE 'cliente';