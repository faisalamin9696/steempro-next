"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { toast } from "sonner";
import { steemApi } from "@/libs/steem";
import { Share2, FileText, Send, CheckCircle2 } from "lucide-react";
import { extractMetadata, makeJsonMetadata, makeOptions } from "@/utils/editor";
import { handleSteemError } from "@/utils/steemApiError";
import { useAccountsContext } from "@/components/auth/AccountsContext";
import MarkdownEditor from "@/components/submit/MarkdownEditor";
import { Constants } from "@/constants";
import CommunitySelect from "@/components/community/CommunitySelect";
import { useTranslations } from "next-intl";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  userStats: any;
}

export const ActivityPublishModal = ({
  isOpen,
  onOpenChange,
  username,
  userStats,
}: Props) => {
  const t = useTranslations("Games.steemHeights.leaderboard.history.publish");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { authenticateOperation } = useAccountsContext();
  const [selectedCommunity, setSelectedCommunity] = useState<any>();

  // Calculate today's stats
  const totalPlays = userStats?.total_plays || 0;
  const peakAltitude = userStats?.highest_score || 0;
  const avgAltitude = Math.round(userStats?.avg_score || 0);
  const totalCombos = userStats?.total_combos || 0;
  // totalAltitude can be estimated by avg * plays
  const totalAltitude = Math.round(avgAltitude * totalPlays);

  const today = new Date().toDateString();
  const defaultTitle = `My Seasonal Journey on Steem Heights - ${today}`;
  const defaultBody = `![steem-heights.png](https://cdn.steemitimages.com/DQmTmKQbDgzjQnB4CFCMLemNa1hmo5bBt5C56GR9CtArCYN/steem-heights.png)

# My Seasonal Journey on Steem Heights 🏔️

I've been scaling the peaks! Here's my consolidated progress:

- 🚀 **Total Sessions**: ${totalPlays}
- 🏔️ **Personal Best**: ${peakAltitude}m
- ☁️ **Accumulated Height**: ${totalAltitude}m (Est.)
- 🎯 **Total Combos**: ${totalCombos}
- 📈 **Average Altitude**: ${avgAltitude}m

Think you can beat my score? Join the climb on Steem Heights!

[Play Steem Heights](https://www.steempro.com/games/steem-heights)

#steemheights #gaming #steempro #play2earn`;

  const [title, setTitle] = useState(defaultTitle);
  const [body, setBody] = useState(defaultBody);

  const handlePublish = async () => {
    if (!username) {
      toast.error("Please login to publish");
      return;
    }

    setIsPublishing(true);
    const dateStr = new Date().toISOString().split("T")[0];
    const permlink = `steem-heights-activity-${dateStr}`;
    const tags = ["steemheights", "gaming", "steempro", "play2earn"];
    if (selectedCommunity) {
      tags.unshift(selectedCommunity.account);
    }
    const jsonMetadata = makeJsonMetadata(extractMetadata(body), tags);

    const beneficiaries = [
      { account: Constants.official_account, weight: 1000 },
      { account: "null", weight: 500 },
    ].sort((a, b) => (a.account < b.account ? -1 : 1));

    const options = makeOptions({
      author: username,
      permlink,
      payoutType: Constants.reward_types[1],
      beneficiaries,
    });

    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("posting");
      await steemApi.publish(
        {
          author: username,
          title,
          body,
          permlink,
          parent_author: "",
          parent_permlink: selectedCommunity?.account || "steempro", // Posting to a general tag or community
          json_metadata: jsonMetadata,
        },
        options,
        key,
        useKeychain,
      );
      toast.success(t("successTitle"));

      setIsSuccess(true);
    }).finally(() => {
      setIsPublishing(false);
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      size="2xl"
      className="dark:bg-zinc-950 border border-white/10"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Share2 className="text-emerald-500" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tight">
                    {t("title")}
                  </h2>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                    {t("subtitle")}
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="py-6">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold">{t("successTitle")}</h3>
                  <p className="text-muted text-sm max-w-sm">
                    {t("successDesc")}
                  </p>
                  <Button
                    className="mt-4 bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px]"
                    onPress={() => {
                      setIsSuccess(false);
                      onClose();
                    }}
                  >
                    {t("close")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-300/50 dark:bg-zinc-900/50 border border-white/5 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-500 mb-2">
                      <FileText size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {t("statsTitle")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">
                          {t("totalPlays")}
                        </span>
                        <span className="text-lg font-black">{totalPlays}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">
                          {t("peakAltitude")}
                        </span>
                        <span className="text-lg font-black">
                          {peakAltitude}m
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">
                          {t("estTotal")}
                        </span>
                        <span className="text-lg font-black">
                          {totalAltitude}m
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-500">
                      <CheckCircle2 size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {t("supportTitle")}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                      {t.rich("supportDesc", {
                        pro: (chunks) => <span className="text-emerald-500 font-bold">{chunks}</span>,
                        steempro: (chunks) => <span className="text-foreground">{chunks}</span>,
                        burn: (chunks) => <span className="text-foreground">{chunks}</span>,
                        eco: (chunks) => <span className="text-emerald-500 font-bold">{chunks}</span>,
                      })}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <CommunitySelect
                      community={selectedCommunity}
                      onSelectCommunity={setSelectedCommunity}
                      label={t("selectCommunity")}
                      classNames={{
                        base: "max-w-full",
                        trigger:
                          "bg-zinc-300/50 dark:bg-zinc-900/50 border-white/5",
                      }}
                    />
                    <Input
                      label={t("postTitle")}
                      placeholder={t("postTitle")}
                      value={title}
                      onValueChange={setTitle}
                      readOnly
                      classNames={{
                        label: "text-zinc-500 font-bold uppercase text-[9px]",
                        input: "font-bold",
                        inputWrapper:
                          "bg-zinc-300/50 dark:bg-zinc-900/50 border-white/5 data-[hover=true]:border-white/10 group-data-[focus=true]:border-emerald-500/50",
                      }}
                    />
                    <MarkdownEditor
                      label={t("postContent")}
                      placeholder={t("descPlaceholder")}
                      value={body}
                      onValueChange={setBody}
                      minRows={10}
                      hideSnippets
                      insidePreview
                      classNames={{
                        // label: "text-zinc-500 font-bold uppercase text-[9px]",
                        input: "text-zinc-300 font-medium text-sm",
                        // inputWrapper:
                        //   "bg-zinc-300/50 dark:bg-zinc-900/50 border-white/5 data-[hover=true]:border-white/10 group-data-[focus=true]:border-emerald-500/50",
                      }}
                      onChange={() => {}}
                      authors={[]}
                    />
                  </div>
                </div>
              )}
            </ModalBody>
            {!isSuccess && (
              <ModalFooter className="border-t border-white/5 bg-zinc-300/20 dark:bg-zinc-900/20">
                <Button
                  variant="light"
                  className="text-zinc-500 font-black uppercase tracking-widest text-[10px]"
                  onPress={onClose}
                >
                  {t("cancel")}
                </Button>
                <Button
                  isLoading={isPublishing}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-900/20"
                  startContent={!isPublishing && <Send size={14} />}
                  onPress={handlePublish}
                >
                  {t("publishBtn")}
                </Button>
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
