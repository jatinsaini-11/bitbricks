import bcrypt from "bcrypt";
import User from "../models/User.js";

const userMiddleware = async(req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Basic ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const base64Credentials = authorization.split(" ")[1];
    const decodedCredentials = Buffer.from(base64Credentials, "base64").toString();
    const [email, password] = decodedCredentials.split(":");  
    if (!email || !password) {
      return res.status(401).json({ message: "Please provide email and password" });
    }
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid email or password" });
        }
    
        req.user = user;
        next();
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
}

export default userMiddleware;