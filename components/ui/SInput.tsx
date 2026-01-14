import { validateAccountName } from "@/utils/chainValidation";
import { Input, InputProps } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import SAvatar from "./SAvatar";
import { normalizeUsername } from "@/utils/editor";

interface Props extends InputProps {}

function SInput({ onValueChange, ...props }: Props) {
  const [avatar, setAvatar] = useState<string | null>(props.value || null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (value: string) => {
    // forward original handler
    onValueChange?.(value);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Sync avatar with value prop changes (e.g. initialValues)
  useEffect(() => {
    const val = normalizeUsername(props.value ?? "") || "";
    if (!validateAccountName(val)) {
      // clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      // debounce avatar update
      debounceRef.current = setTimeout(() => {
        setAvatar(val);
      }, 500);
    } else {
      setAvatar(null);
    }
  }, [props.value]);

  return (
    <Input
      {...props}
      onValueChange={handleChange}
      endContent={
        avatar ? (
          <SAvatar showLink={false} size={32} radius="full" username={avatar} />
        ) : null
      }
      autoCapitalize="none"
    />
  );
}

export default SInput;
