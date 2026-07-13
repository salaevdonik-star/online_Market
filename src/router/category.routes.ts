import { Router } from "express";
import {getAllCategories, getOneCategory, addCategory, updateCategory, deleteCategory, search,} from "../controller/category.controller";
import validateMiddleware from "../middleware/validate.middleware";
import categoryValidator from "../validator/category.validator";
import authorization from "../middleware/authorization";
import adminChecker from "../middleware/admin.checker";
import { categoryIcon } from "../config/multer";

const categoryRouter = Router();

categoryRouter.get("/get_all_categories", getAllCategories);
categoryRouter.get("/get_one_category/:id", getOneCategory);
categoryRouter.get("/search_category", search);
categoryRouter.post("/add_category", authorization, adminChecker, categoryIcon, validateMiddleware(categoryValidator), addCategory);
categoryRouter.put("/update_category/:id", authorization, adminChecker, categoryIcon, updateCategory);
categoryRouter.delete("/delete_category/:id", authorization, adminChecker, deleteCategory);

export default categoryRouter;
