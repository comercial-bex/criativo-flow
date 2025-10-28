import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ExtratoParserConfigProps {
  onSave: (config: any) => void;
  onBack: () => void;
  loading?: boolean;
}

export function ExtratoParserConfig({ onSave, onBack, loading }: ExtratoParserConfigProps) {
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

  const handleSave = () => {
    onSave(config);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <h3 className="font-semibold">Configuração do Parser CSV</h3>
        
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
