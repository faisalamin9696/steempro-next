import STooltip from '@/components/STooltip';
import { Button } from '@nextui-org/react'

interface Props {
    buttonText?: string;
    isLoading?: boolean;
    tooltip?: string;
    onPress?: () => void;
    disabled?: boolean;



}
export default function PublishButton(props: Props) {
    const { buttonText, isLoading, tooltip, onPress, disabled } = props;

    return (< STooltip content={tooltip ?? 'Publish post'
    } >
        <Button size='sm'
            disabled={disabled}
            color='success'
            onPress={onPress}
            isLoading={isLoading}
            className='!text-white'
            radius='lg' variant='shadow'>
            {buttonText ?? 'Publish'}
        </Button>
    </STooltip >
    )
}
