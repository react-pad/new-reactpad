import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { config } from "@/config/wagmi.config";
import { LaunchpadPresaleContract, OWNER, PresaleFactory } from "@/lib/config";
import { LaunchpadService } from "@/lib/services/launchpad-service";
import { useBlockchainStore } from "@/lib/store/blockchain-store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { decodeEventLog, erc20Abi, formatEther, parseEther, type Abi, type Address } from "viem";
import {
    useAccount,
    useSendTransaction,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";
import { readContract, readContracts } from "wagmi/actions";

interface PresaleFormData {
    saleToken: string;
    paymentToken: string;
    startTime: string;
    endTime: string;
    rate: string;
    softCap: string;
    hardCap: string;
    minContribution: string;
    maxContribution: string;
    owner: string;
}

function CreatePresaleForm({
    formData,
    setFormData,
    onPresaleCreated,
}: {
    formData: PresaleFormData;
    setFormData: React.Dispatch<React.SetStateAction<PresaleFormData>>;
    onPresaleCreated: (hash: `0x${string}`) => void;
}) {
    const { address } = useAccount();
    const { writeContract, isPending, error } = useWriteContract();
    const [isChecking, setIsChecking] = useState(false);
    // const router = useRouter();

    const router = useNavigate();

    const {
        saleToken,
        paymentToken,
        startTime,
        endTime,
        rate,
        softCap,
        hardCap,
        minContribution,
        maxContribution,
        owner,
    } = formData;

    useEffect(() => {
        if (address && !owner) {
            setFormData((prev) => ({ ...prev, owner: address }));
        }
    }, [address, owner, setFormData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleCreatePresale = async () => {
        if (!saleToken) {
            toast.error("Sale Token Address is required.");
            return;
        }
        if (!owner) {
            toast.error("Presale Owner address is required.");
            return;
        }

        setIsChecking(true);
        try {
            // First get the total number of presales
            const totalPresales = await readContract(config, {
                address: PresaleFactory.address as Address,
                abi: PresaleFactory.abi,
                functionName: "totalPresales",
            }) as bigint;

            if (totalPresales > 0) {
                // Fetch all presale addresses
                const presaleAddresses = await readContracts(config, {
                    contracts: Array.from({ length: Number(totalPresales) }, (_, i) => ({
                        address: PresaleFactory.address as Address,
                        abi: PresaleFactory.abi as Abi,
                        functionName: "allPresales",
                        args: [BigInt(i)],
                    })),
                });

                const allPresales = presaleAddresses
                    .map(res => res.result as `0x${string}`)
                    .filter(Boolean);

                if (allPresales.length > 0) {
                    // Check if any presale uses the same sale token
                    const results = await readContracts(config, {
                        contracts: allPresales.map((presale) => ({
                            address: presale,
                            abi: LaunchpadPresaleContract.abi,
                            functionName: "saleToken",
                        })),
                    });

                    const existingPresale = results.find(
                        (res) => typeof res.result === 'string' && res.result.toLowerCase() === saleToken.toLowerCase()
                    );

                    if (existingPresale) {
                        toast.error("A presale for this token already exists.", {
                            action: {
                                label: "View Projects",
                                onClick: () => router("/projects"),
                            },
                        });
                        setIsChecking(false);
                        return;
                    }
                }
            }
        } catch (e) {
            console.error("Error checking for existing presale:", e);
            toast.error("Could not verify if a presale already exists. Please try again.");
            setIsChecking(false);
            return;
        }
        setIsChecking(false);

        const presaleConfig = {
            startTime: BigInt(new Date(startTime).getTime() / 1000),
            endTime: BigInt(new Date(endTime).getTime() / 1000),
            rate: BigInt(Math.round(Number(rate) * 100)), // scale rate by 100
            softCap: parseEther(softCap),
            hardCap: parseEther(hardCap),
            minContribution: parseEther(minContribution),
            maxContribution: parseEther(maxContribution),
        };

        const finalPaymentToken = (paymentToken ||
            "0x0000000000000000000000000000000000000000") as `0x${string}`;

        const params = {
            saleToken: saleToken as `0x${string}`,
            paymentToken: finalPaymentToken,
            config: presaleConfig,
            owner: owner as `0x${string}`,
        };

        writeContract(
            {
                address: PresaleFactory.address as Address,
                abi: PresaleFactory.abi,
                functionName: "createPresale",
                args: [params],
            },
            {
                onSuccess: (hash) => onPresaleCreated(hash),
            }
        );
    };

    useEffect(() => {
        if (error) {
            toast.error(error.message);
        }
    }, [error]);

    const isLoading = isPending || isChecking;

    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="saleToken">Sale Token Address</Label>
                <Input
                    id="saleToken"
                    placeholder="0x..."
                    value={saleToken}
                    onChange={handleChange}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="paymentToken">Payment Token Address</Label>
                <Input
                    id="paymentToken"
                    placeholder="0x... (leave blank for ETH)"
                    value={paymentToken}
                    onChange={handleChange}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                        id="startTime"
                        type="datetime-local"
                        value={startTime}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                        id="endTime"
                        type="datetime-local"
                        value={endTime}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="rate">Rate</Label>
                <Input
                    id="rate"
                    type="number"
                    placeholder="e.g. 1000 (tokens per ETH/payment token)"
                    value={rate}
                    onChange={handleChange}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="softCap">Soft Cap</Label>
                    <Input
                        id="softCap"
                        type="number"
                        placeholder="10"
                        value={softCap}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hardCap">Hard Cap</Label>
                    <Input
                        id="hardCap"
                        type="number"
                        placeholder="100"
                        value={hardCap}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="minContribution">Min Contribution</Label>
                    <Input
                        id="minContribution"
                        type="number"
                        placeholder="0.1"
                        value={minContribution}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="maxContribution">Max Contribution</Label>
                    <Input
                        id="maxContribution"
                        type="number"
                        placeholder="10"
                        value={maxContribution}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="owner">Presale Owner</Label>
                <Input
                    id="owner"
                    placeholder="0x..."
                    value={owner}
                    onChange={handleChange}
                />
            </div>
            <Button
                onClick={handleCreatePresale}
                disabled={isLoading}
                className="w-full"
            >
                {isChecking
                    ? "Checking for existing presale..."
                    : isPending
                        ? "Creating Presale..."
                        : "Create Presale"}
            </Button>
        </>
    );
}

function ManagePresaleView({
    presaleAddress,
    saleTokenAddress,
    hardCap,
    rate,
}: {
    presaleAddress: `0x${string}`;
    saleTokenAddress: `0x${string}`;
    hardCap: string;
    rate: string;
}) {
    const {
        writeContract: sendTokenFee,
        isPending: isSendingTokenFee,
        error: tokenFeeError,
    } = useWriteContract();
    const {
        sendTransaction: sendEthFee,
        isPending: isSendingEthFee,
        error: ethFeeError,
    } = useSendTransaction();
    const {
        writeContract: depositTokens,
        isPending: isDepositing,
        error: depositError,
    } = useWriteContract();

    const [depositAmount, setDepositAmount] = useState("");

    const tokenFeeAmount = useMemo(() => {
        if (!hardCap || !rate) return BigInt(0);
        try {
            const totalTokensForSale = parseEther(
                (Number(hardCap) * Number(rate)).toString()
            );
            return totalTokensForSale / BigInt(100);
        } catch {
            return BigInt(0);
        }
    }, [hardCap, rate]);

    const ethFeeAmount = useMemo(() => {
        return parseEther("0.01");
    }, []);

    const handleSendTokenFee = () =>
        sendTokenFee({
            address: saleTokenAddress,
            abi: erc20Abi,
            functionName: "transfer",
            args: [OWNER, tokenFeeAmount],
        });
    const handleSendEthFee = () =>
        sendEthFee({ to: OWNER, value: ethFeeAmount });
    const handleDepositTokens = () =>
        depositTokens({
            address: presaleAddress,
            abi: [
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "amount",
                            type: "uint256",
                        },
                    ],
                    name: "depositSaleTokens",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
            ],
            functionName: "depositSaleTokens",
            args: [parseEther(depositAmount)],
        });

    useEffect(() => {
        const err = tokenFeeError || ethFeeError || depositError;
        if (err) toast.error(err.message);
    }, [tokenFeeError, ethFeeError, depositError]);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h3 className="text-xl font-bold">Presale Created!</h3>
                <p className="text-gray-500">
                    Your presale contract is at{" "}
                    <a
                        href={`https://sepolia.etherscan.io/address/${presaleAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                    >
                        {presaleAddress}
                    </a>
                </p>
                <p className="text-gray-500 mt-2">Now, manage your presale below.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>1. Deposit Sale Tokens</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                        You must deposit the tokens you intend to sell into the presale
                        contract.
                    </p>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Amount of tokens to deposit"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                        />
                        <Button
                            onClick={handleDepositTokens}
                            disabled={isDepositing || !depositAmount}
                            className="w-40"
                        >
                            {isDepositing ? "Depositing..." : "Deposit"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>2. Pay Listing Fees</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                        To get your presale listed, please pay the following fees.
                    </p>
                    <div className="space-y-2">
                        <Label>Token Fee</Label>
                        <div className="flex items-center gap-2">
                            <Input value={`${formatEther(tokenFeeAmount)} tokens`} disabled />
                            <Button
                                onClick={handleSendTokenFee}
                                disabled={isSendingTokenFee}
                                className="w-40"
                            >
                                {isSendingTokenFee ? "Paying..." : "Pay"}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>ETH Fee</Label>
                        <div className="flex items-center gap-2">
                            <Input value={`${formatEther(ethFeeAmount)} ETH`} disabled />
                            <Button
                                onClick={handleSendEthFee}
                                disabled={isSendingEthFee}
                                className="w-40"
                            >
                                {isSendingEthFee ? "Paying..." : "Pay"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function CreatePresalePage() {
    const [searchParams] = useSearchParams();
    const { address } = useAccount();
    const { setPresales } = useBlockchainStore();
    const [creationHash, setCreationHash] = useState<`0x${string}` | undefined>(
        undefined
    );
    const [formData, setFormData] = useState({
        saleToken: searchParams.get("token") ?? "",
        paymentToken: "",
        startTime: "",
        endTime: "",
        rate: "",
        softCap: "",
        hardCap: "",
        minContribution: "",
        maxContribution: "",
        owner: address ?? "",
    });

    const {
        data: receipt,
        isLoading: isConfirming,
        isSuccess: isConfirmed,
    } = useWaitForTransactionReceipt({ hash: creationHash });

    // Derive presale address from receipt instead of using state
    const newPresaleAddress = useMemo(() => {
        if (!receipt) return null;
        for (const log of receipt.logs) {
            try {
                const event = decodeEventLog({
                    abi: PresaleFactory.abi as Abi,
                    data: log.data,
                    topics: log.topics,
                });
                if (event.eventName === "PresaleCreated" && event.args && 'presale' in event.args) {
                    return event.args.presale as `0x${string}`;
                }
            } catch {
                // Not the event we're looking for
            }
        }
        return null;
    }, [receipt]);

    const creationToastId = useRef<string | number | null>(null);
    const hasProcessedRef = useRef(false);

    useEffect(() => {
        if (isConfirming && !creationToastId.current) {
            creationToastId.current = toast.loading("Presale creation confirming...");
        } else if (!isConfirming && creationToastId.current) {
            toast.dismiss(creationToastId.current);
            creationToastId.current = null;
        }
    }, [isConfirming]);

    const savePresaleToDatabase = useCallback(async (presaleAddress: `0x${string}`, txHash: string) => {
        try {
            // Fetch token details from blockchain
            const [tokenNameResult, tokenSymbolResult, tokenDecimalsResult] = await readContracts(config, {
                contracts: [
                    {
                        address: formData.saleToken as `0x${string}`,
                        abi: erc20Abi,
                        functionName: "name",
                    },
                    {
                        address: formData.saleToken as `0x${string}`,
                        abi: erc20Abi,
                        functionName: "symbol",
                    },
                    {
                        address: formData.saleToken as `0x${string}`,
                        abi: erc20Abi,
                        functionName: "decimals",
                    },
                ],
            });

            const tokenName = tokenNameResult.result as string;
            const tokenSymbol = tokenSymbolResult.result as string;
            const tokenDecimals = tokenDecimalsResult.result as number;

            // Save to Supabase launchpad_presales table
            await LaunchpadService.createPresale({
                presale_address: presaleAddress.toLowerCase(),
                sale_token_address: formData.saleToken.toLowerCase(),
                payment_token_address: formData.paymentToken
                    ? formData.paymentToken.toLowerCase()
                    : undefined,
                token_name: tokenName,
                token_symbol: tokenSymbol,
                token_decimals: tokenDecimals,
                rate: (Number(formData.rate) * 100).toString(), // Scale rate by 100
                soft_cap: parseEther(formData.softCap).toString(),
                hard_cap: parseEther(formData.hardCap).toString(),
                min_contribution: parseEther(formData.minContribution).toString(),
                max_contribution: parseEther(formData.maxContribution).toString(),
                start_time: new Date(formData.startTime).toISOString(),
                end_time: new Date(formData.endTime).toISOString(),
                owner_address: formData.owner.toLowerCase(),
                creation_tx_hash: txHash,
            });

            toast.success("Presale saved to database!");
        } catch (error) {
            console.error("Error saving presale to database:", error);
            toast.error("Failed to save presale to database. Please contact support.");
        }
    }, [formData]);

    useEffect(() => {
        if (isConfirmed && newPresaleAddress && creationHash && !hasProcessedRef.current) {
            hasProcessedRef.current = true;
            toast.success(`Presale created successfully! Tx: ${creationHash.slice(0, 10)}...${creationHash.slice(-8)}`);
            // Invalidate the presales cache to force refetch
            setPresales([]);
            // Save presale to Supabase with transaction hash
            savePresaleToDatabase(newPresaleAddress, creationHash);
        }
    }, [isConfirmed, newPresaleAddress, creationHash, setPresales, savePresaleToDatabase]);

    return (
        <div className="container mx-auto px-4 py-12 text-black">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        {newPresaleAddress ? "Manage Your Presale" : "Create a new Presale"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!newPresaleAddress ? (
                        <CreatePresaleForm
                            formData={formData}
                            setFormData={setFormData}
                            onPresaleCreated={(hash) => setCreationHash(hash)}
                        />
                    ) : (
                        <ManagePresaleView
                            presaleAddress={newPresaleAddress}
                            saleTokenAddress={formData.saleToken as `0x${string}`}
                            hardCap={formData.hardCap}
                            rate={formData.rate}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}