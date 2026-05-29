import { Router } from "express";
import {
  getInventory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/inventoryController.js";
import { validate, createProductSchema, updateProductSchema } from "../middleware/validate.js";

const router = Router();

router.get("/",      getInventory);
router.get("/:id",   getProductById);
router.post("/",     validate(createProductSchema), createProduct);
router.put("/:id",   validate(updateProductSchema), updateProduct);
router.delete("/:id",deleteProduct);

export default router;
