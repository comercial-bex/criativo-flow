import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlanejamentoEditorialWizard } from '@/components/PlanejamentoEditorialWizard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function PlanejamentoEditorialWizardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [planejamento, setPlanejamento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPlanejamento();
    }
  }, [id]);

  const fetchPlanejamento = async () => {
    try {
      const { data, error } = await supabase
        .from('planejamentos')
        .select('*, clientes(id, nome)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPlanejamento(data);
    } catch (error) {
      console.error('Erro ao carregar planejamento:', error);
      toast.error('Erro ao carregar planejamento');
      navigate('/grs/planejamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    toast.success('Planejamento BEX concluído com sucesso!');
    navigate(`/grs/planejamento/${id}?tab=plano-editorial`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Carregando...</div>
      </div>
    );
  }

  if (!planejamento) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/grs/planejamento/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Planejamento Editorial BEX</h1>
          <p className="text-muted-foreground">
            {planejamento.clientes?.nome} - {planejamento.titulo}
          </p>
        </div>
        <Button onClick={() => setWizardOpen(true)} size="lg">
          Iniciar Wizard BEX
        </Button>
      </div>

      <PlanejamentoEditorialWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        clienteId={planejamento.cliente_id}
        planejamentoId={id!}
        onComplete={handleComplete}
      />
    </div>
  );
}
