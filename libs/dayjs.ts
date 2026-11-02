import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import calendar from "dayjs/plugin/calendar";
import duration from "dayjs/plugin/duration";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

/**
 * Single configuration point for dates — this replaced `moment` (59 KB core)
 * with dayjs (~2 KB), which used to ship in the initial scripts of *every*
 * page.
 *
 * Always import from here, never from "dayjs" directly, so the plugins are
 * registered before anything formats a date. Which plugin covers which of the
 * moment APIs this codebase actually used:
 *
 *   localizedFormat  format("LL" | "LLL" | "LLLL"). Without it dayjs prints the
 *                    token literally — `format("LLL")` renders as "LLL".
 *   relativeTime     .fromNow()
 *   utc              moment.utc(...) and moment().unix()
 *   duration         moment.duration(...)
 *   calendar         .calendar(null, { sameDay, nextDay, … })
 *
 * Everything else in use (.format/.add/.subtract/.diff/.unix/.isBefore/.isSame/
 * .startOf/.endOf/.isValid/.toDate) is dayjs core, and dayjs has no timezone
 * dependency (nothing here calls .tz()).
 */
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(duration);
dayjs.extend(calendar);

export default dayjs;

/**
 * The exact string `moment(x).toLocaleString()` used to render.
 *
 * That call never reached Date#toLocaleString: moment doesn't define it, so it
 * fell through to Object.prototype.toLocaleString, which calls moment's own
 * toString() — i.e. `format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")` →
 * "Mon Oct 27 2025 10:20:00 GMT+0500".
 *
 * dayjs's toString() is a UTC string instead ("Mon, 27 Oct 2025 05:20:00 GMT"),
 * so keeping the bare method would silently have changed every hover tooltip
 * *and* the persisted `steempro_snippets.created/updated` fields. This helper
 * pins the historical output byte-for-byte.
 */
export const toFullDateTime = (date: Dayjs): string =>
  date.format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
