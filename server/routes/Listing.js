import express from "express";
import {
    getListing,
    addPropertyToInterestedProperties,
    purchasedProperties,
    removePropertyFromInterestedProperties,
    getInterestedProperties,
    getPurchasedProperty,
    getPropertyByCategory
} from "../controllers/Lisiting.js"
import userMiddleware from "../middleware/userAuth.js";

const propertyRouter = express.Router();
propertyRouter.route("/api/property").get(getListing);
propertyRouter.route("/api/property/category").post(getPropertyByCategory);

propertyRouter
    .route("/api/user/interestedProperty")
    .get(userMiddleware, getInterestedProperties)
propertyRouter
    .route("/api/user/purchased")
    .get(userMiddleware, getPurchasedProperty)
propertyRouter
    .route("/api/property/interestedProperty/:id")
    .post(userMiddleware, addPropertyToInterestedProperties)
	.delete(userMiddleware, removePropertyFromInterestedProperties);
propertyRouter
    .route("/api/property/purchase/:id")
    .post(userMiddleware, purchasedProperties)

export default propertyRouter