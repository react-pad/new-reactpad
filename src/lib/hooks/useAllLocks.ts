import { useMemo } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { erc20Abi, formatUnits } from 'viem';
import { TokenLocker } from '@/lib/config';
import { useUserLocks } from './useUserLocks';

export function useAllLocks() {
  const { } = useAccount();
  const { lockIds, isLoading: isLoadingLocks, refetch: refetchLocks } = useUserLocks();

  const lockQueries = useMemo(() => {
    if (!lockIds || lockIds.length === 0) return [];
    return (lockIds as bigint[]).flatMap(lockId => [
      {
        abi: TokenLocker.abi,
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

  const tokenAddresses = useMemo(() => {
    if (!lockData) return [];
    return lockData.map(d => (d.result as any)?.token as `0x${string}`).filter(t => t);
  }, [lockData]);

  const tokenInfoQueries = useMemo(() => {
    if (tokenAddresses.length === 0) return [];
    return tokenAddresses.flatMap(tokenAddress => [
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
  }, [tokenAddresses]);

  const { data: tokenInfoData, isLoading: isLoadingTokenInfo } = useReadContracts({
    contracts: tokenInfoQueries,
    query: {
      enabled: tokenAddresses.length > 0,
    }
  });

  const locks = useMemo(() => {
    if (!lockData || !tokenInfoData) return [];
    
    return lockData.map((d, i) => {
      const lock = d.result as any;
      if (!lock) return null;

      const tokenSymbol = tokenInfoData[i * 2]?.result as string;
      const tokenDecimals = tokenInfoData[i * 2 + 1]?.result as number;

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

  }, [lockData, tokenInfoData, lockIds]);

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
