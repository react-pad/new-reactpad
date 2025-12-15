import { create } from 'zustand';
import { PresaleService } from '../services/presale-service';
import type { Presale, PresaleInsert, PresaleUpdate } from '../types/database';

interface PresaleStore {
  // State
  presales: Presale[];
  livePresales: Presale[];
  upcomingPresales: Presale[];
  endedPresales: Presale[];
  featuredPresales: Presale[];
  isLoading: boolean;
  error: string | null;

  // Admin State
  allPresalesAdmin: Presale[];
  pendingPresalesAdmin: Presale[];
  isAdminLoading: boolean;
  adminError: string | null;

  // Actions
  fetchAllPresales: () => Promise<void>;
  fetchLivePresales: () => Promise<void>;
  fetchUpcomingPresales: () => Promise<void>;
  fetchEndedPresales: () => Promise<void>;
  fetchFeaturedPresales: () => Promise<void>;
  fetchPresaleById: (id: string) => Promise<Presale | null>;
  fetchPresaleByTokenAddress: (tokenAddress: string) => Promise<Presale | null>;
  fetchPresalesByOwner: (ownerAddress: string) => Promise<Presale[]>;
  createPresale: (presale: PresaleInsert) => Promise<Presale>;
  updatePresale: (id: string, updates: PresaleUpdate) => Promise<Presale>;

  // Admin Actions
  fetchAllPresalesAdmin: () => Promise<void>;
  fetchPendingPresalesAdmin: () => Promise<void>;
  approvePresale: (id: string, adminAddress: string) => Promise<void>;
  rejectPresale: (id: string, adminNotes?: string) => Promise<void>;
  toggleFeatured: (id: string, isFeatured: boolean) => Promise<void>;
  toggleVerified: (id: string, isVerified: boolean) => Promise<void>;
  updatePresaleStatus: (id: string, status: Presale['status']) => Promise<void>;
  deletePresale: (id: string) => Promise<void>;
  addAdminNotes: (id: string, notes: string) => Promise<void>;

  // Utility
  clearError: () => void;
}

export const usePresaleStore = create<PresaleStore>((set, get) => ({
  // Initial State
  presales: [],
  livePresales: [],
  upcomingPresales: [],
  endedPresales: [],
  featuredPresales: [],
  isLoading: false,
  error: null,

  // Admin Initial State
  allPresalesAdmin: [],
  pendingPresalesAdmin: [],
  isAdminLoading: false,
  adminError: null,

  // Actions
  fetchAllPresales: async () => {
    set({ isLoading: true, error: null });
    try {
      const presales = await PresaleService.getAllPresales();
      set({ presales, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch presales',
        isLoading: false,
      });
    }
  },

  fetchLivePresales: async () => {
    set({ isLoading: true, error: null });
    try {
      const livePresales = await PresaleService.getLivePresales();
      set({ livePresales, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch live presales',
        isLoading: false,
      });
    }
  },

  fetchUpcomingPresales: async () => {
    set({ isLoading: true, error: null });
    try {
      const upcomingPresales = await PresaleService.getUpcomingPresales();
      set({ upcomingPresales, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch upcoming presales',
        isLoading: false,
      });
    }
  },

  fetchEndedPresales: async () => {
    set({ isLoading: true, error: null });
    try {
      const endedPresales = await PresaleService.getEndedPresales();
      set({ endedPresales, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch ended presales',
        isLoading: false,
      });
    }
  },

  fetchFeaturedPresales: async () => {
    set({ isLoading: true, error: null });
    try {
      const featuredPresales = await PresaleService.getFeaturedPresales();
      set({ featuredPresales, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch featured presales',
        isLoading: false,
      });
    }
  },

  fetchPresaleById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const presale = await PresaleService.getPresaleById(id);
      set({ isLoading: false });
      return presale;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch presale',
        isLoading: false,
      });
      return null;
    }
  },

  fetchPresaleByTokenAddress: async (tokenAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const presale = await PresaleService.getPresaleByTokenAddress(tokenAddress);
      set({ isLoading: false });
      return presale;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch presale',
        isLoading: false,
      });
      return null;
    }
  },

  fetchPresalesByOwner: async (ownerAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const presales = await PresaleService.getPresalesByOwner(ownerAddress);
      set({ isLoading: false });
      return presales;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch presales',
        isLoading: false,
      });
      return [];
    }
  },

  createPresale: async (presale: PresaleInsert) => {
    set({ isLoading: true, error: null });
    try {
      const newPresale = await PresaleService.createPresale(presale);
      set({ isLoading: false });
      return newPresale;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create presale',
        isLoading: false,
      });
      throw error;
    }
  },

  updatePresale: async (id: string, updates: PresaleUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPresale = await PresaleService.updatePresale(id, updates);

      // Update in local state
      set((state) => ({
        presales: state.presales.map((p) => (p.id === id ? updatedPresale : p)),
        livePresales: state.livePresales.map((p) => (p.id === id ? updatedPresale : p)),
        upcomingPresales: state.upcomingPresales.map((p) => (p.id === id ? updatedPresale : p)),
        endedPresales: state.endedPresales.map((p) => (p.id === id ? updatedPresale : p)),
        isLoading: false,
      }));

      return updatedPresale;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update presale',
        isLoading: false,
      });
      throw error;
    }
  },

  // Admin Actions
  fetchAllPresalesAdmin: async () => {
    set({ isAdminLoading: true, adminError: null });
    try {
      const allPresalesAdmin = await PresaleService.getAllPresalesAdmin();
      set({ allPresalesAdmin, isAdminLoading: false });
    } catch (error) {
      set({
        adminError: error instanceof Error ? error.message : 'Failed to fetch all presales',
        isAdminLoading: false,
      });
    }
  },

  fetchPendingPresalesAdmin: async () => {
    set({ isAdminLoading: true, adminError: null });
    try {
      const pendingPresalesAdmin = await PresaleService.getPendingPresalesAdmin();
      set({ pendingPresalesAdmin, isAdminLoading: false });
    } catch (error) {
      set({
        adminError: error instanceof Error ? error.message : 'Failed to fetch pending presales',
        isAdminLoading: false,
      });
    }
  },

  approvePresale: async (id: string, adminAddress: string) => {
    set({ isAdminLoading: true, adminError: null });
    try {
      await PresaleService.approvePresale(id, adminAddress);

      // Refresh admin presales
      await get().fetchAllPresalesAdmin();
      await get().fetchPendingPresalesAdmin();

      set({ isAdminLoading: false });
    } catch (error) {
      set({
        adminError: error instanceof Error ? error.message : 'Failed to approve presale',
        isAdminLoading: false,
      });
      throw error;
    }
  },

  rejectPresale: async (id: string, adminNotes?: string) => {
    set({ isAdminLoading: true, adminError: null });
    try {
      await PresaleService.rejectPresale(id, adminNotes);

      // Refresh admin presales
      await get().fetchAllPresalesAdmin();
      await get().fetchPendingPresalesAdmin();

      set({ isAdminLoading: false });
    } catch (error) {
      set({
        adminError: error instanceof Error ? error.message : 'Failed to reject presale',
        isAdminLoading: false,
      });
      throw error;
    }
  },

  toggleFeatured: async (id: string, isFeatured: boolean) => {
    set({ isAdminLoading: true, adminError: null });
    try {
      await PresaleService.toggleFeatured(id, isFeatured);

      // Update in local state
      set((state) => ({
        allPresalesAdmin: state.allPresalesAdmin.map((p) =>
          p.id === id ? { ...p, is_featured: isFeatured } : p
        ),
        isAdminLoading: false,
      }));
    } catch (error) {
      set({
        adminError: error instanceof Error ? error.message : 'Failed to toggle featured',
        isAdminLoading: false,
      });
      throw error;
    }
  },

  toggleVerified: async (id: string, isVerified: boolean) => {
    set({ isAdminLoading: true, adminError: null });
    try {
      await PresaleService.toggleVerified(id, isVerified);

      // Update in local state
      set((state) => ({
        allPresalesAdmin: state.allPresalesAdmin.map((p) =>
          p.id === id ? { ...p, is_verified: isVerified } : p
        ),
        isAdminLoading: false,
      }));
    } catch (error) {
      set({
        adminError: error instanceof Error ? error.message : 'Failed to toggle verified',
        isAdminLoading: false,
      });
      throw error;
    }
  },

  updatePresaleStatus: async (id: string, status: Presale['status']) => {
    set({ isAdminLoading: true, adminError: null });
    try {
      await PresaleService.updatePresaleStatus(id, status);

      // Update in local state
      set((state) => ({
        allPresalesAdmin: state.allPresalesAdmin.map((p) =>
          p.id === id ? { ...p, status } : p
        ),
        isAdminLoading: false,
      }));
    } catch (error) {
      set({
        adminError: error instanceof Error ? error.message : 'Failed to update status',
        isAdminLoading: false,
      });
      throw error;
    }
  },

  deletePresale: async (id: string) => {
    set({ isAdminLoading: true, adminError: null });
    try {
      await PresaleService.deletePresale(id);

      // Remove from local state
      set((state) => ({
        allPresalesAdmin: state.allPresalesAdmin.filter((p) => p.id !== id),
        pendingPresalesAdmin: state.pendingPresalesAdmin.filter((p) => p.id !== id),
        isAdminLoading: false,
      }));
    } catch (error) {
      set({
        adminError: error instanceof Error ? error.message : 'Failed to delete presale',
        isAdminLoading: false,
      });
      throw error;
    }
  },

  addAdminNotes: async (id: string, notes: string) => {
    set({ isAdminLoading: true, adminError: null });
    try {
      await PresaleService.addAdminNotes(id, notes);

      // Update in local state
      set((state) => ({
        allPresalesAdmin: state.allPresalesAdmin.map((p) =>
          p.id === id ? { ...p, admin_notes: notes } : p
        ),
        isAdminLoading: false,
      }));
    } catch (error) {
      set({
        adminError: error instanceof Error ? error.message : 'Failed to add admin notes',
        isAdminLoading: false,
      });
      throw error;
    }
  },

  // Utility
  clearError: () => set({ error: null, adminError: null }),
}));
