const userModel=require('../models/user.model');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const tokenBlacklistModel=require('../models/blacklist.model');

/**
 * @name registerUserController
 * @description This function is used to register a new user. It expects a JSON object with the following
 * @access public
 */
async function registerUserController(req,res){
    try{
        const {username,email,password}=req.body;

        if(!username || !email || !password){
            return res.status(400).json({message:'Please provide all the required fields'});
        }
        const existingUser=await userModel.findOne({$or:[{username},{email}]});
        if(existingUser){
            return res.status(400).json({message:'Username or email already exists'});
        }
        
        const hash =await bcrypt.hash(password,10);
        const newUser=await userModel.create({
            username,
            email,
            password:hash
        });
        const token=jwt.sign({id:newUser._id,username:newUser.username},process.env.JWT_SECRET,{expiresIn:'1d'});
        res.cookie('token',token,{
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        }) // set the token in a cookie
        return res.status(201).json({message:'User registered successfully',
            user:{
            id:newUser._id,
            username:newUser.username,
            email:newUser.email
        }});
        



    } catch (error) {
        console.error(error);
        return res.status(500).json({message:'Internal server error'});
    }   
}

/**
 * @name loginUserController
 * @description This function is used to login a user. It expects a JSON object with the following properties:
 * @access public
 */

async function loginUserController(req,res){
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({message:'Please provide all the required fields'});
        }
        const user=await userModel.findOne({email});
        if(!user){
            return res.status(400).json({message:'Invalid email or password'});
        }

        //compare the password with the hashed password stored in the database
        const isMatch=await bcrypt.compare(password,user.password);

        //agar password match nahi karta hai to error message bhejenge
        if(!isMatch){
            return res.status(400).json({message:'Invalid email or password'});
        }

        //agar user login ho jata hai to uske liye ek token generate karenge aur usko cookie me set karenge
        const token=jwt.sign({id:user._id,username:user.username},process.env.JWT_SECRET,{expiresIn:'1d'});
        res.cookie('token',token,{
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        }) // set the token in a cookie
        return res.status(200).json({message:'User logged in successfully',
            user:{
                id:user._id,
                username:user.username,
                email:user.email
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:'Internal server error'});
    }   
}

/**
 * @name logoutUserController
 * @description This function is used to logout a user. It expects a JSON object with the following properties: 
 * @access public
 */

async function logoutUserController(req,res){
    try{
        const token=req.cookies.token;
        if(token){
            //add the token to the blacklist
            await tokenBlacklistModel.create({token});
            res.clearCookie('token', {
                httpOnly: true,
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                secure: process.env.NODE_ENV === 'production'
            });
            return res.status(200).json({message:'User logged out successfully'});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:'Internal server error'});
    }
}

/**
 * @name getMeController
 * @description This function is used to get the details of the logged in user.
 * @access private
 */

async function getMeController(req,res){
    try{
        const user=await userModel.findById(req.user.id).select('-password');
        if(!user){
            return res.status(404).json({message:'User not found'});
        }
        return res.status(200).json({
            message:"user details fetched successfully",
            user:{
                id:user._id,
                username:user.username,
                email:user.email
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:'Internal server error'});
    }
}

module.exports={registerUserController,loginUserController,logoutUserController,getMeController};