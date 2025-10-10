import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface TooltipFiscalProps {
  tipo: 'inss' | 'irrf' | 'fgts' | 'inss_patronal' | 'base_calculo';
}

const TOOLTIPS = {
  inss: {
    titulo: 'INSS - Instituto Nacional do Seguro Social',
    descricao: 'Contribuição obrigatória para a Previdência Social. Calculada progressivamente sobre o salário bruto em faixas de 7,5% a 14%.',
    exemplo: 'Para R$ 5.000: aplica-se 7,5% sobre R$ 1.320, 9% sobre R$ 1.322, etc.'
  },
  irrf: {
    titulo: 'IRRF - Imposto de Renda Retido na Fonte',
    descricao: 'Imposto retido mensalmente sobre a renda. Base de cálculo = Salário - INSS - Dependentes. Alíquotas de 7,5% a 27,5%.',
    exemplo: 'Cada dependente deduz R$ 189,59 da base de cálculo.'
  },
  fgts: {
    titulo: 'FGTS - Fundo de Garantia do Tempo de Serviço',
    descricao: 'Depósito mensal de 8% do salário bruto em conta vinculada ao trabalhador. Encargo da empresa, não desconta do salário.',
    exemplo: 'Salário R$ 5.000 → FGTS = R$ 400 (pago pela empresa)'
  },
  inss_patronal: {
    titulo: 'INSS Patronal - Contribuição Previdenciária da Empresa',
    descricao: 'Encargo de 20% sobre a folha de pagamento, pago pela empresa à Previdência Social.',
    exemplo: 'Salário R$ 5.000 → INSS Patronal = R$ 1.000 (custo da empresa)'
  },
  base_calculo: {
    titulo: 'Base de Cálculo',
    descricao: 'Valor usado para calcular descontos e encargos. Geralmente é o salário bruto menos deduções permitidas.',
    exemplo: 'Para IRRF: Base = Salário - INSS - (Dependentes × R$ 189,59)'
  }
};

export function TooltipFiscal({ tipo }: TooltipFiscalProps) {
  const info = TOOLTIPS[tipo];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help inline-block ml-1" />
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <div className="space-y-2">
          <p className="font-semibold text-sm">{info.titulo}</p>
          <p className="text-xs text-muted-foreground">{info.descricao}</p>
          <p className="text-xs italic text-primary">{info.exemplo}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
