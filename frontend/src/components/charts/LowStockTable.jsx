const LowStockTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No low-stock items. 🎉</p>;
  }

  const th = { padding: "10px 14px", fontSize: 12, color: "var(--text-muted)", textAlign: "left", borderBottom: "1px solid var(--border)", textTransform: "uppercase", letterSpacing: "0.06em" };
  const td = { padding: "10px 14px", fontSize: 13, color: "var(--text-primary)", borderBottom: "1px solid var(--border)" };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>SKU</th>
            <th style={th}>Product</th>
            <th style={th}>Category</th>
            <th style={{ ...th, textAlign: "right" }}>In Stock</th>
            <th style={{ ...th, textAlign: "right" }}>Reorder At</th>
            <th style={{ ...th, textAlign: "right" }}>Deficit</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id} style={{ background: item.stockQuantity === 0 ? "rgba(239,68,68,0.05)" : "transparent" }}>
              <td style={{ ...td, fontFamily: "monospace", fontSize: 12 }}>{item.sku}</td>
              <td style={td}>{item.productName}</td>
              <td style={td}>{item.category}</td>
              <td style={{ ...td, textAlign: "right" }}>
                <span style={{
                  padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                  background: item.stockQuantity === 0 ? "#FEE2E2" : "#FEF3C7",
                  color: item.stockQuantity === 0 ? "#B91C1C" : "#92400E",
                }}>
                  {item.stockQuantity}
                </span>
              </td>
              <td style={{ ...td, textAlign: "right", color: "var(--text-muted)" }}>{item.reorderLevel}</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 600, color: "#EF4444" }}>
                -{item.deficit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LowStockTable;
