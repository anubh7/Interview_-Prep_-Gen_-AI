const jwt=require('jsonwebtoken');
const tokenBlacklistModel=require('../models/blacklist.model');


async function authMiddleware(req,res,next){
    try{
        const token=req.cookies.token;
        if(!token){
            return res.status(401).json({message:'No token provided'});
        }
        const isBlacklisted=await tokenBlacklistModel.findOne({token});

        if(isBlacklisted){
            return res.status(401).json({message:'Token is invalidated.'});
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        req.user=decoded;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({message:'Invalid token'});
    }
}

module.exports=authMiddleware;