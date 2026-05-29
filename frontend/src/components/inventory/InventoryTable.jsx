import useInventory from "../../hooks/useInventory";
import Pagination from "../ui/Pagination";
import { exportToCSV, formatCurrency, formatNumber } from "../../utils/helpers";
import toast from "react-hot-toast";

const SortIcon = ({ field, currentSort }) => {
  if (currentSort === field) return <span style={{ marginLeft: 4 }}>▲</span>;
  if (currentSort === `-${field}`) return <span style={{ marginLeft: 4 }}>▼</span>;
  return <span style={{ marginLeft: 4, opacity: 0.3 }}>↕</span>;
};

const InventoryTable = ({ categories }) => {
  const {
    products, pagination, loading, error,
    page, setPage, search, setSearch,
    category, setCategory, sort, setSort,
    refresh,
  } = useInventory();

  const handleSort = (field) => {
    setSort((prev) => (prev === `-${field}` ? field : `-${field}`));
  };

  const handleExport = () => {
    if (!products.length) return toast.error("No data to export");
    exportToCSV(products, `inventory-page-${page}.csv`);
    toast.success(`Exported ${products.length} rows`);
  };

  const th = {
    padding: "10px 14px", fontSize: 12, color: "var(--text-muted)", textAlign: "left",
    borderBottom: "1px solid var(--border)", textTransform: "uppercase", letterSpacing: "0.06em",
    whiteSpace: "nowrap", cursor: "pointer", userSelect: "none",
  };
  const td = {
    padding: "11px 14px", fontSize: 13, color: "var(--text-primary)",
    borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
  };

  return (
    <div>
      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          style={{
            flex: 1, minWidth: 200, padding: "8px 14px", borderRadius: 8,
            border: "1px solid var(--border)", background: "var(--card-bg)",
            color: "var(--text-primary)", fontSize: 14,
          }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: "8px 14px", borderRadius: 8,
            border: "1px solid var(--border)", background: "var(--card-bg)",
            color: "var(--text-primary)", fontSize: 14,
          }}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={handleExport} style={{
          padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)",
          background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 13,
          cursor: "pointer", fontWeight: 500,
        }}>
          ⬇ Export CSV
        </button>
        <button onClick={refresh} style={{
          padding: "8px 16px", borderRadius: 8, border: "none",
          background: "#3B82F6", color: "#fff", fontSize: 13,
          cursor: "pointer", fontWeight: 500,
        }}>
          ↻ Refresh
        </button>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid var(--border)" }}>
        {loading && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            Loading inventory…
          </div>
        )}
        {error && (
          <div style={{ padding: 20, color: "#EF4444", textAlign: "center" }}>{error}</div>
        )}
        {!loading && !error && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "var(--card-bg)" }}>
              <tr>
                <th style={th} onClick={() => handleSort("productName")}>
                  Product <SortIcon field="productName" currentSort={sort} />
                </th>
                <th style={th}>SKU</th>
                <th style={th} onClick={() => handleSort("category")}>
                  Category <SortIcon field="category" currentSort={sort} />
                </th>
                <th style={{ ...th, textAlign: "right" }} onClick={() => handleSort("price")}>
                  Price <SortIcon field="price" currentSort={sort} />
                </th>
                <th style={{ ...th, textAlign: "right" }}>Cost</th>
                <th style={{ ...th, textAlign: "right" }} onClick={() => handleSort("stockQuantity")}>
                  Stock <SortIcon field="stockQuantity" currentSort={sort} />
                </th>
                <th style={{ ...th, textAlign: "right" }}>Reorder</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLow    = p.stockQuantity <= p.reorderLevel && p.stockQuantity > 0;
                const isOut    = p.stockQuantity === 0;
                return (
                  <tr key={p._id} style={{ transition: "background 0.1s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--row-hover)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ ...td, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.productName}
                    </td>
                    <td style={{ ...td, fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>
                      {p.sku}
                    </td>
                    <td style={td}>{p.category}</td>
                    <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>{formatCurrency(p.price)}</td>
                    <td style={{ ...td, textAlign: "right", color: "var(--text-muted)" }}>{formatCurrency(p.cost)}</td>
                    <td style={{ ...td, textAlign: "right" }}>{formatNumber(p.stockQuantity)}</td>
                    <td style={{ ...td, textAlign: "right", color: "var(--text-muted)" }}>{p.reorderLevel}</td>
                    <td style={td}>
                      {isOut ? (
                        <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: "#FEE2E2", color: "#B91C1C" }}>Out of Stock</span>
                      ) : isLow ? (
                        <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: "#FEF3C7", color: "#92400E" }}>Low Stock</span>
                      ) : (
                        <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: "#D1FAE5", color: "#065F46" }}>In Stock</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default InventoryTable;
