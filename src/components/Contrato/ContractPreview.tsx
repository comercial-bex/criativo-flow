import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, Phone, Mail, FileSignature, DollarSign, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

interface ContractPreviewProps {
  contrato: any;
  empresa?: any;
}

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  aprovacao_interna: "Aprovação Interna",
  enviado_assinatura: "Enviado p/ Assinatura",
  assinado: "Assinado",
  vigente: "Vigente",
  encerrado: "Encerrado",
};

const statusColors: Record<string, string> = {
  rascunho: "bg-muted text-muted-foreground",
  aprovacao_interna: "bg-warning/10 text-warning border-warning/20",
  enviado_assinatura: "bg-info/10 text-info border-info/20",
  assinado: "bg-warning/10 text-warning border-warning/20",
  vigente: "bg-success/10 text-success border-success/20",
  encerrado: "bg-destructive/10 text-destructive border-destructive/20",
};

export function ContractPreview({ contrato, empresa }: ContractPreviewProps) {
  const valorMensal = Number(contrato.valor_mensal || 0);
  const valorRecorrente = Number(contrato.valor_recorrente || 0);
  const valorAvulso = Number(contrato.valor_avulso || 0);

  return (
    <div className="bg-background">
      {/* Cabeçalho Profissional */}
      <Card className="p-8 mb-6 bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {empresa?.logo_url && (
              <img 
                src={empresa.logo_url} 
                alt={empresa.nome || "Logo"} 
                className="h-16 mb-4 object-contain"
              />
            )}
            <h1 className="text-4xl font-bold text-foreground mb-2">
              CONTRATO DE PRESTAÇÃO DE SERVIÇOS
            </h1>
            <p className="text-xl text-muted-foreground font-medium">
              {contrato.titulo}
            </p>
          </div>
          
          <div className="text-right">
            <Badge className={statusColors[contrato.status]} variant="outline">
              {statusLabels[contrato.status]}
            </Badge>
            {contrato.numero && (
              <div className="mt-3 inline-block bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Contrato Nº</p>
                <p className="text-2xl font-bold text-primary font-mono">
                  {contrato.numero}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-6">
          {contrato.data_inicio && (
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Data de Início</p>
                <p className="font-semibold text-foreground">
                  {format(new Date(contrato.data_inicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          )}
          
          {contrato.data_fim && (
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-warning mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Data de Término</p>
                <p className="font-semibold text-foreground">
                  {format(new Date(contrato.data_fim), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          )}

          {contrato.assinado_em && (
            <div className="flex items-start gap-3">
              <FileSignature className="w-5 h-5 text-success mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Data de Assinatura</p>
                <p className="font-semibold text-foreground">
                  {format(new Date(contrato.assinado_em), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* As Partes */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold text-foreground mb-4">
          AS PARTES CONTRATANTES
        </h2>
        <Separator className="mb-6" />

        {/* Contratante (Cliente) */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">CONTRATANTE</h3>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Razão Social / Nome</p>
                <p className="font-semibold text-foreground text-lg">
                  {contrato.clientes?.nome || "---"}
                </p>
              </div>

              {contrato.clientes?.cnpj_cpf && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">CNPJ/CPF</p>
                  <p className="font-medium text-foreground">{contrato.clientes.cnpj_cpf}</p>
                </div>
              )}

              {contrato.clientes?.endereco && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Endereço</p>
                  <p className="font-medium text-foreground">{contrato.clientes.endereco}</p>
                </div>
              )}

              {contrato.clientes?.email && (
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">E-mail</p>
                    <p className="font-medium text-foreground">{contrato.clientes.email}</p>
                  </div>
                </div>
              )}

              {contrato.clientes?.telefone && (
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                    <p className="font-medium text-foreground">{contrato.clientes.telefone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contratada (Empresa) */}
        {empresa && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">CONTRATADA</h3>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Razão Social</p>
                  <p className="font-semibold text-foreground text-lg">{empresa.nome}</p>
                </div>

                {empresa.cnpj && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">CNPJ</p>
                    <p className="font-medium text-foreground">{empresa.cnpj}</p>
                  </div>
                )}

                {empresa.endereco && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Endereço</p>
                    <p className="font-medium text-foreground">{empresa.endereco}</p>
                  </div>
                )}

                {empresa.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">E-mail</p>
                      <p className="font-medium text-foreground">{empresa.email}</p>
                    </div>
                  </div>
                )}

                {empresa.telefone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                      <p className="font-medium text-foreground">{empresa.telefone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Objeto do Contrato */}
      {contrato.descricao && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">OBJETO DO CONTRATO</h2>
          <Separator className="mb-4" />
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {contrato.descricao}
          </p>
        </Card>
      )}

      {/* Valores */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-background border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Valores e Condições Comerciais</h2>
        </div>
        <Separator className="mb-6" />

        <div className="grid grid-cols-3 gap-4">
          {valorMensal > 0 && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">Valor Mensal</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(valorMensal)}
              </p>
            </Card>
          )}

          {valorRecorrente > 0 && (
            <Card className="p-4 bg-success/5 border-success/20">
              <p className="text-sm text-muted-foreground mb-2">Valor Recorrente</p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(valorRecorrente)}
              </p>
            </Card>
          )}

          {valorAvulso > 0 && (
            <Card className="p-4 bg-info/5 border-info/20">
              <p className="text-sm text-muted-foreground mb-2">Valor Avulso</p>
              <p className="text-2xl font-bold text-info">
                {formatCurrency(valorAvulso)}
              </p>
            </Card>
          )}
        </div>

        {contrato.condicoes_pagamento && (
          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-2">Condições de Pagamento</h3>
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {contrato.condicoes_pagamento}
            </p>
          </div>
        )}
      </Card>

      {/* Avisos */}
      {contrato.status === "rascunho" && (
        <Card className="p-4 mb-6 bg-warning/5 border-warning/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <p className="font-semibold text-warning mb-1">Documento em Rascunho</p>
              <p className="text-sm text-muted-foreground">
                Este contrato ainda não foi enviado para assinatura e pode ser editado.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
