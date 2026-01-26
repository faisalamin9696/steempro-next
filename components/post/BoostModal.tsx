"use client";

import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import moment from "moment";
import { CheckCircle2, XCircle, Clock, Rocket, Shield } from "lucide-react";

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

  const isMe = session?.user?.name === post.author;

  useEffect(() => {
    if (isOpen && post.author) {
      checkAvailability();
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
    setIsPending(true);
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
        if (data.error === "NOT_FOLLOWED") {
          setNeedsPermission(true);
          throw new Error(data.message || "Permission required");
        }
        throw new Error(data.error || "Failed to boost post");
      }

      toast.success("Boost requested successfully!", {
        description: "Your post will be boosted soon.",
      });
      onOpenChange(false);
    } catch (error: any) {
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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Rocket className="text-primary" />
                <span>Boost Post</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-balance text-muted-foreground">
                  Boost your post to get extra visibility and support from the
                  SteemPro community.
                </p>

                <div className="flex flex-col gap-3 p-4 rounded-xl bg-content2/50 border border-divider">
                  {isChecking ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                  ) : (
                    criteriaList.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {item.met ? (
                            <CheckCircle2 size={18} className="text-success" />
                          ) : (
                            <XCircle size={18} className="text-danger" />
                          )}
                          <span
                            className={
                              item.met
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }
                          >
                            {item.label}
                          </span>
                        </div>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))
                  )}
                </div>

                {!isChecking && status && (
                  <>
                    {!status.isModerator && status.lastBoost && (
                      <Alert
                        color="warning"
                        variant="faded"
                        icon={<Clock size={20} />}
                        title="Boost on Cooldown"
                        description={`You can boost again in ${countdown}`}
                      />
                    )}

                    {!isMe && !status.isModerator && (
                      <Alert
                        color="danger"
                        variant="faded"
                        description="You can only boost your own posts."
                      />
                    )}

                    {needsPermission && (
                      <Alert
                        color="warning"
                        variant="faded"
                        icon={<Shield size={20} />}
                        title="Permission Required"
                        description="You need to be approved by the SteemPro team to use the boost service. Click below to request access."
                      />
                    )}
                  </>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              {needsPermission ? (
                <Button
                  color="warning"
                  isLoading={isRequestingPermission}
                  onPress={handleRequestPermission}
                  startContent={!isRequestingPermission && <Shield size={18} />}
                >
                  Request Permission
                </Button>
              ) : (
                <Button
                  color="primary"
                  isDisabled={!status?.canBoost || isChecking}
                  isLoading={isPending}
                  onPress={handleBoost}
                  startContent={!isPending && <Rocket size={18} />}
                >
                  Boost Now
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
