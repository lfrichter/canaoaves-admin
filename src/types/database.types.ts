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
      amenities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string | null
          type: Database["public"]["Enums"]["profile_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug?: string | null
          type: Database["public"]["Enums"]["profile_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string | null
          type?: Database["public"]["Enums"]["profile_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      category_amenities: {
        Row: {
          amenity_id: string
          category_id: string
        }
        Insert: {
          amenity_id: string
          category_id: string
        }
        Update: {
          amenity_id?: string
          category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_amenities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      category_service_offerings: {
        Row: {
          category_id: string
          service_offering_id: string
        }
        Insert: {
          category_id: string
          service_offering_id: string
        }
        Update: {
          category_id?: string
          service_offering_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_service_offering"
            columns: ["service_offering_id"]
            isOneToOne: false
            referencedRelation: "service_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country: string
          created_at: string
          id: string
          is_locally_added: boolean | null
          name: string
          slug: string | null
          state: string
        }
        Insert: {
          country?: string
          created_at?: string
          id?: string
          is_locally_added?: boolean | null
          name: string
          slug?: string | null
          state: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          is_locally_added?: boolean | null
          name?: string
          slug?: string | null
          state?: string
        }
        Relationships: []
      }
      city_descriptions: {
        Row: {
          approved: boolean
          approved_at: string | null
          approved_by_user_id: string | null
          city_id: string | null
          created_at: string
          description: string
          id: string
          submitted_by_user_id: string
          updated_at: string
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          approved_by_user_id?: string | null
          city_id?: string | null
          created_at?: string
          description: string
          id?: string
          submitted_by_user_id: string
          updated_at?: string
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          approved_by_user_id?: string | null
          city_id?: string | null
          created_at?: string
          description?: string
          id?: string
          submitted_by_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_descriptions_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_descriptions_submitted_by_user_id_fkey"
            columns: ["submitted_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "city_descriptions_submitted_by_user_id_fkey"
            columns: ["submitted_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["user_id"]
          },
        ]
      }
      city_images: {
        Row: {
          approved: boolean
          approved_at: string | null
          approved_by_user_id: string | null
          city_id: string | null
          created_at: string
          id: string
          image_url: string
          submitted_by_user_id: string
          updated_at: string
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          approved_by_user_id?: string | null
          city_id?: string | null
          created_at?: string
          id?: string
          image_url: string
          submitted_by_user_id: string
          updated_at?: string
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          approved_by_user_id?: string | null
          city_id?: string | null
          created_at?: string
          id?: string
          image_url?: string
          submitted_by_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_images_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_images_submitted_by_user_id_fkey"
            columns: ["submitted_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "city_images_submitted_by_user_id_fkey"
            columns: ["submitted_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["user_id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes: number | null
          parent_id: string | null
          target_id: string
          target_type: Database["public"]["Enums"]["comment_target_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes?: number | null
          parent_id?: string | null
          target_id: string
          target_type: Database["public"]["Enums"]["comment_target_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes?: number | null
          parent_id?: string | null
          target_id?: string
          target_type?: Database["public"]["Enums"]["comment_target_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "service_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["user_id"]
          },
        ]
      }
      gamification_rules: {
        Row: {
          action_key: string
          description: string | null
          is_active: boolean
          points: number
        }
        Insert: {
          action_key: string
          description?: string | null
          is_active?: boolean
          points: number
        }
        Update: {
          action_key?: string
          description?: string | null
          is_active?: boolean
          points?: number
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          target_id: string
          target_type: Database["public"]["Enums"]["like_target_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          target_id: string
          target_type: Database["public"]["Enums"]["like_target_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["like_target_type"]
          user_id?: string
        }
        Relationships: []
      }
      location_stats: {
        Row: {
          city_id: string | null
          community_composition: Json | null
          country_code: string | null
          id: number
          level: string
          profile_counts_by_category: Json | null
          service_counts_by_category: Json | null
          state_code: string | null
          total_city_descriptions: number | null
          total_profiles: number | null
          total_services: number | null
          total_state_descriptions: number | null
          updated_at: string
        }
        Insert: {
          city_id?: string | null
          community_composition?: Json | null
          country_code?: string | null
          id?: number
          level: string
          profile_counts_by_category?: Json | null
          service_counts_by_category?: Json | null
          state_code?: string | null
          total_city_descriptions?: number | null
          total_profiles?: number | null
          total_services?: number | null
          total_state_descriptions?: number | null
          updated_at?: string
        }
        Update: {
          city_id?: string | null
          community_composition?: Json | null
          country_code?: string | null
          id?: number
          level?: string
          profile_counts_by_category?: Json | null
          service_counts_by_category?: Json | null
          state_code?: string | null
          total_city_descriptions?: number | null
          total_profiles?: number | null
          total_services?: number | null
          total_state_descriptions?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          is_owner_photo: boolean | null
          likes: number | null
          target_id: string
          target_type: Database["public"]["Enums"]["photo_target_type"]
          uploaded_by_user_id: string | null
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          is_owner_photo?: boolean | null
          likes?: number | null
          target_id: string
          target_type: Database["public"]["Enums"]["photo_target_type"]
          uploaded_by_user_id?: string | null
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          is_owner_photo?: boolean | null
          likes?: number | null
          target_id?: string
          target_type?: Database["public"]["Enums"]["photo_target_type"]
          uploaded_by_user_id?: string | null
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          app_role: string
          avatar_url: string | null
          category_id: string | null
          city_id: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          document: string | null
          full_name: string | null
          gender_details: Json | null
          id: string
          is_guide: boolean | null
          life_list_url: string | null
          location_details: Json | null
          phone: string | null
          profile_type: Database["public"]["Enums"]["profile_type"] | null
          public_name: string | null
          registration_number: number
          score: number
          show_full_name: boolean
          slug: string | null
          start_date: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          app_role?: string
          avatar_url?: string | null
          category_id?: string | null
          city_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          document?: string | null
          full_name?: string | null
          gender_details?: Json | null
          id?: string
          is_guide?: boolean | null
          life_list_url?: string | null
          location_details?: Json | null
          phone?: string | null
          profile_type?: Database["public"]["Enums"]["profile_type"] | null
          public_name?: string | null
          registration_number?: number
          score?: number
          show_full_name?: boolean
          slug?: string | null
          start_date?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          app_role?: string
          avatar_url?: string | null
          category_id?: string | null
          city_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          document?: string | null
          full_name?: string | null
          gender_details?: Json | null
          id?: string
          is_guide?: boolean | null
          life_list_url?: string | null
          location_details?: Json | null
          phone?: string | null
          profile_type?: Database["public"]["Enums"]["profile_type"] | null
          public_name?: string | null
          registration_number?: number
          score?: number
          show_full_name?: boolean
          slug?: string | null
          start_date?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_city"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          description: string
          id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          resolved_at: string | null
          resolver_id: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target_type"]
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          resolved_at?: string | null
          resolver_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target_type"]
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
          resolved_at?: string | null
          resolver_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["report_target_type"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_resolver_id_fkey"
            columns: ["resolver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_resolver_id_fkey"
            columns: ["resolver_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["user_id"]
          },
        ]
      }
      service_confirmations: {
        Row: {
          created_at: string
          id: string
          service_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          service_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          service_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_confirmations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string | null
          id: string
          location: string | null
          service_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          service_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          service_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_events_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_offerings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      service_ownership_claims: {
        Row: {
          claimant_email: string
          claimant_name: string
          claimant_phone: string
          claimant_role: string
          claimant_user_id: string
          created_at: string
          document_url: string
          id: string
          message: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by_user_id: string | null
          service_id: string
          status: Database["public"]["Enums"]["claim_status"]
          updated_at: string
        }
        Insert: {
          claimant_email: string
          claimant_name: string
          claimant_phone: string
          claimant_role: string
          claimant_user_id: string
          created_at?: string
          document_url: string
          id?: string
          message?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          service_id: string
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
        }
        Update: {
          claimant_email?: string
          claimant_name?: string
          claimant_phone?: string
          claimant_role?: string
          claimant_user_id?: string
          created_at?: string
          document_url?: string
          id?: string
          message?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          service_id?: string
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_ownership_claims_claimant_user_id_fkey"
            columns: ["claimant_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "service_ownership_claims_claimant_user_id_fkey"
            columns: ["claimant_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "service_ownership_claims_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          service_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          service_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_projects_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_team_members: {
        Row: {
          canaoaves_profile_url: string | null
          created_at: string
          id: string
          name: string
          photo_url: string | null
          role: string | null
          service_id: string
        }
        Insert: {
          canaoaves_profile_url?: string | null
          created_at?: string
          id?: string
          name: string
          photo_url?: string | null
          role?: string | null
          service_id: string
        }
        Update: {
          canaoaves_profile_url?: string | null
          created_at?: string
          id?: string
          name?: string
          photo_url?: string | null
          role?: string | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_team_members_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_to_amenities: {
        Row: {
          amenity_id: string
          service_id: string
        }
        Insert: {
          amenity_id: string
          service_id: string
        }
        Update: {
          amenity_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_to_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_to_amenities_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_to_service_offerings: {
        Row: {
          offering_id: string
          service_id: string
        }
        Insert: {
          offering_id: string
          service_id: string
        }
        Update: {
          offering_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_to_service_offerings_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "service_offerings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_to_service_offerings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          areas_of_operation: string[] | null
          category_id: string | null
          city_id: string | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          email: string | null
          featured_photo_url: string | null
          id: string
          is_authenticated: boolean | null
          mission: string | null
          name: string
          owner_user_id: string | null
          phone: string | null
          slug: string | null
          status: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          areas_of_operation?: string[] | null
          category_id?: string | null
          city_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          email?: string | null
          featured_photo_url?: string | null
          id?: string
          is_authenticated?: boolean | null
          mission?: string | null
          name: string
          owner_user_id?: string | null
          phone?: string | null
          slug?: string | null
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          areas_of_operation?: string[] | null
          category_id?: string | null
          city_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          email?: string | null
          featured_photo_url?: string | null
          id?: string
          is_authenticated?: boolean | null
          mission?: string | null
          name?: string
          owner_user_id?: string | null
          phone?: string | null
          slug?: string | null
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_city"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      state_descriptions: {
        Row: {
          approved: boolean
          approved_at: string | null
          approved_by_user_id: string | null
          country_code: string
          created_at: string
          description: string
          id: string
          state_code: string
          submitted_by_user_id: string
          updated_at: string
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          approved_by_user_id?: string | null
          country_code?: string
          created_at?: string
          description: string
          id?: string
          state_code: string
          submitted_by_user_id: string
          updated_at?: string
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          approved_by_user_id?: string | null
          country_code?: string
          created_at?: string
          description?: string
          id?: string
          state_code?: string
          submitted_by_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "state_descriptions_submitted_by_user_id_fkey"
            columns: ["submitted_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "state_descriptions_submitted_by_user_id_fkey"
            columns: ["submitted_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["user_id"]
          },
        ]
      }
      statuses: {
        Row: {
          id: number
          name: string
          start_score: number
        }
        Insert: {
          id?: number
          name: string
          start_score: number
        }
        Update: {
          id?: number
          name?: string
          start_score?: number
        }
        Relationships: []
      }
    }
    Views: {
      profiles_with_email: {
        Row: {
          avatar_url: string | null
          category_id: string | null
          city: string | null
          city_id: string | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          document: string | null
          full_name: string | null
          id: string | null
          is_guide: boolean | null
          life_list_url: string | null
          phone: string | null
          profile_type: Database["public"]["Enums"]["profile_type"] | null
          public_name: string | null
          registration_number: number | null
          score: number | null
          start_date: string | null
          state: string | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_city"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_service_with_normalized_data: {
        Args: {
          p_amenities_ids: string[]
          p_category_id: string
          p_city_id: string
          p_created_by_user_id: string
          p_description: string
          p_email: string
          p_name: string
          p_phone: string
          p_services_offered_ids: string[]
          p_website_url: string
        }
        Returns: string
      }
      delete_all_users: { Args: never; Returns: undefined }
      delete_user_account: { Args: never; Returns: undefined }
      email_exists: { Args: { user_email: string }; Returns: boolean }
      f_unaccent: { Args: { "": string }; Returns: string }
      get_admin_dashboard_stats: { Args: never; Returns: Json }
      get_categories_with_counts: {
        Args: { p_type: string }
        Returns: {
          icon: string
          id: string
          item_count: number
          name: string
          parent_id: string
          slug: string
        }[]
      }
      get_cities_with_content_by_state: {
        Args: { p_state_code: string }
        Returns: {
          id: string
          name: string
          slug: string
          state: string
        }[]
      }
      get_city_page_data:
        | { Args: { p_city_slug: string }; Returns: Json }
        | { Args: { p_city_name: string; p_state_code: string }; Returns: Json }
      get_confirmations_counts: {
        Args: { p_service_ids: string[] }
        Returns: Database["public"]["CompositeTypes"]["confirmation_count"][]
        SetofOptions: {
          from: "*"
          to: "confirmation_count"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_distinct_cities: {
        Args: { p_search_type: string; p_selected_state: string }
        Returns: {
          city: string
        }[]
      }
      get_distinct_locations: {
        Args: never
        Returns: {
          city: string
          state: string
        }[]
      }
      get_distinct_states: {
        Args: { search_type: string }
        Returns: {
          state: string
        }[]
      }
      get_distinct_states_by_type: {
        Args: { search_type: string }
        Returns: {
          state: string
        }[]
      }
      get_likes_count: {
        Args: {
          p_target_id: string
          p_target_type: Database["public"]["Enums"]["like_target_type"]
        }
        Returns: number
      }
      get_likes_counts: {
        Args: {
          p_target_ids: string[]
          p_target_type: Database["public"]["Enums"]["like_target_type"]
        }
        Returns: {
          likes_count: number
          target_id: string
        }[]
      }
      get_locally_added_cities_by_state: {
        Args: { p_state_code: string }
        Returns: {
          id: string
          is_locally_added: boolean
          name: string
          slug: string
          state: string
        }[]
      }
      get_or_create_city: {
        Args: { city_name: string; country_code?: string; state_code: string }
        Returns: string
      }
      get_pending_city_descriptions: {
        Args: { p_current_page: number; p_page_size: number }
        Returns: {
          approved: boolean
          city_name: string
          city_state: string
          created_at: string
          description: string
          id: string
          profile_avatar_url: string
          profile_category_name: string
          profile_full_name: string
          profile_phone: string
          profile_public_name: string
          profile_score: number
          total_count: number
          user_email: string
        }[]
      }
      get_pending_city_images: {
        Args: { p_current_page: number; p_page_size: number }
        Returns: {
          approved: boolean
          city_name: string
          city_state: string
          created_at: string
          id: string
          image_url: string
          profile_avatar_url: string
          profile_category_name: string
          profile_full_name: string
          profile_phone: string
          profile_public_name: string
          profile_score: number
          total_count: number
          user_email: string
        }[]
      }
      get_pending_reports_with_details: {
        Args: { p_current_page: number; p_page_size: number }
        Returns: {
          created_at: string
          description: string
          id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_avatar_url: string
          reporter_category_name: string
          reporter_email: string
          reporter_full_name: string
          reporter_id: string
          reporter_phone: string
          reporter_public_name: string
          reporter_score: number
          resolved_at: string
          resolver_id: string
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_slug: string
          target_type: Database["public"]["Enums"]["report_target_type"]
          total_count: number
        }[]
      }
      get_pending_state_descriptions: {
        Args: { p_current_page: number; p_page_size: number }
        Returns: {
          approved: boolean
          created_at: string
          description: string
          id: string
          profile_avatar_url: string
          profile_category_name: string
          profile_full_name: string
          profile_phone: string
          profile_public_name: string
          profile_score: number
          state_code: string
          total_count: number
          user_email: string
        }[]
      }
      get_profile_by_id: { Args: { p_id: string }; Returns: Json }
      get_profile_by_slug: {
        Args: { p_slug: string }
        Returns: {
          avatar_url: string
          category_id: string
          city_name: string
          country: string
          created_at: string
          description: string
          document: string
          full_name: string
          id: string
          is_guide: boolean
          life_list_url: string
          location_details: Json
          phone: string
          profile_type: string
          public_name: string
          registration_number: number
          score: number
          show_full_name: boolean
          start_date: string
          state_name: string
          updated_at: string
          user_id: string
          website_url: string
        }[]
      }
      get_profile_with_details: {
        Args: { p_id: string }
        Returns: {
          avatar_url: string
          category_id: string
          city_name: string
          country: string
          created_at: string
          description: string
          document: string
          full_name: string
          id: string
          is_guide: boolean
          life_list_url: string
          phone: string
          profile_type: string
          public_name: string
          registration_number: number
          score: number
          show_full_name: boolean
          start_date: string
          state_name: string
          updated_at: string
          user_id: string
          website_url: string
        }[]
      }
      get_profiles_with_users: {
        Args: { p_current_page: number; p_page_size: number }
        Returns: {
          app_role: string
          email: string
          full_name: string
          id: string
          total_count: number
        }[]
      }
      get_service_by_slug: {
        Args: { service_slug_input: string }
        Returns: Json
      }
      get_service_with_details: {
        Args: { service_id_input: string }
        Returns: Json
      }
      get_statistics_by_location: {
        Args: { p_city_slug?: string; p_level: string; p_state?: string }
        Returns: Json
      }
      get_user_activity_counts: {
        Args: { p_profile_id: string }
        Returns: {
          confirmations_made: number
          indications_made: number
          likes_received: number
        }[]
      }
      get_user_id_by_email: { Args: { p_email: string }; Returns: string }
      increment_user_score: {
        Args: { p_points_to_add: number; p_user_id: string }
        Returns: undefined
      }
      reactivate_user_account: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      search_cities_with_previews:
        | {
            Args: { p_page_num: number; p_search_term: string }
            Returns: {
              city_id: string
              city_name: string
              city_slug: string
              profiles_preview: Json
              services_preview: Json
              state_name: string
              total_count: number
              total_profiles: number
              total_services: number
            }[]
          }
        | {
            Args: { p_search_term: string }
            Returns: {
              city_id: string
              city_name: string
              city_slug: string
              profiles_preview: Json
              services_preview: Json
              state_name: string
              total_profiles: number
              total_services: number
            }[]
          }
        | {
            Args: {
              p_page_num: number
              p_search_term: string
              p_sort_by: string
            }
            Returns: {
              city_id: string
              city_name: string
              city_slug: string
              profiles_preview: Json
              services_preview: Json
              state_name: string
              total_count: number
              total_profiles: number
              total_services: number
            }[]
          }
      search_profiles:
        | {
            Args: {
              p_category_ids: string[]
              p_city: string
              p_page_num: number
              p_search_term: string
              p_sort_by: string
              p_state: string
            }
            Returns: {
              avatar_url: string
              category_id: string
              category_name: string
              city_name: string
              full_name: string
              id: string
              is_guide: boolean
              location_details: Json
              public_name: string
              score: number
              show_full_name: boolean
              slug: string
              state_name: string
              total_count: number
            }[]
          }
        | {
            Args: {
              p_category_ids: string[]
              p_city: string
              p_is_guide?: boolean
              p_page_num: number
              p_search_term: string
              p_sort_by: string
              p_state: string
            }
            Returns: {
              avatar_url: string
              category_id: string
              category_name: string
              city_name: string
              full_name: string
              id: string
              is_guide: boolean
              location_details: Json
              public_name: string
              score: number
              show_full_name: boolean
              slug: string
              state_name: string
              total_count: number
            }[]
          }
      search_services: {
        Args: {
          p_category_ids: string[]
          p_city: string
          p_page_num: number
          p_search_term: string
          p_sort_by: string
          p_state: string
        }
        Returns: {
          category_id: string
          category_name: string
          city_name: string
          featured_photo_url: string
          id: string
          is_authenticated: boolean
          name: string
          slug: string
          state_name: string
          total_confirmations: number
          total_count: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      slugify: { Args: { value: string }; Returns: string }
      soft_delete_current_user: { Args: never; Returns: undefined }
      unaccent: { Args: { "": string }; Returns: string }
      update_location_stats: { Args: never; Returns: undefined }
      update_service_with_normalized_data:
        | {
            Args: {
              p_amenities_ids: string[]
              p_category_id: string
              p_city_id: string
              p_description: string
              p_email: string
              p_mission: string
              p_name: string
              p_phone: string
              p_service_id: string
              p_services_offered_ids: string[]
              p_status: string
              p_website_url: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_amenities_ids: string[]
              p_areas_of_operation: string[]
              p_category_id: string
              p_city_id: string
              p_description: string
              p_email: string
              p_mission: string
              p_name: string
              p_phone: string
              p_service_id: string
              p_services_offered_ids: string[]
              p_status: string
              p_website_url: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_amenities_ids: string[]
              p_category_id: string
              p_city_id: string
              p_description: string
              p_email: string
              p_name: string
              p_phone: string
              p_service_id: string
              p_services_offered_ids: string[]
              p_website_url: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_amenities_ids: string[]
              p_category_id: string
              p_city_id: string
              p_description: string
              p_email: string
              p_name: string
              p_phone: string
              p_service_id: string
              p_services_offered_ids: string[]
              p_status: string
              p_website_url: string
            }
            Returns: undefined
          }
    }
    Enums: {
      claim_status: "pending" | "approved" | "rejected"
      comment_target_type: "profile" | "service"
      like_target_type: "profile" | "service" | "city" | "comment"
      photo_target_type: "profile" | "service" | "city"
      profile_type: "pessoa" | "empresa"
      report_reason:
        | "incorrect_information"
        | "inappropriate_content"
        | "spam"
        | "fraud"
        | "other"
      report_status: "pending" | "resolved" | "dismissed"
      report_target_type: "profile" | "service" | "comment" | "photo"
    }
    CompositeTypes: {
      confirmation_count: {
        service_id: string | null
        count: number | null
      }
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
      claim_status: ["pending", "approved", "rejected"],
      comment_target_type: ["profile", "service"],
      like_target_type: ["profile", "service", "city", "comment"],
      photo_target_type: ["profile", "service", "city"],
      profile_type: ["pessoa", "empresa"],
      report_reason: [
        "incorrect_information",
        "inappropriate_content",
        "spam",
        "fraud",
        "other",
      ],
      report_status: ["pending", "resolved", "dismissed"],
      report_target_type: ["profile", "service", "comment", "photo"],
    },
  },
} as const

