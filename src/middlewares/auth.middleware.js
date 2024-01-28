import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async(req,res,next)=>{
try {
   // ab token ka access lena hai toh woh milega cookies se kyunki cookies ke pass tokens ka acccess hai 
   // ab hamara accessToken cookies ke ander hai lekin ho sakta hai ki cookies mein token aaye hi naa matlab mobile wala case kyunki mobile mein tokens set nahi hote isliye optional chain ka use kiya hai
   // aur agar cookies se token nahi mil raha hai toh fir hum header se token nikalenge toh Authorization karke ek header hota hai jisme pehle Bearer aata hai baad mein token toh replace method ka use karke 
   // hum Bearer ko replace kar denge empty string se toh Bearer hat jayega aur sirf token bachega 
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","") 
   
    if (!token) {
       throw new ApiError(401,"Unauthorized request")
    }
   
    // toh jab hamne jwt token create kiya tha .sign() method ka use karke user model mein toh hume usi token ko varify bhi karna hai ki kya yeh token exist karta hai jo token humne create kiya tha
    // toh isliye hum verify method use kar rahe hai ab is method mein sabse pehle token dena hota hai jisko varify karwana hai uske baad aata hai secret or public key kyunki token toh aap generate kar sakte ho
    // uske ander information bhi daal sakte ho lekin usko decode wahi kar payega jiske pass mein woh secret key hoga toh secret hai env file mein ACCESS_TOKEN_SECRET mein toh jab token varify ho jayega toh hume 
    // decoded information mil jayegi user ki jo humne .sign() method mein bheji thi jab humne accessToken ko create kiya tha jwt ki help se
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
   
    // toh ab hamare pass user ki information hai toh hum database mein find karenge user ko toh hum "User" ka use karenge kyunki user ka model humne "User" naam se banaya hai aur database se direct interact hamare model hi kar rahe hai isliye "User" 
    // ka use karenge aur .findById() method mein hum decodedToken._id pass karenge ab yeh _id kanha se aaya toh jab humne token banaya tha tab humne user ki id,password,username sab jwt token mein rakha tha toh wahi se hum user ki id nikal rahe hai
    // ab findById jo user dega usme password aur refreshToken bhi aayega jo hume nahi chahiye toh hum select method ka use karke usse hata denge
   
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    // ab is user variable mein user ki details aa gayi hai with user ki id
   
    // ab agar ki details nahi aati yahi woh user verified user nahi hai 
    if (!user) {
      throw new ApiError(401,"Invalid access token")
    }
   
    // ab agar yaha tak pahuch gaye toh user toh hai hi hai toh hum req ke ander apne user ko add kar denge aur jab yeh ho jaye toh hum next() call kar denge ki middleware ka kaam ho gaya ab aage bado
    req.user = user;
    next()
    // ab jab aapne itna kaam kar liya toh isse use kaise karna hai toh middleware generally use aate hai routes mein
}

 catch (error) {
 throw new ApiError(401,error?.message || "Invalid access token")  
}

})

