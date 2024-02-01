import moment from 'moment';
import STooltip from './STooltip';
import { getTimeFromNow } from '@/libs/utils/time';

interface Props {
    created: number;
    lastUpdate?: number;
    withoutUtc?: boolean;
    lang: LanguagesCode
}


export default function TimeAgoWrapper(props: Props) {
    const { lang, created, lastUpdate, withoutUtc } = props;

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
                <div className='flex space-x-1'>
                    <STooltip content={moment(created).locale(lang).format('lll') ?? getTimeFromNow(created, withoutUtc ?? false)} >
                        <p>{getTimeFromNow(created, withoutUtc ?? false)?.toLowerCase()}</p>
                    </STooltip>

                    {lastUpdate && (created !== lastUpdate) ?
                        <STooltip content={moment(lastUpdate).locale(lang).format('lll') ?? getTimeFromNow(lastUpdate, withoutUtc ?? false)} >
                            <p>(edited)</p>
                        </STooltip>
                        : null}


                </div>

            </span>
        </div >

    )
}
