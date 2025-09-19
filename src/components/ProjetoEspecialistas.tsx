import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Users, Plus, X, Crown } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProjetoEspecialista = Database['public']['Tables']['projeto_especialistas']['Row'];

interface ProjetoEspecialistasProps {
  projetoId: string;
}

const especialidadeLabels: Record<string, string> = {
  'videomaker': 'Videomaker',
  'filmmaker': 'Filmmaker', 
  'design': 'Designer',
  'copywriter': 'Copywriter',
  'gerente_redes_sociais': 'Gerente de Redes Sociais'
};

export function ProjetoEspecialistas({ projetoId }: ProjetoEspecialistasProps) {
  const [loading, setLoading] = useState(false);
  const [especialistas, setEspecialistas] = useState<Profile[]>([]);
  const [projetoEspecialistas, setProjetoEspecialistas] = useState<any[]>([]);
  const [selectedEspecialista, setSelectedEspecialista] = useState('');
  const [selectedEspecialidade, setSelectedEspecialidade] = useState('');

  useEffect(() => {
    if (projetoId) {
      fetchEspecialistas();
      fetchProjetoEspecialistas();
    }
  }, [projetoId]);

  const fetchEspecialistas = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('especialidade', 'is', null);

      if (error) throw error;
      setEspecialistas(data || []);
    } catch (error) {
      console.error('Erro ao buscar especialistas:', error);
    }
  };

  const fetchProjetoEspecialistas = async () => {
    try {
      const { data, error } = await supabase
        .from('projeto_especialistas')
        .select(`
          *,
          profiles(*)
        `)
        .eq('projeto_id', projetoId);

      if (error) throw error;
      
      const formattedData = data?.map(item => ({
        ...item,
        profile: item.profiles
      })) || [];
      
      setProjetoEspecialistas(formattedData);
    } catch (error) {
      console.error('Erro ao buscar especialistas do projeto:', error);
    }
  };

  const adicionarEspecialista = async () => {
    if (!selectedEspecialista || !selectedEspecialidade) {
      toast.error('Selecione um especialista e sua especialidade');
      return;
    }

    try {
      setLoading(true);

      // Verificar se já existe um especialista para esta especialidade
      const existeEspecialista = projetoEspecialistas.find(
        pe => pe.especialidade === selectedEspecialidade
      );

      if (existeEspecialista) {
        toast.error('Já existe um especialista para esta especialidade neste projeto');
        return;
      }

      const { error } = await supabase
        .from('projeto_especialistas')
        .insert({
          projeto_id: projetoId,
          especialista_id: selectedEspecialista,
          especialidade: selectedEspecialidade as any
        });

      if (error) throw error;

      toast.success('Especialista adicionado ao projeto');
      setSelectedEspecialista('');
      setSelectedEspecialidade('');
      fetchProjetoEspecialistas();
    } catch (error: any) {
      console.error('Erro ao adicionar especialista:', error);
      toast.error(error.message || 'Erro ao adicionar especialista');
    } finally {
      setLoading(false);
    }
  };

  const removerEspecialista = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projeto_especialistas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Especialista removido do projeto');
      fetchProjetoEspecialistas();
    } catch (error: any) {
      console.error('Erro ao remover especialista:', error);
      toast.error(error.message || 'Erro ao remover especialista');
    }
  };

  const toggleGerente = async (id: string, isGerente: boolean) => {
    try {
      // Se está marcando como gerente, desmarcar outros gerentes
      if (!isGerente) {
        await supabase
          .from('projeto_especialistas')
          .update({ is_gerente: false })
          .eq('projeto_id', projetoId);
      }

      const { error } = await supabase
        .from('projeto_especialistas')
        .update({ is_gerente: !isGerente })
        .eq('id', id);

      if (error) throw error;

      toast.success(isGerente ? 'Gerência removida' : 'Gerente definido');
      fetchProjetoEspecialistas();
    } catch (error: any) {
      console.error('Erro ao alterar gerente:', error);
      toast.error(error.message || 'Erro ao alterar gerente');
    }
  };

  const especialistasDisponiveis = especialistas.filter(
    esp => !projetoEspecialistas.some(pe => pe.especialista_id === esp.id)
  );

  const especialidadesDisponiveis = [
    'videomaker', 'filmmaker', 'design', 'copywriter', 'gerente_redes_sociais'
  ].filter(esp => !projetoEspecialistas.some(pe => pe.especialidade === esp));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Equipe do Projeto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Adicionar Especialista */}
        <div className="flex gap-2">
          <Select value={selectedEspecialista} onValueChange={setSelectedEspecialista}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione um especialista" />
            </SelectTrigger>
            <SelectContent>
              {especialistasDisponiveis.map((especialista) => (
                <SelectItem key={especialista.id} value={especialista.id}>
                  <div className="flex items-center gap-2">
                    <span>{especialista.nome}</span>
                    {especialista.especialidade && (
                      <Badge variant="secondary" className="text-xs">
                        {especialidadeLabels[especialista.especialidade]}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedEspecialidade} onValueChange={setSelectedEspecialidade}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Especialidade no projeto" />
            </SelectTrigger>
            <SelectContent>
              {especialidadesDisponiveis.map((especialidade) => (
                <SelectItem key={especialidade} value={especialidade}>
                  {especialidadeLabels[especialidade]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={adicionarEspecialista} 
            disabled={loading || !selectedEspecialista || !selectedEspecialidade}
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Lista de Especialistas do Projeto */}
        <div className="space-y-2">
          {projetoEspecialistas.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhum especialista atribuído ao projeto
            </p>
          ) : (
            projetoEspecialistas.map((pe) => (
              <div key={pe.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={pe.profile.avatar_url || undefined} />
                    <AvatarFallback>
                      {pe.profile.nome.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{pe.profile.nome}</span>
                      {pe.is_gerente && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {especialidadeLabels[pe.especialidade]}
                      </Badge>
                      {pe.is_gerente && (
                        <Badge variant="default">Gerente</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={pe.is_gerente ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleGerente(pe.id, pe.is_gerente)}
                  >
                    {pe.is_gerente ? 'Gerente' : 'Definir como Gerente'}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removerEspecialista(pe.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}