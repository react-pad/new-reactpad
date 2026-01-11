import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StakingContract, EXPLORER_URL } from "@/config";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  Coins,
  ExternalLink,
  Gift,
  Loader2,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  erc20Abi,
  formatUnits,
  parseUnits,
  type Abi,
  type Address,
} from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

export default function StakingPage() {
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake");
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  const [isApproving, setIsApproving] = useState(false);
  const [approvalHash, setApprovalHash] = useState<`0x${string}`>();
  const [isStaking, setIsStaking] = useState(false);
  const [stakingHash, setStakingHash] = useState<`0x${string}`>();
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [unstakingHash, setUnstakingHash] = useState<`0x${string}`>();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimHash, setClaimHash] = useState<`0x${string}`>();

  const processedApprovalHash = useRef<string | null>(null);
  const processedStakingHash = useRef<string | null>(null);
  const processedUnstakingHash = useRef<string | null>(null);
  const processedClaimHash = useRef<string | null>(null);

  // Read staking token address
  const { data: stakingTokenAddress } = useReadContract({
    address: StakingContract.address as Address,
    abi: StakingContract.abi as Abi,
    functionName: "stakingToken",
  });

  // Read rewards token address
  const { data: rewardsTokenAddress } = useReadContract({
    address: StakingContract.address as Address,
    abi: StakingContract.abi as Abi,
    functionName: "rewardsToken",
  });

  // Read staking token info
  const { data: stakingTokenSymbol } = useReadContract({
    abi: erc20Abi,
    address: stakingTokenAddress as Address,
    functionName: "symbol",
    query: { enabled: !!stakingTokenAddress },
  });

  const { data: stakingTokenDecimals } = useReadContract({
    abi: erc20Abi,
    address: stakingTokenAddress as Address,
    functionName: "decimals",
    query: { enabled: !!stakingTokenAddress },
  });

  // Read rewards token info
  const { data: rewardsTokenSymbol } = useReadContract({
    abi: erc20Abi,
    address: rewardsTokenAddress as Address,
    functionName: "symbol",
    query: { enabled: !!rewardsTokenAddress },
  });

  const { data: rewardsTokenDecimals } = useReadContract({
    abi: erc20Abi,
    address: rewardsTokenAddress as Address,
    functionName: "decimals",
    query: { enabled: !!rewardsTokenAddress },
  });

  // Read user's wallet balance of staking token
  const { data: walletBalance, refetch: refetchWalletBalance } = useReadContract({
    abi: erc20Abi,
    address: stakingTokenAddress as Address,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!stakingTokenAddress },
  });

  // Read allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: stakingTokenAddress as Address,
    functionName: "allowance",
    args: address ? [address, StakingContract.address as Address] : undefined,
    query: { enabled: !!address && !!stakingTokenAddress },
  });

  // Read user's staked balance
  const { data: stakedBalance, refetch: refetchStakedBalance } = useReadContract({
    address: StakingContract.address as Address,
    abi: StakingContract.abi as Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read pending rewards
  const { data: pendingRewards, refetch: refetchPendingRewards } = useReadContract({
    address: StakingContract.address as Address,
    abi: StakingContract.abi as Abi,
    functionName: "pendingRewards",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read total staked (TVL)
  const { data: totalSupply } = useReadContract({
    address: StakingContract.address as Address,
    abi: StakingContract.abi as Abi,
    functionName: "totalSupply",
  });

  // Read staking status
  const { data: stakingStatus } = useReadContract({
    address: StakingContract.address as Address,
    abi: StakingContract.abi as Abi,
    functionName: "stakingStatus",
  });

  // Transaction receipts
  const { isSuccess: isApprovalSuccess, isError: isApprovalError } =
    useWaitForTransactionReceipt({ hash: approvalHash });

  const { isSuccess: isStakingSuccess, isError: isStakingError } =
    useWaitForTransactionReceipt({ hash: stakingHash });

  const { isSuccess: isUnstakingSuccess, isError: isUnstakingError } =
    useWaitForTransactionReceipt({ hash: unstakingHash });

  const { isSuccess: isClaimSuccess, isError: isClaimError } =
    useWaitForTransactionReceipt({ hash: claimHash });

  // Format values
  const decimals = stakingTokenDecimals ?? 18;
  const rewardDecimals = rewardsTokenDecimals ?? 18;

  const formattedWalletBalance = useMemo(() => {
    if (!walletBalance) return "0";
    try {
      return Number(formatUnits(walletBalance as bigint, decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 });
    } catch { return "0"; }
  }, [walletBalance, decimals]);

  const formattedStakedBalance = useMemo(() => {
    if (!stakedBalance) return "0";
    try {
      return Number(formatUnits(stakedBalance as bigint, decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 });
    } catch { return "0"; }
  }, [stakedBalance, decimals]);

  const formattedPendingRewards = useMemo(() => {
    if (!pendingRewards) return "0";
    try {
      return Number(formatUnits(pendingRewards as bigint, rewardDecimals)).toLocaleString(undefined, { maximumFractionDigits: 6 });
    } catch { return "0"; }
  }, [pendingRewards, rewardDecimals]);

  const formattedTotalSupply = useMemo(() => {
    if (!totalSupply) return "0";
    try {
      return Number(formatUnits(totalSupply as bigint, decimals)).toLocaleString(undefined, { maximumFractionDigits: 2 });
    } catch { return "0"; }
  }, [totalSupply, decimals]);

  // Check if approval is needed
  const needsApproval = useMemo(() => {
    if (!stakeAmount || !allowance) return false;
    try {
      const amount = parseUnits(stakeAmount, decimals);
      return (allowance as bigint) < amount;
    } catch { return false; }
  }, [stakeAmount, allowance, decimals]);

  // Has claimable rewards
  const hasClaimableRewards = useMemo(() => {
    if (!pendingRewards) return false;
    return (pendingRewards as bigint) > 0n;
  }, [pendingRewards]);

  // Insufficient balance checks
  const hasInsufficientStakeBalance = useMemo(() => {
    if (!stakeAmount || !walletBalance) return false;
    try {
      const amount = parseUnits(stakeAmount, decimals);
      return amount > (walletBalance as bigint);
    } catch { return false; }
  }, [stakeAmount, walletBalance, decimals]);

  const hasInsufficientUnstakeBalance = useMemo(() => {
    if (!unstakeAmount || !stakedBalance) return false;
    try {
      const amount = parseUnits(unstakeAmount, decimals);
      return amount > (stakedBalance as bigint);
    } catch { return false; }
  }, [unstakeAmount, stakedBalance, decimals]);

  // Handle approval success/error
  useEffect(() => {
    if (isApprovalSuccess && approvalHash && processedApprovalHash.current !== approvalHash) {
      processedApprovalHash.current = approvalHash;
      setIsApproving(false);
      setApprovalHash(undefined);
      refetchAllowance();
      toast.success("Approval successful!");
    }
  }, [isApprovalSuccess, approvalHash, refetchAllowance]);

  useEffect(() => {
    if (isApprovalError && approvalHash && processedApprovalHash.current !== approvalHash) {
      processedApprovalHash.current = approvalHash;
      setIsApproving(false);
      setApprovalHash(undefined);
      toast.error("Approval failed.");
    }
  }, [isApprovalError, approvalHash]);

  // Handle staking success/error
  useEffect(() => {
    if (isStakingSuccess && stakingHash && processedStakingHash.current !== stakingHash) {
      processedStakingHash.current = stakingHash;
      setIsStaking(false);
      setStakingHash(undefined);
      setStakeAmount("");
      refetchWalletBalance();
      refetchStakedBalance();
      refetchPendingRewards();
      toast.success("Staking successful!");
    }
  }, [isStakingSuccess, stakingHash, refetchWalletBalance, refetchStakedBalance, refetchPendingRewards]);

  useEffect(() => {
    if (isStakingError && stakingHash && processedStakingHash.current !== stakingHash) {
      processedStakingHash.current = stakingHash;
      setIsStaking(false);
      setStakingHash(undefined);
      toast.error("Staking failed.");
    }
  }, [isStakingError, stakingHash]);

  // Handle unstaking success/error
  useEffect(() => {
    if (isUnstakingSuccess && unstakingHash && processedUnstakingHash.current !== unstakingHash) {
      processedUnstakingHash.current = unstakingHash;
      setIsUnstaking(false);
      setUnstakingHash(undefined);
      setUnstakeAmount("");
      refetchWalletBalance();
      refetchStakedBalance();
      refetchPendingRewards();
      toast.success("Withdrawal successful!");
    }
  }, [isUnstakingSuccess, unstakingHash, refetchWalletBalance, refetchStakedBalance, refetchPendingRewards]);

  useEffect(() => {
    if (isUnstakingError && unstakingHash && processedUnstakingHash.current !== unstakingHash) {
      processedUnstakingHash.current = unstakingHash;
      setIsUnstaking(false);
      setUnstakingHash(undefined);
      toast.error("Withdrawal failed.");
    }
  }, [isUnstakingError, unstakingHash]);

  // Handle claim success/error
  useEffect(() => {
    if (isClaimSuccess && claimHash && processedClaimHash.current !== claimHash) {
      processedClaimHash.current = claimHash;
      setIsClaiming(false);
      setClaimHash(undefined);
      refetchPendingRewards();
      refetchWalletBalance();
      toast.success("Rewards claimed!");
    }
  }, [isClaimSuccess, claimHash, refetchPendingRewards, refetchWalletBalance]);

  useEffect(() => {
    if (isClaimError && claimHash && processedClaimHash.current !== claimHash) {
      processedClaimHash.current = claimHash;
      setIsClaiming(false);
      setClaimHash(undefined);
      toast.error("Claim failed.");
    }
  }, [isClaimError, claimHash]);

  const handleApprove = async () => {
    if (!address || !stakingTokenAddress || !stakeAmount) return;

    try {
      setIsApproving(true);
      const amount = parseUnits(stakeAmount, decimals);

      const hash = await writeContractAsync({
        address: stakingTokenAddress as Address,
        abi: erc20Abi,
        functionName: "approve",
        args: [StakingContract.address as Address, amount],
      });

      setApprovalHash(hash);
      toast.info("Approving tokens...");
    } catch (err: unknown) {
      setIsApproving(false);
      const message = (err as { shortMessage?: string })?.shortMessage || "Approval failed";
      toast.error(message);
    }
  };

  const handleStake = async () => {
    if (!address || !stakeAmount) return;

    try {
      setIsStaking(true);
      const amount = parseUnits(stakeAmount, decimals);

      const hash = await writeContractAsync({
        address: StakingContract.address as Address,
        abi: StakingContract.abi as Abi,
        functionName: "stake",
        args: [amount],
      });

      setStakingHash(hash);
      toast.info("Staking tokens...");
    } catch (err: unknown) {
      setIsStaking(false);
      const message = (err as { shortMessage?: string })?.shortMessage || "Staking failed";
      toast.error(message);
    }
  };

  const handleUnstake = async () => {
    if (!address || !unstakeAmount) return;

    try {
      setIsUnstaking(true);
      const amount = parseUnits(unstakeAmount, decimals);

      const hash = await writeContractAsync({
        address: StakingContract.address as Address,
        abi: StakingContract.abi as Abi,
        functionName: "withdraw",
        args: [amount],
      });

      setUnstakingHash(hash);
      toast.info("Withdrawing tokens...");
    } catch (err: unknown) {
      setIsUnstaking(false);
      const message = (err as { shortMessage?: string })?.shortMessage || "Withdrawal failed";
      toast.error(message);
    }
  };

  const handleClaim = async () => {
    if (!address) return;

    try {
      setIsClaiming(true);

      const hash = await writeContractAsync({
        address: StakingContract.address as Address,
        abi: StakingContract.abi as Abi,
        functionName: "getReward",
        args: [],
      });

      setClaimHash(hash);
      toast.info("Claiming rewards...");
    } catch (err: unknown) {
      setIsClaiming(false);
      const message = (err as { shortMessage?: string })?.shortMessage || "Claim failed";
      toast.error(message);
    }
  };

  const handleMaxStake = () => {
    if (walletBalance && decimals) {
      setStakeAmount(formatUnits(walletBalance as bigint, decimals));
    }
  };

  const handleMaxUnstake = () => {
    if (stakedBalance && decimals) {
      setUnstakeAmount(formatUnits(stakedBalance as bigint, decimals));
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 text-black">
      {/* Header Banner */}
      <div className="mb-6 sm:mb-8">
        <div className="border-4 border-black p-4 sm:p-6 md:p-8 shadow-[6px_6px_0_rgba(0,0,0,1)] bg-[#7DF9FF]">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wider flex items-center gap-3 flex-wrap">
              <Coins className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
              Staking
            </h1>
            <p className="text-base sm:text-lg font-semibold text-gray-800">
              Stake {stakingTokenSymbol || "tokens"} and earn {rewardsTokenSymbol || "rewards"} without leaving the ReactPad dashboard.
            </p>
          </div>
        </div>
      </div>


      {!isConnected ? (
        <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] max-w-2xl mx-auto">
          <CardContent className="p-8 sm:p-12 text-center space-y-6">
            <Wallet className="w-16 h-16 mx-auto text-gray-400" />
            <div>
              <h2 className="text-2xl font-black uppercase mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600">Connect your wallet to start staking and earning rewards.</p>
            </div>
            <Button
              onClick={openConnectModal}
              className="bg-[#7DF9FF] text-black font-black uppercase tracking-wider border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-[#5DD5F5] hover:shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all px-8 py-6 text-lg"
            >
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Stats */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0">
              <CardHeader className="border-b-2 border-black bg-[#7DF9FF] p-4">
                <CardTitle className="font-black uppercase tracking-wider flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Your Position
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="p-4 border border-gray-200 bg-white">
                  <p className="text-xs uppercase font-bold text-gray-500">Wallet Balance</p>
                  <p className="text-2xl font-black text-gray-900">{formattedWalletBalance}</p>
                  <p className="text-sm text-gray-500">{stakingTokenSymbol || "Tokens"}</p>
                </div>
                <div className="p-4 border border-gray-200 bg-white">
                  <p className="text-xs uppercase font-bold text-gray-500">Staked Balance</p>
                  <p className="text-2xl font-black text-gray-900">{formattedStakedBalance}</p>
                  <p className="text-sm text-gray-500">{stakingTokenSymbol || "Tokens"}</p>
                </div>
                <div className="p-4 border border-gray-200 bg-white">
                  <p className="text-xs uppercase font-bold text-gray-500">Pending Rewards</p>
                  <p className="text-2xl font-black text-gray-900">{formattedPendingRewards}</p>
                  <p className="text-sm text-gray-500">{rewardsTokenSymbol || "Tokens"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Claim Rewards */}
            {hasClaimableRewards && (
              <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0 overflow-hidden">
                <CardContent className="p-0">
                  <Button
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="w-full h-full py-6 rounded-none border-0 bg-[#90EE90] text-black font-black uppercase tracking-wider text-lg hover:bg-[#7ED87E] disabled:opacity-50"
                  >
                    {isClaiming ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5 mr-2" />
                        Claim {formattedPendingRewards} {rewardsTokenSymbol}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stake/Unstake Form */}
          <div className="lg:col-span-2">
            <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0">
              <CardHeader className="border-b-2 border-black bg-white p-0">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("stake")}
                    className={`flex-1 py-4 font-black uppercase tracking-wider text-sm transition-colors ${
                      activeTab === "stake"
                        ? "bg-[#7DF9FF] text-black"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Stake
                  </button>
                  <button
                    onClick={() => setActiveTab("unstake")}
                    className={`flex-1 py-4 font-black uppercase tracking-wider text-sm transition-colors border-l-2 border-black ${
                      activeTab === "unstake"
                        ? "bg-[#7DF9FF] text-black"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Unstake
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {activeTab === "stake" ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold uppercase">Amount to Stake</label>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Balance:</span>
                          <span className="font-bold">{formattedWalletBalance}</span>
                          <button
                            onClick={handleMaxStake}
                            className="text-gray-900 font-bold hover:underline"
                          >
                            MAX
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 border-4 border-black bg-white">
                        <Input
                          type="text"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          placeholder="0.0"
                          className="flex-1 text-xl font-bold border-0 shadow-none focus-visible:ring-0 p-0"
                        />
                        <span className="font-black text-gray-600">{stakingTokenSymbol || "TOKEN"}</span>
                      </div>
                      {hasInsufficientStakeBalance && (
                        <p className="text-red-500 text-sm mt-2 font-bold">Insufficient balance</p>
                      )}
                    </div>

                    {needsApproval ? (
                      <Button
                        onClick={handleApprove}
                        disabled={isApproving || !stakeAmount}
                        className="w-full py-6 bg-[#FFFB8F] text-black font-black uppercase tracking-wider border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-[#FFF570] hover:shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
                      >
                        {isApproving ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          `Approve ${stakingTokenSymbol || "Token"}`
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStake}
                        disabled={isStaking || !stakeAmount || hasInsufficientStakeBalance}
                        className="w-full py-6 bg-[#7DF9FF] text-black font-black uppercase tracking-wider border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-[#5DD5F5] hover:shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
                      >
                        {isStaking ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Staking...
                          </>
                        ) : (
                          "Stake"
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold uppercase">Amount to Unstake</label>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Staked:</span>
                          <span className="font-bold">{formattedStakedBalance}</span>
                          <button
                            onClick={handleMaxUnstake}
                            className="text-gray-900 font-bold hover:underline"
                          >
                            MAX
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 border-4 border-black bg-white">
                        <Input
                          type="text"
                          value={unstakeAmount}
                          onChange={(e) => setUnstakeAmount(e.target.value)}
                          placeholder="0.0"
                          className="flex-1 text-xl font-bold border-0 shadow-none focus-visible:ring-0 p-0"
                        />
                        <span className="font-black text-gray-600">{stakingTokenSymbol || "TOKEN"}</span>
                      </div>
                      {hasInsufficientUnstakeBalance && (
                        <p className="text-red-500 text-sm mt-2 font-bold">Insufficient staked balance</p>
                      )}
                    </div>

                    <Button
                      onClick={handleUnstake}
                      disabled={isUnstaking || !unstakeAmount || hasInsufficientUnstakeBalance}
                      className="w-full py-6 bg-[#7DF9FF] text-black font-black uppercase tracking-wider border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-[#5DD5F5] hover:shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
                    >
                      {isUnstaking ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Withdrawing...
                        </>
                      ) : (
                        "Unstake"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0">
          <CardContent className="p-4 sm:p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#FFFB8F] border-2 border-black">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-gray-500">Program Status</p>
                <p
                  className={`text-2xl font-black ${
                    stakingStatus === undefined
                      ? "text-gray-700"
                      : stakingStatus
                        ? "text-green-600"
                        : "text-amber-600"
                  }`}
                >
                  {stakingStatus === undefined ? "Checking..." : stakingStatus ? "Live" : "Paused"}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {stakingStatus === undefined
                ? "We're checking the latest status from the contract."
                : stakingStatus
                  ? "Rewards are accruing in real time for every wallet in the pool."
                  : "Rewards are currently paused until the pool is resumed."}
            </p>
          </CardContent>
        </Card>

        <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0">
          <CardContent className="p-4 sm:p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#FFFB8F] border-2 border-black">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-gray-500">Total Staked</p>
                <p className="text-2xl font-black text-gray-900">{formattedTotalSupply}</p>
                <p className="text-xs text-gray-500">{stakingTokenSymbol || "Tokens"}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Aggregate liquidity currently deposited into the staking contract.</p>
          </CardContent>
        </Card>

        <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0">
          <CardContent className="p-4 sm:p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#FFFB8F] border-2 border-black">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-gray-500">Contract</p>
                <a
                  href={`${EXPLORER_URL}/address/${StakingContract.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono hover:underline flex items-center gap-1"
                >
                  {StakingContract.address.slice(0, 6)}...{StakingContract.address.slice(-4)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <p className="text-sm text-gray-600">View the verified contract on the block explorer.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
