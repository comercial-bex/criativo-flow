import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoteiros } from "@/hooks/useRoteiros";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Film, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const plataformaLabels = {
  reels: "Reels",
  tiktok: "TikTok",
  short: "YouTube Short",
  vt: "VT Comercial",
  institucional: "Institucional",
  spot_radio: "Spot Rádio",
  doc: "Documentário",
  outro: "Outro",
};

const statusConfig = {
  rascunho: { label: "Rascunho", className: "bg-gray-100 text-gray-800" },
  em_revisao: { label: "Em Revisão", className: "bg-yellow-100 text-yellow-800" },
  aprovado: { label: "Aprovado", className: "bg-green-100 text-green-800" },
  publicado: { label: "Publicado", className: "bg-blue-100 text-blue-800" },
};

export default function RoteiroIAListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { roteiros, isLoading } = useRoteiros();

  const filteredRoteiros = roteiros.filter((roteiro) =>
    roteiro.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Film className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Roteiro IA</h1>
        </div>
        <Button onClick={() => navigate("/grs/roteiro-ia/novo")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Roteiro
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredRoteiros.length === 0 && !isLoading ? (
        <EmptyState
          icon={Film}
          title="Nenhum roteiro encontrado"
          description="Comece criando seu primeiro roteiro com IA!"
          action={{
            label: "Criar Roteiro",
            onClick: () => navigate("/grs/roteiro-ia/novo"),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoteiros.map((roteiro) => (
            <Card
              key={roteiro.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/grs/roteiro-ia/${roteiro.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg line-clamp-2">
                    {roteiro.titulo}
                  </CardTitle>
                  <Badge className={statusConfig[roteiro.status]?.className}>
                    {statusConfig[roteiro.status]?.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {plataformaLabels[roteiro.plataforma]}
                  </Badge>
                  {roteiro.duracao_prevista_seg && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {roteiro.duracao_prevista_seg}s
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="text-xs">
                    Atualizado em{" "}
                    {format(new Date(roteiro.updated_at), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
