import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Circle, Link2, ChevronDown } from 'lucide-react';
import { ItemChecklist } from '@/hooks/useHomologacao';

interface ChecklistModuloProps {
  itens: ItemChecklist[];
  onToggleStatus: (id: string, status: 'passou' | 'falhou') => void;
  onAnexarEvidencia: (id: string, url: string) => void;
}

export function ChecklistModulo({ itens, onToggleStatus, onAnexarEvidencia }: ChecklistModuloProps) {
  const [filtroModulo, setFiltroModulo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [evidenciaAberta, setEvidenciaAberta] = useState<string | null>(null);
  const [urlEvidencia, setUrlEvidencia] = useState('');

  const modulos = ['todos', ...Array.from(new Set(itens.map(i => i.modulo)))];

  const itensFiltrados = itens.filter(item => {
    if (filtroModulo !== 'todos' && item.modulo !== filtroModulo) return false;
    if (filtroStatus !== 'todos' && item.status !== filtroStatus) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passou': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'falhou': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getImpactoBadge = (impacto: string) => {
    const colors = {
      alto: 'bg-red-500/10 text-red-600',
      medio: 'bg-yellow-500/10 text-yellow-600',
      baixo: 'bg-blue-500/10 text-blue-600'
    };
    return <Badge className={colors[impacto as keyof typeof colors]}>{impacto}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-3">
        <Select value={filtroModulo} onValueChange={setFiltroModulo}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar módulo" />
          </SelectTrigger>
          <SelectContent>
            {modulos.map(mod => (
              <SelectItem key={mod} value={mod}>
                {mod === 'todos' ? 'Todos os módulos' : mod}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="passou">Passou</SelectItem>
            <SelectItem value="falhou">Falhou</SelectItem>
            <SelectItem value="nao_testado">Não testado</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1 text-sm text-muted-foreground flex items-center justify-end">
          {itensFiltrados.length} de {itens.length} itens
        </div>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Módulo</TableHead>
              <TableHead>Item de Verificação</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Impacto</TableHead>
              <TableHead className="w-[100px]">Prioridade</TableHead>
              <TableHead className="w-[100px]">Esforço</TableHead>
              <TableHead className="w-[200px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itensFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhum item encontrado
                </TableCell>
              </TableRow>
            ) : (
              itensFiltrados.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.modulo}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.item}</div>
                      {item.solucao_sugerida && (
                        <div className="text-xs text-muted-foreground mt-1">
                          💡 {item.solucao_sugerida}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusIcon(item.status)}</TableCell>
                  <TableCell>{getImpactoBadge(item.impacto)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.prioridade}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.esforco}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={item.status === 'passou' ? 'default' : 'outline'}
                        onClick={() => onToggleStatus(item.id, 'passou')}
                      >
                        ✓
                      </Button>
                      <Button
                        size="sm"
                        variant={item.status === 'falhou' ? 'destructive' : 'outline'}
                        onClick={() => onToggleStatus(item.id, 'falhou')}
                      >
                        ✗
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEvidenciaAberta(evidenciaAberta === item.id ? null : item.id)}
                      >
                        <Link2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {evidenciaAberta === item.id && (
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="URL ou ID"
                          value={urlEvidencia}
                          onChange={(e) => setUrlEvidencia(e.target.value)}
                          className="text-xs"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            onAnexarEvidencia(item.id, urlEvidencia);
                            setUrlEvidencia('');
                            setEvidenciaAberta(null);
                          }}
                        >
                          OK
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
