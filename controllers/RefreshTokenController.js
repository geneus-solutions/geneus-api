import user from "../models/User.js";
import Jwt from "jsonwebtoken";
import { generateAccessToken } from "./AuthController.js";

const getRefreshToken = async (req, res, next) => {
  try {
    // const cookies = req.cookies;
    let refreshToken = req.cookies.refreshToken;

    //  For mobile -> from request body or header
    if (!refreshToken) {
      refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
    }
    
    if (!refreshToken) {
      return res.status(401).json({ message: "Please logIn to access" });
    }



    const foundUser = await user.findOne({ refreshToken: refreshToken }).lean();

    if (!foundUser)
      return res.status(401).json({ message: "Please logIn to access" });

    Jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET_KEY,
      (err, decodedUser) => {
        if (err || foundUser._id.toString() !== decodedUser.id) {
          return res.status(401).json({ message: "Please logIn to access" });
        }

        // const accessToken = Jwt.sign({_id:foundUser._id},process.env.ACCESS_SECRET_KEY,{expiresIn:'30s'});
        const accessToken = generateAccessToken(foundUser);

        const user = {
          id: foundUser._id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          plan: foundUser.plan,
        };
        res.status(200).json({ ...user, accessToken });
      }
    );
  } catch (error) {
    res.status(500).json({ error:error.message });
  }
};

export { getRefreshToken };
