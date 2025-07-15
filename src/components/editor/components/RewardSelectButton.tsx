import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Button } from "@heroui/button";
import { RadioGroup, Radio } from "@heroui/radio";

import React, { memo, useState } from "react";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { SiSteem } from "react-icons/si";

export const rewardTypes: Payout[] = [
  { title: "Decline Payout", shortTitle: "Declined", payout: 0 },
  { title: "50% SBD / 50% SP", shortTitle: "50/50", payout: 50 },
  { title: "Power Up 100%", shortTitle: "100%", payout: 100 },
];

interface Props {
  onSelectReward?: (reward: Payout) => void;
  selectedValue: Payout;
  isDisabled?: boolean;
}

export default memo(function RewardSelectButton(props: Props) {
  const { onSelectReward, selectedValue, isDisabled } = props;

  const [rewardPopup, setRewardPopup] = useState(false);
  const { isMobile } = useDeviceInfo();

  return (
    <div title="Payout reward type">
      <Popover
        isOpen={rewardPopup}
        onOpenChange={(open) => setRewardPopup(open)}
        placement={"top-start"}
        className=""
        classNames={
          {
            // content: "bg-teal-600",
          }
        }
      >
        <PopoverTrigger>
          <Button
            size="sm"
            isDisabled={isDisabled}
            color="default"
            startContent={<SiSteem size={22} />}
            radius="lg"
            variant="shadow"
            className="px-2"
          >
            {selectedValue.shortTitle}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col gap-2 px-1 py-2">
            <div className="flex flex-col gap-1">
              <p className="flex text-medium font-semibold">{"Reward type"}</p>
              <p className="text-sm text-default-500">
                {"What type of tokens do you want as rewards?"}
              </p>
            </div>
            <RadioGroup
              color="danger"
              className="mt-2"
              size="sm"
              defaultValue={JSON.stringify(selectedValue ?? rewardTypes[1])}
              onValueChange={(key) => {
                setRewardPopup(false);
                onSelectReward && onSelectReward(JSON.parse(key));
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
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});
