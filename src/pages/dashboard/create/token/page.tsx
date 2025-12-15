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
import { TokenFactory, TokenLocker } from "@/lib/config";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { decodeEventLog, maxUint256, parseUnits, erc20Abi } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

const TokenType = {
  Plain: 0,
  Mintable: 1,
  Burnable: 2,
  Taxable: 3,
  NonMintable: 4
} as const;

type TokenType = typeof TokenType[keyof typeof TokenType];

export default function CreateTokenPage() {
  const { address } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const [tokenType, setTokenType] = useState<TokenType>(TokenType.Plain);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState("18");
  const [initialSupply, setInitialSupply] = useState("1000000");
  const [initialRecipient, setInitialRecipient] = useState("");
  const [taxWallet, setTaxWallet] = useState("");
  const [taxBps, setTaxBps] = useState("0");

  const [newlyCreatedTokenAddress, setNewlyCreatedTokenAddress] = useState<string | null>(null);
  const [lockAmount, setLockAmount] = useState("");
  const [lockDuration, setLockDuration] = useState("");
  const [lockName, setLockName] = useState("Liquidity Lock");
  const [lockDescription, setLockDescription] = useState("Initial token lock after creation");

  const { data: approveHash, writeContract: approve, isPending: isApproving } = useWriteContract();
  const { data: lockHash, writeContract: lockTokens, isPending: isLocking } = useWriteContract();

  const parsedLockAmount = useMemo(() => newlyCreatedTokenAddress && lockAmount ? parseUnits(lockAmount, parseInt(decimals)) : BigInt(0), [lockAmount, decimals, newlyCreatedTokenAddress]);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: newlyCreatedTokenAddress as `0x${string}`,
    functionName: 'allowance',
    args: [address!, TokenLocker.address as `0x${string}`],
    query: {
      enabled: !!address && !!newlyCreatedTokenAddress,
    }
  });

  const needsApproval = useMemo(() => {
    if (!allowance) return false;
    return allowance < parsedLockAmount;
  }, [allowance, parsedLockAmount]);

  useEffect(() => {
    if (address) {
      setInitialRecipient(address);
    }
  }, [address])

  const handleCreateToken = async () => {
    setNewlyCreatedTokenAddress(null);
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
      case TokenType.Plain:
        functionName = "createPlainToken";
        break;
      case TokenType.Mintable:
        functionName = "createMintableToken";
        break;
      case TokenType.Burnable:
        functionName = "createBurnableToken";
        break;
      case TokenType.Taxable:
        functionName = "createTaxableToken";
        const taxParams = {
          taxWallet: taxWallet as `0x${string}`,
          taxBps: parseInt(taxBps)
        }
        args.push(taxParams);
        break;
      case TokenType.NonMintable:
        functionName = "createNonMintableToken";
        break;
      default:
        toast.error("Invalid token type selected");
        return;
    }

    writeContract({
      address: TokenFactory.address as `0x${string}`,
      abi: TokenFactory.abi,
      functionName,
      args: args as never,
    });
  }

  const handleApprove = () => {
    if (!newlyCreatedTokenAddress) return;
    approve({
      address: newlyCreatedTokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [TokenLocker.address as `0x${string}`, maxUint256]
    })
  }

  const handleLock = () => {
    if (!newlyCreatedTokenAddress) return;
    const durationInSeconds = parseInt(lockDuration) * 24 * 60 * 60;
    lockTokens({
      address: TokenLocker.address as `0x${string}`,
      abi: TokenLocker.abi,
      functionName: "lockTokens",
      args: [
        newlyCreatedTokenAddress as `0x${string}`,
        parsedLockAmount,
        BigInt(durationInSeconds),
        lockName,
        lockDescription
      ]
    })
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed, data: createTokenReceipt } =
    useWaitForTransactionReceipt({
      hash,
    })

  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isLockConfirming, isSuccess: isLockSuccess } = useWaitForTransactionReceipt({
    hash: lockHash,
  });

  useEffect(() => {
    if (isConfirming) {
      toast.loading("Transaction is confirming...");
    }
    if (isConfirmed && createTokenReceipt) {
      const event = createTokenReceipt.logs
        .map(log => {
          try {
            return decodeEventLog({
              abi: TokenFactory.abi,
              data: log.data,
              topics: log.topics,
            });
          } catch {
            return null;
          }
        })
        .find(decoded => decoded?.eventName === 'TokenCreated');

      if (event) {
        const tokenAddress = (event.args as unknown as { token: `0x${string}` }).token;
        setNewlyCreatedTokenAddress(tokenAddress);
        toast.success("Token created successfully!");
      } else {
        toast.error("Could not find TokenCreated event in transaction logs.");
      }
    }
    if (error) {
      toast.error(error.message);
    }
  }, [isConfirming, isConfirmed, createTokenReceipt, error])

  useEffect(() => {
    if (isApproveConfirming) {
      toast.loading("Approval confirming...");
    }
    if (isApproveSuccess) {
      toast.success("Approval successful! You can now lock your tokens.");
      refetchAllowance();
    }
  }, [isApproveConfirming, isApproveSuccess, refetchAllowance]);

  useEffect(() => {
    if (isLocking) {
      toast.loading("Locking tokens...");
    }
    if (isLockSuccess) {
      toast.success("Tokens locked successfully!");
      setLockAmount("");
      setLockDuration("");
    }
  }, [isLocking, isLockSuccess]);

  return (
    <div className="container mx-auto px-4 py-12 text-black">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create a new Token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="token-type">Token Type</Label>
            <Select onValueChange={(value) => setTokenType(parseInt(value) as TokenType)} defaultValue={TokenType.Plain.toString()}>
              <SelectTrigger id="token-type">
                <SelectValue placeholder="Select token type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TokenType.Plain.toString()}>Plain</SelectItem>
                <SelectItem value={TokenType.Mintable.toString()}>Mintable</SelectItem>
                <SelectItem value={TokenType.Burnable.toString()}>Burnable</SelectItem>
                <SelectItem value={TokenType.Taxable.toString()}>Taxable</SelectItem>
                <SelectItem value={TokenType.NonMintable.toString()}>Non-Mintable</SelectItem>
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

          {tokenType === TokenType.Taxable && (
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

      {newlyCreatedTokenAddress && (
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Lock Your New Token</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Token Address</Label>
              <Input value={newlyCreatedTokenAddress} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lock-amount">Amount to Lock</Label>
              <Input id="lock-amount" type="number" placeholder="e.g. 100000" value={lockAmount} onChange={e => setLockAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lock-duration">Lock Duration (in days)</Label>
              <Input id="lock-duration" type="number" placeholder="e.g. 365" value={lockDuration} onChange={e => setLockDuration(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lock-name">Lock Name / Reason</Label>
              <Input id="lock-name" placeholder="e.g. Team Tokens Vesting" value={lockName} onChange={e => setLockName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lock-description">Description (Optional)</Label>
              <Input id="lock-description" placeholder="e.g. Monthly vesting for core contributors" value={lockDescription} onChange={e => setLockDescription(e.target.value)} />
            </div>

            {needsApproval ? (
              <Button onClick={handleApprove} disabled={isApproving || isApproveConfirming} className="w-full">
                {isApproving || isApproveConfirming ? "Approving..." : "Approve Tokens for Locking"}
              </Button>
            ) : (
              <Button onClick={handleLock} disabled={isLocking || isLockConfirming || !lockAmount || !lockDuration} className="w-full">
                {isLocking || isLockConfirming ? "Locking..." : "Lock Tokens"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}