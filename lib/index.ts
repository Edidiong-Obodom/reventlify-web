/**
 * Generates a random 7-digit number.
 *
 * @returns {number} A random number between 1,000,000 and 9,999,999.
 *
 * @example
 * const number = randomNumber(); // e.g. 5823947
 */
export const randomNumber = () =>
  Math.floor(Math.random() * 9_000_000) + 1_000_000;

/**
 * Converts a number (1 to 4) to its Roman numeral equivalent.
 *
 * @param {number} i - The number to convert (expected range: 1 to 4).
 * @returns {string} The Roman numeral equivalent (I, II, III, IV), or an empty string if out of range.
 *
 * @example
 * const roman = getRomanNumeral(3); // "III"
 */
export const getRomanNumeral = (i: number): string => {
  const numerals = ["I", "II", "III", "IV"];
  return numerals[i - 1] ?? "";
};

/**
 * Capitalizes the first character of a string.
 *
 * @param {string} str - The input string to capitalize.
 * @returns {string} The string with its first character capitalized.
 *
 * @example
 * const result = capitalizeFirst("hello world"); // "Hello world"
 */
export const capitalizeFirst = (str: string) => {
  if (!str) return "";
  const trimmed = str.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

/**
 * Capitalizes the first character of each word in a string.
 *
 * @param {string} str - The input string to transform.
 * @returns {string} The string in title case with each word capitalized.
 *
 * @example
 * const result = capitalizeEachWord("hello world"); // "Hello World"
 */
export const capitalizeEachWord = (str: string) => {
  return str
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
