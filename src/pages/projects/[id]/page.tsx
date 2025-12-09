
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { LaunchpadPresaleContract } from "@/lib/config";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { erc20Abi, formatEther, parseEther } from "viem";
import { useAccount, useReadContract, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export default function ProjectDetailPage() {
  const { id: presaleAddress } = useParams<{
    id: `0x${string}`;
  }>();
  const { address } = useAccount();

  const presaleContract = {
    address: presaleAddress as `0x${string}`,
    abi: LaunchpadPresaleContract.abi,
  } as const;

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { ...presaleContract, functionName: 'saleToken' },
      { ...presaleContract, functionName: 'paymentToken' },
      { ...presaleContract, functionName: 'startTime' },
      { ...presaleContract, functionName: 'endTime' },
      { ...presaleContract, functionName: 'rate' },
      { ...presaleContract, functionName: 'softCap' },
      { ...presaleContract, functionName: 'hardCap' },
      { ...presaleContract, functionName: 'totalRaised' },
      { ...presaleContract, functionName: 'minContribution' },
      { ...presaleContract, functionName: 'maxContribution' },
      { ...presaleContract, functionName: 'claimEnabled' },
      { ...presaleContract, functionName: 'refundsEnabled' },
    ]
  });

  const [saleTokenAddress, paymentTokenAddress, _startTime, _endTime, rate, softCap, hardCap, _totalRaised, _minContribution, _maxContribution, claimEnabled, refundsEnabled] = data || [];

  const { data: tokenData, isLoading: isLoadingTokenData } = useReadContracts({
    contracts: [
      { address: saleTokenAddress?.result, abi: erc20Abi, functionName: 'name' },
      { address: saleTokenAddress?.result, abi: erc20Abi, functionName: 'symbol' },
      { address: paymentTokenAddress?.result, abi: erc20Abi, functionName: 'symbol' },
    ],
    query: {
      enabled: !!saleTokenAddress?.result,
    }
  })

  const [name, symbol, paymentSymbol] = tokenData || [];

  const [contributionAmount, setContributionAmount] = useState("");
  const parsedAmount = useMemo(() => contributionAmount ? parseEther(contributionAmount) : BigInt(0), [contributionAmount]);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: paymentTokenAddress?.result as `0x${string}`,
    functionName: 'allowance',
    args: [address!, presaleAddress as `0x${string}`],
    query: {
      enabled: !!address && !!paymentTokenAddress?.result,
    }
  });

  const { data: contributeHash, writeContract: contribute } = useWriteContract();
  const { data: approveHash, writeContract: approve } = useWriteContract();
  const { data: claimHash, writeContract: claim } = useWriteContract();

  const needsApproval = useMemo(() => {
    if (!allowance || !paymentTokenAddress?.result || paymentTokenAddress.result === '0x0000000000000000000000000000000000000000') return false;
    return allowance < parsedAmount;
  }, [allowance, parsedAmount, paymentTokenAddress?.result]);

  const handleContribute = () => {
    const args: bigint[] = paymentTokenAddress?.result === '0x0000000000000000000000000000000000000000' ? [] : [parsedAmount];
    const value = paymentTokenAddress?.result === '0x0000000000000000000000000000000000000000' ? parsedAmount : undefined;

    contribute({
      ...presaleContract,
      functionName: "contribute",
      args: args as never,
      value
    });
  }

  const handleApprove = () => {
    approve({
      address: paymentTokenAddress?.result as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [presaleAddress as `0x${string}`, parsedAmount]
    })
  }

  const handleClaim = () => {
    claim({ ...presaleContract, functionName: "claimTokens" });
  }

  const { isSuccess: isContributeSuccess } = useWaitForTransactionReceipt({ hash: contributeHash });
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

  useEffect(() => {
    if (isContributeSuccess) {
      toast.success("Contribution successful!");
      refetch();
    }
    if (isApproveSuccess) {
      toast.success("Approval successful!");
      refetchAllowance();
    }
    if (isClaimSuccess) {
      toast.success("Tokens claimed successfully!");
    }
  }, [isContributeSuccess, isApproveSuccess, isClaimSuccess, refetch, refetchAllowance])


  if (isLoading || isLoadingTokenData || !data || !tokenData) {
    return <div>Loading project...</div>;
  }
  const isFinished = claimEnabled?.result || refundsEnabled?.result;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 text-black">
      {/* Header */}
      <section className="mb-8 sm:mb-12 text-right lg:text-left">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">{name?.result as string}</h1>
        <p className="text-lg sm:text-xl text-gray-600">Presale for {name?.result as string}</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {!isFinished ? (
            <Card>
              <CardHeader><CardTitle>Contribute</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Input type="number" placeholder="Amount" className="flex-grow" value={contributionAmount} onChange={e => setContributionAmount(e.target.value)} />
                  {needsApproval ? (
                    <Button onClick={handleApprove} className="w-full sm:w-auto">Approve</Button>
                  ) : (
                    <Button onClick={handleContribute} className="w-full sm:w-auto">Contribute</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader><CardTitle>Presale Finished</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-4">
                {claimEnabled?.result && <Button onClick={handleClaim} className="w-full">Claim Tokens</Button>}
                {refundsEnabled?.result && <Button className="w-full">Claim Refund</Button>}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tokenomics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-sm sm:text-base">Token Name</span>
                <span className="font-bold text-sm sm:text-base text-right break-all max-w-[60%]">{name?.result as string}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm sm:text-base">Ticker</span>
                <span className="font-bold text-sm sm:text-base text-right">{symbol?.result as string}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm sm:text-base">Rate</span>
                <span className="font-bold text-sm sm:text-base text-right break-all max-w-[60%]">{formatEther(rate?.result as bigint ?? BigInt(0))} {symbol?.result as string} per {paymentSymbol?.result ?? "ETH"}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-start">
                <span className="text-sm sm:text-base">Soft Cap</span>
                <span className="font-bold text-sm sm:text-base text-right">{formatEther(softCap?.result as bigint ?? BigInt(0))} {paymentSymbol?.result ?? "ETH"}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm sm:text-base">Hard Cap</span>
                <span className="font-bold text-sm sm:text-base text-right">{formatEther(hardCap?.result as bigint ?? BigInt(0))} {paymentSymbol?.result ?? "ETH"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}