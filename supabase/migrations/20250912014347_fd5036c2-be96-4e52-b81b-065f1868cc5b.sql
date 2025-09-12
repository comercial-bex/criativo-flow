-- Criar tabela para dados de onboarding dos clientes
CREATE TABLE public.cliente_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL,
  
  -- 1. Identificação da Empresa
  nome_empresa TEXT NOT NULL,
  segmento_atuacao TEXT,
  produtos_servicos TEXT,
  tempo_mercado TEXT,
  localizacao TEXT,
  estrutura_atual TEXT,
  canais_contato TEXT,
  
  -- 2. Diagnóstico de Mercado
  concorrentes_diretos TEXT,
  diferenciais TEXT,
  fatores_crise TEXT,
  area_atendimento TEXT,
  tipos_clientes TEXT,
  
  -- 3. Estudo do Cliente
  publico_alvo TEXT[],
  publico_alvo_outros TEXT,
  dores_problemas TEXT,
  valorizado TEXT,
  como_encontram TEXT[],
  
  -- 4. Comportamento de Consumo
  frequencia_compra TEXT,
  ticket_medio TEXT,
  forma_aquisicao TEXT[],
  
  -- 5. Marketing e Comunicação
  presenca_digital TEXT[],
  presenca_digital_outros TEXT,
  frequencia_postagens TEXT,
  tipos_conteudo TEXT[],
  midia_paga TEXT,
  
  -- 6. Ações Promocionais & Publicidade
  feiras_eventos TEXT,
  materiais_impressos TEXT[],
  midia_tradicional TEXT[],
  
  -- 7. Matriz F.O.F.A
  forcas TEXT,
  fraquezas TEXT,
  oportunidades TEXT,
  ameacas TEXT,
  
  -- 8. Objetivos
  objetivos_digitais TEXT,
  objetivos_offline TEXT,
  onde_6_meses TEXT,
  resultados_esperados TEXT[],
  
  -- 9. Estrutura Comercial
  equipe_vendas_externa TEXT,
  canais_atendimento_ativos TEXT,
  relacionamento_clientes TEXT[],
  
  -- 10. Plano de Comunicação
  historia_marca TEXT,
  valores_principais TEXT,
  tom_voz TEXT[],
  como_lembrada TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE public.cliente_onboarding ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários autenticados podem ver onboarding" 
ON public.cliente_onboarding 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar onboarding" 
ON public.cliente_onboarding 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar onboarding" 
ON public.cliente_onboarding 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_cliente_onboarding_updated_at
BEFORE UPDATE ON public.cliente_onboarding
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir cliente Tech Solutions Ltda
INSERT INTO public.clientes (nome, email, telefone, endereco, cnpj_cpf, status)
VALUES (
  'Tech Solutions Ltda',
  'contato@techsolutions.com.br',
  '(11) 3456-7890',
  'Av. Paulista, 1500 - São Paulo, SP',
  '12.345.678/0001-90',
  'ativo'
);

-- Inserir dados de onboarding para Tech Solutions Ltda
INSERT INTO public.cliente_onboarding (
  cliente_id,
  nome_empresa,
  segmento_atuacao,
  produtos_servicos,
  tempo_mercado,
  localizacao,
  estrutura_atual,
  canais_contato,
  concorrentes_diretos,
  diferenciais,
  fatores_crise,
  area_atendimento,
  tipos_clientes,
  publico_alvo,
  publico_alvo_outros,
  dores_problemas,
  valorizado,
  como_encontram,
  frequencia_compra,
  ticket_medio,
  forma_aquisicao,
  presenca_digital,
  presenca_digital_outros,
  frequencia_postagens,
  tipos_conteudo,
  midia_paga,
  feiras_eventos,
  materiais_impressos,
  midia_tradicional,
  forcas,
  fraquezas,
  oportunidades,
  ameacas,
  objetivos_digitais,
  objetivos_offline,
  onde_6_meses,
  resultados_esperados,
  equipe_vendas_externa,
  canais_atendimento_ativos,
  relacionamento_clientes,
  historia_marca,
  valores_principais,
  tom_voz,
  como_lembrada
) VALUES (
  (SELECT id FROM public.clientes WHERE nome = 'Tech Solutions Ltda' LIMIT 1),
  'Tech Solutions Ltda',
  'Tecnologia da Informação',
  'Desenvolvimento de software customizado, consultoria em TI, implementação de sistemas ERP, suporte técnico especializado',
  '8 anos',
  'São Paulo, SP com filiais em Campinas e Santos',
  'Equipe de 45 profissionais: 25 desenvolvedores, 8 consultores, 7 suporte técnico, 5 administrativo',
  'Site institucional, WhatsApp Business, telefone comercial, email corporativo, LinkedIn empresarial',
  'IBM Brasil, Accenture, Capgemini, SoftwareONE, empresas locais especializadas',
  'Metodologia ágil proprietária, atendimento 24/7, expertise em integração de sistemas legados, equipe certificada',
  'Concorrência desleal de preços, escassez de mão de obra qualificada, mudanças regulatórias LGPD',
  'Região Sudeste com foco em SP, RJ e MG',
  'Empresas de médio porte (50-500 funcionários), startups em crescimento, indústrias tradicionais',
  ARRAY['Empresas de médio porte', 'Startups', 'Indústrias'],
  'Empresas em processo de transformação digital',
  'Sistemas legados obsoletos, processos manuais ineficientes, falta de integração entre departamentos, segurança de dados inadequada',
  'Agilidade na entrega, suporte técnico qualificado, transparência nos processos, ROI comprovado',
  ARRAY['Indicação de parceiros', 'Google Ads', 'LinkedIn', 'Eventos do setor'],
  'Mensalmente para manutenção, trimestralmente para novas funcionalidades',
  'R$ 35.000 por projeto (variação de R$ 15.000 a R$ 150.000)',
  ARRAY['Processo de licitação', 'Indicação direta', 'Proposta comercial'],
  ARRAY['Site institucional', 'LinkedIn', 'WhatsApp Business', 'Google Meu Negócio'],
  'YouTube para cases de sucesso',
  'Semanal no LinkedIn, quinzenal no site',
  ARRAY['Cases de sucesso', 'Artigos técnicos', 'Webinars', 'Infográficos'],
  'R$ 8.000/mês em Google Ads e LinkedIn Ads',
  'Brasscom, Fenainfo, meetups locais de tecnologia',
  ARRAY['Folders institucionais', 'Cases impressos', 'Cartões de visita'],
  ARRAY['Revista Info', 'Rádio CBN São Paulo'],
  'Equipe técnica altamente qualificada, metodologia ágil comprovada, relacionamento sólido com clientes, infraestrutura tecnológica robusta',
  'Dependência de poucos clientes grandes, marca pouco conhecida no mercado nacional, processo de vendas longo, alta rotatividade de desenvolvedores juniores',
  'Crescimento do mercado de transformação digital, parcerias com grandes consultorias, expansão para mercado internacional, novos nichos como agronegócio digital',
  'Entrada de players internacionais, mudanças tecnológicas rápidas, crise econômica afetando investimentos em TI, regulamentações mais rígidas',
  'Aumentar presença digital em 40%, gerar 60 leads qualificados/mês, posicionar como referência em transformação digital no Sudeste',
  'Participar de 12 eventos/ano, estabelecer 5 parcerias estratégicas, abrir filial no RJ',
  'Líder regional em soluções de transformação digital com 100 colaboradores e faturamento de R$ 15 milhões/ano',
  ARRAY['Aumento de 50% no faturamento', 'Redução de 30% no ciclo de vendas', 'Crescimento de 40% na base de clientes'],
  'Sim, 3 vendedores externos especializados por região',
  'WhatsApp Business, central telefônica, portal do cliente, sistema de tickets',
  ARRAY['CRM personalizado', 'Reuniões trimestrais', 'Newsletter mensal', 'Eventos exclusivos'],
  'Fundada por 3 sócios engenheiros com visão de democratizar tecnologia para médias empresas. Crescimento orgânico focado na excelência técnica.',
  'Inovação, transparência, comprometimento, excelência técnica, parceria de longo prazo',
  ARRAY['Técnico especializado', 'Consultivo', 'Amigável', 'Confiável'],
  'A empresa que transforma ideias em soluções tecnológicas eficientes e duradouras'
);