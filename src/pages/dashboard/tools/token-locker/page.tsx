import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TokenLocker } from "@/lib/config";
import { useAllLocks } from "@/lib/hooks/useAllLocks";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { erc20Abi, maxUint256, parseUnits } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

function TokenLocksTable({ locks, onUnlock, unlockingId }: { locks: any[], onUnlock: (lockId: bigint) => void, unlockingId: bigint | null }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Unlocks In</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {locks.map(lock => {
                    const unlockDate = new Date(Number(lock.unlockDate) * 1000);
                    const isUnlockable = unlockDate < new Date() && !lock.withdrawn;
                    return (
                        <TableRow key={lock.id}>
                            <TableCell>
                                <div className="font-medium">{lock.name}</div>
                                <div className="text-sm text-gray-500">{lock.tokenSymbol}</div>
                            </TableCell>
                            <TableCell>{lock.formattedAmount}</TableCell>
                            <TableCell>{formatDistanceToNow(unlockDate, { addSuffix: true })}</TableCell>
                            <TableCell>
                                {lock.withdrawn ? <span className="text-green-500">Withdrawn</span> : <span className="text-yellow-500">Locked</span>}
                            </TableCell>
                            <TableCell>
                                {isUnlockable && (
                                    <Button onClick={() => onUnlock(lock.id)} disabled={unlockingId === lock.id} size="sm">
                                        {unlockingId === lock.id ? "Unlocking..." : "Unlock"}
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

export default function TokenLockerPage() {
    const [searchParams] = useSearchParams();
    const { address } = useAccount();

    const { data: lockHash, writeContract: lockTokens, isPending: isLocking, error: lockError } = useWriteContract();
    const { data: approveHash, writeContract: approve, isPending: isApproving, error: approveError } = useWriteContract();
    const { data: unlockHash, writeContract: unlockTokens } = useWriteContract();

    const [tokenAddress, setTokenAddress] = useState(searchParams.get("token") ?? "");
    const [amount, setAmount] = useState("");
    const [duration, setDuration] = useState(""); // in days
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [unlockingId, setUnlockingId] = useState<bigint | null>(null);

    const { data: tokenDecimals } = useReadContract({
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: 'decimals',
        query: {
            enabled: !!tokenAddress,
        }
    });

    const isFormValid = useMemo(() => {
        return tokenAddress.trim() !== '' && amount.trim() !== '' && duration.trim() !== '' && name.trim() !== '';
    }, [tokenAddress, amount, duration, name]);

    const parsedAmount = useMemo(() => {
        if (!amount || tokenDecimals === undefined) return BigInt(0);
        try {
            return parseUnits(amount, tokenDecimals);
        } catch {
            return BigInt(0);
        }
    }, [amount, tokenDecimals]);

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: 'allowance',
        args: [address!, TokenLocker.address],
        query: {
            enabled: !!address && !!tokenAddress,
        }
    });

    const needsApproval = useMemo(() => {
        if (allowance === undefined) return true;
        return allowance < parsedAmount;
    }, [allowance, parsedAmount]);

    const { locks: userLocks, isLoading: isLoadingLocks, refetch: refetchLocks } = useAllLocks();

    const handleApprove = () => {
        approve({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "approve",
            args: [TokenLocker.address, maxUint256]
        })
    }

    const handleLock = () => {
        const durationInSeconds = parseInt(duration) * 24 * 60 * 60;
        lockTokens({
            address: TokenLocker.address,
            abi: TokenLocker.abi,
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
    
    const handleUnlock = (lockId: bigint) => {
        setUnlockingId(lockId);
        unlockTokens({
            address: TokenLocker.address,
            abi: TokenLocker.abi,
            functionName: "unlock",
            args: [lockId]
        })
    }

    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
        hash: approveHash,
    });
    const { isLoading: isLockConfirming, isSuccess: isLockSuccess } = useWaitForTransactionReceipt({
        hash: lockHash,
    });
    const { isLoading: isUnlockConfirming, isSuccess: isUnlockSuccess } = useWaitForTransactionReceipt({
        hash: unlockHash,
    });

    // Track toast IDs to prevent duplicates and allow dismissal
    const approveToastId = useRef<string | number | null>(null);
    const lockToastId = useRef<string | number | null>(null);
    const unlockToastId = useRef<string | number | null>(null);

    useEffect(() => {
        if (isApproveConfirming && !approveToastId.current) {
            approveToastId.current = toast.loading("Approval confirming...");
        } else if (!isApproveConfirming && approveToastId.current) {
            toast.dismiss(approveToastId.current);
            approveToastId.current = null;
        }
    }, [isApproveConfirming]);

    useEffect(() => {
        if (isLockConfirming && !lockToastId.current) {
            lockToastId.current = toast.loading("Lock confirming...");
        } else if (!isLockConfirming && lockToastId.current) {
            toast.dismiss(lockToastId.current);
            lockToastId.current = null;
        }
    }, [isLockConfirming]);

    useEffect(() => {
        if (isUnlockConfirming && !unlockToastId.current) {
            unlockToastId.current = toast.loading("Unlock confirming...");
        } else if (!isUnlockConfirming && unlockToastId.current) {
            toast.dismiss(unlockToastId.current);
            unlockToastId.current = null;
        }
    }, [isUnlockConfirming]);

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

    useEffect(() => {
        if (isUnlockSuccess) {
            toast.success("Tokens unlocked successfully!");
            refetchLocks();
            setUnlockingId(null);
        }
    }, [isUnlockSuccess, refetchLocks]);

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
                                <TokenLocksTable locks={userLocks} onUnlock={handleUnlock} unlockingId={unlockingId} />
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