import { steemApi } from "@/libs/steem";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Trash2 } from "lucide-react";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAccountsContext } from "../auth/AccountsContext";
import { ColumnDef, DataTable } from "../ui/data-table";
import { getOrderAmount, getOrderPrice } from "@/app/market/page";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { addLoginHandler } from "@/hooks/redux/reducers/LoginReducer";

const OpenOrdersTable = ({
  orders,
  onUpdate,
}: {
  orders: OpenOrder[] | undefined;
  onUpdate: () => void;
}) => {
  const { data: session } = useSession();
  const [cancelling, setCancelling] = useState<number | null>(null);
  const { authenticateOperation } = useAccountsContext();
  const dispatch = useAppDispatch();
  const loginData = useAppSelector((s) => s.loginReducer.value);

  const handleCancel = async (order: OpenOrder) => {
    if (!session?.user?.name) return;
    setCancelling(order.orderid);
    try {
      const { key, useKeychain } = await authenticateOperation("active");

      await steemApi.cancelLimitOrder(
        session.user.name,
        order.orderid,
        key,
        useKeychain,
      );
      toast.success("Order cancelled");
      const isBuying = order.sell_price.base.includes("SBD");
      dispatch(
        addLoginHandler({
          ...loginData,
          [isBuying ? "balance_sbd" : "balance_steem"]:
            loginData[isBuying ? "balance_sbd" : "balance_steem"] +
            (isBuying
              ? parseFloat(getOrderAmount(order).sbd_amount)
              : parseFloat(getOrderAmount(order).steem_amount)),
        }),
      );
      onUpdate();
    } catch (e: any) {
      toast.error(e.message || "Failed to cancel order");
    } finally {
      setCancelling(null);
    }
  };

  if (!orders)
    return (
      <div className="p-12 flex justify-center">
        <Spinner />
      </div>
    );
  if (orders.length === 0)
    return (
      <div className="p-12 text-center text-muted text-sm">No open orders</div>
    );

  const orderColumns: ColumnDef<OpenOrder>[] = [
    {
      key: "orderid",
      header: "Type",
      className: "w-[160px]",
      render: (_info, order) => {
        const isBuying = order.sell_price.base.includes("SBD");
        return (
          <div className="flex flex-wrap items-center gap-2">
            <Chip
              variant="flat"
              radius="sm"
              size="sm"
              color={isBuying ? "success" : "danger"}
            >
              {isBuying ? "Buy" : "Sell"}
            </Chip>
            <p className="text-xs text-muted">
              {moment.unix(order.created).format("DD MMM HH:mm")}
            </p>
          </div>
        );
      },
    },
    {
      key: "real_price",
      header: "Price",
      render: (_info, order) => {
        return getOrderPrice(order);
      },
    },
    {
      key: "for_sale",
      header: "STEEM",
      render: (_info, order) => {
        return getOrderAmount(order).steem_amount;
      },
    },
    {
      key: "sell_price",
      header: "SBD",
      render: (_info, order) => {
        return getOrderAmount(order).sbd_amount;
      },
    },
    {
      key: "actions",
      header: "Action",
      render: (_value, order) => (
        <Button
          isIconOnly
          variant="light"
          color="danger"
          size="sm"
          isLoading={cancelling === order.orderid}
          onPress={() => handleCancel(order)}
        >
          <Trash2 size={16} />
        </Button>
      ),
    },
  ];
  return <DataTable columns={orderColumns} data={orders} />;
};

export default OpenOrdersTable;
