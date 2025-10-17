-- Criar relação entre team_chat_messages e profiles
-- (a relação sender_id -> profiles não existia)

ALTER TABLE public.team_chat_messages
ADD CONSTRAINT fk_sender_profile
FOREIGN KEY (sender_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;
