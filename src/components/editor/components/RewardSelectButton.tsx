import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Button } from "@heroui/button";
import { RadioGroup, Radio } from "@heroui/radio";

import React, { memo, useState } from "react";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { SiSteem } from "react-icons/si";
import { useTranslation } from "@/utils/i18n";

export const rewardTypes = (t: (key: string) => string): Payout[] => [
  { title: t("submit.decline_payout"), shortTitle: t("submit.declined"), payout: 0 },
  { title: t("submit.reward_50_50"), shortTitle: "50/50", payout: 50 },
  { title: t("submit.power_up_100"), shortTitle: "100%", payout: 100 },
];

interface Props {
  onSelectReward?: (reward: Payout) => void;
  selectedValue: Payout;
  isDisabled?: boolean;
}

export default memo(function RewardSelectButton(props: Props) {
  const { t } = useTranslation();
  const { onSelectReward, selectedValue: propsSelectedValue, isDisabled } = props;

  const [rewardPopup, setRewardPopup] = useState(false);
  const { isMobile } = useDeviceInfo();
  
  const localRewardTypes = rewardTypes(t);
  
  // Find matching reward type or use default
  const matchingRewardType = propsSelectedValue ? 
    localRewardTypes.find(rt => rt.payout === propsSelectedValue.payout) : null;
  
  // Ensure selectedValue is properly initialized with translated values
  const selectedValue = matchingRewardType || localRewardTypes[1];

  return (
    <div title={t("submit.payout_reward_type")}>
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
              <p className="flex text-medium font-semibold">{t("submit.reward_type")}</p>
              <p className="text-sm text-default-500">
                {t("submit.reward_type_description")}
              </p>
            </div>
            <RadioGroup
              color="danger"
              className="mt-2"
              size="sm"
              defaultValue={JSON.stringify(selectedValue ?? localRewardTypes[1])}
              onValueChange={(key) => {
                setRewardPopup(false);
                onSelectReward && onSelectReward(JSON.parse(key));
              }}
            >
              {localRewardTypes?.map((reward) => {
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
