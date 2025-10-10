// Importar os estilos do intro.js
import 'intro.js/introjs.css';

// Customização do tema do intro.js para combinar com o design system
const style = document.createElement('style');
style.textContent = `
  /* Intro.js Custom Theme */
  .introjs-tooltip {
    background-color: hsl(var(--background));
    border: 1px solid hsl(var(--border));
    box-shadow: 0 10px 30px -10px hsl(var(--primary) / 0.3);
    border-radius: 0.75rem;
    max-width: 400px;
  }

  .introjs-tooltiptext {
    color: hsl(var(--foreground));
    font-family: var(--font-sans);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .introjs-tooltip h3 {
    color: hsl(var(--primary));
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .introjs-tooltip strong {
    color: hsl(var(--primary));
    font-weight: 600;
  }

  .introjs-button {
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    border: none;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .introjs-button:hover {
    background-color: hsl(var(--primary) / 0.9);
  }

  .introjs-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .introjs-skipbutton {
    color: hsl(var(--muted-foreground));
    background-color: transparent;
    border: 1px solid hsl(var(--border));
  }

  .introjs-skipbutton:hover {
    background-color: hsl(var(--muted));
    color: hsl(var(--foreground));
  }

  .introjs-helperLayer {
    background-color: hsl(var(--background) / 0.8);
    border: 2px solid hsl(var(--primary));
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    border-radius: 0.5rem;
  }

  .introjs-bullets ul li a {
    background-color: hsl(var(--muted));
  }

  .introjs-bullets ul li a.active {
    background-color: hsl(var(--primary));
  }

  .introjs-progress {
    background-color: hsl(var(--muted));
  }

  .introjs-progressbar {
    background-color: hsl(var(--primary));
  }

  .introjs-arrow {
    border-color: hsl(var(--background));
  }

  /* Dark mode adjustments */
  .dark .introjs-helperLayer {
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
  }
`;
document.head.appendChild(style);

export {};
