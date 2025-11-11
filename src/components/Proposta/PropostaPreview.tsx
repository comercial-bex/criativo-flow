import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2, Calendar, Phone, Mail, FileText, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

interface PropostaPreviewProps {
  proposta: any;
  itens: any[];
  empresa?: any;
}

export function PropostaPreview({ proposta, itens, empresa }: PropostaPreviewProps) {
  const subtotal = Number(proposta.subtotal || 0);
  const impostos = Number(proposta.impostos || 0);
  const descontos = Number(proposta.descontos || 0);
  const total = Number(proposta.total || 0);

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
              PROPOSTA COMERCIAL
            </h1>
            <p className="text-xl text-muted-foreground font-medium">
              {proposta.titulo}
            </p>
          </div>
          
          <div className="text-right">
            <div className="inline-block bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Proposta Nº</p>
              <p className="text-2xl font-bold text-primary font-mono">
                {proposta.numero || "---"}
              </p>
            </div>
            {proposta.versao && proposta.versao > 1 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Versão {proposta.versao}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Data de Emissão</p>
              <p className="font-semibold text-foreground">
                {format(new Date(proposta.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          
          {proposta.validade && (
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-warning mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Validade</p>
                <p className="font-semibold text-foreground">
                  {format(new Date(proposta.validade), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Informações do Cliente */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Cliente</h2>
        </div>
        <Separator className="mb-4" />
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Razão Social / Nome</p>
            <p className="font-semibold text-foreground text-lg">
              {proposta.clientes?.nome || proposta.contato_nome || "---"}
            </p>
          </div>

          {proposta.clientes?.cnpj_cpf && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">CNPJ/CPF</p>
              <p className="font-medium text-foreground">{proposta.clientes.cnpj_cpf}</p>
            </div>
          )}

          {(proposta.contato_email || proposta.clientes?.email) && (
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">E-mail</p>
                <p className="font-medium text-foreground">
                  {proposta.contato_email || proposta.clientes?.email}
                </p>
              </div>
            </div>
          )}

          {(proposta.contato_tel || proposta.clientes?.telefone) && (
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                <p className="font-medium text-foreground">
                  {proposta.contato_tel || proposta.clientes?.telefone}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Serviços e Produtos */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Serviços e Produtos</h2>
        </div>
        <Separator className="mb-4" />

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-primary/20">
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">
                  Descrição
                </th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground">
                  Qtd
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">
                  Valor Unit.
                </th>
                {itens.some(i => i.desconto_percent > 0) && (
                  <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground">
                    Desc.
                  </th>
                )}
                <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`border-b border-border ${index % 2 === 0 ? 'bg-muted/30' : ''}`}
                >
                  <td className="py-4 px-2">
                    <p className="font-medium text-foreground">{item.descricao}</p>
                  </td>
                  <td className="text-center py-4 px-2 text-foreground">
                    {item.quantidade}
                  </td>
                  <td className="text-right py-4 px-2 font-medium text-foreground">
                    {formatCurrency(Number(item.preco_unitario))}
                  </td>
                  {itens.some(i => i.desconto_percent > 0) && (
                    <td className="text-center py-4 px-2 text-warning">
                      {item.desconto_percent > 0 ? `${item.desconto_percent}%` : '-'}
                    </td>
                  )}
                  <td className="text-right py-4 px-2 font-bold text-primary">
                    {formatCurrency(Number(item.subtotal_item))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Totais */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-background border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Resumo Financeiro</h2>
        </div>
        <Separator className="mb-4" />

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold text-lg text-foreground">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {descontos > 0 && (
            <div className="flex justify-between items-center py-2">
              <span className="text-warning">Descontos</span>
              <span className="font-semibold text-lg text-warning">
                - {formatCurrency(descontos)}
              </span>
            </div>
          )}

          {impostos > 0 && (
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Impostos</span>
              <span className="font-semibold text-lg text-foreground">
                {formatCurrency(impostos)}
              </span>
            </div>
          )}

          <Separator className="my-2" />

          <div className="flex justify-between items-center py-3 bg-primary/10 px-4 rounded-lg">
            <span className="text-lg font-bold text-foreground">VALOR TOTAL</span>
            <span className="text-3xl font-bold text-primary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </Card>

      {/* Condições de Pagamento */}
      {proposta.condicoes_pagamento && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Condições de Pagamento</h2>
          <Separator className="mb-4" />
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {proposta.condicoes_pagamento}
          </p>
        </Card>
      )}

      {/* Dados da Empresa */}
      {empresa && (
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold text-foreground mb-3">Dados do Fornecedor</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Razão Social</p>
              <p className="font-medium text-foreground">{empresa.nome}</p>
            </div>
            {empresa.cnpj && (
              <div>
                <p className="text-muted-foreground">CNPJ</p>
                <p className="font-medium text-foreground">{empresa.cnpj}</p>
              </div>
            )}
            {empresa.email && (
              <div>
                <p className="text-muted-foreground">E-mail</p>
                <p className="font-medium text-foreground">{empresa.email}</p>
              </div>
            )}
            {empresa.telefone && (
              <div>
                <p className="text-muted-foreground">Telefone</p>
                <p className="font-medium text-foreground">{empresa.telefone}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
