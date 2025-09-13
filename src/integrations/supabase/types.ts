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
      clientes: {
        Row: {
          assinatura_id: string | null
          cnpj_cpf: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          responsavel_id: string | null
          status: Database["public"]["Enums"]["status_type"] | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          assinatura_id?: string | null
          cnpj_cpf?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          assinatura_id?: string | null
          cnpj_cpf?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          responsavel_id?: string | null
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
        ]
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
      posts_planejamento: {
        Row: {
          anexo_url: string | null
          created_at: string
          data_postagem: string
          formato_postagem: string
          id: string
          objetivo_postagem: string
          planejamento_id: string
          tipo_criativo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          anexo_url?: string | null
          created_at?: string
          data_postagem: string
          formato_postagem?: string
          id?: string
          objetivo_postagem: string
          planejamento_id: string
          tipo_criativo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          anexo_url?: string | null
          created_at?: string
          data_postagem?: string
          formato_postagem?: string
          id?: string
          objetivo_postagem?: string
          planejamento_id?: string
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
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          nome: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          nome: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      tarefas: {
        Row: {
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
      generate_content_with_openai: {
        Args: { prompt_text: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
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
