import type { ServiceBucket } from "@/types";

function fmt(v: string) {
  return `KES ${parseFloat(v).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ServiceBucketCard({ bucket }: { bucket: ServiceBucket }) {
  const grandTotal = bucket.items.reduce((sum, i) => sum + parseFloat(i.total), 0);

  return (
    <div className="rounded-2xl bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-500">Service Bucket</h2>
        <p className="text-xs text-gray-400 mt-0.5">Items dispatched for this event</p>
      </div>

      {bucket.items.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-400">No items in service bucket.</div>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-400 text-xs uppercase tracking-wide">Item</th>
                <th className="px-4 py-3 text-right font-medium text-gray-400 text-xs uppercase tracking-wide">Qty</th>
                <th className="px-4 py-3 text-right font-medium text-gray-400 text-xs uppercase tracking-wide">Rate</th>
                <th className="px-4 py-3 text-right font-medium text-gray-400 text-xs uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bucket.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-white">{item.description}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{fmt(item.rate)}</td>
                  <td className="px-4 py-3 text-right font-medium text-white">{fmt(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50/50">
            <span className="text-sm font-medium text-gray-500">Total</span>
            <span className="font-bold text-indigo-600">{fmt(String(grandTotal))}</span>
          </div>
        </>
      )}
    </div>
  );
}
