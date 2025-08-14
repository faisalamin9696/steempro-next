import moment from "moment";
import { getTimeFromNow } from "@/utils/helper/time";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "@/utils/i18n";
import { LanguagesCode } from "@/types/language";

interface Props {
  created?: number |string;
  lastUpdate?: number;
  withoutUtc?: boolean;
  lang?: LanguagesCode;
  className?: string;
  handleEditClick?: () => void;
}

export default function TimeAgoWrapper(props: Props) {
  const { lang, created, lastUpdate, withoutUtc, className, handleEditClick } =
    props;
  const { t } = useTranslation();
  if (!created) return null;

  return (
    <div>
      <span>
        <div className={twMerge("flex space-x-1 text-tiny")}>
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
              {t('common.edited')}
            </button>
          ) : null}
        </div>
      </span>
    </div>
  );
}
