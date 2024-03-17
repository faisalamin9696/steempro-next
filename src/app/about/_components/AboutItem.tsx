import { useEffect, useRef } from "react";
import './style.scss'
import VanillaTilt from "vanilla-tilt";
import {  Card, CardBody } from "@nextui-org/card";
import { Button } from "@nextui-org/button";

import SAvatar from "@/components/SAvatar";
import { useDeviceInfo } from "@/libs/utils/useDeviceInfo";

interface Props {
    username: string;
    firstHeading: string;
    secondHeading: string;
    imageSize?: string;
    imageQuality?: 'small' | 'large' | 'medium';


}
const AboutItem = (props: Props): JSX.Element => {
    const { username, firstHeading, secondHeading, imageSize, imageQuality } = props;

    const itemCard = useRef(null);
    const { isMobile } = useDeviceInfo();

    useEffect(() => {
        if (!isMobile && itemCard && itemCard.current)
            VanillaTilt.init(itemCard.current);
    }, []);


    return (<Card ref={itemCard}
        isBlurred
        className="card column bg-transparent  grid row-auto"
        data-tilt-speed="600" data-tilt data-tilt-max="5"
        data-tilt-perspective="600" data-tilt-glare
        data-tilt-max-glare={0.5}>
        <CardBody className="card items-center flex-col">


            <SAvatar size="xl"
                username={username}
                quality='medium' />

            <div className="flex flex-col items-center gap-4">
                <div className="flex flex-col items-center">
                    <h3 className='mt-2 font-bold'>{username}</h3>
                    <p className=" font-light">{firstHeading}</p>
                    <p className=" mt-2 font-extralight text-default-600 "> {secondHeading}</p>
                </div>
                <Button
                    className="contact-button"
                    radius="full" size="sm"
                    href={`/@${username}}`} >
                    Contact</Button>

            </div>
        </CardBody>
    </Card >
    )
}

export { AboutItem }