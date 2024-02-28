import moment from 'moment';
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
                    <p className={className} title={moment(created).locale(lang || 'en').format('lll') ?? getTimeFromNow(created, withoutUtc ?? false)}>
                        {getTimeFromNow(created, withoutUtc ?? false)?.toLowerCase()}
                    </p>

                    {lastUpdate && (created !== lastUpdate) ?
                        <p title={moment(lastUpdate).locale(lang || 'en').format('lll') ?? getTimeFromNow(lastUpdate, withoutUtc ?? false)}
                            className={className}>(edited)</p>
                        : null}


                </div>

            </span>
        </div >

    )
}
