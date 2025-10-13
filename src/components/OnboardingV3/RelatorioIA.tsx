import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, FileText, Download } from "lucide-react";
import { bexThemeV3 } from "@/styles/bex-theme";
import ReactMarkdown from "react-markdown";

interface Props {
  clienteId: string;
  concorrentes: any[];
  onRelatorioGenerated?: (relatorio: string) => void;
}

export function RelatorioIA({ clienteId, concorrentes, onRelatorioGenerated }: Props) {
  const [loading, setLoading] = useState(false);
  const [relatorio, setRelatorio] = useState<string>('');

  const handleGenerateReport = async () => {
    setLoading(true);
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

      if (concorrentesAnalises.length === 0) {
        toast.error('Analise pelo menos um concorrente antes de gerar o relatório');
        return;
      }

      const { data: result, error } = await supabase.functions.invoke('generate-competitive-report', {
        body: {
          clienteNome: clienteData?.nome || 'Cliente',
          clienteAnalise: analiseData?.cliente_analise || {},
          concorrentesAnalises
        }
      });

      if (error) throw error;

      if (result.success) {
        setRelatorio(result.relatorio);
        onRelatorioGenerated?.(result.relatorio);

        // Salvar relatório no banco
        await supabase
          .from('analise_competitiva')
          .upsert({
            cliente_id: clienteId,
            cliente_analise: analiseData?.cliente_analise || {},
            relatorio_markdown: result.relatorio,
            gerado_em: result.timestamp,
            versao: 1
          }, {
            onConflict: 'cliente_id'
          });

        toast.success('Relatório gerado com sucesso!');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      toast.error(error.message || 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // Para simplicidade, vamos fazer download do markdown
    const element = document.createElement('a');
    const file = new Blob([relatorio], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `relatorio-benchmark-${new Date().getTime()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Relatório baixado!');
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
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="border-primary/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Markdown
            </Button>
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
    </div>
  );
}