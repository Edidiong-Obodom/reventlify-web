// /lib/helpers/formatEventDetail.ts
import moment from "moment";
import { capitalizeFirst } from "..";

export const formatEventDetail = (event: any) => {
  const minPrice = event.pricings?.sort(
    (a: any, b: any) => a.amount - b.amount
  );

  return {
    id: event.id,
    title: event.name,
    date: moment(event.start_date).format("DD MMMM, YYYY"),
    day: moment(event.start_date).format("dddd"),
    startTime: moment(event.start_time, "HH:mm:ss").format("h:mm A"),
    endTime: moment(event.end_time, "HH:mm:ss").format("h:mm A"),
    location: event.venue,
    address: `${event.address}, ${capitalizeFirst(
      event.city
    )}, ${capitalizeFirst(event.state)}, ${capitalizeFirst(event.country)}`,
    organizer: {
      name: event.creator_user_name,
      image: event.creator_photo ?? "/placeholder.svg",
    },
    description: event.description,
    pricings: minPrice,
    attendees: Number(event.total_ticket_sales ?? 0),
    image: event.regime_banner ?? "/placeholder.svg",
    gallery: event.regime_gallery,
  };
};

/**
 * Converts a given string into a URL-friendly slug.
 *
 * Example:
 * slugify("Calabar Beach Fiesta") => "calabar-beach-fiesta"
 *
 * - Converts the text to lowercase.
 * - Trims whitespace.
 * - Replaces spaces and non-word characters with hyphens.
 *
 * @param {string} text - The text to be slugified.
 * @returns {string} The slugified version of the input text.
 */
export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-"); // Replace spaces and non-word chars with hyphens
}

/**
 * Converts a slugified string back to a human-readable format.
 *
 * Example:
 * deSlugify("calabar-beach-fiesta") => "Calabar Beach Fiesta"
 *
 * - Replaces hyphens with spaces.
 * - Capitalizes the first letter of each word.
 *
 * @param {string} slug - The slug string to be converted.
 * @returns {string} The human-readable version of the slug.
 */
export function deSlugify(slug: string) {
  return slug
    .toString()
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
}
