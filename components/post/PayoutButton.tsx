import { useCommentFooterData } from "@/hooks/useCommentFooterData";
import { Button, ButtonProps } from "@heroui/button";
import SPopover from "../ui/SPopover";
import { twMerge } from "tailwind-merge";
import moment from "moment";
import SUsername from "../ui/SUsername";
import { Constants } from "@/constants";
import useSWR from "swr";
import { sdsApi } from "@/libs/sds";
import { Spinner } from "@heroui/react";
import { useState } from "react";

const ICON_SIZE = 20;

interface Props extends ButtonProps {
  comment: Feed | Post;
  labelClass?: string;
}

function PayoutButton(props: Props) {
  const { comment, labelClass } = props;
  const { PayoutIcon, isDeclined: footerIsDeclined } =
    useCommentFooterData(comment);
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: postData,
    isLoading,
    error,
  } = useSWR<Post>(
    !isOpen
      ? null
      : comment.max_accepted_payout !== 0
      ? `/posts_api/getPost/${comment.author}/${comment.permlink}`
      : null,
    () => sdsApi.getPost(comment.author, comment.permlink)
  );

  const isDeclined = comment.max_accepted_payout === 0;

  return (
    <SPopover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Payout Details"
      description={
        isDeclined
          ? "Author declined rewards"
          : postData?.cashout_time
          ? "Pending rewards breakdown"
          : "Settled rewards breakdown"
      }
      trigger={
        <Button {...props} onPress={() => setIsOpen(!isOpen)}>
          <div className={labelClass}>
            <PayoutIcon size={ICON_SIZE} />
            <span className={isDeclined ? "line-through opacity-70" : ""}>
              {comment.payout?.toFixed(2)}
            </span>
          </div>
        </Button>
      }
    >
      <div className="flex flex-col gap-4 p-1 min-w-[220px]">
        {isDeclined ? (
          <div className="text-center py-4 px-2 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
              <PayoutIcon size={24} className="text-danger" />
            </div>
            <div className="text-danger font-bold text-sm">Payout Declined</div>
            <p className="text-xs text-muted leading-relaxed">
              The author of this post has chosen to decline all rewards.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center p-4">
            <Spinner size="sm" />
          </div>
        ) : !postData || error ? (
          <div className="text-xs text-danger p-2 italic text-center">
            Failed to load payout details
          </div>
        ) : (
          <PayoutDetailContent data={postData} />
        )}
      </div>
    </SPopover>
  );
}

function PayoutDetailContent({ data }: { data: Post }) {
  const isPending = data.cashout_time > 0;

  // Snippet Calculations
  const beneficiary = data.beneficiaries;
  const pendingPayout = data.pending_payout_value;
  const authorPayout =
    data.pending_payout_value === 0
      ? data.payout - data.curator_payout_value
      : 0;
  const curatorPayout = data.curator_payout_value;
  const totalPayout = pendingPayout + authorPayout + curatorPayout;

  const SBD_PRINT_RATE_MAX = 10000; // Using 10000 to match SDS GlobalProps
  const percentSteemDollarsFraction = data.percent_steem_dollars / 20000;

  const pendingPayoutSbdPotential = pendingPayout * percentSteemDollarsFraction;
  const pricePerSteem = Constants.globalProps.median_price || 1; // Fallback to 1 to avoid division by zero

  const pendingPayoutSp =
    (pendingPayout - pendingPayoutSbdPotential) / pricePerSteem;

  const sbdPrintRateFraction =
    Constants.globalProps.sbd_print_rate / SBD_PRINT_RATE_MAX;
  const pendingPayoutPrintedSbd =
    pendingPayoutSbdPotential * sbdPrintRateFraction;

  const pendingPayoutPrintedSteem =
    (pendingPayoutSbdPotential - pendingPayoutPrintedSbd) / pricePerSteem;

  const beneficiariesList = (data.beneficiaries ?? []).map(
    ([account, weight]) => ({ account, weight })
  );

  return (
    <>
      {/* status and time */}
      <div className="flex flex-col gap-1 pb-2 border-b border-divider">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted font-medium">Status</span>
          <span
            className={twMerge(
              "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold",
              isPending
                ? "bg-primary/10 text-primary"
                : "bg-success/10 text-success"
            )}
          >
            {isPending ? "Pending" : "Paid"}
          </span>
        </div>
        {isPending && data.cashout_time && (
          <div className="flex justify-between items-center text-[11px] text-muted italic">
            <span>Next cashout</span>
            <span title={moment.unix(data.cashout_time).toLocaleString()}>
              {moment.unix(data.cashout_time).fromNow()}
            </span>
          </div>
        )}
      </div>

      {/* Breakdown */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center text-sm font-bold border-b border-divider/50 pb-1.5">
          <span>Total Payout</span>
          <span className="text-primary">${totalPayout.toFixed(3)}</span>
        </div>

        <div className="space-y-2">
          {isPending ? (
            <>
              {pendingPayoutPrintedSbd > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Expected SBD</span>
                  <span className="font-semibold">
                    {pendingPayoutPrintedSbd.toFixed(3)} SBD
                  </span>
                </div>
              )}
              {pendingPayoutPrintedSteem > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Expected STEEM</span>
                  <span className="font-semibold">
                    {pendingPayoutPrintedSteem.toFixed(3)} STEEM
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Expected SP</span>
                <span className="font-semibold">
                  {pendingPayoutSp.toFixed(3)} SP
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Author Total</span>
                <span className="font-semibold">
                  ${authorPayout.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Curators Total</span>
                <span className="font-semibold">
                  ${curatorPayout.toFixed(3)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Beneficiaries */}
      {beneficiariesList.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-divider">
          <span className="text-[10px] font-bold text-default-500 uppercase tracking-widest pl-1">
            Beneficiaries
          </span>
          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
            {beneficiariesList.map((bene) => (
              <div
                key={bene.account}
                className="flex justify-between items-center p-1.5 hover:bg-default-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  {/* <SAvatar username={bene.account} size="xs" /> */}
                  <SUsername
                    className="text-xs font-medium"
                    username={`@${bene.account}`}
                  />
                </div>
                <span className="text-[11px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                  {(bene.weight / 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default PayoutButton;
