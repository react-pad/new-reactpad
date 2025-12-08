
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Market {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  creator: string;
  marketCap: number;
  price: number;
  createdAt: Date;
}

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const timeSinceCreation = () => {
    const now = new Date();
    const diff = now.getTime() - market.createdAt.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Link to={`/markets/${market.id}`} className="block">
      <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar>
            <AvatarImage src={market.logo} alt={`${market.name} logo`} />
            <AvatarFallback>{market.symbol.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg font-bold">{market.name}</CardTitle>
            <p className="text-sm text-gray-500">by @{market.creator}</p>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Market Cap</p>
            <p className="font-bold">${market.marketCap.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Price</p>
            <p className="font-bold">${market.price.toLocaleString(undefined, { maximumFractionDigits: 10, minimumFractionDigits: 2 })}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center text-xs text-gray-500">
          <span>{timeSinceCreation()}</span>
          <Button variant="outline" size="sm">Swap</Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
