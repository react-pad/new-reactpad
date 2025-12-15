import { useAccount } from 'wagmi';
import { Navigate } from 'react-router-dom';
import { isAdmin } from '@/lib/utils/admin';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { address, isConnected } = useAccount();

  // If wallet is not connected, redirect to home
  if (!isConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to access this page.
          </p>
        </div>
      </div>
    );
  }

  // If connected wallet is not an admin, redirect to home
  if (!isAdmin(address)) {
    return <Navigate to="/" replace />;
  }

  // If user is admin, render the protected content
  return <>{children}</>;
}
