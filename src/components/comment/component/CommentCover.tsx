import { Card } from "@nextui-org/react";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";

interface Props {
    sm?: boolean;
    src?: string | null;
    transparent?: boolean;
    thumbnail?: boolean;
}
export default function CommentCover(props: Props) {
    let { sm, src, thumbnail } = props;
    const [isFetching, setIsFetching] = useState(true);

    function onLoadCompleted() {
        if (isFetching)
            setIsFetching(false);
    }

    return (
        (src) ?
            <Card className={clsx(isFetching && 'animate-pulse',
                "bg-white/20")}>

                {thumbnail ?
                    <Image
                        alt="Post cover"
                        src={src}
                        height={640}
                        width={640}
                        quality={60}
                        sizes={`(max-width: 768px) 100vw,
                        (max-width: 1200px) 50vw,
                        33vw`}
                        onLoad={onLoadCompleted}
                        onError={onLoadCompleted}
                        style={{
                            width: 'auto',
                            objectFit: 'contain',
                        }}
                    />
                    :
                    <Image
                        src={src}
                        width={sm ? 130 : 200}
                        height={sm ? 70 : 160}
                        alt={''}
                        onLoad={onLoadCompleted}
                        onError={onLoadCompleted}
                        sizes={`(max-width: 768px) 100vw,
                       (max-width: 1200px) 50vw,
                       33vw`}
                        style={{
                            width: sm ? '130px' : undefined,
                            height: sm ? '70px' : undefined,
                            objectFit: sm ? 'cover' : undefined,
                        }}
                    />

                }



            </Card>
            : null
    )
}
