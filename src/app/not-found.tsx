"use client";

import Link from "next/link";
import { asset } from "@/lib/asset";
import { useT } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useT();

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--bg)] px-6 text-center text-[var(--fg)]">
      <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">{t("notFound.label")}</p>
      <h1 className="mt-4 text-2xl font-semibold">{t("notFound.title")}</h1>
      <p className="mt-3 max-w-sm text-sm text-[var(--muted)]">{t("notFound.body")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={asset("/")}
          className="bg-[var(--btn)] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--btn-text)]"
        >
          {t("notFound.toDrop")}
        </Link>
        <Link
          href={asset("/demo")}
          className="border border-[var(--fg)]/15 px-6 py-3 text-xs uppercase tracking-widest"
        >
          {t("common.demo")}
        </Link>
      </div>
    </main>
  );
}
