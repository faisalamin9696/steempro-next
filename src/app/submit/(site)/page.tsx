"use client";

import React, { useEffect, useState } from "react";
import RewardSelectButton, {
  rewardTypes,
} from "../../../components/editor/components/RewardSelectButton";
import CommunitySelectButton from "../../../components/editor/components/CommunitySelectButton";
import ClearFormButton from "../../../components/editor/components/ClearFormButton";
import BeneficiaryButton from "../../../components/editor/components/BeneficiaryButton";
import PublishButton from "../../../components/editor/components/PublishButton";
import { useLogin } from "../../../components/auth/AuthProvider";
import { Card } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { useMutation } from "@tanstack/react-query";
import {
  checkPromotionText,
  getCredentials,
  getSessionKey,
} from "@/libs/utils/user";
import { awaitTimeout, useAppSelector } from "@/libs/constants/AppFunctions";
import { readingTime } from "@/libs/utils/readingTime/reading-time-estimator";
import {
  grantPostingPermission,
  publishContent,
  signMessage,
  verifyMessage,
} from "@/libs/steem/condenser";
import { toast } from "sonner";
import {
  createPatch,
  extractMetadata,
  generatePermlink,
  generateReplyPermlink,
  getEditorDraft,
  makeJsonMetadata,
  makeJsonMetadataForUpdate,
  makeJsonMetadataReply,
  makeOptions,
  validateCommentBody,
} from "@/libs/utils/editor";
import MarkdownViewer from "@/components/body/MarkdownViewer";
import { AppStrings } from "@/libs/constants/AppStrings";
import { empty_community } from "@/libs/constants/Placeholders";
import { getPost } from "@/libs/steem/sds";
import EditorInput from "@/components/editor/EditorInput";
import "./style.scss";
import secureLocalStorage from "react-secure-storage";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import TagsListCard from "@/components/TagsListCard";
import moment from "moment";
import ScheduleButton from "@/components/editor/components/ScheduleButton";
import axios from "axios";
import ScheduleModal from "@/components/ScheduleModal";
import { IoClose } from "react-icons/io5";
import { ZonedDateTime } from "@internationalized/date";
import { CustomEvent } from "@piwikpro/react-piwik-pro";
import { cryptoUtils, Signature } from "@hiveio/dhive";

interface Props {
  params?: {
    oldPost?: Post;
    handleUpdateSuccess?: (post: Post) => void;
    handleUpdateCancel?: () => void;
  };
}

export default function SubmitPage(props: Props) {
  const { oldPost, handleUpdateSuccess, handleUpdateCancel } =
    props?.params || {};
  const isEdit = !!oldPost?.permlink;
  const isEditComment = !!oldPost?.depth;

  const searchParams = useSearchParams();
  const accountParams = searchParams.get("account");
  const titleParams = searchParams.get("title");
  const [refCommunity, setRefCommunity] = useState(
    accountParams ? empty_community(accountParams, titleParams) : undefined
  );

  const draft = getEditorDraft();

  const [formData, setFormData] = useState<{
    title: string;
    tags: string;
    markdown: string;
    reward: Payout;
    beneficiaries: Beneficiary[];
    community?: Community;
  }>({
    title: draft?.title || "",
    tags: draft?.tags || "",
    markdown: isEdit ? oldPost?.body : draft?.markdown || "",
    reward: rewardTypes[1],
    beneficiaries: isEdit ? [] : draft?.beneficiaries || [],
    community: isEdit ? undefined : draft?.community,
  });

  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { data: session } = useSession();
  const rpm = readingTime(formData.markdown);
  const [isPosting, setPosting] = useState(false);
  const [isScheduling, setScheduling] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [dateTime, setDateTime] = useState<ZonedDateTime>();

  const isLoading = isPosting || isScheduling;

  // const [openAuth, setOpenAuth] = useState(false);
  const { authenticateUser, isAuthorized } = useLogin();

  const pathname = usePathname();
  const splitted_path = pathname.split("/");
  splitted_path.shift();

  useEffect(() => {
    if (isEdit && oldPost) {
      if (oldPost.community)
        setFormData({
          ...formData,
          community: empty_community(oldPost.category, oldPost.community),
          title: oldPost.title,
          markdown: oldPost.body,
          tags:
            JSON.parse(oldPost.json_metadata ?? "{}")?.tags?.join(" ") || "",
        });
    }
  }, [oldPost]);

  function saveDraft() {
    if (!isEdit)
      secureLocalStorage.setItem("post_draft", {
        title: formData.title,
        markdown: formData.markdown,
        tags: formData.tags,
        beneficiaries: formData.beneficiaries,
        community: formData.community,
      });
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      saveDraft();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [
    formData.title,
    formData.markdown,
    formData.tags,
    formData.beneficiaries,
    formData.community,
  ]);

  function clearForm() {
    setFormData({
      title: "",
      tags: "",
      markdown: "",
      reward: rewardTypes[1],
      beneficiaries: [],
      community: undefined,
    });
    setDateTime(undefined);
  }

  const postingMutation = useMutation({
    mutationKey: [`publish-post`],
    mutationFn: ({
      postData,
      options,
      key,
      isKeychain,
    }: {
      postData: PostingContent;
      options?: any;
      key: string;
      isKeychain?: boolean;
    }) => publishContent(postData, options, key, isKeychain),
    onSettled(data, error, variables, context) {
      setPosting(false);
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      if (isEdit) {
        let body = formData.markdown;

        if (!checkPromotionText(body) && !isEditComment)
          body = body + "\n\n" + AppStrings.promotion_text;
        handleUpdateSuccess &&
          handleUpdateSuccess({
            ...variables.postData,
            ...oldPost,
            body: body,
            title: variables.postData.title,
            json_metadata: JSON.stringify(variables.postData.json_metadata),
            last_update: moment().unix(),
          });
        toast.success("Updated");
        return;
      }
      toast.success("Published");
      clearForm();
      CustomEvent.trackEvent(
        "post_submit_page",
        variables.postData.author.name,
        "Published"
      );
    },
  });

  async function handlePostPublish(isSchedule?: boolean) {
    if (isEditComment) {
      handleCommentUpdate();
      return;
    }

    if (!formData.title) {
      toast.info("Title can not be empty");
      // AppConstants.SHOW_TOAST('Invalid title', 'Title can not be empty', 'info');
      return;
    }
    if (!formData.markdown) {
      toast.info("Post can not be empty");
      // AppConstants.SHOW_TOAST('Invalid description', 'Description can not be empty', 'info');
      return;
    }

    const _tags = formData.tags
      .split(" ")
      .filter(
        (tag) => tag && tag !== " " && tag !== formData.community?.account
      );

    if (_tags.length <= 0 && !formData.community) {
      toast.info("Add a tag or select community");
      // AppConstants.SHOW_TOAST('Invalid tags', 'Add a tag or select community', 'info');
      return;
    }
    if (_tags.length > 8) {
      toast.info("Please use only 8 tags");
      // AppConstants.SHOW_TOAST('Limit reached', 'Please use only 8 tags', 'info');
      return;
    }

    const limit_check = validateCommentBody(formData.markdown, true);
    if (limit_check !== true) {
      toast.info(limit_check);
      // AppConstants.SHOW_TOAST('Failed', limit_check, 'info');
      return;
    }
    authenticateUser();

    if (!isAuthorized()) {
      return;
    }

    // check if the post is need to schedule

    if (isSchedule) {
      handleSchedule(_tags);
      return;
    }

    setPosting(true);

    await awaitTimeout(1);
    try {
      let permlink = generatePermlink(formData.title);
      let simplePost;
      if (!isEdit) {
        if (!!loginInfo.name)
          try {
            simplePost = await getPost(loginInfo.name, permlink);
          } catch (e) {
            // silent ignore
            simplePost = undefined;
          }
        else {
          setPosting(false);
          toast.info("Something went wrong!");
          return;
        }

        // check if the permlink already exist

        // if exist create new permlink
        if (simplePost && simplePost?.permlink === permlink) {
          permlink = generatePermlink(formData.title, true);
        }
      }

      let options = makeOptions({
        author: loginInfo.name,
        permlink,
        operationType: formData.reward?.payout,
        beneficiaries: formData.beneficiaries,
      });

      // if community is selected

      let parent_permlink = _tags[0] || "steempro";
      if (formData.community && formData.community.account !== loginInfo.name) {
        parent_permlink = formData.community.account;
      }

      const cbody = formData.markdown.replace(
        /[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g,
        ""
      );

      let postData: PostingContent = {
        author: loginInfo,
        title: formData.title,
        body: cbody,
        parent_author: "",
        parent_permlink: parent_permlink,
        json_metadata: {},
        permlink: permlink,
      };

      if (!checkPromotionText(formData.markdown))
        postData.body = postData.body + "\n\n" + AppStrings.promotion_text;

      const meta = extractMetadata(postData.body);

      const jsonMeta = makeJsonMetadata(meta, _tags);
      postData.json_metadata = jsonMeta;

      if (isEdit && oldPost) {
        let newBody = cbody;

        postData.parent_permlink = isEdit
          ? oldPost?.category
          : parent_permlink || "steempro";

        if (!checkPromotionText(formData.markdown))
          newBody = newBody + "\n\n" + AppStrings.promotion_text;

        const patch = createPatch(oldPost?.body, newBody?.trim());
        if (patch && patch.length < Buffer.from(oldPost.body, "utf-8").length) {
          newBody = patch;
        }

        let newTitle = formData.title?.trim();
        // const patch2 = createPatch(oldComment?.title, newTitle.trim());
        // if (patch2 && patch2.length < Buffer.from(oldComment?.title, "utf-8").length) {
        //     newTitle = patch2;
        // }
        const new_json_metadata = makeJsonMetadataForUpdate(
          {
            ...JSON.parse(oldPost.json_metadata),
          },
          extractMetadata(cbody),
          _tags
        );

        postData.permlink = oldPost.permlink;
        postData.body = newBody;
        postData.title = newTitle;
        postData.json_metadata =
          new_json_metadata || JSON.parse(oldPost.json_metadata);
        options = undefined;
      }

      const credentials = getCredentials(getSessionKey(session?.user?.name));
      if (credentials) {
        postingMutation.mutate({
          postData,
          options,
          key: credentials.key,
          isKeychain: credentials.keychainLogin,
        });
      } else {
        setPosting(false);
        toast.error("Invalid credentials");
      }
    } catch (error: any) {
      toast.error(error.message || JSON.stringify(error));
      setPosting(false);
    }
  }

  async function handleCommentUpdate() {
    if (oldPost && isEditComment) {
      if (!formData.markdown) {
        toast.info("Comment can not be empty");
        return;
      }

      const limit_check = validateCommentBody(formData.markdown, false);
      if (limit_check !== true) {
        toast.info(limit_check);
        return;
      }

      authenticateUser();

      if (isAuthorized()) {
        setPosting(true);

        await awaitTimeout(1);
        try {
          // generating the permlink for the comment author
          let permlink = generateReplyPermlink(oldPost.author);

          const postData: PostingContent = {
            author: loginInfo,
            title: "",
            body: formData.markdown,
            parent_author: oldPost.author,
            parent_permlink: oldPost.permlink,
            json_metadata: makeJsonMetadataReply(),
            permlink: permlink,
          };

          const cbody = formData.markdown.replace(
            /[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g,
            ""
          );

          // check if reply is in edit mode
          if (true) {
            const oldComment = oldPost;
            let newBody = cbody;

            const patch = createPatch(oldComment?.body, newBody?.trim());
            if (
              patch &&
              patch.length < Buffer.from(oldComment?.body, "utf-8").length
            ) {
              newBody = patch;
            }
            const meta = extractMetadata(formData.markdown);
            const new_json_metadata = makeJsonMetadata(meta, []);
            postData.permlink = oldComment.permlink;
            postData.body = newBody;
            postData.json_metadata = "";
            postData.parent_author = oldComment.parent_author;
            postData.parent_permlink = oldComment.parent_permlink;
          }

          const credentials = getCredentials(
            getSessionKey(session?.user?.name)
          );
          if (credentials) {
            // handleOnPublished(postData);
            postingMutation.mutate({
              postData,
              options: null,
              key: credentials.key,
              isKeychain: credentials.keychainLogin,
            });
          } else {
            setPosting(false);
            toast.error("Invalid credentials");
          }
        } catch (error: any) {
          toast.error(error.message || JSON.stringify(error));
          setPosting(false);
        }
      }
    }
  }

  async function schedulePost(
    hash:Buffer,
    signature:Signature,
    body: string,
    tags: string[],
    parent_permlink: string,
    options: any
  ) {

    axios
      .post(
        "/api/schedules/add",
        {
          username: loginInfo.name,
          hash: hash,
          signature: signature.toString(),
          title: formData.title,
          body: body,
          tags: tags.join(","),
          parent_permlink: parent_permlink,
          options: JSON.stringify(options),
          time: moment(dateTime!.toAbsoluteString()).format(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        toast.success("Schedule successfully");
        clearForm();
      })
      .catch(function (error) {
        toast.error(error.message || JSON.stringify(error));
      })
      .finally(() => {
        setScheduling(false);
      });
  }
  async function handleSchedule(_tags: string[]) {
    if (!dateTime) {
      setIsPickerOpen(true);
      return;
    }

    if (moment(dateTime.toDate()).isSameOrBefore(moment())) {
      toast.info("Schedule time must be after the current time.");
      return;
    }

    authenticateUser();

    if (!isAuthorized()) {
      return;
    }

    try {
      const credentials = getCredentials(getSessionKey(session?.user?.name));
      if (!credentials?.key) {
        toast.error("Invalid credentials");
        return;
      }

      let parent_permlink = _tags[0] || "steempro";
      if (formData.community && formData.community.account !== loginInfo.name) {
        parent_permlink = formData.community.account;
      }

      let options = makeOptions({
        author: loginInfo.name,
        permlink: "test",
        operationType: formData.reward?.payout,
        beneficiaries: formData.beneficiaries,
      });

      const cbody = formData.markdown.replace(
        /[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g,
        ""
      );
      setScheduling(true);

      grantPostingPermission(
        loginInfo,
        credentials.key,
        credentials.keychainLogin
      )
        .then(() => {
          if (credentials.keychainLogin) {
            const hash = cryptoUtils.sha256(loginInfo.name);

            window.steem_keychain.requestSignBuffer(
              loginInfo.name,
              loginInfo.name,
              "Posting",
              function (response) {
                if (response.success) {
                  const signature = response.result;
                  schedulePost(
                    hash,
                    signature,
                    cbody,
                    _tags,
                    parent_permlink,
                    options
                  );
                } else {
                  toast.error(response.message);
                  setScheduling(false);
                }
              }
            );
          } else {
            const { signature, hash } = signMessage(
              credentials.key,
              loginInfo.name
            );
            schedulePost(
              hash,
              signature,
              cbody,
              _tags,
              parent_permlink,
              options
            );
          }
        })

        .catch((error) => {
          toast.error(error.message || JSON.stringify(error));
          setScheduling(false);
        });
    } catch (error: any) {
      setScheduling(false);
      toast.error(error.message);
    }
  }
  return (
    <div
      className={clsx(
        `editor-main flex flex-col flex-1 gap-4 items-center w-full `,
        !oldPost && "1md:justify-evenly 1md:items-start 1md:flex-row "
      )}
    >
      <div
        className={clsx(
          `flex flex-col w-full  gap-2`,
          !oldPost &&
            "1md:w-[50%] 1md:float-start 1md:sticky 1md:z-[1]  1md:self-start 1md:top-[70px] px-1"
        )}
      >
        {!isEditComment && (
          <>
            <CommunitySelectButton
              isDisabled={isLoading}
              community={formData.community}
              onlyCommunity={isEdit}
              refCommunity={refCommunity}
              onSelectCommunity={(value) =>
                setFormData({ ...formData, community: value })
              }
              handleOnClear={() => {
                if (refCommunity) {
                  history.replaceState({}, "", "/submit");
                  setRefCommunity(undefined);
                }
              }}
            />

            <Input
              size="sm"
              value={formData.title}
              onValueChange={(value) =>
                setFormData({ ...formData, title: value })
              }
              className="text-default-900 "
              classNames={{
                input: "font-bold text-md",
                inputWrapper: "h-8",
              }}
              isDisabled={isLoading}
              placeholder={"Title"}
              maxLength={255}
            />

            <Input
              size="sm"
              value={formData.tags}
              className="text-default-900 "
              onValueChange={(value) =>
                setFormData({ ...formData, tags: value })
              }
              classNames={{
                inputWrapper: "h-8",
              }}
              autoCapitalize="off"
              placeholder={"Tags here..."}
              isDisabled={isLoading}
              maxLength={255}
            />
          </>
        )}

        <EditorInput
          value={formData.markdown}
          isDisabled={isLoading}
          onChange={(value) => setFormData({ ...formData, markdown: value })}
          onImageUpload={() => {}}
          onImageInvalid={() => {}}
        />

        <div className="flex gap-2 relativeitems-center flex-row">
          <div className="gap-2 flex">
            <ClearFormButton onClearPress={clearForm} isDisabled={isLoading} />

            {!isEdit && (
              <BeneficiaryButton
                isDisabled={isEdit || isLoading}
                onSelectBeneficiary={(bene) => {
                  setFormData({
                    ...formData,
                    beneficiaries: [
                      ...formData.beneficiaries,
                      { ...bene, weight: bene.weight },
                    ],
                  });
                }}
                onRemove={(bene) => {
                  setFormData({
                    ...formData,
                    beneficiaries: formData.beneficiaries?.filter(
                      (item) => item.account !== bene.account
                    ),
                  });
                }}
                beneficiaries={formData.beneficiaries}
              />
            )}
            {!isEdit && (
              <RewardSelectButton
                isDisabled={isEdit || isLoading}
                selectedValue={formData.reward}
                onSelectReward={(reward) => {
                  setFormData({
                    ...formData,
                    reward: reward,
                  });
                }}
              />
            )}
          </div>

          <div className=" flex flex-col items-end gap-2 w-full">
            <div className="flex flex-1 justify-end gap-2">
              {!isEdit && (
                <ScheduleButton
                  isDisabled={isEdit || isLoading}
                  isLoading={isScheduling}
                  buttonText={dateTime ? "Schedule" : undefined}
                  onClick={() => handlePostPublish(true)}
                />
              )}

              {isEdit && (
                <Button
                  size="sm"
                  radius="full"
                  isDisabled={isLoading}
                  onClick={() => {
                    handleUpdateCancel && handleUpdateCancel();
                  }}
                >
                  Cancel
                </Button>
              )}

              {!dateTime && (
                <PublishButton
                  isDisabled={isLoading}
                  isLoading={isPosting}
                  buttonText={isEdit ? "Update" : undefined}
                  onClick={() => handlePostPublish(false)}
                />
              )}
            </div>

            {dateTime && (
              <div className="text-default-500 text-sm flex flex-row items-center gap-2">
                <button
                  disabled={isScheduling}
                  onClick={() => {
                    setDateTime(undefined);
                  }}
                >
                  <IoClose className=" text-lg" />
                </button>
                {moment(dateTime.toAbsoluteString()).format(
                  "YYYY-MM-DD HH:mm:ss"
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={clsx(
          isEdit ? "" : "1md:w-[50%] ",
          "flex flex-col w-full mb-10 gap-2"
        )}
      >
        <div className=" items-center flex justify-between">
          <p className="float-left text-default-900/70 font-bold">
            {"Preview"}
          </p>

          <p className="float-right text-sm font-light text-default-900">
            {rpm?.words} words, {rpm?.text}
          </p>
        </div>
        {formData.markdown ? (
          <Card shadow="none" className="p-2 lg:shadow-md space-y-2">
            <TagsListCard
              tags={formData.tags?.trim().split(" ")}
              isDisabled={isLoading}
            />
            <div className="flex flex-col items-center">
              <MarkdownViewer text={formData.markdown} />
            </div>
          </Card>
        ) : null}
      </div>

      <ScheduleModal
        onDateTimeChange={setDateTime}
        isOpen={isPickerOpen}
        onOpenChange={setIsPickerOpen}
      />
    </div>
  );
}
