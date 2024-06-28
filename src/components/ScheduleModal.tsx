import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import React, { useState } from "react";
import { useDisclosure } from "@nextui-org/modal";
import { DatePicker } from "@nextui-org/date-picker";
import { now, getLocalTimeZone } from "@internationalized/date";
import { ZonedDateTime } from "@internationalized/date";

interface Props {
  isOpen: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onDateTimeChange: (datetime: ZonedDateTime) => void;
}
export default function ScheduleModal(props: Props) {
  const { isOpen, onOpenChange } = useDisclosure();
  const [dateTime, setDateTime] = useState(
    now(getLocalTimeZone()).add({ minutes: 1 })
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
              <Button color="danger" variant="light" onClick={onClose}>
                Close
              </Button>
              <Button color="primary" onClick={handleConfirm}>
                Confirm
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
