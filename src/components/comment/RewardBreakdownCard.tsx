import React, { Component, Fragment, useState } from "react";
import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import { getTimeFromNow } from "@/libs/utils/time";
import useSWR from "swr";
import LoadingCard from "../LoadingCard";
import clsx from "clsx";
import './style.scss';

interface Props {
    comment: Feed | Post;
}


interface DetailProps {
    data: Post;
    globalData: SteemProps;
}
export class EntryPayoutDetail extends Component<DetailProps> {
    render() {
        const { data, globalData } = this.props;


        const payoutDate = getTimeFromNow(data.cashout_time * 1000);

        const beneficiary = data.beneficiaries;
        const pendingPayout = data.pending_payout_value;
        const promotedPayout = data.promoted;
        const authorPayout = data.pending_payout_value === 0 ? data.payout - data.curator_payout_value : 0;
        const curatorPayout = data.curator_payout_value;
        const maxPayout = data.max_accepted_payout;
        const fullPower = data.percent_steem_dollars === 0;

        const totalPayout = pendingPayout + authorPayout + curatorPayout;
        const payoutLimitHit = totalPayout >= maxPayout;

        const SBD_PRINT_RATE_MAX = 100;
        const percentSteemDollars = data.percent_steem_dollars / 20000;
        const pendingPayoutSbd = pendingPayout * percentSteemDollars;
        const pricePerSteem = globalData.median_price;
        const pendingPayoutHp = (pendingPayout - pendingPayoutSbd) / pricePerSteem;
        const pendingPayoutPrintedSbd = pendingPayoutSbd * (globalData.sbd_print_rate / SBD_PRINT_RATE_MAX);

        const pendingPayoutPrintedSteem = (pendingPayoutSbd - pendingPayoutPrintedSbd) / pricePerSteem;

        let breakdownPayout: string[] = [];
        if (pendingPayout > 0) {
            if (pendingPayoutPrintedSbd > 0) {
                breakdownPayout.push(`${pendingPayoutPrintedSbd?.toFixed(3)} SBD`);

                // breakdownPayout.push(
                //     formattedNumber(pendingPayoutPrintedSbd, { fractionDigits: 3, suffix: "SBD" })
                // );
            }

            if (pendingPayoutPrintedSteem > 0) {
                breakdownPayout.push(`${pendingPayoutPrintedSteem?.toFixed(3)} STEEM`);


            }

            if (pendingPayoutHp > 0) {
                breakdownPayout.push(`${pendingPayoutHp?.toFixed(3)} SP`);
            }
        }

        return (
            <div className="payout-popover-content">
                {fullPower && (
                    <p>
                        <span className="label">{("Reward")}</span>
                        <span className="value">{("Power Up 100%")}</span>
                    </p>
                )}
                {pendingPayout > 0 && (
                    <p>
                        <span className="label">{("Pending Payout")}</span>
                        <span className="value">
                            $ {pendingPayout?.toFixed(3)}
                            {/* <FormattedCurrency {...this.props} value={pendingPayout} fixAt={3} /> */}
                        </span>
                    </p>
                )}
                {promotedPayout > 0 && (
                    <p>
                        <span className="label">{("Promoted")}</span>
                        <span className="value">
                            {promotedPayout?.toFixed(3)}
                            {/* <FormattedCurrency {...this.props} value={promotedPayout} fixAt={3} /> */}
                        </span>
                    </p>
                )}
                {authorPayout > 0 && (
                    <p>
                        <span className="label">{("Author Payout")}</span>
                        <span className="value">
                            $ {authorPayout?.toFixed(3)}
                            {/* <FormattedCurrency {...this.props} value={authorPayout} fixAt={3} /> */}
                        </span>
                    </p>
                )}
                {curatorPayout > 0 && (
                    <p>
                        <span className="label">{'Curators Payout'}</span>
                        <span className="value">
                            $ {curatorPayout?.toFixed(3)}
                            {/* <FormattedCurrency {...this.props} value={curatorPayout} fixAt={3} /> */}
                        </span>
                    </p>
                )}
                {beneficiary.length > 0 && (
                    <p>
                        <span className="label">{'Beneficiary'}</span>
                        <span className="value">
                            {beneficiary.map((x: any, i) => (
                                <Fragment key={i}>
                                    {x[0]}: {(x[1] / 100).toFixed(0)}% <br />
                                </Fragment>
                            ))}
                        </span>
                    </p>
                )}
                {breakdownPayout.length > 0 && (
                    <p>
                        <span className="label">{'Breakdown'}</span>
                        <span className="value">
                            {breakdownPayout.map((x, i) => (
                                <Fragment key={i}>
                                    {x} <br />
                                </Fragment>
                            ))}
                        </span>
                    </p>
                )}
                <p>
                    <span className="label">{("Payout")}</span>
                    <span className="value">{payoutDate}</span>
                </p>

                {payoutLimitHit && (
                    <p>
                        <span className="label">{("Max accepted")}</span>
                        <span className="value">
                            {maxPayout?.toFixed(3)}
                            {/* <FormattedCurrency {...this.props} value={maxPayout} fixAt={3} /> */}
                        </span>
                    </p>
                )}
            </div>
        );
    }
}

export const RewardBreakdownCard = (props: Props) => {
    const [showPopover, setShowPopover] = useState(false);

    const { comment } = props;

    const globalData = useAppSelector(state => state.steemGlobalsReducer.value);
    const URL = `/posts_api/getPost/${comment.author}/${comment.permlink}/${false}`;

    const { data, isLoading } = useSWR(URL, fetchSds<Post>);

    if (isLoading) {
        return <LoadingCard />
    }
    if (!data) {
        return <>
        </>
    }

    const check = data.max_accepted_payout;

    let isPayoutDeclined,
        pendingPayout,
        authorPayout,
        curatorPayout,
        maxPayout,
        totalPayout,
        payoutLimitHit,
        shownPayout;

    if (check) {
        isPayoutDeclined = data.max_accepted_payout === 0;

        pendingPayout = data.pending_payout_value;
        authorPayout = data.payout - data.curator_payout_value;
        curatorPayout = data.curator_payout_value;
        maxPayout = comment.max_accepted_payout;
        totalPayout = pendingPayout + authorPayout + curatorPayout;
        payoutLimitHit = totalPayout >= maxPayout;
        shownPayout = payoutLimitHit && maxPayout > 0 ? maxPayout : totalPayout;
    }



    return (
        <div>
            <EntryPayoutDetail data={data} globalData={globalData} />
        </div>
    )
};

