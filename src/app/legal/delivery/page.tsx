"use client";

import { LegalLayout } from "@/components/legal-layout";
import { useT } from "@/lib/i18n";

export default function DeliveryPage() {
  const { t } = useT();

  return (
    <LegalLayout title={t("legal.delivery.title")}>
      <p>{t("legal.delivery.p1")}</p>
      <p>{t("legal.delivery.p2")}</p>
      <p>{t("legal.delivery.p3")}</p>
    </LegalLayout>
  );
}
