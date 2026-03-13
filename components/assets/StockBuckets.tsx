import type { Asset } from "@/types";

export default function StockBuckets({ asset }: { asset: Pick<Asset, "unitsAvailable" | "unitsOnSite" | "unitsInRepair" | "totalStock"> }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="font-medium text-white">{asset.unitsAvailable}</span>
        <span className="text-gray-400 text-xs">avail</span>
      </span>
      <span className="text-[#1e293b]">|</span>
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        <span className="font-medium text-white">{asset.unitsOnSite}</span>
        <span className="text-gray-400 text-xs">on-site</span>
      </span>
      <span className="text-[#1e293b]">|</span>
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        <span className="font-medium text-white">{asset.unitsInRepair}</span>
        <span className="text-gray-400 text-xs">repair</span>
      </span>
    </div>
  );
}
