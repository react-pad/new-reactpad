"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserTokens } from "@/lib/hooks/useUserTokens";
import { Link } from "react-router-dom";
import { erc20Abi } from "viem";
import { useReadContract } from "wagmi";

function TokenInfo({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const { data: token, isLoading } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: 'symbol'
  })
  const { data: name } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: 'name'
  })


  if (isLoading) {
    return <div>Loading token...</div>
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h3 className="font-bold">{name as string} ({token as string})</h3>
        <p className="text-sm text-gray-500 break-all">{tokenAddress}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/dashboard/tools/token-locker?token=${tokenAddress}`}>Lock</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/dashboard/tools/airdrop?token=${tokenAddress}`}>Airdrop</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/dashboard/create/presale?token=${tokenAddress}`}>Presale</Link>
        </Button>
      </div>
    </div>
  )
}


export default function UserDashboardPage() {
  const { tokens: createdTokens, isLoading } = useUserTokens();


  return (
    <div className="container mx-auto px-4 py-12 text-black">
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Your Dashboard</h1>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>My Created Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && <p>Loading your tokens...</p>}
              {createdTokens && createdTokens.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {(createdTokens as `0x${string}`[]).map((token) => (
                    <div key={token} className="py-3">
                      <TokenInfo tokenAddress={token} />
                    </div>
                  ))}
                </div>
              ) : (
                <p>You have not created any tokens yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>KYC Status</span>
                <span className="font-bold text-yellow-600">Pending</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}