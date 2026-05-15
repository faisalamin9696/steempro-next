"use client";

import { useState, useMemo, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  RefreshCw,
  Key,
  ShieldAlert,
  Zap,
  Vote,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/hooks/redux/store";
import { sdsApi } from "@/libs/sds";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { Chip } from "@heroui/chip";
import SInput from "@/components/ui/SInput";
import SAvatar from "@/components/ui/SAvatar";
import SUsername from "@/components/ui/SUsername";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Constants } from "@/constants";
import { AccountHealthService, HealthCheckResult } from "@/libs/account-health";
import { useSteemUtils } from "@/hooks/useSteemUtils";
import RecoveryUpdateModal from "@/components/wallet/RecoveryUpdateModal";
import { useSession } from "next-auth/react";

interface HealthResult {
  score: number;
  checks: HealthCheckResult[];
}

export default function AccountHealthCheckPage() {
  const t = useTranslations("AccountHealth");
  const loginData = useAppSelector((s) => s.loginReducer.value);
  const [username, setUsername] = useState(loginData.name || "");
  const [isScanning, setIsScanning] = useState(false);
  const [account, setAccount] = useState<AccountExt | null>(null);
  const [results, setResults] = useState<HealthResult | null>(null);
  const { vestsToSteem } = useSteemUtils();
  const { data: session } = useSession();
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  useEffect(() => {
    if (loginData.name && !username) {
      performScan(loginData.name);
    }
  }, [loginData.name]);

  const performScan = async (targetUser: string) => {
    if (!targetUser) return;
    setIsScanning(true);
    setResults(null);
    try {
      const data = await sdsApi.getAccountExt(targetUser.toLowerCase());
      if (!data || !data.name) {
        toast.error("Account not found");
        return;
      }
      setAccount(data);
      await calculateHealth(data);
    } catch (error) {
      toast.error("Failed to fetch account data");
    } finally {
      setIsScanning(false);
    }
  };

  const calculateHealth = async (data: AccountExt) => {
    const checks: HealthCheckResult[] = [];

    // Security
    checks.push(await AccountHealthService.checkRecoveryStatus(data, t));
    checks.push(AccountHealthService.checkReputation(data, t));
    checks.push(AccountHealthService.checkAccountAge(data, t));

    // Authority
    checks.push(...AccountHealthService.checkAuthorities(data, t));

    // Resource
    checks.push(await AccountHealthService.checkSavings(data, t));
    checks.push(AccountHealthService.checkPowerDown(data, t, vestsToSteem));
    checks.push(AccountHealthService.checkDelegations(data, t, vestsToSteem));

    // Add Resource Credits
    const rc = data.rc_mana_percent;
    checks.push({
      id: "rc",
      section: "resource",
      status: rc > 50 ? "good" : rc > 10 ? "warning" : "danger",
      title: t("checks.resourceCredits.title"),
      description:
        rc > 50
          ? t("checks.resourceCredits.good", { percent: rc })
          : t("checks.resourceCredits.warning", { percent: rc }),
      value: `${rc}%`,
    });

    // Governance
    checks.push(...AccountHealthService.checkGovernance(data, t));

    // Calculate score
    let score = 0;
    checks.forEach((check) => {
      if (check.status === "good") score += 1;
      if (check.status === "info") score += 1;
      if (check.status === "warning") score += 0.5;
    });

    const finalScore = Math.round((score / checks.length) * 100);
    setResults({ score: finalScore, checks });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 50) return "warning";
    return "danger";
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return t("riskLevel.low");
    if (score >= 50) return t("riskLevel.medium");
    return t("riskLevel.high");
  };

  const sectionIcons = {
    security: <Key size={18} className="text-primary" />,
    authority: <ShieldAlert size={18} className="text-warning" />,
    resource: <Zap size={18} className="text-success" />,
    governance: <Vote size={18} className="text-secondary" />,
  };

  const groupedChecks = useMemo(() => {
    if (!results) return null;
    return results.checks.reduce(
      (acc, check) => {
        if (!acc[check.section]) acc[check.section] = [];
        acc[check.section].push(check);
        return acc;
      },
      {} as Record<string, HealthCheckResult[]>,
    );
  }, [results]);

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={ShieldCheck}
        color="danger"
      />

      <Card className="card overflow-hidden border-default-100">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <SInput
                label="Steem Username"
                placeholder="Enter username to scan..."
                value={username}
                onValueChange={setUsername}
                startContent={<span className="text-muted">@</span>}
                isDisabled={isScanning}
                onKeyDown={(e) => e.key === "Enter" && performScan(username)}
              />
            </div>
            <Button
              color="primary"
              variant="solid"
              className="w-full md:w-auto h-12 px-8 font-bold"
              onPress={() => performScan(username)}
              isLoading={isScanning}
              startContent={!isScanning && <Search size={20} />}
            >
              {isScanning ? t("scanning") : t("scan")}
            </Button>
          </div>
        </CardBody>
      </Card>

      <AnimatePresence mode="wait">
        {results && account && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Health Score Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="card lg:col-span-1 border-primary/20 shadow-xl shadow-primary/5">
                <CardBody className="flex flex-col items-center justify-center p-8 gap-6 text-center">
                  <div className="relative">
                    <div className="w-32 h-32 flex items-center justify-center">
                      <Progress
                        value={results.score}
                        color={getScoreColor(results.score)}
                        className="w-32 h-32 absolute -rotate-90"
                        classNames={{
                          indicator: "stroke-10",
                          track: "stroke-10 opacity-20",
                        }}
                      />
                      <span
                        className={twMerge(
                          "text-4xl font-black",
                          results.score >= 80
                            ? "text-green-500"
                            : results.score >= 50
                              ? "text-yellow-500"
                              : "text-danger",
                        )}
                      >
                        {results.score}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold uppercase tracking-tighter">
                      {t("overallScore")}
                    </h3>
                    <Chip
                      color={getScoreColor(results.score)}
                      variant="flat"
                      className="font-bold uppercase text-[10px]"
                    >
                      {getRiskLabel(results.score)}
                    </Chip>
                  </div>
                </CardBody>
              </Card>

              <Card className="card lg:col-span-2">
                <CardHeader className="p-6 pb-0 flex items-center gap-4">
                  <SAvatar username={account.name} size="md" />
                  <div>
                    <SUsername
                      username={account.name}
                      className="text-xl font-black"
                    />
                    <p className="text-xs text-muted">
                      Scanning account data from blockchain
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Button
                      isIconOnly
                      variant="ghost"
                      size="sm"
                      onPress={() => performScan(username)}
                      className="rounded-full border-1"
                    >
                      <RefreshCw size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-content2/30 border border-default-100 flex flex-col gap-1">
                    <span className="text-[10px] text-muted uppercase font-bold tracking-widest">
                      VP
                    </span>
                    <span className="text-lg font-mono font-bold text-secondary">
                      {account.upvote_mana_percent}%
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-content2/30 border border-default-100 flex flex-col gap-1">
                    <span className="text-[10px] text-muted uppercase font-bold tracking-widest">
                      RC
                    </span>
                    <span className="text-lg font-mono font-bold text-success">
                      {account.rc_mana_percent}%
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-content2/30 border border-default-100 flex flex-col gap-1">
                    <span className="text-[10px] text-muted uppercase font-bold tracking-widest">
                      Reputation
                    </span>
                    <span className="text-lg font-mono font-bold text-primary">
                      {account.reputation.toFixed(1)}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-content2/30 border border-default-100 flex flex-col gap-1">
                    <span className="text-[10px] text-muted uppercase font-bold tracking-widest">
                      Witnesses
                    </span>
                    <span className="text-lg font-mono font-bold text-warning">
                      {account.witness_votes?.length || 0}/30
                    </span>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Detailed Checks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groupedChecks &&
                Object.entries(groupedChecks).map(([section, checks]) => (
                  <Card
                    key={section}
                    className="card border-default-100 h-full"
                  >
                    <CardHeader className="px-6 pt-6 flex items-center gap-2 border-b border-default-50 pb-4">
                      {sectionIcons[section as keyof typeof sectionIcons]}
                      <h4 className="font-bold uppercase tracking-widest text-sm">
                        {t(`sections.${section}`)}
                      </h4>
                    </CardHeader>
                    <CardBody className="p-6 space-y-4">
                      {checks.map((check) => (
                        <div
                          key={check.id}
                          className="group relative flex items-start gap-3 p-3 rounded-xl hover:bg-content2/40 transition-colors"
                        >
                          <div className="mt-1">
                            {check.status === "good" ? (
                              <CheckCircle2
                                size={18}
                                className="text-success shrink-0"
                              />
                            ) : check.status === "warning" ? (
                              <AlertTriangle
                                size={18}
                                className="text-warning shrink-0"
                              />
                            ) : check.status === "danger" ? (
                              <XCircle
                                size={18}
                                className="text-danger shrink-0"
                              />
                            ) : (
                              <Info
                                size={18}
                                className="text-primary shrink-0"
                              />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-sm">
                                {check.title}
                              </span>
                              {check.value && (
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  className="font-mono text-[10px]"
                                >
                                  {check.value}
                                </Chip>
                              )}
                            </div>
                            <p className="text-xs text-muted leading-relaxed opacity-80">
                              {check.description}
                            </p>
                            {check.entities && check.entities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {check.entities.map((entity, idx) => (
                                  <Chip
                                    key={idx}
                                    size="sm"
                                    variant="dot"
                                    color={
                                      check.status === "danger"
                                        ? "danger"
                                        : "warning"
                                    }
                                    className="h-5 px-1 text-[9px] border-none bg-default-100"
                                  >
                                    {entity}
                                  </Chip>
                                ))}
                              </div>
                            )}
                            {t.has(`checks.${check.id}.description`) && (
                              <p className="text-[10px] text-primary/60 italic leading-tight mt-1">
                                {t(`checks.${check.id}.description`)}
                              </p>
                            )}
                          </div>

                          {check.id === "recovery" &&
                            session?.user?.name === account.name && (
                              <Button
                                size="sm"
                                variant="flat"
                                color="primary"
                                className="ml-auto h-7 px-2 text-[10px] font-bold"
                                onPress={() => setIsRecoveryModalOpen(true)}
                              >
                                {t("change")}
                              </Button>
                            )}
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                ))}
            </div>

            {/* Trusted Recovery Entities List */}
            <Card className="card border-default-100">
              <CardHeader className="px-6 pt-6 flex items-center gap-2 border-b border-default-50 pb-4">
                <ShieldCheck size={18} className="text-primary" />
                <h4 className="font-bold uppercase tracking-widest text-sm">
                  {t("sections.trustedEntities")}
                </h4>
              </CardHeader>
              <CardBody className="p-6">
                <div className="flex flex-wrap gap-2">
                  {(Constants.trusted_recovery_accounts || []).map((entity) => (
                    <Chip
                      key={entity}
                      variant="flat"
                      color={
                        account?.recovery_account === entity
                          ? "success"
                          : "default"
                      }
                      className="px-2"
                      startContent={<SAvatar username={entity} size="xs" />}
                    >
                      <SUsername
                        username={entity}
                        className="text-xs font-bold"
                      />
                    </Chip>
                  ))}
                </div>
                <p className="text-[11px] text-muted mt-4 italic">
                  {t("checks.recoveryAccount.description")}
                </p>
              </CardBody>
            </Card>

            {/* Recommendations / Next Steps */}
            <Card className="card bg-primary/5 border-primary/20">
              <CardBody className="p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="font-bold">Maintain your account security</h4>
                  <p className="text-sm text-muted">
                    Always use Steem Keychain or a secure wallet. Never share
                    your active or owner keys with untrusted websites.
                  </p>
                </div>
                <Button
                  color="primary"
                  variant="flat"
                  className="ml-auto"
                  as="a"
                  href="/witnesses"
                >
                  Update Witness Votes
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!results && !isScanning && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4 opacity-50">
          <ShieldCheck size={64} className="text-default-300" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold uppercase tracking-widest">
              Ready for audit
            </h3>
            <p className="text-sm text-muted max-w-xs mx-auto">
              Enter your Steem username above to perform a comprehensive health
              and security check.
            </p>
          </div>
        </div>
      )}

      {account && (
        <RecoveryUpdateModal
          isOpen={isRecoveryModalOpen}
          onOpenChange={setIsRecoveryModalOpen}
          currentRecovery={account.recovery_account}
        />
      )}
    </div>
  );
}
