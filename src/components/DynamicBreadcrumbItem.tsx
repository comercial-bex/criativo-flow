import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useClienteResolver,
  useProjetoResolver,
  useRoteiroResolver,
  useContratoResolver,
  useProdutoResolver,
  useOrcamentoResolver,
  usePropostaResolver,
  useColaboradorResolver,
  useTarefaResolver,
  usePlanejamentoResolver,
} from "@/hooks/useBreadcrumbResolvers";
import { Loader2 } from "lucide-react";

interface DynamicBreadcrumbItemProps {
  resourceType?: string;
  resourceId?: string;
  path: string;
  isLast: boolean;
  icon?: LucideIcon;
  fallbackLabel: string;
}

export function DynamicBreadcrumbItem({
  resourceType,
  resourceId,
  path,
  isLast,
  icon: Icon,
  fallbackLabel,
}: DynamicBreadcrumbItemProps) {
  // Selecionar o resolver apropriado baseado no tipo de recurso
  const clienteData = useClienteResolver(resourceType === "cliente" ? resourceId : undefined);
  const projetoData = useProjetoResolver(resourceType === "projeto" ? resourceId : undefined);
  const roteiroData = useRoteiroResolver(resourceType === "roteiro" ? resourceId : undefined);
  const contratoData = useContratoResolver(resourceType === "contrato" ? resourceId : undefined);
  const produtoData = useProdutoResolver(resourceType === "produto" ? resourceId : undefined);
  const orcamentoData = useOrcamentoResolver(resourceType === "orcamento" ? resourceId : undefined);
  const propostaData = usePropostaResolver(resourceType === "proposta" ? resourceId : undefined);
  const colaboradorData = useColaboradorResolver(resourceType === "colaborador" ? resourceId : undefined);
  const tarefaData = useTarefaResolver(resourceType === "tarefa" ? resourceId : undefined);
  const planejamentoData = usePlanejamentoResolver(resourceType === "planejamento" ? resourceId : undefined);

  // Determinar qual resolver usar
  let resolverData = { label: fallbackLabel, isLoading: false };
  
  switch (resourceType) {
    case "cliente":
      resolverData = clienteData;
      break;
    case "projeto":
      resolverData = projetoData;
      break;
    case "roteiro":
      resolverData = roteiroData;
      break;
    case "contrato":
      resolverData = contratoData;
      break;
    case "produto":
      resolverData = produtoData;
      break;
    case "orcamento":
      resolverData = orcamentoData;
      break;
    case "proposta":
      resolverData = propostaData;
      break;
    case "colaborador":
      resolverData = colaboradorData;
      break;
    case "tarefa":
      resolverData = tarefaData;
      break;
    case "planejamento":
      resolverData = planejamentoData;
      break;
  }

  const label = resolverData.label;
  const isLoading = resolverData.isLoading;

  // Renderizar skeleton enquanto carrega
  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1">
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground text-sm">...</span>
      </div>
    );
  }

  if (isLast) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-bex/10 text-bex font-medium">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span>{label}</span>
      </div>
    );
  }

  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md",
        "text-muted-foreground hover:text-bex hover:bg-bex/10",
        "transition-all duration-200"
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span>{label}</span>
    </Link>
  );
}
