import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Search, Building2, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { useCnpjLookup, type CnpjData } from '@/hooks/useCnpjLookup';
import { useDebounce } from '@/hooks/use-debounce';

interface CnpjSearchProps {
  onCnpjData: (data: CnpjData) => void;
  initialValue?: string;
}

export function CnpjSearch({ onCnpjData, initialValue = '' }: CnpjSearchProps) {
  const [cnpj, setCnpj] = useState(initialValue);
  const [cnpjData, setCnpjData] = useState<CnpjData | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  const { loading, lookupCnpj, validateCnpj, formatCnpj } = useCnpjLookup();
  const debouncedCnpj = useDebounce(cnpj, 800);

  // Auto-busca quando CNPJ é válido e tem 14 dígitos
  React.useEffect(() => {
    const cleanCnpj = debouncedCnpj.replace(/\D/g, '');
    if (cleanCnpj.length === 14 && validateCnpj(cleanCnpj)) {
      handleSearch();
    }
  }, [debouncedCnpj]);

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length <= 14) {
      setCnpj(formatCnpj(cleanValue));
    }
  };

  const handleSearch = async () => {
    const result = await lookupCnpj(cnpj);
    
    if (result.success && result.data) {
      setCnpjData(result.data);
      setShowResults(true);
    } else {
      setCnpjData(null);
      setShowResults(false);
    }
  };

  const handleApplyData = () => {
    if (cnpjData) {
      onCnpjData(cnpjData);
      setShowResults(false);
    }
  };

  const getSituacaoColor = (situacao?: string) => {
    if (!situacao) return 'secondary';
    const situacaoLower = situacao.toLowerCase();
    if (situacaoLower.includes('ativa')) return 'default';
    if (situacaoLower.includes('suspensa')) return 'destructive';
    if (situacaoLower.includes('inapta')) return 'destructive';
    return 'secondary';
  };

  const getSituacaoIcon = (situacao?: string) => {
    if (!situacao) return <AlertCircle className="h-4 w-4" />;
    const situacaoLower = situacao.toLowerCase();
    if (situacaoLower.includes('ativa')) return <CheckCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="00.000.000/0000-00"
            value={cnpj}
            onChange={handleCnpjChange}
            className="font-mono"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading || !validateCnpj(cnpj)}
          variant="outline"
          size="icon"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {showResults && cnpjData && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dados da Empresa
              </CardTitle>
              <Badge variant={getSituacaoColor(cnpjData.situacao_cadastral)} className="flex items-center gap-1">
                {getSituacaoIcon(cnpjData.situacao_cadastral)}
                {cnpjData.situacao_cadastral || 'Status não informado'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">CNPJ</label>
                <p className="font-mono font-medium">{formatCnpj(cnpjData.cnpj)}</p>
              </div>
              
              {cnpjData.razao_social && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Razão Social</label>
                  <p className="font-medium">{cnpjData.razao_social}</p>
                </div>
              )}
              
              {cnpjData.nome_fantasia && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome Fantasia</label>
                  <p className="font-medium">{cnpjData.nome_fantasia}</p>
                </div>
              )}
              
              {cnpjData.cnae_principal && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">CNAE Principal</label>
                  <p className="text-sm">{cnpjData.cnae_principal}</p>
                </div>
              )}
            </div>

            {cnpjData.endereco && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    {cnpjData.endereco.logradouro && (
                      <div>
                        <span className="text-muted-foreground">Logradouro: </span>
                        <span>{cnpjData.endereco.logradouro}</span>
                        {cnpjData.endereco.numero && `, ${cnpjData.endereco.numero}`}
                      </div>
                    )}
                    
                    {cnpjData.endereco.bairro && (
                      <div>
                        <span className="text-muted-foreground">Bairro: </span>
                        <span>{cnpjData.endereco.bairro}</span>
                      </div>
                    )}
                    
                    {cnpjData.endereco.municipio && (
                      <div>
                        <span className="text-muted-foreground">Cidade: </span>
                        <span>{cnpjData.endereco.municipio}/{cnpjData.endereco.uf}</span>
                      </div>
                    )}
                    
                    {cnpjData.endereco.cep && (
                      <div>
                        <span className="text-muted-foreground">CEP: </span>
                        <span>{cnpjData.endereco.cep}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />
            
            <div className="flex justify-end">
              <Button onClick={handleApplyData} className="w-full md:w-auto">
                Aplicar Dados no Formulário
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}