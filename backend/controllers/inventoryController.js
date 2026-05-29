import Product from "../models/Product.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds a MongoDB query filter object from sanitized request params.
 * Keeping filter-building logic here (not in the route) maintains separation of concerns.
 */
const buildFilter = ({ search, category }) => {
  const filter = {};

  if (search) {
    // $text uses the productName text index — far faster than a $regex scan on 50k docs.
    filter.$text = { $search: search };
  }

  if (category && category !== "all") {
    filter.category = category; // Hits the { category: 1 } index.
  }

  return filter;
};

/**
 * Parses the sort query param (e.g. "-price" → { price: -1 }).
 * Defaults to sorting by lastUpdated descending if nothing is supplied.
 */
const parseSortParam = (sort) => {
  if (!sort) return { lastUpdated: -1 };
  const descending = sort.startsWith("-");
  const field = descending ? sort.slice(1) : sort;
  const ALLOWED_SORT_FIELDS = ["price", "cost", "stockQuantity", "productName", "category", "lastUpdated"];
  if (!ALLOWED_SORT_FIELDS.includes(field)) return { lastUpdated: -1 };
  return { [field]: descending ? -1 : 1 };
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/inventory
 * Supports: ?page, ?limit, ?search, ?category, ?sort
 * Uses projection + pagination to avoid transferring the full 50k collection.
 */
export const getInventory = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50); // Cap at 100 per page
    const skip  = (page - 1) * limit;

    const filter = buildFilter({
      search:   req.query.search?.trim(),
      category: req.query.category?.trim(),
    });

    const sortBy = parseSortParam(req.query.sort);

    // Run count and data fetch in parallel — halves round-trip time.
    const [totalRecords, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(), // .lean() returns plain JS objects — ~20% faster than Mongoose documents
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    res.json({
      success: true,
      data: products,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("getInventory error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch inventory" });
  }
};

/**
 * GET /api/inventory/:id
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
};

/**
 * POST /api/inventory
 * Body is pre-validated by Zod middleware before this runs.
 */
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: `SKU '${req.body.sku}' already exists.` });
    }
    res.status(500).json({ success: false, message: "Failed to create product" });
  }
};

/**
 * PUT /api/inventory/:id
 * Body is pre-validated by Zod middleware before this runs.
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    ).lean();

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
};

/**
 * DELETE /api/inventory/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};
