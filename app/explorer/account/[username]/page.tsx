"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Progress } from "@heroui/progress";
import {
  ArrowLeft,
  User,
  Wallet,
  Shield,
  Clock,
  Award,
  Zap,
  DatabaseZap,
  ArrowDownUp,
  Key,
  Calendar,
  TrendingUp,
  Users,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  PiggyBank,
  Gift,
} from "lucide-react";
import {
  condenserApi,
  SteemAccount,
  DynamicGlobalProperties,
  RCAccount,
} from "@/libs/consenser";
import { motion } from "framer-motion";
import SAvatar from "@/components/ui/SAvatar";
import Link from "next/link";
import CopyButton from "@/components/ui/CopyButton";
import PageHeader from "@/components/ui/PageHeader";
import moment from "moment";
import Reputation from "@/components/post/Reputation";
import SUsername from "@/components/ui/SUsername";
const STEEM_VOTING_MANA_REGENERATION_SECONDS = 432000;

export default function AccountDetailPage() {
  const params = useParams();
  const username = (params.username as string)?.toLowerCase().replace("@", "");

  const [account, setAccount] = useState<SteemAccount | null>(null);
  const [globals, setGlobals] = useState<DynamicGlobalProperties | null>(null);
  const [rcPercent, setRcPercent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) return;

    let cancelled = false;
    setAccount(null);
    setGlobals(null);
    setRcPercent(0);
    setError("");
    setLoading(true);

    Promise.all([
      condenserApi.getAccounts([username]),
      condenserApi.getDynamicGlobalProperties(),
      condenserApi.findRCAccounts([username]),
    ])
      .then(([accounts, g, rcAccounts]) => {
        if (cancelled) return;
        if (!accounts || accounts.length === 0) {
          setError(`Account "@${username}" not found.`);
          return;
        }
        setAccount(accounts[0]);
        setGlobals(g);

        // Calculate RC percentage
        if (rcAccounts && rcAccounts.length > 0) {
          const rc = rcAccounts[0];
          const maxRC = Number(rc.max_rc);
          if (maxRC > 0) {
            const now = Math.floor(Date.now() / 1000);
            const elapsed = Math.max(0, now - rc.rc_manabar.last_update_time);
            const currentMana = Number(rc.rc_manabar.current_mana);
            const regenerated = Math.min(
              currentMana + (elapsed * maxRC) / (5 * 24 * 3600),
              maxRC,
            );
            setRcPercent(
              Math.max(0, Math.min(100, (regenerated / maxRC) * 100)),
            );
          }
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to fetch account data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  const parseAmount = (s: string) => parseFloat(s?.split(" ")[0] || "0");

  const vestsToSteem = (vests: number): number => {
    if (!globals) return 0;
    const totalVestingShares = parseAmount(globals.total_vesting_shares);
    const totalVestingFund = parseAmount(globals.total_vesting_fund_steem);
    return (vests / totalVestingShares) * totalVestingFund;
  };

  const formatSP = (vests: number) => vestsToSteem(vests).toFixed(3);

  const getEffectiveVestingSharesPerAccount = (account: SteemAccount) => {
    const effective_vesting_shares =
      parseFloat((account.vesting_shares as string).replace(" VESTS", "")) +
      parseFloat(
        (account.received_vesting_shares as string).replace(" VESTS", ""),
      ) -
      parseFloat(
        (account.delegated_vesting_shares as string).replace(" VESTS", ""),
      );
    return effective_vesting_shares;
  };

  const getVP = (account: SteemAccount) => {
    if (!account.name) {
      return null;
    }
    const estimated_max =
      (getEffectiveVestingSharesPerAccount(account) -
        parseFloat(account.vesting_withdraw_rate as string)) *
      1000000;
    const current_mana = parseFloat(
      account.voting_manabar.current_mana as string,
    );
    const last_update_time = account.voting_manabar.last_update_time;
    const diff_in_seconds = Math.round(Date.now() / 1000 - last_update_time);
    let estimated_mana =
      current_mana +
      (diff_in_seconds * estimated_max) /
        STEEM_VOTING_MANA_REGENERATION_SECONDS;
    if (estimated_mana > estimated_max) {
      estimated_mana = estimated_max;
    }
    const estimated_pct = (estimated_mana / estimated_max) * 100;
    return estimated_pct;
  };

  const getReputation = (rep: string): number => {
    const r = parseInt(rep);
    if (r === 0) return 25;
    const neg = r < 0;
    const out = Math.log10(Math.abs(r));
    let result = Math.max(out - 9, 0);
    result = result * (neg ? -1 : 1) * 9 + 25;
    return Math.floor(result);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Button
          onPress={() => {
            window?.history?.back();
          }}
          variant="flat"
          radius="lg"
          size="sm"
          isIconOnly
        >
          <ArrowLeft size={16} />
        </Button>
        <PageHeader
          title={`@${username}`}
          description="Steem account details"
          icon={User}
          color="primary"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" color="primary" />
        </div>
      )}

      {error && (
        <Card className="bg-danger/10 border border-danger/20" shadow="none">
          <CardBody className="text-danger text-sm p-4">{error}</CardBody>
        </Card>
      )}

      {account && globals && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {/* Profile Header */}
          {(() => {
            let coverImage = "";
            let profileName = "";

            try {
              const meta = JSON.parse(
                account.posting_json_metadata || account.json_metadata || "{}",
              );
              coverImage = meta?.profile?.cover_image || "";
              profileName = meta?.profile?.name || "";
            } catch {}

            return (
              <Card
                className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50 overflow-hidden"
                shadow="none"
              >
                {/* Cover Image / Gradient Banner */}
                <div className="relative h-32 sm:h-40 w-full">
                  {coverImage ? (
                    <>
                      <img
                        src={coverImage}
                        alt="Cover"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/60" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-r from-blue-500 via-primary to-cyan-500" />
                  )}
                </div>

                <CardBody className="p-5 -mt-10 relative z-10">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <SAvatar
                      username={account.name}
                      size="lg"
                      quality="medium"
                      className="ring-4 ring-background shadow-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap mt-0 sm:mt-6">
                        <div className="flex flex-col items-start">
                          {profileName && (
                            <span className="text-xl font-bold">
                              {profileName}
                            </span>
                          )}
                          <SUsername
                            className={`${profileName ? "text-sm text-default-500 dark:text-default-400" : "text-xl font-bold"} hover:text-primary! transition-colors`}
                            username={`@${account.name}`}
                          />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Reputation
                            value={getReputation(account.reputation)}
                          />
                          <Chip
                            size="sm"
                            variant="flat"
                            classNames={{
                              base: "bg-default/20",
                              content: "text-[10px] font-bold",
                            }}
                          >
                            ID #{account.id}
                          </Chip>
                        </div>
                      </div>

                      {(() => {
                        try {
                          const m = JSON.parse(
                            account.posting_json_metadata ||
                              account.json_metadata ||
                              "{}",
                          );
                          const about = m?.profile?.about;
                          return about ? (
                            <p className="text-sm text-default-500 dark:text-default-400 mt-1 line-clamp-2">
                              {about}
                            </p>
                          ) : null;
                        } catch {
                          return null;
                        }
                      })()}

                      <div className="flex gap-3 mt-2 flex-wrap">
                        <span
                          title={moment(account.created).toLocaleString()}
                          className="text-xs text-default-500 dark:text-default-400 flex items-center gap-1"
                        >
                          <Calendar size={12} />
                          {moment(account.created).fromNow()}
                        </span>
                        <span className="text-xs text-default-500 dark:text-default-400 flex items-center gap-1">
                          <Award size={12} />
                          {account.post_count} posts
                        </span>
                        <span className="text-xs text-default-500 dark:text-default-400 flex items-center gap-1">
                          <Users size={12} />
                          {account.witnesses_voted_for} witness votes
                        </span>
                        {account.proxy && (
                          <span className="text-xs text-default-500 dark:text-default-400 flex items-center gap-1">
                            <Shield size={12} />
                            Proxy: @{account.proxy}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })()}

          {/* Voting Power & Downvote Mana */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(() => {
              const vp = getVP(account);
              return (
                <Card
                  className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50"
                  shadow="none"
                >
                  <CardBody className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-warning/10 text-warning">
                          <Zap size={16} className="fill-current" />
                        </div>
                        <span className="text-sm font-semibold">
                          Voting Power
                        </span>
                      </div>
                      <span className="font-bold font-mono text-warning">
                        {vp}%
                      </span>
                    </div>
                    <Progress
                      value={vp ?? 0}
                      color="warning"
                      size="sm"
                      classNames={{ track: "bg-warning/10" }}
                    />
                  </CardBody>
                </Card>
              );
            })()}

            {(() => {
              const rcVal = rcPercent;
              return (
                <Card
                  className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50"
                  shadow="none"
                >
                  <CardBody className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <DatabaseZap size={16} />
                        </div>
                        <span className="text-sm font-semibold">
                          Resource Credits
                        </span>
                      </div>
                      <span className="font-bold font-mono text-primary">
                        {rcVal.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={rcVal}
                      color="primary"
                      size="sm"
                      classNames={{ track: "bg-primary/10" }}
                    />
                  </CardBody>
                </Card>
              );
            })()}
          </div>

          {/* Balances */}
          <Card
            className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50"
            shadow="none"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-success/10 text-success border border-success/20">
                  <Wallet size={18} />
                </div>
                <h3 className="font-bold text-lg">Balances</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <BalanceCard
                  label="STEEM"
                  value={account.balance}
                  icon={Coins}
                  color="text-sky-500"
                  bg="bg-sky-500/10"
                />
                <BalanceCard
                  label="SBD"
                  value={account.sbd_balance}
                  icon={Coins}
                  color="text-green-500"
                  bg="bg-green-500/10"
                />
                <BalanceCard
                  label="STEEM POWER"
                  value={`${formatSP(parseAmount(account.vesting_shares))} SP`}
                  icon={Zap}
                  color="text-amber-500"
                  bg="bg-amber-500/10"
                />
                <BalanceCard
                  label="Effective SP"
                  value={`${formatSP(
                    parseAmount(account.vesting_shares) -
                      parseAmount(account.delegated_vesting_shares) +
                      parseAmount(account.received_vesting_shares),
                  )} SP`}
                  icon={TrendingUp}
                  color="text-indigo-500"
                  bg="bg-indigo-500/10"
                />
                <BalanceCard
                  label="Delegated Out"
                  value={`-${formatSP(parseAmount(account.delegated_vesting_shares))} SP`}
                  icon={ArrowUpRight}
                  color="text-rose-500"
                  bg="bg-rose-500/10"
                />
                <BalanceCard
                  label="Received"
                  value={`+${formatSP(parseAmount(account.received_vesting_shares))} SP`}
                  icon={ArrowDownRight}
                  color="text-emerald-500"
                  bg="bg-emerald-500/10"
                />
              </div>
            </CardBody>
          </Card>

          {/* Savings & Pending Rewards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card
              className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50"
              shadow="none"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-warning/10 text-warning border border-warning/20">
                    <PiggyBank size={18} />
                  </div>
                  <h3 className="font-bold">Savings</h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-2">
                <InfoItem label="STEEM" value={account.savings_balance} />
                <InfoItem label="SBD" value={account.savings_sbd_balance} />
                <InfoItem
                  label="Withdraw Requests"
                  value={account.savings_withdraw_requests.toString()}
                />
              </CardBody>
            </Card>

            <Card
              className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50"
              shadow="none"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-success/10 text-success border border-success/20">
                    <Gift size={18} />
                  </div>
                  <h3 className="font-bold">Pending Rewards</h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-2">
                <InfoItem label="STEEM" value={account.reward_steem_balance} />
                <InfoItem label="SBD" value={account.reward_sbd_balance} />
                <InfoItem label="SP" value={account.reward_vesting_steem} />
              </CardBody>
            </Card>
          </div>

          {/* Activity & Earnings */}
          <Card
            className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50"
            shadow="none"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <ArrowDownUp size={18} />
                </div>
                <h3 className="font-bold">Activity & Earnings</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <InfoItem
                  label="Last Post"
                  value={
                    account.last_root_post === "1970-01-01T00:00:00"
                      ? "Never"
                      : new Date(
                          account.last_root_post + "Z",
                        ).toLocaleDateString()
                  }
                />
                <InfoItem
                  label="Last Vote"
                  value={
                    account.last_vote_time === "1970-01-01T00:00:00"
                      ? "Never"
                      : new Date(
                          account.last_vote_time + "Z",
                        ).toLocaleDateString()
                  }
                />
                <InfoItem
                  label="Post Count"
                  value={account.post_count.toLocaleString()}
                />
                <InfoItem
                  label="Curation Rewards"
                  value={`${formatSP(account.curation_rewards / 1_000_000)} SP`}
                />
                <InfoItem
                  label="Author Rewards"
                  value={`${formatSP(account.posting_rewards / 1_000_000)} SP`}
                />
                <InfoItem
                  label="Recovery Account"
                  value={`@${account.recovery_account}`}
                />
                <InfoItem
                  label="Powerdown Rate"
                  value={
                    parseAmount(account.vesting_withdraw_rate) > 0
                      ? `${formatSP(parseAmount(account.vesting_withdraw_rate))} SP/week`
                      : "Not powering down"
                  }
                />
                <InfoItem
                  label="Withdraw Routes"
                  value={account.withdraw_routes.toString()}
                />
                <InfoItem
                  label="Can Vote"
                  value={account.can_vote ? "Yes" : "No"}
                />
              </div>
            </CardBody>
          </Card>

          {/* Authorities */}
          <Card
            className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50"
            shadow="none"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary border border-secondary/20">
                  <Key size={18} />
                </div>
                <h3 className="font-bold">Authority Keys</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {(["owner", "active", "posting"] as const).map((authType) => {
                const auth = account[authType] as {
                  weight_threshold: number;
                  key_auths: [string, number][];
                  account_auths: [string, number][];
                };
                return (
                  <div
                    key={authType}
                    className="space-y-1 border-b border-default-200/30 dark:border-default-100/30 last:border-none pb-2 last:pb-0"
                  >
                    <div className="flex items-center gap-2">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          authType === "owner"
                            ? "danger"
                            : authType === "active"
                              ? "success"
                              : "warning"
                        }
                        classNames={{
                          content: "text-[10px] font-bold uppercase",
                        }}
                      >
                        {authType}
                      </Chip>
                      <span className="text-[10px] text-default-400">
                        threshold: {auth?.weight_threshold}
                      </span>
                    </div>
                    {auth?.key_auths?.map(([key], i) => (
                      <div key={i} className="flex items-center gap-2 pl-2">
                        <p className="text-xs font-mono text-default-500 dark:text-default-400 truncate">
                          {key}
                        </p>
                        <CopyButton text={key} size={12} />
                      </div>
                    ))}
                    {auth?.account_auths?.length > 0 && (
                      <div className="pl-2 flex flex-wrap gap-1 mt-1">
                        {auth.account_auths.map(([acc, weight], i) => (
                          <Chip
                            key={i}
                            size="sm"
                            variant="flat"
                            classNames={{
                              base: "bg-default/10",
                              content: "text-[10px]",
                            }}
                          >
                            @{acc} (w:{weight})
                          </Chip>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="space-y-1">
                <Chip
                  size="sm"
                  variant="flat"
                  classNames={{
                    base: "bg-default/20",
                    content: "text-[10px] font-bold uppercase",
                  }}
                >
                  Memo
                </Chip>
                <div className="flex items-center gap-2 pl-2">
                  <p className="text-xs font-mono text-default-500 dark:text-default-400 truncate">
                    {account.memo_key}
                  </p>
                  <CopyButton text={account.memo_key} size={12} />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Witness Votes */}
          {account.witness_votes && account.witness_votes.length > 0 && (
            <Card
              className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50"
              shadow="none"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Chip size="sm" color="primary" variant="flat">
                    {account.witness_votes.length}
                  </Chip>
                  <h3 className="font-bold">Witness Votes</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  {account.witness_votes.sort().map((w) => (
                    <Link key={w} href={`/@${w}`}>
                      <Chip
                        size="sm"
                        variant="flat"
                        classNames={{
                          base: "cursor-pointer hover:bg-primary/20 transition-colors border border-default-200/50 dark:border-default-100/50",
                          content: "text-xs font-semibold",
                        }}
                      >
                        @{w}
                      </Chip>
                    </Link>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* JSON Metadata */}
          {(() => {
            try {
              const meta = JSON.parse(
                account.posting_json_metadata || account.json_metadata || "{}",
              );
              if (Object.keys(meta).length === 0) return null;
              return (
                <Card
                  className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50"
                  shadow="none"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-default/10 text-default-500 border border-default/20">
                        <Layers size={18} />
                      </div>
                      <h3 className="font-bold">Profile Metadata</h3>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <pre className="text-xs text-default-500 dark:text-default-400 overflow-x-auto whitespace-pre-wrap break-all bg-default-100/50 dark:bg-default-50/50 rounded-lg p-3 max-h-64 overflow-y-auto scrollbar-hide">
                      {JSON.stringify(meta, null, 2)}
                    </pre>
                  </CardBody>
                </Card>
              );
            } catch {
              return null;
            }
          })()}
        </motion.div>
      )}
    </div>
  );
}

function BalanceCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div
      className={`p-3 rounded-xl ${bg} border border-default-200/30 dark:border-default-100/30 flex items-center gap-3`}
    >
      <Icon size={16} className={color} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-default-500 dark:text-default-400 uppercase tracking-wider font-semibold mb-0.5">
          {label}
        </p>
        <p className={`text-sm font-bold font-mono ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-default-50/80 dark:bg-default-50/30 border border-default-200/20 dark:border-default-100/20">
      <span className="text-[10px] text-default-500 dark:text-default-400 uppercase tracking-wider font-semibold">
        {label}
      </span>
      <span className="text-sm font-mono truncate text-foreground">
        {value}
      </span>
    </div>
  );
}
