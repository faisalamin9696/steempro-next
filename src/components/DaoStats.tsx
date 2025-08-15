import { getAccountExt } from "@/libs/steem/sds";
import parseAsset from "@/utils/helper/parse-asset";
import { Card, CardBody } from "@heroui/card";
import useSWR from "swr";
import { twMerge } from "tailwind-merge";
import { getProposalStatus, isProposalFunded } from "./ProposalItemCard";
import { useTranslation } from "@/utils/i18n";

const FundindCard = ({
  title,
  description,
  valueClassName,
  value,
}: {
  title?: string;
  description: string;
  valueClassName?: string;
  value: string;
}) => {
  return (
    <Card className="border border-gray-200/20 shadow-sm">
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">
              {title}
            </p>
            <p
              className={twMerge(
                "text-lg sm:text-2xl font-bold",
                valueClassName
              )}
            >
              {value}
            </p>
          </div>
        </div>
        <p className="text-xs text-default-500 mt-1">{description}</p>
      </CardBody>
    </Card>
  );
};

export const DaoStats = ({ proposals }: { proposals?: Proposal[] }) => {
  const { t } = useTranslation();
  const { data: accountData } = useSWR<AccountExt>("proposal-fund", () =>
    getAccountExt("steem.dao")
  );

  if (!accountData || !proposals) return null;

  const fundedProposals = proposals.filter(
    (p) =>
      isProposalFunded(
        p,
        proposals.find((p) => p.proposal_id === 0)
      ) && p.proposal_id !== 0
  );

  const activeProposals = proposals.filter(
    (p) => getProposalStatus(p.start_date, p.end_date) === "active"
  );

  const totalBudget = accountData?.balance_sbd;
  const dailyBudget = totalBudget / 100;
  let _thresholdProposalId: number | null = null;
  const dailyFunded = proposals?.reduce((a, b) => {
    const dp = parseAsset(b.daily_pay);
    const _sum_amount = a + Number(dp.amount);
    if (_sum_amount >= dailyBudget && !_thresholdProposalId) {
      _thresholdProposalId = b.id;
    }
    return _sum_amount <= dailyBudget ? _sum_amount : a;
  }, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <FundindCard
        title={t("proposals.stats.total_proposals")}
        value={proposals?.length?.toLocaleString()}
        description={`${
          fundedProposals?.length > 0 && `${t("proposals.stats.funded")} (${fundedProposals?.length}) •`
        } ${
          activeProposals?.length > 0 &&
          `${t("proposals.stats.active")} (${activeProposals?.length})`
        }`}
        valueClassName=" text-steem"
      />

      <FundindCard
        value={dailyFunded?.toLocaleString() + " SBD"}
        title={t("proposals.stats.daily_funded")}
        description=""
        valueClassName="text-success"
      />
      <FundindCard
        value={dailyBudget?.toLocaleString() + " SBD"}
        title={t("proposals.stats.daily_budget")}
        description=""
      />
      <FundindCard
        value={totalBudget?.toLocaleString() + " SBD"}
        title={t("proposals.stats.total_budget")}
        description=""
      />
    </div>
  );
};
