"use client";

import ErrorCard from "@/components/ErrorCard";
import LoadingCard from "@/components/LoadingCard";
import { getProposals } from "@/libs/steem/condenser";
import { getAccountExt } from "@/libs/steem/sds";
import parseAsset from "@/utils/helper/parse-asset";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import React, { useEffect, useMemo, useState } from "react";
import {
  FaFileInvoiceDollar,
  FaListAlt,
  FaSearch,
  FaVoteYea,
} from "react-icons/fa";
import useSWR from "swr";
import ProposalItem from "@/components/ProposalItem";
import { Table, TableBody, TableRow } from "@/components/ui/Table";
import { DaoStats } from "@/components/DaoStats";

const initialSatus = ["all"];

function Proposals() {
  const { data, error, isLoading } = useSWR<Proposal[]>(
    "proposals-list",
    getProposals
  );

  const [allRows, setAllRows] = useState<Proposal[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = React.useState<any>(
    new Set(initialSatus)
  );

  const hasSearchFilter = Boolean(filterValue);
  const filteredItems = useMemo(() => {
    let filteredProposals = [...allRows];

    if (hasSearchFilter)
      filteredProposals = filteredProposals.filter((proposal) =>
        (proposal.creator
          .toLowerCase()
          .includes(filterValue.toLowerCase().trim()) ||
          proposal.receiver
            .toLowerCase()
            .includes(filterValue.toLowerCase().trim()) ||
          proposal.subject
            .toLowerCase()
            .includes(filterValue.toLowerCase().trim())) &&
        Array.from(visibleColumns).includes("all")
          ? true
          : Array.from(visibleColumns).includes(proposal.status)
      );

    return filteredProposals;
  }, [allRows, filterValue, visibleColumns]);

  useEffect(() => {
    if (data) {
      setAllRows(data);
    }
  }, [data]);

  if (error) {
    return <ErrorCard message={error} />;
  }

  if (isLoading) return <LoadingCard />;

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="flex flex-col items-center sm:items-start gap-2 text-center">
        <p className="text-xl font-bold sm:text-3xl">Steem Proposals</p>
        <p className="text-sm text-default-500">
          Fund community-driven ideas through the Steem Proposal System (SPS).
          Vote on initiatives that improve the ecosystem and benefit the
          network.
        </p>
      </div>

      <DaoStats proposals={data} />

      <Card className="space-y-4">
        <CardBody className="space-y-4">
          <CardHeader className="pb-3 flex flex-col items-start gap-2">
            <div className="flex flex-col sm:flex-row justify-between w-full">
              <CardBody className="flex flex-row items-center gap-2 text-lg sm:text-xl font-semibold">
                <FaFileInvoiceDollar size={24} className="text-steem" />
                DAO Proposals
              </CardBody>
              <CardBody className="text-default-500 text-sm text-end">
                Showing {filteredItems.length} of {allRows.length} proposals
              </CardBody>
            </div>
            <div className="flex flex-col items-start gap-3 w-full">
              <Input
                startContent={<FaSearch className="text-default-500" />}
                placeholder="Search proposal..."
                className="max-w-lg"
                value={filterValue}
                onValueChange={setFilterValue}
                isClearable
              />
            </div>
          </CardHeader>

          <Table>
            <TableBody>
              <div className="flex flex-col gap-2">
                {filteredItems?.map((proposal) => {
                  return (
                    <TableRow
                      key={proposal.id}
                      className="text-xs hover:bg-muted/20 w-full "
                    >
                      <ProposalItem
                        returnProposal={allRows.find(
                          (p) => p.proposal_id === 0
                        )}
                        proposal={proposal}
                      />
                    </TableRow>
                  );
                })}
              </div>
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}

export default Proposals;
