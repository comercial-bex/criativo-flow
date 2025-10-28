import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

interface ExtratoParserConfigProps {
  onSave: (config: any) => void;
  onBack: () => void;
  loading?: boolean;
  file?: File;
}

export function ExtratoParserConfig({ onSave, onBack, loading, file }: ExtratoParserConfigProps) {
  const [config, setConfig] = useState({
    delimitador: ',',
    linhaInicial: 1,
    mapeamentoColunas: {
      data: '',
      descricao: '',
      valor: '',
      tipo: '',
      saldo: '',
      documento: '',
    },
  });

  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [preview, setPreview] = useState<any[]>([]);

  const handleAnalyzeWithAI = async () => {
    if (!file) {
      smartToast.error('Nenhum arquivo selecionado');
      return;
    }

    setAnalyzingAI(true);
    setAiSuggestion(null);
    setPreview([]);

    try {
      // Ler primeiras 20 linhas do arquivo
      const text = await file.text();
      const lines = text.split('\n').slice(0, 20).join('\n');

      smartToast.loading('Analisando estrutura do arquivo...');

      const { data, error } = await supabase.functions.invoke('analyze-extrato-structure', {
        body: {
          fileContent: lines,
          fileName: file.name
        }
      });

      if (error) throw error;

      if (data.success) {
        setAiSuggestion(data);
        setPreview(data.preview || []);
        setConfig(data.config);
        
        smartToast.success('Configuração detectada!', 
          `Confiança: ${(data.confianca * 100).toFixed(0)}%`
        );
      } else {
        throw new Error(data.error || 'Erro ao analisar arquivo');
      }
    } catch (error: any) {
      console.error('Erro na análise IA:', error);
      smartToast.error('Erro ao analisar arquivo', error.message);
    } finally {
      setAnalyzingAI(false);
    }
  };

  const handleSave = () => {
    onSave(config);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Configuração do Parser CSV</h3>
          
          {file && (
            <Button
              onClick={handleAnalyzeWithAI}
              disabled={analyzingAI || loading}
              variant="outline"
              size="sm"
            >
              {analyzingAI ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Detectar com IA
                </>
              )}
            </Button>
          )}
        </div>

        {/* AI Suggestion Card */}
        {aiSuggestion && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Configuração sugerida pela IA</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {aiSuggestion.bancoDetectado}
                </p>
              </div>
              
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                aiSuggestion.confianca >= 0.9 
                  ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                  : aiSuggestion.confianca >= 0.7
                  ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                  : 'bg-red-500/10 text-red-700 dark:text-red-400'
              }`}>
                {(aiSuggestion.confianca * 100).toFixed(0)}% confiança
              </div>
            </div>

            {preview.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-primary/10">
                <p className="text-xs font-medium text-muted-foreground">
                  Preview (3 primeiras transações):
                </p>
                <div className="space-y-1">
                  {preview.map((item, idx) => (
                    <div key={idx} className="text-xs bg-background/50 rounded px-2 py-1.5 font-mono">
                      <span className="text-primary">{item.data}</span>
                      {' • '}
                      <span className="text-foreground">{item.descricao}</span>
                      {' • '}
                      <span className="font-semibold">{item.valor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Delimitador</Label>
            <Select
              value={config.delimitador}
              onValueChange={(value) => setConfig({ ...config, delimitador: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=",">Vírgula (,)</SelectItem>
                <SelectItem value=";">Ponto e vírgula (;)</SelectItem>
                <SelectItem value="\t">Tab</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Linha Inicial (pular cabeçalhos)</Label>
            <Input
              type="number"
              min="0"
              value={config.linhaInicial}
              onChange={(e) => setConfig({ ...config, linhaInicial: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <h4 className="font-medium text-sm">Mapeamento de Colunas</h4>
          <p className="text-sm text-muted-foreground">
            Informe o número ou nome da coluna correspondente a cada campo
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data da Transação *</Label>
              <Input
                placeholder="Ex: 0, A, Data"
                value={config.mapeamentoColunas.data}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    mapeamentoColunas: { ...config.mapeamentoColunas, data: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input
                placeholder="Ex: 1, B, Historico"
                value={config.mapeamentoColunas.descricao}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    mapeamentoColunas: { ...config.mapeamentoColunas, descricao: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Valor *</Label>
              <Input
                placeholder="Ex: 2, C, Valor"
                value={config.mapeamentoColunas.valor}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    mapeamentoColunas: { ...config.mapeamentoColunas, valor: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo (Débito/Crédito)</Label>
              <Input
                placeholder="Ex: 3, D, Tipo"
                value={config.mapeamentoColunas.tipo}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    mapeamentoColunas: { ...config.mapeamentoColunas, tipo: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Saldo</Label>
              <Input
                placeholder="Ex: 4, E, Saldo"
                value={config.mapeamentoColunas.saldo}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    mapeamentoColunas: { ...config.mapeamentoColunas, saldo: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Número do Documento</Label>
              <Input
                placeholder="Ex: 5, F, Documento"
                value={config.mapeamentoColunas.documento}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    mapeamentoColunas: { ...config.mapeamentoColunas, documento: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Processando..." : "Processar Extrato"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
