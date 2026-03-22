import { RadioGroup, Radio } from "@heroui/radio";
import { memo, useState } from "react";
import { Button, ButtonProps } from "@heroui/button";
import { Constants } from "@/constants";
import { SteemIcon } from "../icons/SteemIcon";
import SPopover from "../ui/SPopover";
import { useTranslations } from "next-intl";

interface Props extends ButtonProps {
  setPayoutType: (reward: Payout) => void;
  payoutType: Payout;
  iconSize?: number;
}

export default memo(function PayoutTypeButton(props: Props) {
  const t = useTranslations("Submit");
  const { setPayoutType, payoutType, iconSize = 20 } = props;
  const [isOpen, onOpenChange] = useState(false);
  const rewardTypes = Constants.reward_types;

  const getRewardTitle = (reward: Payout) => {
    switch (reward.payout) {
      case 0:
        return t("payout.decline");
      case 50:
        return t("payout.half");
      case 100:
        return t("payout.full");
      default:
        return reward.title;
    }
  };

  const getRewardShortTitle = (reward: Payout) => {
    switch (reward.payout) {
      case 0:
        return t("payout.declinedShort");
      case 50:
        return t("payout.fiftyFiftyShort");
      case 100:
        return t("payout.oneHundredShort");
      default:
        return reward.shortTitle;
    }
  };

  return (
    <div title={t("payout.title")}>
      <SPopover
        isOpen={isOpen}
        placement="top-start"
        onOpenChange={onOpenChange}
        title={t("payout.title")}
        description={t("payout.description")}
        trigger={
          <Button
            startContent={<SteemIcon size={iconSize} />}
            onPress={() => onOpenChange(!isOpen)}
            {...props}
          >
            {getRewardShortTitle(payoutType)}
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
                {getRewardTitle(reward)}
              </Radio>
            );
          })}
        </RadioGroup>
      </SPopover>
    </div>
  );
});
