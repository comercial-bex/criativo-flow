import { useState } from 'react';
import { CatalogoPacotes } from './CatalogoPacotes';
import { BriefingInteligenteModal } from './BriefingInteligenteModal';
import { Pacote, PacoteItem } from '@/hooks/usePacotes';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface NovaOrdemServicoProps {
  clienteId: string;
}

export function NovaOrdemServico({ clienteId }: NovaOrdemServicoProps) {
  const [pacoteSelecionado, setPacoteSelecionado] = useState<Pacote | null>(null);
  const [itensSelecionados, setItensSelecionados] = useState<PacoteItem[]>([]);
  const [briefingModalOpen, setBriefingModalOpen] = useState(false);
  const [gerandoProjeto, setGerandoProjeto] = useState(false);
  const { toast } = useToast();

  const handleSelectPacote = (pacote: Pacote, itens: PacoteItem[]) => {
    setPacoteSelecionado(pacote);
    setItensSelecionados(itens);
    setBriefingModalOpen(true);
  };

  const handleBriefingSuccess = async (briefingId: string) => {
    // 🚀 CORREÇÃO 1: Projeto já é gerado automaticamente no BriefingInteligenteModal
    // Apenas resetar o estado
    setPacoteSelecionado(null);
    setItensSelecionados([]);
  };

  if (gerandoProjeto) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg font-medium">Gerando projeto e tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CatalogoPacotes onSelectPacote={handleSelectPacote} />

      {pacoteSelecionado && (
        <BriefingInteligenteModal
          open={briefingModalOpen}
          onOpenChange={setBriefingModalOpen}
          pacote={pacoteSelecionado}
          itens={itensSelecionados}
          clienteId={clienteId}
          onSuccess={handleBriefingSuccess}
        />
      )}
    </div>
  );
}
