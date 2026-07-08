"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { UserProfile } from "./profile-store";
import { getProfile } from "./profile-store";
import { generateCatPersona, type CatPersona } from "./cat-username";
import { trackEvent } from "./analytics";

interface ProfileEntry {
  type: "home" | "order";
  orderId?: number;
}

interface ProfileContextValue {
  open: boolean;
  openProfile: () => void;
  openProfileOrder: (orderId: number) => void;
  closeProfile: () => void;
  user: UserProfile | null;
  persona: CatPersona;
  rollPersona: () => void;
  refreshUser: () => void;
  entry: ProfileEntry;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [persona, setPersona] = useState<CatPersona>(() => generateCatPersona());
  const [entry, setEntry] = useState<ProfileEntry>({ type: "home" });

  const rollPersona = useCallback(() => {
    setPersona(generateCatPersona());
  }, []);

  const refreshUser = useCallback(() => {
    setUser(getProfile());
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <ProfileContext.Provider
      value={{
        open,
        openProfile: () => {
          rollPersona();
          refreshUser();
          trackEvent("profile_open");
          setEntry({ type: "home" });
          setOpen(true);
        },
        openProfileOrder: (orderId: number) => {
          rollPersona();
          refreshUser();
          trackEvent("profile_open", { orderId });
          setEntry({ type: "order", orderId });
          setOpen(true);
        },
        closeProfile: () => {
          setOpen(false);
          setEntry({ type: "home" });
        },
        user,
        persona,
        rollPersona,
        refreshUser,
        entry,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
