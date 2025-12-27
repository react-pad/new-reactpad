"use client";

import { useState, useEffect, useMemo } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, usePublicClient } from "wagmi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LaunchpadPresaleContract } from "@/config/config";
import { usePresaleContribute } from "@/lib/hooks/usePresaleActions";
import {
  useLaunchpadPresale,
  useUserPresaleContribution,
  type PresaleWithStatus,
} from "@/lib/hooks/useLaunchpadPresales";
import { usePresaleApproval } from "@/lib/hooks/usePresaleApproval";

interface PresaleParticipationFormProps {
  presale: PresaleWithStatus;
}

export function PresaleParticipationForm({
  presale,
}: PresaleParticipationFormProps) {
  const [amount, setAmount] = useState("");
  const { address: account } = useAccount();

  const { presale: updatedPresale } = useLaunchpadPresale(presale.address, true);
  const presaleData = updatedPresale || presale;
  const publicClient = usePublicClient();
  const [isWhitelisted, setIsWhitelisted] = useState(!presaleData.requiresWhitelist);
  const [isCheckingWhitelist, setIsCheckingWhitelist] = useState(false);
  const [whitelistError, setWhitelistError] = useState<string | null>(null);

  const {
    contribution: userContribution,
    refetch: refetchContribution,
  } = useUserPresaleContribution(presaleData.address, account);

  const { contribute, isPending, isConfirming, isSuccess, error } =
    usePresaleContribute();

  const paymentTokenDecimals = presaleData.paymentTokenDecimals || 18;

  const amountAsBigInt = useMemo(() => {
    try {
      return parseUnits(amount, paymentTokenDecimals);
    } catch {
      return 0n;
    }
  }, [amount, paymentTokenDecimals]);

  const { needsApproval, approve, isApproving } = usePresaleApproval({
    presaleAddress: presaleData.address,
    paymentToken: {
      address: presaleData.paymentToken,
      decimals: paymentTokenDecimals,
    },
    amount: amountAsBigInt,
    isPaymentETH: presaleData.isPaymentETH,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presaleData) return;

    await contribute({
      presaleAddress: presaleData.address,
      amount: amountAsBigInt,
      isPaymentETH: presaleData.isPaymentETH,
      paymentTokenDecimals: presaleData.paymentTokenDecimals,
    });
  };

  useEffect(() => {
    if (!presaleData.requiresWhitelist) {
      setIsWhitelisted(true);
      setWhitelistError(null);
      return;
    }
    if (!account || !publicClient) {
      setIsWhitelisted(false);
      setWhitelistError(account ? null : "Connect your wallet to verify access.");
      return;
    }
    let cancelled = false;
    setIsCheckingWhitelist(true);
    setWhitelistError(null);

    (async () => {
      try {
        const allowed = await publicClient.readContract({
          abi: LaunchpadPresaleContract.abi,
          address: presaleData.address,
          functionName: "whitelist",
          args: [account],
        });
        if (!cancelled) {
          setIsWhitelisted(Boolean(allowed));
        }
      } catch (error) {
        console.error("Whitelist check failed", error);
        if (!cancelled) {
          setIsWhitelisted(false);
          setWhitelistError("Unable to verify whitelist status right now.");
        }
      } finally {
        if (!cancelled) {
          setIsCheckingWhitelist(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [presaleData.requiresWhitelist, presaleData.address, account, publicClient]);

  useEffect(() => {
    if (isSuccess) {
      refetchContribution();
      setAmount("");
    }
  }, [isSuccess, refetchContribution]);

  const minContribution = BigInt(presaleData.minContribution);
  const maxContribution = BigInt(presaleData.maxContribution);
  const currentContribution = BigInt(userContribution);
  const remainingContribution = maxContribution - currentContribution;

  const whitelistGateOpen =
    !presaleData.requiresWhitelist || (account && isWhitelisted);

  const canContribute =
    amountAsBigInt > 0 &&
    amountAsBigInt >= minContribution &&
    amountAsBigInt <= remainingContribution &&
    whitelistGateOpen;

  const getButtonText = () => {
    if (presaleData.requiresWhitelist && !whitelistGateOpen) {
      if (!account) return "Connect wallet";
      if (isCheckingWhitelist) return "Checking access...";
      if (whitelistError) return "Retry whitelist check";
      return "Not whitelisted";
    }
    if (isApproving) return "Approving...";
    if (isPending) return "Confirming...";
    if (isConfirming) return "Waiting for transaction...";
    if (needsApproval) return `Approve ${presaleData.paymentTokenSymbol}`;
    return "Contribute";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border-4 border-black bg-[#FFF9F0] p-6 shadow-[4px_4px_0_rgba(0,0,0,1)]"
    >
      {presaleData.requiresWhitelist && (
        <div className="border-2 border-black bg-[#FFFB8F] p-3 text-sm font-semibold uppercase tracking-wide">
          {!account
            ? "Connect your wallet to check whitelist status."
            : isCheckingWhitelist
              ? "Checking whitelist status..."
              : isWhitelisted
                ? "You're approved to participate."
                : "You are not on the whitelist yet."}
        </div>
      )}
      {whitelistError && (
        <p className="text-xs text-red-600">{whitelistError}</p>
      )}
      <div>
        <label htmlFor="amount" className="mb-1 block font-medium">
          Amount to Contribute ({presaleData.paymentTokenSymbol})
        </label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="w-full"
        />
      </div>

      <div className="text-sm text-gray-600">
        <p>
          Your Contribution:{" "}
          {formatUnits(currentContribution, paymentTokenDecimals)}{" "}
          {presaleData.paymentTokenSymbol}
        </p>
        <p>
          Max Contribution:{" "}
          {formatUnits(maxContribution, paymentTokenDecimals)}{" "}
          {presaleData.paymentTokenSymbol}
        </p>
      </div>

      <Button
        type={needsApproval ? "button" : "submit"}
        onClick={needsApproval ? approve : undefined}
        disabled={
          isPending ||
          isConfirming ||
          isApproving ||
          !whitelistGateOpen ||
          (needsApproval ? false : !canContribute)
        }
        className="w-full"
      >
        {getButtonText()}
      </Button>

      {isSuccess && <p className="text-green-500">Contribution successful!</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}
    </form>
  );
}
