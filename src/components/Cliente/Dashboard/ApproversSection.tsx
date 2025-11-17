import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useClientApprovals } from "@/hooks/useClientApprovals";
import { useApprovalNavigation } from "@/hooks/useApprovalNavigation";
import { CheckCircle, LayoutGrid, List } from "lucide-react";
import { toast } from '@/lib/toast-compat';
import { JobApprovalCard } from "./JobApprovalCard";
import { ApprovalPreview } from "./ApprovalPreview";

interface ApproversSectionProps {
  clienteId: string;
}

export function ApproversSection({ clienteId }: ApproversSectionProps) {
  const { approvals, updateApprovalStatus } = useClientApprovals(clienteId);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [filter, setFilter] = useState<'pendente' | 'aprovado' | 'reprovado'>('pendente');

  const pendentes = approvals.filter(a => a.status === 'pendente');
  const aprovados = approvals.filter(a => a.status === 'aprovado');
  const reprovados = approvals.filter(a => a.status === 'reprovado');

  const filteredApprovals = filter === 'pendente' ? pendentes : filter === 'aprovado' ? aprovados : reprovados;

  const navigation = useApprovalNavigation(filteredApprovals);

  const handleApprove = async () => {
    if (!navigation.currentApproval) return;
    const result = await updateApprovalStatus(navigation.currentApproval.id, 'aprovado');
    if (result.success) {
      toast.success('Item aprovado com sucesso!');
      if (navigation.hasNext) {
        navigation.nextApproval();
      }
    } else {
      toast.error("Erro ao processar aprovação");
    }
  };

  const handleReject = async (motivo: string) => {
    if (!navigation.currentApproval) return;
    const result = await updateApprovalStatus(navigation.currentApproval.id, 'reprovado', motivo);
    if (result.success) {
      toast.success('Item reprovado com sucesso!');
      if (navigation.hasNext) {
        navigation.nextApproval();
      }
    } else {
      toast.error("Erro ao processar aprovação");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border">
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={filter === 'pendente' ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2"
            onClick={() => setFilter('pendente')}
          >
            Pendentes ({pendentes.length})
          </Badge>
          <Badge 
            variant={filter === 'aprovado' ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2"
            onClick={() => setFilter('aprovado')}
          >
            Aprovados ({aprovados.length})
          </Badge>
          <Badge 
            variant={filter === 'reprovado' ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2"
            onClick={() => setFilter('reprovado')}
          >
            Reprovados ({reprovados.length})
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'card' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('card')}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            Card
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="mr-2 h-4 w-4" />
            Lista
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      {filteredApprovals.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-semibold">
                {filter === 'pendente' ? 'Tudo em dia!' : `Nenhum item ${filter}`}
              </p>
              <p className="text-sm">
                {filter === 'pendente' 
                  ? 'Não há itens pendentes de aprovação' 
                  : `Não há itens ${filter}s no momento`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'card' ? (
        navigation.currentApproval && (
          <JobApprovalCard
            approval={navigation.currentApproval}
            currentIndex={navigation.currentIndex}
            total={navigation.total}
            onNext={navigation.nextApproval}
            onPrevious={navigation.previousApproval}
            onApprove={handleApprove}
            onReject={handleReject}
            hasNext={navigation.hasNext}
            hasPrevious={navigation.hasPrevious}
          />
        )
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map((approval, index) => (
            <ApprovalPreview
              key={approval.id}
              approval={approval as any}
              onApprove={async () => {
                navigation.goToApproval(index);
                await handleApprove();
              }}
              onReject={async (motivo) => {
                navigation.goToApproval(index);
                await handleReject(motivo);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
