import { Card, CardBody, Dropdown, DropdownTrigger, Button } from "@nextui-org/react";
import { FaSortDown } from "react-icons/fa";
import { BsInfoCircle } from "react-icons/bs";
import { SteemTokens } from "../app/community/(tabs)/wallet/page";

interface TokenCardProps {
    title: string;
    description?: string;
    endContent?: React.ReactNode,
    actionContent?: React.ReactNode,
    symbol?: string;
    tokenKey: SteemTokens,
    handleInfoClick?: (key: SteemTokens) => void;
}


export const TokenCard = (props: TokenCardProps) => {
    const { title, tokenKey, description, endContent, actionContent, symbol, handleInfoClick } = props

    function handleInfo() {
        handleInfoClick && handleInfoClick(tokenKey)

    }

    return <Card  shadow='sm' key={tokenKey}
    className="px-2 py-10 dark:bg-foreground/10">
        <CardBody className=' justify-between flex flex-row max-lg:flex-col  gap-4'>
            <div className='flex flex-col items-start gap-2 max-lg:flex-col w-full'>
                <div className='flex flex-row justify-between items-center  w-full'>
                    <div className="flex flex-row gap-1 items-center" >
                        <p className='text-md font-bold'>{title}</p>

                        <Button radius="full" isIconOnly size="sm" variant="light" onPress={handleInfo}>
                            <BsInfoCircle
                                className="text-sm" />
                        </Button>
                    </div>

                    <div className='flex flex-row gap-2 items-center'>
                        <div>
                            <p className="text-sm">{endContent}</p>
                        </div>

                        {symbol && <p className="text-sm">{symbol}</p>}

                        {actionContent ? <Dropdown
                            size="sm"
                            // showArrow
                            classNames={{
                                // base: "before:bg-default-200", // change arrow background
                                content: "py-1 px-1 border border-default-200 bg-gradient-to-br from-white to-default-200 dark:from-default-50 dark:to-black",
                            }}>
                            <DropdownTrigger>
                                <Button radius='full' size='sm' isIconOnly variant='light'>
                                    <FaSortDown className='text-lg mt-[-4px]' />
                                </Button>
                            </DropdownTrigger>
                            {actionContent}
                        </Dropdown> : null
                        }
                    </div>
                </div>
                {/* <Accordion>
                    <AccordionItem
                        disableIndicatorAnimation
                        classNames={{
                            indicator: 'h-2 w-full items-center flex flex-col'
                        }}
                        key={description} isCompact
                        indicator={({ isOpen }) => <div className='w-full flex flex-col items-center opacity-30 hover:opacity-100'>
                            {isOpen ? <FaSortDown className=' text-lg mt-[-4px]' /> : <FaSortUp className=' text-lg' />}
                        </div>}
                    >
                        <p>{description}</p>
                    </AccordionItem>
                </Accordion> */}


            </div>

        </CardBody>
    </Card >
}