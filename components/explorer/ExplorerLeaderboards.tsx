import Link from "@/components/ui/CustomLink";
import type {
  AccountRow,
  CommunityRow,
  MissedBlockRow,
  WitnessRow,
} from "@/utils/explorerStats";
import { asset, compact, timeAgo } from "./format";

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-default-200/70 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-bold">{title}</h3>
        {subtitle ? (
          <p className="text-[11px] text-default-400 mt-0.5">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

const th =
  "text-[10px] uppercase tracking-wider text-default-400 font-semibold text-left py-1.5";
const td = "py-2 text-xs border-t border-default-100 dark:border-default-100/30";

/**
 * Explorer leaderboards: witnesses, stakeholders, liquid balances,
 * most-followed accounts, newest accounts and communities (all rows
 * deep-link to detail pages). Fed by the Leaderboards tab's section fetch.
 */
export default function ExplorerLeaderboards({
  witnesses,
  missed,
  topBalances,
  stakeholders,
  followed,
  newest,
  communities,
}: {
  witnesses: WitnessRow[];
  missed: MissedBlockRow[];
  topBalances: AccountRow[];
  stakeholders: AccountRow[];
  followed: AccountRow[];
  newest: AccountRow[];
  communities: CommunityRow[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Witnesses */}
      <Card
        title="Top witnesses"
        subtitle="Ranked by received votes"
      >
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full min-w-[420px]">
            <thead>
              <tr>
                <th className={th}>#</th>
                <th className={th}>Witness</th>
                <th className={`${th} text-right`}>Votes</th>
                <th className={`${th} text-right`}>Produced</th>
                <th className={`${th} text-right`}>Missed</th>
              </tr>
            </thead>
            <tbody>
              {witnesses.map((w) => (
                <tr key={w.name}>
                  <td className={`${td} font-mono text-default-400`}>
                    {w.rank}
                  </td>
                  <td className={td}>
                    <Link
                      href={`/@${w.name}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {w.name}
                    </Link>
                  </td>
                  <td className={`${td} text-right font-mono`}>
                    {compact(w.received_votes)}
                  </td>
                  <td className={`${td} text-right font-mono`}>
                    {compact(w.produced_blocks)}
                  </td>
                  <td
                    className={`${td} text-right font-mono ${
                      w.missed_blocks > 100 ? "text-danger" : ""
                    }`}
                  >
                    {w.missed_blocks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {missed.length > 0 ? (
          <div className="mt-3 pt-3 border-t border-default-100 dark:border-default-100/30">
            <p className="text-[10px] uppercase tracking-wider text-default-400 font-semibold mb-1.5">
              Recently missed blocks
            </p>
            <ul className="space-y-1">
              {missed.map((m, i) => (
                <li
                  key={`${m.witness}-${m.time}-${i}`}
                  className="flex items-center justify-between text-[11px]"
                >
                  <Link
                    href={`/@${m.witness}`}
                    className="font-semibold text-primary hover:underline truncate"
                  >
                    {m.witness}
                  </Link>
                  <span className="text-default-400 font-mono shrink-0 ml-3">
                    {timeAgo(m.time)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>

      {/* Top stakeholders */}
      <Card
        title="Top stakeholders"
        subtitle="Ranked by total staked VESTS (SP power)"
      >
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full min-w-[420px]">
            <thead>
              <tr>
                <th className={th}>#</th>
                <th className={th}>Account</th>
                <th className={`${th} text-right`}>VESTS</th>
                <th className={`${th} text-right`}>Liquid STEEM</th>
                <th className={`${th} text-right`}>Liquid SBD</th>
              </tr>
            </thead>
            <tbody>
              {stakeholders.map((a, i) => (
                <tr key={a.name}>
                  <td className={`${td} font-mono text-default-400`}>{i + 1}</td>
                  <td className={td}>
                    <Link
                      href={`/explorer/account/${a.name}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {a.name}
                    </Link>
                  </td>
                  <td className={`${td} text-right font-mono font-bold`}>
                    {compact(asset(a.vests_own))}
                  </td>
                  <td className={`${td} text-right font-mono`}>
                    {asset(a.balance_steem).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className={`${td} text-right font-mono text-default-400`}>
                    {asset(a.balance_sbd).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Richest accounts */}
      <Card title="Highest STEEM balances" subtitle="Liquid STEEM only">
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full min-w-[420px]">
            <thead>
              <tr>
                <th className={th}>#</th>
                <th className={th}>Account</th>
                <th className={`${th} text-right`}>STEEM</th>
                <th className={`${th} text-right`}>SBD</th>
                <th className={`${th} text-right`}>VESTS</th>
              </tr>
            </thead>
            <tbody>
              {topBalances.map((a, i) => (
                <tr key={a.name}>
                  <td className={`${td} font-mono text-default-400`}>{i + 1}</td>
                  <td className={td}>
                    <Link
                      href={`/explorer/account/${a.name}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {a.name}
                    </Link>
                  </td>
                  <td className={`${td} text-right font-mono font-bold`}>
                    {asset(a.balance_steem).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className={`${td} text-right font-mono`}>
                    {asset(a.balance_sbd).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className={`${td} text-right font-mono text-default-400`}>
                    {compact(asset(a.vests_own))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Most followed accounts */}
      <Card title="Most followed accounts" subtitle="Ranked by follower count">
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full min-w-[420px]">
            <thead>
              <tr>
                <th className={th}>#</th>
                <th className={th}>Account</th>
                <th className={`${th} text-right`}>Followers</th>
                <th className={`${th} text-right`}>Following</th>
              </tr>
            </thead>
            <tbody>
              {followed.map((a, i) => (
                <tr key={a.name}>
                  <td className={`${td} font-mono text-default-400`}>{i + 1}</td>
                  <td className={td}>
                    <Link
                      href={`/@${a.name}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {a.name}
                    </Link>
                  </td>
                  <td className={`${td} text-right font-mono font-bold`}>
                    {compact(a.count_followers ?? 0)}
                  </td>
                  <td className={`${td} text-right font-mono text-default-400`}>
                    {compact(a.count_following ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Newest accounts */}
      <Card title="Newest accounts" subtitle="Most recent registrations">
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full min-w-[420px]">
            <thead>
              <tr>
                <th className={th}>Account</th>
                <th className={th}>Created by</th>
                <th className={`${th} text-right`}>When</th>
              </tr>
            </thead>
            <tbody>
              {newest.map((a) => (
                <tr key={a.name}>
                  <td className={td}>
                    <Link
                      href={`/explorer/account/${a.name}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {a.name}
                    </Link>
                  </td>
                  <td className={`${td} text-default-500 dark:text-default-400`}>
                    {a.creator ? `@${a.creator}` : "—"}
                  </td>
                  <td className={`${td} text-right font-mono text-default-400`}>
                    {a.created ? timeAgo(a.created) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Communities */}
      <Card
        title="Top communities"
        subtitle="By number of active posts"
      >
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full min-w-[420px]">
            <thead>
              <tr>
                <th className={th}>Community</th>
                <th className={`${th} text-right`}>Authors</th>
                <th className={`${th} text-right`}>Members</th>
                <th className={`${th} text-right`}>Pending</th>
              </tr>
            </thead>
            <tbody>
              {communities.map((c) => (
                <tr key={c.account}>
                  <td className={td}>
                    <Link
                      href={`/trending/${c.account}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {c.title || c.account}
                    </Link>
                    <span className="block text-[10px] text-default-400 font-mono truncate">
                      {c.account}
                    </span>
                  </td>
                  <td className={`${td} text-right font-mono`}>
                    {c.count_authors ?? "—"}
                  </td>
                  <td className={`${td} text-right font-mono`}>
                    {c.count_subs ?? "—"}
                  </td>
                  <td className={`${td} text-right font-mono`}>
                    {c.sum_pending ? compact(c.sum_pending) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
