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
import { Progress, CircularProgress } from "@heroui/progress";
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
import Link from "next/link";

interface HealthResult {
  score: number;
  checks: HealthCheckResult[];
  pillarScores: Record<string, number>;
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
    checks.push(await AccountHealthService.checkWithdrawRoutes(data, t));
    checks.push(AccountHealthService.checkReputation(data, t));
    checks.push(AccountHealthService.checkAccountAge(data, t));
    checks.push(AccountHealthService.checkKeyDuplicates(data, t));

    // Authority
    checks.push(...AccountHealthService.checkAuthorities(data, t));

    // Resource
    checks.push(await AccountHealthService.checkSavings(data, t));
    checks.push(AccountHealthService.checkPowerDown(data, t, vestsToSteem));
    checks.push(AccountHealthService.checkDelegations(data, t, vestsToSteem));
    checks.push(AccountHealthService.checkLiquidFunds(data, t, vestsToSteem));
    checks.push(AccountHealthService.checkUnclaimedRewards(data, t));

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
    checks.push(AccountHealthService.checkCSI(data, t));
    checks.push(AccountHealthService.checkSelfVoteRate(data, t));

    // Calculate pillar scores
    let totalScore = 0;
    const pillarScores: Record<string, number> = {};
    ["security", "authority", "resource", "governance"].forEach((section) => {
      const sectionChecks = checks.filter((c) => c.section === section);
      if (sectionChecks.length === 0) {
        pillarScores[section] = 100;
      } else {
        let pScore = 0;
        sectionChecks.forEach((c) => {
          if (c.status === "good" || c.status === "info") pScore += 1;
          else if (c.status === "warning") pScore += 0.5;
        });
        pillarScores[section] = Math.round(
          (pScore / sectionChecks.length) * 100,
        );
      }
    });

    // Global score calculation
    checks.forEach((check) => {
      if (check.status === "good") totalScore += 1;
      if (check.status === "info") totalScore += 1;
      if (check.status === "warning") totalScore += 0.5;
    });

    const finalScore = Math.round((totalScore / checks.length) * 100);
    setResults({ score: finalScore, checks, pillarScores });
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
            {/* Health Score & Pillars Hero Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Primary Score Card */}
              <Card className="xl:col-span-4 bg-default-100 border-primary/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
                <CardBody className="flex flex-col items-center justify-center p-8 gap-8 text-center z-10">
                  <div className="relative">
                    <div className="w-48 h-48 flex items-center justify-center relative">
                      {/* Outer Glow Ring */}
                      <div
                        className={twMerge(
                          "absolute inset-0 rounded-full blur-xl opacity-20",
                          results.score >= 80
                            ? "bg-success"
                            : results.score >= 50
                              ? "bg-warning"
                              : "bg-danger",
                        )}
                      />
                      <CircularProgress
                        value={results.score}
                        color={getScoreColor(results.score)}
                        strokeWidth={3}
                        className="scale-125"
                        classNames={{
                          svg: "w-36 h-36 drop-shadow-2xl",
                          indicator: "transition-all duration-1000 ease-in-out",
                          track: "stroke-default-100 opacity-20",
                        }}
                        showValueLabel={false}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                        <span
                          className={twMerge(
                            "text-5xl font-black tracking-tighter leading-none",
                            results.score >= 80
                              ? "text-success"
                              : results.score >= 50
                                ? "text-warning"
                                : "text-danger",
                          )}
                        >
                          {results.score}
                        </span>
                        <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] mt-2 ml-1">
                          Percent
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3
                      className="text-xl font-bold
                     uppercase tracking-tighter"
                    >
                      {t("overallScore")}
                    </h3>
                    <div className="flex flex-col gap-2">
                      <Chip
                        color={getScoreColor(results.score)}
                        variant="shadow"
                        className="font-bold uppercase px-6 h-8 text-xs self-center"
                      >
                        {getRiskLabel(results.score)}
                      </Chip>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Pillars Status Grid */}
              <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(results.pillarScores).map(
                  ([pillar, pScore]) => (
                    <Card
                      key={pillar}
                      className="border-default-100/50 bg-content1/50 backdrop-blur-md hover:border-primary/30 transition-all cursor-default"
                    >
                      <CardBody className="p-5 flex flex-col justify-between gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={twMerge(
                                "p-2.5 rounded-xl",
                                pillar === "security"
                                  ? "bg-primary/10 text-primary"
                                  : pillar === "authority"
                                    ? "bg-warning/10 text-warning"
                                    : pillar === "resource"
                                      ? "bg-success/10 text-success"
                                      : "bg-secondary/10 text-secondary",
                              )}
                            >
                              {
                                sectionIcons[
                                  pillar as keyof typeof sectionIcons
                                ]
                              }
                            </div>
                            <span className="font-bold text-sm uppercase tracking-widest">
                              {t(`sections.${pillar}`)}
                            </span>
                          </div>
                          <span
                            className={twMerge(
                              "font-mono font-bold text-lg",
                              pScore >= 80
                                ? "text-success"
                                : pScore >= 50
                                  ? "text-warning"
                                  : "text-danger",
                            )}
                          >
                            {pScore}%
                          </span>
                        </div>
                        <Progress
                          value={pScore}
                          color={getScoreColor(pScore)}
                          size="sm"
                          className="rounded-full"
                        />
                      </CardBody>
                    </Card>
                  ),
                )}

                {/* Account Mini Bento Info */}
                <Card className="sm:col-span-2 border-default-100/50 bg-content2/30">
                  <CardBody className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 px-2">
                      <SAvatar username={account.name} size="sm" />
                      <div className="flex flex-col">
                        <SUsername
                          username={account.name}
                          className="text-sm font-bold"
                        />
                        <span className="text-[10px] opacity-50 uppercase font-black tracking-tighter">
                          Account Stats
                        </span>
                      </div>
                    </div>
                    {[
                      {
                        label: "VP",
                        value: `${account.upvote_mana_percent}%`,
                        color: "text-secondary",
                      },
                      {
                        label: "RC",
                        value: `${account.rc_mana_percent}%`,
                        color: "text-success",
                      },
                      {
                        label: "REP",
                        value: account.reputation.toFixed(1),
                        color: "text-primary",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex flex-col justify-center px-4 border-l border-default-100"
                      >
                        <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">
                          {stat.label}
                        </span>
                        <span
                          className={twMerge(
                            "text-base font-mono font-black",
                            stat.color,
                          )}
                        >
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              </div>
            </div>

            {/* Critical Issues Section (Only if danger exists) */}
            {results.checks.some((c) => c.status === "danger") && (
              <Card className="bg-danger/5 border-danger/20 border-1 overflow-hidden shadow-xl shadow-danger/5">
                <CardHeader className="bg-danger/10 px-6 py-3 flex items-center gap-2">
                  <ShieldAlert size={18} className="text-danger" />
                  <h4 className="font-black uppercase text-xs tracking-widest text-danger">
                    Critical Security Issues Detected
                  </h4>
                </CardHeader>
                <CardBody className="p-0">
                  {results.checks
                    .filter((c) => c.status === "danger")
                    .map((check, idx) => (
                      <div
                        key={check.id}
                        className={twMerge(
                          "flex items-center gap-4 p-4 px-6",
                          idx !== 0 && "border-t border-danger/10",
                        )}
                      >
                        <XCircle size={20} className="text-danger shrink-0" />
                        <div className="flex-1">
                          <p className="font-bold text-sm">{check.title}</p>
                          <p className="text-[11px] opacity-70 leading-tight">
                            {check.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          className="font-bold text-[10px] h-7"
                          as={check.link ? Link : "button"}
                          href={check.link}
                        >
                          Resolve
                        </Button>
                      </div>
                    ))}
                </CardBody>
              </Card>
            )}

            {/* Detailed Audit Categories */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 px-1">
                <div className="h-px flex-1 bg-default-100" />
                <h4 className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">
                  Detailed Security Audit
                </h4>
                <div className="h-px flex-1 bg-default-100" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {groupedChecks &&
                  Object.entries(groupedChecks).map(([section, checks]) => (
                    <Card
                      key={section}
                      className="card border border-default-100 h-full shadow-sm hover:shadow-md transition-all"
                    >
                      <CardHeader className="px-6 pt-6 flex items-center gap-2 border-b border-default-50/50 pb-4">
                        <div className="p-2 rounded-lg bg-default-50">
                          {sectionIcons[section as keyof typeof sectionIcons]}
                        </div>
                        <h4 className="font-black uppercase tracking-widest text-xs">
                          {t(`sections.${section}`)}
                        </h4>
                        <div className="ml-auto">
                          <Chip
                            size="sm"
                            variant="flat"
                            color={getScoreColor(results.pillarScores[section])}
                            className="font-black text-[9px] uppercase"
                          >
                            {results.pillarScores[section]}%
                          </Chip>
                        </div>
                      </CardHeader>
                      <CardBody className="p-4 space-y-2">
                        {checks.map((check) => (
                          <div
                            key={check.id}
                            className="group relative flex items-start gap-4 p-4 rounded-2xl hover:bg-default-50 transition-all border border-transparent hover:border-default-100"
                          >
                            <div className="mt-1 shrink-0">
                              {check.status === "good" ? (
                                <CheckCircle2
                                  size={18}
                                  className="text-success"
                                />
                              ) : check.status === "warning" ? (
                                <AlertTriangle
                                  size={18}
                                  className="text-warning"
                                />
                              ) : check.status === "danger" ? (
                                <XCircle size={18} className="text-danger" />
                              ) : (
                                <Info size={18} className="text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-sm tracking-tight truncate">
                                  {check.title}
                                </span>
                                {check.value && (
                                  <span className="font-mono text-[10px] opacity-40 font-bold">
                                    {check.value}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                                {check.description}
                              </p>
                              {check.entities && check.entities.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {check.entities.map((entity, idx) => (
                                    <Chip
                                      key={idx}
                                      size="sm"
                                      variant="flat"
                                      className="h-6 px-2 text-[10px] font-bold bg-content2/50"
                                    >
                                      {entity}
                                    </Chip>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardBody>
                    </Card>
                  ))}
              </div>
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
