"use client";

import { useLogin } from "@/components/auth/AuthProvider";
import MassVotingModal from "@/components/MassVotingModal";
import { useAppSelector } from "@/constants/AppFunctions";
import { getKeyType } from "@/libs/steem/condenser";
import { getAccountExt } from "@/libs/steem/sds";
import { getResizedAvatar } from "@/utils/parseImage";
import { PrivKey, getCredentials, getSessionKey } from "@/utils/user";
import { Input, Textarea } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/utils/i18n";

export default function MassVotingPage() {
  const { t } = useTranslation();
  const { authenticateUser, isAuthorized, isLogin } = useLogin();
  const { data: session } = useSession();
  const [advance, setAdvance] = useState(!isLogin());
  let [username, setUsername] = useState(session?.user?.name || "");
  let [avatar, setAvatar] = useState(session?.user?.name || "");
  let loginInfo = useAppSelector((state) => state.loginReducer.value);

  const [links, setLinks] = useState("");
  const [weight, setWeight] = useState("");
  let [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  const [votingModal, setVotingModal] = useState<{
    isOpen: boolean;
    voterCredentials: {
      voter_account: AccountExt;
      voter_key: string;
      weight: string;
    };
    links: string[];
  }>({
    isOpen: false,
    voterCredentials: {
      voter_account: loginInfo,
      voter_key: key,
      weight: weight,
    },
    links: [],
  });

  useEffect(() => {
    if (!advance) {
      setUsername(session?.user?.name || "");
    }
  }, [session?.user?.name]);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      username = username.trim().toLowerCase();
      setAvatar(username);
    }, 1000);

    return () => clearTimeout(timeOut);
  }, [username]);

  async function handleVoting() {
    username = username.replace("@", "").toLowerCase();

    if (advance)
      if (!key) {
        toast.info(t("tools.invalid_private_posting_key"));
        return;
      }

    const weightValue = Number(weight);

    if (!weight || isNaN(weightValue) || weightValue < 1 || weightValue > 100) {
      toast.info(t("tools.weight_percentage_range"));
      return;
    }

    const links_array = links.match(/\bhttps?:\/\/\S+/gi);

    if (!links_array) {
      toast.info(t("tools.failed_to_parse_links"));
      return;
    }

    if (links_array?.length <= 0) {
      toast.info(t("tools.no_links_found"));
      return;
    }
    if (advance) {
      const account = await getAccountExt(username);
      if (account) {
        try {
          const keyType = getKeyType(account, key);
          if (!keyType || !PrivKey.atLeast(keyType.type, "POSTING")) {
            toast.info(t("tools.invalid_private_posting_key"));
            return;
          }
        } catch {
          toast.info(t("tools.invalid_private_posting_key"));
          return;
        }

        // temporarily update loginInfo with new data
        loginInfo = account;
      }
    } else {
      authenticateUser();

      if (!isAuthorized()) {
        return;
      }
      const credentials = getCredentials(getSessionKey(session?.user?.name));

      if (!credentials) {
        toast.error(t("tools.invalid_credentials"));
        return;
      }
      key = credentials.key;
    }

    setLoading(true);

    setVotingModal({
      isOpen: true,
      voterCredentials: {
        voter_account: loginInfo,
        voter_key: key,
        weight: weight,
      },
      links: links_array,
    });
  }

  return (
    <div>
      <div className="flex flex-col items-center gap-8">
        <p className=" text-xl font-bold">{t("tools.mass_voting_title")}</p>

        <div className="flex flex-col gap-4 w-full">
          <div className=" flex flex-row gap-2 items-center">
            <Input
              size="sm"
              isDisabled={!advance}
              label={t("common.username")}
              placeholder={t("tools.enter_voter_username")}
              isRequired
              className="flex-1"
              onValueChange={setUsername}
              value={username}
              endContent={<Avatar src={getResizedAvatar(avatar)} size="sm" />}
            />

            {isLogin() && (
              <Button
                size="sm"
                onPress={() => {
                  setAdvance(!advance);
                  setUsername(session?.user?.name || "");
                }}
                variant={"flat"}
                color={advance ? "success" : "primary"}
              >
                {advance ? t("tools.use_default_account") : t("tools.use_different_account")}
              </Button>
            )}
          </div>

          {advance && (
            <Input
              size="sm"
              value={key}
              onValueChange={setKey}
              isRequired={advance}
              label={t("tools.private_key")}
              isClearable
              placeholder={t("tools.enter_private_posting_key")}
              type="password"
            />
          )}

          <Input
            size="sm"
            value={weight}
            onValueChange={setWeight}
            isRequired
            label={t("tools.vote_weight")}
            placeholder={t("tools.enter_vote_weight")}
            inputMode="decimal"
            type="number"
            step={0.1}
            isClearable
            max={100}
            min={0.1}
            defaultValue="100"
          />

          <Textarea
            label={t("tools.links")}
            isMultiline
            value={links}
            onValueChange={setLinks}
            placeholder={t("tools.paste_links_here")}
            disableAnimation
            classNames={{
              input: "resize-y",
            }}
          />

          <Button onPress={handleVoting} isLoading={loading} color="primary">
            {t("tools.start_voting")}
          </Button>
        </div>
      </div>

      {votingModal.isOpen && (
        <MassVotingModal
          isOpen={votingModal.isOpen}
          handleOnComplete={() => {
            setLoading(false);
          }}
          onOpenChange={(isOpen) => {
            setVotingModal({ ...votingModal, isOpen: isOpen });
            setLoading(false);
          }}
          data={votingModal.voterCredentials}
          links={votingModal.links}
        />
      )}
    </div>
  );
}
