export const randomNumber = () =>
  Math.floor(Math.random() * 9_000_000) + 1_000_000;

export const getRomanNumeral = (i: number): string => {
  const numerals = ["I", "II", "III", "IV"];
  return numerals[i - 1] ?? "";
};
