/**
 * Aura Engine — Database Seeder
 * Generates and inserts 50,000 realistic product records.
 *
 * Usage: npm run seed
 *
 * Strategy: insertMany with ordered:false in batches of 1,000 to:
 *   1. Avoid hitting MongoDB's 16MB BSON document limit per batch
 *   2. Keep memory usage low (no 50k-item array in RAM)
 *   3. Maximise throughput via parallel network I/O
 */

import "dotenv/config";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import Product from "../models/Product.js";

// ─── Configuration ─────────────────────────────────────────────────────────────
const TOTAL_RECORDS = 50_000;
const BATCH_SIZE    = 1_000;

const CATEGORIES = [
  "Electronics", "Apparel", "Home & Garden", "Sports & Outdoors",
  "Toys & Games", "Health & Beauty", "Automotive", "Books & Media",
  "Food & Beverage", "Office Supplies", "Tools & Hardware",
  "Pet Supplies", "Musical Instruments", "Jewelry & Watches",
];

// ─── Generator ────────────────────────────────────────────────────────────────
const generateProduct = () => {
  const cost  = parseFloat(faker.commerce.price({ min: 1, max: 800 }));
  // Price is always >= cost (enforced by business rule + this generator)
  const price = parseFloat((cost * faker.number.float({ min: 1.05, max: 3.5 })).toFixed(2));
  const reorderLevel = faker.number.int({ min: 5, max: 50 });

  return {
    productName:   faker.commerce.productName(),
    // SKU format: CAT-ADJECTIVE-NNNNN (e.g. "ELE-BLUE-04821")
    sku: `${faker.string.alpha({ length: 3, casing: "upper" })}-${faker.string.alpha({ length: 4, casing: "upper" })}-${faker.string.numeric({ length: 5 })}`,
    category:      faker.helpers.arrayElement(CATEGORIES),
    price,
    cost,
    stockQuantity: faker.number.int({ min: 0, max: 1000 }),
    reorderLevel,
    lastUpdated:   faker.date.recent({ days: 90 }),
  };
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const seed = async () => {
  console.log("🌱 Connecting to database...");
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("🗑️  Clearing existing products...");
  await Product.deleteMany({});

  console.log(`📦 Seeding ${TOTAL_RECORDS.toLocaleString()} products in batches of ${BATCH_SIZE}...`);

  const totalBatches = Math.ceil(TOTAL_RECORDS / BATCH_SIZE);
  let inserted = 0;

  for (let batch = 0; batch < totalBatches; batch++) {
    const remaining = TOTAL_RECORDS - inserted;
    const count     = Math.min(BATCH_SIZE, remaining);
    const products  = Array.from({ length: count }, generateProduct);

    await Product.insertMany(products, { ordered: false });
    inserted += count;

    const pct = ((inserted / TOTAL_RECORDS) * 100).toFixed(1);
    process.stdout.write(`\r  Progress: ${inserted.toLocaleString()} / ${TOTAL_RECORDS.toLocaleString()} (${pct}%)`);
  }

  console.log("\n✅ Seeding complete!");
  console.log(`   Total inserted: ${inserted.toLocaleString()} products`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seeder failed:", err);
  process.exit(1);
});
