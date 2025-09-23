-- Criar bucket para anexos das tarefas
INSERT INTO storage.buckets (id, name, public) VALUES ('task-attachments', 'task-attachments', false);

-- Criar políticas para o bucket de anexos
CREATE POLICY "Users can view task attachments" ON storage.objects FOR SELECT USING (bucket_id = 'task-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can upload task attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'task-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update task attachments" ON storage.objects FOR UPDATE USING (bucket_id = 'task-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete task attachments" ON storage.objects FOR DELETE USING (bucket_id = 'task-attachments' AND auth.uid() IS NOT NULL);

-- Adicionar campo anexos na tabela tarefas
ALTER TABLE tarefas ADD COLUMN anexos JSONB DEFAULT '[]'::jsonb;