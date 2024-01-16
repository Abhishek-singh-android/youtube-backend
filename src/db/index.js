import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

const connectDB = async()=>{
    try{
     const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
     console.log(`\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`)
    }catch(error){
        console.log("MongoDB Connection Error: ",error);
        //Node js mein jo hamari current mein application chal rahi hogi woh kisi na kisi process par chal rahi hogi 
        // Toh yeh process uska reference hai Toh aap process.exit() ka use karke process ko exit bhi kara sakte ho 
        // jisse Node.js terminate kar dega process synchronously with an exit status of code
        process.exit(1);
    }
}

export default connectDB;