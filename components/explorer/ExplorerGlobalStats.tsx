"use client";

import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import {
  Activity,
  Box,
  Clock,
  Coins,
  Database,
  DollarSign,
  Layers,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useGlobalProps } from "./useExplorerData";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  delay?: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <Card
        className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50 hover:border-primary/30 dark:hover:border-default-200 transition-all duration-300 group hover:shadow-lg dark:hover:shadow-none"
        shadow="none"
      >
        <CardBody className="flex flex-row items-center gap-3 p-4">
          <div
            className={`p-2.5 rounded-xl ${bgColor} shrink-0 group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon size={20} className={color} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-default-500 dark:text-default-400 uppercase tracking-wider font-semibold">
              {label}
            </p>
            <p className="text-base font-bold font-mono truncate text-foreground">
              {value}
            </p>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

export default function ExplorerGlobalStats() {
  const { data, isLoading } = useGlobalProps();

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  const { globals, rewardFund, medianPrice } = data;

  const parseAmount = (s: string) => parseFloat(s.split(" ")[0]);
  const formatNum = (n: number) =>
    n >= 1_000_000
      ? (n / 1_000_000).toFixed(2) + "M"
      : n >= 1_000
        ? (n / 1_000).toFixed(1) + "K"
        : n.toLocaleString();

  const totalVestingFund = parseAmount(globals.total_vesting_fund_steem);
  const currentSupply = parseAmount(globals.current_supply);
  const currentSbdSupply = parseAmount(globals.current_sbd_supply);
  const virtualSupply = parseAmount(globals.virtual_supply);
  const rewardBalance = parseAmount(rewardFund.reward_balance);

  const sbdPrice = (
    parseAmount(medianPrice.base) / parseAmount(medianPrice.quote)
  ).toFixed(3);

  const stats: StatCardProps[] = [
    {
      label: "Head Block",
      value: `#${globals.head_block_number.toLocaleString()}`,
      icon: Box,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Irreversible Block",
      value: `#${globals.last_irreversible_block_num.toLocaleString()}`,
      icon: ShieldCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Current Witness",
      value: globals.current_witness,
      icon: Users,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Block Time",
      value: new Date(globals.time + "Z").toLocaleTimeString(),
      icon: Clock,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "STEEM Supply",
      value: formatNum(currentSupply) + " STEEM",
      icon: Coins,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
    },
    {
      label: "SBD Supply",
      value: formatNum(currentSbdSupply) + " SBD",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Virtual Supply",
      value: formatNum(virtualSupply) + " STEEM",
      icon: Layers,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      label: "Vesting Fund",
      value: formatNum(totalVestingFund) + " STEEM",
      icon: Database,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
    },
    {
      label: "Reward Pool",
      value: formatNum(rewardBalance) + " STEEM",
      icon: Zap,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "SBD/STEEM Price",
      value: `$${sbdPrice}`,
      icon: TrendingUp,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
    {
      label: "SBD Print Rate",
      value: (globals.sbd_print_rate / 100).toFixed(0) + "%",
      icon: Activity,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      label: "Participation",
      value: ((globals.participation_count * 100) / 128).toFixed(1) + "%",
      icon: TrendingUp,
      color: "text-lime-500",
      bgColor: "bg-lime-500/10",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Chip
          size="sm"
          variant="dot"
          color="success"
          classNames={{
            base: "border-success/20",
            content: "text-xs font-semibold",
          }}
        >
          Live
        </Chip>
        <span className="text-xs text-default-500 dark:text-default-400">
          Auto-refreshes every 3s
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i * 0.05} />
        ))}
      </div>
    </div>
  );
}
