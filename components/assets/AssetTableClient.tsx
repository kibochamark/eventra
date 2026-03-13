"use client";

import { useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { openStockMovementSheet, setAddAssetDialog } from "@/lib/store/slices/uiSlice";
import { deleteAsset } from "@/actions/assets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AddAssetDialog from "./AddAssetDialog";
import StockMovementSheet from "./StockMovementSheet";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Layers,
  ArrowRightLeft,
  Trash2,
  Package,
  Hammer,
  MapPin,
  ChevronRight,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import type { Asset, Category } from "@/types";

// ─── helpers ────────────────────────────────────────────────────────────────

const GRADIENT_PALETTE = [
  "from-brand to-brand-dark",
  "from-emerald-400 to-teal-600",
  "from-violet-400 to-purple-700",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-pink-700",
  "from-sky-400 to-cyan-600",
];

function gradientFor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return GRADIENT_PALETTE[sum % GRADIENT_PALETTE.length];
}

function formatRate(rate: number) {
  return `KES ${rate.toLocaleString()}`;
}

function flattenCategoryOptions(cats: Category[]) {
  const opts: { id: string; label: string }[] = [{ id: "__all__", label: "All categories" }];
  for (const cat of cats) {
    opts.push({ id: cat.id, label: cat.name });
    for (const sub of cat.subCategories) {
      opts.push({ id: sub.id, label: `${cat.name} › ${sub.name}` });
    }
  }
  return opts;
}

// ─── lifecycle bar ───────────────────────────────────────────────────────────

function LifecycleBar({ asset }: { asset: Asset }) {
  const { totalStock: total, unitsAvailable: avail, unitsOnSite: onSite, unitsInRepair: inRepair } = asset;
  if (total === 0) return <div className="h-1.5 rounded-full bg-slate-100" />;

  const lost = Math.max(0, total - avail - onSite - inRepair);
  const pct = (n: number) => `${Math.max(0, Math.round((n / total) * 100))}%`;

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 gap-px cursor-default">
          {avail > 0 && (
            <div className="bg-emerald-400 transition-all" style={{ width: pct(avail) }} />
          )}
          {onSite > 0 && (
            <div className="bg-brand transition-all" style={{ width: pct(onSite) }} />
          )}
          {inRepair > 0 && (
            <div className="bg-amber-400 transition-all" style={{ width: pct(inRepair) }} />
          )}
          {lost > 0 && (
            <div className="bg-red-400 transition-all" style={{ width: pct(lost) }} />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs space-y-0.5">
        <p><span className="text-emerald-500 font-medium">●</span> {avail} available</p>
        <p><span className="text-brand font-medium">●</span> {onSite} on-site</p>
        <p><span className="text-amber-500 font-medium">●</span> {inRepair} in-repair</p>
        {lost > 0 && <p><span className="text-red-500 font-medium">●</span> {lost} lost</p>}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── asset card ─────────────────────────────────────────────────────────────

function AssetCard({
  asset,
  onMove,
  onDelete,
  isAdmin,
}: {
  asset: Asset;
  onMove: () => void;
  onDelete: () => void;
  isAdmin: boolean;
}) {
  const [deleting, setDeleting] = useState(false);
  const cover = asset.images[0]?.imageUrl ?? null;
  const categoryLabel = asset.category.parent
    ? `${asset.category.parent.name} › ${asset.category.name}`
    : asset.category.name;

  const isOutOfStock = asset.unitsAvailable === 0;
  const hasRepair = asset.unitsInRepair > 0;

  async function handleDelete() {
    if (!confirm(`Delete "${asset.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-brand/20 transition-all duration-200 overflow-hidden">
      {/* Top: image or gradient avatar */}
      <div className="relative h-36 shrink-0 overflow-hidden">
        {cover ? (
          <img src={cover} alt={asset.name} className="w-full h-full object-cover" />
        ) : (
          <div
            className={`w-full h-full bg-linear-to-br ${gradientFor(asset.name)} flex items-center justify-center`}
          >
            <span className="text-white/90 text-3xl font-bold select-none">
              {asset.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Category badge overlay */}
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/35 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white">
            <Layers className="h-2.5 w-2.5" />
            {categoryLabel}
          </span>
        </div>

        {/* Status badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
          {isOutOfStock && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white">
              <AlertCircle className="h-2.5 w-2.5" />
              Out of stock
            </span>
          )}
          {hasRepair && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white">
              <Hammer className="h-2.5 w-2.5" />
              In repair
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Name + SKU */}
        <div>
          <Link
            href={`/dashboard/assets/${asset.id}`}
            className="font-semibold text-slate-900 hover:text-brand transition-colors line-clamp-1 flex items-center gap-1 group/link"
          >
            {asset.name}
            <ChevronRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-brand" />
          </Link>
          {asset.sku && (
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">{asset.sku}</p>
          )}
        </div>

        {/* Lifecycle bar */}
        <LifecycleBar asset={asset} />

        {/* Stock bucket pills */}
        <div className="flex flex-wrap gap-1.5 text-[11px] font-medium">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 border border-emerald-100">
            <Package className="h-3 w-3" />
            {asset.unitsAvailable} avail
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand/8 text-brand px-2 py-0.5 border border-brand/15">
            <MapPin className="h-3 w-3" />
            {asset.unitsOnSite} on-site
          </span>
          {asset.unitsInRepair > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 border border-amber-100">
              <Hammer className="h-3 w-3" />
              {asset.unitsInRepair} repair
            </span>
          )}
        </div>

        {/* Footer: rate + actions */}
        <div className="flex items-center justify-between pt-0.5 mt-auto">
          <div>
            <p className="text-sm font-bold text-slate-900">{formatRate(asset.baseRentalRate)}</p>
            <p className="text-[10px] text-slate-400">per day · {asset.totalStock} total</p>
          </div>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              onClick={onMove}
              className="h-8 rounded-full bg-linear-to-r from-brand to-brand-dark text-white text-xs gap-1 shadow-sm shadow-brand/25 hover:opacity-90"
            >
              <ArrowRightLeft className="h-3 w-3" />
              Move
            </Button>
            {isAdmin && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={deleting}
                className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── main client ─────────────────────────────────────────────────────────────

export default function AssetTableClient({
  assets,
  categories,
}: {
  assets: Asset[];
  categories: Category[];
}) {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.session.role);
  const isAdmin = role === "ADMIN";

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("__all__");

  const categoryOptions = useMemo(() => flattenCategoryOptions(categories), [categories]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return assets.filter((a) => {
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        (a.sku?.toLowerCase().includes(q) ?? false);
      const matchesCat =
        categoryFilter === "__all__" ||
        a.category.id === categoryFilter ||
        a.category.parent?.id === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [assets, search, categoryFilter]);

  // Aggregate stats
  const stats = useMemo(
    () => ({
      total: assets.length,
      available: assets.reduce((s, a) => s + a.unitsAvailable, 0),
      onSite: assets.reduce((s, a) => s + a.unitsOnSite, 0),
      inRepair: assets.reduce((s, a) => s + a.unitsInRepair, 0),
    }),
    [assets]
  );

  async function handleDelete(id: string) {
    try {
      await deleteAsset(id);
      toast.success("Asset deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete asset");
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Assets",
            value: stats.total,
            icon: Package,
            color: "text-slate-700",
            bg: "bg-slate-50",
            border: "border-slate-200",
          },
          {
            label: "Available",
            value: stats.available,
            icon: Package,
            color: "text-emerald-700",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
          },
          {
            label: "On-Site",
            value: stats.onSite,
            icon: MapPin,
            color: "text-brand",
            bg: "bg-brand/5",
            border: "border-brand/15",
          },
          {
            label: "In-Repair",
            value: stats.inRepair,
            icon: Hammer,
            color: "text-amber-700",
            bg: "bg-amber-50",
            border: "border-amber-100",
          },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className={`rounded-2xl bg-white border ${border} p-5 shadow-sm flex items-center gap-3`}
          >
            <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search by name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
          />
        </div>

        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "__all__")}>
          <SelectTrigger className="w-44 h-10 rounded-xl border-slate-200 text-sm">
            <span className="flex-1 text-left truncate">
              {categoryOptions.find((o) => o.id === categoryFilter)?.label ?? "All categories"}
            </span>
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <p className="text-sm text-slate-400 hidden sm:block">
            {filtered.length} of {assets.length} assets
          </p>
          {isAdmin && (
            <Button
              onClick={() => dispatch(setAddAssetDialog(true))}
              className="h-10 rounded-full bg-linear-to-r from-brand to-brand-dark text-white font-semibold shadow-sm shadow-brand/25 hover:opacity-90 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm py-20 flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-brand/8 flex items-center justify-center">
            <Package className="h-8 w-8 text-brand/60" />
          </div>
          <div>
            <p className="font-semibold text-slate-700">
              {assets.length === 0 ? "No assets yet" : "No assets match your filters"}
            </p>
            <p className="font-serif italic text-sm text-slate-400 mt-1">
              {assets.length === 0
                ? "Add your first asset to start tracking your inventory."
                : "Try adjusting your search or category filter."}
            </p>
          </div>
          {assets.length === 0 && isAdmin && (
            <Button
              onClick={() => dispatch(setAddAssetDialog(true))}
              className="mt-2 rounded-full bg-linear-to-r from-brand to-brand-dark text-white font-semibold shadow-sm shadow-brand/25 hover:opacity-90 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add your first asset
            </Button>
          )}
        </div>
      )}

      {/* Asset grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              isAdmin={isAdmin}
              onMove={() => dispatch(openStockMovementSheet(asset.id))}
              onDelete={() => handleDelete(asset.id)}
            />
          ))}
        </div>
      )}

      {/* Dialogs — co-located so they have access to assets + categories */}
      <AddAssetDialog categories={categories} />
      <StockMovementSheet assets={assets} />
    </div>
  );
}
