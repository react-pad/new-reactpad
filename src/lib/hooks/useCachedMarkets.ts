import { useEffect, useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import { FactoryContract, PairContract, erc20Abi } from '@/config';
import { useBlockchainStore, type Market } from '@/lib/store/blockchain-store';

export function useCachedMarkets(forceRefetch = false) {
  const {
    getMarkets,
    setMarkets,
    setMarketsLoading,
    isMarketsStale,
  } = useBlockchainStore();

  const cachedMarkets = getMarkets();
  const isStale = isMarketsStale();
  const shouldFetch = isStale || forceRefetch || !cachedMarkets;

  const { data: allPairsLengthData } = useReadContracts({
    contracts: [
      {
        ...FactoryContract,
        functionName: "allPairsLength",
      },
    ],
    query: {
      enabled: shouldFetch,
    },
  });

  const allPairsLength = allPairsLengthData?.[0]?.result
    ? Number(allPairsLengthData[0].result)
    : 0;

  const { data: allPairsData } = useReadContracts({
    contracts: Array.from({ length: allPairsLength }, (_, i) => ({
      ...FactoryContract,
      functionName: "allPairs",
      args: [BigInt(i)],
    })),
    query: {
      enabled: allPairsLength > 0 && shouldFetch,
    },
  });

  const pairAddresses = useMemo(
    () => (allPairsData?.map((d) => d.result).filter(Boolean) as `0x${string}`[] | undefined) || [],
    [allPairsData]
  );

  const { data: pairTokensData } = useReadContracts({
    contracts: pairAddresses.flatMap((pairAddress) => [
      {
        address: pairAddress,
        abi: PairContract.abi,
        functionName: "token0",
      },
      {
        address: pairAddress,
        abi: PairContract.abi,
        functionName: "token1",
      },
      {
        address: pairAddress,
        abi: PairContract.abi,
        functionName: "getReserves",
      }
    ]),
    query: {
      enabled: pairAddresses.length > 0 && shouldFetch,
    },
  });

  const tokenAddresses = useMemo(() => {
    if (!pairTokensData) return [];
    const addresses = new Set<`0x${string}`>();
    for (let i = 0; i < pairTokensData.length; i += 3) {
      if (pairTokensData[i].result) addresses.add(pairTokensData[i].result as `0x${string}`);
      if (pairTokensData[i + 1].result) addresses.add(pairTokensData[i + 1].result as `0x${string}`);
    }
    return Array.from(addresses);
  }, [pairTokensData]);

  const { data: tokensData, isLoading } = useReadContracts({
    contracts: tokenAddresses.flatMap((tokenAddress) => [
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "symbol",
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "name",
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "decimals",
      },
    ]),
    query: {
      enabled: tokenAddresses.length > 0 && shouldFetch,
    }
  });

  const markets = useMemo(() => {
    if (!pairAddresses.length || !pairTokensData || !tokensData) return [];

    const tokenMap = new Map();
    for (let i = 0; i < tokenAddresses.length; i++) {
      const address = tokenAddresses[i];
      const symbol = tokensData?.[i * 3]?.result;
      const name = tokensData?.[i * 3 + 1]?.result;
      const decimals = tokensData?.[i * 3 + 2]?.result;
      tokenMap.set(address, { symbol, name, decimals });
    }

    return pairAddresses.map((pairAddress, index) => {
      const token0Address = pairTokensData[index * 3].result as `0x${string}`;
      const token1Address = pairTokensData[index * 3 + 1].result as `0x${string}`;
      const reserves = pairTokensData[index * 3 + 2].result as [bigint, bigint, number] | undefined;

      const token0 = tokenMap.get(token0Address);
      const token1 = tokenMap.get(token1Address);

      if (!token0 || !token1 || !reserves) return null;

      const price = (Number(reserves[1]) / 10 ** token1.decimals) / (Number(reserves[0]) / 10 ** token0.decimals);

      return {
        id: pairAddress,
        pairAddress,
        token0: { ...token0, address: token0Address },
        token1: { ...token1, address: token1Address },
        reserves,
        price,
        name: `${token0.symbol}-${token1.symbol} Pair`,
        symbol: `${token0.symbol}/${token1.symbol}`,
        logo: "https://placehold.co/60x60/8B5CF6/FFFFFF?text=PAIR",
        creator: 'reactive-factory',
        marketCap: 0,
        createdAt: new Date(),
      };
    }).filter(Boolean) as Market[];
  }, [pairAddresses, pairTokensData, tokensData, tokenAddresses]);

  useEffect(() => {
    if (shouldFetch && isLoading) {
      setMarketsLoading(true);
    }
  }, [shouldFetch, isLoading, setMarketsLoading]);

  useEffect(() => {
    if (markets.length > 0 && !isLoading) {
      setMarkets(markets);
    }
  }, [markets, isLoading, setMarkets]);

  const handleRefetch = () => {
    setMarketsLoading(true);
    // The refetch will happen automatically when shouldFetch becomes true
    // because we'll clear the cache
    if (cachedMarkets) {
      setMarkets([]);
    }
  };

  return {
    markets: cachedMarkets || markets,
    isLoading: shouldFetch ? isLoading : false,
    refetch: handleRefetch,
  };
}
