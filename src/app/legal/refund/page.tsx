"use client";

import { LegalLayout } from "@/components/legal-layout";
import { useT } from "@/lib/i18n";

export default function RefundPage() {
  const { t } = useT();

  return (
    <LegalLayout title={t("legal.refund.title")}>
      <p>{t("legal.refund.p1")}</p>
      <p>{t("legal.refund.p2")}</p>
      <p>{t("legal.refund.p3")}</p>
    </LegalLayout>
  );
}
