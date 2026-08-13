import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { getStaffSession } from "@/lib/staffAuth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: `Staff Sign In — ${siteConfig.serverName}`,
  robots: { index: false },
};

export default async function AdminLoginPage() {
  // Real (DB-backed) check: only skip the form if this session actually
  // belongs to a staff_members row. A signed-in-but-not-staff user must
  // still land here — see src/proxy.ts for why that distinction matters.
  const session = await getStaffSession();
  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-16 sm:px-6">
      <div className="card-elevated w-full max-w-sm p-8">
        <h1 className="text-xl font-bold text-[var(--color-text)]">Staff Sign In</h1>
        <p className="field-hint mb-6">
          {siteConfig.serverName} moderator application dashboard.
        </p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
