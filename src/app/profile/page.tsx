"use client";

import { useEffect } from "react";
import { useProfile } from "@/lib/profile-context";
import { ProfileSheet } from "@/components/profile-sheet";

export default function ProfilePage() {
  const { rollPersona } = useProfile();

  useEffect(() => {
    rollPersona();
  }, [rollPersona]);

  return <ProfileSheet mode="page" />;
}
