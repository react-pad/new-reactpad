
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TokenLockerContract } from "@/lib/config";
import { useLockInfo } from "@/lib/hooks/useLockInfo";
import { useUserLocks } from "@/lib/hooks/useUserLocks";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { erc20Abi, maxUint256, parseEther } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

function LockInfo({ lockId }: { lockId: bigint }) {
    const { lock, isLoading, refetch } = useLockInfo(lockId);

    const { data: hash, writeContract } = useWriteContract();
    const { isSuccess: isUnlocked, isLoading: isUnlocking } = useWaitForTransactionReceipt({ hash });

    const handleUnlock = () => {
        writeContract({
            address: TokenLockerContract.address,
            abi: TokenLockerContract.abi,
            functionName: "unlock",
            args: [lockId]
        })
    }

    useEffect(() => {
        if (isUnlocked) {
            toast.success("Tokens unlocked successfully!");
            refetch();
        }
    }, [isUnlocked, refetch])


    if (isLoading || !lock) {
        return <div>Loading lock...</div>
    }

    const unlockDate = new Date(Number(lock.unlockDate) * 1000);
    const isUnlockable = unlockDate < new Date() && !lock.withdrawn;

    return (
        <div className="border p-4 rounded-lg">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold">{lock.name}</h3>
                    <p className="text-sm text-gray-500">{lock.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{lock.token}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg">{lock.amount.toString()}</p>
                    {lock.withdrawn ? (
                        <span className="text-sm text-green-500">Withdrawn</span>
                    ) : (
                        <p className="text-sm text-gray-500">
                            Unlocks {formatDistanceToNow(unlockDate, { addSuffix: true })}
                        </p>
                    )}
                </div>
            </div>
            {isUnlockable && (
                <Button onClick={handleUnlock} disabled={isUnlocking} size="sm" className="mt-4">
                    {isUnlocking ? "Unlocking..." : "Unlock"}
                </Button>
            )}
        </div>
    )
}


export default function TokenLockerPage() {
    const [searchParams] = useSearchParams();
    const { address } = useAccount();

    const { data: lockHash, writeContract: lockTokens, isPending: isLocking, error: lockError } = useWriteContract();
    const { data: approveHash, writeContract: approve, isPending: isApproving, error: approveError } = useWriteContract();

    const [tokenAddress, setTokenAddress] = useState(searchParams.get("token") ?? "");
    const [amount, setAmount] = useState("");
    const [duration, setDuration] = useState(""); // in days
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const isFormValid = useMemo(() => {
        return tokenAddress.trim() !== '' && amount.trim() !== '' && duration.trim() !== '' && name.trim() !== '';
    }, [tokenAddress, amount, duration, name]);

    const parsedAmount = useMemo(() => amount ? parseEther(amount) : BigInt(0), [amount]);

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: 'allowance',
        args: [address!, TokenLockerContract.address],
        query: {
            enabled: !!address && !!tokenAddress,
        }
    });

    const needsApproval = useMemo(() => {
        if (!allowance) return false;
        return allowance < parsedAmount;
    }, [allowance, parsedAmount]);

    const { lockIds: userLocks, isLoading: isLoadingLocks, refetch: refetchLocks } = useUserLocks();

    const handleApprove = () => {
        approve({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "approve",
            args: [TokenLockerContract.address, maxUint256]
        })
    }

    const handleLock = () => {
        const durationInSeconds = parseInt(duration) * 24 * 60 * 60;
        lockTokens({
            address: TokenLockerContract.address,
            abi: TokenLockerContract.abi,
            functionName: "lockTokens",
            args: [
                tokenAddress as `0x${string}`,
                parsedAmount,
                BigInt(durationInSeconds),
                name,
                description
            ]
        })
    }

    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
        hash: approveHash,
    });
    const { isLoading: isLockConfirming, isSuccess: isLockSuccess } = useWaitForTransactionReceipt({
        hash: lockHash,
    });

    useEffect(() => {
        if (isApproveConfirming) {
            toast.loading("Approval confirming...");
        }
    }, [isApproveConfirming]);

    useEffect(() => {
        if (isLockConfirming) {
            toast.loading("Lock confirming...");
        }
    }, [isLockConfirming]);

    useEffect(() => {
        const err = lockError || approveError;
        if (err) {
            toast.error(err.message);
        }
    }, [lockError, approveError]);

    useEffect(() => {
        if (isApproveSuccess) {
            toast.success("Approval successful! You can now lock your tokens.");
            refetchAllowance();
        }
    }, [isApproveSuccess, refetchAllowance]);

    useEffect(() => {
        if (isLockSuccess) {
            toast.success("Tokens locked successfully!");
            refetchLocks();
            setAmount("");
            setDuration("");
            setName("");
            setDescription("");
        }
    }, [isLockSuccess, refetchLocks]);

    return (
        <div className="container mx-auto px-4 py-12 text-black">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Lock Tokens</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="token-address">Token Address</Label>
                                <Input id="token-address" placeholder="0x..." value={tokenAddress} onChange={e => setTokenAddress(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount</Label>
                                <Input id="amount" type="number" placeholder="1000" value={amount} onChange={e => setAmount(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Lock Duration (in days)</Label>
                                <Input id="duration" type="number" placeholder="30" value={duration} onChange={e => setDuration(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Lock Name / Reason</Label>
                                <Input id="name" placeholder="e.g. Team Tokens Vesting" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input id="description" placeholder="e.g. Monthly vesting for core contributors" value={description} onChange={e => setDescription(e.target.value)} />
                            </div>

                            {needsApproval ? (
                                <Button onClick={handleApprove} disabled={!isFormValid || isApproving || isApproveConfirming} className="w-full">
                                    {isApproving || isApproveConfirming ? "Approving..." : "Approve Tokens"}
                                </Button>
                            ) : (
                                <Button onClick={handleLock} disabled={!isFormValid || isLocking || isLockConfirming} className="w-full">
                                    {isLocking || isLockConfirming ? "Locking..." : "Lock Tokens"}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>My Token Locks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingLocks && <p>Loading your locks...</p>}
                            {userLocks && userLocks.length > 0 ? (
                                <div className="space-y-4">
                                    {(userLocks as bigint[]).map(lockId => (
                                        <LockInfo key={lockId.toString()} lockId={lockId} />
                                    ))}
                                </div>
                            ) : (
                                <p>You have no active locks.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}