import React, { useState } from "react";
import EditorInput from "../EditorInput";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { toast } from "sonner";
import axios from "axios";
import { useSession } from "next-auth/react";
import { getCredentials, getSessionKey } from "@/libs/utils/user";
import { cryptoUtils, Signature } from "@steempro/dsteem";
import { signMessage } from "@/libs/steem/condenser";
import moment from "moment";
import { useSWRConfig } from "swr";
import { useLogin } from "@/components/auth/AuthProvider";

interface Props {
  onClose: () => void;
  oldSnippet?: Snippet;
  onNewSnippet?: (snippet: Snippet) => void;
  onUpdateSnippet?: (snippet: Snippet) => void;
}
function AddSnippet(props: Props) {
  const { onClose, oldSnippet, onNewSnippet, onUpdateSnippet } = props;
  const { data: session } = useSession();
  let [title, setTitle] = useState(oldSnippet?.title ?? "");
  let [body, setBody] = useState(oldSnippet?.body ?? "");
  const [isPending, setIsPending] = useState(false);
  const { isAuthorized, authenticateUser } = useLogin();

  async function addSnippet(
    hash: Buffer,
    signature: Signature,
    username: string,
    title: string,
    body: string
  ) {
    title = title.trim();
    body = body.trim();

    const api = oldSnippet ? "/api/snippet/update" : "/api/snippet/add";

    axios
      .post(
        api,
        {
          username: username,
          hash: hash,
          signature: signature.toString(),
          title: title,
          body: body,
          created: moment().format(),
          modified: moment().format(),
          id: oldSnippet?.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        if (oldSnippet) {
          onUpdateSnippet &&
            onUpdateSnippet({ title, body, id: oldSnippet.id });
          toast.success("Updated successfully");
          return;
        }
        onNewSnippet &&
          onNewSnippet({ title, body, id: res?.data?.["insertId"] });
        toast.success("Added successfully");
      })
      .catch(function (error) {
        toast.error(error.message || JSON.stringify(error));
      })
      .finally(() => {
        setIsPending(false);
      });
  }

  async function handleSnippet() {
    if (!title || !body) {
      toast.info("Some fields are empty");
      return;
    }

    if (!isAuthorized()) {
      authenticateUser();
      return;
    }

    const credentials = getCredentials(getSessionKey(session?.user?.name));
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }

    setIsPending(true);

    let cbody = body.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "");

    if (credentials.keychainLogin) {
      const hash = cryptoUtils.sha256(credentials.username);

      window.steem_keychain.requestSignBuffer(
        credentials.username,
        credentials.username,
        "Posting",
        function (response) {
          if (response.success) {
            const signature = response.result;
            addSnippet(hash, signature, credentials.username, title, cbody);
          } else {
            toast.error(response.message);
            setIsPending(false);
          }
        }
      );
    } else {
      const { signature, hash } = signMessage(
        credentials.key,
        credentials.username
      );
      addSnippet(hash, signature, credentials.username, title, cbody);
    }
  }

  return (
    <div className=" flex flex-col gap-4">
      <Input
        placeholder="Title"
        size="md"
        value={title}
        onValueChange={setTitle}
        type="text"
        maxLength={255}
        isDisabled={isPending}
      />

      <EditorInput
        value={body}
        onChange={setBody}
        onImageUpload={() => {}}
        onImageInvalid={() => {}}
        maxLength={5000}
        isSnipping
        isDisabled={isPending}
      />

      <div className=" flex flex-row items-center gap-4 justify-between">
        <Button onPress={() => onClose()} isDisabled={isPending}>
          Back
        </Button>

        <Button
          color="success"
          variant="flat"
          onPress={handleSnippet}
          isDisabled={isPending}
          isLoading={isPending}
        >
          {oldSnippet ? "Update" : "Add"}
        </Button>
      </div>
    </div>
  );
}

export default AddSnippet;
