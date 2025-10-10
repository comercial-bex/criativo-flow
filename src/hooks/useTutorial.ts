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
  'folha-pagamento': {
    page: 'folha-pagamento',
    steps: [
      {
        intro: '<h3>👋 Bem-vindo à Folha de Pagamento!</h3><p>Vamos fazer um tour rápido pelas principais funcionalidades.</p>',
      },
      {
        element: '[data-tour="competencia"]',
        intro: '<strong>Selecione a Competência</strong><br/>Escolha o mês/ano da folha que deseja processar.',
        position: 'bottom',
      },
      {
        element: '[data-tour="simulador"]',
        intro: '<strong>Simulador de Folha</strong><br/>Simule custos de contratação ANTES de contratar um novo colaborador. Veja o salário líquido e custo total para empresa.',
        position: 'bottom',
      },
      {
        element: '[data-tour="relatorios-fiscais"]',
        intro: '<strong>Relatórios Fiscais</strong><br/>Gere SEFIP, eSocial e DIRF para envio aos órgãos governamentais.',
        position: 'bottom',
      },
      {
        element: '[data-tour="kpis"]',
        intro: '<strong>KPIs da Folha</strong><br/>Acompanhe totais de proventos, descontos, líquido e número de colaboradores em tempo real.',
        position: 'bottom',
      },
      {
        element: '[data-tour="comparativo"]',
        intro: '<strong>Comparativo Mensal</strong><br/>Veja a evolução dos custos em relação ao mês anterior.',
        position: 'left',
      },
      {
        intro: '<h3>✅ Tutorial Concluído!</h3><p>Você já pode começar a gerenciar sua folha de pagamento. Caso precise de ajuda, clique no botão de ajuda (?) no canto superior direito.</p>',
      },
    ],
  },
  'colaboradores': {
    page: 'colaboradores',
    steps: [
      {
        intro: '<h3>👥 Gestão de Colaboradores</h3><p>Aprenda a cadastrar e gerenciar seus colaboradores.</p>',
      },
      {
        element: '[data-tour="novo-colaborador"]',
        intro: '<strong>Cadastrar Novo Colaborador</strong><br/>Clique aqui para adicionar um novo colaborador (CLT, PJ ou Freelancer).',
        position: 'bottom',
      },
      {
        element: '[data-tour="filtros"]',
        intro: '<strong>Filtros</strong><br/>Filtre colaboradores por tipo de contratação, status ou departamento.',
        position: 'bottom',
      },
      {
        element: '[data-tour="tabela"]',
        intro: '<strong>Lista de Colaboradores</strong><br/>Visualize todos os colaboradores cadastrados. Clique em um colaborador para ver detalhes e histórico.',
        position: 'top',
      },
      {
        intro: '<h3>💡 Dica!</h3><p>Ao editar o salário de um colaborador, o sistema cria automaticamente um registro no histórico salarial.</p>',
      },
    ],
  },
  'folha-ponto': {
    page: 'folha-ponto',
    steps: [
      {
        intro: '<h3>⏰ Folha de Ponto</h3><p>Aprove e gerencie registros de ponto dos colaboradores.</p>',
      },
      {
        element: '[data-tour="competencia-ponto"]',
        intro: '<strong>Selecione a Competência</strong><br/>Escolha o mês para visualizar os registros de ponto.',
        position: 'bottom',
      },
      {
        element: '[data-tour="aprovar-todos"]',
        intro: '<strong>Aprovar em Lote</strong><br/>Aprove todos os registros pendentes de uma só vez.',
        position: 'bottom',
      },
      {
        element: '[data-tour="resumo"]',
        intro: '<strong>Resumo</strong><br/>Veja quantos registros estão pendentes de aprovação e quantos já foram aprovados.',
        position: 'left',
      },
      {
        element: '[data-tour="cards-ponto"]',
        intro: '<strong>Cards de Ponto</strong><br/>Cada card mostra as horas do colaborador. Você pode editar variáveis (HE, adicional noturno, faltas) e aprovar individualmente.',
        position: 'top',
      },
      {
        intro: '<h3>⚠️ Importante!</h3><p>O sistema valida automaticamente o limite de horas extras permitido pela CLT (2 horas/dia).</p>',
      },
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
