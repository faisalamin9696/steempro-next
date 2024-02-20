"use client"

import React, { useEffect, useMemo, useState } from 'react';
import RewardSelectButton, { rewardTypes } from '../../../components/editor/component/RewardSelectButton';
import CommunitySelectButton from '../../../components/editor/component/CommunitySelectButton';
import ClearFormButton from '../../../components/editor/component/ClearFormButton';
import BeneficiaryButton from '../../../components/editor/component/BeneficiaryButton';
import ScheduleButton from '../../../components/editor/component/ScheduleButton';
import PublishButton from '../../../components/editor/component/PublishButton';
import { useLogin } from '../../../components/useLogin';
import { Input, Card, Chip, Button } from '@nextui-org/react';
import { useMutation } from '@tanstack/react-query';
import { checkPromotionText, getCredentials, getSessionKey, getSettings } from '@/libs/utils/user';
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
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import clsx from 'clsx';

type Props = {
    oldPost?: Post;
    handleUpdateSuccess?: () => void;
    handleUpdateCancel?: () => void

}
export default function SubmitPage(props: Props) {
    const { oldPost, handleUpdateSuccess, handleUpdateCancel } = props;
    const isEdit = !!oldPost?.permlink;

    const draft = secureLocalStorage.getItem('post_draft') as {
        title: string,
        markdown: string, tags: string,
        beneficiaries: Beneficiary[],
        community: Community
    };

    const [title, setTitle] = useState(draft?.title || '');
    const [tags, setTags] = useState(draft?.tags || '');
    const [markdown, setMarkdown] = useState(draft?.markdown || '');

    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const { data: session } = useSession();

    const rpm = readingTime(markdown);
    const [reward, setReward] = React.useState(rewardTypes[1]);
    const [beneficiaries, setBeneficiaries] = React.useState<Beneficiary[]>(draft?.beneficiaries || []);
    const [community, setCommunity] = useState<Community>(draft?.community);
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
    }


    async function handleSchedule() {
        fetch('/api/steem', {
            method: 'POST',
            body: JSON.stringify({ name: 'faisalamin' })
        })

    }


    const postingMutation = useMutation({
        mutationKey: [`publish-post`],
        mutationFn: ({ postData, options, key }:
            { postData: PostingContent, options?: any, key: string }) =>
            publishContent(postData, options, key),
        onSuccess(data, variables) {
            if (isEdit) {
                handleUpdateSuccess && handleUpdateSuccess();
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


        if (isAuthorized) {
            setPosting(true);

            await awaitTimeout(1);
            try {

                let permlink = generatePermlink(title);
                let simplePost;
                if (!isEdit) {
                    try {
                        if (session?.user?.name)
                            simplePost = await getPost(session.user.name, permlink);
                        else {
                            setPosting(false);
                            toast.info('Login failed');
                            return
                        }

                    } catch (e) {

                    }
                    // check if the permlink already exist

                    // if exist create new permlink
                    if (simplePost && simplePost.permlink === permlink) {
                        permlink = generatePermlink(title, true);
                    }
                }

                let options = makeOptions({
                    author: session?.user?.name,
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




    return (<div className={clsx(`editor-main flex flex-col flex-1 gap-6 items-center `,
        !oldPost && 'lg:justify-evenly lg:items-start lg:flex-row')} >

        <div className={clsx(`flex flex-col w-full gap-2 `,
            !oldPost && 'lg:float-start lg:sticky lg:self-start lg:top-[70px]')}>

            <CommunitySelectButton
                community={community}
                onlyCommunity={isEdit}
                onSelectCommunity={setCommunity} />


            <Input size='sm'
                value={title}
                onValueChange={setTitle}
                className='text-default-900 '

                classNames={{
                    input: 'font-bold text-md',
                    inputWrapper: 'h-8'
                }}
                placeholder={'Title'} maxLength={255} />

            <Input size='sm' value={tags}
                className='text-default-900 '

                onValueChange={setTags}
                classNames={{
                    inputWrapper: 'h-8'
                }}

                placeholder={'Tags here...'} maxLength={255} />

            {useMemo(() => {
                return <EditorInput value={markdown}
                    onChange={setMarkdown}
                    inputClass=' h-full'
                    onImageUpload={() => { }}
                    onImageInvalid={() => { }} />

            }, [markdown])}


            <div className='flex gap-2 relative items-center  max-sm:items-start'>
                <div className='flex gap-2 max-sm:flex-col'>

                    <div className='gap-2 flex'>
                        <ClearFormButton onClearPress={clearForm} />

                        <BeneficiaryButton
                            disabled={isEdit}
                            onSelectBeneficiary={bene => {
                                setBeneficiaries([...beneficiaries, { ...bene, weight: bene.weight }]);
                            }}
                            onRemove={(bene) => {
                                setBeneficiaries(beneficiaries?.filter(item => item.account !== bene.account));
                            }}
                            beneficiaries={beneficiaries}
                        />
                        <RewardSelectButton
                            disabled={isEdit}
                            selectedValue={reward}
                            onSelectReward={(reward) => {
                                setReward(reward);
                            }} />

                    </div>

                </div>

                <div className='flex flex-1 justify-end gap-2 w-full'>
                    <ScheduleButton disabled={isEdit} onPress={handleSchedule} />

                    {isEdit && <Button size='sm'
                        radius='full' onPress={() => {
                            handleUpdateCancel && handleUpdateCancel();
                        }}>
                        Cancel
                    </Button>}

                    <PublishButton
                        disabled={isPosting}
                        isLoading={isPosting}
                        buttonText={isEdit ? 'Update' : undefined}
                        onPress={handlePublish} />

                </div>

            </div>

        </div>


        <div className='flex flex-col w-full max-w-[640px] mb-10 gap-2'>

            <div className=' items-center flex justify-between'>
                <p className='float-left text-default-900/70 font-bold'>{'Preview'}</p>

                <p className='float-right text-sm font-extralight text-default-900'>{rpm?.words} words, {rpm?.text}</p>

            </div>
            {markdown ? <Card shadow='none'
                className='p-2 lg:shadow-md space-y-2'>
                <div className='flex gap-2 overscroll-x-contain flex-wrap shrink-0'>
                    {tags?.trim().split(' ')?.filter(tag => !!tag)?.map(tag => {
                        return <Chip key={tag}>{tag}</Chip>
                    })}
                </div>
                <MarkdownViewer text={markdown} />
            </Card> : null}
        </div>
    </div>

    )
}