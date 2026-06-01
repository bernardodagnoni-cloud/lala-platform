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
  skills: string | null;
  company_name: string | null;
  company_description: string | null;
  website: string | null;
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
  skills?: string | null;
  company_name?: string | null;
  company_description?: string | null;
  website?: string | null;
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
  is_active?: boolean;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
