import { VitrinaApp } from "@/components/vitrina-app";
import { getDefaultPublicSnapshot } from "@/lib/client-store";

export default function Page() {
  const initial = getDefaultPublicSnapshot();

  return <VitrinaApp initial={initial} />;
}
