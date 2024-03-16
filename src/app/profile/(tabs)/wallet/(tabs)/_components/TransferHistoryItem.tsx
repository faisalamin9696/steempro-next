import SAvatar from '@/components/SAvatar';
import TimeAgoWrapper from '@/components/wrapper/TimeAgoWrapper';
import { useAppSelector } from '@/libs/constants/AppFunctions';
import { vestToSteem } from '@/libs/steem/sds';
import { Accordion, Card, CardBody } from '@nextui-org/react';
import React, { useContext } from 'react';

interface Props {
    op: AccountHistory,
    context: any,
    socialUrl?: any,
}


function TransferFromTo({ title, from, to }: { title: string, from?: string, to?: string }) {
    return <div className='flex flex-row items-center gap-2'>
        <p>{title}</p>
        {from && <div className=' flex items-center gap-2'>
            <SAvatar size='xs' username={from} />
            <p>{from}</p>
        </div>}
        {(to) && <p>to</p>}

        {to && <div className='flex items-center gap-2'>
            <SAvatar size='xs' username={to} />
            <p>{to}</p>
        </div>}
    </div>
}
const TransferHistoryItem = (props: Props): JSX.Element => {
    let {
        op,
        context,
        socialUrl,
    } = props;

    const steemGlobals = useAppSelector(state => state.steemGlobalsReducer.value);
    // context -> account perspective

    const type = op.op[0];
    const data = op.op[1];

    const powerdown_vests =
        type === 'withdraw_vesting'
            ? vestToSteem(data.vesting_shares, steemGlobals.steem_per_share)?.toLocaleString('en-US')
            : undefined;

    const reward_vests =
        type === 'claim_reward_balance'
            ?
            vestToSteem(data.reward_vests, steemGlobals.steem_per_share)?.toLocaleString('en-US')
            : undefined;
    const curation_reward =
        type === 'curation_reward'
            ? vestToSteem(data.reward, steemGlobals.steem_per_share)?.toLocaleString('en-US')
            : undefined;
    const author_reward =
        type === 'author_reward'
            ? vestToSteem(data.vesting_payout, steemGlobals.steem_per_share)?.toLocaleString('en-US')
            : undefined;
    const benefactor_reward =
        type === 'comment_benefactor_reward'
            ? vestToSteem(data.reward, steemGlobals.steem_per_share)?.toLocaleString('en-US')
            : undefined;

    /* All transfers involve up to 2 accounts, context and 1 other. */
    let message;

    const postLink = (socialUrl, author, permlink) => (
        <a href={`${socialUrl}/@${author}/${permlink}`} target="_blank">
            {author}/{permlink}
        </a>
    );

    if (type === 'transfer_to_vesting') {
        const amount = data.amount.split(' ')[0];

        if (data.from === context) {
            if (data.to === '') {
                message = <TransferFromTo title={`Transfer ${amount} to STEEM POWER`}

                />
                // tt('g.transfer') + amount + tt('g.to') + 'STEEM POWER';
            } else {
                message = <TransferFromTo title={`Transfer ${amount} STEEM POWER`}
                    to={data.to}
                />
                // tt('g.transfer') + amount + ' STEEM POWER' + tt('g.to');
            }
        } else if (data.to === context) {
            message = <TransferFromTo title={`Receive ${amount} STEEM POWER from`}
                from={data.from}
            />

            // tt('g.receive') + amount + ' STEEM POWER' + tt('g.from');
        } else {
            message = <TransferFromTo title={`Transfer ${amount} STEEM POWER from`}
                from={data.from} to={data.to}
            />

        }
    } else if (
        /^transfer$|^transfer_to_savings$|^transfer_from_savings$/.test(
            type
        )
    ) {
        // transfer_to_savings
        const fromWhere =
            type === 'transfer_to_savings'
                ? <TransferFromTo title={`Transfer to savings ${data.amount}`}
                    to={data.to}
                /> : type === 'transfer_from_savings'
                    ? <TransferFromTo title={`Transfer from savings ${data.amount}`}
                        to={data.to}
                    />
                    : <TransferFromTo title={`Transfer ${data.amount}`}
                        to={data.to}
                    />;

        if (data.from === context) {
            // Semi-bad behavior - passing `type` to translation engine -- @todo better somehow?
            // type can be to_savings, from_savings, or not_savings
            // Also we can't pass React elements (link to other account) so its order is fixed :()
            message = fromWhere;
            // message = (
            //     <span>

            //         {data.request_id &&
            //             tt('transferhistoryrow_jsx.request_id', {
            //                 request_id: data.request_id,
            //             })}
            //     </span>
            // );
            // tt('g.transfer') + `${fromWhere} ${data.amount}` + tt('g.to');
        } else if (data.to === context) {
            const fromWhere =
                type === 'transfer_to_savings'
                    ? <TransferFromTo title={`Receive from savings ${data.amount} from`}
                        from={data.from}
                    />

                    : type === 'transfer_from_savings'
                        ? <TransferFromTo title={`Transfer from savings ${data.amount} from`}
                            from={data.from}
                        />
                        : <TransferFromTo title={`Received ${data.amount} from`}
                            from={data.from}
                        />;
            message = fromWhere;


        } else {
            // Removing the `from` link from this one -- only one user is linked anyways.
            const fromWhere =
                type === 'transfer_to_savings'
                    ? <TransferFromTo title={`Transfer to savings ${data.amount} from`}
                        from={data.from} to={data.to}
                    />

                    : type === 'transfer_from_savings'
                        ? <TransferFromTo title={`Transfer from savings ${data.amount} from`}
                            from={data.from} to={data.to}
                        />
                        : <TransferFromTo title={`Transfer ${data.amount} from`}
                            from={data.from} to={data.to}
                        />;

            message = fromWhere;


        }
    } else if (type === 'cancel_transfer_from_savings') {
        message = `Cancel transfer from savings Request ID: ${data.request_id}`
        // `${tt('transferhistoryrow_jsx.cancel_transfer_from_savings')} (${tt('g.request')} ${data.request_id})`;
    } else if (type === 'withdraw_vesting') {
        if (data.vesting_shares === '0.000000 VESTS')
            message = `Stop power down`
        else
            message = `Start power down of ${powerdown_vests} STEEM`

        // tt('transferhistoryrow_jsx.start_power_down_of') + ' ' + powerdown_vests + ' STEEM';
    } else if (type === 'curation_reward') {
        message = `${curation_reward} STEEM POWER for ${postLink(
            socialUrl,
            data.comment_author,
            data.comment_permlink
        )}`

        // `${curation_reward} TEEM POWER` + tt('g.for');
    } else if (type === 'author_reward') {
        let steem_payout = '';
        if (data.steem_payout !== '0.000 STEEM')
            steem_payout = ', ' + data.steem_payout;
        message = `${author_reward} ${steem_payout} and ${data.sbd_payout} STEEM POWER for ${postLink(socialUrl, data.author, data.permlink)}`

        // `${data.sbd_payout}${steem_payout}, ${tt( 'g.and' )} ${author_reward} STEEM POWER ${tt('g.for')}`;
    } else if (type === 'claim_reward_balance') {
        const rewards: any[] = [];
        if (parseFloat(data.reward_steem.split(' ')[0]) > 0)
            rewards.push(data.reward_steem);
        if (parseFloat(data.reward_sbd.split(' ')[0]) > 0)
            rewards.push(data.reward_sbd);
        if (parseFloat(data.reward_vests.split(' ')[0]) > 0)
            rewards.push(`${reward_vests} STEEM POWER`);

        switch (rewards.length) {
            case 3:
                message = `Claim rewards: ${rewards[0]}, ${rewards[1]} and ${rewards[2]}`
                break;
            case 2:
                message = `Claim rewards: ${rewards[0]} and ${rewards[1]}`
                break;
            case 1:
                message = `Claim rewards:${rewards[0]}`
                break;
        }
    } else if (type === 'interest') {
        message = `Receive interest of ${data.interest}`
    } else if (type === 'fill_convert_request') {
        message = `Fill convert request: ${data.amount_in} for ${data.amount_out}`
    } else if (type === 'fill_order') {
        if (data.open_owner == context) {
            // my order was filled by data.current_owner
            message = `Paid ${data.open_pays} for ${data.current_pays}`
        } else {
            // data.open_owner filled my order
            message = `Paid ${data.open_pays} for ${data.current_pays}`

            // `Paid ${data.current_pays} for ${ data.open_pays }`;
        }
    } else if (type === 'comment_benefactor_reward') {
        message = `${benefactor_reward} STEEM POWER for ${data.author}/${data.permlink}`

    } else {
        message = JSON.stringify({ type, ...data }, null, 2);
    }

    return (<div className='flex flex-col gap-3 p-2'>
        <div className='text-sm'>{message}</div>

    </div>

    );
}

export { TransferHistoryItem }