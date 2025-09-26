import { useState, useEffect } from "react";
import { Plus, DollarSign, FileText, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { SectionHeader } from "@/components/SectionHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { OrcamentoForm } from "@/components/OrcamentoForm";
import { PropostaModal } from "@/components/PropostaModal";

interface Orcamento {
  id: string;
  titulo: string;
  cliente_nome?: string;
  valor_final: number;
  status: string;
  data_validade: string;
  created_at: string;
}

export default function Administrativo() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  const [showPropostaModal, setShowPropostaModal] = useState(false);
  const { toast } = useToast();

  const fetchOrcamentos = async () => {
    try {
      const { data, error } = await supabase
        .from("orcamentos")
        .select(`
          *,
          clientes(nome)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedData = data?.map((item: any) => ({
        ...item,
        cliente_nome: item.clientes?.nome || "Cliente não informado"
      })) || [];

      setOrcamentos(formattedData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar orçamentos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aprovado": return "bg-green-100 text-green-800";
      case "enviado": return "bg-blue-100 text-blue-800";
      case "rejeitado": return "bg-red-100 text-red-800";
      case "expirado": return "bg-gray-100 text-gray-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const handleGerarProposta = (orcamento: Orcamento) => {
    setSelectedOrcamento(orcamento);
    setShowPropostaModal(true);
  };

  const columns = [
    {
      accessorKey: "titulo",
      header: "Título",
    },
    {
      accessorKey: "cliente_nome",
      header: "Cliente",
    },
    {
      accessorKey: "valor_final",
      header: "Valor",
      cell: ({ row }: any) => 
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(row.getValue("valor_final")),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={getStatusColor(row.getValue("status"))}>
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "data_validade",
      header: "Validade",
      cell: ({ row }: any) => 
        new Date(row.getValue("data_validade")).toLocaleDateString("pt-BR"),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleGerarProposta(row.original)}
          >
            Gerar Proposta
          </Button>
        </div>
      ),
    },
  ];

  // Métricas do dashboard
  const totalOrcamentos = orcamentos.length;
  const orcamentosAprovados = orcamentos.filter(o => o.status === "aprovado").length;
  const valorTotal = orcamentos.reduce((acc, curr) => acc + curr.valor_final, 0);
  const orcamentosPendentes = orcamentos.filter(o => o.status === "enviado").length;

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <SectionHeader 
        title="Módulo Administrativo" 
        description="Gestão de orçamentos e propostas comerciais"
      />

      {/* Cards de métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrcamentos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orcamentosAprovados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(valorTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orcamentosPendentes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de orçamentos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Orçamentos</CardTitle>
              <CardDescription>
                Gerencie todos os orçamentos e propostas
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Orçamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Orçamento</DialogTitle>
                </DialogHeader>
                <OrcamentoForm 
                  onSuccess={() => {
                    setIsDialogOpen(false);
                    fetchOrcamentos();
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable data={orcamentos} columns={columns} />
        </CardContent>
      </Card>

      {/* Modal de proposta */}
      {selectedOrcamento && (
        <PropostaModal
          isOpen={showPropostaModal}
          onClose={() => {
            setShowPropostaModal(false);
            setSelectedOrcamento(null);
          }}
          orcamento={selectedOrcamento}
        />
      )}
    </div>
  );
}