import { Router } from "express";
const router = Router();
import authentication from "../../middlewares/adminAuthentication.js";
import { uploadMiddleware } from "../../helpers/multer.js";
import {
  userManagement,
  addProduct,
  getProducts,
  getProductById,
  deleteProduct,
  editProduct,
  deleteAccount,
  banUnbanUser,
  userProfile,
  getOrders,
  getOrderById,
  changeOrderStatus,
  dashboard,
  getActivities
} from "../../controllers/admin/adminController.js";
import{
  getSupports,
  changeSupportStatus,
  getSupportChat,
}from "../../controllers/admin/supportTab.js";
router.use(authentication);
//DashBoard
router.route("/dashboard").get(dashboard);
// User-Management
router.route("/userManagement").get(userManagement);
router.route("/getActivities").get(getActivities);
router.route("/userProfile").get(userProfile);
router.route("/deleteAccount").patch(deleteAccount);
router.route("/banUnbanUser").put(banUnbanUser);
//product-Management
router.route("/AddProduct").post(uploadMiddleware, addProduct);
router.route("/getProducts").get(getProducts);
router.route("/getProductById").get(getProductById);
router.route("/deleteProduct").patch(deleteProduct);
router.route("/editProduct").put(uploadMiddleware, editProduct);
//Order-Management
router.route("/getOrders").get(getOrders);
router.route("/getOrderById").get(getOrderById);
router.route("/changeOrderStatus").put(changeOrderStatus);
//Support-Chat
router.route("/getSupports").get(getSupports);
router.route("/changeSupportStatus").post(changeSupportStatus);
router.route("/getSupportById").get(getSupportChat);
export default router;
