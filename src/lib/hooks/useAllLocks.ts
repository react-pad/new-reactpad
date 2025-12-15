import { TokenLocker } from "@/lib/config";
import type { Address } from "viem";
import { useReadContract } from "wagmi";

export function useAllLocks({ enabled = true }: { enabled?: boolean }) {
    const { data: totalLocksData, isLoading: isLoadingTotal, refetch: refetchTotal } = useReadContract({
        address: TokenLocker.address as Address,
        abi: TokenLocker.abi,
        functionName: 'totalLocks',
        query: {
            enabled,
        }
    });

    const totalLocks = totalLocksData ? Number(totalLocksData) : 0;
    const lockIds = Array.from({ length: totalLocks }, (_, i) => BigInt(i));

    const refetch = async () => {
        await refetchTotal();
    }

    return {
        lockIds,
        isLoading: isLoadingTotal,
        refetch
    };
}