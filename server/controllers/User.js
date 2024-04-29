import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error("User doesn't exist");
    }
  
    let buffer, base64Image;
    if (user.image) {
      buffer = Buffer.from(user.image);
      base64Image = buffer.toString("base64");
    }
  
    const { name, email, role, id } = user;
    res.json({
      name,
      email,
      role,
      id,
      image: user.image ? base64Image : "",
    });
});
const uploadUserImage = asyncHandler(async (req, res) => {
    req.user.image = req.file.buffer;
    await req.user.save();
  
    res.status(201).json({ message: "Image added successfully" });
});
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
  
    const { name, email, role, image } = req.body;
  
    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.role = role || user.role;
      user.image = image || user.image;

      await user.save();
  
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
});
export { getUserProfile, updateUserProfile, uploadUserImage };
