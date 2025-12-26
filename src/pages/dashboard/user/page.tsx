"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserTokens } from "@/lib/hooks/useUserTokens";
import { Link } from "react-router-dom";
import { erc20Abi } from "viem";
import { useReadContract, useAccount } from "wagmi";
import { RefreshCw } from "lucide-react";

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
        <Button variant="outline" size="sm" asChild>
          <Link to={`/dashboard/create/presale?token=${tokenAddress}`}>Create Presale</Link>
        </Button>
      </div>
    </div>
  )
}


export default function UserDashboardPage() {
  const { address, isConnected } = useAccount();
  const { tokens: createdTokens, isLoading, refetch } = useUserTokens();

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
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-gray-600 mt-2">
          Connected: <span className="font-mono text-sm">{address}</span>
        </p>
      </section>

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
  );
}