import bcrypt from "bcrypt";
import Seller from "../models/Seller.js";

const sellerMiddleware = async (req, res, next) => {
  const { email, password } = req.body; // Assuming email and password are sent in the request body

  if (!email || !password) {
    return res.status(401).json({ message: "Please provide email and password" });
  }

  try {
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    req.seller = seller;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export default sellerMiddleware;
