"use client";

import { useLogin } from "@/components/auth/AuthProvider";
import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import {
  signImage,
  updateClient,
  updateProfile,
  uploadImage,
} from "@/libs/steem/condenser";
import { toBase64 } from "@/libs/utils/helper";
import {
  getCredentials,
  getSessionKey,
  getSettings,
  updateSettings,
} from "@/libs/utils/user";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import React, { useCallback, useEffect, useState } from "react";
import { FaInfoCircle, FaUpload, FaUserCircle } from "react-icons/fa";
import { toast } from "sonner";
import { FaGlobe } from "react-icons/fa";
import { MdAddLocationAlt } from "react-icons/md";
import { AiFillPicture } from "react-icons/ai";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { TbServerBolt } from "react-icons/tb";
import { AppStrings } from "@/libs/constants/AppStrings";
import { RiUserSettingsFill } from "react-icons/ri";
import { updateSettingsHandler } from "@/libs/redux/reducers/SettingsReducer";
import { MdDisabledVisible } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { saveLoginHandler } from "@/libs/redux/reducers/LoginReducer";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import { IoIosSettings } from "react-icons/io";
import { addProfileHandler } from "@/libs/redux/reducers/ProfileReducer";
import { useSession } from "next-auth/react";
import { useDropzone } from "react-dropzone";
import { Checkbox } from "@heroui/checkbox";

let isCover: boolean = false;

const iconSize = 24;
export default function SettingsPage() {
  const { username } = usePathnameClient();
  const { data: session } = useSession();

  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const [parsedData, setParsedData] = useState<any>();
  const {
    profile_image = "",
    cover_image = "",
    name = "",
    about: userAbout = "",
    website: userWebsite = "",
    location: userLocation = "",
  } = parsedData?.profile ?? {};

  const [displayName, setDisplayName] = useState(name ?? "");
  const [coverImage, setCoverImage] = useState(cover_image ?? "");
  const [profileImage, setProfileImage] = useState(profile_image ?? "");
  const [about, setAbout] = useState(userAbout ?? "");
  const [website, setWebsite] = useState(userWebsite ?? "");
  const [location, setLocation] = useState(userLocation ?? "");
  const settings = getSettings();
  const isSelf =
    session?.user?.name === username || (session?.user?.name && !username);

  const [rememberVote, setRememberVote] = useState(
    settings.voteOptions.remember ?? true
  );

  function handleRememberVoteChange(selected: boolean) {
    updateSettings({
      ...settings,
      voteOptions: {
        remember: selected,
        value: selected ? settings.voteOptions.value ?? 100 : 100,
      },
    });

    setRememberVote(selected);
  }

  const [rpc, setRpc] = useState(settings.rpc || AppStrings.rpc_servers[0]);
  const [nsfw, setNsfw] = useState(settings.nsfw || "Always warn");
  const dispatch = useAppDispatch();

  let { authenticateUser, isAuthorized, credentials } = useLogin();

  useEffect(() => {
    setParsedData(JSON.parse(loginInfo?.posting_json_metadata ?? `{}`));
  }, [loginInfo?.posting_json_metadata]);

  const isChanged =
    profileImage !== profile_image ||
    coverImage !== cover_image ||
    name !== displayName ||
    about !== userAbout ||
    location !== userLocation ||
    website !== userWebsite;

  const className = "text-medium text-default-600";

  const onDrop = useCallback((acceptedFile: any, rejectedFiles: any) => {
    authenticateUser();
    if (isAuthorized()) {
      _uploadImage(acceptedFile[0]);
    }
  }, []);

  const { open, getInputProps } = useDropzone({
    noClick: true,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/svg+xml": [],
      "image/webp": [],
      "image/gif": [],
    },
    multiple: false,
    onDrop,
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      key: string;
      params: {
        name: string;
        about: string;
        profile_image: string;
        website: string;
        location: string;
        cover_image: string;
        version?: number | undefined;
      };
      isKeychain?: boolean;
    }) => updateProfile(loginInfo, data.key, data.params, data.isKeychain),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message);
        return;
      }
      dispatch(
        addProfileHandler({
          ...loginInfo,
          posting_json_metadata: JSON.stringify({ profile: variables.params }),
        })
      );
      dispatch(
        saveLoginHandler({
          ...loginInfo,
          posting_json_metadata: JSON.stringify({ profile: variables.params }),
        })
      );
      toast.success("Updated");
    },
  });

  function handleRpcChange(newRpc: string) {
    setRpc(newRpc);
    updateSettings({ ...settings, rpc: newRpc });
    // !important: update the condenser client after updating the setting
    updateClient();
    toast.success(`RPC changed to ${newRpc}`);
  }

  function handleNsfwChange(newNsfw: NSFW) {
    setNsfw(newNsfw);
    const newSetting = updateSettings({ ...settings, nsfw: newNsfw });
    dispatch(updateSettingsHandler(newSetting));
    toast.success(`NSFW content visibility: ${newNsfw}`);
  }

  async function handleUpdate() {
    authenticateUser();
    if (!isAuthorized()) return;

    const credentials = getCredentials(getSessionKey(session?.user?.name));
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }

    updateMutation.mutate({
      key: credentials.key,
      params: {
        name: displayName,
        about: about,
        profile_image: profileImage,
        website: website,
        location: location,
        cover_image: coverImage,
      },
      isKeychain: credentials.keychainLogin,
    });
  }

  const handleImageUpload = () => {
    authenticateUser();
    if (!isAuthorized()) return;

    open();
  };

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

        const data = await toBase64(image);
        let sign = await signImage(
          fresh_credentials.username,
          data,
          fresh_credentials.key,
          fresh_credentials?.keychainLogin
        );
        const result = await uploadImage(
          image,
          fresh_credentials?.username,
          sign
        );
        return result;
      },
      {
        loading: "Uploading...",
        success: (res: any) => {
          // Testing
          // const url = `https://cdn.steemitimages.com/DQmdyoAZ8pJGUSsqPjuKqYU4LBXeP75h8awmh964PVaE7zc/IMG_0.9163441659792777.jpeg`
          // if (isCover)
          //   setCoverImage(url);
          // else setProfileImage(url);
          // return `Uploaded`;

          if (res?.url) {
            if (isCover) setCoverImage(res.url);
            else setProfileImage(res.url);

            return `Uploaded`;
          } else {
            throw new Error(`Failed`);
          }
        },
        closeButton: false,
        error: (error) => {
          console.log("Upload error", error);
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
      }
    );
  };

  useEffect(() => {
    if (isSelf) {
      setDisplayName(name);
      setCoverImage(cover_image);
      setProfileImage(profile_image);
      setAbout(userAbout);
      setLocation(userLocation);
      setWebsite(userWebsite);
    }
  }, [parsedData]);
  return (
    <div className="flex flex-col gap-6 ">
      <div className="flex flex-col gap-4 max-w-2xl">
        <div className="flex items-center gap-2">
          <IoIosSettings size={iconSize} />
          <p className="text-sm">General</p>

          <Divider orientation="horizontal" className=" shrink" />
        </div>

        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <Select
            startContent={<TbServerBolt size={iconSize - 4} />}
            aria-label="Select RPC Node"
            variant="flat"
            label="Select RPC Node"
            disallowEmptySelection
            onChange={(key) => {
              handleRpcChange(key.target.value as string);
            }}
            selectedKeys={[rpc]}
            placeholder="Asset"
            // className=" max-w-[250px]"
            classNames={{
              value: "text-sm",
              // innerWrapper: ' w-10'
            }}
          >
            {AppStrings.rpc_servers.map((item) => {
              return (
                <SelectItem className="text-sm" key={item} value={item}>
                  {item}
                </SelectItem>
              );
            })}
          </Select>

          <Select
            startContent={<MdDisabledVisible size={iconSize - 4} />}
            aria-label="(NSFW) content"
            variant="flat"
            label="NSFW content"
            onChange={(key) => {
              handleNsfwChange(key.target.value as NSFW);
            }}
            selectedKeys={[nsfw]}
            placeholder="Asset"
            // className=" max-w-[250px]"
            classNames={{
              value: "text-sm",
              // innerWrapper: ' w-10'
            }}
          >
            {/* <SelectItem className="text-sm" key={'Always hide'} value={'Always hide'}>
                            {'Always hide'}
                        </SelectItem> */}

            <SelectItem
              className="text-sm"
              key={"Always warn"}
              value={"Always warn"}
            >
              {"Always warn"}
            </SelectItem>

            <SelectItem
              className="text-sm"
              key={"Always show"}
              value={"Always show"}
            >
              {"Always show"}
            </SelectItem>
          </Select>

          <div className="flex flex-col gap-2 bg-default-100 p-3 rounded-lg">
            <Checkbox
              isSelected={rememberVote}
              onValueChange={handleRememberVoteChange}
              classNames={{ label: "text-sm" }}
            >
              Remember last vote
            </Checkbox>
          </div>
        </div>
      </div>

      {isSelf && (
        <div className="flex flex-col gap-4  max-w-2xl">
          <div className="flex items-center gap-2">
            <RiUserSettingsFill size={iconSize} />
            <p className="text-sm">Profile</p>

            <Divider orientation="horizontal" className=" shrink" />
          </div>

          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1 max-w-2xl">
            <Input
              label="Profile picture url"
              value={profileImage}
              onValueChange={setProfileImage}
              maxLength={200}
              startContent={
                <FaUserCircle size={iconSize - 4} className={className} />
              }
              endContent={
                <Button
                  title="Upload"
                  onPress={() => {
                    isCover = false;
                    handleImageUpload();
                  }}
                  isIconOnly
                  radius="full"
                  variant="flat"
                >
                  <FaUpload size={iconSize - 4} />
                </Button>
              }
            />

            <Input
              label="Cover image url"
              maxLength={200}
              value={coverImage}
              onValueChange={setCoverImage}
              startContent={
                <AiFillPicture size={iconSize - 4} className={className} />
              }
              endContent={
                <Button
                  title="Upload"
                  onPress={() => {
                    isCover = true;
                    handleImageUpload();
                  }}
                  isIconOnly
                  radius="full"
                  variant="flat"
                >
                  <FaUpload size={iconSize - 4} />
                </Button>
              }
            />

            <Input
              label="Display Name"
              maxLength={20}
              value={displayName}
              onValueChange={setDisplayName}
              startContent={
                <MdDriveFileRenameOutline
                  size={iconSize - 4}
                  className={className}
                />
              }
            />

            <Input
              label="About"
              maxLength={160}
              value={about}
              onValueChange={setAbout}
              startContent={
                <FaInfoCircle size={iconSize - 4} className={className} />
              }
            />

            <Input
              label="Location"
              maxLength={30}
              value={location}
              onValueChange={setLocation}
              startContent={
                <MdAddLocationAlt size={iconSize - 4} className={className} />
              }
            />

            <Input
              label="Website"
              maxLength={100}
              value={website}
              onValueChange={setWebsite}
              startContent={
                <FaGlobe size={iconSize - 4} className={className} />
              }
            />
          </div>

          <Button
            isLoading={updateMutation.isPending}
            isDisabled={!isChanged || updateMutation.isPending}
            onPress={handleUpdate}
            className="self-start"
          >
            Save
          </Button>
        </div>
      )}
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
}
