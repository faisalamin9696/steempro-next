import React from "react";
import { User } from "@nextui-org/react";
import { getResizedAvatar } from "@/libs/utils/image";
import clsx from "clsx";
import Link from "next/link";


interface Props {
    role: Role;
    compact?: boolean;
}


export const RoleCard = (props: Props) => {
    const { role, compact } = props;
    // // const [isFollowed, setIsFollowed] = React.useState(comment.observer_follows_author === 1);
    // const { data: session } = useSession();
    // const URL = `/accounts_api/getAccountExt/${username}/${session?.user?.name || 'null'}`;
    // const { data, isLoading } = useSWR(URL, fetchSds<AccountExt>);
    // const URL_2 = `/followers_api/getKnownFollowers/${username}/${session?.user?.name || 'null'}`
    // const { data: knownPeople, isLoading: isKnownLoading } = useSWR(compact ? null : URL_2, fetchSds<string[]>)

    // const posting_json_metadata = JSON.parse(String(data?.posting_json_metadata || '{}'));


    return (
        <div
            className="relative flex flex-col card-content border-none 
            bg-transparent items-start gap-4 p-2 w-full">
            <User

                classNames={{
                    description: 'mt-1 text-default-900/60 dark:text-gray-200 text-sm',
                    name: 'text-default-800'
                }}
                name={<div className='flex flex-col items-start gap-2'>
                    <div className="flex gap-2 items-center">
                        {<p>{role.account}</p>}

                        <p className={clsx((role.role === 'owner') ? 'text-green-400' :
                            (role.role === 'admin') ? 'text-blue-400' :
                                (role.role === 'mod') ? 'text-yellow-400' :
                                    (role.role === 'muted') ? 'text-red-400' : '')}>
                            {role.role}
                        </p>
                    </div>

                </div>}
                description={<div className='flex flex-col items-center'>
                    <p className='dark:bg-default-900/30 text-xs px-1 rounded-lg'>{role.title}</p>
                </div>}
                avatarProps={{
                    className: ' cursor-pointer',
                    src: getResizedAvatar(role.account),
                    as: Link,
                    href: `/@${role.account}/posts`
                } as any}
            />

        </div >
    );
};

export default RoleCard