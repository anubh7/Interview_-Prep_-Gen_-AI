const express=require('express');
const authcontroller=require('../controllers/auth.controller');
const authRouter=express.Router();
const authMiddleware=require('../middlewares/auth.middleware');

/**
 * @POST /api/auth/register
 * @description This route is used to register a new user. It expects a JSON object with the following properties:
 * @access public
 */

authRouter.post('/register',authcontroller.registerUserController);

/**
 * @POST /api/auth/login
 * @description This route is used to login a user. It expects a JSON object with the following properties:
 * @access public
 */

authRouter.post('/login',authcontroller.loginUserController);

/**
 * @GET /api/auth/logout
 * @description This route is used to logout a user. It expects a JSON object with the following properties:
 * @access public
 */

authRouter.get('/logout',authcontroller.logoutUserController);

/**
 * @GET /api/auth/get-me
 * @description This route is used to get the details of the logged in user. It expects a JSON object with the following properties:
 * @access private
 */

authRouter.get('/get-me',authMiddleware,authcontroller.getMeController);

module.exports=authRouter;