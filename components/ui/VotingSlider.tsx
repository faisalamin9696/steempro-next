import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { useCommentFooterData } from "@/hooks/useCommentFooterData";
import { Slider, SliderProps } from "@heroui/slider";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useState, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { calculateVoteValue } from "@/utils/helper";
import { Constants } from "@/constants";
import { updateSettingsHandler } from "@/hooks/redux/reducers/SettingsReducer";
import { useSteemUtils } from "@/hooks/useSteemUtils";

interface Props extends SliderProps {
  isDownvote?: boolean;
  onPress: (weight: number) => void;
  comment: Feed | Post;
}

const ICON_SIZE = 20;

function VotingSlider(props: Props) {
  const { isDownvote, onPress, comment } = props;
  const { globalProps } = useSteemUtils();
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ??
    Constants.activeSettings;
  const { isVotingPending } = useCommentFooterData(comment);
  const lastWeight = settings?.vote?.remember ? settings.vote.value : 100;
  const [weight, setWeight] = useState<number>(lastWeight);
  const loginData = useAppSelector((state) => state.loginReducer.value);
  const dispatch = useAppDispatch();

  const estimatedValue = useMemo(() => {
    if (!loginData || !Constants.globalProps) return 0;

    return calculateVoteValue(
      loginData,
      weight,
      globalProps.fund_per_rshare,
      globalProps.median_price,
      isDownvote
    );
  }, [loginData, globalProps, weight]);

  return (
    <Card
      className={twMerge(
        "flex flex-row items-center border-2 min-w-xs",
        isDownvote ? "border-danger-200" : "border-success-200"
      )}
    >
      <div
        className={
          "flex flex-row gap-3 items-center w-full p-3 rounded-xl pe-4"
        }
      >
        <Button
          size="sm"
          isIconOnly
          variant="flat"
          radius="md"
          className="rounded-xl!"
          color={isDownvote ? "danger" : "success"}
          onPress={() => {
            if (settings.vote.remember)
              dispatch(
                updateSettingsHandler({
                  vote: {
                    remember: settings.vote.remember,
                    value: weight,
                  },
                })
              );

            onPress(weight);
          }}
          startContent={
            !isVotingPending &&
            (isDownvote ? (
              <ArrowBigDown size={ICON_SIZE} />
            ) : (
              <ArrowBigUp size={ICON_SIZE} />
            ))
          }
        />

        <Slider
          classNames={{
            label: "text-xs text-muted",
            value: "text-muted",
          }}
          size="sm"
          onChange={(value) => setWeight(Number(value))}
          color={isDownvote ? "danger" : "success"}
          step={1}
          defaultValue={100}
          maxValue={100}
          minValue={0}
          value={weight}
          getValue={(weight) =>
            `${weight}%${
              estimatedValue > 0 ? ` (~$${estimatedValue.toFixed(3)})` : ""
            }`
          }
          label={`~${loginData.upvote_mana_percent}% VP`}
          marks={[
            { value: 0, label: "0" },
            { value: 25, label: "25%" },
            { value: 50, label: "50%" },
            { value: 75, label: "75%" },
            { value: 100, label: "100%" },
          ]}
        />
      </div>
    </Card>
  );
}

export default VotingSlider;
