import { Card, CardBody, CardHeader } from "@heroui/card";
import React, { memo, useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import { Button } from "@heroui/button";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelMarketOrder, client } from "@/libs/steem/condenser";
import { useLogin } from "../auth/AuthProvider";
import { getCredentials, getSessionKey } from "@/utils/user";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { AsyncUtils } from "@/utils/async.utils";
import { saveOpenOrdersReducer } from "@/hooks/redux/reducers/OpenOrderReducer";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";

interface OpenOrder {
  id: number;
  created: string;
  expiration: string;
  seller: string;
  orderid: number;
  order_type: "buy" | "sell";
  steem_amount: number;
  sbd_amount: number;
  price: number;
  description: string;
  raw_price: {
    base: string;
    quote: string;
  };
}

function OpenOrders() {
  const { data: session } = useSession();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { userOrders, isLoading, refetch, error } = getOpenOrders(
    session?.user?.name
  );
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (userOrders) {
      dispatch(saveOpenOrdersReducer(userOrders));
    }
  }, [userOrders]);

  // Memoize the paginated orders
  const paginatedData = useMemo(() => {
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const openOrders = userOrders?.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(userOrders.length / ordersPerPage);

    return {
      openOrders: openOrders,
      totalPages,
    };
  }, [userOrders, currentPage, ordersPerPage]);

  const handleNextPage = () => {
    if (currentPage < paginatedData.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-default-700 flex flex-row text-lg sm:text-xl items-center gap-2">
          Open Orders
        </CardBody>
        <CardBody className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground text-sm">Loading orders...</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody className="text-default-700 flex flex-row text-lg sm:text-xl items-center gap-2">
          Open Orders
        </CardBody>
        <CardBody className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg">⚠️</span>
              </div>
              <p className="text-destructive text-sm font-medium">
                Failed to load orders
              </p>
              <p className="text-muted-foreground text-xs mt-1">{error}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!paginatedData.openOrders || paginatedData.openOrders.length === 0) {
    return (
      <Card>
        <CardBody className="text-default-700 flex flex-row text-lg sm:text-xl items-center gap-2">
          Open Orders
        </CardBody>
        <CardBody className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg">📊</span>
              </div>
              <p className="text-muted-foreground text-sm">No open orders</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardBody className="text-default-700 flex flex-row text-lg sm:text-xl items-center gap-2">
          Open Orders
        </CardBody>
      </CardHeader>
      <CardBody className="p-0">
        <Table className="mb-4">
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="text-xs p-2">Time</TableHead>
              <TableHead className="text-xs p-2">Type</TableHead>
              <TableHead className="text-xs p-2">Price</TableHead>
              <TableHead className="text-xs p-2">Amount (STEEM)</TableHead>
              <TableHead className="text-xs p-2">Total (SBD)</TableHead>
              <TableHead className="text-xs p-2">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.openOrders.map((order) => (
              <TableRow key={order.id} className="text-xs hover:bg-muted/20">
                <TableCell className="p-3 font-mono text-muted-foreground">
                  {order.created}
                </TableCell>
                <TableCell className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      order.order_type === "buy"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {order.order_type.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell
                  className={`p-2 font-mono ${
                    order.order_type === "buy"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {order.price.toFixed(6)}
                </TableCell>
                <TableCell className="p-2 font-mono">
                  {order.steem_amount.toLocaleString()}
                </TableCell>
                <TableCell className="p-2 font-mono">
                  {order.sbd_amount.toFixed(3)}
                </TableCell>

                <TableCell className="p-2 font-mono">
                  <OpenOrderAction
                    order={order}
                    onSuccess={(variables) => {
                      if (variables.order.order_type === "buy") {
                        const newSbd = Math.max(
                          0,
                          loginInfo?.balance_sbd + variables.order.sbd_amount
                        );
                        dispatch(
                          saveLoginHandler({
                            ...loginInfo,
                            balance_sbd: newSbd.toFixed(3),
                          })
                        );
                      } else {
                        const newSteem = Math.max(
                          0,
                          loginInfo?.balance_steem +
                            variables.order.steem_amount
                        );
                        dispatch(
                          saveLoginHandler({
                            ...loginInfo,
                            balance_steem: newSteem.toFixed(3),
                          })
                        );
                      }

                      // invalidate recenet orders data
                      queryClient.invalidateQueries({
                        queryKey: ["orderBook"],
                      });
                      refetch();
                      toast.success(`Order canceled successfully`);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {paginatedData.totalPages > 1 && (
          <div className="flex items-center justify-between py-4 px-3">
            <Button
              variant="bordered"
              size="sm"
              onPress={handlePrevPage}
              isDisabled={currentPage === 1}
              className="flex items-center space-x-2"
              startContent={<BiChevronLeft size={18} />}
            >
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {paginatedData.totalPages}
            </div>

            <Button
              variant="bordered"
              size="sm"
              onPress={handleNextPage}
              isDisabled={currentPage === paginatedData.totalPages}
              className="flex items-center space-x-2"
              endContent={<BiChevronRight size={18} />}
            >
              Next
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default OpenOrders;

function getOpenOrders(username?: string | null) {
  const {
    data: userOrders,
    isLoading,
    error,
    refetch,
  } = useQuery<OpenOrder[] | null>({
    queryKey: ["openOrders"],
    enabled: !!username,
    queryFn: async () => {
      if (!username) return null;

      const result = await client.call("condenser_api", "get_open_orders", [
        username,
      ]);

      const open_orders: OpenOrder[] = result.map((order: any) => {
        const baseAmount = parseFloat(order.sell_price.base.split(" ")[0]);
        const quoteAmount = parseFloat(order.sell_price.quote.split(" ")[0]);
        const isBuying = order.sell_price.base.includes("SBD");

        const steem_amount = isBuying ? quoteAmount : baseAmount;
        const sbd_amount = isBuying ? baseAmount : quoteAmount;
        const price = sbd_amount / steem_amount;

        return {
          id: order.id,
          created: order.created,
          expiration: order.expiration,
          seller: order.seller,
          orderid: order.orderid,
          order_type: isBuying ? "buy" : "sell",
          steem_amount,
          sbd_amount,
          price,
          description: `${
            isBuying ? "Buy" : "Sell"
          } ${steem_amount} STEEM @ ${price.toFixed(6)} SBD`,
          raw_price: {
            base: order.sell_price.base,
            quote: order.sell_price.quote,
          },
        };
      });

      return open_orders || [];
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });

  return {
    userOrders: userOrders ?? [],
    isLoading,
    error: error?.message || null,
    refetch,
  };
}

function OpenOrderAction({
  order,
  onSuccess,
}: {
  order: OpenOrder;
  onSuccess: (variables: {
    order: OpenOrder;
    key: string;
    isKeychain?: boolean;
  }) => void;
}) {
  const [confirmation, setConfirmation] = useState(false);
  const { authenticateUser, isAuthorized } = useLogin();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { data: session } = useSession();
  const orderMutation = useMutation({
    mutationFn: (data: {
      order: OpenOrder;
      key: string;
      isKeychain?: boolean;
    }) =>
      Promise.all([
        cancelMarketOrder(
          loginInfo,
          data.order.orderid,
          data.key,
          data.isKeychain
        ),
        AsyncUtils.sleep(4),
      ]),
    onSuccess(data, variables) {
      onSuccess(variables);
    },
    onError(error) {
      toast.error("Trade Error", {
        description: error.message || "Unknown error occurred",
      });
    },
  });

  function cancelLimitOrder(order: OpenOrder) {
    authenticateUser();
    if (!isAuthorized()) return;

    const credentials = getCredentials(getSessionKey(session?.user?.name));

    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }

    orderMutation.mutate({
      order,
      key: credentials.key,
      isKeychain: credentials.keychainLogin,
    });
  }

  return (
    <div>
      <Button
        variant="flat"
        isLoading={orderMutation.isPending}
        radius="sm"
        size="sm"
        onPress={() => setConfirmation(!confirmation)}
      >
        Cancel
      </Button>

      {confirmation && (
        <Modal isOpen={confirmation} onOpenChange={setConfirmation}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {"Confirmation"}
                </ModalHeader>
                <ModalBody>
                  <div className="text-tiny flex">
                    Cancel order #{order.orderid} from {loginInfo.name}?
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => {
                      onClose();
                      cancelLimitOrder(order);
                    }}
                  >
                    Confirm
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
