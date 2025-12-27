import { useEffect, useMemo, useState, useRef } from 'react';
import { usePublicClient, useReadContract, useReadContracts } from 'wagmi';
import { erc20Abi, parseAbiItem, type Abi, type Address, type PublicClient } from 'viem';
import { PresaleFactoryContract, LaunchpadPresaleContract } from '@/config/config';
import {
  useLaunchpadPresaleStore,
  type PresaleData,
  type PresaleStatus
} from '@/lib/store/launchpad-presale-store';

const PRESALE_CREATED_EVENT = parseAbiItem(
  'event PresaleCreated(address indexed creator, address indexed presale, address indexed saleToken, address paymentToken, bool requiresWhitelist)'
);

type WhitelistMap = Record<string, boolean>;

async function fetchAllWhitelistFlags(client: PublicClient): Promise<WhitelistMap> {
  const logs = await client.getLogs({
    address: PresaleFactoryContract.address as Address,
    event: PRESALE_CREATED_EVENT,
    fromBlock: 0n,
  });

  const map: WhitelistMap = {};
  for (const log of logs) {
    const presaleAddr = (log.args?.presale as Address | undefined)?.toLowerCase();
    if (presaleAddr) {
      map[presaleAddr] = Boolean(log.args?.requiresWhitelist);
    }
  }
  return map;
}

async function fetchWhitelistFlag(client: PublicClient, presaleAddress: Address): Promise<boolean> {
  const logs = await client.getLogs({
    address: PresaleFactoryContract.address as Address,
    event: PRESALE_CREATED_EVENT,
    args: { presale: presaleAddress },
    fromBlock: 0n,
  });

  if (logs.length === 0) return false;
  const latest = logs[logs.length - 1];
  return Boolean(latest.args?.requiresWhitelist);
}

const presaleFactoryAbi = PresaleFactoryContract.abi as unknown as Abi;
const launchpadPresaleAbi = LaunchpadPresaleContract.abi as unknown as Abi;

export type LaunchpadPresaleFilter = 'all' | 'live' | 'upcoming' | 'ended' | 'finalized' | 'cancelled';

export interface PresaleWithStatus extends PresaleData {
  status: PresaleStatus;
  progress: number; // 0-100
}

export function useLaunchpadPresales(filter: LaunchpadPresaleFilter = 'all', forceRefetch = false) {
  const {
    getPresaleAddresses,
    setPresaleAddresses,
    setPresaleAddressesLoading,
    isPresaleAddressesStale,
    setPresale,
    getPresale,
    isPresaleStale,
    getPresaleStatus,
  } = useLaunchpadPresaleStore();

  const publicClient = usePublicClient();
  const [whitelistMap, setWhitelistMap] = useState<WhitelistMap>({});

  const cachedAddresses = getPresaleAddresses();
  const isStale = isPresaleAddressesStale();
  const shouldFetchAddresses = isStale || forceRefetch || !cachedAddresses;

  // Fetch total number of presales
  const { data: totalPresales, isLoading: isLoadingTotal, refetch: refetchTotal } = useReadContract({
    abi: presaleFactoryAbi,
    address: PresaleFactoryContract.address as Address,
    functionName: 'totalPresales',
    query: {
      enabled: shouldFetchAddresses,
    },
  });

  // Build queries to fetch all presale addresses
  const addressQueries = useMemo(() => {
    if (!totalPresales || totalPresales === 0n) return [];
    const count = Number(totalPresales);
    return Array.from({ length: count }, (_, i) => ({
      abi: presaleFactoryAbi,
      address: PresaleFactoryContract.address as Address,
      functionName: 'allPresales' as const,
      args: [BigInt(i)],
    }));
  }, [totalPresales]);

  const { data: addressResults, isLoading: isLoadingAddresses, refetch: refetchAddresses } = useReadContracts({
    contracts: addressQueries as any,
    query: {
      enabled: addressQueries.length > 0,
    },
  });

  // Extract addresses from results
  const presaleAddresses = useMemo(() => {
    if (!addressResults) return cachedAddresses || [];
    return addressResults
      .map((r) => r.result as Address | undefined)
      .filter((addr): addr is Address => !!addr);
  }, [addressResults, cachedAddresses]);

  const unknownWhitelistCount = useMemo(() => {
    if (!presaleAddresses || presaleAddresses.length === 0) return 0;
    return presaleAddresses.reduce((count, addr) => {
      return count + (whitelistMap[addr.toLowerCase()] === undefined ? 1 : 0);
    }, 0);
  }, [presaleAddresses, whitelistMap]);

  useEffect(() => {
    if (!publicClient) return;
    if (!presaleAddresses || presaleAddresses.length === 0) return;
    if (unknownWhitelistCount === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const latest = await fetchAllWhitelistFlags(publicClient);
        if (!cancelled) {
          setWhitelistMap((prev) => ({ ...prev, ...latest }));
        }
      } catch (error) {
        console.error('Failed to read whitelist flags', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publicClient, presaleAddresses, unknownWhitelistCount]);

  // Update cache when addresses are fetched
  useEffect(() => {
    if (presaleAddresses.length > 0 && !isLoadingAddresses && addressResults) {
      // Only update if we have new data from the blockchain
      const currentCache = getPresaleAddresses();
      const hasChanged = !currentCache ||
        currentCache.length !== presaleAddresses.length ||
        currentCache.some((addr, i) => addr !== presaleAddresses[i]);

      if (hasChanged) {
        setPresaleAddresses(presaleAddresses);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressResults, isLoadingAddresses]);

  useEffect(() => {
    if (shouldFetchAddresses && (isLoadingTotal || isLoadingAddresses)) {
      setPresaleAddressesLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchAddresses, isLoadingTotal, isLoadingAddresses]);

  // Filter addresses that need fresh data
  const addressesToFetch = useMemo(() => {
    return presaleAddresses.filter((addr) => isPresaleStale(addr) || forceRefetch);
  }, [presaleAddresses, isPresaleStale, forceRefetch]);

  // Build queries for presale data
  const presaleDataQueries = useMemo(() => {
    if (addressesToFetch.length === 0) return [];

    const queries: Array<{
      abi: Abi;
      address: Address;
      functionName: string;
    }> = [];

    for (const addr of addressesToFetch) {
      // Read all presale state
      queries.push(
        { abi: launchpadPresaleAbi, address: addr, functionName: 'saleToken' },
        { abi: launchpadPresaleAbi, address: addr, functionName: 'paymentToken' },
        { abi: launchpadPresaleAbi, address: addr, functionName: 'isPaymentETH' },
        { abi: launchpadPresaleAbi, address: addr, functionName: 'startTime' },
        { abi: launchpadPresaleAbi, address: addr, functionName: 'endTime' },
        { abi: launchpadPresaleAbi, address: addr, functionName: 'rate' },
        { abi: launchpadPresaleAbi, address: addr, functionName: 'softCap' },
        { abi: launchpadPresaleAbi, address: addr, functionName: 'hardCap' },
        { abi: launchpadPresaleAbi, address: addr, functionName: 'minContribution' },
        { abi: launchpadPresaleAbi, address: addr, functionName: 'maxContribution' },
        { abi: launchpadPresaleAbi, address: addr, functionName: 'totalRaised' },
        { abi: launchpadPresaleAbi, address: addr, functionName: 'committedTokens' },
        { abi: launchpadPresaleAbi, address: addr, functionName: 'totalTokensDeposited' },
        { abi: launchpadPresaleAbi, address: addr, functionName: 'claimEnabled' },
        { abi: launchpadPresaleAbi, address: addr, functionName: 'refundsEnabled' },
        { abi: launchpadPresaleAbi, address: addr, functionName: 'owner' },
      );
    }
    return queries;
  }, [addressesToFetch]);

  const { data: presaleDataResults, isLoading: isLoadingPresaleData } = useReadContracts({
    contracts: presaleDataQueries as any,
    query: {
      enabled: presaleDataQueries.length > 0,
    },
  });

  // Parse presale data and update cache
  const parsedPresales = useMemo(() => {
    if (!presaleDataResults || addressesToFetch.length === 0) return [];

    const FIELDS_PER_PRESALE = 16;
    const parsed: PresaleData[] = [];

    for (let i = 0; i < addressesToFetch.length; i++) {
      const baseIdx = i * FIELDS_PER_PRESALE;
      const addr = addressesToFetch[i];
      const whitelistKey = addr.toLowerCase();

      const presale: PresaleData = {
        address: addr,
        saleToken: presaleDataResults[baseIdx]?.result as Address,
        paymentToken: presaleDataResults[baseIdx + 1]?.result as Address,
        isPaymentETH: presaleDataResults[baseIdx + 2]?.result as boolean,
        requiresWhitelist: whitelistMap[whitelistKey] ?? false,
        startTime: presaleDataResults[baseIdx + 3]?.result as bigint,
        endTime: presaleDataResults[baseIdx + 4]?.result as bigint,
        rate: presaleDataResults[baseIdx + 5]?.result as bigint,
        softCap: presaleDataResults[baseIdx + 6]?.result as bigint,
        hardCap: presaleDataResults[baseIdx + 7]?.result as bigint,
        minContribution: presaleDataResults[baseIdx + 8]?.result as bigint,
        maxContribution: presaleDataResults[baseIdx + 9]?.result as bigint,
        totalRaised: presaleDataResults[baseIdx + 10]?.result as bigint,
        committedTokens: presaleDataResults[baseIdx + 11]?.result as bigint,
        totalTokensDeposited: presaleDataResults[baseIdx + 12]?.result as bigint,
        claimEnabled: presaleDataResults[baseIdx + 13]?.result as boolean,
        refundsEnabled: presaleDataResults[baseIdx + 14]?.result as boolean,
        owner: presaleDataResults[baseIdx + 15]?.result as Address,
      };

      parsed.push(presale);
    }

    return parsed;
  }, [presaleDataResults, addressesToFetch, whitelistMap]);

  // Get unique token addresses for fetching token info
  const uniqueTokenAddresses = useMemo(() => {
    const tokens = new Set<Address>();
    for (const presale of parsedPresales) {
      if (presale.saleToken) tokens.add(presale.saleToken);
      if (presale.paymentToken && !presale.isPaymentETH) tokens.add(presale.paymentToken);
    }
    return Array.from(tokens);
  }, [parsedPresales]);

  // Fetch token info
  const tokenInfoQueries = useMemo(() => {
    if (uniqueTokenAddresses.length === 0) return [];
    return uniqueTokenAddresses.flatMap((addr) => [
      { abi: erc20Abi, address: addr, functionName: 'symbol' as const },
      { abi: erc20Abi, address: addr, functionName: 'name' as const },
      { abi: erc20Abi, address: addr, functionName: 'decimals' as const },
    ]);
  }, [uniqueTokenAddresses]);

  const { data: tokenInfoResults, isLoading: isLoadingTokenInfo } = useReadContracts({
    contracts: tokenInfoQueries as any,
    query: {
      enabled: tokenInfoQueries.length > 0,
    },
  });

  // Build token info map
  const tokenInfoMap = useMemo(() => {
    if (!tokenInfoResults || uniqueTokenAddresses.length === 0) return new Map();

    const map = new Map<string, { symbol: string; name: string; decimals: number }>();
    for (let i = 0; i < uniqueTokenAddresses.length; i++) {
      const addr = uniqueTokenAddresses[i];
      const symbol = tokenInfoResults[i * 3]?.result as string;
      const name = tokenInfoResults[i * 3 + 1]?.result as string;
      const decimals = tokenInfoResults[i * 3 + 2]?.result as number;
      map.set(addr.toLowerCase(), { symbol, name, decimals });
    }
    return map;
  }, [tokenInfoResults, uniqueTokenAddresses]);

  // Update cache with complete presale data
  useEffect(() => {
    if (parsedPresales.length > 0 && !isLoadingPresaleData && !isLoadingTokenInfo) {
      for (const presale of parsedPresales) {
        const saleTokenInfo = presale.saleToken
          ? tokenInfoMap.get(presale.saleToken.toLowerCase())
          : undefined;
        const paymentTokenInfo = presale.paymentToken && !presale.isPaymentETH
          ? tokenInfoMap.get(presale.paymentToken.toLowerCase())
          : undefined;

        setPresale(presale.address, {
          ...presale,
          saleTokenSymbol: saleTokenInfo?.symbol,
          saleTokenName: saleTokenInfo?.name,
          saleTokenDecimals: saleTokenInfo?.decimals,
          paymentTokenSymbol: presale.isPaymentETH ? 'ETH' : paymentTokenInfo?.symbol,
          paymentTokenName: presale.isPaymentETH ? 'Ethereum' : paymentTokenInfo?.name,
          paymentTokenDecimals: presale.isPaymentETH ? 18 : paymentTokenInfo?.decimals,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedPresales, tokenInfoMap, isLoadingPresaleData, isLoadingTokenInfo]);

  // Get all presales with status and progress
  const allPresales = useMemo((): PresaleWithStatus[] => {
    return presaleAddresses.map((addr) => {
      const cached = getPresale(addr);
      if (!cached) return null;

      const status = getPresaleStatus(cached);
      const progress = cached.hardCap && cached.hardCap > 0n
        ? Number((cached.totalRaised * 100n) / cached.hardCap)
        : 0;

      return {
        ...cached,
        status,
        progress: Math.min(progress, 100),
      };
    }).filter((p): p is PresaleWithStatus => p !== null);
  }, [presaleAddresses, getPresale, getPresaleStatus]);

  // Filter presales by status
  const filteredPresales = useMemo(() => {
    if (filter === 'all') return allPresales;
    return allPresales.filter((p) => p.status === filter);
  }, [allPresales, filter]);

  const refetch = async () => {
    setPresaleAddressesLoading(true);
    await refetchTotal();
    await refetchAddresses();
  };

  const isLoading = isLoadingTotal || isLoadingAddresses || isLoadingPresaleData || isLoadingTokenInfo;

  return {
    presales: filteredPresales,
    allPresales,
    presaleAddresses,
    isLoading,
    refetch,
  };
}

// Hook to get a single presale by address
export function useLaunchpadPresale(presaleAddress: Address | undefined, forceRefetch = false) {
  const {
    getPresale,
    setPresale,
    isPresaleStale,
    getPresaleStatus,
  } = useLaunchpadPresaleStore();

  const publicClient = usePublicClient();
  const cachedPresale = presaleAddress ? getPresale(presaleAddress) : null;
  const [requiresWhitelist, setRequiresWhitelist] = useState<boolean | undefined>(cachedPresale?.requiresWhitelist);

  const shouldFetch = presaleAddress && (isPresaleStale(presaleAddress) || forceRefetch);

  useEffect(() => {
    if (cachedPresale?.requiresWhitelist !== undefined) {
      setRequiresWhitelist(cachedPresale.requiresWhitelist);
    }
  }, [cachedPresale?.requiresWhitelist]);

  useEffect(() => {
    if (!publicClient || !presaleAddress) return;
    if (requiresWhitelist !== undefined) return;

    let cancelled = false;
    (async () => {
      try {
        const flag = await fetchWhitelistFlag(publicClient, presaleAddress);
        if (!cancelled) {
          setRequiresWhitelist(flag);
        }
      } catch (error) {
        console.error('Failed to fetch whitelist flag', error);
        if (!cancelled) {
          setRequiresWhitelist(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publicClient, presaleAddress, requiresWhitelist]);

  // Fetch presale data
  const presaleDataQueries = useMemo(() => {
    if (!presaleAddress || !shouldFetch) return [];
    return [
      { abi: launchpadPresaleAbi, address: presaleAddress, functionName: 'saleToken' as const },
      { abi: launchpadPresaleAbi, address: presaleAddress, functionName: 'paymentToken' as const },
      { abi: launchpadPresaleAbi, address: presaleAddress, functionName: 'isPaymentETH' as const },
      { abi: launchpadPresaleAbi, address: presaleAddress, functionName: 'startTime' as const },
      { abi: launchpadPresaleAbi, address: presaleAddress, functionName: 'endTime' as const },
      { abi: launchpadPresaleAbi, address: presaleAddress, functionName: 'rate' as const },
      { abi: launchpadPresaleAbi, address: presaleAddress, functionName: 'softCap' as const },
      { abi: launchpadPresaleAbi, address: presaleAddress, functionName: 'hardCap' as const },
      { abi: launchpadPresaleAbi, address: presaleAddress, functionName: 'minContribution' as const },
      { abi: launchpadPresaleAbi, address: presaleAddress, functionName: 'maxContribution' as const },
      { abi: launchpadPresaleAbi, address: presaleAddress, functionName: 'totalRaised' as const },
      { abi: launchpadPresaleAbi, address: presaleAddress, functionName: 'committedTokens' as const },
      { abi: launchpadPresaleAbi, address: presaleAddress, functionName: 'totalTokensDeposited' as const },
      { abi: launchpadPresaleAbi, address: presaleAddress, functionName: 'claimEnabled' as const },
      { abi: launchpadPresaleAbi, address: presaleAddress, functionName: 'refundsEnabled' as const },
      { abi: launchpadPresaleAbi, address: presaleAddress, functionName: 'owner' as const },
    ];
  }, [presaleAddress, shouldFetch]);

  const { data: presaleDataResults, isLoading: isLoadingPresaleData, refetch: refetchPresale } = useReadContracts({
    contracts: presaleDataQueries as any,
    query: {
      enabled: presaleDataQueries.length > 0,
    },
  });

  // Parse presale data
  const presaleData = useMemo((): PresaleData | null => {
    if (!presaleAddress) return null;
    if (!presaleDataResults || presaleDataResults.length === 0) {
      return cachedPresale;
    }

    return {
      address: presaleAddress,
      saleToken: presaleDataResults[0]?.result as Address,
      paymentToken: presaleDataResults[1]?.result as Address,
      isPaymentETH: presaleDataResults[2]?.result as boolean,
      requiresWhitelist: requiresWhitelist ?? cachedPresale?.requiresWhitelist ?? false,
      startTime: presaleDataResults[3]?.result as bigint,
      endTime: presaleDataResults[4]?.result as bigint,
      rate: presaleDataResults[5]?.result as bigint,
      softCap: presaleDataResults[6]?.result as bigint,
      hardCap: presaleDataResults[7]?.result as bigint,
      minContribution: presaleDataResults[8]?.result as bigint,
      maxContribution: presaleDataResults[9]?.result as bigint,
      totalRaised: presaleDataResults[10]?.result as bigint,
      committedTokens: presaleDataResults[11]?.result as bigint,
      totalTokensDeposited: presaleDataResults[12]?.result as bigint,
      claimEnabled: presaleDataResults[13]?.result as boolean,
      refundsEnabled: presaleDataResults[14]?.result as boolean,
      owner: presaleDataResults[15]?.result as Address,
    };
  }, [presaleAddress, presaleDataResults, cachedPresale, requiresWhitelist]);

  // Fetch token info
  const tokenAddresses = useMemo(() => {
    if (!presaleData) return [];
    const addrs: Address[] = [];
    if (presaleData.saleToken) addrs.push(presaleData.saleToken);
    if (presaleData.paymentToken && !presaleData.isPaymentETH) addrs.push(presaleData.paymentToken);
    return addrs;
  }, [presaleData]);

  const tokenInfoQueries = useMemo(() => {
    return tokenAddresses.flatMap((addr) => [
      { abi: erc20Abi, address: addr, functionName: 'symbol' as const },
      { abi: erc20Abi, address: addr, functionName: 'name' as const },
      { abi: erc20Abi, address: addr, functionName: 'decimals' as const },
    ]);
  }, [tokenAddresses]);

  const { data: tokenInfoResults, isLoading: isLoadingTokenInfo } = useReadContracts({
    contracts: tokenInfoQueries as any,
    query: {
      enabled: tokenInfoQueries.length > 0,
    },
  });

  // Build complete presale with token info
  const completePresale = useMemo((): PresaleWithStatus | null => {
    if (!presaleData) return null;

    let saleTokenSymbol: string | undefined;
    let saleTokenName: string | undefined;
    let saleTokenDecimals: number | undefined;
    let paymentTokenSymbol: string | undefined;
    let paymentTokenName: string | undefined;
    let paymentTokenDecimals: number | undefined;

    if (tokenInfoResults && tokenAddresses.length > 0) {
      // Sale token is always first
      saleTokenSymbol = tokenInfoResults[0]?.result as string;
      saleTokenName = tokenInfoResults[1]?.result as string;
      saleTokenDecimals = tokenInfoResults[2]?.result as number;

      if (presaleData.isPaymentETH) {
        paymentTokenSymbol = 'ETH';
        paymentTokenName = 'Ethereum';
        paymentTokenDecimals = 18;
      } else if (tokenAddresses.length > 1) {
        paymentTokenSymbol = tokenInfoResults[3]?.result as string;
        paymentTokenName = tokenInfoResults[4]?.result as string;
        paymentTokenDecimals = tokenInfoResults[5]?.result as number;
      }
    }

    const status = getPresaleStatus(presaleData);
    const progress = presaleData.hardCap && presaleData.hardCap > 0n
      ? Number((presaleData.totalRaised * 100n) / presaleData.hardCap)
      : 0;

    return {
      ...presaleData,
      saleTokenSymbol,
      saleTokenName,
      saleTokenDecimals,
      paymentTokenSymbol,
      paymentTokenName,
      paymentTokenDecimals,
      status,
      progress: Math.min(progress, 100),
    };
  }, [presaleData, tokenInfoResults, tokenAddresses, getPresaleStatus]);

  // Track last updated address to prevent infinite loops
  const lastUpdatedAddressRef = useRef<string | null>(null);
  
  // Update cache only when loading completes for a new address
  // Note: We intentionally don't include completePresale in deps to avoid infinite loops
  useEffect(() => {
    if (isLoadingPresaleData || isLoadingTokenInfo || !completePresale) {
      return;
    }
    
    const addressKey = completePresale.address.toLowerCase();
    // Only update if this is a different address than we last updated
    if (lastUpdatedAddressRef.current !== addressKey) {
      setPresale(completePresale.address, completePresale);
      lastUpdatedAddressRef.current = addressKey;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presaleAddress, isLoadingPresaleData, isLoadingTokenInfo]);

  return {
    presale: completePresale,
    isLoading: isLoadingPresaleData || isLoadingTokenInfo,
    refetch: refetchPresale,
  };
}

// Hook to get user's contribution data for a presale
export function useUserPresaleContribution(
  presaleAddress: Address | undefined,
  userAddress: Address | undefined
) {
  const {
    getUserPresaleData,
    setUserPresaleData,
    isUserPresaleDataStale,
    invalidateUserPresaleData,
  } = useLaunchpadPresaleStore();

  const shouldFetch = presaleAddress && userAddress &&
    isUserPresaleDataStale(userAddress, presaleAddress);

  const userDataQueries = useMemo(() => {
    if (!presaleAddress || !userAddress || !shouldFetch) return [];
    return [
      {
        abi: launchpadPresaleAbi,
        address: presaleAddress,
        functionName: 'contributions' as const,
        args: [userAddress]
      },
      {
        abi: launchpadPresaleAbi,
        address: presaleAddress,
        functionName: 'purchasedTokens' as const,
        args: [userAddress]
      },
    ];
  }, [presaleAddress, userAddress, shouldFetch]);

  const { data: userDataResults, isLoading, refetch } = useReadContracts({
    contracts: userDataQueries as any,
    query: {
      enabled: userDataQueries.length > 0,
    },
  });

  const userData = useMemo(() => {
    if (!presaleAddress || !userAddress) return null;

    if (userDataResults && userDataResults.length >= 2) {
      return {
        contribution: userDataResults[0]?.result as bigint ?? 0n,
        purchasedTokens: userDataResults[1]?.result as bigint ?? 0n,
      };
    }

    return getUserPresaleData(userAddress, presaleAddress);
  }, [presaleAddress, userAddress, userDataResults, getUserPresaleData]);

  // Update cache
  useEffect(() => {
    if (userData && presaleAddress && userAddress && !isLoading) {
      setUserPresaleData(userAddress, presaleAddress, userData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, presaleAddress, userAddress, isLoading]);

  const invalidate = () => {
    if (userAddress && presaleAddress) {
      invalidateUserPresaleData(userAddress, presaleAddress);
    }
  };

  return {
    contribution: userData?.contribution ?? 0n,
    purchasedTokens: userData?.purchasedTokens ?? 0n,
    isLoading,
    refetch,
    invalidate,
  };
}
