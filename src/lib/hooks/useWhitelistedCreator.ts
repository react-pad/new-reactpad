import { useReadContract } from "wagmi";
import { PresaleFactory } from "@/config";
import type { Address } from "viem";

/**
 * Hook to check if a creator address is whitelisted in the PresaleFactory
 */
export function useWhitelistedCreator(creatorAddress: Address | undefined) {
  const { data: isWhitelisted, isLoading } = useReadContract({
    address: PresaleFactory.address as Address,
    abi: PresaleFactory.abi,
    functionName: "whitelistedCreators",
    args: creatorAddress ? [creatorAddress] : undefined,
    query: {
      enabled: Boolean(creatorAddress),
    },
  });

  return {
    isWhitelisted: isWhitelisted as boolean | undefined,
    isLoading,
  };
}

