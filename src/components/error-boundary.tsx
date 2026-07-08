"use client";

import { Component, type ReactNode } from "react";
import { t } from "@/lib/i18n/messages";
import { getStoredLocale } from "@/lib/i18n/locale-storage";
import { getProfile } from "@/lib/profile-store";
import type { Locale } from "@/lib/i18n/types";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

function currentLocale(): Locale {
  return getProfile()?.locale ?? getStoredLocale() ?? "ru";
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[var(--muted)]">
            {t(currentLocale(), "errors.loadBlock")}
          </div>
        )
      );
    }
    return this.props.children;
  }
}
