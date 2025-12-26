"use client";

import { useState, useEffect, useMemo } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    if (isSuccess) {
      refetchContribution();
      setAmount("");
    }
  }, [isSuccess, refetchContribution]);

  const minContribution = BigInt(presaleData.minContribution);
  const maxContribution = BigInt(presaleData.maxContribution);
  const currentContribution = BigInt(userContribution);
  const remainingContribution = maxContribution - currentContribution;

  const canContribute =
    amountAsBigInt > 0 &&
    amountAsBigInt >= minContribution &&
    amountAsBigInt <= remainingContribution;

  const getButtonText = () => {
    if (isApproving) return "Approving...";
    if (isPending) return "Confirming...";
    if (isConfirming) return "Waiting for transaction...";
    if (needsApproval) return `Approve ${presaleData.paymentTokenSymbol}`;
    return "Contribute";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg bg-white p-6 shadow-md"
    >
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
          isPending || isConfirming || isApproving || (needsApproval ? false : !canContribute)
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
