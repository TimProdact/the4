import type { Metadata } from "next";
import { AdminApp } from "@/components/admin-app";

export const metadata: Metadata = {
  title: "The4 Admin Panel",
  description: "Панель управления The4",
};

export default function AdminPage() {
  return <AdminApp />;
}
