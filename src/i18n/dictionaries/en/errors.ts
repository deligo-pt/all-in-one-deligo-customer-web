/**
 * The words shown when a route cannot render what was asked for.
 *
 * Separate from `common` because the pages that need them are the pages that
 * ship on their own — a 404 should not carry the vocabulary of a checkout it is
 * not part of.
 */
const errors = {
  notFoundTitle: "Page Not Found",
  notFoundDescription:
    "It looks like you've reached a dead end. The page you're looking for has been moved or no longer exists.",
  unexpectedTitle: "Something went wrong",
  unexpectedDescription:
    "An unexpected error occurred while loading this page. You can try again or head back to the homepage.",
  tryAgain: "Try again",
  criticalError: "A critical error occurred. Please try again.",
} satisfies Record<string, string>;

export default errors;
