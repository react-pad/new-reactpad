

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { SwapForm } from "@/components/ui/swap-form";
import { useMarkets } from "@/lib/hooks/useMarkets";
import { useParams } from "react-router-dom";

export default function MarketDetailPage() {
  const { id } = useParams();
  const { markets, isLoading } = useMarkets();

  if (isLoading) {
    return <div>Loading market...</div>;
  }

  const market = markets.find((m) => m && m.id === id);

  if (!market) {
    return <div>Market not found</div>;
  }

  const dexScreenerUrl = `https://dexscreener.com/reactive-mainnet/${market.pairAddress}?embed=1&theme=dark&info=0`;

  return (
    <div className="container mx-auto px-4 py-12 text-black">
      <section className="mb-8 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={market.logo} alt={`${market.name} logo`} />
          <AvatarFallback>{market.symbol.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold">{market.name} ({market.symbol})</h1>
          <p className="text-lg text-gray-500">Created by @{market.creator}</p>
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
