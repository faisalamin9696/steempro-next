import { Card } from "@nextui-org/react";
import clsx from "clsx";
import Image from "next/image";
import { memo, useState } from "react";

interface Props {
    sm?: boolean;
    src?: string | null;
    transparent?: boolean;
    thumbnail?: boolean;
    className?: string;
    noCard?: boolean;
    alt?: string;
}
export default memo(function CommentCover(props: Props) {
    let { sm, src, thumbnail, className, noCard, alt } = props;
    const [isFetching, setIsFetching] = useState(true);

    function onLoadCompleted() {
        if (isFetching)
            setIsFetching(false);
    }

    return (
        (src) ?

            noCard ? <Image
                priority
                className={clsx(isFetching && 'bg-background/50',
                    className)}
                alt={alt || "image"}
                src={src}
                loading='eager'
                height={640}
                width={640}
                // sizes={`(max-width: 768px) 100vw,
                // (max-width: 1200px) 50vw,
                // 33vw`}
                onLoad={onLoadCompleted}
                onError={onLoadCompleted}
                style={{
                    height: 'auto',
                    objectFit: 'contain'
                }}
            /> :

                <Card
                    className={clsx(isFetching ? 'bg-background/50' : 'bg-transparent',
                        className)}>
                    {thumbnail ?
                        <Image
                            priority
                            alt={alt || "image"}
                            src={src}
                            height={640}
                            width={640}
                            quality={60}
                            //     sizes={`(max-width: 768px) 100vw,
                            // (max-width: 1200px) 50vw,
                            // 33vw`}
                            onLoad={onLoadCompleted}
                            onError={onLoadCompleted}
                            style={{
                                width: '100%',
                                objectFit: 'contain',
                                height: 'auto',

                            }}
                        />
                        :
                        <Image
                            priority
                            src={src}
                            width={sm ? 130 : 200}
                            height={sm ? 70 : 160}
                            alt={alt || "image"}
                            onLoad={onLoadCompleted}
                            onError={onLoadCompleted}
                            //         sizes={`(max-width: 768px) 100vw,
                            //    (max-width: 1200px) 50vw,
                            //    33vw`}
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
})
