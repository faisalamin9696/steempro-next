import STooltip from "./STooltip";

export default function Reputation({ reputation, decimal }: {
    reputation: string | number,
    decimal?: number;
}) {
    return (<div className='!normal-case  !mt-0 rounded-md
    py-0 px-1 text-sm  bg-background  max-sm:text-xs'>
        <STooltip content={`${'Reputation score'}: ` + reputation} >
            <p>{Number(reputation)?.toFixed(decimal ?? 0)} </p>
        </STooltip>
    </div>
    )
}
