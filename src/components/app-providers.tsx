"use client";

import { usePathname } from "next/navigation";
import { ProfileProvider } from "@/lib/profile-context";
import { LocaleProvider } from "@/lib/i18n";
import { CatSoundProvider } from "@/components/cat-sound-provider";
import { ProfileSheet } from "@/components/profile-sheet";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.includes("/admin");

  return (
    <LocaleProvider>
      <ProfileProvider>
        {!isAdmin ? (
          <CatSoundProvider>
            {children}
            <ProfileSheet />
          </CatSoundProvider>
        ) : (
          children
        )}
      </ProfileProvider>
    </LocaleProvider>
  );
}
