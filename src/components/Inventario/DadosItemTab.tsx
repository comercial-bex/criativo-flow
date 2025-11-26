import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast-compat';
import { useInventarioCategorias, useInventarioModelos, useCreateInventarioItem, useUpdateInventarioItem } from '@/hooks/useInventario';
import { supabase } from '@/integrations/supabase/client';

interface DadosItemTabProps {
  itemId?: string;
  mode?: 'view' | 'edit' | 'create';
  onSave?: () => void;
}

const inventarioSchema = z.object({
  categoria_id: z.string().min(1, 'Selecione uma categoria'),
  modelo_id: z.string().min(1, 'Selecione um modelo'),
  identificacao_interna: z.string().min(1, 'Identificação é obrigatória'),
  numero_serie: z.string().optional(),
  condicao: z.string().default('bom'),
  localizacao_atual: z.string().optional(),
  data_aquisicao: z.string().optional(),
  valor_aquisicao: z.string().optional(),
  fornecedor: z.string().optional(),
  vida_util_meses: z.string().optional(),
  garantia_ate: z.string().optional(),
  observacoes: z.string().optional(),
});

type InventarioFormData = z.infer<typeof inventarioSchema>;

export function DadosItemTab({ itemId, mode = 'create', onSave }: DadosItemTabProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<InventarioFormData>({
    resolver: zodResolver(inventarioSchema),
    defaultValues: {
      condicao: 'bom'
    }
  });
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
    
    // NOTA: Tabela inventario_itens foi removida - feature desabilitada
    toast.warning('Funcionalidade de inventário temporariamente desabilitada');
    setLoading(false);
    return;
    
    /* CÓDIGO DESABILITADO - inventario_itens não existe mais
    const { data } = await supabase
      .from('inventario_itens')
      .select('*, modelo:inventario_modelos(categoria_id)')
      .eq('id', itemId)
      .single();
    
    if (data) {
      // Preencher campos do formulário de forma tipada
      const fields: (keyof InventarioFormData)[] = [
        'categoria_id', 'modelo_id', 'identificacao_interna', 'numero_serie',
        'condicao', 'localizacao_atual', 'data_aquisicao', 'valor_aquisicao',
        'fornecedor', 'vida_util_meses', 'garantia_ate', 'observacoes'
      ];
      
      fields.forEach(field => {
        if (data[field]) {
          setValue(field, data[field] as string);
        }
      });
      
      if (data.modelo?.categoria_id) {
        setValue('categoria_id', data.modelo.categoria_id);
      }
    }
    */
    
    setLoading(false);
  };

  const onSubmit = async (data: any) => {
    // Buscar user_id antes de montar o payload
    const { data: { user } } = await supabase.auth.getUser();
    
    const payload = {
      ...data,
      // Só adicionar criado_por em criações
      ...(itemId ? {} : { criado_por: user?.id })
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
          {errors.categoria_id && (
            <p className="text-sm text-destructive">{errors.categoria_id.message as string}</p>
          )}
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
          {errors.modelo_id && (
            <p className="text-sm text-destructive">{errors.modelo_id.message as string}</p>
          )}
        </div>

        {/* Identificação Interna */}
        <div className="space-y-2">
          <Label htmlFor="identificacao_interna">Identificação Interna *</Label>
          <Input 
            id="identificacao_interna" 
            {...register('identificacao_interna')}
            placeholder="Ex: CAM-SONY-A7-01"
            disabled={isReadOnly}
          />
          {errors.identificacao_interna && (
            <p className="text-sm text-destructive">{errors.identificacao_interna.message as string}</p>
          )}
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
