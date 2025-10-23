import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Pacote, PacoteItem } from '@/hooks/usePacotes';

interface BriefingInteligenteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacote: Pacote;
  itens: PacoteItem[];
  clienteId: string;
  onSuccess: (briefingId: string) => void;
}

export function BriefingInteligenteModal({
  open,
  onOpenChange,
  pacote,
  itens,
  clienteId,
  onSuccess,
}: BriefingInteligenteModalProps) {
  const [currentTab, setCurrentTab] = useState('etapa1');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Etapa 1
    titulo: `${pacote.nome} - ${new Date().toLocaleDateString('pt-BR')}`,
    objetivo: '',
    tom: '',
    data_entrega: '',
    veiculacao: [] as string[],
    
    // Etapa 2
    itens_selecionados: itens.map(item => ({ ...item, quantidade_ajustada: item.quantidade })),
    
    // Etapa 3
    mensagem_chave: '',
    beneficios: ['', '', ''],
    provas_sociais: '',
    cta: '',
    
    // Etapa 4
    referencias_visuais: [] as { url: string; descricao: string }[],
    locucao: '',
    captacao: [] as string[],
    ambiente: '',
    restricoes: '',
    observacoes: '',
    quantidade_pecas: 1,
    
    // Etapa 5
    logo_url: '',
    paleta_fontes_url: '',
    manual_marca_url: '',
  });

  const validarEtapa = (etapa: string): boolean => {
    switch (etapa) {
      case 'etapa1':
        return !!(formData.objetivo && formData.tom && formData.data_entrega);
      case 'etapa2':
        return formData.itens_selecionados.length > 0;
      case 'etapa3':
        return !!(formData.mensagem_chave && formData.beneficios[0] && formData.cta);
      case 'etapa4':
        return !!(formData.referencias_visuais.length >= 2 && formData.locucao && formData.captacao.length > 0 && formData.ambiente);
      case 'etapa5':
        return !!formData.logo_url;
      default:
        return false;
    }
  };

  const proximaEtapa = () => {
    const etapas = ['etapa1', 'etapa2', 'etapa3', 'etapa4', 'etapa5'];
    const currentIndex = etapas.indexOf(currentTab);
    
    if (!validarEtapa(currentTab)) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios antes de prosseguir',
        variant: 'destructive',
      });
      return;
    }
    
    if (currentIndex < etapas.length - 1) {
      setCurrentTab(etapas[currentIndex + 1]);
    }
  };

  const etapaAnterior = () => {
    const etapas = ['etapa1', 'etapa2', 'etapa3', 'etapa4', 'etapa5'];
    const currentIndex = etapas.indexOf(currentTab);
    if (currentIndex > 0) {
      setCurrentTab(etapas[currentIndex - 1]);
    }
  };

  const handleSalvarBriefing = async () => {
    console.log('🚀 [BRIEFING] Iniciando salvamento...');
    console.log('📋 [BRIEFING] Form Data:', formData);
    console.log('🏢 [BRIEFING] Cliente ID:', clienteId);
    console.log('📦 [BRIEFING] Pacote:', pacote);

    if (!validarEtapa('etapa5')) {
      console.error('❌ [BRIEFING] Validação falhou na etapa 5');
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // ✅ Verificar sessão do usuário
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('❌ [BRIEFING] Erro de sessão:', sessionError);
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      console.log('✅ [BRIEFING] Sessão válida:', session.user.id);

      // Criar tarefa genérica para o briefing
      console.log('📝 [BRIEFING] Criando tarefa...');
      const { data: novaTarefa, error: tarefaError } = await supabase
        .from('tarefa')
        .insert({ 
          tipo: 'outro',
          cliente_id: clienteId,
          setor_responsavel: 'grs'
        } as any)
        .select('id')
        .single();
      
      if (tarefaError) {
        console.error('❌ [BRIEFING] Erro ao criar tarefa:', tarefaError);
        throw new Error(`Erro ao criar tarefa: ${tarefaError.message}`);
      }
      
      const tarefaId = novaTarefa?.id;
      if (!tarefaId) {
        throw new Error('ID da tarefa não retornado após inserção');
      }
      console.log('✅ [BRIEFING] Tarefa criada:', tarefaId);

      // ✅ Preparar dados do briefing com validação
      const briefingData = {
        tarefa_id: tarefaId,
        cliente_id: clienteId,
        pacote_id: pacote.id,
        titulo: formData.titulo,
        objetivo: formData.objetivo,
        tom: formData.tom,
        data_entrega: formData.data_entrega || null,
        veiculacao: formData.veiculacao,
        mensagem_chave: formData.mensagem_chave,
        beneficios: formData.beneficios.filter(b => b),
        provas_sociais: formData.provas_sociais,
        cta: formData.cta,
        referencias_visuais: formData.referencias_visuais as any,
        locucao: formData.locucao,
        captacao: formData.captacao,
        ambiente: formData.ambiente,
        restricoes: formData.restricoes,
        observacoes: formData.observacoes,
        logo_url: formData.logo_url,
        paleta_fontes_url: formData.paleta_fontes_url,
        manual_marca_url: formData.manual_marca_url,
        status_briefing: 'completo',
      };

      console.log('📤 [BRIEFING] Enviando para o banco:', briefingData);

      const { data, error } = await supabase
        .from('briefings')
        .insert(briefingData)
        .select()
        .single();

      if (error) {
        console.error('❌ [BRIEFING] Erro ao inserir:', error);
        console.error('📊 [BRIEFING] Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Erro ao salvar briefing: ${error.message}`);
      }

      if (!data) {
        throw new Error('Nenhum dado retornado após inserção do briefing');
      }

      console.log('✅ [BRIEFING] Salvo com sucesso!', data);

      toast({
        title: '✅ Briefing Criado!',
        description: `Briefing "${formData.titulo}" salvo com sucesso`,
      });

      onSuccess(data.id);
      onOpenChange(false);
    } catch (error: any) {
      console.error('💥 [BRIEFING] ERRO FATAL:', error);
      console.error('Stack trace:', error.stack);
      
      toast({
        title: 'Erro ao salvar briefing',
        description: error.message || 'Erro desconhecido. Verifique o console do navegador (F12).',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('🏁 [BRIEFING] Processo finalizado');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl" height="xl" overflow="auto">
        <DialogHeader>
          <DialogTitle>Briefing Inteligente - {pacote.nome}</DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="etapa1" disabled={currentTab !== 'etapa1' && !validarEtapa('etapa1')}>
              Projeto
            </TabsTrigger>
            <TabsTrigger value="etapa2" disabled={!validarEtapa('etapa1')}>
              Itens
            </TabsTrigger>
            <TabsTrigger value="etapa3" disabled={!validarEtapa('etapa2')}>
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="etapa4" disabled={!validarEtapa('etapa3')}>
              Referências
            </TabsTrigger>
            <TabsTrigger value="etapa5" disabled={!validarEtapa('etapa4')}>
              Materiais
            </TabsTrigger>
          </TabsList>

          <TabsContent value="etapa1" className="space-y-4">
            <div>
              <Label htmlFor="titulo">Nome do Projeto *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="objetivo">Objetivo *</Label>
              <Select
                value={formData.objetivo}
                onValueChange={(value) => setFormData({ ...formData, objetivo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="institucional">Institucional</SelectItem>
                  <SelectItem value="manifesto">Manifesto</SelectItem>
                  <SelectItem value="depoimento">Depoimento</SelectItem>
                  <SelectItem value="venda">Venda</SelectItem>
                  <SelectItem value="trafego">Tráfego Pago</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tom">Tom *</Label>
              <Select
                value={formData.tom}
                onValueChange={(value) => setFormData({ ...formData, tom: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poetico">Poético</SelectItem>
                  <SelectItem value="epico">Épico</SelectItem>
                  <SelectItem value="institucional">Institucional</SelectItem>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="documental">Documental</SelectItem>
                  <SelectItem value="divertido">Divertido</SelectItem>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_entrega">Data de Entrega *</Label>
              <Input
                id="data_entrega"
                type="date"
                value={formData.data_entrega}
                onChange={(e) => setFormData({ ...formData, data_entrega: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Veiculação *</Label>
              <div className="space-y-2 mt-2">
                {['TV', 'Redes Sociais', 'Institucional', 'Tráfego Pago'].map((tipo) => (
                  <div key={tipo} className="flex items-center space-x-2">
                    <Checkbox
                      id={`veiculacao-${tipo}`}
                      checked={formData.veiculacao.includes(tipo)}
                      onCheckedChange={(checked) => {
                        const newVeiculacao = checked
                          ? [...formData.veiculacao, tipo]
                          : formData.veiculacao.filter((v) => v !== tipo);
                        setFormData({ ...formData, veiculacao: newVeiculacao });
                      }}
                    />
                    <label htmlFor={`veiculacao-${tipo}`} className="text-sm">{tipo}</label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="etapa2" className="space-y-4">
            <div>
              <Label>Itens do Pacote</Label>
              <div className="space-y-2 mt-2">
                {formData.itens_selecionados.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        Skill: {item.skill} | Duração: {item.duracao_padrao_min}min
                      </div>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      className="w-20"
                      value={item.quantidade_ajustada}
                      onChange={(e) => {
                        const newItens = [...formData.itens_selecionados];
                        newItens[index].quantidade_ajustada = parseInt(e.target.value) || 1;
                        setFormData({ ...formData, itens_selecionados: newItens });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="etapa3" className="space-y-4">
            <div>
              <Label htmlFor="mensagem_chave">Mensagem-chave * (máx. 280 caracteres)</Label>
              <Textarea
                id="mensagem_chave"
                maxLength={280}
                value={formData.mensagem_chave}
                onChange={(e) => setFormData({ ...formData, mensagem_chave: e.target.value })}
                placeholder="Qual a mensagem principal que deve ser transmitida?"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {formData.mensagem_chave.length}/280
              </div>
            </div>

            <div>
              <Label>3 Benefícios/Atributos Principais *</Label>
              {formData.beneficios.map((beneficio, index) => (
                <Input
                  key={index}
                  className="mt-2"
                  placeholder={`Benefício ${index + 1}`}
                  value={beneficio}
                  onChange={(e) => {
                    const newBeneficios = [...formData.beneficios];
                    newBeneficios[index] = e.target.value;
                    setFormData({ ...formData, beneficios: newBeneficios });
                  }}
                />
              ))}
            </div>

            <div>
              <Label htmlFor="provas_sociais">Provas Sociais (depoimentos, cases, números)</Label>
              <Textarea
                id="provas_sociais"
                value={formData.provas_sociais}
                onChange={(e) => setFormData({ ...formData, provas_sociais: e.target.value })}
                placeholder="Ex: +10 anos no mercado, 500+ clientes atendidos"
              />
            </div>

            <div>
              <Label htmlFor="cta">Call to Action (CTA) *</Label>
              <Input
                id="cta"
                value={formData.cta}
                onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                placeholder="O que o público deve fazer após ver o conteúdo?"
              />
            </div>
          </TabsContent>

          <TabsContent value="etapa4" className="space-y-4">
            <div>
              <Label>Referências Visuais * (mínimo 2)</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  const newRefs = [...formData.referencias_visuais, { url: '', descricao: '' }];
                  setFormData({ ...formData, referencias_visuais: newRefs });
                }}
              >
                + Adicionar Referência
              </Button>
              {formData.referencias_visuais.map((ref, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    placeholder="URL da referência"
                    value={ref.url}
                    onChange={(e) => {
                      const newRefs = [...formData.referencias_visuais];
                      newRefs[index].url = e.target.value;
                      setFormData({ ...formData, referencias_visuais: newRefs });
                    }}
                  />
                  <Input
                    placeholder="Descrição"
                    value={ref.descricao}
                    onChange={(e) => {
                      const newRefs = [...formData.referencias_visuais];
                      newRefs[index].descricao = e.target.value;
                      setFormData({ ...formData, referencias_visuais: newRefs });
                    }}
                  />
                </div>
              ))}
            </div>

            <div>
              <Label htmlFor="locucao">Locução *</Label>
              <Select
                value={formData.locucao}
                onValueChange={(value) => setFormData({ ...formData, locucao: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de locução" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">OFF (estúdio)</SelectItem>
                  <SelectItem value="on">ON (no local)</SelectItem>
                  <SelectItem value="ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Captação * (multi-select)</Label>
              <div className="space-y-2 mt-2">
                {['externa', 'interna', 'drone', 'banco_imagem'].map((tipo) => (
                  <div key={tipo} className="flex items-center space-x-2">
                    <Checkbox
                      id={tipo}
                      checked={formData.captacao.includes(tipo)}
                      onCheckedChange={(checked) => {
                        const newCaptacao = checked
                          ? [...formData.captacao, tipo]
                          : formData.captacao.filter((c) => c !== tipo);
                        setFormData({ ...formData, captacao: newCaptacao });
                      }}
                    />
                    <label htmlFor={tipo} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {tipo.replace('_', ' ').toUpperCase()}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="ambiente">Ambiente Predominante *</Label>
              <Select
                value={formData.ambiente}
                onValueChange={(value) => setFormData({ ...formData, ambiente: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ambiente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="praia">Praia</SelectItem>
                  <SelectItem value="floresta">Floresta</SelectItem>
                  <SelectItem value="cidade">Cidade</SelectItem>
                  <SelectItem value="escritorio">Escritório</SelectItem>
                  <SelectItem value="noturno">Noturno</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="restricoes">Restrições (locais, horários, autorizações)</Label>
              <Textarea
                id="restricoes"
                value={formData.restricoes}
                onChange={(e) => setFormData({ ...formData, restricoes: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações Gerais</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes || ''}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Informações adicionais sobre o projeto"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="quantidade_pecas">Quantidade de Peças *</Label>
              <Input
                id="quantidade_pecas"
                type="number"
                min="1"
                value={formData.quantidade_pecas || 1}
                onChange={(e) => setFormData({ ...formData, quantidade_pecas: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </TabsContent>

          <TabsContent value="etapa5" className="space-y-4">
            <div>
              <Label htmlFor="logo_url">Logo * (URL ou upload)</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="URL do logo"
              />
            </div>

            <div>
              <Label htmlFor="paleta_fontes_url">Paleta & Fontes (URL)</Label>
              <Input
                id="paleta_fontes_url"
                type="url"
                value={formData.paleta_fontes_url}
                onChange={(e) => setFormData({ ...formData, paleta_fontes_url: e.target.value })}
                placeholder="URL da paleta de cores e fontes"
              />
            </div>

            <div>
              <Label htmlFor="manual_marca_url">Manual de Marca (URL)</Label>
              <Input
                id="manual_marca_url"
                type="url"
                value={formData.manual_marca_url}
                onChange={(e) => setFormData({ ...formData, manual_marca_url: e.target.value })}
                placeholder="URL do manual de marca"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={etapaAnterior}
            disabled={currentTab === 'etapa1'}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          {currentTab !== 'etapa5' ? (
            <Button onClick={proximaEtapa}>
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSalvarBriefing} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Salvar Briefing
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
