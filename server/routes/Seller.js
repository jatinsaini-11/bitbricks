import express from "express";
import sellerAuthMiddleware from "../middleware/sellerAuth.js";
import {
    getSellerProfile,
    updateSellerProfile,
    uploadSellerImage,
    createListing,
    getSellerListings,
    getProperty,
    deleteListing,
    uploadPropertyImage,
    confirmPurchaseOfProperty
} from "../controllers/seller.js";
const sellerRouter = express.Router();
import multer from "multer";
import {
    getPropertyReadyForSale
} from "../controllers/Lisiting.js"

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

sellerRouter
	.route("/api/seller/profile")
	.get(sellerAuthMiddleware, getSellerProfile)
	.post(updateSellerProfile);

sellerRouter
	.route("/api/seller/profile/image")
	.post(upload.single("image"), sellerAuthMiddleware, uploadSellerImage);

sellerRouter
    .route("/api/property")
    .get(sellerAuthMiddleware , getSellerListings)
    .post(upload.any(), sellerAuthMiddleware, createListing)

sellerRouter
	.route("/api/property/:id")
    .get(getProperty)
    .post(sellerAuthMiddleware, confirmPurchaseOfProperty)
    .put(upload.single("image"), sellerAuthMiddleware, uploadPropertyImage)
    .delete(sellerAuthMiddleware, deleteListing)

sellerRouter
    .route("/api/properties/ready")
    .get(sellerAuthMiddleware, getPropertyReadyForSale);

export default sellerRouter
