import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Target, Users, Zap } from 'lucide-react';

interface BriefingFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function BriefingForm({ formData, setFormData }: BriefingFormProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <FileText className="h-5 w-5" />
          Briefing Obrigatório
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Objective */}
        <div className="space-y-2">
          <Label htmlFor="objetivo" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Objetivo da Postagem *
          </Label>
          <Textarea
            id="objetivo"
            value={formData.objetivo_postagem}
            onChange={(e) => setFormData({ ...formData, objetivo_postagem: e.target.value })}
            placeholder="Ex: Aumentar engajamento e gerar leads para o produto X"
            required
            rows={2}
          />
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <Label htmlFor="publico" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Público-Alvo *
          </Label>
          <Input
            id="publico"
            value={formData.publico_alvo}
            onChange={(e) => setFormData({ ...formData, publico_alvo: e.target.value })}
            placeholder="Ex: Mulheres, 25-35 anos, interessadas em moda"
            required
          />
        </div>

        {/* Format */}
        <div className="space-y-2">
          <Label htmlFor="formato">Formato Desejado *</Label>
          <Select 
            value={formData.formato_postagem} 
            onValueChange={(value) => setFormData({ ...formData, formato_postagem: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="post_feed">Post para Feed</SelectItem>
              <SelectItem value="stories">Stories</SelectItem>
              <SelectItem value="reels">Reels</SelectItem>
              <SelectItem value="carrossel">Carrossel</SelectItem>
              <SelectItem value="video">Vídeo</SelectItem>
              <SelectItem value="igtv">IGTV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Strategic Context */}
        <div className="space-y-2">
          <Label htmlFor="contexto">Contexto Estratégico</Label>
          <Textarea
            id="contexto"
            value={formData.contexto_estrategico}
            onChange={(e) => setFormData({ ...formData, contexto_estrategico: e.target.value })}
            placeholder="Ex: Campanha de Black Friday, lançamento de produto, sazonalidade..."
            rows={2}
          />
        </div>

        {/* CTA */}
        <div className="space-y-2">
          <Label htmlFor="cta" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Call to Action (CTA)
          </Label>
          <Input
            id="cta"
            value={formData.call_to_action}
            onChange={(e) => setFormData({ ...formData, call_to_action: e.target.value })}
            placeholder="Ex: 'Confira no link da bio', 'Mande DM', 'Compre agora'"
          />
        </div>

        {/* Hashtags */}
        <div className="space-y-2">
          <Label htmlFor="hashtags">Hashtags Sugeridas</Label>
          <Input
            id="hashtags"
            value={formData.hashtags}
            onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
            placeholder="Ex: #blackfriday, #promocao, #moda (separadas por vírgula)"
          />
          <p className="text-xs text-muted-foreground">
            Separe as hashtags por vírgula. Máximo recomendado: 10 hashtags
          </p>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="observacoes_briefing">Observações Adicionais</Label>
          <Textarea
            id="observacoes_briefing"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            placeholder="Informações adicionais, referências, requisitos especiais..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}