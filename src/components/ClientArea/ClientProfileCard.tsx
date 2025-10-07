import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SmartForm } from "@/components/SmartForm";
import { Pencil, Save, X } from "lucide-react";
import { smartToast } from "@/lib/smart-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientProfileCardProps {
  clienteId: string;
}

export function ClientProfileCard({ clienteId }: ClientProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: cliente, isLoading } = useQuery({
    queryKey: ['cliente-profile', clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single();
      
      if (error) throw error;
      return data;
    },
    refetchOnWindowFocus: false,
  });

  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from('clientes')
        .update(values)
        .eq('id', clienteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente-profile', clienteId] });
      setIsEditing(false);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cliente) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Cliente não encontrado
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Perfil do Cliente</CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="gap-2">
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-xs text-muted-foreground">Razão Social</Label>
              <p className="text-sm font-medium mt-1">{cliente.razao_social || '—'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Nome Fantasia</Label>
              <p className="text-sm font-medium mt-1">{cliente.nome_fantasia || cliente.nome || '—'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">CNPJ/CPF</Label>
              <p className="text-sm font-mono mt-1">{cliente.cnpj_cpf || '—'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Site</Label>
              <p className="text-sm mt-1">
                {(cliente as any).site ? (
                  <a href={(cliente as any).site} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {(cliente as any).site}
                  </a>
                ) : '—'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Telefone</Label>
              <p className="text-sm font-mono mt-1">{cliente.telefone || '—'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">WhatsApp</Label>
              <p className="text-sm font-mono mt-1">{(cliente as any).whatsapp || '—'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">E-mail Principal</Label>
              <p className="text-sm mt-1">{cliente.email || '—'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Segmento</Label>
              <p className="text-sm mt-1">{(cliente as any).segmento || '—'}</p>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs text-muted-foreground">Endereço</Label>
              <p className="text-sm mt-1">{cliente.endereco || '—'}</p>
            </div>
          </div>
        ) : (
          <SmartForm
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const values = Object.fromEntries(formData.entries());
              await updateMutation.mutateAsync(values);
            }}
            successMessage="Perfil atualizado com sucesso"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="razao_social">Razão Social</Label>
                <Input
                  id="razao_social"
                  name="razao_social"
                  defaultValue={cliente.razao_social || ''}
                  placeholder="Razão Social Completa"
                />
              </div>
              <div>
                <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                <Input
                  id="nome_fantasia"
                  name="nome_fantasia"
                  defaultValue={cliente.nome_fantasia || cliente.nome || ''}
                  placeholder="Nome Fantasia"
                />
              </div>
              <div>
                <Label htmlFor="cnpj_cpf">CNPJ/CPF</Label>
                <Input
                  id="cnpj_cpf"
                  name="cnpj_cpf"
                  defaultValue={cliente.cnpj_cpf || ''}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <Label htmlFor="site">Site</Label>
                <Input
                  id="site"
                  name="site"
                  type="url"
                  defaultValue={(cliente as any).site || ''}
                  placeholder="https://exemplo.com.br"
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  defaultValue={cliente.telefone || ''}
                  placeholder="(00) 0000-0000"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  defaultValue={(cliente as any).whatsapp || ''}
                  placeholder="(00) 90000-0000"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail Principal</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={cliente.email || ''}
                  placeholder="contato@empresa.com"
                />
              </div>
              <div>
                <Label htmlFor="segmento">Segmento</Label>
                <Input
                  id="segmento"
                  name="segmento"
                  defaultValue={(cliente as any).segmento || ''}
                  placeholder="Ex: Tecnologia, Varejo, Saúde"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Textarea
                  id="endereco"
                  name="endereco"
                  defaultValue={cliente.endereco || ''}
                  placeholder="Rua, Número, Bairro, Cidade - UF, CEP"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Alterações
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </div>
          </SmartForm>
        )}
      </CardContent>
    </Card>
  );
}
