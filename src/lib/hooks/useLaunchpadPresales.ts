import { useEffect, useMemo } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { erc20Abi, type Address } from 'viem';
import { PresaleFactoryContract, LaunchpadPresaleContract } from '@/config/config';
import {
  useLaunchpadPresaleStore,
  type PresaleData,
  type PresaleStatus
} from '@/lib/store/launchpad-presale-store';

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

  const cachedAddresses = getPresaleAddresses();
  const isStale = isPresaleAddressesStale();
  const shouldFetchAddresses = isStale || forceRefetch || !cachedAddresses;

  // Fetch total number of presales
  const { data: totalPresales, isLoading: isLoadingTotal, refetch: refetchTotal } = useReadContract({
    abi: PresaleFactoryContract.abi,
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
      abi: PresaleFactoryContract.abi,
      address: PresaleFactoryContract.address as Address,
      functionName: 'allPresales' as const,
      args: [BigInt(i)],
    }));
  }, [totalPresales]);

  const { data: addressResults, isLoading: isLoadingAddresses, refetch: refetchAddresses } = useReadContracts({
    contracts: addressQueries,
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
      abi: typeof LaunchpadPresaleContract.abi;
      address: Address;
      functionName: string;
    }> = [];

    for (const addr of addressesToFetch) {
      // Read all presale state
      queries.push(
        { abi: LaunchpadPresaleContract.abi, address: addr, functionName: 'saleToken' },
        { abi: LaunchpadPresaleContract.abi, address: addr, functionName: 'paymentToken' },
        { abi: LaunchpadPresaleContract.abi, address: addr, functionName: 'isPaymentETH' },
        { abi: LaunchpadPresaleContract.abi, address: addr, functionName: 'startTime' },
        { abi: LaunchpadPresaleContract.abi, address: addr, functionName: 'endTime' },
        { abi: LaunchpadPresaleContract.abi, address: addr, functionName: 'rate' },
        { abi: LaunchpadPresaleContract.abi, address: addr, functionName: 'softCap' },
        { abi: LaunchpadPresaleContract.abi, address: addr, functionName: 'hardCap' },
        { abi: LaunchpadPresaleContract.abi, address: addr, functionName: 'minContribution' },
        { abi: LaunchpadPresaleContract.abi, address: addr, functionName: 'maxContribution' },
        { abi: LaunchpadPresaleContract.abi, address: addr, functionName: 'totalRaised' },
        { abi: LaunchpadPresaleContract.abi, address: addr, functionName: 'committedTokens' },
        { abi: LaunchpadPresaleContract.abi, address: addr, functionName: 'totalTokensDeposited' },
        { abi: LaunchpadPresaleContract.abi, address: addr, functionName: 'claimEnabled' },
        { abi: LaunchpadPresaleContract.abi, address: addr, functionName: 'refundsEnabled' },
        { abi: LaunchpadPresaleContract.abi, address: addr, functionName: 'owner' },
      );
    }
    return queries;
  }, [addressesToFetch]);

  const { data: presaleDataResults, isLoading: isLoadingPresaleData } = useReadContracts({
    contracts: presaleDataQueries,
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

      const presale: PresaleData = {
        address: addr,
        saleToken: presaleDataResults[baseIdx]?.result as Address,
        paymentToken: presaleDataResults[baseIdx + 1]?.result as Address,
        isPaymentETH: presaleDataResults[baseIdx + 2]?.result as boolean,
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
  }, [presaleDataResults, addressesToFetch]);

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
    contracts: tokenInfoQueries,
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

  const shouldFetch = presaleAddress && (isPresaleStale(presaleAddress) || forceRefetch);

  // Fetch presale data
  const presaleDataQueries = useMemo(() => {
    if (!presaleAddress || !shouldFetch) return [];
    return [
      { abi: LaunchpadPresaleContract.abi, address: presaleAddress, functionName: 'saleToken' as const },
      { abi: LaunchpadPresaleContract.abi, address: presaleAddress, functionName: 'paymentToken' as const },
      { abi: LaunchpadPresaleContract.abi, address: presaleAddress, functionName: 'isPaymentETH' as const },
      { abi: LaunchpadPresaleContract.abi, address: presaleAddress, functionName: 'startTime' as const },
      { abi: LaunchpadPresaleContract.abi, address: presaleAddress, functionName: 'endTime' as const },
      { abi: LaunchpadPresaleContract.abi, address: presaleAddress, functionName: 'rate' as const },
      { abi: LaunchpadPresaleContract.abi, address: presaleAddress, functionName: 'softCap' as const },
      { abi: LaunchpadPresaleContract.abi, address: presaleAddress, functionName: 'hardCap' as const },
      { abi: LaunchpadPresaleContract.abi, address: presaleAddress, functionName: 'minContribution' as const },
      { abi: LaunchpadPresaleContract.abi, address: presaleAddress, functionName: 'maxContribution' as const },
      { abi: LaunchpadPresaleContract.abi, address: presaleAddress, functionName: 'totalRaised' as const },
      { abi: LaunchpadPresaleContract.abi, address: presaleAddress, functionName: 'committedTokens' as const },
      { abi: LaunchpadPresaleContract.abi, address: presaleAddress, functionName: 'totalTokensDeposited' as const },
      { abi: LaunchpadPresaleContract.abi, address: presaleAddress, functionName: 'claimEnabled' as const },
      { abi: LaunchpadPresaleContract.abi, address: presaleAddress, functionName: 'refundsEnabled' as const },
      { abi: LaunchpadPresaleContract.abi, address: presaleAddress, functionName: 'owner' as const },
    ];
  }, [presaleAddress, shouldFetch]);

  const { data: presaleDataResults, isLoading: isLoadingPresaleData, refetch: refetchPresale } = useReadContracts({
    contracts: presaleDataQueries,
    query: {
      enabled: presaleDataQueries.length > 0,
    },
  });

  // Parse presale data
  const presaleData = useMemo((): PresaleData | null => {
    if (!presaleAddress) return null;
    if (!presaleDataResults || presaleDataResults.length === 0) {
      return getPresale(presaleAddress);
    }

    return {
      address: presaleAddress,
      saleToken: presaleDataResults[0]?.result as Address,
      paymentToken: presaleDataResults[1]?.result as Address,
      isPaymentETH: presaleDataResults[2]?.result as boolean,
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
  }, [presaleAddress, presaleDataResults, getPresale]);

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
    contracts: tokenInfoQueries,
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

  // Update cache
  useEffect(() => {
    if (completePresale && !isLoadingPresaleData && !isLoadingTokenInfo) {
      setPresale(completePresale.address, completePresale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completePresale, isLoadingPresaleData, isLoadingTokenInfo]);

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
        abi: LaunchpadPresaleContract.abi,
        address: presaleAddress,
        functionName: 'contributions' as const,
        args: [userAddress]
      },
      {
        abi: LaunchpadPresaleContract.abi,
        address: presaleAddress,
        functionName: 'purchasedTokens' as const,
        args: [userAddress]
      },
    ];
  }, [presaleAddress, userAddress, shouldFetch]);

  const { data: userDataResults, isLoading, refetch } = useReadContracts({
    contracts: userDataQueries,
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
