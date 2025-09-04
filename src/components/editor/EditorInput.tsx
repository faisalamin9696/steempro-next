"use client";

import "@webscopeio/react-textarea-autocomplete/style.css";
import "./style.scss";
import {
  useState,
  useRef,
  useCallback,
  memo,
  useEffect,
  CSSProperties,
} from "react";
import { useDropzone } from "react-dropzone";
import { MAXIMUM_UPLOAD_SIZE, isValidImage } from "@/utils/parseImage";
import { toast } from "sonner";
import { toBase64 } from "@/utils/helper";
import { signImage, uploadImage } from "@/libs/steem/condenser";
import { useLogin } from "../auth/AuthProvider";
import { getCredentials, getSessionKey } from "@/utils/user";
import { filesize } from "filesize";
import { FaCloudUploadAlt } from "react-icons/fa";
import SAvatar from "../ui/SAvatar";
import LoadingCard from "../LoadingCard";
import { getAccountsByPrefix } from "@/libs/steem/sds";
import { useSession } from "next-auth/react";
import { validate_account_name } from "@/utils/chainValidation";
import { useDisclosure } from "@heroui/modal";
import SnippetModal from "../SnippetModal";
import { Button } from "@heroui/button";
import { AiOutlineFileSearch } from "react-icons/ai";
import { BiImageAdd, BiHide } from "react-icons/bi";
import {
  TbBold,
  TbItalic,
  TbH1,
  TbH2,
  TbList,
  TbListNumbers,
  TbQuote,
  TbCode,
  TbLink,
  TbAlignLeft,
  TbAlignCenter,
  TbAlignRight,
  TbAlignJustified,
  TbTable,
} from "react-icons/tb";
import { KeyboardEvent } from "react";

const MAX_FILE_TO_UPLOAD = 10;

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  isDisabled?: boolean;
  users?: string[];
  maxLength?: number;
  isSnipping?: boolean;
  containerStyle?: CSSProperties | undefined;
}

let timeout: any = null;
let imagesToUpload: { file: any; temporaryTag: string }[] = [];

interface UploadImageInput {
  file: File;
  temporaryTag: string;
}

const getFileExtension = (file: File): string => {
  return file.name.split(".").pop()?.toLowerCase() || "";
};

export default memo(function EditorInput(props: EditorProps) {
  let {
    value,
    onChange,
    users,
    rows,
    isDisabled,
    maxLength,
    isSnipping,
    containerStyle,
  } = props;

  let { authenticateUser, isAuthorized, credentials } = useLogin();
  const { data: session } = useSession();
  const ReactTextareaAutocomplete =
    require("@webscopeio/react-textarea-autocomplete").default;

  const postInput = useRef<any>(null);
  let [imagesUploadCount, setImagesUploadCount] = useState(0);
  const snippetDisclosure = useDisclosure();

  const onDrop = useCallback((acceptedFiles: any[], rejectedFiles: any[]) => {
    if (!acceptedFiles.length) {
      if (rejectedFiles.length) {
        toast.info("Please insert only image files.");
      }
      return;
    }

    if (acceptedFiles.length > MAX_FILE_TO_UPLOAD) {
      toast.info(`Please upload up to maximum ${MAX_FILE_TO_UPLOAD} images.`);
      // console.log('onPick too many files to upload');
      return;
    }

    authenticateUser();

    if (isAuthorized()) {
      for (let fi = 0; fi < acceptedFiles.length; fi += 1) {
        const acceptedFile = acceptedFiles[fi];
        const imageToUpload = {
          file: acceptedFile,
          temporaryTag: "",
        };

        if (!imageToUpload.file.type.includes("image")) {
          toast.info("Please insert only image files.");
          return;
        }

        imagesToUpload.push(imageToUpload);

        if (fi === acceptedFiles.length - 1) {
          insertPlaceHolders();
          uploadNextImage();
        }
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/svg+xml": [],
      "image/webp": [],
      "image/gif": [],
    },
  });

  useEffect(() => {
    if (postInput?.current) {
      postInput.current.addEventListener("paste", handlePastedImage);
    }

    return () =>
      postInput?.current?.removeEventListener("paste", handlePastedImage);
  }, []);

  function hotKeyHandler(event: KeyboardEvent<HTMLDivElement>) {
    const textarea = postInput.current;
    if (!textarea) return;

    // allow only Alt key
    if (document.activeElement !== textarea) return;

    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case "b":
          event.preventDefault();
          insertMarkdown("**", "**");
          break;
        case "i":
          event.preventDefault();
          insertMarkdown("*", "*");
          break;
        case "k":
          event.preventDefault();
          insertMarkdown("![alt](url", ")");
          break;
        case "e":
          event.preventDefault();
          insertMarkdown("```", "```");
          break;
        case "j":
          event.preventDefault();
          insertMarkdown('<div class="text-justify">\n\n', "\n</div>");
          break;
        default:
          break;
      }
    }
  }

  function handlePastedImage(e: any) {
    if (e.clipboardData && e.clipboardData.items) {
      const items = e.clipboardData.items;
      Array.from(items).forEach((item: any) => {
        if (item.kind === "file" && /^image\//.test(item.type)) {
          e.preventDefault();

          const blob = item.getAsFile();

          if (!isValidImage(blob)) {
            return;
          }

          authenticateUser();

          if (isAuthorized()) {
            imagesToUpload.push({
              file: blob,
              temporaryTag: "",
            });

            insertPlaceHolders();
            uploadNextImage();
          }
        }
      });
    }
  }

  function setValue(newValue: string, start?: number, end?: number) {
    onChange(newValue);

    if (start && end) {
      setTimeout(() => {
        postInput?.current?.setSelectionRange(start, end);
      }, 0);
    }
  }

  const insertMarkdown = (before: string, after: string = "") => {
    if (!postInput.current) return;

    const start = postInput.current.selectionStart;
    const end = postInput.current.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = before + selectedText + after;

    const newContent =
      value.substring(0, start) + newText + value.substring(end);
    setValue(newContent);

    // Focus and set cursor position
    setTimeout(() => {
      if (postInput.current) {
        postInput.current.focus();
        postInput.current.setSelectionRange(
          start + before.length,
          start + before.length + selectedText.length
        );
        const cursorPos = 5;
        scrollToCursor(
          postInput.current,
          start + before.length + selectedText.length
        );
      }
    }, 0);
  };

  function scrollToCursor(textarea, pos) {
    // Create a temporary span to measure the position
    const span = document.createElement("span");
    const textBeforeCursor = textarea.value.substring(0, pos);
    span.textContent = textBeforeCursor;

    // Style the span to match the textarea's text
    const style = window.getComputedStyle(textarea);
    span.style.font = style.font;
    span.style.whiteSpace = "pre-wrap";
    span.style.width = textarea.clientWidth + "px";
    span.style.position = "absolute";
    span.style.visibility = "hidden";
    span.style.left = "-9999px";

    document.body.appendChild(span);

    // Calculate the height of the text before the cursor
    const height = span.offsetHeight;
    document.body.removeChild(span);

    // Scroll the textarea
    textarea.scrollTop = height - textarea.clientHeight / 2;
  }

  function handleImageSelection() {
    authenticateUser();
    if (isAuthorized()) {
      open();
    }
  }

  const toolbarActions = [
    {
      icon: TbBold,
      action: () => insertMarkdown("**", "**"),
      title: "Bold (Ctrl+B)",
    },
    {
      icon: TbItalic,
      action: () => insertMarkdown("*", "*"),
      title: "Italic (Ctrl+I)",
    },
    { icon: TbH1, action: () => insertMarkdown("# "), title: "Heading 1" },
    {
      icon: TbH2,
      action: () => insertMarkdown("## "),
      title: "Heading 2",
      showDivider: true,
    },
    { icon: TbList, action: () => insertMarkdown("- "), title: "Bullet List" },
    {
      icon: TbListNumbers,
      action: () => insertMarkdown("1. "),
      title: "Numbered List",
      showDivider: true,
    },
    { icon: TbQuote, action: () => insertMarkdown("> "), title: "Quote" },
    {
      icon: TbCode,
      action: () => insertMarkdown("```", "```"),
      title: "Code (Ctrl+E)",
    },
    // { icon: TbFile, action: () => insertMarkdown('```\n', '\n```'), title: 'Code Block' },
    {
      icon: TbLink,
      action: () => insertMarkdown("[Url](https://", ")"),
      title: "Link (Ctrl+K)",
      showDivider: true,
    },
    { icon: BiImageAdd, action: () => handleImageSelection(), title: "Image" },
    {
      icon: BiHide,
      action: () =>
        insertMarkdown(">! [Click to reveal]", "Your spoiler content "),
      title: "Spoiler",
      showDivider: true,
    },
    {
      icon: TbAlignLeft,
      action: () => insertMarkdown('<div class="pull-left">\n\n', "\n</div>"),
      title: "Align Left",
    },
    {
      icon: TbAlignCenter,
      action: () => insertMarkdown("<center>\n", "\n</center>"),
      title: "Align Center",
    },
    {
      icon: TbAlignRight,
      action: () => insertMarkdown('<div class="pull-right">\n\n', "\n</div>"),
      title: "Align Right",
    },
    {
      icon: TbAlignJustified,
      action: () =>
        insertMarkdown('<div class="text-justify">\n\n', "\n</div>"),
      title: "Justify (Ctrl+J)",
      showDivider: true,
    },
    {
      icon: TbTable,
      action: () =>
        insertMarkdown(
          "| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n"
        ),
      title: "Table",
    },
  ];

  function handleChange(text: string) {
    setValue(text);
  }

  function insertImage(responseData: {
    url: string;
    isPlaceholder?: boolean;
    imgMd?: string;
  }) {
    if (!postInput) return;

    const startPos = postInput?.current?.selectionStart;
    const endPos = postInput?.current?.selectionEnd;
    const oldValue = postInput.current?.value || "";

    if (responseData.url) {
      if (responseData.isPlaceholder) {
        const newValue = `${oldValue.substring(0, startPos)}${
          responseData.url
        }${oldValue.substring(endPos, oldValue.length)}`;

        setValue(
          newValue,
          startPos + responseData.url.length,
          startPos + responseData.url.length
        );
      } else {
        if (responseData.imgMd) {
          const newValue = oldValue.replace(
            responseData.url,
            responseData.imgMd
          );
          setValue(
            newValue,
            startPos + newValue.length,
            startPos + newValue.length
          );
        }
      }
    }
  }

  const insertPlaceHolders = () => {
    let placeholder = "";
    for (let ii = 0; ii < imagesToUpload.length; ii += 1) {
      const imageToUpload: any = imagesToUpload[ii];
      if (imageToUpload.temporaryTag === "") {
        imagesUploadCount++;
        imageToUpload.temporaryTag = `![Uploading image #${imagesUploadCount}...]()`;
        placeholder += `\n${imageToUpload.temporaryTag}\n`;
      }
    }
    // Insert the temporary tag where the cursor currently is
    insertImage({ url: placeholder, isPlaceholder: true });

    setImagesUploadCount(imagesUploadCount);
  };

  const uploadNextImage = () => {
    if (imagesToUpload.length) {
      const nextImage = imagesToUpload.pop();
      // this.upload(nextImage);
      _uploadImage(nextImage);
    }
  };

  const _uploadImage = async (image?: UploadImageInput) => {
    if (!image) {
      throw new Error("Invalid image");
    }

    const credentials = getCredentials(getSessionKey(session?.user?.name));

    if (!credentials?.key || !credentials?.username) {
      toast.error("Invalid credentials");
      return;
    }

    const imageName = image.file.name?.substring(0, 20) || "image";

    toast.promise(
      async () => {
        const base64Data = await toBase64(image.file);
        const signature = await signImage(
          credentials.username,
          base64Data,
          credentials.key,
          credentials.keychainLogin
        );

        const result = await uploadImage(
          image.file,
          credentials.username,
          signature
        );
        return result;
      },
      {
        closeButton: false,
        loading: "Uploading...",
        success: (res: any) => {
          if (!res?.url) throw new Error(res?.error || "No image URL returned");

          const imageMd = `![${imageName}](${res.url})`;

          insertImage({
            url: image.temporaryTag,
            isPlaceholder: false,
            imgMd: imageMd,
          });

          uploadNextImage();
          return "Uploaded successfully";
        },
        error: (error: any) => {
          const imageMd = `![${
            imageName +
            (getFileExtension(image.file) && `.${getFileExtension(image.file)}`)
          }](UPLOAD FAILED)`;

          insertImage({
            url: image.temporaryTag,
            isPlaceholder: false,
            imgMd: imageMd,
          });

          console.error("Upload error:", error);
          const message = extractUploadErrorMessage(error);
          return message;
        },
        finally() {
          uploadNextImage();
        },
      }
    );
  };

  const extractUploadErrorMessage = (error: any): string => {
    const errStr = error?.toString() || "";

    if (errStr.includes("code 413")) return "Image is too large";
    if (errStr.includes("code 429")) return "Upload limit exceeded";
    if (errStr.includes("code 400")) return "Invalid image file";

    return JSON.stringify(error?.message) || "Unknown upload error occurred";
  };

  const SuggestionItem = ({ name }: { name: string }) => {
    return (
      <div className="flex flex-row items-center p-1 rounded-lg gap-2">
        <SAvatar username={name} size="xs" />
        <p className="text-sm">{name}</p>
      </div>
    );
  };

  return (
    <div {...getRootProps()}>
      <div className="body-input relative" onKeyDown={hotKeyHandler}>
        {isDragActive && (
          <div className="flex flex-row justify-center w-full absolute  h-full rounded-lg z-[11] backdrop-blur-[2px] bg-foreground/10">
            <div className="text-center self-center">
              <FaCloudUploadAlt className="mx-auto text-5xl" />

              <h3 className="mt-2 text-sm font-medium text-default-600">
                <span>Drag and drop to upload</span>
              </h3>
              <p className="mt-1 text-xs text-default-400">
                PNG, JPG, GIF up to {filesize(MAXIMUM_UPLOAD_SIZE)}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {/* Toolbar */}
          <div className="flex flex-row justify-between">
            <div className="flex items-center gap-1 flex-wrap">
              {toolbarActions.map((action, index) => (
                <div className="flex flex-wrap gap-1 items-center">
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    onPress={action.action}
                    title={action.title}
                    className="border hover:!bg-primary-500 hover:text-primary-foreground transition-colors"
                    isDisabled={isDisabled}
                  >
                    <action.icon size={20} />
                  </Button>

                  {/* {action?.showDivider && <Divider orientation="vertical" className="h-4 hidden sm:block" />
                                } */}
                </div>
              ))}
            </div>
            {!isSnipping && (
              <Button
                key={"snippet"}
                variant="ghost"
                size="sm"
                isIconOnly
                isDisabled={isDisabled}
                onPress={() => snippetDisclosure.onOpen()}
                title={"Snippet & Templates"}
                className="border hover:!bg-primary-500 hover:text-primary-foreground transition-colors"
              >
                <AiOutlineFileSearch size={20} />
              </Button>
            )}
          </div>

          <ReactTextareaAutocomplete
            style={{ fontSize: 14 }}
            innerRef={(ref) => {
              postInput.current = ref;
            }}
            value={value}
            dropdownStyle={{ zIndex: 14 }}
            containerStyle={containerStyle}
            movePopupAsYouType
            disabled={isDisabled}
            placeholder="Write something..."
            rows={rows ?? 10}
            className="min-h-10 w-full focus-visible:outline-none p-2 rounded-lg bg-default-100  enabled:hover:bg-default-200 enabled:focus:bg-default-100 disabled:opacity-disabled"
            onChange={(e) => handleChange(e.target.value)}
            loadingComponent={() => <LoadingCard />}
            minChar={0}
            maxLength={maxLength}
            trigger={{
              "@": {
                dataProvider: async (token) => {
                  clearTimeout(timeout);
                  if (!users && !!validate_account_name(token)) {
                    return [];
                  }

                  return new Promise((resolve, reject) => {
                    timeout = setTimeout(async () => {
                      if (token?.length <= 2) {
                        const uniqueObjectArray = Object.values(
                          (users ?? [])
                            .filter((name) => name.trim() !== "") // Filter out empty strings
                            .reduce(
                              (acc, name) => ({ ...acc, [name]: { name } }),
                              {}
                            )
                        ) as any;
                        resolve(uniqueObjectArray);
                      } else {
                        let suggestions = await getAccountsByPrefix(
                          token.toLowerCase()
                        );
                        resolve(suggestions);
                      }
                    }, 300);
                  });
                },

                component: (item: { selected: boolean; entity: any }) => {
                  return <SuggestionItem name={item.entity.name} />;
                },
                output: (item, trigger) =>
                  `${trigger}${item.name.replace(/ /g, "_")}`,
              },
            }}
          />
        </div>
      </div>
      <input
        style={{ width: 0, height: 0 }}
        {...getInputProps()}
        name="images"
        hidden
        aria-hidden
        id="dropzone"
        accept="image/png, image/gif, image/jpeg, image/jpg"
      />

      <SnippetModal
        handleOnSelect={(snippet) => {
          insertMarkdown(snippet.body, "");
          snippetDisclosure.onOpenChange();
        }}
        isOpen={snippetDisclosure.isOpen}
        onOpenChange={snippetDisclosure.onOpenChange}
      />
    </div>
  );
});
