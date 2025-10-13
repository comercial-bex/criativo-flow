export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_temp_data: {
        Row: {
          cargo_atual: string | null
          categoria: string | null
          cliente_id: string
          created_at: string
          created_by: string | null
          descricao_curta: string | null
          id: string
          metadata: Json | null
          origem: string
          produto_id: string | null
          produto_nome: string
          regime: string | null
          salario_ou_fee: number | null
          used_at: string | null
          used_in_document_id: string | null
          used_in_document_type: string | null
          valor_unitario: number
        }
        Insert: {
          cargo_atual?: string | null
          categoria?: string | null
          cliente_id: string
          created_at?: string
          created_by?: string | null
          descricao_curta?: string | null
          id?: string
          metadata?: Json | null
          origem?: string
          produto_id?: string | null
          produto_nome: string
          regime?: string | null
          salario_ou_fee?: number | null
          used_at?: string | null
          used_in_document_id?: string | null
          used_in_document_type?: string | null
          valor_unitario: number
        }
        Update: {
          cargo_atual?: string | null
          categoria?: string | null
          cliente_id?: string
          created_at?: string
          created_by?: string | null
          descricao_curta?: string | null
          id?: string
          metadata?: Json | null
          origem?: string
          produto_id?: string | null
          produto_nome?: string
          regime?: string | null
          salario_ou_fee?: number | null
          used_at?: string | null
          used_in_document_id?: string | null
          used_in_document_type?: string | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_temp_data_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_temp_data_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "admin_temp_data_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "admin_temp_data_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      agentes_ia: {
        Row: {
          created_at: string | null
          descricao: string | null
          especialidade: string
          icone: string | null
          id: string
          is_ativo: boolean | null
          nome: string
          parametros_ia: Json | null
          system_prompt: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          especialidade: string
          icone?: string | null
          id?: string
          is_ativo?: boolean | null
          nome: string
          parametros_ia?: Json | null
          system_prompt: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          especialidade?: string
          icone?: string | null
          id?: string
          is_ativo?: boolean | null
          nome?: string
          parametros_ia?: Json | null
          system_prompt?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_cache: {
        Row: {
          cache_key: string
          created_at: string
          expires_at: string
          id: string
          model_used: string | null
          prompt_hash: string
          response_data: Json
          tokens_used: number | null
        }
        Insert: {
          cache_key: string
          created_at?: string
          expires_at: string
          id?: string
          model_used?: string | null
          prompt_hash: string
          response_data: Json
          tokens_used?: number | null
        }
        Update: {
          cache_key?: string
          created_at?: string
          expires_at?: string
          id?: string
          model_used?: string | null
          prompt_hash?: string
          response_data?: Json
          tokens_used?: number | null
        }
        Relationships: []
      }
      anexo: {
        Row: {
          arquivo_url: string
          created_at: string | null
          hash_publico: string | null
          id: string
          legenda: string | null
          tarefa_id: string
          tipo: Database["public"]["Enums"]["tipo_anexo_enum"] | null
          trace_id: string | null
          updated_at: string | null
          versao: number | null
        }
        Insert: {
          arquivo_url: string
          created_at?: string | null
          hash_publico?: string | null
          id?: string
          legenda?: string | null
          tarefa_id: string
          tipo?: Database["public"]["Enums"]["tipo_anexo_enum"] | null
          trace_id?: string | null
          updated_at?: string | null
          versao?: number | null
        }
        Update: {
          arquivo_url?: string
          created_at?: string | null
          hash_publico?: string | null
          id?: string
          legenda?: string | null
          tarefa_id?: string
          tipo?: Database["public"]["Enums"]["tipo_anexo_enum"] | null
          trace_id?: string | null
          updated_at?: string | null
          versao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anexo_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
        ]
      }
      aprovacao_tarefa: {
        Row: {
          aprovado_por: string | null
          comentarios: string | null
          created_at: string | null
          data_aprovacao: string | null
          id: string
          status_aprovacao:
            | Database["public"]["Enums"]["status_aprovacao_enum"]
            | null
          tarefa_id: string
        }
        Insert: {
          aprovado_por?: string | null
          comentarios?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          id?: string
          status_aprovacao?:
            | Database["public"]["Enums"]["status_aprovacao_enum"]
            | null
          tarefa_id: string
        }
        Update: {
          aprovado_por?: string | null
          comentarios?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          id?: string
          status_aprovacao?:
            | Database["public"]["Enums"]["status_aprovacao_enum"]
            | null
          tarefa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aprovacao_tarefa_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aprovacao_tarefa_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "aprovacao_tarefa_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
        ]
      }
      aprovacoes_cliente: {
        Row: {
          anexo_url: string | null
          cliente_id: string
          created_at: string
          decided_at: string | null
          decidido_por: string | null
          descricao: string | null
          hash_publico: string | null
          id: string
          motivo_reprovacao: string | null
          projeto_id: string | null
          solicitado_por: string
          status: string
          tarefa_id: string | null
          tipo: string
          titulo: string
          trace_id: string | null
          updated_at: string
        }
        Insert: {
          anexo_url?: string | null
          cliente_id: string
          created_at?: string
          decided_at?: string | null
          decidido_por?: string | null
          descricao?: string | null
          hash_publico?: string | null
          id?: string
          motivo_reprovacao?: string | null
          projeto_id?: string | null
          solicitado_por: string
          status?: string
          tarefa_id?: string | null
          tipo: string
          titulo: string
          trace_id?: string | null
          updated_at?: string
        }
        Update: {
          anexo_url?: string | null
          cliente_id?: string
          created_at?: string
          decided_at?: string | null
          decidido_por?: string | null
          descricao?: string | null
          hash_publico?: string | null
          id?: string
          motivo_reprovacao?: string | null
          projeto_id?: string | null
          solicitado_por?: string
          status?: string
          tarefa_id?: string | null
          tipo?: string
          titulo?: string
          trace_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aprovacoes_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aprovacoes_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "aprovacoes_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "aprovacoes_cliente_decidido_por_fkey"
            columns: ["decidido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aprovacoes_cliente_decidido_por_fkey"
            columns: ["decidido_por"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "aprovacoes_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aprovacoes_cliente_solicitado_por_fkey"
            columns: ["solicitado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aprovacoes_cliente_solicitado_por_fkey"
            columns: ["solicitado_por"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "aprovacoes_cliente_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas_projeto"
            referencedColumns: ["id"]
          },
        ]
      }
      assinatura_logs: {
        Row: {
          created_at: string
          dados_gov_br: Json | null
          evento: string
          id: string
          ip_usuario: unknown | null
          proposta_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          dados_gov_br?: Json | null
          evento: string
          id?: string
          ip_usuario?: unknown | null
          proposta_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          dados_gov_br?: Json | null
          evento?: string
          id?: string
          ip_usuario?: unknown | null
          proposta_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assinatura_logs_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      assinaturas: {
        Row: {
          anuncios_facebook: boolean
          anuncios_google: boolean
          created_at: string
          id: string
          nome: string
          periodo: string
          posts_mensais: number
          preco: number
          recursos: string[] | null
          reels_suporte: boolean
          status: string
          updated_at: string
        }
        Insert: {
          anuncios_facebook?: boolean
          anuncios_google?: boolean
          created_at?: string
          id: string
          nome: string
          periodo?: string
          posts_mensais: number
          preco: number
          recursos?: string[] | null
          reels_suporte?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          anuncios_facebook?: boolean
          anuncios_google?: boolean
          created_at?: string
          id?: string
          nome?: string
          periodo?: string
          posts_mensais?: number
          preco?: number
          recursos?: string[] | null
          reels_suporte?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      audiovisual_metas: {
        Row: {
          created_at: string
          especialista_id: string
          horas_trabalhadas: number
          id: string
          mes_ano: string
          meta_horas: number
          meta_projetos: number
          projetos_concluidos: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          especialista_id: string
          horas_trabalhadas?: number
          id?: string
          mes_ano: string
          meta_horas?: number
          meta_projetos?: number
          projetos_concluidos?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          especialista_id?: string
          horas_trabalhadas?: number
          id?: string
          mes_ano?: string
          meta_horas?: number
          meta_projetos?: number
          projetos_concluidos?: number
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          after: Json
          before: Json
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          action?: string
          after: Json
          before: Json
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          action?: string
          after?: Json
          before?: Json
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_sensitive_access: {
        Row: {
          action: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          record_id: string | null
          success: boolean
          table_name: string
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          record_id?: string | null
          success?: boolean
          table_name: string
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          record_id?: string | null
          success?: boolean
          table_name?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      brand_assets: {
        Row: {
          cliente_id: string
          created_at: string | null
          created_by: string
          file_path: string
          file_url: string | null
          id: string
          metadata: Json | null
          mime_type: string | null
          nome: string
          tamanho_kb: number | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          created_by: string
          file_path: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          nome: string
          tamanho_kb?: number | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          created_by?: string
          file_path?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          nome?: string
          tamanho_kb?: number | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_assets_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_assets_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "brand_assets_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "brand_assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      briefings: {
        Row: {
          ambiente: string | null
          anexos: string[] | null
          beneficios: string[] | null
          call_to_action: string | null
          captacao: string[] | null
          cliente_id: string
          contexto_estrategico: string | null
          created_at: string | null
          cta: string | null
          data_entrega: string | null
          descricao: string | null
          formato_postagem: string | null
          hashtags: string | null
          id: string
          locucao: string | null
          logo_url: string | null
          manual_marca_url: string | null
          mensagem_chave: string | null
          objetivo: string | null
          objetivo_postagem: string | null
          observacoes: string | null
          pacote_id: string | null
          paleta_fontes_url: string | null
          projeto_gerado_id: string | null
          provas_sociais: string | null
          publico_alvo: string | null
          referencias_visuais: Json | null
          restricoes: string | null
          status_briefing: string | null
          tarefa_id: string
          titulo: string
          tom: string | null
          updated_at: string | null
          veiculacao: string[] | null
        }
        Insert: {
          ambiente?: string | null
          anexos?: string[] | null
          beneficios?: string[] | null
          call_to_action?: string | null
          captacao?: string[] | null
          cliente_id: string
          contexto_estrategico?: string | null
          created_at?: string | null
          cta?: string | null
          data_entrega?: string | null
          descricao?: string | null
          formato_postagem?: string | null
          hashtags?: string | null
          id?: string
          locucao?: string | null
          logo_url?: string | null
          manual_marca_url?: string | null
          mensagem_chave?: string | null
          objetivo?: string | null
          objetivo_postagem?: string | null
          observacoes?: string | null
          pacote_id?: string | null
          paleta_fontes_url?: string | null
          projeto_gerado_id?: string | null
          provas_sociais?: string | null
          publico_alvo?: string | null
          referencias_visuais?: Json | null
          restricoes?: string | null
          status_briefing?: string | null
          tarefa_id: string
          titulo: string
          tom?: string | null
          updated_at?: string | null
          veiculacao?: string[] | null
        }
        Update: {
          ambiente?: string | null
          anexos?: string[] | null
          beneficios?: string[] | null
          call_to_action?: string | null
          captacao?: string[] | null
          cliente_id?: string
          contexto_estrategico?: string | null
          created_at?: string | null
          cta?: string | null
          data_entrega?: string | null
          descricao?: string | null
          formato_postagem?: string | null
          hashtags?: string | null
          id?: string
          locucao?: string | null
          logo_url?: string | null
          manual_marca_url?: string | null
          mensagem_chave?: string | null
          objetivo?: string | null
          objetivo_postagem?: string | null
          observacoes?: string | null
          pacote_id?: string | null
          paleta_fontes_url?: string | null
          projeto_gerado_id?: string | null
          provas_sociais?: string | null
          publico_alvo?: string | null
          referencias_visuais?: Json | null
          restricoes?: string | null
          status_briefing?: string | null
          tarefa_id?: string
          titulo?: string
          tom?: string | null
          updated_at?: string | null
          veiculacao?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "briefings_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "briefings_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "briefings_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "briefings_pacote_id_fkey"
            columns: ["pacote_id"]
            isOneToOne: false
            referencedRelation: "pacotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "briefings_projeto_gerado_id_fkey"
            columns: ["projeto_gerado_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "briefings_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas_projeto"
            referencedColumns: ["id"]
          },
        ]
      }
      calendario_config: {
        Row: {
          capacidade_manha_avulso: number | null
          capacidade_manha_lote: number | null
          capacidade_sabado_lote: number | null
          capacidade_tarde_avulso: number | null
          capacidade_tarde_lote: number | null
          deslocamento_curto: number | null
          deslocamento_longo: number | null
          deslocamento_medio: number | null
          especialidade: string
          flex_manha_fim: string
          flex_manha_inicio: string
          flex_noite_fim: string
          flex_noite_inicio: string
          id: string
          pausa_foco: number | null
          sabado_fim: string
          sabado_inicio: string
          seg_sex_manha_fim: string
          seg_sex_manha_inicio: string
          seg_sex_tarde_fim: string
          seg_sex_tarde_inicio: string
          tempo_criacao_avulso: number | null
          tempo_criacao_lote: number | null
          tempo_descarga_backup: number | null
          tempo_edicao_curta: number | null
          tempo_edicao_longa: number | null
          tempo_planejamento: number | null
          tempo_preparacao_captacao: number | null
          updated_at: string | null
        }
        Insert: {
          capacidade_manha_avulso?: number | null
          capacidade_manha_lote?: number | null
          capacidade_sabado_lote?: number | null
          capacidade_tarde_avulso?: number | null
          capacidade_tarde_lote?: number | null
          deslocamento_curto?: number | null
          deslocamento_longo?: number | null
          deslocamento_medio?: number | null
          especialidade: string
          flex_manha_fim?: string
          flex_manha_inicio?: string
          flex_noite_fim?: string
          flex_noite_inicio?: string
          id?: string
          pausa_foco?: number | null
          sabado_fim?: string
          sabado_inicio?: string
          seg_sex_manha_fim?: string
          seg_sex_manha_inicio?: string
          seg_sex_tarde_fim?: string
          seg_sex_tarde_inicio?: string
          tempo_criacao_avulso?: number | null
          tempo_criacao_lote?: number | null
          tempo_descarga_backup?: number | null
          tempo_edicao_curta?: number | null
          tempo_edicao_longa?: number | null
          tempo_planejamento?: number | null
          tempo_preparacao_captacao?: number | null
          updated_at?: string | null
        }
        Update: {
          capacidade_manha_avulso?: number | null
          capacidade_manha_lote?: number | null
          capacidade_sabado_lote?: number | null
          capacidade_tarde_avulso?: number | null
          capacidade_tarde_lote?: number | null
          deslocamento_curto?: number | null
          deslocamento_longo?: number | null
          deslocamento_medio?: number | null
          especialidade?: string
          flex_manha_fim?: string
          flex_manha_inicio?: string
          flex_noite_fim?: string
          flex_noite_inicio?: string
          id?: string
          pausa_foco?: number | null
          sabado_fim?: string
          sabado_inicio?: string
          seg_sex_manha_fim?: string
          seg_sex_manha_inicio?: string
          seg_sex_tarde_fim?: string
          seg_sex_tarde_inicio?: string
          tempo_criacao_avulso?: number | null
          tempo_criacao_lote?: number | null
          tempo_descarga_backup?: number | null
          tempo_edicao_curta?: number | null
          tempo_edicao_longa?: number | null
          tempo_planejamento?: number | null
          tempo_preparacao_captacao?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      campanha: {
        Row: {
          ativo: boolean | null
          cliente_id: string | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          nome: string
          objetivo: string | null
          orcamento: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cliente_id?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          nome: string
          objetivo?: string | null
          orcamento?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cliente_id?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          nome?: string
          objetivo?: string | null
          orcamento?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campanha_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campanha_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "campanha_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
        ]
      }
      captacoes_agenda: {
        Row: {
          cliente_id: string | null
          created_at: string
          data_captacao: string
          equipamentos: string[] | null
          especialista_id: string
          id: string
          local: string | null
          observacoes: string | null
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_captacao: string
          equipamentos?: string[] | null
          especialista_id: string
          id?: string
          local?: string | null
          observacoes?: string | null
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_captacao?: string
          equipamentos?: string[] | null
          especialista_id?: string
          id?: string
          local?: string | null
          observacoes?: string | null
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_captacoes_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_captacoes_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_captacoes_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_captacoes_especialista"
            columns: ["especialista_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_captacoes_especialista"
            columns: ["especialista_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      categorias_financeiras: {
        Row: {
          cor: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          tipo: string
          updated_at: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          tipo: string
          updated_at?: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      cliente_objetivos: {
        Row: {
          analise_estrategica: string | null
          analise_swot: Json | null
          cliente_id: string
          created_at: string
          id: string
          objetivos: Json
          updated_at: string
        }
        Insert: {
          analise_estrategica?: string | null
          analise_swot?: Json | null
          cliente_id: string
          created_at?: string
          id?: string
          objetivos?: Json
          updated_at?: string
        }
        Update: {
          analise_estrategica?: string | null
          analise_swot?: Json | null
          cliente_id?: string
          created_at?: string
          id?: string
          objetivos?: Json
          updated_at?: string
        }
        Relationships: []
      }
      cliente_onboarding: {
        Row: {
          ameacas: string | null
          area_atendimento: string | null
          assinatura_id: string | null
          canais_atendimento_ativos: string | null
          canais_contato: string | null
          cliente_id: string
          como_encontram: string[] | null
          como_lembrada: string | null
          concorrentes_diretos: string | null
          created_at: string
          diferenciais: string | null
          dores_problemas: string | null
          equipe_vendas_externa: string | null
          estrutura_atual: string | null
          fatores_crise: string | null
          feiras_eventos: string | null
          forcas: string | null
          forma_aquisicao: string[] | null
          fraquezas: string | null
          frequencia_compra: string | null
          frequencia_postagens: string | null
          historia_marca: string | null
          id: string
          localizacao: string | null
          materiais_impressos: string[] | null
          midia_paga: string | null
          midia_tradicional: string[] | null
          nome_empresa: string
          objetivos_digitais: string | null
          objetivos_offline: string | null
          onde_6_meses: string | null
          oportunidades: string | null
          presenca_digital: string[] | null
          presenca_digital_outros: string | null
          produtos_servicos: string | null
          publico_alvo: string[] | null
          publico_alvo_outros: string | null
          relacionamento_clientes: string[] | null
          resultados_esperados: string[] | null
          segmento_atuacao: string | null
          tempo_mercado: string | null
          ticket_medio: string | null
          tipos_clientes: string | null
          tipos_conteudo: string[] | null
          tom_voz: string[] | null
          updated_at: string
          valores_principais: string | null
          valorizado: string | null
        }
        Insert: {
          ameacas?: string | null
          area_atendimento?: string | null
          assinatura_id?: string | null
          canais_atendimento_ativos?: string | null
          canais_contato?: string | null
          cliente_id: string
          como_encontram?: string[] | null
          como_lembrada?: string | null
          concorrentes_diretos?: string | null
          created_at?: string
          diferenciais?: string | null
          dores_problemas?: string | null
          equipe_vendas_externa?: string | null
          estrutura_atual?: string | null
          fatores_crise?: string | null
          feiras_eventos?: string | null
          forcas?: string | null
          forma_aquisicao?: string[] | null
          fraquezas?: string | null
          frequencia_compra?: string | null
          frequencia_postagens?: string | null
          historia_marca?: string | null
          id?: string
          localizacao?: string | null
          materiais_impressos?: string[] | null
          midia_paga?: string | null
          midia_tradicional?: string[] | null
          nome_empresa: string
          objetivos_digitais?: string | null
          objetivos_offline?: string | null
          onde_6_meses?: string | null
          oportunidades?: string | null
          presenca_digital?: string[] | null
          presenca_digital_outros?: string | null
          produtos_servicos?: string | null
          publico_alvo?: string[] | null
          publico_alvo_outros?: string | null
          relacionamento_clientes?: string[] | null
          resultados_esperados?: string[] | null
          segmento_atuacao?: string | null
          tempo_mercado?: string | null
          ticket_medio?: string | null
          tipos_clientes?: string | null
          tipos_conteudo?: string[] | null
          tom_voz?: string[] | null
          updated_at?: string
          valores_principais?: string | null
          valorizado?: string | null
        }
        Update: {
          ameacas?: string | null
          area_atendimento?: string | null
          assinatura_id?: string | null
          canais_atendimento_ativos?: string | null
          canais_contato?: string | null
          cliente_id?: string
          como_encontram?: string[] | null
          como_lembrada?: string | null
          concorrentes_diretos?: string | null
          created_at?: string
          diferenciais?: string | null
          dores_problemas?: string | null
          equipe_vendas_externa?: string | null
          estrutura_atual?: string | null
          fatores_crise?: string | null
          feiras_eventos?: string | null
          forcas?: string | null
          forma_aquisicao?: string[] | null
          fraquezas?: string | null
          frequencia_compra?: string | null
          frequencia_postagens?: string | null
          historia_marca?: string | null
          id?: string
          localizacao?: string | null
          materiais_impressos?: string[] | null
          midia_paga?: string | null
          midia_tradicional?: string[] | null
          nome_empresa?: string
          objetivos_digitais?: string | null
          objetivos_offline?: string | null
          onde_6_meses?: string | null
          oportunidades?: string | null
          presenca_digital?: string[] | null
          presenca_digital_outros?: string | null
          produtos_servicos?: string | null
          publico_alvo?: string[] | null
          publico_alvo_outros?: string | null
          relacionamento_clientes?: string[] | null
          resultados_esperados?: string[] | null
          segmento_atuacao?: string | null
          tempo_mercado?: string | null
          ticket_medio?: string | null
          tipos_clientes?: string | null
          tipos_conteudo?: string[] | null
          tom_voz?: string[] | null
          updated_at?: string
          valores_principais?: string | null
          valorizado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
        ]
      }
      cliente_usuarios: {
        Row: {
          ativo: boolean
          cliente_id: string
          created_at: string
          criado_por: string | null
          id: string
          permissoes: Json | null
          role_cliente: Database["public"]["Enums"]["cliente_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          cliente_id: string
          created_at?: string
          criado_por?: string | null
          id?: string
          permissoes?: Json | null
          role_cliente?: Database["public"]["Enums"]["cliente_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          cliente_id?: string
          created_at?: string
          criado_por?: string | null
          id?: string
          permissoes?: Json | null
          role_cliente?: Database["public"]["Enums"]["cliente_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_usuarios_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_usuarios_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_usuarios_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_usuarios_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_usuarios_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "cliente_usuarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_usuarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      clientes: {
        Row: {
          assinatura_id: string | null
          cnae_principal: string | null
          cnpj_cpf: string | null
          cnpj_fonte: string | null
          cnpj_ultima_consulta: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string
          logo_url: string | null
          nome: string
          nome_fantasia: string | null
          razao_social: string | null
          responsavel_id: string | null
          situacao_cadastral: string | null
          status: Database["public"]["Enums"]["status_type"] | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          assinatura_id?: string | null
          cnae_principal?: string | null
          cnpj_cpf?: string | null
          cnpj_fonte?: string | null
          cnpj_ultima_consulta?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          nome_fantasia?: string | null
          razao_social?: string | null
          responsavel_id?: string | null
          situacao_cadastral?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          assinatura_id?: string | null
          cnae_principal?: string | null
          cnpj_cpf?: string | null
          cnpj_fonte?: string | null
          cnpj_ultima_consulta?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          nome_fantasia?: string | null
          razao_social?: string | null
          responsavel_id?: string | null
          situacao_cadastral?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "fk_clientes_assinatura"
            columns: ["assinatura_id"]
            isOneToOne: false
            referencedRelation: "assinaturas"
            referencedColumns: ["id"]
          },
        ]
      }
      cnpj_consultas: {
        Row: {
          cnpj: string
          created_at: string
          dados_brasil_api: Json | null
          dados_receita_ws: Json | null
          data_consulta: string
          data_situacao: string | null
          fonte_utilizada: string
          id: string
          situacao_cadastral: string | null
          updated_at: string
        }
        Insert: {
          cnpj: string
          created_at?: string
          dados_brasil_api?: Json | null
          dados_receita_ws?: Json | null
          data_consulta?: string
          data_situacao?: string | null
          fonte_utilizada: string
          id?: string
          situacao_cadastral?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string
          created_at?: string
          dados_brasil_api?: Json | null
          dados_receita_ws?: Json | null
          data_consulta?: string
          data_situacao?: string | null
          fonte_utilizada?: string
          id?: string
          situacao_cadastral?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      comentarios_roteiro: {
        Row: {
          autor_id: string | null
          created_at: string
          id: string
          mensagem: string
          roteiro_id: string
          updated_at: string
        }
        Insert: {
          autor_id?: string | null
          created_at?: string
          id?: string
          mensagem: string
          roteiro_id: string
          updated_at?: string
        }
        Update: {
          autor_id?: string | null
          created_at?: string
          id?: string
          mensagem?: string
          roteiro_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_roteiro_roteiro_id_fkey"
            columns: ["roteiro_id"]
            isOneToOne: false
            referencedRelation: "roteiros"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_status: {
        Row: {
          calls_this_hour: number | null
          calls_today: number | null
          connector_name: string
          created_at: string | null
          last_error_at: string | null
          last_error_message: string | null
          last_success_at: string | null
          next_run_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          calls_this_hour?: number | null
          calls_today?: number | null
          connector_name: string
          created_at?: string | null
          last_error_at?: string | null
          last_error_message?: string | null
          last_success_at?: string | null
          next_run_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          calls_this_hour?: number | null
          calls_today?: number | null
          connector_name?: string
          created_at?: string | null
          last_error_at?: string | null
          last_error_message?: string | null
          last_success_at?: string | null
          next_run_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conteudo_editorial: {
        Row: {
          conteudo_gerado: string | null
          created_at: string
          especialistas_selecionados: string[] | null
          frameworks_selecionados: string[] | null
          id: string
          missao: string | null
          persona: string | null
          planejamento_id: string
          posicionamento: string | null
          updated_at: string
        }
        Insert: {
          conteudo_gerado?: string | null
          created_at?: string
          especialistas_selecionados?: string[] | null
          frameworks_selecionados?: string[] | null
          id?: string
          missao?: string | null
          persona?: string | null
          planejamento_id: string
          posicionamento?: string | null
          updated_at?: string
        }
        Update: {
          conteudo_gerado?: string | null
          created_at?: string
          especialistas_selecionados?: string[] | null
          frameworks_selecionados?: string[] | null
          id?: string
          missao?: string | null
          persona?: string | null
          planejamento_id?: string
          posicionamento?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contrato_itens: {
        Row: {
          contrato_id: string | null
          created_at: string | null
          descricao: string
          id: string
          imposto_percent: number | null
          ordem: number | null
          preco_unitario: number
          produto_id: string | null
          quantidade: number
          subtotal_item: number | null
          unidade: string | null
        }
        Insert: {
          contrato_id?: string | null
          created_at?: string | null
          descricao: string
          id?: string
          imposto_percent?: number | null
          ordem?: number | null
          preco_unitario: number
          produto_id?: string | null
          quantidade?: number
          subtotal_item?: number | null
          unidade?: string | null
        }
        Update: {
          contrato_id?: string | null
          created_at?: string | null
          descricao?: string
          id?: string
          imposto_percent?: number | null
          ordem?: number | null
          preco_unitario?: number
          produto_id?: string | null
          quantidade?: number
          subtotal_item?: number | null
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contrato_itens_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contrato_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      contrato_templates: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          corpo_html: string
          created_at: string | null
          id: string
          nome: string
          updated_at: string | null
          variaveis_disponiveis: Json | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          corpo_html: string
          created_at?: string | null
          id?: string
          nome: string
          updated_at?: string | null
          variaveis_disponiveis?: Json | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          corpo_html?: string
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
          variaveis_disponiveis?: Json | null
        }
        Relationships: []
      }
      contratos: {
        Row: {
          anexo_pdf_url: string | null
          arquivo_assinado_url: string | null
          arquivo_url: string | null
          assinado_em: string | null
          assinado_por: string | null
          cliente_id: string
          condicoes_comerciais: string | null
          confidencialidade: boolean | null
          created_at: string
          created_by: string | null
          criado_por: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          escopo: string | null
          foro: string | null
          id: string
          numero: string | null
          projeto_id: string | null
          proposta_id: string | null
          propriedade_intelectual: string | null
          reajuste_indice: string | null
          renovacao: string | null
          rescisao: string | null
          sla: string | null
          status: string
          tipo: string
          titulo: string
          updated_at: string
          updated_by: string | null
          valor_avulso: number | null
          valor_mensal: number | null
          valor_recorrente: number | null
        }
        Insert: {
          anexo_pdf_url?: string | null
          arquivo_assinado_url?: string | null
          arquivo_url?: string | null
          assinado_em?: string | null
          assinado_por?: string | null
          cliente_id: string
          condicoes_comerciais?: string | null
          confidencialidade?: boolean | null
          created_at?: string
          created_by?: string | null
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          escopo?: string | null
          foro?: string | null
          id?: string
          numero?: string | null
          projeto_id?: string | null
          proposta_id?: string | null
          propriedade_intelectual?: string | null
          reajuste_indice?: string | null
          renovacao?: string | null
          rescisao?: string | null
          sla?: string | null
          status?: string
          tipo: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
          valor_avulso?: number | null
          valor_mensal?: number | null
          valor_recorrente?: number | null
        }
        Update: {
          anexo_pdf_url?: string | null
          arquivo_assinado_url?: string | null
          arquivo_url?: string | null
          assinado_em?: string | null
          assinado_por?: string | null
          cliente_id?: string
          condicoes_comerciais?: string | null
          confidencialidade?: boolean | null
          created_at?: string
          created_by?: string | null
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          escopo?: string | null
          foro?: string | null
          id?: string
          numero?: string | null
          projeto_id?: string | null
          proposta_id?: string | null
          propriedade_intelectual?: string | null
          reajuste_indice?: string | null
          renovacao?: string | null
          rescisao?: string | null
          sla?: string | null
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
          valor_avulso?: number | null
          valor_mensal?: number | null
          valor_recorrente?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_assinado_por_fkey"
            columns: ["assinado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_assinado_por_fkey"
            columns: ["assinado_por"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "contratos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "contratos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "contratos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      credenciais_cliente: {
        Row: {
          categoria: string
          cliente_id: string
          created_at: string
          created_by: string | null
          extra: Json | null
          id: string
          plataforma: string
          projeto_id: string | null
          secrets_cipher: string | null
          senha_cipher: string
          updated_at: string
          updated_by: string | null
          usuario_login: string
        }
        Insert: {
          categoria: string
          cliente_id: string
          created_at?: string
          created_by?: string | null
          extra?: Json | null
          id?: string
          plataforma: string
          projeto_id?: string | null
          secrets_cipher?: string | null
          senha_cipher: string
          updated_at?: string
          updated_by?: string | null
          usuario_login: string
        }
        Update: {
          categoria?: string
          cliente_id?: string
          created_at?: string
          created_by?: string | null
          extra?: Json | null
          id?: string
          plataforma?: string
          projeto_id?: string | null
          secrets_cipher?: string | null
          senha_cipher?: string
          updated_at?: string
          updated_by?: string | null
          usuario_login?: string
        }
        Relationships: [
          {
            foreignKeyName: "credenciais_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credenciais_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "credenciais_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "credenciais_cliente_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credenciais_cliente_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "credenciais_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credenciais_cliente_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credenciais_cliente_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      email_logs: {
        Row: {
          assunto: string
          created_at: string
          destinatario_email: string
          destinatario_nome: string | null
          enviado_por: string | null
          erro_mensagem: string | null
          id: string
          resend_id: string | null
          status: string
          template_tipo: string
          variaveis_utilizadas: Json | null
        }
        Insert: {
          assunto: string
          created_at?: string
          destinatario_email: string
          destinatario_nome?: string | null
          enviado_por?: string | null
          erro_mensagem?: string | null
          id?: string
          resend_id?: string | null
          status?: string
          template_tipo: string
          variaveis_utilizadas?: Json | null
        }
        Update: {
          assunto?: string
          created_at?: string
          destinatario_email?: string
          destinatario_nome?: string | null
          enviado_por?: string | null
          erro_mensagem?: string | null
          id?: string
          resend_id?: string | null
          status?: string
          template_tipo?: string
          variaveis_utilizadas?: Json | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          assunto: string
          ativo: boolean
          conteudo_html: string
          conteudo_texto: string | null
          created_at: string
          id: string
          tipo: string
          updated_at: string
          variaveis_disponiveis: string[] | null
        }
        Insert: {
          assunto: string
          ativo?: boolean
          conteudo_html: string
          conteudo_texto?: string | null
          created_at?: string
          id?: string
          tipo: string
          updated_at?: string
          variaveis_disponiveis?: string[] | null
        }
        Update: {
          assunto?: string
          ativo?: boolean
          conteudo_html?: string
          conteudo_texto?: string | null
          created_at?: string
          id?: string
          tipo?: string
          updated_at?: string
          variaveis_disponiveis?: string[] | null
        }
        Relationships: []
      }
      email_verification_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_verification_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_verification_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      equipamentos: {
        Row: {
          created_at: string
          data_reserva: string | null
          id: string
          nome: string
          observacoes: string | null
          responsavel_atual: string | null
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_reserva?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          responsavel_atual?: string | null
          status?: string
          tipo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_reserva?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          responsavel_atual?: string | null
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_equipamentos_responsavel"
            columns: ["responsavel_atual"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_equipamentos_responsavel"
            columns: ["responsavel_atual"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      event_logs: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          payload: Json
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          payload?: Json
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          payload?: Json
        }
        Relationships: []
      }
      eventos_agenda: {
        Row: {
          cliente_id: string | null
          cor: string | null
          created_at: string
          data_fim: string
          data_inicio: string
          descricao: string | null
          id: string
          projeto_id: string | null
          responsavel_id: string | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          cor?: string | null
          created_at?: string
          data_fim: string
          data_inicio: string
          descricao?: string | null
          id?: string
          projeto_id?: string | null
          responsavel_id?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          cor?: string | null
          created_at?: string
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          id?: string
          projeto_id?: string | null
          responsavel_id?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_agenda_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_agenda_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "eventos_agenda_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "eventos_agenda_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_agenda_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_agenda_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      eventos_calendario: {
        Row: {
          cliente_id: string | null
          cor: string | null
          created_at: string | null
          created_by: string | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          duracao_minutos: number | null
          equipamentos_ids: string[] | null
          evento_pai_id: string | null
          id: string
          is_automatico: boolean | null
          is_bloqueante: boolean | null
          is_extra: boolean | null
          local: string | null
          modo_criativo: string | null
          projeto_id: string | null
          quantidade_pecas: number | null
          responsavel_id: string
          status: Database["public"]["Enums"]["status_evento"] | null
          tarefa_id: string | null
          tipo: Database["public"]["Enums"]["tipo_evento"]
          tipo_deslocamento: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          cliente_id?: string | null
          cor?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fim: string
          data_inicio: string
          descricao?: string | null
          duracao_minutos?: number | null
          equipamentos_ids?: string[] | null
          evento_pai_id?: string | null
          id?: string
          is_automatico?: boolean | null
          is_bloqueante?: boolean | null
          is_extra?: boolean | null
          local?: string | null
          modo_criativo?: string | null
          projeto_id?: string | null
          quantidade_pecas?: number | null
          responsavel_id: string
          status?: Database["public"]["Enums"]["status_evento"] | null
          tarefa_id?: string | null
          tipo: Database["public"]["Enums"]["tipo_evento"]
          tipo_deslocamento?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string | null
          cor?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          duracao_minutos?: number | null
          equipamentos_ids?: string[] | null
          evento_pai_id?: string | null
          id?: string
          is_automatico?: boolean | null
          is_bloqueante?: boolean | null
          is_extra?: boolean | null
          local?: string | null
          modo_criativo?: string | null
          projeto_id?: string | null
          quantidade_pecas?: number | null
          responsavel_id?: string
          status?: Database["public"]["Enums"]["status_evento"] | null
          tarefa_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_evento"]
          tipo_deslocamento?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_calendario_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_calendario_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "eventos_calendario_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "eventos_calendario_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_calendario_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "eventos_calendario_evento_pai_id_fkey"
            columns: ["evento_pai_id"]
            isOneToOne: false
            referencedRelation: "eventos_calendario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_calendario_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_calendario_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_calendario_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "eventos_calendario_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas_projeto"
            referencedColumns: ["id"]
          },
        ]
      }
      exportacoes: {
        Row: {
          arquivo_url: string
          cliente_id: string
          created_at: string
          gerado_por: string
          id: string
          plano_id: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          arquivo_url: string
          cliente_id: string
          created_at?: string
          gerado_por: string
          id?: string
          plano_id?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          arquivo_url?: string
          cliente_id?: string
          created_at?: string
          gerado_por?: string
          id?: string
          plano_id?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "exportacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exportacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "exportacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "exportacoes_gerado_por_fkey"
            columns: ["gerado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exportacoes_gerado_por_fkey"
            columns: ["gerado_por"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "exportacoes_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_estrategicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exportacoes_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "vw_planos_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_suporte: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string
          id: string
          ordem: number | null
          pergunta: string
          resposta: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          id?: string
          ordem?: number | null
          pergunta: string
          resposta: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          id?: string
          ordem?: number | null
          pergunta?: string
          resposta?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      faturas: {
        Row: {
          cliente_id: string | null
          comprovante_url: string | null
          contrato_id: string | null
          created_at: string | null
          descricao: string
          id: string
          numero: string | null
          observacoes: string | null
          pago_em: string | null
          projeto_id: string | null
          proposta_id: string | null
          status: string | null
          updated_at: string | null
          valor: number
          vencimento: string
        }
        Insert: {
          cliente_id?: string | null
          comprovante_url?: string | null
          contrato_id?: string | null
          created_at?: string | null
          descricao: string
          id?: string
          numero?: string | null
          observacoes?: string | null
          pago_em?: string | null
          projeto_id?: string | null
          proposta_id?: string | null
          status?: string | null
          updated_at?: string | null
          valor: number
          vencimento: string
        }
        Update: {
          cliente_id?: string | null
          comprovante_url?: string | null
          contrato_id?: string | null
          created_at?: string | null
          descricao?: string
          id?: string
          numero?: string | null
          observacoes?: string | null
          pago_em?: string | null
          projeto_id?: string | null
          proposta_id?: string | null
          status?: string | null
          updated_at?: string | null
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "faturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "faturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "faturas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_adiantamentos: {
        Row: {
          banco_conta: string | null
          chave_pix: string | null
          colaborador_id: string
          competencia: string
          comprovante_url: string | null
          created_at: string | null
          criado_por: string | null
          data_adiantamento: string
          folha_item_id: string | null
          forma_pagamento: string
          id: string
          observacao: string | null
          pessoa_id: string | null
          status: string | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          banco_conta?: string | null
          chave_pix?: string | null
          colaborador_id: string
          competencia: string
          comprovante_url?: string | null
          created_at?: string | null
          criado_por?: string | null
          data_adiantamento: string
          folha_item_id?: string | null
          forma_pagamento: string
          id?: string
          observacao?: string | null
          pessoa_id?: string | null
          status?: string | null
          updated_at?: string | null
          valor: number
        }
        Update: {
          banco_conta?: string | null
          chave_pix?: string | null
          colaborador_id?: string
          competencia?: string
          comprovante_url?: string | null
          created_at?: string | null
          criado_por?: string | null
          data_adiantamento?: string
          folha_item_id?: string | null
          forma_pagamento?: string
          id?: string
          observacao?: string | null
          pessoa_id?: string | null
          status?: string | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_adiantamentos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_adiantamentos_folha_item_id_fkey"
            columns: ["folha_item_id"]
            isOneToOne: false
            referencedRelation: "financeiro_folha_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_adiantamentos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "especialistas_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_adiantamentos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_adiantamentos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_adiantamento_pessoa"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "especialistas_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_adiantamento_pessoa"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_adiantamento_pessoa"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores_view"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_faixas_inss: {
        Row: {
          aliquota: number
          created_at: string | null
          faixa: number
          id: string
          is_ativo: boolean | null
          parcela_deduzir: number | null
          salario_ate: number | null
          salario_de: number
          teto_maximo: number | null
          updated_at: string | null
          vigencia_fim: string | null
          vigencia_inicio: string
        }
        Insert: {
          aliquota: number
          created_at?: string | null
          faixa: number
          id?: string
          is_ativo?: boolean | null
          parcela_deduzir?: number | null
          salario_ate?: number | null
          salario_de: number
          teto_maximo?: number | null
          updated_at?: string | null
          vigencia_fim?: string | null
          vigencia_inicio: string
        }
        Update: {
          aliquota?: number
          created_at?: string | null
          faixa?: number
          id?: string
          is_ativo?: boolean | null
          parcela_deduzir?: number | null
          salario_ate?: number | null
          salario_de?: number
          teto_maximo?: number | null
          updated_at?: string | null
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Relationships: []
      }
      financeiro_faixas_irrf: {
        Row: {
          aliquota: number
          base_calculo_ate: number | null
          base_calculo_de: number
          created_at: string | null
          faixa: number
          id: string
          is_ativo: boolean | null
          parcela_deduzir: number | null
          updated_at: string | null
          vigencia_fim: string | null
          vigencia_inicio: string
        }
        Insert: {
          aliquota: number
          base_calculo_ate?: number | null
          base_calculo_de: number
          created_at?: string | null
          faixa: number
          id?: string
          is_ativo?: boolean | null
          parcela_deduzir?: number | null
          updated_at?: string | null
          vigencia_fim?: string | null
          vigencia_inicio: string
        }
        Update: {
          aliquota?: number
          base_calculo_ate?: number | null
          base_calculo_de?: number
          created_at?: string | null
          faixa?: number
          id?: string
          is_ativo?: boolean | null
          parcela_deduzir?: number | null
          updated_at?: string | null
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Relationships: []
      }
      financeiro_folha: {
        Row: {
          ano: number
          centro_custo: string | null
          competencia: string
          created_at: string | null
          fechada_em: string | null
          fechada_por: string | null
          id: string
          mes: number
          processada_em: string | null
          processada_por: string | null
          status: Database["public"]["Enums"]["status_folha"] | null
          total_colaboradores: number | null
          total_descontos: number | null
          total_encargos: number | null
          total_liquido: number | null
          total_proventos: number | null
          unidade_filial: string | null
          updated_at: string | null
        }
        Insert: {
          ano: number
          centro_custo?: string | null
          competencia: string
          created_at?: string | null
          fechada_em?: string | null
          fechada_por?: string | null
          id?: string
          mes: number
          processada_em?: string | null
          processada_por?: string | null
          status?: Database["public"]["Enums"]["status_folha"] | null
          total_colaboradores?: number | null
          total_descontos?: number | null
          total_encargos?: number | null
          total_liquido?: number | null
          total_proventos?: number | null
          unidade_filial?: string | null
          updated_at?: string | null
        }
        Update: {
          ano?: number
          centro_custo?: string | null
          competencia?: string
          created_at?: string | null
          fechada_em?: string | null
          fechada_por?: string | null
          id?: string
          mes?: number
          processada_em?: string | null
          processada_por?: string | null
          status?: Database["public"]["Enums"]["status_folha"] | null
          total_colaboradores?: number | null
          total_descontos?: number | null
          total_encargos?: number | null
          total_liquido?: number | null
          total_proventos?: number | null
          unidade_filial?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      financeiro_folha_itens: {
        Row: {
          base_calculo: number | null
          colaborador_id: string
          comprovante_url: string | null
          created_at: string | null
          data_pagamento: string | null
          descontos: Json | null
          encargos: Json | null
          folha_id: string
          forma_pagamento: string | null
          id: string
          liquido: number | null
          pago_por: string | null
          pessoa_id: string | null
          proventos: Json | null
          status: Database["public"]["Enums"]["status_item_folha"] | null
          total_descontos: number | null
          total_encargos: number | null
          total_proventos: number | null
          updated_at: string | null
        }
        Insert: {
          base_calculo?: number | null
          colaborador_id: string
          comprovante_url?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          descontos?: Json | null
          encargos?: Json | null
          folha_id: string
          forma_pagamento?: string | null
          id?: string
          liquido?: number | null
          pago_por?: string | null
          pessoa_id?: string | null
          proventos?: Json | null
          status?: Database["public"]["Enums"]["status_item_folha"] | null
          total_descontos?: number | null
          total_encargos?: number | null
          total_proventos?: number | null
          updated_at?: string | null
        }
        Update: {
          base_calculo?: number | null
          colaborador_id?: string
          comprovante_url?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          descontos?: Json | null
          encargos?: Json | null
          folha_id?: string
          forma_pagamento?: string | null
          id?: string
          liquido?: number | null
          pago_por?: string | null
          pessoa_id?: string | null
          proventos?: Json | null
          status?: Database["public"]["Enums"]["status_item_folha"] | null
          total_descontos?: number | null
          total_encargos?: number | null
          total_proventos?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_folha_itens_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_folha_itens_folha_id_fkey"
            columns: ["folha_id"]
            isOneToOne: false
            referencedRelation: "financeiro_folha"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_folha_itens_pessoa"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "especialistas_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_folha_itens_pessoa"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_folha_itens_pessoa"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores_view"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_folha_logs: {
        Row: {
          acao: string
          created_at: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          folha_id: string
          id: string
          observacoes: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          folha_id: string
          id?: string
          observacoes?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          folha_id?: string
          id?: string
          observacoes?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_folha_logs_folha_id_fkey"
            columns: ["folha_id"]
            isOneToOne: false
            referencedRelation: "financeiro_folha"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_historico_salarial: {
        Row: {
          aprovado_por: string | null
          cargo_anterior: string | null
          cargo_novo: string | null
          colaborador_id: string
          created_at: string | null
          created_by: string | null
          data_vigencia: string
          id: string
          justificativa: string | null
          metadata: Json | null
          motivo: string | null
          pessoa_id: string | null
          salario_anterior: number | null
          salario_novo: number
          tipo_alteracao: string
        }
        Insert: {
          aprovado_por?: string | null
          cargo_anterior?: string | null
          cargo_novo?: string | null
          colaborador_id: string
          created_at?: string | null
          created_by?: string | null
          data_vigencia: string
          id?: string
          justificativa?: string | null
          metadata?: Json | null
          motivo?: string | null
          pessoa_id?: string | null
          salario_anterior?: number | null
          salario_novo: number
          tipo_alteracao: string
        }
        Update: {
          aprovado_por?: string | null
          cargo_anterior?: string | null
          cargo_novo?: string | null
          colaborador_id?: string
          created_at?: string | null
          created_by?: string | null
          data_vigencia?: string
          id?: string
          justificativa?: string | null
          metadata?: Json | null
          motivo?: string | null
          pessoa_id?: string | null
          salario_anterior?: number | null
          salario_novo?: number
          tipo_alteracao?: string
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_historico_salarial_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_historico_pessoa"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "especialistas_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_historico_pessoa"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_historico_pessoa"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores_view"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_lancamentos: {
        Row: {
          centro_custo: string | null
          conta_credito_id: string
          conta_debito_id: string
          created_at: string | null
          created_by: string | null
          data_lancamento: string
          descricao: string
          id: string
          numero_lancamento: number
          origem_id: string | null
          tipo_origem: string
          unidade: string | null
          valor: number
        }
        Insert: {
          centro_custo?: string | null
          conta_credito_id: string
          conta_debito_id: string
          created_at?: string | null
          created_by?: string | null
          data_lancamento: string
          descricao: string
          id?: string
          numero_lancamento?: number
          origem_id?: string | null
          tipo_origem: string
          unidade?: string | null
          valor: number
        }
        Update: {
          centro_custo?: string | null
          conta_credito_id?: string
          conta_debito_id?: string
          created_at?: string | null
          created_by?: string | null
          data_lancamento?: string
          descricao?: string
          id?: string
          numero_lancamento?: number
          origem_id?: string | null
          tipo_origem?: string
          unidade?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_lancamentos_conta_credito_id_fkey"
            columns: ["conta_credito_id"]
            isOneToOne: false
            referencedRelation: "financeiro_plano_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_conta_debito_id_fkey"
            columns: ["conta_debito_id"]
            isOneToOne: false
            referencedRelation: "financeiro_plano_contas"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_parametros_fiscais: {
        Row: {
          aliquota_fgts: number | null
          competencia: string
          created_at: string | null
          id: string
          is_ativo: boolean | null
          salario_minimo: number
          teto_inss: number
          updated_at: string | null
          valor_dependente_irrf: number | null
        }
        Insert: {
          aliquota_fgts?: number | null
          competencia: string
          created_at?: string | null
          id?: string
          is_ativo?: boolean | null
          salario_minimo: number
          teto_inss: number
          updated_at?: string | null
          valor_dependente_irrf?: number | null
        }
        Update: {
          aliquota_fgts?: number | null
          competencia?: string
          created_at?: string | null
          id?: string
          is_ativo?: boolean | null
          salario_minimo?: number
          teto_inss?: number
          updated_at?: string | null
          valor_dependente_irrf?: number | null
        }
        Relationships: []
      }
      financeiro_plano_contas: {
        Row: {
          aceita_lancamento: boolean | null
          ativo: boolean | null
          codigo: string
          conta_pai_id: string | null
          created_at: string | null
          id: string
          natureza: string
          nivel: number
          nome: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          aceita_lancamento?: boolean | null
          ativo?: boolean | null
          codigo: string
          conta_pai_id?: string | null
          created_at?: string | null
          id?: string
          natureza: string
          nivel: number
          nome: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          aceita_lancamento?: boolean | null
          ativo?: boolean | null
          codigo?: string
          conta_pai_id?: string | null
          created_at?: string | null
          id?: string
          natureza?: string
          nivel?: number
          nome?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_plano_contas_conta_pai_id_fkey"
            columns: ["conta_pai_id"]
            isOneToOne: false
            referencedRelation: "financeiro_plano_contas"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_previsao: {
        Row: {
          created_at: string
          data_inicio: string
          id: string
          observacoes: string | null
          parcelas: number
          proposta_id: string
          status: string
          updated_at: string
          valor_mensal: number
        }
        Insert: {
          created_at?: string
          data_inicio: string
          id?: string
          observacoes?: string | null
          parcelas?: number
          proposta_id: string
          status?: string
          updated_at?: string
          valor_mensal: number
        }
        Update: {
          created_at?: string
          data_inicio?: string
          id?: string
          observacoes?: string | null
          parcelas?: number
          proposta_id?: string
          status?: string
          updated_at?: string
          valor_mensal?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_previsao_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_rubricas: {
        Row: {
          ativo: boolean | null
          base_calculo: string | null
          centro_custo_padrao: string | null
          codigo: string
          conta_contabil: string | null
          created_at: string | null
          id: string
          incide_fgts: boolean | null
          incide_inss: boolean | null
          incide_irrf: boolean | null
          nome: string
          percentual_padrao: number | null
          tipo: Database["public"]["Enums"]["tipo_rubrica"]
          updated_at: string | null
          valor_padrao: number | null
        }
        Insert: {
          ativo?: boolean | null
          base_calculo?: string | null
          centro_custo_padrao?: string | null
          codigo: string
          conta_contabil?: string | null
          created_at?: string | null
          id?: string
          incide_fgts?: boolean | null
          incide_inss?: boolean | null
          incide_irrf?: boolean | null
          nome: string
          percentual_padrao?: number | null
          tipo: Database["public"]["Enums"]["tipo_rubrica"]
          updated_at?: string | null
          valor_padrao?: number | null
        }
        Update: {
          ativo?: boolean | null
          base_calculo?: string | null
          centro_custo_padrao?: string | null
          codigo?: string
          conta_contabil?: string | null
          created_at?: string | null
          id?: string
          incide_fgts?: boolean | null
          incide_inss?: boolean | null
          incide_irrf?: boolean | null
          nome?: string
          percentual_padrao?: number | null
          tipo?: Database["public"]["Enums"]["tipo_rubrica"]
          updated_at?: string | null
          valor_padrao?: number | null
        }
        Relationships: []
      }
      folha_mes: {
        Row: {
          competencia: string
          created_at: string | null
          id: string
          pessoa_id: string | null
          resumo: Json | null
          salario_base: number
          status: string
          total_a_pagar: number
          total_adiantamentos: number
          total_descontos: number
          total_extras: number
          updated_at: string | null
        }
        Insert: {
          competencia: string
          created_at?: string | null
          id?: string
          pessoa_id?: string | null
          resumo?: Json | null
          salario_base?: number
          status?: string
          total_a_pagar?: number
          total_adiantamentos?: number
          total_descontos?: number
          total_extras?: number
          updated_at?: string | null
        }
        Update: {
          competencia?: string
          created_at?: string | null
          id?: string
          pessoa_id?: string | null
          resumo?: Json | null
          salario_base?: number
          status?: string
          total_a_pagar?: number
          total_adiantamentos?: number
          total_descontos?: number
          total_extras?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folha_mes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "especialistas_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folha_mes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folha_mes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores_view"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionarios: {
        Row: {
          agencia: string | null
          ativo: boolean | null
          banco: string | null
          banco_horas: Json | null
          celular: string | null
          centro_custo: string | null
          conta: string | null
          cpf_cnpj: string
          created_at: string | null
          data_nascimento: string | null
          email: string | null
          funcao_cargo: string | null
          gestor_imediato: string | null
          id: string
          nome_completo: string
          papeis: string[] | null
          perfil_acesso: string | null
          pix_chave: string | null
          pix_tipo: Database["public"]["Enums"]["pix_tipo_enum"] | null
          politica_extra: string | null
          politica_faltas: string | null
          retencoes_impostos: Json | null
          rg: string | null
          salario_base: number | null
          status_acesso:
            | Database["public"]["Enums"]["status_acesso_enum"]
            | null
          tabela_hora: number | null
          telefone: string | null
          termos_assinados: Json | null
          tipo_vinculo: Database["public"]["Enums"]["tipo_vinculo_enum"] | null
          updated_at: string | null
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean | null
          banco?: string | null
          banco_horas?: Json | null
          celular?: string | null
          centro_custo?: string | null
          conta?: string | null
          cpf_cnpj: string
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          funcao_cargo?: string | null
          gestor_imediato?: string | null
          id?: string
          nome_completo: string
          papeis?: string[] | null
          perfil_acesso?: string | null
          pix_chave?: string | null
          pix_tipo?: Database["public"]["Enums"]["pix_tipo_enum"] | null
          politica_extra?: string | null
          politica_faltas?: string | null
          retencoes_impostos?: Json | null
          rg?: string | null
          salario_base?: number | null
          status_acesso?:
            | Database["public"]["Enums"]["status_acesso_enum"]
            | null
          tabela_hora?: number | null
          telefone?: string | null
          termos_assinados?: Json | null
          tipo_vinculo?: Database["public"]["Enums"]["tipo_vinculo_enum"] | null
          updated_at?: string | null
        }
        Update: {
          agencia?: string | null
          ativo?: boolean | null
          banco?: string | null
          banco_horas?: Json | null
          celular?: string | null
          centro_custo?: string | null
          conta?: string | null
          cpf_cnpj?: string
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          funcao_cargo?: string | null
          gestor_imediato?: string | null
          id?: string
          nome_completo?: string
          papeis?: string[] | null
          perfil_acesso?: string | null
          pix_chave?: string | null
          pix_tipo?: Database["public"]["Enums"]["pix_tipo_enum"] | null
          politica_extra?: string | null
          politica_faltas?: string | null
          retencoes_impostos?: Json | null
          rg?: string | null
          salario_base?: number | null
          status_acesso?:
            | Database["public"]["Enums"]["status_acesso_enum"]
            | null
          tabela_hora?: number | null
          telefone?: string | null
          termos_assinados?: Json | null
          tipo_vinculo?: Database["public"]["Enums"]["tipo_vinculo_enum"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funcionarios_gestor_imediato_fkey"
            columns: ["gestor_imediato"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionarios_gestor_imediato_fkey"
            columns: ["gestor_imediato"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_especialistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionarios_perfil_acesso_fkey"
            columns: ["perfil_acesso"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionarios_perfil_acesso_fkey"
            columns: ["perfil_acesso"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      gamificacao_conquistas: {
        Row: {
          created_at: string
          id: string
          mes_referencia: string
          selo_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mes_referencia?: string
          selo_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mes_referencia?: string
          selo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamificacao_conquistas_selo_id_fkey"
            columns: ["selo_id"]
            isOneToOne: false
            referencedRelation: "gamificacao_selos"
            referencedColumns: ["id"]
          },
        ]
      }
      gamificacao_pontos: {
        Row: {
          created_at: string
          created_by: string | null
          descricao: string | null
          id: string
          is_privado: boolean | null
          mes_referencia: string
          pontos: number
          tipo_acao: Database["public"]["Enums"]["tipo_pontuacao"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          is_privado?: boolean | null
          mes_referencia?: string
          pontos: number
          tipo_acao: Database["public"]["Enums"]["tipo_pontuacao"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          is_privado?: boolean | null
          mes_referencia?: string
          pontos?: number
          tipo_acao?: Database["public"]["Enums"]["tipo_pontuacao"]
          user_id?: string
        }
        Relationships: []
      }
      gamificacao_premios: {
        Row: {
          created_at: string
          descricao: string | null
          entregue: boolean | null
          id: string
          mes_referencia: string
          nome: string
          setor: Database["public"]["Enums"]["especialidade_gamificacao"]
          valor_estimado: number | null
          vencedor_id: string | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          entregue?: boolean | null
          id?: string
          mes_referencia: string
          nome: string
          setor: Database["public"]["Enums"]["especialidade_gamificacao"]
          valor_estimado?: number | null
          vencedor_id?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          entregue?: boolean | null
          id?: string
          mes_referencia?: string
          nome?: string
          setor?: Database["public"]["Enums"]["especialidade_gamificacao"]
          valor_estimado?: number | null
          vencedor_id?: string | null
        }
        Relationships: []
      }
      gamificacao_ranking: {
        Row: {
          created_at: string
          id: string
          is_vencedor: boolean | null
          mes_referencia: string
          pontos_totais: number
          posicao: number
          setor: Database["public"]["Enums"]["especialidade_gamificacao"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_vencedor?: boolean | null
          mes_referencia?: string
          pontos_totais: number
          posicao: number
          setor: Database["public"]["Enums"]["especialidade_gamificacao"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_vencedor?: boolean | null
          mes_referencia?: string
          pontos_totais?: number
          posicao?: number
          setor?: Database["public"]["Enums"]["especialidade_gamificacao"]
          user_id?: string
        }
        Relationships: []
      }
      gamificacao_selos: {
        Row: {
          condicao: Json
          created_at: string
          descricao: string
          icone: string
          id: string
          nome: string
          setor: Database["public"]["Enums"]["especialidade_gamificacao"] | null
        }
        Insert: {
          condicao: Json
          created_at?: string
          descricao: string
          icone: string
          id?: string
          nome: string
          setor?:
            | Database["public"]["Enums"]["especialidade_gamificacao"]
            | null
        }
        Update: {
          condicao?: Json
          created_at?: string
          descricao?: string
          icone?: string
          id?: string
          nome?: string
          setor?:
            | Database["public"]["Enums"]["especialidade_gamificacao"]
            | null
        }
        Relationships: []
      }
      gamificacao_usuarios: {
        Row: {
          created_at: string
          id: string
          pontos_mes_atual: number
          pontos_totais: number
          posicao_ranking: number | null
          selos_conquistados: Json | null
          setor: Database["public"]["Enums"]["especialidade_gamificacao"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pontos_mes_atual?: number
          pontos_totais?: number
          posicao_ranking?: number | null
          selos_conquistados?: Json | null
          setor: Database["public"]["Enums"]["especialidade_gamificacao"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pontos_mes_atual?: number
          pontos_totais?: number
          posicao_ranking?: number | null
          selos_conquistados?: Json | null
          setor?: Database["public"]["Enums"]["especialidade_gamificacao"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      homologacao_checklist: {
        Row: {
          created_at: string | null
          esforco: string | null
          evidencia_dados: Json | null
          evidencia_url: string | null
          id: string
          impacto: string | null
          item: string
          modulo: string
          observacoes: string | null
          prioridade: string | null
          solucao_sugerida: string | null
          status: string | null
          testado_em: string | null
          testado_por: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          esforco?: string | null
          evidencia_dados?: Json | null
          evidencia_url?: string | null
          id?: string
          impacto?: string | null
          item: string
          modulo: string
          observacoes?: string | null
          prioridade?: string | null
          solucao_sugerida?: string | null
          status?: string | null
          testado_em?: string | null
          testado_por?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          esforco?: string | null
          evidencia_dados?: Json | null
          evidencia_url?: string | null
          id?: string
          impacto?: string | null
          item?: string
          modulo?: string
          observacoes?: string | null
          prioridade?: string | null
          solucao_sugerida?: string | null
          status?: string | null
          testado_em?: string | null
          testado_por?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homologacao_checklist_testado_por_fkey"
            columns: ["testado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homologacao_checklist_testado_por_fkey"
            columns: ["testado_por"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      homologacao_logs: {
        Row: {
          acao: string
          created_at: string | null
          evidencias: Json | null
          executado_por: string | null
          id: string
          modulo: string | null
          resultado: Json | null
        }
        Insert: {
          acao: string
          created_at?: string | null
          evidencias?: Json | null
          executado_por?: string | null
          id?: string
          modulo?: string | null
          resultado?: Json | null
        }
        Update: {
          acao?: string
          created_at?: string | null
          evidencias?: Json | null
          executado_por?: string | null
          id?: string
          modulo?: string | null
          resultado?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "homologacao_logs_executado_por_fkey"
            columns: ["executado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homologacao_logs_executado_por_fkey"
            columns: ["executado_por"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      intelligence_alerts: {
        Row: {
          alert_type: string
          cliente_id: string | null
          conditions: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          severity: string | null
          updated_at: string | null
        }
        Insert: {
          alert_type: string
          cliente_id?: string | null
          conditions: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          severity?: string | null
          updated_at?: string | null
        }
        Update: {
          alert_type?: string
          cliente_id?: string | null
          conditions?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          severity?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_alerts_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intelligence_alerts_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "intelligence_alerts_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
        ]
      }
      intelligence_data: {
        Row: {
          content: string | null
          data_type: string
          external_id: string | null
          id: string
          keywords: string[] | null
          metric_type: string | null
          metric_value: number | null
          published_at: string | null
          raw_payload: Json | null
          region: string | null
          retrieved_at: string | null
          source_id: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          content?: string | null
          data_type: string
          external_id?: string | null
          id?: string
          keywords?: string[] | null
          metric_type?: string | null
          metric_value?: number | null
          published_at?: string | null
          raw_payload?: Json | null
          region?: string | null
          retrieved_at?: string | null
          source_id?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          content?: string | null
          data_type?: string
          external_id?: string | null
          id?: string
          keywords?: string[] | null
          metric_type?: string | null
          metric_value?: number | null
          published_at?: string | null
          raw_payload?: Json | null
          region?: string | null
          retrieved_at?: string | null
          source_id?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_data_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "intelligence_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_sources: {
        Row: {
          auth_key_env: string | null
          created_at: string | null
          endpoint_url: string
          headers: Json | null
          id: string
          is_active: boolean | null
          method: string | null
          name: string
          params: Json | null
          rate_limit_per_hour: number | null
          requires_auth: boolean | null
          ttl_minutes: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          auth_key_env?: string | null
          created_at?: string | null
          endpoint_url: string
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          method?: string | null
          name: string
          params?: Json | null
          rate_limit_per_hour?: number | null
          requires_auth?: boolean | null
          ttl_minutes?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          auth_key_env?: string | null
          created_at?: string | null
          endpoint_url?: string
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          method?: string | null
          name?: string
          params?: Json | null
          rate_limit_per_hour?: number | null
          requires_auth?: boolean | null
          ttl_minutes?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inventario_alugueis: {
        Row: {
          caucao_forma: string | null
          caucao_valor: number | null
          cliente_id: string | null
          contato: string
          created_at: string | null
          data_devolucao_prevista: string
          data_devolucao_real: string | null
          data_retirada: string
          desconto: number | null
          email: string | null
          financeiro_status: string | null
          id: string
          itens: Json
          observacoes: string | null
          operacional_status: string | null
          telefone: string | null
          termo_assinado_id: string | null
          total: number
          trace_id: string | null
        }
        Insert: {
          caucao_forma?: string | null
          caucao_valor?: number | null
          cliente_id?: string | null
          contato: string
          created_at?: string | null
          data_devolucao_prevista: string
          data_devolucao_real?: string | null
          data_retirada: string
          desconto?: number | null
          email?: string | null
          financeiro_status?: string | null
          id?: string
          itens: Json
          observacoes?: string | null
          operacional_status?: string | null
          telefone?: string | null
          termo_assinado_id?: string | null
          total: number
          trace_id?: string | null
        }
        Update: {
          caucao_forma?: string | null
          caucao_valor?: number | null
          cliente_id?: string | null
          contato?: string
          created_at?: string | null
          data_devolucao_prevista?: string
          data_devolucao_real?: string | null
          data_retirada?: string
          desconto?: number | null
          email?: string | null
          financeiro_status?: string | null
          id?: string
          itens?: Json
          observacoes?: string | null
          operacional_status?: string | null
          telefone?: string | null
          termo_assinado_id?: string | null
          total?: number
          trace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventario_alugueis_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_alugueis_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "inventario_alugueis_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "inventario_alugueis_termo_assinado_id_fkey"
            columns: ["termo_assinado_id"]
            isOneToOne: false
            referencedRelation: "inventario_termos_assinados"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_categorias: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inventario_imagens: {
        Row: {
          id: string
          item_id: string | null
          legenda: string | null
          tipo: string
          uploaded_at: string | null
          url: string
        }
        Insert: {
          id?: string
          item_id?: string | null
          legenda?: string | null
          tipo: string
          uploaded_at?: string | null
          url: string
        }
        Update: {
          id?: string
          item_id?: string | null
          legenda?: string | null
          tipo?: string
          uploaded_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventario_imagens_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventario_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_itens: {
        Row: {
          ativo: boolean | null
          atualizado_por: string | null
          caucao_sugerida: number | null
          condicao: string | null
          created_at: string | null
          criado_por: string | null
          data_aquisicao: string | null
          eh_multiunidade: boolean | null
          fornecedor: string | null
          garantia_ate: string | null
          habilitar_aluguel: boolean | null
          id: string
          identificacao_interna: string
          localizacao_atual: string | null
          modelo_id: string | null
          numero_serie: string | null
          observacoes: string | null
          politica_multa_dano: string | null
          preco_diaria: number | null
          preco_meio_periodo: number | null
          quantidade_total: number | null
          taxa_atraso_dia: number | null
          updated_at: string | null
          valor_aquisicao: number | null
          vida_util_meses: number | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_por?: string | null
          caucao_sugerida?: number | null
          condicao?: string | null
          created_at?: string | null
          criado_por?: string | null
          data_aquisicao?: string | null
          eh_multiunidade?: boolean | null
          fornecedor?: string | null
          garantia_ate?: string | null
          habilitar_aluguel?: boolean | null
          id?: string
          identificacao_interna: string
          localizacao_atual?: string | null
          modelo_id?: string | null
          numero_serie?: string | null
          observacoes?: string | null
          politica_multa_dano?: string | null
          preco_diaria?: number | null
          preco_meio_periodo?: number | null
          quantidade_total?: number | null
          taxa_atraso_dia?: number | null
          updated_at?: string | null
          valor_aquisicao?: number | null
          vida_util_meses?: number | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_por?: string | null
          caucao_sugerida?: number | null
          condicao?: string | null
          created_at?: string | null
          criado_por?: string | null
          data_aquisicao?: string | null
          eh_multiunidade?: boolean | null
          fornecedor?: string | null
          garantia_ate?: string | null
          habilitar_aluguel?: boolean | null
          id?: string
          identificacao_interna?: string
          localizacao_atual?: string | null
          modelo_id?: string | null
          numero_serie?: string | null
          observacoes?: string | null
          politica_multa_dano?: string | null
          preco_diaria?: number | null
          preco_meio_periodo?: number | null
          quantidade_total?: number | null
          taxa_atraso_dia?: number | null
          updated_at?: string | null
          valor_aquisicao?: number | null
          vida_util_meses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventario_itens_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_itens_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "inventario_itens_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_itens_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "inventario_itens_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "inventario_modelos"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_manutencoes: {
        Row: {
          anexos: Json | null
          created_at: string | null
          custo_estimado: number | null
          custo_final: number | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string
          fornecedor: string | null
          id: string
          item_id: string | null
          status: string | null
          tipo: string
          unidade_id: string | null
        }
        Insert: {
          anexos?: Json | null
          created_at?: string | null
          custo_estimado?: number | null
          custo_final?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao: string
          fornecedor?: string | null
          id?: string
          item_id?: string | null
          status?: string | null
          tipo: string
          unidade_id?: string | null
        }
        Update: {
          anexos?: Json | null
          created_at?: string | null
          custo_estimado?: number | null
          custo_final?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string
          fornecedor?: string | null
          id?: string
          item_id?: string | null
          status?: string | null
          tipo?: string
          unidade_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventario_manutencoes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventario_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_manutencoes_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "inventario_unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_modelos: {
        Row: {
          categoria_id: string | null
          created_at: string | null
          especificacoes: Json | null
          foto_capa: string | null
          id: string
          marca: string
          modelo: string
          updated_at: string | null
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string | null
          especificacoes?: Json | null
          foto_capa?: string | null
          id?: string
          marca: string
          modelo: string
          updated_at?: string | null
        }
        Update: {
          categoria_id?: string | null
          created_at?: string | null
          especificacoes?: Json | null
          foto_capa?: string | null
          id?: string
          marca?: string
          modelo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventario_modelos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "inventario_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_movimentacoes: {
        Row: {
          checklist_entrada: Json | null
          checklist_saida: Json | null
          cliente_id: string | null
          created_at: string | null
          data_mov_entrada: string | null
          data_mov_saida: string | null
          data_prevista_retorno: string | null
          id: string
          item_id: string | null
          observacoes: string | null
          origem_contexto: string | null
          projeto_id: string | null
          quantidade: number | null
          responsavel_id: string | null
          status_mov: string | null
          tarefa_id: string | null
          termo_assinado_id: string | null
          tipo: string
          trace_id: string | null
          unidade_id: string | null
        }
        Insert: {
          checklist_entrada?: Json | null
          checklist_saida?: Json | null
          cliente_id?: string | null
          created_at?: string | null
          data_mov_entrada?: string | null
          data_mov_saida?: string | null
          data_prevista_retorno?: string | null
          id?: string
          item_id?: string | null
          observacoes?: string | null
          origem_contexto?: string | null
          projeto_id?: string | null
          quantidade?: number | null
          responsavel_id?: string | null
          status_mov?: string | null
          tarefa_id?: string | null
          termo_assinado_id?: string | null
          tipo: string
          trace_id?: string | null
          unidade_id?: string | null
        }
        Update: {
          checklist_entrada?: Json | null
          checklist_saida?: Json | null
          cliente_id?: string | null
          created_at?: string | null
          data_mov_entrada?: string | null
          data_mov_saida?: string | null
          data_prevista_retorno?: string | null
          id?: string
          item_id?: string | null
          observacoes?: string | null
          origem_contexto?: string | null
          projeto_id?: string | null
          quantidade?: number | null
          responsavel_id?: string | null
          status_mov?: string | null
          tarefa_id?: string | null
          termo_assinado_id?: string | null
          tipo?: string
          trace_id?: string | null
          unidade_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventario_movimentacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_movimentacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "inventario_movimentacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "inventario_movimentacoes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventario_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_movimentacoes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_movimentacoes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_movimentacoes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "inventario_movimentacoes_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas_projeto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_movimentacoes_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "inventario_unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_reservas: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          criado_por: string | null
          fim: string
          id: string
          inicio: string
          item_id: string | null
          projeto_id: string | null
          status_reserva: string | null
          tarefa_id: string | null
          tipo_reserva: string
          unidade_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          criado_por?: string | null
          fim: string
          id?: string
          inicio: string
          item_id?: string | null
          projeto_id?: string | null
          status_reserva?: string | null
          tarefa_id?: string | null
          tipo_reserva: string
          unidade_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          criado_por?: string | null
          fim?: string
          id?: string
          inicio?: string
          item_id?: string | null
          projeto_id?: string | null
          status_reserva?: string | null
          tarefa_id?: string | null
          tipo_reserva?: string
          unidade_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventario_reservas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_reservas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "inventario_reservas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "inventario_reservas_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_reservas_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "inventario_reservas_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventario_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_reservas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_reservas_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas_projeto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_reservas_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "inventario_unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_termos: {
        Row: {
          ativo: boolean | null
          conteudo_html: string
          created_at: string | null
          id: string
          tipo: string
          versao: number | null
        }
        Insert: {
          ativo?: boolean | null
          conteudo_html: string
          created_at?: string | null
          id?: string
          tipo: string
          versao?: number | null
        }
        Update: {
          ativo?: boolean | null
          conteudo_html?: string
          created_at?: string | null
          id?: string
          tipo?: string
          versao?: number | null
        }
        Relationships: []
      }
      inventario_termos_assinados: {
        Row: {
          aceite: boolean | null
          assinante_doc: string | null
          assinante_email: string | null
          assinante_nome: string
          id: string
          ip: unknown | null
          referencia_id: string
          referencia_tipo: string
          termo_id: string | null
          timestamp: string | null
        }
        Insert: {
          aceite?: boolean | null
          assinante_doc?: string | null
          assinante_email?: string | null
          assinante_nome: string
          id?: string
          ip?: unknown | null
          referencia_id: string
          referencia_tipo: string
          termo_id?: string | null
          timestamp?: string | null
        }
        Update: {
          aceite?: boolean | null
          assinante_doc?: string | null
          assinante_email?: string | null
          assinante_nome?: string
          id?: string
          ip?: unknown | null
          referencia_id?: string
          referencia_tipo?: string
          termo_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventario_termos_assinados_termo_id_fkey"
            columns: ["termo_id"]
            isOneToOne: false
            referencedRelation: "inventario_termos"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_unidades: {
        Row: {
          codigo_unidade: string
          condicao_unidade: string | null
          created_at: string | null
          id: string
          item_id: string | null
          numero_serie_unidade: string | null
          observacoes: string | null
          qr_code_url: string | null
          status_unidade: string | null
          updated_at: string | null
        }
        Insert: {
          codigo_unidade: string
          condicao_unidade?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          numero_serie_unidade?: string | null
          observacoes?: string | null
          qr_code_url?: string | null
          status_unidade?: string | null
          updated_at?: string | null
        }
        Update: {
          codigo_unidade?: string
          condicao_unidade?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          numero_serie_unidade?: string | null
          observacoes?: string | null
          qr_code_url?: string | null
          status_unidade?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventario_unidades_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventario_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          cargo: string | null
          created_at: string | null
          email: string | null
          empresa: string | null
          id: string
          nome: string
          observacoes: string | null
          origem: string | null
          responsavel_id: string | null
          status: string | null
          telefone: string | null
          updated_at: string | null
          valor_estimado: number | null
        }
        Insert: {
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          origem?: string | null
          responsavel_id?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
          valor_estimado?: number | null
        }
        Update: {
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          origem?: string | null
          responsavel_id?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      log_atividade_tarefa: {
        Row: {
          acao: string
          actor_id: string | null
          criado_em: string | null
          detalhe: Json | null
          id: string
          tarefa_id: string
        }
        Insert: {
          acao: string
          actor_id?: string | null
          criado_em?: string | null
          detalhe?: Json | null
          id?: string
          tarefa_id: string
        }
        Update: {
          acao?: string
          actor_id?: string | null
          criado_em?: string | null
          detalhe?: Json | null
          id?: string
          tarefa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "log_atividade_tarefa_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "log_atividade_tarefa_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "log_atividade_tarefa_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_atividade: {
        Row: {
          acao: string
          cliente_id: string
          data_hora: string | null
          descricao: string
          entidade_id: string
          entidade_tipo: string
          id: string
          metadata: Json | null
          trace_id: string | null
          usuario_id: string
        }
        Insert: {
          acao: string
          cliente_id: string
          data_hora?: string | null
          descricao: string
          entidade_id: string
          entidade_tipo: string
          id?: string
          metadata?: Json | null
          trace_id?: string | null
          usuario_id: string
        }
        Update: {
          acao?: string
          cliente_id?: string
          data_hora?: string | null
          descricao?: string
          entidade_id?: string
          entidade_tipo?: string
          id?: string
          metadata?: Json | null
          trace_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_atividade_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_atividade_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "logs_atividade_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "logs_atividade_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_atividade_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      modulos: {
        Row: {
          ativo: boolean
          created_at: string
          icone: string
          id: string
          nome: string
          ordem: number
          roles_permitidos: Database["public"]["Enums"]["user_role"][]
          slug: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          icone?: string
          id?: string
          nome: string
          ordem?: number
          roles_permitidos?: Database["public"]["Enums"]["user_role"][]
          slug: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          icone?: string
          id?: string
          nome?: string
          ordem?: number
          roles_permitidos?: Database["public"]["Enums"]["user_role"][]
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      notas_cliente: {
        Row: {
          cliente_id: string
          conteudo: string
          created_at: string | null
          created_by: string
          id: string
          projeto_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          cliente_id: string
          conteudo: string
          created_at?: string | null
          created_by: string
          id?: string
          projeto_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          cliente_id?: string
          conteudo?: string
          created_at?: string | null
          created_by?: string
          id?: string
          projeto_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "notas_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "notas_cliente_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_cliente_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "notas_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_cliente_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_cliente_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string
          data_evento: string | null
          id: string
          lida: boolean
          link_acao: string | null
          mensagem: string
          tipo: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_evento?: string | null
          id?: string
          lida?: boolean
          link_acao?: string | null
          mensagem: string
          tipo?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_evento?: string | null
          id?: string
          lida?: boolean
          link_acao?: string | null
          mensagem?: string
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ocorrencias_ponto: {
        Row: {
          created_at: string | null
          data: string
          horas: number | null
          id: string
          observacao: string | null
          pessoa_id: string | null
          status: string | null
          tipo: string
          valor: number | null
        }
        Insert: {
          created_at?: string | null
          data: string
          horas?: number | null
          id?: string
          observacao?: string | null
          pessoa_id?: string | null
          status?: string | null
          tipo: string
          valor?: number | null
        }
        Update: {
          created_at?: string | null
          data?: string
          horas?: number | null
          id?: string
          observacao?: string | null
          pessoa_id?: string | null
          status?: string | null
          tipo?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ocorrencias_ponto_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "especialistas_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_ponto_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_ponto_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores_view"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_itens: {
        Row: {
          created_at: string
          desconto_percentual: number | null
          descricao: string | null
          id: string
          imposto_percent: number | null
          orcamento_id: string
          ordem: number | null
          preco_unitario: number
          produto_id: string | null
          produto_servico: string
          quantidade: number
          subtotal_item: number | null
          unidade: string | null
          updated_at: string
          valor_total: number
        }
        Insert: {
          created_at?: string
          desconto_percentual?: number | null
          descricao?: string | null
          id?: string
          imposto_percent?: number | null
          orcamento_id: string
          ordem?: number | null
          preco_unitario: number
          produto_id?: string | null
          produto_servico: string
          quantidade?: number
          subtotal_item?: number | null
          unidade?: string | null
          updated_at?: string
          valor_total: number
        }
        Update: {
          created_at?: string
          desconto_percentual?: number | null
          descricao?: string | null
          id?: string
          imposto_percent?: number | null
          orcamento_id?: string
          ordem?: number | null
          preco_unitario?: number
          produto_id?: string | null
          produto_servico?: string
          quantidade?: number
          subtotal_item?: number | null
          unidade?: string | null
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_itens_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          cliente_id: string | null
          condicoes_pagamento: string | null
          contato_email: string | null
          contato_nome: string | null
          contato_tel: string | null
          created_at: string
          created_by: string | null
          data_validade: string
          desconto_percentual: number | null
          desconto_valor: number | null
          descricao: string | null
          id: string
          impostos: number | null
          notas_internas: string | null
          numero: string | null
          observacoes: string | null
          outros: number | null
          projeto_id: string | null
          responsavel_id: string | null
          status: string
          subtotal: number | null
          titulo: string
          updated_at: string
          updated_by: string | null
          valor_final: number
          valor_total: number
        }
        Insert: {
          cliente_id?: string | null
          condicoes_pagamento?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_tel?: string | null
          created_at?: string
          created_by?: string | null
          data_validade: string
          desconto_percentual?: number | null
          desconto_valor?: number | null
          descricao?: string | null
          id?: string
          impostos?: number | null
          notas_internas?: string | null
          numero?: string | null
          observacoes?: string | null
          outros?: number | null
          projeto_id?: string | null
          responsavel_id?: string | null
          status?: string
          subtotal?: number | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
          valor_final?: number
          valor_total?: number
        }
        Update: {
          cliente_id?: string | null
          condicoes_pagamento?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_tel?: string | null
          created_at?: string
          created_by?: string | null
          data_validade?: string
          desconto_percentual?: number | null
          desconto_valor?: number | null
          descricao?: string | null
          id?: string
          impostos?: number | null
          notas_internas?: string | null
          numero?: string | null
          observacoes?: string | null
          outros?: number | null
          projeto_id?: string | null
          responsavel_id?: string | null
          status?: string
          subtotal?: number | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
          valor_final?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "orcamentos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "orcamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      pacote_itens: {
        Row: {
          created_at: string | null
          duracao_padrao_min: number | null
          id: string
          nome: string
          ordem: number | null
          pacote_id: string | null
          quantidade: number
          skill: string
          unidade: string | null
        }
        Insert: {
          created_at?: string | null
          duracao_padrao_min?: number | null
          id?: string
          nome: string
          ordem?: number | null
          pacote_id?: string | null
          quantidade?: number
          skill: string
          unidade?: string | null
        }
        Update: {
          created_at?: string | null
          duracao_padrao_min?: number | null
          id?: string
          nome?: string
          ordem?: number | null
          pacote_id?: string | null
          quantidade?: number
          skill?: string
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pacote_itens_pacote_id_fkey"
            columns: ["pacote_id"]
            isOneToOne: false
            referencedRelation: "pacotes"
            referencedColumns: ["id"]
          },
        ]
      }
      pacote_task_templates: {
        Row: {
          anexos_obrigatorios: string[] | null
          checklist_items: string[] | null
          created_at: string | null
          depende_de: string[] | null
          descricao: string | null
          id: string
          pacote_item_id: string | null
          prazo_offset_dias: number | null
          skill: string
          titulo: string
        }
        Insert: {
          anexos_obrigatorios?: string[] | null
          checklist_items?: string[] | null
          created_at?: string | null
          depende_de?: string[] | null
          descricao?: string | null
          id?: string
          pacote_item_id?: string | null
          prazo_offset_dias?: number | null
          skill: string
          titulo: string
        }
        Update: {
          anexos_obrigatorios?: string[] | null
          checklist_items?: string[] | null
          created_at?: string | null
          depende_de?: string[] | null
          descricao?: string | null
          id?: string
          pacote_item_id?: string | null
          prazo_offset_dias?: number | null
          skill?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "pacote_task_templates_pacote_item_id_fkey"
            columns: ["pacote_item_id"]
            isOneToOne: false
            referencedRelation: "pacote_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      pacotes: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          preco_base: number | null
          slug: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          preco_base?: number | null
          slug: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          preco_base?: number | null
          slug?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          comprovante_url: string | null
          created_at: string | null
          data_pagamento: string
          fatura_id: string | null
          id: string
          metodo: string | null
          observacoes: string | null
          valor: number
        }
        Insert: {
          comprovante_url?: string | null
          created_at?: string | null
          data_pagamento: string
          fatura_id?: string | null
          id?: string
          metodo?: string | null
          observacoes?: string | null
          valor: number
        }
        Update: {
          comprovante_url?: string | null
          created_at?: string | null
          data_pagamento?: string
          fatura_id?: string | null
          id?: string
          metodo?: string | null
          observacoes?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_fatura_id_fkey"
            columns: ["fatura_id"]
            isOneToOne: false
            referencedRelation: "faturas"
            referencedColumns: ["id"]
          },
        ]
      }
      parcelas_receber: {
        Row: {
          centro_custo: string | null
          contrato_id: string | null
          created_at: string | null
          id: string
          status: string
          updated_at: string | null
          valor: number
          vencimento: string
        }
        Insert: {
          centro_custo?: string | null
          contrato_id?: string | null
          created_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          valor: number
          vencimento: string
        }
        Update: {
          centro_custo?: string | null
          contrato_id?: string | null
          created_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "parcelas_receber_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
        ]
      }
      permissoes_modulo: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          created_at: string
          id: string
          modulo_slug: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          modulo_slug: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          modulo_slug?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      pessoas: {
        Row: {
          cargo_atual: string | null
          cargo_id: string | null
          cliente_id: string | null
          cpf: string | null
          created_at: string | null
          created_by: string | null
          dados_bancarios: Json | null
          data_admissao: string | null
          data_desligamento: string | null
          email: string | null
          fee_mensal: number | null
          id: string
          nome: string
          observacoes: string | null
          papeis: Database["public"]["Enums"]["pessoa_papel"][]
          profile_id: string | null
          regime: Database["public"]["Enums"]["pessoa_regime"] | null
          salario_base: number | null
          status: Database["public"]["Enums"]["pessoa_status"] | null
          telefones: Json | null
          updated_at: string | null
        }
        Insert: {
          cargo_atual?: string | null
          cargo_id?: string | null
          cliente_id?: string | null
          cpf?: string | null
          created_at?: string | null
          created_by?: string | null
          dados_bancarios?: Json | null
          data_admissao?: string | null
          data_desligamento?: string | null
          email?: string | null
          fee_mensal?: number | null
          id?: string
          nome: string
          observacoes?: string | null
          papeis?: Database["public"]["Enums"]["pessoa_papel"][]
          profile_id?: string | null
          regime?: Database["public"]["Enums"]["pessoa_regime"] | null
          salario_base?: number | null
          status?: Database["public"]["Enums"]["pessoa_status"] | null
          telefones?: Json | null
          updated_at?: string | null
        }
        Update: {
          cargo_atual?: string | null
          cargo_id?: string | null
          cliente_id?: string | null
          cpf?: string | null
          created_at?: string | null
          created_by?: string | null
          dados_bancarios?: Json | null
          data_admissao?: string | null
          data_desligamento?: string | null
          email?: string | null
          fee_mensal?: number | null
          id?: string
          nome?: string
          observacoes?: string | null
          papeis?: Database["public"]["Enums"]["pessoa_papel"][]
          profile_id?: string | null
          regime?: Database["public"]["Enums"]["pessoa_regime"] | null
          salario_base?: number | null
          status?: Database["public"]["Enums"]["pessoa_status"] | null
          telefones?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pessoas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "pessoas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
        ]
      }
      planejamentos: {
        Row: {
          cliente_id: string | null
          created_at: string
          data_aprovacao_cliente: string | null
          data_envio_cliente: string | null
          descricao: string | null
          id: string
          mes_referencia: string
          observacoes_cliente: string | null
          projeto_id: string | null
          responsavel_grs_id: string | null
          status: Database["public"]["Enums"]["status_padrao"] | null
          titulo: string
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_aprovacao_cliente?: string | null
          data_envio_cliente?: string | null
          descricao?: string | null
          id?: string
          mes_referencia: string
          observacoes_cliente?: string | null
          projeto_id?: string | null
          responsavel_grs_id?: string | null
          status?: Database["public"]["Enums"]["status_padrao"] | null
          titulo: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_aprovacao_cliente?: string | null
          data_envio_cliente?: string | null
          descricao?: string | null
          id?: string
          mes_referencia?: string
          observacoes_cliente?: string | null
          projeto_id?: string | null
          responsavel_grs_id?: string | null
          status?: Database["public"]["Enums"]["status_padrao"] | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planejamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planejamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "planejamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "planejamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planejamentos_responsavel_grs_id_fkey"
            columns: ["responsavel_grs_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planejamentos_responsavel_grs_id_fkey"
            columns: ["responsavel_grs_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      planos_estrategicos: {
        Row: {
          analise_swot: Json | null
          cliente_id: string
          created_at: string
          created_by: string | null
          dados_onboarding: Json | null
          id: string
          missao: string | null
          origem_ia: boolean | null
          periodo_fim: string
          periodo_inicio: string
          titulo: string
          updated_at: string
          valores: string[] | null
          visao: string | null
        }
        Insert: {
          analise_swot?: Json | null
          cliente_id: string
          created_at?: string
          created_by?: string | null
          dados_onboarding?: Json | null
          id?: string
          missao?: string | null
          origem_ia?: boolean | null
          periodo_fim: string
          periodo_inicio: string
          titulo: string
          updated_at?: string
          valores?: string[] | null
          visao?: string | null
        }
        Update: {
          analise_swot?: Json | null
          cliente_id?: string
          created_at?: string
          created_by?: string | null
          dados_onboarding?: Json | null
          id?: string
          missao?: string | null
          origem_ia?: boolean | null
          periodo_fim?: string
          periodo_inicio?: string
          titulo?: string
          updated_at?: string
          valores?: string[] | null
          visao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_estrategicos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_estrategicos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "planos_estrategicos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "planos_estrategicos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_estrategicos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      planos_objetivos: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          iniciativas: string[] | null
          kpis: string[] | null
          objetivo: string
          ordem: number | null
          plano_id: string
          prazo_conclusao: string | null
          responsavel_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          iniciativas?: string[] | null
          kpis?: string[] | null
          objetivo: string
          ordem?: number | null
          plano_id: string
          prazo_conclusao?: string | null
          responsavel_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          iniciativas?: string[] | null
          kpis?: string[] | null
          objetivo?: string
          ordem?: number | null
          plano_id?: string
          prazo_conclusao?: string | null
          responsavel_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planos_objetivos_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_estrategicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_objetivos_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "vw_planos_publicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_objetivos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_objetivos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      posts_gerados_temp: {
        Row: {
          anexo_url: string | null
          call_to_action: string | null
          componente_hesec: string | null
          conteudo_completo: string | null
          contexto_estrategico: string | null
          created_at: string
          data_postagem: string
          formato_postagem: string
          hashtags: string[] | null
          headline: string | null
          id: string
          legenda: string | null
          objetivo_postagem: string
          persona_alvo: string | null
          planejamento_id: string
          responsavel_id: string | null
          tipo_criativo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          anexo_url?: string | null
          call_to_action?: string | null
          componente_hesec?: string | null
          conteudo_completo?: string | null
          contexto_estrategico?: string | null
          created_at?: string
          data_postagem: string
          formato_postagem?: string
          hashtags?: string[] | null
          headline?: string | null
          id?: string
          legenda?: string | null
          objetivo_postagem: string
          persona_alvo?: string | null
          planejamento_id: string
          responsavel_id?: string | null
          tipo_criativo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          anexo_url?: string | null
          call_to_action?: string | null
          componente_hesec?: string | null
          conteudo_completo?: string | null
          contexto_estrategico?: string | null
          created_at?: string
          data_postagem?: string
          formato_postagem?: string
          hashtags?: string[] | null
          headline?: string | null
          id?: string
          legenda?: string | null
          objetivo_postagem?: string
          persona_alvo?: string | null
          planejamento_id?: string
          responsavel_id?: string | null
          tipo_criativo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      posts_planejamento: {
        Row: {
          anexo_url: string | null
          call_to_action: string | null
          componente_hesec: string | null
          conteudo_completo: string | null
          contexto_estrategico: string | null
          created_at: string
          data_postagem: string
          formato_postagem: string
          hashtags: string[] | null
          headline: string | null
          id: string
          legenda: string | null
          objetivo_postagem: string
          persona_alvo: string | null
          planejamento_id: string
          responsavel_id: string | null
          tipo_criativo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          anexo_url?: string | null
          call_to_action?: string | null
          componente_hesec?: string | null
          conteudo_completo?: string | null
          contexto_estrategico?: string | null
          created_at?: string
          data_postagem: string
          formato_postagem?: string
          hashtags?: string[] | null
          headline?: string | null
          id?: string
          legenda?: string | null
          objetivo_postagem: string
          persona_alvo?: string | null
          planejamento_id: string
          responsavel_id?: string | null
          tipo_criativo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          anexo_url?: string | null
          call_to_action?: string | null
          componente_hesec?: string | null
          conteudo_completo?: string | null
          contexto_estrategico?: string | null
          created_at?: string
          data_postagem?: string
          formato_postagem?: string
          hashtags?: string[] | null
          headline?: string | null
          id?: string
          legenda?: string | null
          objetivo_postagem?: string
          persona_alvo?: string | null
          planejamento_id?: string
          responsavel_id?: string | null
          tipo_criativo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_planejamento_planejamento_id_fkey"
            columns: ["planejamento_id"]
            isOneToOne: false
            referencedRelation: "planejamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtividade_checklist: {
        Row: {
          categoria: string | null
          concluido: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          ordem: number | null
          prioridade: number | null
          setor: string
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          categoria?: string | null
          concluido?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          ordem?: number | null
          prioridade?: number | null
          setor: string
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          categoria?: string | null
          concluido?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          ordem?: number | null
          prioridade?: number | null
          setor?: string
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtividade_checklist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtividade_checklist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      produtividade_insights_foco: {
        Row: {
          created_at: string | null
          data_analise: string | null
          energia_media: number | null
          horarios_ideais: Json | null
          id: string
          recomendacoes: string | null
          setor: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_analise?: string | null
          energia_media?: number | null
          horarios_ideais?: Json | null
          id?: string
          recomendacoes?: string | null
          setor: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_analise?: string | null
          energia_media?: number | null
          horarios_ideais?: Json | null
          id?: string
          recomendacoes?: string | null
          setor?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtividade_insights_foco_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtividade_insights_foco_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      produtividade_metas: {
        Row: {
          avaliacao_ia: Json | null
          categoria: string | null
          created_at: string | null
          data_limite: string | null
          descricao: string
          id: string
          progresso: number | null
          qualidade_smart: number | null
          setor: string
          status: string | null
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avaliacao_ia?: Json | null
          categoria?: string | null
          created_at?: string | null
          data_limite?: string | null
          descricao: string
          id?: string
          progresso?: number | null
          qualidade_smart?: number | null
          setor: string
          status?: string | null
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avaliacao_ia?: Json | null
          categoria?: string | null
          created_at?: string | null
          data_limite?: string | null
          descricao?: string
          id?: string
          progresso?: number | null
          qualidade_smart?: number | null
          setor?: string
          status?: string | null
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtividade_metas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtividade_metas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      produtividade_pomodoro: {
        Row: {
          created_at: string | null
          duracao_minutos: number | null
          fim: string | null
          id: string
          inicio: string
          setor: string
          status: string | null
          tipo: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duracao_minutos?: number | null
          fim?: string | null
          id?: string
          inicio?: string
          setor: string
          status?: string | null
          tipo?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duracao_minutos?: number | null
          fim?: string | null
          id?: string
          inicio?: string
          setor?: string
          status?: string | null
          tipo?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtividade_pomodoro_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtividade_pomodoro_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      produtividade_reflexao: {
        Row: {
          created_at: string | null
          data: string
          humor: string | null
          id: string
          resumo_ia: string | null
          resumo_semanal: string | null
          setor: string
          texto: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: string
          humor?: string | null
          id?: string
          resumo_ia?: string | null
          resumo_semanal?: string | null
          setor: string
          texto: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: string
          humor?: string | null
          id?: string
          resumo_ia?: string | null
          resumo_semanal?: string | null
          setor?: string
          texto?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtividade_reflexao_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtividade_reflexao_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      produto: {
        Row: {
          ativo: boolean | null
          checklist_padrao: Json | null
          created_at: string | null
          id: string
          nome: string
          sku: string | null
          sla_padrao: number | null
          time_responsavel: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          checklist_padrao?: Json | null
          created_at?: string | null
          id?: string
          nome: string
          sku?: string | null
          sla_padrao?: number | null
          time_responsavel?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          checklist_padrao?: Json | null
          created_at?: string | null
          id?: string
          nome?: string
          sku?: string | null
          sla_padrao?: number | null
          time_responsavel?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      produto_componentes: {
        Row: {
          id: string
          produto_filho_id: string | null
          produto_pai_id: string | null
          quantidade: number | null
        }
        Insert: {
          id?: string
          produto_filho_id?: string | null
          produto_pai_id?: string | null
          quantidade?: number | null
        }
        Update: {
          id?: string
          produto_filho_id?: string | null
          produto_pai_id?: string | null
          quantidade?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "produto_componentes_produto_filho_id_fkey"
            columns: ["produto_filho_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_componentes_produto_pai_id_fkey"
            columns: ["produto_pai_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          custo: number | null
          descricao: string | null
          id: string
          imposto_percent: number | null
          lead_time_dias: number | null
          nome: string
          observacoes: string | null
          preco_padrao: number
          sku: string
          tipo: string | null
          unidade: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          custo?: number | null
          descricao?: string | null
          id?: string
          imposto_percent?: number | null
          lead_time_dias?: number | null
          nome: string
          observacoes?: string | null
          preco_padrao: number
          sku: string
          tipo?: string | null
          unidade?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          custo?: number | null
          descricao?: string | null
          id?: string
          imposto_percent?: number | null
          lead_time_dias?: number | null
          nome?: string
          observacoes?: string | null
          preco_padrao?: number
          sku?: string
          tipo?: string | null
          unidade?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          aprovado_por: string | null
          avatar_url: string | null
          cliente_id: string | null
          created_at: string | null
          data_aprovacao: string | null
          email: string
          email_verified_at: string | null
          especialidade:
            | Database["public"]["Enums"]["especialidade_type"]
            | null
          id: string
          nome: string
          observacoes_aprovacao: string | null
          role_requested: string | null
          status: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          aprovado_por?: string | null
          avatar_url?: string | null
          cliente_id?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          email: string
          email_verified_at?: string | null
          especialidade?:
            | Database["public"]["Enums"]["especialidade_type"]
            | null
          id: string
          nome: string
          observacoes_aprovacao?: string | null
          role_requested?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          aprovado_por?: string | null
          avatar_url?: string | null
          cliente_id?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          email?: string
          email_verified_at?: string | null
          especialidade?:
            | Database["public"]["Enums"]["especialidade_type"]
            | null
          id?: string
          nome?: string
          observacoes_aprovacao?: string | null
          role_requested?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "profiles_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
        ]
      }
      projeto_especialistas: {
        Row: {
          created_at: string | null
          especialidade: Database["public"]["Enums"]["especialidade_type"]
          especialista_id: string
          id: string
          is_gerente: boolean | null
          projeto_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          especialidade: Database["public"]["Enums"]["especialidade_type"]
          especialista_id: string
          id?: string
          is_gerente?: boolean | null
          projeto_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          especialidade?: Database["public"]["Enums"]["especialidade_type"]
          especialista_id?: string
          id?: string
          is_gerente?: boolean | null
          projeto_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projeto_especialistas_especialista_id_fkey"
            columns: ["especialista_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_especialistas_especialista_id_fkey"
            columns: ["especialista_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      projeto_status_historico: {
        Row: {
          alterado_por: string | null
          created_at: string
          id: string
          observacao: string | null
          projeto_id: string | null
          status_anterior: string | null
          status_novo: string
          tarefa_id: string | null
        }
        Insert: {
          alterado_por?: string | null
          created_at?: string
          id?: string
          observacao?: string | null
          projeto_id?: string | null
          status_anterior?: string | null
          status_novo: string
          tarefa_id?: string | null
        }
        Update: {
          alterado_por?: string | null
          created_at?: string
          id?: string
          observacao?: string | null
          projeto_id?: string | null
          status_anterior?: string | null
          status_novo?: string
          tarefa_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projeto_status_historico_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_status_historico_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "projeto_status_historico_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_status_historico_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas_projeto"
            referencedColumns: ["id"]
          },
        ]
      }
      projetos: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          created_by: string | null
          data_fim: string | null
          data_inicio: string | null
          data_prazo: string | null
          descricao: string | null
          id: string
          orcamento: number | null
          orcamento_estimado: number | null
          prioridade: string | null
          progresso: number | null
          responsavel_atendimento_id: string | null
          responsavel_grs_id: string | null
          responsavel_id: string | null
          status: Database["public"]["Enums"]["status_type"] | null
          tipo_projeto: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          data_prazo?: string | null
          descricao?: string | null
          id?: string
          orcamento?: number | null
          orcamento_estimado?: number | null
          prioridade?: string | null
          progresso?: number | null
          responsavel_atendimento_id?: string | null
          responsavel_grs_id?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          tipo_projeto?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          data_prazo?: string | null
          descricao?: string | null
          id?: string
          orcamento?: number | null
          orcamento_estimado?: number | null
          prioridade?: string | null
          progresso?: number | null
          responsavel_atendimento_id?: string | null
          responsavel_grs_id?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          tipo_projeto?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "projetos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "projetos_responsavel_atendimento_id_fkey"
            columns: ["responsavel_atendimento_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_responsavel_atendimento_id_fkey"
            columns: ["responsavel_atendimento_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "projetos_responsavel_grs_id_fkey"
            columns: ["responsavel_grs_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_responsavel_grs_id_fkey"
            columns: ["responsavel_grs_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "projetos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      projetos_audiovisual: {
        Row: {
          assets_url: string | null
          created_at: string
          deadline: string | null
          especialista_id: string | null
          feedback_cliente: string | null
          id: string
          planejamento_id: string | null
          status_review: string
          tipo_projeto: string
          titulo: string
          updated_at: string
        }
        Insert: {
          assets_url?: string | null
          created_at?: string
          deadline?: string | null
          especialista_id?: string | null
          feedback_cliente?: string | null
          id?: string
          planejamento_id?: string | null
          status_review?: string
          tipo_projeto: string
          titulo: string
          updated_at?: string
        }
        Update: {
          assets_url?: string | null
          created_at?: string
          deadline?: string | null
          especialista_id?: string | null
          feedback_cliente?: string | null
          id?: string
          planejamento_id?: string | null
          status_review?: string
          tipo_projeto?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_projetos_av_especialista"
            columns: ["especialista_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_projetos_av_especialista"
            columns: ["especialista_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "fk_projetos_av_planejamento"
            columns: ["planejamento_id"]
            isOneToOne: false
            referencedRelation: "planejamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      proposta_itens: {
        Row: {
          created_at: string | null
          desconto_percent: number | null
          descricao: string
          id: string
          imposto_percent: number | null
          ordem: number | null
          preco_unitario: number
          produto_id: string | null
          proposta_id: string | null
          quantidade: number
          subtotal_item: number | null
          unidade: string | null
        }
        Insert: {
          created_at?: string | null
          desconto_percent?: number | null
          descricao: string
          id?: string
          imposto_percent?: number | null
          ordem?: number | null
          preco_unitario: number
          produto_id?: string | null
          proposta_id?: string | null
          quantidade?: number
          subtotal_item?: number | null
          unidade?: string | null
        }
        Update: {
          created_at?: string | null
          desconto_percent?: number | null
          descricao?: string
          id?: string
          imposto_percent?: number | null
          ordem?: number | null
          preco_unitario?: number
          produto_id?: string | null
          proposta_id?: string | null
          quantidade?: number
          subtotal_item?: number | null
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposta_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposta_itens_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas: {
        Row: {
          assinatura_data: string | null
          assinatura_status: string
          assinatura_url: string | null
          cliente_id: string | null
          condicoes_pagamento: string | null
          contato_email: string | null
          contato_nome: string | null
          contato_tel: string | null
          created_at: string
          created_by: string | null
          data_envio: string | null
          descontos: number | null
          id: string
          impostos: number | null
          link_publico: string | null
          multas_juros: string | null
          notas_internas: string | null
          numero: string | null
          observacoes_cliente: string | null
          orcamento_id: string
          outros: number | null
          pdf_assinado_path: string | null
          pdf_path: string | null
          projeto_id: string | null
          reajuste: string | null
          responsavel_id: string | null
          subtotal: number | null
          titulo: string
          total: number | null
          updated_at: string
          updated_by: string | null
          validade: string | null
          versao: number | null
          visualizado_em: string | null
        }
        Insert: {
          assinatura_data?: string | null
          assinatura_status?: string
          assinatura_url?: string | null
          cliente_id?: string | null
          condicoes_pagamento?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_tel?: string | null
          created_at?: string
          created_by?: string | null
          data_envio?: string | null
          descontos?: number | null
          id?: string
          impostos?: number | null
          link_publico?: string | null
          multas_juros?: string | null
          notas_internas?: string | null
          numero?: string | null
          observacoes_cliente?: string | null
          orcamento_id: string
          outros?: number | null
          pdf_assinado_path?: string | null
          pdf_path?: string | null
          projeto_id?: string | null
          reajuste?: string | null
          responsavel_id?: string | null
          subtotal?: number | null
          titulo: string
          total?: number | null
          updated_at?: string
          updated_by?: string | null
          validade?: string | null
          versao?: number | null
          visualizado_em?: string | null
        }
        Update: {
          assinatura_data?: string | null
          assinatura_status?: string
          assinatura_url?: string | null
          cliente_id?: string | null
          condicoes_pagamento?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_tel?: string | null
          created_at?: string
          created_by?: string | null
          data_envio?: string | null
          descontos?: number | null
          id?: string
          impostos?: number | null
          link_publico?: string | null
          multas_juros?: string | null
          notas_internas?: string | null
          numero?: string | null
          observacoes_cliente?: string | null
          orcamento_id?: string
          outros?: number | null
          pdf_assinado_path?: string | null
          pdf_path?: string | null
          projeto_id?: string | null
          reajuste?: string | null
          responsavel_id?: string | null
          subtotal?: number | null
          titulo?: string
          total?: number | null
          updated_at?: string
          updated_by?: string | null
          validade?: string | null
          versao?: number | null
          visualizado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "propostas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "propostas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "propostas_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      rh_cargos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          faixa_salarial_max: number | null
          faixa_salarial_min: number | null
          id: string
          nome: string
          senioridade: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          faixa_salarial_max?: number | null
          faixa_salarial_min?: number | null
          id?: string
          nome: string
          senioridade?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          faixa_salarial_max?: number | null
          faixa_salarial_min?: number | null
          id?: string
          nome?: string
          senioridade?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rh_colaboradores: {
        Row: {
          agencia: string | null
          bairro: string | null
          banco_codigo: string | null
          banco_nome: string | null
          cargo_atual: string | null
          cargo_id: string | null
          celular: string | null
          centro_custo: string | null
          cep: string | null
          chave_pix: string | null
          cidade: string | null
          complemento: string | null
          conta: string | null
          cpf_cnpj: string
          cpf_cnpj_titular: string | null
          created_at: string | null
          created_by: string | null
          data_admissao: string
          data_desligamento: string | null
          data_nascimento: string | null
          email: string | null
          estado: string | null
          fee_mensal: number | null
          gestor_imediato_id: string | null
          id: string
          logradouro: string | null
          nome_completo: string
          numero: string | null
          observacoes: string | null
          regime: Database["public"]["Enums"]["regime_trabalho"]
          rg: string | null
          salario_base: number | null
          status: Database["public"]["Enums"]["status_colaborador"] | null
          telefone: string | null
          tipo_chave_pix: Database["public"]["Enums"]["tipo_chave_pix"] | null
          tipo_conta: Database["public"]["Enums"]["tipo_conta_bancaria"] | null
          titular_conta: string | null
          unidade_filial: string | null
          updated_at: string | null
        }
        Insert: {
          agencia?: string | null
          bairro?: string | null
          banco_codigo?: string | null
          banco_nome?: string | null
          cargo_atual?: string | null
          cargo_id?: string | null
          celular?: string | null
          centro_custo?: string | null
          cep?: string | null
          chave_pix?: string | null
          cidade?: string | null
          complemento?: string | null
          conta?: string | null
          cpf_cnpj: string
          cpf_cnpj_titular?: string | null
          created_at?: string | null
          created_by?: string | null
          data_admissao: string
          data_desligamento?: string | null
          data_nascimento?: string | null
          email?: string | null
          estado?: string | null
          fee_mensal?: number | null
          gestor_imediato_id?: string | null
          id?: string
          logradouro?: string | null
          nome_completo: string
          numero?: string | null
          observacoes?: string | null
          regime: Database["public"]["Enums"]["regime_trabalho"]
          rg?: string | null
          salario_base?: number | null
          status?: Database["public"]["Enums"]["status_colaborador"] | null
          telefone?: string | null
          tipo_chave_pix?: Database["public"]["Enums"]["tipo_chave_pix"] | null
          tipo_conta?: Database["public"]["Enums"]["tipo_conta_bancaria"] | null
          titular_conta?: string | null
          unidade_filial?: string | null
          updated_at?: string | null
        }
        Update: {
          agencia?: string | null
          bairro?: string | null
          banco_codigo?: string | null
          banco_nome?: string | null
          cargo_atual?: string | null
          cargo_id?: string | null
          celular?: string | null
          centro_custo?: string | null
          cep?: string | null
          chave_pix?: string | null
          cidade?: string | null
          complemento?: string | null
          conta?: string | null
          cpf_cnpj?: string
          cpf_cnpj_titular?: string | null
          created_at?: string | null
          created_by?: string | null
          data_admissao?: string
          data_desligamento?: string | null
          data_nascimento?: string | null
          email?: string | null
          estado?: string | null
          fee_mensal?: number | null
          gestor_imediato_id?: string | null
          id?: string
          logradouro?: string | null
          nome_completo?: string
          numero?: string | null
          observacoes?: string | null
          regime?: Database["public"]["Enums"]["regime_trabalho"]
          rg?: string | null
          salario_base?: number | null
          status?: Database["public"]["Enums"]["status_colaborador"] | null
          telefone?: string | null
          tipo_chave_pix?: Database["public"]["Enums"]["tipo_chave_pix"] | null
          tipo_conta?: Database["public"]["Enums"]["tipo_conta_bancaria"] | null
          titular_conta?: string | null
          unidade_filial?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rh_colaboradores_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "rh_cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_colaboradores_gestor_imediato_id_fkey"
            columns: ["gestor_imediato_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_folha_ponto: {
        Row: {
          aprovado_gestor_em: string | null
          aprovado_gestor_por: string | null
          aprovado_rh_em: string | null
          aprovado_rh_por: string | null
          arquivo_ponto_url: string | null
          colaborador_id: string
          competencia: string
          comprovantes_anexos: Json | null
          created_at: string | null
          dias_falta: number | null
          hora_base: number | null
          horas_compensacao: number | null
          horas_falta: number | null
          horas_he_100: number | null
          horas_he_50: number | null
          horas_noturno: number | null
          id: string
          minutos_atraso: number | null
          motivo: Database["public"]["Enums"]["motivo_ponto_enum"] | null
          observacao: string | null
          pessoa_id: string | null
          rejeitado_motivo: string | null
          status: Database["public"]["Enums"]["status_ponto_enum"] | null
          updated_at: string | null
          valor_adicional_noturno: number | null
          valor_desconto_atraso: number | null
          valor_desconto_falta: number | null
          valor_he_100: number | null
          valor_he_50: number | null
        }
        Insert: {
          aprovado_gestor_em?: string | null
          aprovado_gestor_por?: string | null
          aprovado_rh_em?: string | null
          aprovado_rh_por?: string | null
          arquivo_ponto_url?: string | null
          colaborador_id: string
          competencia: string
          comprovantes_anexos?: Json | null
          created_at?: string | null
          dias_falta?: number | null
          hora_base?: number | null
          horas_compensacao?: number | null
          horas_falta?: number | null
          horas_he_100?: number | null
          horas_he_50?: number | null
          horas_noturno?: number | null
          id?: string
          minutos_atraso?: number | null
          motivo?: Database["public"]["Enums"]["motivo_ponto_enum"] | null
          observacao?: string | null
          pessoa_id?: string | null
          rejeitado_motivo?: string | null
          status?: Database["public"]["Enums"]["status_ponto_enum"] | null
          updated_at?: string | null
          valor_adicional_noturno?: number | null
          valor_desconto_atraso?: number | null
          valor_desconto_falta?: number | null
          valor_he_100?: number | null
          valor_he_50?: number | null
        }
        Update: {
          aprovado_gestor_em?: string | null
          aprovado_gestor_por?: string | null
          aprovado_rh_em?: string | null
          aprovado_rh_por?: string | null
          arquivo_ponto_url?: string | null
          colaborador_id?: string
          competencia?: string
          comprovantes_anexos?: Json | null
          created_at?: string | null
          dias_falta?: number | null
          hora_base?: number | null
          horas_compensacao?: number | null
          horas_falta?: number | null
          horas_he_100?: number | null
          horas_he_50?: number | null
          horas_noturno?: number | null
          id?: string
          minutos_atraso?: number | null
          motivo?: Database["public"]["Enums"]["motivo_ponto_enum"] | null
          observacao?: string | null
          pessoa_id?: string | null
          rejeitado_motivo?: string | null
          status?: Database["public"]["Enums"]["status_ponto_enum"] | null
          updated_at?: string | null
          valor_adicional_noturno?: number | null
          valor_desconto_atraso?: number | null
          valor_desconto_falta?: number | null
          valor_he_100?: number | null
          valor_he_50?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ponto_pessoa"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "especialistas_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ponto_pessoa"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ponto_pessoa"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_folha_ponto_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_timeline_carreira: {
        Row: {
          anexos_urls: Json | null
          cargo_anterior: string | null
          cargo_novo: string | null
          colaborador_id: string
          created_at: string | null
          criado_por: string | null
          data_fim: string | null
          data_inicio: string
          etapa_anterior:
            | Database["public"]["Enums"]["etapa_carreira_enum"]
            | null
          etapa_nova: Database["public"]["Enums"]["etapa_carreira_enum"]
          id: string
          motivo: string
          observacao: string | null
          salario_anterior: number | null
          salario_novo: number
          updated_at: string | null
        }
        Insert: {
          anexos_urls?: Json | null
          cargo_anterior?: string | null
          cargo_novo?: string | null
          colaborador_id: string
          created_at?: string | null
          criado_por?: string | null
          data_fim?: string | null
          data_inicio: string
          etapa_anterior?:
            | Database["public"]["Enums"]["etapa_carreira_enum"]
            | null
          etapa_nova: Database["public"]["Enums"]["etapa_carreira_enum"]
          id?: string
          motivo: string
          observacao?: string | null
          salario_anterior?: number | null
          salario_novo: number
          updated_at?: string | null
        }
        Update: {
          anexos_urls?: Json | null
          cargo_anterior?: string | null
          cargo_novo?: string | null
          colaborador_id?: string
          created_at?: string | null
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string
          etapa_anterior?:
            | Database["public"]["Enums"]["etapa_carreira_enum"]
            | null
          etapa_nova?: Database["public"]["Enums"]["etapa_carreira_enum"]
          id?: string
          motivo?: string
          observacao?: string | null
          salario_anterior?: number | null
          salario_novo?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rh_timeline_carreira_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      rls_errors_log: {
        Row: {
          created_at: string | null
          error_code: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          operation: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          operation: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          operation?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          created_at: string
          id: string
          module: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      roteiro_agentes_ia: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string
          especialidade: string
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          prompt_instrucoes: string
          slug: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao: string
          especialidade: string
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          prompt_instrucoes: string
          slug: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string
          especialidade?: string
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          prompt_instrucoes?: string
          slug?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      roteiro_frameworks: {
        Row: {
          aplicacao: string | null
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          descricao: string
          estrutura: Json | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          aplicacao?: string | null
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao: string
          estrutura?: Json | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          aplicacao?: string | null
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string
          estrutura?: Json | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      roteiros: {
        Row: {
          agente_ia_id: string | null
          agentes_ia_ids: string[] | null
          cliente_id: string
          created_at: string
          created_by: string | null
          cta: string | null
          duracao_prevista_seg: number
          estilo: Json | null
          framework_id: string | null
          frameworks_ids: string[] | null
          hash_publico: string | null
          hashtags: string | null
          id: string
          insights_visuais: string | null
          objetivo: string | null
          parent_id: string | null
          persona_voz: string | null
          pilares_mensagem: Json | null
          plataforma: Database["public"]["Enums"]["plataforma_roteiro"]
          projeto_id: string
          prompt_usado: string | null
          provedor_ia: Database["public"]["Enums"]["provedor_ia_roteiro"] | null
          publico_alvo: Json | null
          referencias: Json | null
          referencias_analisadas: Json | null
          roteiro_markdown: string | null
          roteiro_struct: Json | null
          status: Database["public"]["Enums"]["status_roteiro"]
          storage_pdf_path: string | null
          tarefa_id: string | null
          titulo: string
          tokens_custos: Json | null
          tom: Json | null
          tom_criativo: string[] | null
          updated_at: string
          updated_by: string | null
          versao: number
        }
        Insert: {
          agente_ia_id?: string | null
          agentes_ia_ids?: string[] | null
          cliente_id: string
          created_at?: string
          created_by?: string | null
          cta?: string | null
          duracao_prevista_seg?: number
          estilo?: Json | null
          framework_id?: string | null
          frameworks_ids?: string[] | null
          hash_publico?: string | null
          hashtags?: string | null
          id?: string
          insights_visuais?: string | null
          objetivo?: string | null
          parent_id?: string | null
          persona_voz?: string | null
          pilares_mensagem?: Json | null
          plataforma?: Database["public"]["Enums"]["plataforma_roteiro"]
          projeto_id: string
          prompt_usado?: string | null
          provedor_ia?:
            | Database["public"]["Enums"]["provedor_ia_roteiro"]
            | null
          publico_alvo?: Json | null
          referencias?: Json | null
          referencias_analisadas?: Json | null
          roteiro_markdown?: string | null
          roteiro_struct?: Json | null
          status?: Database["public"]["Enums"]["status_roteiro"]
          storage_pdf_path?: string | null
          tarefa_id?: string | null
          titulo: string
          tokens_custos?: Json | null
          tom?: Json | null
          tom_criativo?: string[] | null
          updated_at?: string
          updated_by?: string | null
          versao?: number
        }
        Update: {
          agente_ia_id?: string | null
          agentes_ia_ids?: string[] | null
          cliente_id?: string
          created_at?: string
          created_by?: string | null
          cta?: string | null
          duracao_prevista_seg?: number
          estilo?: Json | null
          framework_id?: string | null
          frameworks_ids?: string[] | null
          hash_publico?: string | null
          hashtags?: string | null
          id?: string
          insights_visuais?: string | null
          objetivo?: string | null
          parent_id?: string | null
          persona_voz?: string | null
          pilares_mensagem?: Json | null
          plataforma?: Database["public"]["Enums"]["plataforma_roteiro"]
          projeto_id?: string
          prompt_usado?: string | null
          provedor_ia?:
            | Database["public"]["Enums"]["provedor_ia_roteiro"]
            | null
          publico_alvo?: Json | null
          referencias?: Json | null
          referencias_analisadas?: Json | null
          roteiro_markdown?: string | null
          roteiro_struct?: Json | null
          status?: Database["public"]["Enums"]["status_roteiro"]
          storage_pdf_path?: string | null
          tarefa_id?: string | null
          titulo?: string
          tokens_custos?: Json | null
          tom?: Json | null
          tom_criativo?: string[] | null
          updated_at?: string
          updated_by?: string | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "roteiros_agente_ia_id_fkey"
            columns: ["agente_ia_id"]
            isOneToOne: false
            referencedRelation: "roteiro_agentes_ia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roteiros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roteiros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "roteiros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "roteiros_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "roteiro_frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roteiros_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "roteiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roteiros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roteiros_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
        ]
      }
      social_auth_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          provider: string
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          provider: string
          success?: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          provider?: string
          success?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      social_integrations: {
        Row: {
          access_token: string
          account_data: Json | null
          account_name: string | null
          created_at: string
          id: string
          is_active: boolean
          permissions: Json | null
          provider: string
          provider_user_id: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_data?: Json | null
          account_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json | null
          provider: string
          provider_user_id: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_data?: Json | null
          account_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json | null
          provider?: string
          provider_user_id?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_integrations_cliente: {
        Row: {
          access_token: string
          account_data: Json | null
          account_id: string
          account_name: string | null
          cliente_id: string
          connected_by: string | null
          created_at: string
          id: string
          is_active: boolean
          permissions: Json | null
          provider: string
          provider_user_id: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          account_data?: Json | null
          account_id: string
          account_name?: string | null
          cliente_id: string
          connected_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json | null
          provider: string
          provider_user_id: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          account_data?: Json | null
          account_id?: string
          account_name?: string | null
          cliente_id?: string
          connected_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json | null
          provider?: string
          provider_user_id?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_integrations_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_integrations_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "social_integrations_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
        ]
      }
      social_metrics: {
        Row: {
          created_at: string
          id: string
          integration_id: string
          metric_date: string
          metric_type: string
          metric_value: number
          raw_data: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          integration_id: string
          metric_date: string
          metric_type: string
          metric_value?: number
          raw_data?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          integration_id?: string
          metric_date?: string
          metric_type?: string
          metric_value?: number
          raw_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "social_metrics_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "social_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      social_metrics_cliente: {
        Row: {
          cliente_id: string
          created_at: string
          id: string
          integration_id: string
          metric_date: string
          metric_type: string
          metric_value: number
          raw_data: Json | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          id?: string
          integration_id: string
          metric_date: string
          metric_type: string
          metric_value: number
          raw_data?: Json | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          id?: string
          integration_id?: string
          metric_date?: string
          metric_type?: string
          metric_value?: number
          raw_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "social_metrics_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_metrics_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "social_metrics_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "social_metrics_cliente_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "social_integrations_cliente"
            referencedColumns: ["id"]
          },
        ]
      }
      social_post_queue: {
        Row: {
          anexo_url: string | null
          attempts: number
          created_at: string
          error_message: string | null
          formato: string
          id: string
          legenda: string
          max_attempts: number
          platforms: string[]
          published_results: Json | null
          scheduled_for: string
          status: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anexo_url?: string | null
          attempts?: number
          created_at?: string
          error_message?: string | null
          formato?: string
          id?: string
          legenda: string
          max_attempts?: number
          platforms: string[]
          published_results?: Json | null
          scheduled_for: string
          status?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anexo_url?: string | null
          attempts?: number
          created_at?: string
          error_message?: string | null
          formato?: string
          id?: string
          legenda?: string
          max_attempts?: number
          platforms?: string[]
          published_results?: Json | null
          scheduled_for?: string
          status?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      submodulos: {
        Row: {
          ativo: boolean
          created_at: string
          icone: string
          id: string
          modulo_id: string
          nome: string
          ordem: number
          rota: string
          slug: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          icone?: string
          id?: string
          modulo_id: string
          nome: string
          ordem?: number
          rota: string
          slug: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          icone?: string
          id?: string
          modulo_id?: string
          nome?: string
          ordem?: number
          rota?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submodulos_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health_logs: {
        Row: {
          check_type: string
          created_at: string | null
          details: Json | null
          id: string
          status: string
        }
        Insert: {
          check_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          status: string
        }
        Update: {
          check_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      tarefa: {
        Row: {
          area: Database["public"]["Enums"]["area_enum"][] | null
          campanha_id: string | null
          canais: Database["public"]["Enums"]["canal_enum"][] | null
          capa_anexo_id: string | null
          checklist: Json | null
          checklist_progress: number | null
          cliente_id: string | null
          created_at: string | null
          created_by: string | null
          cta: string | null
          data_entrega_prevista: string | null
          data_inicio_prevista: string | null
          data_publicacao: string | null
          descricao: string | null
          executor_area:
            | Database["public"]["Enums"]["executor_area_enum"]
            | null
          executor_id: string | null
          grs_action_id: string | null
          horas_estimadas: number | null
          horas_trabalhadas: number | null
          id: string
          kpis: Json | null
          numero_protocolo: string | null
          origem: string | null
          prazo_executor: string | null
          prioridade: Database["public"]["Enums"]["prioridade_enum"] | null
          produto_id: string | null
          projeto_id: string | null
          publico_alvo: string | null
          responsavel_id: string | null
          status: Database["public"]["Enums"]["status_tarefa_enum"] | null
          tags: string[] | null
          tipo: Database["public"]["Enums"]["tipo_tarefa_enum"]
          titulo: string
          tom_voz: string | null
          trace_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          area?: Database["public"]["Enums"]["area_enum"][] | null
          campanha_id?: string | null
          canais?: Database["public"]["Enums"]["canal_enum"][] | null
          capa_anexo_id?: string | null
          checklist?: Json | null
          checklist_progress?: number | null
          cliente_id?: string | null
          created_at?: string | null
          created_by?: string | null
          cta?: string | null
          data_entrega_prevista?: string | null
          data_inicio_prevista?: string | null
          data_publicacao?: string | null
          descricao?: string | null
          executor_area?:
            | Database["public"]["Enums"]["executor_area_enum"]
            | null
          executor_id?: string | null
          grs_action_id?: string | null
          horas_estimadas?: number | null
          horas_trabalhadas?: number | null
          id?: string
          kpis?: Json | null
          numero_protocolo?: string | null
          origem?: string | null
          prazo_executor?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade_enum"] | null
          produto_id?: string | null
          projeto_id?: string | null
          publico_alvo?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_tarefa_enum"] | null
          tags?: string[] | null
          tipo?: Database["public"]["Enums"]["tipo_tarefa_enum"]
          titulo: string
          tom_voz?: string | null
          trace_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          area?: Database["public"]["Enums"]["area_enum"][] | null
          campanha_id?: string | null
          canais?: Database["public"]["Enums"]["canal_enum"][] | null
          capa_anexo_id?: string | null
          checklist?: Json | null
          checklist_progress?: number | null
          cliente_id?: string | null
          created_at?: string | null
          created_by?: string | null
          cta?: string | null
          data_entrega_prevista?: string | null
          data_inicio_prevista?: string | null
          data_publicacao?: string | null
          descricao?: string | null
          executor_area?:
            | Database["public"]["Enums"]["executor_area_enum"]
            | null
          executor_id?: string | null
          grs_action_id?: string | null
          horas_estimadas?: number | null
          horas_trabalhadas?: number | null
          id?: string
          kpis?: Json | null
          numero_protocolo?: string | null
          origem?: string | null
          prazo_executor?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade_enum"] | null
          produto_id?: string | null
          projeto_id?: string | null
          publico_alvo?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_tarefa_enum"] | null
          tags?: string[] | null
          tipo?: Database["public"]["Enums"]["tipo_tarefa_enum"]
          titulo?: string
          tom_voz?: string | null
          trace_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefa_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "campanha"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefa_capa_anexo_id_fkey"
            columns: ["capa_anexo_id"]
            isOneToOne: false
            referencedRelation: "anexo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefa_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefa_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "tarefa_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "tarefa_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefa_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "tarefa_executor_id_fkey"
            columns: ["executor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefa_executor_id_fkey"
            columns: ["executor_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "tarefa_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefa_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefa_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefa_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "tarefa_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefa_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      tarefa_atividades: {
        Row: {
          conteudo: string | null
          created_at: string
          id: string
          metadata: Json | null
          tarefa_id: string
          tipo_atividade: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          tarefa_id: string
          tipo_atividade: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          tarefa_id?: string
          tipo_atividade?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefa_atividades_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefa_conteudo: {
        Row: {
          bloco_json: Json | null
          created_at: string | null
          id: string
          publicado: boolean | null
          tarefa_id: string
          updated_at: string | null
          versao: number | null
        }
        Insert: {
          bloco_json?: Json | null
          created_at?: string | null
          id?: string
          publicado?: boolean | null
          tarefa_id: string
          updated_at?: string | null
          versao?: number | null
        }
        Update: {
          bloco_json?: Json | null
          created_at?: string | null
          id?: string
          publicado?: boolean | null
          tarefa_id?: string
          updated_at?: string | null
          versao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefa_conteudo_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefa_seguidores: {
        Row: {
          created_at: string
          id: string
          tarefa_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tarefa_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tarefa_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefa_seguidores_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          anexos: Json | null
          created_at: string | null
          data_prazo: string | null
          descricao: string | null
          id: string
          prioridade: Database["public"]["Enums"]["priority_type"] | null
          projeto_id: string | null
          responsavel_id: string | null
          solicitante_id: string | null
          status: string | null
          tempo_estimado: number | null
          tipo: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          anexos?: Json | null
          created_at?: string | null
          data_prazo?: string | null
          descricao?: string | null
          id?: string
          prioridade?: Database["public"]["Enums"]["priority_type"] | null
          projeto_id?: string | null
          responsavel_id?: string | null
          solicitante_id?: string | null
          status?: string | null
          tempo_estimado?: number | null
          tipo?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          anexos?: Json | null
          created_at?: string | null
          data_prazo?: string | null
          descricao?: string | null
          id?: string
          prioridade?: Database["public"]["Enums"]["priority_type"] | null
          projeto_id?: string | null
          responsavel_id?: string | null
          solicitante_id?: string | null
          status?: string | null
          tempo_estimado?: number | null
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "tarefas_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      tarefas_equipamentos: {
        Row: {
          checklist_entrada: Json | null
          checklist_saida: Json | null
          created_at: string | null
          fim: string
          id: string
          inicio: string
          item_id: string | null
          quantidade: number | null
          status_vinculo: string | null
          tarefa_id: string | null
          termo_assinado_id: string | null
          unidade_id: string | null
        }
        Insert: {
          checklist_entrada?: Json | null
          checklist_saida?: Json | null
          created_at?: string | null
          fim: string
          id?: string
          inicio: string
          item_id?: string | null
          quantidade?: number | null
          status_vinculo?: string | null
          tarefa_id?: string | null
          termo_assinado_id?: string | null
          unidade_id?: string | null
        }
        Update: {
          checklist_entrada?: Json | null
          checklist_saida?: Json | null
          created_at?: string | null
          fim?: string
          id?: string
          inicio?: string
          item_id?: string | null
          quantidade?: number | null
          status_vinculo?: string | null
          tarefa_id?: string | null
          termo_assinado_id?: string | null
          unidade_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_equipamentos_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventario_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_equipamentos_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas_projeto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_equipamentos_termo_assinado_id_fkey"
            columns: ["termo_assinado_id"]
            isOneToOne: false
            referencedRelation: "inventario_termos_assinados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_equipamentos_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "inventario_unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas_projeto: {
        Row: {
          anexos: string[] | null
          aprovacao_status: string | null
          aprovado_por: string | null
          briefing_obrigatorio: boolean | null
          created_at: string
          data_aprovacao: string | null
          data_inicio: string | null
          data_prazo: string | null
          dependencias: string[] | null
          descricao: string | null
          grs_action_id: string | null
          horas_estimadas: number | null
          horas_trabalhadas: number | null
          id: string
          observacoes: string | null
          observacoes_aprovacao: string | null
          origem: string | null
          prioridade: string
          projeto_id: string
          responsavel_id: string | null
          setor_responsavel: string
          status: string
          tipo_tarefa: string | null
          titulo: string
          trace_id: string | null
          updated_at: string
        }
        Insert: {
          anexos?: string[] | null
          aprovacao_status?: string | null
          aprovado_por?: string | null
          briefing_obrigatorio?: boolean | null
          created_at?: string
          data_aprovacao?: string | null
          data_inicio?: string | null
          data_prazo?: string | null
          dependencias?: string[] | null
          descricao?: string | null
          grs_action_id?: string | null
          horas_estimadas?: number | null
          horas_trabalhadas?: number | null
          id?: string
          observacoes?: string | null
          observacoes_aprovacao?: string | null
          origem?: string | null
          prioridade?: string
          projeto_id: string
          responsavel_id?: string | null
          setor_responsavel: string
          status?: string
          tipo_tarefa?: string | null
          titulo: string
          trace_id?: string | null
          updated_at?: string
        }
        Update: {
          anexos?: string[] | null
          aprovacao_status?: string | null
          aprovado_por?: string | null
          briefing_obrigatorio?: boolean | null
          created_at?: string
          data_aprovacao?: string | null
          data_inicio?: string | null
          data_prazo?: string | null
          dependencias?: string[] | null
          descricao?: string | null
          grs_action_id?: string | null
          horas_estimadas?: number | null
          horas_trabalhadas?: number | null
          id?: string
          observacoes?: string | null
          observacoes_aprovacao?: string | null
          origem?: string | null
          prioridade?: string
          projeto_id?: string
          responsavel_id?: string | null
          setor_responsavel?: string
          status?: string
          tipo_tarefa?: string | null
          titulo?: string
          trace_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_projeto_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_projeto_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "tarefas_projeto_grs_action_id_fkey"
            columns: ["grs_action_id"]
            isOneToOne: false
            referencedRelation: "planejamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_projeto_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_projeto_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_projeto_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      transacoes_financeiras: {
        Row: {
          categoria_id: string | null
          cliente_id: string | null
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string | null
          id: string
          observacoes: string | null
          produto_id: string | null
          projeto_id: string | null
          responsavel_id: string | null
          status: string
          tipo: string
          titulo: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          cliente_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao?: string | null
          id?: string
          observacoes?: string | null
          produto_id?: string | null
          projeto_id?: string | null
          responsavel_id?: string | null
          status?: string
          tipo: string
          titulo: string
          updated_at?: string
          valor: number
        }
        Update: {
          categoria_id?: string | null
          cliente_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string | null
          id?: string
          observacoes?: string | null
          produto_id?: string | null
          projeto_id?: string | null
          responsavel_id?: string | null
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_financeiras_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_access_logs: {
        Row: {
          action: string
          created_at: string
          email: string
          error_message: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          email: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          email?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_access_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_access_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      user_integrity_checks: {
        Row: {
          auth_user_id: string
          has_profile: boolean | null
          has_role: boolean | null
          id: string
          is_orphan: boolean | null
          last_check: string | null
        }
        Insert: {
          auth_user_id: string
          has_profile?: boolean | null
          has_role?: boolean | null
          id?: string
          is_orphan?: boolean | null
          last_check?: string | null
        }
        Update: {
          auth_user_id?: string
          has_profile?: boolean | null
          has_role?: boolean | null
          id?: string
          is_orphan?: boolean | null
          last_check?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
    }
    Views: {
      especialistas_view: {
        Row: {
          created_at: string | null
          email: string | null
          especialidade: string | null
          id: string | null
          nome: string | null
          status: Database["public"]["Enums"]["pessoa_status"] | null
          telefone: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          especialidade?: never
          id?: string | null
          nome?: string | null
          status?: Database["public"]["Enums"]["pessoa_status"] | null
          telefone?: never
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          especialidade?: never
          id?: string | null
          nome?: string | null
          status?: Database["public"]["Enums"]["pessoa_status"] | null
          telefone?: never
          updated_at?: string | null
        }
        Relationships: []
      }
      mv_grs_dashboard_metrics: {
        Row: {
          cliente_created_at: string | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_nome: string | null
          cliente_status: string | null
          projetos_recentes: number | null
          responsavel_id: string | null
          total_planejamentos: number | null
          total_projetos: number | null
          ultima_atualizacao: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      rh_colaboradores_view: {
        Row: {
          agencia: string | null
          banco_codigo: string | null
          banco_nome: string | null
          cargo_id: string | null
          conta: string | null
          cpf_cnpj: string | null
          created_at: string | null
          data_admissao: string | null
          data_desligamento: string | null
          email: string | null
          fee_mensal: number | null
          id: string | null
          nome_completo: string | null
          observacoes: string | null
          pix_chave: string | null
          pix_tipo: string | null
          regime: Database["public"]["Enums"]["pessoa_regime"] | null
          salario_base: number | null
          status: Database["public"]["Enums"]["pessoa_status"] | null
          telefone: Json | null
          tipo_conta: string | null
          updated_at: string | null
        }
        Insert: {
          agencia?: never
          banco_codigo?: never
          banco_nome?: never
          cargo_id?: string | null
          conta?: never
          cpf_cnpj?: string | null
          created_at?: string | null
          data_admissao?: string | null
          data_desligamento?: string | null
          email?: string | null
          fee_mensal?: number | null
          id?: string | null
          nome_completo?: string | null
          observacoes?: string | null
          pix_chave?: never
          pix_tipo?: never
          regime?: Database["public"]["Enums"]["pessoa_regime"] | null
          salario_base?: number | null
          status?: Database["public"]["Enums"]["pessoa_status"] | null
          telefone?: never
          tipo_conta?: never
          updated_at?: string | null
        }
        Update: {
          agencia?: never
          banco_codigo?: never
          banco_nome?: never
          cargo_id?: string | null
          conta?: never
          cpf_cnpj?: string | null
          created_at?: string | null
          data_admissao?: string | null
          data_desligamento?: string | null
          email?: string | null
          fee_mensal?: number | null
          id?: string | null
          nome_completo?: string | null
          observacoes?: string | null
          pix_chave?: never
          pix_tipo?: never
          regime?: Database["public"]["Enums"]["pessoa_regime"] | null
          salario_base?: number | null
          status?: Database["public"]["Enums"]["pessoa_status"] | null
          telefone?: never
          tipo_conta?: never
          updated_at?: string | null
        }
        Relationships: []
      }
      rls_errors_stats: {
        Row: {
          affected_users: number | null
          error_count: number | null
          last_occurrence: string | null
          operation: string | null
          table_name: string | null
        }
        Relationships: []
      }
      safe_table_metadata: {
        Row: {
          column_name: unknown | null
          data_type: string | null
          is_nullable: string | null
          table_name: unknown | null
        }
        Relationships: []
      }
      vw_client_metrics: {
        Row: {
          assinatura_nome: string | null
          cliente_id: string | null
          cnpj_cpf: string | null
          endereco: string | null
          faturas_total: number | null
          logo_url: string | null
          nome: string | null
          pagamentos_percentual: number | null
          pagamentos_total: number | null
          projetos_abertos: number | null
          projetos_totais: number | null
          responsavel_id: string | null
          responsavel_nome: string | null
          status: string | null
          telefone: string | null
        }
        Relationships: []
      }
      vw_colaboradores_especialistas: {
        Row: {
          ativo: boolean | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          especialidade: string | null
          id: string | null
          nome_completo: string | null
          profile_id: string | null
          regime: string | null
          salario_base: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          especialidade?: never
          id?: string | null
          nome_completo?: string | null
          profile_id?: string | null
          regime?: never
          salario_base?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          especialidade?: never
          id?: string | null
          nome_completo?: string | null
          profile_id?: string | null
          regime?: never
          salario_base?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funcionarios_perfil_acesso_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionarios_perfil_acesso_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
      vw_credenciais_por_categoria: {
        Row: {
          categoria: string | null
          categoria_label: string | null
          cliente_id: string | null
          extra: Json | null
          id: string | null
          plataforma: string | null
          projeto_id: string | null
          total_na_categoria: number | null
          updated_at: string | null
          updated_by_nome: string | null
          usuario_login: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credenciais_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credenciais_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "credenciais_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "credenciais_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_planos_publicos: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          id: string | null
          missao: string | null
          periodo_fim: string | null
          periodo_inicio: string | null
          titulo: string | null
          updated_at: string | null
          valores: string[] | null
          visao: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          id?: string | null
          missao?: string | null
          periodo_fim?: string | null
          periodo_inicio?: string | null
          titulo?: string | null
          updated_at?: string | null
          valores?: string[] | null
          visao?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          id?: string | null
          missao?: string | null
          periodo_fim?: string | null
          periodo_inicio?: string | null
          titulo?: string | null
          updated_at?: string | null
          valores?: string[] | null
          visao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_estrategicos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_estrategicos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "planos_estrategicos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
        ]
      }
      vw_planos_publicos_itens: {
        Row: {
          descricao: string | null
          id: string | null
          iniciativas: string[] | null
          kpis: string[] | null
          objetivo: string | null
          ordem: number | null
          plano_id: string | null
          prazo_conclusao: string | null
          responsavel_nome: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_objetivos_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_estrategicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_objetivos_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "vw_planos_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_produtividade_7d: {
        Row: {
          lead_time_medio_dias: number | null
          responsavel_id: string | null
          responsavel_nome: string | null
          setor_responsavel: string | null
          tarefas_concluidas: number | null
          tarefas_criadas: number | null
          tarefas_vencidas: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_projeto_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_projeto_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
        ]
      }
    }
    Functions: {
      aprovar_especialista: {
        Args: { especialista_id: string; observacao?: string }
        Returns: boolean
      }
      atualizar_pontuacao_gamificacao: {
        Args: {
          p_descricao?: string
          p_is_privado?: boolean
          p_pontos: number
          p_tipo_acao: Database["public"]["Enums"]["tipo_pontuacao"]
          p_user_id: string
        }
        Returns: boolean
      }
      auto_sync_orphan_users: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      calcular_folha_mes: {
        Args: { p_competencia: string; p_pessoa_id: string }
        Returns: Json
      }
      can_access_sensitive_customer_data: {
        Args: { customer_id: string }
        Returns: boolean
      }
      check_orphan_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          orphan_count: number
          orphan_emails: string[]
        }[]
      }
      check_user_integrity: {
        Args: Record<PropertyKey, never>
        Returns: {
          integrity_score: number
          orphan_auth_users: number
          orphan_profiles: number
          total_auth_users: number
          users_with_profile: number
          users_with_role: number
        }[]
      }
      create_client_user_direct: {
        Args: {
          p_cliente_id: string
          p_email: string
          p_nome: string
          p_password: string
          p_role?: string
        }
        Returns: Json
      }
      create_client_user_sql: {
        Args: {
          p_cliente_id: string
          p_email: string
          p_nome: string
          p_password: string
          p_role?: string
        }
        Returns: Json
      }
      create_intelligence_alert: {
        Args: {
          p_cliente_id: string
          p_message: string
          p_severity?: string
          p_source_reference?: Json
          p_title: string
        }
        Returns: string
      }
      criar_log_atividade: {
        Args: {
          p_acao: string
          p_cliente_id: string
          p_descricao: string
          p_entidade_id: string
          p_entidade_tipo: string
          p_metadata?: Json
          p_usuario_id: string
        }
        Returns: string
      }
      ensure_profile_exists: {
        Args: {
          p_cliente_id?: string
          p_email: string
          p_especialidade?: string
          p_nome?: string
          p_telefone?: string
          p_user_id: string
        }
        Returns: string
      }
      fechar_folha_mes: {
        Args: { p_competencia: string; p_pessoa_id: string }
        Returns: string
      }
      find_orphan_auth_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          auth_user_id: string
          created_at: string
          email: string
          has_profile: boolean
          user_metadata: Json
        }[]
      }
      fn_calcular_fgts: {
        Args: { p_competencia?: string; p_salario_bruto: number }
        Returns: number
      }
      fn_calcular_inss: {
        Args: { p_competencia?: string; p_salario_bruto: number }
        Returns: {
          aliquota_efetiva: number
          faixas_aplicadas: Json
          valor_inss: number
        }[]
      }
      fn_calcular_irrf: {
        Args: {
          p_base_calculo: number
          p_competencia?: string
          p_num_dependentes?: number
        }
        Returns: {
          aliquota_efetiva: number
          faixa_aplicada: number
          valor_irrf: number
        }[]
      }
      fn_calcular_ponto: {
        Args: { p_ponto_id: string }
        Returns: undefined
      }
      fn_cred_get_metadata: {
        Args: { p_cliente_id: string; p_projeto_id?: string }
        Returns: {
          categoria: string
          cliente_id: string
          created_at: string
          created_by: string
          created_by_nome: string
          extra: Json
          id: string
          plataforma: string
          projeto_id: string
          updated_at: string
          updated_by: string
          updated_by_nome: string
          usuario_login: string
        }[]
      }
      fn_cred_reveal: {
        Args: { p_cred_id: string; p_motivo?: string }
        Returns: {
          secrets_plain: Json
          senha_plain: string
        }[]
      }
      fn_cred_save: {
        Args:
          | {
              p_categoria: string
              p_cliente_id: string
              p_cred_id?: string
              p_extra_json?: Json
              p_plataforma: string
              p_projeto_id: string
              p_secrets_json?: Json
              p_senha_plain: string
              p_usuario_login: string
            }
          | {
              p_categoria: string
              p_cliente_id: string
              p_cred_id?: string
              p_extra_json?: Json
              p_plataforma: string
              p_projeto_id: string
              p_senha_plain: string
              p_usuario_login: string
            }
        Returns: string
      }
      fn_criar_aprovacao_cliente: {
        Args: {
          p_cliente_id: string
          p_descricao?: string
          p_referencia_id: string
          p_referencia_tipo: string
          p_titulo: string
          p_trace_id?: string
        }
        Returns: Json
      }
      fn_criar_evento_com_regras: {
        Args:
          | {
              p_data_fim: string
              p_data_inicio: string
              p_equipamentos_ids?: string[]
              p_is_extra?: boolean
              p_local?: string
              p_modo_criativo?: string
              p_observacoes?: string
              p_projeto_id: string
              p_quantidade_pecas?: number
              p_responsavel_id: string
              p_tipo: Database["public"]["Enums"]["tipo_evento"]
              p_titulo: string
            }
          | {
              p_data_fim: string
              p_data_inicio: string
              p_equipamentos_ids?: string[]
              p_is_extra?: boolean
              p_local?: string
              p_modo_criativo?: string
              p_projeto_id: string
              p_responsavel_id: string
              p_tipo: Database["public"]["Enums"]["tipo_evento"]
              p_titulo: string
            }
        Returns: Json
      }
      fn_criar_reserva_equipamento: {
        Args: {
          p_fim: string
          p_inicio: string
          p_item_id: string
          p_projeto_id?: string
          p_quantidade?: number
          p_tarefa_id?: string
          p_tipo_reserva: string
          p_unidade_id?: string
        }
        Returns: string
      }
      fn_criar_tarefa_de_planejamento: {
        Args: {
          p_data_prazo?: string
          p_descricao: string
          p_especialista_id: string
          p_planejamento_id: string
          p_prioridade?: string
          p_projeto_id: string
          p_setor: string
          p_titulo: string
          p_trace_id?: string
        }
        Returns: string
      }
      fn_log_tarefa: {
        Args: {
          p_acao: string
          p_actor_id: string
          p_detalhe?: Json
          p_tarefa_id: string
        }
        Returns: string
      }
      fn_sugerir_slot_disponivel: {
        Args: {
          p_data_preferida: string
          p_duracao_minutos: number
          p_responsavel_id: string
          p_tipo_evento: Database["public"]["Enums"]["tipo_evento"]
        }
        Returns: Json
      }
      fn_tarefa_status_prazo: {
        Args: { p_tarefa_id: string }
        Returns: string
      }
      fn_validar_limite_adiantamento: {
        Args: {
          p_colaborador_id: string
          p_competencia: string
          p_novo_valor: number
        }
        Returns: boolean
      }
      fn_validar_vinculo_projeto_cliente: {
        Args: { p_projeto_id: string }
        Returns: Json
      }
      fn_verificar_conflito_agenda: {
        Args: {
          p_data_fim: string
          p_data_inicio: string
          p_excluir_evento_id?: string
          p_responsavel_id: string
        }
        Returns: Json
      }
      fn_verificar_disponibilidade: {
        Args: {
          p_fim: string
          p_inicio: string
          p_item_id: string
          p_quantidade?: number
          p_unidade_id?: string
        }
        Returns: Json
      }
      generate_content_with_ai_v2: {
        Args: { content_type?: string; prompt_text: string }
        Returns: {
          content: string
          success: boolean
          type: string
        }[]
      }
      generate_content_with_openai: {
        Args: { prompt_text: string }
        Returns: string
      }
      gerar_numero_documento: {
        Args: { ano: number; tipo: string }
        Returns: string
      }
      get_filtered_customer_data: {
        Args: { customer_id: string }
        Returns: {
          assinatura_id: string
          cnpj_cpf: string
          created_at: string
          email: string
          endereco: string
          id: string
          nome: string
          responsavel_id: string
          status: Database["public"]["Enums"]["status_type"]
          telefone: string
          updated_at: string
        }[]
      }
      get_filtered_customers_list: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_filtered_profile: {
        Args: { profile_id: string }
        Returns: Json
      }
      get_grs_dashboard_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          aprovacoes_pendentes: number
          cliente_id: string
          posts_agendados: number
          posts_rascunho: number
          projetos_ativos: number
          responsavel_id: string
          tarefas_ativas: number
          total_posts: number
          total_projetos: number
        }[]
      }
      get_masked_social_integration: {
        Args: { integration_id: string }
        Returns: Json
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      log_rls_error: {
        Args: {
          p_error_code?: string
          p_error_message: string
          p_metadata?: Json
          p_operation: string
          p_table_name: string
        }
        Returns: string
      }
      log_user_access: {
        Args: {
          p_action?: string
          p_email?: string
          p_error_message?: string
          p_ip_address?: string
          p_metadata?: Json
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: string
      }
      popular_checklist_inicial: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      process_social_post_queue: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_grs_dashboard_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      rejeitar_especialista: {
        Args: { especialista_id: string; observacao?: string }
        Returns: boolean
      }
      sanitize_error_message: {
        Args: { error_msg: string }
        Returns: string
      }
      update_connector_status: {
        Args: {
          p_connector_name: string
          p_error_message?: string
          p_success: boolean
        }
        Returns: undefined
      }
      update_user_role: {
        Args: {
          p_new_role: Database["public"]["Enums"]["user_role"]
          p_user_id: string
        }
        Returns: boolean
      }
      user_can_manage_cliente_usuarios: {
        Args: { p_cliente_id: string; p_user_id: string }
        Returns: boolean
      }
      validate_specialist_access: {
        Args: { p_user_id: string }
        Returns: Json
      }
      validate_user_for_login: {
        Args: { p_email: string }
        Returns: Json
      }
      vincular_usuarios_clientes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      area_enum:
        | "GRS"
        | "Design"
        | "Audiovisual"
        | "Social"
        | "Midia_Paga"
        | "Adm"
      canal_enum:
        | "Instagram"
        | "TikTok"
        | "Facebook"
        | "YouTube"
        | "Site"
        | "GoogleAds"
        | "MetaAds"
        | "Outros"
      cliente_role:
        | "proprietario"
        | "gerente_financeiro"
        | "gestor_marketing"
        | "social_media"
      especialidade_gamificacao: "grs" | "design" | "audiovisual"
      especialidade_type:
        | "videomaker"
        | "filmmaker"
        | "design"
        | "gerente_redes_sociais"
        | "grs"
        | "atendimento"
        | "audiovisual"
        | "financeiro"
        | "gestor"
      etapa_carreira_enum: "trainee" | "estagiario" | "especialista" | "gestor"
      executor_area_enum: "Audiovisual" | "Criativo"
      motivo_ponto_enum:
        | "operacional"
        | "cliente"
        | "saude"
        | "acordo"
        | "outros"
      pessoa_papel: "colaborador" | "especialista" | "cliente"
      pessoa_regime: "clt" | "pj" | "estagio" | "freelancer"
      pessoa_status:
        | "ativo"
        | "afastado"
        | "desligado"
        | "inativo"
        | "ferias"
        | "aprovado"
        | "pendente_aprovacao"
        | "rejeitado"
        | "suspenso"
      pix_tipo_enum: "cpf" | "cnpj" | "email" | "telefone" | "aleatoria"
      plataforma_roteiro:
        | "reels"
        | "tiktok"
        | "short"
        | "vt"
        | "institucional"
        | "spot_radio"
        | "doc"
        | "outro"
      prioridade_enum: "baixa" | "media" | "alta" | "critica"
      priority_type: "baixa" | "media" | "alta" | "urgente"
      provedor_ia_roteiro:
        | "openai"
        | "google"
        | "azure_openai"
        | "lovable_ai"
        | "outro"
      regime_trabalho: "clt" | "estagio" | "pj"
      status_acesso_enum: "ativo" | "suspenso" | "bloqueado"
      status_aprovacao_enum: "pendente" | "aprovado" | "ajustes" | "reprovado"
      status_colaborador:
        | "ativo"
        | "inativo"
        | "ferias"
        | "afastado"
        | "desligado"
      status_evento:
        | "agendado"
        | "confirmado"
        | "em_andamento"
        | "concluido"
        | "cancelado"
      status_folha: "aberta" | "processada" | "fechada"
      status_item_folha: "pendente" | "pago" | "cancelado"
      status_padrao:
        | "rascunho"
        | "em_revisao"
        | "aprovado_cliente"
        | "em_producao"
        | "em_aprovacao_final"
        | "finalizado"
        | "reprovado"
      status_ponto_enum:
        | "pendente"
        | "aprovado_gestor"
        | "aprovado_rh"
        | "rejeitado"
      status_roteiro: "rascunho" | "em_revisao" | "aprovado" | "publicado"
      status_tarefa_enum:
        | "backlog"
        | "briefing"
        | "em_producao"
        | "em_revisao"
        | "aprovacao_cliente"
        | "aprovado"
        | "agendado"
        | "publicado"
        | "pausado"
        | "cancelado"
      status_type: "ativo" | "inativo" | "pendente" | "arquivado"
      tipo_anexo_enum:
        | "referencia"
        | "briefing"
        | "logo"
        | "paleta"
        | "roteiro"
        | "psd_ai"
        | "raw_video"
        | "planilha"
        | "contrato"
        | "outro"
      tipo_chave_pix: "cpf" | "cnpj" | "email" | "telefone" | "aleatoria"
      tipo_conta_bancaria: "corrente" | "poupanca" | "pme" | "salario"
      tipo_evento:
        | "criacao_avulso"
        | "criacao_lote"
        | "edicao_curta"
        | "edicao_longa"
        | "captacao_interna"
        | "captacao_externa"
        | "planejamento"
        | "reuniao"
        | "pausa_automatica"
        | "deslocamento"
        | "preparacao"
        | "backup"
      tipo_pontuacao:
        | "feedback_positivo"
        | "entrega_prazo"
        | "agendamento_prazo"
        | "relatorio_entregue"
        | "atraso_postagem"
        | "meta_batida"
        | "pacote_concluido"
        | "entrega_antecipada"
        | "aprovado_primeira"
        | "material_reprovado"
        | "video_entregue"
        | "entregas_semanais"
        | "video_aprovado"
        | "video_reprovado"
      tipo_rubrica: "provento" | "desconto" | "encargo" | "beneficio"
      tipo_tarefa_enum:
        | "planejamento_estrategico"
        | "roteiro_reels"
        | "criativo_card"
        | "criativo_carrossel"
        | "datas_comemorativas"
        | "trafego_pago"
        | "contrato"
        | "outro"
      tipo_vinculo_enum: "clt" | "pj" | "estagio" | "freelancer"
      user_role:
        | "admin"
        | "atendimento"
        | "designer"
        | "trafego"
        | "financeiro"
        | "cliente"
        | "fornecedor"
        | "grs"
        | "filmmaker"
        | "gestor"
        | "rh"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      area_enum: [
        "GRS",
        "Design",
        "Audiovisual",
        "Social",
        "Midia_Paga",
        "Adm",
      ],
      canal_enum: [
        "Instagram",
        "TikTok",
        "Facebook",
        "YouTube",
        "Site",
        "GoogleAds",
        "MetaAds",
        "Outros",
      ],
      cliente_role: [
        "proprietario",
        "gerente_financeiro",
        "gestor_marketing",
        "social_media",
      ],
      especialidade_gamificacao: ["grs", "design", "audiovisual"],
      especialidade_type: [
        "videomaker",
        "filmmaker",
        "design",
        "gerente_redes_sociais",
        "grs",
        "atendimento",
        "audiovisual",
        "financeiro",
        "gestor",
      ],
      etapa_carreira_enum: ["trainee", "estagiario", "especialista", "gestor"],
      executor_area_enum: ["Audiovisual", "Criativo"],
      motivo_ponto_enum: [
        "operacional",
        "cliente",
        "saude",
        "acordo",
        "outros",
      ],
      pessoa_papel: ["colaborador", "especialista", "cliente"],
      pessoa_regime: ["clt", "pj", "estagio", "freelancer"],
      pessoa_status: [
        "ativo",
        "afastado",
        "desligado",
        "inativo",
        "ferias",
        "aprovado",
        "pendente_aprovacao",
        "rejeitado",
        "suspenso",
      ],
      pix_tipo_enum: ["cpf", "cnpj", "email", "telefone", "aleatoria"],
      plataforma_roteiro: [
        "reels",
        "tiktok",
        "short",
        "vt",
        "institucional",
        "spot_radio",
        "doc",
        "outro",
      ],
      prioridade_enum: ["baixa", "media", "alta", "critica"],
      priority_type: ["baixa", "media", "alta", "urgente"],
      provedor_ia_roteiro: [
        "openai",
        "google",
        "azure_openai",
        "lovable_ai",
        "outro",
      ],
      regime_trabalho: ["clt", "estagio", "pj"],
      status_acesso_enum: ["ativo", "suspenso", "bloqueado"],
      status_aprovacao_enum: ["pendente", "aprovado", "ajustes", "reprovado"],
      status_colaborador: [
        "ativo",
        "inativo",
        "ferias",
        "afastado",
        "desligado",
      ],
      status_evento: [
        "agendado",
        "confirmado",
        "em_andamento",
        "concluido",
        "cancelado",
      ],
      status_folha: ["aberta", "processada", "fechada"],
      status_item_folha: ["pendente", "pago", "cancelado"],
      status_padrao: [
        "rascunho",
        "em_revisao",
        "aprovado_cliente",
        "em_producao",
        "em_aprovacao_final",
        "finalizado",
        "reprovado",
      ],
      status_ponto_enum: [
        "pendente",
        "aprovado_gestor",
        "aprovado_rh",
        "rejeitado",
      ],
      status_roteiro: ["rascunho", "em_revisao", "aprovado", "publicado"],
      status_tarefa_enum: [
        "backlog",
        "briefing",
        "em_producao",
        "em_revisao",
        "aprovacao_cliente",
        "aprovado",
        "agendado",
        "publicado",
        "pausado",
        "cancelado",
      ],
      status_type: ["ativo", "inativo", "pendente", "arquivado"],
      tipo_anexo_enum: [
        "referencia",
        "briefing",
        "logo",
        "paleta",
        "roteiro",
        "psd_ai",
        "raw_video",
        "planilha",
        "contrato",
        "outro",
      ],
      tipo_chave_pix: ["cpf", "cnpj", "email", "telefone", "aleatoria"],
      tipo_conta_bancaria: ["corrente", "poupanca", "pme", "salario"],
      tipo_evento: [
        "criacao_avulso",
        "criacao_lote",
        "edicao_curta",
        "edicao_longa",
        "captacao_interna",
        "captacao_externa",
        "planejamento",
        "reuniao",
        "pausa_automatica",
        "deslocamento",
        "preparacao",
        "backup",
      ],
      tipo_pontuacao: [
        "feedback_positivo",
        "entrega_prazo",
        "agendamento_prazo",
        "relatorio_entregue",
        "atraso_postagem",
        "meta_batida",
        "pacote_concluido",
        "entrega_antecipada",
        "aprovado_primeira",
        "material_reprovado",
        "video_entregue",
        "entregas_semanais",
        "video_aprovado",
        "video_reprovado",
      ],
      tipo_rubrica: ["provento", "desconto", "encargo", "beneficio"],
      tipo_tarefa_enum: [
        "planejamento_estrategico",
        "roteiro_reels",
        "criativo_card",
        "criativo_carrossel",
        "datas_comemorativas",
        "trafego_pago",
        "contrato",
        "outro",
      ],
      tipo_vinculo_enum: ["clt", "pj", "estagio", "freelancer"],
      user_role: [
        "admin",
        "atendimento",
        "designer",
        "trafego",
        "financeiro",
        "cliente",
        "fornecedor",
        "grs",
        "filmmaker",
        "gestor",
        "rh",
      ],
    },
  },
} as const
