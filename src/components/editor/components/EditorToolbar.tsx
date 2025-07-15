
import {
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuHeading4,
} from "react-icons/lu";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { ToolbarItem } from "./EditorToolbarItem";
import { Tooltip } from "@heroui/tooltip";
import { twMerge } from "tailwind-merge";
import { RiCollapseDiagonalFill } from "react-icons/ri";
import { PiClipboardText, PiFilesFill } from "react-icons/pi";
import {
  TbAlignCenter,
  TbAlignJustified,
  TbBold,
  TbCode,
  TbHeading,
  TbItalic,
  TbLink,
  TbQuote,
  TbTable,
} from "react-icons/tb";
import { BiImageAdd } from "react-icons/bi";
import { Divider } from "@heroui/divider";
import { GrMultiple } from "react-icons/gr";
import { AiOutlineFileSearch } from "react-icons/ai";

interface ToolbarProps {
  onSelect: any;
  style?: any;
  className?: string;
  isDisabled?: boolean;
  isSnipping?: boolean;
}
const EditorToolbar = (props: ToolbarProps) => {
  const { onSelect, className, isDisabled, isSnipping } = props;
  const masterKey = "Alt + ";

  const HeadingItem = (
    <Dropdown
      aria-labelledby="toolbar"
      isDisabled={isDisabled}
      shadow="sm"
      size="sm"
      className="min-w-0 "
      placement="bottom-end"
    >
      <Tooltip
        closeDelay={200}
        delay={1000}
        color="default"
        size="sm"
        content="Headings"
      >
        <div className="flex flex-col">
          <DropdownTrigger>
            <button className="hover:bg-foreground/15 rounded-md p-[2px]">
              <TbHeading size={22} />
            </button>
          </DropdownTrigger>
        </div>
      </Tooltip>

      <DropdownMenu
        variant="faded"
        className="rounded-xl "
        onAction={(key) => {
          onSelect(key);
        }}
      >
        <DropdownItem key="h1" textValue="Heading 1">
          <Tooltip
            content={`${masterKey + "1"}`}
            placement="right"
            size="sm"
            offset={20}
          >
            <div>
              <LuHeading1 className="text-2xl" />
            </div>
          </Tooltip>
        </DropdownItem>
        <DropdownItem key="h2" textValue="Heading 2">
          <Tooltip
            content={`${masterKey + "2"}`}
            placement="right"
            size="sm"
            offset={20}
          >
            <div>
              <LuHeading2 className="text-xl" />
            </div>
          </Tooltip>
        </DropdownItem>
        <DropdownItem key="h3" textValue="Heading 3">
          <Tooltip
            content={`${masterKey + "3"}`}
            placement="right"
            size="sm"
            offset={20}
          >
            <div>
              <LuHeading3 className="text-lg" />
            </div>
          </Tooltip>
        </DropdownItem>
        <DropdownItem key="h4" textValue="Heading 4">
          <Tooltip
            content={`${masterKey + "4"}`}
            placement="right"
            size="sm"
            offset={20}
          >
            <div>
              <LuHeading4 className="text-md" />
            </div>
          </Tooltip>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <div className={twMerge(className)}>
      <div className="flex flex-row items-center max-sm:flex-col max-sm:items-start w-full gap-1 max-sm:gap-2 overflow-auto scrollbar-thin">
        <div className="flex flex-row  w-full py-1 justify-between items-start ">
          <div className=" flex flex-row gap-2 items-center flex-wrap transition-all">
            <div title="Headings" className="flex flex-col items-end">
              {HeadingItem}
            </div>

            <ToolbarItem
              tooltip={{
                description: "Bold",
                shortcut: `${masterKey + "B"}`,
              }}
              isDisabled={isDisabled}
              onSelect={() => {
                onSelect("b");
              }}
              IconType={TbBold}
            />

            <ToolbarItem
              tooltip={{
                description: "Italic",
                shortcut: `${masterKey + "i"}`,
              }}
              isDisabled={isDisabled}
              onSelect={() => {
                onSelect("i");
              }}
              IconType={TbItalic}
            />

            <ToolbarItem
              tooltip={{
                description: "Quote",
                shortcut: `${masterKey + "Q"}`,
              }}
              isDisabled={isDisabled}
              onSelect={() => {
                onSelect("q");
              }}
              IconType={TbQuote}
            />

            <ToolbarItem
              tooltip={{
                description: "Code",
                shortcut: `${masterKey + "C"}`,
              }}
              isDisabled={isDisabled}
              onSelect={() => {
                onSelect("code");
              }}
              IconType={TbCode}
            />

            <Divider orientation="vertical" className="h-4 hidden sm:block" />

            <ToolbarItem
              tooltip={{
                description: "Table",
                shortcut: `${masterKey + "T"}`,
              }}
              isDisabled={isDisabled}
              onSelect={() => {
                onSelect("table");
              }}
              IconType={TbTable}
            />

            <ToolbarItem
              tooltip={{
                description: "Link",
                shortcut: `${masterKey + "Q"}`,
              }}
              isDisabled={isDisabled}
              onSelect={() => {
                onSelect("link");
              }}
              IconType={TbLink}
            />

            <ToolbarItem
              tooltip={{
                description: "Image",
                shortcut: `${masterKey + "D"}`,
              }}
              isDisabled={isDisabled}
              onSelect={() => {
                onSelect("image");
              }}
              IconType={BiImageAdd}
            />

            <Divider orientation="vertical" className="h-4 hidden sm:block" />

            <ToolbarItem
              tooltip={{
                description: "Justify",
                shortcut: `${masterKey + "J"}`,
              }}
              isDisabled={isDisabled}
              onSelect={() => {
                onSelect("justify");
              }}
              IconType={TbAlignJustified}
            />

            <ToolbarItem
              tooltip={{
                description: "Center",
                shortcut: `${masterKey + "E"}`,
              }}
              isDisabled={isDisabled}
              onSelect={() => {
                onSelect("center");
              }}
              IconType={TbAlignCenter}
            />

            <Divider orientation="vertical" className="h-4 hidden sm:block" />

            <ToolbarItem
              tooltip={{
                description: "Add Spoiler",
                shortcut: ``,
              }}
              isDisabled={isDisabled}
              onSelect={() => {
                onSelect("spoiler");
              }}
              IconType={RiCollapseDiagonalFill}
            />
          </div>
          <div>
            {!isSnipping && (
              <ToolbarItem
                tooltip={{
                  description: "Snippet & Template",
                  shortcut: `${masterKey + "X"}`,
                }}
                isDisabled={isDisabled}
                onSelect={() => {
                  onSelect("snippet");
                }}
                IconType={AiOutlineFileSearch  }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;
