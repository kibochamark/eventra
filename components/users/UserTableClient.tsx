"use client";

import { useState, useMemo } from "react";
import { Users2, AlertCircle, Search, Plus, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { openUserDrawer } from "@/lib/store/slices/uiSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CreateUserDialog from "@/components/users/CreateUserDialog";
import UserDrawer from "@/components/users/UserDrawer";
import type { User } from "@/types";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type RoleFilter = "ALL" | "ADMIN" | "STAFF";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export default function UserTableClient({ users }: { users: User[] }) {
  const dispatch = useAppDispatch();
  const sessionRole = useAppSelector((s) => s.session.role);

  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => !u.banned).length,
    inactive: users.filter((u) => u.banned).length,
    admins: users.filter((u) => u.role === "ADMIN").length,
  }), [users]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter === "ADMIN" && u.role !== "ADMIN") return false;
      if (roleFilter === "STAFF" && u.role !== "STAFF") return false;
      if (statusFilter === "ACTIVE" && u.banned) return false;
      if (statusFilter === "INACTIVE" && !u.banned) return false;
      if (search) {
        const q = search.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, search]);

  const statCards = [
    { label: "Total", value: stats.total },
    { label: "Active", value: stats.active },
    { label: "Inactive", value: stats.inactive },
    { label: "Admins", value: stats.admins },
  ];

  const rolePills: { label: string; value: RoleFilter }[] = [
    { label: "All", value: "ALL" },
    { label: "Admin", value: "ADMIN" },
    { label: "Staff", value: "STAFF" },
  ];

  const statusPills: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "ALL" },
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
  ];

  return (
    <>
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-slate-200 p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{s.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        {/* Controls */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Role pills */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
              {rolePills.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setRoleFilter(p.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    roleFilter === p.value
                      ? "bg-brand text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {/* Status pills */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
              {statusPills.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setStatusFilter(p.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    statusFilter === p.value
                      ? "bg-brand text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-8 h-8 w-44 text-sm rounded-full border-slate-200 bg-slate-50 focus-visible:ring-brand/30"
              />
            </div>
            {sessionRole === "ADMIN" && (
              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="rounded-full bg-linear-to-r from-brand to-brand-dark text-white hover:opacity-90 gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                New User
              </Button>
            )}
          </div>
        </div>

        {/* Desktop table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-brand/8 flex items-center justify-center mb-4">
              <Users2 className="h-7 w-7 text-brand" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">No team members found</h3>
            <p className="text-sm text-slate-400 mb-5">
              {search || roleFilter !== "ALL" || statusFilter !== "ALL"
                ? "Try adjusting your filters."
                : "Create the first team member to get started."}
            </p>
            {sessionRole === "ADMIN" && !search && roleFilter === "ALL" && statusFilter === "ALL" && (
              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="rounded-full bg-linear-to-r from-brand to-brand-dark text-white hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New User
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Member
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Email
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Role
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Joined
                    </th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => dispatch(openUserDrawer(user.id))}
                      className="group cursor-pointer hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-linear-to-br from-brand/20 to-brand/40 flex items-center justify-center text-brand font-semibold text-sm shrink-0">
                            {getInitials(user.name)}
                          </div>
                          <span className="font-medium text-slate-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          {user.email}
                          {!user.emailVerified && (
                            <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                            user.role === "ADMIN"
                              ? "bg-brand/10 text-brand border-brand/20"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {user.role === "ADMIN" ? "Admin" : "Staff"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                            user.banned
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          <span
                            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                              user.banned ? "bg-red-500" : "bg-emerald-500"
                            }`}
                          />
                          {user.banned ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-3 py-4">
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-slate-100">
              {filtered.map((user) => (
                <button
                  key={user.id}
                  onClick={() => dispatch(openUserDrawer(user.id))}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-brand/20 to-brand/40 flex items-center justify-center text-brand font-semibold text-sm shrink-0">
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-slate-900 truncate">{user.name}</span>
                      {!user.emailVerified && (
                        <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                        user.role === "ADMIN"
                          ? "bg-brand/10 text-brand border-brand/20"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {user.role === "ADMIN" ? "Admin" : "Staff"}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                        user.banned
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {user.banned ? "Inactive" : "Active"}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <CreateUserDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <UserDrawer users={users} />
    </>
  );
}
