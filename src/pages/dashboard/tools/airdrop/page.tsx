import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AirdropMultisenderContract } from "@/lib/config";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { erc20Abi, formatEther, maxUint256, parseEther } from "viem";
import {
    useAccount,
    useReadContract,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";

export default function AirdropPage() {
    const [searchParams] = useSearchParams();
    const { address } = useAccount();

    const {
        data: sendHash,
        writeContract: sendTokens,
        isPending: isSending,
        error: sendError,
    } = useWriteContract();
    const {
        data: approveHash,
        writeContract: approve,
        isPending: isApproving,
        error: approveError,
    } = useWriteContract();

    const [tokenAddress, setTokenAddress] = useState(
        searchParams.get("token") ?? ""
    );
    const [recipientsData, setRecipientsData] = useState("");
    const [sendType, setSendType] = useState<"erc20" | "eth">("erc20");

    const parsedRecipients = useMemo(() => {
        if (!recipientsData) {
            return { recipients: [], amounts: [] };
        }
        return recipientsData.split("\n").reduce(
            (acc, line) => {
                const parts = line.split(",");
                if (parts.length === 2) {
                    const recipient = parts[0].trim();
                    const amountStr = parts[1].trim();
                    if (recipient && amountStr) {
                        try {
                            const amount = parseEther(amountStr);
                            acc.recipients.push(recipient as `0x${string}`);
                            acc.amounts.push(amount);
                        } catch (error) {
                            console.log({ error });
                            console.warn(`Could not parse amount for line: "${line}"`);
                        }
                    }
                }
                return acc;
            },
            { recipients: [] as `0x${string}`[], amounts: [] as bigint[] }
        );
    }, [recipientsData]);

    const totalAmount = useMemo(() => {
        return parsedRecipients.amounts.reduce(
            (acc, curr) => acc + curr,
            BigInt(0)
        );
    }, [parsedRecipients]);

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "allowance",
        args: [address!, AirdropMultisenderContract.address as `0x${string}`],
        query: {
            enabled: !!address && !!tokenAddress && sendType === "erc20",
        },
    });

    const needsApproval = useMemo(() => {
        if (sendType === "eth" || !allowance) return false;
        return allowance < totalAmount;
    }, [allowance, totalAmount, sendType]);

    const handleApprove = () => {
        approve({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "approve",
            args: [AirdropMultisenderContract.address as `0x${string}`, maxUint256],
        });
    };

    const handleSend = () => {
        if (sendType === "eth") {
            sendTokens({
                address: AirdropMultisenderContract.address as `0x${string}`,
                abi: AirdropMultisenderContract.abi,
                functionName: "sendETH",
                args: [parsedRecipients.recipients, parsedRecipients.amounts],
                value: totalAmount,
            });
        } else {
            sendTokens({
                address: AirdropMultisenderContract.address as `0x${string}`,
                abi: AirdropMultisenderContract.abi,
                functionName: "sendERC20",
                args: [
                    tokenAddress as `0x${string}`,
                    parsedRecipients.recipients,
                    parsedRecipients.amounts,
                ],
            });
        }
    };

    const {
        isLoading: isApproveConfirming,
        isSuccess: isApproveConfirmed,
    } = useWaitForTransactionReceipt({ hash: approveHash });
    const { isLoading: isSendConfirming, isSuccess: isSendConfirmed } =
        useWaitForTransactionReceipt({ hash: sendHash });

    // Track toast IDs to prevent duplicates and allow dismissal
    const approveToastId = useRef<string | number | null>(null);
    const sendToastId = useRef<string | number | null>(null);

    // Show loading toast while approval is confirming
    useEffect(() => {
        if (isApproveConfirming && !approveToastId.current) {
            approveToastId.current = toast.loading("Approval confirming...");
        } else if (!isApproveConfirming && approveToastId.current) {
            toast.dismiss(approveToastId.current);
            approveToastId.current = null;
        }
    }, [isApproveConfirming]);

    // Show loading toast while send is confirming
    useEffect(() => {
        if (isSendConfirming && !sendToastId.current) {
            sendToastId.current = toast.loading("Transaction confirming...");
        } else if (!isSendConfirming && sendToastId.current) {
            toast.dismiss(sendToastId.current);
            sendToastId.current = null;
        }
    }, [isSendConfirming]);

    useEffect(() => {
        if (isApproveConfirmed) {
            toast.success("Approval successful! You can now send your tokens.");
            refetchAllowance();
        }
    }, [isApproveConfirmed, refetchAllowance]);

    useEffect(() => {
        if (isSendConfirmed && sendHash) {
            toast.success(`Tokens sent successfully! Tx: ${sendHash.slice(0, 10)}...${sendHash.slice(-8)}`);
            setRecipientsData("");
        }
    }, [isSendConfirmed, sendHash]);

    useEffect(() => {
        const err = sendError || approveError;
        if (err) {
            toast.error(err.message);
        }
    }, [sendError, approveError]);

    return (
        <div className="container mx-auto px-4 py-12 text-black">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Airdrop Tool</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Send Type</Label>
                        <Select
                            value={sendType}
                            onValueChange={(value) =>
                                setSendType(value as "erc20" | "eth")
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select send type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="erc20">ERC20 Token</SelectItem>
                                <SelectItem value="eth">ETH</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {sendType === "erc20" && (
                        <div className="space-y-2">
                            <Label htmlFor="token-address">Token Address</Label>
                            <Input
                                id="token-address"
                                placeholder="0x..."
                                value={tokenAddress}
                                onChange={(e) => setTokenAddress(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="recipients">Recipients and Amounts</Label>
                        <Textarea
                            id="recipients"
                            placeholder="0x...,100\n0x...,200"
                            value={recipientsData}
                            onChange={(e) => setRecipientsData(e.target.value)}
                            className="min-h-[200px]"
                        />
                        <p className="text-xs text-gray-500">
                            Enter one address and amount per line, separated by a comma.
                        </p>
                    </div>

                    <div className="text-sm">
                        Total to send:{" "}
                        <span className="font-bold">
                            {formatEther(totalAmount)} {sendType === "eth" ? "ETH" : "tokens"}
                        </span>
                    </div>

                    {needsApproval ? (
                        <Button
                            onClick={handleApprove}
                            disabled={isApproving || isApproveConfirming}
                            className="w-full"
                        >
                            {isApproving || isApproveConfirming
                                ? "Approving..."
                                : "Approve Tokens"}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSend}
                            disabled={isSending || isSendConfirming}
                            className="w-full"
                        >
                            {isSending || isSendConfirming ? "Sending..." : "Send"}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}