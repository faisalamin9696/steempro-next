import { Card } from "@nextui-org/react";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";

interface Props {
    sm?: boolean;
    src?: string | null;
    transparent?: boolean;
    thumbnail?: boolean;
    className?: string;
    noCard?: boolean;
    alt?: string;
}
export default function CommentCover(props: Props) {
    let { sm, src, thumbnail, className, noCard, alt } = props;
    const [isFetching, setIsFetching] = useState(true);

    function onLoadCompleted() {
        if (isFetching)
            setIsFetching(false);
    }

    return (
        (src) ?

            noCard ? <Image
                className={clsx(isFetching && 'bg-background/50',
                    className)}
                alt={alt || "image"}
                src={src}
                loading='lazy'
                height={640}
                width={640}
                quality={60}
                sizes={`(max-width: 768px) 100vw,
                (max-width: 1200px) 50vw,
                33vw`}
                onLoad={onLoadCompleted}
                onError={onLoadCompleted}
                style={{
                    width: '100%',
                    objectFit: 'contain',
                }}
            /> :

                <Card
                    className={clsx(isFetching ? 'bg-background/50' : 'bg-transparent',
                        className)}>
                    {thumbnail ?
                        <Image
                            loading='lazy'
                            alt={alt || "image"}
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
                            loading='lazy'
                            width={sm ? 130 : 200}
                            height={sm ? 70 : 160}
                            alt={alt || "image"}
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
