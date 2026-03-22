import { Button } from "@heroui/button";
import { useState, useMemo } from "react";
import { DatePicker } from "@heroui/date-picker";
import { now, getLocalTimeZone, ZonedDateTime } from "@internationalized/date";
import SModal from "./SModal";
import { ModalProps } from "@heroui/modal";
import { useTranslations } from "next-intl";

interface Props extends Pick<ModalProps, "isOpen" | "onOpenChange"> {
  onDateTimeChange: (datetime: ZonedDateTime | null) => void;
  startTime?: ZonedDateTime | null;
}

export default function ScheduleModal(props: Props) {
  const t = useTranslations("Submit");
  const { startTime } = props;

  // Memoize single timestamp instance
  const localNow = useMemo(
    () => now(getLocalTimeZone()).add({ minutes: 1 }),
    [],
  );

  const [dateTime, setDateTime] = useState<ZonedDateTime | null>(
    startTime ?? localNow,
  );

  return (
    <SModal
      {...props}
      hideCloseButton
      title={t("schedule.title")}
      footer={(onClose) => (
        <div className="flex flex-row gap-2 self-end">
          <Button variant="flat" onPress={onClose}>
            {t("cancel")}
          </Button>
          <Button
            color="primary"
            onPress={() => {
              props.onDateTimeChange(dateTime);
              onClose();
            }}
          >
            {t("confirm")}
          </Button>
        </div>
      )}
    >
      {(onClose) => (
        <DatePicker
          label={t("schedule.title")}
          variant="flat"
          hourCycle={24}
          hideTimeZone
          value={dateTime}
          onChange={setDateTime}
          minValue={localNow} // consistent timestamp
          showMonthAndYearPickers
        />
      )}
    </SModal>
  );
}
