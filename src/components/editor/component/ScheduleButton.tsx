import STooltip from '@/components/STooltip';
import { Button } from '@nextui-org/button'
import { LuCalendarRange } from 'react-icons/lu';

interface Props {
    buttonText?: string;
    isLoading?: boolean;
    onPress?: () => void;
    isDisabled?: boolean;
}

export default function ScheduleButton(props: Props) {
    const { buttonText, isLoading, onPress, isDisabled } = props;

    return (<STooltip content={'Schedule post'} >
        <Button size='sm'
            onPress={onPress}
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
    </STooltip>

    )
}
