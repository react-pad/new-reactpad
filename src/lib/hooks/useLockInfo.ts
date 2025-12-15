import { useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { TokenLocker } from '@/lib/config';
import { useBlockchainStore, type TokenLock } from '@/lib/store/blockchain-store';

export function useLockInfo(lockId: bigint) {
  const { address } = useAccount();

  const { getUserLock, setUserLock } = useBlockchainStore();

  const cachedLock = address ? getUserLock(address, lockId) : null;

  const { data: lock, isLoading, refetch } = useReadContract({
    abi: TokenLocker.abi,
    address: TokenLocker.address,
    functionName: 'getLock',
    args: [lockId],
    query: {
      enabled: !cachedLock,
    },
  });

  useEffect(() => {
    if (address && lock && !isLoading) {
      const lockData = lock as {
        token: `0x${string}`;
        amount: bigint;
        unlockDate: bigint;
        name: string;
        description: string;
        withdrawn: boolean;
        owner: `0x${string}`;
      };
      const tokenLock: TokenLock = {
        id: lockId,
        token: lockData.token,
        amount: lockData.amount,
        unlockDate: lockData.unlockDate,
        name: lockData.name,
        description: lockData.description,
        withdrawn: lockData.withdrawn,
        owner: lockData.owner,
      };
      setUserLock(address, lockId, tokenLock);
    }
  }, [address, lock, isLoading, lockId, setUserLock]);

  return {
    lock: cachedLock || lock,
    isLoading,
    refetch,
  };
}
