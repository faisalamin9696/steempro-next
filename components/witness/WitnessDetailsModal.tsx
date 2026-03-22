import {
  CheckCircle,
  XCircle,
  ExternalLink,
  CopyIcon,
  Users,
  Wallet,
  Info,
} from "lucide-react";
import { formatVotes } from "@/hooks/useWitnesses";
import { toast } from "sonner";
import SModal from "../ui/SModal";
import SAvatar from "../ui/SAvatar";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Tabs, Tab } from "@heroui/tabs";
import moment from "moment";
import { useState, useMemo } from "react";
import useSWR from "swr";
import { sdsApi } from "@/libs/sds";
import { ColumnDef, DataTable } from "../ui/data-table";
import LoadingStatus from "../LoadingStatus";
import SUsername from "../ui/SUsername";
import { useSteemUtils } from "@/hooks/useSteemUtils";
import { twMerge } from "tailwind-merge";
import { useTranslations } from "next-intl";

interface WitnessDetailsModalProps {
  witness: Witness | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const WitnessDetailsModal = ({
  witness,
  isOpen,
  onOpenChange,
}: WitnessDetailsModalProps) => {
  const t = useTranslations("Witnesses");
  const [activeTab, setActiveTab] = useState<string>("info");
  const { vestsToSteem } = useSteemUtils();

  const { data: votesData, isLoading: isVotesLoading } = useSWR(
    witness?.name && isOpen ? `witness-votes-${witness?.name}` : null,
    () => sdsApi.getWitnessVotes(witness?.name!),
  );

  if (!witness) return null;

  const isActive =
    witness.signing_key !== "STM1111111111111111111111111111111114T1Anm";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("details.copied", { label }));
  };

  const formatSP = (vests: number) => {
    const sp = vestsToSteem(vests);
    return sp.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
  };

  const totals = useMemo(() => {
    if (!votesData) return { own: 0, proxied: 0, total: 0 };
    return votesData.reduce(
      (acc, curr) => {
        acc.own += curr.vests_own;
        acc.proxied += curr.vests_proxied;
        acc.total += curr.vests_own + curr.vests_proxied;
        return acc;
      },
      { own: 0, proxied: 0, total: 0 },
    );
  }, [votesData]);

  const columns: ColumnDef<WitnessVote>[] = [
    {
      key: "account",
      header: t("details.voter"),
      searchable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          {/* <SAvatar size="sm" username={value} /> */}
          <SUsername className="font-medium text-sm" username={`@${value}`} />
        </div>
      ),
    },
    {
      key: "vests_own",
      header: t("details.ownSp"),
      sortable: true,
      render: (value) => (
        <span className="font-mono text-xs">{formatSP(value)}</span>
      ),
    },
    {
      key: "vests_proxied",
      header: t("details.proxiedSp"),
      sortable: true,
      render: (value) => (
        <span className="font-mono text-xs">{formatSP(value)}</span>
      ),
    },
  ];

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-muted/10 rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3 text-primary">{title}</h3>
      {children}
    </div>
  );

  const DetailRow = ({
    label,
    value,
    copyable = false,
    className,
  }: {
    label: string;
    value: string | number | null | undefined;
    copyable?: boolean;
    className?: string;
  }) => {
    const display = value ?? "N/A";

    return (
      <div className="flex flex-col gap-1 py-2 border-b border-border last:border-0">
        <span className="text-xs text-muted">{label}</span>

        <div className="flex items-center gap-2 min-w-0">
          <span
            className={twMerge(
              "font-mono text-sm truncate break-all min-w-0",
              className,
            )}
          >
            {display}
          </span>

          {copyable && (
            <button
              onClick={() => copyToClipboard(String(display), label)}
              className="text-muted hover:text-primary transition-colors"
            >
              <CopyIcon size={14} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      title={() => (
        <div className="flex items-center gap-3">
          <SAvatar username={witness.name} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span>@{witness.name}</span>
              {isActive ? (
                <Chip
                  size="sm"
                  variant="bordered"
                  className="text-green-500 border-green-500/30"
                  classNames={{
                    content: "flex flex-row gap-1 items-center px-1",
                  }}
                >
                  <CheckCircle className="mr-1" size={14} /> {t("details.active")}
                </Chip>
              ) : (
                <Chip
                  variant="bordered"
                  size="sm"
                  className="text-warning border-warning/30"
                  classNames={{
                    content: "flex flex-row gap-1 items-center px-1",
                  }}
                >
                  <XCircle className="mr-1" size={14} /> {t("details.disabled")}
                </Chip>
              )}
            </div>
            <span className="text-sm text-muted">{t("details.rank")} #{witness.rank}</span>
          </div>
        </div>
      )}
    >
      {() => (
        <div className="flex flex-col h-full">
          <Tabs
            aria-label="Witness Details Tabs"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            color="primary"
            classNames={{
              panel: "px-0",
            }}
          >
            <Tab
              key="info"
              title={
                <div className="flex items-center gap-2">
                  <Info size={16} />
                  <span>{t("details.information")}</span>
                </div>
              }
            >
              <div className="space-y-4 pb-4">
                <Section title={t("details.basicInfo")}>
                  <DetailRow label={t("details.owner")} value={witness.name} copyable />
                  <DetailRow label={t("details.rank")} value={witness.rank} />
                  <div className="flex items-center justify-between border-b border-border py-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted">{t("details.votes")}</span>
                      <span className="font-mono text-sm">
                        {formatVotes(witness.received_votes.toString())} VESTS
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => setActiveTab("voters")}
                      startContent={<Users size={16} />}
                    >
                      {t("details.viewVoters")}
                    </Button>
                  </div>
                  <DetailRow
                    label={t("details.totalMissedBlocks")}
                    value={witness.missed_blocks.toLocaleString()}
                  />
                  <DetailRow
                    label={t("details.lastConfirmedBlock")}
                    value={`#${witness.last_confirmed_block.toLocaleString()}`}
                  />
                  <DetailRow
                    label={t("details.runningVersion")}
                    value={witness.running_version}
                  />

                  <DetailRow label={t("details.url")} value={witness.url} />
                  <a
                    href={witness.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    <ExternalLink size={14} />
                    {t("details.visitWebsite")}
                  </a>
                </Section>

                <Section title={t("details.signingKey")}>
                  <DetailRow
                    label={t("details.signingKey")}
                    value={witness.signing_key}
                    copyable
                  />
                </Section>

                <Section title={t("details.witnessProperties")}>
                  <DetailRow
                    label={t("details.accountCreationFee")}
                    value={witness.props?.account_creation_fee || "N/A"}
                  />
                  <DetailRow
                    label={t("details.maximumBlockSize")}
                    value={
                      witness.props?.maximum_block_size?.toLocaleString() ||
                      "N/A"
                    }
                  />
                  <DetailRow
                    label={t("details.sbdInterestRate")}
                    value={
                      witness.props?.sbd_interest_rate !== undefined
                        ? `${(witness.props.sbd_interest_rate / 100).toFixed(
                            2,
                          )}%`
                        : "N/A"
                    }
                  />
                </Section>

                <Section title={t("details.sbdExchangeRate")}>
                  <DetailRow label={t("details.base")} value={witness.reported_price.base} />
                  <DetailRow
                    label={t("details.quote")}
                    value={witness.reported_price.quote}
                  />
                  <DetailRow
                    label={t("details.lastUpdate")}
                    value={moment.unix(witness.last_price_report).fromNow()}
                    className={
                      moment
                        .unix(witness.last_price_report)
                        .isBefore(moment().subtract(2, "hours"))
                        ? "text-warning"
                        : ""
                    }
                  />
                </Section>

                <Section title={t("details.additionalDetails")}>
                  <DetailRow
                    label={t("details.created")}
                    value={moment.unix(witness.created).toLocaleString()}
                  />
                  <DetailRow
                    label={t("details.lastWork")}
                    value={moment.unix(witness.last_sync).toLocaleString()}
                  />

                  {witness.hardfork_time_vote && (
                    <DetailRow
                      label={t("details.hardforkTimeVote")}
                      value={moment
                        .unix(witness.hardfork_time_vote)
                        .toLocaleString()}
                    />
                  )}
                </Section>
              </div>
            </Tab>

            <Tab
              key="voters"
              title={
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>{t("details.voters")}</span>
                </div>
              }
            >
              {isVotesLoading ? (
                <div className="h-60 flex items-center justify-center">
                  <LoadingStatus />
                </div>
              ) : (
                <div className="flex flex-col gap-6 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-content2/50 p-3 rounded-xl flex items-center gap-2 border border-divider">
                      <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <Users size={24} />
                      </div>
                      <div>
                        <p className="text-xs text-muted font-medium">
                          {t("details.totalVoters")}
                        </p>
                        <p className="text-lg font-bold">
                          {votesData?.length.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>

                    <div className="bg-content2/50 p-3 rounded-xl flex items-center gap-2 border border-divider">
                      <div className="p-3 bg-success/10 rounded-xl text-success">
                        <Wallet size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted font-medium">
                          {t("details.totalSupport")}
                        </p>
                        <p className="text-lg font-bold">
                          {formatSP(totals.total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <DataTable
                    data={votesData || []}
                    columns={columns}
                    className="rounded-xl overflow-hidden"
                    emptyMessage={t("details.noVotes")}
                  />
                </div>
              )}
            </Tab>
          </Tabs>
        </div>
      )}
    </SModal>
  );
};

export default WitnessDetailsModal;
