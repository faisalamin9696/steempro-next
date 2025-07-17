import React, { Component } from "react";
import { fetchSds, useAppSelector } from "@/constants/AppFunctions";
import { getTimeFromNow } from "@/utils/helper/time";
import useSWR from "swr";
import LoadingCard from "./LoadingCard";
import "./style.scss";
import SLink from "./ui/SLink";

interface Props {
  comment: Feed | Post;
}

interface DetailProps {
  data: Post;
  globalData: SteemProps;
}

export const RewardBreakdownCard = (props: Props) => {
  const { comment } = props;

  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const URL = `/posts_api/getPost/${comment.author}/${
    comment.permlink
  }/${false}`;

  const { data, isLoading, error } = useSWR(
    comment.max_accepted_payout !== 0 && URL,
    fetchSds<Post>
  );

  if (comment.max_accepted_payout === 0) {
    return (
      <p>
        <span className="value">{"Payout Declined"}</span>
      </p>
    );
  }
  if (isLoading) {
    return <LoadingCard />;
  }
  if (!data || error) {
    return <></>;
  }

  return <PayoutDetail data={data} globalData={globalData} />;
};

class PayoutDetail extends Component<DetailProps> {
  render() {
    const { data, globalData } = this.props;

    const payoutDate = getTimeFromNow(data.cashout_time * 1000);

    const beneficiary = data.beneficiaries;
    const pendingPayout = data.pending_payout_value;
    const promotedPayout = data.promoted;
    const authorPayout =
      data.pending_payout_value === 0
        ? data.payout - data.curator_payout_value
        : 0;
    const curatorPayout = data.curator_payout_value;
    const maxPayout = data.max_accepted_payout;
    const fullPower = data.percent_steem_dollars === 0;
    const isDeclined = maxPayout === 0;

    const totalPayout = pendingPayout + authorPayout + curatorPayout;
    const payoutLimitHit = totalPayout >= maxPayout;

    const SBD_PRINT_RATE_MAX = 100;
    const percentSteemDollars = data.percent_steem_dollars / 20000;
    const pendingPayoutSbd = pendingPayout * percentSteemDollars;
    const pricePerSteem = globalData.median_price;
    const pendingPayoutHp = (pendingPayout - pendingPayoutSbd) / pricePerSteem;
    const pendingPayoutPrintedSbd =
      pendingPayoutSbd * (globalData.sbd_print_rate / SBD_PRINT_RATE_MAX);

    const pendingPayoutPrintedSteem =
      (pendingPayoutSbd - pendingPayoutPrintedSbd) / pricePerSteem;

    let breakdownPayout: string[] = [];
    if (pendingPayout > 0) {
      if (pendingPayoutPrintedSbd > 0) {
        breakdownPayout.push(`${pendingPayoutPrintedSbd?.toFixed(3)} SBD`);
      }

      if (pendingPayoutPrintedSteem > 0) {
        breakdownPayout.push(`${pendingPayoutPrintedSteem?.toFixed(3)} STEEM`);
      }

      if (pendingPayoutHp > 0) {
        breakdownPayout.push(`${pendingPayoutHp?.toFixed(3)} SP`);
      }
    }

    if (isDeclined) {
      return (
        <div>
          <span className="value">{"Payout Declined"}</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 w-full text-sm text-white">
        {/* Power Up Indicator */}
        {fullPower && (
          <div className="flex justify-between">
            <span className="font-medium text-white">Reward</span>
            <span className="text-green-300 font-semibold">Power Up 100%</span>
          </div>
        )}

        {/* Main Payouts */}
        {pendingPayout > 0 && (
          <div className="flex justify-between">
            <span className="font-medium text-white">Pending Payout</span>
            <span className="font-semibold">${pendingPayout.toFixed(3)}</span>
          </div>
        )}
        {promotedPayout > 0 && (
          <div className="flex justify-between">
            <span className="font-medium text-white">Promoted</span>
            <span className="font-semibold">${promotedPayout.toFixed(3)}</span>
          </div>
        )}
        {authorPayout > 0 && (
          <div className="flex justify-between">
            <span className="font-medium text-white">Author Payout</span>
            <span className="font-semibold">${authorPayout.toFixed(3)}</span>
          </div>
        )}
        {curatorPayout > 0 && (
          <div className="flex justify-between">
            <span className="font-medium text-white">
              Curators Payout
            </span>
            <span className="font-semibold">${curatorPayout.toFixed(3)}</span>
          </div>
        )}

        {/* Beneficiaries Section */}
        {beneficiary.length > 0 && (
          <div className="bg-background p-3 rounded-lg text-default-900">
            <p className="text-sm font-semibold mb-2">
              Beneficiaries
            </p>
            <div className="flex flex-col gap-1 text-default-900">
              {beneficiary.map((x: any, i: number) => (
                <div key={i} className="flex justify-between items-center">
                  <SLink
                    className="text-blue-600 hover:underline"
                    href={`/@${x[0]}`}
                  >
                    @{x[0]}
                  </SLink>
                  <span className="text-default-900 font-medium">
                    {(x[1] / 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Breakdown Section */}
        {breakdownPayout.length > 0 && (
          <div className="bg-background p-3 rounded-lg text-default-900">
            <p className=" text-sm font-semibold mb-2">
              Breakdown
            </p>
            <div className="space-y-1 text-default-900">
              {breakdownPayout.map((x, i) => (
                <div key={i}>{x}</div>
              ))}
            </div>
          </div>
        )}

        {/* Payout Info */}
        {payoutDate && (
          <div className="flex justify-between">
            <span className="font-medium text-white">Payout Date</span>
            <span
              className="font-semibold"
              title={new Date(data.cashout_time * 1000).toLocaleString()}
            >
              {payoutDate}
            </span>
          </div>
        )}
        {!payoutDate && !authorPayout && !curatorPayout && (
          <div className="flex justify-between">
            <span className="font-medium text-white">Payout</span>
            <span className="text-white font-semibold">
              Reward Distributed
            </span>
          </div>
        )}

        {/* Max Payout Info */}
        {payoutLimitHit && (
          <div className="flex justify-between">
            <span className="font-medium text-white">Max Accepted</span>
            <span className="font-semibold">${maxPayout.toFixed(3)}</span>
          </div>
        )}
      </div>
    );
  }
}
