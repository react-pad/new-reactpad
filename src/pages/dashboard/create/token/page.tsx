
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
import { TokenFactoryContract } from "@/lib/config";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { parseUnits } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

type TokenType = 'Plain' | 'Mintable' | 'Burnable' | 'Taxable' | 'NonMintable';

export default function CreateTokenPage() {
  const { address } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const [tokenType, setTokenType] = useState<TokenType>('Plain');
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState("18");
  const [initialSupply, setInitialSupply] = useState("1000000");
  const [initialRecipient, setInitialRecipient] = useState("");
  const [taxWallet, setTaxWallet] = useState("");
  const [taxBps, setTaxBps] = useState("0");

  useEffect(() => {
    if (address) {
      setInitialRecipient(address);
    }
  }, [address])

  const handleCreateToken = async () => {
    const tokenParams = {
      name,
      symbol,
      decimals: parseInt(decimals),
      initialSupply: parseUnits(initialSupply, parseInt(decimals)),
      initialRecipient: initialRecipient as `0x${string}`
    };

    let functionName: "createPlainToken" | "createMintableToken" | "createBurnableToken" | "createTaxableToken" | "createNonMintableToken";
    const args: unknown[] = [tokenParams];

    switch (tokenType) {
      case 'Plain':
        functionName = "createPlainToken";
        break;
      case 'Mintable':
        functionName = "createMintableToken";
        break;
      case 'Burnable':
        functionName = "createBurnableToken";
        break;
      case 'Taxable':
        functionName = "createTaxableToken";
        const taxParams = {
          taxWallet: taxWallet as `0x${string}`,
          taxBps: parseInt(taxBps)
        }
        args.push(taxParams);
        break;
      case 'NonMintable':
        functionName = "createNonMintableToken";
        break;
      default:
        toast.error("Invalid token type selected");
        return;
    }

    writeContract({
      address: TokenFactoryContract.address,
      abi: TokenFactoryContract.abi,
      functionName,
      args: args as never,
    });
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  useEffect(() => {
    if (isConfirming) {
      toast.loading("Transaction is confirming...");
    }
    if (isConfirmed) {
      toast.success("Token created successfully!");
    }
    if (error) {
      toast.error(error.message);
    }
  }, [isConfirming, isConfirmed, error])

  return (
    <div className="container mx-auto px-4 py-12 text-black">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create a new Token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="token-type">Token Type</Label>
            <Select onValueChange={(value) => setTokenType(value as TokenType)} defaultValue="Plain">
              <SelectTrigger id="token-type">
                <SelectValue placeholder="Select token type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Plain">Plain</SelectItem>
                <SelectItem value="Mintable">Mintable</SelectItem>
                <SelectItem value="Burnable">Burnable</SelectItem>
                <SelectItem value="Taxable">Taxable</SelectItem>
                <SelectItem value="NonMintable">Non-Mintable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. My Token" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Input id="symbol" placeholder="e.g. MTK" value={symbol} onChange={e => setSymbol(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="decimals">Decimals</Label>
              <Input id="decimals" type="number" placeholder="18" value={decimals} onChange={e => setDecimals(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initial-supply">Initial Supply</Label>
              <Input id="initial-supply" type="number" placeholder="1000000" value={initialSupply} onChange={e => setInitialSupply(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial-recipient">Initial Recipient</Label>
            <Input id="initial-recipient" placeholder="e.g. 0x..." value={initialRecipient} onChange={e => setInitialRecipient(e.target.value)} />
            <p className="text-xs text-gray-500">Defaults to your connected wallet address.</p>
          </div>

          {tokenType === 'Taxable' && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Taxable Token Configuration</h3>
              <div className="space-y-2">
                <Label htmlFor="tax-wallet">Tax Wallet</Label>
                <Input id="tax-wallet" placeholder="e.g. 0x..." value={taxWallet} onChange={e => setTaxWallet(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax-bps">Tax (in BPS, 1% = 100)</Label>
                <Input id="tax-bps" type="number" placeholder="100" value={taxBps} onChange={e => setTaxBps(e.target.value)} />
              </div>
            </div>
          )}

          <Button onClick={handleCreateToken} disabled={isPending || isConfirming} className="w-full">
            {isPending || isConfirming ? 'Creating Token...' : 'Create Token'}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}