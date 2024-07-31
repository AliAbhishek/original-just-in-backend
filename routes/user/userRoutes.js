import { Router } from "express";
import { uploadMiddleware } from "../../helpers/multer.js";
import authentication from "../../middlewares/authentication.js";
import {
  register,
  login,
  forgotpassword,
  resetPassword,
  deleteAccount,
  logout,
  resendOTP,
  verifyOTP,
  socialLogin,
  changePassword,
  allowLocation,
  getProfile
} from "../../controllers/user/authController.js";
import {
  changeNotificationStatus,
  createProfile,
  editProfile,
  addAddress,
  deleteAddress,
  editAddress,
  getAddresses,
  getProducts,
  getCart,
  removeFromCart,
  addToCart,
  addRemoveQuantity,
  getMyOrders,
  getOrderProductById,
  placeOrder,
  getTransactions,
  paymentDoneforAppointment,
  createPaymentIntent
} from "../../controllers/user/userController.js";
import {
  createSupport,
  getSupportChat,
} from "../../controllers/user/supportTab.js";
import { getProductById } from "../../controllers/admin/adminController.js";
const router = Router();

//--Registration Flow--
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/verifyOtp").post(verifyOTP);
router.route("/resendOtp").post(resendOTP);
router.route("/forgotPassword").post(forgotpassword);
router.route("/resetPassword").post(resetPassword);
router.route("/socialLogin").post(socialLogin);
router.use(authentication);
router.route("/allowLocation").put(allowLocation);
//Profile Creation Flow
router.route("/createProfile").put(uploadMiddleware, createProfile);
router.route("/editProfile").put(uploadMiddleware,editProfile)
router.route("/addAddress").post(addAddress);
//Home Flow
router.route("/getProducts").get(getProducts);
router.route("/getProductById").get(getProductById);
//Cart Flow
router.route("/getCart").get(getCart);
router.route("/removeFromCart").delete(removeFromCart);
router.route("/addToCart").post(addToCart);
router.route("/addRemoveQuantity").put(addRemoveQuantity);
router.route("/placeOrder").post(placeOrder);
router.route("/getTransactions").get(getTransactions);
router.route("/paymentDoneforAppointment").post(paymentDoneforAppointment);
router.route("/createPaymentIntent").post(createPaymentIntent);
//Order Flow
router.route("/getMyOrders").get(getMyOrders);
router.route("/getOrderProductById").get(getOrderProductById);
//--Setting Flow--
router.route("/getProfile").get(getProfile);
router.route("/changeNotificationStatus").patch(changeNotificationStatus);
router.route("/deleteAddress").delete(deleteAddress);
router.route("/getAddresses").get(getAddresses);
router.route("/editAddress").put(editAddress);
router.route("/logout").patch(logout);
router.route("/changePassword").patch(changePassword);
router.route("/deleteAccount").patch(deleteAccount);
router.route("/createSupport").post(createSupport);
router.route("/getSupport").get(getSupportChat);
export default router;
