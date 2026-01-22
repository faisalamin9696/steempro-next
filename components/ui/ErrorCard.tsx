"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  RotateCcw,
  Home,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from "lucide-react";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import Link from "next/link";

interface ErrorCardProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  message?: string;
  showHomeButton?: boolean;
}

const ErrorCard = ({
  error,
  reset,
  title = "Something went wrong",
  message = "An unexpected error occurred while processing your request.",
  showHomeButton = true,
}: ErrorCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex items-center justify-center p-4 min-h-[400px] w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <Card className="border-none shadow-2xl bg-background/60 backdrop-blur-xl dark:bg-default-100/50">
          <CardBody className="flex flex-col items-center p-8 text-center gap-6">
            {/* Animated Icon Container */}
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center text-danger relative z-10"
              >
                <AlertCircle size={40} strokeWidth={1.5} />
              </motion.div>
              {/* Decorative Glow */}
              <div className="absolute inset-0 bg-danger/20 blur-2xl rounded-full z-0" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-default-500 max-w-sm mx-auto leading-relaxed">
                {message}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full mt-2">
              <Button
                color="danger"
                variant="shadow"
                onPress={reset}
                startContent={<RotateCcw size={18} />}
                className="font-semibold px-8"
              >
                Try Again
              </Button>

              {showHomeButton && (
                <Button
                  as={Link}
                  href="/"
                  variant="flat"
                  startContent={<Home size={18} />}
                  className="font-medium"
                >
                  Go Home
                </Button>
              )}
            </div>

            {/* Error Details Section */}
            <div className="w-full mt-4">
              <Button
                variant="light"
                size="sm"
                fullWidth
                onPress={() => setShowDetails(!showDetails)}
                endContent={
                  showDetails ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )
                }
                className="text-default-400 font-normal hover:text-default-600 transition-colors"
              >
                {showDetails
                  ? "Hide Technical Details"
                  : "Show Technical Details"}
              </Button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-4 rounded-xl bg-default-100 text-left border border-default-200">
                      <div className="flex items-center gap-2 mb-2 text-danger/80">
                        <ShieldAlert size={14} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">
                          Debug Information
                        </span>
                      </div>
                      <code className="text-[12px] font-mono block text-default-600 break-all leading-relaxed">
                        {error.message || "Unknown error"}
                        {error.digest && (
                          <div className="mt-2 pt-2 border-t border-default-200/50">
                            Digest: {error.digest}
                          </div>
                        )}
                      </code>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardBody>
          <CardFooter className="justify-center pb-6">
            <p className="text-[10px] text-default-400 uppercase tracking-[0.2em]">
              SteemPro Integrity Protection
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default ErrorCard;
