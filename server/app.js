import express from "express";
import cors from "cors";
import "dotenv/config.js";
import connectMongo from "./connect/db.js"
import { errorMiddleware } from "./middleware/errorMiddleware.js"
import SellerAuth from "./routes/authRoutes/SellerAuth.js"
import UserAuth from "./routes/authRoutes/UserAuth.js";
import Seller from "./routes/Seller.js"
import User from "./routes/User.js"
import Listing from "./routes/Listing.js"

const PORT = 8000 || process.env.PORT;
const app = express();

connectMongo();

app.use(cors());
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(errorMiddleware);

app.use(SellerAuth)
app.use(UserAuth)
app.use(Seller)
app.use(User)
app.use(Listing)

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT}`);
});
  