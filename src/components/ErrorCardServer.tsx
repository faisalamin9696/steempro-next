import { Card } from "@heroui/card";
import React from "react";
import MainWrapper from "./wrappers/MainWrapper";

interface Props {
  message: string;
}

export default function ErrorCardServer(props: Props) {
  const { message } = props;
  return (
    <MainWrapper className="items-center">
      <Card className=" bg-gray-50 dark:bg-gray-700 self-center">
        <div className="p-6 flex flex-col gap-6 text-center whitespace-pre-line overflow-hidden">
          <p className="text-xl text-default-900 font-bold">
            Something went wrong!
          </p>
          <p
            className="text-md text-default-700 whitespace-pre-wrap"
            style={{ wordWrap: "break-word", overflowWrap: "break-word" }}
          >
            🚫 {message} Please try again later.
          </p>
        </div>
      </Card>
    </MainWrapper>
  );
}
