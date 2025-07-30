import { Chip } from "@heroui/chip";
import React, { useState } from "react";
import { BiUserCheck } from "react-icons/bi";
import SAvatar from "./ui/SAvatar";
import WitnessVotersModal from "./WitnessVotersModal";
import { useSession } from "next-auth/react";

interface Props {
  witness: MergedWitness;
  endContent?: React.ReactNode;
}
function WitnessItemCard(props: Props) {
  const { witness, endContent } = props;
  const [witnessVoteModal, setWitnessVoteModal] = useState(false);
  const { data: session } = useSession();
  const isOwn = witness.name === session?.user?.name;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-start gap-4 mb-1 sm:mb-2">
        <div className="flex flex-row items-center gap-2">
          <Chip
            variant="flat"
            color="primary"
            className={`h-5 p-0 ${witness.isDisabled ? "line-through" : ""}`}
          >
            <p className="text-sm">#{witness.rank}</p>
          </Chip>
          <div
            className={`font-semibold text-deault-900 truncate text-sm sm:text-base ${
              witness.isDisabled ? "line-through" : ""
            }`}
          >
            <SAvatar
              content={`${witness.name}`}
              size="xs"
              linkClassName="gap-2"
              username={witness.name}
            />
          </div>
        </div>
        {(witness.voted ||
          witness.isDisabledByKey ||
          witness.hasInvalidVersion) && (
          <div className="flex flex-row gap-2 flex-wrap">
            {witness.voted && (
              <Chip
                variant="flat"
                color="success"
                size="sm"
                className="text-xs"
              >
                <div className="flex flex-row gap-1 items-center">
                  <BiUserCheck size={18} />
                  {isOwn ? "Active" : "Voted"}
                </div>
              </Chip>
            )}

            {witness.isDisabledByKey && (
              <Chip
                size="sm"
                variant="flat"
                className="text-red-500 bg-red-500/30 text-xs"
              >
                Disabled
              </Chip>
            )}

            {witness.hasInvalidVersion && (
              <>
                <Chip
                  size="sm"
                  variant="flat"
                  className="text-orange-500 border-orange-500/30 text-xs"
                >
                  Invalid Version
                </Chip>
              </>
            )}
          </div>
        )}
      </div>
      <div
        className={`flex flex-row items-center gap-4 text-sm text-default-500 ${
          witness.isDisabled ? "line-through" : ""
        }`}
      >
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-500"
          onClick={() => {
            setWitnessVoteModal(true);
          }}
        >
          <span>
            <span className="text-default-400">Votes:</span> {witness.votes}
          </span>
        </div>
        <span className="hidden sm:inline">•</span>
        <span>
          {" "}
          <span className="text-default-400">Missed:</span>{" "}
          {witness.missedBlocks}
        </span>
        <span
          title={`Updated at ${new Date(
            witness.last_price_report * 1000
          ).toLocaleString()}`}
        >
          <span className="text-default-400">Price:</span>{" "}
          {witness.reported_price.base}
        </span>

        {endContent}
      </div>

      {witnessVoteModal && (
        <WitnessVotersModal
          witness={{
            name: witness.name,
            received_votes: witness.received_votes,
            votes: witness.votes,
          }}
          isOpen={witnessVoteModal}
          onOpenChange={setWitnessVoteModal}
        />
      )}
    </div>
  );
}

export default WitnessItemCard;
