import { useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { TokenFactory } from '../../config';
import { useChainContracts } from '@/lib/hooks/useChainContracts';
import { useBlockchainStore } from '@/lib/store/blockchain-store';

export function useUserTokens(forceRefetch = false) {
  const { address } = useAccount();
  const { tokenFactory } = useChainContracts();

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
    abi: TokenFactory.abi,
    address: tokenFactory,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isLoading]);

  useEffect(() => {
    if (address && tokens && !isLoading) {
      setUserTokens(address, tokens as `0x${string}`[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, tokens, isLoading]);

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
