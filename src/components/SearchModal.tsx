import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@nextui-org/modal';
import { Button } from '@nextui-org/button';
import React, { useMemo, useState } from 'react'
import { Tab, Tabs } from '@nextui-org/tabs';
import { Input } from '@nextui-org/input';
import { awaitTimeout, fetchSds, useAppSelector } from '@/libs/constants/AppFunctions';
import useSWR from 'swr';
import LoadingCard from './LoadingCard';
import CompactPost from './CompactPost';
import SAvatar from './SAvatar';
import clsx from 'clsx';
import TimeAgoWrapper from './wrapper/TimeAgoWrapper';
import { FaSearch } from 'react-icons/fa';
import Reputation from './Reputation';
import InfiniteScroll from 'react-infinite-scroll-component';
import EmptyList from './EmptyList';
import { FeedBodyLength } from '@/libs/constants/AppConstants';


type SearchTypes = 'posts' | 'comments' | 'tags' | 'people';


interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}
export default function SearchModal(props: Props) {

    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const [searchType, setSearchType] = useState<SearchTypes>('posts');
    const [searchText, setSearchText] = useState('');
    const [searchAuthor, setSearchAuthor] = useState('');
    const [searchTags, setSearchTags] = useState('');

    const filters = `any/${loginInfo.name || null}/${FeedBodyLength}/time/DESC/25/1000`;
    const POST_BY_TEXT_URL = `/content_search_api/getPostsByText/${searchText}/${filters}`;
    const POST_BY_TAGS_TEXT_URL = `/content_search_api/getPostsByTagsText/${searchTags}/${searchText}/${filters}`;
    const POST_BY_AUTHOR_TEXT_URL = `/content_search_api/getPostsByAuthorText/${searchAuthor}/${searchText}/${filters}`;

    const COMMENTS_BY_TEXT_URL = `/content_search_api/getCommentsByText/${searchText}/${filters}`;
    const COMMENTS_BY_AUTHOR_TEXT_URL = `/content_search_api/getCommentsByAuthorText/${searchAuthor}/${filters}`;
    const PEOPLE_URL = `/accounts_api/getAccountsByPrefix/${searchText}/${loginInfo.name || 'null'}/name,reputation,posting_json_metadata,created`;

    const [url, setUrl] = useState<string | undefined>();
    const [rows, setRows] = useState<any[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const { data, isLoading } = useSWR(url, fetchSds<any[]>);


    useMemo(() => {
        if (data) {
            setRows(data.slice(0, 8));
        }
    }, [data]);


    function getUrl() {
        switch (searchType) {
            case 'posts':
                if (searchText && searchAuthor)
                    return POST_BY_AUTHOR_TEXT_URL;
                else (searchText)
                return POST_BY_TEXT_URL;
            case 'comments':
                if (searchText && searchAuthor)
                    return COMMENTS_BY_AUTHOR_TEXT_URL;
                else return COMMENTS_BY_TEXT_URL;
            case 'tags':
                if (searchText && searchTags)
                    return POST_BY_TAGS_TEXT_URL;
                else return POST_BY_TEXT_URL;
            case 'people':
                return PEOPLE_URL;

            default:
                return undefined
        }

    }


    function handleSearch() {
        setUrl(!!searchText ? getUrl() : undefined);
    }



    function ListLoader(): JSX.Element {
        return (<div className='flex justify-center items-center'>
            <Button color='default'
                variant='light'
                className='self-center'
                isIconOnly
                isLoading={loadingMore}
                isDisabled
                onClick={handleEndReached} ></Button>
        </div>)
    }


    function loadMoreRows(mainData: Feed[], rowsData: Feed[]) {
        let newStart = mainData?.slice(rowsData?.length ?? 0);
        const newRow = newStart?.slice(1, 7);
        return newRow ?? []
    };


    async function handleEndReached() {
        if (data) {
            setLoadingMore(true);
            await awaitTimeout(2.5);
            const newRows = loadMoreRows(data, rows);
            setRows([...rows, ...newRows!]);
            setLoadingMore(false);
        }
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }


    useMemo(() => { 
        handleSearch();
    }, [searchType]);

    return (
        <Modal isOpen={props.isOpen}
            onOpenChange={props.onOpenChange}
            className=' mt-4'
            scrollBehavior='inside'
            backdrop='blur'
            placement='top'>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Search</ModalHeader>
                        <ModalBody id='scrollDiv' className=' pb-4'>
                            <div className=' flex flex-col gap-4'>

                                <div className=' flex items-center gap-2'>

                                    <Button isIconOnly radius='md'
                                        onClick={handleSearch}
                                        size='sm' color='primary' variant='flat'>
                                        <FaSearch />
                                    </Button>
                                    <Input size="sm"
                                        isClearable
                                        className="flex-[7]"
                                        placeholder="Search..."
                                        onKeyUp={handleKeyPress}
                                        value={searchText}
                                        onClear={() => setSearchText('')}
                                        onValueChange={(value) => setSearchText(value?.replaceAll('@', '')?.replaceAll('#', ''))}
                                    />

                                    {(searchType !== 'people' && searchType !== 'tags') && <Input
                                        size='sm'
                                        value={searchAuthor}
                                        onValueChange={(value) => setSearchAuthor(value?.replaceAll('@', '')?.replaceAll('#', ''))}
                                        onKeyUp={handleKeyPress}
                                        className=' flex-[3]' placeholder='Author' />
                                    }

                                    {searchType === 'tags' && <Input
                                        size='sm'
                                        value={searchTags}
                                        onValueChange={(value) => setSearchTags(value?.replaceAll('@', '')?.replaceAll('#', ''))}
                                        onKeyUp={handleKeyPress}
                                        className=' flex-[3]' placeholder='Tags' />
                                    }
                                </div>

                                <Tabs variant={'light'} radius='full'
                                    size='sm'
                                    onSelectionChange={(key) => {
                                        setSearchType(key?.toString() as SearchTypes);
                                    }}
                                    aria-label="Search filters">
                                    <Tab key="posts" title="Posts" />
                                    <Tab key="comments" title="Comments" />
                                    <Tab key="tags" title="Tags" />
                                    <Tab key="people" title="People" />
                                </Tabs>

                                {isLoading && <LoadingCard />}


                                <InfiniteScroll
                                    className='gap-2'
                                    dataLength={rows?.length}
                                    next={handleEndReached}
                                    hasMore={(rows?.length < (data?.length ?? 0))}
                                    loader={<ListLoader />}
                                    scrollableTarget='scrollDiv'
                                    endMessage={!isLoading && <EmptyList text={data ? undefined : 'Search anything'} />}>
                                    <div className=' flex flex-col gap-2 px-1'>

                                        {rows?.map((item) => {
                                            const posting_json_metadata = JSON.parse(item?.posting_json_metadata || '{}')
                                            return item?.['permlink'] ? <div className=''>
                                                <CompactPost comment={item} />
                                            </div>
                                                : <div className={`flex items-start h-full dark:bg-foreground/10
                                                bg-white  overflow-hidden rounded-lg shadow-lg p-2 gap-4`}>
                                                    <SAvatar
                                                        className='cursor-pointer' size='sm'

                                                        username={item?.name || ''} />
                                                    <div className="flex flex-col items-start justify-center">
                                                        <div className='flex items-start  gap-3'>
                                                            <div className=' flex-col items-start'>
                                                                <h4 className="text-sm font-semibold leading-none text-default-600">{posting_json_metadata?.profile?.name}</h4>
                                                                <h5 className={clsx("text-sm tracking-tight text-default-500")}>@{item?.name}</h5>
                                                            </div>
                                                            <Reputation reputation={item?.reputation} />
                                                        </div>
                                                        <div className='flex text-sm gap-1 text-default-600 items-center'>
                                                            <p className='text-default-500 text-tiny'>Joined</p>
                                                            <TimeAgoWrapper className='text-tiny' created={(item?.created || 0) * 1000} />
                                                        </div>

                                                    </div>
                                                </div>
                                        })}
                                    </div>
                                </InfiniteScroll >


                            </div>


                        </ModalBody>
                        {/* <ModalFooter>
                            <Button color="danger" variant="light" onClick={onClose}>
                                Close
                            </Button>
                        </ModalFooter> */}
                    </>
                )}
            </ModalContent>
        </Modal >
    )
}
