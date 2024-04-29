import mongoose from "mongoose";
const { Schema } = mongoose;

const listingSchema = new Schema(
    {
        name: {
            type: String,
            require: true,
        },
        isRental: {
            type: Boolean,
            require: true,
        },
		location: {
			type: String,
			require: true
		},
		category: {
			type: String,
			required: true,
		},
		address: {
			type: String,
			require: true
		},
        price: {
			type: Number,
			required: true,
		},
		bed: {
			type: Number,
			required: true,
		},
		bathroom: {
			type: Number,
			required: true,
		},
		area: {
			type: String,
			required: true,
		},
        description: {
			type: String,
		},
        image: {
			type: Buffer,
		},
        sold: {
			type: Boolean,
			default: false,
		},
        isReadyForSale: {
			type: Boolean,
			default: false,
		},
        orderedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Seller",
		},
    },
    {
		timestamps: true,
	},
)

const Listing = mongoose.model("Properties", listingSchema);
export default Listing;