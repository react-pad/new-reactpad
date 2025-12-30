"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useUserTokens } from "@/lib/hooks/useUserTokens";
import { useLaunchpadPresales } from "@/lib/hooks/useLaunchpadPresales";
import { Link, useNavigate } from "react-router-dom";
import { erc20Abi } from "viem";
import { useReadContract, useAccount } from "wagmi";
import { RefreshCw, ExternalLink, X } from "lucide-react";
import type { Address } from "viem";

function TokenInfo({ tokenAddress }: { tokenAddress: `0x${string}` }) {
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
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-lg">
          {name as string || 'Unknown Token'} ({symbol as string || 'N/A'})
        </h3>
        <p className="text-sm text-gray-500 break-all font-mono">{tokenAddress}</p>
      </div>
      <div className="flex flex-wrap gap-2 flex-shrink-0">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/dashboard/tools/token-locker?token=${tokenAddress}`}>Lock Tokens</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/dashboard/tools/airdrop?token=${tokenAddress}`}>Airdrop</Link>
        </Button>
        {/* <Button variant="outline" size="sm" asChild>
          <Link to={`/dashboard/create/presale?token=${tokenAddress}`}>Create Presale</Link>
        </Button> */}
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

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-lg">
          {presaleData.saleTokenSymbol || 'Token'} Presale
        </h3>
        <p className="text-sm text-gray-500 break-all font-mono">{presaleAddress}</p>
        <p className="text-xs text-gray-400 mt-1">
          Status: <span className="font-semibold capitalize">{presaleData.status}</span>
          {presaleData.totalRaised > 0n && presaleData.hardCap > 0n && (
            <span className="ml-2">
              • {progress}% funded
            </span>
          )}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 flex-shrink-0">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/dashboard/presales/manage/${presaleAddress}`}>
            Manage <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  const { address, isConnected } = useAccount();
  const { tokens: createdTokens, isLoading, refetch } = useUserTokens();
  const { presales, isLoading: isLoadingPresales } = useLaunchpadPresales('all', false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Filter presales owned by the user
  const myPresales = presales?.filter(
    (p) => address && p.owner?.toLowerCase() === address.toLowerCase()
  ) || [];

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12 text-black">
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Your Dashboard</h1>
        </section>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-gray-600 mb-4">
              Please connect your wallet to view your created tokens.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 text-black">
      <section className="mb-12">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Your Dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
            }}
            disabled={isLoading || isLoadingPresales}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading || isLoadingPresales ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-gray-600 mt-2">
          Connected: <span className="font-mono text-sm">{address}</span>
        </p>
      </section>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Presales</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPresales ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded mb-3"></div>
                  <div className="h-16 bg-gray-200 rounded mb-3"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
                <p className="text-center text-gray-600">Loading your presales...</p>
              </div>
            ) : myPresales.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {myPresales.map((presale) => (
                  <div key={presale.address} className="py-4">
                    <PresaleInfo presaleAddress={presale.address} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">You have not created any presales yet.</p>
                <Button onClick={() => setIsModalOpen(true)}>
                  Create Your First Presale
                </Button>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogPortal>
                    <DialogOverlay className="bg-black/70 backdrop-blur-sm" />
                    <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
                      <DialogHeader>
                        <DialogTitle>Before You Continue</DialogTitle>
                        <DialogDescription>
                          Please make sure to fill out all required fields in the form before proceeding. This will help ensure your presale is created successfully.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => {
                          setIsModalOpen(false);
                          navigate("/dashboard/create/project");
                        }}>
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

        <Card>
          <CardHeader>
            <CardTitle>My Created Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded mb-3"></div>
                  <div className="h-16 bg-gray-200 rounded mb-3"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
                <p className="text-center text-gray-600">Loading your tokens...</p>
              </div>
            ) : createdTokens && createdTokens.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {(createdTokens as `0x${string}`[]).map((token) => (
                  <div key={token} className="py-4">
                    <TokenInfo tokenAddress={token} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">You have not created any tokens yet.</p>
                <Button asChild>
                  <Link to="/dashboard/create/token">Create Your First Token</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
