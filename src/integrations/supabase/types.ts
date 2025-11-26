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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
            referencedRelation: "assinaturas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_temp_data_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_temp_data_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_planos_publicos_itens"
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
      analise_competitiva: {
        Row: {
          cliente_analise: Json | null
          cliente_id: string
          created_at: string | null
          gerado_em: string | null
          id: string
          relatorio_markdown: string | null
          resumo_ia: string | null
          updated_at: string | null
          versao: number | null
        }
        Insert: {
          cliente_analise?: Json | null
          cliente_id: string
          created_at?: string | null
          gerado_em?: string | null
          id?: string
          relatorio_markdown?: string | null
          resumo_ia?: string | null
          updated_at?: string | null
          versao?: number | null
        }
        Update: {
          cliente_analise?: Json | null
          cliente_id?: string
          created_at?: string | null
          gerado_em?: string | null
          id?: string
          relatorio_markdown?: string | null
          resumo_ia?: string | null
          updated_at?: string | null
          versao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analise_competitiva_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analise_competitiva_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "analise_competitiva_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "analise_competitiva_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "analise_competitiva_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
        ]
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
          {
            foreignKeyName: "anexo_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "anexo_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_anexo_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_anexo_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "fk_anexo_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
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
            foreignKeyName: "aprovacao_tarefa_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aprovacao_tarefa_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "aprovacao_tarefa_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      aprovacoes_cliente: {
        Row: {
          anexo_url: string | null
          call_to_action: string | null
          cliente_id: string
          created_at: string
          decided_at: string | null
          decidido_por: string | null
          descricao: string | null
          formato_postagem: string | null
          hash_publico: string | null
          hashtags: string[] | null
          id: string
          legenda: string | null
          motivo_reprovacao: string | null
          objetivo_postagem: string | null
          post_id: string | null
          projeto_id: string | null
          rede_social: string | null
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
          call_to_action?: string | null
          cliente_id: string
          created_at?: string
          decided_at?: string | null
          decidido_por?: string | null
          descricao?: string | null
          formato_postagem?: string | null
          hash_publico?: string | null
          hashtags?: string[] | null
          id?: string
          legenda?: string | null
          motivo_reprovacao?: string | null
          objetivo_postagem?: string | null
          post_id?: string | null
          projeto_id?: string | null
          rede_social?: string | null
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
          call_to_action?: string | null
          cliente_id?: string
          created_at?: string
          decided_at?: string | null
          decidido_por?: string | null
          descricao?: string | null
          formato_postagem?: string | null
          hash_publico?: string | null
          hashtags?: string[] | null
          id?: string
          legenda?: string | null
          motivo_reprovacao?: string | null
          objetivo_postagem?: string | null
          post_id?: string | null
          projeto_id?: string | null
          rede_social?: string | null
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
            foreignKeyName: "aprovacoes_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aprovacoes_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "aprovacoes_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "aprovacoes_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "aprovacoes_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacao_post"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_planejamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
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
          ip_usuario: unknown
          proposta_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          dados_gov_br?: Json | null
          evento: string
          id?: string
          ip_usuario?: unknown
          proposta_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          dados_gov_br?: Json | null
          evento?: string
          id?: string
          ip_usuario?: unknown
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
      audit_trail: {
        Row: {
          acao: string
          acao_detalhe: string | null
          created_at: string
          dados_antes: Json | null
          dados_depois: Json | null
          entidade_id: string
          entidade_tipo: string
          entidades_afetadas: Json | null
          id: string
          impacto_tipo: string | null
          ip_address: unknown
          metadata: Json | null
          trace_id: string
          user_agent: string | null
          user_id: string | null
          user_nome: string | null
          user_role: string | null
        }
        Insert: {
          acao: string
          acao_detalhe?: string | null
          created_at?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          entidade_id: string
          entidade_tipo: string
          entidades_afetadas?: Json | null
          id?: string
          impacto_tipo?: string | null
          ip_address?: unknown
          metadata?: Json | null
          trace_id?: string
          user_agent?: string | null
          user_id?: string | null
          user_nome?: string | null
          user_role?: string | null
        }
        Update: {
          acao?: string
          acao_detalhe?: string | null
          created_at?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          entidade_id?: string
          entidade_tipo?: string
          entidades_afetadas?: Json | null
          id?: string
          impacto_tipo?: string | null
          ip_address?: unknown
          metadata?: Json | null
          trace_id?: string
          user_agent?: string | null
          user_id?: string | null
          user_nome?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      audit_trail_backup_legacy: {
        Row: {
          acao: string
          acao_detalhe: string | null
          created_at: string
          dados_antes: Json | null
          dados_depois: Json | null
          entidade_id: string
          entidade_tipo: string
          entidades_afetadas: Json | null
          id: string
          impacto_tipo: string | null
          metadata: Json | null
          trace_id: string
          user_id: string | null
          user_nome: string | null
          user_role: string | null
        }
        Insert: {
          acao: string
          acao_detalhe?: string | null
          created_at?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          entidade_id: string
          entidade_tipo: string
          entidades_afetadas?: Json | null
          id?: string
          impacto_tipo?: string | null
          metadata?: Json | null
          trace_id?: string
          user_id?: string | null
          user_nome?: string | null
          user_role?: string | null
        }
        Update: {
          acao?: string
          acao_detalhe?: string | null
          created_at?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          entidade_id?: string
          entidade_tipo?: string
          entidades_afetadas?: Json | null
          id?: string
          impacto_tipo?: string | null
          metadata?: Json | null
          trace_id?: string
          user_id?: string | null
          user_nome?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      audit_universal: {
        Row: {
          dados_antigos: Json | null
          dados_novos: Json | null
          id: string
          ip_address: unknown
          operacao: string
          registro_id: string
          tabela: string
          timestamp: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          dados_antigos?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: unknown
          operacao: string
          registro_id: string
          tabela: string
          timestamp?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          dados_antigos?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: unknown
          operacao?: string
          registro_id?: string
          tabela?: string
          timestamp?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      backup_fks_pre_sprint1: {
        Row: {
          backup_timestamp: string | null
          campo: string
          id: string
          registro_id: string
          tabela: string
          valor_antigo: string | null
        }
        Insert: {
          backup_timestamp?: string | null
          campo: string
          id?: string
          registro_id: string
          tabela: string
          valor_antigo?: string | null
        }
        Update: {
          backup_timestamp?: string | null
          campo?: string
          id?: string
          registro_id?: string
          tabela?: string
          valor_antigo?: string | null
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "brand_assets_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
            foreignKeyName: "briefings_pacote_id_fkey"
            columns: ["pacote_id"]
            isOneToOne: false
            referencedRelation: "pacotes_compat"
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
            foreignKeyName: "briefings_projeto_gerado_id_fkey"
            columns: ["projeto_gerado_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "briefings_projeto_gerado_id_fkey"
            columns: ["projeto_gerado_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "briefings_projeto_gerado_id_fkey"
            columns: ["projeto_gerado_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "briefings_projeto_gerado_id_fkey"
            columns: ["projeto_gerado_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_briefings_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_briefings_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_briefings_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_briefings_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_briefings_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_briefings_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_briefings_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "fk_briefings_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
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
          criativos_url: string[] | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          metricas: Json | null
          nome: string
          objetivo: string | null
          onboarding_id: string | null
          orcamento: number | null
          origem_onboarding: boolean | null
          status_aprovacao: string | null
          tipo_campanha: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cliente_id?: string | null
          created_at?: string | null
          criativos_url?: string[] | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          metricas?: Json | null
          nome: string
          objetivo?: string | null
          onboarding_id?: string | null
          orcamento?: number | null
          origem_onboarding?: boolean | null
          status_aprovacao?: string | null
          tipo_campanha?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cliente_id?: string | null
          created_at?: string | null
          criativos_url?: string[] | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          metricas?: Json | null
          nome?: string
          objetivo?: string | null
          onboarding_id?: string | null
          orcamento?: number | null
          origem_onboarding?: boolean | null
          status_aprovacao?: string | null
          tipo_campanha?: string | null
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "campanha_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "campanha_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "cliente_onboarding"
            referencedColumns: ["id"]
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
            referencedRelation: "pessoas"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "fk_captacoes_especialista"
            columns: ["especialista_id"]
            isOneToOne: false
            referencedRelation: "profiles_deprecated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_captacoes_especialista"
            columns: ["especialista_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["responsavel_profile_id"]
          },
          {
            foreignKeyName: "fk_captacoes_especialista"
            columns: ["especialista_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "fk_captacoes_especialista"
            columns: ["especialista_id"]
            isOneToOne: false
            referencedRelation: "vw_produtividade_7d"
            referencedColumns: ["user_id"]
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
      centros_custo: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          orcamento_mensal: number | null
          responsavel_id: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          orcamento_mensal?: number | null
          responsavel_id?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          orcamento_mensal?: number | null
          responsavel_id?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cliente_documentos: {
        Row: {
          arquivo_path: string
          arquivo_url: string
          categoria: string
          cliente_id: string
          created_at: string | null
          criado_por: string | null
          descricao: string | null
          id: string
          mime_type: string | null
          projeto_id: string | null
          tamanho_kb: number | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          arquivo_path: string
          arquivo_url: string
          categoria: string
          cliente_id: string
          created_at?: string | null
          criado_por?: string | null
          descricao?: string | null
          id?: string
          mime_type?: string | null
          projeto_id?: string | null
          tamanho_kb?: number | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          arquivo_path?: string
          arquivo_url?: string
          categoria?: string
          cliente_id?: string
          created_at?: string | null
          criado_por?: string | null
          descricao?: string | null
          id?: string
          mime_type?: string | null
          projeto_id?: string | null
          tamanho_kb?: number | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cliente_documentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_documentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_documentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_documentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_documentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_documentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_documentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "cliente_documentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "cliente_documentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "cliente_documentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      cliente_metas: {
        Row: {
          area_foco: string | null
          cliente_id: string
          created_at: string | null
          descricao: string | null
          id: string
          mes_referencia: number | null
          origem_onboarding_id: string | null
          periodo_fim: string
          periodo_inicio: string
          progresso_percent: number | null
          status: string | null
          tipo_meta: string
          titulo: string
          unidade: string | null
          updated_at: string | null
          valor_alvo: number
          valor_atual: number | null
        }
        Insert: {
          area_foco?: string | null
          cliente_id: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          mes_referencia?: number | null
          origem_onboarding_id?: string | null
          periodo_fim: string
          periodo_inicio: string
          progresso_percent?: number | null
          status?: string | null
          tipo_meta: string
          titulo: string
          unidade?: string | null
          updated_at?: string | null
          valor_alvo: number
          valor_atual?: number | null
        }
        Update: {
          area_foco?: string | null
          cliente_id?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          mes_referencia?: number | null
          origem_onboarding_id?: string | null
          periodo_fim?: string
          periodo_inicio?: string
          progresso_percent?: number | null
          status?: string | null
          tipo_meta?: string
          titulo?: string
          unidade?: string | null
          updated_at?: string | null
          valor_alvo?: number
          valor_atual?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cliente_metas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_metas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_metas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_metas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_metas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_metas_origem_onboarding_id_fkey"
            columns: ["origem_onboarding_id"]
            isOneToOne: false
            referencedRelation: "cliente_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_metas_historico: {
        Row: {
          created_at: string | null
          data_registro: string
          id: string
          meta_id: string
          observacao: string | null
          progresso_percent: number
          valor_registrado: number
        }
        Insert: {
          created_at?: string | null
          data_registro?: string
          id?: string
          meta_id: string
          observacao?: string | null
          progresso_percent: number
          valor_registrado: number
        }
        Update: {
          created_at?: string | null
          data_registro?: string
          id?: string
          meta_id?: string
          observacao?: string | null
          progresso_percent?: number
          valor_registrado?: number
        }
        Relationships: [
          {
            foreignKeyName: "cliente_metas_historico_meta_id_fkey"
            columns: ["meta_id"]
            isOneToOne: false
            referencedRelation: "cliente_metas"
            referencedColumns: ["id"]
          },
        ]
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
          areas_foco: string[] | null
          assinatura_id: string | null
          campanhas_mensais: Json | null
          canais_atendimento_ativos: string | null
          canais_contato: string | null
          cliente_id: string
          como_encontram: string[] | null
          como_lembrada: string | null
          concorrentes_diretos: string | null
          created_at: string
          diferenciais: string | null
          dores_problemas: string | null
          duracao_contrato_meses: number | null
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
          link_facebook: string | null
          link_google_maps: string | null
          link_instagram: string | null
          link_linkedin: string | null
          link_site: string | null
          link_tiktok: string | null
          link_youtube: string | null
          localizacao: string | null
          materiais_impressos: string[] | null
          midia_paga: string | null
          midia_tradicional: string[] | null
          missao: string | null
          nome_empresa: string
          objetivos_comunicacao: string[] | null
          objetivos_digitais: string | null
          objetivos_offline: string | null
          onde_6_meses: string | null
          oportunidades: string | null
          plano_estrategico_id: string | null
          posicionamento: string | null
          presenca_digital: string[] | null
          presenca_digital_outros: string | null
          produtos_servicos: string | null
          publico_alvo: string[] | null
          publico_alvo_outros: string | null
          relacionamento_clientes: string[] | null
          relatorio_gerado_em: string | null
          relatorio_ia_gerado: string | null
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
          areas_foco?: string[] | null
          assinatura_id?: string | null
          campanhas_mensais?: Json | null
          canais_atendimento_ativos?: string | null
          canais_contato?: string | null
          cliente_id: string
          como_encontram?: string[] | null
          como_lembrada?: string | null
          concorrentes_diretos?: string | null
          created_at?: string
          diferenciais?: string | null
          dores_problemas?: string | null
          duracao_contrato_meses?: number | null
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
          link_facebook?: string | null
          link_google_maps?: string | null
          link_instagram?: string | null
          link_linkedin?: string | null
          link_site?: string | null
          link_tiktok?: string | null
          link_youtube?: string | null
          localizacao?: string | null
          materiais_impressos?: string[] | null
          midia_paga?: string | null
          midia_tradicional?: string[] | null
          missao?: string | null
          nome_empresa: string
          objetivos_comunicacao?: string[] | null
          objetivos_digitais?: string | null
          objetivos_offline?: string | null
          onde_6_meses?: string | null
          oportunidades?: string | null
          plano_estrategico_id?: string | null
          posicionamento?: string | null
          presenca_digital?: string[] | null
          presenca_digital_outros?: string | null
          produtos_servicos?: string | null
          publico_alvo?: string[] | null
          publico_alvo_outros?: string | null
          relacionamento_clientes?: string[] | null
          relatorio_gerado_em?: string | null
          relatorio_ia_gerado?: string | null
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
          areas_foco?: string[] | null
          assinatura_id?: string | null
          campanhas_mensais?: Json | null
          canais_atendimento_ativos?: string | null
          canais_contato?: string | null
          cliente_id?: string
          como_encontram?: string[] | null
          como_lembrada?: string | null
          concorrentes_diretos?: string | null
          created_at?: string
          diferenciais?: string | null
          dores_problemas?: string | null
          duracao_contrato_meses?: number | null
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
          link_facebook?: string | null
          link_google_maps?: string | null
          link_instagram?: string | null
          link_linkedin?: string | null
          link_site?: string | null
          link_tiktok?: string | null
          link_youtube?: string | null
          localizacao?: string | null
          materiais_impressos?: string[] | null
          midia_paga?: string | null
          midia_tradicional?: string[] | null
          missao?: string | null
          nome_empresa?: string
          objetivos_comunicacao?: string[] | null
          objetivos_digitais?: string | null
          objetivos_offline?: string | null
          onde_6_meses?: string | null
          oportunidades?: string | null
          plano_estrategico_id?: string | null
          posicionamento?: string | null
          presenca_digital?: string[] | null
          presenca_digital_outros?: string | null
          produtos_servicos?: string | null
          publico_alvo?: string[] | null
          publico_alvo_outros?: string | null
          relacionamento_clientes?: string[] | null
          relatorio_gerado_em?: string | null
          relatorio_ia_gerado?: string | null
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
            foreignKeyName: "cliente_onboarding_plano_estrategico_id_fkey"
            columns: ["plano_estrategico_id"]
            isOneToOne: false
            referencedRelation: "planos_estrategicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_onboarding_plano_estrategico_id_fkey"
            columns: ["plano_estrategico_id"]
            isOneToOne: false
            referencedRelation: "vw_planos_publicos"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
      cliente_tickets: {
        Row: {
          assunto: string
          atribuido_a: string | null
          categoria: string | null
          cliente_id: string
          created_at: string | null
          criado_por: string
          descricao: string
          id: string
          prioridade: string | null
          resolvido_em: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assunto: string
          atribuido_a?: string | null
          categoria?: string | null
          cliente_id: string
          created_at?: string | null
          criado_por: string
          descricao: string
          id?: string
          prioridade?: string | null
          resolvido_em?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assunto?: string
          atribuido_a?: string | null
          categoria?: string | null
          cliente_id?: string
          created_at?: string | null
          criado_por?: string
          descricao?: string
          id?: string
          prioridade?: string | null
          resolvido_em?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cliente_tickets_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_tickets_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_tickets_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_tickets_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_tickets_cliente_id_fkey"
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_usuarios_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
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
          valor_personalizado: number | null
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
          valor_personalizado?: number | null
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
          valor_personalizado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_clientes_assinatura"
            columns: ["assinatura_id"]
            isOneToOne: false
            referencedRelation: "assinaturas"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes_backup_pre_unificacao: {
        Row: {
          assinatura_id: string | null
          cnae_principal: string | null
          cnpj_cpf: string | null
          cnpj_fonte: string | null
          cnpj_ultima_consulta: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string | null
          logo_url: string | null
          nome: string | null
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
          id?: string | null
          logo_url?: string | null
          nome?: string | null
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
          id?: string | null
          logo_url?: string | null
          nome?: string | null
          nome_fantasia?: string | null
          razao_social?: string | null
          responsavel_id?: string | null
          situacao_cadastral?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clientes_personas: {
        Row: {
          ativo: boolean | null
          caracteristicas: string[] | null
          cliente_id: string
          created_at: string | null
          dores: string[] | null
          id: string
          idade_faixa: string | null
          necessidades: string[] | null
          nome: string
          objetivos: string[] | null
          ocupacao: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          caracteristicas?: string[] | null
          cliente_id: string
          created_at?: string | null
          dores?: string[] | null
          id?: string
          idade_faixa?: string | null
          necessidades?: string[] | null
          nome: string
          objetivos?: string[] | null
          ocupacao?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          caracteristicas?: string[] | null
          cliente_id?: string
          created_at?: string | null
          dores?: string[] | null
          id?: string
          idade_faixa?: string | null
          necessidades?: string[] | null
          nome?: string
          objetivos?: string[] | null
          ocupacao?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_personas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_personas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "clientes_personas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "clientes_personas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "clientes_personas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
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
      conciliacoes_bancarias: {
        Row: {
          conciliado_em: string | null
          conciliado_por: string | null
          conta_bancaria_id: string
          created_at: string
          diferenca: number | null
          id: string
          mes_referencia: string
          observacoes: string | null
          saldo_final_extrato: number
          saldo_final_sistema: number
          saldo_inicial: number
          status: string
          updated_at: string
        }
        Insert: {
          conciliado_em?: string | null
          conciliado_por?: string | null
          conta_bancaria_id: string
          created_at?: string
          diferenca?: number | null
          id?: string
          mes_referencia: string
          observacoes?: string | null
          saldo_final_extrato?: number
          saldo_final_sistema?: number
          saldo_inicial?: number
          status?: string
          updated_at?: string
        }
        Update: {
          conciliado_em?: string | null
          conciliado_por?: string | null
          conta_bancaria_id?: string
          created_at?: string
          diferenca?: number | null
          id?: string
          mes_referencia?: string
          observacoes?: string | null
          saldo_final_extrato?: number
          saldo_final_sistema?: number
          saldo_inicial?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conciliacoes_bancarias_conta_bancaria_id_fkey"
            columns: ["conta_bancaria_id"]
            isOneToOne: false
            referencedRelation: "contas_bancarias"
            referencedColumns: ["id"]
          },
        ]
      }
      conciliacoes_itens: {
        Row: {
          conciliacao_id: string
          conciliado: boolean
          created_at: string
          data_movimento: string
          descricao: string
          id: string
          lancamento_id: string | null
          observacoes: string | null
          origem: string
          tipo: string
          titulo_id: string | null
          valor: number
        }
        Insert: {
          conciliacao_id: string
          conciliado?: boolean
          created_at?: string
          data_movimento: string
          descricao: string
          id?: string
          lancamento_id?: string | null
          observacoes?: string | null
          origem: string
          tipo: string
          titulo_id?: string | null
          valor: number
        }
        Update: {
          conciliacao_id?: string
          conciliado?: boolean
          created_at?: string
          data_movimento?: string
          descricao?: string
          id?: string
          lancamento_id?: string | null
          observacoes?: string | null
          origem?: string
          tipo?: string
          titulo_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "conciliacoes_itens_conciliacao_id_fkey"
            columns: ["conciliacao_id"]
            isOneToOne: false
            referencedRelation: "conciliacoes_bancarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conciliacoes_itens_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_lancamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conciliacoes_itens_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "vw_financas_orfas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conciliacoes_itens_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "vw_lancamentos_origem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conciliacoes_itens_titulo_id_fkey"
            columns: ["titulo_id"]
            isOneToOne: false
            referencedRelation: "titulos_financeiros"
            referencedColumns: ["id"]
          },
        ]
      }
      concorrentes_analise: {
        Row: {
          analisado_em: string | null
          analise_ia: Json | null
          cliente_id: string
          created_at: string | null
          facebook: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          nome: string
          observacoes: string | null
          site: string | null
          tiktok: string | null
          updated_at: string | null
          youtube: string | null
        }
        Insert: {
          analisado_em?: string | null
          analise_ia?: Json | null
          cliente_id: string
          created_at?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          nome: string
          observacoes?: string | null
          site?: string | null
          tiktok?: string | null
          updated_at?: string | null
          youtube?: string | null
        }
        Update: {
          analisado_em?: string | null
          analise_ia?: Json | null
          cliente_id?: string
          created_at?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          nome?: string
          observacoes?: string | null
          site?: string | null
          tiktok?: string | null
          updated_at?: string | null
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concorrentes_analise_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concorrentes_analise_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "concorrentes_analise_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "concorrentes_analise_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "concorrentes_analise_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
        ]
      }
      concorrentes_metricas_historico: {
        Row: {
          concorrente_id: string
          created_at: string | null
          data_coleta: string
          engajamento_percent: number | null
          frequencia_posts_semana: number | null
          id: string
          media_comments: number | null
          media_likes: number | null
          seguidores_facebook: number | null
          seguidores_instagram: number | null
          seguidores_linkedin: number | null
          seguidores_tiktok: number | null
          seguidores_youtube: number | null
          snapshot_completo: Json | null
        }
        Insert: {
          concorrente_id: string
          created_at?: string | null
          data_coleta?: string
          engajamento_percent?: number | null
          frequencia_posts_semana?: number | null
          id?: string
          media_comments?: number | null
          media_likes?: number | null
          seguidores_facebook?: number | null
          seguidores_instagram?: number | null
          seguidores_linkedin?: number | null
          seguidores_tiktok?: number | null
          seguidores_youtube?: number | null
          snapshot_completo?: Json | null
        }
        Update: {
          concorrente_id?: string
          created_at?: string | null
          data_coleta?: string
          engajamento_percent?: number | null
          frequencia_posts_semana?: number | null
          id?: string
          media_comments?: number | null
          media_likes?: number | null
          seguidores_facebook?: number | null
          seguidores_instagram?: number | null
          seguidores_linkedin?: number | null
          seguidores_tiktok?: number | null
          seguidores_youtube?: number | null
          snapshot_completo?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "concorrentes_metricas_historico_concorrente_id_fkey"
            columns: ["concorrente_id"]
            isOneToOne: false
            referencedRelation: "concorrentes_analise"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_empresa: {
        Row: {
          agencia: string | null
          banco_codigo: string | null
          banco_nome: string | null
          cnpj: string | null
          conta: string | null
          created_at: string | null
          email: string | null
          endereco_completo: string | null
          id: string
          inscricao_estadual: string | null
          logo_url: string | null
          nome_fantasia: string | null
          pix_chave: string | null
          pix_tipo: string | null
          razao_social: string
          telefone: string | null
          termos_condicoes: string | null
          texto_rodape: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          agencia?: string | null
          banco_codigo?: string | null
          banco_nome?: string | null
          cnpj?: string | null
          conta?: string | null
          created_at?: string | null
          email?: string | null
          endereco_completo?: string | null
          id?: string
          inscricao_estadual?: string | null
          logo_url?: string | null
          nome_fantasia?: string | null
          pix_chave?: string | null
          pix_tipo?: string | null
          razao_social: string
          telefone?: string | null
          termos_condicoes?: string | null
          texto_rodape?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          agencia?: string | null
          banco_codigo?: string | null
          banco_nome?: string | null
          cnpj?: string | null
          conta?: string | null
          created_at?: string | null
          email?: string | null
          endereco_completo?: string | null
          id?: string
          inscricao_estadual?: string | null
          logo_url?: string | null
          nome_fantasia?: string | null
          pix_chave?: string | null
          pix_tipo?: string | null
          razao_social?: string
          telefone?: string | null
          termos_condicoes?: string | null
          texto_rodape?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      connector_status: {
        Row: {
          calls_this_hour: number | null
          calls_today: number | null
          connector_name: string
          created_at: string | null
          error_count: number | null
          last_error_at: string | null
          last_error_message: string | null
          last_success_at: string | null
          next_run_at: string | null
          status: string | null
          total_items_collected: number | null
          updated_at: string | null
        }
        Insert: {
          calls_this_hour?: number | null
          calls_today?: number | null
          connector_name: string
          created_at?: string | null
          error_count?: number | null
          last_error_at?: string | null
          last_error_message?: string | null
          last_success_at?: string | null
          next_run_at?: string | null
          status?: string | null
          total_items_collected?: number | null
          updated_at?: string | null
        }
        Update: {
          calls_this_hour?: number | null
          calls_today?: number | null
          connector_name?: string
          created_at?: string | null
          error_count?: number | null
          last_error_at?: string | null
          last_error_message?: string | null
          last_success_at?: string | null
          next_run_at?: string | null
          status?: string | null
          total_items_collected?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contas_bancarias: {
        Row: {
          agencia: string | null
          ativo: boolean
          banco: string | null
          conta: string | null
          created_at: string
          created_by: string | null
          id: string
          nome: string
          observacoes: string | null
          saldo_atual: number
          saldo_inicial: number
          tipo: string
          updated_at: string
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean
          banco?: string | null
          conta?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          saldo_atual?: number
          saldo_inicial?: number
          tipo: string
          updated_at?: string
        }
        Update: {
          agencia?: string | null
          ativo?: boolean
          banco?: string | null
          conta?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          saldo_atual?: number
          saldo_inicial?: number
          tipo?: string
          updated_at?: string
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
            referencedRelation: "assinaturas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contrato_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contrato_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_planos_publicos_itens"
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
            foreignKeyName: "contratos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "contratos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "contratos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "contratos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "contratos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      credenciais_audit_log: {
        Row: {
          accessed_at: string
          accessed_by: string | null
          action: string
          credential_id: string
          id: string
          ip_address: unknown
          metadata: Json | null
          success: boolean
        }
        Insert: {
          accessed_at?: string
          accessed_by?: string | null
          action: string
          credential_id: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          success?: boolean
        }
        Update: {
          accessed_at?: string
          accessed_by?: string | null
          action?: string
          credential_id?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          success?: boolean
        }
        Relationships: []
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
          senha: string | null
          senha_encrypted: string | null
          tokens_api: Json | null
          tokens_api_encrypted: string | null
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
          senha?: string | null
          senha_encrypted?: string | null
          tokens_api?: Json | null
          tokens_api_encrypted?: string | null
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
          senha?: string | null
          senha_encrypted?: string | null
          tokens_api?: Json | null
          tokens_api_encrypted?: string | null
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
          {
            foreignKeyName: "credenciais_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "credenciais_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "credenciais_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "credenciais_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      dados_orfaos_historico: {
        Row: {
          campo: string
          id: string
          identificado_em: string | null
          registro_id: string
          tabela: string
          valor_orfao: string
        }
        Insert: {
          campo: string
          id?: string
          identificado_em?: string | null
          registro_id: string
          tabela: string
          valor_orfao: string
        }
        Update: {
          campo?: string
          id?: string
          identificado_em?: string | null
          registro_id?: string
          tabela?: string
          valor_orfao?: string
        }
        Relationships: []
      }
      datas_comemorativas: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_fixa: string | null
          descricao: string | null
          id: string
          manual: boolean | null
          mes_referencia: number | null
          nome: string
          potencial_engajamento: string | null
          regiao: string | null
          segmentos: Json | null
          sugestao_campanha: string | null
          tipo: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_fixa?: string | null
          descricao?: string | null
          id?: string
          manual?: boolean | null
          mes_referencia?: number | null
          nome: string
          potencial_engajamento?: string | null
          regiao?: string | null
          segmentos?: Json | null
          sugestao_campanha?: string | null
          tipo: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_fixa?: string | null
          descricao?: string | null
          id?: string
          manual?: boolean | null
          mes_referencia?: number | null
          nome?: string
          potencial_engajamento?: string | null
          regiao?: string | null
          segmentos?: Json | null
          sugestao_campanha?: string | null
          tipo?: string
        }
        Relationships: []
      }
      dividas: {
        Row: {
          centro_custo_id: string | null
          cliente_id: string | null
          created_at: string
          created_by: string | null
          credor_devedor: string
          data_emissao: string
          descricao: string
          fornecedor_id: string | null
          id: string
          numero_parcelas: number
          observacoes: string | null
          parcelas: Json
          status: string
          tipo: string
          updated_at: string
          valor_pago: number
          valor_restante: number | null
          valor_total: number
        }
        Insert: {
          centro_custo_id?: string | null
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          credor_devedor: string
          data_emissao?: string
          descricao: string
          fornecedor_id?: string | null
          id?: string
          numero_parcelas?: number
          observacoes?: string | null
          parcelas?: Json
          status?: string
          tipo: string
          updated_at?: string
          valor_pago?: number
          valor_restante?: number | null
          valor_total: number
        }
        Update: {
          centro_custo_id?: string | null
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          credor_devedor?: string
          data_emissao?: string
          descricao?: string
          fornecedor_id?: string | null
          id?: string
          numero_parcelas?: number
          observacoes?: string | null
          parcelas?: Json
          status?: string
          tipo?: string
          updated_at?: string
          valor_pago?: number
          valor_restante?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "dividas_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dividas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dividas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "dividas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "dividas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "dividas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "dividas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
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
        Relationships: []
      }
      emails_agendados: {
        Row: {
          agendar_para: string
          anexo_url: string | null
          assunto: string
          criado_em: string | null
          criado_por: string | null
          destinatarios: Json
          entidade_id: string
          enviado_em: string | null
          erro_mensagem: string | null
          id: string
          mensagem: string
          status: string | null
          template_html: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          agendar_para: string
          anexo_url?: string | null
          assunto: string
          criado_em?: string | null
          criado_por?: string | null
          destinatarios: Json
          entidade_id: string
          enviado_em?: string | null
          erro_mensagem?: string | null
          id?: string
          mensagem: string
          status?: string | null
          template_html?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          agendar_para?: string
          anexo_url?: string | null
          assunto?: string
          criado_em?: string | null
          criado_por?: string | null
          destinatarios?: Json
          entidade_id?: string
          enviado_em?: string | null
          erro_mensagem?: string | null
          id?: string
          mensagem?: string
          status?: string | null
          template_html?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      especialidades: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          cor: string
          created_at: string | null
          icone: string | null
          id: string
          nome: string
          role_sistema: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          cor?: string
          created_at?: string | null
          icone?: string | null
          id?: string
          nome: string
          role_sistema: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          cor?: string
          created_at?: string | null
          icone?: string | null
          id?: string
          nome?: string
          role_sistema?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
            foreignKeyName: "eventos_agenda_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "eventos_agenda_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "eventos_agenda_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "eventos_agenda_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      eventos_calendario: {
        Row: {
          captacao_id: string | null
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
          origem: string | null
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
          captacao_id?: string | null
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
          origem?: string | null
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
          captacao_id?: string | null
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
          origem?: string | null
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
            foreignKeyName: "eventos_calendario_evento_pai_id_fkey"
            columns: ["evento_pai_id"]
            isOneToOne: false
            referencedRelation: "eventos_calendario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_calendario_evento_pai_id_fkey"
            columns: ["evento_pai_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
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
            foreignKeyName: "eventos_calendario_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "eventos_calendario_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "eventos_calendario_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "eventos_calendario_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "eventos_calendario_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "eventos_calendario_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles_deprecated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_calendario_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["responsavel_profile_id"]
          },
          {
            foreignKeyName: "eventos_calendario_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "eventos_calendario_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_produtividade_7d"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "eventos_calendario_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_calendario_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "eventos_calendario_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_eventos_captacao"
            columns: ["captacao_id"]
            isOneToOne: false
            referencedRelation: "captacoes_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_eventos_captacao"
            columns: ["captacao_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["captacao_id"]
          },
          {
            foreignKeyName: "fk_eventos_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_eventos_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "fk_eventos_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
      extratos_importados: {
        Row: {
          arquivo_nome: string
          arquivo_url: string
          conta_bancaria_id: string
          created_at: string
          created_by: string | null
          data_importacao: string
          formato: Database["public"]["Enums"]["formato_extrato_enum"]
          id: string
          metadados: Json | null
          periodo_fim: string | null
          periodo_inicio: string | null
          status: Database["public"]["Enums"]["status_extrato_enum"]
          total_transacoes: number | null
          transacoes_processadas: number | null
          updated_at: string
        }
        Insert: {
          arquivo_nome: string
          arquivo_url: string
          conta_bancaria_id: string
          created_at?: string
          created_by?: string | null
          data_importacao?: string
          formato: Database["public"]["Enums"]["formato_extrato_enum"]
          id?: string
          metadados?: Json | null
          periodo_fim?: string | null
          periodo_inicio?: string | null
          status?: Database["public"]["Enums"]["status_extrato_enum"]
          total_transacoes?: number | null
          transacoes_processadas?: number | null
          updated_at?: string
        }
        Update: {
          arquivo_nome?: string
          arquivo_url?: string
          conta_bancaria_id?: string
          created_at?: string
          created_by?: string | null
          data_importacao?: string
          formato?: Database["public"]["Enums"]["formato_extrato_enum"]
          id?: string
          metadados?: Json | null
          periodo_fim?: string | null
          periodo_inicio?: string | null
          status?: Database["public"]["Enums"]["status_extrato_enum"]
          total_transacoes?: number | null
          transacoes_processadas?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "extratos_importados_conta_bancaria_id_fkey"
            columns: ["conta_bancaria_id"]
            isOneToOne: false
            referencedRelation: "contas_bancarias"
            referencedColumns: ["id"]
          },
        ]
      }
      extratos_transacoes_temp: {
        Row: {
          categoria_sugerida: string | null
          cliente_sugerido_id: string | null
          comprovante_url: string | null
          confianca_vinculo: number | null
          created_at: string
          data_transacao: string
          descricao: string
          extrato_id: string
          fornecedor_sugerido_id: string | null
          id: string
          numero_documento: string | null
          observacoes_usuario: string | null
          saldo_apos_transacao: number | null
          status_processamento: Database["public"]["Enums"]["status_processamento_enum"]
          tipo_movimento: Database["public"]["Enums"]["tipo_movimento_enum"]
          titulo_vinculado_id: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          categoria_sugerida?: string | null
          cliente_sugerido_id?: string | null
          comprovante_url?: string | null
          confianca_vinculo?: number | null
          created_at?: string
          data_transacao: string
          descricao: string
          extrato_id: string
          fornecedor_sugerido_id?: string | null
          id?: string
          numero_documento?: string | null
          observacoes_usuario?: string | null
          saldo_apos_transacao?: number | null
          status_processamento?: Database["public"]["Enums"]["status_processamento_enum"]
          tipo_movimento: Database["public"]["Enums"]["tipo_movimento_enum"]
          titulo_vinculado_id?: string | null
          updated_at?: string
          valor: number
        }
        Update: {
          categoria_sugerida?: string | null
          cliente_sugerido_id?: string | null
          comprovante_url?: string | null
          confianca_vinculo?: number | null
          created_at?: string
          data_transacao?: string
          descricao?: string
          extrato_id?: string
          fornecedor_sugerido_id?: string | null
          id?: string
          numero_documento?: string | null
          observacoes_usuario?: string | null
          saldo_apos_transacao?: number | null
          status_processamento?: Database["public"]["Enums"]["status_processamento_enum"]
          tipo_movimento?: Database["public"]["Enums"]["tipo_movimento_enum"]
          titulo_vinculado_id?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "extratos_transacoes_temp_extrato_id_fkey"
            columns: ["extrato_id"]
            isOneToOne: false
            referencedRelation: "extratos_importados"
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
            foreignKeyName: "faturas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "faturas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "faturas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "faturas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
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
      feriados_nacionais: {
        Row: {
          cidade: string | null
          created_at: string
          data: string
          descricao: string | null
          estado: string | null
          id: string
          is_ponto_facultativo: boolean | null
          nome: string
          tipo: string
          updated_at: string
        }
        Insert: {
          cidade?: string | null
          created_at?: string
          data: string
          descricao?: string | null
          estado?: string | null
          id?: string
          is_ponto_facultativo?: boolean | null
          nome: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          cidade?: string | null
          created_at?: string
          data?: string
          descricao?: string | null
          estado?: string | null
          id?: string
          is_ponto_facultativo?: boolean | null
          nome?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
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
            foreignKeyName: "financeiro_adiantamentos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_hora_colaborador"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "financeiro_adiantamentos_folha_item_id_fkey"
            columns: ["folha_item_id"]
            isOneToOne: false
            referencedRelation: "financeiro_folha_itens"
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
          pessoa_id: string | null
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
          pessoa_id?: string | null
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
          pessoa_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "financeiro_folha_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "financeiro_folha_itens_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_hora_colaborador"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "financeiro_folha_itens_folha_id_fkey"
            columns: ["folha_id"]
            isOneToOne: false
            referencedRelation: "financeiro_folha"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_folha_itens_colaborador"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
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
            foreignKeyName: "financeiro_historico_salarial_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_hora_colaborador"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      financeiro_lancamentos: {
        Row: {
          centro_custo: string | null
          cliente_id: string | null
          conta_credito_id: string
          conta_debito_id: string
          created_at: string | null
          created_by: string | null
          data_lancamento: string
          descricao: string
          evento_id: string | null
          folha_item_id: string | null
          fornecedor_id: string | null
          id: string
          numero_lancamento: number
          origem_id: string | null
          projeto_id: string | null
          reserva_id: string | null
          tarefa_id: string | null
          tipo_lancamento: string | null
          tipo_origem: string
          titulo_id: string | null
          unidade: string | null
          valor: number
        }
        Insert: {
          centro_custo?: string | null
          cliente_id?: string | null
          conta_credito_id: string
          conta_debito_id: string
          created_at?: string | null
          created_by?: string | null
          data_lancamento: string
          descricao: string
          evento_id?: string | null
          folha_item_id?: string | null
          fornecedor_id?: string | null
          id?: string
          numero_lancamento?: number
          origem_id?: string | null
          projeto_id?: string | null
          reserva_id?: string | null
          tarefa_id?: string | null
          tipo_lancamento?: string | null
          tipo_origem: string
          titulo_id?: string | null
          unidade?: string | null
          valor: number
        }
        Update: {
          centro_custo?: string | null
          cliente_id?: string | null
          conta_credito_id?: string
          conta_debito_id?: string
          created_at?: string | null
          created_by?: string | null
          data_lancamento?: string
          descricao?: string
          evento_id?: string | null
          folha_item_id?: string | null
          fornecedor_id?: string | null
          id?: string
          numero_lancamento?: number
          origem_id?: string | null
          projeto_id?: string | null
          reserva_id?: string | null
          tarefa_id?: string | null
          tipo_lancamento?: string | null
          tipo_origem?: string
          titulo_id?: string | null
          unidade?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_lancamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
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
          {
            foreignKeyName: "financeiro_lancamentos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos_calendario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_folha_item_id_fkey"
            columns: ["folha_item_id"]
            isOneToOne: false
            referencedRelation: "financeiro_folha_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_titulo_id_fkey"
            columns: ["titulo_id"]
            isOneToOne: false
            referencedRelation: "titulos_financeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_financeiro_evento"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos_calendario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_financeiro_evento"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_financeiro_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_financeiro_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "fk_financeiro_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lancamentos_evento"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos_calendario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lancamentos_evento"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lancamentos_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lancamentos_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_lancamentos_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_lancamentos_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_lancamentos_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_lancamentos_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lancamentos_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "fk_lancamentos_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
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
        Relationships: []
      }
      fornecedores: {
        Row: {
          agencia: string | null
          ativo: boolean
          avaliacao_qualidade: number | null
          bairro: string | null
          banco_codigo: string | null
          banco_nome: string | null
          bloqueado_em: string | null
          bloqueado_por: string | null
          categoria: string | null
          categoria_fornecedor: string[] | null
          celular: string | null
          cep: string | null
          certificados_url: string[] | null
          cidade: string | null
          cnpj: string
          complemento: string | null
          condicao_pagamento: string | null
          conta: string | null
          cpf_cnpj: string | null
          created_at: string
          created_by: string | null
          desconto_padrao: number | null
          documentos_anexos: Json | null
          email: string | null
          endereco: string | null
          estado: string | null
          forma_pagamento_preferencial: string | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          limite_credito: number | null
          logradouro: string | null
          motivo_bloqueio: string | null
          nome_fantasia: string | null
          numero: string | null
          observacoes: string | null
          pais: string | null
          pix_chave: string | null
          pix_tipo: string | null
          prazo_pagamento_padrao: number | null
          razao_social: string
          site: string | null
          status: string | null
          telefone: string | null
          termo_fornecedor_url: string | null
          tipo_conta: string | null
          tipo_fornecimento: string | null
          total_compras: number | null
          ultima_compra_em: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean
          avaliacao_qualidade?: number | null
          bairro?: string | null
          banco_codigo?: string | null
          banco_nome?: string | null
          bloqueado_em?: string | null
          bloqueado_por?: string | null
          categoria?: string | null
          categoria_fornecedor?: string[] | null
          celular?: string | null
          cep?: string | null
          certificados_url?: string[] | null
          cidade?: string | null
          cnpj: string
          complemento?: string | null
          condicao_pagamento?: string | null
          conta?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          created_by?: string | null
          desconto_padrao?: number | null
          documentos_anexos?: Json | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          forma_pagamento_preferencial?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          limite_credito?: number | null
          logradouro?: string | null
          motivo_bloqueio?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          observacoes?: string | null
          pais?: string | null
          pix_chave?: string | null
          pix_tipo?: string | null
          prazo_pagamento_padrao?: number | null
          razao_social: string
          site?: string | null
          status?: string | null
          telefone?: string | null
          termo_fornecedor_url?: string | null
          tipo_conta?: string | null
          tipo_fornecimento?: string | null
          total_compras?: number | null
          ultima_compra_em?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          agencia?: string | null
          ativo?: boolean
          avaliacao_qualidade?: number | null
          bairro?: string | null
          banco_codigo?: string | null
          banco_nome?: string | null
          bloqueado_em?: string | null
          bloqueado_por?: string | null
          categoria?: string | null
          categoria_fornecedor?: string[] | null
          celular?: string | null
          cep?: string | null
          certificados_url?: string[] | null
          cidade?: string | null
          cnpj?: string
          complemento?: string | null
          condicao_pagamento?: string | null
          conta?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          created_by?: string | null
          desconto_padrao?: number | null
          documentos_anexos?: Json | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          forma_pagamento_preferencial?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          limite_credito?: number | null
          logradouro?: string | null
          motivo_bloqueio?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          observacoes?: string | null
          pais?: string | null
          pix_chave?: string | null
          pix_tipo?: string | null
          prazo_pagamento_padrao?: number | null
          razao_social?: string
          site?: string | null
          status?: string | null
          telefone?: string | null
          termo_fornecedor_url?: string | null
          tipo_conta?: string | null
          tipo_fornecimento?: string | null
          total_compras?: number | null
          ultima_compra_em?: string | null
          updated_at?: string
          updated_by?: string | null
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
        Relationships: []
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
        Relationships: []
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
        Relationships: []
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "logs_atividade_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
        ]
      }
      migracao_clientes_audit: {
        Row: {
          cliente_id: string
          criado_em: string | null
          dados_migrados: Json | null
          dados_originais: Json
          erros: string | null
          id: string
          migrado_em: string | null
          pessoa_id: string | null
          status: string
        }
        Insert: {
          cliente_id: string
          criado_em?: string | null
          dados_migrados?: Json | null
          dados_originais: Json
          erros?: string | null
          id?: string
          migrado_em?: string | null
          pessoa_id?: string | null
          status: string
        }
        Update: {
          cliente_id?: string
          criado_em?: string | null
          dados_migrados?: Json | null
          dados_originais?: Json
          erros?: string | null
          id?: string
          migrado_em?: string | null
          pessoa_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "migracao_clientes_audit_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
            foreignKeyName: "notas_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "notas_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "notas_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "notas_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      notas_onboarding: {
        Row: {
          analise_ia: Json | null
          arquivo_anexo_url: string | null
          arquivo_nome: string | null
          arquivo_tipo: string | null
          categoria_ia: string | null
          cliente_id: string
          conteudo: string
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          is_archived: boolean | null
          keywords: string[] | null
          link_chatgpt: string | null
          onboarding_id: string | null
          relevancia_score: number | null
          tipo_nota: string
          titulo: string
          updated_at: string | null
          updated_by: string | null
          usado_em_planejamento: boolean | null
          versao: number | null
        }
        Insert: {
          analise_ia?: Json | null
          arquivo_anexo_url?: string | null
          arquivo_nome?: string | null
          arquivo_tipo?: string | null
          categoria_ia?: string | null
          cliente_id: string
          conteudo: string
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          keywords?: string[] | null
          link_chatgpt?: string | null
          onboarding_id?: string | null
          relevancia_score?: number | null
          tipo_nota: string
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
          usado_em_planejamento?: boolean | null
          versao?: number | null
        }
        Update: {
          analise_ia?: Json | null
          arquivo_anexo_url?: string | null
          arquivo_nome?: string | null
          arquivo_tipo?: string | null
          categoria_ia?: string | null
          cliente_id?: string
          conteudo?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          keywords?: string[] | null
          link_chatgpt?: string | null
          onboarding_id?: string | null
          relevancia_score?: number | null
          tipo_nota?: string
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
          usado_em_planejamento?: boolean | null
          versao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_onboarding_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_onboarding_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "notas_onboarding_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "notas_onboarding_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "notas_onboarding_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "notas_onboarding_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "cliente_onboarding"
            referencedColumns: ["id"]
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
          metadata: Json | null
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
          metadata?: Json | null
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
          metadata?: Json | null
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
        Relationships: []
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
            referencedRelation: "assinaturas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_planos_publicos_itens"
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
            foreignKeyName: "orcamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "orcamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "orcamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "orcamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
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
          {
            foreignKeyName: "pacote_itens_pacote_id_fkey"
            columns: ["pacote_id"]
            isOneToOne: false
            referencedRelation: "pacotes_compat"
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
      pessoa_papeis: {
        Row: {
          ativo: boolean
          created_at: string
          data_fim: string | null
          data_inicio: string
          id: string
          papel: string
          pessoa_id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          papel: string
          pessoa_id: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          papel?: string
          pessoa_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pessoa_papeis_pessoa"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoa_papeis_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoas: {
        Row: {
          assinatura_id: string | null
          avatar_url: string | null
          cargo_atual: string | null
          cargo_id: string | null
          cliente_id: string | null
          cnae_principal: string | null
          cnpj_fonte: string | null
          cnpj_ultima_consulta: string | null
          cpf: string | null
          created_at: string
          dados_bancarios: Json | null
          dados_incompletos: boolean | null
          data_admissao: string | null
          data_desligamento: string | null
          email: string | null
          endereco: string | null
          especialidade_id: string | null
          fee_mensal: number | null
          id: string
          logo_url: string | null
          nome: string
          nome_fantasia: string | null
          observacoes: string | null
          papeis: string[]
          preferencias_notificacao: Json | null
          profile_id: string
          razao_social: string | null
          regime: string | null
          responsavel_id: string | null
          salario_base: number | null
          situacao_cadastral: string | null
          status: string | null
          telefones: string[] | null
          updated_at: string
          veiculo_id: string | null
        }
        Insert: {
          assinatura_id?: string | null
          avatar_url?: string | null
          cargo_atual?: string | null
          cargo_id?: string | null
          cliente_id?: string | null
          cnae_principal?: string | null
          cnpj_fonte?: string | null
          cnpj_ultima_consulta?: string | null
          cpf?: string | null
          created_at?: string
          dados_bancarios?: Json | null
          dados_incompletos?: boolean | null
          data_admissao?: string | null
          data_desligamento?: string | null
          email?: string | null
          endereco?: string | null
          especialidade_id?: string | null
          fee_mensal?: number | null
          id?: string
          logo_url?: string | null
          nome: string
          nome_fantasia?: string | null
          observacoes?: string | null
          papeis?: string[]
          preferencias_notificacao?: Json | null
          profile_id: string
          razao_social?: string | null
          regime?: string | null
          responsavel_id?: string | null
          salario_base?: number | null
          situacao_cadastral?: string | null
          status?: string | null
          telefones?: string[] | null
          updated_at?: string
          veiculo_id?: string | null
        }
        Update: {
          assinatura_id?: string | null
          avatar_url?: string | null
          cargo_atual?: string | null
          cargo_id?: string | null
          cliente_id?: string | null
          cnae_principal?: string | null
          cnpj_fonte?: string | null
          cnpj_ultima_consulta?: string | null
          cpf?: string | null
          created_at?: string
          dados_bancarios?: Json | null
          dados_incompletos?: boolean | null
          data_admissao?: string | null
          data_desligamento?: string | null
          email?: string | null
          endereco?: string | null
          especialidade_id?: string | null
          fee_mensal?: number | null
          id?: string
          logo_url?: string | null
          nome?: string
          nome_fantasia?: string | null
          observacoes?: string | null
          papeis?: string[]
          preferencias_notificacao?: Json | null
          profile_id?: string
          razao_social?: string | null
          regime?: string | null
          responsavel_id?: string | null
          salario_base?: number | null
          situacao_cadastral?: string | null
          status?: string | null
          telefones?: string[] | null
          updated_at?: string
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pessoas_assinatura_id_fkey"
            columns: ["assinatura_id"]
            isOneToOne: false
            referencedRelation: "assinaturas"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "pessoas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "pessoas_especialidade_id_fkey"
            columns: ["especialidade_id"]
            isOneToOne: false
            referencedRelation: "especialidades"
            referencedColumns: ["id"]
          },
        ]
      }
      planejamento_campanhas: {
        Row: {
          created_at: string | null
          data_comemorativa_id: string | null
          data_fim: string
          data_inicio: string
          estrutura_posts_sugerida: Json | null
          id: string
          nome_campanha: string
          objetivos: Json | null
          orcamento_sugerido: number | null
          periodo_pos_campanha: number | null
          periodo_pre_campanha: number | null
          planejamento_id: string | null
          status: string | null
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_comemorativa_id?: string | null
          data_fim: string
          data_inicio: string
          estrutura_posts_sugerida?: Json | null
          id?: string
          nome_campanha: string
          objetivos?: Json | null
          orcamento_sugerido?: number | null
          periodo_pos_campanha?: number | null
          periodo_pre_campanha?: number | null
          planejamento_id?: string | null
          status?: string | null
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_comemorativa_id?: string | null
          data_fim?: string
          data_inicio?: string
          estrutura_posts_sugerida?: Json | null
          id?: string
          nome_campanha?: string
          objetivos?: Json | null
          orcamento_sugerido?: number | null
          periodo_pos_campanha?: number | null
          periodo_pre_campanha?: number | null
          planejamento_id?: string | null
          status?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planejamento_campanhas_data_comemorativa_id_fkey"
            columns: ["data_comemorativa_id"]
            isOneToOne: false
            referencedRelation: "datas_comemorativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planejamento_campanhas_planejamento_id_fkey"
            columns: ["planejamento_id"]
            isOneToOne: false
            referencedRelation: "planejamentos"
            referencedColumns: ["id"]
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
          observacoes_estrategista: string | null
          projeto_id: string | null
          responsavel_grs_id: string | null
          responsavel_id: string | null
          status: Database["public"]["Enums"]["status_padrao"] | null
          status_aprovacao: string | null
          status_plano: string | null
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
          observacoes_estrategista?: string | null
          projeto_id?: string | null
          responsavel_grs_id?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_padrao"] | null
          status_aprovacao?: string | null
          status_plano?: string | null
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
          observacoes_estrategista?: string | null
          projeto_id?: string | null
          responsavel_grs_id?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_padrao"] | null
          status_aprovacao?: string | null
          status_plano?: string | null
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
            foreignKeyName: "planejamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "planejamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "planejamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "planejamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "planejamentos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
        ]
      }
      post_ab_variations: {
        Row: {
          abordagem: string | null
          cliente_id: string
          conversoes: number | null
          created_at: string | null
          engajamentos: number | null
          framework_usado: string | null
          id: string
          impressoes: number | null
          is_ativa: boolean | null
          is_vencedora: boolean | null
          post_id: string
          taxa_conversao: number | null
          teste_nome: string
          texto_estruturado: string
          updated_at: string | null
          variacao_letra: string
        }
        Insert: {
          abordagem?: string | null
          cliente_id: string
          conversoes?: number | null
          created_at?: string | null
          engajamentos?: number | null
          framework_usado?: string | null
          id?: string
          impressoes?: number | null
          is_ativa?: boolean | null
          is_vencedora?: boolean | null
          post_id: string
          taxa_conversao?: number | null
          teste_nome: string
          texto_estruturado: string
          updated_at?: string | null
          variacao_letra: string
        }
        Update: {
          abordagem?: string | null
          cliente_id?: string
          conversoes?: number | null
          created_at?: string | null
          engajamentos?: number | null
          framework_usado?: string | null
          id?: string
          impressoes?: number | null
          is_ativa?: boolean | null
          is_vencedora?: boolean | null
          post_id?: string
          taxa_conversao?: number | null
          teste_nome?: string
          texto_estruturado?: string
          updated_at?: string | null
          variacao_letra?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_ab_variations_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_ab_variations_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "post_ab_variations_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "post_ab_variations_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "post_ab_variations_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "post_ab_variations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_planejamento"
            referencedColumns: ["id"]
          },
        ]
      }
      post_performance_metrics: {
        Row: {
          alcance: number | null
          cliente_id: string
          cliques_link: number | null
          comentarios: number | null
          compartilhamentos: number | null
          created_at: string | null
          curtidas: number | null
          data_publicacao: string
          dia_semana: number
          formato_postagem: string | null
          hora_publicacao: number
          id: string
          impressoes: number | null
          plataforma: string | null
          post_id: string | null
          salvamentos: number | null
          score_performance: number | null
          taxa_cliques: number | null
          taxa_engajamento: number | null
          texto_estruturado: string | null
          tinha_cta: boolean | null
          tinha_hashtags: boolean | null
          tipo_conteudo: string
          updated_at: string | null
        }
        Insert: {
          alcance?: number | null
          cliente_id: string
          cliques_link?: number | null
          comentarios?: number | null
          compartilhamentos?: number | null
          created_at?: string | null
          curtidas?: number | null
          data_publicacao: string
          dia_semana: number
          formato_postagem?: string | null
          hora_publicacao: number
          id?: string
          impressoes?: number | null
          plataforma?: string | null
          post_id?: string | null
          salvamentos?: number | null
          score_performance?: number | null
          taxa_cliques?: number | null
          taxa_engajamento?: number | null
          texto_estruturado?: string | null
          tinha_cta?: boolean | null
          tinha_hashtags?: boolean | null
          tipo_conteudo: string
          updated_at?: string | null
        }
        Update: {
          alcance?: number | null
          cliente_id?: string
          cliques_link?: number | null
          comentarios?: number | null
          compartilhamentos?: number | null
          created_at?: string | null
          curtidas?: number | null
          data_publicacao?: string
          dia_semana?: number
          formato_postagem?: string | null
          hora_publicacao?: number
          id?: string
          impressoes?: number | null
          plataforma?: string | null
          post_id?: string | null
          salvamentos?: number | null
          score_performance?: number | null
          taxa_cliques?: number | null
          taxa_engajamento?: number | null
          texto_estruturado?: string | null
          tinha_cta?: boolean | null
          tinha_hashtags?: boolean | null
          tipo_conteudo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_performance_metrics_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_performance_metrics_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "post_performance_metrics_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "post_performance_metrics_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "post_performance_metrics_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "post_performance_metrics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_planejamento"
            referencedColumns: ["id"]
          },
        ]
      }
      posts_gerados_temp: {
        Row: {
          anexo_url: string | null
          call_to_action: string | null
          campanha_id: string | null
          componente_hesec: string | null
          conteudo_completo: string | null
          contexto_estrategico: string | null
          created_at: string
          data_postagem: string
          expires_at: string | null
          formato_postagem: string
          hashtags: string[] | null
          headline: string | null
          id: string
          legenda: string | null
          objetivo_postagem: string
          periodo_campanha: string | null
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
          campanha_id?: string | null
          componente_hesec?: string | null
          conteudo_completo?: string | null
          contexto_estrategico?: string | null
          created_at?: string
          data_postagem: string
          expires_at?: string | null
          formato_postagem?: string
          hashtags?: string[] | null
          headline?: string | null
          id?: string
          legenda?: string | null
          objetivo_postagem: string
          periodo_campanha?: string | null
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
          campanha_id?: string | null
          componente_hesec?: string | null
          conteudo_completo?: string | null
          contexto_estrategico?: string | null
          created_at?: string
          data_postagem?: string
          expires_at?: string | null
          formato_postagem?: string
          hashtags?: string[] | null
          headline?: string | null
          id?: string
          legenda?: string | null
          objetivo_postagem?: string
          periodo_campanha?: string | null
          persona_alvo?: string | null
          planejamento_id?: string
          responsavel_id?: string | null
          tipo_criativo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_posts_temp_planejamento"
            columns: ["planejamento_id"]
            isOneToOne: false
            referencedRelation: "planejamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      posts_planejamento: {
        Row: {
          anexo_url: string | null
          arquivo_visual_nome: string | null
          arquivo_visual_tipo: string | null
          arquivo_visual_url: string | null
          call_to_action: string | null
          campanha_id: string | null
          componente_hesec: string | null
          conteudo_completo: string | null
          contexto_estrategico: string | null
          created_at: string
          data_postagem: string
          finalidade_postagem: string | null
          formato_postagem: string
          hashtags: string[] | null
          headline: string | null
          id: string
          legenda: string | null
          objetivo_postagem: string
          ordem: number | null
          periodo_campanha: string | null
          persona_alvo: string | null
          planejamento_id: string
          projeto_id: string | null
          rede_social: string | null
          responsavel_id: string | null
          status: Database["public"]["Enums"]["post_status_enum"] | null
          status_aprovacao_cliente: string | null
          status_post: Database["public"]["Enums"]["post_status_type"] | null
          tarefa_aprovacao_id: string | null
          tarefa_criacao_id: string | null
          tarefa_vinculada_id: string | null
          texto_estruturado: string | null
          tipo_conteudo: string | null
          tipo_criativo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          anexo_url?: string | null
          arquivo_visual_nome?: string | null
          arquivo_visual_tipo?: string | null
          arquivo_visual_url?: string | null
          call_to_action?: string | null
          campanha_id?: string | null
          componente_hesec?: string | null
          conteudo_completo?: string | null
          contexto_estrategico?: string | null
          created_at?: string
          data_postagem: string
          finalidade_postagem?: string | null
          formato_postagem?: string
          hashtags?: string[] | null
          headline?: string | null
          id?: string
          legenda?: string | null
          objetivo_postagem: string
          ordem?: number | null
          periodo_campanha?: string | null
          persona_alvo?: string | null
          planejamento_id: string
          projeto_id?: string | null
          rede_social?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["post_status_enum"] | null
          status_aprovacao_cliente?: string | null
          status_post?: Database["public"]["Enums"]["post_status_type"] | null
          tarefa_aprovacao_id?: string | null
          tarefa_criacao_id?: string | null
          tarefa_vinculada_id?: string | null
          texto_estruturado?: string | null
          tipo_conteudo?: string | null
          tipo_criativo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          anexo_url?: string | null
          arquivo_visual_nome?: string | null
          arquivo_visual_tipo?: string | null
          arquivo_visual_url?: string | null
          call_to_action?: string | null
          campanha_id?: string | null
          componente_hesec?: string | null
          conteudo_completo?: string | null
          contexto_estrategico?: string | null
          created_at?: string
          data_postagem?: string
          finalidade_postagem?: string | null
          formato_postagem?: string
          hashtags?: string[] | null
          headline?: string | null
          id?: string
          legenda?: string | null
          objetivo_postagem?: string
          ordem?: number | null
          periodo_campanha?: string | null
          persona_alvo?: string | null
          planejamento_id?: string
          projeto_id?: string | null
          rede_social?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["post_status_enum"] | null
          status_aprovacao_cliente?: string | null
          status_post?: Database["public"]["Enums"]["post_status_type"] | null
          tarefa_aprovacao_id?: string | null
          tarefa_criacao_id?: string | null
          tarefa_vinculada_id?: string | null
          texto_estruturado?: string | null
          tipo_conteudo?: string | null
          tipo_criativo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_posts_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_posts_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_posts_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_posts_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_posts_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "posts_planejamento_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "planejamento_campanhas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_planejamento_planejamento_id_fkey"
            columns: ["planejamento_id"]
            isOneToOne: false
            referencedRelation: "planejamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_planejamento_tarefa_aprovacao_id_fkey"
            columns: ["tarefa_aprovacao_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_planejamento_tarefa_aprovacao_id_fkey"
            columns: ["tarefa_aprovacao_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "posts_planejamento_tarefa_aprovacao_id_fkey"
            columns: ["tarefa_aprovacao_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_planejamento_tarefa_criacao_id_fkey"
            columns: ["tarefa_criacao_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_planejamento_tarefa_criacao_id_fkey"
            columns: ["tarefa_criacao_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "posts_planejamento_tarefa_criacao_id_fkey"
            columns: ["tarefa_criacao_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_planejamento_tarefa_vinculada_id_fkey"
            columns: ["tarefa_vinculada_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_planejamento_tarefa_vinculada_id_fkey"
            columns: ["tarefa_vinculada_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "posts_planejamento_tarefa_vinculada_id_fkey"
            columns: ["tarefa_vinculada_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
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
        Relationships: []
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
        Relationships: []
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
            referencedRelation: "assinaturas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_componentes_produto_filho_id_fkey"
            columns: ["produto_filho_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_componentes_produto_filho_id_fkey"
            columns: ["produto_filho_id"]
            isOneToOne: false
            referencedRelation: "vw_planos_publicos_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_componentes_produto_pai_id_fkey"
            columns: ["produto_pai_id"]
            isOneToOne: false
            referencedRelation: "assinaturas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_componentes_produto_pai_id_fkey"
            columns: ["produto_pai_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_componentes_produto_pai_id_fkey"
            columns: ["produto_pai_id"]
            isOneToOne: false
            referencedRelation: "vw_planos_publicos_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          anuncios_facebook: boolean | null
          anuncios_google: boolean | null
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          custo: number | null
          descricao: string | null
          duracao_dias: number | null
          id: string
          imposto_percent: number | null
          lead_time_dias: number | null
          metadados: Json | null
          nome: string
          observacoes: string | null
          ordem_exibicao: number | null
          periodo: string | null
          posts_mensais: number | null
          preco_base: number | null
          preco_padrao: number
          recursos: string[] | null
          reels_suporte: boolean | null
          requer_briefing: boolean | null
          sku: string
          slug: string | null
          tipo: string | null
          unidade: string | null
          updated_at: string | null
        }
        Insert: {
          anuncios_facebook?: boolean | null
          anuncios_google?: boolean | null
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          custo?: number | null
          descricao?: string | null
          duracao_dias?: number | null
          id?: string
          imposto_percent?: number | null
          lead_time_dias?: number | null
          metadados?: Json | null
          nome: string
          observacoes?: string | null
          ordem_exibicao?: number | null
          periodo?: string | null
          posts_mensais?: number | null
          preco_base?: number | null
          preco_padrao: number
          recursos?: string[] | null
          reels_suporte?: boolean | null
          requer_briefing?: boolean | null
          sku: string
          slug?: string | null
          tipo?: string | null
          unidade?: string | null
          updated_at?: string | null
        }
        Update: {
          anuncios_facebook?: boolean | null
          anuncios_google?: boolean | null
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          custo?: number | null
          descricao?: string | null
          duracao_dias?: number | null
          id?: string
          imposto_percent?: number | null
          lead_time_dias?: number | null
          metadados?: Json | null
          nome?: string
          observacoes?: string | null
          ordem_exibicao?: number | null
          periodo?: string | null
          posts_mensais?: number | null
          preco_base?: number | null
          preco_padrao?: number
          recursos?: string[] | null
          reels_suporte?: boolean | null
          requer_briefing?: boolean | null
          sku?: string
          slug?: string | null
          tipo?: string | null
          unidade?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
        Relationships: []
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
            foreignKeyName: "projeto_status_historico_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_status_historico_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "projeto_status_historico_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "projeto_status_historico_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "projeto_status_historico_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
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
          responsavel_id: string
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
          responsavel_id: string
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
          responsavel_id?: string
          status?: Database["public"]["Enums"]["status_type"] | null
          tipo_projeto?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_projetos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_projetos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_projetos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_projetos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_projetos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_projetos_grs_pessoas"
            columns: ["responsavel_grs_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "fk_projetos_grs_pessoas"
            columns: ["responsavel_grs_id"]
            isOneToOne: false
            referencedRelation: "profiles_deprecated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_projetos_grs_pessoas"
            columns: ["responsavel_grs_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["responsavel_profile_id"]
          },
          {
            foreignKeyName: "fk_projetos_grs_pessoas"
            columns: ["responsavel_grs_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "fk_projetos_grs_pessoas"
            columns: ["responsavel_grs_id"]
            isOneToOne: false
            referencedRelation: "vw_produtividade_7d"
            referencedColumns: ["user_id"]
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
            foreignKeyName: "fk_projetos_av_planejamento"
            columns: ["planejamento_id"]
            isOneToOne: false
            referencedRelation: "planejamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      proposta_assinaturas: {
        Row: {
          assinatura_base64: string | null
          cargo: string | null
          certificado_digital: string | null
          created_at: string | null
          data_assinatura: string | null
          data_envio: string | null
          data_visualizacao: string | null
          email_assinante: string
          id: string
          ip_assinatura: string | null
          nome_assinante: string
          observacoes: string | null
          proposta_id: string
          status: string
          token_assinatura: string | null
          updated_at: string | null
        }
        Insert: {
          assinatura_base64?: string | null
          cargo?: string | null
          certificado_digital?: string | null
          created_at?: string | null
          data_assinatura?: string | null
          data_envio?: string | null
          data_visualizacao?: string | null
          email_assinante: string
          id?: string
          ip_assinatura?: string | null
          nome_assinante: string
          observacoes?: string | null
          proposta_id: string
          status?: string
          token_assinatura?: string | null
          updated_at?: string | null
        }
        Update: {
          assinatura_base64?: string | null
          cargo?: string | null
          certificado_digital?: string | null
          created_at?: string | null
          data_assinatura?: string | null
          data_envio?: string | null
          data_visualizacao?: string | null
          email_assinante?: string
          id?: string
          ip_assinatura?: string | null
          nome_assinante?: string
          observacoes?: string | null
          proposta_id?: string
          status?: string
          token_assinatura?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposta_assinaturas_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
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
            referencedRelation: "assinaturas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposta_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposta_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_planos_publicos_itens"
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
            foreignKeyName: "propostas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "propostas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "propostas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "propostas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      publicacao_queue: {
        Row: {
          cliente_id: string
          created_at: string | null
          data_agendamento: string
          erro_mensagem: string | null
          id: string
          imagem_url: string | null
          max_tentativas: number | null
          plataformas: Json
          post_id: string
          publicado_at: string | null
          resultado: Json | null
          status: string | null
          tentativas: number | null
          texto_publicacao: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          data_agendamento: string
          erro_mensagem?: string | null
          id?: string
          imagem_url?: string | null
          max_tentativas?: number | null
          plataformas: Json
          post_id: string
          publicado_at?: string | null
          resultado?: Json | null
          status?: string | null
          tentativas?: number | null
          texto_publicacao?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          data_agendamento?: string
          erro_mensagem?: string | null
          id?: string
          imagem_url?: string | null
          max_tentativas?: number | null
          plataformas?: Json
          post_id?: string
          publicado_at?: string | null
          resultado?: Json | null
          status?: string | null
          tentativas?: number | null
          texto_publicacao?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publicacao_queue_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publicacao_queue_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "publicacao_queue_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "publicacao_queue_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "publicacao_queue_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "publicacao_queue_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_planejamento"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      relatorios_benchmark: {
        Row: {
          cliente_analise: Json
          cliente_id: string
          concorrentes_analises: Json
          created_at: string
          gerado_em: string
          gerado_por: string | null
          id: string
          is_ativo: boolean
          link_hash: string
          relatorio_markdown: string
          titulo: string
          updated_at: string
          versao: number
        }
        Insert: {
          cliente_analise?: Json
          cliente_id: string
          concorrentes_analises?: Json
          created_at?: string
          gerado_em?: string
          gerado_por?: string | null
          id?: string
          is_ativo?: boolean
          link_hash?: string
          relatorio_markdown: string
          titulo: string
          updated_at?: string
          versao?: number
        }
        Update: {
          cliente_analise?: Json
          cliente_id?: string
          concorrentes_analises?: Json
          created_at?: string
          gerado_em?: string
          gerado_por?: string | null
          id?: string
          is_ativo?: boolean
          link_hash?: string
          relatorio_markdown?: string
          titulo?: string
          updated_at?: string
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_benchmark_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_benchmark_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "relatorios_benchmark_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "relatorios_benchmark_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "relatorios_benchmark_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
        ]
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
            foreignKeyName: "rh_colaboradores_gestor_imediato_id_fkey"
            columns: ["gestor_imediato_id"]
            isOneToOne: false
            referencedRelation: "rh_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_colaboradores_gestor_imediato_id_fkey"
            columns: ["gestor_imediato_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_hora_colaborador"
            referencedColumns: ["colaborador_id"]
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
            foreignKeyName: "roteiros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "roteiros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "roteiros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "roteiros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "roteiros_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roteiros_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "roteiros_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
            referencedColumns: ["id"]
          },
        ]
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
      subtarefas: {
        Row: {
          created_at: string | null
          data_conclusao: string | null
          descricao: string | null
          id: string
          ordem: number
          responsavel_id: string | null
          status: string
          tarefa_pai_id: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_conclusao?: string | null
          descricao?: string | null
          id?: string
          ordem?: number
          responsavel_id?: string | null
          status?: string
          tarefa_pai_id: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_conclusao?: string | null
          descricao?: string | null
          id?: string
          ordem?: number
          responsavel_id?: string | null
          status?: string
          tarefa_pai_id?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subtarefas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subtarefas_tarefa_pai_id_fkey"
            columns: ["tarefa_pai_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subtarefas_tarefa_pai_id_fkey"
            columns: ["tarefa_pai_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "subtarefas_tarefa_pai_id_fkey"
            columns: ["tarefa_pai_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      system_chat_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          id: string
          role: string
          thread_id: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          id?: string
          role: string
          thread_id?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "system_chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      system_chat_threads: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          tags: Json | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          tags?: Json | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          tags?: Json | null
          title?: string
        }
        Relationships: []
      }
      system_checks: {
        Row: {
          check_type: string
          connection_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          result: string
        }
        Insert: {
          check_type: string
          connection_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          result: string
        }
        Update: {
          check_type?: string
          connection_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          result?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_checks_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "system_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      system_connections: {
        Row: {
          config: Json | null
          created_at: string | null
          deps: Json | null
          error_code: string | null
          error_message: string | null
          group: string
          id: string
          last_ping: string | null
          latency_ms: number | null
          monitoring_enabled: boolean | null
          name: string
          related_route: string | null
          severity: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          deps?: Json | null
          error_code?: string | null
          error_message?: string | null
          group: string
          id?: string
          last_ping?: string | null
          latency_ms?: number | null
          monitoring_enabled?: boolean | null
          name: string
          related_route?: string | null
          severity?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          deps?: Json | null
          error_code?: string | null
          error_message?: string | null
          group?: string
          id?: string
          last_ping?: string | null
          latency_ms?: number | null
          monitoring_enabled?: boolean | null
          name?: string
          related_route?: string | null
          severity?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_events_bus: {
        Row: {
          acknowledged: boolean | null
          connection_id: string | null
          created_at: string | null
          event_type: string
          id: string
          payload: Json | null
        }
        Insert: {
          acknowledged?: boolean | null
          connection_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          payload?: Json | null
        }
        Update: {
          acknowledged?: boolean | null
          connection_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "system_events_bus_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "system_connections"
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
      system_playbooks: {
        Row: {
          created_at: string | null
          doc_url: string | null
          estimated_effort_min: number | null
          id: string
          match_error: string
          steps: Json
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          doc_url?: string | null
          estimated_effort_min?: number | null
          id?: string
          match_error: string
          steps: Json
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          doc_url?: string | null
          estimated_effort_min?: number | null
          id?: string
          match_error?: string
          steps?: Json
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      tarefa: {
        Row: {
          area: Database["public"]["Enums"]["area_enum"][] | null
          auto_criar_evento: boolean | null
          campanha_id: string | null
          canais: Database["public"]["Enums"]["canal_enum"][] | null
          capa_anexo_id: string | null
          checklist: Json | null
          checklist_progress: number | null
          cliente_id: string | null
          created_at: string | null
          created_by: string | null
          cta: string | null
          custo_estimado: number | null
          custo_execucao: number | null
          custo_real: number | null
          data_entrega_prevista: string | null
          data_inicio_prevista: string | null
          data_publicacao: string | null
          descricao: string | null
          evento_calendario_id: string | null
          executor_area:
            | Database["public"]["Enums"]["executor_area_enum"]
            | null
          executor_id: string | null
          grs_action_id: string | null
          horas_estimadas: number | null
          horas_trabalhadas: number | null
          id: string
          is_faturavel: boolean | null
          kpis: Json | null
          labels: Json | null
          numero_protocolo: string | null
          observacoes: string | null
          origem: string | null
          planejamento_id: string | null
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
          valor_faturamento: number | null
        }
        Insert: {
          area?: Database["public"]["Enums"]["area_enum"][] | null
          auto_criar_evento?: boolean | null
          campanha_id?: string | null
          canais?: Database["public"]["Enums"]["canal_enum"][] | null
          capa_anexo_id?: string | null
          checklist?: Json | null
          checklist_progress?: number | null
          cliente_id?: string | null
          created_at?: string | null
          created_by?: string | null
          cta?: string | null
          custo_estimado?: number | null
          custo_execucao?: number | null
          custo_real?: number | null
          data_entrega_prevista?: string | null
          data_inicio_prevista?: string | null
          data_publicacao?: string | null
          descricao?: string | null
          evento_calendario_id?: string | null
          executor_area?:
            | Database["public"]["Enums"]["executor_area_enum"]
            | null
          executor_id?: string | null
          grs_action_id?: string | null
          horas_estimadas?: number | null
          horas_trabalhadas?: number | null
          id?: string
          is_faturavel?: boolean | null
          kpis?: Json | null
          labels?: Json | null
          numero_protocolo?: string | null
          observacoes?: string | null
          origem?: string | null
          planejamento_id?: string | null
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
          valor_faturamento?: number | null
        }
        Update: {
          area?: Database["public"]["Enums"]["area_enum"][] | null
          auto_criar_evento?: boolean | null
          campanha_id?: string | null
          canais?: Database["public"]["Enums"]["canal_enum"][] | null
          capa_anexo_id?: string | null
          checklist?: Json | null
          checklist_progress?: number | null
          cliente_id?: string | null
          created_at?: string | null
          created_by?: string | null
          cta?: string | null
          custo_estimado?: number | null
          custo_execucao?: number | null
          custo_real?: number | null
          data_entrega_prevista?: string | null
          data_inicio_prevista?: string | null
          data_publicacao?: string | null
          descricao?: string | null
          evento_calendario_id?: string | null
          executor_area?:
            | Database["public"]["Enums"]["executor_area_enum"]
            | null
          executor_id?: string | null
          grs_action_id?: string | null
          horas_estimadas?: number | null
          horas_trabalhadas?: number | null
          id?: string
          is_faturavel?: boolean | null
          kpis?: Json | null
          labels?: Json | null
          numero_protocolo?: string | null
          observacoes?: string | null
          origem?: string | null
          planejamento_id?: string | null
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
          valor_faturamento?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tarefa_executor"
            columns: ["executor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "fk_tarefa_executor"
            columns: ["executor_id"]
            isOneToOne: false
            referencedRelation: "profiles_deprecated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tarefa_executor"
            columns: ["executor_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["responsavel_profile_id"]
          },
          {
            foreignKeyName: "fk_tarefa_executor"
            columns: ["executor_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "fk_tarefa_executor"
            columns: ["executor_id"]
            isOneToOne: false
            referencedRelation: "vw_produtividade_7d"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_tarefa_executor_pessoas"
            columns: ["executor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "fk_tarefa_executor_pessoas"
            columns: ["executor_id"]
            isOneToOne: false
            referencedRelation: "profiles_deprecated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tarefa_executor_pessoas"
            columns: ["executor_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["responsavel_profile_id"]
          },
          {
            foreignKeyName: "fk_tarefa_executor_pessoas"
            columns: ["executor_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "fk_tarefa_executor_pessoas"
            columns: ["executor_id"]
            isOneToOne: false
            referencedRelation: "vw_produtividade_7d"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_tarefa_planejamento"
            columns: ["planejamento_id"]
            isOneToOne: false
            referencedRelation: "planejamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles_deprecated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["responsavel_profile_id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_produtividade_7d"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel_pessoas"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel_pessoas"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles_deprecated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel_pessoas"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["responsavel_profile_id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel_pessoas"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel_pessoas"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_produtividade_7d"
            referencedColumns: ["user_id"]
          },
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
            foreignKeyName: "tarefa_evento_calendario_id_fkey"
            columns: ["evento_calendario_id"]
            isOneToOne: false
            referencedRelation: "eventos_calendario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefa_evento_calendario_id_fkey"
            columns: ["evento_calendario_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["id"]
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
            foreignKeyName: "tarefa_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "tarefa_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "tarefa_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "tarefa_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
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
          {
            foreignKeyName: "tarefa_atividades_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "tarefa_atividades_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefa_comentarios: {
        Row: {
          autor_id: string
          conteudo: string
          created_at: string | null
          id: string
          metadados: Json | null
          tarefa_id: string
          tipo: string | null
        }
        Insert: {
          autor_id: string
          conteudo: string
          created_at?: string | null
          id?: string
          metadados?: Json | null
          tarefa_id: string
          tipo?: string | null
        }
        Update: {
          autor_id?: string
          conteudo?: string
          created_at?: string | null
          id?: string
          metadados?: Json | null
          tarefa_id?: string
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefa_comentarios_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefa_comentarios_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefa_comentarios_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "tarefa_comentarios_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
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
          {
            foreignKeyName: "tarefa_conteudo_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "tarefa_conteudo_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
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
          {
            foreignKeyName: "tarefa_seguidores_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "tarefa_seguidores_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      team_chat_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          id: string
          mentioned_users: string[] | null
          reactions: Json | null
          sender_id: string
          thread_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          id?: string
          mentioned_users?: string[] | null
          reactions?: Json | null
          sender_id: string
          thread_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          mentioned_users?: string[] | null
          reactions?: Json | null
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "team_chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      team_chat_read_status: {
        Row: {
          created_at: string
          id: string
          last_read_at: string
          last_read_message_id: string | null
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_read_at?: string
          last_read_message_id?: string | null
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_read_at?: string
          last_read_message_id?: string | null
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_chat_read_status_last_read_message_id_fkey"
            columns: ["last_read_message_id"]
            isOneToOne: false
            referencedRelation: "team_chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_chat_read_status_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "team_chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      team_chat_threads: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_group: boolean
          last_message_at: string | null
          participants: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group?: boolean
          last_message_at?: string | null
          participants?: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group?: boolean
          last_message_at?: string | null
          participants?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_mensagens: {
        Row: {
          anexo_url: string | null
          created_at: string | null
          id: string
          mensagem: string
          ticket_id: string
          usuario_id: string
        }
        Insert: {
          anexo_url?: string | null
          created_at?: string | null
          id?: string
          mensagem: string
          ticket_id: string
          usuario_id: string
        }
        Update: {
          anexo_url?: string | null
          created_at?: string | null
          id?: string
          mensagem?: string
          ticket_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_mensagens_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "cliente_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      titulos_financeiros: {
        Row: {
          anexos_url: string[] | null
          aprovado_em: string | null
          aprovado_por: string | null
          categoria_id: string | null
          centro_custo_id: string | null
          cliente_id: string | null
          comprovante_url: string | null
          conta_bancaria_id: string | null
          contrato_id: string | null
          created_at: string
          created_by: string | null
          data_competencia: string
          data_emissao: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          dias_atraso: number | null
          forma_pagamento: string | null
          fornecedor_id: string | null
          id: string
          is_recorrente: boolean | null
          numero_documento: string | null
          observacoes: string | null
          projeto_id: string | null
          proximo_vencimento: string | null
          recorrencia_tipo: string | null
          requer_aprovacao: boolean | null
          status: Database["public"]["Enums"]["status_titulo"]
          tipo: Database["public"]["Enums"]["tipo_titulo"]
          tipo_documento: Database["public"]["Enums"]["tipo_documento"] | null
          updated_at: string
          updated_by: string | null
          valor_desconto: number | null
          valor_juros: number | null
          valor_liquido: number | null
          valor_multa: number | null
          valor_original: number
          valor_pago: number | null
        }
        Insert: {
          anexos_url?: string[] | null
          aprovado_em?: string | null
          aprovado_por?: string | null
          categoria_id?: string | null
          centro_custo_id?: string | null
          cliente_id?: string | null
          comprovante_url?: string | null
          conta_bancaria_id?: string | null
          contrato_id?: string | null
          created_at?: string
          created_by?: string | null
          data_competencia?: string
          data_emissao?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          dias_atraso?: number | null
          forma_pagamento?: string | null
          fornecedor_id?: string | null
          id?: string
          is_recorrente?: boolean | null
          numero_documento?: string | null
          observacoes?: string | null
          projeto_id?: string | null
          proximo_vencimento?: string | null
          recorrencia_tipo?: string | null
          requer_aprovacao?: boolean | null
          status?: Database["public"]["Enums"]["status_titulo"]
          tipo: Database["public"]["Enums"]["tipo_titulo"]
          tipo_documento?: Database["public"]["Enums"]["tipo_documento"] | null
          updated_at?: string
          updated_by?: string | null
          valor_desconto?: number | null
          valor_juros?: number | null
          valor_liquido?: number | null
          valor_multa?: number | null
          valor_original: number
          valor_pago?: number | null
        }
        Update: {
          anexos_url?: string[] | null
          aprovado_em?: string | null
          aprovado_por?: string | null
          categoria_id?: string | null
          centro_custo_id?: string | null
          cliente_id?: string | null
          comprovante_url?: string | null
          conta_bancaria_id?: string | null
          contrato_id?: string | null
          created_at?: string
          created_by?: string | null
          data_competencia?: string
          data_emissao?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          dias_atraso?: number | null
          forma_pagamento?: string | null
          fornecedor_id?: string | null
          id?: string
          is_recorrente?: boolean | null
          numero_documento?: string | null
          observacoes?: string | null
          projeto_id?: string | null
          proximo_vencimento?: string | null
          recorrencia_tipo?: string | null
          requer_aprovacao?: boolean | null
          status?: Database["public"]["Enums"]["status_titulo"]
          tipo?: Database["public"]["Enums"]["tipo_titulo"]
          tipo_documento?: Database["public"]["Enums"]["tipo_documento"] | null
          updated_at?: string
          updated_by?: string | null
          valor_desconto?: number | null
          valor_juros?: number | null
          valor_liquido?: number | null
          valor_multa?: number | null
          valor_original?: number
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "titulos_financeiros_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "titulos_financeiros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "titulos_financeiros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "titulos_financeiros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "titulos_financeiros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "titulos_financeiros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "titulos_financeiros_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "titulos_financeiros_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "titulos_financeiros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "titulos_financeiros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "titulos_financeiros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "titulos_financeiros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "titulos_financeiros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
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
          evento_id: string | null
          folha_item_id: string | null
          id: string
          observacoes: string | null
          orcamento_id: string | null
          produto_id: string | null
          projeto_id: string | null
          proposta_id: string | null
          responsavel_id: string | null
          status: string
          tarefa_id: string | null
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
          evento_id?: string | null
          folha_item_id?: string | null
          id?: string
          observacoes?: string | null
          orcamento_id?: string | null
          produto_id?: string | null
          projeto_id?: string | null
          proposta_id?: string | null
          responsavel_id?: string | null
          status?: string
          tarefa_id?: string | null
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
          evento_id?: string | null
          folha_item_id?: string | null
          id?: string
          observacoes?: string | null
          orcamento_id?: string | null
          produto_id?: string | null
          projeto_id?: string | null
          proposta_id?: string | null
          responsavel_id?: string | null
          status?: string
          tarefa_id?: string | null
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
            foreignKeyName: "transacoes_financeiras_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos_calendario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_folha_item_id_fkey"
            columns: ["folha_item_id"]
            isOneToOne: false
            referencedRelation: "financeiro_folha_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "assinaturas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_planos_publicos_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
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
        Relationships: []
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
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      assinaturas_compat: {
        Row: {
          anuncios_facebook: boolean | null
          anuncios_google: boolean | null
          created_at: string | null
          id: string | null
          nome: string | null
          periodo: string | null
          posts_mensais: number | null
          preco: number | null
          recursos: string[] | null
          reels_suporte: boolean | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          anuncios_facebook?: boolean | null
          anuncios_google?: boolean | null
          created_at?: string | null
          id?: string | null
          nome?: string | null
          periodo?: string | null
          posts_mensais?: number | null
          preco?: number | null
          recursos?: string[] | null
          reels_suporte?: boolean | null
          status?: never
          updated_at?: string | null
        }
        Update: {
          anuncios_facebook?: boolean | null
          anuncios_google?: boolean | null
          created_at?: string | null
          id?: string | null
          nome?: string | null
          periodo?: string | null
          posts_mensais?: number | null
          preco?: number | null
          recursos?: string[] | null
          reels_suporte?: boolean | null
          status?: never
          updated_at?: string | null
        }
        Relationships: []
      }
      credenciais_status_seguranca: {
        Row: {
          credenciais_criptografadas: number | null
          credenciais_sem_criptografia: number | null
          percentual_seguro: number | null
          total_credenciais: number | null
        }
        Relationships: []
      }
      estrategia1_progresso: {
        Row: {
          meta: number | null
          metrica: string | null
          unidade: string | null
          valor_atual: number | null
        }
        Relationships: []
      }
      estrategia1_progresso_v2: {
        Row: {
          item: string | null
          progresso_pct: number | null
          resultado: string | null
          status: string | null
        }
        Relationships: []
      }
      mv_cliente_timeline: {
        Row: {
          cliente_id: string | null
          timeline: Json | null
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
        Relationships: []
      }
      pacotes_compat: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string | null
          nome: string | null
          preco_base: number | null
          slug: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string | null
          nome?: string | null
          preco_base?: number | null
          slug?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string | null
          nome?: string | null
          preco_base?: number | null
          slug?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles_deprecated: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          email: string | null
          id: string | null
          nome: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          cliente_id?: never
          created_at?: string | null
          email?: string | null
          id?: string | null
          nome?: string | null
          telefone?: never
          updated_at?: string | null
        }
        Update: {
          cliente_id?: never
          created_at?: string | null
          email?: string | null
          id?: string | null
          nome?: string | null
          telefone?: never
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
          column_name: unknown
          data_type: string | null
          is_nullable: string | null
          table_name: unknown
        }
        Relationships: []
      }
      validacao_orfaos_sprint1: {
        Row: {
          tipo_orfao: string | null
          total: number | null
        }
        Relationships: []
      }
      vw_briefings_legacy: {
        Row: {
          anexo_url: string | null
          call_to_action: string | null
          cliente_id: string | null
          created_at: string | null
          decided_at: string | null
          decidido_por: string | null
          descricao: string | null
          formato_postagem: string | null
          hashtags: string[] | null
          id: string | null
          legenda: string | null
          motivo_reprovacao: string | null
          objetivo_postagem: string | null
          projeto_id: string | null
          rede_social: string | null
          solicitado_por: string | null
          status_briefing: string | null
          tarefa_id: string | null
          titulo: string | null
          updated_at: string | null
        }
        Insert: {
          anexo_url?: string | null
          call_to_action?: string | null
          cliente_id?: string | null
          created_at?: string | null
          decided_at?: string | null
          decidido_por?: string | null
          descricao?: string | null
          formato_postagem?: string | null
          hashtags?: string[] | null
          id?: string | null
          legenda?: string | null
          motivo_reprovacao?: string | null
          objetivo_postagem?: string | null
          projeto_id?: string | null
          rede_social?: string | null
          solicitado_por?: string | null
          status_briefing?: string | null
          tarefa_id?: string | null
          titulo?: string | null
          updated_at?: string | null
        }
        Update: {
          anexo_url?: string | null
          call_to_action?: string | null
          cliente_id?: string | null
          created_at?: string | null
          decided_at?: string | null
          decidido_por?: string | null
          descricao?: string | null
          formato_postagem?: string | null
          hashtags?: string[] | null
          id?: string | null
          legenda?: string | null
          motivo_reprovacao?: string | null
          objetivo_postagem?: string | null
          projeto_id?: string | null
          rede_social?: string | null
          solicitado_por?: string | null
          status_briefing?: string | null
          tarefa_id?: string | null
          titulo?: string | null
          updated_at?: string | null
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
            foreignKeyName: "aprovacoes_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aprovacoes_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "aprovacoes_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "aprovacoes_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "aprovacoes_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_cliente_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "fk_aprovacoes_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_calendario_completo: {
        Row: {
          captacao_equipamentos: string[] | null
          captacao_id: string | null
          captacao_status: string | null
          cliente_id: string | null
          cliente_nome: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string | null
          is_bloqueante: boolean | null
          is_extra: boolean | null
          local: string | null
          projeto_id: string | null
          projeto_titulo: string | null
          responsavel_avatar: string | null
          responsavel_nome: string | null
          responsavel_profile_id: string | null
          status: Database["public"]["Enums"]["status_evento"] | null
          tarefa_id: string | null
          tarefa_status:
            | Database["public"]["Enums"]["status_tarefa_enum"]
            | null
          tipo: Database["public"]["Enums"]["tipo_evento"] | null
          titulo: string | null
        }
        Relationships: []
      }
      vw_calendario_unificado: {
        Row: {
          captacao_id: string | null
          cliente_id: string | null
          cliente_nome: string | null
          cor: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          fonte_origem: string | null
          id: string | null
          is_automatico: boolean | null
          is_bloqueante: boolean | null
          is_extra: boolean | null
          local: string | null
          origem: string | null
          projeto_id: string | null
          projeto_titulo: string | null
          responsavel_avatar: string | null
          responsavel_id: string | null
          responsavel_nome: string | null
          status: Database["public"]["Enums"]["status_evento"] | null
          tarefa_id: string | null
          tipo: Database["public"]["Enums"]["tipo_evento"] | null
          titulo: string | null
        }
        Relationships: []
      }
      vw_client_metrics: {
        Row: {
          cliente_id: string | null
          cnpj_cpf: string | null
          created_at: string | null
          endereco: string | null
          logo_url: string | null
          nome: string | null
          projetos_ativos: number | null
          responsavel_id: string | null
          responsavel_nome: string | null
          status: string | null
          telefone: string | null
          total_projetos: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      vw_custo_hora_colaborador: {
        Row: {
          cargo_atual: string | null
          colaborador_id: string | null
          custo_hora: number | null
          custo_total_gerado: number | null
          horas_totais: number | null
          nome_completo: string | null
          tipo_vinculo: Database["public"]["Enums"]["regime_trabalho"] | null
          total_tarefas: number | null
          ultima_tarefa_concluida: string | null
        }
        Relationships: []
      }
      vw_custos_projeto: {
        Row: {
          cliente_id: string | null
          cliente_nome: string | null
          custo_eventos: number | null
          custo_outros: number | null
          custo_reservas: number | null
          custo_tarefas: number | null
          custo_total: number | null
          projeto_id: string | null
          projeto_nome: string | null
          qtd_eventos_com_custo: number | null
          qtd_lancamentos: number | null
          qtd_tarefas_com_custo: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_projetos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_projetos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_projetos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_projetos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_projetos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
        ]
      }
      vw_dashboard_financeiro_projeto: {
        Row: {
          cliente_id: string | null
          cliente_nome: string | null
          margem_liquida: number | null
          projeto_id: string | null
          projeto_nome: string | null
          roi_percentual: number | null
          total_custos: number | null
          total_receitas: number | null
          total_transacoes: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_projetos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_projetos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_projetos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_projetos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_projetos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
        ]
      }
      vw_dashboard_vencimentos: {
        Row: {
          cliente_id: string | null
          cliente_nome: string | null
          data_entrega_prevista: string | null
          id: string | null
          prioridade: Database["public"]["Enums"]["prioridade_enum"] | null
          responsavel_id: string | null
          responsavel_nome: string | null
          status: Database["public"]["Enums"]["status_tarefa_enum"] | null
          titulo: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tarefa_responsavel"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles_deprecated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["responsavel_profile_id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_produtividade_7d"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel_pessoas"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel_pessoas"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles_deprecated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel_pessoas"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["responsavel_profile_id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel_pessoas"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["responsavel_id"]
          },
          {
            foreignKeyName: "fk_tarefa_responsavel_pessoas"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_produtividade_7d"
            referencedColumns: ["user_id"]
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "tarefa_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
        ]
      }
      vw_dre_mensal: {
        Row: {
          despesas: number | null
          lucro_liquido: number | null
          mes: string | null
          receitas: number | null
        }
        Relationships: []
      }
      vw_financas_orfas: {
        Row: {
          data_lancamento: string | null
          descricao: string | null
          id: string | null
          tipo_lancamento: string | null
          tipo_orfao: string | null
          valor: number | null
        }
        Insert: {
          data_lancamento?: string | null
          descricao?: string | null
          id?: string | null
          tipo_lancamento?: string | null
          tipo_orfao?: never
          valor?: number | null
        }
        Update: {
          data_lancamento?: string | null
          descricao?: string | null
          id?: string | null
          tipo_lancamento?: string | null
          tipo_orfao?: never
          valor?: number | null
        }
        Relationships: []
      }
      vw_financeiro_resumo: {
        Row: {
          mes: string | null
          quantidade: number | null
          tipo_lancamento: string | null
          total: number | null
        }
        Relationships: []
      }
      vw_health_check_pessoas: {
        Row: {
          aprovados: number | null
          com_profile_id: number | null
          pendentes: number | null
          percentual_com_profile: number | null
          rejeitados: number | null
          sem_profile_id: number | null
          suspensos: number | null
          total_pessoas: number | null
        }
        Relationships: []
      }
      vw_lancamentos_origem: {
        Row: {
          cliente_id: string | null
          cliente_nome: string | null
          data_lancamento: string | null
          descricao: string | null
          evento_id: string | null
          evento_tipo: Database["public"]["Enums"]["tipo_evento"] | null
          evento_titulo: string | null
          folha_descricao: string | null
          folha_item_id: string | null
          folha_referencia: string | null
          id: string | null
          origem_id: string | null
          percentual_projeto: number | null
          projeto_id: string | null
          projeto_titulo: string | null
          tarefa_id: string | null
          tarefa_status:
            | Database["public"]["Enums"]["status_tarefa_enum"]
            | null
          tarefa_titulo: string | null
          tipo_lancamento: string | null
          tipo_origem: string | null
          tipo_transacao: string | null
          valor: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_lancamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos_calendario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_folha_item_id_fkey"
            columns: ["folha_item_id"]
            isOneToOne: false
            referencedRelation: "financeiro_folha_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_financeiro_evento"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos_calendario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_financeiro_evento"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_financeiro_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_financeiro_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "fk_financeiro_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lancamentos_evento"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos_calendario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lancamentos_evento"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lancamentos_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lancamentos_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_lancamentos_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_custos_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_lancamentos_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_financeiro_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_lancamentos_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projeto_lucro"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fk_lancamentos_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lancamentos_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["tarefa_id"]
          },
          {
            foreignKeyName: "fk_lancamentos_tarefa"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_vencimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_mapa_dividas: {
        Row: {
          centro_custo_id: string | null
          centro_custo_nome: string | null
          cliente_id: string | null
          cliente_nome: string | null
          credor_devedor: string | null
          data_emissao: string | null
          descricao: string | null
          divida_id: string | null
          fornecedor_id: string | null
          numero_parcelas: number | null
          parcelas_pagas_count: number | null
          parcelas_vencidas_count: number | null
          proximo_vencimento: string | null
          status: string | null
          tipo: string | null
          valor_pago: number | null
          valor_restante: number | null
          valor_total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dividas_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dividas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dividas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "dividas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "mv_grs_dashboard_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "dividas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_calendario_completo"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "dividas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_client_metrics"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "dividas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
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
            referencedRelation: "mv_cliente_timeline"
            referencedColumns: ["cliente_id"]
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
            referencedRelation: "vw_calendario_completo"
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
          anuncios_facebook: boolean | null
          anuncios_google: boolean | null
          ativo: boolean | null
          created_at: string | null
          id: string | null
          nome: string | null
          periodo: string | null
          posts_mensais: number | null
          preco_padrao: number | null
          recursos: string[] | null
          reels_suporte: boolean | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          anuncios_facebook?: boolean | null
          anuncios_google?: boolean | null
          ativo?: boolean | null
          created_at?: string | null
          id?: string | null
          nome?: string | null
          periodo?: string | null
          posts_mensais?: number | null
          preco_padrao?: number | null
          recursos?: string[] | null
          reels_suporte?: boolean | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          anuncios_facebook?: boolean | null
          anuncios_google?: boolean | null
          ativo?: boolean | null
          created_at?: string | null
          id?: string | null
          nome?: string | null
          periodo?: string | null
          posts_mensais?: number | null
          preco_padrao?: number | null
          recursos?: string[] | null
          reels_suporte?: boolean | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vw_produtividade_7d: {
        Row: {
          dias_ativos: number | null
          tarefas_concluidas: number | null
          tempo_medio_conclusao_horas: number | null
          user_id: string | null
          user_nome: string | null
        }
        Relationships: []
      }
      vw_projeto_lucro: {
        Row: {
          cliente_nome: string | null
          custo_total: number | null
          data_inicio: string | null
          lucro_liquido: number | null
          margem_lucro_percent: number | null
          projeto_id: string | null
          projeto_nome: string | null
          projeto_status: Database["public"]["Enums"]["status_type"] | null
          receita_total: number | null
        }
        Relationships: []
      }
      vw_system_integrity: {
        Row: {
          check_name: string | null
          issues_count: number | null
          status: string | null
        }
        Relationships: []
      }
      vw_validacao_calendario_sync: {
        Row: {
          metrica: string | null
          status: string | null
          valor: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      adicionar_papel_pessoa: {
        Args: { p_data_inicio?: string; p_papel: string; p_pessoa_id: string }
        Returns: string
      }
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
      auto_sync_orphan_users: { Args: never; Returns: Json }
      calcular_folha_mes: {
        Args: { p_competencia: string; p_pessoa_id: string }
        Returns: Json
      }
      can_access_sensitive_cliente_data: {
        Args: { p_pessoa_id: string }
        Returns: boolean
      }
      can_access_sensitive_customer_data: {
        Args: { customer_id: string }
        Returns: boolean
      }
      can_manage_pessoas: { Args: never; Returns: boolean }
      check_orphan_users: {
        Args: never
        Returns: {
          orphan_count: number
          orphan_emails: string[]
        }[]
      }
      check_user_integrity: {
        Args: never
        Returns: {
          integrity_score: number
          orphan_auth_users: number
          orphan_profiles: number
          total_auth_users: number
          users_with_profile: number
          users_with_role: number
        }[]
      }
      cleanup_expired_temp_posts: { Args: never; Returns: number }
      cleanup_posts_temporarios: {
        Args: never
        Returns: {
          deletados: number
          tamanho_antes_mb: number
          tamanho_depois_mb: number
        }[]
      }
      cleanup_temp_posts: { Args: never; Returns: undefined }
      create_admin_user: { Args: never; Returns: Json }
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
      decrypt_credential:
        | {
            Args: { p_encrypted: string; p_key_name?: string }
            Returns: string
          }
        | { Args: { encrypted_text: string }; Returns: string }
      diagnostico_roles_v2: {
        Args: never
        Returns: {
          percentual_consistencia: number
          pessoas_com_role: number
          pessoas_sem_role: number
          total_pessoas: number
        }[]
      }
      encrypt_credential: { Args: { credential_text: string }; Returns: string }
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
        Args: never
        Returns: {
          auth_user_id: string
          created_at: string
          email: string
          has_profile: boolean
          user_metadata: Json
        }[]
      }
      fn_agregar_insights_notas: {
        Args: { p_cliente_id: string }
        Returns: Json
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
      fn_calcular_ponto: { Args: { p_ponto_id: string }; Returns: undefined }
      fn_cred_get_metadata: {
        Args: { p_cliente_id: string; p_projeto_id?: string }
        Returns: {
          categoria: string
          extra: Json
          id: string
          plataforma: string
          senha: string
          tokens_api: Json
          updated_at: string
          updated_by_nome: string
          url: string
          usuario_login: string
        }[]
      }
      fn_cred_save:
        | {
            Args: {
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
            Returns: string
          }
        | {
            Args: {
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
        | {
            Args: {
              p_categoria: string
              p_cliente_id: string
              p_cred_id?: string
              p_extra_json?: Json
              p_plataforma: string
              p_projeto_id: string
              p_senha: string
              p_tokens_api?: Json
              p_url?: string
              p_usuario_login: string
            }
            Returns: string
          }
      fn_cred_save_deprecated: {
        Args: {
          p_categoria: string
          p_cliente_id: string
          p_cred_id?: string
          p_extra_json?: Json
          p_plataforma: string
          p_projeto_id: string
          p_senha: string
          p_tokens_api?: Json
          p_url?: string
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
      fn_criar_evento_com_regras:
        | {
            Args: {
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
        | {
            Args: {
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
      fn_detectar_conflitos_horario: {
        Args: {
          p_data_fim: string
          p_data_inicio: string
          p_evento_id?: string
          p_responsavel_id: string
        }
        Returns: {
          conflito_fim: string
          conflito_id: string
          conflito_inicio: string
          conflito_titulo: string
          severidade: string
          tipo_conflito: string
        }[]
      }
      fn_get_default_responsavel: { Args: never; Returns: string }
      fn_get_timeline_by_trace: {
        Args: { p_trace_id: string }
        Returns: {
          acao: string
          acao_detalhe: string
          contexto: Json
          created_at: string
          entidade_tipo: string
          id: string
          impacto_tipo: string
          user_nome: string
          user_role: string
        }[]
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
      fn_notificar_vencimentos: { Args: never; Returns: undefined }
      fn_registrar_audit: {
        Args: {
          p_acao: string
          p_acao_detalhe?: string
          p_dados_antes?: Json
          p_dados_depois?: Json
          p_entidade_id: string
          p_entidade_tipo: string
          p_entidades_afetadas?: Json
          p_impacto_tipo?: string
          p_metadata?: Json
        }
        Returns: string
      }
      fn_registrar_auditoria: {
        Args: {
          p_acao: string
          p_dados_antes?: Json
          p_dados_depois?: Json
          p_detalhe?: string
          p_registro_id: string
          p_tabela: string
          p_trace_id?: string
        }
        Returns: undefined
      }
      fn_sugerir_categoria: {
        Args: {
          p_cliente_id?: string
          p_descricao: string
          p_fornecedor_id?: string
          p_tipo: string
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
      fn_sugerir_vinculo_transacao: {
        Args: {
          p_data_transacao: string
          p_descricao: string
          p_tipo_movimento: string
          p_valor: number
        }
        Returns: {
          confianca: number
          entidade_id: string
          entidade_nome: string
          entidade_tipo: string
          titulo_id: string
        }[]
      }
      fn_tarefa_status_prazo: { Args: { p_tarefa_id: string }; Returns: string }
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
      get_cliente_timeline: {
        Args: { p_cliente_id: string; p_limit?: number }
        Returns: {
          data: string
          entidade: string
          metadata: Json
          tipo: string
          titulo: string
        }[]
      }
      get_credential_secure: {
        Args: { p_cred_id: string }
        Returns: {
          categoria: string
          cliente_id: string
          extra: Json
          id: string
          plataforma: string
          projeto_id: string
          senha_decrypted: string
          tokens_api_decrypted: Json
          updated_at: string
          url: string
          usuario_login: string
        }[]
      }
      get_dashboard_financeiro_data: {
        Args: never
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "mv_dashboard_financeiro"
          isOneToOne: false
          isSetofReturn: true
        }
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
      get_filtered_customers_list: { Args: never; Returns: Json }
      get_filtered_profile: { Args: { profile_id: string }; Returns: Json }
      get_financeiro_integrado:
        | {
            Args: {
              p_cliente_id?: string
              p_data_fim?: string
              p_data_inicio?: string
              p_projeto_id?: string
            }
            Returns: {
              centro_custo_nome: string
              colaborador_nome: string
              data_lancamento: string
              descricao: string
              evento_tipo: string
              evento_titulo: string
              id: string
              projeto_titulo: string
              tarefa_status: string
              tarefa_titulo: string
              tipo: string
              tipo_origem: string
              valor: number
            }[]
          }
        | {
            Args: { p_cliente_id?: string; p_projeto_id?: string }
            Returns: {
              data_lancamento: string
              descricao: string
              evento_tipo: string
              evento_titulo: string
              id: string
              projeto_titulo: string
              tarefa_status: string
              tarefa_titulo: string
              tipo: string
              valor: number
            }[]
          }
      get_fluxo_por_categoria_data: {
        Args: never
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "vw_fluxo_por_categoria"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_grs_dashboard_metrics: {
        Args: never
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
      get_project_financial_summary: {
        Args: { p_projeto_id: string }
        Returns: Json
      }
      get_user_complete: { Args: { p_user_id: string }; Returns: Json }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_users_batch: { Args: { p_user_ids: string[] }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_uuid: string }; Returns: boolean }
      is_responsavel_of: { Args: { pessoa_id: string }; Returns: boolean }
      is_same_cliente: { Args: { p_pessoa_id: string }; Returns: boolean }
      is_valid_profile_id: { Args: { p_profile_id: string }; Returns: boolean }
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
      normalizar_cpf: { Args: { cpf_input: string }; Returns: string }
      popular_checklist_inicial: { Args: never; Returns: undefined }
      process_social_post_queue: { Args: never; Returns: undefined }
      refresh_cliente_timeline: { Args: never; Returns: undefined }
      refresh_dashboard_financeiro: { Args: never; Returns: undefined }
      refresh_grs_dashboard_metrics: { Args: never; Returns: undefined }
      refresh_relatorios_financeiros: { Args: never; Returns: undefined }
      rejeitar_especialista: {
        Args: { especialista_id: string; observacao?: string }
        Returns: boolean
      }
      remover_papel_pessoa: {
        Args: { p_papel: string; p_pessoa_id: string }
        Returns: boolean
      }
      rollback_sprint1: { Args: never; Returns: string }
      sanitize_error_message: { Args: { error_msg: string }; Returns: string }
      save_credential_secure: {
        Args: {
          p_categoria: string
          p_cliente_id: string
          p_extra?: Json
          p_plataforma: string
          p_projeto_id: string
          p_senha_plain: string
          p_tokens_api_plain?: Json
          p_url?: string
          p_usuario_login: string
        }
        Returns: string
      }
      sync_captacoes_to_calendar: {
        Args: never
        Returns: {
          captacoes_sincronizadas: number
          erros: string[]
        }[]
      }
      sync_tarefas_to_calendar: {
        Args: never
        Returns: {
          erros: string[]
          tarefas_sincronizadas: number
        }[]
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
      validate_specialist_access: { Args: { p_user_id: string }; Returns: Json }
      validate_user_for_login: { Args: { p_email: string }; Returns: Json }
      vincular_financas_orfas: {
        Args: never
        Returns: {
          ainda_orfaos: number
          vinculados: number
        }[]
      }
      vincular_usuarios_clientes: { Args: never; Returns: undefined }
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
      formato_extrato_enum: "ofx" | "csv"
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
      post_status_enum:
        | "rascunho"
        | "em_aprovacao"
        | "aprovado"
        | "reprovado"
        | "em_producao"
        | "aguardando_publicacao"
        | "publicado"
        | "cancelado"
      post_status_type:
        | "a_fazer"
        | "em_producao"
        | "pronto"
        | "publicado"
        | "temporario"
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
      status_extrato_enum: "processando" | "concluido" | "erro"
      status_folha: "aberta" | "processada" | "fechada"
      status_item_folha: "pendente" | "pago" | "cancelado"
      status_orcamento:
        | "rascunho"
        | "enviado"
        | "aprovado"
        | "rejeitado"
        | "expirado"
        | "arquivado"
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
      status_processamento_enum:
        | "pendente"
        | "revisado"
        | "importado"
        | "descartado"
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
        | "a_fazer"
        | "em_andamento"
        | "concluido"
        | "em_cadastro"
        | "em_analise"
        | "em_criacao"
        | "revisao_interna"
        | "entregue"
        | "roteiro"
        | "pre_producao"
        | "gravacao"
        | "pos_producao"
        | "novo"
        | "qualificado"
        | "proposta"
        | "negociacao"
        | "fechado"
        | "contato"
        | "oportunidade"
        | "convertido"
        | "recebidos"
        | "ajuste_interno"
        | "alteracao_cliente"
        | "briefing_recebido"
        | "planejando_captacao"
        | "ingest_backup"
        | "enviado_cliente"
      status_titulo:
        | "pendente"
        | "vencido"
        | "pago"
        | "cancelado"
        | "renegociado"
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
      tipo_documento:
        | "boleto"
        | "nf"
        | "recibo"
        | "fatura"
        | "duplicata"
        | "outros"
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
        | "feriado"
      tipo_movimento_enum: "credito" | "debito"
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
        | "feed_post"
        | "criativo_vt"
        | "reels_instagram"
        | "stories_interativo"
        | "criativo_cartela"
        | "landing_page"
        | "email_marketing"
        | "arte_impressa"
        | "motion_graphics"
        | "video_depoimento"
        | "cobertura_evento"
      tipo_titulo: "pagar" | "receber"
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
      formato_extrato_enum: ["ofx", "csv"],
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
      post_status_enum: [
        "rascunho",
        "em_aprovacao",
        "aprovado",
        "reprovado",
        "em_producao",
        "aguardando_publicacao",
        "publicado",
        "cancelado",
      ],
      post_status_type: [
        "a_fazer",
        "em_producao",
        "pronto",
        "publicado",
        "temporario",
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
      status_extrato_enum: ["processando", "concluido", "erro"],
      status_folha: ["aberta", "processada", "fechada"],
      status_item_folha: ["pendente", "pago", "cancelado"],
      status_orcamento: [
        "rascunho",
        "enviado",
        "aprovado",
        "rejeitado",
        "expirado",
        "arquivado",
      ],
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
      status_processamento_enum: [
        "pendente",
        "revisado",
        "importado",
        "descartado",
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
        "a_fazer",
        "em_andamento",
        "concluido",
        "em_cadastro",
        "em_analise",
        "em_criacao",
        "revisao_interna",
        "entregue",
        "roteiro",
        "pre_producao",
        "gravacao",
        "pos_producao",
        "novo",
        "qualificado",
        "proposta",
        "negociacao",
        "fechado",
        "contato",
        "oportunidade",
        "convertido",
        "recebidos",
        "ajuste_interno",
        "alteracao_cliente",
        "briefing_recebido",
        "planejando_captacao",
        "ingest_backup",
        "enviado_cliente",
      ],
      status_titulo: [
        "pendente",
        "vencido",
        "pago",
        "cancelado",
        "renegociado",
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
      tipo_documento: [
        "boleto",
        "nf",
        "recibo",
        "fatura",
        "duplicata",
        "outros",
      ],
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
        "feriado",
      ],
      tipo_movimento_enum: ["credito", "debito"],
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
        "feed_post",
        "criativo_vt",
        "reels_instagram",
        "stories_interativo",
        "criativo_cartela",
        "landing_page",
        "email_marketing",
        "arte_impressa",
        "motion_graphics",
        "video_depoimento",
        "cobertura_evento",
      ],
      tipo_titulo: ["pagar", "receber"],
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
