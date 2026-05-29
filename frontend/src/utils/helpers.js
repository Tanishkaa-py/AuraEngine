/**
 * Converts an array of objects to a CSV string and triggers a browser download.
 * Works entirely in the browser — no server round-trip required.
 */
export const exportToCSV = (data, filename = "inventory-export.csv") => {
  if (!data || data.length === 0) return;

  const headers = ["Product Name", "SKU", "Category", "Price", "Cost", "Stock Quantity", "Reorder Level", "Last Updated"];
  const rows    = data.map((p) => [
    `"${p.productName}"`,
    p.sku,
    p.category,
    p.price.toFixed(2),
    p.cost.toFixed(2),
    p.stockQuantity,
    p.reorderLevel,
    new Date(p.lastUpdated).toLocaleDateString(),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href  = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const formatCurrency = (val) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

export const formatNumber = (val) =>
  new Intl.NumberFormat("en-US").format(val);
