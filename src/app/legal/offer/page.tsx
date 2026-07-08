"use client";

import { LegalLayout } from "@/components/legal-layout";
import { useT } from "@/lib/i18n";

export default function OfferPage() {
  const { t } = useT();

  return (
    <LegalLayout title={t("legal.offer.title")}>
      <p>{t("legal.offer.p1")}</p>
      <p>{t("legal.offer.p2")}</p>
      <p>{t("legal.offer.p3")}</p>
      <p>{t("legal.offer.p4")}</p>
      <p>{t("legal.offer.p5")}</p>
    </LegalLayout>
  );
}
