import { Button } from '@nextui-org/button';


interface Props {
    buttonText?: string;
    isLoading?: boolean;
    tooltip?: string;
    onClick?: () => void;
    isDisabled?: boolean;



}
export default function PublishButton(props: Props) {
    const { buttonText, isLoading, tooltip, onClick, isDisabled } = props;

    return (
        <Button size='sm' title={tooltip ?? 'Publish post'}
            isDisabled={isDisabled}
            color='success'
            onClick={onClick}
            isLoading={isLoading}
            className='!text-white'
            radius='lg' variant='shadow'>
            {buttonText ?? 'Publish'}
        </Button>
    )
}
