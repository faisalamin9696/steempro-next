"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
} from "@heroui/react";
import { ShieldCheck, RefreshCcw, LogIn, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { supabase } from "@/libs/supabase/supabase";

export default function MigrationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    // Check if the old secure storage key exists
    const hasOldData = localStorage.getItem("@secure.j.auth");
    if (hasOldData) {
      setIsOpen(true);
    }
  }, []);

  const handleReset = async () => {
    setIsPending(true);

    try {
      localStorage.clear();
      sessionStorage.clear();
      await signOut();
      await supabase.auth.signOut();
      // Use a small timeout to let the UI update before reload
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      backdrop="blur"
      size="lg"
      isDismissable={false}
      hideCloseButton
      classNames={{
        base: "border border-white/10 bg-background/60 backdrop-blur-xl",
        header: "border-b border-white/5",
        footer: "border-t border-white/5",
      }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: 20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 py-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/20 rounded-xl">
                  <ShieldCheck className="text-primary" size={24} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  A New Beginning
                </h2>
              </div>
            </ModalHeader>
            <ModalBody className="pb-8 pt-2">
              <div className="space-y-6">
                <p className="text-foreground/80 leading-relaxed text-balance">
                  Welcome to the all-new <b>SteemPro</b>. For a seamless
                  migration and to ensure your experience is stable, we need to
                  refresh your local application data.
                </p>

                <div className="grid grid-cols-1 gap-4">
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="bg-primary/5 border-none shadow-none">
                      <CardBody className="flex flex-row items-center gap-4 py-4">
                        <div className="p-2.5 bg-primary/10 rounded-lg">
                          <RefreshCcw size={20} className="text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold uppercase tracking-wide opacity-90">
                            Smooth Migration
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Optimizes data for current architecture.
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="bg-success/5 border-none shadow-none">
                      <CardBody className="flex flex-row items-center gap-4 py-4">
                        <div className="p-2.5 bg-success/10 rounded-lg">
                          <LogIn size={20} className="text-success" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold uppercase tracking-wide opacity-90">
                            Secure Re-login
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Sign back in normally to restore access.
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-3 p-4 bg-warning/10 rounded-2xl border border-warning/20 shadow-inner"
                >
                  <AlertTriangle
                    size={20}
                    className="text-warning shrink-0 mt-0.5"
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-warning-700 uppercase tracking-tighter">
                      Important Notice
                    </p>
                    <p className="text-[11px] text-warning-600/90 leading-tight">
                      This will clear local settings and sessions. Your
                      blockchain account and private keys are never at risk
                      during this process.
                    </p>
                  </div>
                </motion.div>
              </div>
            </ModalBody>
            <ModalFooter className="p-6 bg-content1/20 flex flex-col gap-3">
              <Button
                color="primary"
                variant="shadow"
                fullWidth
                size="lg"
                onPress={handleReset}
                className="font-semibold tracking-tight"
                isLoading={isPending}
                startContent={
                  !isPending && (
                    <RefreshCcw size={20} className="animate-spin-slow" />
                  )
                }
              >
                Reset & Restart App
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
