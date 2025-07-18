import SAvatar from "@/components/ui/SAvatar";
import { Table, TableBody, TableRow } from "@/components/ui/Table";
import WitnessVoteButton from "@/components/WitnessVoteButton";
import WitnessVotersModal from "@/components/WitnessVotersModal";
import { validate_account_name } from "@/utils/chainValidation";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import React, { useEffect, useMemo, useState } from "react";
import { BiChevronLeft, BiChevronRight, BiUserCheck } from "react-icons/bi";
import { FaChevronDown, FaCode, FaSearch, FaVoteYea } from "react-icons/fa";
import { FiAlertCircle, FiExternalLink } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { WitnessDataProps } from "../page";
import ErrorCard from "@/components/ErrorCard";
import SLink from "@/components/ui/SLink";

interface Props {
  data: WitnessDataProps;
}

function WitnessListTab(props: Props) {
  const {
    witnesses: witnessList,
    userData,
    isLoading,
    error,
    userVoteCount,
  } = props.data;

  const [witnesses, setWitnesses] = useState(witnessList);

  let [witnessRef, setWitnessRef] = useState("");

  const [filterValue, setFilterValue] = React.useState<any>("");
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredItems = React.useMemo(() => {
    let filteredWitnesses = [...witnesses];

    filteredWitnesses = filteredWitnesses.filter((delegation) =>
      delegation.name.toLowerCase().includes(filterValue.toLowerCase())
    );

    return filteredWitnesses;
  }, [witnesses, filterValue]);

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
    ? filteredItems.filter((w) => w.voted)
    : filteredItems;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Memoize the paginated orders
  const paginatedData = useMemo(() => {
    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const data = filteredWitnesses?.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredWitnesses.length / itemsPerPage);

    return {
      data: data,
      totalPages,
    };
  }, [filteredWitnesses, currentPage, itemsPerPage]);

  const handleNextPage = () => {
    if (currentPage < paginatedData.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (error) {
    return <ErrorCard message={error?.message} />;
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

  return (
    <>
      <Card>
        <CardHeader className="pb-3 flex flex-col items-start  gap-4 p-6">
          <div className="flex flex-col sm:flex-row justify-between w-full">
            <div className="flex flex-row items-center gap-2 text-lg sm:text-xl font-semibold">
              <FaVoteYea size={24} className="text-steem" />
              Top Witnesses (100)
            </div>
            <div className="text-default-500 text-sm text-end">
              Vote for up to 30 witnesses to secure the Steem blockchain
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 w-full">
            <Input
              startContent={<FaSearch className="text-default-500" />}
              placeholder="Search witness..."
              className="max-w-lg"
              value={filterValue}
              onValueChange={setFilterValue}
              isClearable
            />
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
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Show proxy warning if user has a proxy set */}
          {currentProxy && (
            <div className="bg-orange-100 border border-orange-200 p-3 rounded-lg">
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
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="border border-gray-200/20 rounded-lg p-3 sm:p-4 animate-pulse"
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
          ) : (
            <>
              <Table>
                <TableBody>
                  <div className="flex flex-col gap-2">
                    {paginatedData.data.map((witness) => {
                      const imporantFields = {
                        rank: witness.rank,
                        created: new Date(
                          witness.created * 1000
                        ).toLocaleString(),
                        produced_blocks: witness.produced_blocks,
                        last_confirmed_block: witness.last_confirmed_block,
                        last_sync: new Date(
                          witness.last_sync * 1000
                        ).toLocaleString(),
                        account_creation_fee:
                          witness.props.account_creation_fee,
                        maximum_block_size: witness.props.maximum_block_size,
                        sbd_interest_rate: witness.props.sbd_interest_rate,
                        signing_key: witness.signing_key,
                        version: witness.version,
                        url: witness.url,
                        reported_price: witness.reported_price,
                      };
                      return (
                        <TableRow key={witness.name} className="px-4 pb-4">
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
                                <div className="flex flex-row items-start gap-4 mb-1 sm:mb-2">
                                  <div className="flex flex-row items-center gap-2">
                                    <div
                                      className={`font-medium text-deault-800 text-sm sm:text-base ${
                                        witness.isDisabled ? "line-through" : ""
                                      }`}
                                    >
                                      #{witness.rank}
                                    </div>
                                    <div
                                      className={`font-semibold text-deault-900 truncate text-sm sm:text-base ${
                                        witness.isDisabled ? "line-through" : ""
                                      }`}
                                    >
                                      <SAvatar
                                        content={`${witness.name}`}
                                        size="xs"
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
                                          size="sm"
                                          className="bg-steem text-xs"
                                        >
                                          <div className="flex flex-row gap-1 items-center">
                                            <BiUserCheck size={18} />
                                            Voted
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
                                    className="flex items-center gap-1 cursor-pointer"
                                    onClick={() => {
                                      setWitnessVoteModal({
                                        isOpen: !witnessVoteModal.isOpen,
                                        witness: {
                                          name: witness.name,
                                          received_votes:
                                            witness.received_votes,
                                          votes: witness.votes,
                                        },
                                      });
                                    }}
                                  >
                                    <span>Votes: {witness.votes}</span>
                                  </div>
                                  <span className="hidden sm:inline">•</span>
                                  <span>Missed: {witness.missedBlocks}</span>
                                  <span
                                    title={`Updated at ${new Date(
                                      witness.last_price_report * 1000
                                    ).toLocaleString()}`}
                                  >
                                    Price: {witness.reported_price.base}
                                  </span>

                                  <span>
                                    <Button
                                      variant="flat"
                                      size="sm"
                                      onPress={() => setIsExpanded(!isExpanded)}
                                      className="flex items-center space-x-1 text-default-600"
                                      isIconOnly
                                    >
                                      {isExpanded ? (
                                        <FaChevronDown />
                                      ) : (
                                        <FaCode size={18} />
                                      )}
                                    </Button>
                                  </span>
                                </div>

                                {isExpanded &&
                                  imporantFields &&
                                  typeof imporantFields === "object" &&
                                  Object.keys(imporantFields).length > 2 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-border/30">
                                      {Object.entries(imporantFields).map(
                                        ([key, value]) => (
                                          <div key={key} className="space-y-1">
                                            <div className="text-xs text-muted-foreground capitalize font-medium">
                                              {key.replace(/_/g, " ")}
                                            </div>
                                            <div className="text-sm font-mono bg-background/60 p-2 rounded border border-border/30">
                                              <span className="break-all">
                                                {formatPreviewValue(key, value)}
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                              <div className="flex gap-0">
                                <WitnessVoteButton
                                  className="rounded-s-md"
                                  isVoted={witness.voted}
                                  witness={witness.name}
                                  isDisabled={!userData?.name || !!currentProxy}
                                />
                                {/* {witness.name === loggedInUser && (
                                    <Button
                                      variant="bordered"
                                      className="text-xs sm:text-sm px-2 sm:px-3"
                                    >
                                      Disable
                                    </Button>
                                  )} */}

                                <Button
                                  as={SLink}
                                  size="sm"
                                  target="_blank"
                                  href={witness.url ?? `/@${witness.name}`}
                                  variant="bordered"
                                  className="text-xs sm:text-sm px-2 sm:px-3 rounded-s-none"
                                >
                                  <FiExternalLink size={16} />
                                  Info
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TableRow>
                      );
                    })}
                  </div>
                </TableBody>
              </Table>

              {paginatedData.totalPages > 1 && (
                <div className="flex items-center justify-between py-4 px-3">
                  <Button
                    variant="bordered"
                    size="sm"
                    onPress={handlePrevPage}
                    isDisabled={currentPage === 1}
                    startContent={<BiChevronLeft size={18} />}
                  >
                    Previous
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {paginatedData.totalPages}
                  </div>

                  <Button
                    variant="bordered"
                    size="sm"
                    onPress={handleNextPage}
                    isDisabled={currentPage === paginatedData.totalPages}
                    endContent={<BiChevronRight size={18} />}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
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

export default WitnessListTab;
