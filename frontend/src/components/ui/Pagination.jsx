const Pagination = ({ pagination, onPageChange }) => {
  const { currentPage, totalPages, totalRecords, hasNextPage, hasPrevPage } = pagination;
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
    pages.push(i);
  }

  const btnBase = {
    padding: "6px 12px",
    borderRadius: 6,
    border: "1px solid var(--border)",
    cursor: "pointer",
    fontSize: 13,
    background: "var(--card-bg)",
    color: "var(--text-primary)",
    transition: "all 0.15s",
  };

  const activBtn = { ...btnBase, background: "#3B82F6", color: "#fff", borderColor: "#3B82F6", fontWeight: 600 };
  const disabledBtn = { ...btnBase, opacity: 0.4, cursor: "not-allowed" };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 8 }}>
      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
        {totalRecords.toLocaleString()} total records — page {currentPage} of {totalPages}
      </span>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <button style={hasPrevPage ? btnBase : disabledBtn} disabled={!hasPrevPage} onClick={() => onPageChange(currentPage - 1)}>
          ← Prev
        </button>
        {pages[0] > 1 && <span style={{ color: "var(--text-muted)", padding: "0 4px" }}>…</span>}
        {pages.map((p) => (
          <button key={p} style={p === currentPage ? activBtn : btnBase} onClick={() => onPageChange(p)}>
            {p}
          </button>
        ))}
        {pages[pages.length - 1] < totalPages && <span style={{ color: "var(--text-muted)", padding: "0 4px" }}>…</span>}
        <button style={hasNextPage ? btnBase : disabledBtn} disabled={!hasNextPage} onClick={() => onPageChange(currentPage + 1)}>
          Next →
        </button>
      </div>
    </div>
  );
};

export default Pagination;
