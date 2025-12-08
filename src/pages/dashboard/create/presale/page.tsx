
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PresaleFactoryContract } from "@/lib/config";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { parseEther } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export default function CreatePresalePage() {
    const [searchParams] = useSearchParams();
    const { address } = useAccount();
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const [saleToken, setSaleToken] = useState(searchParams.get("token") ?? "");
    const [paymentToken, setPaymentToken] = useState(""); // 0x0 for ETH
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [rate, setRate] = useState("");
    const [softCap, setSoftCap] = useState("");
    const [hardCap, setHardCap] = useState("");
    const [minContribution, setMinContribution] = useState("");
    const [maxContribution, setMaxContribution] = useState("");
    const [owner, setOwner] = useState(address ?? "");

    useEffect(() => {
        if (address) {
            setOwner(address);
        }
    }, [address])

    const handleCreatePresale = () => {
        const presaleConfig = {
            startTime: BigInt(new Date(startTime).getTime() / 1000),
            endTime: BigInt(new Date(endTime).getTime() / 1000),
            rate: parseEther(rate),
            softCap: parseEther(softCap),
            hardCap: parseEther(hardCap),
            minContribution: parseEther(minContribution),
            maxContribution: parseEther(maxContribution),
        };

        const params = {
            saleToken: saleToken as `0x${string}`,
            paymentToken: paymentToken as `0x${string}`,
            config: presaleConfig,
            owner: owner as `0x${string}`,
        }

        writeContract({
            address: PresaleFactoryContract.address,
            abi: PresaleFactoryContract.abi,
            functionName: "createPresale",
            args: [params]
        });
    };

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isConfirmed) {
            toast.success("Presale created successfully!");
        }
        if (error) {
            toast.error(error.message);
        }
    }, [isConfirmed, error])

    return (
        <div className="container mx-auto px-4 py-12 text-black">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Create a new Presale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="sale-token">Sale Token Address</Label>
                        <Input id="sale-token" placeholder="0x..." value={saleToken} onChange={e => setSaleToken(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="payment-token">Payment Token Address</Label>
                        <Input id="payment-token" placeholder="0x..." value={paymentToken} onChange={e => setPaymentToken(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start-time">Start Time</Label>
                            <Input id="start-time" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-time">End Time</Label>
                            <Input id="end-time" type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rate">Rate</Label>
                        <Input id="rate" type="number" placeholder="e.g. 1000 (tokens per ETH/payment token)" value={rate} onChange={e => setRate(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="soft-cap">Soft Cap</Label>
                            <Input id="soft-cap" type="number" placeholder="10" value={softCap} onChange={e => setSoftCap(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hard-cap">Hard Cap</Label>
                            <Input id="hard-cap" type="number" placeholder="100" value={hardCap} onChange={e => setHardCap(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="min-contribution">Min Contribution</Label>
                            <Input id="min-contribution" type="number" placeholder="0.1" value={minContribution} onChange={e => setMinContribution(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="max-contribution">Max Contribution</Label>
                            <Input id="max-contribution" type="number" placeholder="10" value={maxContribution} onChange={e => setMaxContribution(e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="owner">Presale Owner</Label>
                        <Input id="owner" placeholder="0x..." value={owner} onChange={e => setOwner(e.target.value)} />
                    </div>

                    <Button onClick={handleCreatePresale} disabled={isPending || isConfirming} className="w-full">
                        {isPending || isConfirming ? "Creating Presale..." : "Create Presale"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}