import Product from "../models/Product.js";

/**
 * GET /api/analytics
 *
 * Runs a single multi-stage aggregation pipeline. MongoDB executes this
 * entirely inside the database engine — no 50k documents are transferred
 * to Node.js. The $facet stage runs all sub-pipelines in parallel.
 *
 * Pipeline stages:
 *   $facet → runs multiple aggregations in one round-trip
 *     ├── summary      → overall KPIs (total SKUs, inventory value, stockouts)
 *     ├── byCategory   → valuation & unit count grouped by category
 *     └── lowStock     → items at or below their reorder threshold
 */
export const getAnalytics = async (req, res) => {
  try {
    const [result] = await Product.aggregate([
      {
        $facet: {
          // ── KPI Summary ────────────────────────────────────────────────────
          summary: [
            {
              $group: {
                _id: null,
                totalSKUs:          { $sum: 1 },
                totalInventoryValue:{ $sum: { $multiply: ["$price", "$stockQuantity"] } },
                totalCOGS:          { $sum: { $multiply: ["$cost",  "$stockQuantity"] } },
                avgPrice:           { $avg: "$price" },
                outOfStockCount:    { $sum: { $cond: [{ $eq: ["$stockQuantity", 0] }, 1, 0] } },
              },
            },
            {
              $project: {
                _id:                0,
                totalSKUs:          1,
                totalInventoryValue:{ $round: ["$totalInventoryValue", 2] },
                totalCOGS:          { $round: ["$totalCOGS", 2] },
                totalGrossProfit:   { $round: [{ $subtract: ["$totalInventoryValue", "$totalCOGS"] }, 2] },
                avgPrice:           { $round: ["$avgPrice", 2] },
                outOfStockCount:    1,
              },
            },
          ],

          // ── Valuation by Category ──────────────────────────────────────────
          byCategory: [
            {
              $group: {
                _id:        "$category",
                totalValue: { $sum: { $multiply: ["$price", "$stockQuantity"] } },
                totalUnits: { $sum: "$stockQuantity" },
                skuCount:   { $sum: 1 },
                avgPrice:   { $avg: "$price" },
              },
            },
            {
              $project: {
                _id:        0,
                category:   "$_id",
                totalValue: { $round: ["$totalValue", 2] },
                totalUnits: 1,
                skuCount:   1,
                avgPrice:   { $round: ["$avgPrice", 2] },
              },
            },
            { $sort: { totalValue: -1 } },
            { $limit: 10 }, // Top 10 categories by value
          ],

          // ── Low Stock Alerts ───────────────────────────────────────────────
          lowStock: [
            {
              $match: {
                $expr: {
                  // Items where stock has dropped to or below the reorder threshold
                  $lte: ["$stockQuantity", "$reorderLevel"],
                },
              },
            },
            {
              $project: {
                _id:           1,
                productName:   1,
                sku:           1,
                category:      1,
                stockQuantity: 1,
                reorderLevel:  1,
                deficit: {
                  $subtract: ["$reorderLevel", "$stockQuantity"],
                },
              },
            },
            { $sort: { deficit: -1 } },
            { $limit: 20 }, // Top 20 most critical shortfalls
          ],
        },
      },

      // Flatten single-item summary array to an object
      {
        $project: {
          summary:    { $arrayElemAt: ["$summary", 0] },
          byCategory: 1,
          lowStock:   1,
        },
      },
    ]);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("getAnalytics error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
};

/**
 * GET /api/analytics/categories
 * Returns the distinct list of categories — used to populate filter dropdowns.
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ success: true, data: categories.sort() });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};
