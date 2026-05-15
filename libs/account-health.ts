import { client, steemApi } from "./steem";
import { Constants } from "@/constants";
import moment from "moment";

export interface HealthCheckResult {
  id: string;
  section: "security" | "authority" | "resource" | "governance";
  status: "good" | "warning" | "danger" | "info";
  title: string;
  description: string;
  value?: string | number;
  data?: any;
  entities?: string[];
  link?: string;
}

export class AccountHealthService {
  static async checkRecoveryStatus(
    data: AccountExt,
    t: any,
  ): Promise<HealthCheckResult> {
    const trustedAccounts = Constants.trusted_recovery_accounts || [];
    const isTrusted = trustedAccounts.includes(data.recovery_account);
    const isSelf = data.recovery_account === data.name;

    // Check for pending recovery change
    let pendingRequest: any = null;
    try {
      const response = await client.call(
        "database_api",
        "find_change_recovery_account_requests",
        {
          accounts: [data.name],
        },
      );
      if (response?.requests?.length > 0) {
        pendingRequest = response.requests[0];
      }
    } catch (e) {
      console.error("Failed to fetch recovery requests", e);
    }

    if (pendingRequest) {
      return {
        id: "recovery",
        section: "security",
        status: "danger",
        title: t("checks.recoveryAccount.title"),
        description: t("checks.recoveryAccount.pending", {
          name: pendingRequest.recovery_account,
          date: moment(pendingRequest.effective_on).format("LLL"),
        }),
        value: `@${pendingRequest.recovery_account}`,
      };
    }

    if (isTrusted) {
      return {
        id: "recovery",
        section: "security",
        status: "good",
        title: t("checks.recoveryAccount.title"),
        description: t("checks.recoveryAccount.good"),
        value: `@${data.recovery_account}`,
      };
    }

    return {
      id: "recovery",
      section: "security",
      status: isSelf ? "danger" : "warning",
      title: t("checks.recoveryAccount.title"),
      description: isSelf
        ? t("checks.recoveryAccount.danger")
        : t("checks.recoveryAccount.warning"),
      value: `@${data.recovery_account}`,
      link: `/@${data.name}/wallet`,
    };
  }

  static checkAuthorities(data: AccountExt, t: any): HealthCheckResult[] {
    const results: HealthCheckResult[] = [];

    const formatAuthsArray = (keys: any[], accounts: any[]) => {
      return [
        ...keys.slice(1).map(([key]) => `Key: ${key.substring(0, 10)}...`),
        ...accounts.map(([acc]) => `@${acc}`),
      ];
    };

    // Active
    const activeKeys = data.active_key_auths || [];
    const activeAccounts = data.active_account_auths || [];
    const hasActiveAuth = activeKeys.length > 1 || activeAccounts.length > 0;
    const activeEntities = formatAuthsArray(activeKeys, activeAccounts);

    results.push({
      id: "activeAuthority",
      section: "authority",
      status: hasActiveAuth ? "danger" : "good",
      title: t("checks.activeAuthority.title"),
      description: hasActiveAuth
        ? t("checks.activeAuthority.danger")
        : t("checks.activeAuthority.good"),
      value: hasActiveAuth ? `${activeEntities.length} Entities` : undefined,
      entities: activeEntities,
      link: `/@${data.name}/wallet`,
    });

    // Owner
    const ownerKeys = data.owner_key_auths || [];
    const ownerAccounts = data.owner_account_auths || [];
    const hasOwnerAuth = ownerKeys.length > 1 || ownerAccounts.length > 0;
    const ownerEntities = formatAuthsArray(ownerKeys, ownerAccounts);

    results.push({
      id: "ownerAuthority",
      section: "authority",
      status: hasOwnerAuth ? "danger" : "good",
      title: t("checks.ownerAuthority.title"),
      description: hasOwnerAuth
        ? t("checks.ownerAuthority.danger")
        : t("checks.ownerAuthority.good"),
      value: hasOwnerAuth ? `${ownerEntities.length} Entities` : undefined,
      entities: ownerEntities,
      link: `/@${data.name}/wallet`,
    });

    // Posting
    const postingKeys = data.posting_key_auths || [];
    const postingAccounts = data.posting_account_auths || [];
    const hasPostingAuth = postingKeys.length > 1 || postingAccounts.length > 0;
    const postingEntities = formatAuthsArray(postingKeys, postingAccounts);

    results.push({
      id: "postingAuthority",
      section: "authority",
      status: hasPostingAuth ? "warning" : "good",
      title: t("checks.postingAuthority.title"),
      description: hasPostingAuth
        ? t("checks.postingAuthority.warning")
        : t("checks.postingAuthority.good"),
      value: hasPostingAuth ? `${postingEntities.length} Entities` : undefined,
      entities: postingEntities,
      link: `/@${data.name}/wallet`,
    });

    return results;
  }

  static async checkSavings(
    data: AccountExt,
    t: any,
  ): Promise<HealthCheckResult> {
    const hasSavings = data.savings_steem > 0 || data.savings_sbd > 0;

    // Check for pending withdrawals
    let pendingWithdrawals: any[] = [];
    try {
      pendingWithdrawals = await client.database.call(
        "get_savings_withdraw_from",
        [data.name],
      );
    } catch (e) {
      console.error("Failed to fetch savings withdrawals", e);
    }

    if (pendingWithdrawals.length > 0) {
      const first = pendingWithdrawals[0];
      return {
        id: "savings",
        section: "resource",
        status: "danger",
        title: t("checks.savings.title"),
        description: t("checks.savings.withdrawal", {
          amount: first.amount,
          date: moment(first.complete).format("LLL"),
        }),
        value: first.amount,
      };
    }

    return {
      id: "savings",
      section: "resource",
      status: hasSavings ? "good" : "warning",
      title: t("checks.savings.title"),
      description: hasSavings
        ? t("checks.savings.info", {
            amount: `${data.savings_steem} STEEM, ${data.savings_sbd} SBD`,
          })
        : "You have no funds in savings for extra security.",
      value: hasSavings ? `${data.savings_steem} STEEM` : "0",
      link: `/@${data.name}/wallet`,
    };
  }

  static checkPowerDown(
    data: AccountExt,
    t: any,
    vestsToSteem: (vests: number) => number,
  ): HealthCheckResult {
    const isPoweringDown = data.powerdown > 0;
    if (isPoweringDown) {
      const steemAmount = vestsToSteem(data.powerdown);
      return {
        id: "powerDown",
        section: "resource",
        status: "warning",
        title: t("checks.powerDown.title"),
        description: t("checks.powerDown.info", {
          amount: `${steemAmount.toFixed(3)} STEEM`,
          date: moment(data.next_powerdown * 1000).format("LLL"),
        }),
        value: `${steemAmount.toFixed(0)} STEEM`,
        link: `/@${data.name}/wallet`,
      };
    }
    return {
      id: "powerDown",
      section: "resource",
      status: "good",
      title: t("checks.powerDown.title"),
      description: t("checks.powerDown.none"),
    };
  }

  static checkDelegations(
    data: AccountExt,
    t: any,
    vestsToSteem: (vests: number) => number,
  ): HealthCheckResult {
    const vestsOut = data.vests_out || 0;
    const hasDelegations = vestsOut > 0;
    const steemAmount = vestsToSteem(vestsOut);

    return {
      id: "delegations",
      section: "resource",
      status: hasDelegations ? "info" : "good",
      title: "Outgoing Delegations",
      description: hasDelegations
        ? `You are delegating ${steemAmount.toFixed(3)} STEEM to other accounts.`
        : "You have no outgoing delegations.",
      value: hasDelegations ? `${steemAmount.toFixed(1)} STEEM` : "0",
    };
  }

  static checkGovernance(data: AccountExt, t: any): HealthCheckResult[] {
    const results: HealthCheckResult[] = [];

    // Voting Proxy
    const hasProxy = !!data.proxy;
    if (hasProxy) {
      results.push({
        id: "proxy",
        section: "governance",
        status: "good",
        title: t("checks.proxy.title"),
        description: t("checks.proxy.info", { name: data.proxy }),
        value: `@${data.proxy}`,
        link: `/witnesses`,
      });
    }

    // Witness Votes
    const votesCount = data.witness_votes?.length || 0;
    if (!hasProxy) {
      results.push({
        id: "witness",
        section: "governance",
        status:
          votesCount === 30 ? "good" : votesCount > 0 ? "warning" : "danger",
        title: t("checks.witnessVotes.title"),
        description:
          votesCount >= 30
            ? t("checks.witnessVotes.good")
            : t("checks.witnessVotes.warning", { count: votesCount }),
        value: `${votesCount}/30`,
        link: `/witnesses`,
      });
    } else {
      // If has proxy, witness votes are info only
      results.push({
        id: "witness",
        section: "governance",
        status: "good",
        title: t("checks.witnessVotes.title"),
        description: "Your witness votes are managed by your proxy.",
        value: `${votesCount} Manual`,
      });
    }

    // Voting Power
    const vp = data.upvote_mana_percent;
    results.push({
      id: "vp",
      section: "governance",
      status: vp < 98 && vp > 20 ? "good" : vp >= 98 ? "warning" : "danger",
      title: t("checks.votingPower.title"),
      description:
        vp >= 98
          ? t("checks.votingPower.warning")
          : vp < 20
            ? t("checks.votingPower.danger", { percent: vp })
            : t("checks.votingPower.good"),
      value: `${vp}%`,
    });

    return results;
  }

  static checkReputation(data: AccountExt, t: any): HealthCheckResult {
    const rep = data.reputation;
    return {
      id: "reputation",
      section: "security",
      status: rep < 25 ? "warning" : rep > 60 ? "good" : "info",
      title: "Account Reputation",
      description:
        rep < 25
          ? "Your reputation is low. This may restrict your visibility on some platforms."
          : rep > 60
            ? "You have a high reputation, which indicates a trusted and established account."
            : "Your reputation is in the normal range.",
      value: rep.toFixed(1),
    };
  }

  static checkAccountAge(data: AccountExt, t: any): HealthCheckResult {
    const created = moment(data.created * 1000);
    const daysOld = moment().diff(created, "days");
    const isNew = daysOld < 30;

    return {
      id: "accountAge",
      section: "security",
      status: isNew ? "warning" : "good",
      title: "Account Age",
      description: isNew
        ? `Your account is only ${daysOld} days old. Make sure to secure your master password and keys.`
        : `Your account is ${daysOld} days old and well-established.`,
      value: `${daysOld} Days`,
    };
  }

  static checkLiquidFunds(
    data: AccountExt,
    t: any,
    vestsToSteem: (vests: number) => number,
  ): HealthCheckResult {
    const liquidSteem = data.balance_steem || 0;
    const liquidSbd = data.balance_sbd || 0;
    const totalLiquid = liquidSteem + liquidSbd;
    const totalSP = vestsToSteem(data.vests_own || 0);

    const ratio = totalSP > 0 ? totalLiquid / totalSP : totalLiquid > 0 ? 1 : 0;

    return {
      id: "liquidFunds",
      section: "resource",
      status: ratio > 0.5 ? "danger" : ratio > 0.2 ? "warning" : "good",
      title: t("checks.liquidFunds.title"),
      description:
        ratio > 0.5
          ? t("checks.liquidFunds.danger", { ratio: (ratio * 100).toFixed(1) })
          : ratio > 0.2
            ? t("checks.liquidFunds.warning", {
                ratio: (ratio * 100).toFixed(1),
              })
            : t("checks.liquidFunds.good"),
      value: `${totalLiquid.toFixed(3)} STEEM`,
      link: `/@${data.name}/wallet`,
    };
  }

  static checkUnclaimedRewards(data: AccountExt, t: any): HealthCheckResult {
    const hasUnclaimed =
      (data.rewards_steem || 0) > 0 ||
      (data.rewards_sbd || 0) > 0 ||
      (data.rewards_vests || 0) > 0;

    return {
      id: "unclaimedRewards",
      section: "resource",
      status: hasUnclaimed ? "warning" : "good",
      title: t("checks.unclaimedRewards.title"),
      description: hasUnclaimed
        ? t("checks.unclaimedRewards.warning")
        : t("checks.unclaimedRewards.good"),
      value: hasUnclaimed ? "Pending" : "None",
      link: `/@${data.name}/wallet`,
    };
  }

  static async checkWithdrawRoutes(
    data: AccountExt,
    t: any,
  ): Promise<HealthCheckResult> {
    const routeCount = data.withdraw_routes || 0;
    const hasRoutes = routeCount > 0;
    let routes: any[] = [];

    if (hasRoutes) {
      try {
        routes = await steemApi.getWithdrawRoutes(data.name, "outgoing");
      } catch (e) {
        console.error("Failed to fetch withdraw routes", e);
      }
    }

    const entities = routes.map(
      (r) => `@${r.to_account} (${r.percent / 100}%)`,
    );

    return {
      id: "withdrawRoutes",
      section: "security",
      status: hasRoutes ? "warning" : "good",
      title: t("checks.withdrawRoutes.title"),
      description: hasRoutes
        ? t("checks.withdrawRoutes.warning", { count: routeCount })
        : t("checks.withdrawRoutes.good"),
      value: hasRoutes ? `${routeCount} Routes` : "0",
      entities: entities,
      link: `/@${data.name}/wallet`,
    };
  }

  static checkCSI(data: AccountExt, t: any): HealthCheckResult {
    const csi = data.voting_csi || 0;
    return {
      id: "csi",
      section: "governance",
      status: csi >= 80 ? "good" : csi >= 50 ? "info" : "warning",
      title: t("checks.csi.title"),
      description:
        csi >= 80
          ? t("checks.csi.good")
          : csi >= 50
            ? t("checks.csi.info")
            : t("checks.csi.warning"),
      value: `${csi.toFixed(1)}%`,
    };
  }

  static checkSelfVoteRate(data: AccountExt, t: any): HealthCheckResult {
    const rate = data.selfvote_rate || 0;
    return {
      id: "selfVote",
      section: "governance",
      status: rate <= 5 ? "good" : rate <= 20 ? "warning" : "danger",
      title: t("checks.selfVote.title"),
      description:
        rate <= 5
          ? t("checks.selfVote.good")
          : rate <= 20
            ? t("checks.selfVote.warning", { percent: rate.toFixed(1) })
            : t("checks.selfVote.danger", { percent: rate.toFixed(1) }),
      value: `${rate.toFixed(1)}%`,
    };
  }

  static checkKeyDuplicates(data: AccountExt, t: any): HealthCheckResult {
    const postingKey = data.posting_key_auths?.[0]?.[0];
    const activeKey = data.active_key_auths?.[0]?.[0];
    const ownerKey = data.owner_key_auths?.[0]?.[0];

    const hasPostingActiveDuplicate = postingKey === activeKey;
    const hasActiveOwnerDuplicate = activeKey === ownerKey;
    const hasPostingOwnerDuplicate = postingKey === ownerKey;

    const anyDuplicate =
      hasPostingActiveDuplicate ||
      hasActiveOwnerDuplicate ||
      hasPostingOwnerDuplicate;

    let status: "good" | "warning" | "danger" = "good";
    if (hasActiveOwnerDuplicate || hasPostingOwnerDuplicate) {
      status = "danger";
    } else if (hasPostingActiveDuplicate) {
      status = "warning";
    }

    return {
      id: "keyDuplicates",
      section: "security",
      status: status,
      title: t("checks.keyDuplicates.title"),
      description:
        status === "danger"
          ? t("checks.keyDuplicates.danger")
          : status === "warning"
            ? t("checks.keyDuplicates.warning")
            : t("checks.keyDuplicates.good"),
      value: anyDuplicate
        ? t("checks.keyDuplicates.detected")
        : t("checks.keyDuplicates.unique"),
      link: `/@${data.name}/wallet`,
    };
  }
}
