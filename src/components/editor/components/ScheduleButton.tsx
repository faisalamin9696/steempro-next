import { Button } from "@nextui-org/button";
import { FaCalendarAlt } from "react-icons/fa";

interface Props {
  buttonText?: string;
  isLoading?: boolean;
  onPress?: () => void;
  isDisabled?: boolean;
}

export default function ScheduleButton(props: Props) {
  const { buttonText, isLoading, onPress, isDisabled } = props;

  return (
    <Button
      size="sm"
      title="Schedule post"
      onPress={onPress}
      color="secondary"
      isDisabled={isDisabled}
      isLoading={isLoading}
      className="!text-white "
      isIconOnly={!buttonText}
      variant="shadow"
    >
      {buttonText ? (
        buttonText ?? "Schedule"
      ) : (
        <FaCalendarAlt className="text-xl" />
      )}
    </Button>
  );
}
