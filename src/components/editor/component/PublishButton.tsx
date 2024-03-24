import { Button } from '@nextui-org/button';


interface Props {
    buttonText?: string;
    isLoading?: boolean;
    tooltip?: string;
    onPress?: () => void;
    isDisabled?: boolean;



}
export default function PublishButton(props: Props) {
    const { buttonText, isLoading, tooltip, onPress, isDisabled } = props;

    return (
        <Button size='sm' title={tooltip ?? 'Publish post'}
            isDisabled={isDisabled}
            color='success'
            onPress={onPress}
            isLoading={isLoading}
            className='!text-white'
            radius='lg' variant='shadow'>
            {buttonText ?? 'Publish'}
        </Button>
    )
}
