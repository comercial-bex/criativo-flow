import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Users, Star, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Especialista {
  id: string;
  nome: string;
  email: string;
  especialidade: string;
}

interface EspecialistasSelectorProps {
  value: {
    grs_id: string | null;
    designer_id: string | null;
    filmmaker_id: string | null;
    gerente_id: string | null;
  };
  onChange: (value: {
    grs_id: string | null;
    designer_id: string | null;
    filmmaker_id: string | null;
    gerente_id: string | null;
  }) => void;
}

export function EspecialistasSelector({ value, onChange }: EspecialistasSelectorProps) {
  const { toast } = useToast();
  const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEspecialistas();
  }, []);

  const fetchEspecialistas = async () => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome, email, telefones, papeis, profile_id')
        .not('profile_id', 'is', null)
        .eq('status', 'aprovado')
        .order('nome');

      if (error) throw error;
      
      // Normalizar especialidades com base nos papeis
      const normalized = (data || []).map(pessoa => {
        const especialidade = pessoa.papeis?.includes('grs') ? 'grs' :
                            pessoa.papeis?.includes('design') ? 'designer' :
                            pessoa.papeis?.includes('audiovisual') ? 'filmmaker' :
                            'especialista';
        
        return {
          id: pessoa.profile_id || pessoa.id,
          nome: pessoa.nome,
          email: pessoa.email || '',
          especialidade
        };
      });
      
      setEspecialistas(normalized);
    } catch (error) {
      console.error('Erro ao carregar especialistas:', error);
      toast({
        title: "Erro ao carregar especialistas",
        description: "Não foi possível carregar a lista de especialistas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEspecialistasByType = (tipo: string) => {
    return especialistas.filter(e => e.especialidade === tipo);
  };

  const getEspecialistaById = (id: string | null) => {
    if (!id) return null;
    return especialistas.find(e => e.id === id);
  };

  const handleSelectChange = (tipo: 'grs' | 'designer' | 'filmmaker', especialistaId: string) => {
    const newValue = { ...value };
    
    if (tipo === 'grs') newValue.grs_id = especialistaId || null;
    if (tipo === 'designer') newValue.designer_id = especialistaId || null;
    if (tipo === 'filmmaker') newValue.filmmaker_id = especialistaId || null;
    
    // Se o especialista removido era o gerente, resetar gerente
    if (!especialistaId && value.gerente_id) {
      if (
        (tipo === 'grs' && value.gerente_id === value.grs_id) ||
        (tipo === 'designer' && value.gerente_id === value.designer_id) ||
        (tipo === 'filmmaker' && value.gerente_id === value.filmmaker_id)
      ) {
        newValue.gerente_id = null;
      }
    }
    
    onChange(newValue);
  };

  const handleGerenteChange = (especialistaId: string, isGerente: boolean) => {
    onChange({
      ...value,
      gerente_id: isGerente ? especialistaId : null
    });
  };

  const selectedEspecialistas = [
    { id: value.grs_id, tipo: 'GRS' },
    { id: value.designer_id, tipo: 'Designer' },
    { id: value.filmmaker_id, tipo: 'Filmmaker' }
  ].filter(e => e.id);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Carregando especialistas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Equipe do Projeto</h3>
      </div>

      <div className="grid gap-4">
        {/* GRS - Obrigatório */}
        <div className="space-y-2">
          <Label htmlFor="grs" className="flex items-center gap-1">
            GRS (Gestão de Redes Sociais) <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={value.grs_id || ""} 
            onValueChange={(val) => handleSelectChange('grs', val)}
          >
            <SelectTrigger id="grs">
              <SelectValue placeholder="Selecione o GRS responsável" />
            </SelectTrigger>
            <SelectContent>
              {getEspecialistasByType('grs').map((esp) => (
                <SelectItem key={esp.id} value={esp.id}>
                  {esp.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Designer - Opcional */}
        <div className="space-y-2">
          <Label htmlFor="designer">Designer (Opcional)</Label>
          <Select 
            value={value.designer_id || ""} 
            onValueChange={(val) => handleSelectChange('designer', val)}
          >
            <SelectTrigger id="designer">
              <SelectValue placeholder="Nenhum selecionado" />
            </SelectTrigger>
            <SelectContent>
              {getEspecialistasByType('designer').map((esp) => (
                <SelectItem key={esp.id} value={esp.id}>
                  {esp.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filmmaker - Opcional */}
        <div className="space-y-2">
          <Label htmlFor="filmmaker">Filmmaker/Videomaker (Opcional)</Label>
          <Select 
            value={value.filmmaker_id || ""} 
            onValueChange={(val) => handleSelectChange('filmmaker', val)}
          >
            <SelectTrigger id="filmmaker">
              <SelectValue placeholder="Nenhum selecionado" />
            </SelectTrigger>
            <SelectContent>
              {getEspecialistasByType('filmmaker').map((esp) => (
                <SelectItem key={esp.id} value={esp.id}>
                  {esp.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview dos Especialistas Selecionados */}
      {selectedEspecialistas.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Equipe Selecionada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedEspecialistas.map(({ id, tipo }) => {
              const especialista = getEspecialistaById(id);
              if (!especialista) return null;

              const isGerente = value.gerente_id === id;

              return (
                <div key={id} className="flex items-center justify-between p-2 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {especialista.nome.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{especialista.nome}</p>
                      <p className="text-xs text-muted-foreground">{tipo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`gerente-${id}`}
                        checked={isGerente}
                        onCheckedChange={(checked) => handleGerenteChange(id, checked)}
                      />
                      <Label 
                        htmlFor={`gerente-${id}`}
                        className="text-xs cursor-pointer flex items-center gap-1"
                      >
                        <Star className={`h-3 w-3 ${isGerente ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                        Gerente
                      </Label>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {selectedEspecialistas.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum especialista selecionado ainda
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Selecione pelo menos um GRS para continuar
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
