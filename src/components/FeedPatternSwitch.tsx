import React, { memo } from "react";
import { getSettings, updateSettings } from "@/libs/utils/user";
import { updateSettingsHandler } from "@/libs/redux/reducers/SettingsReducer";
import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import { LuLayoutList } from "react-icons/lu";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FiGrid } from "react-icons/fi";

const FEED_STYLES = [
  {
    title: "List",
    icon: (size: number) => <LuLayoutList size={size} />,
    key: "list",
  },
  {
    title: "Grid",
    icon: (size: number) => <FiGrid size={size} />,
    key: "grid",
  },
];
export default memo(function FeedPatternSwitch() {
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  const dispatch = useAppDispatch();

  const updateStyle = (style: FeedStyle) => {
    updateSettings({ ...settings, feedStyle: style });
    dispatch(updateSettingsHandler({ ...settings, feedStyle: style }));
  };

  const findStyleByKey = (key: string) => {
    return FEED_STYLES.find((style) => style.key === key);
  };

  const [selectedKey, setSelectedKey] = React.useState<any>(settings.feedStyle);

  const renderIcon = (
    style: { title: string; icon: (size: number) => React.ReactNode },
    size: number
  ) => {
    return style?.icon(size);
  };

  return (
    <div className="flex space-x-1">
      <Dropdown size="sm" title="View" showArrow>
        <DropdownTrigger>
          <Button radius="sm" size="sm" className="min-w-0 w-[48px] px-1" variant="light">
            <div className=" flex flex-row items-center text-default-500 ">
              {renderIcon(findStyleByKey(selectedKey)!, 24)}
              <RiArrowDropDownLine size={20} />
            </div>
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          disallowEmptySelection
          aria-label="Single selection example"
          selectedKeys={selectedKey}
          selectionMode="single"
          variant="flat"
          onSelectionChange={(key) => {
            setSelectedKey(key.currentKey as string);
            updateStyle(key.currentKey as any);
          }}
        >
          <DropdownSection className=" pointer-events-none">
            <DropdownItem isReadOnly key={"view"}>
              <p className="font-bold">View</p>
            </DropdownItem>
          </DropdownSection>

          <DropdownSection>
            {FEED_STYLES.map((style) => {
              return (
                <DropdownItem key={style.key}>
                  <div className=" flex flex-row items-center gap-2">
                    {renderIcon(style, 18)} <p>{style.title}</p>
                  </div>
                </DropdownItem>
              );
            })}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>

      {/* <IconButton
        size="md"
        className={twMerge(
          "text-xl",
          settings.feedStyle === "list" && "text-secondary"
        )}
        IconType={LuLayoutList}
        onPress={() => {
          updateStyle("list");
        }}
      /> */}
      {/* <IconButton size='md'
                    className={twMerge('text-xl', settings.feedStyle === 'blog' && 'text-secondary')}
                    IconType={TbLayoutList} onClick={() => { updateStyle('blog') }} /> */}
      {/* <IconButton
        size="md"
        className={twMerge(
          "text-xl",
          settings.feedStyle === "grid" && "text-secondary"
        )}
        IconType={CiGrid41}
        onPress={() => {
          updateStyle("grid");
        }}
      /> */}
      {/* <IconButton
                className={twMerge('text-xl', settings.feedStyle === 'grid' && 'text-secondary')}
                IconType={BsFillGrid3X3GapFill} onClick={() => { updateStyle('grid') }} /> */}
    </div>
  );
});
