// BEX 3.0 - Tipos para o Sistema Unificado de Tarefas

export type TipoTarefa =
  | 'planejamento_estrategico'
  | 'roteiro_reels'
  | 'criativo_card'
  | 'criativo_carrossel'
  | 'criativo_cartela'
  | 'criativo_vt'
  | 'reels_instagram'
  | 'stories_interativo'
  | 'feed_post'
  | 'datas_comemorativas'
  | 'trafego_pago'
  | 'contrato'
  | 'outro';

export type PrioridadeTarefa = 'baixa' | 'media' | 'alta' | 'critica';

export type StatusTarefa =
  | 'backlog'
  | 'briefing'
  | 'em_producao'
  | 'em_revisao'
  | 'aprovacao_cliente'
  | 'aprovado'
  | 'agendado'
  | 'publicado'
  | 'pausado'
  | 'cancelado';

export type AreaTarefa = 'GRS' | 'Design' | 'Audiovisual' | 'Social' | 'Midia_Paga' | 'Adm';

export type CanalTarefa =
  | 'Instagram'
  | 'TikTok'
  | 'Facebook'
  | 'YouTube'
  | 'Site'
  | 'GoogleAds'
  | 'MetaAds'
  | 'Outros';

export type ExecutorArea = 'Audiovisual' | 'Criativo';

export type TipoAnexo =
  | 'referencia'
  | 'briefing'
  | 'logo'
  | 'paleta'
  | 'roteiro'
  | 'psd_ai'
  | 'raw_video'
  | 'planilha'
  | 'contrato'
  | 'outro';

export type StatusAprovacao = 'pendente' | 'aprovado' | 'ajustes' | 'reprovado';

export type StatusPrazo = 'vermelho' | 'amarelo' | 'verde' | 'cinza';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  ordem?: number;
}

export interface Tarefa {
  id: string;
  tipo: TipoTarefa;
  produto_id?: string | null;
  campanha_id?: string | null;
  titulo: string;
  descricao?: string | null;
  prioridade: PrioridadeTarefa;
  status: StatusTarefa;
  responsavel_id?: string | null;
  area?: AreaTarefa[] | null;
  executor_area?: ExecutorArea | null;
  executor_id?: string | null;
  prazo_executor?: string | null;
  data_inicio_prevista?: string | null;
  data_entrega_prevista?: string | null;
  data_publicacao?: string | null;
  canais?: CanalTarefa[] | null;
  publico_alvo?: string | null;
  tom_voz?: string | null;
  cta?: string | null;
  kpis?: any; // JSONB field
  tags?: string[] | null;
  origem?: string | null;
  grs_action_id?: string | null;
  trace_id?: string | null;
  projeto_id?: string | null;
  cliente_id?: string | null;
  checklist?: ChecklistItem[] | null;
  checklist_progress?: number | null;
  capa_anexo_id?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TarefaConteudo {
  id: string;
  tarefa_id: string;
  bloco_json: Record<string, any>;
  versao: number;
  publicado: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Anexo {
  id: string;
  tarefa_id: string;
  tipo: TipoAnexo;
  arquivo_url: string;
  legenda?: string;
  versao: number;
  hash_publico?: string;
  trace_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AprovacaoTarefa {
  id: string;
  tarefa_id: string;
  status_aprovacao: StatusAprovacao;
  comentarios?: string;
  aprovado_por?: string;
  data_aprovacao?: string;
  created_at?: string;
}

export interface Produto {
  id: string;
  nome: string;
  sku?: string;
  time_responsavel?: string;
  checklist_padrao?: any[];
  sla_padrao?: number;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Campanha {
  id: string;
  nome: string;
  cliente_id: string;
  data_inicio?: string;
  data_fim?: string;
  objetivo?: string;
  orcamento?: number;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total_seconds: number;
  status: StatusPrazo;
}
