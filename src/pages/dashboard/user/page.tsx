"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useUserTokens } from "@/lib/hooks/useUserTokens";
import { useLaunchpadPresales } from "@/lib/hooks/useLaunchpadPresales";
import { useWhitelistedCreator } from "@/lib/hooks/useWhitelistedCreator";
import { useAllLocks } from "@/lib/hooks/useAllLocks";
import { Link, useNavigate } from "react-router-dom";
import { erc20Abi, formatUnits } from "viem";
import { useReadContract, useAccount } from "wagmi";
import { RefreshCw, ExternalLink, X, Coins, Rocket, Lock, Plus, ArrowRight } from "lucide-react";
import type { Address } from "viem";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";

function TokenInfo({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const { address } = useAccount();
  const { data: symbol, isLoading: isLoadingSymbol } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: 'symbol'
  })
  const { data: name, isLoading: isLoadingName } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: 'name'
  })
  const { isWhitelisted, isLoading: isLoadingWhitelist } = useWhitelistedCreator(
    address as Address | undefined
  );

  const isLoading = isLoadingSymbol || isLoadingName;

  if (isLoading) {
    return (
      <div className="py-3 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-2 border-black bg-white shadow-[2px_2px_0_rgba(0,0,0,1)]">
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-lg uppercase">
          {name as string || 'Unknown Token'} ({symbol as string || 'N/A'})
        </h3>
        <p className="text-xs text-gray-500 break-all font-mono">{tokenAddress}</p>
      </div>
      <div className="flex flex-wrap gap-2 flex-shrink-0">
        <Button variant="outline" size="sm" asChild className="border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_rgba(0,0,0,1)]">
          <Link to={`/dashboard/tools/token-locker?token=${tokenAddress}`}>
            <Lock className="w-3 h-3 mr-1" /> Lock
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild className="border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_rgba(0,0,0,1)]">
          <Link to={`/dashboard/tools/airdrop?token=${tokenAddress}`}>Airdrop</Link>
        </Button>
        {!isLoadingWhitelist && (
          <Button size="sm" asChild className="border-2 border-black bg-[#7DF9FF] text-black font-bold text-xs uppercase shadow-[2px_2px_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_rgba(0,0,0,1)] hover:bg-[#6AD8E8]">
            <Link
              to={
                isWhitelisted
                  ? `/dashboard/create/presale?token=${tokenAddress}`
                  : `/dashboard/create/project`
              }
            >
              <Rocket className="w-3 h-3 mr-1" /> Presale
            </Link>
        </Button>
        )}
      </div>
    </div>
  )
}


function PresaleInfo({ presaleAddress }: { presaleAddress: Address }) {
  const { presales, isLoading } = useLaunchpadPresales('all', false);

  // Find the presale in the list
  const presaleData = presales?.find(p => p.address.toLowerCase() === presaleAddress.toLowerCase());

  if (isLoading || !presaleData) {
    return (
      <div className="py-3 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  const progress = presaleData.hardCap > 0n
    ? Math.round(Number((presaleData.totalRaised * 100n) / presaleData.hardCap))
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'upcoming': return 'bg-yellow-500';
      case 'finalized': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-4 border-2 border-black bg-white shadow-[2px_2px_0_rgba(0,0,0,1)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-black text-lg uppercase">
              {presaleData.saleTokenSymbol || 'Token'} Presale
            </h3>
            <span className={`px-2 py-0.5 text-xs font-bold uppercase text-white ${getStatusColor(presaleData.status)}`}>
              {presaleData.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 break-all font-mono">{presaleAddress}</p>
        </div>
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          <Button size="sm" asChild className="border-2 border-black bg-[#FFFB8F] text-black font-bold text-xs uppercase shadow-[2px_2px_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_rgba(0,0,0,1)] hover:bg-[#EDE972]">
            <Link to={`/dashboard/presales/manage/${presaleAddress}`}>
              Manage <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
      {presaleData.hardCap > 0n && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-bold">{progress}% Funded</span>
            <span className="text-gray-500">
              {formatUnits(presaleData.totalRaised, 18)} / {formatUnits(presaleData.hardCap, 18)} REACT
            </span>
          </div>
          <Progress value={progress} className="h-2 border border-black" />
        </div>
      )}
    </div>
  );
}

function LockPreviewCard({ lock }: { lock: { id: bigint; token: `0x${string}`; amount: bigint; lockDate: bigint; unlockDate: bigint; withdrawn: boolean; name: string; tokenSymbol?: string; formattedAmount: string } }) {
  const now = Date.now();
  const lockTimestamp = Number(lock.lockDate) * 1000;
  const unlockTimestamp = Number(lock.unlockDate) * 1000;
  const totalDuration = unlockTimestamp - lockTimestamp;
  const elapsed = now - lockTimestamp;
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  const isExpired = now >= unlockTimestamp;

  return (
    <div className="p-4 border-2 border-black bg-white shadow-[2px_2px_0_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          <span className="font-black text-sm uppercase">{lock.name || `Lock #${lock.id.toString()}`}</span>
        </div>
        <span className={`px-2 py-0.5 text-xs font-bold uppercase ${lock.withdrawn ? 'bg-gray-400 text-white' : isExpired ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'}`}>
          {lock.withdrawn ? 'Withdrawn' : isExpired ? 'Unlockable' : 'Locked'}
        </span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold">{lock.formattedAmount} {lock.tokenSymbol}</span>
        <span className="text-xs text-gray-500">
          {isExpired ? 'Ready' : formatDistanceToNow(new Date(unlockTimestamp), { addSuffix: true })}
        </span>
      </div>
      {!lock.withdrawn && (
        <Progress value={progress} className={`h-1.5 border border-black ${isExpired ? 'bg-green-100' : 'bg-gray-100'}`} />
      )}
      <div className="mt-3 flex justify-end">
        <Link to={`/locks/${lock.id.toString()}`}>
          <Button size="sm" variant="outline" className="border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_rgba(0,0,0,1)]">
            View <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  const { address, isConnected } = useAccount();
  const { tokens: createdTokens, isLoading, refetch } = useUserTokens();
  const { presales, isLoading: isLoadingPresales } = useLaunchpadPresales('all', false);
  const { locks: userLocks, isLoading: isLoadingLocks, refetch: refetchLocks } = useAllLocks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Filter presales owned by the user
  const myPresales = presales?.filter(
    (p) => address && p.owner?.toLowerCase() === address.toLowerCase()
  ) || [];

  const activeLocks = userLocks?.filter(l => !l.withdrawn) || [];

  const handleRefresh = () => {
    refetch();
    refetchLocks();
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12 text-black">
        <div className="border-b-4 border-black bg-[#FFFB8F] p-6 shadow-[4px_4px_0_rgba(0,0,0,1)] mb-8">
          <h1 className="text-4xl font-black uppercase tracking-wider">Your Dashboard</h1>
        </div>
        <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
          <CardContent className="py-12 text-center">
            <p className="text-lg text-gray-600 mb-4">
              Please connect your wallet to view your dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-black">
      {/* Header */}
      <div className="mb-8">
        <div className="border-b-4 border-black bg-[#FFFB8F] p-6 shadow-[4px_4px_0_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-wider">Your Dashboard</h1>
              <p className="text-sm font-mono mt-2">
                {address?.slice(0, 10)}...{address?.slice(-8)}
              </p>
            </div>
          <Button
              onClick={handleRefresh}
              disabled={isLoading || isLoadingPresales || isLoadingLocks}
              className="border-4 border-black bg-white text-black font-black uppercase tracking-wider shadow-[3px_3px_0_rgba(0,0,0,1)] hover:bg-gray-100"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading || isLoadingPresales || isLoadingLocks ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0">
          <CardContent className="p-4 text-center">
            <Coins className="w-6 h-6 mx-auto mb-2 text-[#000000]" />
            <p className="text-xs text-gray-500 uppercase font-bold">Tokens Created</p>
            <p className="text-3xl font-black">{createdTokens?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0">
          <CardContent className="p-4 text-center">
            <Rocket className="w-6 h-6 mx-auto mb-2 text-[#7DF9FF]" />
            <p className="text-xs text-gray-500 uppercase font-bold">My Presales</p>
            <p className="text-3xl font-black">{myPresales.length}</p>
          </CardContent>
        </Card>
        <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0">
          <CardContent className="p-4 text-center">
            <Lock className="w-6 h-6 mx-auto mb-2 text-[#CA8A04]" />
            <p className="text-xs text-gray-500 uppercase font-bold">Active Locks</p>
            <p className="text-3xl font-black">{activeLocks.length}</p>
          </CardContent>
        </Card>
        <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] py-0 gap-0">
          <Link to="/dashboard/create" className="block w-full h-full">
            <Button className="w-full h-full min-h-[104px] rounded-none border-0 bg-[#FF00F5] text-black font-black uppercase tracking-wider shadow-none hover:bg-[#FF4911] flex flex-col items-center justify-center gap-2 !p-0 !m-0 !h-full">
              <Plus className="w-6 h-6" />
              <span>Create</span>
            </Button>
          </Link>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Presales */}
        <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0">
          <CardHeader className="border-b-2 border-black bg-[#7DF9FF] p-4">
            <CardTitle className="font-black uppercase tracking-wider flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              My Presales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {isLoadingPresales ? (
              <div className="space-y-3">
                <div className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded mb-3"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : myPresales.length > 0 ? (
              <div className="space-y-3">
                {myPresales.slice(0, 3).map((presale) => (
                  <PresaleInfo key={presale.address} presaleAddress={presale.address} />
                ))}
                {myPresales.length > 3 && (
                  <Link to="/dashboard/presales" className="block text-center">
                    <Button variant="outline" size="sm" className="border-2 border-black font-bold text-xs uppercase">
                      View All ({myPresales.length}) <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Rocket className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 mb-4 text-sm">No presales yet</p>
                <Button onClick={() => setIsModalOpen(true)} className="border-4 border-black bg-[#7DF9FF] text-black font-black uppercase tracking-wider shadow-[3px_3px_0_rgba(0,0,0,1)]">
                  Create Presale
                </Button>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogPortal>
                    <DialogOverlay className="bg-black/70 backdrop-blur-sm" />
                    <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border-4 border-black bg-white p-6 shadow-[8px_8px_0_rgba(0,0,0,1)] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-none">
                      <DialogHeader>
                        <DialogTitle className="font-black uppercase tracking-wider text-xl">Before You Continue</DialogTitle>
                        <DialogDescription className="text-gray-600">
                          Please make sure to fill out all required fields in the form before proceeding. This will help ensure your presale is created successfully.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-2 border-black font-bold uppercase">
                          Cancel
                        </Button>
                        <Button onClick={() => {
                          setIsModalOpen(false);
                          navigate("/dashboard/create/project");
                        }} className="border-4 border-black bg-[#7DF9FF] text-black font-black uppercase shadow-[3px_3px_0_rgba(0,0,0,1)]">
                          Continue to Form
                        </Button>
                      </DialogFooter>
                      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                      </DialogPrimitive.Close>
                    </DialogPrimitive.Content>
                  </DialogPortal>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Locks */}
        <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0">
          <CardHeader className="border-b-2 border-black bg-[#FFFB8F] p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="font-black uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-5 h-5" />
                My Token Locks
              </CardTitle>
              <Link to="/dashboard/tools/token-locker">
                <Button size="sm" variant="outline" className="border-2 border-black font-bold text-xs uppercase">
                  Manage
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {isLoadingLocks ? (
              <div className="space-y-3">
                <div className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded mb-3"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : activeLocks.length > 0 ? (
              <div className="space-y-3">
                {activeLocks.slice(0, 3).map((lock) => (
                  <LockPreviewCard key={lock.id.toString()} lock={lock} />
                ))}
                {activeLocks.length > 3 && (
                  <Link to="/dashboard/tools/token-locker" className="block text-center">
                    <Button variant="outline" size="sm" className="border-2 border-black font-bold text-xs uppercase">
                      View All ({activeLocks.length}) <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Lock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 mb-4 text-sm">No active locks</p>
                <Link to="/dashboard/tools/token-locker">
                  <Button className="border-4 border-black bg-[#FFFB8F] text-black font-black uppercase tracking-wider shadow-[3px_3px_0_rgba(0,0,0,1)] hover:bg-[#EDE972]">
                    <Lock className="w-4 h-4 mr-1" /> Create Lock
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Created Tokens - Full Width */}
      <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0 mt-6">
        <CardHeader className="border-b-2 border-black bg-[#000000] p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-black uppercase tracking-wider flex items-center gap-2 text-white">
              <Coins className="w-5 h-5" />
              My Created Tokens
            </CardTitle>
            <Link to="/dashboard/create/token">
              <Button size="sm" className="border-2 border-black bg-white text-black font-bold text-xs uppercase shadow-[2px_2px_0_rgba(0,0,0,1)]">
                <Plus className="w-3 h-3 mr-1" /> New Token
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded mb-3"></div>
                <div className="h-16 bg-gray-200 rounded mb-3"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : createdTokens && createdTokens.length > 0 ? (
            <div className="space-y-3">
              {(createdTokens as `0x${string}`[]).map((token) => (
                <TokenInfo key={token} tokenAddress={token} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Coins className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 mb-4">You have not created any tokens yet.</p>
              <Link to="/dashboard/create/token">
                <Button className="border-4 border-black bg-[#000000] text-white font-black uppercase tracking-wider shadow-[3px_3px_0_rgba(0,0,0,1)] hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-1" /> Create Your First Token
              </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/dashboard/create/token">
          <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0 hover:shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer bg-[#000000]">
            <CardContent className="p-4 text-center">
              <Coins className="w-8 h-8 mx-auto mb-2 text-white" />
              <p className="font-black uppercase text-sm text-white">Create Token</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/create/project">
          <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0 hover:shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer bg-[#7DF9FF]">
            <CardContent className="p-4 text-center">
              <Rocket className="w-8 h-8 mx-auto mb-2" />
              <p className="font-black uppercase text-sm">Launch Presale</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/tools/token-locker">
          <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0 hover:shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer bg-[#FFFB8F]">
            <CardContent className="p-4 text-center">
              <Lock className="w-8 h-8 mx-auto mb-2" />
              <p className="font-black uppercase text-sm">Lock Tokens</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/tools/airdrop">
          <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0 hover:shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer bg-[#90EE90]">
            <CardContent className="p-4 text-center">
              <ArrowRight className="w-8 h-8 mx-auto mb-2" />
              <p className="font-black uppercase text-sm">Airdrop</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
