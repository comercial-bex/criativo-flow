/**
 * Mapeamento centralizado: Role → Dashboard Path
 * Define o caminho correto para cada especialidade
 */
export const ROLE_DASHBOARDS: Record<string, string> = {
  'grs': '/grs/painel',
  'designer': '/design/dashboard',
  'filmmaker': '/audiovisual/dashboard',
  'gestor': '/gestao/dashboard',
  'trafego': '/trafego/dashboard',
  'admin': '/admin/painel',
  'cliente': '/cliente/painel',
  'atendimento': '/dashboard',
  'financeiro': '/financeiro/dashboard',
};

/**
 * Retorna o dashboard correto para uma role específica
 * @param role - Role do usuário (grs, designer, filmmaker, etc.)
 * @returns Path do dashboard correspondente
 */
export function getDashboardForRole(role: string | null): string {
  if (!role) return '/dashboard';
  return ROLE_DASHBOARDS[role] || '/dashboard';
}
