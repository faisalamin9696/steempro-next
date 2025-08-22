import SAvatar from "@/components/ui/SAvatar";
import WitnessVoteButton from "@/components/WitnessVoteButton";
import WitnessVotersModal from "@/components/WitnessVotersModal";
import { validate_account_name } from "@/utils/chainValidation";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaCode } from "react-icons/fa";
import { FiAlertCircle, FiExternalLink } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { WitnessDataProps } from "../page";
import ErrorCard from "@/components/ErrorCard";
import SLink from "@/components/ui/SLink";
import STable from "@/components/ui/STable";
import { RiUserStarFill } from "react-icons/ri";
import WitnessItemCard from "@/components/WitnessItemCard";
import { SiTraefikproxy } from "react-icons/si";
import { getTimeFromNow } from "@/utils/helper/time";
import moment from "moment";

interface Props {
  data: WitnessDataProps;
  handleManageProxy: () => void;
}

function WitnessListTab(props: Props) {
  const { handleManageProxy } = props;
  const {
    witnesses: witnessList,
    userData,
    isLoading,
    error,
    userVoteCount,
  } = props.data;

  const [witnesses, setWitnesses] = useState(witnessList);

  let [witnessRef, setWitnessRef] = useState("");

  useEffect(() => {
    if (witnesses) {
      const hashRef = window.location.hash.replace("#", "");
      const witnessRef = !validate_account_name(hashRef) ? hashRef : "";
      setWitnessRef(witnessRef);

      if (witnessRef) {
        const index = witnessList?.findIndex(
          (account) => account.name === witnessRef
        );
        if (index && index !== -1) {
          const targetWitness = witnessList?.splice(index, 1)[0];
          if (targetWitness) witnessList?.unshift(targetWitness);
        }
      }
      setWitnesses(witnessList);
    }
  }, [witnessList]);

  const [filterVotes, setFilterVotes] = useState(false);

  const [witnessVoteModal, setWitnessVoteModal] = useState<{
    isOpen: boolean;
    witness?: { name: string; received_votes: number; votes: string };
  }>({ isOpen: false });

  const currentProxy = userData?.proxy || "";
  const filteredWitnesses = filterVotes
    ? witnessList.filter((w) => w.voted)
    : witnessList;

  if (error) {
    return <ErrorCard message={error?.message} />;
  }

  return (
    <>
      <STable
        filterByValue={["name", "signing_key"]}
        data={filteredWitnesses ?? witnessList}
        itemsPerPage={25}
        title={"Top Witnesses (100)"}
        titleIcon={RiUserStarFill}
        subTitle={() =>
          "Vote for up to 30 witnesses to secure the Steem blockchain"
        }
        titleExtra={
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-row gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Switch
                  size="sm"
                  id="filter-votes"
                  isSelected={filterVotes}
                  onValueChange={setFilterVotes}
                >
                  <p className="text-sm">Show only my votes</p>
                </Switch>
              </div>
              <div className="text-sm text-default-500">
                {userData?.name
                  ? `Voted: ${userVoteCount}/30`
                  : "Login to see your votes"}
              </div>
            </div>

            {currentProxy && (
              <div className="flex flex-row items-center justify-between bg-orange-100 border border-orange-200 p-3 rounded-lg">
                <div className="flex flex-row items-center gap-2 text-orange-700">
                  <FiAlertCircle className="w-4 h-4" />
                  <div className="flex flex-row gap-2 items-center text-sm font-medium">
                    <p>Proxy Active:</p>
                    <SAvatar
                      size="xs"
                      username={currentProxy}
                      content={`@${currentProxy}`}
                      linkClassName="flex-row-reverse"
                    />
                  </div>
                </div>

                <Button
                  onPress={handleManageProxy}
                  variant="bordered"
                  size="sm"
                  radius="sm"
                  isDisabled={false}
                  className="border-orange-300 text-orange-600 hover:bg-orange-200"
                >
                  <SiTraefikproxy size={12} />
                  Manage
                </Button>
              </div>
            )}
          </div>
        }
        isLoading={isLoading}
        placeholder={
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="border border-default-900/10 rounded-lg p-3 sm:p-4 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="h-4 bg-default-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-default-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-16 bg-default-200 rounded"></div>
                    <div className="h-8 w-12 bg-default-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
        bodyClassName="flex flex-col gap-8 mt-6"
        tableRow={(witness: MergedWitness) => {
          return (
            <WitnessItem
              witness={witness}
              currentProxy={currentProxy}
              witnessRef={witnessRef}
            />
          );
        }}
      />

      {witnessVoteModal.isOpen && witnessVoteModal.witness && (
        <WitnessVotersModal
          witness={{
            name: witnessVoteModal.witness.name,
            received_votes: witnessVoteModal.witness.received_votes,
            votes: witnessVoteModal.witness.votes,
          }}
          isOpen={witnessVoteModal.isOpen}
          onOpenChange={(open) => setWitnessVoteModal({ isOpen: open })}
        />
      )}
    </>
  );
}

const formatPreviewValue = (key: string, value: any): string => {
  if (value === null || value === undefined) {
    return "N/A";
  }

  // Handle exchange_rate object specifically
  if (key === "reported_price" && typeof value === "object") {
    const base = value.base || "N/A";
    const quote = value.quote || "N/A";
    return `${base} / ${quote}`;
  }

  // Handle other objects
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

export default WitnessListTab;

const WitnessItem = ({
  witness,
  witnessRef,
  currentProxy,
}: {
  witness: MergedWitness;
  witnessRef?: string;
  currentProxy?: string;
}) => {
  const imporantFields = {
    rank: witness.rank,
    created: `${new Date(
      witness.created * 1000
    ).toLocaleString()} (${getTimeFromNow(witness.created * 1000)})`,
    produced_blocks: witness.produced_blocks,
    last_confirmed_block: witness.last_confirmed_block,
    last_sync: new Date(witness.last_sync * 1000).toLocaleString(),
    account_creation_fee: witness.props.account_creation_fee,
    maximum_block_size: witness.props.maximum_block_size,
    sbd_interest_rate: witness.props.sbd_interest_rate,
    signing_key: witness.signing_key,
    version: witness.version,
    url: witness.url,
    reported_price: witness.reported_price,
    last_price_report: `${new Date(
      witness.last_price_report * 1000
    ).toLocaleString()} (${getTimeFromNow(witness.last_price_report * 1000)})`,
  };

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      key={witness.name}
      className={twMerge(
        witness.isDisabled ? "opacity-60" : "",
        witness.name === witnessRef
          ? "bg-green-600/20  animate-appearance-in"
          : ""
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <WitnessItemCard
            witness={witness}
            endContent={
              <span>
                <Button
                  variant="flat"
                  size="sm"
                  onPress={() => setIsExpanded(!isExpanded)}
                  className="flex items-center space-x-1 text-default-500"
                  isIconOnly
                >
                  {isExpanded ? <FaChevronDown /> : <FaCode size={16} />}
                </Button>
              </span>
            }
          />
        </div>
        <div className="flex gap-0 w-full sm:w-auto sm:justify-normal justify-end">
          <WitnessVoteButton
            className="rounded-s-md"
            isVoted={witness.voted}
            witness={witness.name}
            isDisabled={!!currentProxy}
          />

          <Button
            as={SLink}
            size="sm"
            target="_blank"
            href={witness.url ?? `/@${witness.name}`}
            variant="flat"
            className="px-2 sm:px-3 rounded-s-none"
          >
            <FiExternalLink size={14} />
            Info
          </Button>
        </div>
      </div>

      {isExpanded &&
        imporantFields &&
        typeof imporantFields === "object" &&
        Object.keys(imporantFields).length > 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-default-900/30">
            {Object.entries(imporantFields).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="text-xs text-muted-foreground capitalize font-medium text-default-500">
                  {key.replace(/_/g, " ")}
                </div>
                <div className="text-sm bg-background/60 p-2 rounded border border-default-900/30">
                  <span className="break-all">
                    {formatPreviewValue(key, value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};
