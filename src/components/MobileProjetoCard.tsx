import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building, Calendar, DollarSign, Eye, BarChart3 } from "lucide-react";

interface Projeto {
  id: string;
  nome: string;
  status: 'ativo' | 'concluido' | 'pendente' | 'pausado';
  valor: number;
  dataInicio: string;
  dataFim?: string;
  progresso: number;
  tipo: string;
}

interface ClienteComProjetos {
  id: string;
  nome: string;
  email: string;
  status: 'ativo' | 'inativo' | 'prospecto';
  projetos: Projeto[];
  totalProjetos: number;
  statusCounts: {
    ativo: number;
    concluido: number;
    pendente: number;
    pausado: number;
  };
}

interface MobileProjetoCardProps {
  cliente: ClienteComProjetos;
  onViewDetails: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getClienteStatusColor: (status: string) => string;
}

export function MobileProjetoCard({ 
  cliente, 
  onViewDetails,
  getStatusColor,
  getStatusText,
  getClienteStatusColor 
}: MobileProjetoCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const totalValue = cliente.projetos.reduce((sum, projeto) => sum + projeto.valor, 0);

  return (
    <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {cliente.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base text-foreground truncate">
                {cliente.nome}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Building className="h-3 w-3" />
                {cliente.email}
              </p>
            </div>
          </div>
          <Badge className={`${getClienteStatusColor(cliente.status)} text-xs font-medium shrink-0`}>
            {cliente.status === 'ativo' ? 'Ativo' : cliente.status === 'inativo' ? 'Inativo' : 'Prospecto'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Project Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-foreground">{cliente.totalProjetos}</div>
            <div className="text-xs text-muted-foreground">Projetos</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-foreground">{formatCurrency(totalValue)}</div>
            <div className="text-xs text-muted-foreground">Valor Total</div>
          </div>
        </div>

        {/* Status Distribution */}
        {cliente.totalProjetos > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Status dos Projetos</div>
            <div className="flex flex-wrap gap-2">
              {cliente.statusCounts.ativo > 0 && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  {cliente.statusCounts.ativo} Ativo{cliente.statusCounts.ativo > 1 ? 's' : ''}
                </Badge>
              )}
              {cliente.statusCounts.concluido > 0 && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  {cliente.statusCounts.concluido} Concluído{cliente.statusCounts.concluido > 1 ? 's' : ''}
                </Badge>
              )}
              {cliente.statusCounts.pendente > 0 && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                  {cliente.statusCounts.pendente} Pendente{cliente.statusCounts.pendente > 1 ? 's' : ''}
                </Badge>
              )}
              {cliente.statusCounts.pausado > 0 && (
                <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                  {cliente.statusCounts.pausado} Pausado{cliente.statusCounts.pausado > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Recent Projects Preview */}
        {cliente.projetos.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-foreground">Projetos Recentes</div>
            {cliente.projetos.slice(0, 2).map((projeto) => (
              <div key={projeto.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground truncate">{projeto.nome}</h4>
                    <p className="text-xs text-muted-foreground">{projeto.tipo}</p>
                  </div>
                  <Badge className={`${getStatusColor(projeto.status)} text-xs ml-2 shrink-0`}>
                    {getStatusText(projeto.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(projeto.valor)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(projeto.dataInicio)}
                  </span>
                </div>
                
                {projeto.status === 'ativo' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progresso</span>
                      <span>{projeto.progresso}%</span>
                    </div>
                    <Progress value={projeto.progresso} className="h-2" />
                  </div>
                )}
              </div>
            ))}
            
            {cliente.projetos.length > 2 && (
              <div className="text-xs text-muted-foreground text-center">
                +{cliente.projetos.length - 2} projeto{cliente.projetos.length - 2 > 1 ? 's' : ''} adicional{cliente.projetos.length - 2 > 1 ? 'is' : ''}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={onViewDetails}
          className="w-full h-11 text-sm font-medium"
          variant={cliente.totalProjetos > 0 ? "default" : "outline"}
        >
          {cliente.totalProjetos > 0 ? (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4 mr-2" />
              Sem Projetos
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}