const mongo =require('mongoose')

const forgotSchema=new mongo.Schema({
    email:{
        type:String
    },
    created:{
        type:Date,
        default:Date.now,
        expires:600
    }
})

const forgotEmail =new  mongo.model("forgotEmail", forgotSchema);

module.exports=forgotEmail