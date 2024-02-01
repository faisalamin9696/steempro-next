"use client"

import React, { useMemo, useState } from 'react';
import RewardSelectButton, { rewardTypes } from '../../../components/editor/component/RewardSelectButton';
import CommunitySelectButton from '../../../components/editor/component/CommunitySelectButton';
import ClearFormButton from '../../../components/editor/component/ClearFormButton';
import BeneficiaryButton from '../../../components/editor/component/BeneficiaryButton';
import ScheduleButton from '../../../components/editor/component/ScheduleButton';
import PublishButton from '../../../components/editor/component/PublishButton';
import { useLogin } from '../../../components/useLogin';
import { Input, Card, Chip } from '@nextui-org/react';
import { useMutation } from '@tanstack/react-query';
import { checkPromotionText, getCredentials, getSessionKey, getSettings } from '@/libs/utils/user';
import { awaitTimeout, useAppSelector } from '@/libs/constants/AppFunctions';
import { readingTime } from '@/libs/utils/readingTime/reading-time-estimator';
import { publishContent } from '@/libs/steem/condenser';
import { toast } from 'sonner';
import { createPatch, extractMetadata, generatePermlink, makeJsonMetadata, makeJsonMetadataForUpdate, makeOptions, validateCommentBody } from '@/libs/utils/editor';
import MarkdownViewer from '@/components/body/MarkdownViewer';
import { AppStrings } from '@/libs/constants/AppStrings';
import { empty_comment } from '@/libs/constants/Placeholders';
import { getPost } from '@/libs/steem/sds';
import EditorInput from '@/components/editor/EditorInput';
import './style.scss'

export default function SubmitPage() {

    const [title, setTitle] = useState('');
    const [tags, setTags] = useState('');

    const [markdown, setMarkdown] = useState('');
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const loginInfo = useAppSelector(state => state.loginReducer.value);

    const rpm = readingTime(markdown, 200, settings.lang.code);
    const [reward, setReward] = React.useState(rewardTypes[1]);
    const [beneficiaries, setBeneficiaries] = React.useState<Beneficiary[]>([]);
    const [community, setCommunity] = useState<Community>();
    const [isPosting, setPosting] = useState(false);
    const isEdit = false;
    // const [openAuth, setOpenAuth] = useState(false);
    const { authenticateUser, isAuthorized } = useLogin();



    const postingMutation = useMutation({
        mutationKey: [`publish-post`],
        mutationFn: ({ postData, options, key }:
            { postData: PostingContent, options?: any, key: string }) =>
            publishContent(postData, options, key),
        onSuccess() {
            toast.success('Published');
            clearForm();

        },
        onError(error) {
            toast.error(error.message);
        },
        onSettled() {
            setPosting(false);
        }
    });



    function clearForm() {
        setTitle('');
        setMarkdown('');
        setTags('');

    }


    async function handleSchedule() {
        fetch('/api/steem', {
            method: 'POST',
            body: JSON.stringify({ name: 'faisalamin' })
        })

    }


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

        const _tags = tags.split(' ').filter((tag) => tag && tag !== ' ');

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

                const meta = extractMetadata(markdown);
                let permlink = generatePermlink(title);
                let simplePost: Post | undefined;


                if (!isEdit) {
                    try {
                        simplePost = await getPost(loginInfo.name, permlink);

                    } catch (e) {

                    }
                    // check if the permlink already exist

                    // if exist create new permlink
                    if (simplePost && simplePost.permlink === permlink) {
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

                const jsonMeta = makeJsonMetadata(meta, _tags);
                const parentPermlink = isEdit ? 'editData.category' : parent_permlink || 'steempro';
                const cbody = markdown.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "");

                let postData: PostingContent = {
                    author: loginInfo,
                    title: title,
                    body: cbody,
                    parent_author: '',
                    parent_permlink: parentPermlink,
                    json_metadata: JSON.stringify(jsonMeta),
                    permlink: permlink

                }

                if (!checkPromotionText(markdown))
                    postData.body = postData.body + '\n\n' + AppStrings.promotion_text;

                if (isEdit) {
                    const oldComment = empty_comment('', '');
                    let newBody = cbody;

                    if (!checkPromotionText(markdown))
                        newBody = newBody + '\n\n' + AppStrings.promotion_text;

                    const patch = createPatch(oldComment?.body, newBody?.trim());
                    if (patch && patch.length < Buffer.from(oldComment?.body, "utf-8").length) {
                        newBody = patch;
                    }
                    // const patch2 = createPatch(oldComment?.title, newTitle.trim());
                    // if (patch2 && patch2.length < Buffer.from(oldComment?.title, "utf-8").length) {
                    //     newTitle = patch2;
                    // }
                    const new_json_metadata = makeJsonMetadataForUpdate({
                        ...JSON.parse(oldComment.json_metadata)
                    }, extractMetadata(cbody), tags);

                    postData.permlink = oldComment.permlink;
                    postData.body = newBody;
                    postData.title = title;
                    postData.json_metadata = JSON.stringify(new_json_metadata || JSON.parse(oldComment.json_metadata));
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
    return (<div className='editor-main flex flex-col lg:flex-row gap-2 lg:justify-evenly' >
        <div className='lg:float-start flex flex-col w-full gap-2 lg:sticky lg:self-start lg:top-[70px]'>

            <CommunitySelectButton
                community={community}
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

                        <BeneficiaryButton onSelectBeneficiary={bene => {
                            setBeneficiaries([...beneficiaries, { ...bene, weight: bene.weight }]);
                        }}
                            onRemove={(bene) => {
                                setBeneficiaries(beneficiaries?.filter(item => item.account !== bene.account));
                            }}
                            beneficiaries={beneficiaries}
                        />

                    </div>
                    <RewardSelectButton
                        selectedValue={reward}
                        onSelectReward={(reward) => {
                            setReward(reward);
                        }} />
                </div>

                <div className='flex flex-1 justify-end gap-2 w-full'>
                    <ScheduleButton onPress={handleSchedule} />

                    <PublishButton disabled={isPosting}
                        isLoading={isPosting}
                        onPress={handlePublish} />

                </div>

            </div>

        </div>


        <div className='flex flex-col w-full max-w-[640px]'>

            <div className=' items-center flex justify-between'>
                <p className='float-left text-default-900/70 font-bold'>{'Preview'}</p>

                <p className='float-right text-sm font-extralight text-default-900/60'>{rpm?.words} words, {rpm?.text}</p>

            </div>
            {markdown ? <Card shadow='none' className='p-2 lg:shadow-md space-y-2'>
                <div className='flex gap-2 overscroll-x-contain flex-wrap shrink-0'>
                    {tags.trim().split(' ')?.filter(tag => !!tag)?.map(tag => {
                        return <Chip key={tag}>{tag}</Chip>
                    })}
                </div>
                <MarkdownViewer text={markdown} />
            </Card> : null}
        </div>
    </div>

    )
}