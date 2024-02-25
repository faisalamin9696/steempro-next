import STooltip from "./STooltip";

export default function Reputation({ reputation, decimal, sm }: {
    reputation: string | number,
    decimal?: number;
    sm?: boolean;
}) {
    return (<div className='!normal-case rounded-md
   py-[1px] px-[3px] text-sm  bg-background  max-sm:text-xs'>
        <STooltip content={`${'Reputation score'}: ` + reputation} >
            <p className={sm ? ' text-xs' : ''}>{Number(reputation)?.toFixed(decimal ?? 0)} </p>
        </STooltip>
    </div>
    )
}
