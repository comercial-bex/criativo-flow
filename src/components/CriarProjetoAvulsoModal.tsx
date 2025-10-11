import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Zap, Megaphone, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useProjetos } from '@/hooks/useProjetos';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CriarProjetoAvulsoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId?: string;
  tipo?: 'avulso' | 'campanha';
  onSuccess?: (projeto: any) => void;
}

export function CriarProjetoAvulsoModal({ 
  open, 
  onOpenChange, 
  clienteId,
  tipo = 'avulso',
  onSuccess 
}: CriarProjetoAvulsoModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { createProjeto } = useProjetos();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [especialistas, setEspecialistas] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo_projeto: tipo,
    cliente_id: clienteId || '',
    data_prazo: undefined as Date | undefined,
    orcamento_estimado: '',
    responsavel_grs_id: '',
    prioridade: 'media' as 'baixa' | 'media' | 'alta',
    status: 'em_andamento'
  });

  useEffect(() => {
    if (open) {
      fetchClientes();
      fetchEspecialistas();
    }
  }, [open]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      tipo_projeto: tipo,
      cliente_id: clienteId || prev.cliente_id
    }));
  }, [tipo, clienteId]);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const fetchEspecialistas = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome')
        .eq('especialidade', 'grs')
        .eq('status', 'aprovado')
        .order('nome');

      if (error) throw error;
      setEspecialistas(data || []);
    } catch (error) {
      console.error('Erro ao buscar especialistas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O título do projeto é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.cliente_id) {
      toast({
        title: "Campo obrigatório",
        description: "Selecione um cliente",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const projetoData = {
        titulo: formData.titulo,
        descricao: formData.descricao || null,
        tipo_projeto: formData.tipo_projeto,
        cliente_id: formData.cliente_id,
        data_prazo: formData.data_prazo ? formData.data_prazo.toISOString() : null,
        orcamento_estimado: formData.orcamento_estimado ? parseFloat(formData.orcamento_estimado) : null,
        responsavel_grs_id: formData.responsavel_grs_id || user?.id || null,
        prioridade: formData.prioridade,
        status: formData.status,
        created_by: user?.id,
        progresso: 0
      };

      const novoProjeto = await createProjeto(projetoData);

      if (novoProjeto) {
        toast({
          title: "✅ Projeto criado!",
          description: formData.tipo_projeto === 'avulso' 
            ? "Job avulso criado com sucesso" 
            : "Campanha criada com sucesso"
        });
        
        onSuccess?.(novoProjeto);
        onOpenChange(false);
        resetForm();
      }
    } catch (error: any) {
      console.error('Erro ao criar projeto:', error);
      toast({
        title: "Erro ao criar projeto",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      tipo_projeto: tipo,
      cliente_id: clienteId || '',
      data_prazo: undefined,
      orcamento_estimado: '',
      responsavel_grs_id: '',
      prioridade: 'media',
      status: 'em_andamento'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {formData.tipo_projeto === 'avulso' ? (
              <Zap className="w-5 h-5 text-green-500" />
            ) : (
              <Megaphone className="w-5 h-5 text-purple-500" />
            )}
            <DialogTitle>
              {formData.tipo_projeto === 'avulso' ? 'Novo Projeto Avulso' : 'Nova Campanha Publicitária'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {formData.tipo_projeto === 'avulso' 
              ? 'Crie um projeto para jobs pontuais e produtos rápidos (ex: cartão de visita, folder, banner)'
              : 'Crie uma campanha publicitária com múltiplas peças (ex: Black Friday, lançamento de produto)'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Projeto */}
          <div className="space-y-2">
            <Label>Tipo de Projeto</Label>
            <RadioGroup 
              value={formData.tipo_projeto} 
              onValueChange={(value: 'avulso' | 'campanha') => 
                setFormData({ ...formData, tipo_projeto: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="avulso" id="avulso" />
                <Label htmlFor="avulso" className="flex items-center gap-2 cursor-pointer">
                  <Zap className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="font-medium">Avulso</div>
                    <div className="text-xs text-muted-foreground">Job pontual, produto rápido</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="campanha" id="campanha" />
                <Label htmlFor="campanha" className="flex items-center gap-2 cursor-pointer">
                  <Megaphone className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="font-medium">Campanha</div>
                    <div className="text-xs text-muted-foreground">Ação publicitária com múltiplas peças</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">
              Título do Projeto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="titulo"
              placeholder={formData.tipo_projeto === 'avulso' 
                ? "Ex: Cartão de Visita - João Silva" 
                : "Ex: Campanha Black Friday 2024"}
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="cliente">
              Cliente <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.cliente_id} onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map(cliente => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder={formData.tipo_projeto === 'avulso'
                ? "Descreva brevemente o que precisa ser feito..."
                : "Descreva os objetivos e entregáveis da campanha..."}
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Prazo */}
            <div className="space-y-2">
              <Label>Prazo de Entrega</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data_prazo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_prazo ? format(formData.data_prazo, 'PPP', { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.data_prazo}
                    onSelect={(date) => setFormData({ ...formData, data_prazo: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Orçamento */}
            <div className="space-y-2">
              <Label htmlFor="orcamento">Orçamento Estimado (R$)</Label>
              <Input
                id="orcamento"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.orcamento_estimado}
                onChange={(e) => setFormData({ ...formData, orcamento_estimado: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Responsável GRS */}
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável GRS</Label>
              <Select value={formData.responsavel_grs_id} onValueChange={(value) => setFormData({ ...formData, responsavel_grs_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {especialistas.map(esp => (
                    <SelectItem key={esp.id} value={esp.id}>
                      {esp.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select value={formData.prioridade} onValueChange={(value: any) => setFormData({ ...formData, prioridade: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar {formData.tipo_projeto === 'avulso' ? 'Projeto' : 'Campanha'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
