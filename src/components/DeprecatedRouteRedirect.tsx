import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from '@/lib/toast-compat';

/**
 * DeprecatedRouteRedirect - Redireciona rotas legadas para novas rotas
 * 
 * Usado para migração progressiva de:
 * - /rh/colaboradores → /rh/pessoas
 * - /rh/colaboradores/:id → /rh/pessoas/:id
 * 
 * Data de remoção: 2025-02-10
 */

interface RedirectRule {
  from: RegExp;
  to: (params: Record<string, string>) => string;
  message?: string;
  delay?: number;
}

const REDIRECT_RULES: RedirectRule[] = [
  // Colaboradores lista → Pessoas lista
  {
    from: /^\/rh\/colaboradores$/,
    to: () => '/rh/pessoas',
    message: '🔄 Redirecionando para nova Gestão de Pessoas...',
    delay: 800,
  },
  // Colaborador detalhes → Pessoa detalhes
  {
    from: /^\/rh\/colaboradores\/([a-f0-9-]+)$/,
    to: (params) => `/rh/pessoas/${params.id}`,
    message: '🔄 Redirecionando para novo perfil...',
    delay: 800,
  },
];

export function DeprecatedRouteRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    const DEPRECATION_DEADLINE = new Date('2025-02-10');
    const now = new Date();

    // Após deadline, redirecionar imediatamente sem toast
    if (now >= DEPRECATION_DEADLINE) {
      const currentPath = location.pathname;

      for (const rule of REDIRECT_RULES) {
        const match = currentPath.match(rule.from);
        
        if (match) {
          const urlParams: Record<string, string> = { ...params };
          if (match.length > 1) {
            urlParams.id = match[1];
          }

          const targetPath = rule.to(urlParams);
          navigate(targetPath, { replace: true });
          return;
        }
      }
      return;
    }

    // Antes do deadline, mostrar toast informativo
    const currentPath = location.pathname;

    for (const rule of REDIRECT_RULES) {
      const match = currentPath.match(rule.from);
      
      if (match) {
        const urlParams: Record<string, string> = { ...params };
        if (match.length > 1) {
          urlParams.id = match[1];
        }

        const targetPath = rule.to(urlParams);
        
        if (rule.message) {
          toast.info(rule.message, {
            description: 'Interface legada será removida em 10/02/2025',
          });
        }

        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, rule.delay || 0);

        return;
      }
    }
  }, [location.pathname, navigate, params]);

  return null;
}
