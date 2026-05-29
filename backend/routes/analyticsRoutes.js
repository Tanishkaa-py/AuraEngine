import { Router } from "express";
import { getAnalytics, getCategories } from "../controllers/analyticsController.js";

const router = Router();

router.get("/",          getAnalytics);
router.get("/categories",getCategories);

export default router;
