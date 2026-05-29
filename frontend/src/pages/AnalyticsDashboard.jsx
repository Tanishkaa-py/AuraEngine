import useAnalytics from "../hooks/useAnalytics";
import KpiCard from "../components/ui/KpiCard";
import CategoryChart from "../components/charts/CategoryChart";
import LowStockTable from "../components/charts/LowStockTable";
import { formatCurrency, formatNumber } from "../utils/helpers";

const AnalyticsDashboard = () => {
  const { analytics, loading, error } = useAnalytics();

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTop: "3px solid #3B82F6", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "var(--text-muted)", margin: 0 }}>Loading analytics…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (error) return <p style={{ color: "#EF4444", padding: 20 }}>{error}</p>;
  if (!analytics) return null;

  const { summary, byCategory, lowStock } = analytics;

  const kpis = [
    { title: "Total SKUs",              value: formatNumber(summary?.totalSKUs),             subtitle: "Distinct products indexed",      accent: "blue"  },
    { title: "Inventory Value",         value: formatCurrency(summary?.totalInventoryValue),  subtitle: "Retail price × units on hand",   accent: "green" },
    { title: "Gross Profit Potential",  value: formatCurrency(summary?.totalGrossProfit),     subtitle: "Value minus cost of goods",      accent: "blue"  },
    { title: "Out of Stock",            value: formatNumber(summary?.outOfStockCount),        subtitle: "SKUs with zero units — urgent",  accent: "red"   },
    { title: "Avg Unit Price",          value: formatCurrency(summary?.avgPrice),             subtitle: "Across all active products",     accent: "amber" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── KPI Grid ──────────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 14,
      }}>
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* ── Chart ─────────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--card-bg)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "24px 24px 12px",
      }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 4px", color: "var(--text-primary)", fontSize: 15, fontWeight: 600 }}>
            Inventory Valuation by Category
          </h3>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>
            Total retail value of stock on hand, grouped by product category
          </p>
        </div>
        <CategoryChart data={byCategory} />
      </div>

      {/* ── Low Stock ─────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--card-bg)", border: "1px solid var(--border)",
        borderRadius: 10, padding: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: "0 0 4px", color: "var(--text-primary)", fontSize: 15, fontWeight: 600 }}>
              Low Stock Alerts
            </h3>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>
              Products at or below reorder threshold — sorted by severity
            </p>
          </div>
          <span style={{
            background: "#FEE2E2", color: "#B91C1C", fontSize: 12,
            fontWeight: 700, padding: "4px 12px", borderRadius: 20,
          }}>
            {lowStock?.length} items need attention
          </span>
        </div>
        <LowStockTable data={lowStock} />
      </div>

    </div>
  );
};

export default AnalyticsDashboard;