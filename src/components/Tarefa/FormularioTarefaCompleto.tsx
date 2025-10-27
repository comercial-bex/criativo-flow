import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, DollarSign, Clock, User, Flag, CheckCircle2 } from 'lucide-react';

interface TarefaFormData {
  titulo: string;
  descricao?: string;
  projeto_id: string;
  executor_id: string;
  status: string;
  prioridade: string;
  data_inicio_prevista?: string;
  data_entrega_prevista?: string;
  horas_estimadas?: number;
  
  // ✅ SPRINT 3: Campos de faturamento
  is_faturavel: boolean;
  valor_faturamento?: number;
  
  // ✅ SPRINT 4: Auto-criar evento
  auto_criar_evento: boolean;
}

interface Props {
  onSubmit: (data: TarefaFormData) => void;
  initialData?: Partial<TarefaFormData>;
  loading?: boolean;
}

/**
 * ✅ SPRINTs 3 e 4: Formulário completo de tarefa
 * - Checkbox "Faturável" (SPRINT 3)
 * - Checkbox "Auto-criar evento no calendário" (SPRINT 4)
 */
export default function FormularioTarefaCompleto({ onSubmit, initialData, loading }: Props) {
  const [formData, setFormData] = useState<TarefaFormData>({
    titulo: initialData?.titulo || '',
    descricao: initialData?.descricao || '',
    projeto_id: initialData?.projeto_id || '',
    executor_id: initialData?.executor_id || '',
    status: initialData?.status || 'pendente',
    prioridade: initialData?.prioridade || 'media',
    data_inicio_prevista: initialData?.data_inicio_prevista || '',
    data_entrega_prevista: initialData?.data_entrega_prevista || '',
    horas_estimadas: initialData?.horas_estimadas || 4,
    is_faturavel: initialData?.is_faturavel ?? true, // ✅ SPRINT 3
    valor_faturamento: initialData?.valor_faturamento || 0,
    auto_criar_evento: initialData?.auto_criar_evento ?? false, // ✅ SPRINT 4
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título da Tarefa</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
              placeholder="Ex: Captação externa para evento X"
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Detalhes da tarefa..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="finalizada">Finalizada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select value={formData.prioridade} onValueChange={(v) => setFormData({ ...formData, prioridade: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Prazos e Estimativas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="data_inicio">Data Início</Label>
            <Input
              id="data_inicio"
              type="datetime-local"
              value={formData.data_inicio_prevista}
              onChange={(e) => setFormData({ ...formData, data_inicio_prevista: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="data_entrega">Data Entrega</Label>
            <Input
              id="data_entrega"
              type="datetime-local"
              value={formData.data_entrega_prevista}
              onChange={(e) => setFormData({ ...formData, data_entrega_prevista: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="horas">Horas Estimadas</Label>
            <Input
              id="horas"
              type="number"
              min="0"
              step="0.5"
              value={formData.horas_estimadas}
              onChange={(e) => setFormData({ ...formData, horas_estimadas: parseFloat(e.target.value) })}
            />
          </div>
        </div>
      </Card>

      {/* ✅ SPRINT 3: Card de Faturamento */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Faturamento
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_faturavel"
              checked={formData.is_faturavel}
              onCheckedChange={(checked) => setFormData({ ...formData, is_faturavel: !!checked })}
            />
            <Label htmlFor="is_faturavel" className="cursor-pointer">
              Tarefa Faturável (desmarque se for cliente mensalista)
            </Label>
          </div>

          {formData.is_faturavel && (
            <div>
              <Label htmlFor="valor_faturamento">Valor a Faturar</Label>
              <Input
                id="valor_faturamento"
                type="number"
                min="0"
                step="0.01"
                value={formData.valor_faturamento}
                onChange={(e) => setFormData({ ...formData, valor_faturamento: parseFloat(e.target.value) })}
                placeholder="R$ 0,00"
              />
            </div>
          )}

          {!formData.is_faturavel && (
            <p className="text-sm text-muted-foreground">
              ℹ️ Custo será lançado automaticamente ao finalizar a tarefa
            </p>
          )}
        </div>
      </Card>

      {/* ✅ SPRINT 4: Card de Calendário */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Integração com Calendário
        </h3>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="auto_criar_evento"
            checked={formData.auto_criar_evento}
            onCheckedChange={(checked) => setFormData({ ...formData, auto_criar_evento: !!checked })}
          />
          <Label htmlFor="auto_criar_evento" className="cursor-pointer">
            Auto-criar evento no calendário (captações, edições, etc.)
          </Label>
        </div>

        {formData.auto_criar_evento && (
          <p className="text-sm text-muted-foreground mt-2">
            ✅ Um evento será criado automaticamente com buffers de preparação e deslocamento
          </p>
        )}
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Tarefa'}
        </Button>
      </div>
    </form>
  );
}
