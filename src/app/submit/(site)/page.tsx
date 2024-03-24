"use client"

import React, { useEffect, useState } from 'react';
import RewardSelectButton, { rewardTypes } from '../../../components/editor/component/RewardSelectButton';
import CommunitySelectButton from '../../../components/editor/component/CommunitySelectButton';
import ClearFormButton from '../../../components/editor/component/ClearFormButton';
import BeneficiaryButton from '../../../components/editor/component/BeneficiaryButton';
import PublishButton from '../../../components/editor/component/PublishButton';
import { useLogin } from '../../../components/useLogin';
import { Card } from '@nextui-org/card';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { useMutation } from '@tanstack/react-query';
import { checkPromotionText, getCredentials, getSessionKey } from '@/libs/utils/user';
import { awaitTimeout, useAppSelector } from '@/libs/constants/AppFunctions';
import { readingTime } from '@/libs/utils/readingTime/reading-time-estimator';
import { publishContent } from '@/libs/steem/condenser';
import { toast } from 'sonner';
import { createPatch, extractMetadata, generatePermlink, makeJsonMetadata, makeJsonMetadataForUpdate, makeOptions, validateCommentBody } from '@/libs/utils/editor';
import MarkdownViewer from '@/components/body/MarkdownViewer';
import { AppStrings } from '@/libs/constants/AppStrings';
import { empty_community } from '@/libs/constants/Placeholders';
import { getPost } from '@/libs/steem/sds';
import EditorInput from '@/components/editor/EditorInput';
import './style.scss'
import secureLocalStorage from 'react-secure-storage';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import clsx from 'clsx';
import CommentOptionWrapper from '@/components/wrapper/CommentOptionWrapper';
import { useDeviceInfo } from '@/libs/utils/useDeviceInfo';
import TagsListCard from '@/components/TagsListCard';

interface Props {
    params?: {
        oldPost?: Post;
        handleUpdateSuccess?: (post: Post) => void;
        handleUpdateCancel?: () => void
    }

}

export default function SubmitPage(props: Props) {
    const { oldPost, handleUpdateSuccess, handleUpdateCancel } = props?.params || {};
    const isEdit = !!oldPost?.permlink;
    const { isMobile } = useDeviceInfo();

    const searchParams = useSearchParams();
    const accountParams = searchParams.get('account');
    const titleParams = searchParams.get('title');
    const [refCommunity, setRefCommunity] = useState(accountParams ? empty_community(accountParams,
        titleParams) : undefined);

    const draft = secureLocalStorage.getItem('post_draft') as {
        title: string,
        markdown: string, tags: string,
        beneficiaries: Beneficiary[],
        community: Community
    };

    const [title, setTitle] = useState(draft?.title || '');
    const [tags, setTags] = useState(draft?.tags || '');
    const [markdown, setMarkdown] = useState(isEdit ? oldPost?.body : draft?.markdown || '');

    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const { data: session } = useSession();

    const rpm = readingTime(markdown);
    const [reward, setReward] = React.useState(rewardTypes[1]);
    const [beneficiaries, setBeneficiaries] = React.useState<Beneficiary[]>(isEdit ? [] : draft?.beneficiaries || []);
    const [community, setCommunity] = useState<Community | undefined>(isEdit ? undefined : draft?.community);
    const [isPosting, setPosting] = useState(false);
    // const [openAuth, setOpenAuth] = useState(false);
    const { authenticateUser, isAuthorized } = useLogin();

    const pathname = usePathname();
    const splitted_path = pathname.split('/');
    splitted_path.shift();


    useEffect(() => {
        if (isEdit && oldPost) {
            if (oldPost.community)
                setCommunity(empty_community(oldPost.category, oldPost.community));
            setTitle(oldPost.title);
            setMarkdown(oldPost.body);
            setTags(JSON.parse(oldPost.json_metadata ?? '{}')?.tags?.join(' ') || '')
        }

    }, [oldPost])


    function saveDraft() {
        if (!isEdit)
            secureLocalStorage.setItem('post_draft', {
                title,
                markdown, tags,
                beneficiaries, community
            })

    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            saveDraft();
        }, 1000);

        return () => clearTimeout(timeout);

    }, [title,
        markdown, tags,
        beneficiaries, community]);




    function clearForm() {
        setTitle('');
        setMarkdown('');
        setTags('');
        setBeneficiaries([]);
        setReward(rewardTypes[1]);
        setCommunity(undefined);
    }


    // async function handleSchedule() {
    //     fetch('/api/steem', {
    //         method: 'POST',
    //         body: JSON.stringify({ name: 'faisalamin' })
    //     })

    // }


    const postingMutation = useMutation({
        mutationKey: [`publish-post`],
        mutationFn: ({ postData, options, key }:
            { postData: PostingContent, options?: any, key: string }) =>
            publishContent(postData, options, key),
        onSuccess(data, variables) {
            if (isEdit) {
                let body = markdown;

                if (!checkPromotionText(body))
                    body = body + '\n\n' + AppStrings.promotion_text;
                handleUpdateSuccess && handleUpdateSuccess({ ...oldPost, ...variables.postData, body: body });
                toast.success('Updated');
                return


            }
            toast.success('Published');

            clearForm();

        },
        onError(error) {
            toast.error(String(error));
        },
        onSettled() {
            setPosting(false);
        }
    });



    async function handlePublish() {

        if (!title) {
            toast.info('Title can not be empty');
            // AppConstants.SHOW_TOAST('Invalid title', 'Title can not be empty', 'info');
            return
        }
        if (!markdown) {
            toast.info('Post can not be empty');
            // AppConstants.SHOW_TOAST('Invalid description', 'Description can not be empty', 'info');
            return
        }

        const _tags = tags.split(' ').filter((tag) => tag && tag !== ' '
            && tag !== community?.account);

        if (_tags.length <= 0 && !community) {
            toast.info('Add a tag or select community');
            // AppConstants.SHOW_TOAST('Invalid tags', 'Add a tag or select community', 'info');
            return
        }
        if (_tags.length > 8) {

            toast.info('Please use only 8 tags');
            // AppConstants.SHOW_TOAST('Limit reached', 'Please use only 8 tags', 'info');
            return;
        }

        const limit_check = validateCommentBody(markdown, true);
        if (limit_check !== true) {
            toast.info(limit_check);
            // AppConstants.SHOW_TOAST('Failed', limit_check, 'info');
            return;
        }
        authenticateUser();


        if (isAuthorized()) {
            setPosting(true);

            await awaitTimeout(1);
            try {

                let permlink = generatePermlink(title);
                let simplePost;
                if (!isEdit) {
                    if (!!loginInfo.name)
                        try {
                            simplePost = await getPost(loginInfo.name, permlink);
                        } catch (e) {
                            // silent ignore
                        }
                    else {
                        setPosting(false);
                        toast.info('Something went wrong!');
                        return
                    }


                    // check if the permlink already exist

                    // if exist create new permlink
                    if (simplePost && simplePost?.permlink === permlink) {
                        permlink = generatePermlink(title, true);
                    }
                }

                let options = makeOptions({
                    author: loginInfo.name,
                    permlink,
                    operationType: reward?.payout,
                    beneficiaries: beneficiaries,
                });

                // if community is selected

                let parent_permlink = _tags[0] || 'steempro'
                if (community && community.account !== loginInfo.name) {
                    parent_permlink = community.account;
                }

                const cbody = markdown.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "");

                let postData: PostingContent = {
                    author: loginInfo,
                    title: title,
                    body: cbody,
                    parent_author: '',
                    parent_permlink: parent_permlink,
                    json_metadata: {},
                    permlink: permlink

                }

                if (!checkPromotionText(markdown))
                    postData.body = postData.body + '\n\n' + AppStrings.promotion_text;

                const meta = extractMetadata(postData.body);

                const jsonMeta = makeJsonMetadata(meta, _tags);
                postData.json_metadata = jsonMeta;


                if (isEdit && oldPost) {
                    let newBody = cbody;

                    postData.parent_permlink = isEdit ? oldPost?.category : parent_permlink || 'steempro';


                    if (!checkPromotionText(markdown))
                        newBody = newBody + '\n\n' + AppStrings.promotion_text;

                    const patch = createPatch(oldPost?.body, newBody?.trim());
                    if (patch && patch.length < Buffer.from(oldPost.body, "utf-8").length) {
                        newBody = patch;
                    }

                    let newTitle = title?.trim();
                    // const patch2 = createPatch(oldComment?.title, newTitle.trim());
                    // if (patch2 && patch2.length < Buffer.from(oldComment?.title, "utf-8").length) {
                    //     newTitle = patch2;
                    // }
                    const new_json_metadata = makeJsonMetadataForUpdate({
                        ...JSON.parse(oldPost.json_metadata)
                    }, extractMetadata(cbody), _tags);

                    postData.permlink = oldPost.permlink;
                    postData.body = newBody;
                    postData.title = newTitle;
                    postData.json_metadata = new_json_metadata || JSON.parse(oldPost.json_metadata);
                    options = undefined;
                }


                const credentials = getCredentials(getSessionKey());

                if (credentials) {
                    postingMutation.mutate({ postData, options, key: credentials.key });
                } else {
                    setPosting(false);
                    toast.error('Invalid credentials');
                }


            } catch (e) {
                toast.error(String(e));
                setPosting(false);
            }
        }

    }




    return (<div className={clsx(`editor-main flex flex-col flex-1 gap-4 items-center w-full `,
        !oldPost && '1md:justify-evenly 1md:items-start 1md:flex-row ')} >

        <div className={clsx(`flex flex-col w-full  gap-2`,
            !oldPost && '1md:w-[50%] 1md:float-start 1md:sticky 1md:self-start 1md:top-[70px] px-1')}>

            <CommunitySelectButton
                isDisabled={isPosting}
                community={community}
                onlyCommunity={isEdit}
                refCommunity={refCommunity}
                onSelectCommunity={setCommunity}
                handleOnClear={() => {
                    if (refCommunity) {
                        history.replaceState({}, '', '/submit');
                        setRefCommunity(undefined);

                    }

                }}

            />


            <Input size='sm'
                value={title}
                onValueChange={setTitle}
                className='text-default-900 '

                classNames={{
                    input: 'font-bold text-md',
                    inputWrapper: 'h-8'
                }}
                isDisabled={isPosting}
                placeholder={'Title'} maxLength={255} />

            <Input size='sm' value={tags}
                className='text-default-900 '

                onValueChange={setTags}
                classNames={{
                    inputWrapper: 'h-8'
                }}
                autoCapitalize='off'
                placeholder={'Tags here...'}
                isDisabled={isPosting}
                maxLength={255} />

            <EditorInput value={markdown}
                isDisabled={isPosting}
                onChange={setMarkdown}
                onImageUpload={() => { }}
                onImageInvalid={() => { }} />



            <div className='flex gap-2 relativeitems-center flex-row'>

                <div className='gap-2 flex'>
                    <ClearFormButton onClearPress={clearForm}
                        isDisabled={isPosting} />

                    <CommentOptionWrapper advance={isMobile}>
                        <BeneficiaryButton
                            isDisabled={isEdit || isPosting}
                            onSelectBeneficiary={bene => {
                                setBeneficiaries([...beneficiaries, { ...bene, weight: bene.weight }]);
                            }}
                            onRemove={(bene) => {
                                setBeneficiaries(beneficiaries?.filter(item => item.account !== bene.account));
                            }}
                            beneficiaries={beneficiaries}
                        />
                        <RewardSelectButton
                            isDisabled={isEdit || isPosting}
                            selectedValue={reward}
                            onSelectReward={(reward) => {
                                setReward(reward);
                            }} />

                    </CommentOptionWrapper>
                </div>

                <div className='flex flex-1 justify-end gap-2 w-full'>
                    {/* <ScheduleButton isDisabled={isEdit} onPress={handleSchedule} /> */}

                    {isEdit && <Button size='sm'
                        radius='full' onPress={() => {
                            handleUpdateCancel && handleUpdateCancel();
                        }}>
                        Cancel
                    </Button>}

                    <PublishButton
                        isDisabled={isPosting}
                        isLoading={isPosting}
                        buttonText={isEdit ? 'Update' : undefined}
                        onPress={handlePublish} />

                </div>

            </div>

        </div>


        <div className={clsx(isEdit ? '' : '1md:w-[50%] ', 'flex flex-col w-full mb-10 gap-2')}>

            <div className=' items-center flex justify-between'>
                <p className='float-left text-default-900/70 font-bold'>{'Preview'}</p>

                <p className='float-right text-sm font-light text-default-900'>{rpm?.words} words, {rpm?.text}</p>

            </div>
            {markdown ? <Card shadow='none'
                className='p-2 lg:shadow-md space-y-2'>
                <TagsListCard tags={tags?.trim().split(' ')} />
                <div className='flex flex-col items-center'>
                    <MarkdownViewer text={markdown} />
                </div>
            </Card> : null}
        </div>
    </div>

    )
}