import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StepProps } from '../types';

export function StepEmpresa({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">📋 Informações da Empresa</h3>
        <p className="text-sm text-muted-foreground">
          Conte-nos sobre sua empresa e o que ela faz
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome_empresa">Nome da Empresa</Label>
          <Input
            id="nome_empresa"
            value={formData.nome_empresa}
            onChange={(e) => setFormData({ ...formData, nome_empresa: e.target.value })}
            placeholder="Ex: Agência Bex"
            className="bg-muted"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="segmento">Segmento de Atuação *</Label>
          <Input
            id="segmento"
            value={formData.segmento_atuacao}
            onChange={(e) => setFormData({ ...formData, segmento_atuacao: e.target.value })}
            placeholder="Ex: Marketing Digital, Consultoria, E-commerce"
          />
          <p className="text-xs text-muted-foreground">
            Em qual setor ou ramo de atividade sua empresa atua?
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="produtos">Produtos/Serviços Principais *</Label>
          <Textarea
            id="produtos"
            value={formData.produtos_servicos}
            onChange={(e) => setFormData({ ...formData, produtos_servicos: e.target.value })}
            placeholder="Ex: Gestão de redes sociais, criação de sites, tráfego pago..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Descreva os principais produtos ou serviços que você oferece
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tempo">Tempo no Mercado</Label>
            <Input
              id="tempo"
              value={formData.tempo_mercado}
              onChange={(e) => setFormData({ ...formData, tempo_mercado: e.target.value })}
              placeholder="Ex: 5 anos, Desde 2018"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="localizacao">Localização</Label>
            <Input
              id="localizacao"
              value={formData.localizacao}
              onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
              placeholder="Ex: São Paulo - SP"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
