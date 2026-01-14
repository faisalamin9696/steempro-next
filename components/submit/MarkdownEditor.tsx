import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import SAvatar from "../ui/SAvatar";
import MentionInput, { MentionItem } from "../ui/MentionInput";
import Reputation from "../post/Reputation";
import { twMerge } from "tailwind-merge";
import { sdsApi } from "@/libs/sds";
import ImageUploadButton from "../post/ImageUploadButton";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CloudUpload,
  Code,
  Heading1,
  Heading2,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  SquareDashedBottomCode,
} from "lucide-react";
import {
  Divider,
  Spinner,
  Tab,
  Tabs,
  Textarea,
  TextAreaProps,
} from "@heroui/react";
import MarkdownViewer from "../post/body/MarkdownViewer";
import { extractMetadata } from "@/utils/editor";
import { steemApi } from "@/libs/steem";
import { useSession } from "next-auth/react";
import { toBase64 } from "@/utils/helper";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { filesize } from "filesize";
import { AsyncUtils } from "@/utils/async.utils";
import { useAccountsContext } from "../auth/AccountsContext";
import SnippetsModal from "./SnippetsModal";
import React from "react";

interface MarkdownEditorProps
  extends Omit<TextAreaProps, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  cardClass?: string;
  insidePreview?: boolean;
  body?: string;
  authors: string[];
  hideSnippets?: boolean;
  disabled?: boolean;
  placeholder?: string;
  classNames?: {
    input?: string;
  };
  rows?: number;
}

let debounceTimer: NodeJS.Timeout | null = null;
let lastResolve: ((value: MentionItem[]) => void) | null = null;

const ICON_SIZE = 18;

async function fetchUsers(
  query: string,
  users: MentionItem[]
): Promise<MentionItem[]> {
  return new Promise((resolve) => {
    if (debounceTimer) clearTimeout(debounceTimer);

    // Basic guards
    if (!query || query.length < 3) return resolve(users);

    // Prevent duplicate fetch for existing users
    const exists = users.filter((u) =>
      u.id.toString().startsWith(query.toLowerCase())
    );
    if (exists.length) return resolve(exists);

    // Save resolve to complete after debounce
    lastResolve = resolve as any;

    debounceTimer = setTimeout(async () => {
      try {
        const response = await sdsApi.getAccountsByPrefix(query);
        const results: MentionItem[] =
          response?.map((account) => {
            const { name, posting_json_metadata } = account || {};
            const { profile = {} } = JSON.parse(posting_json_metadata || "{}");
            const { name: displayName = name } = profile;

            return {
              id: account.name,
              display: displayName,
              reputation: account.reputation,
            };
          }) ?? [];

        lastResolve?.(results);
      } catch (error) {
        console.error("User fetch error:", error);
        lastResolve?.([]);
      }
    }, 300);
  });
}

const MarkdownEditor = ({
  value,
  onChange,
  cardClass,
  insidePreview,
  body = "",
  authors,
  hideSnippets,
  ...props
}: MarkdownEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: session } = useSession();
  const [progress, setProgress] = useState<number>(0);
  const [uploadCount, setUploadCount] = useState<number>(0);
  const { authenticateOperation } = useAccountsContext();

  const handleImagesOneByOne = useCallback(
    async (files: File[]): Promise<string> => {
      if (!textareaRef.current) throw new Error("Something went wrong!");

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      await AsyncUtils.sleep(0.2);
      // 1. Create all placeholders first with sequential indices to avoid collisions
      const fileData = files.map((file, index) => {
        const placeholder = `![Uploading ${file.name}... #${
          uploadCount + index + 1
        }]()`;
        return { file, placeholder };
      });
      setUploadCount((prev) => prev + files.length);

      const allPlaceholders =
        fileData.map((f) => f.placeholder).join("\n") +
        (fileData.length > 0 ? "\n" : "");

      // 2. Insert all placeholders at once at the current cursor position
      const currentValue = textarea.value;
      const newValueWithPlaceholders =
        currentValue.substring(0, start) +
        allPlaceholders +
        currentValue.substring(end);

      onChange(newValueWithPlaceholders);

      let currentText = newValueWithPlaceholders;
      let uploadErrors: string[] = [];

      // 3. Upload images one by one
      for (let i = 0; i < fileData.length; i++) {
        const { file, placeholder } = fileData[i];

        try {
          // Convert to base64 and sign the image
          const base64Data = (await toBase64(file)) as string;
          const { key, useKeychain } = await authenticateOperation("posting");
          const signature = await steemApi.signImage(
            session?.user?.name!,
            base64Data,
            key,
            useKeychain
          );

          if (!signature) {
            throw new Error("Signing failed");
          }

          setProgress(0);

          // Upload the image
          const uploadResult = await steemApi.uploadImage(
            file,
            session?.user?.name!,
            signature.toString(),
            setProgress
          );

          if (!uploadResult) {
            throw new Error("No URL returned from server");
          }

          // Replace the specific placeholder with the final markdown
          const finalMarkdown = `![${file.name}](${uploadResult})`;

          // Update our local tracking variable and the editor state
          currentText = currentText.replace(placeholder, finalMarkdown);
          onChange(currentText);
          setProgress(0);

          // Optional delay between uploads to avoid rate limiting or UI jitter
          if (i < fileData.length - 1) {
            await new Promise((r) => setTimeout(r, 500));
          }
        } catch (err: any) {
          console.error(`Upload failed for ${file.name}:`, err);
          const errorMessage = err?.message || "Unknown error";
          uploadErrors.push(`${file.name}: ${errorMessage}`);

          const errorMarkdown = `![${file.name}](UPLOAD_FAILED)`;
          currentText = currentText.replace(placeholder, errorMarkdown);
          onChange(currentText);
          setProgress(0);
        }
      }

      if (uploadErrors.length > 0) {
        throw new Error(uploadErrors.join(", "));
      }

      return currentText;
    },
    [session?.user?.name, uploadCount, onChange]
  );

  const handleUploads = useCallback(
    (files: File[]) => {
      return toast.promise(handleImagesOneByOne(files), {
        loading: "Uploading...",
        success: () => "Uploaded successfully",
        error: (error) => error.message || "Upload failed",
      });
    },
    [handleImagesOneByOne]
  );

  const handlePastedImage = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];

      for (const item of Array.from(items)) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }

      if (files.length > 0) {
        handleUploads(files);
      }
    },
    [handleUploads]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.addEventListener("paste", handlePastedImage);
    return () => textarea.removeEventListener("paste", handlePastedImage);
  }, [handlePastedImage]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      handleUploads(acceptedFiles);
    },
    [handleUploads]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDrop,
    noClick: true,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/svg+xml": [],
      "image/webp": [],
      "image/gif": [],
    },
  });

  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
  const [isSnippetsModalOpen, setIsSnippetsModalOpen] = useState(false);
  const initialUsers = useMemo(() => {
    const uniqueUsernames = new Set([
      ...(extractMetadata(body)?.users ?? []),
      ...authors,
    ]);
    return Array.from(uniqueUsernames)
      .filter((username) => username?.trim())
      .map((username) => ({
        id: username,
        display: username,
        reputation: null,
      }));
  }, [body, authors]);

  const insertMarkdown = (before: string, after: string = "") => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const newValue =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newValue);

    // Set cursor position after the inserted markdown
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleInsertSnippet = (snippetBody: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newValue =
      value.substring(0, start) + snippetBody + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newPosition = start + snippetBody.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<any>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          insertMarkdown("**", "**");
          break;
        case "i":
          e.preventDefault();
          insertMarkdown("*", "*");
          break;
        case "k":
          e.preventDefault();
          insertMarkdown("[", "](url)");
          break;
        case "q":
          e.preventDefault();
          insertMarkdown("> ", "\n");
          break;
      }
    }
  };

  const toolbarButtons = [
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => insertMarkdown("# ", "\n"),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => insertMarkdown("## ", "\n"),
    },
    {
      icon: Bold,
      label: "Bold (Ctrl+B)",
      action: () => insertMarkdown("**", "**"),
    },
    {
      icon: Italic,
      label: "Italic (Ctrl+I)",
      action: () => insertMarkdown("*", "*"),
    },
    {
      icon: List,
      label: "Bullet List",
      action: () => insertMarkdown("- ", "\n"),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => insertMarkdown("1. ", "\n"),
    },
    {
      icon: Link,
      label: "Link (Ctrl+K)",
      action: () => insertMarkdown("[", "](url)"),
    },
    {
      icon: Quote,
      label: "Quote (Ctrl+Q)",
      action: () => insertMarkdown("> ", "\n"),
    },
    { icon: Code, label: "Code", action: () => insertMarkdown("`", "`") },
    {
      icon: AlignLeft,
      label: "Align Left",
      action: () => insertMarkdown(`<div class="pull-left">\n`, "\n</div>"),
    },
    {
      icon: AlignCenter,
      label: "Align Center",
      action: () => insertMarkdown(`<center>\n`, "\n</center>"),
    },
    {
      icon: AlignRight,
      label: "Align Right",
      action: () => insertMarkdown(`<div class="pull-right">\n`, "\n</div>"),
    },

    {
      icon: AlignJustify,
      label: "Align Justify",
      action: () => insertMarkdown(`<div class="text-justify">\n`, "\n</div>"),
    },
  ];

  return (
    <div {...getRootProps()} id="body" className="space-y-1 relative">
      {isDragActive && (
        <div className="flex flex-row justify-center w-full absolute  h-full rounded-lg z-[11] backdrop-blur-[2px] bg-foreground/10">
          <div className="text-center self-center">
            <CloudUpload className="mx-auto text-5xl" />

            <h3 className="mt-2 text-sm font-medium text-default-600">
              <span>Drag and drop to upload</span>
            </h3>
            <p className="mt-1 text-xs text-default-400">
              PNG, JPG, GIF up to {filesize(10000000)}
            </p>
          </div>
        </div>
      )}

      <Card
        shadow="none"
        radius="none"
        className="gap-1 p-2 bg-default-100 border border-border rounded-t-xl"
        isDisabled={props.disabled}
      >
        {selectedTab !== "preview" && (
          <div className="flex flex-row gap-1 justify-between">
            <div className="flex flex-wrap gap-1">
              {toolbarButtons.map((button, index) => (
                <Button
                  key={index}
                  variant="light"
                  size="sm"
                  onPress={button.action}
                  className={twMerge(
                    "min-w-0 min-h-0 h-8 w-8 p-0 text-default-900 hover:text-teal-500"
                  )}
                  title={button.label}
                  type="button"
                  isDisabled={props.disabled}
                >
                  <button.icon size={ICON_SIZE} />
                </Button>
              ))}

              <ImageUploadButton
                variant="light"
                size="sm"
                iconSize={ICON_SIZE}
                className="min-w-0 min-h-0 h-8 w-8 p-0 text-teal-600 hover:text-teal-500"
                onImagesSelected={handleUploads}
                isDisabled={props.disabled}
                progress={progress}
              />
            </div>
            {!hideSnippets && (
              <Button
                variant="light"
                size="sm"
                onPress={() => setIsSnippetsModalOpen(true)}
                className={twMerge(
                  "min-w-0 min-h-0 h-8 w-8 p-0 text-purple-600 hover:text-purple-500"
                )}
                title={"Snippets"}
                type="button"
                isDisabled={props.disabled}
              >
                <SquareDashedBottomCode size={ICON_SIZE} />
              </Button>
            )}
          </div>
        )}

        {insidePreview && (
          <div className="flex flex-col gap-2">
            {selectedTab !== "preview" && <Divider />}
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(e) => setSelectedTab(e.toString() as any)}
              className="w-full"
              classNames={{
                panel: "px-0",
              }}
              size="sm"
              color="primary"
              radius="full"
              isDisabled={props.disabled}
            >
              <Tab key={"write"} title="Write"></Tab>
              <Tab key={"preview"} title="Preview"></Tab>
            </Tabs>
          </div>
        )}
      </Card>

      <Card
        shadow="none"
        radius="none"
        className="rounded-b-xl border border-border"
        isDisabled={props.disabled}
      >
        <CardBody className={twMerge(cardClass, "p-0")}>
          {selectedTab === "write" ? (
            <MentionInput
              ref={textareaRef}
              onKeyDown={handleKeyDown}
              value={value}
              onChange={onChange}
              onSearch={(query) => fetchUsers(query, initialUsers)}
              placeholder="Write your post content here... Use @ to mention users"
              variant="flat"
              radius="none"
              size="lg"
              disableAutosize
              disableAnimation
              className="bg-transparent"
              rows={props.rows ?? 10}
              classNames={{
                input: twMerge("resize-y min-h-10"),
                base: "h-full rounded-none!",
                inputWrapper: "h-full rounded-none!",
              }}
              renderSuggestion={(item, focused) => (
                <div
                  className={twMerge(
                    "flex w-full items-center justify-between px-4 py-2 text-sm transition",
                    focused && "bg-foreground/10"
                  )}
                >
                  <div className="flex flex-row items-center gap-2">
                    <SAvatar
                      size={"sm"}
                      username={item.id.toString()}
                      showLink={false}
                    />
                    <div className="flex flex-col text-left">
                      <p className="font-semibold text-xs leading-none">
                        {item.display}
                      </p>
                      <p className="text-[10px] text-muted">@{item.id}</p>
                    </div>
                  </div>
                </div>
              )}
              {...props}
            />
          ) : (
            <div className="flex flex-col items-center w-full p-3 min-h-40">
              <div className="flex flex-col lg:max-w-[65ch] w-full gap-2 self-center">
                <MarkdownViewer body={value} />
              </div>
            </div>
          )}
        </CardBody>
        <input
          style={{ width: 0, height: 0 }}
          {...getInputProps()}
          name="images"
          hidden
          aria-hidden
          id="dropzone"
          accept="image/png, image/gif, image/jpeg, image/jpg"
        />
      </Card>

      {isSnippetsModalOpen && (
        <SnippetsModal
          isOpen={isSnippetsModalOpen}
          onOpenChange={setIsSnippetsModalOpen}
          onInsert={handleInsertSnippet}
        />
      )}
    </div>
  );
};

export default MarkdownEditor;
