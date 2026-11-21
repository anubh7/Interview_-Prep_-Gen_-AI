const mongoose=require('mongoose');

const tokenblacklistSchema=new mongoose.Schema({
    token:{
        type:String,
        required:[true, 'Token is required to be blacklisted'],
    }
},{
    timestamps:true
});

const tokenblacklistModel=mongoose.model('TokenBlacklist',tokenblacklistSchema);

module.exports=tokenblacklistModel;