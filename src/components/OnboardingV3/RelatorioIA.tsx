import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, FileText, Download } from "lucide-react";
import { bexThemeV3 } from "@/styles/bex-theme";
import ReactMarkdown from "react-markdown";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Props {
  clienteId: string;
  concorrentes: any[];
  onRelatorioGenerated?: (relatorio: string) => void;
}

export function RelatorioIA({ clienteId, concorrentes, onRelatorioGenerated }: Props) {
  const [loading, setLoading] = useState(false);
  const [relatorio, setRelatorio] = useState<string>('');
  const [linkApresentacao, setLinkApresentacao] = useState<string>('');
  const [historico, setHistorico] = useState<any[]>([]);

  // Carregar histórico de relatórios
  const loadHistorico = async () => {
    const { data } = await supabase
      .from('relatorios_benchmark')
      .select('id, titulo, versao, gerado_em, link_hash')
      .eq('cliente_id', clienteId)
      .eq('is_ativo', true)
      .order('gerado_em', { ascending: false })
      .limit(5);
      
    if (data) setHistorico(data);
  };

  useEffect(() => {
    loadHistorico();
  }, [clienteId]);

  const handleGenerateReport = async () => {
    setLoading(true);
    
    // ✅ FASE 2: Validação prévia
    const { data: onboardingCheck } = await supabase
      .from('cliente_onboarding')
      .select('id')
      .eq('cliente_id', clienteId)
      .maybeSingle();
    
    if (!onboardingCheck) {
      toast.error('Complete o onboarding antes de gerar o relatório');
      setLoading(false);
      return;
    }
    
    console.log('📝 [RELATORIO] Iniciando geração para cliente:', clienteId);
    
    try {
      // Buscar análise do cliente
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('nome')
        .eq('id', clienteId)
        .single();

      const { data: analiseData } = await supabase
        .from('analise_competitiva')
        .select('cliente_analise')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const concorrentesAnalises = concorrentes
        .filter(c => c.analise_ia && Object.keys(c.analise_ia).length > 0)
        .map(c => ({
          nome: c.nome,
          analise: c.analise_ia
        }));

      console.log('📝 [RELATORIO] Concorrentes analisados:', concorrentesAnalises.length);

      if (concorrentesAnalises.length === 0) {
        toast.error('Analise pelo menos um concorrente antes de gerar o relatório');
        setLoading(false);
        return;
      }

      console.log('📝 [RELATORIO] Chamando edge function...');

      const { data: result, error } = await supabase.functions.invoke('generate-competitive-report', {
        body: {
          clienteId,
          clienteNome: clienteData?.nome || 'Cliente',
          clienteAnalise: analiseData?.cliente_analise || {},
          concorrentesAnalises
        }
      });

      console.log('📝 [RELATORIO] Resposta:', { success: result?.success, hasRelatorio: !!result?.relatorio });

      if (error) {
        console.error('❌ [RELATORIO] Erro:', error);
        throw error;
      }

      if (result.success) {
        setRelatorio(result.relatorio);
        setLinkApresentacao(result.link_apresentacao);
        onRelatorioGenerated?.(result.relatorio);

        toast.success('Relatório gerado com sucesso!');
        loadHistorico(); // Recarregar histórico
      } else {
        throw new Error(result.error || 'Erro ao gerar relatório');
      }
    } catch (error: any) {
      console.error('❌ [RELATORIO] Erro completo:', error);
      toast.error(error.message || 'Erro ao gerar relatório. Verifique os logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMarkdown = () => {
    const element = document.createElement('a');
    const file = new Blob([relatorio], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `relatorio-benchmark-${new Date().getTime()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Markdown baixado!');
  };

  // ✅ FASE 3: Implementar geração de PDF
  const handleDownloadPDF = async () => {
    try {
      toast.info('Gerando PDF... Aguarde alguns segundos.');
      
      const element = document.querySelector('.markdown-content');
      if (!element) {
        toast.error('Conteúdo do relatório não encontrado');
        return;
      }

      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`relatorio-benchmark-${new Date().getTime()}.pdf`);
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Tente baixar o Markdown.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" style={{ color: bexThemeV3.colors.primary }} />
          <h2 className="text-2xl font-bold" style={{ fontFamily: bexThemeV3.typography.heading }}>
            Relatório de Benchmark
          </h2>
        </div>
        <div className="flex gap-2">
          {relatorio && (
            <>
              <Button
                onClick={handleDownloadPDF}
                variant="default"
                style={{
                  background: `linear-gradient(to right, ${bexThemeV3.colors.primary}, ${bexThemeV3.colors.accent})`,
                  color: bexThemeV3.colors.bg
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
              <Button
                onClick={handleDownloadMarkdown}
                variant="outline"
                className="border-primary/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Markdown
              </Button>
            </>
          )}
          <Button
            onClick={handleGenerateReport}
            disabled={loading || concorrentes.length === 0}
            className="font-semibold"
            style={{
              background: `linear-gradient(to right, ${bexThemeV3.colors.primary}, ${bexThemeV3.colors.accent})`,
              color: bexThemeV3.colors.bg
            }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando Relatório...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                {relatorio ? 'Regerar Relatório' : 'Gerar Relatório IA'}
              </>
            )}
          </Button>
        </div>
      </div>

      {!relatorio && !loading && (
        <Card className="p-8 text-center border-dashed border-2" style={{ borderColor: `${bexThemeV3.colors.primary}30` }}>
          <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: bexThemeV3.colors.primary }} />
          <h3 className="text-lg font-semibold mb-2">Relatório Estratégico com IA</h3>
          <p className="mb-6" style={{ color: bexThemeV3.colors.textMuted }}>
            Clique no botão acima para gerar um relatório completo de benchmark digital
            com análise estratégica, oportunidades de melhoria e ações recomendadas.
          </p>
        </Card>
      )}

      {loading && (
        <Card style={{ background: bexThemeV3.colors.surface }}>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" style={{ color: bexThemeV3.colors.primary }} />
            <p style={{ color: bexThemeV3.colors.textMuted }}>
              Gerando relatório estratégico com IA... Isso pode levar alguns segundos.
            </p>
          </CardContent>
        </Card>
      )}

      {linkApresentacao && (
        <Card style={{ background: bexThemeV3.colors.surface }}>
          <CardContent className="py-6">
            <Button
              onClick={() => window.open(linkApresentacao, '_blank')}
              className="w-full"
              size="lg"
              style={{
                background: `linear-gradient(to right, ${bexThemeV3.colors.primary}, ${bexThemeV3.colors.accent})`,
                color: bexThemeV3.colors.bg
              }}
            >
              <FileText className="h-5 w-5 mr-2" />
              Abrir Apresentação One-Page
            </Button>
          </CardContent>
        </Card>
      )}

      {relatorio && !loading && (
        <Card style={{ background: bexThemeV3.colors.surface }}>
          <CardHeader>
            <CardTitle>Preview do Relatório</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <div 
              className="markdown-content p-6 rounded-lg"
              style={{ 
                background: bexThemeV3.colors.bg,
                fontFamily: bexThemeV3.typography.body
              }}
            >
              <ReactMarkdown>{relatorio}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {historico.length > 0 && (
        <Card style={{ background: bexThemeV3.colors.surface }}>
          <CardHeader>
            <CardTitle>Relatórios Anteriores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {historico.map(rel => (
                <div key={rel.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div>
                    <p className="font-medium">{rel.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      Versão {rel.versao} • {new Date(rel.gerado_em).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Button
                    onClick={() => window.open(`/apresentacao/${rel.link_hash}`, '_blank')}
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Abrir Apresentação
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}