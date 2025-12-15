import { useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { TokenLocker } from '@/lib/config';
import { useBlockchainStore } from '@/lib/store/blockchain-store';

export function useUserLocks(forceRefetch = false) {
  const { address } = useAccount();

  const {
    getUserLocks,
    setUserLocks,
    setUserLocksLoading,
    isUserLocksStale,
  } = useBlockchainStore();

  const cachedLockIds = address ? getUserLocks(address) : null;
  const isStale = address ? isUserLocksStale(address) : true;
  const shouldFetch = address && (isStale || forceRefetch || !cachedLockIds);

  const { data: lockIds, isLoading, refetch } = useReadContract({
    abi: TokenLocker.abi,
    address: TokenLocker.address,
    functionName: 'locksOfOwner',
    args: [address as `0x${string}`],
    query: {
      enabled: shouldFetch,
    },
  });

  useEffect(() => {
    if (address && isLoading) {
      setUserLocksLoading(address, true);
    }
  }, [address, isLoading, setUserLocksLoading]);

  useEffect(() => {
    if (address && lockIds && !isLoading) {
      setUserLocks(address, lockIds as bigint[]);
    }
  }, [address, lockIds, isLoading, setUserLocks]);

  const handleRefetch = async () => {
    if (address) {
      setUserLocksLoading(address, true);
      await refetch();
    }
  };

  return {
    lockIds: cachedLockIds || (lockIds as bigint[]) || [],
    isLoading: address ? isLoading : false,
    refetch: handleRefetch,
  };
}
