import jwt from 'jsonwebtoken'
import User from '../models/User.js';
import Token from "../models/Token.js";
import Visitor from "../models/Visitor.js";
import { configDotenv } from 'dotenv';
configDotenv()
const Auth = (req, res, next) => {
  try {

      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      // console.log('authHeader : ', authHeader);
      if (!authHeader) {
          return res.status(403).json({ error: "Please log in to access" });
      }
      
      // Remove any quotes from the token
      const token = authHeader.split(' ')[1].replace(/"/g, '');
      
      if (!token) {
          return res.status(401).json({ error: "Please log in to access" });
      }

      try {
          const decodedData = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
          
          if (!decodedData.id) {
              return res.status(403).json({ error: "Invalid token" });
          }
          
          req.user = { userId: decodedData.id, role: decodedData.role };
          next();
      } catch (verifyError) {
          console.error('Token verification failed:', verifyError);
          return res.status(403).json({ error: "Invalid token" });
      }
  } catch (error) {
      console.log('error : ', error);
      return res.status(403).json({ error: "Forbidden" });
  }
};
const AdminAuth = (req, res, next) => {
  const {role} = req.user
  console.log(role)
  if (role === 'admin') {
    next()
  }else{
    return res.status(403).json({ error: "Forbidden" });
  }
};

const apiVisitors = async (req, res) => {
  const { ip, city } = req.body;
  const newVisitor = new Visitor({ ip, city });

  try {
    await newVisitor.save();
    res.status(201).send('Visitor data saved successfully');
  } catch (error) {
    res.status(500).send('Error saving visitor data');
  }
};

const generateAccessToken = (user) => {
  console.log(user.role)
  return jwt.sign({ id: user._id, email: user.email ,role : user.role}, process.env.ACCESS_SECRET_KEY, { expiresIn: '10m' });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, role : user.role }, process.env.REFRESH_SECRET_KEY );
};

const refreshTokenHandler = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.sendStatus(401);

    try {
        console.log('refreshToken : ', refreshToken);
        const user = await User.findOne({ refreshToken });
        if (!user) return res.sendStatus(403);

        jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, decoded) => {
            if (err) return res.sendStatus(403);
            
            const accessToken = generateAccessToken(user);
            res.json({ accessToken });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


const visitors = async (req, res) => {
  const { ip, city } = req.body;
  const newVisitor = new Visitor({ ip, city });

  try {
    await newVisitor.save();
    res.status(201).send('Visitor data saved successfully');
  } catch (error) {
    res.status(500).send('Error saving visitor data');
  }
}

export { AdminAuth, generateAccessToken, generateRefreshToken, Auth, refreshTokenHandler, visitors };


