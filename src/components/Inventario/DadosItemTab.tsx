import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useInventarioCategorias, useInventarioModelos, useCreateInventarioItem, useUpdateInventarioItem } from '@/hooks/useInventario';
import { supabase } from '@/integrations/supabase/client';

interface DadosItemTabProps {
  itemId?: string;
  mode?: 'view' | 'edit' | 'create';
  onSave?: () => void;
}

export function DadosItemTab({ itemId, mode = 'create', onSave }: DadosItemTabProps) {
  const { register, handleSubmit, setValue, watch } = useForm();
  const { data: categorias } = useInventarioCategorias();
  const selectedCategoriaId = watch('categoria_id');
  const { data: modelos } = useInventarioModelos(selectedCategoriaId);
  const createItem = useCreateInventarioItem();
  const updateItem = useUpdateInventarioItem();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (itemId) {
      loadItemData();
    }
  }, [itemId]);

  const loadItemData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('inventario_itens')
      .select('*, modelo:inventario_modelos(categoria_id)')
      .eq('id', itemId)
      .single();
    
    if (data) {
      Object.keys(data).forEach(key => {
        setValue(key, data[key]);
      });
      if (data.modelo?.categoria_id) {
        setValue('categoria_id', data.modelo.categoria_id);
      }
    }
    setLoading(false);
  };

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      criado_por: itemId ? undefined : (await supabase.auth.getUser()).data.user?.id
    };

    if (itemId) {
      await updateItem.mutateAsync({ id: itemId, ...payload });
    } else {
      await createItem.mutateAsync(payload);
    }
    
    onSave?.();
  };

  const isReadOnly = mode === 'view';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Categoria */}
        <div className="space-y-2">
          <Label htmlFor="categoria_id">Categoria *</Label>
          <Select 
            disabled={isReadOnly}
            onValueChange={(value) => setValue('categoria_id', value)}
            value={watch('categoria_id')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icone && `${cat.icone} `}{cat.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Modelo */}
        <div className="space-y-2">
          <Label htmlFor="modelo_id">Modelo *</Label>
          <Select 
            disabled={isReadOnly || !selectedCategoriaId}
            onValueChange={(value) => setValue('modelo_id', value)}
            value={watch('modelo_id')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o modelo" />
            </SelectTrigger>
            <SelectContent>
              {modelos?.map((modelo) => (
                <SelectItem key={modelo.id} value={modelo.id}>
                  {modelo.marca} {modelo.modelo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Identificação Interna */}
        <div className="space-y-2">
          <Label htmlFor="identificacao_interna">Identificação Interna *</Label>
          <Input 
            id="identificacao_interna" 
            {...register('identificacao_interna', { required: true })}
            placeholder="Ex: CAM-SONY-A7-01"
            disabled={isReadOnly}
          />
        </div>

        {/* Número de Série */}
        <div className="space-y-2">
          <Label htmlFor="numero_serie">Número de Série</Label>
          <Input 
            id="numero_serie" 
            {...register('numero_serie')}
            placeholder="Opcional"
            disabled={isReadOnly}
          />
        </div>

        {/* Condição */}
        <div className="space-y-2">
          <Label htmlFor="condicao">Condição</Label>
          <Select 
            disabled={isReadOnly}
            onValueChange={(value) => setValue('condicao', value)}
            value={watch('condicao') || 'bom'}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="novo">🆕 Novo</SelectItem>
              <SelectItem value="bom">✅ Bom</SelectItem>
              <SelectItem value="uso_intenso">⚠️ Uso Intenso</SelectItem>
              <SelectItem value="avariado">❌ Avariado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Localização */}
        <div className="space-y-2">
          <Label htmlFor="localizacao_atual">Localização Atual</Label>
          <Input 
            id="localizacao_atual" 
            {...register('localizacao_atual')}
            placeholder="Ex: Sede, Estúdio, Estoque"
            disabled={isReadOnly}
          />
        </div>

        {/* Fornecedor */}
        <div className="space-y-2">
          <Label htmlFor="fornecedor">Fornecedor</Label>
          <Input 
            id="fornecedor" 
            {...register('fornecedor')}
            disabled={isReadOnly}
          />
        </div>

        {/* Data de Aquisição */}
        <div className="space-y-2">
          <Label htmlFor="data_aquisicao">Data de Aquisição</Label>
          <Input 
            id="data_aquisicao" 
            type="date"
            {...register('data_aquisicao')}
            disabled={isReadOnly}
          />
        </div>

        {/* Valor de Aquisição */}
        <div className="space-y-2">
          <Label htmlFor="valor_aquisicao">Valor de Aquisição (R$)</Label>
          <Input 
            id="valor_aquisicao" 
            type="number"
            step="0.01"
            {...register('valor_aquisicao')}
            disabled={isReadOnly}
          />
        </div>

        {/* Vida Útil */}
        <div className="space-y-2">
          <Label htmlFor="vida_util_meses">Vida Útil (meses)</Label>
          <Input 
            id="vida_util_meses" 
            type="number"
            {...register('vida_util_meses')}
            disabled={isReadOnly}
          />
        </div>

        {/* Garantia até */}
        <div className="space-y-2">
          <Label htmlFor="garantia_ate">Garantia até</Label>
          <Input 
            id="garantia_ate" 
            type="date"
            {...register('garantia_ate')}
            disabled={isReadOnly}
          />
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea 
          id="observacoes" 
          {...register('observacoes')}
          rows={3}
          disabled={isReadOnly}
        />
      </div>

      {mode !== 'view' && (
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={loading || createItem.isPending || updateItem.isPending}>
            {loading || createItem.isPending || updateItem.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      )}
    </form>
  );
}
