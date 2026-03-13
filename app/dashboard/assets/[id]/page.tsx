import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Package,
  MapPin,
  Hammer,
  Layers,
  Tag,
  Truck,
  RotateCcw,
  Wrench,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { Asset, MovementType } from "@/types";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";

async function getAsset(id: string): Promise<Asset | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  const token = session?.session.token;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE}/assets/${id}`, {
    headers: authHeader,
    next: { tags: ["assets"] },
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

// ─── movement config ──────────────────────────────────────────────────────────

const MOVEMENT_CONFIG: Record<
  MovementType,
  { label: string; icon: React.ElementType; accent: string; bg: string }
> = {
  DISPATCH: { label: "Dispatch", icon: Truck, accent: "text-brand", bg: "bg-brand/10" },
  RETURN: { label: "Return", icon: RotateCcw, accent: "text-emerald-600", bg: "bg-emerald-50" },
  REPAIR_IN: { label: "Repair In", icon: Wrench, accent: "text-amber-600", bg: "bg-amber-50" },
  REPAIR_OUT: { label: "Repaired", icon: CheckCircle2, accent: "text-teal-600", bg: "bg-teal-50" },
  LOSS: { label: "Loss", icon: AlertTriangle, accent: "text-red-600", bg: "bg-red-50" },
};

// ─── lifecycle bar ────────────────────────────────────────────────────────────

function LifecycleBar({ asset }: { asset: Asset }) {
  const { totalStock: total, unitsAvailable: avail, unitsOnSite: onSite, unitsInRepair: inRepair } = asset;
  if (total === 0) return null;
  const lost = Math.max(0, total - avail - onSite - inRepair);
  const pct = (n: number) => `${Math.max(0, Math.round((n / total) * 100))}%`;

  return (
    <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 gap-px">
      {avail > 0 && <div className="bg-emerald-400" style={{ width: pct(avail) }} />}
      {onSite > 0 && <div className="bg-brand" style={{ width: pct(onSite) }} />}
      {inRepair > 0 && <div className="bg-amber-400" style={{ width: pct(inRepair) }} />}
      {lost > 0 && <div className="bg-red-400" style={{ width: pct(lost) }} />}
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) notFound();

  const categoryLabel = asset.category.parent
    ? `${asset.category.parent.name} › ${asset.category.name}`
    : asset.category.name;

  const lost = Math.max(
    0,
    asset.totalStock - asset.unitsAvailable - asset.unitsOnSite - asset.unitsInRepair
  );

  const coverImage = asset.images[0]?.imageUrl ?? null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/assets"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Asset Inventory
      </Link>

      {/* Hero header card */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="relative h-52 bg-linear-to-br from-brand to-brand-dark">
          {coverImage && (
            <img
              src={coverImage}
              alt={asset.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/65 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
              <Layers className="h-3 w-3" />
              {categoryLabel}
            </span>
            {asset.sku && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-mono text-white">
                <Tag className="h-3 w-3" />
                {asset.sku}
              </span>
            )}
          </div>

          {/* Name + rate */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <h1 className="font-serif text-2xl font-bold text-white leading-tight drop-shadow">
              {asset.name}
            </h1>
            <div className="text-right shrink-0 ml-4">
              <p className="text-xl font-bold text-white">KES {asset.baseRentalRate.toLocaleString()}</p>
              <p className="text-xs text-white/60">per day</p>
            </div>
          </div>
        </div>

        {/* Additional image strip */}
        {asset.images.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-slate-100">
            {asset.images.map((img) => (
              <img
                key={img.id}
                src={img.imageUrl}
                alt=""
                className="h-16 w-16 rounded-xl object-cover shrink-0 border border-slate-200"
              />
            ))}
          </div>
        )}

        {/* Inventory status */}
        <div className="px-6 py-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Inventory Status
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Total", value: asset.totalStock, icon: Package, color: "text-slate-700", bg: "bg-slate-50" },
              { label: "Available", value: asset.unitsAvailable, icon: Package, color: "text-emerald-700", bg: "bg-emerald-50" },
              { label: "On-Site", value: asset.unitsOnSite, icon: MapPin, color: "text-brand", bg: "bg-brand/8" },
              { label: "In-Repair", value: asset.unitsInRepair, icon: Hammer, color: "text-amber-700", bg: "bg-amber-50" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`rounded-xl ${bg} px-4 py-3 flex items-center gap-3`}>
                <Icon className={`h-4 w-4 ${color} shrink-0`} />
                <div>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <LifecycleBar asset={asset} />
          <div className="flex flex-wrap gap-4 mt-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand inline-block" /> On-Site
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" /> In-Repair
            </span>
            {lost > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400 inline-block" /> Lost ({lost})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      {asset.metadata && Object.keys(asset.metadata).length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm px-6 py-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Metadata
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(asset.metadata).map(([key, val]) => (
              <div key={key} className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{key}</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{String(val)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Movement history */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Movement History
          </p>
          {asset.stockMovements && (
            <span className="text-xs text-slate-400">{asset.stockMovements.length} events</span>
          )}
        </div>

        {!asset.stockMovements || asset.stockMovements.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center">
              <Package className="h-6 w-6 text-slate-300" />
            </div>
            <p className="font-serif italic text-sm text-slate-400">No movements recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {asset.stockMovements.map((m) => {
              const cfg = MOVEMENT_CONFIG[m.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={m.id}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className={`h-9 w-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`h-4 w-4 ${cfg.accent}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${cfg.accent}`}>{cfg.label}</span>
                      <span className="text-sm text-slate-500">
                        ×{m.quantity} unit{m.quantity !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {m.notes && (
                      <p className="text-sm text-slate-400 mt-0.5">{m.notes}</p>
                    )}
                    {m.images.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {m.images.map((img) => (
                          <img
                            key={img.id}
                            src={img.imageUrl}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <time className="text-xs text-slate-400 shrink-0 mt-1">
                    {new Date(m.createdAt).toLocaleDateString("en-KE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
