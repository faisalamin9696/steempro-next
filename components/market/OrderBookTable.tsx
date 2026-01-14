import { Spinner } from "@heroui/spinner";

const OrderBookTable = ({
  book,
  onPriceClick,
}: {
  book: OrderBook | undefined;
  onPriceClick: (price: number) => void;
}) => {
  if (!book)
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-hidden">
      {/* ASKS (Sells) - Red */}
      <div className="flex flex-col gap-2 h-full">
        <div className="flex justify-between px-2 text-tiny font-bold uppercase text-default-500">
          <span>Price (SBD)</span>
          <span>STEEM</span>
          <span>SBD</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {book.asks.slice(0, 30).map((ask, i) => (
            <div
              key={i}
              onClick={() => onPriceClick(ask.real_price)}
              className="group relative flex justify-between px-2 py-1 text-xs hover:bg-danger/10 transition-colors cursor-pointer rounded-lg overflow-hidden"
            >
              {/* Visualizing depth with an absolute bg bar */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-danger/5 transition-all"
                style={{ width: `${Math.min((ask.sbd / 1000) * 100, 100)}%` }}
              />
              <span className="text-danger font-medium z-10">
                {ask.real_price.toFixed(6)}
              </span>
              <span className="text-default-700 z-10">
                {ask.steem.toFixed(3)}
              </span>
              <span className="text-muted z-10">{ask.sbd.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BIDS (Buys) - Green */}
      <div className="flex flex-col gap-2 h-full">
        <div className="flex justify-between px-2 text-tiny font-bold uppercase text-default-500">
          <span>Price (SBD)</span>
          <span>STEEM</span>
          <span>SBD</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {book.bids.slice(0, 30).map((bid, i) => (
            <div
              key={i}
              onClick={() => onPriceClick(bid.real_price)}
              className="group relative flex justify-between px-2 py-1 text-xs hover:bg-success/10 transition-colors cursor-pointer rounded-lg overflow-hidden"
            >
              <div
                className="absolute right-0 top-0 bottom-0 bg-success/5 transition-all"
                style={{ width: `${Math.min((bid.sbd / 1000) * 100, 100)}%` }}
              />
              <span className="text-success font-medium z-10">
                {bid.real_price.toFixed(6)}
              </span>
              <span className="text-default-700 z-10">
                {bid.steem.toFixed(3)}
              </span>
              <span className="text-muted z-10">{bid.sbd.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBookTable;
