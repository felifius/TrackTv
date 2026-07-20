import express from "express";
import { search } from "../controller/searchController.js";
import { index } from "../controller/index.js";

const router = express.Router();

router.get("/", index);
router.get("/search", search);

export default router;