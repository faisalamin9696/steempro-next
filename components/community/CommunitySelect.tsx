import {
  Select,
  SelectItem,
  SelectProps,
} from "@heroui/select";
import { SharedSelection } from "@heroui/system";
import { useSubscriberCommunities } from "@/hooks/useSubscriberCommunities";
import { useSession } from "next-auth/react";
import { useState } from "react";
import SAvatar from "../ui/SAvatar";

interface Props extends Omit<SelectProps, "children"> {
  initialCommunity?: Community;
  community?: Community;
  onSelectCommunity: (community?: Community) => void;
}

function CommunitySelect({ community, onSelectCommunity, ...props }: Props) {
  const { data: session } = useSession();
  const [initialCommunity, setInitialCommunity] = useState(
    props.initialCommunity,
  );
  const { communities: communitites, isLoading } = useSubscriberCommunities(
    session?.user?.name!,
    initialCommunity,
  );
  const handleSelectionChange = (e: SharedSelection) => {
    const selectedValue = e.currentKey?.toString();
    if (selectedValue) {
      onSelectCommunity(
        communitites?.filter((item) => item.account === selectedValue)[0],
      );
    }
  };

  return (
    <Select
      size="lg"
      classNames={{
        base: "max-w-xs",
        trigger: "border border-border",
        value: "text-default-800 dark:text-default-600",
      }}
      selectedKeys={community?.account ? [community?.account] : []}
      isMultiline={true}
      {...props}
      items={communitites}
      placeholder="Select Community"
      isLoading={isLoading}
      onClear={() => {
        onSelectCommunity(undefined);
        setInitialCommunity(undefined);
      }}
      listboxProps={{
        emptyContent: "No community available",
      }}
      renderValue={(items) => {
        return items.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <SAvatar
              className="shrink-0"
              size={38}
              username={item.data?.account!}
            />
            <div className="flex flex-col">
              <span className="text-sm">{item.data?.title}</span>
              <span className="text-muted text-tiny">
                ({item.data?.account})
              </span>
            </div>
          </div>
        ));
      }}
      selectionMode="single"
      variant="flat"
      isClearable
      onSelectionChange={handleSelectionChange}
    >
      {(community) => (
        <SelectItem
          key={community.account}
          textValue={community.title || community.account}
        >
          <div className="flex gap-2 items-center">
            <SAvatar
              className="shrink-0"
              size={38}
              username={community.account!}
            />
            <div className="flex flex-col">
              <span className="text-sm">{community.title}</span>
              <span className="text-muted text-tiny">
                ({community.account})
              </span>
            </div>
          </div>
        </SelectItem>
      )}
    </Select>
  );
}

export default CommunitySelect;
