const mongosse=require('mongoose');

const userSchema=new mongosse.Schema({
    username:{
        type:String,
        required:true,
        unique:[true, 'Username already exists']
    },
    email:{
        type:String,
        required:true,
        unique:[true, 'Email already exists']
    },
    password:{
        type:String,
        required:true,
        minlength:[6, 'Password must be at least 6 characters long']
    }
},{
    timestamps:true
});

const userModel=mongosse.model('Users', userSchema);

module.exports=userModel;