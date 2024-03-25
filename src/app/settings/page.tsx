'use client';

import { useLogin } from '@/components/useLogin';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions'
import { signImage, updateClient, updateProfile, uploadImage } from '@/libs/steem/condenser';
import { toBase64 } from '@/libs/utils/helper';
import { getCredentials, getSessionKey, getSettings, updateSettings } from '@/libs/utils/user';
import { Divider, } from '@nextui-org/divider';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { Select, SelectItem } from '@nextui-org/select';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FaInfoCircle, FaUpload, FaUserCircle } from "react-icons/fa";
import { toast } from 'sonner';
import { FaGlobe } from "react-icons/fa";
import { MdAddLocationAlt } from 'react-icons/md';
import { AiFillPicture } from "react-icons/ai";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { TbServerBolt } from "react-icons/tb";
import { twMerge } from 'tailwind-merge';
import { AppStrings } from '@/libs/constants/AppStrings';
import { RiUserSettingsFill } from "react-icons/ri";
import { updateSettingsHandler } from '@/libs/redux/reducers/SettingsReducer';
import { MdDisabledVisible } from "react-icons/md";
import { useMutation } from '@tanstack/react-query';
import { saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import { IoIosSettings } from "react-icons/io";
import { addProfileHandler } from '@/libs/redux/reducers/ProfileReducer';

let isCover: boolean = false;
export default function SettingsPage() {
    const { username } = usePathnameClient();

    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const [parsedData, setParsedData] = useState<any>();
    const { profile_image = "", cover_image = "", name = "", about: userAbout = "",
        website: userWebsite = "", location: userLocation = "" } = parsedData?.profile ?? {};


    const [displayName, setDisplayName] = useState(name ?? '');
    const [coverImage, setCoverImage] = useState(cover_image ?? '');
    const [profileImage, setProfileImage] = useState(profile_image ?? '');
    const [about, setAbout] = useState(userAbout ?? '');
    const [website, setWebsite] = useState(userWebsite ?? '');
    const [location, setLocation] = useState(userLocation ?? '');
    const settings = getSettings();
    const isSelf = !!loginInfo.name && (!username || (loginInfo.name === username));

    const [rpc, setRpc] = useState(settings.rpc || AppStrings.rpc_servers[0]);
    const [nsfw, setNsfw] = useState(settings.nsfw || 'Always warn');
    const dispatch = useAppDispatch();

    const { authenticateUser, isAuthorized } = useLogin();


    useEffect(() => {
        setParsedData(JSON.parse(loginInfo?.posting_json_metadata ?? `{}`));
    }, [loginInfo?.posting_json_metadata]);

    const isChanged = profileImage !== profile_image || coverImage !== cover_image ||
        name !== displayName || about !== userAbout || location !== userLocation || website !== userWebsite;

    const className = 'text-medium text-default-600';
    const fileInputRef = useRef<any>(null);



    const updateMutation = useMutation({
        mutationFn: (data: {
            key: string, params: {
                name: string;
                about: string;
                profile_image: string;
                website: string;
                location: string;
                cover_image: string;
                version?: number | undefined;
            }
        }) => updateProfile(loginInfo, data.key, data.params),
        onSettled(data, error, variables, context) {
            if (error) {
                toast.error(error.message);
                return;
            }
            dispatch(addProfileHandler({ ...loginInfo, posting_json_metadata: JSON.stringify({ profile: variables.params }) }));
            dispatch(saveLoginHandler({ ...loginInfo, posting_json_metadata: JSON.stringify({ profile: variables.params }) }));
            toast.success('Updated');
        },
    });

    const handleOnPicked = (event) => {
        if (event.target.files && event.target.files[0]) {
            const image = event.target.files[0];
            _uploadImage(image);
        }
    };

    function handleRpcChange(newRpc: string) {
        setRpc(newRpc);
        updateSettings({ ...settings, rpc: newRpc });
        // !important: update the condenser client after updating the setting
        updateClient();
        toast.success(`RPC changed to ${newRpc}`);

    };

    function handleNsfwChange(newNsfw: NSFW) {
        setNsfw(newNsfw);
        const newSetting = updateSettings({ ...settings, nsfw: newNsfw });
        dispatch(updateSettingsHandler(newSetting));
        toast.success(`NSFW content visibility: ${newNsfw}`);

    };

    async function handleUpdate() {
        authenticateUser();
        if (!isAuthorized())
            return;

        const credentials = getCredentials(getSessionKey());
        if (!credentials?.key) {
            toast.error('Invalid credentials');
            return
        }

        updateMutation.mutate({
            key: credentials.key, params: {
                name: displayName,
                about: about,
                profile_image: profileImage,
                website: website,
                location: location,
                cover_image: coverImage
            }
        });

    };


    const handleImageUpload = () => {
        authenticateUser();
        if (!isAuthorized())
            return;

        fileInputRef?.current?.click();
    };

    const _uploadImage = async (image) => {

        const credentials = getCredentials(getSessionKey());
        if (!credentials?.key) {
            toast.error('Invalid credentials');
            return
        }

        toast.promise(
            async () => {
                // Testing
                // await awaitTimeout(5);
                // return true
                const data = await toBase64(image.file);
                let sign = await signImage(data, credentials.key);
                const result = await uploadImage(image.file, credentials.username, sign);
                return result;
            },
            {
                loading: 'Uploading...',
                success: (res: any) => {
                    // Testing
                    // const url = `https://cdn.steemitimages.com/DQmdyoAZ8pJGUSsqPjuKqYU4LBXeP75h8awmh964PVaE7zc/IMG_0.9163441659792777.jpeg`
                    // if (isCover)
                    //   setCoverImage(url);
                    // else setProfileImage(url);
                    // return `Uploaded`;

                    if (res.data && res.data.url) {
                        if (isCover)
                            setCoverImage(res.data.url);
                        else setProfileImage(res.data.url);

                        return `Uploaded`;
                    } else {
                        return `Failed`;

                    }
                },
                closeButton: false,
                error: (error) => {
                    if (error.toString().includes('code 413')) {
                        // console.log('Large file size')
                        return ('Large file size');

                    } else if (error.toString().includes('code 429')) {
                        // console.log('Limit exceed')
                        return ('Limit exceed')
                    } else if (error.toString().includes('code 400')) {
                        // console.log('Invalid Image', error)
                        return ('Invalid Image')
                    } else {
                        return ('Failed: ' + String(error))
                    }

                },
            });
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

        <div className='flex flex-col gap-6 '>

            <div className='flex flex-col gap-2  max-w-2xl'>

                <div className='flex items-center gap-2'>
                    <IoIosSettings className=' text-xl' />
                    <p className='text-sm'>General</p>

                    <Divider orientation='horizontal' className=' shrink' />
                </div>

                <div className='grid grid-cols-2 gap-4 max-sm:grid-cols-1'>

                    <Select
                        startContent={<TbServerBolt className={twMerge(className, 'text-lg')} />}
                        aria-label="Select RPC Node"
                        variant='flat'
                        label='Select RPC Node'
                        onChange={(key) => {
                            handleRpcChange(key.target.value as string)
                        }}
                        selectedKeys={[rpc]}
                        size="sm"
                        placeholder="Asset"
                        // className=" max-w-[250px]"
                        classNames={{
                            value: 'text-tiny',
                            // innerWrapper: ' w-10'
                        }}  >
                        {AppStrings.rpc_servers.map((item) => {
                            return <SelectItem className="text-xs" key={item} value={item}>
                                {item}
                            </SelectItem>

                        })}

                    </Select>

                    <Select
                        startContent={<MdDisabledVisible className={twMerge(className, 'text-lg')} />}
                        aria-label="(NSFW) content"
                        variant='flat'
                        label='NSFW content'
                        onChange={(key) => {
                            handleNsfwChange(key.target.value as NSFW)
                        }}
                        selectedKeys={[nsfw]}
                        size="sm"
                        placeholder="Asset"
                        // className=" max-w-[250px]"
                        classNames={{
                            value: 'text-tiny',
                            // innerWrapper: ' w-10'
                        }}  >
                        {/* <SelectItem className="text-xs" key={'Always hide'} value={'Always hide'}>
                            {'Always hide'}
                        </SelectItem> */}

                        <SelectItem className="text-xs" key={'Always warn'} value={'Always warn'}>
                            {'Always warn'}
                        </SelectItem>

                        <SelectItem className="text-xs" key={'Always show'} value={'Always show'}>
                            {'Always show'}
                        </SelectItem>


                    </Select>

                </div>
            </div>

            {
                isSelf && <div className='flex flex-col gap-2  max-w-2xl'>

                    <div className='flex items-center gap-2'>
                        <RiUserSettingsFill className=' text-xl' />
                        <p className='text-sm'>Profile</p>

                        <Divider orientation='horizontal' className=' shrink' />
                    </div>


                    <div className='grid grid-cols-2 gap-4 max-sm:grid-cols-1 max-w-2xl'>

                        <Input label='Profile picture url'
                            value={profileImage} onValueChange={setProfileImage}
                            maxLength={200}
                            startContent={<FaUserCircle className={className} />}
                            endContent={<Button title='Upload' onClick={() => {
                                isCover = false;
                                handleImageUpload()
                            }}
                                isIconOnly radius='full'
                                variant='flat' size='sm'>
                                <FaUpload className='text-xl' />

                            </Button>}

                        />

                        <Input label='Cover image url' maxLength={200}
                            value={coverImage} onValueChange={setCoverImage}
                            startContent={<AiFillPicture className={className} />}
                            endContent={<Button title='Upload' onClick={() => {
                                isCover = true;
                                handleImageUpload()
                            }}
                                isIconOnly radius='full'
                                variant='flat' size='sm'>
                                <FaUpload className='text-xl' />
                            </Button>} />

                        <Input label='Display Name' maxLength={20}
                            value={displayName} onValueChange={setDisplayName}
                            startContent={<MdDriveFileRenameOutline className={className} />}
                        />

                        <Input label='About' maxLength={160}
                            value={about} onValueChange={setAbout}
                            startContent={<FaInfoCircle className={className} />}

                        />

                        <Input label='Location' maxLength={30}
                            value={location} onValueChange={setLocation}
                            startContent={<MdAddLocationAlt className={className} />}

                        />

                        <Input label='Website' maxLength={100}
                            value={website} onValueChange={setWebsite}
                            startContent={<FaGlobe className={className} />}
                        />


                    </div>

                    <Button size='sm'
                        isLoading={updateMutation.isPending}
                        isDisabled={!isChanged || updateMutation.isPending}
                        onClick={handleUpdate}
                        className='self-start'>Update</Button>

                </div>
            }

            <input type="file"
                ref={fileInputRef}
                onChange={handleOnPicked}
                accept="image/*"
                style={{ display: 'none' }} />

        </div >
    )
}
