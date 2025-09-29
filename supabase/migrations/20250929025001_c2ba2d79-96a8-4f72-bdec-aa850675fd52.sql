-- Criar tabela para templates de emails editáveis
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo text NOT NULL UNIQUE,
  assunto text NOT NULL,
  conteudo_html text NOT NULL,
  conteudo_texto text,
  variaveis_disponiveis text[] DEFAULT ARRAY[]::text[],
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Inserir templates padrão
INSERT INTO public.email_templates (tipo, assunto, conteudo_html, conteudo_texto, variaveis_disponiveis) VALUES
('novo_especialista', 
 'Novo Especialista Cadastrado - {{nome_especialista}}',
 '<h1>Novo Especialista Cadastrado</h1>
  <p>Um novo especialista se cadastrou na plataforma:</p>
  <ul>
    <li><strong>Nome:</strong> {{nome_especialista}}</li>
    <li><strong>Email:</strong> {{email_especialista}}</li>
    <li><strong>Especialidade:</strong> {{especialidade}}</li>
    <li><strong>Telefone:</strong> {{telefone}}</li>
  </ul>
  <p>Acesse o painel administrativo para aprovar ou rejeitar este cadastro.</p>',
 'Novo Especialista Cadastrado: {{nome_especialista}}. Email: {{email_especialista}}, Especialidade: {{especialidade}}',
 ARRAY['nome_especialista', 'email_especialista', 'especialidade', 'telefone']),

('aprovacao_especialista',
 'Seu cadastro foi aprovado! - {{nome_empresa}}',
 '<h1>Parabéns! Seu cadastro foi aprovado</h1>
  <p>Olá {{nome_especialista}},</p>
  <p>Temos o prazer de informar que seu cadastro foi aprovado em nossa plataforma!</p>
  {{#observacoes}}<p><strong>Observações:</strong> {{observacoes}}</p>{{/observacoes}}
  <p>Agora você tem acesso completo ao sistema e pode começar a colaborar conosco.</p>
  <p>Acesse a plataforma em: <a href="{{url_plataforma}}">{{url_plataforma}}</a></p>
  <p>Bem-vindo à equipe!</p>',
 'Parabéns {{nome_especialista}}! Seu cadastro foi aprovado. Acesse: {{url_plataforma}}',
 ARRAY['nome_especialista', 'nome_empresa', 'observacoes', 'url_plataforma']),

('rejeicao_especialista',
 'Informações sobre seu cadastro - {{nome_empresa}}',
 '<h1>Sobre seu cadastro</h1>
  <p>Olá {{nome_especialista}},</p>
  <p>Agradecemos seu interesse em fazer parte de nossa equipe.</p>
  <p>Infelizmente, não podemos aprovar seu cadastro neste momento.</p>
  {{#observacoes}}<p><strong>Motivo:</strong> {{observacoes}}</p>{{/observacoes}}
  <p>Caso tenha dúvidas, entre em contato conosco.</p>',
 'Olá {{nome_especialista}}, não foi possível aprovar seu cadastro no momento. {{observacoes}}',
 ARRAY['nome_especialista', 'nome_empresa', 'observacoes']),

('bem_vindo',
 'Bem-vindo à {{nome_empresa}}!',
 '<h1>Bem-vindo à {{nome_empresa}}!</h1>
  <p>Olá {{nome_usuario}},</p>
  <p>É um prazer tê-lo conosco! Sua conta foi criada com sucesso.</p>
  <p>Aqui estão seus dados de acesso:</p>
  <ul>
    <li><strong>Email:</strong> {{email_usuario}}</li>
    <li><strong>Perfil:</strong> {{tipo_usuario}}</li>
  </ul>
  <p>Acesse a plataforma: <a href="{{url_plataforma}}">{{url_plataforma}}</a></p>
  <p>Em caso de dúvidas, nossa equipe está à disposição.</p>',
 'Bem-vindo {{nome_usuario}}! Sua conta foi criada. Acesse: {{url_plataforma}}',
 ARRAY['nome_usuario', 'email_usuario', 'tipo_usuario', 'nome_empresa', 'url_plataforma']);

-- Criar tabela de logs de emails enviados
CREATE TABLE public.email_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_tipo text NOT NULL,
  destinatario_email text NOT NULL,
  destinatario_nome text,
  assunto text NOT NULL,
  status text NOT NULL DEFAULT 'enviado',
  resend_id text,
  erro_mensagem text,
  variaveis_utilizadas jsonb DEFAULT '{}'::jsonb,
  enviado_por uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS para email_templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar templates de email"
ON public.email_templates
FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Usuários autenticados podem ver templates"
ON public.email_templates
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- RLS para email_logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver todos os logs de email"
ON public.email_logs
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor');

CREATE POLICY "Sistema pode criar logs de email"
ON public.email_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para enviar email de novo especialista
CREATE OR REPLACE FUNCTION public.enviar_email_novo_especialista()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir chamada para edge function
  PERFORM
    net.http_post(
      url := 'https://xvpqgwbktpfodbuhwqhh.supabase.co/functions/v1/send-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cHFnd2JrdHBmb2RidWh3cWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDA0MzUsImV4cCI6MjA3MzExNjQzNX0.slj0vNEGfgTFv_vB_4ieLH1zuHSP_A6dAZsMmHVWnto"}'::jsonb,
      body := jsonb_build_object(
        'template_tipo', 'novo_especialista',
        'destinatarios', (
          SELECT jsonb_agg(jsonb_build_object('email', p.email, 'nome', p.nome))
          FROM profiles p
          JOIN user_roles ur ON p.id = ur.user_id
          WHERE ur.role = 'admin'
        ),
        'variaveis', jsonb_build_object(
          'nome_especialista', NEW.nome,
          'email_especialista', NEW.email,
          'especialidade', NEW.especialidade,
          'telefone', COALESCE(NEW.telefone, 'Não informado')
        )
      )
    );

  RETURN NEW;
END;
$$;

-- Trigger para enviar email quando novo especialista se cadastra
CREATE TRIGGER trigger_email_novo_especialista
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.status = 'pendente_aprovacao')
  EXECUTE FUNCTION public.enviar_email_novo_especialista();