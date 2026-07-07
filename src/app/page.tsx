import { Suspense } from "react";
import { DropApp } from "@/components/drop-app";
import { getDefaultPublicSnapshot } from "@/lib/client-store";

export default function Page() {
  const initial = getDefaultPublicSnapshot();

  return (
    <Suspense fallback={null}>
      <DropApp initial={initial} />
    </Suspense>
  );
}
