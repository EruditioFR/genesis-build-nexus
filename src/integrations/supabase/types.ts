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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      capsule_categories: {
        Row: {
          capsule_id: string
          category_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
        }
        Insert: {
          capsule_id: string
          category_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
        }
        Update: {
          capsule_id?: string
          category_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "capsule_categories_capsule_id_fkey"
            columns: ["capsule_id"]
            isOneToOne: false
            referencedRelation: "capsules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capsule_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      capsule_medias: {
        Row: {
          capsule_id: string
          caption: string | null
          created_at: string
          file_name: string | null
          file_size_bytes: number | null
          file_type: string
          file_url: string
          id: string
          position: number | null
        }
        Insert: {
          capsule_id: string
          caption?: string | null
          created_at?: string
          file_name?: string | null
          file_size_bytes?: number | null
          file_type: string
          file_url: string
          id?: string
          position?: number | null
        }
        Update: {
          capsule_id?: string
          caption?: string | null
          created_at?: string
          file_name?: string | null
          file_size_bytes?: number | null
          file_type?: string
          file_url?: string
          id?: string
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "capsule_medias_capsule_id_fkey"
            columns: ["capsule_id"]
            isOneToOne: false
            referencedRelation: "capsules"
            referencedColumns: ["id"]
          },
        ]
      }
      capsule_person_links: {
        Row: {
          capsule_id: string
          created_at: string
          id: string
          person_id: string
        }
        Insert: {
          capsule_id: string
          created_at?: string
          id?: string
          person_id: string
        }
        Update: {
          capsule_id?: string
          created_at?: string
          id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "capsule_person_links_capsule_id_fkey"
            columns: ["capsule_id"]
            isOneToOne: false
            referencedRelation: "capsules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capsule_person_links_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "family_persons"
            referencedColumns: ["id"]
          },
        ]
      }
      capsule_shares: {
        Row: {
          capsule_id: string
          circle_id: string
          id: string
          shared_at: string
          shared_by: string
        }
        Insert: {
          capsule_id: string
          circle_id: string
          id?: string
          shared_at?: string
          shared_by: string
        }
        Update: {
          capsule_id?: string
          circle_id?: string
          id?: string
          shared_at?: string
          shared_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "capsule_shares_capsule_id_fkey"
            columns: ["capsule_id"]
            isOneToOne: false
            referencedRelation: "capsules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capsule_shares_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      capsule_sub_categories: {
        Row: {
          capsule_id: string
          created_at: string | null
          id: string
          sub_category_id: string
        }
        Insert: {
          capsule_id: string
          created_at?: string | null
          id?: string
          sub_category_id: string
        }
        Update: {
          capsule_id?: string
          created_at?: string | null
          id?: string
          sub_category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "capsule_sub_categories_capsule_id_fkey"
            columns: ["capsule_id"]
            isOneToOne: false
            referencedRelation: "capsules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capsule_sub_categories_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "sub_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      capsules: {
        Row: {
          capsule_type: Database["public"]["Enums"]["capsule_type"]
          content: string | null
          created_at: string
          description: string | null
          id: string
          memory_date: string | null
          metadata: Json | null
          published_at: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["capsule_status"]
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capsule_type?: Database["public"]["Enums"]["capsule_type"]
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          memory_date?: string | null
          metadata?: Json | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["capsule_status"]
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capsule_type?: Database["public"]["Enums"]["capsule_type"]
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          memory_date?: string | null
          metadata?: Json | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["capsule_status"]
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string | null
          description_long: string | null
          description_short: string
          icon: string
          id: string
          is_active: boolean | null
          is_standard: boolean | null
          name_fr: string
          order_index: number
          slug: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          description_long?: string | null
          description_short: string
          icon: string
          id?: string
          is_active?: boolean | null
          is_standard?: boolean | null
          name_fr: string
          order_index: number
          slug: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          description_long?: string | null
          description_short?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          is_standard?: boolean | null
          name_fr?: string
          order_index?: number
          slug?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      circle_members: {
        Row: {
          accepted_at: string | null
          circle_id: string
          email: string | null
          id: string
          invitation_expires_at: string | null
          invitation_token: string | null
          invited_at: string
          name: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          circle_id: string
          email?: string | null
          id?: string
          invitation_expires_at?: string | null
          invitation_token?: string | null
          invited_at?: string
          name?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          circle_id?: string
          email?: string | null
          id?: string
          invitation_expires_at?: string | null
          invitation_token?: string | null
          invited_at?: string
          name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circles: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          capsule_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capsule_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capsule_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_capsule_id_fkey"
            columns: ["capsule_id"]
            isOneToOne: false
            referencedRelation: "capsules"
            referencedColumns: ["id"]
          },
        ]
      }
      family_parent_child: {
        Row: {
          birth_order: number | null
          child_id: string
          created_at: string
          id: string
          parent_id: string
          relationship_type: string | null
          union_id: string | null
        }
        Insert: {
          birth_order?: number | null
          child_id: string
          created_at?: string
          id?: string
          parent_id: string
          relationship_type?: string | null
          union_id?: string | null
        }
        Update: {
          birth_order?: number | null
          child_id?: string
          created_at?: string
          id?: string
          parent_id?: string
          relationship_type?: string | null
          union_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_parent_child_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "family_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_parent_child_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "family_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_parent_child_union_id_fkey"
            columns: ["union_id"]
            isOneToOne: false
            referencedRelation: "family_unions"
            referencedColumns: ["id"]
          },
        ]
      }
      family_person_media: {
        Row: {
          caption: string | null
          created_at: string
          date_taken: string | null
          display_order: number | null
          file_size_bytes: number | null
          file_url: string
          id: string
          is_profile_photo: boolean | null
          media_type: string | null
          person_id: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          date_taken?: string | null
          display_order?: number | null
          file_size_bytes?: number | null
          file_url: string
          id?: string
          is_profile_photo?: boolean | null
          media_type?: string | null
          person_id: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          date_taken?: string | null
          display_order?: number | null
          file_size_bytes?: number | null
          file_url?: string
          id?: string
          is_profile_photo?: boolean | null
          media_type?: string | null
          person_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_person_media_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "family_persons"
            referencedColumns: ["id"]
          },
        ]
      }
      family_persons: {
        Row: {
          biography: string | null
          birth_date: string | null
          birth_date_precision: string | null
          birth_place: string | null
          birth_place_lat: number | null
          birth_place_lng: number | null
          burial_date: string | null
          burial_place: string | null
          created_at: string
          created_by: string | null
          death_date: string | null
          death_date_precision: string | null
          death_place: string | null
          death_place_lat: number | null
          death_place_lng: number | null
          first_names: string
          gender: string | null
          id: string
          is_alive: boolean | null
          last_name: string
          maiden_name: string | null
          nationality: string | null
          occupation: string | null
          privacy_level: string | null
          profile_photo_url: string | null
          residences: Json | null
          tree_id: string
          updated_at: string
        }
        Insert: {
          biography?: string | null
          birth_date?: string | null
          birth_date_precision?: string | null
          birth_place?: string | null
          birth_place_lat?: number | null
          birth_place_lng?: number | null
          burial_date?: string | null
          burial_place?: string | null
          created_at?: string
          created_by?: string | null
          death_date?: string | null
          death_date_precision?: string | null
          death_place?: string | null
          death_place_lat?: number | null
          death_place_lng?: number | null
          first_names: string
          gender?: string | null
          id?: string
          is_alive?: boolean | null
          last_name: string
          maiden_name?: string | null
          nationality?: string | null
          occupation?: string | null
          privacy_level?: string | null
          profile_photo_url?: string | null
          residences?: Json | null
          tree_id: string
          updated_at?: string
        }
        Update: {
          biography?: string | null
          birth_date?: string | null
          birth_date_precision?: string | null
          birth_place?: string | null
          birth_place_lat?: number | null
          birth_place_lng?: number | null
          burial_date?: string | null
          burial_place?: string | null
          created_at?: string
          created_by?: string | null
          death_date?: string | null
          death_date_precision?: string | null
          death_place?: string | null
          death_place_lat?: number | null
          death_place_lng?: number | null
          first_names?: string
          gender?: string | null
          id?: string
          is_alive?: boolean | null
          last_name?: string
          maiden_name?: string | null
          nationality?: string | null
          occupation?: string | null
          privacy_level?: string | null
          profile_photo_url?: string | null
          residences?: Json | null
          tree_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_persons_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "family_trees"
            referencedColumns: ["id"]
          },
        ]
      }
      family_trees: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          root_person_id: string | null
          settings: Json | null
          updated_at: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          root_person_id?: string | null
          settings?: Json | null
          updated_at?: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          root_person_id?: string | null
          settings?: Json | null
          updated_at?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_root_person"
            columns: ["root_person_id"]
            isOneToOne: false
            referencedRelation: "family_persons"
            referencedColumns: ["id"]
          },
        ]
      }
      family_unions: {
        Row: {
          created_at: string
          end_date: string | null
          end_reason: string | null
          id: string
          is_current: boolean | null
          notes: string | null
          person1_id: string
          person2_id: string
          start_date: string | null
          start_place: string | null
          union_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          end_reason?: string | null
          id?: string
          is_current?: boolean | null
          notes?: string | null
          person1_id: string
          person2_id: string
          start_date?: string | null
          start_place?: string | null
          union_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          end_reason?: string | null
          id?: string
          is_current?: boolean | null
          notes?: string | null
          person1_id?: string
          person2_id?: string
          start_date?: string | null
          start_place?: string | null
          union_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_unions_person1_id_fkey"
            columns: ["person1_id"]
            isOneToOne: false
            referencedRelation: "family_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_unions_person2_id_fkey"
            columns: ["person2_id"]
            isOneToOne: false
            referencedRelation: "family_persons"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          created_at: string
          guardian_email: string
          guardian_name: string | null
          guardian_user_id: string | null
          id: string
          updated_at: string
          user_id: string
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          guardian_email: string
          guardian_name?: string | null
          guardian_user_id?: string | null
          id?: string
          updated_at?: string
          user_id: string
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          guardian_email?: string
          guardian_name?: string | null
          guardian_user_id?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      legacy_capsules: {
        Row: {
          capsule_id: string
          created_at: string
          guardian_id: string | null
          id: string
          notify_recipients: string[] | null
          unlock_date: string | null
          unlock_type: string
          unlocked_at: string | null
          unlocked_by: string | null
          updated_at: string
        }
        Insert: {
          capsule_id: string
          created_at?: string
          guardian_id?: string | null
          id?: string
          notify_recipients?: string[] | null
          unlock_date?: string | null
          unlock_type: string
          unlocked_at?: string | null
          unlocked_by?: string | null
          updated_at?: string
        }
        Update: {
          capsule_id?: string
          created_at?: string
          guardian_id?: string | null
          id?: string
          notify_recipients?: string[] | null
          unlock_date?: string | null
          unlock_type?: string
          unlocked_at?: string | null
          unlocked_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legacy_capsules_capsule_id_fkey"
            columns: ["capsule_id"]
            isOneToOne: true
            referencedRelation: "capsules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legacy_capsules_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          link: string | null
          message: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string
          display_name: string | null
          id: string
          storage_limit_mb: number
          storage_used_mb: number
          subscription_level: Database["public"]["Enums"]["subscription_level"]
          suspended: boolean | null
          suspended_at: string | null
          suspended_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          storage_limit_mb?: number
          storage_used_mb?: number
          subscription_level?: Database["public"]["Enums"]["subscription_level"]
          suspended?: boolean | null
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          storage_limit_mb?: number
          storage_used_mb?: number
          subscription_level?: Database["public"]["Enums"]["subscription_level"]
          suspended?: boolean | null
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sub_categories: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_index: number | null
          slug: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          order_index?: number | null
          slug: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_notification: {
        Args: {
          _data?: Json
          _link?: string
          _message?: string
          _title: string
          _type: string
          _user_id: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_moderator: { Args: { _user_id: string }; Returns: boolean }
      user_can_view_capsule: {
        Args: { _capsule_id: string; _user_id: string }
        Returns: boolean
      }
      user_is_circle_member: {
        Args: { _circle_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      capsule_status: "draft" | "published" | "scheduled" | "archived"
      capsule_type: "text" | "photo" | "video" | "audio" | "mixed"
      subscription_level: "free" | "premium" | "legacy"
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
      app_role: ["admin", "moderator", "user"],
      capsule_status: ["draft", "published", "scheduled", "archived"],
      capsule_type: ["text", "photo", "video", "audio", "mixed"],
      subscription_level: ["free", "premium", "legacy"],
    },
  },
} as const
