import type { QuoteStatus } from "@/types";

const styles: Record<QuoteStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  INVOICED: "bg-brand/10 text-brand",
  CANCELLED: "bg-red-100 text-red-600",
};

const labels: Record<QuoteStatus, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  INVOICED: "Invoiced",
  CANCELLED: "Cancelled",
};

export default function QuoteStatusBadge({
  status,
  size = "sm",
}: {
  status: QuoteStatus;
  size?: "sm" | "lg";
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${styles[status]} ${
        size === "lg" ? "px-3.5 py-1 text-sm" : "px-2.5 py-0.5 text-xs"
      }`}
    >
      {labels[status]}
    </span>
  );
}
