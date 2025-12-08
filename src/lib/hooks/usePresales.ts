import { useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { PresaleFactoryContract } from '@/lib/config';
import { useBlockchainStore } from '@/lib/store/blockchain-store';

export function usePresales(forceRefetch = false) {
  const {
    getPresales,
    setPresales,
    setPresalesLoading,
    isPresalesStale,
  } = useBlockchainStore();

  const cachedPresales = getPresales();
  const isStale = isPresalesStale();
  const shouldFetch = isStale || forceRefetch || !cachedPresales;

  const { data: presales, isLoading, refetch } = useReadContract({
    abi: PresaleFactoryContract.abi,
    address: PresaleFactoryContract.address,
    functionName: 'allPresales',
    query: {
      enabled: shouldFetch,
    },
  });

  useEffect(() => {
    if (shouldFetch && isLoading) {
      setPresalesLoading(true);
    }
  }, [shouldFetch, isLoading, setPresalesLoading]);

  useEffect(() => {
    if (presales && !isLoading) {
      setPresales(presales as `0x${string}`[]);
    }
  }, [presales, isLoading, setPresales]);

  const handleRefetch = async () => {
    setPresalesLoading(true);
    await refetch();
  };

  return {
    presales: cachedPresales || (presales as `0x${string}`[]) || [],
    isLoading: shouldFetch ? isLoading : false,
    refetch: handleRefetch,
  };
}
