import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { usePresaleStore } from '@/lib/store/presale-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Presale } from '@/lib/types/database';
import { toast } from 'sonner';

function PresaleCard({ presale, onAction }: { presale: Presale; onAction: () => void }) {
  const { address } = useAccount();
  const {
    approvePresale,
    rejectPresale,
    toggleFeatured,
    toggleVerified,
    deletePresale,
    isAdminLoading,
  } = usePresaleStore();

  const handleApprove = async () => {
    if (!address) return;
    try {
      await approvePresale(presale.id, address);
      toast.success('Presale approved successfully');
      onAction();
    } catch (error) {
      toast.error('Failed to approve presale');
    }
  };

  const handleReject = async () => {
    try {
      await rejectPresale(presale.id);
      toast.success('Presale rejected');
      onAction();
    } catch (error) {
      toast.error('Failed to reject presale');
    }
  };

  const handleToggleFeatured = async () => {
    try {
      await toggleFeatured(presale.id, !presale.is_featured);
      toast.success(
        presale.is_featured ? 'Removed from featured' : 'Added to featured'
      );
      onAction();
    } catch (error) {
      toast.error('Failed to toggle featured status');
    }
  };

  const handleToggleVerified = async () => {
    try {
      await toggleVerified(presale.id, !presale.is_verified);
      toast.success(presale.is_verified ? 'Unverified' : 'Verified');
      onAction();
    } catch (error) {
      toast.error('Failed to toggle verified status');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this presale?')) return;
    try {
      await deletePresale(presale.id);
      toast.success('Presale deleted');
      onAction();
    } catch (error) {
      toast.error('Failed to delete presale');
    }
  };

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold">{presale.token_name}</h3>
            {presale.is_verified && (
              <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded">
                Verified
              </span>
            )}
            {presale.is_featured && (
              <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded">
                Featured
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{presale.token_symbol}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-xs px-2 py-1 rounded ${
              presale.is_approved
                ? 'bg-green-500/10 text-green-500'
                : 'bg-yellow-500/10 text-yellow-500'
            }`}
          >
            {presale.is_approved ? 'Approved' : 'Pending'}
          </span>
          <span className="text-xs px-2 py-1 rounded bg-gray-500/10 text-gray-500">
            {presale.status}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Token Address:</span>
          <span className="font-mono text-xs">{presale.token_address}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Owner:</span>
          <span className="font-mono text-xs">{presale.owner_address}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Start Time:</span>
          <span>{new Date(presale.start_time).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">End Time:</span>
          <span>{new Date(presale.end_time).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Submitted:</span>
          <span>{new Date(presale.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {presale.project_description && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {presale.project_description}
          </p>
        </div>
      )}

      <Separator className="my-4" />

      <div className="flex flex-wrap gap-2">
        {!presale.is_approved ? (
          <>
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={isAdminLoading}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleReject}
              disabled={isAdminLoading}
            >
              Reject
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleReject}
            disabled={isAdminLoading}
          >
            Unapprove
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={handleToggleFeatured}
          disabled={isAdminLoading}
        >
          {presale.is_featured ? 'Unfeature' : 'Feature'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleToggleVerified}
          disabled={isAdminLoading}
        >
          {presale.is_verified ? 'Unverify' : 'Verify'}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={isAdminLoading}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

function AdminPresalesContent() {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'all';

  const {
    allPresalesAdmin,
    pendingPresalesAdmin,
    isAdminLoading,
    fetchAllPresalesAdmin,
    fetchPendingPresalesAdmin,
  } = usePresaleStore();

  const [statusFilter, setStatusFilter] = useState<string>(filter);

  useEffect(() => {
    fetchAllPresalesAdmin();
    fetchPendingPresalesAdmin();
  }, [fetchAllPresalesAdmin, fetchPendingPresalesAdmin]);

  const filteredPresales = allPresalesAdmin.filter((presale) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return !presale.is_approved;
    if (statusFilter === 'approved') return presale.is_approved;
    if (statusFilter === 'live')
      return presale.status === 'live' || presale.status === 'ongoing';
    if (statusFilter === 'ended') return presale.status === 'ended';
    if (statusFilter === 'featured') return presale.is_featured;
    if (statusFilter === 'verified') return presale.is_verified;
    return true;
  });

  const handleAction = () => {
    fetchAllPresalesAdmin();
    fetchPendingPresalesAdmin();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Presale Management</h1>
        <p className="text-muted-foreground">
          Review, approve, and manage all presale submissions
        </p>
      </div>

      <Separator className="mb-8" />

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
          >
            All ({allPresalesAdmin.length})
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({pendingPresalesAdmin.length})
          </Button>
          <Button
            variant={statusFilter === 'approved' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('approved')}
          >
            Approved ({allPresalesAdmin.filter((p) => p.is_approved).length})
          </Button>
          <Button
            variant={statusFilter === 'live' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('live')}
          >
            Live (
            {
              allPresalesAdmin.filter(
                (p) => p.status === 'live' || p.status === 'ongoing'
              ).length
            }
            )
          </Button>
          <Button
            variant={statusFilter === 'ended' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ended')}
          >
            Ended ({allPresalesAdmin.filter((p) => p.status === 'ended').length})
          </Button>
          <Button
            variant={statusFilter === 'featured' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('featured')}
          >
            Featured ({allPresalesAdmin.filter((p) => p.is_featured).length})
          </Button>
          <Button
            variant={statusFilter === 'verified' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('verified')}
          >
            Verified ({allPresalesAdmin.filter((p) => p.is_verified).length})
          </Button>
        </div>
      </div>

      {/* Presales List */}
      {isAdminLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading presales...</p>
        </div>
      ) : filteredPresales.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-lg">
          <p className="text-muted-foreground">No presales found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredPresales.map((presale) => (
            <PresaleCard key={presale.id} presale={presale} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPresales() {
  return (
    <AdminRoute>
      <AdminPresalesContent />
    </AdminRoute>
  );
}
