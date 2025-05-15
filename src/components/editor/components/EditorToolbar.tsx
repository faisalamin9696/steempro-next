import {
  FaQuoteLeft,
  FaItalic,
  FaBold,
  FaLink,
  FaHeading,
  FaCode,
  FaTable,
  FaStar,
} from "react-icons/fa";
import { Button } from "@heroui/button";

import {
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuHeading4,
  LuLetterText,
} from "react-icons/lu";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { BsImage, BsJustify, BsTextCenter } from "react-icons/bs";
import { ToolbarItem } from "./EditorToolbarItem";
import { Tooltip } from "@heroui/tooltip";
import { twMerge } from "tailwind-merge";

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
      className="min-w-0"
      placement="bottom-end"
    >
      <Tooltip
        closeDelay={200}
        delay={1000}
        color="default"
        size="sm"
        content="Headings"
      >
        <div>
          <DropdownTrigger>
            <Button isIconOnly size="sm">
              <FaHeading className="text-lg rounded-none" />
            </Button>
          </DropdownTrigger>
        </div>
      </Tooltip>

      <DropdownMenu
        variant="faded"
        className="rounded-xl"
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
      <div className="flex flex-row items-center max-sm:flex-col max-sm:items-start w-full gap-1 max-sm:gap-2 overflow-auto">
        <div className=" flex gap-1 items-center">
          <div title="Headings">{HeadingItem}</div>

          <ToolbarItem
            tooltip={{
              description: "Bold",
              shortcut: `${masterKey + "B"}`,
            }}
            isDisabled={isDisabled}
            onSelect={() => {
              onSelect("b");
            }}
            IconType={FaBold}
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
            IconType={FaItalic}
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
            IconType={FaQuoteLeft}
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
            IconType={FaCode}
          />

          <ToolbarItem
            tooltip={{
              description: "Table",
              shortcut: `${masterKey + "T"}`,
            }}
            isDisabled={isDisabled}
            onSelect={() => {
              onSelect("table");
            }}
            IconType={FaTable}
          />

          <div className="opacity-10">|</div>

          {/* <ToolbarItem tooltip={{
                        description: 'Snippet',
                        shortcut: `${masterKey + 'S'}`
                    }} isDisabled={isDisabled}
                    onSelect={() => { onSelect('snip') }}
                        IconType={MdContentPasteGo} /> */}

          <ToolbarItem
            tooltip={{
              description: "Link",
              shortcut: `${masterKey + "Q"}`,
            }}
            isDisabled={isDisabled}
            onSelect={() => {
              onSelect("link");
            }}
            IconType={FaLink}
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
            IconType={BsImage}
          />

          <div className="max-sm:hidden opacity-10">|</div>
        </div>
        <div className="flex gap-1 items-center">
          <ToolbarItem
            tooltip={{
              description: "Justify",
              shortcut: `${masterKey + "J"}`,
            }}
            isDisabled={isDisabled}
            onSelect={() => {
              onSelect("justify");
            }}
            IconType={BsJustify}
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
            IconType={BsTextCenter}
          />

          {!isSnipping && (
            <ToolbarItem
              tooltip={{
                description: "Snippet",
                shortcut: `${masterKey + "X"}`,
              }}
              isDisabled={isDisabled}
              onSelect={() => {
                onSelect("snippet");
              }}
              IconType={LuLetterText}
            />
          )}

          <ToolbarItem
            tooltip={{
              description: "Add Spoiler",
              shortcut: ``,
            }}
            isDisabled={isDisabled}
            onSelect={() => {
              onSelect("spoiler");
            }}
            IconType={FaStar}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;
