import express from "express";
import userMiddleware from "../middleware/userAuth.js";
import {
    getUserProfile,
    updateUserProfile,
    uploadUserImage
} from "../controllers/User.js"
const userRouter = express.Router();
import multer from "multer";

const upload = multer({
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|png|jpeg|jfif|PNG)$/)) {
			return cb(new Error("Please upload valid image format"));
		}
		return cb(undefined, true);
	},
	limits: {
		fileSize: 1000000,
	},
});

userRouter
	.route("/api/user/profile")
	.get(userMiddleware, getUserProfile)
	.put(userMiddleware, updateUserProfile);

userRouter
	.route("/api/user/profile/image")
	.post(upload.single("image"), userMiddleware, uploadUserImage);
export default userRouter;