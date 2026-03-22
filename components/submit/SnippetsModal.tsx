"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Pencil, Trash2, Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import InfiniteList from "../InfiniteList";
import { Skeleton } from "@heroui/skeleton";
import SPopover from "../ui/SPopover";
import ErrorCard from "../ui/ErrorCard";
import MarkdownEditor from "./MarkdownEditor";
import SModal from "../ui/SModal";
import LoginAlertCard from "../ui/LoginAlertCard";
import { getSnippets, updateSnippet, addSnippet, deleteSnippet } from "@/libs/supabase/snippets";
import { useTranslations } from "next-intl";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (body: string) => void;
}

const MARKDOWN_TEMPLATES = [
  {
    id: "table",
    body: `| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`,
  },
  {
    id: "code-block",
    body: `\`\`\`javascript
function example() {
  console.log("Hello World");
}
\`\`\``,
  },
  {
    id: "collapsible",
    body: `<details>
<summary>Click to expand</summary>

Your content here...

</details>`,
  },
  {
    id: "divider",
    body: `---`,
  },
  {
    id: "task-list",
    body: `- Task 1
- Task 2
- Completed task`,
  },
  {
    id: "blockquote",
    body: `> This is a blockquote
> It can span multiple lines`,
  },
  {
    id: "image-grid",
    body: `<div class="pull-left">

![image-1.jpg](https://steemitimages.com/640x0/https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png)
<br>  
</div>

<div class="pull-right">

![image-2.jpg](https://steemitimages.com/640x0/https://cdn.steemitimages.com/DQmdgm8o8njXdFpdDgF5kuTXjJuAhSg6uPfHgTZu3RkirBE/image%20preview.001.png)  
<br>
</div>
`,
  },
  {
    id: "centered-text",
    body: `<center>

Your centered content here

</center>`,
  },
];

export default function SnippetsModal({
  isOpen,
  onOpenChange,
  onInsert,
}: Props) {
  const t = useTranslations("Submit.snippets");
  const { data: session } = useSession();
  const username = session?.user?.name;
  const [selectedTab, setSelectedTab] = useState<"snippets" | "templates">(
    "snippets"
  );
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [isPending, setIsPending] = useState(false);

  const {
    data: snippets,
    mutate: refreshSnippets,
    isLoading,
    error,
  } = useSWR(username ? ["snippets", username] : null, ([, user]) =>
    getSnippets(user)
  );

  const handleInsert = (body: string) => {
    onInsert(body);
    onOpenChange(false);
  };

  const handleSaveSnippet = async () => {
    if (!newTitle.trim() || !newBody.trim()) {
      toast.error("Title and body are required");
      return;
    }

    setIsPending(true);
    try {
      if (editingSnippet) {
        await updateSnippet(editingSnippet.id, {
          title: newTitle,
          body: newBody,
        });
        toast.success(t("updated"));
      } else {
        await addSnippet({
          username: username!,
          title: newTitle,
          body: newBody,
        });
        toast.success(t("created"));
      }
      setNewTitle("");
      setNewBody("");
      setEditingSnippet(null);
      setIsCreating(false);
      refreshSnippets();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteSnippet = async (id: number) => {
    setIsPending(true);
    try {
      await deleteSnippet(id);
      toast.success(t("deleted"));
      refreshSnippets();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsPending(false);
    }
  };

  const handleEditSnippet = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setNewTitle(snippet.title);
    setNewBody(snippet.body);
    setIsCreating(true);
  };

  const SnippetSkeleton = () => (
    <Card className="card w-full">
      <CardBody className="gap-2">
        <Skeleton className="h-5 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
      </CardBody>
    </Card>
  );

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="xl"
      scrollBehavior="inside"
      title={t("title")}
      description={t("description")}
    >
      {(onClose) => (
        <>
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as any)}
            className="w-full"
            classNames={{
              panel:'p-0'
            }}
          >
            <Tab key="snippets" title={t("mySnippets")}>
              <div className="flex flex-col gap-4 py-4">
                {!username ? (
                  <LoginAlertCard text={t("manageSnippets")} />
                ) : isCreating ? (
                  <Card>
                    <CardBody className="gap-3">
                      <Input
                        label={t("titleLabel")}
                        value={newTitle}
                        onValueChange={setNewTitle}
                        placeholder={t("titlePlaceholder")}
                        maxLength={200}
                      />

                      <MarkdownEditor
                        value={newBody}
                        onChange={setNewBody}
                        placeholder={t("contentPlaceholder")}
                        authors={[]}
                        hideSnippets
                        rows={6}
                      />
                    </CardBody>
                    <CardFooter className="gap-2">
                      <Button
                        variant="flat"
                        onPress={() => {
                          setIsCreating(false);
                          setEditingSnippet(null);
                          setNewTitle("");
                          setNewBody("");
                        }}
                        isDisabled={isPending}
                      >
                        {t("cancel")}
                      </Button>
                      <Button
                        color="primary"
                        onPress={handleSaveSnippet}
                        isLoading={isPending}
                      >
                        {editingSnippet ? t("update") : t("create")}
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <>
                    <Button
                      color="primary"
                      startContent={<Plus size={18} />}
                      onPress={() => setIsCreating(true)}
                      className="self-start"
                    >
                      {t("new")}
                    </Button>

                    {error ? (
                      <ErrorCard error={error} reset={refreshSnippets} />
                    ) : isLoading ? (
                      <SnippetSkeleton />
                    ) : (
                      <InfiniteList
                        data={snippets || []}
                        renderItem={(snippet) => (
                          <Card
                            key={snippet.id}
                            className="hover:bg-content2/50 w-full"
                          >
                            <CardBody className="gap-2">
                              <div className="flex justify-between items-start">
                                <h3 className="font-semibold">
                                  {snippet.title}
                                </h3>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    isIconOnly
                                    onPress={() => handleEditSnippet(snippet)}
                                    isDisabled={isPending}
                                  >
                                    <Pencil size={16} />
                                  </Button>

                                  <SPopover
                                    title={t("deleteTitle")}
                                    trigger={
                                      <Button
                                        size="sm"
                                        variant="flat"
                                        color="danger"
                                        isIconOnly
                                        isDisabled={isPending}
                                      >
                                        <Trash2 size={16} />
                                      </Button>
                                    }
                                    description={t("deleteDesc")}
                                  >
                                    {(onClose) => (
                                      <div className="flex gap-2 self-end">
                                        <Button
                                          variant="flat"
                                          onPress={onClose}
                                        >
                                          {t("cancel")}
                                        </Button>

                                        <Button
                                          color="danger"
                                          onPress={() => {
                                            onClose();
                                            handleDeleteSnippet(snippet.id);
                                          }}
                                        >
                                          {t("delete")}
                                        </Button>
                                      </div>
                                    )}
                                  </SPopover>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {snippet.body}
                              </p>
                            </CardBody>
                            <CardFooter>
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                startContent={<FileText size={16} />}
                                onPress={() => handleInsert(snippet.body)}
                              >
                                {t("insert")}
                              </Button>
                            </CardFooter>
                          </Card>
                        )}
                        noDataMessage={t("noSnippets")}
                        enableClientPagination
                        clientItemsPerPage={20}
                      />
                    )}
                  </>
                )}
              </div>
            </Tab>

            <Tab key="templates" title={t("templates")}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4">
                {MARKDOWN_TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    className="w-full hover:bg-content2/50"
                  >
                    <CardBody className="gap-2">
                      <h3 className="font-semibold">{t(`templateList.${template.id}`)}</h3>
                      <pre className="text-xs bg-default-100 p-2 rounded overflow-x-auto">
                        {template.body}
                      </pre>
                    </CardBody>
                    <CardFooter>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<FileText size={16} />}
                        onPress={() => handleInsert(template.body)}
                      >
                        {t("insert")}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </Tab>
          </Tabs>
        </>
      )}
    </SModal>
  );
}
