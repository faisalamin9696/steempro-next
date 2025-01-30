import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import React, { useState } from "react";
import { useDisclosure } from "@heroui/modal";
import { DatePicker } from "@heroui/date-picker";
import { now, getLocalTimeZone } from "@internationalized/date";
import { ZonedDateTime } from "@internationalized/date";

interface Props {
  isOpen: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onDateTimeChange: (datetime: ZonedDateTime | null) => void;
  startTime?: ZonedDateTime;
}
export default function ScheduleModal(props: Props) {
  const { isOpen, onOpenChange } = useDisclosure();
  const [dateTime, setDateTime] = useState<ZonedDateTime | null>(
    props.startTime ?? now(getLocalTimeZone()).add({ minutes: 1 })
  );

  function handleConfirm() {
    props.onDateTimeChange(dateTime);
    props.onOpenChange && props.onOpenChange(false);
  }

  return (
    <Modal
      isOpen={props.isOpen ?? isOpen}
      hideCloseButton
      onOpenChange={props.onOpenChange ?? onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Select Date and Time
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <DatePicker
                  label="Select Date and Time"
                  variant="flat"
                  hourCycle={24}
                  hideTimeZone
                  value={dateTime}
                  onChange={setDateTime}
                  minValue={now(getLocalTimeZone())}
                  showMonthAndYearPickers
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleConfirm}>
                Confirm
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
