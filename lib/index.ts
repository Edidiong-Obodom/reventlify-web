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

export const parseMarkdown = (text: string): string => {
  if (!text) return "";

  // Convert literal '\n' strings to actual newlines
  text = text.replace(/\\n/g, "\n");

  // Apply WhatsApp-style formatting
  let html = text
    .replace(/\*(.*?)\*/g, "<strong>$1</strong>") // Bold
    .replace(/_(.*?)_/g, "<em>$1</em>") // Italic
    .replace(/~(.*?)~/g, "<u>$1</u>"); // Underline

  const lines = html.split(/\r?\n/); // Split lines on actual line breaks
  let parsed = "";
  let inUnorderedList = false;
  let inOrderedList = false;

  lines.forEach((line) => {
    // Handle unordered list
    if (line.startsWith("- ")) {
      if (!inUnorderedList) {
        parsed += "<ul>";
        inUnorderedList = true;
      }
      parsed += `<li>${line.substring(2)}</li>`;
    }
    // Handle ordered list
    else if (line.match(/^\d+\.\s/)) {
      if (!inOrderedList) {
        parsed += "<ol>";
        inOrderedList = true;
      }
      parsed += `<li>${line.replace(/^\d+\.\s/, "")}</li>`;
    }
    // Handle empty line (paragraph separator)
    else if (line.trim() === "") {
      if (inUnorderedList) {
        parsed += "</ul>";
        inUnorderedList = false;
      }
      if (inOrderedList) {
        parsed += "</ol>";
        inOrderedList = false;
      }
      parsed += "<br/>";
    }
    // Handle normal text
    else {
      if (inUnorderedList) {
        parsed += "</ul>";
        inUnorderedList = false;
      }
      if (inOrderedList) {
        parsed += "</ol>";
        inOrderedList = false;
      }
      parsed += `<p>${line}</p>`;
    }
  });

  // Close any remaining list
  if (inUnorderedList) parsed += "</ul>";
  if (inOrderedList) parsed += "</ol>";

  return parsed;
};

export const removeMarkdownSyntax = (text: string): string => {
  if (!text) return "";

  let plainText = text;

  // Step 1: Convert the literal '\n' to actual line breaks
  plainText = plainText.replace(/\\n/g, "\n");

  // Step 2: Remove WhatsApp-style bold, italic, underline markers
  plainText = plainText.replace(/\*(.*?)\*/g, "$1"); // *bold*
  plainText = plainText.replace(/_(.*?)_/g, "$1"); // _italic_
  plainText = plainText.replace(/~(.*?)~/g, "$1"); // ~underline~

  // Step 3: Remove unordered list markers (- )
  plainText = plainText.replace(/^- /gm, "");

  // Step 4: Remove ordered list markers (1. , 2. , etc.)
  plainText = plainText.replace(/^\d+\.\s/gm, "");

  // Step 5: Remove line breaks
  plainText = plainText.replace(/\r?\n/g, " ");

  // Step 6: Remove multiple spaces and trim
  plainText = plainText.replace(/\s\s+/g, " ").trim();

  return plainText;
};
