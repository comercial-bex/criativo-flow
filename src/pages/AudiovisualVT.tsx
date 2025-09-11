import { useState } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Plus, 
  Search, 
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AudiovisualVT = () => {
  const { toast } = useToast();

  // Projetos audiovisuais baseados no Figma
  const projetos = [
    {
      id: '1',
      titulo: 'IV Semana Amapá África Amazônica',
      cliente: 'Rede Amazônica',
      status: 'Em Andamento',
      prazo: '20 de Maio, 2025',
      tipo: 'Aplicativo Projeto'
    },
    {
      id: '2',
      titulo: 'VideoClip Dos Guerreiros Wayana',
      cliente: 'Guerreiros Wayana',
      status: 'Finalizado',
      prazo: '20 de Maio, 2025',
      tipo: 'VideoClip'
    },
    {
      id: '3',
      titulo: 'VT Cartelado De 15 Segundos',
      cliente: 'Igreja Casa da Construção',
      status: 'Finalizado',
      prazo: '20 de Maio, 2025',
      tipo: 'VT'
    },
    {
      id: '4',
      titulo: 'VT Cartelado De 15 Segundos',
      cliente: 'Igreja Casa da Construção',
      status: 'Finalizado',
      prazo: '20 de Maio, 2025',
      tipo: 'VT'
    },
    {
      id: '5',
      titulo: 'IV Semana Amapá África Amazônica',
      cliente: 'Rede Amazônica',
      status: 'Finalizado',
      prazo: '20 de Maio, 2025',
      tipo: 'Aplicativo Projeto'
    },
    {
      id: '6',
      titulo: 'VideoClip Dos Guerreiros Wayana',
      cliente: 'Guerreiros Wayana',
      status: 'Finalizado',
      prazo: '20 de Maio, 2025',
      tipo: 'VideoClip'
    },
    {
      id: '7',
      titulo: 'VT Cartelado De 15 Segundos',
      cliente: 'Igreja Casa da Construção',
      status: 'Finalizado',
      prazo: '20 de Maio, 2025',
      tipo: 'VT'
    },
    {
      id: '8',
      titulo: 'VT Cartelado De 15 Segundos',
      cliente: 'Igreja Casa da Construção',
      status: 'Finalizado',
      prazo: '20 de Maio, 2025',
      tipo: 'VT'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Andamento': return 'bg-yellow-100 text-yellow-800';
      case 'Finalizado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-8">
      <SectionHeader
        title="Audiovisual/VT"
        description="Veja abaixo todos os projetos que estão sendo realizados neste momento."
        icon={Video}
        action={{
          label: "Novo Atendimento",
          onClick: () => toast({ title: "Em desenvolvimento" }),
          icon: Plus
        }}
      />

      {/* Grid de Projetos - baseado no Figma */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {projetos.map((projeto) => (
          <Card key={projeto.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
            {/* Header colorido com arte do projeto */}
            <div className="h-32 bg-gradient-to-br from-red-500 via-yellow-500 to-green-500 relative">
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="text-white text-center p-4">
                  <h3 className="font-bold text-lg leading-tight">
                    IV SEMANA AMAPÁ ÁFRICA AMAZÔNICA 2025
                  </h3>
                </div>
              </div>
            </div>
            
            <CardContent className="p-4 space-y-3">
              <div>
                <h4 className="font-semibold text-sm">{projeto.titulo}</h4>
                <p className="text-xs text-muted-foreground">Cliente: <strong>{projeto.cliente}</strong></p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status do Projeto:</span>
                  <Badge className={getStatusColor(projeto.status)}>
                    {projeto.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Prazo de entrega:</span>
                  <span className="font-medium">{projeto.prazo}</span>
                </div>
              </div>

              <Button 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="sm"
                onClick={() => toast({ title: "Acessando projeto..." })}
              >
                Acessar Projeto
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AudiovisualVT;