import { useEffect, useState } from 'react';
import { BexAvatar, BexAvatarImage, BexAvatarFallback } from '@/components/ui/bex-avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { User, Briefcase, Users } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface TaskParticipantsProps {
  tarefaId: string;
  responsavelId?: string;
  executorId?: string;
  clienteId?: string;
  projetoId?: string;
}

export function TaskParticipants({ 
  tarefaId, 
  responsavelId, 
  executorId, 
  clienteId,
  projetoId 
}: TaskParticipantsProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const loadParticipants = async () => {
      const parts: Participant[] = [];

      // Buscar responsável
      if (responsavelId) {
        const { data } = await supabase
          .from('profiles')
          .select('id, nome, avatar_url')
          .eq('id', responsavelId)
          .single();
        
        if (data) {
          parts.push({
            id: data.id,
            name: data.nome || 'Responsável',
            role: 'Responsável',
            avatar: data.avatar_url,
          });
        }
      }

      // Buscar executor
      if (executorId && executorId !== responsavelId) {
        const { data } = await supabase
          .from('profiles')
          .select('id, nome, avatar_url')
          .eq('id', executorId)
          .single();
        
        if (data) {
          parts.push({
            id: data.id,
            name: data.nome || 'Executor',
            role: 'Executor',
            avatar: data.avatar_url,
          });
        }
      }

      // Buscar gerente do projeto
      if (projetoId) {
        const { data: projeto } = await supabase
          .from('projetos')
          .select(`
            responsavel_id,
            profiles:responsavel_id (
              id,
              nome,
              avatar_url
            )
          `)
          .eq('id', projetoId)
          .single();
        
        if (projeto?.profiles && projeto.responsavel_id !== responsavelId && projeto.responsavel_id !== executorId) {
          const profile = projeto.profiles as any;
          parts.push({
            id: profile.id,
            name: profile.nome || 'Gerente',
            role: 'Gerente do Projeto',
            avatar: profile.avatar_url,
          });
        }
      }

      // Buscar cliente representante
      if (clienteId) {
        const { data: cliente } = await supabase
          .from('clientes')
          .select('nome, logo_url')
          .eq('id', clienteId)
          .single();
        
        if (cliente) {
          parts.push({
            id: clienteId,
            name: cliente.nome || 'Cliente',
            role: 'Cliente',
            avatar: cliente.logo_url,
          });
        }
      }

      setParticipants(parts);
    };

    loadParticipants();
  }, [tarefaId, responsavelId, executorId, clienteId, projetoId]);

  if (participants.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 -space-x-2">
        {participants.map((participant, index) => (
          <Tooltip key={participant.id}>
            <TooltipTrigger asChild>
              <div className="relative inline-block">
                <BexAvatar 
                  withGlow 
                  className="h-8 w-8 border-2 border-background hover:z-10 transition-transform hover:scale-110"
                  style={{ zIndex: participants.length - index }}
                >
                  {participant.avatar ? (
                    <BexAvatarImage src={participant.avatar} alt={participant.name} />
                  ) : (
                    <BexAvatarFallback className="bg-bex/20 text-bex text-xs">
                      {participant.role === 'Cliente' ? (
                        <Users className="h-4 w-4" />
                      ) : participant.role === 'Gerente do Projeto' ? (
                        <Briefcase className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </BexAvatarFallback>
                  )}
                </BexAvatar>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-popover border border-bex/30">
              <div className="text-xs">
                <p className="font-semibold text-bex">{participant.name}</p>
                <p className="text-muted-foreground">{participant.role}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
