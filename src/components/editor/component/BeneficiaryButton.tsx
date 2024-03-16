
import { Avatar, Button, Card, Input, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react'
import { memo, useState } from 'react'
import { FaUsersCog } from 'react-icons/fa'
import { MdAdd, MdClose } from 'react-icons/md';
import IconButton from '../../IconButton';
import { toast } from 'sonner';
import { validate_account_name } from '@/libs/utils/ChainValidation';
import { getResizedAvatar } from '@/libs/utils/image';
import { useAppSelector } from '@/libs/constants/AppFunctions';

interface Props {
    onSelectBeneficiary?: (bene: Beneficiary) => void;
    beneficiaries: Beneficiary[];
    onRemove?: (bene: Beneficiary) => void,
    disabled?: boolean;

}


export default memo(function BeneficiaryButton(props: Props) {
    const { onSelectBeneficiary, beneficiaries, onRemove, disabled } = props;
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    let [username, setUsername] = useState('');
    const [weight, setWeight] = useState('');
    const [benePopup, setBenePopup] = useState(false);

    const availableBene = beneficiaries.reduce((sum, cur) => {
        return sum -= (cur.weight / 100);
    }, 100);


    function handleAddBeneficiary() {
        username = username.trim().toLowerCase();

        if (beneficiaries?.length >= 8) {
            toast.info('Can have at most 8 beneficiaries');
            return
        }

        if (beneficiaries.some(bene => bene.account === username)) {
            toast.info('Beneficiary cannot be duplicate');
            return
        }
        if (!weight || !/^[1-9]\d{0,2}$/.test(weight)) {
            toast.info('Beneficiary percentage must be from 1-100');
            return
        }

        if (parseFloat(weight) > 100 || parseFloat(weight) < 1) {
            toast.info('Beneficiary percentage must be from 1-100');
            return
        }

        if (validate_account_name(username)) {
            toast.info('Invalid username');
            // Cannot specify self as beneficiary
            return
        }

        if (availableBene <= 0 || parseFloat(weight) > availableBene) {
            toast.info('Beneficiary total percentage must be less than 100');
            return
        }

        onSelectBeneficiary && onSelectBeneficiary({ account: username, weight: parseFloat(weight) * 100 })

        setUsername('');
    }

    function handleRemveBeneficiary(bene: Beneficiary) {
        onRemove && onRemove(bene);
    }

    if (disabled) return null

    return (<div>
        <Popover isOpen={benePopup}
            onOpenChange={(open) => setBenePopup(open)}
            placement={'top-start'} className=' ' classNames={{
                content: ''
            }}>
            <PopoverTrigger  >

                <Button size='sm'
                    color='default'
                    startContent={<FaUsersCog className='text-lg' />}
                    className=''
                    radius='lg' variant='shadow'>
                    {'Bene'}: {beneficiaries?.length ?? 0}
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <div className="px-1 py-2">
                    <div className='flex justify-between gap-2 max-sm:flex-col'>
                        <div className='space-y-1'>
                            <p className="flex text-small font-bold">{'Beneficiaries'}</p>
                            <p className='text-default-900/60 text-tiny'>{'Who should receive any rewards?'}</p>
                        </div>
                        <Card className='pe-2 gap-4 flex-row bg-secondary-800/10 max-sm:self-start
                        items-center rounded-full justify-start' >
                            <Avatar size='sm' src={getResizedAvatar(loginInfo.name)} />
                            <div className='flex space-x-2 flex-1'>
                                <p>{loginInfo.name}</p>
                                <p className=' font-bold'>{availableBene}%</p>
                            </div>

                        </Card>
                    </div>


                    <div className='my-4 flex gap-2 md:items-center max-sm:items-end'>
                        <div className=" flex gap-2 md:items-center w-full">

                            <Input className='w-[30%]'
                                classNames={{ label: 'text-default-900/80' }} labelPlacement='outside'
                                label={'Weight'} size="sm" onValueChange={setWeight}
                                value={weight}
                                variant="flat"
                                max={100}
                                min={1}

                                type="number"
                                startContent={
                                    <div className="pointer-events-none flex items-center">
                                        <span className="text-default-900/80 text-small">%</span>
                                    </div>
                                } />


                            <Input classNames={{ label: 'text-default-900/80' }}
                                className='w-[70%]'
                                labelPlacement='outside' label={'Username'} size="sm"
                                onValueChange={setUsername}
                                variant="flat" value={username} />

                        </div>
                        <IconButton className='mt-6 rounded-md' color='success' variant='flat' size='sm'
                            IconType={MdAdd} onClick={handleAddBeneficiary}
                            iconClassName='text-xl'

                        />

                    </div>
                    <div className='flex-col space-y-2 md:space-y-0 md:grid md:grid-flow-row md:grid-cols-2 
                            gap-2 md:gap-4 '>
                        {beneficiaries?.map(bene => {
                            return <div className="flex  w-full">
                                <Card className='gap-4 pe-2 w-full
                                         flex-row items-center rounded-full' >
                                    <Avatar size='sm' src={getResizedAvatar(bene.account)} />
                                    <div className='flex space-x-2 flex-1'>
                                        <p>{bene.account}</p>
                                        <p>{bene.weight / 100}%</p>
                                    </div>
                                    <div>

                                        <IconButton className='bg-red-400  
                                            min-w-0 !w-5 !h-5' IconType={MdClose}
                                            size='sm'
                                            onClick={() => {
                                                handleRemveBeneficiary(bene);
                                            }}
                                            iconClassName='text-white'

                                        />
                                    </div>
                                </Card>

                            </div>

                        })}
                    </div>
                </div>
            </PopoverContent>

        </Popover>
    </div>

    )
})
