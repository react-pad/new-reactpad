"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { SwapForm } from "@/components/ui/swap-form";
import { useMarkets } from "@/lib/hooks/useMarkets";
import { useParams } from "react-router-dom";
import { useLaunchpadPresales } from "@/lib/hooks/useLaunchpadPresales";
import { Weth9Contract } from "@/lib/config";

export default function MarketDetailPage() {
  const { id } = useParams(); // This is the presale_address
  const { presales, isLoading: isLoadingPresales } = useLaunchpadPresales("all");
  const { markets, isLoading: isLoadingMarkets } = useMarkets();

  if (isLoadingPresales || isLoadingMarkets) {
    return <div>Loading...</div>;
  }

  const presale = presales.find((p) => p.presale_address.toLowerCase() === id?.toLowerCase());

  console.log("Found Presale:", presale);
  console.log("Available Markets:", markets);

  if (!presale) {
    return <div>Project not found</div>;
  }

  const presaleTokens = [
    presale.sale_token_address.toLowerCase(),
    (presale.payment_token_address || Weth9Contract.address).toLowerCase(),
  ];

  console.log("Looking for market with tokens:", presaleTokens);

  const market = markets.find(m => {
    if (!m) return false;
    const marketTokens = [
      m.token0.address.toLowerCase(),
      m.token1.address.toLowerCase()
    ];
    return marketTokens.includes(presaleTokens[0]) && marketTokens.includes(presaleTokens[1]);
  });


  if (!market) {
    return <div>Market for this project not available yet.</div>;
  }

  const dexScreenerUrl = `https://dexscreener.com/reactive-mainnet/${market.pairAddress}?embed=1&theme=dark&info=0`;

  return (
    <div className="container mx-auto px-4 py-12 text-black">
      <section className="mb-8 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={presale.token_logo_url || market.logo} alt={`${presale.token_name} logo`} />
          <AvatarFallback>{presale.token_symbol.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold">{presale.project_name || presale.token_name} ({presale.token_symbol})</h1>
          <p className="text-lg text-gray-500">Created by @{presale.owner_address.slice(0, 6)}...{presale.owner_address.slice(-4)}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="w-full h-[600px] overflow-hidden">
            <iframe
              src={dexScreenerUrl}
              className="w-full h-full border-0"
              allowFullScreen
            ></iframe>
          </Card>
        </div>

        <div>
          <SwapForm market={market} />
        </div>
      </div>
    </div>
  );
}
