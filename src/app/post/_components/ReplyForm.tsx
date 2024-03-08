"use client"

import React, { memo, useEffect, useState } from 'react'
import Reply from './Reply';
import BodyShort from '../../../components/body/BodyShort';
import { FiCornerLeftUp } from 'react-icons/fi';

import { useLogin } from '../../../components/useLogin';
import moment from 'moment';
import { Accordion, AccordionItem, Button, Card, Popover, PopoverContent, PopoverTrigger, User } from '@nextui-org/react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { awaitTimeout, useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { readingTime } from '@/libs/utils/readingTime/reading-time-estimator';
import { addCommentHandler } from '@/libs/redux/reducers/CommentReducer';
import { addRepliesHandler } from '@/libs/redux/reducers/RepliesReducer';
import { toast } from 'sonner';
import { publishContent } from '@/libs/steem/condenser';
import { AppStrings } from '@/libs/constants/AppStrings';
import CommentHeader from '@/components/comment/component/CommentHeader';
import MarkdownViewer from '@/components/body/MarkdownViewer';
import EditorInput from '@/components/editor/EditorInput';
import ClearFormButton from '@/components/editor/component/ClearFormButton';
import PublishButton from '@/components/editor/component/PublishButton';
import { getResizedAvatar } from '@/libs/utils/image';
import { createPatch, extractMetadata, generateReplyPermlink, makeJsonMetadata, makeJsonMetadataReply, validateCommentBody } from '@/libs/utils/editor';
import { checkPromotionText, getCredentials, getSessionKey, getSettings } from '@/libs/utils/user';
import secureLocalStorage from 'react-secure-storage';
import { useSession } from 'next-auth/react';
import { Role } from '@/libs/utils/community';
import { allowDelete } from '@/libs/utils/StateFunctions';
import CommentFooter from '@/components/comment/component/CommentFooter';

interface Props {
    comment: Post;
    rootComment: Post | Feed;
}

export default memo(function ReplyForm(props: Props) {
    const { comment, rootComment } = props;
    const commentInfo = (useAppSelector(state => state.commentReducer.values)[`${comment.author}/${comment.permlink}`] ?? comment) as Post;
    const rootInfo = (useAppSelector(state => state.commentReducer.values)[`${comment.root_author}/${comment.root_permlink}`]) as Post;
    const [selectedKeys, setSelectedKeys] = React.useState(new Set([commentInfo.depth === 1 ? commentInfo.permlink : 'null']));
    const postReplies = useAppSelector(state => state.repliesReducer.values)[`${rootInfo.author}/${rootInfo.permlink}`] ?? [];
    const [showReply, setShowReply] = useState(false);
    const [markdown, setMarkdown] = useState('');
    const rpm = readingTime(markdown);
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const [isPosting, setPosting] = useState(false);
    const { authenticateUser, isAuthorized } = useLogin();
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const dispatch = useAppDispatch();
    const queryKey = [`post-${rootInfo.author}-${rootInfo.permlink}`];
    const queryClient = useQueryClient();
    const [showEdit, setShowEdit] = useState(false);
    const [deletePopup, setDeletePopup] = useState(false);
    const { data: session } = useSession();

    const username = session?.user?.name;

    const isSelf = comment.author === username;


    const canMute = username && Role.atLeast(comment.observer_role, 'mod');
    const canDelete = !comment.children && isSelf && allowDelete(comment);
    const canEdit = isSelf;
    const allowReply = Role.canComment(comment.community, comment.observer_role);
    const canReply = allowReply && comment['depth'] < 255;


    const toggleReply = () => setShowReply(!showReply);
    const toggleEdit = () => setShowEdit(!showEdit);


    const getReplies = permlink => {
        return postReplies?.filter((item) => item.parent_permlink === permlink)
    }

    const replies = getReplies(commentInfo.permlink);


    function clearForm() {
        setMarkdown('');


    }


    function handleClear() {
        secureLocalStorage.removeItem('comment_draft');
        setMarkdown('');

    }

    useEffect(() => {

        if (showEdit || showReply) {
            document.getElementById(`editorDiv-${comment.link_id}`)?.scrollIntoView({ behavior: 'smooth' });

        }
        if (showEdit) {
            setMarkdown(commentInfo.body);
        }
        if (showReply) {
            const draft = (secureLocalStorage.getItem('comment_draft') || '') as string;
            setMarkdown(draft || '');
        }

    }, [showEdit, showReply]);


    function saveDraft() {
        if (showReply)
            secureLocalStorage.setItem('comment_draft', markdown);

    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            saveDraft();
        }, 1000);

        return () => clearTimeout(timeout);

    }, [markdown]);



    function handleDelete() {

    }

    function handleOnPublished(postData: PostingContent) {
        const time = moment().unix();

        let newComment: Post;
        // if the update then use the old data
        if (showEdit) {
            let body = markdown;

            if (!checkPromotionText(body))
                body = body + '\n\n' + AppStrings.promotion_text;

            newComment = {
                ...postData,
                ...commentInfo,
                last_update: time,
                body: body,
            }
        } else {
            newComment = {
                ...commentInfo,
                link_id: time,
                created: time,
                last_update: time,

                ...postData,
                body: postData.body,
                author: loginInfo.name,
                depth: commentInfo.depth + 1,
                payout: 0,
                upvote_count: 0,
                observer_vote: 0,
                category: commentInfo.category,
                author_reputation: loginInfo.reputation,
                author_role: commentInfo.observer_role ?? '',
                author_title: commentInfo.observer_title ?? '',
                observer_title: commentInfo.observer_title ?? '',
                observer_role: commentInfo.observer_role ?? '',
                root_author: rootInfo.author,
                root_permlink: rootInfo.permlink,
                root_title: commentInfo.root_title,
                net_rshares: 0,
                children: 0,
                observer_vote_percent: 0,
                resteem_count: 0,
                observer_resteem: 0,
                replies: [],
                votes: [],
                downvote_count: 0,
                cashout_time: moment().add(7, 'days').unix()
            }
        }


        if (showEdit) {
            dispatch(addCommentHandler({ ...newComment }));

        } else {
            queryClient.setQueryData(queryKey, { ...rootInfo, children: rootInfo?.children + 1 })

            // update the redux state for the post
            dispatch(addCommentHandler({ ...rootInfo, children: rootInfo?.children + 1 }));

            // update the redux state for the current comment
            dispatch(addCommentHandler({ ...commentInfo, children: commentInfo?.children + 1 }));

            // update the redux state for the root post replies
            dispatch(addRepliesHandler({
                comment: rootInfo,
                replies: [newComment].concat(postReplies)
            }));

        }

        clearForm();
        if (showEdit)
            setShowEdit(false);
        if (showReply)
            setShowReply(false);

        setPosting(false);

        toast.success(showEdit ? 'Updated' : 'Sent');
    }
    const postingMutation = useMutation({
        mutationKey: [`publish-reply`],
        mutationFn: ({ postData, options, key }:
            { postData: PostingContent, options?: any, key: string }) =>
            publishContent(postData, options, key),
        onSettled(data, error, variables, context) {
            if (error) {
                toast.error(error.message);
                return
            }
            const { postData } = variables;
            handleOnPublished(postData);
            setPosting(false);

        },
    });


    async function handlePublish() {

        if (!markdown) {
            toast.info('Comment can not be empty');
            return
        }

        const limit_check = validateCommentBody(markdown, false);
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
                let permlink = generateReplyPermlink(commentInfo.author);


                const postData: PostingContent = {
                    author: loginInfo,
                    title: '',
                    body: markdown,
                    parent_author: commentInfo.author,
                    parent_permlink: commentInfo.permlink,
                    json_metadata: makeJsonMetadataReply(),
                    permlink: permlink

                }

                // checkin if the promotion text already exist
                if (!checkPromotionText(markdown))
                    postData.body = postData.body + '\n\n' + AppStrings.promotion_text;


                const cbody = markdown.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "");

                // check if post is edit
                if (showEdit) {
                    const oldComment = commentInfo;
                    let newBody = cbody;
                    if (!checkPromotionText(newBody))
                        newBody = newBody + '\n\n' + AppStrings.promotion_text;
                    const patch = createPatch(oldComment?.body, newBody?.trim());
                    if (patch && patch.length < Buffer.from(oldComment?.body, "utf-8").length) {
                        newBody = patch;
                    }
                    const meta = extractMetadata(markdown);
                    const new_json_metadata = makeJsonMetadata(meta, []);
                    postData.permlink = oldComment.permlink;
                    postData.body = newBody;
                    postData.json_metadata = '';
                    postData.parent_author = oldComment.parent_author;
                    postData.parent_permlink = oldComment.parent_permlink;
                }


                const credentials = getCredentials(getSessionKey());

                if (credentials) {
                    // handleOnPublished(postData);
                    postingMutation.mutate({ postData, options: null, key: credentials.key });
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


    return (
        <div >
            <Accordion isCompact
                onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
                selectedKeys={selectedKeys} >
                <AccordionItem
                    key={commentInfo.permlink}
                    title={<div> <CommentHeader isDetail comment={commentInfo} isReply />
                    </div>} >
                    <div className='flex flex-col gap-2 p-1'>


                        <MarkdownViewer text={commentInfo.body} />

                        <div className='flex gap-1  self-end opacity-70 items-center justify-around  w-full'>

                            <CommentFooter isReply comment={comment} />
                            <>
                                {canReply &&
                                    <Button size='sm'
                                        onPress={() => { toggleReply() }}
                                        variant='light'
                                        isDisabled={showReply || showEdit}
                                        className='text-tiny min-w-0 min-h-0'>
                                        Reply

                                    </Button>}

                                {canEdit &&
                                    <Button size='sm'
                                        onPress={() => { toggleEdit() }}
                                        variant='light'
                                        isDisabled={showReply || showEdit}
                                        className='text-tiny min-w-0 min-h-0'>
                                        Edit

                                    </Button>}


                                {canDelete && < div >
                                    <Popover isOpen={deletePopup}
                                        onOpenChange={(open) => setDeletePopup(open)}
                                        placement={'top-start'} color='primary'>
                                        <PopoverTrigger >
                                            <Button size='sm'
                                                variant='light'
                                                isDisabled={showReply || showEdit}
                                                className='text-tiny min-w-0 min-h-0'>
                                                Delete
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent >
                                            <div className="px-1 py-2">
                                                <div className="text-small font-bold">{'Confirmation'}</div>
                                                <div className="text-tiny flex">
                                                    {'Do you really want to delete?'}
                                                </div>

                                                <div className="text-tiny flex mt-2 space-x-2">
                                                    <Button onPress={() => setDeletePopup(false)}
                                                        size='sm' color='default' variant='faded'>No</Button>
                                                    <Button size='sm' color='danger' variant='solid'
                                                        onPress={() => {
                                                            setDeletePopup(false);
                                                            handleDelete();
                                                        }}>YES</Button>

                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>

                                </div>}


                                {canMute &&
                                    <Button size='sm'
                                        onPress={() => { { } }}
                                        variant='light'
                                        isDisabled={showReply || showEdit}
                                        className='text-tiny min-w-0 min-h-0'>
                                        Mute

                                    </Button>
                                }

                            </>

                        </div >

                        <div id={`editorDiv-${comment.link_id}`}>
                            {(showReply || showEdit) ?
                                <div className='flex flex-col mt-2 gap-2'>
                                    <EditorInput
                                        value={markdown}
                                        onChange={setMarkdown}
                                        onImageUpload={() => { }}
                                        onImageInvalid={() => { }}
                                        rows={5} />

                                    <div className='flex justify-between'>
                                        <ClearFormButton
                                            onClearPress={handleClear} />

                                        <div className='flex gap-2 '>

                                            {<Button radius='full'
                                                size='sm'
                                                onPress={() => {
                                                    if (showReply)
                                                        toggleReply();
                                                    else toggleEdit();

                                                }}>
                                                Cancel
                                            </Button>}

                                            <PublishButton
                                                disabled={isPosting}
                                                onPress={handlePublish}
                                                isLoading={isPosting}
                                                tooltip=''
                                                buttonText={showEdit ? 'Update' : 'Send'} />
                                        </div>




                                    </div>

                                    <div className='space-y-1 w-full overflow-auto m-1 mt-4'>

                                        <div className=' items-center flex justify-between'>
                                            <p className='float-left text-sm text-default-900/70 font-semibold'>Preview</p>

                                            <p className='float-right text-sm font-light text-default-900/60'>{rpm?.words} words, {rpm?.text}</p>

                                        </div>
                                        {markdown ? <Card isBlurred shadow='sm' className=' p-2 lg:shadow-none space-y-2'>
                                            <MarkdownViewer text={markdown} />
                                        </Card> : null}
                                    </div>

                                </div> : null}
                        </div>
                        {replies?.map((item: Post) => (
                            <div className=' mt-6 ' style={{
                                // marginLeft: ((2 * (comment.depth - rootComment.depth)) / 2) + 'rem'

                            }} key={item.link_id}>
                                <div className='text-inherit flex flex-col items-start'>
                                    <User
                                        classNames={{
                                            description: 'mt-2 dark:text-gray-200/40 text-xs',
                                            name: 'text-xs dark:text-white/80'
                                        }}

                                        name={<div className='flex items-center space-x-2'>
                                            <p>{commentInfo.author}</p>
                                        </div>}
                                        description={<BodyShort body={commentInfo.body} length={50} />}
                                        title={item.parent_author}
                                        avatarProps={{
                                            src: getResizedAvatar(item.parent_author), size: 'sm'
                                        }}
                                    />

                                </div>
                                <div className='flex w-full mt-1 p-2'>
                                    <FiCornerLeftUp className='text-default-900/50' />
                                    <Reply
                                        comment={item}
                                        rootComment={rootInfo}
                                    />
                                </div>


                            </div>

                        ))

                        }

                    </div>
                </AccordionItem >
            </Accordion >



        </div >

    )
}
)