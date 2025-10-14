import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SwotAnalysisIA } from "@/components/SwotAnalysisIA";
import { ObjetivosAssinatura } from "@/components/ObjetivosAssinatura";
import { SocialIntegrationsCard } from "@/components/SocialIntegrationsCard";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FieldWithTooltip } from "@/components/OnboardingForm/FieldWithTooltip";
import { ONBOARDING_TOOLTIPS } from "@/components/OnboardingForm/onboarding-tooltips";
import { StepperNav } from "@/components/OnboardingV3/StepperNav";
import { ConcorrentesSection } from "@/components/OnboardingV3/ConcorrentesSection";
import { VisualizacaoComparativa } from "@/components/OnboardingV3/VisualizacaoComparativa";
import { RelatorioIA } from "@/components/OnboardingV3/RelatorioIA";
import { bexThemeV3 } from "@/styles/bex-theme";
import { STEP_DESCRIPTIONS } from "@/components/OnboardingV3/step-descriptions";

interface OnboardingFormProps {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
  cliente: {
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
  };
  readOnly?: boolean;
}

interface OnboardingData {
  // 1. Identificação da Empresa
  nomeEmpresa: string;
  segmentoAtuacao: string;
  produtosServicos: string;
  tempoMercado: string;
  localizacao: string;
  estruturaAtual: string;
  canaisContato: string;
  
  // 2. Diagnóstico de Mercado
  concorrentesDiretos: string;
  diferenciais: string;
  fatoresCrise: string;
  areaAtendimento: string;
  tiposClientes: string;
  
  // 3. Estudo do Cliente
  publicoAlvo: string[];
  publicoAlvoOutros: string;
  doresProblemas: string;
  valorizado: string;
  comoEncontram: string[];
  
  // 4. Comportamento de Consumo
  frequenciaCompra: string;
  ticketMedio: string;
  formaAquisicao: string[];
  
  // 5. Marketing e Comunicação
  presencaDigital: string[];
  presencaDigitalOutros: string;
  frequenciaPostagens: string;
  tiposConteudo: string[];
  midiaPaga: string;
  
  // 6. Ações Promocionais & Publicidade
  feirasEventos: string;
  materiaisImpressos: string[];
  midiaTradicional: string[];
  
  
  // 8. Objetivos
  objetivosDigitais: string;
  objetivosOffline: string;
  onde6Meses: string;
  resultadosEsperados: string[];
  
  // 9. Estrutura Comercial
  equipeVendasExterna: string;
  canaisAtendimentoAtivos: string;
  relacionamentoClientes: string[];
  
  // 10. Plano de Comunicação
  historiaMarca: string;
  valoresPrincipais: string;
  tomVoz: string[];
  comoLembrada: string;
  
  // 7. Matriz SWOT
  forcas: string;
  fraquezas: string;
  oportunidades: string;
  ameacas: string;
}

interface ConcorrenteData {
  id?: string;
  nome: string;
  site?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
  observacoes?: string;
  analise_ia?: any;
  analisado_em?: string;
}

export function OnboardingForm({ isOpen, onClose, clienteId, cliente, readOnly = false }: OnboardingFormProps) {
  const [formData, setFormData] = useState<OnboardingData>({
    nomeEmpresa: cliente.nome,
    segmentoAtuacao: "",
    produtosServicos: "",
    tempoMercado: "",
    localizacao: "",
    estruturaAtual: "",
    canaisContato: "",
    concorrentesDiretos: "",
    diferenciais: "",
    fatoresCrise: "",
    areaAtendimento: "",
    tiposClientes: "",
    publicoAlvo: [],
    publicoAlvoOutros: "",
    doresProblemas: "",
    valorizado: "",
    comoEncontram: [],
    frequenciaCompra: "",
    ticketMedio: "",
    formaAquisicao: [],
    presencaDigital: [],
    presencaDigitalOutros: "",
    frequenciaPostagens: "",
    tiposConteudo: [],
    midiaPaga: "",
    feirasEventos: "",
    materiaisImpressos: [],
    midiaTradicional: [],
    objetivosDigitais: "",
    objetivosOffline: "",
    onde6Meses: "",
    resultadosEsperados: [],
    equipeVendasExterna: "",
    canaisAtendimentoAtivos: "",
    relacionamentoClientes: [],
    historiaMarca: "",
    valoresPrincipais: "",
    tomVoz: [],
    comoLembrada: "",
    forcas: "",
    fraquezas: "",
    oportunidades: "",
    ameacas: ""
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [concorrentes, setConcorrentes] = useState<ConcorrenteData[]>([]);

  // Definir steps de navegação
  const steps = [
    { id: 1, label: 'Identificação', icon: '🏢', completed: currentStep > 1, description: STEP_DESCRIPTIONS[1] },
    { id: 2, label: 'Mercado & SWOT', icon: '📊', completed: currentStep > 2, description: STEP_DESCRIPTIONS[2] },
    { id: 3, label: 'Concorrentes', icon: '🎯', completed: currentStep > 3, description: STEP_DESCRIPTIONS[3] },
    { id: 4, label: 'Análise IA', icon: '🤖', completed: currentStep > 4, description: STEP_DESCRIPTIONS[4] },
    { id: 5, label: 'Relatório', icon: '📄', completed: currentStep > 5, description: STEP_DESCRIPTIONS[5] },
  ];

  // Carregar dados existentes do onboarding e concorrentes
  useEffect(() => {
    if (clienteId && isOpen) {
      carregarDadosOnboarding();
      carregarConcorrentes();
    }
  }, [clienteId, isOpen]);

  // Carregar concorrentes do banco
  const carregarConcorrentes = async () => {
    try {
      const { data, error } = await supabase
        .from('concorrentes_analise')
        .select('*')
        .eq('cliente_id', clienteId);

      if (error) {
        console.error('Erro ao carregar concorrentes:', error);
        return;
      }

      if (data) {
        setConcorrentes(data.map(c => ({
          id: c.id,
          nome: c.nome,
          site: c.site,
          instagram: c.instagram,
          facebook: c.facebook,
          tiktok: c.tiktok,
          youtube: c.youtube,
          linkedin: c.linkedin,
          observacoes: c.observacoes,
          analise_ia: c.analise_ia,
          analisado_em: c.analisado_em
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar concorrentes:', error);
    }
  };

  // Carregar dados do onboarding existente
  const carregarDadosOnboarding = async () => {
    setLoading(true);
    try {
      const { data: onboardingData, error } = await supabase
        .from('cliente_onboarding')
        .select('*')
        .eq('cliente_id', clienteId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar dados de onboarding:', error);
        toast.error('Erro ao carregar dados do onboarding');
        return;
      }

      if (onboardingData) {
        // Mapear dados do banco para o formulário
        setFormData({
          nomeEmpresa: onboardingData.nome_empresa || cliente.nome,
          segmentoAtuacao: onboardingData.segmento_atuacao || '',
          produtosServicos: onboardingData.produtos_servicos || '',
          tempoMercado: onboardingData.tempo_mercado || '',
          localizacao: onboardingData.localizacao || '',
          estruturaAtual: onboardingData.estrutura_atual || '',
          canaisContato: onboardingData.canais_contato || '',
          concorrentesDiretos: onboardingData.concorrentes_diretos || '',
          diferenciais: onboardingData.diferenciais || '',
          fatoresCrise: onboardingData.fatores_crise || '',
          areaAtendimento: onboardingData.area_atendimento || '',
          tiposClientes: onboardingData.tipos_clientes || '',
          publicoAlvo: onboardingData.publico_alvo || [],
          publicoAlvoOutros: onboardingData.publico_alvo_outros || '',
          doresProblemas: onboardingData.dores_problemas || '',
          valorizado: onboardingData.valorizado || '',
          comoEncontram: onboardingData.como_encontram || [],
          frequenciaCompra: onboardingData.frequencia_compra || '',
          ticketMedio: onboardingData.ticket_medio || '',
          formaAquisicao: onboardingData.forma_aquisicao || [],
          presencaDigital: onboardingData.presenca_digital || [],
          presencaDigitalOutros: onboardingData.presenca_digital_outros || '',
          frequenciaPostagens: onboardingData.frequencia_postagens || '',
          tiposConteudo: onboardingData.tipos_conteudo || [],
          midiaPaga: onboardingData.midia_paga || '',
          feirasEventos: onboardingData.feiras_eventos || '',
          materiaisImpressos: onboardingData.materiais_impressos || [],
          midiaTradicional: onboardingData.midia_tradicional || [],
          objetivosDigitais: onboardingData.objetivos_digitais || '',
          objetivosOffline: onboardingData.objetivos_offline || '',
          onde6Meses: onboardingData.onde_6_meses || '',
          resultadosEsperados: onboardingData.resultados_esperados || [],
          equipeVendasExterna: onboardingData.equipe_vendas_externa || '',
          canaisAtendimentoAtivos: onboardingData.canais_atendimento_ativos || '',
          relacionamentoClientes: onboardingData.relacionamento_clientes || [],
          historiaMarca: onboardingData.historia_marca || '',
          valoresPrincipais: onboardingData.valores_principais || '',
          tomVoz: onboardingData.tom_voz || [],
          comoLembrada: onboardingData.como_lembrada || '',
          forcas: onboardingData.forcas || '',
          fraquezas: onboardingData.fraquezas || '',
          oportunidades: onboardingData.oportunidades || '',
          ameacas: onboardingData.ameacas || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados de onboarding:', error);
      toast.error('Erro ao carregar dados do onboarding');
    } finally {
      setLoading(false);
    }
  };


  const handleCheckboxChange = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mapear dados do formulário para o formato do banco
      const onboardingData = {
        cliente_id: clienteId,
        nome_empresa: formData.nomeEmpresa || '',
        segmento_atuacao: formData.segmentoAtuacao || '',
        produtos_servicos: formData.produtosServicos || '',
        tempo_mercado: formData.tempoMercado || '',
        localizacao: formData.localizacao || '',
        estrutura_atual: formData.estruturaAtual || '',
        canais_contato: formData.canaisContato || '',
        concorrentes_diretos: formData.concorrentesDiretos || '',
        diferenciais: formData.diferenciais || '',
        fatores_crise: formData.fatoresCrise || '',
        area_atendimento: formData.areaAtendimento || '',
        tipos_clientes: formData.tiposClientes || '',
        publico_alvo: formData.publicoAlvo || [],
        publico_alvo_outros: formData.publicoAlvoOutros || '',
        dores_problemas: formData.doresProblemas || '',
        valorizado: formData.valorizado || '',
        como_encontram: formData.comoEncontram || [],
        frequencia_compra: formData.frequenciaCompra || '',
        ticket_medio: formData.ticketMedio || '',
        forma_aquisicao: formData.formaAquisicao || [],
        presenca_digital: formData.presencaDigital || [],
        presenca_digital_outros: formData.presencaDigitalOutros || '',
        frequencia_postagens: formData.frequenciaPostagens || '',
        tipos_conteudo: formData.tiposConteudo || [],
        midia_paga: formData.midiaPaga || '',
        feiras_eventos: formData.feirasEventos || '',
        materiais_impressos: formData.materiaisImpressos || [],
        midia_tradicional: formData.midiaTradicional || [],
        objetivos_digitais: formData.objetivosDigitais || '',
        objetivos_offline: formData.objetivosOffline || '',
        onde_6_meses: formData.onde6Meses || '',
        resultados_esperados: formData.resultadosEsperados || [],
        equipe_vendas_externa: formData.equipeVendasExterna || '',
        canais_atendimento_ativos: formData.canaisAtendimentoAtivos || '',
        relacionamento_clientes: formData.relacionamentoClientes || [],
        historia_marca: formData.historiaMarca || '',
        valores_principais: formData.valoresPrincipais || '',
        tom_voz: formData.tomVoz || [],
        como_lembrada: formData.comoLembrada || '',
        forcas: formData.forcas || '',
        fraquezas: formData.fraquezas || '',
        oportunidades: formData.oportunidades || '',
        ameacas: formData.ameacas || ''
      };

      console.log('Dados para salvar:', onboardingData);

      // Verificar se já existe registro
      const { data: existingData, error: checkError } = await supabase
        .from('cliente_onboarding')
        .select('id')
        .eq('cliente_id', clienteId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erro ao verificar onboarding existente:', checkError);
        toast.error('Erro ao verificar dados existentes');
        return;
      }

      let result;
      if (existingData) {
        // Atualizar registro existente
        result = await supabase
          .from('cliente_onboarding')
          .update(onboardingData)
          .eq('cliente_id', clienteId);
      } else {
        // Inserir novo registro
        result = await supabase
          .from('cliente_onboarding')
          .insert([onboardingData]);
      }

      if (result.error) {
        console.error('Erro ao salvar onboarding:', result.error);
        toast.error('Erro ao salvar dados do onboarding');
        return;
      }

      toast.success(`Onboarding de ${cliente.nome} salvo com sucesso!`);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar onboarding:', error);
      toast.error('Erro ao salvar dados do onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-5xl max-h-[90vh]"
        style={{ 
          background: bexThemeV3.colors.bg,
          color: bexThemeV3.colors.text,
          fontFamily: bexThemeV3.typography.body
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: bexThemeV3.colors.text, fontFamily: bexThemeV3.typography.heading }}>
            Formulário de Onboarding - {cliente.nome}
          </DialogTitle>
        </DialogHeader>
        
        {/* Stepper Navigation */}
        <StepperNav 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={(step) => !readOnly && setCurrentStep(step)} 
        />
        
        <ScrollArea className="h-[calc(90vh-200px)] pr-4">
          <TooltipProvider>
            <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* STEP 1: Identificação + Mercado + Cliente + Consumo + Marketing */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* 1. Identificação da Empresa */}
                <Card style={{ background: bexThemeV3.colors.surface, borderColor: bexThemeV3.colors.primary + '30' }}>
              <CardHeader>
                <CardTitle className="text-lg">1. Identificação da Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome da empresa</Label>
                    <Input
                      value={formData.nomeEmpresa}
                      onChange={(e) => setFormData({...formData, nomeEmpresa: e.target.value})}
                      className="bg-muted"
                      readOnly
                    />
                  </div>
                  <FieldWithTooltip
                    label="Segmento de atuação"
                    helpText={ONBOARDING_TOOLTIPS.segmentoAtuacao.help}
                    example={ONBOARDING_TOOLTIPS.segmentoAtuacao.example}
                  >
                    <Input
                      value={formData.segmentoAtuacao}
                      onChange={(e) => setFormData({...formData, segmentoAtuacao: e.target.value})}
                      placeholder={ONBOARDING_TOOLTIPS.segmentoAtuacao.example}
                      readOnly={readOnly}
                      className="placeholder:text-muted-foreground/40"
                    />
                  </FieldWithTooltip>
                </div>
                <FieldWithTooltip
                  label="Produtos/Serviços principais"
                  helpText={ONBOARDING_TOOLTIPS.produtosServicos.help}
                  example={ONBOARDING_TOOLTIPS.produtosServicos.example}
                >
                  <Textarea
                    value={formData.produtosServicos}
                    onChange={(e) => setFormData({...formData, produtosServicos: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.produtosServicos.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                  />
                </FieldWithTooltip>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldWithTooltip
                    label="Tempo de mercado"
                    helpText={ONBOARDING_TOOLTIPS.tempoMercado.help}
                    example={ONBOARDING_TOOLTIPS.tempoMercado.example}
                  >
                    <Input
                      value={formData.tempoMercado}
                      onChange={(e) => setFormData({...formData, tempoMercado: e.target.value})}
                      placeholder={ONBOARDING_TOOLTIPS.tempoMercado.example}
                      readOnly={readOnly}
                      className="placeholder:text-muted-foreground/40"
                    />
                  </FieldWithTooltip>
                  <FieldWithTooltip
                    label="Localização"
                    helpText={ONBOARDING_TOOLTIPS.localizacao.help}
                    example={ONBOARDING_TOOLTIPS.localizacao.example}
                  >
                    <Input
                      value={formData.localizacao}
                      onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
                      placeholder={ONBOARDING_TOOLTIPS.localizacao.example}
                      readOnly={readOnly}
                      className="placeholder:text-muted-foreground/40"
                    />
                  </FieldWithTooltip>
                </div>
                <FieldWithTooltip
                  label="Estrutura atual (nº de colaboradores, cargos, funções)"
                  helpText={ONBOARDING_TOOLTIPS.estruturaAtual.help}
                  example={ONBOARDING_TOOLTIPS.estruturaAtual.example}
                >
                  <Textarea
                    value={formData.estruturaAtual}
                    onChange={(e) => setFormData({...formData, estruturaAtual: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.estruturaAtual.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                  />
                </FieldWithTooltip>
                <FieldWithTooltip
                  label="Canais de contato (telefone, e-mail, site, redes sociais)"
                  helpText={ONBOARDING_TOOLTIPS.canaisContato.help}
                  example={ONBOARDING_TOOLTIPS.canaisContato.example}
                >
                  <Textarea
                    value={formData.canaisContato}
                    onChange={(e) => setFormData({...formData, canaisContato: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.canaisContato.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                  />
                </FieldWithTooltip>
              </CardContent>
            </Card>

            {/* 2. Diagnóstico de Mercado */}
            <Card style={{ background: bexThemeV3.colors.surface, borderColor: bexThemeV3.colors.primary + '30' }}>
              <CardHeader>
                <CardTitle className="text-lg">2. Diagnóstico de Mercado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FieldWithTooltip
                  label="Quem são seus principais concorrentes diretos?"
                  helpText={ONBOARDING_TOOLTIPS.concorrentesDiretos.help}
                  example={ONBOARDING_TOOLTIPS.concorrentesDiretos.example}
                >
                  <Textarea
                    value={formData.concorrentesDiretos}
                    onChange={(e) => setFormData({...formData, concorrentesDiretos: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.concorrentesDiretos.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                  />
                </FieldWithTooltip>
                <FieldWithTooltip
                  label="Quais são os diferenciais da sua empresa frente aos concorrentes?"
                  helpText={ONBOARDING_TOOLTIPS.diferenciais.help}
                  example={ONBOARDING_TOOLTIPS.diferenciais.example}
                >
                  <Textarea
                    value={formData.diferenciais}
                    onChange={(e) => setFormData({...formData, diferenciais: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.diferenciais.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                  />
                </FieldWithTooltip>
                <FieldWithTooltip
                  label="Existe algum fator de crise ou histórico de impacto (ex: pandemia, retração econômica)?"
                  helpText={ONBOARDING_TOOLTIPS.fatoresCrise.help}
                  example={ONBOARDING_TOOLTIPS.fatoresCrise.example}
                >
                  <Textarea
                    value={formData.fatoresCrise}
                    onChange={(e) => setFormData({...formData, fatoresCrise: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.fatoresCrise.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                  />
                </FieldWithTooltip>
                <FieldWithTooltip
                  label="Área de atendimento/abrangência"
                  helpText={ONBOARDING_TOOLTIPS.areaAtendimento.help}
                  example={ONBOARDING_TOOLTIPS.areaAtendimento.example}
                >
                  <Input
                    value={formData.areaAtendimento}
                    onChange={(e) => setFormData({...formData, areaAtendimento: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.areaAtendimento.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                  />
                </FieldWithTooltip>
                <FieldWithTooltip
                  label="Quais os tipos de clientes mais comuns hoje (perfil)?"
                  helpText={ONBOARDING_TOOLTIPS.tiposClientes.help}
                  example={ONBOARDING_TOOLTIPS.tiposClientes.example}
                >
                  <Textarea
                    value={formData.tiposClientes}
                    onChange={(e) => setFormData({...formData, tiposClientes: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.tiposClientes.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                  />
                </FieldWithTooltip>
              </CardContent>
            </Card>

            {/* 3. Estudo do Cliente */}
            <Card style={{ background: bexThemeV3.colors.surface, borderColor: bexThemeV3.colors.primary + '30' }}>
              <CardHeader>
                <CardTitle className="text-lg">3. Estudo do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Público-alvo atual:</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["MEI", "ME", "LTDA", "EPP"].map((tipo) => (
                      <div key={tipo} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.publicoAlvo.includes(tipo)}
                          onCheckedChange={() => handleCheckboxChange("publicoAlvo", tipo)}
                        />
                        <Label>{tipo}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>Outros:</Label>
                    <Input
                      value={formData.publicoAlvoOutros}
                      onChange={(e) => setFormData({...formData, publicoAlvoOutros: e.target.value})}
                    />
                  </div>
                </div>
                <FieldWithTooltip
                  label="Principais dores/problemas que levam à compra do seu produto/serviço"
                  helpText={ONBOARDING_TOOLTIPS.doresProblemas.help}
                  example={ONBOARDING_TOOLTIPS.doresProblemas.example}
                >
                  <Textarea
                    value={formData.doresProblemas}
                    onChange={(e) => setFormData({...formData, doresProblemas: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.doresProblemas.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                  />
                </FieldWithTooltip>
                <FieldWithTooltip
                  label="O que seus clientes mais valorizam na sua marca (Preço, Qualidade, Atendimento, Prazo, Marca)?"
                  helpText={ONBOARDING_TOOLTIPS.valorizado.help}
                  example={ONBOARDING_TOOLTIPS.valorizado.example}
                >
                  <Textarea
                    value={formData.valorizado}
                    onChange={(e) => setFormData({...formData, valorizado: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.valorizado.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                  />
                </FieldWithTooltip>
                <div className="space-y-3">
                  <Label>Como seus clientes encontram sua empresa?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Redes Sociais", "Indicação", "Site", "Presencial"].map((canal) => (
                      <div key={canal} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.comoEncontram.includes(canal)}
                          onCheckedChange={() => handleCheckboxChange("comoEncontram", canal)}
                        />
                        <Label>{canal}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Comportamento de Consumo */}
            <Card style={{ background: bexThemeV3.colors.surface, borderColor: bexThemeV3.colors.primary + '30' }}>
              <CardHeader>
                <CardTitle className="text-lg">4. Comportamento de Consumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldWithTooltip
                    label="Frequência média de compra"
                    helpText={ONBOARDING_TOOLTIPS.frequenciaCompra.help}
                    example={ONBOARDING_TOOLTIPS.frequenciaCompra.example}
                  >
                    <Input
                      value={formData.frequenciaCompra}
                      onChange={(e) => setFormData({...formData, frequenciaCompra: e.target.value})}
                      placeholder={ONBOARDING_TOOLTIPS.frequenciaCompra.example}
                      readOnly={readOnly}
                      className="placeholder:text-muted-foreground/40"
                    />
                  </FieldWithTooltip>
                  <FieldWithTooltip
                    label="Ticket médio por cliente"
                    helpText={ONBOARDING_TOOLTIPS.ticketMedio.help}
                    example={ONBOARDING_TOOLTIPS.ticketMedio.example}
                  >
                    <Input
                      value={formData.ticketMedio}
                      onChange={(e) => setFormData({...formData, ticketMedio: e.target.value})}
                      placeholder={ONBOARDING_TOOLTIPS.ticketMedio.example}
                      readOnly={readOnly}
                      className="placeholder:text-muted-foreground/40"
                    />
                  </FieldWithTooltip>
                </div>
                <div className="space-y-3">
                  <Label>Forma de aquisição:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {["Telefone", "Visita presencial", "Online (WhatsApp, Site, Instagram, etc.)"].map((forma) => (
                      <div key={forma} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.formaAquisicao.includes(forma)}
                          onCheckedChange={() => handleCheckboxChange("formaAquisicao", forma)}
                        />
                        <Label className="text-sm">{forma}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. Marketing e Comunicação */}
            <Card style={{ background: bexThemeV3.colors.surface, borderColor: bexThemeV3.colors.primary + '30' }}>
              <CardHeader>
                <CardTitle className="text-lg">5. Marketing e Comunicação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Presença digital atual:</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Facebook", "Instagram", "LinkedIn", "Site"].map((plataforma) => (
                      <div key={plataforma} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.presencaDigital.includes(plataforma)}
                          onCheckedChange={() => handleCheckboxChange("presencaDigital", plataforma)}
                        />
                        <Label>{plataforma}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>Outros:</Label>
                    <Input
                      value={formData.presencaDigitalOutros}
                      onChange={(e) => setFormData({...formData, presencaDigitalOutros: e.target.value})}
                    />
                  </div>
                </div>
                <FieldWithTooltip
                  label="Frequência de postagens"
                  helpText={ONBOARDING_TOOLTIPS.frequenciaPostagens.help}
                  example={ONBOARDING_TOOLTIPS.frequenciaPostagens.example}
                >
                  <Input
                    value={formData.frequenciaPostagens}
                    onChange={(e) => setFormData({...formData, frequenciaPostagens: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.frequenciaPostagens.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                  />
                </FieldWithTooltip>
                <div className="space-y-3">
                  <Label>Tipos de conteúdo mais utilizados:</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Institucional", "Varejo", "Educativo", "Bastidores/Storytelling"].map((tipo) => (
                      <div key={tipo} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.tiposConteudo.includes(tipo)}
                          onCheckedChange={() => handleCheckboxChange("tiposConteudo", tipo)}
                        />
                        <Label>{tipo}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Já investe em mídia paga?</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.midiaPaga === "Sim"}
                        onCheckedChange={() => setFormData({...formData, midiaPaga: "Sim"})}
                      />
                      <Label>Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.midiaPaga === "Não"}
                        onCheckedChange={() => setFormData({...formData, midiaPaga: "Não"})}
                      />
                      <Label>Não</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
              </div>
            )}

            {/* STEP 2: Ações + Social + Objetivos + Comercial + Comunicação + SWOT */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* 6. Ações Promocionais & Publicidade */}
                <Card style={{ background: bexThemeV3.colors.surface, borderColor: bexThemeV3.colors.primary + '30' }}>
              <CardHeader>
                <CardTitle className="text-lg">6. Ações Promocionais & Publicidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Participa de feiras e eventos?</Label>
                  <div className="flex flex-col gap-2">
                    {["Sim, regularmente", "Sim, esporadicamente", "Não"].map((opcao) => (
                      <div key={opcao} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.feirasEventos === opcao}
                          onCheckedChange={() => setFormData({...formData, feirasEventos: opcao})}
                        />
                        <Label>{opcao}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Utiliza materiais impressos?</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Folhetos", "Cartões", "Informativos"].map((material) => (
                      <div key={material} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.materiaisImpressos.includes(material)}
                          onCheckedChange={() => handleCheckboxChange("materiaisImpressos", material)}
                        />
                        <Label>{material}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Utiliza mídia tradicional?</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Rádio", "TV", "Outdoor", "Indoor"].map((midia) => (
                      <div key={midia} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.midiaTradicional.includes(midia)}
                          onCheckedChange={() => handleCheckboxChange("midiaTradicional", midia)}
                        />
                        <Label>{midia}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integração com Redes Sociais */}
            <Card data-intro="social-integration" style={{ background: bexThemeV3.colors.surface, borderColor: bexThemeV3.colors.accent + '30' }}>
              <CardHeader>
                <CardTitle className="text-lg">🔗 Conectar Redes Sociais</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Conecte suas redes sociais para facilitar o gerenciamento de conteúdo e métricas
                </p>
              </CardHeader>
              <CardContent>
                <SocialIntegrationsCard />
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Dica:</strong> Conectar suas redes sociais agora permitirá que você:
                  </p>
                  <ul className="text-sm text-blue-600 mt-2 ml-4 space-y-1">
                    <li>• Agende posts automaticamente</li>
                    <li>• Visualize métricas em tempo real</li>
                    <li>• Gerencie múltiplas contas em um só lugar</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 7. Objetivos (Plano de Ação 6 meses) */}
            <Card style={{ background: bexThemeV3.colors.surface, borderColor: bexThemeV3.colors.primary + '30' }}>
              <CardHeader>
                <CardTitle className="text-lg">7. Objetivos (Plano de Ação 6 meses)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FieldWithTooltip
                  label="Objetivos digitais (curto prazo)"
                  helpText={ONBOARDING_TOOLTIPS.objetivosDigitais.help}
                  example={ONBOARDING_TOOLTIPS.objetivosDigitais.example}
                >
                  <Textarea
                    value={formData.objetivosDigitais}
                    onChange={(e) => setFormData({...formData, objetivosDigitais: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.objetivosDigitais.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                  />
                </FieldWithTooltip>
                <FieldWithTooltip
                  label="Objetivos offline (curto prazo)"
                  helpText={ONBOARDING_TOOLTIPS.objetivosOffline.help}
                  example={ONBOARDING_TOOLTIPS.objetivosOffline.example}
                >
                  <Textarea
                    value={formData.objetivosOffline}
                    onChange={(e) => setFormData({...formData, objetivosOffline: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.objetivosOffline.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                  />
                </FieldWithTooltip>
                <FieldWithTooltip
                  label="Onde a empresa deseja estar em 6 meses?"
                  helpText={ONBOARDING_TOOLTIPS.onde6Meses.help}
                  example={ONBOARDING_TOOLTIPS.onde6Meses.example}
                >
                  <Textarea
                    value={formData.onde6Meses}
                    onChange={(e) => setFormData({...formData, onde6Meses: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.onde6Meses.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                  />
                </FieldWithTooltip>
                <div className="space-y-3">
                  <Label>Quais resultados espera com as campanhas de marketing?</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {["Aumento de clientes", "Fortalecimento da marca", "Aumento de faturamento", "Expansão de mercado"].map((resultado) => (
                      <div key={resultado} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.resultadosEsperados.includes(resultado)}
                          onCheckedChange={() => handleCheckboxChange("resultadosEsperados", resultado)}
                        />
                        <Label>{resultado}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 8. Estrutura Comercial */}
            <Card style={{ background: bexThemeV3.colors.surface, borderColor: bexThemeV3.colors.primary + '30' }}>
              <CardHeader>
                <CardTitle className="text-lg">8. Estrutura Comercial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Possui equipe de vendas externa?</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.equipeVendasExterna === "Sim"}
                        onCheckedChange={() => setFormData({...formData, equipeVendasExterna: "Sim"})}
                      />
                      <Label>Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.equipeVendasExterna === "Não"}
                        onCheckedChange={() => setFormData({...formData, equipeVendasExterna: "Não"})}
                      />
                      <Label>Não</Label>
                    </div>
                  </div>
                </div>
                <FieldWithTooltip
                  label="Canais de atendimento mais ativos"
                  helpText={ONBOARDING_TOOLTIPS.canaisAtendimentoAtivos.help}
                  example={ONBOARDING_TOOLTIPS.canaisAtendimentoAtivos.example}
                >
                  <Textarea
                    value={formData.canaisAtendimentoAtivos}
                    onChange={(e) => setFormData({...formData, canaisAtendimentoAtivos: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.canaisAtendimentoAtivos.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                  />
                </FieldWithTooltip>
                <div className="space-y-3">
                  <Label>Relacionamento com clientes é feito por:</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["WhatsApp", "Telefone", "E-mail", "Redes sociais"].map((canal) => (
                      <div key={canal} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.relacionamentoClientes.includes(canal)}
                          onCheckedChange={() => handleCheckboxChange("relacionamentoClientes", canal)}
                        />
                        <Label>{canal}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 9. Plano de Comunicação (Baseado em Storytelling) */}
            <Card style={{ background: bexThemeV3.colors.surface, borderColor: bexThemeV3.colors.primary + '30' }}>
              <CardHeader>
                <CardTitle className="text-lg">9. Plano de Comunicação (Baseado em Storytelling)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FieldWithTooltip
                  label="História da marca"
                  helpText={ONBOARDING_TOOLTIPS.historiaMarca.help}
                  example={ONBOARDING_TOOLTIPS.historiaMarca.example}
                >
                  <Textarea
                    value={formData.historiaMarca}
                    onChange={(e) => setFormData({...formData, historiaMarca: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.historiaMarca.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                    rows={4}
                  />
                </FieldWithTooltip>
                <FieldWithTooltip
                  label="Valores principais"
                  helpText={ONBOARDING_TOOLTIPS.valoresPrincipais.help}
                  example={ONBOARDING_TOOLTIPS.valoresPrincipais.example}
                >
                  <Textarea
                    value={formData.valoresPrincipais}
                    onChange={(e) => setFormData({...formData, valoresPrincipais: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.valoresPrincipais.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                  />
                </FieldWithTooltip>
                <div className="space-y-3">
                  <Label>Tom de voz desejado na comunicação:</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Técnico", "Educativo", "Inspirador", "Institucional"].map((tom) => (
                      <div key={tom} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.tomVoz.includes(tom)}
                          onCheckedChange={() => handleCheckboxChange("tomVoz", tom)}
                        />
                        <Label>{tom}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <FieldWithTooltip
                  label="Como gostaria que sua marca fosse lembrada pelos clientes em 6 meses?"
                  helpText={ONBOARDING_TOOLTIPS.comoLembrada.help}
                  example={ONBOARDING_TOOLTIPS.comoLembrada.example}
                >
                  <Textarea
                    value={formData.comoLembrada}
                    onChange={(e) => setFormData({...formData, comoLembrada: e.target.value})}
                    placeholder={ONBOARDING_TOOLTIPS.comoLembrada.example}
                    readOnly={readOnly}
                    className="placeholder:text-muted-foreground/40"
                    rows={3}
                  />
                </FieldWithTooltip>
              </CardContent>
            </Card>

            {/* 10. Matriz F.O.F.A com IA */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">10. Análise SWOT com IA</h3>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                  ✅ Funcional
                </Badge>
              </div>
              <SwotAnalysisIA 
                clienteId={clienteId} 
                clienteNome={formData.nomeEmpresa}
                initialForcas={formData.forcas}
                initialFraquezas={formData.fraquezas}
                initialOportunidades={formData.oportunidades}
                initialAmeacas={formData.ameacas}
                onSwotDataUpdate={(swotData) => {
                  setFormData(prev => ({
                    ...prev,
                    forcas: swotData.forcas,
                    fraquezas: swotData.fraquezas,
                    oportunidades: swotData.oportunidades,
                    ameacas: swotData.ameacas
                  }));
                }}
              />
            </div>
              </div>
            )}

            {/* STEP 3: Concorrentes */}
            {currentStep === 3 && (
              <ConcorrentesSection 
                concorrentes={concorrentes}
                setConcorrentes={setConcorrentes}
                clienteId={clienteId}
              />
            )}

            {/* STEP 4: Visualizações Comparativas */}
            {currentStep === 4 && (
              <VisualizacaoComparativa 
                clienteId={clienteId}
                concorrentes={concorrentes}
              />
            )}

            {/* STEP 5: Relatório IA */}
            {currentStep === 5 && (
              <RelatorioIA
                clienteId={clienteId}
                concorrentes={concorrentes}
              />
            )}

            <Separator />
            
            {/* Navegação entre Steps */}
            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1 || readOnly}
                style={{ borderColor: bexThemeV3.colors.primary }}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              
              <div className="flex gap-2">
                {!readOnly && currentStep < 5 && (
                  <Button 
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    style={{ background: bexThemeV3.colors.primary, color: bexThemeV3.colors.bg }}
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                
                {!readOnly && currentStep === 5 && (
                  <Button 
                    type="submit"
                    style={{ background: bexThemeV3.colors.accent, color: bexThemeV3.colors.bg }}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Onboarding
                  </Button>
                )}
                
                <Button type="button" variant="outline" onClick={onClose}>
                  <X className="h-4 w-4 mr-2" />
                  {readOnly ? 'Fechar' : 'Cancelar'}
                </Button>
              </div>
            </div>
          </form>
          </TooltipProvider>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}