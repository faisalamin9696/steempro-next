"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Textarea,
  CardHeader,
  Avatar,
} from "@heroui/react";
import {
  User,
  Globe,
  MapPin,
  Info,
  Image as ImageIcon,
  Save,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { steemApi } from "@/libs/steem";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { handleSteemError } from "@/utils/steemApiError";
import { addLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import ImageUploadButton from "../post/ImageUploadButton";
import { toBase64 } from "@/utils/helper";
import { proxifyImageUrl } from "@/utils/proxifyUrl";
import { twMerge } from "tailwind-merge";
import { useAccountsContext } from "../auth/AccountsContext";
import SCard from "../ui/SCard";
import LoginAlertCard from "../ui/LoginAlertCard";
import { resetCachedAvatarUrl } from "@/utils/avatarCache";

const ProfileSettings = ({ className }: { className?: string }) => {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const loginData = useAppSelector((state) => state.loginReducer.value);

  if (!loginData.name) {
    return <LoginAlertCard text="view profile settings" />;
  }

  const { authenticateOperation } = useAccountsContext();
  const [formData, setFormData] = useState<Partial<PostingJsonMetadata>>({
    name: "",
    about: "",
    location: "",
    website: "",
    profile_image: "",
    cover_image: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    profile?: number;
    cover?: number;
  }>({});

  useEffect(() => {
    if (loginData?.posting_json_metadata) {
      try {
        const metadata = JSON.parse(loginData.posting_json_metadata);
        const profile = metadata.profile || {};
        setFormData({
          name: profile.name || "",
          about: profile.about || "",
          location: profile.location || "",
          website: profile.website || "",
          profile_image: profile.profile_image || "",
          cover_image: profile.cover_image || "",
        });
      } catch (e) {
        console.error("Failed to parse metadata", e);
      }
    }
  }, [loginData]);

  const handleChange = (key: keyof PostingJsonMetadata, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (
    files: File[],
    type: "profile_image" | "cover_image"
  ) => {
    const file = files[0];
    if (!file || !session?.user?.name) return;

    const toastId = toast.loading(
      `Uploading ${type === "profile_image" ? "avatar" : "cover"}...`
    );

    try {
      const base64Data = (await toBase64(file)) as string;
      const { key, useKeychain } = await authenticateOperation("posting");
      const signature = await steemApi.signImage(
        session.user.name,
        base64Data,
        key,
        useKeychain
      );

      if (!signature) throw new Error("Signing failed");

      const uploadResult = await steemApi.uploadImage(
        file,
        session.user.name,
        signature.toString(),
        (progress) => {
          setUploadProgress((prev) => ({
            ...prev,
            [type === "profile_image" ? "profile" : "cover"]: progress,
          }));
        }
      );

      if (uploadResult) {
        handleChange(type, uploadResult);
        toast.success("Image uploaded successfully!", { id: toastId });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error: any) {
      toast.error(error?.message || "Upload failed", { id: toastId });
    } finally {
      setUploadProgress((prev) => ({
        ...prev,
        [type === "profile_image" ? "profile" : "cover"]: 0,
      }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await handleSteemError(async () => {
        const { key, useKeychain } = await authenticateOperation("posting");
        await steemApi.updateProfile(
          session?.user?.name!,
          formData,
          key,
          useKeychain
        );

        // Update local state by merging the new profile data
        const updatedAccount = { ...loginData };
        const metadata = JSON.parse(
          updatedAccount.posting_json_metadata || "{}"
        );
        metadata.profile = { ...(metadata.profile || {}), ...formData };
        updatedAccount.posting_json_metadata = JSON.stringify(metadata);

        dispatch(addLoginHandler(updatedAccount));
        toast.success("Profile updated on the blockchain!");
        resetCachedAvatarUrl(session?.user?.name!, formData.profile_image);
      });
    } catch (error) {
      // Handled by handleSteemError
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={twMerge("space-y-6 max-w-4xl pb-10", className)}>
      {/* Basic Info */}
      <SCard
        className="card"
        title="Basic Information"
        icon={User}
        iconColor="primary"
        description="Public profile details displayed to other users"
        iconSize="sm"
      >
        <div className="space-y-4">
          <Input
            label="Display Name"
            placeholder="e.g. Faisal Amin"
            value={formData.name}
            onValueChange={(val) => handleChange("name", val)}
            variant="faded"
            startContent={<User size={18} className="text-default-400" />}
          />
          <Textarea
            label="About"
            placeholder="Tell the community about yourself"
            value={formData.about}
            onValueChange={(val) => handleChange("about", val)}
            variant="faded"
            startContent={<Info size={18} className="mt-1 text-default-400" />}
            minRows={2}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Location"
              placeholder="e.g. New York, USA"
              value={formData.location}
              onValueChange={(val) => handleChange("location", val)}
              variant="faded"
              startContent={<MapPin size={18} className="text-default-400" />}
            />
            <Input
              label="Website"
              placeholder="https://example.com"
              value={formData.website}
              onValueChange={(val) => handleChange("website", val)}
              variant="faded"
              startContent={<Globe size={18} className="text-default-400" />}
            />
          </div>
        </div>
      </SCard>

      {/* Visual Identity */}
      <SCard
        className="card"
        icon={ImageIcon}
        title="Visual Identity"
        iconSize="sm"
        iconColor="secondary"
        description="Customize your avatar and cover images"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start space-y-4">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <Avatar
              src={proxifyImageUrl(formData.profile_image!)!}
              className="w-16 h-16 sm:w-20 sm:h-20 text-large"
              isBordered
              radius="md"
            />
            <p className="text-[10px] text-default-500 uppercase font-black tracking-widest">
              Preview
            </p>
          </div>
          <div className="flex-1 w-full space-y-3">
            <Input
              label="Profile Image"
              placeholder="https://..."
              value={formData.profile_image}
              onValueChange={(val) => handleChange("profile_image", val)}
              variant="faded"
              description="Square recommended"
              classNames={{ description: "text-muted text-[10px]" }}
              endContent={
                <ImageUploadButton
                  variant="light"
                  size="sm"
                  className="min-w-0 h-8 w-8 p-0"
                  onImagesSelected={(files) =>
                    handleImageUpload(files, "profile_image")
                  }
                  progress={uploadProgress.profile}
                />
              }
            />
            <Input
              label="Cover Image"
              placeholder="https://..."
              value={formData.cover_image ?? ""}
              onValueChange={(val) => handleChange("cover_image", val)}
              variant="faded"
              description="1200x300 recommended"
              classNames={{ description: "text-muted text-[10px]" }}
              endContent={
                <ImageUploadButton
                  variant="light"
                  size="sm"
                  className="min-w-0 h-8 w-8 p-0"
                  onImagesSelected={(files) =>
                    handleImageUpload(files, "cover_image")
                  }
                  progress={uploadProgress.cover}
                />
              }
            />
          </div>
        </div>
      </SCard>

      {/* Save Action */}
      <div className="flex justify-end pt-2">
        <Button
          color="primary"
          variant="shadow"
          startContent={!isLoading && <Save size={20} />}
          onPress={handleSave}
          isLoading={isLoading}
        >
          Save Profile
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
