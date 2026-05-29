# Prompts.md — AI Transparency Log

This file documents every instance where AI was used to architect, problem-solve, or generate non-trivial code in this project, as required by the Delivery Protocol.

---

## 1. MongoDB Aggregation Pipeline Design

**Problem:**
I needed to calculate KPI summaries (total value, COGS, gross profit, stockout count) and groupings by category across 50,000 records — without fetching all documents to Node.js memory.

**Prompt used:**
> "Design a MongoDB aggregation pipeline using `$facet` that computes in a single round-trip: (1) an overall KPI summary with total SKUs, total inventory value (price × stockQuantity), COGS (cost × stockQuantity), gross profit, average price, and out-of-stock count. (2) A by-category breakdown sorted by total value descending, limited to top 10. (3) A low-stock alert list where stockQuantity <= reorderLevel, sorted by deficit descending, limited to 20. Use `$project` to round currency values to 2 decimal places and strip `_id` from the category output."

**AI Output:**
The pipeline structure using `$facet`, `$group`, `$match` with `$expr`, and `$project` with `$round`. The `$expr` inside `$match` to compare two document fields (`$lte: ["$stockQuantity", "$reorderLevel"]`) was the key insight — a standard `$match` with literal values cannot compare two fields on the same document.

**What I verified/changed:**
- Confirmed `$facet` runs all sub-pipelines in parallel internally (verified in MongoDB docs).
- Added `{ $arrayElemAt: ["$summary", 0] }` in a final `$project` stage to unwrap the single-element summary array that `$facet` always returns as an array, even for scalar aggregations.
- Added `totalGrossProfit` as a `$subtract` inside `$project` rather than in `$group`, since it's derived from two other `$group` outputs.

---

## 2. Debounced Search Hook Architecture

**Problem:**
Needed to prevent API calls on every keystroke when a user types in the search box. A naive `useEffect` on the search string would fire 10+ requests for a single 10-character query.

**Prompt used:**
> "Write a React custom hook `useDebounce(value, delay)` that debounces a state value using `setTimeout` and clears it with the `useEffect` cleanup function."

**AI Output:**
The standard `useEffect` + `clearTimeout` pattern. Well-established pattern, used exactly as generated.

**What I verified:**
- Confirmed the cleanup function `return () => clearTimeout(handler)` correctly cancels in-flight timers on re-render. This is the critical detail that prevents a stale closure from firing after a component unmounts.

---

## 3. Parallel Data Fetching in `getInventory`

**Problem:**
The inventory route needed both `countDocuments` (for pagination metadata) and `find` (for the data slice). Running them sequentially doubles the database round-trip time.

**Approach:**
Used `Promise.all([countDocuments(...), find(...)])` — a standard pattern, but I confirmed via testing that both operations hit the same index and that MongoDB can execute them concurrently from the connection pool.

---

## 4. `.lean()` Performance Optimization

**Research query:**
> "Does Mongoose `.lean()` affect query results for a paginated list endpoint that only needs plain JSON data?"

**Finding:**
`.lean()` skips Mongoose document hydration (no getters, no `toJSON`, no change tracking). For read-only list endpoints, this is safe and provides ~15-20% throughput improvement. Not appropriate for routes that need to call `.save()` on the returned document.

Applied to: `getInventory`, `getProductById`, `updateProduct` (result only).

---

*All other code — routing structure, Zod schema design, React component architecture, CSV export utility, and folder layout — was written from first principles.*
