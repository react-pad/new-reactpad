import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { usePresaleStore } from '@/lib/store/presale-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function AdminDashboardContent() {
  const {
    allPresalesAdmin,
    pendingPresalesAdmin,
    isAdminLoading,
    fetchAllPresalesAdmin,
    fetchPendingPresalesAdmin,
  } = usePresaleStore();

  useEffect(() => {
    fetchAllPresalesAdmin();
    fetchPendingPresalesAdmin();
  }, [fetchAllPresalesAdmin, fetchPendingPresalesAdmin]);

  const approvedCount = allPresalesAdmin.filter((p) => p.is_approved).length;
  const rejectedCount = allPresalesAdmin.filter((p) => !p.is_approved).length;
  const liveCount = allPresalesAdmin.filter(
    (p) => p.status === 'live' || p.status === 'ongoing'
  ).length;
  const endedCount = allPresalesAdmin.filter((p) => p.status === 'ended').length;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage presales, approve submissions, and monitor platform activity
        </p>
      </div>

      <Separator className="mb-8" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border rounded-lg p-6">
          <div className="text-sm font-medium text-muted-foreground mb-1">
            Total Presales
          </div>
          <div className="text-3xl font-bold">{allPresalesAdmin.length}</div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="text-sm font-medium text-muted-foreground mb-1">
            Pending Approval
          </div>
          <div className="text-3xl font-bold text-yellow-500">
            {pendingPresalesAdmin.length}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="text-sm font-medium text-muted-foreground mb-1">
            Approved
          </div>
          <div className="text-3xl font-bold text-green-500">{approvedCount}</div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="text-sm font-medium text-muted-foreground mb-1">
            Live Presales
          </div>
          <div className="text-3xl font-bold text-blue-500">{liveCount}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/admin/presales">
            <Button className="w-full" size="lg">
              Manage Presales
            </Button>
          </Link>
          <Link to="/admin/presales?filter=pending">
            <Button className="w-full" size="lg" variant="outline">
              Review Pending ({pendingPresalesAdmin.length})
            </Button>
          </Link>
          <Link to="/admin/presales?filter=live">
            <Button className="w-full" size="lg" variant="outline">
              View Live Presales ({liveCount})
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Submissions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Submissions</h2>
        {isAdminLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : pendingPresalesAdmin.length === 0 ? (
          <div className="text-center py-8 bg-card border rounded-lg">
            <p className="text-muted-foreground">No pending submissions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPresalesAdmin.slice(0, 5).map((presale) => (
              <div
                key={presale.id}
                className="bg-card border rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold">{presale.token_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {presale.token_symbol} • Submitted{' '}
                    {new Date(presale.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Link to={`/admin/presales?id=${presale.id}`}>
                  <Button variant="outline">Review</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Overview */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Status Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Live/Ongoing
            </div>
            <div className="text-2xl font-bold">{liveCount}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Ended
            </div>
            <div className="text-2xl font-bold">{endedCount}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Rejected
            </div>
            <div className="text-2xl font-bold">{rejectedCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminRoute>
      <AdminDashboardContent />
    </AdminRoute>
  );
}
