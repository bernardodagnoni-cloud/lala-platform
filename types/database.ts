export type UserRole = "laLider" | "company";

export type ProfileRow = {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string;
  location: string | null;
  bio: string | null;
  education: string | null;
  experience: string | null;
  opportunity_type: string | null;
  desired_role: string | null;
  open_to_relocate: string | null;
  life_stage: string | null;
  open_to_opportunities: boolean | null;
  approved: boolean | null;
  registration_notified: boolean | null;
  lala_id: string | null;
  contact_email: string | null;
  skills: string | null;
  company_name: string | null;
  company_description: string | null;
  website: string | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileInsert = {
  user_id: string;
  role: UserRole;
  full_name: string;
  location?: string | null;
  bio?: string | null;
  education?: string | null;
  experience?: string | null;
  opportunity_type?: string | null;
  desired_role?: string | null;
  open_to_relocate?: string | null;
  life_stage?: string | null;
  open_to_opportunities?: boolean | null;
  approved?: boolean | null;
  registration_notified?: boolean | null;
  lala_id?: string | null;
  contact_email?: string | null;
  skills?: string | null;
  company_name?: string | null;
  company_description?: string | null;
  website?: string | null;
  linkedin_url?: string | null;
};

export type ProfileUpdate = Partial<ProfileInsert>;

export type PositionRow = {
  id: string;
  company_profile_id: string;
  title: string;
  description: string;
  requirements: string;
  location: string | null;
  opportunity_type: string;
  work_modality: string | null;
  is_active: boolean;
  created_at: string;
};

export type PositionInsert = {
  company_profile_id: string;
  title: string;
  description: string;
  requirements: string;
  location?: string | null;
  opportunity_type: string;
  work_modality?: string | null;
  is_active?: boolean;
};

export type MatchRow = {
  id: string;
  position_id: string;
  lalider_profile_id: string;
  score: number;
  match_reason: string;
  gaps: string | null;
  created_at: string;
};

export type MatchInsert = {
  position_id: string;
  lalider_profile_id: string;
  score: number;
  match_reason: string;
  gaps?: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      positions: {
        Row: PositionRow;
        Insert: PositionInsert;
        Update: Partial<PositionInsert>;
        Relationships: [];
      };
      matches: {
        Row: MatchRow;
        Insert: MatchInsert;
        Update: Partial<MatchInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
