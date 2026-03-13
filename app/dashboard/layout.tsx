import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import ReduxProvider from "@/components/layout/ReduxProvider";
import type { UserRole } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const raw = await auth.api.getSession({ headers: await headers() });

  if (!raw) redirect("/login");

  const session = {
    userId: raw.user.id,
    name: raw.user.name,
    email: raw.user.email,
    role: (raw.user as { role?: string }).role as UserRole ?? "STAFF",
    tenantId: (raw.user as { tenantId?: string }).tenantId ?? "",
  };

  return (
    <ReduxProvider session={session}>
      <Sidebar />
      <Topbar />
      <main className="lg:ml-64 mt-16 min-h-[calc(100vh-4rem)] bg-slate-50 p-6 lg:p-8">
        {children}
      </main>
    </ReduxProvider>
  );
}
