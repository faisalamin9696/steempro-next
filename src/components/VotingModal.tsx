import { Button } from "@heroui/button";
import { Card, CardHeader } from "@heroui/card";
import React, { useEffect, useState } from "react";
import {
  IoChevronDownCircleSharp,
  IoChevronUpCircleSharp,
  IoCloseCircleSharp,
} from "react-icons/io5";
import { useAppSelector } from "@/libs/constants/AppFunctions";
import { getVoteData } from "@/libs/steem/sds";
import { twMerge } from "tailwind-merge";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "./style.scss";
import { getSettings } from "@/libs/utils/user";

interface Props {
  comment: Feed | Post;
  downvote?: boolean;
  onConfirm: (weight: number, downvote?: boolean) => void;
  onClose: () => void;
}

const ItemCard = ({
  tooltip,
  title,
  value,
}: {
  tooltip: string;
  title: string;
  value: string;
}) => {
  return (
    <div className="flex gap-1">
      <p className="font-semibold text-default-500 text-sm">{value ?? "-"}</p>
      <p title={tooltip} className="text-default-400 text-tiny">
        {title}
      </p>
    </div>
  );
};

export default function VotingModal(props: Props) {
  const { downvote, onConfirm, onClose } = props;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const [voteData, setVoteData] = useState<VoteData>();
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();

  let [value, setValue] = React.useState(settings.voteOptions.value ?? 100);

  useEffect(() => {
    setVoteData(getVoteData(loginInfo, globalData, downvote));
  }, []);

  const handleValueChange = (value: any) => {
    if (isNaN(Number(value))) return;
    setValue(Number(value));
  };

  async function castVote() {
    onConfirm && onConfirm(value, downvote);
  }

  const marks = {
    0: 0,
    25: "25%",
    50: "50%",
    75: "75%",
    100: "100%",
  };

  return (
    <Card
      classNames={{ header: "px-1 py-1" }}
      className={twMerge(
        "min-w-[300px] w-full border-2 p-0 overflow-hidden pb-2",
        downvote ? "border-red-600" : " border-success-400"
      )}
    >
      <CardHeader className="flex flex-col w-full gap-2">
        {/* Close Button */}
        <div className="flex flex-row w-full justify-between items-center pl-[6px]">
          <div className="flex flex-row items-center gap-[2px]">
            <p className="font-semibold text-default-500 text-sm">
              {value}
            </p>
            <p className="text-default-400 text-tiny">{"%"}</p>
          </div>
          <Button
            isIconOnly
            radius="full"
            size="sm"
            variant="light"
            onPress={onClose} // Replace with your close handler
          >
            <IoCloseCircleSharp
              size={24}
              className="text-gray-500 hover:text-gray-700"
            />
          </Button>
        </div>

        <div className="flex flex-col w-full gap-6 pb-1">
          <div className=" flex flex-row items-start w-full gap-2 pr-4">
            <div className="button-div flex flex-col gap-1 items-center">
              {downvote ? (
                <Button
                  onPress={castVote}
                  color="danger"
                  isIconOnly
                  size="sm"
                  className="min-w-0"
                  radius="full"
                  variant="flat"
                >
                  <IoChevronDownCircleSharp size={28} />
                </Button>
              ) : (
                <Button
                  onPress={castVote}
                  color="success"
                  isIconOnly
                  className="min-w-0"
                  variant="flat"
                  radius="full"
                  size="sm"
                >
                  <IoChevronUpCircleSharp size={28} />
                </Button>
              )}

              {/* <p className="text-sm text-default-900/80">{value}%</p> */}
            </div>

            <Slider
              className="ms-3 top-2 "
              onChange={handleValueChange}
              // color={downvote ? 'danger' : "success"}
              step={1}
              defaultValue={100}
              max={100}
              min={1}
              value={value}
              classNames={{
                rail: twMerge(downvote ? "!bg-danger" : "!bg-success"),
                handle: twMerge(
                  " !rounded-lg h-6 w-6",
                  downvote ? "!border-danger" : "!border-success"
                ),
                track: "bg-red-100",
              }}
              track={false}
              dotStyle={{ borderWidth: "2px" }}
              activeDotStyle={{
                borderColor: downvote ? "red" : "green",
              }}
              styles={{
                handle: {
                  height: 20,
                  width: 20,
                  backgroundColor: "black",
                  opacity: 1,
                  marginTop: -9,
                },
              }}
              included={true}
              marks={marks}
            />
          </div>

          {/* <div className="gap-2 flex flex-row justify-between w-full">
            <ItemCard
              title={"Value"}
              tooltip={`${"Voting value"}: ${value}%`}
              value={`${value}%`}
            />
            <ItemCard
              title={"VP"}
              tooltip={`${"Voting power"}: ${
                downvote
                  ? loginInfo?.downvote_mana_percent?.toFixed(1)
                  : loginInfo?.upvote_mana_percent?.toFixed(1)
              }%`}
              value={`${
                downvote
                  ? loginInfo?.downvote_mana_percent?.toFixed(1)
                  : loginInfo?.upvote_mana_percent?.toFixed(1)
              }%`}
            />

            <ItemCard
              title={"Current"}
              tooltip={`${"Current vote value"}: ${voteData?.current_vote?.toFixed(
                3
              )}$`}
              value={`${voteData?.current_vote?.toFixed(3)}$`}
            />

            <ItemCard
              title={"Full"}
              tooltip={`${"Full vote value"}: ${voteData?.full_vote?.toFixed(
                3
              )}$`}
              value={`${voteData?.full_vote?.toFixed(3)}$`}
            />
          </div> */}
        </div>
      </CardHeader>
    </Card>
  );
}
