import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { validateEmail } from "../helpers/auth.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

const getAllUsers = async(req , res ) => {
    const users = await User.find({});
    res.status(200).json({ users });
}
const getUserProfile = asyncHandler(async (req, res) => {
	const user = req.user;
	if (!user) {
	  res.status(404).json({ message: "User not found" });
	  return;
	}
	res.status(200).json({ user });
});
const createUser = asyncHandler(async (req, res) => {
    let { name, email, password } = req.body;
    password = password.toString();
    if (!name || !email || !password || !validateEmail(email)) {
      res.status(404).json({ message: "Please provide valid credentials" });
      throw new Error();
    }
    const isUser = await User.findOne({ email });
    if (isUser) {
      res.status(404).json({ message: "User already exists" });
      return;
    }
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ name, email });
});
const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	try {
	  const user = await User.findOne({ email });
	  if (!user) {
		return res.status(404).json({ message: "Invalid email or password" });
	  }

	  const isMatch = await bcrypt.compare(password, user.password);
	  if (!isMatch) {
		return res.status(401).json({ message: "Invalid email or password" });
	  }
	  res.json({ message: "Login Successful", user }); // Send response with user data
  
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
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "No user found with this email" });
      return;
    }
    const resetToken = user.generateResetToken();
    await user.save();
    // Send reset token to user's email
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
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      res.status(404).json({ message: "Invalid or expired reset token" });
      return;
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
});
const logoutUser = asyncHandler(async (req, res) => {
	req.user.tokens = req.user.tokens.filter((token) => {
		return token.token != req.token;
	});

	await req.user.save();
	res.status(200).send();
});

export { getAllUsers , createUser , loginUser , forgotPassword , resetPassword , logoutUser, getUserProfile };