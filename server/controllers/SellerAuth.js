import asyncHandler from "express-async-handler";
import Seller from "../models/Seller.js";
import { validateEmail } from "../helpers/auth.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

const getAllSellers = async (req, res) => {
  const sellers = await Seller.find({});
  res.status(200).json({ sellers });
};
const getSellerProfile = asyncHandler(async (req, res) => {
	const seller = req.seller;
	if (!seller) {
	  res.status(404).json({ message: "Seller not found" });
	  return;
	}
	res.status(200).json({ seller });
  });
const createSeller = asyncHandler(async (req, res) => {
  let { name, email, password } = req.body;
  password = password.toString();
  if (!name || !email || !password || !validateEmail(email)) {
    res.status(404).json({ message: "Please provide valid credentials" });
    throw new Error();
  }
  const isSeller = await Seller.findOne({ email });
  if (isSeller) {
    res.status(404).json({ message: "Seller already exists" });
    return;
  }
  const seller = new Seller({ name, email, password });
  await seller.save();
  res.status(201).json({ name, email });
});

const loginSeller = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	try {
	  const seller = await Seller.findOne({ email });
	  if (!seller) {
		return res.status(404).json({ message: "Invalid email or password" });
	  }

	  const isMatch = await bcrypt.compare(password, seller.password);
	  if (!isMatch) {
		return res.status(401).json({ message: "Invalid email or password" });
	  }
	  res.json({ message: "Login Successful", seller }); // Send response with seller data
  
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ message: "Server Error" });
	}
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!validateEmail(email)) {
    res.status(404).json({ message: "Please enter valid email" });
    return;
  }
  const seller = await Seller.findOne({ email });
  if (!seller) {
    res.status(404).json({ message: "No seller found with this email" });
    return;
  }
  const resetToken = seller.generateResetToken();
  await seller.save();
  // Send reset token to seller's email
  res.status(200).json({ message: "Reset token sent to your email" });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) {
    res.status(400).json({ message: "Please provide a new password" });
    return;
  }
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const seller = await Seller.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!seller) {
    res.status(404).json({ message: "Invalid or expired reset token" });
    return;
  }
  seller.password = password;
  seller.resetPasswordToken = undefined;
  seller.resetPasswordExpires = undefined;
  await seller.save();
  res.status(200).json({ message: "Password reset successful" });
});
const logoutSeller = asyncHandler(async (req, res) => {
	req.seller.tokens = req.seller.tokens.filter((token) => {
		return token.token != req.token;
	});

	await req.seller.save();
	res.status(200).send();
});

export { getAllSellers, createSeller, loginSeller, forgotPassword, resetPassword , logoutSeller , getSellerProfile };