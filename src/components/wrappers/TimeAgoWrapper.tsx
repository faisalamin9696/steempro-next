import moment from "moment";
import { getTimeFromNow } from "@/libs/helper/time";
import clsx from "clsx";

interface Props {
  created?: number;
  lastUpdate?: number;
  withoutUtc?: boolean;
  lang?: LanguagesCode;
  className?: string;
  handleEditClick?: () => void;
}

export default function TimeAgoWrapper(props: Props) {
  const { lang, created, lastUpdate, withoutUtc, className, handleEditClick } =
    props;
  if (!created) return null;

  return (
    <div>
      <span>
        <div className={clsx("flex space-x-1 text-tiny")}>
          <p
            className={className}
            title={
              moment(created)
                .locale(lang || "en")
                .format("lll") ?? getTimeFromNow(created, withoutUtc ?? false)
            }
          >
            {getTimeFromNow(created, withoutUtc ?? false)?.toLowerCase()}
          </p>

          {lastUpdate && created !== lastUpdate ? (
            <button
              onClick={handleEditClick}
              title={
                moment(lastUpdate)
                  .locale(lang || "en")
                  .format("lll") ??
                getTimeFromNow(lastUpdate, withoutUtc ?? false)
              }
              className={className}
            >
              (edited)
            </button>
          ) : null}
        </div>
      </span>
    </div>
  );
}
