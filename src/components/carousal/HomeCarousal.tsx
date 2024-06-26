'use client';

import { getPromotions } from "@/libs/firebase/firebaseApp";
import { Button } from '@nextui-org/button';
import clsx from "clsx";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import useSWR from "swr";
import PromotionCard from "../PromotionCard";
import './style.scss';
import Carousel from '@itseasy21/react-elastic-carousel';


const breakPoints = [
    { width: 1, itemsToShow: 1 },
    { width: 550, itemsToShow: 2, itemsToScroll: 2 },
    { width: 850, itemsToShow: 3 },
    { width: 1280, itemsToShow: 4, itemsToScroll: 2 },
];


const HomeCarousel = () => {

    const { data } = useSWR('promotions', getPromotions);

    if (!data || data?.length <= 0) {
        return null
    }


    return <div className="w-full min-h-[210px] home-carousel">
        <Carousel
            isRTL={false}
            breakPoints={breakPoints}
            showArrows
            // enableAutoPlay
            // autoPlaySpeed={5000}
            className="w-full mb-2 relative flex flex-row items-center"
            pagination={false}
            focusOnSelect={true}
            itemPadding={[4]}
            enableMouseSwipe={true}
            renderArrow={({ type, onClick, isEdge }) => {
                return <Button size="sm"
                    isDisabled={isEdge}
                    onClick={onClick}
                    isIconOnly
                    radius="full"
                    variant='shadow'
                    className={clsx("absolute z-10",
                        type === 'PREV' ? 'left-4' : 'right-4')}>
                    {type === 'NEXT' ? <IoIosArrowForward className="text-xl" /> :
                        <IoIosArrowBack className="text-xl" />}
                </Button>
            }}
        >
            {data?.map((authPerm, index) => (
                <div className="w-full" key={`${index}-${authPerm}`}>
                    <PromotionCard authPerm={authPerm} />
                </div>
            ))}
        </Carousel>
    </div>
}
export default HomeCarousel;
