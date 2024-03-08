import { HStack, VStack } from "@react-native-material/core"
import { useQuery } from "@tanstack/react-query";
import React, { } from "react";
import { getSimplePost } from "../../steem/SteemApis";
import { useAppSelector } from "../../constants/AppFunctions";
import { Text } from "react-native-paper";
import { StyleSheet } from "react-native";
import { getTimeFromNow } from "../../utils/time";


interface Props {
    comment: Feed;

}

const RewardBreakdownCard = (props: Props) => {
    const { comment } = props;
    const globalData = useAppSelector(state => state.steemGlobalReducer.value);



    const rewards = () => {

        const payoutItems: any = [];

        if (comment) {
            const SBD_PRINT_RATE_MAX = 100;
            // estimated pending payout breakdowns
            const authorPayout = comment.payout - comment.;
            const curationPayout = comment.curator_payout_value;
            const pendingPayout = comment.payout;

            const totalPayout = comment.total_payout_value;

            const maxPayout = comment.max_accepted_payout;

            const payoutDate = comment.cashout_time

            const payoutLimitHit = totalPayout >= maxPayout;

            // assemble breakdown
            const sbdPrintRate = globalData.sbd_print_rate || 0;
            const percent_steem_dollars = (comment.percent_steem_dollars) / 20000;

            const pending_payout_sbd = pendingPayout * percent_steem_dollars;
            const price_per_steem = globalData.median_price;

            // const pending_payout_sp = (pendingPayout - pending_payout_sbd) / price_per_steem;
            // const pending_payout_printed_sbd = pending_payout_sbd * (sbdPrintRate / SBD_PRINT_RATE_MAX);
            // const pending_payout_printed_hive =
            //     (pending_payout_sbd - pending_payout_printed_sbd) / price_per_steem;


            // estimated pending payout breakdowns
            const _sbd = comment.pending_payout_value * percent_steem_dollars;
            const pending_sp = (comment.pending_payout_value - _sbd) / price_per_steem;
            const pending_sbd = _sbd * (globalData.sbd_print_rate / SBD_PRINT_RATE_MAX);
            const pending_steem = (_sbd - pending_sbd) / price_per_steem;


            const breakdownPayout =
                (`${pending_sbd.toFixed(3)} SBD\n`) +
                (pending_steem > 0 ? `${pending_steem.toFixed(3)} STEEM\n` : '') +
                (pending_sp > 0 ? `${pending_sp.toFixed(3)} SP` : '');

            const beneficiaries: any = [];
            const beneficiary = data?.beneficiaries;
            if (beneficiary) {
                beneficiary.forEach((key: any, index) => {
                    beneficiaries.push(
                        `${index !== 0 ? '\n' : ''}${key?.[0]}: ${(parseFloat(key?.[1]) / 100).toFixed(2)}%`,
                    );
                });
            }
            const minimumAmountForPayout = 0.02;
            let warnZeroPayout = false;
            if (pendingPayout > 0 && pendingPayout < minimumAmountForPayout) {
                warnZeroPayout = true;
            }


            return (
                <VStack >
                    {pendingPayout > 0 &&
                        <HStack items="center">
                            <Text>{!!payoutDate ? 'Pending payout amount:' : `Past Payouts`} </Text>
                            <Text >${pendingPayout.toFixed(3)}</Text>
                        </HStack>
                    }

                    {!payoutDate && authorPayout > 0 &&
                        <Text style={styles.itemIndent}>Author ${authorPayout.toFixed(3)}</Text>
                    }

                    {!payoutDate && curationPayout > 0 &&
                        <Text style={styles.itemIndent}>Curators ${curationPayout.toFixed(3)}</Text>

                    }
                    {payoutLimitHit &&
                        <Text>{maxPayout}</Text>

                    }

                    {!!breakdownPayout &&
                        pendingPayout > 0 && !!payoutDate &&
                        <VStack>
                            <Text>Breakdown:</Text>
                            <Text style={styles.itemIndent}>{breakdownPayout}</Text>

                        </VStack>
                    }

                    {beneficiaries?.length > 0 &&
                        <Text>{beneficiaries}</Text>}

                    {warnZeroPayout &&
                        <Text variant="bodySmall">Amount must reach $0.02 for payout</Text>
                    }

                    {!!payoutDate &&
                        <Text>Payout {getTimeFromNow(payoutDate * 1000)}</Text>}



                </VStack>
            );


        }

    }

    return <VStack>
        {isLoading ? <Text>Loading...</Text>
            : error ? <Text>Failed</Text> :
                rewards()}


    </VStack>


}

export default PostRewards;


const styles = StyleSheet.create({
    itemIndent: {
        marginLeft: 6,
        fontSize: 12
    }

})