import jwt from 'jsonwebtoken'
import User from '../models/User.js';
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
        const decodedData = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
        
        if (!decodedData.id) {
            return res.status(403).json({ error: "Invalid token" });
        }
        
        req.user = { userId: decodedData.id, role: decodedData.role };
        next();
    } catch (verifyError) {
        console.error('Token verification failed:', verifyError);
        return res.status(403).json({ error: "Forbidden" });
    }
};


const apiVisitors = async (req, res) => {
  
  try {
    const { ip, city } = req.body;
    const newVisitor = new Visitor({ ip, city });
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
  
  try {
      const { refreshToken } = req.body;
    
      if (!refreshToken) return res.sendStatus(401);
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
  
  try {
    const { ip, city } = req.body;
    const newVisitor = new Visitor({ ip, city });
    await newVisitor.save();
    res.status(201).send('Visitor data saved successfully');
  } catch (error) {
    res.status(500).send('Error saving visitor data');
  }
}

const getVisitorData = async(req, res)=> {
  try{
    const {dateFrom, dateTo} = req.params;
    console.log('this is date', req.params);
     // Convert date string to JavaScript Date object because mongodb store the timestamp date in js object
    const startOfDay = new Date(dateFrom);
    startOfDay.setHours(0, 0, 0, 0); // Set time to 00:00:00
    console.log('startOfDay', startOfDay);
    const endOfDay = new Date(dateTo);
    endOfDay.setHours(23, 59, 59, 999); 
    console.log('endOfDay', endOfDay);
    const visitorData = await Visitor.find({
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    });
    console.log(visitorData);
    return res.status(200).send({data: visitorData});

  }catch(error){
    return res.status(500).send("Error geting Visitor data")
  }
}


const deleteVistorDataByDate = async(req, res) => {
  try{
    const {dateFrom, dateTo} = req.params;
    console.log('this is date', req.params);
     // Convert date string to JavaScript Date object because mongodb store the timestamp date in js object
    const startOfDay = new Date(dateFrom);
    startOfDay.setHours(0, 0, 0, 0); // Set time to 00:00:00
    const endOfDay = new Date(dateTo);
    endOfDay.setHours(23, 59, 59, 999); 
    const visitorData = await Visitor.deleteMany({
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    });;
    return res.status(200).send({message: 'Visitor Data deleted successfully'});
  }catch(error){
    return res.status(500).send("Error delete the visitor Data");
  }
}

const deleteVisitorDataById = async (req, res) => {
  try{
    const {id} = req.params;
    if(!id) return res.status(400).send({message: 'id not there'});
    console.log('tis is id', id)
    const deleteVistor = await Visitor.findOneAndDelete({_id: id});
    return res.status(200).send({message: 'Vistitor Data deleted Successfully'})
  }catch(error){
    return res.status(500).send("Error delete the visitor Data");

  }
}

export { generateAccessToken, generateRefreshToken, Auth, refreshTokenHandler, getVisitorData, deleteVistorDataByDate, deleteVisitorDataById };


