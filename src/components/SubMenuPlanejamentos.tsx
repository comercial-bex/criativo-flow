import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight, FileText, Plus, BarChart3, Calendar, Building2 } from 'lucide-react';
import { useClientContext } from '@/hooks/useClientContext';
import { supabase } from '@/integrations/supabase/client';

interface Planejamento {
  id: string;
  titulo: string;
  mes_referencia: string;
  status: string;
}

interface SubMenuPlanejamentosProps {
  isActive: boolean;
}

export function SubMenuPlanejamentos({ isActive }: SubMenuPlanejamentosProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [planejamentos, setPlanejamentos] = useState<Planejamento[]>([]);
  const [loading, setLoading] = useState(false);
  const clientContext = useClientContext();

  // Auto-expand when in client context
  useEffect(() => {
    if (clientContext.isInClientContext) {
      setIsExpanded(true);
    }
  }, [clientContext.isInClientContext]);

  // Fetch client's planning when expanded and in context
  useEffect(() => {
    const fetchClientPlanejamentos = async () => {
      if (!isExpanded || !clientContext.clienteId) return;
      
      setLoading(true);
      try {
        const { data } = await supabase
          .from('planejamentos')
          .select('id, titulo, mes_referencia, status')
          .eq('cliente_id', clientContext.clienteId)
          .order('mes_referencia', { ascending: false })
          .limit(5);

        setPlanejamentos(data || []);
      } catch (error) {
        console.error('Error fetching planejamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientPlanejamentos();
  }, [isExpanded, clientContext.clienteId]);

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'text-green-400';
      case 'pendente': return 'text-yellow-400';
      case 'rascunho': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="w-full">
      {/* Main Planejamentos Link */}
      <div className="flex items-center justify-between">
        <NavLink
          to="/grs/planejamentos"
          className={`flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-300 hover-lift flex-1 ${
            isActive
              ? 'bg-sidebar-accent text-bex-green border-l-2 border-bex-green'
              : 'text-sidebar-foreground hover:bg-bex-green/10 hover:text-bex-green'
          }`}
        >
          <Calendar className="mr-3 h-4 w-4" />
          <span>Planejamentos</span>
        </NavLink>
        
        {/* Expand/Collapse Button - only show if in client context */}
        {clientContext.isInClientContext && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-sidebar-foreground hover:text-bex-green transition-colors"
            title={isExpanded ? 'Recolher' : 'Expandir'}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
      </div>

      {/* Submenu - only show when expanded and in client context */}
      {isExpanded && clientContext.isInClientContext && (
        <div className="ml-4 mt-1 space-y-1 animate-fade-in">
          {/* Client Header */}
          <div className="flex items-center px-4 py-2 text-xs text-bex-green bg-bex-green/10 rounded-lg">
            <Building2 className="mr-2 h-3 w-3" />
            <span className="font-medium">{clientContext.clienteName || 'Cliente'}</span>
          </div>

          {/* Quick Actions */}
          <div className="space-y-1">
            <NavLink
              to={`/cliente/${clientContext.clienteId}/projetos`}
              className="flex items-center px-4 py-2 text-xs text-sidebar-foreground hover:text-bex-green hover:bg-bex-green/5 rounded-lg transition-colors"
            >
              <BarChart3 className="mr-2 h-3 w-3" />
              <span>Histórico do Cliente</span>
            </NavLink>
            
            <NavLink
              to={`/grs/planejamentos?cliente=${clientContext.clienteId}&novo=true`}
              className="flex items-center px-4 py-2 text-xs text-sidebar-foreground hover:text-bex-green hover:bg-bex-green/5 rounded-lg transition-colors"
            >
              <Plus className="mr-2 h-3 w-3" />
              <span>Novo Planejamento</span>
            </NavLink>
          </div>

          {/* Client's Planejamentos */}
          {loading ? (
            <div className="px-4 py-2 text-xs text-sidebar-foreground/50">
              Carregando...
            </div>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {planejamentos.map((plan) => (
                <NavLink
                  key={plan.id}
                  to={`/cliente/${clientContext.clienteId}/planejamento-visual/${plan.id}`}
                  className={`flex items-center justify-between px-4 py-2 text-xs rounded-lg transition-colors hover:bg-bex-green/5 hover:text-bex-green ${
                    clientContext.planejamentoId === plan.id 
                      ? 'bg-bex-green/10 text-bex-green' 
                      : 'text-sidebar-foreground'
                  }`}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <FileText className="mr-2 h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{plan.titulo}</span>
                  </div>
                  <div className="flex items-center ml-2 flex-shrink-0">
                    <span className="text-xs text-sidebar-foreground/50 mr-1">
                      {formatMonth(plan.mes_referencia)}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(plan.status)}`} />
                  </div>
                </NavLink>
              ))}
              
              {planejamentos.length === 0 && (
                <div className="px-4 py-2 text-xs text-sidebar-foreground/50">
                  Nenhum planejamento encontrado
                </div>
              )}
            </div>
          )}

          {/* Back to All Link */}
          <NavLink
            to="/grs/planejamentos"
            className="flex items-center px-4 py-2 text-xs text-sidebar-foreground/70 hover:text-bex-green transition-colors border-t border-sidebar-border/50 mt-2 pt-2"
          >
            <span>← Todos os Planejamentos</span>
          </NavLink>
        </div>
      )}
    </div>
  );
}