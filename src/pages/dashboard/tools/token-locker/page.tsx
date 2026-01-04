import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TokenLocker, EXPLORER_URL } from "@/config";
import { useAllLocks } from "@/lib/hooks/useAllLocks";
import { formatDistanceToNow, format } from "date-fns";
import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { erc20Abi, maxUint256, parseUnits, type Abi } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Lock, ExternalLink, Plus, Eye, Timer, Unlock, Send } from "lucide-react";

interface LockData {
    id: bigint;
    token: `0x${string}`;
    owner: `0x${string}`;
    amount: bigint;
    lockDate: bigint;
    unlockDate: bigint;
    withdrawn: boolean;
    name: string;
    description: string;
    tokenSymbol?: string;
    formattedAmount: string;
}

function LockProgressBar({ lockDate, unlockDate }: { lockDate: bigint; unlockDate: bigint }) {
    const now = Date.now();
    const lockTimestamp = Number(lockDate) * 1000;
    const unlockTimestamp = Number(unlockDate) * 1000;
    
    const totalDuration = unlockTimestamp - lockTimestamp;
    const elapsed = now - lockTimestamp;
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    
    const isExpired = now >= unlockTimestamp;
    
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
                <span>Locked: {format(new Date(lockTimestamp), 'MMM d, yyyy')}</span>
                <span>Unlocks: {format(new Date(unlockTimestamp), 'MMM d, yyyy')}</span>
            </div>
            <Progress 
                value={progress} 
                className={`h-3 border-2 border-black ${isExpired ? 'bg-green-200' : 'bg-gray-200'}`}
            />
            <div className="text-center text-xs font-bold">
                {isExpired ? (
                    <span className="text-green-600">✓ Ready to Unlock</span>
                ) : (
                    <span className="text-yellow-600">{progress.toFixed(1)}% Complete • {formatDistanceToNow(new Date(unlockTimestamp), { addSuffix: true })}</span>
                )}
            </div>
        </div>
    );
}

function LockCard({ 
    lock, 
    onUnlock, 
    onExtend,
    onTransfer,
    unlockingId,
    isOwner 
}: { 
    lock: LockData; 
    onUnlock: (lockId: bigint) => void;
    onExtend: (lockId: bigint) => void;
    onTransfer: (lockId: bigint) => void;
    unlockingId: bigint | null;
    isOwner: boolean;
}) {
                    const unlockTimestamp = Number(lock.unlockDate ?? 0) * 1000;
                    const unlockDate = new Date(unlockTimestamp);
                    const isValidDate = !isNaN(unlockDate.getTime());
                    const isUnlocked = isValidDate && unlockDate < new Date();
    const isWithdrawn = lock.withdrawn;

                    return (
        <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0 overflow-hidden">
            <CardHeader className={`border-b-2 border-black p-4 ${isWithdrawn ? 'bg-gray-200' : isUnlocked ? 'bg-[#90EE90]' : 'bg-[#FFFB8F]'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        <CardTitle className="font-black uppercase tracking-wider text-sm">
                            {lock.name || `Lock #${lock.id.toString()}`}
                        </CardTitle>
                    </div>
                    <Link 
                        to={`/locks/${lock.id.toString()}`}
                        className="text-gray-600 hover:text-black transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Token</p>
                        <p className="font-bold">{lock.tokenSymbol ?? 'Unknown'}</p>
                        <a 
                            href={`${EXPLORER_URL}/address/${lock.token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-gray-500 hover:text-black flex items-center gap-1"
                        >
                            {lock.token.slice(0, 6)}...{lock.token.slice(-4)}
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-bold">Amount</p>
                        <p className="font-black text-lg">{lock.formattedAmount}</p>
                    </div>
                </div>

                {lock.description && (
                    <p className="text-sm text-gray-600 italic">"{lock.description}"</p>
                )}

                {!isWithdrawn && (
                    <LockProgressBar lockDate={lock.lockDate} unlockDate={lock.unlockDate} />
                )}

                {isWithdrawn && (
                    <div className="text-center py-2 bg-gray-100 border-2 border-gray-300">
                        <p className="text-gray-500 font-bold">Already Withdrawn</p>
                    </div>
                )}

                {isOwner && !isWithdrawn && (
                    <div className="grid grid-cols-3 gap-2">
                        {isUnlocked ? (
                            <Button 
                                onClick={() => onUnlock(lock.id)} 
                                disabled={unlockingId === lock.id}
                                className="col-span-3 border-4 border-black bg-[#90EE90] text-black font-black uppercase tracking-wider shadow-[3px_3px_0_rgba(0,0,0,1)] hover:bg-[#7ADF7A]"
                            >
                                <Unlock className="w-4 h-4 mr-2" />
                                        {unlockingId === lock.id ? "Withdrawing..." : "Withdraw"}
                            </Button>
                        ) : (
                            <>
                                <Button 
                                    onClick={() => onExtend(lock.id)}
                                    variant="outline"
                                    className="border-2 border-black bg-white text-black font-bold text-xs uppercase shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-gray-100"
                                >
                                    <Timer className="w-3 h-3 mr-1" />
                                    Extend
                                </Button>
                                <Button 
                                    onClick={() => onTransfer(lock.id)}
                                    variant="outline"
                                    className="border-2 border-black bg-white text-black font-bold text-xs uppercase shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-gray-100"
                                >
                                    <Send className="w-3 h-3 mr-1" />
                                    Transfer
                                </Button>
                                <Link to={`/locks/${lock.id.toString()}`}>
                                    <Button 
                                        variant="outline"
                                        className="w-full border-2 border-black bg-white text-black font-bold text-xs uppercase shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-gray-100"
                                    >
                                        <Eye className="w-3 h-3 mr-1" />
                                        View
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function CreateLockModal({ 
    onClose, 
    onSuccess 
}: { 
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [searchParams] = useSearchParams();
    const { address } = useAccount();

    const { data: lockHash, writeContract: lockTokens, isPending: isLocking, error: lockError, reset: resetLock } = useWriteContract();
    const { data: approveHash, writeContract: approve, isPending: isApproving, error: approveError, reset: resetApprove } = useWriteContract();

    // Normalize token address from URL (trim whitespace, ensure lowercase for consistency)
    const tokenFromUrl = searchParams.get("token")?.trim() ?? "";
    const [tokenAddress, setTokenAddress] = useState(tokenFromUrl);
    const [amount, setAmount] = useState("");
    const [duration, setDuration] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [hasApproved, setHasApproved] = useState(false);

    // Check if token came from URL (dashboard link)
    const cameFromDashboard = !!tokenFromUrl;

    // Normalized token address for consistent use across all contract calls
    const normalizedTokenAddress = useMemo(() => {
        return tokenAddress.trim().toLowerCase() as `0x${string}`;
    }, [tokenAddress]);

    const isValidTokenAddress = useMemo(() => {
        return !!tokenAddress && tokenAddress.trim().length === 42 && tokenAddress.startsWith("0x");
    }, [tokenAddress]);

    // Debug: Log token address source
    useEffect(() => {
        console.log("Token address debug:", {
            tokenFromUrl,
            tokenAddress,
            normalizedTokenAddress,
            tokenAddressLength: tokenAddress.length,
            isValidTokenAddress,
            cameFromDashboard,
            hasApproved
        });
    }, [tokenFromUrl, tokenAddress, normalizedTokenAddress, isValidTokenAddress, cameFromDashboard, hasApproved]);

    const { data: tokenDecimals } = useReadContract({
        abi: erc20Abi,
        address: normalizedTokenAddress,
        functionName: 'decimals',
        query: {
            enabled: isValidTokenAddress,
        }
    });

    const { data: tokenSymbol } = useReadContract({
        abi: erc20Abi,
        address: normalizedTokenAddress,
        functionName: 'symbol',
        query: {
            enabled: isValidTokenAddress,
        }
    });

    const isFormValid = useMemo(() => {
        return tokenAddress.trim() !== '' && amount.trim() !== '' && duration.trim() !== '' && name.trim() !== '' && tokenAddress.length === 42;
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
        address: normalizedTokenAddress,
        functionName: 'allowance',
        args: [address!, TokenLocker.address],
        query: {
            enabled: !!address && isValidTokenAddress,
        }
    });

    const { data: tokenBalance } = useReadContract({
        abi: erc20Abi,
        address: normalizedTokenAddress,
        functionName: 'balanceOf',
        args: [address!],
        query: {
            enabled: !!address && isValidTokenAddress,
        }
    });

    const needsApproval = useMemo(() => {
        // If came from dashboard, always require approval first
        if (cameFromDashboard && !hasApproved) return true;
        // Otherwise, check if allowance is sufficient
        if (allowance === undefined) return true;
        return allowance < parsedAmount;
    }, [allowance, parsedAmount, cameFromDashboard, hasApproved]);

    const handleApprove = () => {
        console.log("Approving token:", normalizedTokenAddress);
        approve({
            address: normalizedTokenAddress,
            abi: erc20Abi,
            functionName: "approve",
            args: [TokenLocker.address, maxUint256]
        })
    }

    const handleLock = () => {
        // Validate token address
        if (!tokenAddress || !tokenAddress.startsWith("0x") || tokenAddress.length !== 42) {
            toast.error("Please enter a valid token address");
            return;
        }

        const days = parseInt(duration);
        if (isNaN(days) || days <= 0) {
            toast.error("Please enter a valid duration in days");
            return;
        }
        
        if (parsedAmount === 0n) {
            toast.error("Please enter a valid amount");
            return;
        }

        // Validate name is not empty
        if (!name || name.trim() === "") {
            toast.error("Please enter a name for the lock");
            return;
        }

        const durationInSeconds = days * 24 * 60 * 60;
        
        // Ensure duration fits in uint64 (max value: 2^64 - 1)
        if (durationInSeconds > Number.MAX_SAFE_INTEGER) {
            toast.error("Duration is too large. Please use a smaller value.");
            return;
        }

        // Check token balance
        if (tokenBalance !== undefined && tokenBalance < parsedAmount) {
            toast.error("Insufficient token balance");
            return;
        }

        // Check allowance
        if (allowance !== undefined && allowance < parsedAmount) {
            toast.error("Insufficient allowance. Please approve tokens first.");
            return;
        }

        console.log("Lock params:", {
            contractAddress: TokenLocker.address,
            tokenAddress,
            normalizedTokenAddress,
            tokenAddressLength: tokenAddress.length,
            amount: parsedAmount.toString(),
            durationInSeconds,
            name: name.trim(),
            description: (description || "").trim(),
            currentAllowance: allowance?.toString(),
            currentBalance: tokenBalance?.toString(),
            cameFromDashboard,
            hasApproved
        });

        console.log("Sending lock transaction...");
        lockTokens({
            address: TokenLocker.address,
            abi: TokenLocker.abi as Abi,
            functionName: "lockTokens",
            args: [
                normalizedTokenAddress,
                parsedAmount,
                BigInt(durationInSeconds),
                name.trim(),
                (description || "").trim()
            ]
        })
    }

    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
        hash: approveHash,
    });
    const { isLoading: isLockConfirming, isSuccess: isLockSuccess } = useWaitForTransactionReceipt({
        hash: lockHash,
    });

    const processedLockHash = useRef<string | null>(null);
    const processedApproveHash = useRef<string | null>(null);

    useEffect(() => {
        if (approveError) {
            toast.error(`Approval failed: ${approveError.message}`);
        }
    }, [approveError]);

    useEffect(() => {
        if (lockError) {
            console.error("Lock error full:", lockError);
            // Viem errors have cause and shortMessage properties
            const viemError = lockError as { shortMessage?: string; cause?: { shortMessage?: string; message?: string } };
            console.error("Lock error shortMessage:", viemError.shortMessage);
            console.error("Lock error cause:", viemError.cause);
            
            const errorMessage = viemError.shortMessage || viemError.cause?.shortMessage || lockError.message || "Unknown error";
            
            // Check for common contract errors
            if (errorMessage.includes("InvalidAmount") || errorMessage.includes("Invalid amount")) {
                toast.error("Invalid amount or duration. Please check your inputs.");
            } else if (errorMessage.includes("InvalidToken") || errorMessage.includes("Invalid token")) {
                toast.error("Invalid token address.");
            } else if (errorMessage.includes("insufficient allowance") || errorMessage.includes("ERC20: insufficient allowance")) {
                toast.error("Insufficient allowance. Please approve tokens first.");
            } else if (errorMessage.includes("User rejected") || errorMessage.includes("user rejected")) {
                toast.error("Transaction was rejected.");
            } else if (errorMessage.includes("exceeds balance") || errorMessage.includes("insufficient balance")) {
                toast.error("Insufficient token balance.");
            } else {
                toast.error(`Lock failed: ${errorMessage.slice(0, 150)}`);
            }
            resetLock();
        }
    }, [lockError, resetLock]);

    useEffect(() => {
        if (isApproveSuccess && approveHash && processedApproveHash.current !== approveHash) {
            processedApproveHash.current = approveHash;
            toast.success("Approval successful! You can now lock your tokens.");
            setHasApproved(true); // Mark as approved when coming from dashboard
            refetchAllowance();
            resetApprove();
        }
    }, [isApproveSuccess, approveHash, refetchAllowance, resetApprove]);

    useEffect(() => {
        if (isLockSuccess && lockHash && processedLockHash.current !== lockHash) {
            processedLockHash.current = lockHash;
            toast.success(`Tokens locked successfully!`);
            onSuccess(); // Refetch locks
            setAmount("");
            setDuration("");
            setName("");
            setDescription("");
            setHasApproved(false); // Reset approval state for next lock
            resetLock();
            onClose(); // Close modal after success
        }
    }, [isLockSuccess, lockHash, onSuccess, resetLock, onClose]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4" onClick={onClose}>
            <Card className="border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] max-w-2xl w-full p-0 gap-0" onClick={e => e.stopPropagation()}>
                <CardHeader className="border-b-2 border-black bg-[#7DF9FF] p-6">
                    <CardTitle className="font-black uppercase tracking-wider flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Create New Lock
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="token-address" className="font-bold uppercase text-xs">Token Address</Label>
                    <Input 
                        id="token-address" 
                        placeholder="0x..." 
                        value={tokenAddress} 
                        onChange={e => setTokenAddress(e.target.value)}
                        className="border-2 border-black font-mono"
                    />
                    {tokenSymbol && (
                        <p className="text-xs text-green-600 font-bold">✓ Token: {tokenSymbol}</p>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="font-bold uppercase text-xs">Amount</Label>
                        <Input 
                            id="amount" 
                            type="number" 
                            placeholder="1000" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)}
                            className="border-2 border-black"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="duration" className="font-bold uppercase text-xs">Duration (Days)</Label>
                        <Input 
                            id="duration" 
                            type="number" 
                            placeholder="30" 
                            value={duration} 
                            onChange={e => setDuration(e.target.value)}
                            className="border-2 border-black"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="name" className="font-bold uppercase text-xs">Lock Name / Reason</Label>
                    <Input 
                        id="name" 
                        placeholder="e.g. Team Tokens Vesting" 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        className="border-2 border-black"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description" className="font-bold uppercase text-xs">Description (Optional)</Label>
                    <Input 
                        id="description" 
                        placeholder="e.g. Monthly vesting for core contributors" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)}
                        className="border-2 border-black"
                    />
                </div>

                {needsApproval ? (
                    <Button 
                        onClick={handleApprove} 
                        disabled={!isFormValid || isApproving || isApproveConfirming}
                        className="w-full border-4 border-black bg-[#FFFB8F] text-black font-black uppercase tracking-wider shadow-[3px_3px_0_rgba(0,0,0,1)] hover:bg-[#EDE972]"
                    >
                        {isApproving || isApproveConfirming ? "Approving..." : "Approve Tokens"}
                    </Button>
                ) : (
                    <Button 
                        onClick={handleLock} 
                        disabled={!isFormValid || isLocking || isLockConfirming}
                        className="w-full border-4 border-black bg-[#7DF9FF] text-black font-black uppercase tracking-wider shadow-[3px_3px_0_rgba(0,0,0,1)] hover:bg-[#6AD8E8]"
                    >
                        <Lock className="w-4 h-4 mr-2" />
                        {isLocking || isLockConfirming ? "Locking..." : "Lock Tokens"}
                    </Button>
                )}
            </CardContent>
            </Card>
        </div>
    );
}

function ExtendLockModal({ 
    lockId, 
    onClose, 
    onSuccess 
}: { 
    lockId: bigint; 
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [additionalDays, setAdditionalDays] = useState("");
    const { data: hash, writeContract, isPending, error, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleExtend = () => {
        const additionalSeconds = parseInt(additionalDays) * 24 * 60 * 60;
        writeContract({
            address: TokenLocker.address,
            abi: TokenLocker.abi as Abi,
            functionName: "extendLock",
            args: [lockId, BigInt(additionalSeconds)]
        });
    };

    useEffect(() => {
        if (error) {
            toast.error(error.message);
        }
    }, [error]);

    useEffect(() => {
        if (isSuccess) {
            toast.success("Lock extended successfully!");
            reset();
            onSuccess();
            onClose();
        }
    }, [isSuccess, onClose, onSuccess, reset]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <Card className="border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] max-w-md w-full mx-4 p-0 gap-0" onClick={e => e.stopPropagation()}>
                <CardHeader className="border-b-2 border-black bg-[#FFFB8F] p-4">
                    <CardTitle className="font-black uppercase tracking-wider">Extend Lock</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                        <Label className="font-bold uppercase text-xs">Additional Days</Label>
                        <Input 
                            type="number" 
                            placeholder="30" 
                            value={additionalDays}
                            onChange={e => setAdditionalDays(e.target.value)}
                            className="border-2 border-black"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 border-2 border-black"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleExtend}
                            disabled={!additionalDays || isPending || isConfirming}
                            className="flex-1 border-4 border-black bg-[#FFFB8F] text-black font-black uppercase shadow-[3px_3px_0_rgba(0,0,0,1)]"
                        >
                            {isPending || isConfirming ? "Extending..." : "Extend"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function TransferLockModal({ 
    lockId, 
    onClose, 
    onSuccess 
}: { 
    lockId: bigint; 
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [newOwner, setNewOwner] = useState("");
    const { data: hash, writeContract, isPending, error, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleTransfer = () => {
        writeContract({
            address: TokenLocker.address,
            abi: TokenLocker.abi as Abi,
            functionName: "transferLockOwnership",
            args: [lockId, newOwner as `0x${string}`]
        });
    };

    useEffect(() => {
        if (error) {
            toast.error(error.message);
        }
    }, [error]);

    useEffect(() => {
        if (isSuccess) {
            toast.success("Lock ownership transferred!");
            reset();
            onSuccess();
            onClose();
        }
    }, [isSuccess, onClose, onSuccess, reset]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <Card className="border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] max-w-md w-full mx-4 p-0 gap-0" onClick={e => e.stopPropagation()}>
                <CardHeader className="border-b-2 border-black bg-[#FFB6C1] p-4">
                    <CardTitle className="font-black uppercase tracking-wider">Transfer Lock Ownership</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    <p className="text-sm text-gray-600">
                        ⚠️ This action is irreversible. The new owner will have full control over this lock.
                    </p>
                    <div className="space-y-2">
                        <Label className="font-bold uppercase text-xs">New Owner Address</Label>
                        <Input 
                            placeholder="0x..." 
                            value={newOwner}
                            onChange={e => setNewOwner(e.target.value)}
                            className="border-2 border-black font-mono"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 border-2 border-black"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleTransfer}
                            disabled={!newOwner || newOwner.length !== 42 || isPending || isConfirming}
                            className="flex-1 border-4 border-black bg-[#FFB6C1] text-black font-black uppercase shadow-[3px_3px_0_rgba(0,0,0,1)]"
                        >
                            {isPending || isConfirming ? "Transferring..." : "Transfer"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function TokenLockerPage() {
    const { address } = useAccount();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [extendingLockId, setExtendingLockId] = useState<bigint | null>(null);
    const [transferringLockId, setTransferringLockId] = useState<bigint | null>(null);
    const [unlockingId, setUnlockingId] = useState<bigint | null>(null);

    const { data: unlockHash, writeContract: unlockTokens } = useWriteContract();
    const { isSuccess: isUnlockSuccess } = useWaitForTransactionReceipt({ hash: unlockHash });

    const { locks: userLocks, isLoading: isLoadingLocks, refetch: refetchLocks } = useAllLocks();

    const { data: totalLocksCount } = useReadContract({
        address: TokenLocker.address,
        abi: TokenLocker.abi as Abi,
        functionName: 'totalLocks',
    });

    const handleUnlock = (lockId: bigint) => {
        setUnlockingId(lockId);
        unlockTokens({
            address: TokenLocker.address,
            abi: TokenLocker.abi as Abi,
            functionName: "unlock",
            args: [lockId]
        });
    };

    const processedUnlockHash = useRef<string | null>(null);

    useEffect(() => {
        if (isUnlockSuccess && unlockHash && processedUnlockHash.current !== unlockHash) {
            processedUnlockHash.current = unlockHash;
            toast.success("Tokens unlocked successfully!");
            refetchLocks();
            setUnlockingId(null);
        }
    }, [isUnlockSuccess, unlockHash, refetchLocks]);

    const activeLocks = useMemo(() => userLocks.filter(l => !l.withdrawn), [userLocks]);
    const withdrawnLocks = useMemo(() => userLocks.filter(l => l.withdrawn), [userLocks]);

    return (
        <div className="container mx-auto px-4 py-8 text-black">
            {/* Header */}
            <div className="mb-8">
                <div className="border-b-4 border-black bg-[#7DF9FF] p-6 shadow-[4px_4px_0_rgba(0,0,0,1)]">
                    <h1 className="text-4xl font-black uppercase tracking-wider flex items-center gap-3">
                        <Lock className="w-8 h-8" /> Token Locker
                    </h1>
                    <p className="text-sm text-gray-700 mt-2">
                        Lock your tokens for a specified period. Build trust with your community through transparent, verifiable locks.
                    </p>
                            </div>
                            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Total Locks</p>
                        <p className="text-3xl font-black">{totalLocksCount?.toString() ?? '...'}</p>
                    </CardContent>
                </Card>
                <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Your Active Locks</p>
                        <p className="text-3xl font-black text-yellow-600">{activeLocks.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Withdrawn</p>
                        <p className="text-3xl font-black text-green-600">{withdrawnLocks.length}</p>
                    </CardContent>
                </Card>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0 bg-white hover:bg-gray-50 transition-colors"
                >
                    <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                        <Plus className="w-6 h-6 mb-2 text-[#7DF9FF]" />
                        <p className="text-xs text-gray-500 uppercase font-bold">Create Lock</p>
                    </CardContent>
                </button>
            </div>

            {/* Content */}
            <div>
                {isLoadingLocks ? (
                    <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
                        <CardContent className="p-12 text-center">
                            <p className="text-lg font-bold">Loading your locks...</p>
                        </CardContent>
                    </Card>
                ) : activeLocks.length === 0 ? (
                    <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
                        <CardContent className="p-12 text-center space-y-4">
                            <Lock className="w-16 h-16 mx-auto text-gray-400" />
                            <p className="text-lg font-bold">No Active Locks</p>
                            <p className="text-gray-600">Create your first token lock to get started.</p>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="border-4 border-black bg-[#7DF9FF] text-black font-black uppercase tracking-wider shadow-[3px_3px_0_rgba(0,0,0,1)]"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Lock
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {activeLocks.map(lock => (
                            <LockCard 
                                key={lock.id.toString()}
                                lock={lock}
                                onUnlock={handleUnlock}
                                onExtend={setExtendingLockId}
                                onTransfer={setTransferringLockId}
                                unlockingId={unlockingId}
                                isOwner={lock.owner.toLowerCase() === address?.toLowerCase()}
                            />
                        ))}
                    </div>
                )}

                {withdrawnLocks.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-xl font-black uppercase tracking-wider mb-4">Withdrawn Locks</h3>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {withdrawnLocks.map(lock => (
                                <LockCard 
                                    key={lock.id.toString()}
                                    lock={lock}
                                    onUnlock={handleUnlock}
                                    onExtend={setExtendingLockId}
                                    onTransfer={setTransferringLockId}
                                    unlockingId={unlockingId}
                                    isOwner={lock.owner.toLowerCase() === address?.toLowerCase()}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateLockModal 
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={refetchLocks}
                />
            )}

            {extendingLockId !== null && (
                <ExtendLockModal 
                    lockId={extendingLockId}
                    onClose={() => setExtendingLockId(null)}
                    onSuccess={refetchLocks}
                />
            )}

            {transferringLockId !== null && (
                <TransferLockModal 
                    lockId={transferringLockId}
                    onClose={() => setTransferringLockId(null)}
                    onSuccess={refetchLocks}
                />
            )}
        </div>
    );
}
