"use client";

import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { useEffect, useState, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import moment from "moment";
import {
  CheckCircle2,
  XCircle,
  Rocket,
  Shield,
  Info,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import { Spinner } from "@heroui/spinner";
import SModal from "@/components/ui/SModal";
import rocketAnimation from "@/public/rocket-anim.json";
import successAnimation from "@/public/success-anim.json";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | Feed;
}

export default function BoostModal({ isOpen, onOpenChange, post }: Props) {
  const { data: session } = useSession();
  const [isPending, setIsPending] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [countdown, setCountdown] = useState<string>("");
  const [needsPermission, setNeedsPermission] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);
  const rocketRef = useRef<any>(null);
  const isMe = session?.user?.name === post.author;

  useEffect(() => {
    if (isOpen && post.author) {
      checkAvailability();
    } else {
      setIsLaunching(false);
      setIsLaunched(false);
    }
  }, [isOpen, post.author, post.permlink]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status?.lastBoost) {
      timer = setInterval(() => {
        const now = moment().unix();
        const diff = status.lastBoost + 24 * 60 * 60 - now;
        if (diff <= 0) {
          setCountdown("");
        } else {
          const hours = Math.floor(diff / 3600);
          const minutes = Math.floor((diff % 3600) / 60);
          const seconds = diff % 60;
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status?.lastBoost]);

  const checkAvailability = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(
        `/api/boost?author=${post.author}&permlink=${post.permlink}`,
      );
      const data = await response.json();
      if (response.ok) {
        setStatus(data);
        if (!data.isFollowed && !data.isModerator) {
          setNeedsPermission(true);
        }
      } else {
        throw new Error(data.error || "Failed to check status");
      }
    } catch (error) {
      console.error("Failed to check boost availability:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleBoost = async () => {
    if (!status?.canBoost) return;
    setIsLaunching(true);
    setIsPending(true);

    if (rocketRef.current) {
      rocketRef.current.setSpeed(2.5);
    }

    try {
      const response = await fetch("/api/boost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author: post.author,
          permlink: post.permlink,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsLaunching(false);
        if (rocketRef.current) rocketRef.current.setSpeed(1);
        if (data.error === "NOT_FOLLOWED") {
          setNeedsPermission(true);
          throw new Error(data.message || "Permission required");
        }
        throw new Error(data.error || "Failed to boost post");
      }

      toast.success("Boost requested successfully!", {
        description: "Your post will be boosted soon.",
        icon: <Rocket className="text-primary animate-bounce" />,
      });

      setIsLaunched(true);
      setIsLaunching(false);
    } catch (error: any) {
      setIsLaunching(false);
      if (rocketRef.current) rocketRef.current.setSpeed(1);
      toast.error("Error", {
        description: error.message || "Something went wrong",
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const response = await fetch("/api/boost/request-permission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "ALREADY_REQUESTED") {
          throw new Error(
            data.message || "You have already requested permission recently",
          );
        }
        throw new Error(data.error || "Failed to request permission");
      }

      toast.success("Permission requested!", {
        description:
          "Your request has been sent to the moderation team. You will be notified once approved.",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Something went wrong",
      });
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const criteriaList = useMemo(() => {
    if (!status?.results) return [];
    return Object.values(status.results);
  }, [status]);

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      scrollBehavior="inside"
      title={isLaunched ? "" : "Boost Post"}
      description={isLaunched ? "" : "Launch your post to new heights!"}
      classNames={{ footer: "p-0" }}
    >
      {(onClose) => (
        <div className="flex flex-col gap-5 pb-4">
          {/* Unified Animation & Symmetry Container */}
          <div className="flex items-center justify-center p-6 bg-primary/5 rounded-3xl relative overflow-hidden min-h-44 border border-primary/10 shadow-inner">
            <AnimatePresence mode="wait">
              {isLaunched ? (
                <motion.div
                  key="success-lottie"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="z-10 w-40 h-40 flex items-center justify-center"
                >
                  <Lottie
                    animationData={successAnimation}
                    loop={false}
                    className="w-full h-full"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="rocket-lottie"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="z-10 w-28 h-28 flex items-center justify-center"
                >
                  <motion.div
                    animate={isLaunching ? { y: -200, opacity: 0 } : {}}
                    transition={{ duration: 1, ease: "easeIn" }}
                    className="w-full h-full"
                  >
                    <Lottie
                      lottieRef={rocketRef}
                      animationData={rocketAnimation}
                      loop={true}
                      className="w-full h-full"
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Background decorative pulse */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute inset-0 bg-primary rounded-full blur-3xl -z-10"
            />
          </div>

          <AnimatePresence mode="wait">
            {isLaunched ? (
              <motion.div
                key="success-info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center gap-4"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold tracking-tight text-success">
                    Boost Initiated!
                  </h3>
                  <p className="text-sm text-muted px-6 leading-relaxed">
                    Success! Your post has been sent to the launchpad. Priority
                    visibility and support will be applied shortly.
                  </p>
                </div>
                <Button
                  fullWidth
                  color="success"
                  onPress={onClose}
                  variant="shadow"
                  className="font-bold h-12 rounded-2xl mt-2 active:scale-95 transition-transform"
                >
                  Great!
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="checklist-info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-4">
                  {!needsPermission && (
                    <>
                      <div className="flex items-center gap-2 px-1">
                        <Info size={14} className="text-muted" />
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted/60">
                          Requirements
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {isChecking ? (
                          <div className="col-span-2 flex flex-col items-center justify-center py-6 gap-3">
                            <Spinner size="sm" color="primary" />
                            <span className="text-xs font-medium text-muted/70 italic">
                              Validating parameters...
                            </span>
                          </div>
                        ) : (
                          <>
                            {criteriaList.map((item: any) => (
                              <div
                                key={item.label}
                                className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-300 ${
                                  item.met
                                    ? "bg-success-50/70 dark:bg-success-950/10 border-success-200/60 dark:border-success-800/20"
                                    : "bg-danger-50/70 dark:bg-danger-950/10 border-danger-200/60 dark:border-danger-800/20"
                                }`}
                              >
                                <div className="flex items-center gap-1 min-w-0">
                                  <div
                                    className={
                                      item.met ? "text-success" : "text-danger"
                                    }
                                  >
                                    {item.met ? (
                                      <CheckCircle2 size={13} strokeWidth={3} />
                                    ) : (
                                      <XCircle size={13} strokeWidth={3} />
                                    )}
                                  </div>
                                  <span className="text-[11px] font-semibold uppercase tracking-tight text-muted/80 truncate">
                                    {item.label}
                                  </span>
                                </div>
                                <span
                                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                                    item.met
                                      ? "bg-success-100/80 dark:bg-success-900/20 text-success-700 dark:text-success-400"
                                      : "bg-danger-100/80 dark:bg-danger-900/20 text-danger-700 dark:text-danger-400"
                                  }`}
                                >
                                  {item.value}
                                </span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </>
                  )}

                  {!isChecking && status && (
                    <div className="space-y-3">
                      {!status.isModerator && status.lastBoost && (
                        <Alert
                          color="warning"
                          title="Boost on Cooldown"
                          classNames={{ title: "font-semibold" }}
                          description={`You can boost again in ${countdown}`}
                          variant="faded"
                        />
                      )}

                      {!isMe && !status.isModerator && (
                        <Alert
                          color="danger"
                          variant="flat"
                          className="rounded-2xl border border-danger-200/20 text-xs py-2"
                          description="Only original content can be boosted by the author."
                        />
                      )}

                      {status.results.age && !status.results.age.met && (
                        <Alert
                          color="danger"
                          variant="flat"
                          className="rounded-2xl border border-danger-200/20 text-xs py-2"
                          description={
                            status.extraChecks.ageSeconds < 300
                              ? "Post is too new. Please wait at least 5 minutes after posting."
                              : "Post is too old. Only posts newer than 5 days can be boosted."
                          }
                        />
                      )}

                      {needsPermission && (
                        <Alert
                          color="warning"
                          variant="flat"
                          className="rounded-2xl border border-warning-200/20 text-xs py-2"
                          title="Approval Required"
                          description="Apply for specialized boost privileges below."
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col xs:flex-row-reverse gap-3 mt-1">
                  {needsPermission ? (
                    <Button
                      fullWidth
                      color="warning"
                      isLoading={isRequestingPermission}
                      onPress={handleRequestPermission}
                      className="sm:order-2 h-12 rounded-2xl font-bold shadow-lg shadow-warning-500/20 active:scale-95 transition-transform"
                      startContent={
                        !isRequestingPermission && <Shield size={18} />
                      }
                    >
                      Request Approval
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      color="primary"
                      isDisabled={
                        !status?.canBoost || isChecking || isLaunching
                      }
                      isLoading={isPending && !isLaunching}
                      onPress={handleBoost}
                      className="sm:order-2 h-12 rounded-2xl font-bold shadow-xl shadow-primary-500/20 active:scale-95 transition-transform"
                      endContent={
                        !isPending &&
                        !isLaunching && (
                          <Rocket className="shrink-0" size={18} />
                        )
                      }
                    >
                      {isLaunching ? "Launching..." : "Launch Boost"}
                    </Button>
                  )}
                  <Button
                    fullWidth
                    variant="flat"
                    onPress={onClose}
                    className="sm:order-1 h-12 rounded-2xl font-semibold active:scale-95 transition-transform"
                  >
                    Maybe Later
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </SModal>
  );
}
