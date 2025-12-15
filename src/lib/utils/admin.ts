/**
 * Admin utility functions for authentication and authorization
 */

/**
 * Get admin addresses from environment variables
 */
export function getAdminAddresses(): string[] {
  const adminAddressesEnv = import.meta.env.VITE_ADMIN_ADDRESSES;

  if (!adminAddressesEnv) {
    return [];
  }

  return adminAddressesEnv
    .split(',')
    .map((addr: string) => addr.trim().toLowerCase())
    .filter((addr: string) => addr.length > 0);
}

/**
 * Check if an address is an admin
 */
export function isAdmin(address: string | undefined): boolean {
  if (!address) return false;

  const adminAddresses = getAdminAddresses();
  return adminAddresses.includes(address.toLowerCase());
}

/**
 * Hook to check if the current user is an admin
 */
export function useIsAdmin(address: string | undefined): boolean {
  return isAdmin(address);
}

/**
 * Require admin access - throws error if not admin
 */
export function requireAdmin(address: string | undefined): void {
  if (!isAdmin(address)) {
    throw new Error('Unauthorized: Admin access required');
  }
}
