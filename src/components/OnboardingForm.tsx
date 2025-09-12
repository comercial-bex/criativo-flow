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
import { Save, X, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingFormProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: {
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
  };
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
  
  // 7. Matriz F.O.F.A
  forcas: string;
  fraquezas: string;
  oportunidades: string;
  ameacas: string;
  
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
}

export function OnboardingForm({ isOpen, onClose, cliente }: OnboardingFormProps) {
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
    forcas: "",
    fraquezas: "",
    oportunidades: "",
    ameacas: "",
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
    comoLembrada: ""
  });

  const [loading, setLoading] = useState(false);

  // Carregar dados automaticamente se for Tech Solutions Ltda
  useEffect(() => {
    if (cliente.nome === 'Tech Solutions Ltda') {
      carregarDadosSimulados();
    }
  }, [cliente.nome]);

  // Carregar dados simulados da Tech Solutions Ltda
  const carregarDadosSimulados = async () => {
    setLoading(true);
    try {
      // Primeiro buscar o cliente Tech Solutions Ltda
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select('id')
        .eq('nome', 'Tech Solutions Ltda')
        .maybeSingle();

      if (clienteError || !clienteData) {
        toast.error('Dados simulados não encontrados');
        return;
      }

      // Buscar dados de onboarding
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('cliente_onboarding')
        .select('*')
        .eq('cliente_id', clienteData.id)
        .maybeSingle();

      if (onboardingError || !onboardingData) {
        toast.error('Dados de onboarding não encontrados');
        return;
      }

      // Mapear dados do banco para o formulário
      setFormData({
        nomeEmpresa: onboardingData.nome_empresa || '',
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
        forcas: onboardingData.forcas || '',
        fraquezas: onboardingData.fraquezas || '',
        oportunidades: onboardingData.oportunidades || '',
        ameacas: onboardingData.ameacas || '',
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
        comoLembrada: onboardingData.como_lembrada || ''
      });

      toast.success('Dados simulados carregados com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar dados simulados:', error);
      toast.error('Erro ao carregar dados simulados');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Onboarding de ${cliente.nome} salvo com sucesso!`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Formulário de Onboarding - {cliente.nome}</DialogTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={carregarDadosSimulados}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>Carregando...</>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Carregar Dados Simulados
                </>
              )}
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Identificação da Empresa */}
            <Card>
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
                  <div className="space-y-2">
                    <Label>Segmento de atuação</Label>
                    <Input
                      value={formData.segmentoAtuacao}
                      onChange={(e) => setFormData({...formData, segmentoAtuacao: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Produtos/Serviços principais</Label>
                  <Textarea
                    value={formData.produtosServicos}
                    onChange={(e) => setFormData({...formData, produtosServicos: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tempo de mercado</Label>
                    <Input
                      value={formData.tempoMercado}
                      onChange={(e) => setFormData({...formData, tempoMercado: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Localização</Label>
                    <Input
                      value={formData.localizacao}
                      onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Estrutura atual (nº de colaboradores, cargos, funções)</Label>
                  <Textarea
                    value={formData.estruturaAtual}
                    onChange={(e) => setFormData({...formData, estruturaAtual: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Canais de contato (telefone, e-mail, site, redes sociais)</Label>
                  <Textarea
                    value={formData.canaisContato}
                    onChange={(e) => setFormData({...formData, canaisContato: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. Diagnóstico de Mercado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Diagnóstico de Mercado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Quem são seus principais concorrentes diretos?</Label>
                  <Textarea
                    value={formData.concorrentesDiretos}
                    onChange={(e) => setFormData({...formData, concorrentesDiretos: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quais são os diferenciais da sua empresa frente aos concorrentes?</Label>
                  <Textarea
                    value={formData.diferenciais}
                    onChange={(e) => setFormData({...formData, diferenciais: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Existe algum fator de crise ou histórico de impacto (ex: pandemia, retração econômica)?</Label>
                  <Textarea
                    value={formData.fatoresCrise}
                    onChange={(e) => setFormData({...formData, fatoresCrise: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Área de atendimento/abrangência</Label>
                  <Input
                    value={formData.areaAtendimento}
                    onChange={(e) => setFormData({...formData, areaAtendimento: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quais os tipos de clientes mais comuns hoje (perfil)?</Label>
                  <Textarea
                    value={formData.tiposClientes}
                    onChange={(e) => setFormData({...formData, tiposClientes: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 3. Estudo do Cliente */}
            <Card>
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
                <div className="space-y-2">
                  <Label>Principais dores/problemas que levam à compra do seu produto/serviço</Label>
                  <Textarea
                    value={formData.doresProblemas}
                    onChange={(e) => setFormData({...formData, doresProblemas: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>O que seus clientes mais valorizam na sua marca (Preço, Qualidade, Atendimento, Prazo, Marca)?</Label>
                  <Textarea
                    value={formData.valorizado}
                    onChange={(e) => setFormData({...formData, valorizado: e.target.value})}
                  />
                </div>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">4. Comportamento de Consumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frequência média de compra</Label>
                    <Input
                      value={formData.frequenciaCompra}
                      onChange={(e) => setFormData({...formData, frequenciaCompra: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ticket médio por cliente</Label>
                    <Input
                      value={formData.ticketMedio}
                      onChange={(e) => setFormData({...formData, ticketMedio: e.target.value})}
                    />
                  </div>
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
            <Card>
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
                <div className="space-y-2">
                  <Label>Frequência de postagens</Label>
                  <Input
                    value={formData.frequenciaPostagens}
                    onChange={(e) => setFormData({...formData, frequenciaPostagens: e.target.value})}
                  />
                </div>
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

            {/* 6. Ações Promocionais & Publicidade */}
            <Card>
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

            {/* 7. Objetivos (Plano de Ação 6 meses) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">7. Objetivos (Plano de Ação 6 meses)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Objetivos digitais (curto prazo)</Label>
                  <Textarea
                    value={formData.objetivosDigitais}
                    onChange={(e) => setFormData({...formData, objetivosDigitais: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Objetivos offline (curto prazo)</Label>
                  <Textarea
                    value={formData.objetivosOffline}
                    onChange={(e) => setFormData({...formData, objetivosOffline: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Onde a empresa deseja estar em 6 meses?</Label>
                  <Textarea
                    value={formData.onde6Meses}
                    onChange={(e) => setFormData({...formData, onde6Meses: e.target.value})}
                  />
                </div>
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
            <Card>
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
                <div className="space-y-2">
                  <Label>Canais de atendimento mais ativos</Label>
                  <Textarea
                    value={formData.canaisAtendimentoAtivos}
                    onChange={(e) => setFormData({...formData, canaisAtendimentoAtivos: e.target.value})}
                  />
                </div>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">9. Plano de Comunicação (Baseado em Storytelling)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>História da marca</Label>
                  <Textarea
                    value={formData.historiaMarca}
                    onChange={(e) => setFormData({...formData, historiaMarca: e.target.value})}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valores principais</Label>
                  <Textarea
                    value={formData.valoresPrincipais}
                    onChange={(e) => setFormData({...formData, valoresPrincipais: e.target.value})}
                  />
                </div>
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
                <div className="space-y-2">
                  <Label>Como gostaria que sua marca fosse lembrada pelos clientes em 6 meses?</Label>
                  <Textarea
                    value={formData.comoLembrada}
                    onChange={(e) => setFormData({...formData, comoLembrada: e.target.value})}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 10. Matriz F.O.F.A */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">10. Matriz F.O.F.A (Autoavaliação)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 h-96">
                  {/* Quadrante Superior Esquerdo - Forças */}
                  <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                    <Label className="text-green-800 font-semibold text-center block mb-3">
                      FORÇAS
                    </Label>
                    <Label className="text-xs text-green-600 block mb-2">
                      (O que a empresa faz bem)
                    </Label>
                    <Textarea
                      value={formData.forcas}
                      onChange={(e) => setFormData({...formData, forcas: e.target.value})}
                      className="h-32 border-green-300 focus:border-green-500 bg-white"
                      placeholder="Liste os pontos fortes da empresa..."
                    />
                  </div>

                  {/* Quadrante Superior Direito - Oportunidades */}
                  <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                    <Label className="text-blue-800 font-semibold text-center block mb-3">
                      OPORTUNIDADES
                    </Label>
                    <Label className="text-xs text-blue-600 block mb-2">
                      (Mercado, tendências, expansão)
                    </Label>
                    <Textarea
                      value={formData.oportunidades}
                      onChange={(e) => setFormData({...formData, oportunidades: e.target.value})}
                      className="h-32 border-blue-300 focus:border-blue-500 bg-white"
                      placeholder="Identifique as oportunidades de mercado..."
                    />
                  </div>

                  {/* Quadrante Inferior Esquerdo - Fraquezas */}
                  <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                    <Label className="text-red-800 font-semibold text-center block mb-3">
                      FRAQUEZAS
                    </Label>
                    <Label className="text-xs text-red-600 block mb-2">
                      (O que precisa melhorar)
                    </Label>
                    <Textarea
                      value={formData.fraquezas}
                      onChange={(e) => setFormData({...formData, fraquezas: e.target.value})}
                      className="h-32 border-red-300 focus:border-red-500 bg-white"
                      placeholder="Liste os pontos que precisam melhorar..."
                    />
                  </div>

                  {/* Quadrante Inferior Direito - Ameaças */}
                  <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                    <Label className="text-orange-800 font-semibold text-center block mb-3">
                      AMEAÇAS
                    </Label>
                    <Label className="text-xs text-orange-600 block mb-2">
                      (Concorrência, economia, fatores externos)
                    </Label>
                    <Textarea
                      value={formData.ameacas}
                      onChange={(e) => setFormData({...formData, ameacas: e.target.value})}
                      className="h-32 border-orange-300 focus:border-orange-500 bg-white"
                      placeholder="Identifique as ameaças externas..."
                    />
                  </div>
                </div>
                
                {/* Eixos do plano cartesiano */}
                <div className="mt-4 text-center">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span className="bg-red-100 px-2 py-1 rounded">INTERNO (Controle da empresa)</span>
                    <span className="bg-blue-100 px-2 py-1 rounded">EXTERNO (Ambiente de mercado)</span>
                  </div>
                  <div className="flex justify-center mt-2">
                    <div className="flex flex-col items-center text-sm text-muted-foreground">
                      <span className="bg-green-100 px-2 py-1 rounded mb-1">POSITIVO</span>
                      <div className="w-px h-8 bg-gray-300"></div>
                      <span className="bg-orange-100 px-2 py-1 rounded mt-1">NEGATIVO</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Salvar Onboarding
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}