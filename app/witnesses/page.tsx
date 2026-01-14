"use client";

import { useMemo, useState } from "react";
import {
  Vote,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  ShieldCheck,
  UserCheck,
  Settings,
  Activity,
} from "lucide-react";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { formatVotes } from "@/hooks/useWitnesses";
import { toast } from "sonner";
import SAvatar from "@/components/ui/SAvatar";
import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Tabs,
  Tab,
  Alert,
} from "@heroui/react";
import WitnessDetailsModal from "@/components/witness/WitnessDetailsModal";
import MyWitnessTab from "@/components/witness/MyWitnessTab";
import SUsername from "@/components/ui/SUsername";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { steemApi } from "@/libs/steem";
import { handleSteemError } from "@/utils/steemApiError";
import { addLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { normalizeUsername } from "@/utils/editor";
import SInput from "@/components/ui/SInput";
import { useAccountsContext } from "@/components/auth/AccountsContext";
import LoginAlertCard from "@/components/ui/LoginAlertCard";

const WitnessesPage = ({ data }: { data: Witness[] }) => {
  const loginData = useAppSelector((s) => s.loginReducer.value);
  const [votingFor, setVotingFor] = useState<string | null>(null);
  const [selectedWitness, setSelectedWitness] = useState<Witness | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [onlyVoted, setOnlyVoted] = useState(false);
  const [activeTab, setActiveTab] = useState("witnesses");
  const [proxyInput, setProxyInput] = useState("");
  const [isProxying, setIsProxying] = useState(false);
  const dispatch = useAppDispatch();
  const { authenticateOperation } = useAccountsContext();
  const hasProxy = !!loginData?.proxy;
  const userWitness = useMemo(() => {
    if (!loginData.name) return null;
    return data.find((w) => w.name === loginData.name);
  }, [data, loginData.name]);

  const filteredWitnesses = useMemo(() => {
    if (onlyVoted) {
      return data.filter((w) => w.observer_votes_witness === 1);
    }
    return data;
  }, [data, onlyVoted]);

  const handleViewDetails = (witness: Witness) => {
    setSelectedWitness(witness);
    setDetailsOpen(true);
  };

  const handleVote = async (witnessName: string, approve: boolean) => {
    if (hasProxy) {
      toast.error("You cannot vote for witnesses while a proxy is active");
      return;
    }
    setVotingFor(witnessName);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("active");
      await steemApi.voteWitness(
        loginData.name,
        witnessName,
        approve,
        key,
        useKeychain
      );
      toast.success(
        `Successfully ${approve ? "voted for" : "unvoted"} ${witnessName}`
      );
      const updatedList = approve
        ? loginData.witness_votes.concat(witnessName)
        : loginData.witness_votes.filter((w) => w !== witnessName);
      dispatch(
        addLoginHandler({
          ...loginData,
          witness_votes: updatedList,
        })
      );
    }).finally(() => {
      setVotingFor(null);
    });
  };

  const handleSetProxy = async (proxyName: string) => {
    if (!loginData) return;
    setIsProxying(true);
    proxyName = normalizeUsername(proxyName);

    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("active");
      await steemApi.setProxy(loginData.name, proxyName, key, useKeychain);
      toast.success(
        proxyName
          ? `Successfully set proxy to ${proxyName}`
          : "Successfully removed proxy"
      );
      dispatch(addLoginHandler({ ...loginData, proxy: proxyName }));
      setProxyInput("");
    }).finally(() => {
      setIsProxying(false);
    });
  };

  const isWitnessActive = (witness: Witness): boolean => {
    return witness.signing_key !== "STM1111111111111111111111111111111114T1Anm";
  };

  const columns: ColumnDef<Witness>[] = [
    {
      key: "rank",
      header: "#",
      sortable: true,
      className: "w-12",
      render: (value) => <span className="font-mono text-muted">{value}</span>,
    },
    {
      key: "name",
      header: "Witness",
      sortable: true,
      searchable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <SAvatar username={value} />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <SUsername className="font-medium" username={`@${value}`} />
              {isWitnessActive(row) ? (
                <CheckCircle className="text-green-500" size={16} />
              ) : (
                <XCircle className="text-warning" size={16} />
              )}
            </div>
            {row.url && (
              <a
                href={row.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted hover:text-primary flex items-center gap-1 max-w-[200px]"
              >
                <ExternalLink size={14} className="shrink-0" />

                <span className="truncate min-w-0">
                  {row.url.replace("https://", "")}
                </span>
              </a>
            )}
          </div>
        </div>
      ),
    },

    {
      key: "received_votes",
      header: "Votes",
      sortable: true,
      className: "min-w-[140px]",
      render: (value) => (
        <div className="font-mono text-sm">
          {formatVotes(value)} <span className="text-muted text-xs">MV</span>
        </div>
      ),
    },

    {
      key: "missed_blocks",
      header: "Missed",
      sortable: true,
      className: "w-24",
      render: (value) => (
        <div className="flex items-center gap-2">
          {value > 0 && (
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
          )}
          <span
            className={
              value > 100
                ? "text-danger"
                : value > 0
                ? "text-yellow-500"
                : "text-muted"
            }
          >
            {value?.toLocaleString()}
          </span>
        </div>
      ),
    },

    {
      key: "name",
      header: "Action",
      render: (value, row) => {
        const issVoted = loginData.witness_votes.includes(value);
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onPress={() => handleViewDetails(row)}
              title="View details"
              isIconOnly
              className="border-1"
            >
              <Eye size={20} />
            </Button>
            <Button
              size="sm"
              color={issVoted ? "danger" : "primary"}
              variant="flat"
              isDisabled={
                !loginData ||
                votingFor === value ||
                !isWitnessActive(row) ||
                hasProxy
              }
              onPress={() =>
                handleVote(value, row.observer_votes_witness !== 1)
              }
              isLoading={votingFor === value}
            >
              {votingFor !== value && <Vote className="mr-1" size={20} />}
              {issVoted ? "Unvote" : "Vote"}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col">
      {activeTab !== "proxy" && hasProxy && (
        <Alert
          color="warning"
          variant="faded"
          className="mb-4"
          icon={
            <div>
              <ShieldCheck />
            </div>
          }
          title="Proxy Active"
          description={
            <div className="flex items-center gap-2 mt-1">
              <span>You are currently proxying your votes to</span>
              <SUsername
                username={loginData.proxy}
                className="font-bold underline"
              />
              <Button
                size="sm"
                variant="flat"
                isLoading={isProxying}
                onPress={() => setActiveTab("proxy")}
                isIconOnly
                color="primary"
              >
                <Settings size={20} />
              </Button>
            </div>
          }
        />
      )}

      <Tabs
        aria-label="Witness Options"
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        color="primary"
        classNames={{
          panel: "px-0",
          tabWrapper: "p-0",
        }}
      >
        <Tab
          key="witnesses"
          title={
            <div className="flex items-center space-x-2">
              <ShieldCheck size={18} />
              <span>Witnesses</span>
            </div>
          }
        >
          <div className="flex flex-col gap-6">
            {loginData?.name && (
              <Checkbox
                isSelected={onlyVoted}
                onValueChange={setOnlyVoted}
                className="self-end"
                classNames={{
                  label: "text-small text-muted font-medium",
                }}
              >
                Show only witnesses I've voted for{" "}
                {`(${loginData.witness_votes?.length}/30)`}
              </Checkbox>
            )}

            <Card className="card">
              <CardBody>
                <DataTable
                  data={filteredWitnesses}
                  columns={columns}
                  searchPlaceholder="Search witnesses by name..."
                  emptyMessage="No witnesses found"
                />
              </CardBody>
            </Card>
          </div>
        </Tab>
        <Tab
          key="proxy"
          title={
            <div className="flex items-center space-x-2">
              <UserCheck size={18} />
              <span>Proxy</span>
            </div>
          }
        >
          <div className="pt-4">
            {!loginData.name ? (
              <LoginAlertCard text="view proxy settings" />
            ) : (
              <Card className="card">
                <CardBody className="gap-6 p-6">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Set Voting Proxy</h3>
                    <p className="text-sm text-muted">
                      Choosing a proxy allows another user to vote for witnesses
                      on your behalf. This handles your full witness voting
                      power.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <SInput
                      label="Proxy Username"
                      placeholder="e.g. steempro.com"
                      labelPlacement="outside"
                      value={
                        hasProxy ? loginData.proxy ?? proxyInput : proxyInput
                      }
                      onValueChange={setProxyInput}
                      startContent={<span className="text-muted">@</span>}
                      isClearable
                      isDisabled={isProxying || hasProxy}
                    />

                    <div className="flex gap-3">
                      <Button
                        color="primary"
                        className="flex-1"
                        isLoading={isProxying}
                        isDisabled={
                          !proxyInput ||
                          proxyInput === loginData?.name ||
                          hasProxy
                        }
                        onPress={() => handleSetProxy(proxyInput)}
                      >
                        Set Proxy
                      </Button>
                      {hasProxy && (
                        <Button
                          color="danger"
                          variant="flat"
                          isLoading={isProxying}
                          onPress={() => handleSetProxy("")}
                        >
                          Clear Proxy
                        </Button>
                      )}
                    </div>
                  </div>

                  {hasProxy && (
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center gap-3">
                      <SAvatar username={loginData.proxy} size="sm" />
                      <div>
                        <p className="text-xs text-muted">Current Proxy</p>
                        <SUsername
                          username={loginData.proxy}
                          className="font-bold"
                        />
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </div>
        </Tab>
        {userWitness && (
          <Tab
            key="my-witness"
            title={
              <div className="flex items-center space-x-2">
                <Activity size={18} />
                <span>My Witness</span>
              </div>
            }
          >
            <MyWitnessTab witness={userWitness} username={loginData.name} />
          </Tab>
        )}
      </Tabs>

      {detailsOpen && selectedWitness && (
        <WitnessDetailsModal
          witness={selectedWitness}
          isOpen={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </div>
  );
};

export default WitnessesPage;
