import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import NumAbbr from "number-abbreviate";

const numAbbr = new NumAbbr();

export const validateCommunity = (tag?: string): boolean => {
  if (!tag) return false;
  const community_regex = /hive-[1-3]\d{4,6}$/;

  return community_regex.test(tag);
};

export function formatNumberInMillions(value: number): string {
  // Convert the number to millions
  const valueInBillions = value / 1_000_000_000_000;

  // Format the number with locale-specific separators and up to 3 decimal places
  const formattedValue = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 3,
    minimumFractionDigits: 3,
  }).format(valueInBillions);

  // Append 'M' to indicate millions
  return `${formattedValue}`;
}

export function abbreviateNumber(number, fraction: number = 2) {
  return numAbbr.abbreviate(number, fraction);
}

// export function abbreviateNumber(
//   number?: number,
//   decimalPlaces = 1,
//   outputOnlyM: boolean = false
// ): string | number {
//   if (number === 0 || !number) return "0";

//   const SI_SYMBOL = ["", "K", "M", "B", "T", "Q"];

//   const tier = (Math.log10(Math.abs(number)) / 3) | 0;

//   if (tier === 0) return number.toFixed(0);

//   if (tier >= 3 && outputOnlyM)
//     return `${(number / 10 ** (tier * 3)).toFixed(decimalPlaces)}M`;

//   const suffix = SI_SYMBOL[tier];
//   const scale = Math.pow(10, tier * 3);

//   const scaled = number / scale;

//   const decimalPart = String(scaled).substring(
//     scaled.toString().indexOf(".") + 1
//   );
//   if (parseFloat(decimalPart) === 0) {
//     decimalPlaces = 0;
//   }

//   let formattedNumber = scaled.toFixed(decimalPlaces);

//   // Remove decimal part if it's zero

//   return formattedNumber + suffix;
// }
export const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(
        reader?.result?.toString().replace(/^data:image\/?[A-z]*;base64,/, "")
      );
    };
    reader.onerror = (error) => reject(error);
  });
export const count_words = (text: string) => {
  if (text) {
    return text.match(/\S+/g)?.length;
  } else return 0;
};

export function pushWithCtrl(
  event,
  router: {
    push: (href: string, options?: NavigateOptions) => void | Promise<boolean>;
    replace: (
      href: string,
      options?: NavigateOptions
    ) => void | Promise<boolean>;
    back(): void;
    forward(): void;
    refresh(): void;
    prefetch(href: string, options?: undefined): void;
  },
  targetUrl: string,
  shouldRefresh?: boolean
) {
  const ctrlPressed = event?.ctrlKey || false;
  if (ctrlPressed) {
    window.open(targetUrl, "_blank");
    return;
  }
  router.push(targetUrl);
  if (shouldRefresh) router.refresh();
}

export function isNumeric(value: string): boolean {
  return /^-?\d*\.?\d+$/.test(value);
}

export function validateHost(host?: string | null) {
  if (!host) return false;
  const validHosts = JSON.parse(
    process.env.NEXT_PUBLIC_ALLOWED_ORIGINS ?? `[]`
  ) as string[];

  return validHosts.includes(host);
}

/**
 * Type-safe object sorting by key
 * @param array Array to sort
 * @param key Key to sort by
 * @param direction 'asc' or 'desc'
 * @returns New sorted array
 */
export function sortByKey<T extends object>(
  array: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    // Handle null/undefined cases
    if (aValue == null || bValue == null) {
      if (aValue == null && bValue == null) return 0;
      return aValue == null ? 1 : -1;
    }

    // Type-safe date checking
    const isDate = (x: unknown): x is Date => x instanceof Date;

    // Numeric comparison
    if (typeof aValue === "number" && typeof bValue === "number") {
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    // Date comparison
    if (isDate(aValue) && isDate(bValue)) {
      const diff = aValue.getTime() - bValue.getTime();
      return direction === "asc" ? diff : -diff;
    }

    // String comparison (fallback)
    const aString = String(aValue);
    const bString = String(bValue);
    return direction === "asc"
      ? aString.localeCompare(bString)
      : bString.localeCompare(aString);
  });
}

export function sortByKeyDesc<T>(array: T[], key: keyof T): T[] {
  return [...array].sort((a, b) => {
    if (typeof a[key] === "number" && typeof b[key] === "number") {
      return (b[key] as number) - (a[key] as number);
    }
    return String(b[key]).localeCompare(String(a[key]));
  });
}

export function sortByNestedKeyDesc(array, keyPath) {
  return [...array].sort((a, b) => {
    const valueA = keyPath.split(".").reduce((o, k) => o?.[k], a);
    const valueB = keyPath.split(".").reduce((o, k) => o?.[k], b);
    return valueB - valueA;
  });
}
