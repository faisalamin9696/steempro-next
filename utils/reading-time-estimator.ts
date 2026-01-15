/**
 * Reading time estimator result shape
 */
type ReadingTime = {
  /**
   * Number of minutes to read the text
   */
  readonly minutes: number;
  /**
   * Number of words in the text
   */
  readonly words: number;
  /**
   * Localized message with the number of minutes to read the text
   */
  readonly text: string;
};

/**
 * Parses the text and returns an array of words
 * @param data - The text to be analyzed
 * @returns Parsed chinese, japanese and accented text
 */

/**
 * Calculates the number of words in the text
 * @param data - The text to be analyzed
 * @returns number of words in the text
 */
export const getNumberOfWords = (data: string): number => {
  const cjkEntry = new RegExp("[\u4E00-\u9FFF]", "g");
  data = data.replace(cjkEntry, " {CJK} ");
  const splitEntry: any = data?.trim().split(/\s+/);
  const cjkCount = splitEntry.filter((e: string) => e === "{CJK}");
  const count: any = splitEntry.includes("{CJK}")
    ? cjkCount.length
    : splitEntry.length;
  return data ? count : 0;
};
/**
 * Checks if the number of minutes is less than 1
 * @param minutes - Number of minutes to read the text
 * @returns True if the number of minutes is less than 1, otherwise false
 */
const isLessThanAMinute = (minutes: number): boolean =>
  minutes < 1 + Number.EPSILON;

/**
 * Grabs the correct translation
 * @param minutes - Number of minutes to read the text
 * @param locale - Locale to be used in the result
 * @returns localized message with the number of minutes to read the text
 */
const getLocale = (minutes: number): string =>
  isLessThanAMinute(minutes) ? "<1 min read" : `min read`;

/**
 * Estimates the reading time of the text
 * @param data - The text to be estimated
 * @param wordsPerMinute - The number of words per minute
 * @returns The estimated reading time
 */
export const readingTime = (
  data: string,
  words?: number,
  wordsPerMinute = 238
): ReadingTime => {
  let noOfWords = getNumberOfWords(data);
  if (words) {
    noOfWords = words;
  }
  const minutes = Math.round(noOfWords / wordsPerMinute);

  return {
    minutes,
    words: noOfWords,
    text: `${isLessThanAMinute(minutes) ? "" : `${minutes} `}${getLocale(
      minutes
    )}`,
  } as const;
};
