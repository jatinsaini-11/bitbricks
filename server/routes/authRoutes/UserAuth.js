import express from "express";
import userMiddleware from "../../middleware/userAuth.js";
import {
    getAllUsers,
    createUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    getUserProfile
} from "../../controllers/userAuth.js"

const userAuthRouter = express.Router();
userAuthRouter.route("/api/user").get(getAllUsers);
userAuthRouter.route("/api/user/signup").post(createUser);
userAuthRouter.route("/api/user/login").post(loginUser);
userAuthRouter.route("/api/user/forgot-password").post(forgotPassword);
userAuthRouter.route("/api/user/reset-password/:token").post(resetPassword);
userAuthRouter.route("/api/user/profile").get(userMiddleware, getUserProfile);

export default userAuthRouter;