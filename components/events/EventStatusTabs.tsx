"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { EventStatus } from "@/types";

const tabs: { label: string; value: EventStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Upcoming", value: "UPCOMING" },
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function EventStatusTabs({ active }: { active: EventStatus | "ALL" }) {
  useSearchParams();

  return (
    <div
      className="flex items-center gap-1 rounded-full bg-[#121212] border border-[#1e293b]/60 p-1.5 w-fit"
      role="tablist"
      aria-label="Filter events by status"
    >
      {tabs.map(({ label, value }) => {
        const isActive = active === value;
        const href = value === "ALL" ? "/dashboard/events" : `/dashboard/events?status=${value.toLowerCase()}`;

        return (
          <Link
            key={value}
            href={href}
            role="tab"
            aria-selected={isActive}
            aria-label={`Filter by ${label}`}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-all duration-150",
              isActive
                ? "bg-white text-black shadow-sm"
                : "text-[#475569] hover:text-[#94a3b8] hover:bg-[#1a1a1a]"
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
