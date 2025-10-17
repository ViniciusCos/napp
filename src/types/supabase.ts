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
      admin_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      aulas: {
        Row: {
          capa: string | null
          created_at: string
          data: string | null
          descricao: string | null
          disponivel: boolean | null
          id: number
          link: string | null
          material: string | null
          nome: string | null
          professor_id: number | null
          subtema: string[] | null
          tema: string | null
        }
        Insert: {
          capa?: string | null
          created_at?: string
          data?: string | null
          descricao?: string | null
          disponivel?: boolean | null
          id?: number
          link?: string | null
          material?: string | null
          nome?: string | null
          professor_id?: number | null
          subtema?: string[] | null
          tema?: string | null
        }
        Update: {
          capa?: string | null
          created_at?: string
          data?: string | null
          descricao?: string | null
          disponivel?: boolean | null
          id?: number
          link?: string | null
          material?: string | null
          nome?: string | null
          professor_id?: number | null
          subtema?: string[] | null
          tema?: string | null
        }
        Relationships: []
      }
      aulas_questoes: {
        Row: {
          aula_id: number
          created_at: string
          id: number
          ordem: number
          question_id: string
        }
        Insert: {
          aula_id: number
          created_at?: string
          id?: number
          ordem?: number
          question_id: string
        }
        Update: {
          aula_id?: number
          created_at?: string
          id?: number
          ordem?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aulas_questoes_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aulas_questoes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ]
      }
      professores: {
        Row: {
          bio: string | null
          created_at: string
          foto_url: string | null
          id: number
          nome: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          foto_url?: string | null
          id?: number
          nome: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          foto_url?: string | null
          id?: number
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          alternativas: Json | null
          ano: number
          atualizado_em: string | null
          banca: string
          comentario_rich: string | null
          criado_em: string | null
          dificuldade: string | null
          disciplina: string
          gabarito: string
          id: string
          orgao: string
          plataforma: string | null
          plataforma_id: string | null
          prova: string | null
          subtopicos: string[] | null
          texto_apoio_rich: string | null
          texto_principal_rich: string | null
          tipo: string
        }
        Insert: {
          alternativas?: Json | null
          ano: number
          atualizado_em?: string | null
          banca: string
          comentario_rich?: string | null
          criado_em?: string | null
          dificuldade?: string | null
          disciplina: string
          gabarito: string
          id?: string
          orgao: string
          plataforma?: string | null
          plataforma_id?: string | null
          prova?: string | null
          subtopicos?: string[] | null
          texto_apoio_rich?: string | null
          texto_principal_rich?: string | null
          tipo: string
        }
        Update: {
          alternativas?: Json | null
          ano?: number
          atualizado_em?: string | null
          banca?: string
          comentario_rich?: string | null
          criado_em?: string | null
          dificuldade?: string | null
          disciplina?: string
          gabarito?: string
          id?: string
          orgao?: string
          plataforma?: string | null
          plataforma_id?: string | null
          prova?: string | null
          subtopicos?: string[] | null
          texto_apoio_rich?: string | null
          texto_principal_rich?: string | null
          tipo?: string
        }
        Relationships: []
      }
      simulados: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number
          fator_correcao: number | null
          id: string
          is_active: boolean | null
          title: string
          total_questions: number
          updated_at: string
          allow_retake: boolean
          start_date: string | null
          end_date: string | null
          show_ranking: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          fator_correcao?: number | null
          id?: string
          is_active?: boolean | null
          title: string
          total_questions?: number
          updated_at?: string
          allow_retake?: boolean
          start_date?: string | null
          end_date?: string | null
          show_ranking?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          fator_correcao?: number | null
          id?: string
          is_active?: boolean | null
          title?: string
          total_questions?: number
          updated_at?: string
          allow_retake?: boolean
          start_date?: string | null
          end_date?: string | null
          show_ranking?: boolean
        }
        Relationships: []
      }
      simulados_questoes: {
        Row: {
          created_at: string
          id: string
          order_position: number
          question_id: string
          simulado_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_position: number
          question_id: string
          simulado_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_position?: number
          question_id?: string
          simulado_id?: string
        }
        Relationships: []
      }
      simulado_attempts: {
        Row: {
          id: string
          user_id: string
          simulado_id: string
          started_at: string
          completed_at: string | null
          time_spent_seconds: number | null
          total_questions: number
          correct_answers: number
          incorrect_answers: number
          blank_answers: number
          final_score: number | null
          percentage: number | null
          penalty_applied: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          simulado_id: string
          started_at?: string
          completed_at?: string | null
          time_spent_seconds?: number | null
          total_questions: number
          correct_answers?: number
          incorrect_answers?: number
          blank_answers?: number
          final_score?: number | null
          percentage?: number | null
          penalty_applied?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          simulado_id?: string
          started_at?: string
          completed_at?: string | null
          time_spent_seconds?: number | null
          total_questions?: number
          correct_answers?: number
          incorrect_answers?: number
          blank_answers?: number
          final_score?: number | null
          percentage?: number | null
          penalty_applied?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      simulado_answers: {
        Row: {
          id: string
          attempt_id: string
          question_id: string
          user_answer: string | null
          correct_answer: string
          is_correct: boolean
          question_order: number
          answered_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          attempt_id: string
          question_id: string
          user_answer?: string | null
          correct_answer: string
          is_correct?: boolean
          question_order: number
          answered_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          attempt_id?: string
          question_id?: string
          user_answer?: string | null
          correct_answer?: string
          is_correct?: boolean
          question_order?: number
          answered_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const