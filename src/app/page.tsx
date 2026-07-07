import { Suspense } from "react";
import { DropApp } from "@/components/drop-app";
import { getPublicSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function Page() {
  const initial = getPublicSnapshot();

  return (
    <Suspense fallback={null}>
      <DropApp initial={initial} />
    </Suspense>
  );
}
