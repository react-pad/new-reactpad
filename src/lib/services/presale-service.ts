import { supabase } from '../supabase';
import type { PresaleInsert, PresaleUpdate, PresaleStatus } from '../types/database';

export class PresaleService {
  /**
   * Get all approved presales
   */
  static async getAllPresales() {
    const { data, error } = await supabase
      .from('presales')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get presales by status
   */
  static async getPresalesByStatus(status: PresaleStatus) {
    const { data, error } = await supabase
      .from('presales')
      .select('*')
      .eq('is_approved', true)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get live presales (currently active)
   */
  static async getLivePresales() {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('presales')
      .select('*')
      .eq('is_approved', true)
      .lte('start_time', now)
      .gte('end_time', now)
      .in('status', ['live', 'ongoing'])
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get upcoming presales (not started yet)
   */
  static async getUpcomingPresales() {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('presales')
      .select('*')
      .eq('is_approved', true)
      .gt('start_time', now)
      .eq('status', 'pending')
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Get ended presales
   */
  static async getEndedPresales() {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('presales')
      .select('*')
      .eq('is_approved', true)
      .lt('end_time', now)
      .eq('status', 'ended')
      .order('end_time', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get featured presales
   */
  static async getFeaturedPresales() {
    const { data, error } = await supabase
      .from('presales')
      .select('*')
      .eq('is_approved', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get presale by ID
   */
  static async getPresaleById(id: string) {
    const { data, error } = await supabase
      .from('presales')
      .select('*')
      .eq('id', id)
      .eq('is_approved', true)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get presale by token address
   */
  static async getPresaleByTokenAddress(tokenAddress: string) {
    const { data, error } = await supabase
      .from('presales')
      .select('*')
      .eq('token_address', tokenAddress.toLowerCase())
      .eq('is_approved', true)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get presales by owner address
   */
  static async getPresalesByOwner(ownerAddress: string) {
    const { data, error } = await supabase
      .from('presales')
      .select('*')
      .eq('owner_address', ownerAddress.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Create a new presale submission
   */
  static async createPresale(presale: PresaleInsert) {
    const { data, error } = await supabase
      .from('presales')
      .insert([{
        ...presale,
        token_address: presale.token_address.toLowerCase(),
        owner_address: presale.owner_address.toLowerCase(),
        presale_address: presale.presale_address.toLowerCase(),
      }] as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update presale (for owner to update their own presale)
   */
  static async updatePresale(id: string, updates: PresaleUpdate) {
    // @ts-ignore - Supabase type inference issue
    const { data, error } = await supabase
      .from('presales')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update presale progress (total raised and contributors)
   */
  static async updatePresaleProgress(
    id: string,
    totalRaised: string,
    totalContributors: number
  ) {
    // @ts-ignore - Supabase type inference issue
    const { data, error } = await supabase
      .from('presales')
      .update({
        total_raised: totalRaised,
        total_contributors: totalContributors,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ========================================
  // ADMIN FUNCTIONS
  // ========================================

  /**
   * Get all presales (including unapproved) - Admin only
   */
  static async getAllPresalesAdmin() {
    const { data, error } = await supabase
      .from('presales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get pending presales waiting for approval - Admin only
   */
  static async getPendingPresalesAdmin() {
    const { data, error } = await supabase
      .from('presales')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Approve presale - Admin only
   */
  static async approvePresale(id: string, adminAddress: string) {
    // @ts-ignore - Supabase type inference issue
    const { data, error } = await supabase
      .from('presales')
      .update({
        is_approved: true,
        approved_at: new Date().toISOString(),
        approved_by: adminAddress.toLowerCase(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Reject/Unapprove presale - Admin only
   */
  static async rejectPresale(id: string, adminNotes?: string) {
    // @ts-ignore - Supabase type inference issue
    const { data, error } = await supabase
      .from('presales')
      .update({
        is_approved: false,
        approved_at: null,
        approved_by: null,
        admin_notes: adminNotes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Feature/Unfeature presale - Admin only
   */
  static async toggleFeatured(id: string, isFeatured: boolean) {
    // @ts-ignore - Supabase type inference issue
    const { data, error } = await supabase
      .from('presales')
      .update({ is_featured: isFeatured })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Verify/Unverify presale - Admin only
   */
  static async toggleVerified(id: string, isVerified: boolean) {
    // @ts-ignore - Supabase type inference issue
    const { data, error } = await supabase
      .from('presales')
      .update({ is_verified: isVerified })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update presale status - Admin only
   */
  static async updatePresaleStatus(id: string, status: PresaleStatus) {
    // @ts-ignore - Supabase type inference issue
    const { data, error } = await supabase
      .from('presales')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete presale - Admin only
   */
  static async deletePresale(id: string) {
    const { error } = await supabase
      .from('presales')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  /**
   * Add admin notes - Admin only
   */
  static async addAdminNotes(id: string, notes: string) {
    // @ts-ignore - Supabase type inference issue
    const { data, error } = await supabase
      .from('presales')
      .update({ admin_notes: notes })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
