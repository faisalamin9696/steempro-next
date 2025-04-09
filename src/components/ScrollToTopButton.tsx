import { Button } from "@heroui/button";
import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa"; // Import an icon for the button
import { twMerge } from "tailwind-merge";

export const ScrollToTopButton = ({ className }: { className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show/hide the button based on scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scrolling
    });
  };

  return (
    <div
      className={twMerge(
        `fixed bottom-8 right-8 z-50 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-20"
        }`,
        className
      )}
    >
      <Button
        isIconOnly
        color="primary"
        className="shadow-lg opacity-80"
        aria-label="Scroll to top"
        onPress={scrollToTop}
      >
        <FaArrowUp />
      </Button>
    </div>
  );
};
