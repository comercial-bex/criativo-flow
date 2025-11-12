import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/lib/toast-compat';
import { Users, Plus, X, Crown } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Profile = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  avatar_url: string | null;
  especialidade: string | null;
  cliente_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};
type ProjetoEspecialista = Database['public']['Tables']['projeto_especialistas']['Row'];

interface ProjetoEspecialistasProps {
  projetoId: string;
}

const especialidadeLabels: Record<string, string> = {
  'videomaker': 'Videomaker',
  'filmmaker': 'Filmmaker', 
  'design': 'Designer',
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
      const { data: pessoas, error } = await supabase
        .from('pessoas')
        .select('*')
        .not('profile_id', 'is', null)
        .contains('papeis', ['colaborador']);

      if (error) throw error;
      
      // Mapear pessoas para formato Profile
      const especialistas: Profile[] = (pessoas || []).map(p => ({
        id: p.profile_id!,
        nome: p.nome,
        email: p.email,
        telefone: Array.isArray(p.telefones) ? p.telefones[0] : null,
        avatar_url: null,
        especialidade: p.papeis?.find(papel => papel !== 'colaborador') || null,
        cliente_id: p.cliente_id,
        status: p.status,
        created_at: p.created_at!,
        updated_at: p.updated_at!
      }));
      
      setEspecialistas(especialistas);
    } catch (error) {
      console.error('Erro ao buscar especialistas:', error);
    }
  };

  const fetchProjetoEspecialistas = async () => {
    try {
      const { data, error } = await supabase
        .from('projeto_especialistas')
        .select('*')
        .eq('projeto_id', projetoId);

      if (error) throw error;
      
      // Buscar informações dos especialistas de pessoas
      const formattedData = await Promise.all((data || []).map(async (item) => {
        const { data: pessoa } = await supabase
          .from('pessoas')
          .select('*')
          .eq('profile_id', item.especialista_id)
          .maybeSingle();
        
        return {
          ...item,
          profile: pessoa ? {
            id: pessoa.profile_id!,
            nome: pessoa.nome,
            email: pessoa.email,
            telefone: Array.isArray(pessoa.telefones) ? pessoa.telefones[0] : null,
            avatar_url: null,
            especialidade: pessoa.papeis?.find(p => p !== 'colaborador') || null,
            cliente_id: pessoa.cliente_id,
            status: pessoa.status,
            created_at: pessoa.created_at!,
            updated_at: pessoa.updated_at!
          } : null
        };
      }));
      
      setProjetoEspecialistas(formattedData.filter(item => item.profile));
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
    'videomaker', 'filmmaker', 'design', 'gerente_redes_sociais'
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