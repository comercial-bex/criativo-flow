-- Criar tabela de datas comemorativas
CREATE TABLE IF NOT EXISTS datas_comemorativas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  data_fixa TEXT,
  mes_referencia INTEGER CHECK (mes_referencia >= 1 AND mes_referencia <= 12),
  tipo TEXT NOT NULL CHECK (tipo IN ('nacional', 'regional', 'segmento')),
  regiao TEXT,
  segmentos JSONB DEFAULT '[]'::jsonb,
  descricao TEXT,
  potencial_engajamento TEXT CHECK (potencial_engajamento IN ('alto', 'medio', 'baixo')),
  sugestao_campanha TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de campanhas programadas
CREATE TABLE IF NOT EXISTS planejamento_campanhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planejamento_id UUID REFERENCES planejamentos(id) ON DELETE CASCADE,
  data_comemorativa_id UUID REFERENCES datas_comemorativas(id),
  nome_campanha TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  periodo_pre_campanha INTEGER DEFAULT 7,
  periodo_pos_campanha INTEGER DEFAULT 3,
  objetivos JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'planejada',
  orcamento_sugerido DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE datas_comemorativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE planejamento_campanhas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver datas comemorativas"
ON datas_comemorativas FOR SELECT
USING (true);

CREATE POLICY "Admin pode gerenciar datas comemorativas"
ON datas_comemorativas FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Usuários autenticados podem criar campanhas"
ON planejamento_campanhas FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem ver suas campanhas"
ON planejamento_campanhas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM planejamentos p
    WHERE p.id = planejamento_campanhas.planejamento_id
  )
);

CREATE POLICY "Usuários podem atualizar suas campanhas"
ON planejamento_campanhas FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM planejamentos p
    WHERE p.id = planejamento_campanhas.planejamento_id
  )
);

CREATE POLICY "Usuários podem deletar suas campanhas"
ON planejamento_campanhas FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM planejamentos p
    WHERE p.id = planejamento_campanhas.planejamento_id
  )
);

-- Popular com 50+ datas comemorativas
INSERT INTO datas_comemorativas (nome, data_fixa, mes_referencia, tipo, potencial_engajamento, sugestao_campanha, segmentos, descricao) VALUES
-- Janeiro
('Ano Novo', '01/01', 1, 'nacional', 'alto', 'Campanha de renovação e novos começos', '["geral"]', 'Celebração mundial do início do ano'),
('Dia do Nutricionista', '31/01', 1, 'nacional', 'medio', 'Dicas de alimentação saudável', '["saude", "nutricao"]', 'Valorização dos profissionais de nutrição'),

-- Fevereiro
('Carnaval', NULL, 2, 'nacional', 'alto', 'Campanha festiva com cores vibrantes', '["turismo", "eventos", "moda"]', 'Maior festa popular do Brasil'),
('Dia do Gráfico', '07/02', 2, 'segmento', 'baixo', 'Valorização do design gráfico', '["design", "marketing"]', 'Homenagem aos profissionais de design'),

-- Março
('Dia da Mulher', '08/03', 3, 'nacional', 'alto', 'Campanha de empoderamento feminino', '["beleza", "moda", "saude", "geral"]', 'Celebração das conquistas femininas'),
('Dia do Consumidor', '15/03', 3, 'nacional', 'alto', 'Ofertas e promoções especiais', '["varejo", "ecommerce"]', 'Defesa dos direitos do consumidor'),
('Dia da Água', '22/03', 3, 'nacional', 'medio', 'Conscientização ambiental', '["sustentabilidade", "educacao"]', 'Preservação dos recursos hídricos'),

-- Abril
('Dia da Mentira', '01/04', 4, 'nacional', 'medio', 'Conteúdo divertido e viral', '["entretenimento", "geral"]', 'Dia de brincadeiras e pegadinhas'),
('Páscoa', NULL, 4, 'nacional', 'alto', 'Campanha de chocolate e presentes', '["alimentos", "varejo", "geral"]', 'Celebração religiosa e comercial'),
('Dia do Livro', '23/04', 4, 'nacional', 'medio', 'Promoção de leitura', '["educacao", "livrarias"]', 'Incentivo à leitura'),

-- Maio
('Dia do Trabalho', '01/05', 5, 'nacional', 'medio', 'Valorização dos trabalhadores', '["rh", "geral"]', 'Direitos trabalhistas'),
('Dia das Mães', NULL, 5, 'nacional', 'alto', 'Presentes e homenagens', '["varejo", "beleza", "joias", "geral"]', 'Segunda melhor data comercial do ano'),
('Dia da Enfermagem', '12/05', 5, 'segmento', 'medio', 'Homenagem aos profissionais de saúde', '["saude", "hospital"]', 'Valorização da enfermagem'),

-- Junho
('Dia dos Namorados', '12/06', 6, 'nacional', 'alto', 'Campanha romântica', '["restaurantes", "varejo", "turismo", "geral"]', 'Celebração do amor'),
('Festa Junina', NULL, 6, 'regional', 'alto', 'Festas e comidas típicas', '["alimentos", "eventos", "turismo"]', 'Tradição nordestina'),
('Dia do Meio Ambiente', '05/06', 6, 'nacional', 'medio', 'Sustentabilidade e ESG', '["sustentabilidade", "educacao"]', 'Conscientização ambiental'),

-- Julho
('Dia do Amigo', '20/07', 7, 'nacional', 'alto', 'Celebração da amizade', '["geral", "varejo"]', 'Valorização das amizades'),
('Férias Escolares', NULL, 7, 'nacional', 'alto', 'Entretenimento infantil', '["turismo", "educacao", "entretenimento"]', 'Período de férias'),

-- Agosto
('Dia dos Pais', NULL, 8, 'nacional', 'alto', 'Presentes e homenagens', '["varejo", "tecnologia", "moda", "geral"]', 'Terceira melhor data comercial'),
('Dia do Estudante', '11/08', 8, 'nacional', 'medio', 'Promoções para estudantes', '["educacao", "tecnologia", "varejo"]', 'Valorização dos estudantes'),
('Dia do Publicitário', '01/08', 8, 'segmento', 'baixo', 'Celebração da publicidade', '["marketing", "publicidade"]', 'Profissionais de comunicação'),

-- Setembro
('Independência do Brasil', '07/09', 9, 'nacional', 'medio', 'Patriotismo e cultura brasileira', '["educacao", "geral"]', 'Feriado nacional'),
('Dia da Amazônia', '05/09', 9, 'regional', 'medio', 'Preservação da floresta', '["sustentabilidade", "turismo"]', 'Conscientização ambiental'),
('Primavera', '23/09', 9, 'nacional', 'medio', 'Renovação e flores', '["beleza", "moda", "decoracao"]', 'Início da primavera'),

-- Outubro
('Dia das Crianças', '12/10', 10, 'nacional', 'alto', 'Brinquedos e entretenimento', '["varejo", "brinquedos", "educacao"]', 'Quarta melhor data comercial'),
('Dia do Professor', '15/10', 10, 'nacional', 'alto', 'Valorização dos educadores', '["educacao", "geral"]', 'Homenagem aos professores'),
('Halloween', '31/10', 10, 'nacional', 'medio', 'Festas e fantasias', '["entretenimento", "varejo"]', 'Tradição internacional'),
('Outubro Rosa', NULL, 10, 'nacional', 'alto', 'Prevenção do câncer de mama', '["saude", "beleza"]', 'Conscientização sobre saúde feminina'),
('Oktoberfest', NULL, 10, 'regional', 'alto', 'Cerveja e cultura alemã', '["eventos", "turismo", "alimentos"]', 'Festa típica do Sul'),

-- Novembro
('Black Friday', NULL, 11, 'nacional', 'alto', 'Maiores descontos do ano', '["varejo", "ecommerce", "geral"]', 'Melhor data comercial do ano'),
('Dia da Consciência Negra', '20/11', 11, 'nacional', 'alto', 'Valorização da cultura afro', '["educacao", "cultura", "geral"]', 'Luta contra o racismo'),
('Novembro Azul', NULL, 11, 'nacional', 'alto', 'Prevenção do câncer de próstata', '["saude"]', 'Conscientização sobre saúde masculina'),
('Cyber Monday', NULL, 11, 'nacional', 'alto', 'Descontos online', '["ecommerce", "tecnologia"]', 'Black Friday online'),

-- Dezembro
('Natal', '25/12', 12, 'nacional', 'alto', 'Presentes e celebração', '["varejo", "alimentos", "turismo", "geral"]', 'Maior celebração do ano'),
('Réveillon', '31/12', 12, 'nacional', 'alto', 'Festas de fim de ano', '["turismo", "eventos", "moda"]', 'Virada do ano'),
('Dia do Arquiteto', '11/12', 12, 'segmento', 'baixo', 'Valorização da arquitetura', '["arquitetura", "decoracao"]', 'Profissionais de arquitetura'),

-- Datas Segmento Saúde
('Dia Mundial da Saúde', '07/04', 4, 'segmento', 'medio', 'Bem-estar e qualidade de vida', '["saude", "nutricao"]', 'OMS - Organização Mundial da Saúde'),
('Dia do Médico', '18/10', 10, 'segmento', 'medio', 'Homenagem aos profissionais', '["saude"]', 'Valorização da medicina'),
('Dia do Dentista', '25/10', 10, 'segmento', 'medio', 'Saúde bucal', '["saude", "odontologia"]', 'Profissionais da odontologia'),

-- Datas Segmento Beleza
('Dia da Beleza', '09/09', 9, 'segmento', 'alto', 'Autocuidado e bem-estar', '["beleza", "estetica"]', 'Valorização da autoestima'),
('Dia do Cabelereiro', '20/06', 6, 'segmento', 'medio', 'Profissionais da beleza', '["beleza", "salao"]', 'Cabeleireiros e barbeiros'),

-- Datas Segmento Tecnologia
('Dia do Programador', '13/09', 9, 'segmento', 'medio', 'Valorização dos devs', '["tecnologia", "ti"]', 'Profissionais de TI'),
('Dia da Internet', '17/05', 5, 'segmento', 'medio', 'Conectividade digital', '["tecnologia", "telecom"]', 'Avanços tecnológicos'),

-- Datas Segmento Alimentação
('Dia da Pizza', '10/07', 7, 'segmento', 'medio', 'Promoções e combos', '["alimentos", "restaurantes"]', 'Comida italiana'),
('Dia do Hambúrguer', '28/05', 5, 'segmento', 'medio', 'Ofertas especiais', '["alimentos", "fast-food"]', 'Fast food'),
('Dia do Sorvete', '23/09', 9, 'segmento', 'medio', 'Sabores especiais', '["alimentos", "sorveteria"]', 'Celebração do sorvete'),

-- Datas Segmento Fitness
('Dia do Atleta', '19/02', 2, 'segmento', 'medio', 'Motivação e treinos', '["fitness", "esportes"]', 'Valorização dos atletas'),
('Dia Mundial da Atividade Física', '06/04', 4, 'segmento', 'medio', 'Vida ativa e saudável', '["fitness", "saude"]', 'Combate ao sedentarismo'),

-- Datas Segmento Moda
('São Paulo Fashion Week', NULL, 10, 'segmento', 'alto', 'Tendências de moda', '["moda", "luxo"]', 'Semana de moda brasileira'),
('Dia do Estilista', '08/07', 7, 'segmento', 'baixo', 'Criatividade fashion', '["moda", "design"]', 'Profissionais da moda'),

-- Datas Segmento Pet
('Dia dos Animais', '04/10', 10, 'segmento', 'alto', 'Amor aos pets', '["petshop", "veterinaria"]', 'Proteção animal'),
('Dia do Veterinário', '09/09', 9, 'segmento', 'medio', 'Profissionais de saúde animal', '["veterinaria", "petshop"]', 'Cuidados com animais'),

-- Datas Segmento Imobiliário
('Dia do Corretor de Imóveis', '27/08', 8, 'segmento', 'baixo', 'Valorização profissional', '["imoveis", "construcao"]', 'Profissionais do setor'),

-- Datas Segmento Automotivo
('Salão do Automóvel', NULL, 11, 'segmento', 'medio', 'Lançamentos e novidades', '["automotivo"]', 'Feira de veículos'),

-- Datas Regionais
('Festival de Parintins', NULL, 6, 'regional', 'alto', 'Cultura amazônica', '["turismo", "cultura"]', 'Festa folclórica do Norte'),
('Lavagem do Bonfim', NULL, 1, 'regional', 'medio', 'Tradição baiana', '["turismo", "cultura"]', 'Festa religiosa da Bahia');

-- Índices para performance
CREATE INDEX idx_datas_tipo ON datas_comemorativas(tipo);
CREATE INDEX idx_datas_mes ON datas_comemorativas(mes_referencia);
CREATE INDEX idx_datas_engajamento ON datas_comemorativas(potencial_engajamento);
CREATE INDEX idx_campanhas_planejamento ON planejamento_campanhas(planejamento_id);
CREATE INDEX idx_campanhas_status ON planejamento_campanhas(status);