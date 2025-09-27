import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import introJs from "intro.js";
import "intro.js/introjs.css";

interface GuideStep {
  element: string;
  intro: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuideConfig {
  [key: string]: GuideStep[];
}

export function useInteractiveGuide() {
  const location = useLocation();
  const [isGuideActive, setIsGuideActive] = useState(false);

  const guideConfigs: GuideConfig = {
    '/clientes': [
      {
        element: '[data-intro="clientes-search"]',
        intro: 'Use esta barra de pesquisa para encontrar clientes rapidamente.',
        position: 'bottom'
      },
      {
        element: '[data-intro="clientes-add"]',
        intro: 'Clique aqui para adicionar um novo cliente ao sistema.',
        position: 'left'
      },
      {
        element: '[data-intro="cliente-card"]',
        intro: 'Cada cartão mostra informações básicas do cliente. Clique nos botões para editar ou fazer onboarding.',
        position: 'top'
      }
    ],
    '/grs/dashboard': [
      {
        element: '[data-intro="social-integrations"]',
        intro: 'Aqui você pode conectar suas redes sociais para automatizar publicações.',
        position: 'bottom'
      },
      {
        element: '[data-intro="calendar-widget"]',
        intro: 'Visualize e gerencie seu calendário editorial de forma integrada.',
        position: 'top'
      }
    ],
    '/grs/agendamento-social': [
      {
        element: '[data-intro="social-connect"]',
        intro: 'Primeiro, conecte suas redes sociais clicando neste botão.',
        position: 'bottom'
      },
      {
        element: '[data-intro="schedule-post"]',
        intro: 'Depois de conectar, você pode agendar posts para múltiplas redes simultaneamente.',
        position: 'top'
      }
    ]
  };

  const startGuide = (route?: string) => {
    const currentRoute = route || location.pathname;
    const steps = guideConfigs[currentRoute];
    
    if (!steps) return;

    setIsGuideActive(true);
    
    introJs()
      .setOptions({
        steps: steps.map(step => ({
          element: step.element,
          intro: step.intro,
          position: step.position || 'bottom'
        })),
        showStepNumbers: true,
        showBullets: false,
        showProgress: true,
        nextLabel: 'Próximo',
        prevLabel: 'Anterior',
        doneLabel: 'Concluir',
        skipLabel: 'Pular',
        exitOnOverlayClick: false,
        exitOnEsc: true
      })
      .onexit(() => setIsGuideActive(false))
      .oncomplete(() => setIsGuideActive(false))
      .start();
  };

  const addTooltip = (element: string, message: string) => {
    const el = document.querySelector(element);
    if (el) {
      el.setAttribute('data-intro', message);
      el.setAttribute('data-intro-group', 'tooltip');
    }
  };

  return {
    startGuide,
    addTooltip,
    isGuideActive,
    hasGuideForRoute: (route: string) => !!guideConfigs[route]
  };
}