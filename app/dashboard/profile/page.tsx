import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileClient from "@/components/profile/ProfileClient";
import type { User, UserRole } from "@/types";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";

async function getProfile(): Promise<{ user: User; role: UserRole; userId: string }> {
  const raw = await auth.api.getSession({ headers: await headers() });
  if (!raw?.session.token) redirect("/login");

  const token = raw.session.token;
  const userId = raw.user.id;
  const role = ((raw.user as { role?: string })?.role ?? "STAFF") as UserRole;

  const res = await fetch(`${API_BASE}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { tags: ["users"] },
  });

  if (!res.ok) redirect("/dashboard");

  const user: User = await res.json();
  return { user, role, userId };
}

async function ProfileSection() {
  const { user, role, userId } = await getProfile();
  return <ProfileClient user={user} role={role} currentUserId={userId} />;
}

function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Hero */}
      <div className="rounded-3xl bg-slate-100 p-8">
        <div className="flex items-start gap-4">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
      {/* Form cards */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-slate-900 leading-tight">Profile</h1>
        <p className="font-serif italic text-slate-400 mt-1">Manage your account details and password.</p>
      </div>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileSection />
      </Suspense>
    </div>
  );
}
