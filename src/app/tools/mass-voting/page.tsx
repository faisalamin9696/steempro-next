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

export default function MassVotingPage() {
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
        toast.info("Invalid private posting key");
        return;
      }

    if (!weight || parseFloat(weight) < 1 || parseFloat(weight) > 100) {
      toast.info("Invalid vote weight");
      return;
    }

    const links_array = links.match(/\bhttps?:\/\/\S+/gi);

    if (!links_array) {
      toast.info("Failed to parse links data");
      return;
    }

    if (links_array?.length <= 0) {
      toast.info("No links found");
      return;
    }
    if (advance) {
      const account = await getAccountExt(username);
      if (account) {
        try {
          const keyType = getKeyType(account, key);
          if (!keyType || !PrivKey.atLeast(keyType.type, "POSTING")) {
            toast.info("Invalid private posting key");
            return;
          }
        } catch {
          toast.info("Invalid private posting key");
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
        toast.error("Invalid credentials");
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
        <p className=" text-xl font-bold">Mass Voting</p>

        <div className="flex flex-col gap-4 w-full">
          <div className=" flex flex-row gap-2 items-center">
            <Input
              size="sm"
              isDisabled={!advance}
              label="Username"
              placeholder="Enter voter username"
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
                color={advance ? "primary" : "secondary"}
              >
                {`Use ${advance ? "default" : "different"} account`}
              </Button>
            )}
          </div>

          {advance && (
            <Input
              size="sm"
              value={key}
              onValueChange={setKey}
              isRequired={advance}
              label="Private key"
              isClearable
              placeholder="Enter your private posting key"
              type="password"
            />
          )}

          <Input
            size="sm"
            value={weight}
            onValueChange={setWeight}
            isRequired
            label="Vote weight"
            placeholder="Enter vote weight 0.1-100 %"
            inputMode="decimal"
            type="number"
            step={0.1}
            isClearable
            max={100}
            min={0.1}
            defaultValue="100"
          />

          <Textarea
            label={"Links"}
            isMultiline
            value={links}
            onValueChange={setLinks}
            placeholder="Paste the links here (separate by space)"
            disableAutosize
            rows={6}
          />

          <Button
            className="self-start"
            onPress={handleVoting}
            isLoading={loading}
          >
            Start Voting
          </Button>
        </div>
      </div>

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
    </div>
  );
}
