// BEX 3.0 - Dropdown Unificado de Criação de Tarefas
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Plus } from 'lucide-react';
import { StandardTaskModal } from '@/components/StandardTaskModal';
import { Tarefa, TipoTarefa } from '@/types/tarefa';

interface CreateTaskDropdownProps {
  projetoId: string;
  onTaskCreated?: () => void;
}

export function CreateTaskDropdown({ projetoId, onTaskCreated }: CreateTaskDropdownProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TipoTarefa | null>(null);

  const taskTypes = [
    { tipo: 'roteiro_reels' as TipoTarefa, icon: '🎬', label: 'Roteiro Reels', category: 'Audiovisual' },
    { tipo: 'reels_instagram' as TipoTarefa, icon: '📱', label: 'Reels Instagram', category: 'Audiovisual' },
    { tipo: 'criativo_vt' as TipoTarefa, icon: '🎥', label: 'VT (Vídeo)', category: 'Audiovisual' },
    { tipo: 'criativo_card' as TipoTarefa, icon: '🎨', label: 'Card', category: 'Design' },
    { tipo: 'criativo_carrossel' as TipoTarefa, icon: '📸', label: 'Carrossel', category: 'Design' },
    { tipo: 'criativo_cartela' as TipoTarefa, icon: '🖼️', label: 'Cartela', category: 'Design' },
    { tipo: 'feed_post' as TipoTarefa, icon: '📷', label: 'Post Feed', category: 'Design' },
    { tipo: 'stories_interativo' as TipoTarefa, icon: '📲', label: 'Stories Interativo', category: 'Design' },
    { tipo: 'planejamento_estrategico' as TipoTarefa, icon: '📊', label: 'Planejamento', category: 'Estratégia' },
    { tipo: 'datas_comemorativas' as TipoTarefa, icon: '🎉', label: 'Datas Comemorativas', category: 'Marketing' },
    { tipo: 'trafego_pago' as TipoTarefa, icon: '💰', label: 'Tráfego Pago', category: 'Marketing' },
    { tipo: 'contrato' as TipoTarefa, icon: '📄', label: 'Contrato', category: 'Administrativo' }
  ];

  const categories = [...new Set(taskTypes.map(t => t.category))];

  const handleSelect = (tipo: TipoTarefa) => {
    setSelectedType(tipo);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedType(null);
    onTaskCreated?.();
  };

  const emptyTask: Tarefa = {
    id: '',
    tipo: selectedType || 'roteiro_reels',
    titulo: '',
    status: 'backlog',
    prioridade: 'media',
    projeto_id: projetoId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {categories.map(category => (
            <div key={category}>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {category}
              </DropdownMenuLabel>
              {taskTypes
                .filter(t => t.category === category)
                .map(({ tipo, icon, label }) => (
                  <DropdownMenuItem
                    key={tipo}
                    onClick={() => handleSelect(tipo)}
                    className="cursor-pointer"
                  >
                    <span className="mr-2">{icon}</span>
                    {label}
                  </DropdownMenuItem>
                ))}
              <DropdownMenuSeparator />
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {modalOpen && (
        <StandardTaskModal
          isOpen={modalOpen}
          onClose={handleClose}
          task={emptyTask}
        />
      )}
    </>
  );
}
