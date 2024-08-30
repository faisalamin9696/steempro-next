"use client";

import { useState, useRef, useCallback, memo, useEffect } from "react";
import EditorToolbar from "./components/EditorToolbar";
import { useDropzone } from "react-dropzone";
import { KeyboardEvent } from "react";
import { MAXIMUM_UPLOAD_SIZE, isValidImage } from "@/libs/utils/image";
import { toast } from "sonner";
import { toBase64 } from "@/libs/utils/helper";
import { signImage, uploadImage } from "@/libs/steem/condenser";
import { useLogin } from "../auth/AuthProvider";
import { getCredentials, getSessionKey } from "@/libs/utils/user";
import { filesize } from "filesize";
import { FaCloudUploadAlt } from "react-icons/fa";
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";
import "@webscopeio/react-textarea-autocomplete/style.css";
import SAvatar from "../SAvatar";
import LoadingCard from "../LoadingCard";
import "./style.scss";
import { getAccountsByPrefix } from "@/libs/steem/sds";
import { useSession } from "next-auth/react";
import { validate_account_name } from "@/libs/utils/ChainValidation";

const tableTemplete = `|	Column 1	|	Column 2	|	Column 3	|
|	------------	|	------------	|	------------	|
|	     Text     	|	     Text     	|	     Text     	|`;

const MAX_FILE_TO_UPLOAD = 10;

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload: (
    blon: any,
    insertionStatus: (image: any, imageName: string) => void,
    setImageState: () => void
  ) => void;
  onImageInvalid: () => void;
  rows?: number;
  isDisabled?: boolean;
  users?: string[];
}

let timeout: any = null;
let imagesToUpload: { file: any; temporaryTag: string }[] = [];

export default memo(function EditorInput(props: EditorProps) {
  let {
    value,
    onImageUpload,
    onImageInvalid,
    onChange,
    users,
    rows,
    isDisabled,
  } = props;

  let { authenticateUser, isAuthorized, credentials } = useLogin();
  const { data: session } = useSession();

  const postInput = useRef<any>(null);
  const postBodyRef = useRef<HTMLDivElement>(null);
  let [imagesUploadCount, setImagesUploadCount] = useState(0);

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
    if (postInput) {
      postInput?.current?.addEventListener("paste", handlePastedImage);
    }

    return () =>
      postInput?.current?.removeEventListener("paste", handlePastedImage);
  }, []);

  function handlePastedImage(e: any) {
    if (e.clipboardData && e.clipboardData.items) {
      const items = e.clipboardData.items;
      Array.from(items).forEach((item: any) => {
        if (item.kind === "file" && /^image\//.test(item.type)) {
          e.preventDefault();

          const blob = item.getAsFile();

          if (!isValidImage(blob)) {
            onImageInvalid();
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

  function insertAtCursor(
    before: string,
    after: string,
    deltaStart = 0,
    deltaEnd = 0
  ) {
    if (!postInput) return;
    const startPos = postInput?.current?.selectionStart;
    const endPos = postInput?.current?.selectionEnd;
    const newValue =
      value.substring(0, startPos) +
      before +
      value.substring(startPos, endPos) +
      after +
      value.substring(endPos, value.length);

    setValue(newValue, startPos + deltaStart, endPos + deltaEnd);
  }

  const shortcutHandler = {
    h1: () => insertCode("h1"),
    h2: () => insertCode("h2"),
    h3: () => insertCode("h3"),
    h4: () => insertCode("h4"),
    h5: () => insertCode("h5"),
    h6: () => insertCode("h6"),
    bold: () => insertCode("b"),
    italic: () => insertCode("i"),
    quote: () => insertCode("q"),
    code: () => insertCode("code"),
    table: () => insertCode("table"),
    link: () => insertCode("link"),
    image: () => insertCode("image"),
    snip: () => insertCode("snip"),
    justify: () => insertCode("justify"),
    center: () => insertCode("center"),
  };

  function hotKeyHandler(e: KeyboardEvent<HTMLDivElement>) {
    // allow only Alt key
    if (!e.altKey) {
      return;
    }
    e.preventDefault();

    switch (e.key) {
      case "1":
        shortcutHandler.h1();
        break;
      case "2":
        shortcutHandler.h2();
        break;
      case "3":
        shortcutHandler.h3();
        break;
      case "3":
        shortcutHandler.h4();
        break;
      case "b":
        shortcutHandler.bold();
        break;
      case "i":
        shortcutHandler.italic();
        break;
      case "q":
        shortcutHandler.quote();
        break;
      case "c":
        shortcutHandler.code();
        break;
      case "t":
        shortcutHandler.table();
        break;
      case "link":
        shortcutHandler.link();
        break;

      case "s":
        shortcutHandler.snip();
        break;

      case "j":
        shortcutHandler.justify();
        break;

      case "e":
        shortcutHandler.center();
        break;
      case "d":
        shortcutHandler.image();
        break;
      default:
        return;
    }
  }

  function insertCode(type: string) {
    if (!postInput) return;
    // postInput?.current?.focus();

    switch (type) {
      case "h1":
        insertAtCursor("# ", "", 2, 2);
        break;
      case "h2":
        insertAtCursor("## ", "", 3, 3);
        break;
      case "h3":
        insertAtCursor("### ", "", 4, 4);
        break;
      case "h4":
        insertAtCursor("#### ", "", 5, 5);
        break;
      case "b":
        insertAtCursor("**", "**", 2, 2);
        break;
      case "i":
        insertAtCursor("*", "*", 1, 1);
        break;
      case "q":
        insertAtCursor("> ", "", 2, 2);
        break;
      case "table":
        insertAtCursor(
          tableTemplete,
          "",
          tableTemplete.length,
          tableTemplete.length
        );
        break;
      case "code":
        insertAtCursor("<code>", "</code>", 1, 1);
        break;
      case "link":
        insertAtCursor("[", "](url)", 1, 1);
        break;
      case "image":
        authenticateUser();
        if (isAuthorized()) {
          open();
        }
        // insertAtCursor('![', '](url)', 2, 2);
        break;
      case "snip":
        alert("Snippets");
        break;

      case "justify":
        insertAtCursor('<div class="text-justify">\n\n', "\n</div>", 2, 2);
        break;

      case "center":
        insertAtCursor("<center>\n", "\n</center>", 9, 9);
        break;
      default:
        break;
    }
  }

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

  // upload images
  const _uploadImage = async (image) => {
    const username = credentials?.username;

    const fresh_credentials = getCredentials(
      getSessionKey(session?.user?.name ?? username)
    );
    if (!fresh_credentials?.key || !fresh_credentials?.username) {
      toast.error("Invalid credentials");
      return;
    }

    toast.promise(
      async () => {
        // Testing
        // await awaitTimeout(5);
        // return true

        const data = await toBase64(image.file);
        let sign = await signImage(data, fresh_credentials.key);
        const result = await uploadImage(
          image.file,
          fresh_credentials?.username,
          sign
        );
        return result;
      },
      {
        closeButton: false,
        loading: "Uploading...",
        success: (res: any) => {
          // Testing
          // const url = `https://cdn.steemitimages.com/DQmdyoAZ8pJGUSsqPjuKqYU4LBXeP75h8awmh964PVaE7zc/IMG_0.9163441659792777.jpeg`
          // const Image_name = image.file.name;
          // const imageMd = `![${Image_name}](${url})`;
          // insertImage({ url: image.temporaryTag, isPlaceholder: false, imgMd: imageMd })
          // // Replace temporary image MD tag with the real one
          // uploadNextImage();
          // return `Uploaded`;

          if (res.data && res.data.url) {
            const Image_name: string = image.file.name;
            res.data.hash = res.data.url.split("/").pop();
            const imageMd = `![${Image_name?.substring(0, 20) || ""}](${
              res.data.url
            })`;
            insertImage({
              url: image.temporaryTag,
              isPlaceholder: false,
              imgMd: imageMd,
            });
            uploadNextImage();
            return `Uploaded`;
          } else {
            return `Failed`;
          }
        },
        error: (error) => {
          if (error.toString().includes("code 413")) {
            // console.log('Large file size')
            return "Large file size";
          } else if (error.toString().includes("code 429")) {
            // console.log('Limit exceed')
            return "Limit exceed";
          } else if (error.toString().includes("code 400")) {
            // console.log('Invalid Image', error)
            return "Invalid Image";
          } else {
            return "Failed: " + String(error);
          }
        },
        finally() {
          uploadNextImage();
        },
      }
    );
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
      <div
        className="body-input relative"
        onKeyDown={hotKeyHandler}
        ref={postBodyRef}
      >
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
          <EditorToolbar isDisabled={isDisabled} onSelect={insertCode} />

          <ReactTextareaAutocomplete
            style={{ fontSize: 14 }}
            innerRef={(ref) => {
              postInput.current = ref;
            }}
            value={value}
            dropdownStyle={{ zIndex: 14 }}
            containerStyle={{}}
            movePopupAsYouType
            disabled={isDisabled}
            placeholder="Write something..."
            rows={rows ?? 10}
            className="w-full focus-visible:outline-none p-2 rounded-lg bg-default-100  enabled:hover:bg-default-200 enabled:focus:bg-default-100 disabled:opacity-disabled"
            onChange={(e) => handleChange(e.target.value)}
            loadingComponent={() => <LoadingCard />}
            minChar={0}
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
                output: (item: any, trigger) => `@${item.name}`,
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
    </div>
  );
});
