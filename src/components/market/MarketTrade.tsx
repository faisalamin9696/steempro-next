import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLogin } from "../auth/AuthProvider";
import { useSession } from "next-auth/react";
import { createMarketOrder } from "@/libs/steem/condenser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MarketTicker } from "@/hooks/useMarketData";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { AsyncUtils } from "@/utils/async.utils";
import KeychainButton from "../KeychainButton";

interface Props {
  ticker?: MarketTicker;
  onPriceSelection?: (price: number) => void;
  markPrice?: string;
}
function MarketTrade(props: Props) {
  const { ticker, markPrice } = props;
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState("");
  const [amountSteem, setAmountSteem] = useState("");
  const [amountSbd, setAmountSbd] = useState("");
  const [lastEdited, setLastEdited] = useState<
    "price" | "steem" | "sbd" | null
  >(null);
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { authenticateUserActive, isAuthorizedActive } = useLogin();
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    const p = parseFloat(price);
    const a = parseFloat(amountSteem);
    const s = parseFloat(amountSbd);

    if (isNaN(p) || p <= 0) return;

    if (lastEdited === "price") {
      // Recalculate both directions based on what's filled
      if (!isNaN(a) && a > 0) {
        setAmountSbd((p * a).toFixed(3));
      } else if (!isNaN(s) && s > 0) {
        setAmountSteem((s / p).toFixed(3));
      }
    } else if (lastEdited === "steem" && !isNaN(a) && a > 0) {
      setAmountSbd((p * a).toFixed(3));
    } else if (lastEdited === "sbd" && !isNaN(s) && s > 0) {
      setAmountSteem((s / p).toFixed(3));
    }
  }, [price, amountSteem, amountSbd, lastEdited]);

  useEffect(() => {
    if (markPrice) setPrice(markPrice);
  }, [markPrice]);

  const orderMutation = useMutation({
    mutationFn: (data: {
      amount_to_sell: string;
      min_to_receive: string;
      key: string;
      tradeType: "buy" | "sell";
      isKeychain?: boolean;
    }) =>
      Promise.all([
        createMarketOrder(
          loginInfo,
          data.amount_to_sell,
          data.min_to_receive,
          data.key,
          data.isKeychain
        ),
        AsyncUtils.sleep(4),
      ]),
    onSuccess(data, variables) {
      const action = variables.tradeType === "buy" ? "Buying" : "Selling";
      const fromTo = variables.tradeType === "buy" ? "at" : "for";

      if (variables.tradeType === "buy") {
        const newSbd = Math.max(
          0,
          loginInfo?.balance_sbd - parseFloat(amountSbd)
        );

        dispatch(saveLoginHandler({ ...loginInfo, balance_sbd: newSbd }));
      } else {
        const newSteem = Math.max(
          0,
          loginInfo?.balance_steem - parseFloat(amountSteem)
        );
        dispatch(saveLoginHandler({ ...loginInfo, balance_steem: newSteem }));
      }

      setAmountSteem("");
      setAmountSbd("");
      setPrice("");
      setLastEdited(null);

      // invalidate recenet trades data
      queryClient.invalidateQueries({
        queryKey: ["openOrders"],
      });
      queryClient.invalidateQueries({ queryKey: ["orderBook"] });

      toast.success(`${tradeType === "buy" ? "Buy" : "Sell"} Order Placed`, {
        description: `${action} ${amountSteem} STEEM ${fromTo} ${price} SBD each`,
      });
    },
    onError(error) {
      toast.error("Trade Error", {
        description: error.message || "Unknown error occurred",
      });
    },
  });

  const handleTradeOrder = (isKeychain?: boolean) => {
    if (!amountSteem || !price) return;

    const credentials = authenticateUserActive(isKeychain);
    if (!isAuthorizedActive(credentials?.key)) {
      return;
    }

    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }
    const steemAmount = `${parseFloat(amountSteem).toFixed(3)} STEEM`;
    const sbdAmount = `${(parseFloat(amountSteem) * parseFloat(price)).toFixed(
      3
    )} SBD`;

    const amount_to_sell = tradeType === "buy" ? sbdAmount : steemAmount;
    const min_to_receive = tradeType === "buy" ? steemAmount : sbdAmount;
    // --- Construct operation ---
    if (!session?.user?.name) throw new Error("Not logged in");

    orderMutation.mutate({
      amount_to_sell,
      min_to_receive,
      key: credentials.key,
      tradeType: tradeType,
      isKeychain: credentials.keychainLogin,
    });
  };

  return (
    <Card className=" dark:bg-black/40 border border-gray-200/20">
      <CardHeader>
        <CardBody className="text-default-800 text-lg sm:text-xl">
          Trade STEEM
        </CardBody>
        <CardBody className="text-gray-500 text-sm sm:text-base text-end">
          Buy or sell STEEM with SBD
        </CardBody>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="flex gap-2 p-1 rounded-lg">
          <Button
            variant={tradeType === "buy" ? undefined : "ghost"}
            onPress={() => setTradeType("buy")}
            className={`flex-1 ${
              tradeType === "buy"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "hover:bg-gray-200 text-default-600"
            }`}
          >
            Buy
          </Button>
          <Button
            variant={tradeType === "sell" ? undefined : "ghost"}
            onPress={() => setTradeType("sell")}
            className={`flex-1 ${
              tradeType === "sell"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "hover:bg-gray-200 text-default-600"
            }`}
          >
            Sell
          </Button>
        </div>

        <Input
          value={price}
          onValueChange={(value) => {
            setPrice(value);
            setLastEdited("price");
          }}
          placeholder="0.000000"
          className="border-gray-300"
          label={"Price"}
          inputMode="numeric"
          endContent={
            <Button
              variant="ghost"
              size="sm"
              onPress={() => {
                const marketPrice = parseFloat(ticker?.latest || "0").toFixed(
                  6
                );
                setPrice(marketPrice);
                setLastEdited("price");
              }}
              className="text-xs text-[#07d7a9] hover:text-[#06c49a]"
            >
              Use Market Price
            </Button>
          }
        />
        <div className="flex flex-row gap-2 pb-[25px]">
          <Input
            value={amountSteem}
            onValueChange={(value) => {
              setAmountSteem(value);
              setLastEdited("steem");
            }}
            placeholder="0.000"
            className="border-gray-300"
            label={"Amount (STEEM)"}
            inputMode="numeric"
            description={
              tradeType === "sell" && (
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1">
                    <span
                      className="hover:opacity-hover text-red-500 cursor-pointer"
                      onClick={() => {
                        setAmountSteem(loginInfo.balance_steem?.toString());
                        setLastEdited("steem");
                      }}
                    >
                      Available:
                    </span>
                    <p className="font-mono">
                      {loginInfo.balance_steem}
                      {" STEEM"}
                    </p>
                  </div>

                  {ticker?.highest_bid && (
                    <div className="flex gap-1">
                      <span
                        className="hover:opacity-hover text-red-500 cursor-pointer"
                        onClick={() => {
                          setPrice(parseFloat(ticker.highest_bid).toFixed(6));
                        }}
                      >
                        Highest bid:
                      </span>
                      <p className="font-mono">
                        {parseFloat(ticker.highest_bid).toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              )
            }
          />

          <Input
            value={amountSbd}
            onValueChange={(value) => {
              setAmountSbd(value);
              setLastEdited("sbd");
            }}
            placeholder="0.000"
            className="border-gray-300"
            label={"Amount (SBD)"}
            inputMode="numeric"
            description={
              tradeType === "buy" && (
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1">
                    <span
                      className="hover:opacity-hover text-green-500 cursor-pointer"
                      onClick={() => {
                        setAmountSbd(loginInfo.balance_sbd?.toString());
                        setLastEdited("sbd");
                      }}
                    >
                      Available:
                    </span>
                    <p className="font-mono">
                      {loginInfo.balance_sbd}
                      {" SBD"}
                    </p>
                  </div>

                  {ticker?.lowest_ask && (
                    <div className="flex gap-1">
                      <span
                        className="hover:opacity-hover text-green-500 cursor-pointer"
                        onClick={() => {
                          setPrice(parseFloat(ticker?.lowest_ask).toFixed(6));
                        }}
                      >
                        Lowest ask:
                      </span>
                      <p className="font-mono">
                        {parseFloat(ticker?.lowest_ask).toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              )
            }
          />
        </div>
        <div className="flex flex-row justify-between gap-2 items-center">
          <KeychainButton
            isDisabled={!amountSteem || !price || orderMutation.isPending}
            onPress={() => handleTradeOrder(true)}
          />
          <Button
            onPress={() => handleTradeOrder()}
            className={`flex-1 text-white text-sm sm:text-base  ${
              tradeType === "buy"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
            isDisabled={!amountSteem || !price}
            isLoading={orderMutation.isPending}
          >
            Place {tradeType === "buy" ? "Buy" : "Sell"} Order
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

export default MarketTrade;
