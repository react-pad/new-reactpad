import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { config } from "@/config/wagmi.config";
import { LaunchpadPresaleContract, PresaleFactory } from "@/config/config";
// LaunchpadService removed - data is now stored only on blockchain
import { useBlockchainStore } from "@/lib/store/blockchain-store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { decodeEventLog, parseEther, type Abi, type Address } from "viem";
import {
  useAccount,
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
  requiresWhitelist: boolean;
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
    requiresWhitelist,
  } = formData;

  useEffect(() => {
    if (address && !owner) {
      setFormData((prev) => ({ ...prev, owner: address }));
    }
  }, [address, owner, setFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleToggleWhitelist = () => {
    setFormData((prev) => ({
      ...prev,
      requiresWhitelist: !prev.requiresWhitelist,
    }));
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
      const totalPresales = (await readContract(config, {
        address: PresaleFactory.address as Address,
        abi: PresaleFactory.abi,
        functionName: "totalPresales",
      })) as bigint;

      if (totalPresales > 0) {
        // Fetch all presale addresses
        const presaleAddresses = await readContracts(config, {
          contracts: Array.from({ length: Number(totalPresales) }, (_, i) => ({
            address: PresaleFactory.address as Address,
            abi: PresaleFactory.abi as unknown as Abi,
            functionName: "allPresales",
            args: [BigInt(i)],
          })),
        });

        const allPresales = presaleAddresses
          .map((res) => res.result as `0x${string}`)
          .filter(Boolean);

        if (allPresales.length > 0) {
          // Check if any presale uses the same sale token
          const results = await readContracts(config, {
            contracts: allPresales.map((presale) => ({
              address: presale,
              abi: LaunchpadPresaleContract.abi as unknown as Abi,
              functionName: "saleToken",
            })),
          });

          const existingPresale = results.find(
            (res) =>
              typeof res.result === "string" &&
              res.result.toLowerCase() === saleToken.toLowerCase()
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
      toast.error(
        "Could not verify if a presale already exists. Please try again."
      );
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
      requiresWhitelist,
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
      <div className="border-4 border-black bg-[#FFF9F0] p-4 space-y-2">
        <p className="text-xs font-black uppercase tracking-wider">
          Launchpad Custody & Fees
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            Deposit your sale tokens once—each presale contract holds custody
            for contributors.
          </li>
          <li>
            2% of the deposited tokens are routed to the launchpad
            automatically, so approve a little extra before depositing.
          </li>
          <li>
            3% of the native/payment tokens raised are collected when you
            withdraw proceeds.
          </li>
        </ul>
      </div>
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
      <div className="border-4 border-black bg-[#E0F2FE] p-4 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider">
              Whitelist Access
            </p>
            <p className="text-sm text-gray-700">
              {requiresWhitelist
                ? "Only wallets you approve will be able to contribute. Perfect for private or KYC-based launches."
                : "Anyone can contribute while the presale is live."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleWhitelist}
            className={`border-4 border-black px-4 py-2 font-black uppercase tracking-wide shadow-[3px_3px_0_rgba(0,0,0,1)] ${
              requiresWhitelist ? "bg-[#FFB3C1]" : "bg-white"
            }`}
          >
            {requiresWhitelist ? "Enabled" : "Disabled"}
          </button>
        </div>
        <p className="text-xs text-gray-600">
          You can add or remove addresses from the whitelist as soon as your
          presale is deployed.
        </p>
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

export default function CreatePresalePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
    requiresWhitelist: false,
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
        if (
          event.eventName === "PresaleCreated" &&
          event.args &&
          "presale" in event.args
        ) {
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

  // Database storage removed - presale data is now stored entirely on blockchain
  const savePresaleToDatabase = useCallback(
    async (presaleAddress: `0x${string}`, txHash: string) => {
      // No-op: All presale data is now stored on blockchain and fetched via hooks
      console.log(
        "Presale created at address:",
        presaleAddress,
        "with tx:",
        txHash
      );
    },
    []
  );

  useEffect(() => {
    if (
      isConfirmed &&
      newPresaleAddress &&
      creationHash &&
      !hasProcessedRef.current
    ) {
      hasProcessedRef.current = true;
      toast.success(
        `Presale created successfully! Tx: ${creationHash.slice(
          0,
          10
        )}...${creationHash.slice(-8)}`
      );
      // Invalidate the presales cache to force refetch
      setPresales([]);
      // Save presale to Supabase with transaction hash
      savePresaleToDatabase(newPresaleAddress, creationHash);
      // Redirect to manage page
      navigate(`/dashboard/presales/manage/${newPresaleAddress}`);
    }
  }, [
    isConfirmed,
    newPresaleAddress,
    creationHash,
    setPresales,
    savePresaleToDatabase,
    navigate,
  ]);

  return (
    <div className="container mx-auto px-4 py-12 text-black">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold">
            Create a new Presale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CreatePresaleForm
            formData={formData}
            setFormData={setFormData}
            onPresaleCreated={(hash) => setCreationHash(hash)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
