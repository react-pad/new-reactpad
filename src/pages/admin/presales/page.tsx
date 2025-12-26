import { AdminRoute } from '@/components/admin/AdminRoute';

function AdminPresalesContent() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Presale Management</h1>
        <p className="text-muted-foreground">
          Admin functionality is currently being migrated to blockchain-based storage.
        </p>
      </div>

      <div className="bg-card border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          This feature is temporarily unavailable while we migrate from database to blockchain storage.
        </p>
      </div>
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
