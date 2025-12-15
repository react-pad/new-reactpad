import { supabase } from '../supabase';
import type { LaunchpadPresale, LaunchpadPresaleInsert, LaunchpadPresaleUpdate } from '../types/database';

export class LaunchpadService {
  /**
   * Create a new launchpad presale
   */
  static async createPresale(presale: LaunchpadPresaleInsert): Promise<LaunchpadPresale> {
    // @ts-ignore - Supabase type inference issue
    const { data, error } = await supabase
      .from('launchpad_presales')
      .insert([{
        ...presale,
        presale_address: presale.presale_address.toLowerCase(),
        sale_token_address: presale.sale_token_address.toLowerCase(),
        payment_token_address: presale.payment_token_address?.toLowerCase(),
        owner_address: presale.owner_address.toLowerCase(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating launchpad presale:', error);
      throw error;
    }

    return data as LaunchpadPresale;
  }

  /**
   * Get all presales
   */
  static async getAllPresales(): Promise<LaunchpadPresale[]> {
    const { data, error } = await supabase
      .from('launchpad_presales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching launchpad presales:', error);
      throw error;
    }

    return data as LaunchpadPresale[];
  }

  /**
   * Get live presales (currently active)
   */
  static async getLivePresales(): Promise<LaunchpadPresale[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('launchpad_presales')
      .select('*')
      .eq('status', 'live')
      .lte('start_time', now)
      .gt('end_time', now)
      .order('is_featured', { ascending: false })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching live presales:', error);
      throw error;
    }

    return data as LaunchpadPresale[];
  }

  /**
   * Get upcoming presales (not started yet)
   */
  static async getUpcomingPresales(): Promise<LaunchpadPresale[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('launchpad_presales')
      .select('*')
      .eq('status', 'pending')
      .gt('start_time', now)
      .order('is_featured', { ascending: false })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming presales:', error);
      throw error;
    }

    return data as LaunchpadPresale[];
  }

  /**
   * Get ended presales
   */
  static async getEndedPresales(): Promise<LaunchpadPresale[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('launchpad_presales')
      .select('*')
      .eq('status', 'ended')
      .lt('end_time', now)
      .order('end_time', { ascending: false });

    if (error) {
      console.error('Error fetching ended presales:', error);
      throw error;
    }

    return data as LaunchpadPresale[];
  }

  /**
   * Get featured presales
   */
  static async getFeaturedPresales(): Promise<LaunchpadPresale[]> {
    const { data, error } = await supabase
      .from('launchpad_presales')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured presales:', error);
      throw error;
    }

    return data as LaunchpadPresale[];
  }

  /**
   * Get presale by ID
   */
  static async getPresaleById(id: string): Promise<LaunchpadPresale> {
    const { data, error } = await supabase
      .from('launchpad_presales')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching presale by ID:', error);
      throw error;
    }

    return data as LaunchpadPresale;
  }

  /**
   * Get presale by presale contract address
   */
  static async getPresaleByAddress(presaleAddress: string): Promise<LaunchpadPresale> {
    const { data, error } = await supabase
      .from('launchpad_presales')
      .select('*')
      .eq('presale_address', presaleAddress.toLowerCase())
      .single();

    if (error) {
      console.error('Error fetching presale by address:', error);
      throw error;
    }

    return data as LaunchpadPresale;
  }

  /**
   * Get presale by token address
   */
  static async getPresaleByTokenAddress(tokenAddress: string): Promise<LaunchpadPresale | null> {
    const { data, error } = await supabase
      .from('launchpad_presales')
      .select('*')
      .eq('sale_token_address', tokenAddress.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('Error fetching presale by token address:', error);
      throw error;
    }

    return data as LaunchpadPresale | null;
  }

  /**
   * Get presales by owner address
   */
  static async getPresalesByOwner(ownerAddress: string): Promise<LaunchpadPresale[]> {
    const { data, error } = await supabase
      .from('launchpad_presales')
      .select('*')
      .eq('owner_address', ownerAddress.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching presales by owner:', error);
      throw error;
    }

    return data as LaunchpadPresale[];
  }

  /**
   * Update presale
   */
  static async updatePresale(
    presaleAddress: string,
    updates: LaunchpadPresaleUpdate
  ): Promise<LaunchpadPresale> {
    // @ts-ignore - Supabase type inference issue
    const { data, error } = await supabase
      .from('launchpad_presales')
      .update(updates)
      .eq('presale_address', presaleAddress.toLowerCase())
      .select()
      .single();

    if (error) {
      console.error('Error updating presale:', error);
      throw error;
    }

    return data as LaunchpadPresale;
  }

  /**
   * Update presale progress (total raised, tokens sold, contributors)
   */
  static async updatePresaleProgress(
    presaleAddress: string,
    totalRaised: string,
    tokensSold: string,
    totalContributors: number
  ): Promise<LaunchpadPresale> {
    return this.updatePresale(presaleAddress, {
      total_raised: totalRaised,
      tokens_sold: tokensSold,
      total_contributors: totalContributors,
    });
  }

  /**
   * Update presale status
   */
  static async updatePresaleStatus(
    presaleAddress: string,
    status: 'pending' | 'live' | 'ended' | 'cancelled'
  ): Promise<LaunchpadPresale> {
    return this.updatePresale(presaleAddress, { status });
  }

  /**
   * Check if presale exists for a token
   */
  static async checkPresaleExists(tokenAddress: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('launchpad_presales')
      .select('id')
      .eq('sale_token_address', tokenAddress.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('Error checking presale existence:', error);
      return false;
    }

    return !!data;
  }

  /**
   * Search presales by name or symbol
   */
  static async searchPresales(query: string): Promise<LaunchpadPresale[]> {
    const searchTerm = `%${query.toLowerCase()}%`;

    const { data, error } = await supabase
      .from('launchpad_presales')
      .select('*')
      .or(`token_name.ilike.${searchTerm},token_symbol.ilike.${searchTerm},project_name.ilike.${searchTerm}`)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching presales:', error);
      throw error;
    }

    return data as LaunchpadPresale[];
  }
}
