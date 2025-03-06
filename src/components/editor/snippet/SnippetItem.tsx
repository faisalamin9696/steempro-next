import MarkdownViewer from "@/components/body/MarkdownViewer";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import React, { useState } from "react";
import { FaPencil, FaRegCopy } from "react-icons/fa6";
import ClearFormButton from "../components/ClearFormButton";
import axios from "axios";
import { getCredentials, getSessionKey } from "@/libs/utils/user";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { cryptoUtils, Signature } from "@hiveio/dhive";
import { signMessage } from "@/libs/steem/condenser";
import { mutate } from "swr";

interface Props {
  snippet: Snippet;
  handleEdit?: (snippet: Snippet) => void;
  handleOnSelect?: (snippet: Snippet) => void;
}
function SnippetItem(props: Props) {
  const { snippet, handleEdit, handleOnSelect } = props;
  const { data: session } = useSession();
  const [isPending, setIsPending] = useState(false);

  async function deleteSnippet(
    hash: Buffer,
    signature: Signature,
    username: string,
    id: number
  ) {
    axios
      .post(
        "/api/snippet/delete",
        {
          username: username,
          hash: hash,
          signature: signature.toString(),
          id: id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        toast.success("Deleted successfully");
        mutate(`/api/snippet/snippets`);
      })
      .catch(function (error) {
        toast.error(error.message || JSON.stringify(error));
      })
      .finally(() => {
        setIsPending(false);
      });
  }

  function handleDelete(snippet: Snippet) {
    const credentials = getCredentials(getSessionKey(session?.user?.name));
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }

    setIsPending(true);

    if (credentials.keychainLogin) {
      const hash = cryptoUtils.sha256(credentials.username);
      window.steem_keychain.requestSignBuffer(
        credentials.username,
        credentials.username,
        "Posting",
        function (response) {
          if (response.success) {
            const signature = response.result;
            deleteSnippet(hash, signature, credentials.username, snippet.id);
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
      deleteSnippet(hash, signature, credentials.username, snippet.id);
    }
  }

  return (
    <Card className=" flex flex-row gap-4 comment-card p-2">
      <button
        className=" flex flex-col flex-1"
        disabled={isPending}
        onClick={() => {
          handleOnSelect && handleOnSelect(snippet);
        }}
      >
        <p className=" font-semibold bg-gray-300 dark:bg-gray-500 p-2 rounded-xl">
          {snippet.title}
        </p>
        <MarkdownViewer
          text={snippet.body}
          className="max-h-40 overflow-y-auto px-2"
        />
      </button>

      <div className=" flex flex-col gap-2">
        <Button
          title="Copy"
          variant="flat"
          color="secondary"
          size="sm"
          isDisabled={isPending}
          isIconOnly
          onPress={() => {
            navigator.clipboard.writeText(snippet.body).then(() => {
              toast.success("Copied");
            });
          }}
        >
          <FaRegCopy size={18} />
        </Button>

        <Button
          title="Edit"
          variant="flat"
          color="primary"
          size="sm"
          isDisabled={isPending}
          isIconOnly
          onPress={() => handleEdit && handleEdit(snippet)}
        >
          <FaPencil size={16} />
        </Button>

        <ClearFormButton
          divTitle="Delete"
          title="Do you really want to delete this snippet?"
          isLoading={isPending}
          onClearPress={() => {
            handleDelete(snippet);
          }}
        />
      </div>
    </Card>
  );
}

export default SnippetItem;
