import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from '@/lib/toast-compat';
import { supabase } from '@/integrations/supabase/client';

interface RelatoriosFiscaisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TipoRelatorio = 'sefip' | 'esocial' | 'dirf';

export function RelatoriosFiscaisModal({ open, onOpenChange }: RelatoriosFiscaisModalProps) {
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoRelatorio>('sefip');
  const [competenciaInicio, setCompetenciaInicio] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [competenciaFim, setCompetenciaFim] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [gerando, setGerando] = useState(false);

  const gerarSEFIP = async () => {
    setGerando(true);
    try {
      // Buscar dados da folha
      const { data: folhas, error } = await supabase
        .from('financeiro_folha')
        .select(`
          *,
          financeiro_folha_itens(
            *,
            colaborador:rh_colaboradores(*)
          )
        `)
        .gte('competencia', competenciaInicio + '-01')
        .lte('competencia', competenciaFim + '-01')
        .order('competencia', { ascending: true });

      if (error) throw error;

      if (!folhas || folhas.length === 0) {
        toast.error('Nenhuma folha encontrada para o período selecionado');
        return;
      }

      // Gerar arquivo SEFIP (formato texto)
      let conteudoSEFIP = '# SEFIP - Sistema Empresa de Recolhimento do FGTS e Informações à Previdência Social\n\n';
      conteudoSEFIP += `Período: ${competenciaInicio} a ${competenciaFim}\n`;
      conteudoSEFIP += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
      conteudoSEFIP += '---\n\n';

      folhas.forEach((folha: any) => {
        conteudoSEFIP += `## COMPETÊNCIA ${folha.mes}/${folha.ano}\n\n`;
        conteudoSEFIP += `Total FGTS: R$ ${folha.total_encargos?.toFixed(2) || '0.00'}\n`;
        conteudoSEFIP += `Total Colaboradores: ${folha.total_colaboradores}\n\n`;
        
        conteudoSEFIP += '### Detalhamento por Colaborador:\n\n';
        
        folha.financeiro_folha_itens?.forEach((item: any) => {
          const colaborador = item.colaborador;
          const fgts = item.encargos?.find((e: any) => e.nome === 'FGTS')?.valor || 0;
          
          conteudoSEFIP += `- **${colaborador?.nome_completo}** (CPF: ${colaborador?.cpf_cnpj})\n`;
          conteudoSEFIP += `  - Base de Cálculo: R$ ${item.base_calculo.toFixed(2)}\n`;
          conteudoSEFIP += `  - FGTS (8%): R$ ${fgts.toFixed(2)}\n\n`;
        });
        
        conteudoSEFIP += '\n---\n\n';
      });

      // Download
      const blob = new Blob([conteudoSEFIP], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `SEFIP_${competenciaInicio}_${competenciaFim}.txt`;
      link.click();

      toast.success('SEFIP gerado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao gerar SEFIP:', error);
      toast.error('Erro ao gerar SEFIP: ' + error.message);
    } finally {
      setGerando(false);
    }
  };

  const gerarESocial = async () => {
    setGerando(true);
    try {
      const { data: folhas, error } = await supabase
        .from('financeiro_folha')
        .select(`
          *,
          financeiro_folha_itens(
            *,
            colaborador:rh_colaboradores(*)
          )
        `)
        .gte('competencia', competenciaInicio + '-01')
        .lte('competencia', competenciaFim + '-01')
        .order('competencia', { ascending: true });

      if (error) throw error;

      if (!folhas || folhas.length === 0) {
        toast.error('Nenhuma folha encontrada para o período selecionado');
        return;
      }

      // Gerar XML eSocial
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtRemun/v_S_01_02_00">\n';
      xml += '  <evtRemun Id="ID1">\n';
      xml += '    <ideEvento>\n';
      xml += `      <perApur>${competenciaInicio}</perApur>\n`;
      xml += '      <tpAmb>2</tpAmb><!-- 1=Produção, 2=Homologação -->\n';
      xml += '      <procEmi>1</procEmi>\n';
      xml += '      <verProc>1.0</verProc>\n';
      xml += '    </ideEvento>\n\n';

      folhas.forEach((folha: any, index: number) => {
        xml += `    <!-- Competência ${folha.mes}/${folha.ano} -->\n`;
        
        folha.financeiro_folha_itens?.forEach((item: any, itemIndex: number) => {
          const colaborador = item.colaborador;
          const inss = item.descontos?.find((d: any) => d.nome === 'INSS')?.valor || 0;
          const irrf = item.descontos?.find((d: any) => d.nome === 'IRRF')?.valor || 0;
          
          xml += `    <trabalhador seq="${index * 100 + itemIndex + 1}">\n`;
          xml += `      <cpfTrab>${colaborador?.cpf_cnpj?.replace(/\D/g, '')}</cpfTrab>\n`;
          xml += `      <nmTrab>${colaborador?.nome_completo}</nmTrab>\n`;
          xml += `      <remunPerApur>\n`;
          xml += `        <vrSalBase>${item.base_calculo.toFixed(2)}</vrSalBase>\n`;
          xml += `        <vrDescCP>${inss.toFixed(2)}</vrDescCP>\n`;
          xml += `        <vrIRRF>${irrf.toFixed(2)}</vrIRRF>\n`;
          xml += `        <vrLiq>${item.liquido.toFixed(2)}</vrLiq>\n`;
          xml += `      </remunPerApur>\n`;
          xml += `    </trabalhador>\n\n`;
        });
      });

      xml += '  </evtRemun>\n';
      xml += '</eSocial>';

      // Download
      const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `eSocial_${competenciaInicio}_${competenciaFim}.xml`;
      link.click();

      toast.success('eSocial gerado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao gerar eSocial:', error);
      toast.error('Erro ao gerar eSocial: ' + error.message);
    } finally {
      setGerando(false);
    }
  };

  const gerarDIRF = async () => {
    setGerando(true);
    try {
      // DIRF é anual, então vamos pegar o ano da competência início
      const ano = parseInt(competenciaInicio.split('-')[0]);
      
      const { data: folhas, error } = await supabase
        .from('financeiro_folha')
        .select(`
          *,
          financeiro_folha_itens(
            *,
            colaborador:rh_colaboradores(*)
          )
        `)
        .gte('competencia', `${ano}-01-01`)
        .lte('competencia', `${ano}-12-31`)
        .order('competencia', { ascending: true });

      if (error) throw error;

      if (!folhas || folhas.length === 0) {
        toast.error('Nenhuma folha encontrada para o ano selecionado');
        return;
      }

      // Agrupar IRRF por colaborador
      const colaboradoresMap = new Map<string, any>();

      folhas.forEach((folha: any) => {
        folha.financeiro_folha_itens?.forEach((item: any) => {
          const colaborador = item.colaborador;
          const cpf = colaborador?.cpf_cnpj;
          const irrf = item.descontos?.find((d: any) => d.nome === 'IRRF')?.valor || 0;

          if (!colaboradoresMap.has(cpf)) {
            colaboradoresMap.set(cpf, {
              nome: colaborador?.nome_completo,
              cpf: cpf,
              totalRendimentos: 0,
              totalIRRF: 0,
              totalINSS: 0,
            });
          }

          const dados = colaboradoresMap.get(cpf);
          dados.totalRendimentos += item.base_calculo;
          dados.totalIRRF += irrf;
          dados.totalINSS += item.descontos?.find((d: any) => d.nome === 'INSS')?.valor || 0;
        });
      });

      // Gerar arquivo DIRF
      let conteudoDIRF = `# DIRF ${ano} - Declaração do Imposto de Renda Retido na Fonte\n\n`;
      conteudoDIRF += `Ano-calendário: ${ano}\n`;
      conteudoDIRF += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
      conteudoDIRF += '---\n\n';

      let totalGeralIRRF = 0;
      let totalGeralRendimentos = 0;

      conteudoDIRF += '## BENEFICIÁRIOS - PESSOAS FÍSICAS\n\n';
      conteudoDIRF += '| CPF | Nome | Rendimentos | INSS | IRRF Retido |\n';
      conteudoDIRF += '|-----|------|-------------|------|-------------|\n';

      colaboradoresMap.forEach((dados) => {
        if (dados.totalIRRF > 0) {
          conteudoDIRF += `| ${dados.cpf} | ${dados.nome} | R$ ${dados.totalRendimentos.toFixed(2)} | R$ ${dados.totalINSS.toFixed(2)} | R$ ${dados.totalIRRF.toFixed(2)} |\n`;
          totalGeralIRRF += dados.totalIRRF;
          totalGeralRendimentos += dados.totalRendimentos;
        }
      });

      conteudoDIRF += '\n---\n\n';
      conteudoDIRF += '## TOTAIS\n\n';
      conteudoDIRF += `- **Total de Rendimentos Pagos**: R$ ${totalGeralRendimentos.toFixed(2)}\n`;
      conteudoDIRF += `- **Total de IRRF Retido**: R$ ${totalGeralIRRF.toFixed(2)}\n`;
      conteudoDIRF += `- **Quantidade de Beneficiários**: ${colaboradoresMap.size}\n\n`;

      conteudoDIRF += '---\n\n';
      conteudoDIRF += '**IMPORTANTE:**\n';
      conteudoDIRF += '- Este é um relatório simplificado para fins informativos\n';
      conteudoDIRF += '- Para envio oficial à Receita Federal, utilize o programa DIRF oficial\n';
      conteudoDIRF += '- Consulte um contador para validação dos valores\n';

      // Download
      const blob = new Blob([conteudoDIRF], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `DIRF_${ano}.txt`;
      link.click();

      toast.success(`DIRF ${ano} gerada com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao gerar DIRF:', error);
      toast.error('Erro ao gerar DIRF: ' + error.message);
    } finally {
      setGerando(false);
    }
  };

  const handleGerar = () => {
    switch (tipoSelecionado) {
      case 'sefip':
        gerarSEFIP();
        break;
      case 'esocial':
        gerarESocial();
        break;
      case 'dirf':
        gerarDIRF();
        break;
    }
  };

  const relatorios = {
    sefip: {
      titulo: 'SEFIP',
      descricao: 'Sistema Empresa de Recolhimento do FGTS e Informações à Previdência Social',
      info: 'Arquivo para envio mensal de informações sobre FGTS dos colaboradores',
      formato: 'Arquivo TXT',
      periodicidade: 'Mensal',
    },
    esocial: {
      titulo: 'eSocial',
      descricao: 'Sistema de Escrituração Digital das Obrigações Fiscais, Previdenciárias e Trabalhistas',
      info: 'XML com eventos de remuneração e descontos dos trabalhadores',
      formato: 'Arquivo XML',
      periodicidade: 'Mensal',
    },
    dirf: {
      titulo: 'DIRF',
      descricao: 'Declaração do Imposto de Renda Retido na Fonte',
      info: 'Declaração anual de rendimentos pagos e impostos retidos',
      formato: 'Arquivo TXT',
      periodicidade: 'Anual',
    },
  };

  const relatorioAtual = relatorios[tipoSelecionado];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" height="xl" overflow="auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Relatórios Fiscais Obrigatórios
          </DialogTitle>
          <DialogDescription>
            Gere arquivos para envio aos órgãos governamentais
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção do Tipo */}
          <div className="space-y-2">
            <Label>Tipo de Relatório</Label>
            <Select value={tipoSelecionado} onValueChange={(v) => setTipoSelecionado(v as TipoRelatorio)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sefip">SEFIP - FGTS e Previdência</SelectItem>
                <SelectItem value="esocial">eSocial - Escrituração Digital</SelectItem>
                <SelectItem value="dirf">DIRF - Declaração de IRRF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Card Informativo */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{relatorioAtual.titulo}</CardTitle>
              <CardDescription>{relatorioAtual.descricao}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                <span>{relatorioAtual.info}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-muted-foreground">Formato:</span>
                <span className="font-medium">{relatorioAtual.formato}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Periodicidade:</span>
                <span className="font-medium">{relatorioAtual.periodicidade}</span>
              </div>
            </CardContent>
          </Card>

          {/* Período */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inicio">
                {tipoSelecionado === 'dirf' ? 'Ano' : 'Competência Início'}
              </Label>
              <Input
                id="inicio"
                type={tipoSelecionado === 'dirf' ? 'number' : 'month'}
                value={tipoSelecionado === 'dirf' ? competenciaInicio.split('-')[0] : competenciaInicio}
                onChange={(e) => {
                  if (tipoSelecionado === 'dirf') {
                    setCompetenciaInicio(`${e.target.value}-01`);
                    setCompetenciaFim(`${e.target.value}-12`);
                  } else {
                    setCompetenciaInicio(e.target.value);
                  }
                }}
              />
            </div>
            {tipoSelecionado !== 'dirf' && (
              <div className="space-y-2">
                <Label htmlFor="fim">Competência Fim</Label>
                <Input
                  id="fim"
                  type="month"
                  value={competenciaFim}
                  onChange={(e) => setCompetenciaFim(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Alerta */}
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-warning">Importante</p>
                  <p className="text-muted-foreground">
                    Este é um arquivo simplificado para fins informativos. Para envio oficial aos órgãos governamentais,
                    utilize os programas certificados pela Receita Federal e Caixa Econômica Federal. Consulte sempre um
                    contador para validação dos dados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão Gerar */}
          <Button
            onClick={handleGerar}
            disabled={gerando}
            className="w-full"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            {gerando ? 'Gerando...' : `Gerar ${relatorioAtual.titulo}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
