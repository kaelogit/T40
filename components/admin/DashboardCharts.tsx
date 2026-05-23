import { formatPrice } from "@/lib/products/pricing";
import type { DailyStat } from "@/lib/admin/stats";

function BarChart({
  title,
  data,
  valueKey,
  formatValue,
}: {
  title: string;
  data: DailyStat[];
  valueKey: "revenue" | "orders";
  formatValue: (n: number) => string;
}) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <div className="border border-neutral-200 bg-white p-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-6">{title}</p>
      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((d) => {
          const value = d[valueKey];
          const height = max > 0 ? Math.max(4, (value / max) * 100) : 4;
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <span className="text-[9px] font-bold text-neutral-600 tabular-nums truncate w-full text-center">
                {valueKey === "revenue" && value > 0 ? formatValue(value) : value > 0 ? value : ""}
              </span>
              <div className="w-full flex items-end justify-center h-28">
                <div
                  className={`w-full max-w-10 transition-all ${valueKey === "revenue" ? "bg-[#d94625]" : "bg-black"}`}
                  style={{ height: `${height}%` }}
                  title={`${d.label}: ${formatValue(value)}`}
                />
              </div>
              <span className="text-[8px] uppercase tracking-wide text-neutral-400 truncate w-full text-center">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardCharts({ last7Days }: { last7Days: DailyStat[] }) {
  if (last7Days.length === 0) return null;

  return (
    <section className="mb-10">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4">
        Last 7 days
      </p>
      <div className="grid lg:grid-cols-2 gap-4">
        <BarChart
          title="Revenue (paid & delivered)"
          data={last7Days}
          valueKey="revenue"
          formatValue={(n) => formatPrice(n)}
        />
        <BarChart
          title="Orders placed"
          data={last7Days}
          valueKey="orders"
          formatValue={(n) => String(n)}
        />
      </div>
    </section>
  );
}
