import { RadioGroup, Radio } from "@heroui/radio";
import { memo, useState } from "react";
import { Button, ButtonProps } from "@heroui/button";
import { Constants } from "@/constants";
import { SteemIcon } from "../icons/SteemIcon";
import SPopover from "../ui/SPopover";

interface Props extends ButtonProps {
  setPayoutType: (reward: Payout) => void;
  payoutType: Payout;
  iconSize?: number;
}

export default memo(function PayoutTypeButton(props: Props) {
  const { setPayoutType, payoutType, iconSize = 20 } = props;
  const [isOpen, onOpenChange] = useState(false);
  const rewardTypes = Constants.reward_types;

  return (
    <div title="Payout reward type">
      <SPopover
        isOpen={isOpen}
        placement="top-start"
        onOpenChange={onOpenChange}
        title="Payout reward"
        description="What type of token do you want as reward?"
        trigger={
          <Button
            startContent={<SteemIcon size={iconSize} />}
            onPress={() => onOpenChange(!isOpen)}
            {...props}
          >
            {payoutType.shortTitle}
          </Button>
        }
      >
        <RadioGroup
          color="primary"
          className="mt-2"
          defaultValue={JSON.stringify(payoutType ?? rewardTypes[1])}
          onValueChange={(key) => {
            onOpenChange(false);
            setPayoutType && setPayoutType(JSON.parse(key));
          }}
        >
          {rewardTypes?.map((reward) => {
            return (
              <Radio
                classNames={{ label: "" }}
                key={reward.shortTitle}
                className="gap-1"
                value={JSON.stringify(reward)}
              >
                {reward.title}
              </Radio>
            );
          })}
        </RadioGroup>
      </SPopover>
    </div>
  );
});
