import { Router } from "express";
const router = Router();
import authentication from "../../middlewares/adminAuthentication.js";
import {
  createSuperAdmin,
  createAdmin,
  adminLogin,
  changePassword,
  forgotpassword,
  resetPassword,
  verifyOTP,
  resendOTP,
} from "../../controllers/admin/authController.js";
router.route("/register").get(createSuperAdmin);
router.route("/login").post(adminLogin);
router.route("/createAdmin").post(createAdmin);
router.route("/forgetpassword").post(forgotpassword);
router.route("/resetpassword").post(resetPassword);
router.route("/resendOtp").post(resendOTP);
router.route("/verifyotp").post(verifyOTP);
router.use(authentication);
router.route("/changePassword").patch(changePassword);
export default router;
