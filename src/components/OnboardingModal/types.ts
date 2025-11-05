export interface CampanhaMensal {
  mes: number; // 1-12
  nome: string;
  tipo: 'promocional' | 'sazonal' | 'lancamento' | 'institucional';
  descricao?: string;
}

export interface OnboardingData {
  // Step 1: Empresa
  nome_empresa: string;
  segmento_atuacao: string;
  produtos_servicos: string;
  tempo_mercado: string;
  localizacao: string;
  
  // Step 2: Público
  publico_alvo: string[];
  dores_problemas: string;
  valorizado: string;
  ticket_medio: string;
  
  // Step 3: Digital
  presenca_digital: string[];
  frequencia_postagens: string;
  tipos_conteudo: string[];
  midia_paga: string;
  
  // Step 4: SWOT
  forcas: string;
  fraquezas: string;
  oportunidades: string;
  ameacas: string;
  
  // Step 5: Objetivos
  objetivos_digitais: string;
  objetivos_offline: string;
  onde_6_meses: string;
  resultados_esperados: string[];
  
  // Step 6: Marca
  historia_marca: string;
  valores_principais: string;
  tom_voz: string[];
  como_lembrada: string;
  
  // Step 7: Plano & Campanhas
  duracao_contrato_meses?: 3 | 6 | 12;
  assinatura_id?: string;
  areas_foco?: string[];
  campanhas_mensais?: CampanhaMensal[];
}

export interface StepProps {
  formData: OnboardingData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingData>>;
}
