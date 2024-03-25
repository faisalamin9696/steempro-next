import { Button } from '@nextui-org/button'
import { LuCalendarRange } from 'react-icons/lu';

interface Props {
    buttonText?: string;
    isLoading?: boolean;
    onClick?: () => void;
    isDisabled?: boolean;
}

export default function ScheduleButton(props: Props) {
    const { buttonText, isLoading, onClick, isDisabled } = props;

    return (
        <Button size='sm' title='Schedule post'
            onClick={onClick}
            color='secondary'
            isDisabled={isDisabled}
            isLoading={isLoading}
            className='!text-white '
            isIconOnly
            radius='md'
            variant='shadow'>
            <LuCalendarRange className='text-2xl' />
            {/* {buttonText ?? 'Schedule'} */}
        </Button>

    )
}
