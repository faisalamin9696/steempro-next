import SAvatar from "@/components/SAvatar";
import MarkdownViewer from "@/components/body/MarkdownViewer";
import { vestToSteem } from "@/libs/helper/vesting";

import React from "react";
import SLink from "./SLink";
import parseAsset from "@/libs/helper/parse-asset";

interface Props {
  op: AccountHistory;
  context: any;
  steem_per_share: number;
}

function TransferFromTo({
  title,
  from,
  to,
}: {
  title: any;
  from?: string;
  to?: string;
}) {
  return (
    <div className="flex flex-row items-center gap-2">
      <div>{title}</div>
      {from && (
        <div className=" flex items-center gap-2">
          <SAvatar size="xs" username={from} />
          <SLink className="hover:text-blue-500" href={`/@${from}`}>
            {from}
          </SLink>
        </div>
      )}
      {to && <p>to</p>}

      {to && (
        <div className="flex items-center gap-2">
          <SAvatar size="xs" username={to} />
          <SLink className="hover:text-blue-500" href={`/@${to}`}>
            {to}
          </SLink>
        </div>
      )}
    </div>
  );
}
const TransferHistoryCard = (props: Props): React.ReactNode => {
  let { op, context, steem_per_share } = props;

  // context -> account perspective

  const type = op.op[0];
  const data = op.op[1];
  const amount_vests = parseAsset(data?.reward_vests)?.amount;
  const amount_curation = parseAsset(data?.reward)?.amount;
  const amount_vesting = parseAsset(data?.vesting_payout)?.amount;
  const amount_withdrawan = parseAsset(data?.withdrawn)?.amount;
  const amount_vesting_shares = parseAsset(data?.vesting_shares)?.amount;

  const powerdown_vests =
    type === "withdraw_vesting"
      ? vestToSteem(amount_vesting_shares, steem_per_share)?.toLocaleString()
      : undefined;

  const reward_vests =
    type === "claim_reward_balance"
      ? vestToSteem(amount_vests, steem_per_share)?.toLocaleString()
      : undefined;
  const curation_reward =
    type === "curation_reward"
      ? vestToSteem(amount_curation, steem_per_share)?.toLocaleString()
      : undefined;
  const author_reward =
    type === "author_reward"
      ? vestToSteem(amount_vesting, steem_per_share)?.toLocaleString()
      : undefined;
  const benefactor_reward =
    type === "comment_benefactor_reward"
      ? vestToSteem(amount_vesting, steem_per_share)?.toLocaleString()
      : undefined;

  const withdrawn_vests =
    type === "fill_vesting_withdraw"
      ? vestToSteem(amount_withdrawan, steem_per_share)?.toLocaleString()
      : undefined;

  /* All transfers involve up to 2 accounts, context and 1 other. */
  let message;

  const PostLink = ({
    author,
    permlink,
  }: {
    author: string;
    permlink: string;
  }) => (
    <SLink
      className="text-blue-500"
      href={`/@${author}/${permlink}`}
      target="_blank"
    >
      <p className=" line-clamp-1 max-w-[200px]">
        {author}/{permlink}
      </p>
    </SLink>
  );

  if (type === "transfer_to_vesting") {
    const amount = parseAsset(data?.amount)?.amount;

    if (data.from === context) {
      if (data.to === "") {
        message = (
          <TransferFromTo title={`Transfer ${amount} to STEEM POWER`} />
        );
      } else {
        message = (
          <TransferFromTo
            title={`Transfer ${amount} STEEM POWER`}
            to={data.to}
          />
        );
      }
    } else if (data.to === context) {
      message = (
        <TransferFromTo
          title={`Receive ${amount} STEEM POWER from`}
          from={data.from}
        />
      );

      // tt('g.receive') + amount + ' STEEM POWER' + tt('g.from');
    } else {
      message = (
        <TransferFromTo
          title={`Transfer ${amount} STEEM POWER from`}
          from={data.from}
          to={data.to}
        />
      );
    }
  } else if (
    /^transfer$|^transfer_to_savings$|^transfer_from_savings$/.test(type)
  ) {
    // transfer_to_savings
    const fromWhere =
      type === "transfer_to_savings" ? (
        <TransferFromTo
          title={`Transfer to savings ${data?.amount}`}
          to={data.to}
        />
      ) : type === "transfer_from_savings" ? (
        <TransferFromTo
          title={`Transfer from savings ${data?.amount}`}
          to={data.to}
        />
      ) : (
        <TransferFromTo title={`Transfer ${data?.amount}`} to={data?.to} />
      );

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
        type === "transfer_to_savings" ? (
          <TransferFromTo
            title={`Receive from savings ${data?.amount} from`}
            from={data.from}
          />
        ) : type === "transfer_from_savings" ? (
          <TransferFromTo
            title={`Transfer from savings ${data?.amount} from`}
            from={data.from}
          />
        ) : (
          <TransferFromTo
            title={`Received ${data?.amount} from`}
            from={data.from}
          />
        );
      message = fromWhere;
    } else {
      // Removing the `from` link from this one -- only one user is linked anyways.
      const fromWhere =
        type === "transfer_to_savings" ? (
          <TransferFromTo
            title={`Transfer to savings ${data?.amount} from`}
            from={data.from}
            to={data.to}
          />
        ) : type === "transfer_from_savings" ? (
          <TransferFromTo
            title={`Transfer from savings ${data?.amount} from`}
            from={data.from}
            to={data.to}
          />
        ) : (
          <TransferFromTo
            title={`Transfer ${data?.amount} from`}
            from={data.from}
            to={data.to}
          />
        );

      message = fromWhere;
    }
  } else if (type === "cancel_transfer_from_savings") {
    message = (
      <TransferFromTo
        title={`Cancel transfer from savings Request ID: `}
        from={data.request_id}
      />
    );
    // `${ tt('transferhistoryrow_jsx.cancel_transfer_from_savings') } (${ tt('g.request') } ${ data.request_id })`;
  } else if (type === "withdraw_vesting") {
    if (data.vesting_shares === "0.000000 VESTS")
      message = <TransferFromTo title={`Stop power down`} />;
    else
      message = (
        <TransferFromTo
          title={`Start power down of ${powerdown_vests} STEEM`}
        />
      );

    // tt('transferhistoryrow_jsx.start_power_down_of') + ' ' + powerdown_vests + ' STEEM';
  } else if (type === "curation_reward") {
    message = (
      <TransferFromTo
        title={
          <div className="flex gap-2">
            <p>Claim {curation_reward} STEEM POWER for</p>
            <PostLink
              author={data.comment_author}
              permlink={data.comment_permlink}
            />
          </div>
        }
      />
    );

    // `${ curation_reward } TEEM POWER` + tt('g.for');
  } else if (type === "author_reward") {
    let steem_payout = "";
    if (data.steem_payout !== "0.000 STEEM")
      steem_payout = ", " + data.steem_payout;
    message = (
      <TransferFromTo
        title={
          <div className="flex gap-2">
            <p>
              Claim {author_reward} SP {steem_payout} and {data.sbd_payout} for
            </p>

            <PostLink author={data.author} permlink={data.permlink} />
          </div>
        }
      />
    );

    // `${ data.sbd_payout }${ steem_payout }, ${ tt('g.and') } ${ author_reward } STEEM POWER ${ tt('g.for') } `;
  } else if (type === "claim_reward_balance") {
    const rewards: any[] = [];
    if (parseFloat(data.reward_steem.split(" ")[0]) > 0)
      rewards.push(data.reward_steem);
    if (parseFloat(data.reward_sbd.split(" ")[0]) > 0)
      rewards.push(data.reward_sbd);
    if (parseFloat(data.reward_vests.split(" ")[0]) > 0)
      rewards.push(`${reward_vests} STEEM POWER`);

    switch (rewards.length) {
      case 3:
        message = (
          <TransferFromTo
            title={`Claim rewards: ${rewards[0]}, ${rewards[1]} and ${rewards[2]} `}
          />
        );
        break;
      case 2:
        message = (
          <TransferFromTo
            title={`Claim rewards: ${rewards[0]} and ${rewards[1]} `}
          />
        );
        break;
      case 1:
        message = <TransferFromTo title={`Claim rewards: ${rewards[0]} `} />;
        break;
    }
  } else if (type === "interest") {
    message = (
      <TransferFromTo title={`Receive interest of ${data.interest} `} />
    );
  } else if (type === "fill_convert_request") {
    message = (
      <TransferFromTo
        title={`Fill convert request: ${data?.amount_in} for ${data?.amount_out}`}
      />
    );
  } else if (type === "fill_order") {
    if (data.open_owner == context) {
      // my order was filled by data.current_owner
      message = (
        <TransferFromTo
          title={`Paid ${data?.open_pays} for ${data?.current_pays}`}
        />
      );
    } else {
      // data.open_owner filled my order
      message = (
        <TransferFromTo
          title={`Paid ${data.open_pays} for ${data.current_pays}`}
        />
      );

      // `Paid ${ data.current_pays } for ${ data.open_pays }`;
    }
  } else if (type === "comment_benefactor_reward") {
    message = (
      <TransferFromTo
        title={`${benefactor_reward} STEEM POWER for ${data?.author} / ${data?.permlink}`}
      />
    );
  } else if (type === "fill_vesting_withdraw") {
    message = (
      <TransferFromTo title={`Deposited power down steem ${withdrawn_vests}`} />
    );
  } else {
    message = JSON.stringify({ type, ...data }, null, 2);
  }

  return (
    <div className="flex flex-col gap-3 p-2">
      <div className="text-sm">{message}</div>

      {data?.memo && (
        <MarkdownViewer text={data.memo} className=" !prose-sm  max-w-xl" />
      )}
    </div>
  );
};

export { TransferHistoryCard };
