"use client"
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { MarketCard } from "@/components/ui/market-card";
import { useCachedMarkets } from "@/lib/hooks/useCachedMarkets";

const filterOptions = [
  { label: "All", value: "all" },
  { label: "New Launches", value: "new" },
  { label: "Top Market Cap", value: "top" },
];

export default function MarketsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { markets, isLoading } = useCachedMarkets();

  const sortedMarkets = [...markets].sort((a, b) => {
    if (!a || !b) return 0;
    switch (activeFilter) {
      case "new":
        return b.createdAt.getTime() - a.createdAt.getTime();
      case "top":
        return b.marketCap - a.marketCap;
      default:
        return 0; // No specific sort for "all"
    }
  });

  const filteredMarkets = sortedMarkets.filter(market => {
    if (!market) return false;
    const matchesSearch = market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-6 py-20 max-w-7xl">
        <div className="mb-20">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-none mb-6 tracking-tight">
            Live<br />Markets
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-2xl">
            Discover and trade the latest tokens on the Reactive network.
          </p>
        </div>

        <div className="mb-16 space-y-6">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black w-6 h-6" />
            <Input
              placeholder="SEARCH MARKETS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-16 w-full h-16 text-lg border-2 border-black focus:ring-0 focus:border-black font-medium uppercase placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-3">
            {filterOptions.map(filter => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`px-6 py-3 text-sm font-bold uppercase tracking-wider border-2 border-black transition-all ${activeFilter === filter.value
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-black hover:text-white"
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center">Loading markets...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map((market) => (
              market && <MarketCard market={market} key={market.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}