import { useState, useEffect } from 'react';

interface TutorialStep {
  element?: string;
  intro: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  title?: string;
}

interface TutorialConfig {
  steps: TutorialStep[];
  page: string;
}

const TUTORIALS_CONFIG: Record<string, TutorialConfig> = {
  // RH
  'folha-pagamento': {
    page: 'folha-pagamento',
    steps: [
      { intro: '<h3>👋 Bem-vindo à Folha de Pagamento!</h3><p>Vamos fazer um tour rápido pelas principais funcionalidades.</p>' },
      { element: '[data-tour="competencia"]', intro: '<strong>Selecione a Competência</strong><br/>Escolha o mês/ano da folha que deseja processar.', position: 'bottom' },
      { element: '[data-tour="simulador"]', intro: '<strong>Simulador de Folha</strong><br/>Simule custos de contratação ANTES de contratar um novo colaborador. Veja o salário líquido e custo total para empresa.', position: 'bottom' },
      { element: '[data-tour="relatorios-fiscais"]', intro: '<strong>Relatórios Fiscais</strong><br/>Gere SEFIP, eSocial e DIRF para envio aos órgãos governamentais.', position: 'bottom' },
      { element: '[data-tour="kpis"]', intro: '<strong>KPIs da Folha</strong><br/>Acompanhe totais de proventos, descontos, líquido e número de colaboradores em tempo real.', position: 'bottom' },
      { element: '[data-tour="comparativo"]', intro: '<strong>Comparativo Mensal</strong><br/>Veja a evolução dos custos em relação ao mês anterior.', position: 'left' },
      { intro: '<h3>✅ Tutorial Concluído!</h3><p>Você já pode começar a gerenciar sua folha de pagamento. Caso precise de ajuda, clique no botão de ajuda (?) novamente.</p>' },
    ],
  },
  'colaboradores': {
    page: 'colaboradores',
    steps: [
      { intro: '<h3>👥 Gestão de Colaboradores</h3><p>Aprenda a cadastrar e gerenciar seus colaboradores.</p>' },
      { element: '[data-tour="novo-colaborador"]', intro: '<strong>Cadastrar Novo Colaborador</strong><br/>Clique aqui para adicionar um novo colaborador (CLT, PJ ou Freelancer).', position: 'bottom' },
      { element: '[data-tour="filtros"]', intro: '<strong>Filtros</strong><br/>Filtre colaboradores por tipo de contratação, status ou departamento.', position: 'bottom' },
      { element: '[data-tour="tabela"]', intro: '<strong>Lista de Colaboradores</strong><br/>Visualize todos os colaboradores cadastrados. Clique em um colaborador para ver detalhes e histórico.', position: 'top' },
      { intro: '<h3>💡 Dica!</h3><p>Ao editar o salário de um colaborador, o sistema cria automaticamente um registro no histórico salarial.</p>' },
    ],
  },
  'folha-ponto': {
    page: 'folha-ponto',
    steps: [
      { intro: '<h3>⏰ Folha de Ponto</h3><p>Aprove e gerencie registros de ponto dos colaboradores.</p>' },
      { element: '[data-tour="competencia-ponto"]', intro: '<strong>Selecione a Competência</strong><br/>Escolha o mês para visualizar os registros de ponto.', position: 'bottom' },
      { element: '[data-tour="aprovar-todos"]', intro: '<strong>Aprovar em Lote</strong><br/>Aprove todos os registros pendentes de uma só vez.', position: 'bottom' },
      { element: '[data-tour="resumo"]', intro: '<strong>Resumo</strong><br/>Veja quantos registros estão pendentes de aprovação e quantos já foram aprovados.', position: 'left' },
      { element: '[data-tour="cards-ponto"]', intro: '<strong>Cards de Ponto</strong><br/>Cada card mostra as horas do colaborador. Você pode editar variáveis (HE, adicional noturno, faltas) e aprovar individualmente.', position: 'top' },
      { intro: '<h3>⚠️ Importante!</h3><p>O sistema valida automaticamente o limite de horas extras permitido pela CLT (2 horas/dia).</p>' },
    ],
  },
  
  // ADMINISTRATIVO
  'administrativo-dashboard': {
    page: 'administrativo-dashboard',
    steps: [
      { intro: '<h3>📊 Dashboard Administrativo</h3><p>Gerencie orçamentos, propostas e contratos em um só lugar.</p>' },
      { element: '[data-tour="orcamentos-card"]', intro: '<strong>Orçamentos</strong><br/>Visualize e crie orçamentos para clientes.', position: 'bottom' },
      { element: '[data-tour="propostas-card"]', intro: '<strong>Propostas Comerciais</strong><br/>Gerencie suas propostas e acompanhe aprovações.', position: 'bottom' },
      { element: '[data-tour="contratos-card"]', intro: '<strong>Contratos</strong><br/>Controle de contratos ativos e inativos.', position: 'bottom' },
      { intro: '<h3>✅ Pronto!</h3><p>Explore as funcionalidades administrativas.</p>' },
    ],
  },
  'orcamentos': {
    page: 'orcamentos',
    steps: [
      { intro: '<h3>💼 Gestão de Orçamentos</h3><p>Crie e gerencie orçamentos para seus clientes.</p>' },
      { element: '[data-tour="novo-orcamento"]', intro: '<strong>Novo Orçamento</strong><br/>Clique aqui para criar um novo orçamento.', position: 'bottom' },
      { element: '[data-tour="filtros"]', intro: '<strong>Filtros</strong><br/>Filtre orçamentos por status, cliente ou período.', position: 'bottom' },
      { element: '[data-tour="tabela"]', intro: '<strong>Lista de Orçamentos</strong><br/>Visualize todos os orçamentos. Clique para ver detalhes.', position: 'top' },
      { element: '[data-tour="acoes"]', intro: '<strong>Ações</strong><br/>Edite, converta em proposta ou delete orçamentos.', position: 'left' },
      { intro: '<h3>💡 Dica!</h3><p>Orçamentos aprovados podem ser convertidos em propostas automaticamente.</p>' },
    ],
  },
  'propostas': {
    page: 'propostas',
    steps: [
      { intro: '<h3>📄 Propostas Comerciais</h3><p>Gerencie propostas e acompanhe assinaturas.</p>' },
      { element: '[data-tour="nova-proposta"]', intro: '<strong>Nova Proposta</strong><br/>Crie uma proposta comercial a partir de um orçamento.', position: 'bottom' },
      { element: '[data-tour="status-filter"]', intro: '<strong>Filtrar por Status</strong><br/>Veja propostas pendentes, assinadas ou rejeitadas.', position: 'bottom' },
      { element: '[data-tour="compartilhar"]', intro: '<strong>Compartilhar</strong><br/>Envie propostas para clientes via link ou e-mail.', position: 'left' },
      { element: '[data-tour="assinatura"]', intro: '<strong>Assinatura Digital</strong><br/>Acompanhe o status de assinaturas eletrônicas.', position: 'left' },
      { intro: '<h3>✅ Pronto!</h3><p>Gerencie suas propostas comerciais com eficiência.</p>' },
    ],
  },
  'contratos': {
    page: 'contratos',
    steps: [
      { intro: '<h3>📋 Gestão de Contratos</h3><p>Controle contratos ativos e vencimentos.</p>' },
      { element: '[data-tour="novo-contrato"]', intro: '<strong>Novo Contrato</strong><br/>Cadastre contratos baseados em templates.', position: 'bottom' },
      { element: '[data-tour="filtros"]', intro: '<strong>Filtros</strong><br/>Filtre por status (ativo, vencido, cancelado).', position: 'bottom' },
      { element: '[data-tour="alertas"]', intro: '<strong>Alertas de Vencimento</strong><br/>Veja contratos próximos ao vencimento.', position: 'right' },
      { intro: '<h3>⚠️ Importante!</h3><p>Configure alertas para não perder renovações de contratos.</p>' },
    ],
  },
  'produtos': {
    page: 'produtos',
    steps: [
      { intro: '<h3>🛍️ Catálogo de Produtos</h3><p>Gerencie produtos e serviços para orçamentos.</p>' },
      { element: '[data-tour="novo-produto"]', intro: '<strong>Novo Produto/Serviço</strong><br/>Cadastre itens para usar em orçamentos.', position: 'bottom' },
      { element: '[data-tour="categorias"]', intro: '<strong>Categorias</strong><br/>Organize produtos por categoria.', position: 'bottom' },
      { element: '[data-tour="precos"]', intro: '<strong>Gestão de Preços</strong><br/>Atualize preços e margens de lucro.', position: 'left' },
      { intro: '<h3>💡 Dica!</h3><p>Mantenha seu catálogo atualizado para agilizar criação de orçamentos.</p>' },
    ],
  },
  
  // FINANCEIRO
  'financeiro-transacoes': {
    page: 'financeiro-transacoes',
    steps: [
      { intro: '<h3>💰 Gestão Financeira</h3><p>Controle contas a pagar e receber.</p>' },
      { element: '[data-tour="nova-transacao"]', intro: '<strong>Nova Transação</strong><br/>Cadastre contas a pagar ou receber.', position: 'bottom' },
      { element: '[data-tour="filtros"]', intro: '<strong>Filtros</strong><br/>Filtre por tipo (pagar/receber), status e período.', position: 'bottom' },
      { element: '[data-tour="kpis"]', intro: '<strong>Indicadores</strong><br/>Acompanhe receitas, despesas e saldo em tempo real.', position: 'bottom' },
      { element: '[data-tour="tabela"]', intro: '<strong>Lista de Transações</strong><br/>Visualize e edite suas transações financeiras.', position: 'top' },
      { intro: '<h3>💡 Dica!</h3><p>Use categorias para organizar suas finanças e gerar relatórios precisos.</p>' },
    ],
  },
  'financeiro-dashboard': {
    page: 'financeiro-dashboard',
    steps: [
      { intro: '<h3>📊 Dashboard Financeiro</h3><p>Visualize a saúde financeira da empresa.</p>' },
      { element: '[data-tour="kpis"]', intro: '<strong>KPIs Principais</strong><br/>Receitas, despesas, lucro e margem.', position: 'bottom' },
      { element: '[data-tour="grafico-evolucao"]', intro: '<strong>Evolução Mensal</strong><br/>Acompanhe tendências de receitas e despesas.', position: 'bottom' },
      { element: '[data-tour="composicao"]', intro: '<strong>Composição</strong><br/>Veja distribuição de receitas e despesas por categoria.', position: 'left' },
      { element: '[data-tour="filtro-periodo"]', intro: '<strong>Filtrar Período</strong><br/>Analise dados de diferentes períodos.', position: 'right' },
      { intro: '<h3>✅ Pronto!</h3><p>Use esses dados para tomar decisões estratégicas.</p>' },
    ],
  },
  'categorias-financeiras': {
    page: 'categorias-financeiras',
    steps: [
      { intro: '<h3>🏷️ Categorias Financeiras</h3><p>Organize suas receitas e despesas.</p>' },
      { element: '[data-tour="nova-categoria"]', intro: '<strong>Nova Categoria</strong><br/>Crie categorias personalizadas.', position: 'bottom' },
      { element: '[data-tour="tipo"]', intro: '<strong>Tipo</strong><br/>Defina se é receita ou despesa.', position: 'bottom' },
      { intro: '<h3>💡 Dica!</h3><p>Categorias bem organizadas facilitam relatórios e análises.</p>' },
    ],
  },
  
  // GRS
  'grs-planejamentos': {
    page: 'grs-planejamentos',
    steps: [
      { intro: '<h3>📋 Planejamentos Estratégicos</h3><p>Crie e gerencie planos de marketing e redes sociais.</p>' },
      { element: '[data-tour="novo-planejamento"]', intro: '<strong>Novo Planejamento</strong><br/>Crie um plano estratégico para seu cliente.', position: 'bottom' },
      { element: '[data-tour="filtro-cliente"]', intro: '<strong>Filtrar por Cliente</strong><br/>Visualize planejamentos de um cliente específico.', position: 'bottom' },
      { element: '[data-tour="cards-planejamento"]', intro: '<strong>Cards de Planejamento</strong><br/>Cada card mostra o status e progresso do plano.', position: 'top' },
      { intro: '<h3>🎯 Importante!</h3><p>Um bom planejamento estratégico aumenta a eficiência da sua equipe.</p>' },
    ],
  },
  'grs-calendario-editorial': {
    page: 'grs-calendario-editorial',
    steps: [
      { intro: '<h3>📅 Calendário Editorial</h3><p>Planeje e organize posts para redes sociais.</p>' },
      { element: '[data-tour="novo-post"]', intro: '<strong>Novo Post</strong><br/>Crie e agende posts para múltiplas redes sociais.', position: 'bottom' },
      { element: '[data-tour="visualizacao"]', intro: '<strong>Visualizações</strong><br/>Alterne entre calendário, lista e kanban.', position: 'bottom' },
      { element: '[data-tour="filtros"]', intro: '<strong>Filtros</strong><br/>Filtre por rede social, cliente ou status.', position: 'bottom' },
      { element: '[data-tour="arrastar"]', intro: '<strong>Arrastar e Soltar</strong><br/>Reorganize posts facilmente no calendário.', position: 'top' },
      { intro: '<h3>✅ Pronto!</h3><p>Mantenha seu calendário sempre organizado e atualizado.</p>' },
    ],
  },
  'grs-minhas-tarefas': {
    page: 'grs-minhas-tarefas',
    steps: [
      { intro: '<h3>✅ Minhas Tarefas GRS</h3><p>Gerencie suas atividades de gestão de redes sociais.</p>' },
      { element: '[data-tour="filtros"]', intro: '<strong>Filtros</strong><br/>Filtre por status, prioridade ou prazo.', position: 'bottom' },
      { element: '[data-tour="kanban"]', intro: '<strong>Visualização Kanban</strong><br/>Arraste tarefas entre colunas para atualizar status.', position: 'top' },
      { element: '[data-tour="prazo"]', intro: '<strong>Alertas de Prazo</strong><br/>Tarefas vencidas aparecem destacadas.', position: 'left' },
      { intro: '<h3>💡 Dica!</h3><p>Mantenha suas tarefas atualizadas para melhor colaboração em equipe.</p>' },
    ],
  },
  'grs-aprovacoes': {
    page: 'grs-aprovacoes',
    steps: [
      { intro: '<h3>✓ Aprovações GRS</h3><p>Gerencie aprovações de conteúdo pelos clientes.</p>' },
      { element: '[data-tour="pendentes"]', intro: '<strong>Pendentes</strong><br/>Posts aguardando aprovação do cliente.', position: 'bottom' },
      { element: '[data-tour="visualizar"]', intro: '<strong>Visualizar</strong><br/>Veja prévia do post antes de enviar.', position: 'left' },
      { intro: '<h3>⚠️ Importante!</h3><p>Sempre envie conteúdo para aprovação antes de publicar.</p>' },
    ],
  },
  
  // AUDIOVISUAL
  'audiovisual-dashboard': {
    page: 'audiovisual-dashboard',
    steps: [
      { intro: '<h3>🎬 Dashboard Audiovisual</h3><p>Gerencie projetos de vídeo, fotografia e captações.</p>' },
      { element: '[data-tour="projetos-card"]', intro: '<strong>Projetos</strong><br/>Visualize projetos audiovisuais em andamento.', position: 'bottom' },
      { element: '[data-tour="equipamentos-card"]', intro: '<strong>Equipamentos</strong><br/>Controle de câmeras, lentes e acessórios.', position: 'bottom' },
      { element: '[data-tour="captacoes-card"]', intro: '<strong>Captações Agendadas</strong><br/>Calendário de filmagens e sessões fotográficas.', position: 'bottom' },
      { intro: '<h3>✅ Pronto!</h3><p>Gerencie seus projetos audiovisuais com eficiência.</p>' },
    ],
  },
  'audiovisual-projetos': {
    page: 'audiovisual-projetos',
    steps: [
      { intro: '<h3>🎥 Projetos Audiovisuais</h3><p>Gerencie vídeos, fotos e edições.</p>' },
      { element: '[data-tour="novo-projeto"]', intro: '<strong>Novo Projeto</strong><br/>Crie projetos de vídeo ou fotografia.', position: 'bottom' },
      { element: '[data-tour="timeline"]', intro: '<strong>Timeline</strong><br/>Acompanhe etapas: pré-produção, captação, edição, entrega.', position: 'bottom' },
      { element: '[data-tour="arquivos"]', intro: '<strong>Arquivos</strong><br/>Upload de raws, proxies e finalizados.', position: 'left' },
      { intro: '<h3>💡 Dica!</h3><p>Organize arquivos por pastas para facilitar a edição.</p>' },
    ],
  },
  'audiovisual-equipamentos': {
    page: 'audiovisual-equipamentos',
    steps: [
      { intro: '<h3>📷 Gestão de Equipamentos</h3><p>Controle inventário de câmeras, lentes e acessórios.</p>' },
      { element: '[data-tour="novo-equipamento"]', intro: '<strong>Novo Equipamento</strong><br/>Cadastre equipamentos com número de série.', position: 'bottom' },
      { element: '[data-tour="disponibilidade"]', intro: '<strong>Disponibilidade</strong><br/>Veja quais equipamentos estão livres ou em uso.', position: 'bottom' },
      { element: '[data-tour="manutencao"]', intro: '<strong>Manutenção</strong><br/>Registre manutenções e calibrações.', position: 'left' },
      { intro: '<h3>⚠️ Importante!</h3><p>Mantenha registros de manutenção atualizados.</p>' },
    ],
  },
  
  // DESIGN
  'design-dashboard': {
    page: 'design-dashboard',
    steps: [
      { intro: '<h3>🎨 Dashboard Design</h3><p>Gerencie projetos de design e aprovações.</p>' },
      { element: '[data-tour="projetos-ativos"]', intro: '<strong>Projetos Ativos</strong><br/>Designs em andamento.', position: 'bottom' },
      { element: '[data-tour="aprovacoes"]', intro: '<strong>Pendentes de Aprovação</strong><br/>Designs aguardando feedback do cliente.', position: 'bottom' },
      { element: '[data-tour="biblioteca"]', intro: '<strong>Biblioteca</strong><br/>Acesse templates e assets.', position: 'bottom' },
      { intro: '<h3>✅ Pronto!</h3><p>Explore as ferramentas de design.</p>' },
    ],
  },
  'design-biblioteca': {
    page: 'design-biblioteca',
    steps: [
      { intro: '<h3>📚 Biblioteca de Assets</h3><p>Organize templates, fontes e recursos.</p>' },
      { element: '[data-tour="categorias"]', intro: '<strong>Categorias</strong><br/>Templates, Fontes, Ícones, Fotos.', position: 'bottom' },
      { element: '[data-tour="upload"]', intro: '<strong>Upload</strong><br/>Adicione novos assets à biblioteca.', position: 'bottom' },
      { element: '[data-tour="busca"]', intro: '<strong>Busca</strong><br/>Encontre assets rapidamente por tags.', position: 'right' },
      { intro: '<h3>💡 Dica!</h3><p>Use tags para facilitar a busca de assets.</p>' },
    ],
  },
  
  // CLIENTE
  'cliente-painel': {
    page: 'cliente-painel',
    steps: [
      { intro: '<h3>👤 Painel do Cliente</h3><p>Bem-vindo à sua área exclusiva!</p>' },
      { element: '[data-tour="projetos"]', intro: '<strong>Meus Projetos</strong><br/>Acompanhe projetos em andamento.', position: 'bottom' },
      { element: '[data-tour="aprovacoes"]', intro: '<strong>Aprovações Pendentes</strong><br/>Conteúdos aguardando sua aprovação.', position: 'bottom' },
      { element: '[data-tour="timeline"]', intro: '<strong>Timeline</strong><br/>Histórico de atividades do seu projeto.', position: 'bottom' },
      { intro: '<h3>✅ Pronto!</h3><p>Explore sua área de cliente.</p>' },
    ],
  },
  'cliente-aprovacoes': {
    page: 'cliente-aprovacoes',
    steps: [
      { intro: '<h3>✓ Minhas Aprovações</h3><p>Aprove ou solicite alterações em conteúdos.</p>' },
      { element: '[data-tour="pendentes"]', intro: '<strong>Pendentes</strong><br/>Conteúdos aguardando sua análise.', position: 'bottom' },
      { element: '[data-tour="visualizar"]', intro: '<strong>Visualizar</strong><br/>Veja prévia antes de aprovar.', position: 'left' },
      { element: '[data-tour="comentar"]', intro: '<strong>Comentários</strong><br/>Solicite ajustes se necessário.', position: 'left' },
      { intro: '<h3>💡 Dica!</h3><p>Aprove rapidamente para não atrasar o cronograma.</p>' },
    ],
  },
  
  // GERAL
  'dashboard': {
    page: 'dashboard',
    steps: [
      { intro: '<h3>🏠 Dashboard Principal</h3><p>Visão geral do sistema.</p>' },
      { element: '[data-tour="metricas"]', intro: '<strong>Métricas Principais</strong><br/>KPIs mais importantes.', position: 'bottom' },
      { element: '[data-tour="atividades"]', intro: '<strong>Atividades Recentes</strong><br/>Últimas ações no sistema.', position: 'bottom' },
      { element: '[data-tour="calendario"]', intro: '<strong>Calendário</strong><br/>Eventos e prazos próximos.', position: 'left' },
      { intro: '<h3>✅ Pronto!</h3><p>Explore os módulos do sistema.</p>' },
    ],
  },
  'crm': {
    page: 'crm',
    steps: [
      { intro: '<h3>🎯 CRM - Funil de Vendas</h3><p>Gerencie leads e oportunidades.</p>' },
      { element: '[data-tour="novo-lead"]', intro: '<strong>Novo Lead</strong><br/>Adicione potenciais clientes.', position: 'bottom' },
      { element: '[data-tour="funil"]', intro: '<strong>Funil Kanban</strong><br/>Arraste cards entre as etapas de venda.', position: 'top' },
      { element: '[data-tour="filtros"]', intro: '<strong>Filtros</strong><br/>Filtre por origem, responsável ou status.', position: 'bottom' },
      { element: '[data-tour="metricas"]', intro: '<strong>Métricas de Conversão</strong><br/>Taxa de conversão por etapa.', position: 'right' },
      { intro: '<h3>💡 Dica!</h3><p>Atualize o funil diariamente para melhor previsão de vendas.</p>' },
    ],
  },
  'calendario': {
    page: 'calendario',
    steps: [
      { intro: '<h3>📅 Calendário Unificado</h3><p>Todos os eventos em um só lugar.</p>' },
      { element: '[data-tour="novo-evento"]', intro: '<strong>Novo Evento</strong><br/>Crie eventos, reuniões ou captações.', position: 'bottom' },
      { element: '[data-tour="visualizacao"]', intro: '<strong>Visualizações</strong><br/>Alterne entre dia, semana, mês.', position: 'bottom' },
      { element: '[data-tour="filtro-tipo"]', intro: '<strong>Filtrar por Tipo</strong><br/>Veja apenas eventos de um tipo específico.', position: 'right' },
      { intro: '<h3>✅ Pronto!</h3><p>Mantenha sua agenda organizada.</p>' },
    ],
  },
  'inventario': {
    page: 'inventario',
    steps: [
      { intro: '<h3>📦 Inventário</h3><p>Gerencie equipamentos e ativos da empresa.</p>' },
      { element: '[data-tour="novo-item"]', intro: '<strong>Novo Item</strong><br/>Cadastre equipamentos, móveis ou ativos.', position: 'bottom' },
      { element: '[data-tour="categorias"]', intro: '<strong>Categorias</strong><br/>Organize por tipo (audiovisual, informática, etc).', position: 'bottom' },
      { element: '[data-tour="status"]', intro: '<strong>Status</strong><br/>Disponível, Em Uso, Manutenção.', position: 'left' },
      { intro: '<h3>💡 Dica!</h3><p>Mantenha dados de garantia e manutenção atualizados.</p>' },
    ],
  },
  'gamificacao': {
    page: 'gamificacao',
    steps: [
      { intro: '<h3>🏆 Gamificação</h3><p>Acompanhe conquistas e rankings.</p>' },
      { element: '[data-tour="ranking"]', intro: '<strong>Ranking</strong><br/>Veja sua posição e dos colegas.', position: 'bottom' },
      { element: '[data-tour="badges"]', intro: '<strong>Badges</strong><br/>Conquistas desbloqueadas.', position: 'bottom' },
      { intro: '<h3>🎯 Desafio!</h3><p>Complete tarefas para ganhar pontos e badges.</p>' },
    ],
  },
  
  'grs-painel': {
    page: 'grs-painel',
    steps: [
      { intro: '<h3>🎯 Bem-vindo ao Painel GRS!</h3><p>Gerencie projetos, tarefas e acompanhe sua produtividade pessoal.</p>' },
      { element: '[data-tour="metricas"]', intro: '<strong>Métricas Rápidas</strong><br/>Acompanhe projetos ativos e tarefas distribuídas por status (Novo, Em Andamento, Concluído).', position: 'bottom' },
      { element: '[data-tour="produtividade"]', intro: '<strong>Produtividade Pessoal</strong><br/>Expanda esta seção para acessar:<br/>• Radar de Metas SMART<br/>• Timer Pomodoro<br/>• Reflexões Diárias<br/>• Insights de IA<br/>• Matriz Eisenhower', position: 'bottom' },
      { element: '[data-tour="projetos"]', intro: '<strong>Tabela de Projetos</strong><br/>Veja seus projetos ativos com cliente, prazo, status e progresso. Clique em uma linha para ver detalhes e tarefas.', position: 'top' },
      { element: '[data-tour="timeline"]', intro: '<strong>Timeline de Atividades</strong><br/>Acompanhe eventos recentes e atividades dos seus projetos em ordem cronológica.', position: 'top' },
      { intro: '<h3>✅ Tutorial Concluído!</h3><p>Explore o painel livremente. Clique no botão (?) no header para rever o tour a qualquer momento.</p>' },
    ],
  },
};

export function useTutorial(pageName: string) {
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Verificar se já viu o tutorial desta página
    const seen = localStorage.getItem(`tutorial-seen-${pageName}`);
    if (!seen) {
      setHasSeenTutorial(false);
      // Auto-iniciar após 1 segundo
      setTimeout(() => {
        startTutorial();
      }, 1000);
    }
  }, [pageName]);

  const startTutorial = () => {
    const config = TUTORIALS_CONFIG[pageName];
    if (!config) return;

    // Importar e iniciar intro.js
    import('intro.js').then((module) => {
      const introJs = module.default;
      
      const intro = introJs();
      intro.setOptions({
        steps: config.steps,
        showProgress: true,
        showBullets: true,
        exitOnOverlayClick: false,
        exitOnEsc: true,
        nextLabel: 'Próximo →',
        prevLabel: '← Anterior',
        skipLabel: 'Pular',
        doneLabel: 'Concluir ✓',
        buttonClass: 'bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md',
      });

      intro.oncomplete(() => {
        markTutorialAsSeen(pageName);
        setIsActive(false);
      });

      intro.onexit(() => {
        markTutorialAsSeen(pageName);
        setIsActive(false);
      });

      intro.start();
      setIsActive(true);
    });
  };

  const markTutorialAsSeen = (page: string) => {
    localStorage.setItem(`tutorial-seen-${page}`, 'true');
    setHasSeenTutorial(true);
  };

  const resetTutorial = () => {
    localStorage.removeItem(`tutorial-seen-${pageName}`);
    setHasSeenTutorial(false);
  };

  return {
    startTutorial,
    resetTutorial,
    hasSeenTutorial,
    isActive,
  };
}
