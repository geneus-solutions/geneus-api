import User from '../models/User.js'

const authenticate = async(req,res,next)=>{
    try {

        const {userId} = req.user;
        const foundUser = await User.findOne({_id:userId});

        if(!foundUser) return res.status(404).json({success:false,message:'Invalid username or password'});
        const user = {
            id: foundUser._id,
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role,
            plan : foundUser.plan
        }
        res.status(200).json({success:true,data:user})

    } catch (error) {
        next(error)
    }
}

export {authenticate}