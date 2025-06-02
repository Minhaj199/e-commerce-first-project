const mongo=require('mongoose')
const dotenv = require("dotenv");
dotenv.config({ path: "./configaration.env" });
const db=process.env.DB_STRING
function database(){
    try {
        if(!db){
            throw new Error('db string not found')
        }
        mongo.connect(db).then(() => {
      console.log('connected')
    });
    } catch (error) {
        console.log('monogdb not connected')
        console.log(error)
    
       process.exit(1) 
    }

}
module.exports=database