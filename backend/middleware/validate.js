import { z } from "zod";

// ─── Reusable Field Definitions ───────────────────────────────────────────────
const priceField = z.number({ required_error: "Price is required" }).min(0, "Price cannot be negative");
const costField  = z.number({ required_error: "Cost is required"  }).min(0, "Cost cannot be negative");

// ─── Shared Business Rules Refinement ─────────────────────────────────────────
const applyBusinessRules = (schema) =>
  schema.refine((data) => data.price >= data.cost, {
    message: "Price cannot be lower than cost — this would result in a negative margin.",
    path: ["price"],
  });

// ─── Schemas ──────────────────────────────────────────────────────────────────
const baseProductSchema = z.object({
  productName:   z.string().min(1, "Product name is required").max(200),
  sku:           z.string().min(1, "SKU is required").max(50).toUpperCase(),
  category:      z.string().min(1, "Category is required").max(100),
  price:         priceField,
  cost:          costField,
  stockQuantity: z.number().int().min(0, "Stock quantity cannot be negative"),
  reorderLevel:  z.number().int().min(0, "Reorder level cannot be negative"),
});

export const createProductSchema = applyBusinessRules(baseProductSchema);
export const updateProductSchema = applyBusinessRules(baseProductSchema.partial());

// ─── Middleware Factory ────────────────────────────────────────────────────────
// Returns an Express middleware that validates req.body against the given schema.
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field:   issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  req.body = result.data; // Replace with sanitized/coerced data
  next();
};
