import { useState } from "react";
import { Toaster } from "react-hot-toast";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import InventoryTable from "./components/inventory/InventoryTable";
import useAnalytics from "./hooks/useAnalytics";

const TABS = ["Analytics", "Inventory"];

export default function App() {
  const [activeTab, setActiveTab] = useState("Analytics");
  const { categories } = useAnalytics();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text-primary)", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--card-bg)",
        padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B82F6", boxShadow: "0 0 0 3px rgba(59,130,246,0.2)" }} />
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>Aura Engine</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--bg)", padding: "2px 8px", borderRadius: 6 }}>Enterprise</span>
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 500, transition: "all 0.15s",
              background: activeTab === tab ? "#3B82F6" : "transparent",
              color: activeTab === tab ? "#fff" : "var(--text-muted)",
            }}>
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700 }}>
            {activeTab === "Analytics" ? "Inventory Analytics" : "Inventory Management"}
          </h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>
            {activeTab === "Analytics"
              ? "Real-time aggregated insights computed directly in the database."
              : "Server-side paginated view of 50,000+ products. Only 50 records load at a time."}
          </p>
        </div>

        {activeTab === "Analytics"  && <AnalyticsDashboard />}
        {activeTab === "Inventory"  && <InventoryTable categories={categories} />}
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
