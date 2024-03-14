import STooltip from "./STooltip";

export default function Reputation({ reputation, decimal, sm }: {
    reputation: string | number,
    decimal?: number;
    sm?: boolean;
}) {
    return (<div title={`${'Reputation score'}: ` + reputation}
        className='!normal-case rounded-md
   py-[1px] px-[3px] text-sm bg-background  dark:bg-foreground/20  max-sm:text-xs text-default-900'>
        <p className={sm ? ' text-xs' : ''}>{Number(reputation)?.toFixed(decimal ?? 0)} </p>
    </div>
    )
}
