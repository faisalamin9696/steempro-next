/**
 * Shape checks for values that come from a URL and end up inside an SDS path.
 *
 * Why this exists: SDS answers a malformed parameter with HTTP 200 and
 * `{"code":-1,"error":"'account' must contain a valid account name"}`. That is
 * not a transient failure — but it used to be retried like one, so a single
 * junk URL cost three endpoints x two attempts = six upstream requests and
 * about two seconds of server time. Validating the shape before the fetch means
 * a probe like `/@zzz_no_such_account_zzz` never reaches SDS at all.
 *
 * The ranges mirror Steem's own rules: account names are 3-16 characters,
 * start with a letter, and are lowercase alphanumeric plus `.` and `-`.
 * Permlinks are up to 256 characters of lowercase alphanumeric plus `-`.
 */

const ACCOUNT_RE = /^[a-z][a-z0-9.-]{2,15}$/;
const PERMLINK_RE = /^[a-z0-9][a-z0-9-]{0,255}$/;
// `/community/[tag]` carries the numeric half of `hive-160125`.
const HIVE_TAG_RE = /^\d{3,10}$/;

export function isAccountName(value: unknown): value is string {
  return typeof value === "string" && ACCOUNT_RE.test(value);
}

export function isPermlink(value: unknown): value is string {
  return typeof value === "string" && PERMLINK_RE.test(value);
}

export function isHiveTag(value: unknown): value is string {
  return typeof value === "string" && HIVE_TAG_RE.test(value);
}

/**
 * `hive-160125` is a valid account name by Steem's rules, so community ids need
 * no separate check — but they are passed in mixed case by some callers.
 */
export function normalizeAccount(value: string): string {
  return value.trim().toLowerCase();
}
