import STooltip from '@/components/STooltip';
import { Button } from '@nextui-org/react'
import { LuCalendarRange } from 'react-icons/lu';
import { MdSchedule } from "react-icons/md";


interface Props {
    buttonText?: string;
    isLoading?: boolean;
    onPress?: () => void;
    disabled?: boolean;
}

export default function ScheduleButton(props: Props) {
    const { buttonText, isLoading, onPress, disabled } = props;

    if (disabled) return null


    return (<STooltip content={'Schedule post'} >
        <Button size='sm'
            onPress={onPress}
            color='secondary'
            isDisabled={disabled}
            isLoading={isLoading}
            className='!text-white '
            isIconOnly
            radius='md'
            variant='shadow'>
            <LuCalendarRange className='text-2xl' />
            {/* {buttonText ?? 'Schedule'} */}
        </Button>
    </STooltip>

    )
}
