import { Badge } from "@/components/ui/badge";
import type { MovementType } from "@/types";

const config: Record<MovementType, { label: string; className: string }> = {
  DISPATCH:   { label: "Dispatch",   className: "bg-blue-100 text-blue-700 border-blue-900/60" },
  RETURN:     { label: "Return",     className: "bg-emerald-100 text-emerald-700 border-emerald-900/60" },
  REPAIR_IN:  { label: "Repair In",  className: "bg-amber-100 text-amber-700 border-amber-900/60" },
  REPAIR_OUT: { label: "Repair Out", className: "bg-teal-100 text-teal-700 border-teal-900/60" },
  LOSS:       { label: "Loss",       className: "bg-red-100 text-red-600 border-red-300" },
};

export default function MovementBadge({ type }: { type: MovementType }) {
  const c = config[type];
  return (
    <Badge variant="outline" className={c.className}>
      {c.label}
    </Badge>
  );
}
