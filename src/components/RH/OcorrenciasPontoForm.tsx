import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useOcorrenciasPonto } from '@/hooks/useOcorrenciasPonto';
import { usePessoas } from '@/hooks/usePessoas';

interface OcorrenciasPontoFormProps {
  pessoaId?: string;
  competencia?: string;
}

export function OcorrenciasPontoForm({ pessoaId, competencia }: OcorrenciasPontoFormProps) {
  const { pessoas } = usePessoas('colaborador');
  const { criar, isCriando } = useOcorrenciasPonto();

  const [formData, setFormData] = useState({
    pessoa_id: pessoaId || '',
    data: '',
    tipo: 'extra' as 'extra' | 'folga' | 'falta',
    horas: 0,
    observacao: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pessoa_id || !formData.data) {
      return;
    }

    criar(formData);
    setFormData({
      pessoa_id: pessoaId || '',
      data: '',
      tipo: 'extra',
      horas: 0,
      observacao: '',
    });
  };

  const pessoaSelecionada = pessoas.find((p) => p.id === formData.pessoa_id);
  const valorHora = pessoaSelecionada
    ? (pessoaSelecionada.salario_base || pessoaSelecionada.fee_mensal || 0) / 220
    : 0;
  const valorEstimado = valorHora * formData.horas * (formData.tipo === 'extra' ? 1.5 : 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Ocorrência de Ponto</CardTitle>
        <CardDescription>Registre horas extras, folgas ou faltas</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!pessoaId && (
            <div>
              <Label htmlFor="pessoa">Pessoa *</Label>
              <Select value={formData.pessoa_id} onValueChange={(value) => setFormData({ ...formData, pessoa_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma pessoa" />
                </SelectTrigger>
                <SelectContent>
                  {pessoas.map((pessoa) => (
                    <SelectItem key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extra">Hora Extra</SelectItem>
                  <SelectItem value="folga">Folga</SelectItem>
                  <SelectItem value="falta">Falta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="horas">Horas</Label>
            <Input
              id="horas"
              type="number"
              step="0.5"
              min="0"
              value={formData.horas}
              onChange={(e) => setFormData({ ...formData, horas: parseFloat(e.target.value) || 0 })}
            />
            {formData.horas > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Valor estimado: R$ {valorEstimado.toFixed(2)}
                {formData.tipo === 'extra' && ' (hora extra 50%)'}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="observacao">Observação</Label>
            <Textarea
              id="observacao"
              rows={3}
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isCriando}>
            {isCriando ? 'Registrando...' : 'Registrar Ocorrência'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
