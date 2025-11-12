import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Code, Database } from 'lucide-react';
import { DependenciaFK } from '@/hooks/useHomologacao';
import { toast } from '@/lib/toast-compat';

interface DependenciasFKProps {
  dependencias: DependenciaFK[];
  onGerarScript: () => void;
}

export function DependenciasFK({ dependencias, onGerarScript }: DependenciasFKProps) {
  const gerarScriptMigracao = (dep: DependenciaFK) => {
    const script = `-- Migração: ${dep.tabela}.${dep.campo_fk}
ALTER TABLE ${dep.tabela} 
  ADD COLUMN funcionario_id UUID REFERENCES funcionarios(id);

-- Migrar dados existentes
UPDATE ${dep.tabela} t
SET funcionario_id = (
  SELECT f.id 
  FROM funcionarios f
  INNER JOIN ${dep.aponta_para} old ON old.cpf_cnpj = f.cpf_cnpj
  WHERE old.id = t.${dep.campo_fk}
);

-- Após validação, remover coluna antiga
-- ALTER TABLE ${dep.tabela} DROP COLUMN ${dep.campo_fk};
-- ALTER TABLE ${dep.tabela} RENAME COLUMN funcionario_id TO ${dep.campo_fk};`;

    navigator.clipboard.writeText(script);
    toast.success('📋 Script copiado para área de transferência');
  };

  const totalRegistros = dependencias.reduce((sum, d) => sum + (d.registros_afetados || 0), 0);
  const pendentes = dependencias.filter(d => d.status === 'pendente').length;

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Mapa de Dependências & Foreign Keys
          </CardTitle>
          <CardDescription>
            {pendentes} tabelas com FKs pendentes | {totalRegistros.toLocaleString()} registros afetados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{pendentes}</Badge>
              <span className="text-muted-foreground">Pendentes de migração</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/10 text-green-600">
                {dependencias.length - pendentes}
              </Badge>
              <span className="text-muted-foreground">Migradas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerta */}
      {pendentes > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-yellow-600">Migração Incremental Recomendada</p>
            <p className="text-muted-foreground mt-1">
              Execute as migrações em horário de baixo uso. Mantenha a view de compatibilidade 
              <code className="mx-1 px-1 py-0.5 bg-muted rounded text-xs">vw_colaboradores_especialistas</code>
              ativa por 1 sprint para validação.
            </p>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tabela</TableHead>
              <TableHead>Campo FK</TableHead>
              <TableHead>Aponta Para</TableHead>
              <TableHead className="text-right">Registros</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[150px]">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dependencias.map((dep, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-mono text-sm">{dep.tabela}</TableCell>
                <TableCell className="font-mono text-sm text-blue-600">{dep.campo_fk}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{dep.aponta_para}</TableCell>
                <TableCell className="text-right font-semibold">
                  {dep.registros_afetados?.toLocaleString() || 0}
                </TableCell>
                <TableCell>
                  {dep.status === 'pendente' ? (
                    <Badge variant="destructive">Pendente</Badge>
                  ) : (
                    <Badge className="bg-green-500/10 text-green-600">Migrado</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {dep.status === 'pendente' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => gerarScriptMigracao(dep)}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Script
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
