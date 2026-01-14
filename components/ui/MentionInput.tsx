import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
} from "react";
import { Textarea, Listbox, ListboxItem, Spinner } from "@heroui/react";
import { twMerge } from "tailwind-merge";

// Coordinates helper (simplified version of textarea-caret)
function getCaretCoordinates(
  element: HTMLTextAreaElement,
  position: number
): { top: number; left: number } {
  const div = document.createElement("div");
  const style = window.getComputedStyle(element);

  // Copy necessary styles to the ghost div
  const properties = [
    "direction",
    "boxSizing",
    "width",
    "height",
    "overflowX",
    "overflowY",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "borderStyle",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "fontStretch",
    "fontSize",
    "fontSizeAdjust",
    "lineHeight",
    "fontFamily",
    "textAlign",
    "textTransform",
    "textIndent",
    "textDecoration",
    "letterSpacing",
    "wordSpacing",
    "tabSize",
    "MozTabSize",
  ];

  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";
  div.style.wordWrap = "break-word";

  properties.forEach((prop) => {
    (div.style as any)[prop] = (style as any)[prop];
  });

  div.textContent = element.value.substring(0, position);

  const span = document.createElement("span");
  span.textContent = element.value.substring(position) || ".";
  div.appendChild(span);

  document.body.appendChild(div);
  const { offsetTop: top, offsetLeft: left } = span;
  document.body.removeChild(div);

  return { top, left };
}

export interface MentionItem {
  id: string | number;
  display: string;
  [key: string]: any;
}

interface MentionInputProps
  extends Omit<React.ComponentProps<typeof Textarea>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => Promise<MentionItem[]>;
  trigger?: string;
  renderSuggestion?: (item: MentionItem, focused: boolean) => React.ReactNode;
}

const MentionInput = forwardRef<HTMLTextAreaElement, MentionInputProps>(
  (
    {
      value,
      onChange,
      onSearch,
      trigger = "@",
      renderSuggestion,
      className,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const [suggestions, setSuggestions] = useState<MentionItem[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [query, setQuery] = useState("");
    const [cursorPos, setCursorPos] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const checkTrigger = useCallback(
      async (text: string, pos: number) => {
        const textBeforeCursor = text.substring(0, pos);
        const lastTriggerIdx = textBeforeCursor.lastIndexOf(trigger);

        if (lastTriggerIdx === -1) {
          setIsOpen(false);
          return;
        }

        const textAfterTrigger = textBeforeCursor.substring(lastTriggerIdx + 1);
        const hasSpace = /\s/.test(textAfterTrigger);

        if (hasSpace) {
          setIsOpen(false);
          return;
        }

        const currentQuery = textAfterTrigger;
        setQuery(currentQuery);
        setCursorPos(pos);

        if (textareaRef.current) {
          const { top, left } = getCaretCoordinates(textareaRef.current, pos);
          const rect = textareaRef.current.getBoundingClientRect();

          setCoords({
            top: rect.top + top - textareaRef.current.scrollTop,
            left: rect.left + left - textareaRef.current.scrollLeft,
          });
        }

        setLoading(true);
        setIsOpen(true);
        const results = await onSearch(currentQuery);
        setSuggestions(results);
        setSelectedIndex(0);
        setLoading(false);

        if (results.length === 0) {
          setIsOpen(false);
        }
      },
      [trigger, onSearch]
    );

    // Close on click outside or scroll
    useEffect(() => {
      const handleEvent = () => isOpen && setIsOpen(false);
      window.addEventListener("scroll", handleEvent, true);
      window.addEventListener("resize", handleEvent);
      return () => {
        window.removeEventListener("scroll", handleEvent, true);
        window.removeEventListener("resize", handleEvent);
      };
    }, [isOpen]);

    const handleSelect = (item: MentionItem) => {
      if (!textareaRef.current) return;

      const before = value.substring(0, cursorPos - query.length - 1);
      const after = value.substring(cursorPos);
      const newValue = `${before}@${item.id} ${after}`;

      onChange(newValue);
      setIsOpen(false);

      // Focus back and set cursor
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPos = before.length + item.id.toString().length + 2; // +1 for @, +1 for space
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    };

    const handleInput = (e: any) => {
      const newValue = e.target.value;
      const pos = e.target.selectionStart;
      onChange(newValue);
      setSelectedIndex(0);
      checkTrigger(newValue, pos);
    };

    const handleKeyDown = (e: any) => {
      if (onKeyDown) {
        onKeyDown(e);
      }
      if (e.defaultPrevented) return;

      if (isOpen && suggestions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex(
            (prev) => (prev - 1 + suggestions.length) % suggestions.length
          );
        } else if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          handleSelect(suggestions[selectedIndex]);
        } else if (e.key === "Escape") {
          setIsOpen(false);
        }
      }
    };

    return (
      <div className="relative w-full h-full">
        <Textarea
          ref={(el) => {
            textareaRef.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) (ref as any).current = el;
          }}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className={twMerge("w-full h-full", className)}
          {...props}
        />

        {isOpen && (
          <div
            className="fixed z-100 pointer-events-auto shadow-2xl rounded-xl border border-border bg-content1 min-w-[220px] max-h-[300px] overflow-y-auto animate-in fade-in zoom-in duration-100"
            style={{
              top: coords.top + 25, // offset below the cursor
              left: coords.left,
            }}
            onMouseDown={(e) => e.preventDefault()} // Prevent losing focus on click
          >
            {loading ? (
              <div className="p-4 flex justify-center">
                <Spinner size="sm" />
              </div>
            ) : (
              <Listbox
                aria-label="User suggestions"
                variant="flat"
                disableAnimation
                onAction={(key) => {
                  const item = suggestions.find((s) => s.id === key);
                  if (item) handleSelect(item);
                }}
              >
                {suggestions.map((item, index) => (
                  <ListboxItem
                    key={item.id}
                    textValue={item.display}
                    className={twMerge(
                      "transition-colors",
                      index === selectedIndex && "bg-default-200/60"
                    )}
                  >
                    {renderSuggestion ? (
                      renderSuggestion(item, index === selectedIndex)
                    ) : (
                      <div className="flex items-center gap-2 text-left">
                        <span className="font-semibold">{item.display}</span>
                        <span className="text-xs text-default-400">
                          @{item.id}
                        </span>
                      </div>
                    )}
                  </ListboxItem>
                ))}
              </Listbox>
            )}
          </div>
        )}
      </div>
    );
  }
);

MentionInput.displayName = "MentionInput";

export default MentionInput;
