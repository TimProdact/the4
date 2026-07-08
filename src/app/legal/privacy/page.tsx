"use client";

import { LegalLayout } from "@/components/legal-layout";
import { useT } from "@/lib/i18n";

export default function PrivacyPage() {
  const { t } = useT();

  return (
    <LegalLayout title={t("legal.privacy.title")}>
      <p>{t("legal.privacy.p1")}</p>
      <p>{t("legal.privacy.p2")}</p>
      <p>{t("legal.privacy.p3")}</p>
    </LegalLayout>
  );
}
