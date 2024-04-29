import asyncHandler from "express-async-handler";
import Seller from "../models/Seller.js";
import User from "../models/User.js";
import { getIndexOfProperty , verifyId } from "../utils/helpers.js"
import Listing from "../models/Listing.js";
import dotenv from "dotenv";

dotenv.config();

const getSellerProfile = asyncHandler(async (req, res) => {
    const seller = await Seller.findById(req.seller.id);
    if (!seller) {
      res.status(404).json({ message: "Seller not found" });
      return;
    }
  
    res.json({
      name: seller.name,
      email: seller.email,
    });
  });
const updateSellerProfile = asyncHandler(async (req, res) => {
    const seller = await Seller.findById(req.seller.id);
    if (!seller) {
      res.status(404).json({ message: "Seller not found" });
      return;
    }
  
    const { name, email } = req.body;
    seller.name = name || seller.name;
    seller.email = email || seller.email;
    await seller.save();
  
    res.status(200).json({ message: "Seller profile updated successfully" });
  });
const uploadSellerImage = asyncHandler(async (req, res) => {
    const seller = await Seller.findById(req.seller.id);
    if (!seller) {
      res.status(404).json({ message: "Seller not found" });
      return;
    }
    seller.image = req.file.buffer;
    await seller.save();
    res.status(201).json({ message: "Seller image uploaded successfully" });
  });
const createListing = asyncHandler(async (res,req) => {
    let {
        id,
        name,
        isRental,
        location,
        address,
        category,
        description,
        price,
        bed,
        bathroom,
        area
    } = req.body
    if (!name || !isRental || price < 1) {
		res.status(400).json({ message: "Please Provide valid details" });
		throw new Error("Please provide valid details");
	}
    const imageBuffer = req.files[0].buffer ? req.files[0].buffer : null;
    const listing = new Listing({
        id,
        name,
        isRental,
        category,
        location,
        address,
        price,
        bed,
        bathroom,
        area,
        description,
        image: imageBuffer,
        createdBy: req.seller.id
    })
    await listing.save()
    req.seller.listings.push(listing.id)
    await req.seller.save();
    res.status(201).json({ listing, message:"Your Listing updated successfully" })
})
const getSellerListings = asyncHandler(async (req, res) => {
    const sellerListings= await Seller.findById(req.seller.id)
        .populate("listings")
        .exec()
    const finalProperty = sellerListings.listings.map((property) => {
        if(property.image) {
            let buffer = Buffer.from(property.image);
            let base64Image = buffer.toString("base64");
            const {
                name,
                id,
                isRental,
                location,
                address,
                category,
                price,
                bed,
                bathroom,
                area,
                description,
                sold,
                isReadyForSale,
                createdBy,
				createdAt,
            } = property;
            return{
                image: base64Image,
                name,
                id,
                isRental,
                location,
                address,
                category,
                price,
                bed,
                bathroom,
                area,
                description,
                sold,
                isReadyForSale,
                createdBy,
				createdAt,
            }
        } else {
            return property;
        }
    });
    res.status(200).json({ sellerListings: finalProperty });
});
const getProperty = asyncHandler(async (req, res) => {
    const {
		params: { id },
	} = req;

    const pId = id.toString();
    if (!verifyId(pId)) {
		res.status(400);
		throw new Error("Property ID invalid");
	}
    const listing = await Listing.findById(pId)
        .populate("createdBy", ["name", "email"])
        .populate("orderedBy", ["walletAddress"])
        .exec();
    if(!listing) {
        res.status(404).json({ message: "Property not found" });
		throw new Error("Property not found");
    }
    let buffer, base64Image;
    if(listing.image) {
        buffer = Buffer.from(listing.image);
        base64Image = buffer.toString("base64");
    }
    const {
        name,
        isRental,
        location,
        address,
        price,
        bed,
        category,
        bathroom,
        area,
        description,
        sold,
        isReadyForSale,
        createdBy,
        createdAt,
    } = property;
    res.status(200).json({
        name,
        isRental,
        location,
        address,
        price,
        bed,
        category,
        bathroom,
        area,
        description,
        sold,
        isReadyForSale,
        createdBy,
        createdAt,
        image: listing.image ? base64Image : "",
    })
})
const deleteListing = asyncHandler(async (req, res) => {
    const { params, seller } = req;

    const pId = params.id.toString();
    if (!verifyId(pId)) {
		res.status(400);
		throw new Error("Property ID invalid");
	}
    const listing = await Listing.findById(pId)
    const pIdIndex = getIndexOfProperty(seller.listings, pId)
    if (!listing || pIdIndex < 1) {
        res.status(404);
		throw new Error("Property not found");
    }
    await listing.deleteOne();
    seller.listings.splice(pIdIndex,1);
    await seller.save();
    res.status(201).json({ message: "Property removed successfully" })
})
const uploadPropertyImage = asyncHandler(async (req, res) => {
    const {
		file,
		params: { id },
		seller,
	} = req;
    const pId = id.toString();
    const listing = await Listing.findById(pId)
    const pIdIndex = getIndexOfProperty(seller.listings, pId)
    if (!listing || pIdIndex < -1) {
		res.status(404).json({ message: "Property not found" });
		throw new Error("Property not found");
	}
    listing.image = file.buffer;
    await listing.save()
    res.status(201).json({ message: "Image added successfully", listing });
})
const confirmPurchaseOfProperty = asyncHandler(async (req, res) => {
    const {
		params: { id },
	} = req;
    const listing = await Listing.findById(id)
    if(!listing || listing.createdBy.toString() !== req.seller.id.toString()) {
        res.status(400).json({ message: "Property not found" });
		return;
    }
    const buyer = await User.findById(listing.orderedBy);
    listing.sold = true;
    listing.isReadyForSale = false
    buyer.purchasedProperties.push(id)

    await listing.save()
    await buyer.save()
    res.status(200).json({ message: "Property owned" });
})
export{
    getSellerProfile,
    updateSellerProfile,
    uploadSellerImage,
    createListing,
    getSellerListings,
    getProperty,
    deleteListing,
    uploadPropertyImage,
    confirmPurchaseOfProperty
}