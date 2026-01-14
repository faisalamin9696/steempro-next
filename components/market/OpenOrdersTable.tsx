import { steemApi } from "@/libs/steem";
import { Spinner, Chip, Button } from "@heroui/react";
import { Trash2 } from "lucide-react";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAccountsContext } from "../auth/AccountsContext";
import { ColumnDef, DataTable } from "../ui/data-table";

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

  const handleCancel = async (orderId: number) => {
    if (!session?.user?.name) return;
    setCancelling(orderId);
    try {
      const { key, useKeychain } = await authenticateOperation("active");

      await steemApi.cancelLimitOrder(
        session.user.name,
        orderId,
        key,
        useKeychain
      );
      toast.success("Order cancelled");
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
        const isBuying = order.sell_price.base.includes("SBD");
        const steem_amount = isBuying
          ? order.sell_price.quote.split(" ")[0]
          : order.sell_price.base.split(" ")[0];
        const sbd_amount = isBuying
          ? order.sell_price.base.split(" ")[0]
          : order.sell_price.quote.split(" ")[0];
        const price = parseFloat(sbd_amount) / parseFloat(steem_amount);
        return price.toFixed(6);
      },
    },
    {
      key: "for_sale",
      header: "STEEM",
      render: (_info, order) => {
        const isBuying = order.sell_price.base.includes("SBD");
        const steem_amount = isBuying
          ? order.sell_price.quote.split(" ")[0]
          : order.sell_price.base.split(" ")[0];
        const sbd_amount = isBuying
          ? order.sell_price.base.split(" ")[0]
          : order.sell_price.quote.split(" ")[0];
        return steem_amount;
      },
    },
    {
      key: "for_sale",
      header: "SBD",
      render: (_info, order) => {
        const isBuying = order.sell_price.base.includes("SBD");

        const sbd_amount = isBuying
          ? order.sell_price.base.split(" ")[0]
          : order.sell_price.quote.split(" ")[0];
        return sbd_amount;
      },
    },
    {
      key: "for_sale",
      header: "Action",
      render: (_value, order) => (
        <Button
          isIconOnly
          variant="light"
          color="danger"
          size="sm"
          isLoading={cancelling === order.orderid}
          onPress={() => handleCancel(order.orderid)}
        >
          <Trash2 size={16} />
        </Button>
      ),
    },
  ];
  return <DataTable columns={orderColumns} data={orders} />;
};

export default OpenOrdersTable;
