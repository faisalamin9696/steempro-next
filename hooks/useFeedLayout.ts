import { useAppSelector } from "@/hooks/redux/store";

export const useFeedLayout = () => {
  const settings = useAppSelector((state) => state.settingsReducer.value);
  const layout = settings?.feed_style || "list";

  let className = "flex flex-col gap-4";
  if (layout === "grid") {
    className =
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
  } else if (layout === "blogs") {
    className = "flex flex-col gap-6";
  }

  return { layout, className };
};

export default useFeedLayout;
