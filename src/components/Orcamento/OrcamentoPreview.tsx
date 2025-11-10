import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Building2, Calendar, FileText, MapPin, Mail, Phone, DollarSign, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface OrcamentoPreviewProps {
  orcamento: any;
  itens: any[];
  empresa?: any;
  modo?: 'visualizacao' | 'edicao';
  onEdit?: () => void;
}

const statusColors: Record<string, string> = {
  rascunho: "bg-gray-500",
  enviado: "bg-blue-500",
  aprovado: "bg-green-500",
  rejeitado: "bg-red-500",
  expirado: "bg-orange-500"
};

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  expirado: "Expirado"
};

export const OrcamentoPreview = ({ orcamento, itens, empresa, modo = 'visualizacao' }: OrcamentoPreviewProps) => {
  if (!orcamento) return null;

  return (
    <div className="preview-container max-w-[210mm] mx-auto bg-background shadow-xl rounded-lg overflow-hidden print:shadow-none print:max-w-full">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-bex/20 to-blue-600/20 p-8 border-b-4 border-bex">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {empresa?.logo_url && (
              <img 
                src={empresa.logo_url} 
                alt="Logo BEX" 
                className="h-16 w-auto"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">ORÇAMENTO</h1>
              <p className="text-lg text-muted-foreground">Nº {orcamento.numero || 'N/A'}</p>
            </div>
          </div>
          <Badge className={`${statusColors[orcamento.status]} text-white`}>
            {statusLabels[orcamento.status]}
          </Badge>
        </div>
      </div>

      {/* Dados da Empresa e Informações do Orçamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-muted/30">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            DADOS DA EMPRESA
          </h2>
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-foreground">{empresa?.razao_social || 'BEX Communication'}</p>
            {empresa?.cnpj && <p className="text-muted-foreground">CNPJ: {empresa.cnpj}</p>}
            {empresa?.endereco_completo && <p className="text-muted-foreground">{empresa.endereco_completo}</p>}
            <div className="flex flex-col gap-1 mt-2">
              {empresa?.telefone && (
                <p className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  {empresa.telefone}
                </p>
              )}
              {empresa?.email && (
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  {empresa.email}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            INFORMAÇÕES DO ORÇAMENTO
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data de Emissão:</span>
              <span className="font-medium text-foreground">
                {format(new Date(orcamento.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
            {orcamento.data_validade && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Validade:</span>
                <span className="font-medium text-foreground">
                  {format(new Date(orcamento.data_validade), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
            {orcamento.projetos?.nome && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Projeto:</span>
                <span className="font-medium text-foreground">{orcamento.projetos.nome}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dados do Cliente */}
      <div className="p-8 border-t">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          DADOS DO CLIENTE
        </h2>
        <Card className="p-4 bg-muted/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-foreground text-base mb-2">
                {orcamento.clientes?.nome || 'N/A'}
              </p>
              {orcamento.clientes?.cnpj_cpf && (
                <p className="text-muted-foreground">CNPJ/CPF: {orcamento.clientes.cnpj_cpf}</p>
              )}
              {orcamento.clientes?.endereco && (
                <p className="text-muted-foreground mt-1">{orcamento.clientes.endereco}</p>
              )}
            </div>
            <div className="space-y-1">
              {orcamento.contato_tel && (
                <p className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  {orcamento.contato_tel}
                </p>
              )}
              {orcamento.contato_email && (
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  {orcamento.contato_email}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Descrição dos Serviços */}
      <div className="p-8 border-t">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          DESCRIÇÃO DOS SERVIÇOS
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-bex/20 border-b-2 border-bex">
                <th className="text-left p-3 font-semibold text-foreground">#</th>
                <th className="text-left p-3 font-semibold text-foreground">Descrição</th>
                <th className="text-center p-3 font-semibold text-foreground">Qtd</th>
                <th className="text-center p-3 font-semibold text-foreground">Unid.</th>
                <th className="text-right p-3 font-semibold text-foreground">Valor Unit.</th>
                <th className="text-center p-3 font-semibold text-foreground">Desc.</th>
                <th className="text-right p-3 font-semibold text-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {itens && itens.length > 0 ? (
                itens.map((item, index) => (
                  <tr key={item.id} className={`border-b item-row ${index % 2 === 0 ? 'bg-muted/30' : ''}`}>
                    <td className="p-3 text-muted-foreground">{index + 1}</td>
                    <td className="p-3 text-foreground">{item.descricao || 'N/A'}</td>
                    <td className="p-3 text-center text-foreground">{item.quantidade || 0}</td>
                    <td className="p-3 text-center text-muted-foreground">{item.unidade || 'un'}</td>
                    <td className="p-3 text-right text-foreground">
                      R$ {(item.preco_unitario || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center text-muted-foreground">{item.desconto_percent || 0}%</td>
                    <td className="p-3 text-right font-semibold text-foreground">
                      R$ {(item.subtotal_item || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">
                    Nenhum item adicionado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totais */}
        <div className="mt-6 border-t pt-4">
          <div className="max-w-md ml-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium text-foreground">
                R$ {(orcamento.subtotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {orcamento.descontos > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Descontos:</span>
                <span className="font-medium text-red-600">
                  - R$ {(orcamento.descontos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {orcamento.impostos > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Impostos:</span>
                <span className="font-medium text-foreground">
                  R$ {(orcamento.impostos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t-2 border-bex pt-2">
              <span className="text-bex">VALOR TOTAL:</span>
              <span className="text-bex">
                R$ {(orcamento.valor_final || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Condições de Pagamento */}
      {orcamento.condicoes_pagamento && (
        <div className="p-8 border-t bg-muted/30">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            CONDIÇÕES DE PAGAMENTO
          </h2>
          <p className="text-sm text-foreground whitespace-pre-wrap">{orcamento.condicoes_pagamento}</p>
        </div>
      )}

      {/* Dados Bancários */}
      {empresa && (empresa.banco_nome || empresa.pix_chave) && (
        <div className="p-8 border-t">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            DADOS BANCÁRIOS PARA PAGAMENTO
          </h2>
          <Card className="p-4 bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                {empresa.banco_nome && (
                  <p className="text-foreground">
                    <span className="font-semibold">Banco:</span> {empresa.banco_nome}
                    {empresa.banco_codigo && ` (${empresa.banco_codigo})`}
                  </p>
                )}
                {empresa.agencia && (
                  <p className="text-foreground">
                    <span className="font-semibold">Agência:</span> {empresa.agencia}
                  </p>
                )}
                {empresa.conta && (
                  <p className="text-foreground">
                    <span className="font-semibold">Conta:</span> {empresa.conta}
                  </p>
                )}
              </div>
              {empresa.pix_chave && (
                <div className="bg-bex/10 p-3 rounded-lg border border-bex/30">
                  <p className="font-semibold text-foreground mb-1">PIX</p>
                  <p className="text-xs text-muted-foreground mb-1">
                    {empresa.pix_tipo || 'Chave'}
                  </p>
                  <p className="text-sm font-mono text-foreground break-all">
                    {empresa.pix_chave}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Observações */}
      {orcamento.observacoes && (
        <div className="p-8 border-t">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">OBSERVAÇÕES</h2>
          <p className="text-sm text-foreground whitespace-pre-wrap">{orcamento.observacoes}</p>
        </div>
      )}

      {/* Validade em Destaque */}
      {orcamento.data_validade && (
        <div className="p-6 bg-yellow-50 dark:bg-yellow-950/20 border-t border-yellow-200 dark:border-yellow-900">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 text-center">
            ⚠️ VALIDADE: Este orçamento é válido até {format(new Date(orcamento.data_validade), "dd/MM/yyyy", { locale: ptBR })}
          </p>
        </div>
      )}

      {/* Área de Assinatura */}
      <div className="p-8 border-t no-print">
        <h2 className="text-sm font-semibold text-muted-foreground mb-6">ACEITE DO ORÇAMENTO</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="border-t-2 border-muted-foreground pt-2 mt-12">
              <p className="text-xs text-muted-foreground">Assinatura do Cliente</p>
              <p className="text-xs text-muted-foreground mt-1">Data: ___/___/______</p>
            </div>
          </div>
          <div>
            <div className="border-t-2 border-muted-foreground pt-2 mt-12">
              <p className="text-xs text-foreground font-semibold">{empresa?.razao_social || 'BEX Communication'}</p>
              <p className="text-xs text-muted-foreground">Representante Legal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="bg-gradient-to-r from-bex/10 to-blue-600/10 p-4 border-t text-center text-xs text-muted-foreground">
        <p>
          {empresa?.razao_social || 'BEX Communication'} | {empresa?.email || 'contato@bexcommunication.com.br'} | {empresa?.telefone || ''}
        </p>
        <p className="mt-1">
          Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </p>
      </div>
    </div>
  );
};
