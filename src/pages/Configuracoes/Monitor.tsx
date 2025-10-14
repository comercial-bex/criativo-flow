import { useEffect } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonitorGrid } from '@/components/Monitor/MonitorGrid';
import { MonitorAudit } from '@/components/Monitor/MonitorAudit';
import { MonitorChat } from '@/components/Monitor/MonitorChat';
import { MonitorNetworkMap } from '@/components/Monitor/MonitorNetworkMap';
import { BarChart3, Grid3X3, Network } from 'lucide-react';

const Monitor = () => {
  useEffect(() => {
    document.title = 'Monitor de Conexões | BEX';
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SectionHeader
        title="Monitor de Conexões"
        description="Status em tempo real de módulos, APIs e integrações do BEX 3.0"
      />

      <Tabs defaultValue="grid" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="grid" className="gap-2">
            <Grid3X3 className="h-4 w-4" />
            Grade de Status
          </TabsTrigger>
          <TabsTrigger value="map" className="gap-2">
            <Network className="h-4 w-4" />
            Mapa de Rede
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Auditoria & Diagnóstico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <MonitorGrid />
        </TabsContent>

        <TabsContent value="map">
          <MonitorNetworkMap />
        </TabsContent>

        <TabsContent value="audit">
          <MonitorAudit />
        </TabsContent>
      </Tabs>

      {/* Chat fixo no canto */}
      <MonitorChat />
    </div>
  );
};

export default Monitor;
