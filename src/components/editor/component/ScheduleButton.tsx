import STooltip from '@/components/STooltip';
import { Button } from '@nextui-org/react'


interface Props {
    buttonText?: string;
    isLoading?: boolean;
    onPress?: () => void;
    disabled?: boolean;
}

export default function ScheduleButton(props: Props) {
    const { buttonText, isLoading, onPress, disabled } = props;

    return (<STooltip content={'Schedule post'} >
        <Button size='sm'
            disabled={disabled}
            onPress={onPress}
            color='primary'
            isLoading={isLoading}
            className='!text-white '
            radius='lg' variant='shadow'>
            {buttonText ?? 'Schedule'}
        </Button>
    </STooltip>

    )
}
