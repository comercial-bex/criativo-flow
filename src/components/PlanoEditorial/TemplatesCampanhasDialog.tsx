import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Sparkles, Calendar, TrendingUp, Eye, Plus } from 'lucide-react';
import { TEMPLATES_CAMPANHAS, TemplateCampanha, calcularTotalPosts } from '@/lib/templates-campanhas';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TemplatesCampanhasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mesReferencia: string;
  onAplicarTemplate: (template: TemplateCampanha) => void;
}

export function TemplatesCampanhasDialog({
  open,
  onOpenChange,
  mesReferencia,
  onAplicarTemplate
}: TemplatesCampanhasDialogProps) {
  const [busca, setBusca] = useState('');
  const [filtroMes, setFiltroMes] = useState<number | 'todos'>('todos');
  const [templateSelecionado, setTemplateSelecionado] = useState<TemplateCampanha | null>(null);

  const mes = new Date(mesReferencia).getMonth() + 1;

  const templatesFiltrados = useMemo(() => {
    return TEMPLATES_CAMPANHAS.filter(template => {
      const matchBusca = busca === '' || 
        template.nome.toLowerCase().includes(busca.toLowerCase()) ||
        template.descricao.toLowerCase().includes(busca.toLowerCase());
      
      const matchMes = filtroMes === 'todos' || template.mesReferencia === filtroMes;
      
      return matchBusca && matchMes;
    });
  }, [busca, filtroMes]);

  const getEngajamentoBadge = (nivel: string) => {
    switch (nivel) {
      case 'alto':
        return <Badge className="bg-green-500 text-white">⭐⭐⭐ Alto</Badge>;
      case 'medio':
        return <Badge variant="secondary">⭐⭐ Médio</Badge>;
      case 'baixo':
        return <Badge variant="outline">⭐ Baixo</Badge>;
    }
  };

  const handleAplicar = (template: TemplateCampanha) => {
    onAplicarTemplate(template);
    onOpenChange(false);
  };

  const renderTemplateCard = (template: TemplateCampanha) => {
    const totalPosts = calcularTotalPosts(template);
    
    return (
      <Card key={template.id} className="hover:shadow-lg transition-all">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{template.icone}</span>
                <h3 className="font-semibold text-lg">{template.nome}</h3>
              </div>
              
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {getEngajamentoBadge(template.potencialEngajamento)}
                <Badge variant="outline" className="text-xs">
                  📅 {template.dataFixa || 'Data móvel'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  📊 {totalPosts} posts sugeridos
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {template.descricao}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {template.diasPreCampanha} dias antes + {template.diasPosCampanha} dias depois
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Orçamento sugerido: R$ {template.orcamentoSugerido.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              {templateSelecionado?.id === template.id && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2">📋 Estrutura de Posts</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground font-medium min-w-[120px]">Pré-campanha:</span>
                        <div>
                          <span className="font-medium">{template.estruturaPosts.preCampanha.quantidade} posts</span>
                          <p className="text-xs text-muted-foreground">
                            {template.estruturaPosts.preCampanha.tiposSugeridos.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground font-medium min-w-[120px]">Durante:</span>
                        <div>
                          <span className="font-medium">{template.estruturaPosts.duranteCampanha.quantidade} posts</span>
                          <p className="text-xs text-muted-foreground">
                            {template.estruturaPosts.duranteCampanha.tiposSugeridos.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground font-medium min-w-[120px]">Pós-campanha:</span>
                        <div>
                          <span className="font-medium">{template.estruturaPosts.posCampanha.quantidade} posts</span>
                          <p className="text-xs text-muted-foreground">
                            {template.estruturaPosts.posCampanha.tiposSugeridos.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">💡 Dicas de Conteúdo</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {template.dicasConteudo.map((dica, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{dica}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">📝 Sugestão de Campanha:</p>
                    <p className="text-sm text-muted-foreground">{template.sugestaoCampanha}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTemplateSelecionado(
                templateSelecionado?.id === template.id ? null : template
              )}
            >
              <Eye className="h-4 w-4 mr-2" />
              {templateSelecionado?.id === template.id ? 'Ocultar' : 'Ver'} Detalhes
            </Button>
            <Button
              size="sm"
              onClick={() => handleAplicar(template)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Aplicar Template
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Templates de Campanhas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Filtros */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar templates..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value === 'todos' ? 'todos' : parseInt(e.target.value))}
              className="px-3 py-2 border rounded-md bg-background text-sm"
            >
              <option value="todos">Todos os Meses</option>
              <option value={mes}>📅 Mês Atual ({mes})</option>
              <option value="1">Janeiro</option>
              <option value="2">Fevereiro</option>
              <option value="3">Março</option>
              <option value="4">Abril</option>
              <option value="5">Maio</option>
              <option value="6">Junho</option>
              <option value="7">Julho</option>
              <option value="8">Agosto</option>
              <option value="9">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>
          </div>

          {/* Templates */}
          <ScrollArea className="flex-1">
            <div className="space-y-3 pr-4">
              {templatesFiltrados.map(template => renderTemplateCard(template))}
              
              {templatesFiltrados.length === 0 && (
                <div className="text-center py-12">
                  <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold text-lg mb-2">Nenhum template encontrado</h3>
                  <p className="text-sm text-muted-foreground">
                    Tente ajustar os filtros de busca
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {templatesFiltrados.length} template(s) disponível(is)
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
