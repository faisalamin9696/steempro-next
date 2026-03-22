import PageHeader from "@/components/ui/PageHeader";
import { Activity, Construction } from "lucide-react";
import React from "react";

export default function PostPayoutCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8 pb-20 max-w-7xl">
      <PageHeader
        title="Post Payout Calculator"
        description="Estimate the potential payouts of Steem posts based on upvotes."
        icon={Activity}
        color="warning"
      />

      <div className="flex flex-col flex-1 items-center justify-center p-12 text-center bg-content1 rounded-2xl border border-default-200">
        <Construction size={48} className="text-warning mb-4" />
        <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
        <p className="text-muted-foreground opacity-80 max-w-md">
          The Post Payout Calculator lets you forecast the earnings on a specific Steem post. We are currently building this feature. Check back soon!
        </p>
      </div>
    </div>
  );
}
