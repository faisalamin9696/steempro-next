import SLink from "@/components/ui/SLink";
import { Button, ButtonGroup } from "@heroui/button";
import React from "react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center m-6 rounded-lg ">
      <div className="no-file-found flex flex-col items-center justify-center py-8 px-10 text-center bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
        <svg
          className="w-12 h-12 dark:text-gray-400 text-gray-700"
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 24 24"
          height="200px"
          width="200px"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="File_Off">
            <g>
              <path d="M4,3.308a.5.5,0,0,0-.7.71l.76.76v14.67a2.5,2.5,0,0,0,2.5,2.5H17.44a2.476,2.476,0,0,0,2.28-1.51l.28.28c.45.45,1.16-.26.7-.71Zm14.92,16.33a1.492,1.492,0,0,1-1.48,1.31H6.56a1.5,1.5,0,0,1-1.5-1.5V5.778Z"></path>
              <path d="M13.38,3.088v2.92a2.5,2.5,0,0,0,2.5,2.5h3.07l-.01,6.7a.5.5,0,0,0,1,0V8.538a2.057,2.057,0,0,0-.75-1.47c-1.3-1.26-2.59-2.53-3.89-3.8a3.924,3.924,0,0,0-1.41-1.13,6.523,6.523,0,0,0-1.71-.06H6.81a.5.5,0,0,0,0,1Zm4.83,4.42H15.88a1.5,1.5,0,0,1-1.5-1.5V3.768Z"></path>
            </g>
          </g>
        </svg>
        <h3 className="text-xl font-medium mt-4 text-gray-700 dark:text-gray-200">
          Page not found
        </h3>
        <span className=" inline-block text-gray-500 dark:text-gray-400 mt-2 gap-1">
          <p>No worries! Return to </p>
          <SLink className="text-blue-500" href={"/"}>
            Home Page
          </SLink>
          <p> or explore some awesome posts. </p>
        </span>

        <ButtonGroup
          className="mt-4"
          radius="full"
          variant="flat"
          color="primary"
          size="sm"
        >
          <Button as={SLink} href="/trending">
            Trending
          </Button>
          <Button as={SLink} href="/created">
            New
          </Button>
          <Button as={SLink} href="/hot">
            Hot
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
