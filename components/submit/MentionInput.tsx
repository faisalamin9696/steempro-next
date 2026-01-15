import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
} from "react";
import { Textarea, Listbox, ListboxItem, Spinner } from "@heroui/react";
import { createPortal } from "react-dom";
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
  localUsers?: MentionItem[];
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
      localUsers = [],
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
            top:
              rect.top + top - textareaRef.current.scrollTop + window.scrollY,
            left:
              rect.left +
              left -
              textareaRef.current.scrollLeft +
              window.scrollX,
          });
        }

        // 1. Filter local users immediately
        let localMatches: MentionItem[] = [];
        if (localUsers && localUsers.length > 0) {
          const qLower = currentQuery.toLowerCase();
          localMatches = localUsers.filter(
            (u) =>
              u.id.toString().toLowerCase().includes(qLower) ||
              u.display.toLowerCase().includes(qLower)
          );
        }

        // Show local matches immediately if we have them or if query is empty (show all locals)
        if (
          localUsers.length > 0 &&
          (localMatches.length > 0 || currentQuery === "")
        ) {
          // If query is empty, show all local users.
          // If query is not empty, show matches.
          // Logic in 'localMatches' calculation handles query filtering,
          // but if query is "", includes("") is true for all strings.
          // So localMatches contains all localUsers if query is "".
          setSuggestions(localMatches);
          setSelectedIndex(0);
          setLoading(false);
          setIsOpen(true);
        }

        // 2. Decide if we need to search remotely
        // We avoid search if query is short (< 3)
        if (currentQuery.length < 3) {
          if (localMatches.length === 0 && !localUsers.length) {
            setIsOpen(false);
          }
          return;
        }

        setLoading(true);
        if (localMatches.length === 0) setIsOpen(true); // Open if not already open

        try {
          const results = await onSearch(currentQuery);
          // Check if query hasn't changed while we were waiting?
          // (Simplified: we just set what we got.
          // Ideally we should track the request, but onSearch is a prop)

          setSuggestions(results);
          if (results.length > 0) {
            setSelectedIndex(0);
            setIsOpen(true);
          } else if (localMatches.length === 0) {
            setIsOpen(false);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      },
      [trigger, onSearch, localUsers]
    );

    // Close on click outside or scroll
    useEffect(() => {
      const handleEvent = () => isOpen && setIsOpen(false);
      window.addEventListener("resize", handleEvent);
      return () => {
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

    // Ensure we have access to document for portal
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
      setMounted(true);
    }, []);

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

        {isOpen &&
          mounted &&
          createPortal(
            <div
              className="absolute z-40 pointer-events-auto shadow-2xl rounded-xl border border-border bg-content1 min-w-[220px] max-h-[300px] overflow-y-auto animate-in fade-in zoom-in duration-100"
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
                  className="gap-"
                  shouldHighlightOnFocus
                  disableAnimation
                  onAction={(key) => {
                    const item = suggestions.find((s) => s.id === key);
                    if (item) handleSelect(item);
                  }}
                  classNames={{"list":"gap-2"}}
                >
                  {suggestions.map((item, index) => (
                    <ListboxItem
                      key={item.id}
                      textValue={item.display}
                      className={twMerge(
                        "transition-colors rounded-xl",
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
            </div>,
            document.body
          )}
      </div>
    );
  }
);

MentionInput.displayName = "MentionInput";

export default MentionInput;
