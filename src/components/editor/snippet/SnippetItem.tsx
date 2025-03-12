import MarkdownViewer from "@/components/body/MarkdownViewer";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import React, { Key, useState } from "react";
import { FaEllipsis, FaPencil, FaRegCopy } from "react-icons/fa6";
import ClearFormButton from "../components/ClearFormButton";
import axios from "axios";
import { getCredentials, getSessionKey } from "@/libs/utils/user";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { cryptoUtils, Signature } from "@hiveio/dhive";
import { signMessage } from "@/libs/steem/condenser";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { RiEdit2Fill } from "react-icons/ri";
import { MdDelete } from "react-icons/md";

interface Props {
  snippet: Snippet;
  handleEdit?: (snippet: Snippet) => void;
  handleOnSelect?: (snippet: Snippet) => void;
  onDelete?: (snippet: Snippet) => void;
}
function SnippetItem(props: Props) {
  const { snippet, handleEdit, handleOnSelect, onDelete } = props;
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
        onDelete && onDelete(snippet);
        toast.success("Deleted successfully");
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

  async function handleMenuActions(key: Key) {
    switch (key) {
      case "edit":
        handleEdit && handleEdit(snippet);
        break;

      case "copy":
        navigator.clipboard.writeText(snippet.body).then(() => {
          toast.success("Copied");
        });

      case "delete":
        handleDelete(snippet);
        break;
      default:
        break;
    }
  }
  return (
    <Card className=" flex flex-row gap-0 comment-card">
      <Card
        as={"div"}
        isPressable
        className=" flex flex-col flex-1 border-r-1 border-default-100 rounded-none bg-transparent shadow-none rounded-l-xl"
        isDisabled={isPending}
        onPress={() => {
          handleOnSelect && handleOnSelect(snippet);
        }}
      >
        <p className=" font-semibold bg-gray-300/60 dark:bg-gray-500/30 p-2 rounded-tl-xl">
          {snippet.title}
        </p>
        <MarkdownViewer
          text={snippet.body}
          className="max-h-36 overflow-y-auto px-2 prose-a:pointer-events-none"
        />
      </Card>
      <div className=" p-2">
        <Dropdown>
          <DropdownTrigger>
            <Button
              size="sm"
              radius="full"
              isLoading={isPending}
              isDisabled={isPending}
              isIconOnly
              variant="light"
            >
              <FaEllipsis className="text-lg" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-labelledby="comment options"
            onAction={handleMenuActions}
            hideEmptyContent
          >
            <DropdownItem
              key={"copy"}
              color={"default"}
              startContent={<FaRegCopy size={18} />}
            >
              Copy
            </DropdownItem>

            <DropdownItem
              key={"edit"}
              color={"default"}
              startContent={<RiEdit2Fill size={18} />}
            >
              Edit
            </DropdownItem>

            <DropdownItem
              key={"delete"}
              color={"danger"}
              className="text-danger"
              startContent={<MdDelete size={18} />}
            >
              Delete
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </Card>
  );
}

export default SnippetItem;
