import { steemApi } from "@/libs/steem";
import { Input, Button } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useAccountsContext } from "../auth/AccountsContext";

const TradeForm = ({
  type,
  ticker,
  selectedPrice,
  balances,
  onSuccess,
}: {
  type: "buy" | "sell";
  ticker: MarketTicker | undefined;
  selectedPrice?: number;
  balances: { steem: number; sbd: number };
  onSuccess: () => void;
}) => {
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { data: session } = useSession();
  const { authenticateOperation } = useAccountsContext();

  const total = useMemo(() => {
    const p = parseFloat(price) || 0;
    const a = parseFloat(amount) || 0;
    return (p * a).toFixed(3);
  }, [price, amount]);

  useEffect(() => {
    if (selectedPrice) {
      setPrice(selectedPrice.toFixed(6));
    }
  }, [selectedPrice]);

  useEffect(() => {
    if (ticker && !price && !selectedPrice) {
      setPrice(
        type === "buy"
          ? ticker.lowest_ask.toFixed(6)
          : ticker.highest_bid.toFixed(6)
      );
    }
  }, [ticker, type, selectedPrice]);

  const handleTrade = async () => {
    setIsPending(true);
    try {
      const p = parseFloat(price);
      const a = parseFloat(amount);
      const amountToSell =
        type === "buy" ? `${(p * a).toFixed(3)} SBD` : `${a.toFixed(3)} STEEM`;
      const minToReceive =
        type === "buy" ? `${a.toFixed(3)} STEEM` : `${(p * a).toFixed(3)} SBD`;

      const { key, useKeychain } = await authenticateOperation("active");
      await steemApi.createLimitOrder(
        session?.user?.name!,
        Date.now(),
        amountToSell,
        minToReceive,
        false,
        60 * 60 * 24 * 7, // 1 week
        key,
        useKeychain
      );

      toast.success(`Order created successfully`);
      setAmount("");
      onSuccess();
    } catch (e: any) {
      toast.error(e.message || "Failed to create order");
    } finally {
      setIsPending(false);
    }
  };

  const balance = type === "buy" ? balances.sbd : balances.steem;
  const unit = type === "buy" ? "SBD" : "STEEM";

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-tiny font-bold text-default-500 uppercase">
          Available
        </span>
        <span
          className="text-xs font-semibold cursor-pointer hover:text-primary transition-colors"
          onClick={() => {
            if (type === "sell") setAmount(balance.toString());
            else if (parseFloat(price) > 0)
              setAmount((balance / parseFloat(price)).toFixed(3));
          }}
        >
          {balance.toFixed(3)} {unit}
        </span>
      </div>

      <Input
        label="Price"
        placeholder="0.000000"
        value={price}
        onValueChange={setPrice}
        endContent={<span className="text-tiny text-muted font-bold">SBD</span>}
        variant="bordered"
        size="sm"
      />

      <Input
        label="Amount"
        placeholder="0.000"
        value={amount}
        onValueChange={setAmount}
        endContent={
          <span className="text-tiny text-muted font-bold">STEEM</span>
        }
        variant="bordered"
        size="sm"
      />

      <div className="flex flex-col gap-1 px-1">
        <span className="text-tiny text-default-500 uppercase font-bold tracking-tight">
          Total
        </span>
        <span className="text-lg font-bold">
          {total} <span className="text-muted">SBD</span>
        </span>
      </div>

      <Button
        color={type === "buy" ? "success" : "danger"}
        fullWidth
        className=" mt-2"
        size="lg"
        isLoading={isPending}
        onPress={handleTrade}
      >
        {type === "buy" ? "Buy STEEM" : "Sell STEEM"}
      </Button>
    </div>
  );
};

export default TradeForm;
