"use client";

import { motion, Variants } from "framer-motion";
import { Hammer, Clock, ShieldAlert, Activity } from "lucide-react";
import { Card, CardBody } from "@heroui/card";
import moment from "moment";
import { twMerge } from "tailwind-merge";

interface MaintenanceCardProps {
  message?: string;
  estimatedBackTime?: string | Date;
  className?: string;
}

const MaintenanceCard = ({
  message = "We're currently performing some scheduled upgrades to enhance your experience. We'll be back shortly!",
  estimatedBackTime,
  className,
}: MaintenanceCardProps) => {
  const formattedTime = estimatedBackTime
    ? moment(estimatedBackTime).calendar(null, {
        sameDay: "[Today at] h:mm A",
        nextDay: "[Tomorrow at] h:mm A",
        nextWeek: "dddd [at] h:mm A",
        lastDay: "[Yesterday at] h:mm A",
        lastWeek: "[Last] dddd [at] h:mm A",
        sameElse: "MMM Do, YYYY [at] h:mm A",
      })
    : null;

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={twMerge("w-full max-w-2xl mx-auto", className)}
    >
      <Card className="border-none shadow-2xl bg-background/60 backdrop-blur-xl dark:bg-default-100/50 rounded-3xl overflow-hidden">
        <CardBody className="p-8 md:p-12 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center space-y-4">
            <motion.div
              variants={itemVariants}
              className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 relative"
            >
              <Hammer size={40} strokeWidth={1.5} />
              <div className="absolute -top-1 -right-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Scheduled Maintenance
              </h3>
              <p className="text-default-500 max-w-md mx-auto leading-relaxed">
                {message}
              </p>
            </motion.div>
          </div>

          {/* Estimated Recovery Time */}
          {formattedTime && (
            <motion.div
              variants={itemVariants}
              className="rounded-2xl bg-default-100/50 border border-default-200 p-6 flex flex-col items-center text-center space-y-2"
            >
              <div className="flex items-center gap-2 text-primary/80">
                <Clock size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Estimated Back By
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formattedTime}
              </p>
            </motion.div>
          )}

          {/* System Footer Info */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] text-default-400 uppercase tracking-widest pt-4 border-t border-default-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-success rounded-full" />
              <span>Nodes Active</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldAlert size={12} className="text-primary/60" />
              <span>System Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-primary/60" />
              <span>Uptime Optimized</span>
            </div>
          </motion.div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default MaintenanceCard;
