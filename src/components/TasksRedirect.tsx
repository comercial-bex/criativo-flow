import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { FullScreenLoader } from './FullScreenLoader';

/**
 * Componente de redirecionamento inteligente para /tarefas
 * Redireciona baseado na role do usuário
 */
export function TasksRedirect() {
  const { role, loading } = usePermissions();

  if (loading) {
    return <FullScreenLoader />;
  }

  // Mapear role para rota de tarefas apropriada
  const getTasksRoute = () => {
    switch (role) {
      case 'grs':
        return '/grs/tarefas';
      case 'designer':
        return '/design/minhas-tarefas';
      case 'filmmaker':
        return '/audiovisual/minhas-tarefas';
      case 'admin':
        return '/admin/tarefas';
      case 'gestor':
        return '/gestao/dashboard';
      case 'atendimento':
        return '/minhas-tarefas';
      default:
        return '/minhas-tarefas';
    }
  };

  return <Navigate to={getTasksRoute()} replace />;
}
