import moment from 'moment';
import STooltip from './STooltip';
import { getTimeFromNow } from '@/libs/utils/time';
import clsx from 'clsx';

interface Props {
    created?: number;
    lastUpdate?: number;
    withoutUtc?: boolean;
    lang?: LanguagesCode,
    className?: string;
}


export default function TimeAgoWrapper(props: Props) {
    const { lang, created, lastUpdate, withoutUtc, className } = props;

    if (!created)
        return null

    // const intervalIdRef = useRef<NodeJS.Timer | undefined>();

    // useEffect(() => {
    //     setTimeAgo(getTimeFromNow(date, withoutUtc ?? false));

    //     // return () => clearInterval(intervalIdRef.current);
    // }, [date])
    // Function to update the value in the Redux store
    // const updateReduxValue = () => {
    //     setTimeAgo(getTimeFromNow(date, withoutUtc ?? false));
    // };

    // Set up the interval to run the updateReduxValue function every 60 seconds
    // useEffect(() => {
    //     intervalIdRef.current = setInterval(updateReduxValue, 60000);
    //     return () => clearInterval(intervalIdRef.current);
    // }, []);

    return (
        <div>
            <span>
                <div className={clsx('flex space-x-1')}>
                    <STooltip content={moment(created).locale(lang || 'en').format('lll') ?? getTimeFromNow(created, withoutUtc ?? false)} >
                        <p className={className}>{getTimeFromNow(created, withoutUtc ?? false)?.toLowerCase()}</p>
                    </STooltip>

                    {lastUpdate && (created !== lastUpdate) ?
                        <STooltip content={moment(lastUpdate).locale(lang || 'en').format('lll') ?? getTimeFromNow(lastUpdate, withoutUtc ?? false)} >
                            <p className={className}>(edited)</p>
                        </STooltip>
                        : null}


                </div>

            </span>
        </div >

    )
}
