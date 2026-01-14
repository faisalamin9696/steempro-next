import { DelegationModal } from "./DelegationModal";
import { Button, Chip, Select, SelectItem } from "@heroui/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  History,
  Trash2,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { ColumnDef, DataTable } from "../ui/data-table";
import { useSteemUtils } from "@/hooks/useSteemUtils";
import moment from "moment";
import SUsername from "../ui/SUsername";
import SCard from "../ui/SCard";
import { useAppDispatch } from "@/hooks/redux/store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { addLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { addProfileHandler } from "@/hooks/redux/reducers/ProfileReducer";
import LoadingStatus from "../LoadingStatus";
import useSWR from "swr";
import { sdsApi } from "@/libs/sds";
import SAvatar from "../ui/SAvatar";

interface DelegationsProps {
  account: AccountExt;
}

type DelegationType = "outgoing" | "incoming" | "expiring" | "all";

const typeConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  outgoing: {
    icon: <ArrowUpRight className="h-4 w-4 text-danger" />,
    label: "outgoing",
  },
  incoming: {
    icon: <ArrowDownLeft className="h-4 w-4 text-success" />,
    label: "incoming",
  },
  expiring: {
    icon: <History className="h-4 w-4 text-warning" />,
    label: "expiring",
  },
} as any;

export const Delegations = ({ account }: DelegationsProps) => {
  const { data: session } = useSession();
  const { vestsToSteem } = useSteemUtils();
  const [typeFilter, setTypeFilter] = useState<DelegationType>("all");
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const isSelf = session?.user?.name === account.name;
  const [isDelegationModalOpen, setIsDelegationModalOpen] = useState(false);
  const [modalData, setModalData] = useState<
    | {
        delegatee: string;
        amount: string;
      }
    | undefined
  >(undefined);

  const { data, isLoading, error } = useSWR(
    account.name ? `delegations-${account.name}-${typeFilter}` : null,
    () => sdsApi.getDelegations(account.name, typeFilter)
  );

  useEffect(() => {
    if (data) {
      setDelegations(data?.sort((a, b) => b.time - a.time));
    }
  }, [data]);

  useEffect(() => {
    dispatch(
      isSelf
        ? addLoginHandler({
            ...account,
            incoming_delegations:
              delegations?.filter((d) => d.status === "incoming") ?? [],
            outgoing_delegations:
              delegations?.filter((d) => d.status === "outgoing") ?? [],
            expiring_delegations:
              delegations?.filter((d) => d.status === "expiring") ?? [],
          })
        : addProfileHandler({
            ...account,
            incoming_delegations:
              delegations?.filter((d) => d.status === "incoming") ?? [],
            outgoing_delegations:
              delegations?.filter((d) => d.status === "outgoing") ?? [],
            expiring_delegations:
              delegations?.filter((d) => d.status === "expiring") ?? [],
          })
    );
  }, [delegations, isSelf]);

  const dispatch = useAppDispatch();

  const filteredDelegations = useMemo(() => {
    if (!delegations || delegations?.length === 0) return [];
    let result = delegations;
    if (typeFilter !== "all") {
      result = result.filter((n) => n.status.toString() === typeFilter);
    }
    return result;
  }, [delegations, typeFilter]);

  const getConfig = useCallback((type: string) => {
    switch (type) {
      case "incoming":
        return typeConfig.incoming;
      case "outgoing":
        return typeConfig.outgoing;
      case "expiring":
        return typeConfig.expiring;
      default:
        return {
          icon: <History className="h-4 w-4" />,
          label: type,
        };
    }
  }, []);

  if (isLoading || !account) {
    return <LoadingStatus />;
  }

  const columns: ColumnDef<Delegation>[] = [
    {
      key: "from",
      header: "Username",
      sortable: true,
      searchable: true,
      className: "font-mono",
      render: (value, row) => {
        const username = row.status === "incoming" ? row.from : row.to;
        return (
          <div className="flex items-center gap-2">
            <SAvatar size={36} username={username} />
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-2">
                <SUsername
                  className="font-semibold text-sm"
                  username={`@${username}`}
                />
                <Chip size="sm" variant="flat">
                  <div className="flex flex-row gap-2 items-center">
                    {getConfig(row.status).icon}
                    <span>{getConfig(row.status).label}</span>
                  </div>
                </Chip>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "vests",
      header: "Amount",
      sortable: true,
      render: (value, row) => {
        const amount = vestsToSteem(row.vests);
        return `${amount.toLocaleString()} STEEM`;
      },
    },

    {
      key: "time",
      header: "Since",
      sortable: true,
      className: "text-muted",
      render: (value, row) => {
        const date = moment.unix(
          row.status === "expiring" ? row?.expiration ?? 0 : row.time
        );
        return date.fromNow(true);
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (value, row) => {
        const canEdit =
          row["status"] === "outgoing" && row.from === session?.user?.name;
        return canEdit ? (
          <div className="flex items-center gap-2">
            <Button
              variant="light"
              color="primary"
              size="sm"
              isIconOnly
              onPress={() => {
                setModalData({
                  delegatee: row.to,
                  amount: vestsToSteem(row.vests).toFixed(3),
                });
                setIsDelegationModalOpen(true);
              }}
            >
              <Users size={18} />
            </Button>
            <Button
              variant="light"
              color="danger"
              size="sm"
              isIconOnly
              onPress={() => {
                setModalData({
                  delegatee: row.to,
                  amount: "0",
                });
                setIsDelegationModalOpen(true);
              }}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        ) : (
          <p className="text-muted text-center">-</p>
        );
      },
    },
  ];

  return (
    <SCard
      title={`Delegations (${delegations?.length})`}
      icon={Users}
      iconClass="p-2 rounded-lg bg-primary/10 border border-primary/20"
      titleClass="font-semibold"
      classNames={{ body: "gap-4" }}
      className="card"
      iconSize="sm"
      description="Delegations incoming, outgoing and expiring"
    >
      {/* FILTERS */}
      <div className="flex flex-col xs:flex-row 1xs:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted" />
          Filter
        </div>

        <div className="flex flex-wrap gap-2 self-end">
          {/* TYPE FILTER */}
          <Select
            className="w-[120px]"
            selectedKeys={[typeFilter]}
            onSelectionChange={(keys) => setTypeFilter([...keys][0] as any)}
            selectionMode="single"
            disallowEmptySelection
            defaultSelectedKeys={["all"]}
            variant="faded"
          >
            <SelectItem key="all">All types</SelectItem>
            {
              Object.entries(typeConfig).map(([type, config]) => (
                <SelectItem key={type} textValue={config.label}>
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <span>{config.label}</span>
                  </div>
                </SelectItem>
              )) as any
            }
          </Select>
        </div>
      </div>

      {error && (
        <div className="text-center py-12 text-danger">
          <p>{error}</p>
        </div>
      )}

      <DataTable
        data={filteredDelegations ?? []}
        columns={columns}
        filterByValue={["from", "to", "status"]}
        searchPlaceholder="Search username..."
        initialLoadCount={50}
        loadMoreCount={50}
      />

      <DelegationModal
        isOpen={isDelegationModalOpen}
        onOpenChange={setIsDelegationModalOpen}
        outgoingDelegations={
          delegations?.filter((d) => d.status === "outgoing") ?? []
        }
        initialData={modalData}
      />
    </SCard>
  );
};
