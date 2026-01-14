import { Button } from "@heroui/button";
import { useState, useMemo } from "react";
import { DatePicker } from "@heroui/date-picker";
import { now, getLocalTimeZone, ZonedDateTime } from "@internationalized/date";
import SModal from "./SModal";
import { ModalProps } from "@heroui/modal";

interface Props extends Pick<ModalProps, "isOpen" | "onOpenChange"> {
  onDateTimeChange: (datetime: ZonedDateTime | null) => void;
  startTime?: ZonedDateTime | null;
}

export default function ScheduleModal(props: Props) {
  const { startTime } = props;

  // Memoize single timestamp instance
  const localNow = useMemo(
    () => now(getLocalTimeZone()).add({ minutes: 1 }),
    []
  );

  const [dateTime, setDateTime] = useState<ZonedDateTime | null>(
    startTime ?? localNow
  );

  return (
    <SModal
      {...props}
      hideCloseButton
      title="Select Date and Time"
      footer={(onClose) => (
        <div className="flex flex-row gap-2 self-end">
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={() => {
              props.onDateTimeChange(dateTime);
              onClose();
            }}
          >
            Confirm
          </Button>
        </div>
      )}
    >
      {(onClose) => (
        <DatePicker
          label="Select Date and Time"
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
