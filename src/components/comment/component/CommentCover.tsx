import { Card } from "@nextui-org/react";
import clsx from "clsx";
import Image from "next/image";

interface Props {
    sm?: boolean;
    src?: string | null;
    lg?: boolean;
    transparent?: boolean;
}
export default function CommentCover(props: Props) {
    let { sm, lg, src, transparent } = props;
    return (
        (src) ?
            <Card>

                <Image
                    src={src}
                    width={sm ? 130 : 200}
                    height={sm ? 100 : 160}
                    alt={''}
                    sizes="(max-width: 768px) 100vw,
                       (max-width: 1200px) 50vw,
                       33vw"
                    style={{
                        height: sm ? '80px' : '100%',
                        width: sm ? '120px' : '100%',
                        objectFit: lg ? 'contain' : 'cover',
                    }} 
                />
                {/* <Image
                    alt="Post cover"
                    src={src}
                    fill={!lg}
                    height={lg ? 640 : undefined}
                    width={lg ? 640 : undefined}
                    quality={60}
                    style={{
                        objectFit: lg ? 'contain' : 'cover',
                    }}
                /> */}
            </Card>
            : null
    )
}
