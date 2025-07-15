import { Button } from "@heroui/button";
import React, { useState } from "react";
import { DatePicker } from "@heroui/date-picker";
import { now, getLocalTimeZone, ZonedDateTime } from "@internationalized/date";
import SModal from "./ui/SModal";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDateTimeChange: (datetime: ZonedDateTime | null) => void;
  startTime?: ZonedDateTime;
}
export default function ScheduleModal(props: Props) {
  const { isOpen, onOpenChange } = props;
  const [dateTime, setDateTime] = useState<ZonedDateTime | null>(
    props.startTime ?? now(getLocalTimeZone()).add({ minutes: 1 })
  );

  function handleConfirm() {
    props.onDateTimeChange(dateTime);
    onOpenChange(false);
  }

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{ hideCloseButton: true }}
      title={() => "Select Date and Time"}
      body={() => (
        <DatePicker
          label="Select Date and Time"
          variant="flat"
          hourCycle={24}
          hideTimeZone
          value={dateTime}
          onChange={setDateTime}
          minValue={now(getLocalTimeZone()) as any}
          showMonthAndYearPickers
        />
      )}
      footer={(onClose) => (
        <>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleConfirm}>
            Confirm
          </Button>
        </>
      )}
    />
  );
}
