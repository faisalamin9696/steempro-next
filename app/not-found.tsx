"use client";

import { Card, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Suspense } from "react";
import LoadingCard from "@/components/ui/LoadingCard";

export default function NotFound() {
  return (
    <Suspense fallback={<LoadingCard />}>
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-200px)] w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          <Card className="border-none shadow-2xl bg-background/60 backdrop-blur-xl dark:bg-default-100/50">
            <CardBody className="flex flex-col items-center p-8 text-center gap-6">
              <div className="relative">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center text-warning relative z-10"
                >
                  <FileQuestion size={40} strokeWidth={1.5} />
                </motion.div>
                <div className="absolute inset-0 bg-warning/20 blur-2xl rounded-full z-0" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                  Page Not Found
                </h1>
                <p className="text-default-500 max-w-sm mx-auto leading-relaxed">
                  The page you are looking for does not exist or has been moved.
                </p>
              </div>

              <Button
                as={Link}
                href="/"
                color="warning"
                variant="shadow"
                startContent={<Home size={18} />}
                className="font-semibold px-8"
              >
                Go Home
              </Button>
            </CardBody>
            <CardFooter className="justify-center pb-6">
              <p className="text-[10px] text-default-400 uppercase tracking-[0.2em]">
                SteemPro Integrity Protection
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </Suspense>
  );
}
