export const getOperationIcon = (type: string): string => {
  switch (type) {
    case "transfer":
      return "💸"; // Money transfer
    case "transfer_to_vesting":
      return "⚡"; // Powering up
    case "withdraw_vesting":
      return "📤"; // Powering down
    case "comment":
      return "📝"; // Writing
    case "vote":
      return "🗳️"; // Vote
    case "claim_reward_balance":
      return "🎉"; // Reward claim
    case "claim_account":
      return "🎟️"; // Ticket/claim
    case "create_claimed_account":
      return "🆕"; // New account
    case "account_update":
      return "🛠️"; // Settings/update
    case "account_witness_vote":
      return "🗳️"; // Witness vote
    case "account_witness_proxy":
      return "🧾"; // Proxy paper
    case "custom_json":
      return "🧩"; // Custom/extension
    case "feed_publish":
      return "📡"; // Feed broadcast
    case "limit_order_create":
      return "🧾"; // Create order
    case "limit_order_cancel":
      return "❌"; // Cancel order
    case "delegate_vesting_shares":
      return "🤝"; // Delegation
    case "escrow_transfer":
      return "🔐"; // Secured payment
    case "escrow_approve":
      return "✔️"; // Approve escrow
    case "escrow_dispute":
      return "⚠️"; // Dispute
    case "escrow_release":
      return "🔓"; // Release funds
    case "proposal_create":
      return "📜"; // New proposal
    case "proposal_update":
      return "✏️"; // Edit proposal
    case "proposal_vote":
      return "🗳️"; // Vote on proposal
    case "witness_update":
      return "🔧"; // Witness config
    case "producer_reward":
      return "🏆"; // Block reward
    case "curation_reward":
      return "🎯"; // Curation target
    case "author_reward":
      return "✍️"; // Author reward
    case "comment_reward":
      return "💬"; // Comment reward
    case "interest":
      return "💰"; // Interest
    case "fill_vesting_withdraw":
      return "🏦"; // Bank transfer
    case "fill_order":
      return "📦"; // Order filled
    case "effective_comment_vote":
      return "👍"; // Vote effect
    case "ineffective_delete_comment":
      return "🚫"; // Failed delete
    case "liquidity_reward":
      return "💧"; // Liquidity
    case "fill_convert_request":
      return "🔄"; // Conversion
    case "comment_benefactor_reward":
      return "🎁"; // Benefactor reward
    case "return_vesting_delegation":
      return "↩️"; // Return delegation
    default:
      return "⚙️"; // Default/unknown
  }
};
