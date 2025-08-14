"use client";

import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { memo, useEffect } from "react";
import { useTranslation } from "@/utils/i18n";
import {
  fetchSds,
  useAppDispatch,
  useAppSelector,
} from "@/constants/AppFunctions";
import { getResizedAvatar } from "@/utils/parseImage";
import useSWR from "swr";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { IoCloseOutline } from "react-icons/io5";
import { empty_community } from "@/constants/Placeholders";
import Image from "next/image";
import SAvatar from "@/components/ui/SAvatar";

interface Props {
  community?: Community;
  onSelectCommunity: (community?: Community) => void;
  onlyCommunity?: boolean;
  isDisabled?: boolean;
  refCommunity?: Community;
  handleOnClear?: () => void;
}
export default memo(function CommunitySelectButton(props: Props) {
  const { t } = useTranslation();
  let {
    community,
    onSelectCommunity,
    onlyCommunity,
    isDisabled,
    refCommunity,
    handleOnClear,
  } = props;

  if (refCommunity) {
    onlyCommunity = true;
    community = refCommunity;
    onSelectCommunity(refCommunity);
  }

  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const URL = `/communities_api/getCommunitiesBySubscriber/${loginInfo.name}`;

  const { data, isLoading } = useSWR(
    onlyCommunity ? undefined : !!loginInfo.name && URL,
    fetchSds<Community[]>,
    {
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      shouldRetryOnError: true,
    }
  );
  const dispatch = useAppDispatch();

  const commmunities: Community[] =
    onlyCommunity && community
      ? [{ ...community }]
      : loginInfo.communities ?? [];

  useEffect(() => {
    if (data) {
      dispatch(saveLoginHandler({ ...loginInfo, communities: data }));
    }
  }, [data]);

  const handleSelectionChange = (e) => {
    if (e.target.value) {
      const value = JSON.parse(e.target.value);
      onSelectCommunity(empty_community(value?.account, value?.title));
    }
  };
  return (
    <div className="flex flex-row gap-2 items-center">
      <div className="w-60">
        <Select
          aria-label={t('submit.select_community_aria')}
          selectedKeys={
            community
              ? [
                  JSON.stringify({
                    account: community.account,
                  }),
                ]
              : []
          }
          listboxProps={{
            emptyContent: t('submit.no_community'),
          }}
          size="md"
          isDisabled={onlyCommunity || isDisabled}
          items={
            onlyCommunity
              ? commmunities
              : (data || loginInfo?.communities) ?? []
          }
          isLoading={isLoading}
          placeholder={t('submit.select_community')}
          className="text-default-500 text-sm"
          classNames={{
            // trigger:'min-h-0 h-10',
            selectorIcon: "text-default-500",
          }}
          renderValue={(items) => {
            return items.map((item) => {
              return (
                <div key={item.key} className="flex gap-2 items-center">

                  <SAvatar username={item.data?.account} size="xs"/>
                  
                  <div className="flex flex-col">
                    <span className="text-small">{item.data?.title}</span>
                    <span className="text-tiny text-default-500">
                      {item.data?.account}
                    </span>
                  </div>
                </div>
              );
            });
          }}
          onChange={handleSelectionChange}
        >
          {(item) => (
            <SelectItem
              key={JSON.stringify({ account: item.account })}
              textValue={JSON.stringify(item)}
            >
              <div className="flex gap-2 items-center">
                <Image
                  loading="lazy"
                  className="avatar rounded-full object-contain"
                  height={28}
                  width={28}
                  src={getResizedAvatar(item.account)}
                  alt={item.account}
                />
                <div className="flex flex-col">
                  <span className="text-small">{item.title}</span>
                  <span className="text-tiny text-default-400">
                    {item.account}
                  </span>
                </div>
              </div>
            </SelectItem>
          )}
        </Select>
      </div>
      {(!!refCommunity?.account || (!onlyCommunity && community)) && (
        <Button
          size="sm"
          isIconOnly
          className="text-default-500"
          radius="full"
          variant="light"
          isDisabled={isDisabled}
          onPress={() => {
            handleOnClear && handleOnClear();
            onSelectCommunity(undefined);
          }}
        >
          <IoCloseOutline className="text-xl" />
        </Button>
      )}
    </div>
  );
});
