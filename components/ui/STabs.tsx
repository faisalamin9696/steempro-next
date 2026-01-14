import { Tab, Tabs, TabsProps } from "@heroui/tabs";
import React from "react";
import { twMerge } from "tailwind-merge";

interface Props<T extends { id: string | number }>
  extends Omit<TabsProps<T>, "children"> {
  children: (item: T) => React.ReactNode;
  tabTitle: (item: T) => React.ReactNode;
  tabHref?: (item: T) => string;
}

function STabs<T extends { id: string | number }>(props: Props<T>) {
  const { children, tabTitle, tabHref, ...rest } = props;

  return (
    <Tabs
      radius="md"
      color="primary"
      {...rest}
      classNames={{
        panel: twMerge("px-0 py-2", rest.classNames?.panel),
        tabList: twMerge(
          props.variant === "bordered" && "border border-border",
          rest.classNames?.tabList
        ),
      }}
    >
      {(item: T) => (
        <Tab
          key={item.id}
          href={tabHref ? tabHref(item) : undefined}
          title={tabTitle(item)}
        >
          {children(item)}
        </Tab>
      )}
    </Tabs>
  );
}

export default STabs;
