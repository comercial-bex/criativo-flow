import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProdutosCatalogo } from "@/hooks/useProdutosCatalogo";

/**
 * 🎯 PÁGINA REFATORADA - PLANOS DE ASSINATURA
 * Agora usa o catálogo unificado de produtos
 */
export default function Planos() {
  const navigate = useNavigate();
  const { produtos: planos, loading } = useProdutosCatalogo({ tipo: 'plano_assinatura' });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlanos = planos.filter(plano =>
    plano.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: "nome",
      label: "Nome do Plano",
    },
    {
      key: "preco_padrao",
      label: "Preço",
      render: (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      key: "posts_mensais",
      label: "Posts/Mês",
    },
    {
      key: "reels_suporte",
      label: "Reels",
      render: (value: boolean) => value ? "Sim" : "Não",
    },
    {
      key: "anuncios_facebook",
      label: "Facebook Ads",
      render: (value: boolean) => value ? "Sim" : "Não",
    },
    {
      key: "anuncios_google",
      label: "Google Ads",
      render: (value: boolean) => value ? "Sim" : "Não",
    },
    {
      key: "ativo",
      label: "Status",
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
  ];

  const actions = [
    {
      label: "Editar",
      onClick: (row: any) => navigate(`/admin/produtos/editar/${row.id}`),
      variant: 'outline' as const
    }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Planos de Assinatura"
        description="Gerencie os planos de assinatura disponíveis para seus clientes (agora centralizados no catálogo de produtos)"
      />

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Total de {filteredPlanos.length} planos cadastrados
        </div>
        <Button onClick={() => navigate("/admin/produtos/novo")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planos Cadastrados</CardTitle>
          <CardDescription>
            ⚠️ Agora gerenciados através do Catálogo Unificado de Produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando planos...
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredPlanos} 
              actions={actions}
              emptyMessage="Nenhum plano cadastrado. Crie planos através do menu Produtos > Novo Produto > Tipo: Plano de Assinatura"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
