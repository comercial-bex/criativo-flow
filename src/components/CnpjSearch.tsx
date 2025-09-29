import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Building, MapPin, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useCnpjLookup, CnpjData } from '@/hooks/useCnpjLookup';
import { useDebounce } from '@/hooks/use-debounce';

interface CnpjSearchProps {
  onCnpjData: (data: CnpjData) => void;
  initialValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}

function CnpjSearch({ onCnpjData, initialValue = '', value, onChange }: CnpjSearchProps) {
  const [cnpjInput, setCnpjInput] = useState(value || initialValue);
  const [cnpjData, setCnpjData] = useState<CnpjData | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [fonte, setFonte] = useState<string>('');
  
  const { loading, lookupCnpj, formatCnpj, validateCnpj } = useCnpjLookup();
  const debouncedCnpj = useDebounce(cnpjInput.replace(/\D/g, ''), 800);

  // Busca automática quando CNPJ for válido
  React.useEffect(() => {
    if (debouncedCnpj.length === 14 && validateCnpj(debouncedCnpj)) {
      handleSearch();
    } else if (debouncedCnpj.length < 14) {
      setShowResults(false);
      setCnpjData(null);
    }
  }, [debouncedCnpj]);

  const handleCnpjChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const cleanValue = valor.replace(/\D/g, '');
    const formattedValue = formatCnpj(cleanValue);
    
    setCnpjInput(formattedValue);
    onChange?.(cleanValue);
  }, [formatCnpj, onChange]);

  const handleSearch = useCallback(async () => {
    const cleanCnpj = cnpjInput.replace(/\D/g, '');
    
    if (!validateCnpj(cleanCnpj)) {
      return;
    }

    try {
      const result = await lookupCnpj(cleanCnpj);
      
      if (result.success && result.data) {
        setCnpjData(result.data);
        setFonte(result.fonte || '');
        setShowResults(true);
        
        // Auto-aplicar dados após busca bem-sucedida
        onCnpjData(result.data);
      } else {
        setShowResults(false);
        setCnpjData(null);
      }
    } catch (error) {
      console.error('Erro na busca CNPJ:', error);
      setShowResults(false);
      setCnpjData(null);
    }
  }, [cnpjInput, lookupCnpj, onCnpjData, validateCnpj]);

  const getSituacaoColor = (situacao?: string) => {
    if (!situacao) return 'secondary';
    const lower = situacao.toLowerCase();
    if (lower.includes('ativa')) return 'default';
    if (lower.includes('suspensa') || lower.includes('inapta')) return 'destructive';
    return 'secondary';
  };

  const getSituacaoIcon = (situacao?: string) => {
    if (!situacao) return AlertCircle;
    const lower = situacao.toLowerCase();
    if (lower.includes('ativa')) return CheckCircle;
    if (lower.includes('suspensa') || lower.includes('inapta')) return XCircle;
    return AlertCircle;
  };

  const isValidCnpj = cnpjInput.replace(/\D/g, '').length === 14 && validateCnpj(cnpjInput.replace(/\D/g, ''));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="00.000.000/0000-00"
            value={cnpjInput}
            onChange={handleCnpjChange}
            maxLength={18}
            className={`pr-10 ${
              cnpjInput && !isValidCnpj 
                ? 'border-destructive focus:border-destructive' 
                : cnpjInput && isValidCnpj 
                  ? 'border-green-500 focus:border-green-500'
                  : ''
            }`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : cnpjInput && isValidCnpj ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : cnpjInput && !isValidCnpj ? (
              <XCircle className="h-4 w-4 text-destructive" />
            ) : null}
          </div>
        </div>
        
        <Button 
          onClick={handleSearch}
          disabled={loading || !isValidCnpj}
          variant="outline"
          size="icon"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Consultando CNPJ...
        </div>
      )}

      {showResults && cnpjData && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                Dados da Empresa
              </CardTitle>
              {fonte && (
                <Badge variant="outline" className="text-xs">
                  {fonte}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Razão Social</h4>
              <p className="font-medium">{cnpjData.razao_social || 'Não informado'}</p>
            </div>
            
            {cnpjData.nome_fantasia && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Nome Fantasia</h4>
                <p>{cnpjData.nome_fantasia}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Situação:</h4>
              <Badge 
                variant={getSituacaoColor(cnpjData.situacao_cadastral)}
                className="flex items-center gap-1"
              >
                {React.createElement(getSituacaoIcon(cnpjData.situacao_cadastral), { 
                  className: "h-3 w-3" 
                })}
                {cnpjData.situacao_cadastral || 'Não informado'}
              </Badge>
            </div>

            {cnpjData.endereco && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Endereço
                </h4>
                <p className="text-sm">
                  {[
                    cnpjData.endereco.logradouro,
                    cnpjData.endereco.numero,
                    cnpjData.endereco.bairro,
                    cnpjData.endereco.municipio,
                    cnpjData.endereco.uf,
                    cnpjData.endereco.cep
                  ].filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            {cnpjData.cnae_principal && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Atividade Principal</h4>
                <p className="text-sm">{cnpjData.cnae_principal}</p>
              </div>
            )}

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground text-center">
                ✅ Dados aplicados automaticamente ao formulário
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { CnpjSearch };
export default CnpjSearch;