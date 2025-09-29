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
            foreignKeyName: "fk_captacoes_especialista"
            columns: ["especialista_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            foreignKeyName: "cliente_usuarios_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_usuarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
        ]
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
      orcamento_itens: {
        Row: {
          created_at: string
          desconto_percentual: number | null
          descricao: string | null
          id: string
          orcamento_id: string
          preco_unitario: number
          produto_servico: string
          quantidade: number
          updated_at: string
          valor_total: number
        }
        Insert: {
          created_at?: string
          desconto_percentual?: number | null
          descricao?: string | null
          id?: string
          orcamento_id: string
          preco_unitario: number
          produto_servico: string
          quantidade?: number
          updated_at?: string
          valor_total: number
        }
        Update: {
          created_at?: string
          desconto_percentual?: number | null
          descricao?: string | null
          id?: string
          orcamento_id?: string
          preco_unitario?: number
          produto_servico?: string
          quantidade?: number
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
        ]
      }
      orcamentos: {
        Row: {
          cliente_id: string | null
          created_at: string
          data_validade: string
          desconto_percentual: number | null
          desconto_valor: number | null
          descricao: string | null
          id: string
          observacoes: string | null
          responsavel_id: string | null
          status: string
          titulo: string
          updated_at: string
          valor_final: number
          valor_total: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_validade: string
          desconto_percentual?: number | null
          desconto_valor?: number | null
          descricao?: string | null
          id?: string
          observacoes?: string | null
          responsavel_id?: string | null
          status?: string
          titulo: string
          updated_at?: string
          valor_final?: number
          valor_total?: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_validade?: string
          desconto_percentual?: number | null
          desconto_valor?: number | null
          descricao?: string | null
          id?: string
          observacoes?: string | null
          responsavel_id?: string | null
          status?: string
          titulo?: string
          updated_at?: string
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
            foreignKeyName: "planejamentos_responsavel_grs_id_fkey"
            columns: ["responsavel_grs_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
      profiles: {
        Row: {
          aprovado_por: string | null
          avatar_url: string | null
          cliente_id: string | null
          created_at: string | null
          data_aprovacao: string | null
          email: string
          especialidade:
            | Database["public"]["Enums"]["especialidade_type"]
            | null
          id: string
          nome: string
          observacoes_aprovacao: string | null
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
          especialidade?:
            | Database["public"]["Enums"]["especialidade_type"]
            | null
          id: string
          nome: string
          observacoes_aprovacao?: string | null
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
          especialidade?:
            | Database["public"]["Enums"]["especialidade_type"]
            | null
          id?: string
          nome?: string
          observacoes_aprovacao?: string | null
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
        ]
      }
      projetos: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          nome: string
          orcamento: number | null
          responsavel_id: string | null
          status: Database["public"]["Enums"]["status_type"] | null
          updated_at: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          nome: string
          orcamento?: number | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          orcamento?: number | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
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
            foreignKeyName: "projetos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            foreignKeyName: "fk_projetos_av_planejamento"
            columns: ["planejamento_id"]
            isOneToOne: false
            referencedRelation: "planejamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas: {
        Row: {
          assinatura_data: string | null
          assinatura_status: string
          assinatura_url: string | null
          created_at: string
          data_envio: string | null
          id: string
          link_publico: string | null
          orcamento_id: string
          pdf_assinado_path: string | null
          pdf_path: string | null
          responsavel_id: string | null
          titulo: string
          updated_at: string
          visualizado_em: string | null
        }
        Insert: {
          assinatura_data?: string | null
          assinatura_status?: string
          assinatura_url?: string | null
          created_at?: string
          data_envio?: string | null
          id?: string
          link_publico?: string | null
          orcamento_id: string
          pdf_assinado_path?: string | null
          pdf_path?: string | null
          responsavel_id?: string | null
          titulo: string
          updated_at?: string
          visualizado_em?: string | null
        }
        Update: {
          assinatura_data?: string | null
          assinatura_status?: string
          assinatura_url?: string | null
          created_at?: string
          data_envio?: string | null
          id?: string
          link_publico?: string | null
          orcamento_id?: string
          pdf_assinado_path?: string | null
          pdf_path?: string | null
          responsavel_id?: string | null
          titulo?: string
          updated_at?: string
          visualizado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "tarefas_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            foreignKeyName: "transacoes_financeiras_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
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
        ]
      }
    }
    Views: {
      [_ in never]: never
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
      can_access_sensitive_customer_data: {
        Args: { customer_id: string }
        Returns: boolean
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
      process_social_post_queue: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      rejeitar_especialista: {
        Args: { especialista_id: string; observacao?: string }
        Returns: boolean
      }
      validate_user_for_login: {
        Args: { p_email: string }
        Returns: Json
      }
    }
    Enums: {
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
      priority_type: "baixa" | "media" | "alta" | "urgente"
      status_padrao:
        | "rascunho"
        | "em_revisao"
        | "aprovado_cliente"
        | "em_producao"
        | "em_aprovacao_final"
        | "finalizado"
        | "reprovado"
      status_type: "ativo" | "inativo" | "pendente" | "arquivado"
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
      priority_type: ["baixa", "media", "alta", "urgente"],
      status_padrao: [
        "rascunho",
        "em_revisao",
        "aprovado_cliente",
        "em_producao",
        "em_aprovacao_final",
        "finalizado",
        "reprovado",
      ],
      status_type: ["ativo", "inativo", "pendente", "arquivado"],
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
      ],
    },
  },
} as const
