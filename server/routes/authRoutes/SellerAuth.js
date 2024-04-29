import express from "express";
import sellerMiddleware from "../../middleware/sellerAuth.js";
import {
  getAllSellers,
  createSeller,
  loginSeller,
  logoutSeller,
  forgotPassword,
  resetPassword,
  getSellerProfile
} from "../../controllers/SellerAuth.js";

const sellerAuthRouter = express.Router();

sellerAuthRouter.route("/api/seller").get(getAllSellers);
sellerAuthRouter.route("/api/seller/signup").post(createSeller);
sellerAuthRouter.route("/api/seller/login").post(loginSeller);
sellerAuthRouter.route("/api/seller/forgot-password").post(forgotPassword);
sellerAuthRouter.route("/api/seller/reset-password/:token").post(resetPassword);
sellerAuthRouter.route("/api/seller/profile").get(sellerMiddleware, getSellerProfile);

export default sellerAuthRouter;