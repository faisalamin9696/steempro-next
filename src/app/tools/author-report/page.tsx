"use client";

import MainWrapper from "@/components/wrappers/MainWrapper";
import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import { getResizedAvatar } from "@/libs/utils/image";
import { Button } from "@nextui-org/button";
import { Avatar } from "@nextui-org/avatar";
import { Input } from "@nextui-org/input";
import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { validateCommunity } from "@/libs/utils/helper";
import PieChart from "@/components/charts/PieChart";

export default function AuthorReportPage() {
  let loginInfo = useAppSelector((state) => state.loginReducer.value);
  let [username, setUsername] = useState(loginInfo.name);
  let [avatar, setAvatar] = useState(loginInfo.name);
  let [community, setCommunity] = useState("");
  const [data, setData] = useState<any>();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { community: string; username: string }) =>
      fetchSds(
        `/feeds_api/getActiveCommunityAuthorReport/${data.community}/${data.username}`
      ),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      if (data) setData(data);
    },
  });

  useEffect(() => {
    const timeOut = setTimeout(() => {
      username = username.trim().toLowerCase();
      setAvatar(username);
    }, 1000);
    return () => clearTimeout(timeOut);
  }, [username]);

  async function getAuthorReport() {
    username = username.replace("@", "").toLowerCase();
    community = community.replace("@", "").toLowerCase();

    if (!username) {
      toast.info("Invalid author");
      return;
    }

    if (!community || !validateCommunity(community)) {
      toast.info("Invalid community");
      return;
    }

    mutate({ username, community });
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <p className=" text-xl font-bold">Author Report</p>

      <div className="flex flex-col gap-4 w-full">
        <Input
          size="sm"
          label="Username"
          placeholder="Enter username"
          isRequired
          className="flex-1"
          onValueChange={setUsername}
          value={username}
          endContent={<Avatar src={getResizedAvatar(avatar)} size="sm" />}
        />

        <Input
          isClearable
          size="sm"
          value={community}
          onValueChange={setCommunity}
          isRequired
          label="Community"
          placeholder="Enter community account e.g. hive-144064"
        />

        <Button
          className="self-start"
          onPress={getAuthorReport}
          isLoading={isPending}
        >
          Get Report
        </Button>
      </div>
      {/* <div className="w-full h-[350px] p-4 rounded-md bg-foreground/5">
          <ResponsivePie
            data={[
              { id: "Posts", label: "Posts", value: 7 },
              {
                id: "Comments",
                label: "Comments",
                value: 8,
              },
              {
                id: "Unique Comments",
                label: "Unique Comments",
                value: 9,
              },
            ]}
            margin={{ top: 20, right: 10, bottom: 20, left: 10 }}
            innerRadius={0.4}
            padAngle={2}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{
              from: "color",
              modifiers: [["darker", 0.2]],
            }}
            arcLabel={function (e) {
              return e.value + "";
            }}
            theme={{
              tooltip: {
                container: {
                  color: "#000",
                  fontSize: 12,
                },
              },
            }}
            enableArcLinkLabels={true}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#FFF"
            arcLinkLabelsThickness={2}
            arcLinkLabelsDiagonalLength={8}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLinkLabelsStraightLength={20}
            arcLinkLabelsTextOffset={5}
            legends={[]}
          />
        </div> */}

      {data && (
        <PieChart
          data={[
            { id: "Posts", label: "Posts", value: data.total_post_count },
            {
              id: "Comments",
              label: "Comments",
              value: data.total_comment_count,
            },
            {
              id: "Unique Comments",
              label: "Unique Comments",
              value: data.unique_comment_count,
            },
          ]}
          handleItemClick={() => {}}
        />
      )}
    </div>
  );
}
