import {
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  DollarSign,
  Gift,
  ExternalLink,
  Filter,
} from "lucide-react";
import { ColumnDef, DataTable } from "../ui/data-table";
import SCard from "../ui/SCard";
import OperationItem from "./OperationItem";
import moment from "moment";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Select, SelectItem } from "@heroui/react";
import useSWR from "swr";
import { sdsApi } from "@/libs/sds";
import LoadingStatus from "../LoadingStatus";

interface WalletHistoryProps {
  username: string;
}

const typeConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  transfer: {
    icon: <ArrowUpRight className="h-4 w-4 text-danger shrink-0" />,
    label: "transfer",
  },
  receive: {
    icon: <ArrowDownLeft className="h-4 w-4 text-success shrink-0" />,
    label: "receive",
  },
  transfer_to_vesting: {
    icon: <Zap className="h-4 w-4 text-secondary shrink-0" />,
    label: "powerup",
  },
  withdraw_vesting: {
    icon: <ArrowDownLeft className="h-4 w-4 text-warning shrink-0" />,
    label: "powerdown",
  },
  fill_vesting_withdraw: {
    icon: <DollarSign className="h-4 w-4 text-primary shrink-0" />,
    label: "fill",
  },
  claim_reward_balance: {
    icon: <Gift className="h-4 w-4 text-success shrink-0" />,
    label: "claim",
  },
} as any;

export const WalletHistory = ({ username }: WalletHistoryProps) => {
  const [typeFilter, setTypeFilter] = useState<"all">("all");

  const { data, isLoading } = useSWR(
    username ? `account-hostory-${username}-${typeFilter}` : null,
    () => sdsApi.getAccountHistory(username, typeFilter)
  );

  const filteredHistory = useMemo(() => {
    if (!data || data.length === 0) return [];
    let result = [...data].reverse();
    // if (typeFilter !== "all") {
    //   result = result.filter((n) => n.op[0] === typeFilter);
    // }
    return result;
  }, [data, typeFilter]);

  const getConfig = useCallback((type: string) => {
    switch (type) {
      case "transfer":
        return typeConfig.transfer;
      case "receive":
        return typeConfig.receive;
      case "transfer_to_vesting":
        return typeConfig.transfer_to_vesting;
      case "withdraw_vesting":
        return typeConfig.withdraw_vesting;
      case "fill_vesting_withdraw":
        return typeConfig.fill_vesting_withdraw;
      case "claim_reward_balance":
        return typeConfig.claim_reward_balance;
      default:
        return {
          icon: <History className="h-4 w-4" />,
          label: type,
        };
    }
  }, []);

  const columns: ColumnDef<AccountHistory>[] = [
    {
      key: "type",
      header: "Type",
      render(value, row) {
        return (
          <div className="flex flex-col items-start gap-2">
            <div className="flex flex-row gap-2 items-center">
              {getConfig(row.op[0]).icon}
              <span>{getConfig(row.op[0]).label}</span>
            </div>
            <Link
              target="_blank"
              href={`https://steemworld.org/block/${row.block_num}/${
                row.virtual
                  ? `virtual/${row.op_index}`
                  : `${row.block_num}-${row.trans_index}`
              }`}
              className="text-xs transition-colors font-mono flex items-center space-x-1 bg-default/50 px-2 py-1 rounded"
            >
              <span>#{row.block_num}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        );
      },
    },
    {
      key: "description",
      header: "Description",
      searchable: true,
      className: "font-mono w-full",
      render(value, row) {
        return <OperationItem key={row.id} operation={row} />;
      },
    },

    {
      key: "time",
      header: "Since",
      className: "text-muted",
      sortable: true,
      render(value) {
        return (
          <p title={moment.unix(value).toLocaleString()}>
            {moment.unix(value).fromNow(true)}
          </p>
        );
      },
    },
    {
      key: "memo",
      header: "Memo",
      className: "text-muted",
      render(value, row) {
        return row.op[1]?.memo || "-";
      },
    },
  ];

  if (isLoading) {
    return <LoadingStatus />;
  }
  return (
    <SCard
      icon={History}
      title="Transaction History"
      iconClass="p-2 rounded-lg bg-primary/10 border border-primary/20"
      titleClass="font-semibold"
      classNames={{ body: "gap-4" }}
      className="card"
      iconSize="sm"
      description="Account transaction history"
    >
      {/* FILTERS */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted" />
          Filter
        </div>

        <div className="flex flex-wrap gap-2 self-end">
          {/* TYPE FILTER */}
          <Select
            className="w-[140px]"
            selectedKeys={[typeFilter]}
            onSelectionChange={(keys) => setTypeFilter([...keys][0] as "all")}
            selectionMode="single"
            disallowEmptySelection
            defaultSelectedKeys={["all"]}
            variant="faded"
            classNames={{
              popoverContent: "w-fit",
            }}
          >
            <SelectItem key="all">All types</SelectItem>
            {
              Object.entries(typeConfig).map(([type, config]) => (
                <SelectItem key={type} textValue={config.label}>
                  <div className="flex items-center gap-2 ">
                    {config.icon}
                    <span>{config.label}</span>
                  </div>
                </SelectItem>
              )) as any
            }
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredHistory ?? []}
        searchPlaceholder="Search transactions..."
        filterByValue={[
          "block_num",
          "op.[1].['from']",
          "op.[1].['to']",
          "op.[1].['memo']",
        ]}
      />
    </SCard>
  );
};
