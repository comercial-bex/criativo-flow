import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Database, Plug, Network, Layout, Box } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface CircuitLegendProps {
  stats: {
    database: number;
    api: number;
    integration: number;
    module: number;
    modal: number;
  };
  filters: {
    database: boolean;
    api: boolean;
    integration: boolean;
    module: boolean;
    modal: boolean;
  };
  onFilterChange: (group: string, enabled: boolean) => void;
  simplifiedMode: boolean;
  onModeChange: (simplified: boolean) => void;
}

export function CircuitLegend({
  stats,
  filters,
  onFilterChange,
  simplifiedMode,
  onModeChange,
}: CircuitLegendProps) {
  const groups = [
    { key: 'database', label: 'Banco de Dados', icon: Database, color: 'text-blue-500' },
    { key: 'api', label: 'APIs', icon: Plug, color: 'text-purple-500' },
    { key: 'integration', label: 'Integrações', icon: Network, color: 'text-green-500' },
    { key: 'module', label: 'Módulos', icon: Layout, color: 'text-orange-500' },
    { key: 'modal', label: 'Modais', icon: Box, color: 'text-pink-500' },
  ];

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Painel de Controle</h3>
        <div className="flex items-center gap-2">
          <Label htmlFor="mode" className="text-xs text-muted-foreground">
            Simplificado
          </Label>
          <Switch
            id="mode"
            checked={simplifiedMode}
            onCheckedChange={onModeChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground mb-2">Filtrar por Grupo:</p>
        <div className="grid grid-cols-2 gap-2">
          {groups.map((group) => {
            const Icon = group.icon;
            const count = stats[group.key as keyof typeof stats] || 0;
            
            return (
              <div
                key={group.key}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={group.key}
                  checked={filters[group.key as keyof typeof filters]}
                  onCheckedChange={(checked) =>
                    onFilterChange(group.key, checked as boolean)
                  }
                />
                <label
                  htmlFor={group.key}
                  className="flex items-center gap-2 flex-1 cursor-pointer"
                >
                  <Icon className={`h-4 w-4 ${group.color}`} />
                  <span className="text-xs flex-1">{group.label}</span>
                  <Badge variant="secondary" className="text-xs h-5 px-1.5">
                    {count}
                  </Badge>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-border/50 space-y-2">
        <p className="text-xs font-medium text-muted-foreground mb-2">Status das Conexões:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span>Conectado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span>Degradado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span>Desconectado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-muted" />
            <span>Pausado</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
