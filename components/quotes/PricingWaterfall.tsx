import type { QuoteSummary } from "@/types";

function fmt(v: string) {
  return `KES ${parseFloat(v).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Row({
  label,
  value,
  dimmed = false,
  negative = false,
}: {
  label: string;
  value: string;
  dimmed?: boolean;
  negative?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between ${dimmed ? "text-slate-400" : "text-slate-600"}`}>
      <span className="text-sm">{label}</span>
      <span className={`text-sm font-medium tabular-nums ${negative ? "text-red-500" : ""}`}>
        {negative ? `− ${value}` : value}
      </span>
    </div>
  );
}

export default function PricingWaterfall({
  summary,
  includeVat,
  globalDiscount,
}: {
  summary: QuoteSummary;
  includeVat: boolean;
  globalDiscount: string;
}) {
  const hasDiscount = parseFloat(globalDiscount) > 0;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-3">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
        Pricing Summary
      </h3>

      <Row label="Subtotal" value={fmt(summary.subtotal)} />

      {hasDiscount && (
        <>
          <Row
            label={`Global discount (${globalDiscount}%)`}
            value={fmt(summary.discountAmount)}
            negative
            dimmed
          />
          <div className="border-t border-slate-100 pt-3">
            <Row label="After discount" value={fmt(summary.discountedTotal)} />
          </div>
        </>
      )}

      {includeVat && (
        <Row label="VAT (16%)" value={fmt(summary.vatAmount)} dimmed />
      )}

      {/* Grand total */}
      <div className="border-t-2 border-slate-200 pt-3 mt-1 flex items-center justify-between">
        <span className="font-semibold text-slate-900">Grand Total</span>
        <div className="text-right">
          <span className="text-2xl font-bold text-brand tabular-nums">
            {fmt(summary.grandTotal)}
          </span>
          {includeVat && (
            <p className="text-[10px] text-slate-400 mt-0.5">VAT inclusive</p>
          )}
        </div>
      </div>
    </div>
  );
}
