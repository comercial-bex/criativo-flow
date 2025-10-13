import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BexBadge } from '@/components/ui/bex-badge';
import { 
  Bell, 
  Archive, 
  Share2, 
  Tag,
  BellOff
} from 'lucide-react';
import { smartToast } from '@/lib/smart-toast';
import { supabase } from '@/integrations/supabase/client';

interface TaskActionsSidebarProps {
  tarefaId: string;
  onRefresh?: () => void;
  onOpenLabelsDialog?: () => void;
}

export function TaskActionsSidebar({ 
  tarefaId,
  onRefresh,
  onOpenLabelsDialog
}: TaskActionsSidebarProps) {
  const [seguindo, setSeguindo] = useState(false);
  const [loadingSeguir, setLoadingSeguir] = useState(false);
  const [loadingArquivar, setLoadingArquivar] = useState(false);

  useEffect(() => {
    checkIfSeguindo();
  }, [tarefaId]);

  const checkIfSeguindo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tarefa_seguidores')
        .select('id')
        .eq('tarefa_id', tarefaId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error) {
        setSeguindo(!!data);
      }
    } catch (error) {
      console.error('Erro ao verificar seguimento:', error);
    }
  };

  const handleToggleSeguir = async () => {
    setLoadingSeguir(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        smartToast.error('Você precisa estar autenticado');
        return;
      }
      
      if (seguindo) {
        // Remove seguimento
        const { error } = await supabase
          .from('tarefa_seguidores')
          .delete()
          .eq('tarefa_id', tarefaId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setSeguindo(false);
        smartToast.success('Você parou de seguir esta tarefa');
      } else {
        // Adiciona seguimento
        const { error } = await supabase
          .from('tarefa_seguidores')
          .insert({
            tarefa_id: tarefaId,
            user_id: user.id
          });
        
        if (error) throw error;
        
        setSeguindo(true);
        smartToast.success('Você está seguindo esta tarefa', 'Você receberá notificações sobre atualizações');
      }
    } catch (error: any) {
      console.error('Erro ao alterar seguimento:', error);
      smartToast.error('Erro ao atualizar seguimento', error.message);
    } finally {
      setLoadingSeguir(false);
    }
  };

  const handleArquivar = async () => {
    if (!confirm('Tem certeza que deseja arquivar esta tarefa?')) return;

    setLoadingArquivar(true);
    try {
      const { error } = await supabase
        .from('tarefa')
        .update({ status: 'cancelado' })
        .eq('id', tarefaId);
      
      if (error) throw error;
      
      smartToast.success('Tarefa arquivada');
      onRefresh?.();
    } catch (error: any) {
      console.error('Erro ao arquivar tarefa:', error);
      smartToast.error('Erro ao arquivar tarefa', error.message);
    } finally {
      setLoadingArquivar(false);
    }
  };

  const handleCompartilhar = async () => {
    try {
      const url = `${window.location.origin}/tarefa/${tarefaId}`;
      await navigator.clipboard.writeText(url);
      smartToast.success('Link copiado!', 'O link foi copiado para a área de transferência');
    } catch (error) {
      smartToast.error('Erro ao copiar link');
    }
  };

  return (
    <div className="space-y-4">
      {/* Status de Seguimento */}
      {seguindo && (
        <BexBadge variant="bexGlow" className="w-full justify-center">
          <Bell className="h-3 w-3 mr-1" />
          Você está seguindo
        </BexBadge>
      )}

      {/* Ações Principais */}
      <div className="space-y-2">
        <h4 className="bex-text-muted font-semibold uppercase text-xs tracking-wider">
          Ações
        </h4>
        
        <Button
          variant={seguindo ? "outline" : "default"}
          size="sm"
          onClick={handleToggleSeguir}
          disabled={loadingSeguir}
          className="w-full justify-start"
        >
          {seguindo ? (
            <>
              <BellOff className="h-4 w-4 mr-2" />
              Parar de seguir
            </>
          ) : (
            <>
              <Bell className="h-4 w-4 mr-2" />
              Seguir
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleArquivar}
          disabled={loadingArquivar}
          className="w-full justify-start"
        >
          <Archive className="h-4 w-4 mr-2" />
          Arquivar
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCompartilhar}
          className="w-full justify-start"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </div>

      {/* Adicionar ao Cartão */}
      <div className="space-y-2 pt-4 border-t border-border/50">
        <h4 className="bex-text-muted font-semibold uppercase text-xs tracking-wider">
          Adicionar ao cartão
        </h4>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={onOpenLabelsDialog}
        >
          <Tag className="h-4 w-4 mr-2" />
          Etiquetas
        </Button>
      </div>
    </div>
  );
}
