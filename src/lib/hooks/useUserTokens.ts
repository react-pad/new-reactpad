import { useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { TokenFactoryContract } from '@/lib/config';
import { useBlockchainStore } from '@/lib/store/blockchain-store';

export function useUserTokens(forceRefetch = false) {
  const { address } = useAccount();

  const {
    getUserTokens,
    setUserTokens,
    setUserTokensLoading,
    isUserTokensStale,
  } = useBlockchainStore();

  const cachedTokens = address ? getUserTokens(address) : null;
  const isStale = address ? isUserTokensStale(address) : true;
  const shouldFetch = address && (isStale || forceRefetch || !cachedTokens);

  const { data: tokens, isLoading, refetch } = useReadContract({
    abi: TokenFactoryContract.abi,
    address: TokenFactoryContract.address,
    functionName: 'tokensCreatedBy',
    args: [address as `0x${string}`],
    query: {
      enabled: shouldFetch,
    },
  });

  useEffect(() => {
    if (address && isLoading) {
      setUserTokensLoading(address, true);
    }
  }, [address, isLoading, setUserTokensLoading]);

  useEffect(() => {
    if (address && tokens && !isLoading) {
      setUserTokens(address, tokens as `0x${string}`[]);
    }
  }, [address, tokens, isLoading, setUserTokens]);

  const handleRefetch = async () => {
    if (address) {
      setUserTokensLoading(address, true);
      await refetch();
    }
  };

  return {
    tokens: cachedTokens || (tokens as `0x${string}`[]) || [],
    isLoading: address ? isLoading : false,
    refetch: handleRefetch,
  };
}
