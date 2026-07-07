import { DropApp } from "@/components/drop-app";
import { getDefaultPublicSnapshot } from "@/lib/client-store";

export default function Page() {
  const initial = getDefaultPublicSnapshot();

  return <DropApp initial={initial} />;
}
