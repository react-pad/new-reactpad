import { TokenLocker } from '@/config';
import { useMemo } from 'react';
import { erc20Abi, formatUnits, type Address, type Abi } from 'viem';
import { useReadContracts } from 'wagmi';
import { useUserLocks } from './useUserLocks';

interface LockResult {
  token: Address;
  owner: Address;
  amount: bigint;
  lockDate: bigint;
  unlockDate: bigint;
  withdrawn: boolean;
  name: string;
  description: string;
}

export function useAllLocks() {
  const { lockIds, isLoading: isLoadingLocks, refetch: refetchLocks } = useUserLocks();

  const lockQueries = useMemo(() => {
    if (!lockIds || lockIds.length === 0) return [];
    return (lockIds as bigint[]).flatMap(lockId => [
      {
        abi: TokenLocker.abi as Abi,
        address: TokenLocker.address,
        functionName: 'getLock',
        args: [lockId],
      }
    ]);
  }, [lockIds]);

  const { data: lockData, isLoading: isLoadingLockData, refetch: refetchLockData } = useReadContracts({
    contracts: lockQueries,
    query: {
      enabled: !!lockIds && lockIds.length > 0,
    }
  });

  // Get unique token addresses to avoid redundant queries
  const uniqueTokenAddresses = useMemo(() => {
    if (!lockData) return [];
    const tokens = lockData
      .map(d => (d.result as LockResult | undefined)?.token)
      .filter((t): t is `0x${string}` => !!t);
    return [...new Set(tokens)];
  }, [lockData]);

  const tokenInfoQueries = useMemo(() => {
    if (uniqueTokenAddresses.length === 0) return [];
    return uniqueTokenAddresses.flatMap(tokenAddress => [
      {
        abi: erc20Abi,
        address: tokenAddress,
        functionName: 'symbol',
      },
      {
        abi: erc20Abi,
        address: tokenAddress,
        functionName: 'decimals',
      }
    ]);
  }, [uniqueTokenAddresses]);

  const { data: tokenInfoData, isLoading: isLoadingTokenInfo } = useReadContracts({
    contracts: tokenInfoQueries,
    query: {
      enabled: uniqueTokenAddresses.length > 0,
    }
  });

  // Build a map of token address -> {symbol, decimals} for O(1) lookup
  const tokenInfoMap = useMemo(() => {
    if (!tokenInfoData || uniqueTokenAddresses.length === 0) return new Map();

    const map = new Map<string, { symbol: string; decimals: number }>();
    uniqueTokenAddresses.forEach((tokenAddress, i) => {
      const symbol = tokenInfoData[i * 2]?.result as string;
      const decimals = tokenInfoData[i * 2 + 1]?.result as number;
      if (tokenAddress) {
        map.set(tokenAddress.toLowerCase(), { symbol, decimals });
      }
    });
    return map;
  }, [tokenInfoData, uniqueTokenAddresses]);

  const locks = useMemo(() => {
    if (!lockData || !lockIds) return [];

    return lockData.map((d, i) => {
      const lock = d.result as LockResult | undefined;
      if (!lock) return null;

      const tokenAddress = lock.token as `0x${string}`;
      const tokenInfo = tokenAddress ? tokenInfoMap.get(tokenAddress.toLowerCase()) : undefined;
      const tokenSymbol = tokenInfo?.symbol;
      const tokenDecimals = tokenInfo?.decimals;

      const formattedAmount = tokenDecimals !== undefined
        ? formatUnits(lock.amount, tokenDecimals)
        : lock.amount.toString();

      return {
        id: lockIds[i],
        ...lock,
        tokenSymbol,
        formattedAmount,
      };
    }).filter(l => l !== null);

  }, [lockData, tokenInfoMap, lockIds]);

  const refetch = () => {
    refetchLocks();
    refetchLockData();
  }

  return {
    locks,
    isLoading: isLoadingLocks || isLoadingLockData || isLoadingTokenInfo,
    refetch,
  };
}
