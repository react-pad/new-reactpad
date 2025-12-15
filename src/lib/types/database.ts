export type PresaleStatus = 'pending' | 'live' | 'ongoing' | 'ended' | 'cancelled';
export type LaunchpadPresaleStatus = 'pending' | 'live' | 'ended' | 'cancelled';

export interface Presale {
  id: string;

  // Token Information
  token_address: string;
  token_name: string;
  token_symbol: string;
  token_decimals: number;
  token_logo_url?: string;

  // Presale Details
  presale_address: string;
  total_supply: string;
  presale_amount: string;
  soft_cap?: string;
  hard_cap?: string;
  min_contribution?: string;
  max_contribution?: string;
  price_per_token?: string;

  // Time Details
  start_time: string;
  end_time: string;

  // Status
  status: PresaleStatus;

  // Developer/Owner Information
  owner_address: string;
  owner_email?: string;
  owner_telegram?: string;
  owner_twitter?: string;
  owner_website?: string;

  // Project Description
  project_description?: string;
  whitepaper_url?: string;

  // Fundraising Progress
  total_raised: string;
  total_contributors: number;

  // Admin Controls
  is_approved: boolean;
  is_featured: boolean;
  is_verified: boolean;
  admin_notes?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface PresaleInsert {
  // Token Information
  token_address: string;
  token_name: string;
  token_symbol: string;
  token_decimals?: number;
  token_logo_url?: string;

  // Presale Details
  presale_address: string;
  total_supply: string;
  presale_amount: string;
  soft_cap?: string;
  hard_cap?: string;
  min_contribution?: string;
  max_contribution?: string;
  price_per_token?: string;

  // Time Details
  start_time: string;
  end_time: string;

  // Developer/Owner Information
  owner_address: string;
  owner_email?: string;
  owner_telegram?: string;
  owner_twitter?: string;
  owner_website?: string;

  // Project Description
  project_description?: string;
  whitepaper_url?: string;
}

export interface PresaleUpdate {
  // Token Information
  token_name?: string;
  token_symbol?: string;
  token_logo_url?: string;

  // Presale Details
  soft_cap?: string;
  hard_cap?: string;
  min_contribution?: string;
  max_contribution?: string;
  price_per_token?: string;

  // Time Details
  start_time?: string;
  end_time?: string;

  // Status
  status?: PresaleStatus;

  // Developer/Owner Information
  owner_email?: string;
  owner_telegram?: string;
  owner_twitter?: string;
  owner_website?: string;

  // Project Description
  project_description?: string;
  whitepaper_url?: string;

  // Fundraising Progress
  total_raised?: string;
  total_contributors?: number;

  // Admin Controls
  is_approved?: boolean;
  is_featured?: boolean;
  is_verified?: boolean;
  admin_notes?: string;
  approved_at?: string;
  approved_by?: string;
}

// Launchpad Presale Types
export interface LaunchpadPresale {
  id: string;
  presale_address: string;
  sale_token_address: string;
  payment_token_address?: string;
  token_name: string;
  token_symbol: string;
  token_decimals: number;
  token_logo_url?: string;
  rate: string;
  soft_cap: string;
  hard_cap: string;
  min_contribution: string;
  max_contribution: string;
  start_time: string;
  end_time: string;
  owner_address: string;
  total_raised: string;
  tokens_sold: string;
  total_contributors: number;
  project_name?: string;
  project_description?: string;
  project_website?: string;
  project_twitter?: string;
  project_telegram?: string;
  project_discord?: string;
  whitepaper_url?: string;
  status: LaunchpadPresaleStatus;
  is_verified: boolean;
  is_featured: boolean;
  creation_tx_hash: string;
  block_number?: number;
  created_at: string;
  updated_at: string;
}

export interface LaunchpadPresaleInsert {
  presale_address: string;
  sale_token_address: string;
  payment_token_address?: string;
  token_name: string;
  token_symbol: string;
  token_decimals: number;
  token_logo_url?: string;
  rate: string;
  soft_cap: string;
  hard_cap: string;
  min_contribution: string;
  max_contribution: string;
  start_time: string;
  end_time: string;
  owner_address: string;
  project_name?: string;
  project_description?: string;
  project_website?: string;
  project_twitter?: string;
  project_telegram?: string;
  project_discord?: string;
  whitepaper_url?: string;
  creation_tx_hash: string;
  block_number?: number;
}

export interface LaunchpadPresaleUpdate {
  token_logo_url?: string;
  total_raised?: string;
  tokens_sold?: string;
  total_contributors?: number;
  project_name?: string;
  project_description?: string;
  project_website?: string;
  project_twitter?: string;
  project_telegram?: string;
  project_discord?: string;
  whitepaper_url?: string;
  status?: LaunchpadPresaleStatus;
  is_verified?: boolean;
  is_featured?: boolean;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      presales: {
        Row: Presale;
        Insert: PresaleInsert;
        Update: PresaleUpdate;
      };
      launchpad_presales: {
        Row: LaunchpadPresale;
        Insert: LaunchpadPresaleInsert;
        Update: LaunchpadPresaleUpdate;
      };
    };
    Views: {
      public_presales: {
        Row: Omit<Presale, 'admin_notes' | 'owner_email'>;
      };
      active_presales: {
        Row: Omit<LaunchpadPresale, 'block_number' | 'creation_tx_hash'>;
      };
    };
    Functions: Record<string, never>;
    Enums: {
      presale_status: PresaleStatus;
      launchpad_presale_status: LaunchpadPresaleStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
