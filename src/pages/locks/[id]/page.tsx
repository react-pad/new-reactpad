import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TokenLocker, EXPLORER_URL } from "@/config";
import { format, formatDistanceToNow } from "date-fns";
import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { erc20Abi, formatUnits, type Abi } from "viem";
import { useReadContract } from "wagmi";
import { Lock, Clock, ExternalLink, ArrowLeft, User, Coins, Calendar, Timer, CheckCircle2, XCircle } from "lucide-react";

interface LockInfo {
    token: `0x${string}`;
    owner: `0x${string}`;
    amount: bigint;
    lockDate: bigint;
    unlockDate: bigint;
    withdrawn: boolean;
    name: string;
    description: string;
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
        <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
                <div>
                    <p className="text-xs uppercase font-bold text-gray-500">Lock Date</p>
                    <p className="font-medium">{format(new Date(lockTimestamp), 'MMM d, yyyy HH:mm')}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs uppercase font-bold text-gray-500">Unlock Date</p>
                    <p className="font-medium">{format(new Date(unlockTimestamp), 'MMM d, yyyy HH:mm')}</p>
                </div>
            </div>
            <Progress 
                value={progress} 
                className={`h-4 border-2 border-black ${isExpired ? 'bg-green-200' : 'bg-gray-200'}`}
            />
            <div className="text-center">
                {isExpired ? (
                    <span className="text-green-600 font-black text-lg flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Ready to Unlock
                    </span>
                ) : (
                    <span className="text-yellow-600 font-bold">
                        {progress.toFixed(1)}% Complete • Unlocks {formatDistanceToNow(new Date(unlockTimestamp), { addSuffix: true })}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function LockDetailPage() {
    const { id } = useParams<{ id: string }>();
    const lockId = id ? BigInt(id) : undefined;

    const { data: lockInfo, isLoading: isLoadingLock, error: lockError } = useReadContract({
        address: TokenLocker.address,
        abi: TokenLocker.abi as Abi,
        functionName: 'getLock',
        args: lockId !== undefined ? [lockId] : undefined,
        query: {
            enabled: lockId !== undefined,
        }
    });

    const lock = lockInfo as LockInfo | undefined;

    const { data: tokenSymbol } = useReadContract({
        abi: erc20Abi,
        address: lock?.token,
        functionName: 'symbol',
        query: {
            enabled: !!lock?.token,
        }
    });

    const { data: tokenDecimals } = useReadContract({
        abi: erc20Abi,
        address: lock?.token,
        functionName: 'decimals',
        query: {
            enabled: !!lock?.token,
        }
    });

    const { data: tokenName } = useReadContract({
        abi: erc20Abi,
        address: lock?.token,
        functionName: 'name',
        query: {
            enabled: !!lock?.token,
        }
    });

    const formattedAmount = useMemo(() => {
        if (!lock?.amount || tokenDecimals === undefined) return '...';
        return formatUnits(lock.amount, tokenDecimals);
    }, [lock?.amount, tokenDecimals]);

    const lockStatus = useMemo(() => {
        if (!lock) return 'unknown';
        if (lock.withdrawn) return 'withdrawn';
        const now = Date.now();
        const unlockTimestamp = Number(lock.unlockDate) * 1000;
        return now >= unlockTimestamp ? 'unlockable' : 'locked';
    }, [lock]);

    if (isLoadingLock) {
        return (
            <div className="container mx-auto px-4 py-12">
                <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] max-w-2xl mx-auto">
                    <CardContent className="p-12 text-center">
                        <Lock className="w-16 h-16 mx-auto animate-pulse text-gray-400" />
                        <p className="text-lg font-bold mt-4">Loading Lock #{id}...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (lockError || !lock) {
        return (
            <div className="container mx-auto px-4 py-12">
                <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] max-w-2xl mx-auto">
                    <CardContent className="p-12 text-center space-y-4">
                        <XCircle className="w-16 h-16 mx-auto text-red-500" />
                        <p className="text-xl font-black">Lock Not Found</p>
                        <p className="text-gray-600">Lock #{id} does not exist or has not been created yet.</p>
                        <Link to="/dashboard/tools/token-locker">
                            <Button className="border-4 border-black bg-[#7DF9FF] text-black font-black uppercase tracking-wider shadow-[3px_3px_0_rgba(0,0,0,1)]">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Locker
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 text-black">
            {/* Back Link */}
            <Link 
                to="/dashboard/tools/token-locker"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-6 font-bold"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Token Locker
            </Link>

            {/* Header */}
            <div className="mb-8">
                <div className={`border-b-4 border-black p-6 shadow-[4px_4px_0_rgba(0,0,0,1)] ${
                    lockStatus === 'withdrawn' ? 'bg-gray-300' :
                    lockStatus === 'unlockable' ? 'bg-[#90EE90]' :
                    'bg-[#FFFB8F]'
                }`}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-sm uppercase font-bold text-gray-600">Lock #{id}</p>
                            <h1 className="text-3xl font-black uppercase tracking-wider flex items-center gap-3">
                                <Lock className="w-8 h-8" />
                                {lock.name || `Token Lock #${id}`}
                            </h1>
                        </div>
                        <div className={`px-4 py-2 border-4 border-black font-black uppercase text-sm ${
                            lockStatus === 'withdrawn' ? 'bg-gray-500 text-white' :
                            lockStatus === 'unlockable' ? 'bg-green-600 text-white' :
                            'bg-yellow-500 text-black'
                        }`}>
                            {lockStatus === 'withdrawn' ? '✓ Withdrawn' :
                             lockStatus === 'unlockable' ? '🔓 Unlockable' :
                             '🔒 Locked'}
                        </div>
                    </div>
                    {lock.description && (
                        <p className="mt-4 text-gray-700 italic text-lg">"{lock.description}"</p>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Token Info */}
                <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0">
                    <CardHeader className="border-b-2 border-black bg-[#7DF9FF] p-4">
                        <CardTitle className="font-black uppercase tracking-wider flex items-center gap-2">
                            <Coins className="w-5 h-5" />
                            Locked Token
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <p className="text-xs uppercase font-bold text-gray-500">Token Name</p>
                            <p className="text-xl font-black">{tokenName ?? '...'}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-gray-500">Symbol</p>
                            <p className="text-2xl font-black">{tokenSymbol ?? '...'}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-gray-500">Contract Address</p>
                            <a 
                                href={`${EXPLORER_URL}/address/${lock.token}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-sm hover:underline flex items-center gap-2"
                            >
                                {lock.token}
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                        <div className="pt-4 border-t-2 border-gray-200">
                            <p className="text-xs uppercase font-bold text-gray-500">Locked Amount</p>
                            <p className="text-4xl font-black">
                                {formattedAmount} <span className="text-xl">{tokenSymbol}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Owner Info */}
                <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0">
                    <CardHeader className="border-b-2 border-black bg-[#FFB6C1] p-4">
                        <CardTitle className="font-black uppercase tracking-wider flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Lock Owner
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <p className="text-xs uppercase font-bold text-gray-500">Owner Address</p>
                            <a 
                                href={`${EXPLORER_URL}/address/${lock.owner}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-sm hover:underline flex items-center gap-2 break-all"
                            >
                                {lock.owner}
                                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                            </a>
                        </div>
                        <div className="p-4 bg-gray-100 border-2 border-gray-300">
                            <p className="text-sm text-gray-600">
                                The owner has exclusive rights to withdraw tokens after the unlock date, extend the lock duration, or transfer ownership to another address.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Section */}
            {!lock.withdrawn && (
                <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0 mt-6">
                    <CardHeader className="border-b-2 border-black bg-white p-4">
                        <CardTitle className="font-black uppercase tracking-wider flex items-center gap-2">
                            <Timer className="w-5 h-5" />
                            Lock Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <LockProgressBar lockDate={lock.lockDate} unlockDate={lock.unlockDate} />
                    </CardContent>
                </Card>
            )}

            {/* Timeline */}
            <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0 mt-6">
                <CardHeader className="border-b-2 border-black bg-white p-4">
                    <CardTitle className="font-black uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-4 top-0 bottom-0 w-1 bg-black"></div>
                        
                        {/* Lock Created */}
                        <div className="relative flex items-start gap-4 pb-8">
                            <div className="w-9 h-9 rounded-full bg-[#7DF9FF] border-4 border-black flex items-center justify-center z-10">
                                <Lock className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-black uppercase">Lock Created</p>
                                <p className="text-gray-600">
                                    {format(new Date(Number(lock.lockDate) * 1000), 'MMMM d, yyyy \'at\' HH:mm:ss')}
                                </p>
                            </div>
                        </div>

                        {/* Unlock Date */}
                        <div className="relative flex items-start gap-4 pb-8">
                            <div className={`w-9 h-9 rounded-full border-4 border-black flex items-center justify-center z-10 ${
                                lockStatus === 'locked' ? 'bg-[#FFFB8F]' : 'bg-[#90EE90]'
                            }`}>
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-black uppercase">Unlock Date</p>
                                <p className="text-gray-600">
                                    {format(new Date(Number(lock.unlockDate) * 1000), 'MMMM d, yyyy \'at\' HH:mm:ss')}
                                </p>
                                {lockStatus === 'locked' && (
                                    <p className="text-yellow-600 font-bold mt-1">
                                        {formatDistanceToNow(new Date(Number(lock.unlockDate) * 1000), { addSuffix: true })}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Withdrawn (if applicable) */}
                        {lock.withdrawn && (
                            <div className="relative flex items-start gap-4">
                                <div className="w-9 h-9 rounded-full bg-gray-400 border-4 border-black flex items-center justify-center z-10">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="font-black uppercase">Tokens Withdrawn</p>
                                    <p className="text-gray-600">
                                        The locked tokens have been claimed by the owner.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Verification Notice */}
            <Card className="border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0 gap-0 mt-6 bg-[#FFF9F0]">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#7DF9FF] border-4 border-black flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-black uppercase text-lg">Verified On-Chain</p>
                            <p className="text-gray-600 mt-1">
                                This lock is verified on the blockchain. All data is fetched directly from the smart contract at{' '}
                                <a 
                                    href={`${EXPLORER_URL}/address/${TokenLocker.address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-sm hover:underline"
                                >
                                    {TokenLocker.address.slice(0, 10)}...{TokenLocker.address.slice(-8)}
                                </a>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

