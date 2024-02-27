import STooltip from '@/components/STooltip';
import { Popover, PopoverTrigger, Button, PopoverContent } from '@nextui-org/react'
import { memo, useState } from 'react'
import { MdDelete } from 'react-icons/md'

interface Props {
    onClearPress?: () => void;
}
export default memo(function ClearFormButton(props: Props) {
    const { onClearPress } = props;

    const [clearPopup, setClearPopup] = useState(false);


    return (<STooltip content={'Clear all'}>

        <div>
            <Popover isOpen={clearPopup} onOpenChange={(open) => setClearPopup(open)} placement={'top-start'} color='primary'>
                <PopoverTrigger >
                    <Button size='sm' color='danger'
                        isIconOnly startContent={<MdDelete className='text-lg' />}
                        className='!text-white'
                        variant='shadow' />

                </PopoverTrigger>
                <PopoverContent >
                    <div className="px-1 py-2">
                        <div className="text-small font-bold">{'Confirmation'}</div>
                        <div className="text-tiny flex">
                            {'Do you really want to clear all data?'}
                        </div>

                        <div className="text-tiny flex mt-2 space-x-2">
                            <Button onPress={() => setClearPopup(false)}
                                size='sm' color='default' variant='faded'>No</Button>
                            <Button size='sm' color='danger' variant='solid'
                                onPress={() => {
                                    setClearPopup(false);
                                    onClearPress && onClearPress();
                                }}>YES</Button>

                        </div>
                    </div>
                </PopoverContent>
            </Popover>

        </div>
    </STooltip>
    )
})