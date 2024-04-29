import mongoose from "mongoose";
const { Schema } = mongoose;
import bcrypt from "bcrypt";
import crypto from "crypto";

const sellerSchema = new Schema(
    {
        name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		image: {
			type: Buffer,
			default: "",
		},
		listings: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "listings",
			},
		],
		resetPasswordToken: String,
		resetPasswordExpires: Date,
    },
	{
		timestamps: true,
	},
)
sellerSchema.methods.generateResetToken = function () {
	const resetToken = crypto.randomBytes(20).toString("hex");
	this.resetPasswordToken = crypto
	  .createHash("sha256")
	  .update(resetToken)
	  .digest("hex");
	this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
	return resetToken;
};
sellerSchema.pre("save", async function (next) {
	const seller = this;
	if (!seller.isModified("password")) {
		next();
	}

	const hashedPassword = await bcrypt.hash(seller.password, 9);
	seller.password = hashedPassword;

	console.log("Seller document before save:", seller)
	next()
});
sellerSchema.statics.findSellerByCredentials = async (email, password) => {
	const seller = await Seller.findOne({ email });
	if (!seller) {
	  throw new Error("Unable to login");
	}
  
	const isMatch = await bcrypt.compare(password, seller.password);
	if (!isMatch) {
	  throw new Error("Unable to login");
	}
  
	return seller;
};

const Seller = mongoose.model("Seller", sellerSchema);
export default Seller;
