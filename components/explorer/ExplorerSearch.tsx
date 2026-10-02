"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useTranslations } from "next-intl";

const BLOCK_RE = /^\d+$/;
const TX_RE = /^[0-9a-f]{40}$/i;
const ACCOUNT_RE = /^[a-z][a-z0-9.-]{2,15}$/;

/**
 * Unified explorer lookup: one input that sniffs what the user pasted and
 * routes to the right detail page (block number / trx id / @account / post
 * URL / community / plain search term).
 */
export default function ExplorerSearch() {
  const t = useTranslations("Explorer");
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;

    // Block number
    if (BLOCK_RE.test(q)) {
      router.push(`/explorer/block/${q}`);
      return;
    }

    // Transaction id (40 hex chars)
    if (TX_RE.test(q)) {
      router.push(`/explorer/transaction/${q.toLowerCase()}`);
      return;
    }

    // Full post URL or path: /@author/permlink
    const pathMatch = q.match(/\/(@[\w.-]+)\/(.+?)(?:\?.*)?$/);
    if (pathMatch) {
      const author = pathMatch[1].replace(/^@/, "");
      const permlink = pathMatch[2].replace(/\/+$/, "");
      if (permlink) {
        router.push(`/post/${author}/${permlink}`);
        return;
      }
    }

    // @account
    if (q.startsWith("@")) {
      const account = q.slice(1).toLowerCase();
      if (ACCOUNT_RE.test(account)) {
        router.push(`/explorer/account/${account}`);
        return;
      }
    }

    // Bare account name
    if (ACCOUNT_RE.test(q)) {
      router.push(`/explorer/account/${q.toLowerCase()}`);
      return;
    }

    // Fallback: hand the term to the account lookup tab (prefilled)
    router.push(
      `/explorer?tab=lookup&sub=accounts&q=${encodeURIComponent(q)}`,
    );
  };

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          aria-label={t("search.placeholder")}
          startContent={<Search size={16} className="text-default-400" />}
          classNames={{
            base: "w-full",
            inputWrapper:
              "bg-white/70 dark:bg-content1/40 border-default-200 h-11",
          }}
          size="lg"
        />
        <Button
          type="submit"
          color="primary"
          className="h-11 font-semibold sm:min-w-28"
          startContent={<Search size={16} />}
        >
          {t("search.submit")}
        </Button>
      </div>
      <p className="text-[11px] text-default-400 mt-1.5 px-1">
        {t("search.hint")}
      </p>
    </form>
  );
}
