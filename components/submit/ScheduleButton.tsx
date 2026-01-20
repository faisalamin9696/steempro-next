import { Button, ButtonProps } from "@heroui/button";
import { useState } from "react";
import { ZonedDateTime } from "@internationalized/date";
import { CalendarPlus } from "lucide-react";
import ScheduleModal from "../ui/ScheduleModal";

interface Props extends ButtonProps {
  onDateTimeChange: (datetime: ZonedDateTime | null) => void;
  startTime?: ZonedDateTime | null;
  iconSize?: number;
}

function ScheduleButton(props: Props) {
  const { startTime, onDateTimeChange, iconSize = 20 } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onPress={() => {
          if (startTime) {
            onDateTimeChange(null);
            return;
          }
          setIsOpen(true);
        }}
        {...props}
      >
        <CalendarPlus size={iconSize} />
      </Button>

      <ScheduleModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onDateTimeChange={onDateTimeChange}
        startTime={startTime}
      />
    </>
  );
}

export default ScheduleButton;
